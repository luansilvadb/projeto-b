import type { CassiopeaColors } from "../../art/Cassiopea";
import type { FishColors } from "../../art/Fish";
import type { PersonColors } from "../../art/Person";
import type { StopwatchColors } from "../../art/Stopwatch";
import type { StorefrontColors } from "../../art/Storefront";

/**
 * As cores do vídeo, por modo e por personagem, como aprovadas na ficha visual
 * (art.md). Toda cor de uma cena vem daqui; os nomes dos modos são os que o
 * roteiro usa em "palette".
 */

/** Cores de um cenário de lagoa, da superfície ao primeiro plano. */
export type LagoonColors = {
  /** Degradê da água, de cima para baixo. */
  readonly water: readonly [string, string, string, string];
  /** Clarão de onde a luz entra, e os feixes que descem dele. */
  readonly light: string;
  readonly reef: string;
  readonly rootsFar: string;
  readonly rootsNear: string;
  /** Degradê da areia, de cima para baixo, e a faixa clara da borda. */
  readonly sand: readonly [string, string, string];
  readonly sandEdge: string;
  readonly ripple: string;
  readonly pebble: readonly [string, string];
  readonly grassFar: readonly [string, string, string];
  readonly grass: readonly [string, string, string];
  readonly foreground: readonly [string, string, string];
  readonly particle: string;
  readonly vignette: string;
  readonly contact: string;
};

const lagoonDay: LagoonColors = {
  water: ["#A8EFE6", "#55C9DB", "#2A9DC7", "#1C78AA"],
  light: "#FFFFFF",
  reef: "#3FB3CF",
  rootsFar: "#2D9DBE",
  rootsNear: "#1F86AC",
  sand: ["#F3EEC6", "#D6DDB4", "#8FBFAE"],
  sandEdge: "#FBF8DC",
  ripple: "#A9C8AE",
  pebble: ["#7FAF9F", "#C7E2CC"],
  grassFar: ["#3DAFB0", "#55C4B4", "#2E9AA6"],
  grass: ["#4FCB8A", "#1F8A63", "#2FA982"],
  foreground: ["#0A4F5E", "#0D6170", "#083F4D"],
  particle: "#FFFFFF",
  vignette: "#04303F",
  contact: "#0B4A5C",
};

const lagoonNight: LagoonColors = {
  water: ["#3A3F8F", "#2C3079", "#1E2160", "#15173F"],
  light: "#BFD8FF",
  reef: "#3A4496",
  rootsFar: "#2B3284",
  rootsNear: "#22276E",
  sand: ["#7A4F9E", "#583A80", "#2F2052"],
  sandEdge: "#9A6FC0",
  ripple: "#4A3272",
  pebble: ["#3A2864", "#8A68B8"],
  grassFar: ["#2E4E96", "#3A61A6", "#274284"],
  grass: ["#2A7A8C", "#1B4F6E", "#236A80"],
  foreground: ["#0B0D33", "#11143F", "#080A28"],
  particle: "#8DE3F0",
  vignette: "#07082A",
  contact: "#05061F",
};

