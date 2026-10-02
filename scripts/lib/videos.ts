import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { narrationManifestFile } from "../../src/media";
import type { NarrationManifest } from "../../src/narration/manifest";
import { parseScript, type Script } from "../../src/narration/script";

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

/** Encerra o script com a mensagem do erro, sem o rastro de pilha. */
export const exitWithError = (error: unknown): never => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
};
