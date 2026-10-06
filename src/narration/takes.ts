import type { SentenceTake } from "./manifest";

/**
 * A escolha da tomada de cada frase. O modelo de voz só recebe texto, e a
 * entonação muda de uma geração para outra: cada frase é gerada algumas vezes
 * e fica a tomada sem defeito cuja curva do fim serve ao lugar da frase.
 *
 * Os limites de curva abaixo ainda não foram calibrados contra o ouvido do
 * usuário: saíram do que a fala costuma fazer (a afirmação fecha caindo, a
 * frase que continua fica em suspenso). As tomadas que ele rejeita no estúdio
 * de voz ficam em voice.json e servem para conferir e ajustar estes números.
 */

/** O que foi medido numa tomada, além do que o manifesto guarda. */
export type MeasuredTake = SentenceTake & {
  readonly seed: number;
  /** Altura mediana da tomada em relação à amostra de voz, em semitons. */
  readonly pitchOffset: number | null;
  /** Altura do fim da frase em relação à mediana da própria frase, em semitons. */
  readonly ending: number | null;
};

/** Como a frase deve terminar: fechando, em suspenso, ou tanto faz. */
type Ending = "fall" | "sustain" | "any";

/** Uma afirmação que fecha termina pelo menos isto abaixo da mediana, em semitons. */
const FALL_AT = -2;
/** Uma frase em suspenso não termina mais baixo que isto. */
const SUSTAIN_AT = -1;
/** Uma palavra errada ou o fim cortado pesam mais que qualquer curva. */
const DEFECT_PENALTY = 20;
/**
 * A curva do fim manda mais que a altura. Na primeira narração com esta regra,
 * a altura das tomadas variou de 10 semitons abaixo a 5 acima da amostra
 * (mediana de 4 abaixo): com os dois pesos iguais, a altura decidia sozinha e
 * frases com dois-pontos ficavam com a tomada que caía.
 */
const ENDING_WEIGHT = 2;
const PITCH_WEIGHT = 0.5;
/** Sem voz mensurável, a tomada vale como a pior curva aceitável. */
const UNMEASURED_PENALTY = 6;

/**
 * A curva que o fim da frase pede. A frase colada na seguinte, a que termina
 * em reticências e a que anuncia algo com dois-pontos continuam; a pergunta
 * tanto sobe quanto desce em português, conforme o tipo; o resto fecha.
 */
export const wantedEnding = (text: string, tight: boolean): Ending => {
  if (tight || /[…:]["”’]*$/.test(text.trim())) {
    return "sustain";
  }
  return /\?["”’]*$/.test(text.trim()) ? "any" : "fall";
};

const endingPenalty = (ending: number | null, wanted: Ending): number => {
  if (wanted === "any") {
    return 0;
  }
  if (ending === null) {
    return UNMEASURED_PENALTY;
  }
  return wanted === "fall"
    ? Math.max(0, ending - FALL_AT)
    : Math.max(0, SUSTAIN_AT - ending);
};

/** Quanto uma tomada se afasta do que a frase pede: quanto menor, melhor. */
export const takePenalty = (take: MeasuredTake, wanted: Ending): number =>
  DEFECT_PENALTY * (take.errors + (take.cutOff ? 1 : 0)) +
  ENDING_WEIGHT * endingPenalty(take.ending, wanted) +
  PITCH_WEIGHT *
    (take.pitchOffset === null
      ? UNMEASURED_PENALTY
      : Math.abs(take.pitchOffset));

/** Palavras diferentes do roteiro, mais o fim cortado. */
export const takeDefects = (take: SentenceTake): number =>
  take.errors + (take.cutOff ? 1 : 0);

/** A melhor tomada entre as que o usuário não rejeitou; nenhuma, se todas foram rejeitadas. */
export const bestTake = (
  takes: readonly MeasuredTake[],
  wanted: Ending,
  rejected: readonly number[] = [],
): MeasuredTake | undefined =>
  takes
    .filter((take) => !rejected.includes(take.seed))
    .reduce<
      MeasuredTake | undefined
    >((best, take) => (!best || takePenalty(take, wanted) < takePenalty(best, wanted) ? take : best), undefined);
