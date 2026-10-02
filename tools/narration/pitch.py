"""Altura da voz: medida e ampliação da entonação, pelo Praat.

O clone do OmniVoice acerta o timbre, mas sai mais monótono que a amostra e
com a altura mudando de uma geração para outra. O tts.py corrige as duas coisas
sem mexer no áudio gerado: entrega ao modelo a amostra com a entonação ampliada
e, entre várias gerações da mesma frase, fica com a de altura mais próxima da
amostra.
"""

import numpy as np
import parselmouth
from parselmouth.praat import call

# Faixa de busca da altura enquanto a voz ainda não é conhecida.
ANY_VOICE_HZ = (50.0, 500.0)
PITCH_STEP_SECONDS = 0.01
# Com menos de 0,3 s de voz, a mediana não é confiável.
MIN_VOICED_FRAMES = 30


def pitch_bounds(reference_hz: float) -> tuple[float, float]:
    """Faixa de busca em torno da voz: estreita o bastante para o Praat não errar de oitava."""
    return max(40.0, reference_hz / 2), min(600.0, reference_hz * 3)


def to_sound(samples: np.ndarray, sample_rate: int) -> parselmouth.Sound:
    return parselmouth.Sound(samples.astype(np.float64), sampling_frequency=sample_rate)


def median_pitch(samples: np.ndarray, sample_rate: int, bounds: tuple[float, float] = ANY_VOICE_HZ) -> float | None:
    """Mediana da altura, em Hz, nos trechos com voz; None quando há voz de menos para medir."""
    floor, ceiling = bounds
    # O Praat precisa de alguns períodos da voz para analisar; menos que isso não é fala.
    if len(samples) < sample_rate * 4 / floor:
        return None
    pitch = to_sound(samples, sample_rate).to_pitch_ac(
        time_step=PITCH_STEP_SECONDS, pitch_floor=floor, pitch_ceiling=ceiling
    )
    frequencies = pitch.selected_array["frequency"]
    voiced = frequencies[frequencies > 0]
    return float(np.median(voiced)) if len(voiced) >= MIN_VOICED_FRAMES else None


def widen_intonation(samples: np.ndarray, sample_rate: int, median_hz: float, factor: float) -> np.ndarray:
    """Afasta a altura de cada instante da mediana, por PSOLA: a mediana, o timbre e a duração ficam onde estão."""
    sound = to_sound(samples, sample_rate)
    manipulation = call(sound, "To Manipulation", PITCH_STEP_SECONDS, *pitch_bounds(median_hz))
    tier = call(manipulation, "Extract pitch tier")
    # Em escala logarítmica, que é como o ouvido mede intervalos.
    call(tier, "Formula", f"{median_hz} * (self / {median_hz}) ^ {factor}")
    call([tier, manipulation], "Replace pitch tier")
    return call(manipulation, "Get resynthesis (overlap-add)").values[0].astype(np.float32)


def closest_take(takes: list[np.ndarray], sample_rate: int, reference_hz: float) -> np.ndarray:
    """A geração de altura mais próxima da amostra. Sem voz mensurável, uma geração conta como a mais distante."""
    bounds = pitch_bounds(reference_hz)

    def distance(take: np.ndarray) -> float:
        hz = median_pitch(take, sample_rate, bounds)
        return abs(np.log2(hz / reference_hz)) if hz else np.inf

    return min(takes, key=distance)
