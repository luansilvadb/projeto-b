import { Easing } from "remotion";
import type { Direction } from ".";

/** Quente e próxima: fundo de vinho a ferrugem, âmbar dominante, turquesa na etiqueta. */
export const brasa: Direction = {
  palette: {
    ink: "#160808",
    dusk: "#4A1C12",
    mist: "#D9A58C",
    paper: "#FFF4E8",
    sun: { light: "#FFE89A", base: "#FFB52E", dark: "#F2701D" },
    ocean: { light: "#8FD8F2", base: "#3FA3DB", dark: "#1F5F9E" },
    leaf: { light: "#B7E88F", base: "#72BF4E", dark: "#3C8233" },
    accent: { light: "#9AF0E4", base: "#2DCFC0", dark: "#128C86" },
  },
  font: {
    family: "Fredoka",
    file: "fonts/fredoka-latin-wght-normal.woff2",
    weightRange: "300 700",
    weight: 600,
  },
  // Maior que qualquer etiqueta: as pontas ficam redondas por inteiro.
  tagRadius: 999,
  motion: {
    // Passa um pouco do tamanho final e volta: o quique leve da direção.
    enter: Easing.out(Easing.back(1.8)),
    seconds: { enter: 0.25, stagger: 0.1 },
  },
};
