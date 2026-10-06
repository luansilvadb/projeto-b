// A voz da narração: o modelo, a configuração dele e a amostra clonada.
// A narração (narrate.ts) e a avaliação (eval-voice.ts) partem daqui para
// medir exatamente o que é narrado.

import { createHash } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import type { TimedWord } from "../../src/narration/alignment";
import { runPythonTool } from "./tools";

export const NARRATION_TOOLS = "tools/narration";

export type VoiceModel = {
  readonly repository: string;
  readonly revision: string;
  readonly intonation: number;
  readonly speed: number;
  readonly numStep: number;
  readonly classTemperature: number;
  readonly precision: "float16" | "float32";
  readonly takesPerAttempt: number;
};

// Tudo aqui entra na chave do cache: mudar o modelo ou um parâmetro regera a narração.
// Antes de mudar um valor, meça o efeito com `pnpm eval:voice`.
export const VOICE_MODEL: VoiceModel = {
  repository: "k2-fsa/OmniVoice",
  revision: "c5fdb5ccb189668d56333f77ba2629f4cd7535f4",
  // Quanto a entonação da amostra é ampliada antes de ir para o modelo, que
  // sozinho devolve uma fala mais monótona que a amostra.
  intonation: 1.3,
  // 1 é a fala na velocidade que o modelo estima pela amostra. Abaixo disso a
  // duração cresce, a fala fica mais lenta e menos gerações saem cortadas no
  // fim; com a amostra atual, o usuário preferiu de ouvido a velocidade normal
  // (0,9 soava sem energia), e as gerações cortadas são descartadas na escolha.
  speed: 1,
  // Passos de decodificação, sorteio na escolha de cada token (0 fica sempre
  // com o mais provável) e precisão do cálculo na GPU: os padrões do modelo,
  // que o autor recomenda para a melhor qualidade.
  numStep: 32,
  classTemperature: 0,
  precision: "float16",
  // Gerações de cada frase por tentativa; fica a de altura mais próxima da
  // amostra entre as que não saíram cortadas no fim.
  takesPerAttempt: 4,
};

const VOICE = { file: "voice/reference.wav" } as const;

/** A amostra de voz e o que é dito nela. */
export type VoiceSample = { readonly file: string; readonly text: string };

export const hash = (content: string | Buffer) =>
  createHash("sha256").update(content).digest("hex").slice(0, 16);

export const resolveVoice = () => {
  if (!existsSync(VOICE.file)) {
    throw new Error(
      `Falta a amostra de voz: grave de 5 a 10 segundos em ${VOICE.file}.`,
    );
  }
  return VOICE;
};

export const transcribe = (audios: readonly string[]) =>
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
export const voiceTranscript = async (
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
