// O que a narração (narrate.ts) e o estúdio de voz (voice-studio.ts) têm em
// comum: quais frases o roteiro pede, onde cada tomada fica guardada, as
// escolhas feitas de ouvido, a escolha automática e a montagem do manifesto.

import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import { mediaFolder, narrationManifestFile } from "../../src/media";
import { alignWords } from "../../src/narration/alignment";
import {
  NO_CHOICES,
  parseChoices,
  type VoiceChoices,
} from "../../src/narration/choices";
import {
  assembleScene,
  endsTight,
  type NarrationManifest,
  type SentenceTake,
} from "../../src/narration/manifest";
import type { Script } from "../../src/narration/script";
import {
  bestTake,
  takeDefects,
  wantedEnding,
  type MeasuredTake,
} from "../../src/narration/takes";
import { splitUtterances } from "../../src/narration/text";
import { measureLoudness } from "./loudness";
import { publicPath } from "./videos";
import {
  VOICE_MODEL,
  hash,
  resolveVoice,
  voiceTranscript,
  type VoiceSample,
} from "./voice";
import type { VoiceWorker } from "./voice-worker";

/** Rodadas de tomadas que a escolha automática gera atrás de uma sem defeito. */
const MAX_ROUNDS = 3;
/** A tomada em uso antes de as sementes serem guardadas conta como semente 0. */
const UNKNOWN_SEED = 0;

export type PlannedSentence = { readonly key: string; readonly text: string };

export type NarrationPlan = {
  readonly slug: string;
  readonly voice: ReturnType<typeof resolveVoice>;
  readonly sample: VoiceSample;
  /** Pasta das frases em uso, dentro de public/. */
  readonly folder: string;
  /** Pasta de todas as tomadas geradas, dentro de public/. */
  readonly takesFolder: string;
  readonly scenes: readonly {
    readonly id: string;
    readonly holdMs?: number;
    readonly sentences: readonly PlannedSentence[];
  }[];
  readonly choices: VoiceChoices;
};

const choicesFile = (slug: string) =>
  path.resolve("src/videos", slug, "voice.json");

export const readChoices = (slug: string): VoiceChoices =>
  existsSync(choicesFile(slug))
    ? parseChoices(JSON.parse(readFileSync(choicesFile(slug), "utf8")))
    : NO_CHOICES;

export const writeChoices = (slug: string, choices: VoiceChoices): void =>
  writeFileSync(choicesFile(slug), `${JSON.stringify(choices, null, 2)}\n`);

/** As frases que o roteiro pede, cada uma com a chave do áudio dela. */
export const planNarration = async (
  slug: string,
  script: Script,
): Promise<NarrationPlan> => {
  const voice = resolveVoice();
  const voiceHash = hash(readFileSync(voice.file));
  const voiceText = await voiceTranscript(voice.file, voiceHash);
  const plan: NarrationPlan = {
    slug,
    voice,
    sample: { file: voice.file, text: voiceText },
    folder: `${mediaFolder(slug)}/narration`,
    takesFolder: `${mediaFolder(slug)}/takes`,
    scenes: script.scenes.map((scene) => ({
      id: scene.id,
      holdMs: scene.holdMs,
      sentences: splitUtterances(scene.narration).map((text) => ({
        text,
        key: hash(JSON.stringify([VOICE_MODEL, voiceHash, voiceText, text])),
      })),
    })),
    choices: readChoices(slug),
  };
  mkdirSync(publicPath(plan.folder), { recursive: true });
  mkdirSync(publicPath(plan.takesFolder), { recursive: true });
  return plan;
};

/** O que vai para as ferramentas Python em todo pedido de voz. */
export const voiceJob = (sample: VoiceSample) => ({
  ...VOICE_MODEL,
  voice: path.resolve(sample.file),
  voiceText: sample.text,
});

const takeAudio = (plan: NarrationPlan, key: string) =>
  `${plan.folder}/${key}.wav`;

const takeJson = (plan: NarrationPlan, key: string) =>
  publicPath(`${plan.folder}/${key}.json`);

const storedFile = (plan: NarrationPlan, key: string, seed: number) =>
  `${plan.takesFolder}/${key}-${seed}`;

