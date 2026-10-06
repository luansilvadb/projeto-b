// Gera a narração de um vídeo a partir do roteiro: pnpm narrate <vídeo>
//
// Cada frase é gerada algumas vezes. O Whisper transcreve cada tomada, para
// conferir se o modelo de voz falou o que estava escrito e para saber quando
// cada palavra soa, e fica a tomada sem defeito cuja entonação serve ao lugar
// da frase (src/narration/takes.ts). As escolhas que o usuário fez de ouvido
// no estúdio de voz (pnpm voice <vídeo>) valem acima da escolha automática.

import type { NarrationManifest } from "../src/narration/manifest";
import {
  missingSentences,
  planNarration,
  removeLeftovers,
  repickStoredTakes,
  settleSentence,
  uniqueSentences,
  voiceJob,
  writeManifest,
} from "./lib/narration";
import { exitWithError, readScript, slugFromArgs } from "./lib/videos";
import { startVoiceWorker } from "./lib/voice-worker";

const report = (
  manifest: NarrationManifest,
  generated: number,
  reused: number,
) => {
  const seconds =
    manifest.scenes.reduce((total, scene) => total + scene.durationMs, 0) /
    1000;
  console.log(
    `\nNarração pronta: ${seconds.toFixed(1)} s em ${manifest.scenes.length} cena(s).`,
  );
  console.log(
    `Frases geradas agora: ${generated}. Reaproveitadas do cache: ${reused}.`,
  );

  const sentences = manifest.scenes.flatMap((scene) =>
    scene.sentences.map((sentence) => ({ scene: scene.id, ...sentence })),
  );
  const wrong = sentences.filter((sentence) => sentence.errors > 0);
  if (wrong.length > 0) {
    console.log(
      `\nATENÇÃO: ${wrong.length} frase(s) ainda diferem do roteiro em todas as tomadas. Ouça antes de seguir:`,
    );
    for (const sentence of wrong) {
      console.log(
        `- [${sentence.scene}] ${sentence.errors} palavra(s) diferente(s) em public/${sentence.file}`,
      );
      console.log(`    roteiro: ${sentence.text}`);
      console.log(`    ouvido:  ${sentence.heard}`);
    }
  }
  const cutOff = sentences.filter((sentence) => sentence.cutOff);
  if (cutOff.length > 0) {
    console.log(
      `\nATENÇÃO: ${cutOff.length} frase(s) com o fim cortado em todas as tomadas. Ouça antes de seguir:`,
    );
    for (const sentence of cutOff) {
      console.log(`- [${sentence.scene}] public/${sentence.file}`);
      console.log(`    roteiro: ${sentence.text}`);
    }
  }
};

const main = async () => {
  const slug = slugFromArgs("pnpm narrate <vídeo>");
  const plan = await planNarration(slug, readScript(slug));

  const sentences = uniqueSentences(plan);
  const missing = missingSentences(plan);
  if (missing.length > 0) {
    console.log(`Voz: ${plan.voice.file}`);
    const worker = startVoiceWorker(voiceJob(plan.sample));
    try {
      await worker.ready;
      for (const [index, sentence] of missing.entries()) {
        console.log(
          `  frase ${index + 1}/${missing.length}: ${sentence.text.slice(0, 60)}`,
        );
        await settleSentence(plan, worker, sentence);
      }
    } finally {
      worker.stop();
    }
  }
  const repicked = repickStoredTakes(plan);
  if (repicked > 0) {
    console.log(
      `${repicked} frase(s) trocaram de tomada pela regra de escolha atual.`,
    );
  }
  const manifest = await writeManifest(plan);
  removeLeftovers(plan);

  report(manifest, missing.length, sentences.length - missing.length);
};

main().catch(exitWithError);
