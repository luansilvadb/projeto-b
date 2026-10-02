"""Gera a narração de uma lista de frases com o OmniVoice.

Uso: python tts.py <job.json>

O job é montado por scripts/narrate.ts. Cada frase gerada vira uma linha JSON
no stdout; mensagens de progresso vão para o stderr.
"""

import json
import random
import sys
from pathlib import Path

import numpy as np
import soundfile as sf
import torch
from huggingface_hub import snapshot_download
from omnivoice import OmniVoice
from omnivoice.models.omnivoice import VoiceClonePrompt

import pitch
import silence

LANGUAGE = "pt"
# Por padrão o OmniVoice corta o silêncio das pontas e aplica nelas um fade de
# 0,1 s, que apaga a última sílaba quando a fala vai até o fim do áudio. O
# áudio vem cru, e as pontas ficam por conta do silence.py.
RAW_OUTPUT = {"postprocess_output": False, "pad_duration": 0, "fade_duration": 0}


def set_seed(seed: int) -> None:
    torch.manual_seed(seed)
    torch.cuda.manual_seed_all(seed)
    random.seed(seed)
    np.random.seed(seed)


def load_voice(model: OmniVoice, job: dict) -> tuple[VoiceClonePrompt, float]:
    """Prepara a amostra para o modelo e mede a altura dela, que é o alvo de cada frase."""
    reference, sample_rate = sf.read(job["voice"], dtype="float32")
    if reference.ndim > 1:
        reference = reference.mean(axis=1)
    reference_hz = pitch.median_pitch(reference, sample_rate)
    if reference_hz is None:
        raise ValueError("A amostra de voz não tem fala suficiente para medir a altura.")

    # O clone sai mais monótono que a amostra, e isso soa robótico. Com a
    # entonação da amostra ampliada, ele herda uma entonação mais viva.
    widened = pitch.widen_intonation(reference, sample_rate, reference_hz, job["intonation"])
    prompt = model.create_voice_clone_prompt((torch.from_numpy(widened), sample_rate), job["voiceText"])
    return prompt, reference_hz


def synthesize(
    model: OmniVoice, prompt: VoiceClonePrompt, text: str, seed: int, speed: float
) -> tuple[np.ndarray, bool]:
    """Gera a frase uma vez. O segundo valor diz se ela saiu inteira, isto é, se terminou em silêncio."""
    set_seed(seed)
    # A duração que o modelo estima para a frase é justa; `speed` abaixo de 1 dá a folga para a fala caber.
    audio = model.generate(text=text, language=LANGUAGE, voice_clone_prompt=prompt, speed=speed, **RAW_OUTPUT)[0]
    # O modelo entrega um pouco de silêncio nas duas pontas. Sem ele, as
    # pausas entre frases ficam só por conta da montagem.
    return silence.trim(audio)


def main() -> None:
    job = json.loads(Path(sys.argv[1]).read_text(encoding="utf-8"))

    on_gpu = torch.cuda.is_available()
    print(f"Carregando o OmniVoice em {'cuda' if on_gpu else 'cpu'}...", file=sys.stderr)
    # A revisão fixa impede que uma atualização dos pesos mude a voz sem ninguém decidir.
    weights = snapshot_download(job["repository"], revision=job["revision"])
    model = OmniVoice.from_pretrained(
        weights,
        device_map="cuda:0" if on_gpu else "cpu",
        dtype=torch.float16 if on_gpu else torch.float32,
    )
    prompt, reference_hz = load_voice(model, job)

    for index, item in enumerate(job["items"], start=1):
        print(f"  voz {index}/{len(job['items'])}: {item['text'][:60]}", file=sys.stderr)
        # A altura muda de uma geração para outra: cada frase é gerada algumas
        # vezes, com sementes próprias de cada tentativa, e fica a mais próxima da amostra.
        first_seed = (item["attempt"] - 1) * job["takesPerAttempt"] + 1
        takes = [
            synthesize(model, prompt, item["text"], seed, job["speed"])
            for seed in range(first_seed, first_seed + job["takesPerAttempt"])
        ]
        # Uma geração cortada no fim só entra na escolha se todas saíram assim.
        complete = [samples for samples, ends_in_silence in takes if ends_in_silence]
        candidates = complete or [samples for samples, _ in takes]
        samples = pitch.closest_take(candidates, model.sampling_rate, reference_hz)
        sf.write(item["output"], samples, model.sampling_rate, subtype="PCM_16")
        duration_ms = round(len(samples) * 1000 / model.sampling_rate)
        result = {"output": item["output"], "durationMs": duration_ms, "cutOff": not complete}
        print(json.dumps(result), flush=True)


if __name__ == "__main__":
    main()
