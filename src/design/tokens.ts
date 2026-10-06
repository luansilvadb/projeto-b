import { Easing } from "remotion";
import { abissal as direction } from "./directions/abissal";

/**
 * Direção de arte do canal. Cores, tamanhos de texto, formas e ritmo de
 * movimento das cenas vêm daqui, para todas as cenas falarem a mesma língua
 * visual.
 */

export const palette = direction.palette;

export const typography = {
  ...direction.font,
  // Mínimos legíveis num quadro de 1920 px de largura.
  // "seal" é o selo da fonte no canto: pequeno, mas ainda legível numa tela de celular.
  size: { display: 150, headline: 110, label: 78, note: 56, seal: 32 },
} as const;

export const shape = {
  stroke: { thin: 4, regular: 8 },
  /** Margem do quadro em que texto importante não entra. */
  safeArea: { x: 144, y: 108 },
  tagRadius: direction.tagRadius,
} as const;

export const motion = {
  /** Entrada dos elementos, na curva e no tempo da direção ativa. */
  enter: direction.motion.enter,
  /** Deslocamentos e mudanças de estado que desaceleram ao chegar. */
  smooth: Easing.bezier(0.16, 1, 0.3, 1),
  seconds: direction.motion.seconds,
} as const;