const jellyfishDay: CassiopeaColors = {
  dome: "#D9503F",
  domeShade: "#9E3A4E",
  bounce: "#FFD9A8",
  rim: "#FF7361",
  rimBack: "#E8604F",
  marks: "#FFF4EC",
  inner: "#E65A4A",
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

// De noite ela é repintada: corpo mais frio e apagado, cachos acesos em ciano.
const jellyfishNight: CassiopeaColors = {
  dome: "#8E3D69",
  domeShade: "#5C2A5E",
  bounce: "#7D9DE8",
  rim: "#B84F74",
  rimBack: "#96406C",
  marks: "#D6E8FF",
  inner: "#9A4068",
  innerLight: "#C25C7E",
  canal: "#D58CA6",
  core: "#C9708E",
  stalk: "#C25A7E",
  stalkShade: "#96426F",
  stalkBack: "#8B4376",
  stalkBackShade: "#69346A",
  frills: ["#C9F7F1", "#8DE3F0", "#E9FCFA", "#5BE0C0", "#FFFFFF"],
  frillsBack: ["#7DB7CB", "#5E9AB8", "#9AC8D6", "#3FA39F", "#B7DCE4"],
  paddle: ["#4B49B0", "#8086E4"],
  rimLight: "#BFD8FF",
  glow: "#8DE3F0",
  nerves: "#8DE3F0",
};

const fishDay: FishColors = {
  body: "#FFCB52",
  top: "#F08A2E",
  belly: "#FFF0B0",
  fin: "#F08A2E",
  stripe: "#FFFFFF",
  blush: "#FF8E6B",
  pupil: "#0B2A3A",
  mouth: "#7A2E1E",
};

const fishNight: FishColors = {
  body: "#D9A75E",
  top: "#B06B42",
  belly: "#EAD6A6",
  fin: "#B06B42",
  stripe: "#DCE6F5",
  blush: "#D97C6A",
  pupil: "#0B1A3A",
  mouth: "#5E2A2A",
};

export const lagoon = { day: lagoonDay, night: lagoonNight } as const;
export const jellyfish = { day: jellyfishDay, night: jellyfishNight } as const;
export const fish = { day: fishDay, night: fishNight } as const;

/** A pessoa que faz o papel de "você": pele quente, cabelo azul-marinho, roupa azul. */
export const person: PersonColors = {
  skin: "#F0B48A",
  skinShade: "#D9946B",
  lid: "#E2A078",
  blush: "#F2796B",
  hair: "#17324D",
  hairLight: "#2C5A82",
  top: "#2FB4D6",
  topShade: "#1F93B8",
  topLight: "#8DE3F0",
  pants: "#146C94",
  pantsShade: "#0F557A",
  shoe: "#FFCB52",
  shoeShade: "#E8A63A",
  hand: "#F0B48A",
  handShade: "#D9946B",
  eye: "#FFFFFF",
  pupil: "#0B2A3A",
  mouth: "#7A2E2A",
};

/** A mesma pessoa de pijama, na versão que dorme. */
export const personInPajamas: PersonColors = {
  ...person,
  top: "#A9B2FF",
  topShade: "#8088E0",
  topLight: "#D5DAFF",
  pants: "#8088E0",
  pantsShade: "#666FCC",
  shoe: "#FFF0B0",
  shoeShade: "#F2DC8C",
};

/** A lojista é a pessoa de avental coral: a cor do avental e a do bolso. */
export const apron = ["#FF7361", "#E5596B"] as const;

/** A pesquisadora, figurante das cenas de laboratório: jaleco claro e luvas violeta. */
export const researcher: PersonColors = {
  ...person,
  skin: "#C98B66",
  skinShade: "#A9704F",
  lid: "#B97B58",
  hair: "#5A3A5E",
  hairLight: "#7C5682",
  top: "#F4F8FB",
  topShade: "#D3E0E8",
  topLight: "#FFFFFF",
  pants: "#3A3F9E",
  pantsShade: "#2C3082",
  shoe: "#17324D",
  shoeShade: "#0F2438",
  hand: "#5B63D8",
  handShade: "#3A3F9E",
};

/** O laboratório: parede menta, bancada verde-água, vidro e água do tanque. */
export const lab = {
  wall: ["#EEFAF6", "#CDEFE5"],
  shelf: "#BCE6DA",
  bench: "#7CC2B2",
  benchTop: "#9AD5C6",
  benchShade: "#5FA898",
  water: "#8DE3F0",
  waterDeep: "#5CC6DC",
  glass: "#FFFFFF",
  platform: "#F4F8FB",
  platformShade: "#C8D8E2",
  paper: "#FFFFFF",
  paperLine: "#9AD5C6",
  clip: "#5B63D8",
  contact: "#2E7F70",
} as const;

export const stopwatch: StopwatchColors = {
  body: "#F4F8FB",
  bodyShade: "#D3E0E8",
  rim: "#3A3F9E",
  button: "#5B63D8",
  display: "#1B5E4A",
  text: "#A6F0C0",
  shine: "#FFFFFF",
};

/** O mesmo cronômetro quando os cinco segundos viram o problema: o visor passa ao coral. */
export const stopwatchAlarm: StopwatchColors = {
  ...stopwatch,
  display: "#7A1F1F",
  text: "#FF9C8C",
};

/** Fundos lisos de "ideia": um degradê e a cor da mancha de apoio. Troca-se de um para outro a cada ideia. */
export const idea = {
  peach: {
    top: "#FFF3E0",
    bottom: "#FFDDBA",
    spot: "#FFFFFF",
    contact: "#B5673A",
  },
  lilac: {
    top: "#F4ECFE",
    bottom: "#DCCBF6",
    spot: "#FFFFFF",
    contact: "#6C4AA8",
  },
  mint: {
    top: "#EAF9F0",
    bottom: "#C4ECD6",
    spot: "#FFFFFF",
    contact: "#2F8A63",
  },
} as const;

/** O quebra-cabeça das pistas: as peças, o tabuleiro por baixo e a peça da água-viva. */
export const puzzle = {
  pieces: ["#8DC8F0", "#A9B2FF", "#7FD9E6", "#B8A6F2"],
  pieceShade: "#5F6FD0",
  board: "#3A3F9E",
  hole: "#2C3082",
  found: "#FFF0B0",
} as const;

/** Os três sinais do sono, como painéis e como selos. */
export const signs = {
  panel: "#FFFFFF",
  night: ["#3A3F8F", "#15173F"],
  tank: ["#EEFAF6", "#8DE3F0"],
  day: ["#A8EFE6", "#2A9DC7"],
  seal: ["#5B63D8", "#2FA982", "#F08A2E"],
  sealEdge: "#FFFFFF",
  icon: "#FFFFFF",
  dim: "#C9BCE8",
} as const;

/** Os bichos em silhueta de "qualquer animal", e o olho deles. */
export const crowd = {
  body: "#2F8A63",
  shade: "#1F6B4B",
  eye: "#FFFFFF",
  predator: "#0B0D33",
} as const;

const shopDay: StorefrontColors = {
  wall: "#2FB4D6",
  wallShade: "#1F93B8",
  base: "#146C94",
  sign: "#146C94",
  signIcon: "#FFF0B0",
  awning: ["#FF7361", "#FFF4EC"],
  awningRail: "#C9402F",
  glass: "#FFE9A6",
  glassShine: "#FFFFFF",
  frame: "#0F557A",
  goods: ["#F08A2E", "#4FCB8A"],
  door: "#F08A2E",
  doorShade: "#C96A1C",
  knob: "#FFF0B0",
  shutter: "#C4DCE0",
  shutterLine: "#93B7BE",
  lamp: "#FFF0B0",
  lampGlow: null,
};

const shopNight: StorefrontColors = {
  wall: "#2C4FA0",
  wallShade: "#223E84",
  base: "#1A2F66",
  sign: "#1A2F66",
  signIcon: "#FFE9A8",
  awning: ["#B5506E", "#C8C4E0"],
  awningRail: "#7E3757",
  glass: "#1B1F5A",
  glassShine: "#8086E4",
  frame: "#162A5E",
  goods: ["#3A4AA0", "#3A4AA0"],
  door: "#8A4A52",
  doorShade: "#6E3A48",
  knob: "#C8C4E0",
  shutter: "#7186BE",
  shutterLine: "#5469A0",
  lamp: "#FFE9A8",
  lampGlow: "#FFE08A",
};

// A única loja acesa na rua escura: as cores da noite, com a vitrine e a porta de dia.
const shopLit: StorefrontColors = {
  ...shopNight,
  glass: "#FFE9A6",
  glassShine: "#FFFFFF",
  goods: ["#F08A2E", "#4FCB8A"],
  door: "#F08A2E",
  doorShade: "#C96A1C",
  knob: "#FFF0B0",
};

export const shop = { day: shopDay, night: shopNight, lit: shopLit } as const;

/** A rua da loja: céu, prédios ao fundo, calçada e o astro do céu. */
export const street = {
  day: {
    sky: ["#FBF0FD", "#E8CCF1"],
    far: "#E6C6EE",
    farWindow: "#F1DDF5",
    sidewalk: "#CFA4DE",
    curb: "#DDBBE9",
    road: "#B98BCB",
    orb: "#FFFFFF",
    star: "#FFFFFF",
    contact: "#7A4FA8",
  },
  night: {
    sky: ["#4A3791", "#1B1447"],
    far: "#3A2B7A",
    farWindow: "#4A3A8E",
    sidewalk: "#2A1F5E",
    curb: "#382A74",
    road: "#1E1648",
    orb: "#FFE9A8",
    star: "#FFFFFF",
    contact: "#0B0C2E",
  },
} as const;

/** Moedas que rolam pela calçada: a venda perdida. */
export const coin = {
  face: "#FFCB52",
  edge: "#F08A2E",
  shine: "#FFF0B0",
} as const;

/** Letreiro luminoso da cartela de capítulo. */
export const neon = {
  board: "#1B1447",
  tube: "#FF7361",
  tubeCore: "#FFE3DC",
  text: "#FFE9A8",
  glow: "#FFB25C",
} as const;

/** Cores de texto e de marcação sobre as cenas. */
export const ink = {
  /** Texto solto e linhas de ligação sobre a água. */
  paper: "#EFFAF8",
  /** Texto dentro de etiqueta. */
  dark: "#031418",
  /** Etiqueta padrão: o coral da água-viva. */
  tag: "#FF7361",
  tagEdge: "#C9402F",
  /** Anéis do pulso e bolhas. */
  ring: "#FFFFFF",
  /** A lua e o título do vídeo. */
  moon: "#FFE9A8",
  /** O brilho ciano do que acende no escuro. */
  glow: "#8DE3F0",
} as const;
