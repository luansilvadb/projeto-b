"""Gera frases de avaliação com uma configuração de voz e mede cada geração.

Uso: python evaluate.py <job.json>

O job é montado por scripts/eval-voice.ts: a mesma configuração que o tts.py
recebe, mais as frases e a pasta de saída. Cada geração vira um áudio na pasta
e uma linha JSON no stdout com as medidas dela.
"""

import json
import sys
from pathlib import Path

import numpy as np
import soundfile as sf
import torch
import torchaudio
from huggingface_hub import hf_hub_download
from omnivoice.eval.models.utmos import UTMOS22Strong

import pitch
import tts

# Taxa de amostragem em que o UTMOS foi treinado.
UTMOS_SAMPLE_RATE = 16000


def load_utmos(source: dict) -> UTMOS22Strong:
    """O UTMOS prevê a nota de naturalidade (de 1 a 5) que ouvintes dariam a uma fala."""
    weights = hf_hub_download(source["repository"], source["file"], revision=source["revision"])
    model = UTMOS22Strong()
    model.load_state_dict(torch.load(weights, map_location="cpu"))
    return model.to("cuda:0" if torch.cuda.is_available() else "cpu").eval()


@torch.no_grad()
def naturalness(utmos: UTMOS22Strong, samples: np.ndarray, sample_rate: int) -> float:
    device = next(utmos.parameters()).device
    wave = torchaudio.functional.resample(torch.from_numpy(samples), sample_rate, UTMOS_SAMPLE_RATE)
    return float(utmos(wave.unsqueeze(0).to(device), UTMOS_SAMPLE_RATE).item())


def semitones_from(reference_hz: float, hz: float | None) -> float | None:
    return abs(pitch.semitones_between(reference_hz, hz)) if hz else None


def main() -> None:
    job = json.loads(Path(sys.argv[1]).read_text(encoding="utf-8"))

    model = tts.load_model(job)
    prompt, reference_hz = tts.load_voice(model, job)
    utmos = load_utmos(job["utmos"])
    bounds = pitch.pitch_bounds(reference_hz)

    for index, text in enumerate(job["sentences"]):
        print(f"  frase {index + 1}/{len(job['sentences'])}: {text[:60]}", file=sys.stderr)
        # As mesmas sementes da primeira tentativa do tts.py, em toda configuração.
        for seed in range(1, job["takesPerAttempt"] + 1):
            samples, complete = tts.synthesize(model, prompt, text, seed, job)
            output = str(Path(job["folder"]) / f"{index + 1:02d}-{seed}.wav")
            sf.write(output, samples, model.sampling_rate, subtype="PCM_16")
            take = {
                "sentence": index,
                "seed": seed,
                "output": output,
                "durationMs": round(len(samples) * 1000 / model.sampling_rate),
                # O silence.trim devolve um booleano do NumPy, que o json não escreve.
                "complete": bool(complete),
                "naturalness": naturalness(utmos, samples, model.sampling_rate),
                "pitchDistance": semitones_from(
                    reference_hz, pitch.median_pitch(samples, model.sampling_rate, bounds)
                ),
                "intonation": pitch.intonation_spread(samples, model.sampling_rate, bounds),
            }
            print(json.dumps(take), flush=True)


if __name__ == "__main__":
    main()
