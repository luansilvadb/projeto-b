// Gera a narração de um vídeo a partir do roteiro: pnpm narrate <vídeo>
//
// Cada frase vira um áudio, que o Whisper transcreve para conferir se o modelo
// de voz falou o que estava escrito e para saber quando cada palavra soa.
// Frases que saem erradas ou cortadas no fim são geradas de novo com outra semente.

import { createHash } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  renameSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import { mediaFolder, narrationManifestFile } from "../src/media";
import { alignWords, type TimedWord } from "../src/narration/alignment";
import {
  assembleScene,
  type NarrationManifest,
  type SentenceTake,
} from "../src/narration/manifest";
import { splitSentences } from "../src/narration/text";
import { measureLoudness } from "./lib/loudness";
import { runPythonTool } from "./lib/tools";
import {
  exitWithError,
  publicPath,
  readScript,
  slugFromArgs,
} from "./lib/videos";

const NARRATION_TOOLS = "tools/narration";
const MAX_ATTEMPTS = 3;

// Tudo aqui entra na chave do cache: mudar o modelo ou um parâmetro regera a narração.
const VOICE_MODEL = {
  repository: "k2-fsa/OmniVoice",
  revision: "c5fdb5ccb189668d56333f77ba2629f4cd7535f4",
  // Quanto a entonação da amostra é ampliada antes de ir para o modelo, que
  // sozinho devolve uma fala mais monótona que a amostra.
  intonation: 1.3,
  // O modelo gera cada frase com a duração que estima pelo número de letras, e
  // essa estimativa é justa: sem folga, a fala não cabe e a última palavra sai
  // cortada. Abaixo de 1 a duração cresce e a fala fica mais lenta.
  speed: 0.9,
  // Gerações de cada frase por tentativa; fica a de altura mais próxima da
  // amostra entre as que não saíram cortadas no fim.
  takesPerAttempt: 4,
};

const VOICES = [
  { kind: "reference", file: "voice/reference.wav" },
  { kind: "placeholder", file: "voice/placeholder.wav" },
] as const;

type Sentence = { readonly key: string; readonly text: string };

/** A amostra de voz e o que é dito nela. */
type VoiceSample = { readonly file: string; readonly text: string };

const hash = (content: string | Buffer) =>
  createHash("sha256").update(content).digest("hex").slice(0, 16);

/** Defeitos de uma frase gerada: palavras diferentes do roteiro, mais o fim cortado. */
const defects = (take: Pick<SentenceTake, "errors" | "cutOff">) =>
  take.errors + (take.cutOff ? 1 : 0);

const resolveVoice = () => {
  const voice = VOICES.find((candidate) => existsSync(candidate.file));
  if (!voice) {
    throw new Error("Nenhuma amostra de voz em voice/. Rode: pnpm setup:tools");
  }
  return voice;
};

const transcribe = (audios: readonly string[]) =>
  runPythonTool<{ words: TimedWord[] }>(
    NARRATION_TOOLS,
    `${NARRATION_TOOLS}/stt.py`,
    { audios },
  );

/**
 * O que é dito na amostra de voz: o OmniVoice precisa da transcrição junto com
 * o áudio. O Whisper a faz uma vez por amostra e ela fica ao lado do arquivo;
 * se ele errar uma palavra, corrija o campo "text" à mão.
 */
const voiceTranscript = async (
  voiceFile: string,
  voiceHash: string,
): Promise<string> => {
  const file = voiceFile.replace(/\.wav$/, ".json");
  if (existsSync(file)) {
    const saved = JSON.parse(readFileSync(file, "utf8")) as {
      voice: string;
      text: string;
    };
    if (saved.voice === voiceHash) {
      return saved.text;
    }
  }

  console.log(`Transcrevendo a amostra ${voiceFile}...`);
  const [{ words }] = await transcribe([path.resolve(voiceFile)]);
  const text = words.map((word) => word.text).join(" ");
  if (text === "") {
    throw new Error(`O Whisper não ouviu fala nenhuma em ${voiceFile}.`);
  }
  writeFileSync(file, JSON.stringify({ voice: voiceHash, text }, null, 2));
  return text;
};

/**
 * Gera cada frase, repetindo com outras sementes as que saíram cortadas no fim
 * ou que o Whisper ouviu diferente do roteiro.
 */
