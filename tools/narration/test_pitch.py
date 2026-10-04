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
    return pitch.intonation_spread(samples, SAMPLE_RATE, pitch.pitch_bounds(around_hz))


def test_median_pitch_measures_the_voice():
    assert pitch.median_pitch(vowel(120, seconds=2), SAMPLE_RATE) == pytest.approx(120, abs=1)


def test_median_pitch_is_none_without_enough_voice():
    assert pitch.median_pitch(noise(2), SAMPLE_RATE) is None
    assert pitch.median_pitch(vowel(120, seconds=0.2), SAMPLE_RATE) is None
    assert pitch.median_pitch(vowel(120, seconds=0.05), SAMPLE_RATE) is None


def test_intonation_spread_measures_how_far_the_pitch_wanders():
    # Uma senoide de três semitons de amplitude tem desvio padrão de 3 / √2.
    assert intonation_spread(vowel(120, seconds=2), 120) == pytest.approx(GLIDE_SEMITONES / np.sqrt(2), abs=0.15)


def test_intonation_spread_is_none_without_enough_voice():
    assert pitch.intonation_spread(noise(2), SAMPLE_RATE) is None


def test_widen_intonation_spreads_the_pitch_around_the_same_median():
    sample = vowel(93, seconds=4)

    widened = pitch.widen_intonation(sample, SAMPLE_RATE, median_hz=93, factor=1.3)

    assert intonation_spread(widened, 93) == pytest.approx(1.3 * intonation_spread(sample, 93), rel=0.05)
    assert pitch.median_pitch(widened, SAMPLE_RATE) == pytest.approx(93, abs=1)
    assert len(widened) == len(sample)


def ramp(start_hz: float, end_hz: float, seconds: float = 2) -> np.ndarray:
    """Uma vogal cuja altura vai de `start_hz` a `end_hz` em linha reta."""
    time = np.arange(int(seconds * SAMPLE_RATE)) / SAMPLE_RATE
    contour = np.linspace(start_hz, end_hz, len(time))
    phase = 2 * np.pi * np.cumsum(contour) / SAMPLE_RATE
    harmonics = range(1, int(SAMPLE_RATE / 2 / contour.max()))
    return (0.2 * sum(np.sin(harmonic * phase) / harmonic for harmonic in harmonics)).astype(np.float32)


def test_ending_shape_is_negative_when_the_voice_falls_at_the_end():
    assert pitch.ending_shape(ramp(160, 100), SAMPLE_RATE, pitch.pitch_bounds(130)) < -3


def test_ending_shape_is_positive_when_the_voice_rises_at_the_end():
    assert pitch.ending_shape(ramp(100, 160), SAMPLE_RATE, pitch.pitch_bounds(130)) > 3


def test_ending_shape_is_near_zero_when_the_voice_holds():
    assert pitch.ending_shape(ramp(130, 130), SAMPLE_RATE, pitch.pitch_bounds(130)) == pytest.approx(0, abs=0.3)


def test_ending_shape_is_none_without_enough_voice():
    assert pitch.ending_shape(noise(2), SAMPLE_RATE) is None
