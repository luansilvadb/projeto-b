// As oito poses desenhadas da Vigília no número, e o que as prende à alavanca.
//
// O desenho dela (`src/art/Vigilia.tsx`) não sabe de alavanca: recebe uma pose
// com as mãos e os cascos já no lugar. Aqui a pose ganha o que é do estudo: o
// ângulo de alavanca para o qual foi desenhada e quanto cada mão está presa à
// haste. `settle` devolve a pose que o desenho recebe, com a mão presa girada
// junto com a alavanca.
//
// O espaço das poses: a origem é o chão embaixo do cubo da alavanca, x cresce
// para o lado do reservatório e y, para baixo; o chão é y = 0, plano. As
// medidas são pixels do plano aberto. O grupo dela entra na cena em
// `translate(LEVER.hub[0] floorAt(LEVER.hub[0])) rotate(SLOPE)`, com o `LEVER`
// de `base.tsx`, e a alavanca das poses é a do cenário menos `SLOPE`
// (`cast.tsx`). O sinal dessa inclinação está trocado: veja o README.

import { HOOF, type Vec, type VigiliaPose } from "../../art/Vigilia";

const rad = (degrees: number) => (degrees * Math.PI) / 180;
/** Gira um vetor, em graus, no sentido do relógio na tela. */
const spin = ([x, y]: Vec, degrees: number): Vec => {
  const cos = Math.cos(rad(degrees));
  const sin = Math.sin(rad(degrees));
  return [x * cos - y * sin, x * sin + y * cos];
};

// ---- A alavanca, no espaço das poses ----

/** O cubo em que ela gira e o comprimento da haste, como em `base.tsx`. */
export const LEVER = { hub: [0, -23] as Vec, length: 242.4 };
/** A inclinação do chão do trecho, em graus: o que o grupo dela gira para pisar na passarela. */
export const SLOPE = (Math.atan(0.046) * 180) / Math.PI;
/**
 * Um ponto da alavanca, com ela a `angle` graus da vertical (negativo: caída
 * para o lado dela): `s` vai de 0 (o cubo) a 1 (a ponta), e `side` desloca
 * para o lado, negativo para o dela.
 */
export const onLever = (angle: number, s: number, side = 0): Vec => {
  const turn = (angle * Math.PI) / 180;
  return [
    LEVER.hub[0] + side * Math.cos(turn) + s * LEVER.length * Math.sin(turn),
    LEVER.hub[1] + side * Math.sin(turn) - s * LEVER.length * Math.cos(turn),
  ];
};

// ---- A pose do estudo ----

export type Pose = VigiliaPose & {
  /** A alavanca para a qual a pose foi desenhada, em graus. */
  readonly lever: number;
  /** Quanto cada mão está presa à haste, de 0 a 1. */
  readonly nearGrip: number;
  readonly farGrip: number;
};

/**
 * A pose que o desenho recebe, com a alavanca num ângulo: a mão presa gira com
 * a haste em volta do cubo quando a alavanca sai do ângulo da pose. É o que
 * faz a mão chegar no mesmo quadro que a haste, antes do corpo.
 */
export const settle = ({ lever: drawn, nearGrip, farGrip, ...pose }: Pose, lever: number): VigiliaPose => {
  const held = (hand: Vec, grip: number): Vec => {
    const [x, y] = spin([hand[0] - LEVER.hub[0], hand[1] - LEVER.hub[1]], (lever - drawn) * grip);
    return [LEVER.hub[0] + x, LEVER.hub[1] + y];
  };
  return { ...pose, nearHand: held(pose.nearHand, nearGrip), farHand: held(pose.farHand, farGrip) };
};

// ---- As oito poses ----

/** Onde a mão pega na haste: `s` de 0 (o cubo) a 1 (a ponta), na borda do lado dela. */
export const grip = (lever: number, s: number): Vec => onLever(lever, s, -13);
/** O tornozelo de um casco apoiado em `x` e girado `foot` graus: chapado, na ponta ou no calcanhar. */
export const stand = (x: number, foot = 0): Vec => [
  x,
  -(Math.max(HOOF.toe * Math.sin(rad(foot)), -HOOF.heel * Math.sin(rad(foot))) + HOOF.ankle * Math.cos(rad(foot))),
];

/**
 * A alavanca do trecho em cada momento, já no espaço das poses (o ângulo do
 * cenário menos `SLOPE`): firme; no tranco; cedendo ao empurrão; no esforço
 * máximo; a meio caminho da queda; e no batente.
 */
