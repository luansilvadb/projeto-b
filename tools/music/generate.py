"""Gera a trilha instrumental de um vídeo com o ACE-Step 1.5.

Uso: python generate.py <job.json>

Roda no ambiente Python do próprio ACE-Step (vendor/ace-step), chamado por
scripts/music.ts. As opções de memória seguem o que o ACE-Step recomenda para
a GPU detectada, em vez de valores fixos daqui.
"""

import json
import shutil
import sys
import tempfile
from pathlib import Path

from acestep.gpu_config import get_gpu_config
from acestep.handler import AceStepHandler
from acestep.inference import GenerationConfig, GenerationParams, generate_music
from acestep.llm_inference import LLMHandler

DIT_MODEL = "acestep-v15-turbo"
# Valores que a documentação do ACE-Step indica para o modelo turbo.
INFERENCE_STEPS = 8
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

    params = GenerationParams(
        task_type="text2music",
        caption=job["caption"],
        lyrics="[Instrumental]",
        instrumental=True,
        bpm=job.get("bpm"),
        keyscale=job.get("keyScale", ""),
        duration=job["durationSeconds"],
        inference_steps=job.get("inferenceSteps", INFERENCE_STEPS),
        shift=SHIFT,
        seed=job["seed"],
        thinking=use_llm,
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
        shutil.move(result.audios[0]["path"], job["output"])

    print(json.dumps({"output": job["output"], "usedLanguageModel": use_llm}), flush=True)


if __name__ == "__main__":
    main()
