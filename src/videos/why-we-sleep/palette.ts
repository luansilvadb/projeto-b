import type { CassiopeaColors } from "../../art/Cassiopea";
import type { AntelopeColors } from "../../art/Antelope";
import type { ElephantColors, ElephantFinish } from "../../art/Elephant";
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
  water: ["#7FEFE1", "#28C3DB", "#0C95C7", "#0770AA"],
  light: "#FFFFFF",
  reef: "#18ABCF",
  rootsFar: "#0E96BE",
  rootsNear: "#0880AC",
  sand: ["#F3EBA8", "#D1DD99", "#71BFA4"],
  sandEdge: "#FBF6C6",
  ripple: "#94C89C",
  pebble: ["#62AF95", "#C7E2CC"],
  grassFar: ["#1AAFB0", "#2CC4AE", "#1097A6"],
  grass: ["#25CB74", "#028A59", "#11A978"],
  foreground: ["#004E5E", "#005F70", "#003E4D"],
  particle: "#FFFFFF",
  vignette: "#002F3F",
  contact: "#00485C",
};

const lagoonNight: LagoonColors = {
  water: ["#1C238F", "#080E79", "#040960", "#03063F"],
  light: "#98C0FF",
  reef: "#1B2896",
  rootsFar: "#071184",
  rootsNear: "#040C6E",
  sand: ["#6B2D9E", "#3F0F80", "#1D0652"],
  sandEdge: "#8848C0",
  ripple: "#330C72",
  pebble: ["#230864", "#7442B8"],
  grassFar: ["#123B96", "#194CA6", "#052A84"],
  grass: ["#05738C", "#03466E", "#046380"],
  foreground: ["#010433", "#02063F", "#000428"],
  particle: "#5CDDF0",
  vignette: "#00012A",
  contact: "#00011F",
};

const jellyfishDay: CassiopeaColors = {
  dome: "#D92D17",
  domeShade: "#9E1A34",
  bounce: "#FFC478",
  rim: "#FF452D",
  rimBack: "#E83721",
  marks: "#FFF4EC",
  inner: "#E6321E",
  innerLight: "#FF5F45",
  canal: "#FFA18E",
  core: "#FF8A76",
  stalk: "#FF5B45",
  stalkShade: "#E52A42",
  stalkBack: "#D9414E",
  stalkBackShade: "#B43062",
  frills: ["#FFE783", "#FFD254", "#FFF2BA", "#25CB74", "#FFFFFF"],
  frillsBack: ["#E6DC94", "#D9C363", "#EDE3A8", "#38B78F", "#F7F3DC"],
  paddle: ["#2E38D8", "#7A88FF"],
  rimLight: "#FFFFFF",
  glow: null,
  nerves: "#5CDDF0",
};

// De noite ela é repintada: corpo mais frio e apagado, cachos acesos em ciano.
const jellyfishNight: CassiopeaColors = {
  dome: "#8E1F5B",
  domeShade: "#5B0B5E",
  bounce: "#4C7BE8",
  rim: "#B8285B",
  rimBack: "#96205D",
  marks: "#BAD8FF",
  inner: "#9A2056",
  innerLight: "#C23362",
  canal: "#D5648C",
  core: "#C94672",
  stalk: "#C23163",
  stalkShade: "#962260",
  stalkBack: "#8B1368",
  stalkBackShade: "#690F6A",
  frills: ["#AAF7ED", "#5CDDF0", "#E9FCFA", "#2CE0B5", "#FFFFFF"],
  frillsBack: ["#55ADCB", "#378DB8", "#76C0D6", "#1DA39E", "#99D7E4"],
  paddle: ["#2724B0", "#5159E4"],
  rimLight: "#98C0FF",
  glow: "#5CDDF0",
  nerves: "#5CDDF0",
};

const fishDay: FishColors = {
  body: "#FFBC21",
  top: "#F0780C",
  belly: "#FFE783",
  fin: "#F0780C",
  stripe: "#FFFFFF",
  blush: "#FF6535",
  pupil: "#0B2A3A",
  mouth: "#7A2E1E",
};

