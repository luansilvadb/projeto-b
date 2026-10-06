"""Gera uma faixa da trilha de um vídeo com o ACE-Step 1.5, ou refaz um trecho dela.

Uso: python generate.py <job.json>

Com "moment" no trabalho, refaz só aquele trecho da faixa que já está em
"output"; sem ele, gera a faixa inteira.

Roda no ambiente Python do próprio ACE-Step (vendor/ace-step), chamado por
scripts/music.ts. As opções de memória seguem o que o ACE-Step recomenda para
a GPU detectada, em vez de valores fixos daqui.
"""

import json
import shutil
import sys
import tempfile
from pathlib import Path

import soundfile as sf
from acestep.gpu_config import get_gpu_config
from acestep.handler import AceStepHandler
from acestep.inference import GenerationConfig, GenerationParams, generate_music
from acestep.llm_inference import LLMHandler

from trim import trim

DIT_MODEL = "acestep-v15-turbo"
# O modelo turbo aceita de 1 a 20 passos, e a documentação indica 8. Com 8 a
# faixa sai fechada, com textura de ruído reduzido (o usuário ouviu assim no
# why-we-sleep); com 20 ela mede mais aberta nos agudos, por meio minuto a mais.
INFERENCE_STEPS = 20
SHIFT = 3.0


def main() -> None:
    job = json.loads(Path(sys.argv[1]).read_text(encoding="utf-8"))
    root = Path(job["aceStepRoot"])
    gpu = get_gpu_config()
    quantize = job.get("quantize", gpu.quantization_default)
    quantization = "int8_weight_only" if quantize else None

    dit = AceStepHandler()
    status, ok = dit.initialize_service(
        project_root=str(root),
        config_path=DIT_MODEL,
        device="auto",
        # A quantização só funciona com o modelo compilado.
        compile_model=quantization is not None or gpu.compile_model_default,
        offload_to_cpu=gpu.offload_to_cpu_default,
        offload_dit_to_cpu=gpu.offload_dit_to_cpu_default,
        quantization=quantization,
    )
    if not ok:
        sys.exit(f"O ACE-Step não inicializou o modelo de áudio: {status}")

    # O modelo de linguagem planeja a estrutura da música; sem ele o ACE-Step
    # ainda gera, só com menos direção. Por isso a falha aqui não é fatal.
    llm = LLMHandler()
    use_llm = gpu.init_lm_default and gpu.recommended_lm_model is not None
    if use_llm:
        status, use_llm = llm.initialize(
            checkpoint_dir=str(root / "checkpoints"),
            lm_model_path=gpu.recommended_lm_model,
            backend=gpu.recommended_backend,
            device="auto",
            offload_to_cpu=gpu.offload_to_cpu_default,
        )
        if not use_llm:
            print(f"Seguindo sem o modelo de linguagem: {status}", file=sys.stderr)

    def generate(output: Path, duration: float, caption: str, **task) -> None:
        params = GenerationParams(
            caption=caption,
            lyrics="[Instrumental]",
            instrumental=True,
            bpm=job.get("bpm"),
            keyscale=job.get("keyScale", ""),
            duration=duration,
            inference_steps=job.get("inferenceSteps", INFERENCE_STEPS),
            shift=SHIFT,
            seed=job["seed"],
            thinking=use_llm,
            # O modelo de linguagem continua planejando a música, mas não
            # reescreve a descrição. Reescrevendo, ele trocava a direção
            # aprovada por outra: "restrained suspense, low felt piano" virava
            # "aggressive ostinato, timpani rolls and cymbal crashes", e
            # "underwater pads" ganhava bateria eletrônica e flauta (testes de
            # 2026-10-05, em out/som/testes/).
            use_cot_caption=False,
            **task,
        )
        config = GenerationConfig(
            batch_size=1,
            use_random_seed=False,
            seeds=[job["seed"]],
            audio_format="wav",
        )
        with tempfile.TemporaryDirectory() as save_dir:
            result = generate_music(dit, llm, params, config, save_dir=save_dir)
            if not result.success:
                sys.exit(f"O ACE-Step não gerou a trilha: {result.error}")
            shutil.move(result.audios[0]["path"], output)

    output = Path(job["output"])
    seconds = job["durationSeconds"]
    moment = job.get("moment")
    if moment is None:
        # A faixa é pedida com sobra nas pontas e cortada pelo corpo (trim.py).
        spare = job.get("leadSeconds", 0) + job.get("tailPadSeconds", 0)
        generate(output, seconds + spare, job["caption"])
        if spare:
            audio, sample_rate = sf.read(output, dtype="float32", always_2d=True)
            sf.write(output, trim(audio, sample_rate, seconds), sample_rate)
    else:
        # Um momento: refaz um trecho da faixa que já existe, com a descrição
        # dele, e o resto fica como estava. É o único jeito de o ACE-Step pôr
        # uma mudança num segundo exato sem trocar de música. Cada momento é
        # um processo: quatro seguidos no mesmo derrubaram o Python com
        # violação de acesso (2026-10-06, faixa de 414 s).
        with tempfile.TemporaryDirectory() as folder:
            source = Path(folder) / "source.wav"
            shutil.copy(output, source)
            generate(
                output,
                seconds,
                moment["caption"],
                task_type="repaint",
                src_audio=str(source),
                repainting_start=moment["startSeconds"],
                repainting_end=moment["endSeconds"],
                # Sem isto o modelo escolhe sozinho o trecho que refaz.
                chunk_mask_mode="explicit",
            )

    print(json.dumps({"output": job["output"], "usedLanguageModel": use_llm}), flush=True)

if __name__ == "__main__":
    main()
