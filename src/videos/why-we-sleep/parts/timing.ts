import { Easing, interpolate } from "remotion";
import { motion } from "../../../design/tokens";
import {
  CUE_LEAD_FRAMES,
  cueFrame,
  type SceneTimeline,
} from "../../../narration/timeline";

const progress = (
  frame: number,
  at: number,
  frames: number,
  easing: (t: number) => number,
): number =>
  interpolate(frame, [at, at + frames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing,
  });

/**
 * Progresso, de 0 a 1, de uma mudança que começa em `at` e dura `frames` e
 * acelera e desacelera como um corpo com peso: câmera, porta, braço, maré.
 */
export const ramp = (frame: number, at: number, frames: number): number =>
  progress(frame, at, frames, Easing.inOut(Easing.cubic));

/** Mudança que chega depressa e assenta: quem para de nadar, o que é puxado de uma vez. */
export const settle = (frame: number, at: number, frames: number): number =>
  progress(frame, at, frames, motion.smooth);

/** Mudança a velocidade constante: uma sombra que passa, uma moeda no ar. */
export const linear = (frame: number, at: number, frames: number): number =>
  progress(frame, at, frames, Easing.linear);

/** Queda: começa parada e ganha velocidade. */
export const drop = (frame: number, at: number, frames: number): number =>
  progress(frame, at, frames, Easing.in(Easing.quad));

/** O valor a caminho de `from` para `to`, com `t` de 0 a 1. */
export const mix = (from: number, to: number, t: number): number =>
  from + (to - from) * t;

/** Quadro da cena em que um elemento entra para acompanhar uma palavra da narração. */
export const cue = (
  scene: SceneTimeline,
  word: string,
  occurrence = 1,
): number => Math.max(0, cueFrame(scene, word, occurrence) - CUE_LEAD_FRAMES);

/** Quadro de entrada para o que já está na tela quando a cena começa. */
export const ALREADY_SHOWN = -1000;

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
