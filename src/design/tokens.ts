import { Easing } from "remotion";

/**
 * Direção de arte do canal. Cores, tamanhos de texto, formas e ritmo de
 * movimento das cenas vêm daqui, para todas as cenas falarem a mesma língua
 * visual. Trocar a identidade do canal é editar este arquivo.
 *
 * Os valores atuais são provisórios: uma paleta neutra até a identidade
 * definitiva ser escolhida.
 */

export const palette = {
  ink: "#0B1020",
  dusk: "#27365A",
  mist: "#8FA2C4",
  paper: "#F3F5FA",
  sun: { light: "#FFE9A8", base: "#FFC857", dark: "#F29E38" },
  ocean: { light: "#7FC4F5", base: "#3D8FE0", dark: "#2459A8" },
  leaf: { light: "#9BE0A8", base: "#55B56E", dark: "#2F7F4A" },
} as const;

export const typography = {
  family: "Inter",
  weight: 700,
  // Mínimos legíveis num quadro de 1920 px de largura.
  size: { display: 150, headline: 110, label: 78, note: 56 },
} as const;

export const shape = {
  stroke: { thin: 4, regular: 8 },
  /** Margem do quadro em que texto importante não entra. */
  safeArea: { x: 144, y: 108 },
} as const;

export const motion = {
  /** Entrada firme e sem quique: o movimento padrão dos elementos. */
  enter: Easing.spring({ damping: 200 }),
  /** Deslocamentos e mudanças de estado que desaceleram ao chegar. */
  smooth: Easing.bezier(0.16, 1, 0.3, 1),
  seconds: { enter: 0.6 },
} as const;
