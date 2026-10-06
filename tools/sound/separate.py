"""Separa o som de um vídeo em voz, música e efeitos com o CDX23.

Uso: python separate.py <pasta de saída> <áudio ou vídeo> [<áudio ou vídeo> ...]

Grava <pasta de saída>/<nome>/dialog.flac, music.flac e effect.flac. O CDX23
(vendor/cdx23) é um Demucs 4 treinado para som de filme: sem a separação, não
dá para medir a música por baixo da fala. Quem já foi separado é pulado.
"""

import subprocess
import sys
import tempfile
from fractions import Fraction
from pathlib import Path

import numpy as np
import soundfile as sf
import torch
from demucs.apply import apply_model
from demucs.htdemucs import HTDemucs
from demucs.states import load_model

ROOT = Path(__file__).resolve().parents[2]
MODEL = ROOT / "vendor" / "cdx23" / "models" / "97d170e1-dbb4db15.th"
MODEL_URL = (
    "https://github.com/ZFTurbo/MVSEP-CDX23-Cinematic-Sound-Demixing"
    "/releases/download/v.1.0.0/97d170e1-dbb4db15.th"
)
SAMPLE_RATE = 44100
# A ordem das saídas do modelo, como o inference.py do CDX23 a lê.
STEMS = ("music", "effect", "dialog")
# O CDX23 roda com 0,8, quatro vezes mais lento. Com 0,5 as medidas (níveis em
# janelas de segundos) não mudam, e um vídeo de 15 minutos sai em poucos minutos.
OVERLAP = 0.5


def read_audio(path: Path) -> np.ndarray:
    """O áudio em estéreo a 44,1 kHz, de qualquer formato que o ffmpeg leia."""
    with tempfile.TemporaryDirectory() as folder:
        wav = Path(folder) / "audio.wav"
        subprocess.run(
            ["ffmpeg", "-v", "error", "-y", "-i", str(path), "-vn",
             "-ar", str(SAMPLE_RATE), "-ac", "2", str(wav)],
            check=True,
        )
        audio, _ = sf.read(wav, dtype="float32", always_2d=True)
    return audio


def main() -> None:
    output = Path(sys.argv[1])
    inputs = [Path(arg) for arg in sys.argv[2:]]
    if not inputs:
        sys.exit(__doc__)

    if not MODEL.exists():
        MODEL.parent.mkdir(parents=True, exist_ok=True)
        torch.hub.download_url_to_file(MODEL_URL, str(MODEL))
    device = "cuda" if torch.cuda.is_available() else "cpu"
    # O arquivo de pesos é um pickle baixado da internet. Em vez de desligar a
    # proteção do torch.load, só as duas classes de que ele precisa são aceitas.
    with torch.serialization.safe_globals([HTDemucs, Fraction]):
        package = torch.load(str(MODEL), "cpu", weights_only=True)
    model = load_model(package)
    model.eval()

    for path in inputs:
        folder = output / path.stem
        if all((folder / f"{stem}.flac").exists() for stem in STEMS):
            print(f"já separado: {path.name}", flush=True)
            continue
        audio = read_audio(path)
        # O áudio fica na memória da máquina e só cada pedaço vai à placa: um
        # vídeo inteiro não cabe nos 8 GB dela.
        mix = torch.from_numpy(audio.T).unsqueeze(0)
        with torch.no_grad():
            stems = apply_model(
                model, mix, shifts=1, split=True, overlap=OVERLAP, device=device
            )[0].numpy()
        folder.mkdir(parents=True, exist_ok=True)
        for index, stem in enumerate(STEMS):
            sf.write(folder / f"{stem}.flac", stems[index].T, SAMPLE_RATE, subtype="PCM_16")
        print(f"separado: {path.name}", flush=True)


if __name__ == "__main__":
    main()
