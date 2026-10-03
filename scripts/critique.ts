// Mede o render de um vídeo e compara com a faixa dos vídeos de referência:
//   pnpm critique <vídeo>             mede out/<vídeo>.mp4, já animado
//   pnpm critique <vídeo> animatic    as medidas de movimento ainda não reprovam
//   pnpm critique <arquivo.mp4>       mede um arquivo qualquer, para recalibrar as faixas
//
// As medidas acusam o vídeo parado, vazio ou de uma cor só. Não enxergam
// desenho ruim nem encenação fraca: isso é da leitura dos quadros.

import { existsSync } from "node:fs";
import { SAMPLE, measure } from "../src/critique/measures";
import { judge, type Stage } from "../src/critique/reference";
import { readFrames } from "./lib/frames";
import { exitWithError } from "./lib/videos";

const USAGE = "Uso: pnpm critique <vídeo ou arquivo de vídeo> [animatic]";

const STATUS = {
  ok: "dentro",
  out: "FORA",
  pending: "fora, mas só vale depois de animar",
} as const;

const main = async () => {
  const [target, stageName] = process.argv.slice(2);
  if (!target || target.startsWith("-")) {
    throw new Error(USAGE);
  }
  if (stageName !== undefined && stageName !== "animatic") {
    throw new Error(USAGE);
  }
  const stage: Stage = stageName ?? "final";

  // Um nome de pasta de vídeo vale pelo render dele; qualquer outra coisa é um arquivo.
  const file = /\.[a-z0-9]+$/i.test(target) ? target : `out/${target}.mp4`;
  if (!existsSync(file)) {
    throw new Error(
      `Não existe ${file}. Renderize antes: pnpm render ${target}`,
    );
  }

  const verdicts = judge(await measure(readFrames(file, SAMPLE)), stage);
  const width = Math.max(...verdicts.map((verdict) => verdict.label.length));
  console.log(`${file}\n`);
  for (const { label, value, band, status } of verdicts) {
    console.log(
      `${label.padEnd(width)}  ${value.padStart(6)}   referência: ${band.padEnd(13)}  ${STATUS[status]}`,
    );
  }

  const out = verdicts.filter((verdict) => verdict.status === "out");
  if (out.length > 0) {
    throw new Error(
      `\n${out.length} medida(s) fora da faixa dos vídeos de referência.`,
    );
  }
  console.log("\nNenhuma medida fora da faixa dos vídeos de referência.");
};

main().catch(exitWithError);
