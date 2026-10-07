import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { FPS } from "../../src/format";
import { narrationManifestFile } from "../../src/media";
import {
  assertManifestMatchesScript,
  type NarrationManifest,
} from "../../src/narration/manifest";
import { parseScript, type Script } from "../../src/narration/script";
import { buildTimeline, shotRanges } from "../../src/narration/timeline";

/** Caminho em disco de um arquivo de public/. */
export const publicPath = (file: string) => path.resolve("public", file);

/** O vídeo é o primeiro argumento de todo script: o nome da pasta em src/videos/. */
export const slugFromArgs = (usage: string): string => {
  const slug = process.argv[2];
  if (!slug || slug.startsWith("-")) {
    throw new Error(`Uso: ${usage}`);
  }
  return slug;
};

export const readScript = (slug: string): Script => {
  const file = path.resolve("src/videos", slug, "script.json");
  if (!existsSync(file)) {
    throw new Error(`Não existe roteiro em ${file}.`);
  }
  return parseScript(JSON.parse(readFileSync(file, "utf8")));
};

export const readNarration = (slug: string): NarrationManifest => {
  const file = publicPath(narrationManifestFile(slug));
  if (!existsSync(file)) {
    throw new Error(
      `"${slug}" ainda não tem narração. Rode: pnpm narrate ${slug}`,
    );
  }
  return JSON.parse(readFileSync(file, "utf8")) as NarrationManifest;
};

// Perto do fim do plano quase tudo que entra por deixa da narração já está na tela.
const SHOT_SAMPLE_POINT = 0.8;

/** Um quadro representativo de cada plano do vídeo, no tempo do vídeo. */
export const shotSampleFrames = (slug: string): number[] => {
  const script = readScript(slug);
  const narration = readNarration(slug);
  // Garante que a cena de mesmo índice no roteiro e na narração é a mesma.
  assertManifestMatchesScript(script, narration, slug);

  return buildTimeline(narration, FPS).scenes.flatMap((scene, index) =>
    shotRanges(scene, script.scenes[index].shots).map(
      (shot) =>
        scene.from +
        shot.from +
        Math.floor((shot.to - shot.from) * SHOT_SAMPLE_POINT),
    ),
  );
};

/** As cenas do vídeo no tempo dele: o `id`, o primeiro quadro e quantos quadros cada uma dura. */
export const sceneTimelines = (slug: string) => {
  const narration = readNarration(slug);
  assertManifestMatchesScript(readScript(slug), narration, slug);
  return buildTimeline(narration, FPS).scenes;
};

/** Onde fica o render de uma cena: sempre o mesmo arquivo, sobrescrito a cada render. */
export const sceneFile = (slug: string, id: string) =>
  `out/${slug}/cenas/${id}.mp4`;

/** Encerra o script com a mensagem do erro, sem o rastro de pilha. */
export const exitWithError = (error: unknown): never => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
};
