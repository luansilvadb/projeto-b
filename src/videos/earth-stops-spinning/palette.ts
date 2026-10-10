import type { VigiliaColors } from "../../art/Vigilia";

/**
 * As cores do vídeo, por modo e por personagem, como na ficha visual (art.md).
 * Toda cor de uma cena vem daqui; os nomes dos modos são os que o roteiro usa
 * em "palette".
 */

/** `espaco`: a Terra vista de fora, a Lua e o Sol. */
export const space = {
  sky: ["#0B0A3A", "#1A1F7A"],
  star: "#F4F1FF",
  /** O halo do lado de onde o Sol bate. */
  glow: "#5B6BFF",
  moon: "#D9D4F0",
  moonShade: "#8E86C4",
  moonCrater: "#B4ACDD",
  sun: "#FFD23F",
  sunCore: "#FFF2BA",
  sunEdge: "#FF9A2E",
  /** O Sol inchado do fim. */
  sunRed: "#FF5A3C",
  otherPlanet: "#C2577A",
  otherPlanetShade: "#7E2C5C",
} as const;

/** A Terra: o mar, a terra, o gelo e, em corte, a rocha. */
export const earth = {
  ocean: ["#7FE3F5", "#2FA8E0", "#1565B8"],
  land: "#4FCB8A",
  landShade: "#2E9C6A",
  ice: "#F4FBFF",
  shade: "#0B0A3A",
  /** A camada de mar destacada: o calombo, a maré. */
  water: "#36C5F5",
  waterLight: "#9BE9FF",
  /** A camada de ar. */
  air: "#C9F1FF",
  rock: "#B5653A",
  rockShade: "#8A4426",
  mantle: "#E8893A",
  /** O contorno do que era, ou do que é provisório. */
  ghost: "#F4F1FF",
} as const;

/** `casa`: a cozinha de quem assiste, de manhã. */
export const home = {
  wall: ["#FFE2B8", "#FFC98F"],
  wallShade: "#F4B273",
  floor: "#E89A62",
  floorShade: "#CC7C48",
  counter: "#F6F0E4",
  counterShade: "#D9CDB8",
  frame: "#FFF8EC",
  frameShade: "#E2C9A4",
  sky: ["#9ADCFF", "#FFE9B0"],
  curtain: "#FF8A6B",
  curtainShade: "#E2664A",
  cup: "#FFFFFF",
  cupShade: "#D8DDEA",
  coffee: "#6B3A22",
  steam: "#FFFFFF",
  roof: "#E2664A",
  houseWall: "#FFF1D6",
  contact: "#9C5226",
  /** A máquina de lavar. */
  washer: "#F4F8FB",
  washerShade: "#C9D6E2",
  drum: "#3A4A7A",
  clothes: ["#FF8A6B", "#FFD23F", "#4FCB8A", "#7A88FF"],
} as const;

/** `tempestade`: o chão durante a parada. */
export const storm = {
  sky: ["#FFB04A", "#E8662A"],
  dust: "#FFD9A0",
  dustDeep: "#C9501E",
  ground: "#8A3A16",
  groundShade: "#5E2208",
  /** O que é arrastado, em silhueta. */
  carried: "#4A1A0A",
  /** O que fica preso ao chão. */
  fixed: "#FFF1D6",
  streak: "#FFF1D6",
  sea: "#2F7FA8",
  seaLight: "#7CC6DE",
  sand: "#F2C879",
} as const;

/** `gelo`: perto do polo. */
export const ice = {
  sky: ["#D6F4FF", "#9ADCF5"],
  ground: "#FFFFFF",
  groundShade: "#C4E6F5",
  far: "#B2DCF0",
  shadow: "#7FB8D6",
  sign: "#E2664A",
  signPost: "#7A4A2A",
} as const;

/** `mar`: o mundo parado em mapa, e o recife dos corais. */
export const sea = {
  water: ["#5EE0D6", "#1FA8C4"],
  deep: "#0E7FA6",
  land: "#F2DDA0",
  landShade: "#D9B96A",
  dry: "#C99A5A",
  crack: "#8A5E2E",
  paper: "#FFF8E6",
  stamp: "#E2452D",
  coral: "#FF7A8A",
  coralShade: "#D9506A",
  coralLine: "#FFE3E0",
  reef: "#168CA8",
  ship: "#5A3A4A",
} as const;

/** `ideia`: os fundos lisos de medir e comparar, um matiz por ideia. */
export const idea = {
  peach: { top: "#FFCB80", bottom: "#FFA552", spot: "#FFE9C4", contact: "#B55117" },
  lilac: { top: "#CFA8FF", bottom: "#A070F0", spot: "#EBD9FF", contact: "#5526A8" },
  mint: { top: "#9CF2C2", bottom: "#4FD694", spot: "#D9FBE6", contact: "#088A52" },
  sky: { top: "#A8DCFF", bottom: "#6AB4F5", spot: "#DDF1FF", contact: "#1F5FB0" },
} as const;

export type IdeaHue = keyof typeof idea;

/** `por-dentro`: o interior da Terra, até o núcleo. */
export const inside = {
  background: ["#07045A", "#030133"],
  crust: "#3A2A8A",
  mantle: "#5A2A9A",
  iron: "#FF8A2E",
  ironLight: "#FFD23F",
  core: "#FFF2BA",
  field: "#5CDDF0",
} as const;