export const rejectedSeeds = (
  plan: NarrationPlan,
  sentence: PlannedSentence,
): readonly number[] => plan.choices.rejected[sentence.text] ?? [];

/** A semente da tomada em uso; a de antes de as sementes serem guardadas vale 0. */
export const seedOf = (take: SentenceTake): number => take.seed ?? UNKNOWN_SEED;

/**
 * A tomada em uso de uma frase, se já foi gerada e ainda vale: não vale a que
 * o usuário rejeitou, nem outra que não seja a que ele escolheu à mão.
 */
export const currentTake = (
  plan: NarrationPlan,
  sentence: PlannedSentence,
): SentenceTake | undefined => {
  const file = takeJson(plan, sentence.key);
  if (!existsSync(file)) {
    return undefined;
  }
  const take = JSON.parse(readFileSync(file, "utf8")) as SentenceTake;
  const chosen = plan.choices.takes[sentence.text];
  const valid =
    !rejectedSeeds(plan, sentence).includes(seedOf(take)) &&
    (chosen === undefined || chosen === take.seed);
  return valid ? take : undefined;
};

/** Todas as tomadas já geradas de uma frase, pela ordem das sementes. */
export const storedTakes = (
  plan: NarrationPlan,
  sentence: PlannedSentence,
): MeasuredTake[] =>
  readdirSync(publicPath(plan.takesFolder))
    .filter(
      (file) => file.startsWith(`${sentence.key}-`) && file.endsWith(".json"),
    )
    .map(
      (file) =>
        JSON.parse(
          readFileSync(publicPath(`${plan.takesFolder}/${file}`), "utf8"),
        ) as MeasuredTake,
    )
    .sort((a, b) => a.seed - b.seed);

export const uniqueSentences = (plan: NarrationPlan): PlannedSentence[] => [
  ...new Map(
    plan.scenes
      .flatMap((scene) => scene.sentences)
      .map((sentence) => [sentence.key, sentence]),
  ).values(),
];

export const missingSentences = (plan: NarrationPlan): PlannedSentence[] =>
  uniqueSentences(plan).filter((sentence) => !currentTake(plan, sentence));

/**
 * Gera tomadas de uma frase e as guarda, medidas e conferidas. Sem sementes
 * pedidas, é uma rodada nova, com as próximas sementes ainda não usadas.
 */
export const generateTakes = async (
  plan: NarrationPlan,
  worker: VoiceWorker,
  sentence: PlannedSentence,
  seeds?: readonly number[],
): Promise<MeasuredTake[]> => {
  const used = storedTakes(plan, sentence).map((take) => take.seed);
  const firstSeed = Math.max(0, ...used) + 1;
  const wanted =
    seeds ??
    Array.from(
      { length: VOICE_MODEL.takesPerAttempt },
      (_, index) => firstSeed + index,
    );
  const generated = await worker.generate(
    sentence.text,
    wanted.map((seed) => ({
      seed,
      output: publicPath(`${storedFile(plan, sentence.key, seed)}.wav`),
    })),
  );

  return generated.map(
    ({ seed, durationMs, cutOff, words: heard, ...measures }) => {
      const { words, errors } = alignWords(sentence.text, heard, durationMs);
      const take: MeasuredTake = {
        text: sentence.text,
        file: `${storedFile(plan, sentence.key, seed)}.wav`,
        durationMs,
        words,
        errors,
        heard: heard.map((word) => word.text).join(" "),
        cutOff,
        seed,
        ...measures,
      };
      writeFileSync(
        publicPath(`${storedFile(plan, sentence.key, seed)}.json`),
        JSON.stringify(take),
      );
      return take;
    },
  );
};

/** Põe uma tomada em uso: ela passa a ser o áudio da frase no vídeo. */
export const putInUse = (
  plan: NarrationPlan,
  sentence: PlannedSentence,
  take: MeasuredTake,
): void => {
  copyFileSync(
    publicPath(take.file),
    publicPath(takeAudio(plan, sentence.key)),
  );
  writeFileSync(
    takeJson(plan, sentence.key),
    JSON.stringify({ ...take, file: takeAudio(plan, sentence.key) }),
  );
};

