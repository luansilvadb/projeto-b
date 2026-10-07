// Mede o render de um vídeo e compara com a faixa dos vídeos de referência:
//   pnpm critique <vídeo>             mede out/<vídeo>/<vídeo>.mp4, já animado
//   pnpm critique <vídeo> animatic    as medidas de movimento ainda não valem
//   pnpm critique <arquivo.mp4>       mede um arquivo qualquer, para recalibrar as faixas
//   pnpm critique <vídeo ou arquivo> som   mede o som em vez da imagem
//
// As medidas acusam o vídeo parado, vazio ou de uma cor só. Não enxergam
// desenho ruim nem encenação fraca: isso é da leitura dos quadros. As de som
// acusam a música baixa, oscilante, com buracos ou feita de várias músicas, e
// a falta de efeitos; não ouvem o clima nem se a música combina com a cena.

import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { SAMPLE, measure } from "../src/critique/measures";
import { judge, type Stage } from "../src/critique/reference";
import { judgeSound, type SoundMeasures } from "../src/critique/sound";
import { readFrames } from "./lib/frames";
import { PYTHON_ENV, run } from "./lib/tools";
import { exitWithError } from "./lib/videos";

const USAGE = "Uso: pnpm critique <vídeo ou arquivo de vídeo> [animatic | som]";
const SOUND_TOOLS = "tools/sound";

/**
 * Separa o som do arquivo em voz, música e efeitos e mede cada camada. A
 * separação fica em som/<nome>/, ao lado do arquivo, e é reaproveitada: apague a pasta para
 * medir de novo um arquivo que mudou.
 */
const measureSound = async (file: string): Promise<SoundMeasures> => {
  const name = path.parse(file).name;
  const folder = `${path.dirname(file)}/som/${name}`;
  const python = (script: string, ...args: string[]) =>
    run(
      "uv",
      [
        "run",
        "--project",
        SOUND_TOOLS,
        "python",
        `${SOUND_TOOLS}/${script}`,
        ...args,
      ],
      PYTHON_ENV,
    );
  await python("separate.py", `${folder}/stems`, file);
  const report = `${folder}/medidas.json`;
  await python("measure.py", `${folder}/stems/${name}`, report);
  console.log(`\nMapa segundo a segundo em ${report}\n`);
  return (
    JSON.parse(readFileSync(report, "utf8")) as { medidas: SoundMeasures }
  ).medidas;
};

const STATUS: Record<"ok" | "out" | "pending", string> = {
  ok: "dentro",
  out: "FORA",
  pending: "fora, mas só vale depois de animar",
};

const main = async () => {
  const [target, stageName] = process.argv.slice(2);
  if (!target || target.startsWith("-")) {
    throw new Error(USAGE);
  }
  if (
    stageName !== undefined &&
    stageName !== "animatic" &&
    stageName !== "som"
  ) {
    throw new Error(USAGE);
  }
  const stage: Stage = stageName === "animatic" ? "animatic" : "final";

  // Um nome de pasta de vídeo vale pelo render dele; qualquer outra coisa é um arquivo.
  const file = /\.[a-z0-9]+$/i.test(target)
    ? target
    : `out/${target}/${target}.mp4`;
  if (!existsSync(file)) {
    throw new Error(
      `Não existe ${file}. Renderize antes: pnpm render ${target} ${file}`,
    );
  }

  const verdicts =
    stageName === "som"
      ? judgeSound(await measureSound(file))
      : judge(await measure(readFrames(file, SAMPLE)), stage);
  const width = Math.max(...verdicts.map((verdict) => verdict.label.length));
  console.log(`${file}\n`);
  for (const { label, value, band, status } of verdicts) {
    console.log(
      `${label.padEnd(width)}  ${value.padStart(8)}   referência: ${band.padEnd(19)}  ${STATUS[status]}`,
    );
  }

  // A faixa é o que os vídeos de referência fazem, não uma exigência do
  // projeto: sair dela não é erro do comando, que só falha quando não mede.
  const out = verdicts.filter((verdict) => verdict.status === "out").length;
  console.log(
    out > 0
      ? `\n${out} medida(s) fora da faixa dos vídeos de referência: cada uma diz onde conferir, não que há defeito.`
      : "\nNenhuma medida fora da faixa dos vídeos de referência.",
  );
};

main().catch(exitWithError);
