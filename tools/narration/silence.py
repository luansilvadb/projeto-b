"""Silêncio nas pontas de uma frase gerada.

O OmniVoice gera cada frase com uma duração fixa, que ele estima pelo número de
letras do texto. Quando a fala não cabe nessa duração, ela vai até o último
instante do áudio e a última palavra sai cortada (defeito conhecido do modelo:
k2-fsa/OmniVoice#245). O Whisper costuma completar a palavra sozinho e não
acusa o corte. O sinal de que a frase saiu inteira é o áudio terminar em
silêncio.
"""

import librosa
import numpy as np

# Quanto abaixo do pico, em dB, o áudio das pontas já conta como silêncio.
TRIM_TOP_DB = 45


def trim(audio: np.ndarray) -> tuple[np.ndarray, bool]:
    """Tira o silêncio das pontas e diz se a fala terminou antes do fim do áudio."""
    samples, (_, speech_end) = librosa.effects.trim(audio, top_db=TRIM_TOP_DB)
    return samples, speech_end < len(audio)
