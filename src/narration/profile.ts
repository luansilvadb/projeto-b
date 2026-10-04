import { splitSentences, tokenize } from "./text";

/**
 * O perfil do texto narrado: as medidas que separam uma explicação dirigida a
 * quem assiste de uma lista de fatos em terceira pessoa. As faixas vêm de nove
 * vídeos do Kurzgesagt em português que o usuário indicou como referência de
 * texto (.claude/skills/diretor-criativo/referencias/narracao-kurzgesagt.md).
 */
export type NarrationProfile = {
  readonly words: number;
  readonly sentences: number;
  /** Mediana de palavras por frase. */
  readonly medianSentenceWords: number;
  /** Fração das frases com até 6 palavras. */
  readonly shortShare: number;
  /** Fração das frases com 25 palavras ou mais. */
  readonly longShare: number;
  /**
   * Palavras que põem quem assiste dentro do texto, a cada 100: "você" e "seu",
   * "nós" e "nosso", e verbos na primeira pessoa do plural ("dormimos").
   */
  readonly viewerPer100: number;
  /** Conectivos que amarram uma frase à anterior, a cada 100 palavras. */
  readonly connectivesPer100: number;
};

const VIEWER = new Set([
  "você",
  "vocês",
  "seu",
  "sua",
  "seus",
  "suas",
  "nós",
  "nosso",
  "nossa",
  "nossos",
  "nossas",
]);
// Terminam em "mos" sem ser verbo na primeira pessoa do plural.
const NOT_FIRST_PLURAL = new Set([
  "mesmos",
  "últimos",
  "próximos",
  "ótimos",
  "péssimos",
  "mínimos",
  "máximos",
  "extremos",
  "íntimos",
  "legítimos",
  "átomos",
  "ritmos",
  "termos",
  "ramos",
  "gramos",
  "cromossomos",
  "hipopótamos",
]);
// Um vídeo de fatos envolve por "nós" ("usamos", "comemos") no lugar de "você".
const includesViewer = (word: string) =>
  VIEWER.has(word) ||
  (word.endsWith("mos") &&
    !word.endsWith("ismos") &&
    !NOT_FIRST_PLURAL.has(word));
// Palavras que fazem uma frase decorrer da outra: causa, condição, contraste, consequência.
const CONNECTIVES = new Set([
  "então",
  "porque",
  "pois",
  "portanto",
  "quando",
  "se",
  "mas",
  "embora",
  "porém",
  "contudo",
  "entretanto",
  "como",
  "enquanto",
  "assim",
]);
const SHORT_WORDS = 6;
const LONG_WORDS = 25;

const median = (values: readonly number[]): number => {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 1
    ? sorted[middle]
    : (sorted[middle - 1] + sorted[middle]) / 2;
};

const lower = (word: string) => word.toLowerCase().replace(/[^\p{L}]/gu, "");

/** Mede o perfil da narração inteira de um roteiro. */
export const narrationProfile = (
  narrations: readonly string[],
): NarrationProfile => {
  const sentences = narrations.flatMap(splitSentences);
  const lengths = sentences.map((sentence) => tokenize(sentence).length);
  const words = narrations.flatMap(tokenize).map(lower);
  const per100 = (matches: (word: string) => boolean) =>
    (100 * words.filter(matches).length) / words.length;

  return {
    words: words.length,
    sentences: sentences.length,
    medianSentenceWords: median(lengths),
    shortShare:
      lengths.filter((length) => length <= SHORT_WORDS).length / lengths.length,
    longShare:
      lengths.filter((length) => length >= LONG_WORDS).length / lengths.length,
    viewerPer100: per100(includesViewer),
    connectivesPer100: per100((word) => CONNECTIVES.has(word)),
  };
};

export type ProfileCriterion = {
  readonly label: string;
  readonly value: (profile: NarrationProfile) => number;
  readonly format: (value: number) => string;
  /** Faixa aceita: os nove vídeos de referência. */
  readonly range: readonly [number, number];
};

const percent = (value: number) => `${Math.round(value * 100)}%`;
const decimal = (value: number) => value.toFixed(1).replace(".", ",");

/**
 * Referência (hábitos, sua vida, carne, paradoxo de Peto, leite, gratidão,
 * bomba, clima): 16, 14,5, 15, 13,5, 14, 14, 16 e 15,5 palavras de mediana;
 * 7%, 8%, 11%, 15%, 7%, 14%, 14% e 6% de frases curtas; 12%, 11%, 16%, 9%,
 * 12%, 10%, 20% e 22% de longas; 6,0, 6,3, 3,7, 1,3, 1,8, 4,4, 2,0 e 1,8 de
 * "você" e "nós"; 4,9, 5,2, 4,0, 4,0, 3,6, 4,3, 3,6 e 2,7 de conectivos
 * (medidos com estas listas). O primeiro roteiro do canal tinha 13, 16%, 5%,
 * 0,4 e 2,4.
 */
export const PROFILE_CRITERIA: readonly ProfileCriterion[] = [
  {
    label: "Palavras por frase (mediana)",
    value: (profile) => profile.medianSentenceWords,
    format: decimal,
    range: [13, 18],
  },
  {
    label: "Frases de até 6 palavras",
    value: (profile) => profile.shortShare,
    format: percent,
    range: [0, 0.15],
  },
  {
    label: "Frases de 25 palavras ou mais",
    value: (profile) => profile.longShare,
    format: percent,
    range: [0.06, 0.23],
  },
  {
    label: '"você" e "nós" a cada 100 palavras',
    value: (profile) => profile.viewerPer100,
    format: decimal,
    range: [1, 8],
  },
  {
    label: "Conectivos a cada 100 palavras",
    value: (profile) => profile.connectivesPer100,
    format: decimal,
    range: [2.6, 7],
  },
];

/** Os critérios que o perfil não cumpre. */
export const profileProblems = (
  profile: NarrationProfile,
): readonly ProfileCriterion[] =>
  PROFILE_CRITERIA.filter((criterion) => {
    const value = criterion.value(profile);
    return value < criterion.range[0] || value > criterion.range[1];
  });
