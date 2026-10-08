"""Mede o som de um vídeo já separado em voz, música e efeitos (separate.py).

Uso: python measure.py <pasta com dialog.flac, music.flac e effect.flac> <saída.json>

Os níveis são distâncias em dB abaixo da voz, como na mixagem do projeto
(src/audio/ducking.ts): cada vídeo sai com um volume, e só a distância compara.
"""

import argparse
import json
import re
import subprocess
from pathlib import Path

import librosa
import numpy as np
from scipy.signal import find_peaks

# O ebur128 do ffmpeg anota o volume a cada 100 ms.
RATE = 10
SAMPLE_RATE = 22050
HOP = 512

# Quanto abaixo do volume da voz um quadro ainda conta como fala.
SPEECH_BELOW_DB = 15
# Pausa da fala que conta como silêncio de narração.
GAP_SECONDS = 1.0
# Abaixo disto a música não se ouve por baixo de nada: conta como ausente.
ABSENT_BELOW_DB = 45
# Um efeito conta quando passa deste nível e se destaca do que vem em volta.
# Com 18 dB, o stem de efeitos do why-we-sleep de 2026-10-05 (5 efeitos de
# verdade, 0,5 por minuto) acusa 1,9 por minuto: o resto é música e voz que
# vazam na separação. Abaixo de 2 por minuto a contagem não distingue nada.
EFFECT_BELOW_DB = 18
EFFECT_PROMINENCE_DB = 6
# Virada de dinâmica: a música muda este tanto entre os 3 s de antes e os de depois.
TURN_DB = 6
TURN_SECONDS = 3
# Janela das medidas de tom e de andamento.
WINDOW_SECONDS = 30

MAJOR = np.array([6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88])
MINOR = np.array([6.33, 2.68, 3.52, 5.38, 2.60, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17])


def loudness(path: Path) -> tuple[np.ndarray, np.ndarray]:
    """O volume momentâneo (400 ms) e o de curto prazo (3 s) de um áudio, em LUFS, a cada 100 ms."""
    output = subprocess.run(
        ["ffmpeg", "-hide_banner", "-nostats", "-loglevel", "error", "-i", str(path),
         "-af", "ebur128=metadata=1,ametadata=mode=print:file=-", "-f", "null", "-"],
        capture_output=True, text=True, check=True,
    ).stdout
    momentary = [float(v) for v in re.findall(r"lavfi\.r128\.M=(-?[\d.]+|-?inf|nan)", output)]
    short = [float(v) for v in re.findall(r"lavfi\.r128\.S=(-?[\d.]+|-?inf|nan)", output)]
    clean = lambda values: np.nan_to_num(np.array(values), nan=-120.0, neginf=-120.0).clip(-120)
    return clean(momentary), clean(short)


def integrated(momentary: np.ndarray) -> float:
    """O volume integrado com as duas portas da EBU R 128, a partir dos blocos de 400 ms."""
    energy = 10 ** (momentary / 10)
    loud = momentary > -70
    relative = 10 * np.log10(energy[loud].mean()) - 10
    return float(10 * np.log10(energy[momentary > max(relative, -70)].mean()))


def runs(mask: np.ndarray) -> list[tuple[int, int]]:
    """Os trechos seguidos de um vetor de verdadeiro e falso, como (início, fim)."""
    edges = np.flatnonzero(np.diff(np.concatenate([[0], mask.astype(int), [0]])))
    return list(zip(edges[::2], edges[1::2]))


def percentile(values: np.ndarray, q: float) -> float:
    return float(np.percentile(values, q)) if len(values) else float("nan")


def plain(value):
    if isinstance(value, list):
        return [plain(item) for item in value]
    value = value.item() if isinstance(value, np.generic) else value
    return round(value, 2) if isinstance(value, float) else value


def section_boundaries(spectrum: np.ndarray) -> np.ndarray:
    """Os instantes em que o timbre e a harmonia da música passam a ser outros
    (novidade de Foote, com 12 s de cada lado)."""
    power = spectrum**2
    chroma = librosa.feature.chroma_stft(S=power, sr=SAMPLE_RATE)
    mfcc = librosa.feature.mfcc(S=librosa.power_to_db(librosa.feature.melspectrogram(S=power, sr=SAMPLE_RATE)), n_mfcc=13)
    per_half_second = int(round(0.5 * SAMPLE_RATE / HOP))
    blocks = spectrum.shape[1] // per_half_second
    pool = lambda feature: feature[:, :blocks * per_half_second].reshape(feature.shape[0], blocks, per_half_second).mean(axis=2)
    features = np.vstack([librosa.util.normalize(pool(chroma), axis=0), librosa.util.normalize(pool(mfcc), axis=1)])
    features = librosa.util.normalize(features, axis=0)
    similarity = features.T @ features
    half = 24
    sign = np.sign(np.arange(-half, half) + 0.5)
    kernel = np.outer(sign, sign) * np.outer(*(2 * [np.hanning(2 * half)]))
    novelty = np.zeros(blocks)
    for index in range(half, blocks - half):
        novelty[index] = (similarity[index - half:index + half, index - half:index + half] * kernel).sum()
    novelty = np.maximum(novelty, 0) / (kernel > 0).sum()
    peaks, _ = find_peaks(novelty, height=0.12, distance=16)
    return peaks * 0.5


