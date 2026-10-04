"""Transcreve áudios com o tempo de cada palavra, usando o Whisper.

Uso: python stt.py <job.json>

O job é montado por scripts/narrate.ts. Cada áudio transcrito vira uma linha
JSON no stdout.
"""

import importlib.util
import json
import os
import sys
from pathlib import Path

from faster_whisper import WhisperModel

MODEL = "large-v3-turbo"
LANGUAGE = "pt"


def expose_cuda_libraries() -> None:
    """Deixa o Whisper achar o cuBLAS e o cuDNN que vêm dentro do PyTorch.

    O faster-whisper não traz essas bibliotecas e, sem elas, não carrega na GPU.
    O PyTorch do modelo de voz já as instala, então basta apontar para a pasta.
    """
    torch_libraries = Path(importlib.util.find_spec("torch").origin).parent / "lib"
    os.add_dll_directory(str(torch_libraries))
    os.environ["PATH"] = f"{torch_libraries}{os.pathsep}{os.environ['PATH']}"


def numeral_tokens(model: WhisperModel) -> list[int]:
    """Tokens que contêm dígitos ou símbolos monetários.

    Suprimi-los força o Whisper a escrever números por extenso, como no
    roteiro. Sem isso, "cento e cinquenta" voltaria como "150" e contaria
    como erro de pronúncia.
    """
    # Acima do fim-de-texto ficam os tokens especiais, entre eles os de tempo
    # ("<|0.00|>"): suprimi-los faz o Whisper alucinar no fim de cada frase.
    end_of_text = model.hf_tokenizer.token_to_id("<|endoftext|>")
    return [
        token_id
        for token, token_id in model.hf_tokenizer.get_vocab().items()
        if token_id < end_of_text and any(char in "0123456789%$£€" for char in token)
    ]


def load() -> tuple[WhisperModel, list[int]]:
    """Carrega o Whisper na GPU e devolve, com ele, os tokens que ele não deve escrever."""
    # Na CPU, em int8, cada frase levava cerca de 6,6 s; na GPU leva 0,4 s, com as mesmas palavras.
    expose_cuda_libraries()
    print(f"Carregando o Whisper {MODEL} na GPU...", file=sys.stderr)
    model = WhisperModel(MODEL, device="cuda", compute_type="float16")
    return model, [-1, *numeral_tokens(model)]


def transcribe(model: WhisperModel, suppress: list[int], audio: str) -> list[dict]:
    """As palavras de um áudio, com o tempo de cada uma em milissegundos."""
    segments, _ = model.transcribe(
        audio,
        language=LANGUAGE,
        word_timestamps=True,
        condition_on_previous_text=False,
        suppress_tokens=suppress,
    )
    return [
        {
            "text": word.word.strip(),
            "startMs": round(word.start * 1000),
            "endMs": round(word.end * 1000),
        }
        for segment in segments
        for word in segment.words
    ]


def main() -> None:
    job = json.loads(Path(sys.argv[1]).read_text(encoding="utf-8"))

    # O narrate.ts só chama este script depois que o tts.py terminou e liberou a placa.
    model, suppress = load()
    for index, audio in enumerate(job["audios"], start=1):
        print(f"  conferência {index}/{len(job['audios'])}", file=sys.stderr)
        print(json.dumps({"audio": audio, "words": transcribe(model, suppress, audio)}), flush=True)


if __name__ == "__main__":
    main()
