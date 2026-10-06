import { Easing } from "remotion";

/**
 * Direção de arte do canal, a "abissal": calma e contemplativa, fundo de mar
 * profundo, turquesa dominante, coral na etiqueta. Cores, tamanhos de texto,
 * formas e ritmo de movimento das cenas vêm daqui, para todas as cenas falarem
 * a mesma língua visual.
 */

/** Três tons da mesma cor: é o que dá volume a uma forma chapada. */
export type Ramp = {
  readonly light: string;
  readonly base: string;
  readonly dark: string;
};

export const palette = {
  /** Topo do fundo e a cor do texto dentro de etiquetas. */
  ink: "#031418",
  /** Base do fundo. */
  dusk: "#0C3A42",
  /** Linhas e marcações secundárias. */
  mist: "#7FB5B8",
  /** Texto solto e pontos de luz. */
  paper: "#EFFAF8",
  sun: { light: "#FFF0B0", base: "#FFCB52", dark: "#F08A2E" },
  ocean: { light: "#8DE3F0", base: "#2FB4D6", dark: "#146C94" },
  leaf: { light: "#A6F0C0", base: "#4FCB8A", dark: "#1F8A63" },
  /** Cor de assinatura da direção: a etiqueta padrão. */
  accent: { light: "#FFB3A6", base: "#FF7361", dark: "#C9402F" },
} as const;

export const typography = {
  family: "Outfit",
  /** Arquivo em public/, variável: um só arquivo cobre a faixa de pesos. */
  file: "fonts/outfit-latin-wght-normal.woff2",
  weightRange: "100 900",
  weight: 600,
  // Mínimos legíveis num quadro de 1920 px de largura.
  // "seal" é o selo da fonte no canto: pequeno, mas ainda legível numa tela de celular.
  size: { display: 150, headline: 110, label: 78, note: 56, seal: 32 },
} as const;

export const shape = {
  stroke: { thin: 4, regular: 8 },
  /** Margem do quadro em que texto importante não entra. */
  safeArea: { x: 144, y: 108 },
  tagRadius: 16,
} as const;

export const motion = {
  /** Entrada dos elementos: firme e sem ultrapassar o tamanho final. */
  enter: Easing.spring({ damping: 200 }),
  /** Deslocamentos e mudanças de estado que desaceleram ao chegar. */
  smooth: Easing.bezier(0.16, 1, 0.3, 1),
  seconds: {
    enter: 0.3,
    /** Intervalo entre elementos que entram em sequência. */
    stagger: 0.12,
  },
} as const;
