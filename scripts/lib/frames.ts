import { spawn } from "node:child_process";

export type FrameFormat = {
  readonly width: number;
  readonly height: number;
  readonly fps: number;
};

/**
 * Lê um vídeo como uma sequência de quadros RGB no tamanho e no ritmo pedidos,
 * decodificando com o ffmpeg do sistema.
 */
export async function* readFrames(
  file: string,
  { width, height, fps }: FrameFormat,
): AsyncGenerator<Uint8Array> {
  const ffmpeg = spawn(
    "ffmpeg",
    [
      "-v",
      "error",
      "-i",
      file,
      "-an",
      "-vf",
      `fps=${fps},scale=${width}:${height}`,
      "-f",
      "rawvideo",
      "-pix_fmt",
      "rgb24",
      "-",
    ],
    { stdio: ["ignore", "pipe", "inherit"] },
  );
  const closed = new Promise<number | null>((resolve, reject) => {
    ffmpeg.on("error", reject);
    ffmpeg.on("close", resolve);
  });

  // O ffmpeg entrega os bytes em pedaços de tamanho qualquer; aqui eles viram quadros inteiros.
  const size = width * height * 3;
  let frame = new Uint8Array(size);
  let filled = 0;
  for await (const chunk of ffmpeg.stdout as AsyncIterable<Buffer>) {
    let offset = 0;
    while (offset < chunk.length) {
      const take = Math.min(size - filled, chunk.length - offset);
      frame.set(chunk.subarray(offset, offset + take), filled);
      filled += take;
      offset += take;
      if (filled === size) {
        yield frame;
        frame = new Uint8Array(size);
        filled = 0;
      }
    }
  }

  const code = await closed;
  if (code !== 0) {
    throw new Error(`O ffmpeg não conseguiu ler "${file}" (código ${code}).`);
  }
}
