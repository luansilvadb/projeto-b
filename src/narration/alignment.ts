import { normalizeWord, tokenize } from "./text";

export type TimedWord = {
  readonly text: string;
  readonly startMs: number;
  readonly endMs: number;
};

type Alignment = {
  /** As palavras do roteiro, cada uma com o momento em que é falada. */
  readonly words: readonly TimedWord[];
  /** Distância de edição, em palavras, entre o roteiro e o que foi ouvido. */
  readonly errors: number;
};

type Span = { startMs: number; endMs: number };

/** O Whisper devolve "guarda-chuva" como uma palavra só; o roteiro conta duas. */
const splitHeardWord = (word: TimedWord): TimedWord[] => {
  const parts = tokenize(word.text);
  const totalLength = parts.reduce((sum, part) => sum + part.length, 0);
  const durationMs = word.endMs - word.startMs;

  let consumed = 0;
  return parts.map((part) => {
    const startMs = word.startMs + (durationMs * consumed) / totalLength;
    consumed += part.length;
    const endMs = word.startMs + (durationMs * consumed) / totalLength;
    return { text: part, startMs, endMs };
  });
};

const editDistances = (
  expected: readonly string[],
  heard: readonly string[],
): number[][] => {
  const distances = Array.from({ length: expected.length + 1 }, (_, row) =>
    Array.from({ length: heard.length + 1 }, (_, column) =>
      row === 0 ? column : row,
    ),
  );
  for (let row = 1; row <= expected.length; row++) {
    distances[row][0] = row;
    for (let column = 1; column <= heard.length; column++) {
      const substitution = expected[row - 1] === heard[column - 1] ? 0 : 1;
      distances[row][column] = Math.min(
        distances[row - 1][column - 1] + substitution,
        distances[row - 1][column] + 1,
        distances[row][column - 1] + 1,
      );
    }
  }
  return distances;
};

/** Refaz o caminho da distância de edição: cada palavra do roteiro recebe a ouvida correspondente. */
const pairWithHeard = (
  distances: readonly (readonly number[])[],
  expected: readonly string[],
  heard: readonly string[],
): (number | undefined)[] => {
  const pairs: (number | undefined)[] = new Array(expected.length).fill(
    undefined,
  );
  let row = expected.length;
  let column = heard.length;
  while (row > 0 && column > 0) {
    const substitution = expected[row - 1] === heard[column - 1] ? 0 : 1;
    if (
      distances[row][column] ===
      distances[row - 1][column - 1] + substitution
    ) {
      pairs[row - 1] = column - 1;
      row--;
      column--;
    } else if (distances[row][column] === distances[row - 1][column] + 1) {
      row--;
    } else {
      column--;
    }
  }
  return pairs;
};

/** Palavras que o Whisper não ouviu dividem igualmente o intervalo entre as vizinhas. */
const fillUnheard = (
  spans: (Span | undefined)[],
  durationMs: number,
): Span[] => {
  const filled: Span[] = [];
  let index = 0;
  while (index < spans.length) {
    const known = spans[index];
    if (known) {
      filled.push(known);
      index++;
      continue;
    }

    let next = index;
    while (next < spans.length && !spans[next]) {
      next++;
    }
    const gapStart = filled.at(-1)?.endMs ?? 0;
    const gapEnd = spans[next]?.startMs ?? durationMs;
    const step = (gapEnd - gapStart) / (next - index);
    for (let offset = 0; offset < next - index; offset++) {
      filled.push({
        startMs: gapStart + step * offset,
        endMs: gapStart + step * (offset + 1),
      });
    }
    index = next;
  }
  return filled;
};

/**
 * Compara a frase do roteiro com a transcrição do áudio gerado.
 * Serve a dois propósitos: medir se o modelo de voz falou o que devia e
 * dar a cada palavra do roteiro o momento em que ela soa.
 */
export const alignWords = (
  expectedText: string,
  heardWords: readonly TimedWord[],
  durationMs: number,
): Alignment => {
  const expected = tokenize(expectedText);
  const heard = heardWords.flatMap(splitHeardWord);
  const expectedKeys = expected.map(normalizeWord);
  const heardKeys = heard.map((word) => normalizeWord(word.text));

  const distances = editDistances(expectedKeys, heardKeys);
  const pairs = pairWithHeard(distances, expectedKeys, heardKeys);
  const spans = fillUnheard(
    pairs.map((heardIndex) =>
      heardIndex === undefined ? undefined : heard[heardIndex],
    ),
    durationMs,
  );

  return {
    words: expected.map((text, index) => ({
      text,
      startMs: Math.round(spans[index].startMs),
      endMs: Math.round(spans[index].endMs),
    })),
    errors: distances[expected.length][heard.length],
  };
};
