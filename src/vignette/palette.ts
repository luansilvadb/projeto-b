import type { CassiopeaColors } from "../art/Cassiopea";
import type { FrigatebirdColors } from "../art/Frigatebird";

/**
 * As cores da vinheta do canal, mundo por mundo. A vinheta é a mesma em todo
 * vídeo, por isso tem paleta própria, mais saturada que a dos vídeos, e não
 * depende da de nenhum deles.
 */

/** Dentro de uma célula: magenta e violeta, com as organelas em cores quentes e ciano. */
export const cell = {
  outside: ["#2A0A52", "#150533"],
  neighbour: "#4A1173",
  cytoplasm: ["#A3197E", "#6E1280"],
  cytoplasmLight: "#C92C8F",
  membrane: "#FF4F8B",
  membraneLight: "#FF9CC0",
  protein: "#FFC83D",
  tubule: "#FF8FC7",
  nucleus: "#4B1FC4",
  nucleusEdge: "#8E5BFF",
  chromatin: "#B79BFF",
  nucleolus: "#FFC83D",
  nucleolusLight: "#FFE08A",
  er: "#FF6FB5",
  erShade: "#D93E94",
  golgi: "#FF8A3D",
  golgiLight: "#FFC16B",
  mito: "#FF7A3D",
  mitoLight: "#FFD15C",
  vesicle: "#3FE0D0",
  vesicleLight: "#C6FFF6",
  lysosome: "#FFD15C",
  lysosomeDot: "#FF7A3D",
  dot: "#FFE9F4",
  near: "#1D0640",
} as const;

/** O fundo da lagoa: turquesa que escurece para o fundo, areia clara e corais de cores vivas. */
export const lagoon = {
  water: ["#35D6D0", "#0F9CC4", "#0A5C96", "#0A3A72"],
  ray: "#B8FFF4",
  far: "#0E7DB0",
  mid: "#0A5E94",
  rock: "#0B4A7C",
  rockLight: "#1670A8",
  sand: ["#FBE9AE", "#EBC977"],
  sandShade: "#D9AE5A",
  grass: ["#2FD98B", "#12A873", "#0B7F62"],
  coral: ["#FF5D73", "#FF9E3D", "#B46BFF", "#FF7FC1", "#FFD15C"],
  coralShade: "#C93A5B",
  fish: ["#FFC83D", "#FF7A3D", "#FFFFFF"],
  school: "#BFF7FF",
  bubble: "#E6FFFB",
  star: "#FF7A3D",
  shell: "#FFF4D6",
  near: "#062452",
} as const;

/** A água-viva da lagoa da vinheta: coral, com os cachos claros. */
export const jellyfish: CassiopeaColors = {
  dome: "#F0503F",
  domeShade: "#B4324E",
  bounce: "#FFD9A8",
  rim: "#FF7361",
  rimBack: "#E8604F",
  marks: "#FFF4EC",
  inner: "#F25F4C",
  innerLight: "#FF8E7B",
  canal: "#FFC4B8",
  core: "#FFB3A6",
  stalk: "#FF8B7B",
  stalkShade: "#E5596B",
  stalkBack: "#D96F78",
  stalkBackShade: "#B4567A",
  frills: ["#FFF0B0", "#FFE08A", "#FFF7D6", "#4FCB8A", "#FFFFFF"],
  frillsBack: ["#E6E0B4", "#D9CB8C", "#EDE7C4", "#5FB79B", "#F7F3DC"],
  paddle: ["#5B63D8", "#A9B2FF"],
  rimLight: "#FFFFFF",
  glow: null,
  nerves: "#8DE3F0",
};

/** A costa vista do alto: mar turquesa, baixios claros, ilhas de mangue com praia. */
export const coast = {
  sea: ["#1CC8CF", "#0E86B8", "#0A4F8F"],
  shallow: ["#5EE6DA", "#98F4E4", "#D2FFF2"],
  sand: "#FBE9AE",
  sandShade: "#E8C877",
  grass: "#3CCB7A",
  canopy: ["#1FA366", "#157F58", "#2FD98B"],
  canopyShade: "#0C5E46",
  reef: "#FF8FA3",
  foam: "#FFFFFF",
  cloud: "#FFFFFF",
  cloudShade: "#DDF3FA",
  shadow: "#073B6E",
  boat: "#FF5D73",
  boatDeck: "#FFF4D6",
} as const;

/** As aves que cruzam a costa, vistas de cima. */
export const bird: FrigatebirdColors = {
  body: "#232A4D",
  shade: "#161B38",
  light: "#4A5486",
  breast: "#F2F5FA",
  beak: "#8E9BC0",
  eye: "#FFFFFF",
  pupil: "#0B0E22",
};

/** O planeta no espaço: azul profundo, continentes verdes, e o sol amarelo de um lado. */
export const space = {
  sky: ["#0A0A38", "#1A0E57"],
  nebula: ["#3A1A8C", "#7A1E8C", "#1E3FA8"],
  sun: "#FFC83D",
  sunLight: "#FFE9A8",
  ocean: "#1E7BE0",
  oceanLight: "#4FA8FF",
  land: "#35C973",
  landLight: "#8BE86B",
  ice: "#F2FBFF",
  cloud: "#FFFFFF",
  shade: "#05052B",
  city: "#FFD15C",
  atmosphere: "#5E8BFF",
  moon: "#D5D0EA",
  moonShade: "#A39CC8",
  panel: "#3FE0D0",
  hull: "#F2F5FA",
  mark: "#5EE6DA",
  text: "#FFFFFF",
  logo: {
    white: ["#FFFFFF", "#EAF6FF", "#BCD9EB"],
    gold: ["#FFF42E", "#FFD21E", "#FF8D00"],
    outline: "#06183F",
    extrusion: "#0E3B82",
  },
} as const;
