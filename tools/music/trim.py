"""Corta de uma faixa gerada a entrada lenta e o fim que morre.

O ACE-Step compõe uma música inteira: começa baixo, leva de 10 a 20 s para
chegar ao corpo e some nos últimos 5 a 10 s. Numa trilha, a faixa precisa
estar no corpo do primeiro ao último segundo, porque entra e sai cruzando com
outra. Por isso a faixa é pedida com sobra nas duas pontas e cortada aqui.
"""

import numpy as np

# Janela em que o volume é medido.
WINDOW_SECONDS = 0.5
# A faixa "chegou ao corpo" quando fica a até isto do volume mediano dela...
BODY_WITHIN_DB = 6.0
# ...e não volta a quase nada por este tempo. Uma nota solta da introdução passa do
# limite por meio segundo e a música volta a quase nada: sem exigir que dure,
# o corte caía ali, e a faixa entrava 10 dB abaixo do corpo por 14 s (o
# leito B do why-we-sleep, em 2026-10-06).
SUSTAIN_SECONDS = 4.0
# Nesse tempo, nenhuma janela cai mais que isto abaixo do corpo.
FLOOR_WITHIN_DB = 10.0
# Rampa nas pontas do corte, para ele não estalar.
EDGE_SECONDS = 0.05


def body_start(levels_db: np.ndarray, max_start: int) -> int:
    """A primeira janela a partir da qual a faixa fica no corpo, sem passar de `max_start`."""
    body = float(np.median(levels_db))
    sustain = int(SUSTAIN_SECONDS / WINDOW_SECONDS)
    if len(levels_db) < sustain:
        return 0
    # A janela mais baixa dos próximos segundos, a partir de cada janela: a
    # média não serve, porque uma nota alta puxa a média de um trecho vazio.
    lowest_ahead = np.lib.stride_tricks.sliding_window_view(levels_db, sustain).min(axis=1)
    here = levels_db[: len(lowest_ahead)]
    arrived = np.flatnonzero(
        (here >= body - BODY_WITHIN_DB) & (lowest_ahead >= body - FLOOR_WITHIN_DB)
    )
    return int(min(arrived[0], max_start)) if len(arrived) else 0


def trim(audio: np.ndarray, sample_rate: int, seconds: float) -> np.ndarray:
    """Os `seconds` da faixa a partir de onde ela chega ao corpo.

    Se a faixa for mais curta que o pedido, volta inteira: sem sobra não há o
    que cortar.
    """
    wanted = int(round(seconds * sample_rate))
    spare = len(audio) - wanted
    if spare <= 0:
        return audio
    window = int(WINDOW_SECONDS * sample_rate)
    mono = audio.mean(axis=1) if audio.ndim > 1 else audio
    count = len(mono) // window
    power = (mono[: count * window].reshape(count, window) ** 2).mean(axis=1)
    levels_db = 10 * np.log10(power + 1e-12)
    start = body_start(levels_db, spare // window) * window
    cut = audio[start : start + wanted].copy()
    edge = int(EDGE_SECONDS * sample_rate)
    ramp = np.linspace(0.0, 1.0, edge, dtype=cut.dtype)
    if cut.ndim > 1:
        ramp = ramp[:, None]
    cut[:edge] *= ramp
    cut[-edge:] *= ramp[::-1]
    return cut
