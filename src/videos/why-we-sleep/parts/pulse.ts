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

// Fração do ciclo gasta contraindo; o resto é o relaxamento, mais lento.
const CONTRACTION = 0.3;

/** Contração do sino, de 0 a 1: fecha depressa e relaxa devagar, como uma água-viva de verdade. */
export const pulseShape = (cycles: number): number => {
  const position = cycles % 1;
  return position < CONTRACTION
    ? motion.smooth(position / CONTRACTION)
    : 1 - motion.smooth((position - CONTRACTION) / (1 - CONTRACTION));
};
