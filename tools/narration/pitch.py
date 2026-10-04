"""Altura da voz: medida e ampliação da entonação, pelo Praat.

O clone do OmniVoice acerta o timbre, mas sai mais monótono que a amostra e
com a altura e a entonação mudando de uma geração para outra. As duas coisas
são tratadas sem mexer no áudio gerado: o modelo recebe a amostra com a
entonação ampliada, e cada geração é medida (a altura e a curva do fim da
frase) para a escolha da tomada, que é feita em src/narration/takes.ts.
"""

import numpy as np
import parselmouth
from parselmouth.praat import call

# Faixa de busca da altura enquanto a voz ainda não é conhecida.
ANY_VOICE_HZ = (50.0, 500.0)
PITCH_STEP_SECONDS = 0.01
# Com menos de 0,3 s de voz, a mediana não é confiável.
MIN_VOICED_FRAMES = 30
# O fim da frase: os últimos 0,25 s com voz, mais ou menos a última sílaba tônica e o que vem depois dela.
ENDING_FRAMES = 25


def pitch_bounds(reference_hz: float) -> tuple[float, float]:
    """Faixa de busca em torno da voz: estreita o bastante para o Praat não errar de oitava."""
    return max(40.0, reference_hz / 2), min(600.0, reference_hz * 3)


def to_sound(samples: np.ndarray, sample_rate: int) -> parselmouth.Sound:
    return parselmouth.Sound(samples.astype(np.float64), sampling_frequency=sample_rate)


def voiced_pitch(samples: np.ndarray, sample_rate: int, bounds: tuple[float, float]) -> np.ndarray | None:
    """Altura, em Hz, de cada instante com voz; None quando há voz de menos para medir."""
    floor, ceiling = bounds
    # O Praat precisa de alguns períodos da voz para analisar; menos que isso não é fala.
    if len(samples) < sample_rate * 4 / floor:
        return None
    pitch = to_sound(samples, sample_rate).to_pitch_ac(
        time_step=PITCH_STEP_SECONDS, pitch_floor=floor, pitch_ceiling=ceiling
    )
    frequencies = pitch.selected_array["frequency"]
    voiced = frequencies[frequencies > 0]
    return voiced if len(voiced) >= MIN_VOICED_FRAMES else None


def median_pitch(samples: np.ndarray, sample_rate: int, bounds: tuple[float, float] = ANY_VOICE_HZ) -> float | None:
    """Mediana da altura, em Hz, nos trechos com voz; None quando há voz de menos para medir."""
    voiced = voiced_pitch(samples, sample_rate, bounds)
    return float(np.median(voiced)) if voiced is not None else None


def intonation_spread(samples: np.ndarray, sample_rate: int, bounds: tuple[float, float] = ANY_VOICE_HZ) -> float | None:
    """Quanto a altura varia em torno da própria mediana: desvio padrão, em semitons. None sem voz para medir."""
    voiced = voiced_pitch(samples, sample_rate, bounds)
    return float((12 * np.log2(voiced / np.median(voiced))).std()) if voiced is not None else None


def widen_intonation(samples: np.ndarray, sample_rate: int, median_hz: float, factor: float) -> np.ndarray:
    """Afasta a altura de cada instante da mediana, por PSOLA: a mediana, o timbre e a duração ficam onde estão."""
    sound = to_sound(samples, sample_rate)
    manipulation = call(sound, "To Manipulation", PITCH_STEP_SECONDS, *pitch_bounds(median_hz))
    tier = call(manipulation, "Extract pitch tier")
    # Em escala logarítmica, que é como o ouvido mede intervalos.
    call(tier, "Formula", f"{median_hz} * (self / {median_hz}) ^ {factor}")
    call([tier, manipulation], "Replace pitch tier")
    return call(manipulation, "Get resynthesis (overlap-add)").values[0].astype(np.float32)


def semitones_between(reference_hz: float, hz: float) -> float:
    return float(12 * np.log2(hz / reference_hz))


def ending_shape(samples: np.ndarray, sample_rate: int, bounds: tuple[float, float] = ANY_VOICE_HZ) -> float | None:
    """Para onde a voz vai no fim da frase: a altura do último trecho com voz, em semitons acima (ou abaixo) da mediana da frase.

    Uma afirmação que fecha fica bem abaixo de zero; uma frase que fica em
    suspenso, perto de zero ou acima. None quando há voz de menos para medir.
    """
    voiced = voiced_pitch(samples, sample_rate, bounds)
    if voiced is None:
        return None
    ending = voiced[-ENDING_FRAMES:]
    return semitones_between(float(np.median(voiced)), float(np.median(ending)))
