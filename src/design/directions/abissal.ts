import { Easing } from "remotion";
import type { Direction } from ".";

/** Calma e contemplativa: fundo de mar profundo, turquesa dominante, coral na etiqueta. */
export const abissal: Direction = {
  palette: {
    ink: "#031418",
    dusk: "#0C3A42",
    mist: "#7FB5B8",
    paper: "#EFFAF8",
    sun: { light: "#FFF0B0", base: "#FFCB52", dark: "#F08A2E" },
    ocean: { light: "#8DE3F0", base: "#2FB4D6", dark: "#146C94" },
    leaf: { light: "#A6F0C0", base: "#4FCB8A", dark: "#1F8A63" },
    accent: { light: "#FFB3A6", base: "#FF7361", dark: "#C9402F" },
  },
  font: {
    family: "Outfit",
    file: "fonts/outfit-latin-wght-normal.woff2",
    weightRange: "100 900",
    weight: 600,
  },
  tagRadius: 16,
  motion: {
    // Firme e sem ultrapassar o tamanho final.
    enter: Easing.spring({ damping: 200 }),
    seconds: { enter: 0.3, stagger: 0.12 },
  },
};
