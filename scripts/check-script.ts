// Valida o roteiro de um vídeo sem gerar nada: pnpm check-script <vídeo>
//
// Mostra também a duração estimada de cada cena, para acertar o tamanho do
// vídeo antes de gastar minutos gerando a narração.

import { PACING } from "../src/narration/manifest";
import { splitSentences } from "../src/narration/text";
import { exitWithError, readScript, slugFromArgs } from "./lib/videos";

// Ritmo medido na narração do vídeo de demonstração com a voz de voice/reference.wav.
// Muda com a amostra de voz e com o modelo: meça de novo quando um deles mudar.
const CHARACTERS_PER_SECOND = 18;

const formatDuration = (seconds: number) =>
  `${Math.floor(seconds / 60)} min ${Math.round(seconds % 60)} s`;

const main = () => {
  const slug = slugFromArgs("pnpm check-script <vídeo>");
  const script = readScript(slug);

  console.log(script.title);
  let totalSeconds = 0;
  for (const scene of script.scenes) {
    const sentences = splitSentences(scene.narration).length;
    const pausesMs =
      PACING.leadMs + PACING.sentenceGapMs * (sentences - 1) + PACING.tailMs;
    const seconds =
      scene.narration.length / CHARACTERS_PER_SECOND + pausesMs / 1000;
    totalSeconds += seconds;
    console.log(
      `- ${scene.id}: ${sentences} frase(s), cerca de ${seconds.toFixed(1)} s`,
    );
  }

  console.log(
    `\nRoteiro válido: ${script.scenes.length} cena(s), duração estimada de ${formatDuration(totalSeconds)}.`,
  );
};

try {
  main();
} catch (error) {
  exitWithError(error);
}