/** A Vigília, "você": o verde-água da folha de modelo dela. */
export const vigilia: VigiliaColors = {
  body: "#1bcfbf",
  shade: "#0f97a0",
  limb: "#0e9692",
  limbFar: "#0a6f7c",
  leg: "#2a1f5c",
  legFar: "#211850",
  lid: "#0e9692",
  line: "#073c54",
  cold: "#bafff3",
  warm: "#ffe3a0",
  hand: "#fff4dc",
  hoof: "#fff4dc",
  hoofFar: "#f0dcb4",
  ink: "#1c1238",
  eye: "#fffdf4",
};

/** O Explorador, perto do polo: a mesma construção, de casaco coral, para saltar do gelo. */
export const explorer: VigiliaColors = {
  ...vigilia,
  body: "#FF6B4A",
  shade: "#D9452D",
  limb: "#E2543A",
  limbFar: "#B83A24",
  leg: "#3A2A5C",
  legFar: "#2A1E48",
  lid: "#E2543A",
  line: "#7A1E10",
  cold: "#FFD0C0",
  warm: "#FFE3A0",
  hand: "#3A2A5C",
};

/** O gorro e os óculos do Explorador, e a caneca dele. */
export const explorerGear = {
  hat: "#3A2A5C",
  hatBand: "#FFD23F",
  pompom: "#FFFFFF",
  goggles: "#FFD23F",
  mug: "#FFD23F",
  mugShade: "#E2A81E",
} as const;

/** A alavanca "giro". */
export const lever = {
  base: "#3A2A8A",
  baseLight: "#5A4AC0",
  rod: "#C9CFF0",
  knob: "#FFD23F",
  knobShade: "#E2A81E",
  plate: "#FFD23F",
  plateText: "#2A1F5C",
  on: "#4FE38A",
  off: "#FF5A3C",
} as const;

/** Texto e marcação sobre as cenas. */
export const ink = {
  paper: "#FFFFFF",
  dark: "#1C1238",
  /** Setas e destaques: o amarelo do Sol e da alavanca. */
  accent: "#FFD23F",
  /** O que para, o que é riscado. */
  stop: "#FF5A3C",
  /** O vento que volta frio. */
  cold: "#7CD8FF",
  /** O ar quente que sobe. */
  hot: "#FF8A4A",
} as const;

/**
 * As etiquetas: pílula de letra clara no tom escuro do próprio fundo; sobre
 * fundo escuro, pílula amarela de letra índigo (como no vídeo do sono).
 */
export const tags = {
  dark: { fill: "#FFD23F", text: "#2A1F5C" },
  light: { fill: "#2A1F5C", text: "#FFFFFF" },
  warm: { fill: "#7A2E0A", text: "#FFFFFF" },
  note: { fill: "#FFFFFF", text: "#2A1F5C" },
} as const;

export type TagTone = keyof typeof tags;

/** O vermelho de chamada do botão de inscrição. */
export const youtube = { subscribe: "#FF0033", done: "#3A3A4A" } as const;

/** O selo da fonte, no canto: escuro e translúcido, para ler sobre qualquer fundo sem disputar com a cena. */
export const sourceSeal = { fill: "#1B1447CC", text: "#FFFFFF" } as const;

/** Do dia de um ano ao campo magnético: o que os modos não tinham. */
export const blockDay = {
  /** Os meses de noite do calendário em anel: lê sobre o índigo do espaço. */
  night: "#4A4FD0",
  /** A barriga das nuvens espessas. */
  cloudShade: "#B9C4EC",
  /** O bulbo do termômetro sem leitura. */
  idle: "#A9A3CF",
} as const;

/** Do calombo ao mapa dos dois oceanos: o que `espaco` e `mar` ainda não tinham. */
export const blockSea = {
  /** O miolo claro da Terra em corte, de onde saem os dois raios. */
  core: "#FFC46B",
  /** O céu sobre o fundo do mar que secou, do alto ao horizonte. */
  sky: ["#8FE6DC", "#FFF1C9"],
  /** As antigas ilhas, ao longe, quase na cor do céu. */
  far: "#E6CF9A",
  /** O papel do corte lateral das duas bacias. */
  page: ["#FFF8E6", "#F6E6B8"],
} as const;

/** O relógio de um dia com a lupa e a lasca, o freio da Lua e a régua do tempo (`earthquake`, `the-moon-brake`, `corals`, `never`). */
export const blockBrake = {
  face: "#FFF8EC",
  rim: "#2A1F5C",
  /** A volta de um dia, no aro do relógio. */
  day: "#FFD23F",
  /** A lasca que sai do dia, ou entra nele: sempre a mesma cor, porque é a mesma coisa. */
  sliver: "#FF5A3C",
  handle: "#7A4A2A",
  /** A sapata do freio: a pastilha escura e a chapa de metal atrás dela. */
  pad: "#3A2A5C",
  plate: "#C9CFF0",
  spark: "#FFD23F",
  /** As barras da régua do tempo: a do freio e a do Sol. */
  bar: "#3A2A8A",
  sunBar: "#FF9A2E",
} as const;
