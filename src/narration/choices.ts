import { splitUtterances } from "./text";

/**
 * As escolhas de voz de um vídeo, feitas de ouvido no estúdio de voz
 * (`pnpm voice <vídeo>`) e guardadas em src/videos/<vídeo>/voice.json. As
 * chaves são o texto exato de cada frase: mudou a frase, a escolha deixa de
 * valer, porque a tomada era de outro texto.
 */
export type VoiceChoices = {
  /** A semente da tomada que o usuário escolheu à mão para a frase. */
  readonly takes: Readonly<Record<string, number>>;
  /** Frases coladas na seguinte: a pausa depois delas é a curta. */
  readonly tight: readonly string[];
  /**
   * As sementes das tomadas que o usuário ouviu e rejeitou, por frase. A
   * escolha automática as deixa de fora, e elas são o registro de onde a
   * regra de escolha errou. A tomada antiga, sem semente guardada, conta
   * como semente 0.
   */
  readonly rejected: Readonly<Record<string, readonly number[]>>;
};

export const NO_CHOICES: VoiceChoices = { takes: {}, tight: [], rejected: {} };

/** Depois de tantas tomadas rejeitadas, o problema é do texto: a frase pede reescrita. */
export const REWRITE_AFTER_REJECTIONS = 3;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

/** Lê o conteúdo de voice.json, recusando o que não tem a forma esperada. */
export const parseChoices = (value: unknown): VoiceChoices => {
  if (!isRecord(value)) {
    throw new Error("voice.json precisa ser um objeto");
  }
  const { takes = {}, tight = [], rejected = {} } = value;
  if (
    !isRecord(takes) ||
    !Object.values(takes).every((seed) => Number.isInteger(seed))
  ) {
    throw new Error(
      'voice.json: "takes" liga cada frase a uma semente inteira',
    );
  }
  if (
    !Array.isArray(tight) ||
    !tight.every((text) => typeof text === "string")
  ) {
    throw new Error('voice.json: "tight" é a lista das frases coladas');
  }
  if (
    !isRecord(rejected) ||
    !Object.values(rejected).every(
      (seeds) => Array.isArray(seeds) && seeds.every(Number.isInteger),
    )
  ) {
    throw new Error(
      'voice.json: "rejected" liga cada frase às sementes rejeitadas',
    );
  }
  return {
    takes: takes as Record<string, number>,
    tight,
    rejected: rejected as Record<string, number[]>,
  };
};

export const chooseTake = (
  choices: VoiceChoices,
  text: string,
  seed: number,
): VoiceChoices => ({
  ...choices,
  takes: { ...choices.takes, [text]: seed },
  // Escolher à mão uma tomada antes rejeitada desfaz a rejeição.
  rejected: {
    ...choices.rejected,
    [text]: (choices.rejected[text] ?? []).filter((other) => other !== seed),
  },
});

/** Rejeita uma tomada da frase; se era a escolhida à mão, a escolha cai junto. */
export const rejectTake = (
  choices: VoiceChoices,
  text: string,
  seed: number,
): VoiceChoices => {
  const takes = Object.fromEntries(
    Object.entries(choices.takes).filter(
      ([chosenText, chosenSeed]) => chosenText !== text || chosenSeed !== seed,
    ),
  );
  const seeds = choices.rejected[text] ?? [];
  return {
    ...choices,
    takes,
    rejected: {
      ...choices.rejected,
      [text]: seeds.includes(seed) ? seeds : [...seeds, seed],
    },
  };
};

export const setTight = (
  choices: VoiceChoices,
  text: string,
  tight: boolean,
): VoiceChoices => {
  const others = choices.tight.filter((other) => other !== text);
  return { ...choices, tight: tight ? [...others, text] : others };
};

/**
 * A narração de uma cena com uma das frases trocada. O texto novo pode ter
 * mais de uma frase, ou terminar em vírgula e se juntar à seguinte: a divisão
 * em frases é refeita depois, sobre a narração inteira.
 */
export const replaceSentence = (
  narration: string,
  index: number,
  text: string,
): string => {
  const sentences = splitUtterances(narration);
  if (index < 0 || index >= sentences.length) {
    throw new Error(`a cena não tem a frase ${index + 1}`);
  }
  return sentences
    .map((sentence, position) => (position === index ? text.trim() : sentence))
    .filter((sentence) => sentence !== "")
    .join(" ");
};