const generateTakes = async (
  sentences: readonly Sentence[],
  voice: VoiceSample,
  folder: string,
): Promise<void> => {
  const takeFile = (key: string) => `${folder}/${key}.wav`;
  const attemptFile = (key: string, attempt: number) =>
    publicPath(`${folder}/${key}.attempt-${attempt}.wav`);

  const best = new Map<string, SentenceTake & { readonly attempt: number }>();
  let pending = sentences;

  for (
    let attempt = 1;
    attempt <= MAX_ATTEMPTS && pending.length > 0;
    attempt++
  ) {
    console.log(
      `\nTentativa ${attempt} de ${MAX_ATTEMPTS}: ${pending.length} frase(s).`,
    );
    const outputs = pending.map((sentence) =>
      attemptFile(sentence.key, attempt),
    );

    const generated = await runPythonTool<{
      durationMs: number;
      cutOff: boolean;
    }>(NARRATION_TOOLS, `${NARRATION_TOOLS}/tts.py`, {
      ...VOICE_MODEL,
      voice: path.resolve(voice.file),
      voiceText: voice.text,
      // O tts.py tira as sementes do número da tentativa, para o resultado ser reproduzível.
      items: pending.map((sentence, index) => ({
        text: sentence.text,
        attempt,
        output: outputs[index],
      })),
    });
    const transcribed = await transcribe(outputs);
    if (
      generated.length !== pending.length ||
      transcribed.length !== pending.length
    ) {
      throw new Error(
        "As ferramentas de narração não responderam por todas as frases.",
      );
    }

    pending.forEach((sentence, index) => {
      const { durationMs, cutOff } = generated[index];
      const heard = transcribed[index].words;
      const { words, errors } = alignWords(sentence.text, heard, durationMs);
      const take = {
        text: sentence.text,
        file: takeFile(sentence.key),
        durationMs,
        words,
        errors,
        heard: heard.map((word) => word.text).join(" "),
        cutOff,
        attempt,
      };
      const previous = best.get(sentence.key);
      if (!previous || defects(take) < defects(previous)) {
        best.set(sentence.key, take);
      }
    });
    pending = pending.filter(
      (sentence) => defects(best.get(sentence.key)!) > 0,
    );
  }

  for (const sentence of sentences) {
    const { attempt, ...take } = best.get(sentence.key)!;
    renameSync(attemptFile(sentence.key, attempt), publicPath(take.file));
    writeFileSync(
      publicPath(take.file.replace(/\.wav$/, ".json")),
      JSON.stringify(take),
    );
  }
};

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
      `\nATENÇÃO: ${wrong.length} frase(s) ainda diferem do roteiro após ${MAX_ATTEMPTS} tentativas. Ouça antes de seguir:`,
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
      `\nATENÇÃO: ${cutOff.length} frase(s) com o fim cortado após ${MAX_ATTEMPTS} tentativas. Ouça antes de seguir:`,
    );
    for (const sentence of cutOff) {
      console.log(`- [${sentence.scene}] public/${sentence.file}`);
      console.log(`    roteiro: ${sentence.text}`);
    }
  }
  if (manifest.voice === "placeholder") {
    console.log(
      "\nATENÇÃO: narração feita com a voz provisória. Grave voice/reference.wav antes de publicar.",
    );
  }
};

const main = async () => {
  const slug = slugFromArgs("pnpm narrate <vídeo>");
  const script = readScript(slug);
  const voice = resolveVoice();
  const voiceHash = hash(readFileSync(voice.file));
  const voiceText = await voiceTranscript(voice.file, voiceHash);

  const folder = `${mediaFolder(slug)}/narration`;
  mkdirSync(publicPath(folder), { recursive: true });
  const takeJson = (key: string) => publicPath(`${folder}/${key}.json`);

  const scenes = script.scenes.map((scene) => ({
    id: scene.id,
    sentences: splitSentences(scene.narration).map((text) => ({
      text,
      key: hash(JSON.stringify([VOICE_MODEL, voiceHash, voiceText, text])),
    })),
  }));
  const sentences = [
    ...new Map(
      scenes.flatMap((scene) => scene.sentences).map((s) => [s.key, s]),
    ).values(),
  ];
  const missing = sentences.filter(
    (sentence) => !existsSync(takeJson(sentence.key)),
  );

  if (missing.length > 0) {
    console.log(`Voz: ${voice.file}`);
    await generateTakes(missing, { file: voice.file, text: voiceText }, folder);
  }

  const manifest: NarrationManifest = {
    voice: voice.kind,
    loudnessLufs: await measureLoudness(
      sentences.map((s) => publicPath(`${folder}/${s.key}.wav`)),
    ),
    scenes: scenes.map((scene) =>
      assembleScene(
        scene.id,
        scene.sentences.map(
          (s) =>
            JSON.parse(readFileSync(takeJson(s.key), "utf8")) as SentenceTake,
        ),
      ),
    ),
  };
  writeFileSync(
    publicPath(narrationManifestFile(slug)),
    JSON.stringify(manifest, null, 2),
  );

  // Sobras de frases que saíram do roteiro e de tentativas descartadas.
  const keys = new Set(sentences.map((sentence) => sentence.key));
  for (const file of readdirSync(publicPath(folder))) {
    if (!keys.has(file.split(".")[0]) || file.includes(".attempt-")) {
      rmSync(publicPath(`${folder}/${file}`));
    }
  }

  report(manifest, missing.length, sentences.length - missing.length);
};

main().catch(exitWithError);
