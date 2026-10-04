// Avaliação de uma configuração do modelo de voz: como escolher uma geração
// de cada frase e como resumir as medidas de um conjunto de gerações.

/** As medidas de uma geração de uma frase de avaliação. */
export type EvaluatedTake = {
  /** Índice da frase na lista de avaliação. */
  readonly sentence: number;
  readonly seed: number;
  /** Se a fala terminou em silêncio, isto é, não saiu cortada no fim. */
  readonly complete: boolean;
  /** Nota de naturalidade prevista pelo UTMOS, de 1 a 5. */
  readonly naturalness: number;
  /** Distância da altura mediana à da amostra, em semitons; null sem voz mensurável. */
  readonly pitchDistance: number | null;
  /** Desvio padrão da altura em torno da própria mediana, em semitons; null sem voz mensurável. */
  readonly intonation: number | null;
  /** Palavras que o Whisper ouviu diferentes do texto. */
  readonly errors: number;
};

export type EvaluationSummary = {
  readonly naturalness: number;
  readonly intonation: number;
  readonly pitchDistance: number;
  /** Fração das gerações que terminaram em silêncio. */
  readonly completeRate: number;
  /** Palavras erradas por geração. */
  readonly errors: number;
};

/** Até onde a altura de uma geração pode se afastar da amostra para concorrer por naturalidade. */
export const PITCH_TOLERANCE_SEMITONES = 1;

const mean = (values: readonly number[]) =>
  values.reduce((sum, value) => sum + value, 0) / values.length;

const measured = (values: readonly (number | null)[]) =>
  values.filter((value): value is number => value !== null);

/** Sem voz mensurável, uma geração conta como a mais distante da amostra. */
const distance = (take: EvaluatedTake) => take.pitchDistance ?? Infinity;

/** Uma geração cortada no fim só entra na escolha se todas saíram assim. */
const candidates = (takes: readonly EvaluatedTake[]) => {
  const complete = takes.filter((take) => take.complete);
  return complete.length > 0 ? complete : takes;
};

/** A geração de altura mais próxima da amostra: a tomada pela qual cada configuração é julgada. */
export const closestToReference = (
  takes: readonly EvaluatedTake[],
): EvaluatedTake =>
  candidates(takes).reduce((best, take) =>
    distance(take) < distance(best) ? take : best,
  );

/**
 * A escolha alternativa: a geração mais natural entre as de altura próxima da
 * amostra. Sem nenhuma dentro da tolerância, vale a escolha por altura.
 */
export const mostNatural = (takes: readonly EvaluatedTake[]): EvaluatedTake => {
  const near = candidates(takes).filter(
    (take) => distance(take) <= PITCH_TOLERANCE_SEMITONES,
  );
  if (near.length === 0) {
    return closestToReference(takes);
  }
  return near.reduce((best, take) =>
    take.naturalness > best.naturalness ? take : best,
  );
};

/** A geração escolhida de cada frase, na ordem das frases. */
export const chooseTakes = (
  takes: readonly EvaluatedTake[],
  choose: (takes: readonly EvaluatedTake[]) => EvaluatedTake,
): EvaluatedTake[] => {
  const sentences = [...new Set(takes.map((take) => take.sentence))];
  return sentences
    .sort((a, b) => a - b)
    .map((sentence) =>
      choose(takes.filter((take) => take.sentence === sentence)),
    );
};

export const summarize = (
  takes: readonly EvaluatedTake[],
): EvaluationSummary => ({
  naturalness: mean(takes.map((take) => take.naturalness)),
  intonation: mean(measured(takes.map((take) => take.intonation))),
  pitchDistance: mean(measured(takes.map((take) => take.pitchDistance))),
  completeRate: takes.filter((take) => take.complete).length / takes.length,
  errors: mean(takes.map((take) => take.errors)),
});
