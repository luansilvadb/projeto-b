// Gera a trilha instrumental de um vídeo com o ACE-Step: pnpm music <vídeo> [semente]
//
// A descrição da trilha vem do campo "music" do roteiro e a duração, da
// narração já gerada. Outra semente dá outra música para a mesma descrição.

import { writeFileSync } from "node:fs";
import path from "node:path";
import { musicFile, musicTrackFile, type MusicTrack } from "../src/media";
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
// Em GPUs de 8 GB o ACE-Step gera no máximo 8 minutos por faixa.
const MAX_SECONDS = 480;
// Sobra depois da última fala, para o fade final não cortar a música no meio.
const TAIL_SECONDS = 2;

const main = async () => {
  const slug = slugFromArgs("pnpm music <vídeo> [semente]");
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

  const narrationMs = readNarration(slug).scenes.reduce(
    (total, scene) => total + scene.durationMs,
    0,
  );
  const durationSeconds = Math.ceil(narrationMs / 1000) + TAIL_SECONDS;
  if (durationSeconds > MAX_SECONDS) {
    throw new Error(
      `"${slug}" precisa de ${durationSeconds} s de trilha, mas ela é gerada numa peça só de até ${MAX_SECONDS} s. ` +
        "Trilha dividida em partes ainda não foi implementada.",
    );
  }

  const aceStepRoot = path.resolve(ACE_STEP);
  const output = publicPath(musicFile(slug));
  await runPythonTool(
    ACE_STEP,
    "tools/music/generate.py",
    {
      aceStepRoot,
      caption: music.caption,
      bpm: music.bpm,
      keyScale: music.keyScale,
      durationSeconds,
      seed,
      output,
    },
    // É assim que o ACE-Step encontra a própria pasta de modelos.
    { ACESTEP_PROJECT_ROOT: aceStepRoot },
  );

  const track: MusicTrack = {
    file: musicFile(slug),
    loudnessLufs: await measureLoudness([output]),
  };
  writeFileSync(
    publicPath(musicTrackFile(slug)),
    JSON.stringify(track, null, 2),
  );

  console.log(
    `\nTrilha pronta: public/${track.file} (${durationSeconds} s, semente ${seed}).`,
  );
};

main().catch(exitWithError);
