import type { RichPalette } from "./richPalette";
import { antelopePaint } from "../../art/Antelope";
import { antelopeNight } from "../../videos/why-we-sleep/palette";

// A lua ilumina as bordas, enquanto o pelo mantém sua cor quente para separar
// o personagem dos azuis do ambiente, como na referência noturna do usuário.
export const nightPalette: RichPalette = {
  sky: ["#040859", "#08095b", "#0d1070", "#1f1d85", "#5b3ab2", "#9452cd"],
  sunshine: "#e48fdf",
  sun: "#fff2c7",
  sunEdge: "#fff9df",
  sunOrange: "#c5bded",
  sunCoral: "#7973d9",
  sunHalo: "#6457db",
  clouds: {
    lemon: "#dea0ee",
    gold: "#af71e4",
    orange: "#7951d9",
    coral: "#6344c7",
    rose: "#3e2db1",
    purple: "#191570",
    dark: "#0b084a",
  },
  hills: ["#342cab", "#272494", "#24218b", "#14146f", "#11135f"],
  canopy: {
    edge: "#90beff",
    light: "#171674",
    mid: "#0d0b57",
    dark: "#040431",
    deep: "#03032b",
  },
  trunk: "#03032b",
  distantTree: "#101052",
  nearTree: "#0d0d4b",
  ground: ["#687ce5", "#5264d5", "#3947b2", "#262792", "#171473"],
  earth: {
    bright: "#93a0ff",
    gold: "#6b81ed",
    orange: "#3d4eb6",
    coral: "#27288b",
    red: "#171473",
  },
  grass: {
    dark: "#08073d",
    shade: "#05042d",
    mid: "#302687",
    gold: "#89a8fc",
    orange: "#546ace",
  },
  bush: {
    dark: "#05042e",
    mid: "#151051",
    purple: "#1e196b",
    rose: "#272484",
    coral: "#3c39a4",
    orange: "#363ca1",
  },
  shadow: "#12134f",
  shadowDeep: "#09093a",
  animal: antelopePaint(antelopeNight),
};

export const nightSkyPalette = {
  stars: "#f9f4ff",
  blueStars: "#749df5",
  faintStars: "#596ace",
  moonCrater: "#d8bda9",
  moonGlow: "#fff4d3",
  cloudEdge: "#cdacff",
} as const;
