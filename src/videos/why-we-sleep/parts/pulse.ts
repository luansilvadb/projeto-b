import { motion } from "../../../design/tokens";

// Ritmos medidos na Cassiopea: de dia e durante o repouso noturno.
export const PULSES_AWAKE = 58;
export const PULSES_ASLEEP = 39;

export type PulseRhythm = {
  /** Quadro do plano a partir do qual o ritmo vale. */
  readonly from: number;
  readonly perMinute: number;
};

/** Um ritmo só, do começo ao fim do plano. */
export const steady = (perMinute: number): readonly PulseRhythm[] => [
  { from: 0, perMinute },
];

/**
 * Pulsos completos desde o começo do plano, somando cada trecho no seu ritmo.
 * Acumular, em vez de recalcular pelo ritmo atual, evita que o sino dê um
 * salto no quadro em que o ritmo muda.
 */
export const pulseCycles = (
  frame: number,
  fps: number,
  rhythm: readonly PulseRhythm[],
): number =>
  rhythm.reduce((cycles, stretch, index) => {
    const end = rhythm[index + 1]?.from ?? Infinity;
    const frames = Math.max(0, Math.min(frame, end) - stretch.from);
    return cycles + ((frames / fps) * stretch.perMinute) / 60;
  }, 0);

/** O ritmo que vale num quadro do plano. */
export const pulseRate = (
  frame: number,
  rhythm: readonly PulseRhythm[],
): number =>
  rhythm.reduce(
    (rate, stretch) => (frame >= stretch.from ? stretch.perMinute : rate),
    rhythm[0].perMinute,
  );

/**
 * O quadro do plano em que a contagem de pulsos chega a `cycles`: o inverso de
 * `pulseCycles`. É o que diz quando um anel nasceu (a idade dele não muda
 * quando o ritmo muda) e em que quadro o sino volta a estar relaxado. Devolve
 * `Infinity` quando o ritmo para antes de a contagem chegar lá.
 */
export const pulseFrame = (
  cycles: number,
  fps: number,
  rhythm: readonly PulseRhythm[],
): number => {
  let counted = 0;
  for (const [index, stretch] of rhythm.entries()) {
    const end = rhythm[index + 1]?.from ?? Infinity;
    const perFrame = stretch.perMinute / 60 / fps;
    const span = perFrame === 0 ? 0 : (end - stretch.from) * perFrame;
    if (perFrame > 0 && cycles <= counted + span) {
      return stretch.from + Math.max(0, cycles - counted) / perFrame;
    }
    counted += span;
  }
  return Infinity;
};

/**
 * Quantos pulsos somar a `pulseCycles` para o último trecho do ritmo cair na
 * contagem de quem pulsa nesse ritmo desde o quadro 0. Com o relógio do vídeo
 * no lugar do do plano, é o que faz o sino continuar no mesmo ponto do pulso
 * quando a cena seguinte começa já no ritmo em que esta terminou.
 */
export const settledPhase = (
  fps: number,
  rhythm: readonly PulseRhythm[],
): number => {
  const last = rhythm[rhythm.length - 1];
  return (
    ((last.from / fps) * last.perMinute) / 60 -
    pulseCycles(last.from, fps, rhythm)
  );
};

// Fração do ciclo gasta contraindo; o resto é o relaxamento, mais lento.
const CONTRACTION = 0.3;

/** Contração do sino, de 0 a 1: fecha depressa e relaxa devagar, como uma água-viva de verdade. */
export const pulseShape = (cycles: number): number => {
  // A contagem pode ser negativa, antes de uma âncora: o resto precisa ficar entre 0 e 1.
  const position = ((cycles % 1) + 1) % 1;
  return position < CONTRACTION
    ? motion.smooth(position / CONTRACTION)
    : 1 - motion.smooth((position - CONTRACTION) / (1 - CONTRACTION));
};
