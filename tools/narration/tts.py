"""Gera frases com o OmniVoice: carrega o modelo, prepara a amostra de voz e sintetiza uma tomada.

Quem chama é o voice_worker.py (a narração e o estúdio de voz) e o evaluate.py
(a avaliação de parâmetros).
"""

import random
import sys

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


def load_model(job: dict) -> OmniVoice:
    on_gpu = torch.cuda.is_available()
    print(f"Carregando o OmniVoice em {'cuda' if on_gpu else 'cpu'}...", file=sys.stderr)
    # A revisão fixa impede que uma atualização dos pesos mude a voz sem ninguém decidir.
    weights = snapshot_download(job["repository"], revision=job["revision"])
    return OmniVoice.from_pretrained(
        weights,
        device_map="cuda:0" if on_gpu else "cpu",
        # A CPU não calcula em meia precisão.
        dtype=getattr(torch, job["precision"]) if on_gpu else torch.float32,
    )


def synthesize(
    model: OmniVoice, prompt: VoiceClonePrompt, text: str, seed: int, job: dict
) -> tuple[np.ndarray, bool]:
    """Gera a frase uma vez. O segundo valor diz se ela saiu inteira, isto é, se terminou em silêncio."""
    set_seed(seed)
    audio = model.generate(
        text=text,
        language=LANGUAGE,
        voice_clone_prompt=prompt,
        # A duração que o modelo estima para a frase é justa; `speed` abaixo de 1 dá a folga para a fala caber.
        speed=job["speed"],
        num_step=job["numStep"],
        class_temperature=job["classTemperature"],
        **RAW_OUTPUT,
    )[0]
    # O modelo entrega um pouco de silêncio nas duas pontas. Sem ele, as
    # pausas entre frases ficam só por conta da montagem.
    return silence.trim(audio)