const AT = { hold: -10.7, jolt: -22.1, push: -16, strain: -23.5, fall: -43, over: -55.1 } as const;

/** O que as poses de uma variante têm em comum: cada uma só escreve o que muda. */
const REST: Pose = {
  lever: AT.hold,
  hip: [-85, -26],
  lean: 0,
  stretch: 1,
  head: 0,
  nearHand: [-80, -20],
  nearElbow: 1,
  nearGrip: 0,
  farHand: [-50, -20],
  farElbow: 1,
  farGrip: 0,
  nearAnkle: stand(-90),
  nearKnee: 1,
  nearFoot: 0,
  farAnkle: stand(-62),
  farKnee: 1,
  farFoot: 0,
  turn: 0.8,
  nod: 0,
  faceSize: 1,
  gaze: [0.3, 0],
  cross: [0, 0],
  pupil: 1,
  nearLid: 0.3,
  farLid: 0.2,
  squint: 0,
  nearBrow: [0, 0],
  farBrow: [0, 0],
  mouth: [10, 0, 0.3],
  grit: 0,
};

/** Os rostos das quatro poses, que as duas variantes dividem. */
const FACE = {
  // Firme: o queixo erguido, a pálpebra pesada de quem está satisfeita, um sorriso de canto.
  firm: {
    gaze: [0.4, -0.15],
    nearLid: 0.5,
    farLid: 0.42,
    squint: 0.3,
    nearBrow: [-0.15, 3],
    farBrow: [-0.15, 4],
    mouth: [12, 0, 0.9],
  },
  // Esforço: um olho apertado, o outro na haste, os dentes cerrados.
  push: {
    gaze: [0.7, 0.1],
    nearLid: 1,
    farLid: 0.25,
    squint: 0.55,
    nearBrow: [0.35, -2],
    farBrow: [0.05, 1],
    mouth: [15, 0.6, 0],
    grit: 1,
  },
  // Atordoada: as pupilas desencontradas, uma sobrancelha para cada lado, a boca torta.
  dazed: {
    turn: 0.4,
    gaze: [0, -0.1],
    cross: [0.5, -0.4],
    pupil: 0.72,
    nearLid: 0.05,
    farLid: 0.4,
    nearBrow: [-0.4, 5],
    farBrow: [0.2, 0],
    mouth: [9, 0, -0.5],
  },
  // Dormindo: os olhos fechados em arco, a sobrancelha solta, um sorriso pequeno.
  asleep: {
    gaze: [0, 0.4],
    nearLid: 1,
    farLid: 1,
    nearBrow: [-0.25, 1],
    farBrow: [-0.25, 1],
    mouth: [9, 0, 0.7],
  },
} satisfies Record<string, Partial<Pose>>;

/**
 * A Vigília no número, da pose 1 à 8. Como o corpo é um volume só, quem diz a pose
 * é a atitude dele inteiro: a inclinação vai de -50° (jogada de costas) a 62°
 * (deitada contra a haste), o achatamento de 0,82 (o tombo) a 1,12 (o susto),
 * e ele sai do chão no tranco e na queda.
 */