const fishNight: FishColors = {
  body: "#D99430",
  top: "#B0541E",
  belly: "#EACA7E",
  fin: "#B0541E",
  stripe: "#DCE6F5",
  blush: "#D9553C",
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
  blush: "#F24B38",
  hair: "#17324D",
  hairLight: "#2C5A82",
  top: "#0EADD6",
  topShade: "#078DB8",
  topLight: "#5CDDF0",
  pants: "#046794",
  pantsShade: "#00507A",
  shoe: "#FFBC21",
  shoeShade: "#E89713",
  hand: "#F0B48A",
  handShade: "#D9946B",
  eye: "#FFFFFF",
  pupil: "#0B2A3A",
  mouth: "#7A2E2A",
};

/** A mesma pessoa de pijama, na versão que dorme. */
export const personInPajamas: PersonColors = {
  ...person,
  top: "#7A88FF",
  topShade: "#525EE0",
  topLight: "#B8C1FF",
  pants: "#525EE0",
  pantsShade: "#3B47CC",
  shoe: "#FFE783",
  shoeShade: "#F2D15A",
};

/** A lojista é a pessoa de avental coral: a cor do avental e a do bolso. */
export const apron = ["#FF452D", "#E52A42"] as const;

/** A elefanta: cinza-lilás, com o interior da orelha rosado. Proposta para o capítulo 2. */
export const elephant: ElephantColors = {
  body: "#727DB5",
  shade: "#505B9A",
  light: "#9CA5D4",
  earInside: "#C96D88",
  tusk: "#F4F1E6",
  nail: "#D9DCEA",
  eye: "#FFFFFF",
  pupil: "#1B1F3C",
};

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
  pants: "#1A219E",
  pantsShade: "#070D82",
  shoe: "#03284D",
  shoeShade: "#011D38",
  hand: "#5B63D8",
  handShade: "#3A3F9E",
};

/** O pesquisador do sono diante do quadro-negro: jaleco, cabelo grisalho e óculos. */
export const sleepResearcher: PersonColors = {
  ...person,
  hair: "#9AA3BC",
  hairLight: "#C9CFE0",
  top: "#F4F8FB",
  topShade: "#D3E0E8",
  topLight: "#FFFFFF",
  pants: "#1A219E",
  pantsShade: "#070D82",
  shoe: "#03284D",
  shoeShade: "#011D38",
};

/** O quadro-negro: a face, a moldura, o giz e o carimbo. */
export const chalkboard = {
  face: "#0F4352",
  frame: "#B55117",
  chalk: "#EFFAF8",
  stamp: "#FF452D",
} as const;

/** O laboratório: parede menta, bancada verde-água, vidro e água do tanque. */
export const lab = {
  wall: ["#A8F2D8", "#66E0B8"],
  shelf: "#7FDDBF",
  bench: "#3FBF9F",
  benchTop: "#66D4B6",
  benchShade: "#2A9C82",
  water: "#5CDDF0",
  waterDeep: "#2EBEDC",
  glass: "#FFFFFF",
  platform: "#F4F8FB",
  platformShade: "#C8D8E2",
  paper: "#FFFFFF",
  paperLine: "#77D5BD",
  clip: "#2E38D8",
  contact: "#087F69",
} as const;

/** Os ratos do experimento: brancos, de orelha rosada; fora do experimento, só a silhueta. */
export const rat = {
  body: "#FFFFFF",
  ear: "#F294A1",
  eye: "#1B1F3C",
  gone: "#3CA890",
} as const;

/** O despertador de quem não deixa o rato dormir. */
export const alarmClock = {
  body: "#FF452D",
  bell: "#C9230F",
  face: "#FFF4EC",
  hand: "#031418",
} as const;

export const stopwatch: StopwatchColors = {
  body: "#F4F8FB",
  bodyShade: "#D3E0E8",
  rim: "#1A219E",
  button: "#2E38D8",
  display: "#035E43",
  text: "#7CF0A4",
  shine: "#FFFFFF",
};

/** O mesmo cronômetro quando os cinco segundos viram o problema: o visor passa ao coral. */
export const stopwatchAlarm: StopwatchColors = {
  ...stopwatch,
  display: "#7A0303",
  text: "#FF6E57",
};

/** Fundos lisos de "ideia": um degradê e a cor da mancha de apoio. Troca-se de um para outro a cada ideia. */
export const idea = {
  peach: {
    top: "#FFCB80",
    bottom: "#FFA552",
    spot: "#FFE9C4",
    contact: "#B55117",
  },
  lilac: {
    top: "#CFA8FF",
    bottom: "#A070F0",
    spot: "#EBD9FF",
    contact: "#5526A8",
  },
  mint: {
    top: "#9CF2C2",
    bottom: "#4FD694",
    spot: "#D9FBE6",
    contact: "#088A52",
  },
} as const;

