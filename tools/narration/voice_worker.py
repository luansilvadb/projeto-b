"""Mantém o modelo de voz e o Whisper carregados e gera tomadas sob pedido.

Uso: python voice_worker.py <job.json>

O job é montado por scripts/lib/voice-worker.ts e traz o modelo e a amostra de
voz. Depois de carregar, o processo escreve {"ready": true} no stdout e passa
a ler pedidos do stdin, um JSON por linha:

    {"id": 1, "text": "...", "takes": [{"seed": 5, "output": "caminho.wav"}]}

Cada tomada gerada, medida e conferida vira uma linha JSON no stdout; o pedido
termina com {"id": 1, "done": true}. Mensagens de progresso vão para o stderr.
"""

import json
import sys
from pathlib import Path

import soundfile as sf

import pitch
import stt
import tts


def main() -> None:
    job = json.loads(Path(sys.argv[1]).read_text(encoding="utf-8"))

    model = tts.load_model(job)
    prompt, reference_hz = tts.load_voice(model, job)
    bounds = pitch.pitch_bounds(reference_hz)
    whisper, suppress = stt.load()
    print(json.dumps({"ready": True}), flush=True)

    for line in sys.stdin:
        if not line.strip():
            continue
        request = json.loads(line)
        try:
            for take in request["takes"]:
                samples, complete = tts.synthesize(model, prompt, request["text"], take["seed"], job)
                sf.write(take["output"], samples, model.sampling_rate, subtype="PCM_16")
                hz = pitch.median_pitch(samples, model.sampling_rate, bounds)
                result = {
                    "id": request["id"],
                    "seed": take["seed"],
                    "durationMs": round(len(samples) * 1000 / model.sampling_rate),
                    # O silence.trim devolve um booleano do NumPy, que o json não escreve.
                    "cutOff": not bool(complete),
                    # A altura em relação à amostra e a curva do fim da frase, em semitons.
                    "pitchOffset": pitch.semitones_between(reference_hz, hz) if hz else None,
                    "ending": pitch.ending_shape(samples, model.sampling_rate, bounds),
                    "words": stt.transcribe(whisper, suppress, take["output"]),
                }
                print(json.dumps(result), flush=True)
            print(json.dumps({"id": request["id"], "done": True}), flush=True)
        except Exception as error:  # Quem pediu continua de pé e mostra o erro.
            print(json.dumps({"id": request["id"], "done": True, "error": str(error)}), flush=True)


if __name__ == "__main__":
    main()
