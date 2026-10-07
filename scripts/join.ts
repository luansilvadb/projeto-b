// Monta o vídeo inteiro com as cenas já renderizadas, sem renderizar de novo:
//   pnpm join <vídeo>
//
// Junta a imagem de out/<vídeo>/cenas/ na ordem do roteiro, sem recodificar, e
// põe por cima o som de out/<vídeo>/<vídeo>.som.mp3 (`pnpm sound`). O som de
// cada cena fica de fora: a trilha atravessa as cenas, e emendar o áudio delas
// deixaria um estalo em cada emenda.

import { existsSync, writeFileSync } from "node:fs";
import path from "node:path";
import { FPS } from "../src/format";
import { run } from "./lib/tools";
import {
  exitWithError,
  sceneFile,
  sceneTimelines,
  slugFromArgs,
} from "./lib/videos";

const frameCount = async (file: string): Promise<number> =>
  // O ffprobe fecha a linha com uma vírgula: "322,".
  parseInt(
    await run("ffprobe", [
      "-v",
      "error",
      "-select_streams",
      "v:0",
      "-count_packets",
      "-show_entries",
      "stream=nb_read_packets",
      "-of",
      "csv=p=0",
      file,
    ]),
    10,
  );

const main = async () => {
  const slug = slugFromArgs("pnpm join <vídeo>");
  const scenes = sceneTimelines(slug);
  const sound = `out/${slug}/${slug}.som.mp3`;
  if (!existsSync(sound)) {
    throw new Error(`Falta o som. Rode: pnpm sound ${slug} ${sound}`);
  }

  // Uma cena sem arquivo, ou com outra duração (a narração mudou depois do
  // render dela), deslocaria a imagem de todas as seguintes em relação ao som.
  const stale: string[] = [];
  for (const scene of scenes) {
    const file = sceneFile(slug, scene.id);
    if (
      !existsSync(file) ||
      (await frameCount(file)) !== scene.durationInFrames
    ) {
      stale.push(scene.id);
    }
  }
  if (stale.length > 0) {
    throw new Error(
      `Cenas sem render ou com a duração antiga. Rode: pnpm scene ${slug} ${stale.join(" ")}`,
    );
  }

  // A duração vai escrita na lista: a do arquivo conta o áudio da cena, que
  // sobra alguns milissegundos e atrasaria a imagem a cada emenda.
  const list = `out/${slug}/cenas/list.txt`;
  writeFileSync(
    list,
    scenes
      .map(
        (scene) =>
          `file '${path.basename(sceneFile(slug, scene.id))}'\nduration ${scene.durationInFrames / FPS}\n`,
      )
      .join(""),
  );

  const output = `out/${slug}/${slug}.mp4`;
  await run("ffmpeg", [
    "-y",
    "-v",
    "error",
    "-f",
    "concat",
    "-i",
    list,
    "-i",
    sound,
    "-map",
    "0:v",
    "-map",
    "1:a",
    "-c:v",
    "copy",
    "-c:a",
    "aac",
    "-b:a",
    "192k",
    output,
  ]);
  console.log(`\n${output}`);
};

main().catch(exitWithError);
