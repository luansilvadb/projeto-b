// Valida o roteiro de um vídeo sem gerar nada: pnpm check-script <vídeo>
//
// Mostra também a duração estimada de cada cena e de cada plano, para acertar
// o tamanho do vídeo e o ritmo da imagem antes de gastar minutos gerando a
// narração.

import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { directionProblems } from "../src/narration/direction";
import { PACING } from "../src/narration/manifest";
import {
  PROFILE_CRITERIA,
  narrationProfile,
  profileProblems,
} from "../src/narration/profile";
import { shotShares } from "../src/narration/shots";
import { splitUtterances } from "../src/narration/text";
import { exitWithError, readScript, slugFromArgs } from "./lib/videos";

// Ritmo medido na narração do vídeo de demonstração com a voz de voice/reference.wav.
// Muda com a amostra de voz e com o modelo: meça de novo quando um deles mudar.
const CHARACTERS_PER_SECOND = 18;

// Nos vídeos de referência a imagem vira outra a cada 4 ou 5 s, e é raro uma
// composição durar mais que isto sem mudar.
const LONG_SHOT_SECONDS = 8;

const formatDuration = (seconds: number) => {
  // Arredonda antes de dividir: 299,6 s é "5 min 0 s", e não "4 min 60 s".
  const total = Math.round(seconds);
  return `${Math.floor(total / 60)} min ${total % 60} s`;
};

/**
 * Confere o registro da direção contra o roteiro. Sem script.md o comando só
 * avisa: o roteiro pode ser validado antes de a estrutura ter sido gravada.
 */
const checkDirection = (slug: string, sceneIds: readonly string[]) => {
  const file = path.resolve("src/videos", slug, "script.md");
  if (!existsSync(file)) {
    console.log(
      `\nSem registro da direção (${file}): a crítica do texto não tem os blocos contra os quais conferir.`,
    );
    return;
  }
  const problems = directionProblems(readFileSync(file, "utf8"), sceneIds);
  if (problems.length > 0) {
    throw new Error(
      `O registro da direção (${file}) não cobre o roteiro:\n- ${problems.join("\n- ")}`,
    );
  }
  console.log("\nRegistro da direção: toda cena está em um bloco.");
};

const main = () => {
  const slug = slugFromArgs("pnpm check-script <vídeo>");
  const script = readScript(slug);

  console.log(script.title);
  let totalSeconds = 0;
  let shotCount = 0;
  const longShots: string[] = [];
  for (const scene of script.scenes) {
    const sentences = splitUtterances(scene.narration).length;
    const pausesMs =
      PACING.leadMs + PACING.sentenceGapMs * (sentences - 1) + PACING.tailMs;
    const seconds =
      scene.narration.length / CHARACTERS_PER_SECOND + pausesMs / 1000;
    totalSeconds += seconds;
    console.log(
      `- ${scene.id}: ${sentences} frase(s), cerca de ${seconds.toFixed(1)} s`,
    );

    shotShares(scene.narration, scene.shots).forEach((share, index) => {
      const shot = scene.shots[index];
      const shotSeconds = seconds * share;
      const starts = shot.cue ? `em "${shot.cue}"` : "no começo";
      const long = shotSeconds > LONG_SHOT_SECONDS;
      shotCount++;
      if (long) {
        longShots.push(`${scene.id}, plano ${index + 1}`);
      }
      console.log(
        `    plano ${index + 1} (${starts}): ${shot.scale}, cerca de ${shotSeconds.toFixed(1)} s${long ? ", longo" : ""}`,
      );
    });
  }

  console.log(
    `\nRoteiro válido: ${script.scenes.length} cena(s), ${shotCount} plano(s), duração estimada de ${formatDuration(totalSeconds)}.`,
  );
  console.log(
    `Cada plano fica na tela cerca de ${(totalSeconds / shotCount).toFixed(1)} s, em média.`,
  );
  // O perfil do texto: é o que separa uma explicação para quem assiste de uma lista de fatos.
  const profile = narrationProfile(
    script.scenes.map((scene) => scene.narration),
  );
  console.log("\nPerfil da narração, contra os vídeos de referência:");
  for (const criterion of PROFILE_CRITERIA) {
    const value = criterion.value(profile);
    const inRange = value >= criterion.range[0] && value <= criterion.range[1];
    console.log(
      `  ${criterion.label.padEnd(38)} ${criterion.format(value).padStart(5)}   referência: ${criterion.format(criterion.range[0])} a ${criterion.format(criterion.range[1])}   ${inRange ? "dentro" : "FORA"}`,
    );
  }
  const off = profileProblems(profile).length;
  if (off > 0) {
    console.log(
      `${off} medida(s) do texto fora da faixa: reveja o roteiro com a skill diretor-criativo antes de gerar a voz.`,
    );
  }
  if (longShots.length > 0) {
    console.log(
      `\n${longShots.length} plano(s) com mais de ${LONG_SHOT_SECONDS} s. Divida cada um, ou confirme que a imagem muda dentro dele:\n- ${longShots.join("\n- ")}`,
    );
  }
  // Por último: o relatório do roteiro sai inteiro mesmo quando o registro diverge.
  checkDirection(
    slug,
    script.scenes.map((scene) => scene.id),
  );
};

try {
  main();
} catch (error) {
  exitWithError(error);
}