/** O quebra-cabeça das pistas: as peças, o tabuleiro por baixo e a peça da água-viva. */
export const puzzle = {
  pieces: ["#5CB4F0", "#7A88FF", "#4FD3E6", "#977BF2"],
  pieceShade: "#3349D0",
  board: "#1A219E",
  hole: "#070D82",
  found: "#FFE783",
} as const;

/** Os três sinais do sono, como painéis e como selos. */
export const signs = {
  panel: "#FFFFFF",
  night: ["#1C238F", "#03063F"],
  tank: ["#EEFAF6", "#5CDDF0"],
  day: ["#7FEFE1", "#0C95C7"],
  seal: ["#2E38D8", "#11A978", "#F0780C"],
  sealEdge: "#FFFFFF",
  icon: "#FFFFFF",
  dim: "#B49FE8",
} as const;

const shopDay: StorefrontColors = {
  wall: "#0EADD6",
  wallShade: "#078DB8",
  base: "#046794",
  sign: "#046794",
  signIcon: "#FFE783",
  awning: ["#FF452D", "#FFF4EC"],
  awningRail: "#C9230F",
  glass: "#FFDD76",
  glassShine: "#FFFFFF",
  frame: "#00507A",
  goods: ["#F0780C", "#25CB74"],
  door: "#F0780C",
  doorShade: "#C95E06",
  knob: "#FFE783",
  shutter: "#B0D9E0",
  shutterLine: "#78B3BE",
  lamp: "#FFE783",
  lampGlow: null,
};

const shopNight: StorefrontColors = {
  wall: "#103BA0",
  wallShade: "#032884",
  base: "#031D66",
  sign: "#031D66",
  signIcon: "#FFDD78",
  awning: ["#B52A53", "#B7B0E0"],
  awningRail: "#7E0D40",
  glass: "#03095A",
  glassShine: "#5159E4",
  frame: "#021B5E",
  goods: ["#1A2FA0", "#1A2FA0"],
  door: "#8A1A28",
  doorShade: "#6E142C",
  knob: "#B7B0E0",
  shutter: "#4B6ABE",
  shutterLine: "#3251A0",
  lamp: "#FFDD78",
  lampGlow: "#FFD254",
};

// A única loja acesa na rua escura: as cores da noite, com a vitrine e a porta de dia.
const shopLit: StorefrontColors = {
  ...shopNight,
  glass: "#FFDD76",
  glassShine: "#FFFFFF",
  goods: ["#F0780C", "#25CB74"],
  door: "#F0780C",
  doorShade: "#C95E06",
  knob: "#FFE783",
};

export const shop = { day: shopDay, night: shopNight, lit: shopLit } as const;

/** A rua da loja: céu, prédios ao fundo, calçada e o astro do céu. */
export const street = {
  day: {
    sky: ["#EDBBFF", "#CC80F0"],
    far: "#D08AE8",
    farWindow: "#EBC4F7",
    sidewalk: "#B86AD9",
    curb: "#CC8FE6",
    road: "#9C4FC4",
    orb: "#FFFFFF",
    star: "#FFFFFF",
    contact: "#672BA8",
  },
  night: {
    sky: ["#331991", "#0C0247"],
    far: "#1D077A",
    farWindow: "#321C8E",
    sidewalk: "#14055E",
    curb: "#1C0874",
    road: "#0E0348",
    orb: "#FFDD78",
    star: "#FFFFFF",
    contact: "#01022E",
  },
} as const;

/** A loja por dentro, de dia e de porta baixada: parede, piso, móveis de madeira e o vão escuro do depósito. */
export const shopInside = {
  day: {
    wall: ["#9EE5F2", "#62CAE4"],
    floor: "#C681DE",
    wood: "#F0780C",
    woodShade: "#C95E06",
    stockroom: "#046794",
    shutter: "#B0D9E0",
    shutterLine: "#78B3BE",
    lamp: null,
  },
  night: {
    wall: ["#15399E", "#041B6E"],
    floor: "#14055E",
    wood: "#8A1A28",
    woodShade: "#6E142C",
    stockroom: "#030842",
    shutter: "#4B6ABE",
    shutterLine: "#3251A0",
    lamp: "#FFD254",
  },
} as const;

