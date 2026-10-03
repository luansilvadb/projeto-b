// Renderiza quadros de um vídeo como imagens PNG, para conferência visual:
//   pnpm stills <vídeo>            um quadro de cada plano
//   pnpm stills <vídeo> 30 120     os quadros indicados
//
// As imagens saem em out/stills/<vídeo>/.

import { renderFrames } from "./lib/tools";
import { exitWithError, shotSampleFrames, slugFromArgs } from "./lib/videos";

const main = async () => {
  const slug = slugFromArgs("pnpm stills <vídeo> [quadros...]");
  const requested = process.argv.slice(3).map(Number);
  if (requested.some((frame) => !Number.isInteger(frame) || frame < 0)) {
    throw new Error("Os quadros precisam ser números inteiros.");
  }

  const frames = requested.length > 0 ? requested : shotSampleFrames(slug);
  const output = `out/stills/${slug}`;
  await renderFrames(slug, frames, output);

  console.log(`\nQuadros ${frames.join(", ")} em ${output}/`);
};

main().catch(exitWithError);