/** A melhor tomada já gerada de uma frase, fora as rejeitadas. */
export const bestStoredTake = (
  plan: NarrationPlan,
  sentence: PlannedSentence,
): MeasuredTake | undefined =>
  bestTake(
    storedTakes(plan, sentence),
    wantedEnding(sentence.text, plan.choices.tight.includes(sentence.text)),
    rejectedSeeds(plan, sentence),
  );

/**
 * Decide a tomada de uma frase e a põe em uso. A escolhida à mão vale sempre;
 * sem ela, fica a melhor entre as não rejeitadas, gerando rodadas novas
 * enquanto a melhor tiver defeito, até o limite.
 */
export const settleSentence = async (
  plan: NarrationPlan,
  worker: VoiceWorker,
  sentence: PlannedSentence,
): Promise<MeasuredTake> => {
  const chosen = plan.choices.takes[sentence.text];
  if (chosen !== undefined) {
    const take =
      storedTakes(plan, sentence).find(({ seed }) => seed === chosen) ??
      (await generateTakes(plan, worker, sentence, [chosen]))[0];
    putInUse(plan, sentence, take);
    return take;
  }

  let best = bestStoredTake(plan, sentence);
  for (
    let round = 0;
    round < MAX_ROUNDS && (!best || takeDefects(best) > 0);
    round++
  ) {
    await generateTakes(plan, worker, sentence);
    best = bestStoredTake(plan, sentence);
  }
  if (!best) {
    throw new Error(`Nenhuma tomada serviu para "${sentence.text}".`);
  }
  putInUse(plan, sentence, best);
  return best;
};

/**
 * Refaz a escolha automática entre as tomadas já geradas, sem gerar nada: é
 * como uma mudança na regra de escolha, ou uma frase que passou a ser colada,
 * chega às frases que já tinham áudio. Devolve quantas trocaram de tomada.
 */
export const repickStoredTakes = (plan: NarrationPlan): number => {
  let changed = 0;
  for (const sentence of uniqueSentences(plan)) {
    const current = currentTake(plan, sentence);
    const best = bestStoredTake(plan, sentence);
    if (
      current &&
      best &&
      plan.choices.takes[sentence.text] === undefined &&
      best.seed !== seedOf(current) &&
      takeDefects(best) <= takeDefects(current)
    ) {
      putInUse(plan, sentence, best);
      changed++;
    }
  }
  return changed;
};

/** Monta e grava o manifesto. Todas as frases precisam ter tomada em uso. */
export const writeManifest = async (
  plan: NarrationPlan,
): Promise<NarrationManifest> => {
  const tight = new Set(plan.choices.tight);
  const takes = plan.scenes.map((scene) =>
    scene.sentences.map((sentence): SentenceTake => {
      const take = currentTake(plan, sentence);
      if (!take) {
        throw new Error(`A frase "${sentence.text}" ainda não tem áudio.`);
      }
      return tight.has(sentence.text) ? { ...take, tight: true } : take;
    }),
  );

  const manifest: NarrationManifest = {
    loudnessLufs: await measureLoudness(
      uniqueSentences(plan).map((sentence) =>
        publicPath(takeAudio(plan, sentence.key)),
      ),
    ),
    scenes: plan.scenes.map((scene, index) =>
      assembleScene(
        scene.id,
        takes[index],
        scene.holdMs,
        index > 0 && endsTight(takes[index - 1]),
      ),
    ),
  };
  writeFileSync(
    publicPath(narrationManifestFile(plan.slug)),
    JSON.stringify(manifest, null, 2),
  );
  return manifest;
};

/** Apaga o áudio das frases que saíram do roteiro, em uso e guardado. */
export const removeLeftovers = (plan: NarrationPlan): void => {
  const keys = new Set(uniqueSentences(plan).map((sentence) => sentence.key));
  for (const folder of [plan.folder, plan.takesFolder]) {
    for (const file of readdirSync(publicPath(folder))) {
      if (!keys.has(file.split(/[.-]/)[0])) {
        rmSync(publicPath(`${folder}/${file}`));
      }
    }
  }
};