export const POSES: readonly Pose[] = [
  // 1. Firme: de pé ao lado da haste, pendendo para trás de tão segura, uma mão nela e a outra na cintura, um casco no calcanhar.
  {
    ...REST,
    ...FACE.firm,
    lever: AT.hold,
    hip: [-86, -24],
    lean: -9,
    stretch: 1.04,
    head: -4,
    nod: -0.6,
    farHand: grip(AT.hold, 0.139),
    farGrip: 1,
    nearHand: [-116, -36],
    nearElbow: -1,
    nearAnkle: stand(-93),
    farAnkle: stand(-61, -25),
    farFoot: -25,
  },
  // 2. Leva o tranco: sai do chão, esticada e jogada para trás, de frente para a câmera, os dois braços abertos e os cascos soltos.
  {
    ...REST,
    lever: AT.jolt,
    hip: [-100, -52],
    lean: -22,
    stretch: 1.12,
    nod: -0.1,
    turn: 0.1,
    faceSize: 1.2,
    nearHand: [-166.8, -82.4],
    nearElbow: -1,
    farHand: [-49.1, -112.7],
    nearAnkle: [-104, -28],
    nearFoot: -20,
    farAnkle: [-70, -44],
    farFoot: -40,
    gaze: [0.3, 0.1],
    pupil: 0.7,
    nearLid: 0,
    farLid: 0,
    nearBrow: [-0.5, 7],
    farBrow: [-0.5, 8],
    mouth: [10, 0.85, 0],
  },
  // 3. Finca o casco e empurra: inclinada na haste, a testa nela, as mãos na base, a perna de trás esticada.
  {
    ...REST,
    ...FACE.push,
    lever: AT.push,
    hip: [-94, -23],
    lean: 32,
    stretch: 0.94,
    head: 4,
    nod: 0.2,
    turn: 0.9,
    farHand: grip(AT.push, 0.1),
    farGrip: 1,
    nearHand: [-42, -30],
    nearAnkle: stand(-119, 40),
    nearFoot: 40,
    farAnkle: stand(-70),
  },
  // 4. Mete o corpo inteiro: deitada quase na horizontal contra a haste, achatada nela, os cascos patinando atrás, e o sono já pesando.
  {
    ...REST,
    lever: AT.strain,
    hip: [-114, -35],
    lean: 62,
    stretch: 0.88,
    head: 6,
    nod: 0.25,
    turn: 1,
    farHand: [-44, -12],
    nearHand: [-78, -9],
    nearAnkle: [-138, -34],
    nearFoot: 60,
    farAnkle: stand(-121, 35),
    farFoot: 35,
    gaze: [0.5, 0.4],
    nearLid: 0.66,
    farLid: 0.78,
    squint: 0.45,
    nearBrow: [-0.5, 0],
    farBrow: [-0.5, 1],
    mouth: [14, 0.5, 0],
    grit: 1,
  },
  // 5. A alavanca vence: a haste desce por cima dela e a leva, tombada de costas no ar, as duas mãos ainda agarradas e os cascos para cima.
  {
    ...REST,
    lever: AT.fall,
    hip: [-71, -45],
    lean: -50,
    stretch: 0.97,
    head: -6,
    nod: -0.1,
    turn: 0.6,
    faceSize: 1.2,
    farHand: grip(AT.fall, 0.52),
    farGrip: 1,
    nearHand: grip(AT.fall, 0.3),
    nearGrip: 1,
    nearAnkle: [-60, -24],
    nearFoot: -30,
    farAnkle: [-40, -52],
    farFoot: -60,
    gaze: [0.5, -0.3],
    pupil: 0.65,
    nearLid: 0,
    farLid: 0,
    nearBrow: [-0.7, 7],
    farBrow: [-0.7, 8],
    mouth: [13, 1, 0],
  },
  // 6. Cai sentada: achatada e larga do tombo, as pernas esticadas para a frente, uma mão no chão e a outra ainda na haste.
  {
    ...REST,
    ...FACE.dazed,
    lever: AT.over,
    hip: [-112, -3],
    lean: -6,
    stretch: 0.82,
    head: -8,
    nod: -0.2,
    farHand: grip(AT.over, 0.22),
    farGrip: 1,
    nearHand: [-168, -10.5],
    nearAnkle: [-99, -9],
    nearFoot: -75,
    farAnkle: [-67, -9],
    farFoot: -70,
  },
  // 7. Tenta se levantar: esticada e pendendo para a frente, um braço escorado no chão, o outro na haste, um casco firme e o outro escorregando.
  {
    ...REST,
    lever: AT.over,
    hip: [-118, -22],
    lean: 18,
    stretch: 1.1,
    head: 4,
    nod: 0.2,
    turn: 0.3,
    farHand: grip(AT.over, 0.27),
    farGrip: 1,
    nearHand: [-141, -10.5],
    nearAnkle: stand(-140, 45),
    nearFoot: 45,
    farAnkle: stand(-98),
    gaze: [0.3, 0.5],
    nearLid: 0.66,
    farLid: 0.55,
    squint: 0.3,
    nearBrow: [-0.5, 1],
    farBrow: [-0.5, 2],
    mouth: [13, 0.45, 0],
    grit: 1,
  },
  // 8. Adormece encostada: tombada para a frente até a haste segurar, mole e baixa, os braços largados e as pernas esticadas no chão.
  {
    ...REST,
    ...FACE.asleep,
    lever: AT.over,
    hip: [-142, -17],
    lean: 30,
    stretch: 0.88,
    head: 8,
    nod: 0.4,
    farHand: [-80, -10.5],
    nearHand: [-116, -10.5],
    nearAnkle: [-125, -10],
    nearFoot: -70,
    farAnkle: [-96, -9],
    farFoot: -60,
  },
];
