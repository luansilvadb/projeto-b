// Renderiza as direções de arte candidatas para comparação lado a lado:
//   pnpm identity
//
// Para cada direção saem, em out/identity/<direção>/, a folha de identidade,
// quadros da amostra de movimento e um quadro de cada cena do demo. No fim,
// out/identity/comparison.png junta tudo: uma coluna por direção.
//
// Este comando existe só enquanto a identidade está em escolha.

import { readdirSync } from "node:fs";
import path from "node:path";
import { directions } from "../src/design/directions";
import { FPS } from "../src/format";
import { renderFrames, run } from "./lib/tools";
import { exitWithError, sceneSampleFrames } from "./lib/videos";

const OUTPUT = "out/identity";
const MODEL_VIDEO = "demo";
// Instantes da amostra de movimento: no meio das entradas e com tudo na tela.
const MOTION_FRAMES = [0.7, 1, 3].map((seconds) => seconds * FPS);
// O quadro da amostra que vai para a comparação: o do meio das entradas,
// em que o escalonamento de cada direção deixa um número diferente de elementos na tela.
const MOTION_FRAME_COMPARED = 1;
const CELL = { width: 960, height: 540 };

/** Imagens de uma pasta de quadros, na ordem dos quadros. */
const framesIn = (folder: string): string[] =>
  readdirSync(folder)
    .filter((file) => file.endsWith(".png"))
    .sort(
      (a, b) => parseInt(a.replace(/\D/g, "")) - parseInt(b.replace(/\D/g, "")),
    )
    .map((file) => path.join(folder, file));

const main = async () => {
  const names = Object.keys(directions);
  const sceneFrames = sceneSampleFrames(MODEL_VIDEO);

  // Uma lista de imagens por direção, todas na mesma ordem.
  const columns: string[][] = [];
  for (const name of names) {
    console.log(`\nDireção ${name}`);
    const folder = `${OUTPUT}/${name}`;
    const env = { REMOTION_DIRECTION: name };
    await renderFrames("identity-sheet", [0], `${folder}/sheet`, env);
    await renderFrames("motion-sample", MOTION_FRAMES, `${folder}/motion`, env);
    await renderFrames(MODEL_VIDEO, sceneFrames, `${folder}/demo`, env);
    columns.push([
      ...framesIn(`${folder}/sheet`),
      framesIn(`${folder}/motion`)[MOTION_FRAME_COMPARED],
      ...framesIn(`${folder}/demo`),
    ]);
  }

  // O ffmpeg recebe as imagens linha a linha: cada linha é a mesma imagem nas três direções.
  const rowCount = columns[0].length;
  const images = Array.from({ length: rowCount }, (_, row) =>
    columns.map((column) => column[row]),
  ).flat();
  const scaled = images.map(
    (_, index) => `[${index}]scale=${CELL.width}:${CELL.height}[cell${index}]`,
  );
  const rows = Array.from({ length: rowCount }, (_, row) => {
    const cells = names.map(
      (_, column) => `[cell${row * names.length + column}]`,
    );
    return `${cells.join("")}hstack=inputs=${names.length}[row${row}]`;
  });
  const stacked = `${rows.map((_, row) => `[row${row}]`).join("")}vstack=inputs=${rowCount}`;
  const comparison = `${OUTPUT}/comparison.png`;
  await run("ffmpeg", [
    "-v",
    "error",
    "-y",
    ...images.flatMap((image) => ["-i", image]),
    "-filter_complex",
    [...scaled, ...rows, stacked].join(";"),
    comparison,
  ]);

  console.log(`\nColunas: ${names.join(", ")}. Comparação em ${comparison}`);
};

main().catch(exitWithError);
