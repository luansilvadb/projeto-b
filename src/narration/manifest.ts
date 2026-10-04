import type { TimedWord } from "./alignment";
import type { Script } from "./script";
import { splitUtterances } from "./text";

/** Respiros da narração, em milissegundos. */
export const PACING = {
  /** Silêncio antes da primeira frase de cada cena. */
  leadMs: 400,
  /** Pausa entre duas frases da mesma cena. */
  sentenceGapMs: 350,
  /** Silêncio depois da última frase, antes da próxima cena. */
  tailMs: 600,
  /**
   * Pausa depois de uma frase colada na seguinte: o fôlego de uma vírgula.
   * Vale também entre duas cenas, no lugar do fim de uma e do começo da outra.
   */
  tightGapMs: 120,
} as const;

/** Uma frase já gerada e conferida, com tempos relativos ao início do próprio áudio. */
export type SentenceTake = {
  readonly text: string;
  /** Caminho do áudio dentro de public/. */
  readonly file: string;
  readonly durationMs: number;
  readonly words: readonly TimedWord[];
  /** Palavras que o Whisper ouviu diferente do roteiro, após as novas tentativas. */
  readonly errors: number;
  /** O que o Whisper ouviu, para revisão quando há erros. */
  readonly heard: string;
  /**
   * A fala foi até o último instante do áudio gerado, em todas as gerações: a
   * frase não coube na duração que o modelo de voz estimou e a última palavra
   * pode ter saído cortada. O Whisper costuma completá-la e não conta o erro.
   */
  readonly cutOff: boolean;
  /** A semente da geração, quando a tomada foi escolhida de ouvido no estúdio de voz. */
  readonly seed?: number;
  /** Colada na frase seguinte: a pausa depois dela é a curta. */
  readonly tight?: boolean;
};

/** Uma frase posicionada na cena: tempos relativos ao início da cena. */
export type NarrationSentence = SentenceTake & { readonly startMs: number };

export type NarrationScene = {
  readonly id: string;
  readonly durationMs: number;
  /** Silêncio pedido pelo roteiro depois da última frase, já contado em durationMs. */
  readonly holdMs?: number;
  readonly sentences: readonly NarrationSentence[];
};

export type NarrationManifest = {
  /** "placeholder" marca narração feita com a voz provisória, que não pode ir ao ar. */
  readonly voice: "reference" | "placeholder";
  /** Volume percebido da narração inteira, em LUFS. É a referência da mixagem. */
  readonly loudnessLufs: number;
  readonly scenes: readonly NarrationScene[];
};

/** A última frase da cena está colada na primeira da cena seguinte. */
export const endsTight = (takes: readonly SentenceTake[]): boolean =>
  takes.at(-1)?.tight === true;

export const assembleScene = (
  id: string,
  takes: readonly SentenceTake[],
  holdMs = 0,
  /** A cena anterior terminou colada nesta: a fala começa sem o silêncio de abertura. */
  tightLead = false,
): NarrationScene => {
  let cursorMs: number = tightLead ? 0 : PACING.leadMs;
  let endMs = cursorMs;
  const sentences = takes.map((take) => {
    const startMs = cursorMs;
    endMs = startMs + take.durationMs;
    cursorMs = endMs + (take.tight ? PACING.tightGapMs : PACING.sentenceGapMs);
    return {
      ...take,
      startMs,
      words: take.words.map((word) => ({
        text: word.text,
        startMs: word.startMs + startMs,
        endMs: word.endMs + startMs,
      })),
    };
  });

  return {
    id,
    durationMs:
      endMs + (endsTight(takes) ? PACING.tightGapMs : PACING.tailMs) + holdMs,
    ...(holdMs > 0 ? { holdMs } : null),
    sentences,
  };
};

/** Impede renderizar um vídeo cujo áudio não corresponde mais ao roteiro. */
export const assertManifestMatchesScript = (
  script: Script,
  manifest: NarrationManifest,
  slug: string,
): void => {
  const describe = (
    scenes: readonly {
      id: string;
      sentences: readonly string[];
      holdMs?: number;
    }[],
  ) =>
    JSON.stringify(
      scenes.map((scene) => [scene.id, scene.sentences, scene.holdMs ?? 0]),
    );

  const fromScript = describe(
    script.scenes.map((scene) => ({
      id: scene.id,
      sentences: splitUtterances(scene.narration),
      holdMs: scene.holdMs,
    })),
  );
  const fromManifest = describe(
    manifest.scenes.map((scene) => ({
      id: scene.id,
      sentences: scene.sentences.map((sentence) => sentence.text),
      holdMs: scene.holdMs,
    })),
  );

  if (fromScript !== fromManifest) {
    throw new Error(
      `A narração de "${slug}" está desatualizada em relação ao roteiro. Rode: pnpm narrate ${slug}`,
    );
  }
};