/** As caixas de mercadoria (as memórias do dia) e os itens das prateleiras (as conexões). */
export const goods = {
  crate: "#FFBC21",
  crateShade: "#E89713",
  tape: "#FFF4EC",
  items: ["#FF452D", "#25CB74", "#7A88FF", "#FFBC21"],
  broom: "#FFD254",
  broomStick: "#B55117",
  bucket: "#5CDDF0",
  trophy: "#FFBC21",
} as const;

/** Um freguês da loja: a construção da pessoa, de outra roupa e cabelo. */
export const customer: PersonColors = {
  ...person,
  skin: "#C98B66",
  skinShade: "#A9704F",
  lid: "#B97B58",
  hair: "#7A2E2A",
  hairLight: "#A8504A",
  top: "#F0780C",
  topShade: "#C95E06",
  topLight: "#FFBC21",
  pants: "#56195E",
  pantsShade: "#300A5A",
  shoe: "#FFF4EC",
  shoeShade: "#D9DCEA",
  hand: "#C98B66",
  handShade: "#A9704F",
};

/** Moedas que rolam pela calçada: a venda perdida. */
export const coin = {
  face: "#FFBC21",
  edge: "#F0780C",
  shine: "#FFE783",
} as const;

/** A savana das elefantas: céu quente e chão ocre de dia; índigo com lua e chão roxo de noite. Proposta para o capítulo 2. */
export const savanna = {
  day: {
    sky: ["#FFD98A", "#FFA85C"],
    sun: "#FFF2BA",
    far: "#E88F37",
    trees: "#B85518",
    ground: ["#E09E34", "#C97C1E"],
    grass: "#B87616",
    contact: "#7A3B03",
  },
  // O entardecer fica no caminho entre o dia e a noite: céu violeta e laranja, chão terroso.
  dusk: {
    sky: ["#41299C", "#FF8D4E"],
    sun: "#FFC335",
    far: "#8A2668",
    trees: "#400F58",
    ground: ["#B45838", "#8A1F41"],
    grass: "#7E1E3F",
    contact: "#38093C",
  },
  // De noite o céu é azul-escuro e o chão, ameixa: famílias diferentes, para o quadro não virar uma cor só.
  night: {
    sky: ["#041272", "#020946"],
    sun: "#FFDD78",
    far: "#081886",
    trees: "#040B4E",
    ground: ["#4C1178", "#300A5A"],
    grass: "#3A0D68",
    contact: "#070230",
  },
} as const;

/** O céu da fragata, sobre o oceano: lavanda de dia, índigo com estrelas de noite; o mar lá embaixo é verde-petróleo, de outra família. */
export const sky = {
  day: {
    top: "#8C9BFF",
    bottom: "#D3DAFF",
    cloud: "#FFFFFF",
    cloudShade: "#B8C1FF",
    sea: ["#088992", "#016370"],
    sun: "#FFEA99",
  },
  night: {
    top: "#03084E",
    bottom: "#0E0E86",
    cloud: "#2C299C",
    cloudShade: "#0E0B7A",
    sea: ["#023B48", "#012530"],
    sun: "#FFDD78",
  },
  dusk: {
    top: "#3F289E",
    bottom: "#FF8C54",
    cloud: "#FFB883",
    cloudShade: "#C96689",
    sea: ["#036B78", "#024956"],
    sun: "#FFC335",
  },
} as const;

/** Por dentro: o cérebro do golfinho, metade acesa e metade apagada, sobre índigo profundo. */
export const inside = {
  background: ["#07045A", "#030133"],
  spark: "#FFDD78",
} as const;

export const brainHalves = {
  awake: "#5CDDF0",
  asleepShade: "#110770",
} as const;

/** O pedestal vazio "acordado 24 h", o cenário-âncora: o mesmo desenho em todas as voltas. */
export const pedestal = {
  body: "#6C3FD0",
  shade: "#5429B4",
  top: "#8B5CF0",
  plaque: "#FFE08A",
  plaqueEdge: "#C98A1C",
  text: "#3A1E6E",
  light: "#FFF4C8",
  contact: "#3A1E6E",
} as const;

/** As onomatopeias: letra quente com contorno escuro, e a versão fria para a noite. */
export const sound = {
  warm: "#FFE08A",
  hot: "#FF4A2E",
  cool: "#C9F6FB",
  edge: "#3A1E6E",
} as const;

