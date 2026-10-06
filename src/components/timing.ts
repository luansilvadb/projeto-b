import { Easing, interpolate } from "remotion";
import { motion } from "../design/tokens";
import {
  CUE_LEAD_FRAMES,
  cueFrame,
  type SceneTimeline,
} from "../narration/timeline";

/** As opções do `interpolate` que seguram o valor nas pontas do trecho. */
export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** O valor preso entre 0 e 1. */
export const clamp01 = (value: number): number =>
  Math.min(1, Math.max(0, value));

const progress = (
  frame: number,
  at: number,
  frames: number,
  easing: (t: number) => number,
): number =>
  interpolate(frame, [at, at + frames], [0, 1], { ...clamp, easing });

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

/** Um tremor que morre: `turns` idas e voltas em `frames` quadros, a partir de `at`. */
export const shake = (
  frame: number,
  at: number,
  frames: number,
  degrees: number,
  turns: number,
): number => {
  const t = (frame - at) / frames;
  return t <= 0 || t >= 1
    ? 0
    : degrees * (1 - t) * Math.sin(t * turns * Math.PI * 2);
};