def timbre_spread(spectrum: np.ndarray, audible: np.ndarray) -> float:
    """Quanto o timbre muda de um trecho para outro, em oitavas: o desvio do
    centro do espectro entre janelas de 30 s. Faixas que não soam como uma
    trilha só dão um número alto."""
    centroid = librosa.feature.spectral_centroid(S=spectrum, sr=SAMPLE_RATE)[0]
    window = int(WINDOW_SECONDS * SAMPLE_RATE / HOP)
    centers = [
        np.median(centroid[start:start + window][audible[start:start + window]])
        for start in range(0, spectrum.shape[1] - window, window)
        if audible[start:start + window].mean() >= 0.8
    ]
    return float(np.std(np.log2(centers))) if len(centers) > 1 else 0.0


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("stems", type=Path)
    parser.add_argument("output", type=Path)
    args = parser.parse_args()

    voice_m, _ = loudness(args.stems / "dialog.flac")
    music_m, music_s = loudness(args.stems / "music.flac")
    effect_m, _ = loudness(args.stems / "effect.flac")
    frames = min(len(voice_m), len(music_m), len(effect_m))
    voice_m, music_m, music_s, effect_m = (
        series[:frames] for series in (voice_m, music_m, music_s, effect_m)
    )
    seconds = np.arange(frames) / RATE
    content = np.ones(frames, dtype=bool)
    minutes = content.sum() / RATE / 60

    voice = integrated(voice_m[content])
    speaking = voice_m > voice - SPEECH_BELOW_DB
    # As pausas entre palavras não são silêncio: fecha os buracos de até 0,3 s.
    for start, end in runs(~speaking):
        if end - start <= 0.3 * RATE:
            speaking[start:end] = True
    gaps = [
        (start, end) for start, end in runs(~speaking & content)
        if end - start >= GAP_SECONDS * RATE
    ]
    in_gap = np.zeros(frames, dtype=bool)
    for start, end in gaps:
        # As bordas da pausa ainda carregam a cauda e o ataque da fala.
        in_gap[start + 3:end - 3] = True

    below = voice - music_s
    under_speech = below[speaking & content]
    in_gaps = (voice - music_m)[in_gap]
    absent = (below > ABSENT_BELOW_DB) & content

    # A dinâmica longa: o volume da música alisado em 10 s, só onde ela toca.
    smooth = np.convolve(music_s, np.ones(10 * RATE) / (10 * RATE), mode="same")
    playing = content & ~absent
    turn = TURN_SECONDS * RATE
    before = np.convolve(music_s, np.ones(turn) / turn, mode="full")[:frames]
    jump = np.zeros(frames)
    jump[turn:-turn] = before[2 * turn:] - before[turn:-turn]
    turn_peaks, _ = find_peaks(np.abs(jump), height=TURN_DB, distance=2 * turn)
    turn_peaks = turn_peaks[content[turn_peaks]]

    effect_peaks, properties = find_peaks(
        effect_m, height=voice - EFFECT_BELOW_DB, prominence=EFFECT_PROMINENCE_DB,
        distance=int(0.3 * RATE),
    )
    kept = content[effect_peaks]
    effect_peaks, effect_heights = effect_peaks[kept], properties["peak_heights"][kept]

    # O conteúdo musical: as medidas abaixo leem a forma de onda da música.
    audio, _ = librosa.load(args.stems / "music.flac", sr=SAMPLE_RATE, mono=True)
    spectrum = np.abs(librosa.stft(audio, hop_length=HOP))
    frame_seconds = librosa.frames_to_time(np.arange(spectrum.shape[1]), sr=SAMPLE_RATE, hop_length=HOP)
    audible = np.interp(frame_seconds, seconds, playing.astype(float)) > 0.5
    power = spectrum**2
    frequencies = librosa.fft_frequencies(sr=SAMPLE_RATE)
    total = power[:, audible].sum()
    centroid = librosa.feature.spectral_centroid(S=spectrum, sr=SAMPLE_RATE)[0]
    harmonic, percussive = librosa.decompose.hpss(spectrum)
    onset_envelope = librosa.onset.onset_strength(S=librosa.amplitude_to_db(spectrum), sr=SAMPLE_RATE)
    onsets = librosa.onset.onset_detect(onset_envelope=onset_envelope, sr=SAMPLE_RATE, hop_length=HOP, units="time")
    onsets = onsets[np.interp(onsets, seconds, playing.astype(float)) > 0.5]

    chroma = librosa.feature.chroma_stft(S=power, sr=SAMPLE_RATE)
    boundaries = section_boundaries(spectrum)
    boundaries = boundaries[np.interp(boundaries, seconds, content.astype(float)) > 0.5]
    section_lengths = np.diff(np.concatenate([[0.0], boundaries, [frames / RATE]]))

    tempos, minor = [], []
    window = int(WINDOW_SECONDS * SAMPLE_RATE / HOP)
    for start in range(0, spectrum.shape[1] - window, window):
        if audible[start:start + window].mean() < 0.8:
            continue
        tempos.append(float(librosa.feature.tempo(onset_envelope=onset_envelope[start:start + window], sr=SAMPLE_RATE, hop_length=HOP)[0]))
        profile = chroma[:, start:start + window].mean(axis=1)
        best = lambda template: max(np.corrcoef(np.roll(template, shift), profile)[0, 1] for shift in range(12))
        minor.append(best(MINOR) > best(MAJOR))

    result = {
        "minutos": round(minutes, 2),
        "voz_lufs": round(voice, 1),
        "fala_pct": round(100 * (speaking & content).sum() / content.sum(), 1),
        "pausas_de_1s_por_minuto": round(len(gaps) / minutes, 2),
        "pausa_mediana_s": round(percentile(np.array([end - start for start, end in gaps]) / RATE, 50), 2),
        "pausa_maior_s": round(max((end - start for start, end in gaps), default=0) / RATE, 1),
        "tempo_em_pausas_pct": round(100 * sum(end - start for start, end in gaps) / content.sum(), 1),
        "musica_sob_a_fala_db": round(percentile(under_speech, 50), 1),
        "musica_sob_a_fala_p10_db": round(percentile(under_speech, 10), 1),
        "musica_sob_a_fala_p90_db": round(percentile(under_speech, 90), 1),
        "musica_nas_pausas_db": round(percentile(in_gaps, 50), 1),
        "musica_ausente_pct": round(100 * absent.sum() / content.sum(), 1),
        "trechos_sem_musica_por_minuto": round(len([r for r in runs(absent) if r[1] - r[0] >= RATE]) / minutes, 2),
        "dinamica_longa_db": round(percentile(smooth[playing], 90) - percentile(smooth[playing], 10), 1),
        "viradas_de_dinamica_por_minuto": round(len(turn_peaks) / minutes, 2),
        "secoes_por_minuto": round(len(boundaries) / minutes, 2),
        "secao_mediana_s": round(percentile(section_lengths, 50), 1),
        "secao_maior_s": round(float(section_lengths.max()), 1),
        "variacao_de_timbre_oitavas": round(timbre_spread(spectrum, audible), 2),
        "notas_por_segundo": round(len(onsets) / max(playing.sum() / RATE, 1), 2),
        "percussivo_pct": round(100 * (percussive[:, audible] ** 2).sum() / max(((percussive[:, audible] ** 2).sum() + (harmonic[:, audible] ** 2).sum()), 1e-9), 1),
        "centroide_hz": round(percentile(centroid[audible], 50)),
        "energia_acima_de_4khz_pct": round(100 * power[frequencies >= 4000][:, audible].sum() / total, 2),
        "energia_abaixo_de_200hz_pct": round(100 * power[frequencies < 200][:, audible].sum() / total, 1),
        "energia_na_faixa_da_voz_pct": round(100 * power[(frequencies >= 300) & (frequencies < 3400)][:, audible].sum() / total, 1),
        "andamento_mediano_bpm": round(percentile(np.array(tempos), 50)),
        "andamentos_p10_p90_bpm": [round(percentile(np.array(tempos), 10)), round(percentile(np.array(tempos), 90))],
        "janelas_em_menor_pct": round(100 * float(np.mean(minor)), 0) if minor else None,
        "efeitos_por_minuto": round(len(effect_peaks) / minutes, 1),
        "efeito_mediano_db": round(voice - percentile(effect_heights, 50), 1),
        "efeitos_durante_a_fala_pct": round(100 * float(np.mean(speaking[effect_peaks])), 0) if len(effect_peaks) else None,
        "tempo_com_efeito_pct": round(100 * ((effect_m > voice - EFFECT_BELOW_DB) & content).sum() / content.sum(), 1),
    }

    series = {
        "segundos_por_ponto": 1,
        "musica_sob_a_voz_db": [round(float(v), 1) for v in below[::RATE]],
        "fala": [int(v) for v in speaking[::RATE]],
        "conteudo": [int(v) for v in content[::RATE]],
        "secoes_s": [round(float(v), 1) for v in boundaries],
        "viradas_s": [round(float(v) / RATE, 1) for v in turn_peaks],
        "efeitos_s": [round(float(v) / RATE, 1) for v in effect_peaks],
    }
    args.output.parent.mkdir(parents=True, exist_ok=True)
    # As medidas saem do numpy em float32, que o json não grava.
    result = {key: plain(value) for key, value in result.items()}
    args.output.write_text(json.dumps({"medidas": result, "series": series}, ensure_ascii=False, indent=1), encoding="utf-8")


if __name__ == "__main__":
    main()
