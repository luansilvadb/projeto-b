// Renderiza quadros de um vídeo como imagens PNG, para conferência visual:
//   pnpm stills <vídeo>            um quadro de cada cena
//   pnpm stills <vídeo> 30 120     os quadros indicados
//
// As imagens saem em out/stills/<vídeo>/.

import { rmSync } from "node:fs";
import { FPS } from "../src/format";
import { buildTimeline } from "../src/narration/timeline";
import { run } from "./lib/tools";
import { exitWithError, readNarration, slugFromArgs } from "./lib/videos";

// Perto do fim da cena quase tudo que entra por deixa da narração já está na tela.
const SCENE_SAMPLE_POINT = 0.8;

const main = async () => {
  const slug = slugFromArgs("pnpm stills <vídeo> [quadros...]");
  const requested = process.argv.slice(3).map(Number);
  if (requested.some((frame) => !Number.isInteger(frame) || frame < 0)) {
    throw new Error("Os quadros precisam ser números inteiros.");
  }

  const frames =
    requested.length > 0
      ? requested
      : buildTimeline(readNarration(slug), FPS).scenes.map(
          (scene) =>
            scene.from +
            Math.floor(scene.durationInFrames * SCENE_SAMPLE_POINT),
        );

  const output = `out/stills/${slug}`;
  rmSync(output, { recursive: true, force: true });
  await run(process.execPath, [
    "node_modules/@remotion/cli/remotion-cli.js",
    "render",
    slug,
    output,
    `--frames=${frames.join(",")}`,
    "--image-format=png",
    // Sem áudio na composição: é ele que quebra o render de quadros avulsos.
    `--props=${JSON.stringify({ silent: true })}`,
  ]);

  console.log(`\nQuadros ${frames.join(", ")} em ${output}/`);
};

main().catch(exitWithError);
