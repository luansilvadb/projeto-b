import { antelopePaint } from "../../art/Antelope";
import { antelope } from "../../videos/why-we-sleep/palette";
// A segunda referência tem luz amarela à esquerda e sombras violetas.
// A paleta pertence ao estudo, sem alterar os modos do vídeo narrado.
export const richPalette = {
  sky: ["#4725ab", "#6a2a9e", "#a23386", "#de4857", "#fd8035", "#ffc836"],
  sunshine: "#fff173",
  sun: "#fce255",
  sunEdge: "#ffe961",
  sunOrange: "#ff9e37",
  sunCoral: "#f65664",
  sunHalo: "#dc3c83",
  clouds: {
    lemon: "#ffdf50",
    gold: "#ffb135",
    orange: "#ff8538",
    coral: "#f35951",
    rose: "#df3c6e",
    purple: "#9e2c8a",
    dark: "#742887",
  },
  hills: ["#cf477e", "#b23986", "#962b86", "#762776", "#6a236d"],
  canopy: {
    edge: "#ffc140",
    light: "#812571",
    mid: "#61155e",
    dark: "#3c0e50",
    deep: "#2f0c47",
  },
  trunk: "#3a0e4e",
  distantTree: "#742575",
  nearTree: "#622066",
  ground: ["#ffab25", "#fca026", "#f57e22", "#e84e2c", "#c92e42"],
  earth: {
    bright: "#ffc035",
    gold: "#ffac28",
    orange: "#ed6b24",
    coral: "#de5034",
    red: "#ca343e",
  },
  grass: {
    dark: "#4d104e",
    shade: "#36104b",
    mid: "#992965",
    gold: "#ffb62d",
    orange: "#f37928",
  },
  bush: {
    dark: "#361045",
    mid: "#64205c",
    purple: "#8d235e",
    rose: "#ae2d55",
    coral: "#cf3b43",
    orange: "#e45c25",
  },
  shadow: "#902947",
  shadowDeep: "#722342",
  animal: antelopePaint(antelope),
} as const;

export type RichPalette = {
  readonly [
    Key in keyof typeof richPalette
  ]: (typeof richPalette)[Key] extends readonly string[]
    ? readonly string[]
    : (typeof richPalette)[Key] extends string
      ? string
      : { readonly [Color in keyof (typeof richPalette)[Key]]: string };
};
