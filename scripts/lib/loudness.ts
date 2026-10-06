import { run } from "./tools";

const isMono = async (file: string): Promise<boolean> => {
  const channels = await run("ffprobe", [
    "-v",
    "error",
    "-select_streams",
    "a:0",
    "-show_entries",
    "stream=channels",
    "-of",
    "csv=p=0",
    file,
  ]);
  return channels.trim() === "1";
};

/**
 * Volume percebido (LUFS integrado, norma EBU R 128) de um ou mais áudios do
 * mesmo formato tocados em sequência, como eles soam no vídeo. Usa o ffmpeg
 * do sistema.
 */
export const measureLoudness = async (
  files: readonly string[],
): Promise<number> => {
  const inputs = files.flatMap((file) => ["-i", file]);
  const streams = files.map((_, index) => `[${index}:a]`).join("");
  // O vídeo é estéreo e toca um áudio mono igual nos dois canais, o que soma
  // 3 dB ao volume percebido. Medir o mono sozinho erraria a mixagem por isso.
  const asPlayed = (await isMono(files[0])) ? "pan=stereo|c0=c0|c1=c0," : "";
  // O ebur128 anota o volume acumulado a cada trecho; o último valor é o do áudio inteiro.
  const filter = `${streams}concat=n=${files.length}:v=0:a=1,${asPlayed}ebur128=metadata=1,ametadata=mode=print:key=lavfi.r128.I:file=-`;

  const output = await run("ffmpeg", [
    "-hide_banner",
    "-nostats",
    "-loglevel",
    "error",
    ...inputs,
    "-filter_complex",
    filter,
    "-f",
    "null",
    "-",
  ]);

  const readings = [...output.matchAll(/lavfi\.r128\.I=(-?[\d.]+)/g)];
  const loudness = Number(readings.at(-1)?.[1]);
  if (!Number.isFinite(loudness)) {
    throw new Error("O ffmpeg não conseguiu medir o volume do áudio.");
  }
  return loudness;
};

/**
 * O pico do volume momentâneo (janelas de 400 ms) de um áudio, em LUFS. É a
 * medida de um efeito sonoro: curto demais para o volume integrado dizer
 * alguma coisa, ele é posto à distância da voz pelo ponto mais alto.
 */
export const measurePeakLoudness = async (file: string): Promise<number> => {
  const output = await run("ffmpeg", [
    "-hide_banner",
    "-nostats",
    "-loglevel",
    "error",
    "-i",
    file,
    "-af",
    "ebur128=metadata=1,ametadata=mode=print:key=lavfi.r128.M:file=-",
    "-f",
    "null",
    "-",
  ]);
  const readings = [...output.matchAll(/lavfi\.r128\.M=(-?[\d.]+)/g)].map(
    (match) => Number(match[1]),
  );
  if (readings.length === 0) {
    throw new Error("O ffmpeg não conseguiu medir o volume do áudio.");
  }
  return Math.max(...readings);
};
