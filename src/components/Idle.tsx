import { random } from "remotion";

/**
 * A pausa viva: o movimento de quem não está agindo. Os ciclos recebem o
 * tempo em segundos e uma fase, para o que é independente não se mover como
 * cópia do vizinho.
 */

/** Onda de -1 a 1 com o período pedido; `phase` desloca o começo do ciclo. */
export const wave = (seconds: number, period: number, phase = 0): number =>
  Math.sin((seconds / period + phase) * Math.PI * 2);

/** Fase sorteada por semente, de 0 a 1, para cada vizinho ter a sua. */
export const phaseOf = (seed: string): number => random(`phase-${seed}`);

type BreathOptions = {
  /** Quanto o tronco sobe no auge, em fração da altura. */
  readonly amplitude?: number;
  readonly period?: number;
};

/**
 * A respiração de quem está em pé: a escala vertical da figura num instante,
 * em volta de 1. Quem dorme respira mais devagar e mais fundo.
 */
export const breath = (
  seconds: number,
  seed: string,
  { amplitude = 0.02, period = 3.5 }: BreathOptions = {},
): number => 1 + amplitude * wave(seconds, period, phaseOf(seed));

type BlinkOptions = {
  /** Menor e maior intervalo entre duas piscadas, em segundos. */
  readonly every?: readonly [number, number];
  /** Quanto dura uma piscada inteira, fechar e abrir. */
  readonly seconds?: number;
};

/**
 * Quanto a pálpebra está fechada, de 0 a 1, num instante: zero quase sempre,
 * e um fecha-abre rápido a intervalos sorteados pela semente.
 */
export const blink = (
  seconds: number,
  seed: string,
  { every = [2, 5], seconds: length = 0.13 }: BlinkOptions = {},
): number => {
  // Caminha pelas piscadas, uma a uma, até chegar ao instante pedido.
  let at = every[0] * (0.5 + random(`blink-${seed}-0`));
  let index = 1;
  while (at + length < seconds) {
    at += every[0] + (every[1] - every[0]) * random(`blink-${seed}-${index}`);
    index++;
  }
  if (seconds < at) {
    return 0;
  }
  // Fecha na primeira metade, abre na segunda.
  const progress = (seconds - at) / length;
  return progress < 0.5 ? progress * 2 : 2 - progress * 2;
};
