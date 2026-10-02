import { Easing } from "remotion";
import type { Direction } from ".";

/** Precisa e enérgica: fundo de marinho a cobalto, azul elétrico dominante, amarelo na etiqueta. */
export const cobalto: Direction = {
  palette: {
    ink: "#050A22",
    dusk: "#142C8C",
    mist: "#8EA8F0",
    paper: "#F2F5FF",
    sun: { light: "#FFF3A0", base: "#FFD23D", dark: "#F59A1F" },
    ocean: { light: "#8CC2FF", base: "#3D8BFF", dark: "#1B49C2" },
    leaf: { light: "#9DF2B0", base: "#45D07A", dark: "#1E8F58" },
    accent: { light: "#FFF6A8", base: "#FFE033", dark: "#E0A800" },
  },
  font: {
    family: "Space Grotesk",
    file: "fonts/space-grotesk-latin-wght-normal.woff2",
    weightRange: "300 700",
    weight: 700,
  },
  tagRadius: 6,
  motion: {
    // Seca: chega rápido e para sem ultrapassar.
    enter: Easing.out(Easing.cubic),
    seconds: { enter: 0.2, stagger: 0.07 },
  },
};