/** Cores de texto e de marcação sobre as cenas. */
export const ink = {
  /** Texto solto e linhas de ligação sobre a água. */
  paper: "#EFFAF8",
  /** Texto dentro de etiqueta. */
  dark: "#001418",
  /** Etiqueta padrão: o coral da água-viva. */
  tag: "#FF7361",
  tagEdge: "#C9402F",
  /** Anéis do pulso e bolhas. */
  ring: "#FFFFFF",
  /** A lua e o título do vídeo. */
  moon: "#FFDD78",
  /** O brilho ciano do que acende no escuro. */
  glow: "#5CDDF0",
} as const;

/** O antílope, a presa do capítulo "o que o sono custa": ferrugem, para saltar do chão de areia da savana. */
export const antelope: AntelopeColors = {
  body: "#C75116",
  shade: "#9E3411",
  belly: "#FFECCA",
  band: "#3A0E2E",
  earInside: "#F29873",
  eye: "#FFFFFF",
  pupil: "#1B1F3C",
};

/** O antílope repintado para a savana de noite: lilás sob a lua, com a barriga ainda clara. */
export const antelopeNight: AntelopeColors = {
  body: "#7055C8",
  shade: "#4F35A6",
  belly: "#C3B9F6",
  band: "#0A0340",
  earInside: "#A576D6",
  eye: "#F4F1FF",
  pupil: "#120E30",
};

/**
 * As etiquetas: pílula de letra clara no tom escuro do próprio fundo; sobre
 * fundo escuro, pílula amarela de letra índigo. Aprovado em 2026-10-04: uma
 * cor só para todos os fundos vibrava no verde e sumia no laranja.
 */
export const tags = {
  peach: { fill: idea.peach.contact, text: "#FFFFFF" },
  mint: { fill: idea.mint.contact, text: "#FFFFFF" },
  lilac: { fill: idea.lilac.contact, text: "#FFFFFF" },
  night: { fill: "#FFE08A", text: "#3A1E6E" },
} as const;

export type TagTone = keyof typeof tags;

/** O selo da fonte, no canto: escuro e translúcido, para ler sobre qualquer fundo sem disputar com a cena. */
export const sourceSeal = {
  fill: "#1B1447CC",
  text: "#FFFFFF",
} as const;

/** Randy Gardner: blusa framboesa e cabelo castanho, para não se confundir com "você", de azul, nem com o freguês da loja, de laranja. */
export const gardner: PersonColors = {
  ...person,
  hair: "#5A3620",
  hairLight: "#7E5332",
  top: "#D8345F",
  topShade: "#AD2348",
  topLight: "#F36D8E",
  pants: "#3B2A66",
  pantsShade: "#28194A",
  shoe: "#FFF4EC",
  shoeShade: "#D9DCEA",
};

/** A elefanta na savana de noite: repintada mais clara, como a ficha visual pede, para não se apagar no céu azul-escuro. */
export const elephantNight: ElephantColors = {
  ...elephant,
  body: "#98A2D6",
  shade: "#6F7AB8",
  light: "#BFC6EA",
};

/**
 * A elefanta do acabamento, piloto do polimento (2026-10-06): cor cheia no
 * lugar do cinza-lilás, sombra em violeta e não no corpo escurecido, e um
 * matiz por parte (o rosa da orelha, o creme da presa, o amarelo das unhas).
 * Vale só onde a cena pede o acabamento; as cores aprovadas, acima, continuam
 * como estão.
 */
export const elephantFinish: ElephantFinish = {
  body: "#7B82EA",
  shadow: "#5A45C6",
  deep: "#3D2A98",
  earInside: "#F0668E",
  tusk: "#FFF0CC",
  nail: "#FFC857",
  eye: "#FFFFFF",
  pupil: "#1B1F3C",
};

/** A mesma elefanta sob a lua: mais clara, para não se apagar no céu. */
export const elephantNightFinish: ElephantFinish = {
  ...elephantFinish,
  body: "#8D92F4",
  shadow: "#6852DA",
  deep: "#4530AC",
};

/**
 * O acabamento da savana de noite, do mesmo piloto: a lua emite luz e leva o
 * halo em dois degraus do céu até ela; as copas ganham um tom que se distingue
 * do céu, e um morro baixo passa atrás do assunto num segundo tom do chão.
 */
export const savannaFinish = {
  night: {
    halo: ["#0C2098", "#1A32BC"],
    moonCore: "#FFF3C4",
    tree: "#0E1E90",
    mound: "#5A1A8E",
  },
} as const;
