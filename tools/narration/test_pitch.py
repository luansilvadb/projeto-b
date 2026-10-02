"""Testes da medida de altura e da ampliação da entonação, com sons sintéticos no lugar de fala."""

import numpy as np
import pytest

import pitch

SAMPLE_RATE = 24000
# A vogal de teste sobe e desce três semitons em torno da altura pedida.
GLIDE_SEMITONES = 3


def vowel(hz: float, seconds: float) -> np.ndarray:
    """Uma vogal com a altura oscilando em torno de `hz`, como na fala, e um pouco de ruído."""
    time = np.arange(int(seconds * SAMPLE_RATE)) / SAMPLE_RATE
    # Em ciclos inteiros, para a mediana da altura ser exatamente `hz`.
    cycles = max(1, round(0.7 * seconds))
    contour = hz * 2 ** (GLIDE_SEMITONES * np.sin(2 * np.pi * cycles * time / seconds) / 12)
    phase = 2 * np.pi * np.cumsum(contour) / SAMPLE_RATE
    harmonics = range(1, int(SAMPLE_RATE / 2 / contour.max()))
    tone = sum(np.sin(harmonic * phase) / harmonic for harmonic in harmonics)
    noise = np.random.default_rng(0).normal(scale=0.01, size=len(time))
    return (0.2 * tone + noise).astype(np.float32)


def noise(seconds: float, seed: int = 1) -> np.ndarray:
    return np.random.default_rng(seed).normal(scale=0.1, size=int(seconds * SAMPLE_RATE)).astype(np.float32)


def intonation_spread(samples: np.ndarray, around_hz: float) -> float:
    """Desvio padrão da altura, em semitons, nos trechos com voz."""
    floor, ceiling = pitch.pitch_bounds(around_hz)
    frequencies = (
        pitch.to_sound(samples, SAMPLE_RATE)
        .to_pitch_ac(time_step=pitch.PITCH_STEP_SECONDS, pitch_floor=floor, pitch_ceiling=ceiling)
        .selected_array["frequency"]
    )
    voiced = frequencies[frequencies > 0]
    return float((12 * np.log2(voiced / np.median(voiced))).std())


def test_median_pitch_measures_the_voice():
    assert pitch.median_pitch(vowel(120, seconds=2), SAMPLE_RATE) == pytest.approx(120, abs=1)


def test_median_pitch_is_none_without_enough_voice():
    assert pitch.median_pitch(noise(2), SAMPLE_RATE) is None
    assert pitch.median_pitch(vowel(120, seconds=0.2), SAMPLE_RATE) is None
    assert pitch.median_pitch(vowel(120, seconds=0.05), SAMPLE_RATE) is None


def test_widen_intonation_spreads_the_pitch_around_the_same_median():
    sample = vowel(93, seconds=4)

    widened = pitch.widen_intonation(sample, SAMPLE_RATE, median_hz=93, factor=1.3)

    assert intonation_spread(widened, 93) == pytest.approx(1.3 * intonation_spread(sample, 93), rel=0.05)
    assert pitch.median_pitch(widened, SAMPLE_RATE) == pytest.approx(93, abs=1)
    assert len(widened) == len(sample)


def test_closest_take_picks_the_pitch_nearest_to_the_reference():
    takes = [vowel(120, seconds=2), vowel(95, seconds=2), vowel(80, seconds=2)]

    assert pitch.closest_take(takes, SAMPLE_RATE, reference_hz=93) is takes[1]


def test_closest_take_skips_takes_without_measurable_voice():
    takes = [noise(2), vowel(120, seconds=2)]

    assert pitch.closest_take(takes, SAMPLE_RATE, reference_hz=93) is takes[1]


def test_closest_take_falls_back_to_the_first_take_when_none_can_be_measured():
    takes = [noise(2, seed=1), noise(2, seed=2)]

    assert pitch.closest_take(takes, SAMPLE_RATE, reference_hz=93) is takes[0]
