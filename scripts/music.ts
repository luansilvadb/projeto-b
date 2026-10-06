// Gera a trilha instrumental de um vídeo com o ACE-Step:
//   pnpm music <vídeo> [semente] [parte]
//
// A descrição da trilha vem do campo "music" do roteiro e a duração, da
// narração já gerada. Outra semente dá outra música para a mesma descrição.
// Quando o roteiro divide a trilha ("music.parts"), cada parte sai num
// arquivo; com o número de uma parte, só ela é gerada de novo.

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { musicParts, planMusicParts } from "../src/audio/parts";
import {
  musicFile,
  musicTrackFile,
  type MusicPart,
  type MusicTrack,
} from "../src/media";
import { measureLoudness } from "./lib/loudness";
import { runPythonTool } from "./lib/tools";
import {
  exitWithError,
  publicPath,
  readNarration,
  readScript,
  slugFromArgs,
} from "./lib/videos";

const ACE_STEP = "vendor/ace-step";
const USAGE = "pnpm music <vídeo> [semente] [parte]";

const main = async () => {
  const slug = slugFromArgs(USAGE);
  const seed = Number(process.argv[3] ?? 1);
  if (!Number.isInteger(seed) || seed < 0) {
    throw new Error(
      `A semente precisa ser um número inteiro, não "${process.argv[3]}".`,
    );
  }

  const { music } = readScript(slug);
  if (!music) {
    throw new Error(`O roteiro de "${slug}" não tem o campo "music".`);
  }

  // O plano vem antes de qualquer geração: a faixa longa demais, ou a troca
  // numa cena que a narração não tem, para o comando antes dos minutos de GPU.
  const planned = planMusicParts(readNarration(slug).scenes, music);

  const only =
    process.argv[4] === undefined ? undefined : Number(process.argv[4]);
  if (
    only !== undefined &&
    !(Number.isInteger(only) && only >= 1 && only <= planned.length)
  ) {
    throw new Error(
      `A parte precisa ser um número de 1 a ${planned.length}, não "${process.argv[4]}".`,
    );
  }

  // Gerar uma parte só aproveita o volume medido das outras, que continuam
  // sendo os arquivos de antes.
  const trackFile = publicPath(musicTrackFile(slug));
  let kept: MusicPart[] = [];
  if (only !== undefined) {
    kept = existsSync(trackFile)
      ? musicParts(JSON.parse(readFileSync(trackFile, "utf8")) as MusicTrack)
      : [];
    const missing = planned.findIndex(
      (_, index) =>
        index !== only - 1 &&
        !(kept[index] && existsSync(publicPath(kept[index].file))),
    );
    if (kept.length !== planned.length || missing >= 0) {
      throw new Error(
        `Para gerar só a parte ${only}, as outras ${planned.length - 1} precisam existir. Rode ${USAGE.replace(" [parte]", "")} sem a parte.`,
      );
    }
  }

  const aceStepRoot = path.resolve(ACE_STEP);
  const parts: MusicPart[] = [];
  // Uma faixa por vez: cada geração ocupa a placa inteira.
  for (const [index, part] of planned.entries()) {
    const file = musicFile(slug, index + 1);
    const output = publicPath(file);
    const generate = only === undefined || only === index + 1;
    if (generate) {
      if (planned.length > 1) {
        console.log(
          `\nParte ${index + 1} de ${planned.length} (${part.durationSeconds} s):`,
        );
      }
      await runPythonTool(
        ACE_STEP,
        "tools/music/generate.py",
        {
          aceStepRoot,
          caption: part.caption,
          bpm: part.bpm,
          keyScale: part.keyScale,
          durationSeconds: part.durationSeconds,
          seed,
          output,
        },
        // É assim que o ACE-Step encontra a própria pasta de modelos.
        { ACESTEP_PROJECT_ROOT: aceStepRoot },
      );
    }
    parts.push({
      file,
      // Cada faixa tem a medida dela: a mixagem põe cada uma à mesma
      // distância da voz, e a troca de faixa não muda de volume.
      loudnessLufs: generate
        ? await measureLoudness([output])
        : kept[index].loudnessLufs,
      // O instante e a entrada vêm sempre do plano de agora: a narração pode
      // ter mudado de tempo desde a última geração.
      startMs: part.startMs,
      fadeMs: part.fadeMs,
    });
  }

  const [first, ...rest] = parts;
  const track: MusicTrack = {
    file: first.file,
    loudnessLufs: first.loudnessLufs,
    ...(rest.length > 0 ? { parts: rest } : {}),
  };
  writeFileSync(trackFile, JSON.stringify(track, null, 2));

  console.log(`\nTrilha pronta (semente ${seed}):`);
  planned.forEach((part, index) => {
    const mark = only === undefined || only === index + 1 ? "" : " (mantida)";
    console.log(
      `  public/${parts[index].file} (${part.durationSeconds} s)${mark}`,
    );
  });
};

main().catch(exitWithError);
