"""Testes do corte de silêncio das pontas, com ruído no lugar de fala."""

import numpy as np
import pytest

import silence

SAMPLE_RATE = 24000


def speech(seconds: float) -> np.ndarray:
    return np.random.default_rng(0).normal(scale=0.1, size=int(seconds * SAMPLE_RATE)).astype(np.float32)


def quiet(seconds: float) -> np.ndarray:
    return np.zeros(int(seconds * SAMPLE_RATE), dtype=np.float32)


def test_trim_removes_the_silence_around_the_speech():
    samples, ends_in_silence = silence.trim(np.concatenate([quiet(0.3), speech(1), quiet(0.3)]))

    assert len(samples) / SAMPLE_RATE == pytest.approx(1, abs=0.1)
    assert ends_in_silence


def test_trim_reports_speech_that_runs_to_the_end_of_the_audio():
    samples, ends_in_silence = silence.trim(np.concatenate([quiet(0.3), speech(1)]))

    assert len(samples) / SAMPLE_RATE == pytest.approx(1, abs=0.1)
    assert not ends_in_silence


def test_trim_reports_a_burst_of_sound_in_the_last_instant():
    _, ends_in_silence = silence.trim(np.concatenate([speech(1), quiet(0.3), speech(0.01)]))

    assert not ends_in_silence
