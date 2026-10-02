"""Transcreve áudios com o tempo de cada palavra, usando o Whisper.

Uso: python stt.py <job.json>

O job é montado por scripts/narrate.ts. Cada áudio transcrito vira uma linha
JSON no stdout.
"""

import json
import sys
from pathlib import Path

from faster_whisper import WhisperModel

MODEL = "large-v3-turbo"
LANGUAGE = "pt"


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


def main() -> None:
    job = json.loads(Path(sys.argv[1]).read_text(encoding="utf-8"))

    # CPU de propósito: a GPU fica inteira para o modelo de voz, e o modelo
    # turbo em int8 já transcreve mais rápido que o tempo real.
    print(f"Carregando o Whisper {MODEL} na CPU...", file=sys.stderr)
    model = WhisperModel(MODEL, device="cpu", compute_type="int8")
    suppress = [-1, *numeral_tokens(model)]

    for index, audio in enumerate(job["audios"], start=1):
        print(f"  conferência {index}/{len(job['audios'])}", file=sys.stderr)
        segments, _ = model.transcribe(
            audio,
            language=LANGUAGE,
            word_timestamps=True,
            condition_on_previous_text=False,
            suppress_tokens=suppress,
        )
        words = [
            {
                "text": word.word.strip(),
                "startMs": round(word.start * 1000),
                "endMs": round(word.end * 1000),
            }
            for segment in segments
            for word in segment.words
        ]
        print(json.dumps({"audio": audio, "words": words}), flush=True)


if __name__ == "__main__":
    main()
