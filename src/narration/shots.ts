import { normalizeWord } from "./text";

/** O que situa um plano na narração da cena. */
export type ShotCue = {
  /**
   * Palavra da narração em que o plano começa. O primeiro plano não leva
   * deixa: começa com a cena.
   */
  readonly cue?: string;
  /** Qual ocorrência da palavra, quando ela se repete na cena. */
  readonly occurrence?: number;
};

type Word = {
  readonly key: string;
  /** Posição da palavra na narração, em caracteres. */
  readonly offset: number;
};

/** As palavras da narração, na mesma divisão de `tokenize`, com a posição de cada uma. */
const narrationWords = (narration: string): Word[] =>
  [...narration.matchAll(/[^\s\-–—]+/g)]
    .map((match) => ({ key: normalizeWord(match[0]), offset: match.index }))
    .filter((word) => word.key !== "");

const startWords = (
  words: readonly Word[],
  shots: readonly ShotCue[],
): (number | undefined)[] =>
  shots.map((shot, index) => {
    if (index === 0) {
      return 0;
    }
    const key = normalizeWord(shot.cue ?? "");
    const matches = words.flatMap((word, position) =>
      word.key === key ? [position] : [],
    );
    return matches[(shot.occurrence ?? 1) - 1];
  });

/**
 * Índice, entre as palavras da narração, da palavra em que cada plano começa.
 * `undefined` marca uma deixa que não está na narração.
 */
export const shotStartWords = (
  narration: string,
  shots: readonly ShotCue[],
): (number | undefined)[] => startWords(narrationWords(narration), shots);

/**
 * Fração da narração da cena que cada plano cobre, medida em caracteres.
 * Serve para estimar a duração de um plano antes de a narração existir.
 */
export const shotShares = (
  narration: string,
  shots: readonly ShotCue[],
): number[] => {
  const words = narrationWords(narration);
  const offsets = startWords(words, shots).map((position, index) => {
    const word = position === undefined ? undefined : words[position];
    if (!word) {
      throw new Error(
        `A deixa do plano ${index + 1} não está na narração da cena.`,
      );
    }
    return index === 0 ? 0 : word.offset;
  });

  return offsets.map(
    (offset, index) =>
      ((offsets[index + 1] ?? narration.length) - offset) / narration.length,
  );
};
