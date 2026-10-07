// Renderiza só as cenas pedidas, cada uma no arquivo dela, com o som:
//   pnpm scene <vídeo> <id> [id...]
//
// O arquivo de uma cena é sempre out/<vídeo>/cenas/<id>.mp4, sobrescrito: o
// "antes" de um ajuste é o git, não uma cópia ao lado. O vídeo inteiro sai da
// junção delas, com `pnpm join <vídeo>`.

import { run } from "./lib/tools";
import {
  exitWithError,
  sceneFile,
  sceneTimelines,
  slugFromArgs,
} from "./lib/videos";

const main = async () => {
  const usage = "pnpm scene <vídeo> <id> [id...]";
  const slug = slugFromArgs(usage);
  const ids = process.argv.slice(3);
  const scenes = sceneTimelines(slug);
  const unknown = ids.filter((id) => !scenes.some((scene) => scene.id === id));
  if (ids.length === 0 || unknown.length > 0) {
    throw new Error(
      `Uso: ${usage}\n${unknown.length > 0 ? `Não existe a cena ${unknown.join(", ")}. ` : ""}Cenas: ${scenes.map((scene) => scene.id).join(", ")}`,
    );
  }

  for (const scene of scenes.filter(({ id }) => ids.includes(id))) {
    const last = scene.from + scene.durationInFrames - 1;
    await run(process.execPath, [
      "node_modules/@remotion/cli/remotion-cli.js",
      "render",
      slug,
      sceneFile(slug, scene.id),
      `--frames=${scene.from}-${last}`,
    ]);
  }
};

main().catch(exitWithError);
