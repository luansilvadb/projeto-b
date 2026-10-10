// A atuação da Vigília, pose a pose, sobre as oito poses desenhadas do ovo
// chibi (`poses.ts`). O corpo antigo andava com cada parâmetro numa
// linha contínua e foi recusado: "se mexe como boneco". Aqui cada extremo é
// uma pose inteira, segurada o tempo de ser lida, e a passagem é curta, com
// preparo, sobra e assentamento.
//
// Três trilhas, cada uma com o tempo dela:
//   `BODY`  o corpo: onde o ovo assenta, quanto pende e achata, as mãos e os cascos;
//   `FACE`  o rosto, que não troca em bloco: o olhar chega dois quadros antes da
//           sobrancelha, as pálpebras um quadro antes, e a boca um quadro depois;
//   por cima das duas, o que continua no extremo segurado: a respiração, a
//           piscada, o tremor de quem faz força e, na terceira tentativa, os
//           arrancos do corpo e os cascos que patinam no piso.
//
// A causa vem pela alavanca. A mão presa gira com a haste no mesmo quadro
// (`farGrip` em 1); o corpo só sai um quadro depois. Encostada na haste
// (`pressed`, `carried`), ela não tem tempo próprio: a pose é função do ângulo
// da alavanca, e por isso o empurrão dela e a volta da haste são um movimento só.
//
// Tudo no espaço das poses: a origem no chão embaixo do cubo, o chão plano, e
// a alavanca do cenário menos `SLOPE`.

import { bones, mixPose, type Vec } from "../../art/Vigilia";
import { grip, LEVER as HUB, POSES, SLOPE, stand, type Pose } from "./poses";
import { ACT, E, HIT, HOLD, key, KICK, leverAngle, mix, pulse, SIT, span, strain } from "./timing";

const [FIRM, JOLT, PUSH, ALLIN, TAKEN, SAT, RISE, SLEEP] = POSES;

type Ease = (u: number) => number;
/** Uma pose parada, ou uma que depende do instante (a que anda com a alavanca). */
type Maker = Pose | ((t: number) => Pose);
type Cut = readonly [at: number, pose: Maker, ease?: Ease];

const made = (maker: Maker, t: number) => (typeof maker === "function" ? maker(t) : maker);

/** A pose num instante, entre as poses-chave: a curva de cada trecho é a da chegada, como em `key`. */
const track = (t: number, cuts: readonly Cut[]): Pose => {
  if (t <= cuts[0][0]) {
    return made(cuts[0][1], t);
  }
  for (let index = 1; index < cuts.length; index++) {
    const [end, to, ease = E.io] = cuts[index];
    if (t <= end) {
      const [start, from] = cuts[index - 1];
      return mixPose(made(from, t), made(to, t), ease((t - start) / (end - start)));
    }
  }
  return made(cuts[cuts.length - 1][1], t);
};

const but = (pose: Pose, changes: Partial<Pose>): Pose => ({ ...pose, ...changes });
/** Um ângulo da alavanca do cenário, no espaço das poses. */
const at = (scene: number) => scene - SLOPE;
/** A alavanca agora, no espaço das poses: é a que o boneco recebe. */
export const leverOf = (t: number) => at(leverAngle(t));
const HELD = at(HOLD);

// ---- O corpo: as poses de passagem ----
// As oito desenhadas são os extremos. As daqui são as que faltavam entre elas:
// a mesma pose noutro ângulo da alavanca, o impacto, a sobra, o preparo.

/** Pose 2 no primeiro tranco, que é pequeno: mais perto da haste que a desenhada, com a mão de lá ainda presa, o braço esticado. */
const HOP = but(JOLT, {
  lever: at(-10.6),
  hip: [-91, -52],
  farHand: grip(at(-10.6), 0.3),
  farGrip: 1,
  nearHand: [-157.8, -82.4],
  nearAnkle: [-95, -28],
  farAnkle: [-61, -44],
});
/** O alto do pulo: o corpo já não estica, e ainda sobe um nada. */
const HOP_TOP = but(HOP, { hip: [-92, -55], lean: -25, stretch: 1.05 });
/** Volta ao chão: achata e alarga, os cascos juntos embaixo dela. */
const LAND = but(FIRM, {
  lever: at(-7.5),
  hip: [-89, -13],
  lean: -5,
  stretch: 0.84,
  head: 0,
  turn: 0.6,
  farHand: grip(at(-7.5), 0.16),
  nearHand: [-128, -30],
  nearAnkle: stand(-98),
  farAnkle: stand(-66),
  farFoot: 0,
});
/** De pé, de frente para a haste, uma mão nela e a outra em guarda: já não confia. */
const WARY = but(FIRM, {
  hip: [-88, -24],
  lean: 4,
  stretch: 1,
  head: 0,
  turn: 0.9,
  farHand: grip(HELD, 0.15),
  nearHand: [-60, -44],
  nearElbow: 1,
  nearAnkle: stand(-101),
  farAnkle: stand(-68),
  farFoot: 0,
});
const WARY_UP = but(WARY, { hip: [-88, -28], lean: 1, stretch: 1.06 });
/** Espera o segundo tranco: um casco fincado atrás, o corpo bem para a frente, as duas mãos na base. Só as mãos tocam a haste. */
const BRACE = but(PUSH, {
  lever: HELD,
  hip: [-89, -22],
  lean: 23,
  stretch: 0.96,
  head: 3,
  farHand: grip(HELD, 0.14),
  nearHand: [-44, -31],
  nearAnkle: stand(-112, 35),
  nearFoot: 35,
  farAnkle: stand(-66),
});
/** O segundo tranco a empurra: o corpo vai para trás e achata, a mão de cá solta, os cascos escorregam um pouco. */
const SHOVED_FAR = but(BRACE, {
  lever: at(-19.5),
  hip: [-103, -22],
  lean: -9,
  stretch: 0.88,
  head: -2,
  turn: 0.7,
  farHand: grip(at(-19.5), 0.2),
  nearHand: [-76, -56],
  nearAnkle: stand(-113, 20),
  nearFoot: 20,
  farAnkle: stand(-74),
});
const SHOVED = but(SHOVED_FAR, {
  lever: at(-17.6),
  hip: [-97, -23],
  lean: 3,
  stretch: 0.98,
  head: 0,
  turn: 0.85,
  farHand: grip(at(-17.6), 0.13),
  nearHand: [-62, -44],
});
/** O preparo do empurrão: abaixa e recua um nada antes de ir. */
const GATHER = but(SHOVED, {
  lever: at(-18.6),
  hip: [-99, -18],
  lean: -2,
  stretch: 0.88,
  farHand: grip(at(-18.6), 0.12),
  nearHand: [-66, -36],
  nearAnkle: stand(-113, 35),
  nearFoot: 35,
});
/** Pose 3 com a haste cedida, no começo do empurrão: a perna de trás ainda dobrada. */
const PUSH_FROM = but(PUSH, {
  lever: at(-18.6),
  hip: [-96, -21],
  lean: 31,
  stretch: 0.9,
  head: 3,
  farHand: grip(at(-18.6), 0.1),
  nearHand: [-46, -30],
  nearAnkle: stand(-113, 40),
  farAnkle: stand(-74),
});
/** Pose 3 com a haste de volta ao lugar: a perna de trás esticou. É o extremo que ela segura. */
const PUSH_TO = but(PUSH, {
  lever: HELD,
  hip: [-88, -23],
  lean: 35,
  stretch: 0.95,
  farHand: grip(HELD, 0.1),
  nearHand: [-42, -30],
  nearAnkle: stand(-113, 40),
  farAnkle: stand(-74),
});
/** O terceiro tranco: a haste vem com tudo, joga-a para trás e os dois cascos escorregam. */
const BOWLED_FAR = but(PUSH_TO, {
  lever: at(-31.5),
  hip: [-113, -21],
  lean: 8,
  stretch: 0.86,
  head: 0,
  turn: 0.75,
  farHand: grip(at(-31.5), 0.2),
  nearHand: [-92, -62],
  nearAnkle: stand(-130, 20),
  nearFoot: 20,
  farAnkle: stand(-92),
});
/** E ela volta a encostar a testa na haste, que agora pende por cima dela. */
const BOWLED = but(BOWLED_FAR, {
  lever: at(-28.8),
  hip: [-106, -22],
  lean: 20,
  stretch: 0.97,
  head: 2,
  turn: 0.85,
  farHand: grip(at(-28.8), 0.2),
  nearHand: [-70, -50],
  nearAnkle: stand(-130, 30),
  nearFoot: 30,
});
/** Arma o corpo: abaixa, pende para trás, o braço de cá recua. */
const WINDUP = but(BOWLED, {
  lever: at(-29.8),
  hip: [-110, -15],
  lean: -5,
  stretch: 0.86,
  head: -2,
  turn: 0.8,
  farHand: grip(at(-29.8), 0.22),
  nearHand: [-140, -40],
  nearElbow: -1,
});
/**
 * Pose 4, numa variante em que o rosto se lê. A desenhada deita a 62°: o rosto vira de lado, a
 * silhueta fecha num círculo, e lia como "caiu ali". Esta pende 46°, com o rosto girado de volta
 * dentro do ovo (`head`), a base fora do chão e os dois cascos atrás, no piso: o peso todo está na
 * haste. `RAM_FROM` é com a haste cedida, quando ela bate; `RAM_TO`, com a haste de volta até a
 * metade. O braço de cá vai para trás, de quem corre no lugar.
 */
const RAM_FROM = but(ALLIN, {
  lever: at(-29.8),
  hip: [-137, -30],
  lean: 46,
  stretch: 0.96,
  head: -10,
  farHand: [-60, -18],
  nearHand: [-148, -50],
  nearAnkle: stand(-150, 40),
  nearFoot: 40,
  farAnkle: stand(-139, 35),
  farFoot: 35,
});
const RAM_TO = but(RAM_FROM, {
  lever: at(-18.6),
  hip: [-116, -30],
  farHand: [-42, -20],
  nearHand: [-127, -50],
  nearAnkle: stand(-129, 40),
  farAnkle: stand(-118, 35),
});
/** O bote, no ar: esticada, a cabeça no alto, os cascos para trás. Dali ela desce na haste. */
const LUNGE = but(RAM_FROM, {
  hip: [-138, -32],
  lean: 26,
  stretch: 1.1,
  head: -4,
  farHand: [-62, -50],
  nearHand: [-152, -53],
  nearAnkle: [-159, -23],
  nearFoot: 55,
  farAnkle: [-138, -16],
  farFoot: 30,
});
/**
 * A intermediária da pose 4 para a 5: a haste desce, empurra a cabeça dela para
 * trás e a põe de pé, baixa, com os cascos saindo do chão. Sem ela, a mistura
 * reta passa por ela em pé e alta, como se levantasse.
 */
const ROLL = but(TAKEN, {
  lever: at(-32.2),
  hip: [-104, -14],
  lean: 4,
  stretch: 0.92,
  head: 0,
  turn: 0.8,
  farHand: grip(at(-32.2), 0.25),
  nearHand: [-72, -50],
  nearGrip: 0,
  nearAnkle: [-118, -10],
  nearFoot: -10,
  farAnkle: [-86, -12],
  farFoot: -20,
});
/** Bate sentada, ainda de costas: a pose 6 no impacto, antes de o ovo balançar para a frente. */
const SAT_HIT = but(SAT, {
  lever: at(-55.5),
  hip: [-88, -17],
  lean: -45,
  turn: 0.5,
  farHand: grip(at(-55.5), 0.36),
  nearHand: [-132, -38],
  nearAnkle: [-80, -24],
  nearFoot: -50,
  farAnkle: [-56, -42],
  farFoot: -65,
});
/**
 * A pose 6 como foi desenhada, achatada e larga, é a que ela segura de olhos apertados até a onda
 * de luz passar: chega com um nada de sobra (`SAT_OVER`) e assenta nela. Só depois o ovo volta à
 * forma, balança no fundo redondo e senta de vez (`SAT_DOWN`, que não estava desenhada).
 */
const SAT_OVER = but(SAT, { hip: [-113, -3], lean: -1 });
const SAT_FORTH = but(SAT, { hip: [-113, -5.5], lean: 3, stretch: 1.05, head: -4, nearHand: [-160, -10.5], farAnkle: [-70, -9] });
const SAT_BACK = but(SAT, { hip: [-112, -6.5], lean: -9, stretch: 0.95, nearHand: [-166, -10.5], farAnkle: [-69, -9] });
const SAT_DOWN = but(SAT, { hip: [-112, -4.5], stretch: 0.97, nearHand: [-166, -10.5], farAnkle: [-69, -9] });
/** O preparo de levantar: afunda antes de subir. */
const SINK = but(SAT_DOWN, { hip: [-112, -6], lean: -10, stretch: 0.9, head: -6 });
/** Sobe até a metade, os cascos já embaixo dela e o braço escorado, e emperra: cede um nada antes de ir o resto. */
const RISE_HALF = but(RISE, {
  hip: [-115, -13],
  lean: 8,
  stretch: 1.02,
  head: 0,
  turn: 0.35,
  farHand: grip(RISE.lever, 0.24),
  nearHand: [-150, -10.5],
  nearAnkle: stand(-132, 30),
  nearFoot: 30,
  farAnkle: stand(-94),
});
const RISE_STUCK = but(RISE_HALF, { hip: [-115, -9.5], lean: 5, stretch: 0.95 });
const RISE_UP = but(RISE, { hip: [-118, -23], lean: 19.5, stretch: 1.115 });
/** Desaba de volta: sentada, pendendo para a frente, as pernas escorregadas. */
const SLUMP = but(RISE, {
  hip: [-121, -9],
  lean: 14,
  stretch: 0.88,
  turn: 0.5,
  farHand: grip(RISE.lever, 0.22),
  nearHand: [-150, -10.5],
  nearAnkle: [-110, -9],
  nearFoot: -55,
  farAnkle: [-82, -9],
  farFoot: -55,
});
const SLUMP_UP = but(SLUMP, { hip: [-121, -10], lean: 15, stretch: 0.96 });
/** A testa bate na haste e afunda um nada; a mão de lá ainda vem caindo. */
const REST_DEEP = but(SLEEP, { hip: [-144, -18], lean: 34, stretch: 0.85, farHand: [-72, -22] });

// ---- As poses que andam com a alavanca ----

/** Quanto a alavanca já andou de um ângulo a outro: passa de 1 e fica abaixo de 0, e é o que dá a sobra. */
const along = (t: number, from: Pose, to: Pose) => (leverOf(t) - from.lever) / (to.lever - from.lever);
/** Encostada na haste: a pose 3 e a pose 4 seguem o ângulo dela, cedendo e voltando juntas. */
const pressed3 = (t: number) => mixPose(PUSH_FROM, PUSH_TO, along(t, PUSH_FROM, PUSH_TO));
const pressed4 = (t: number) => mixPose(RAM_FROM, RAM_TO, along(t, RAM_FROM, RAM_TO));

const spin = ([x, y]: Vec, degrees: number): Vec => {
  const turn = (degrees * Math.PI) / 180;
  return [x * Math.cos(turn) - y * Math.sin(turn), x * Math.sin(turn) + y * Math.cos(turn)];
};
/** Pose 5, pendurada na haste: o corpo inteiro gira com ela em volta do cubo, até o batente. */
const carried = (t: number): Pose => {
  const turn = leverOf(t) - TAKEN.lever;
  const round = ([x, y]: Vec): Vec => {
    const [dx, dy] = spin([x - HUB.hub[0], y - HUB.hub[1]], turn);
    return [HUB.hub[0] + dx, HUB.hub[1] + dy];
  };
  return {
    ...TAKEN,
    hip: round(TAKEN.hip),
    lean: TAKEN.lean + turn,
    nearAnkle: round(TAKEN.nearAnkle),
    farAnkle: round(TAKEN.farAnkle),
    nearFoot: TAKEN.nearFoot + turn,
    farFoot: TAKEN.farFoot + turn,
  };
};

// ---- O corpo: a sequência ----

const BODY: readonly Cut[] = [
  // O que ela quer: a pose 1, até a primeira gota cobrar.
  [0, FIRM],
  // 1º tranco. Sem preparo, que é susto: a haste vai num quadro, o corpo no seguinte.
  [ACT.hop.off, FIRM],
  [ACT.hop.top, HOP, E.out],
  [ACT.hop.top + 0.1, HOP_TOP, E.sine],
  [ACT.hop.land, LAND, E.in],
  [ACT.hop.land + 0.1, WARY_UP, E.out],
  [ACT.hop.set, WARY, E.sine],
  // A segunda gota ela vê cair: finca o casco antes de o pulso chegar.
  [ACT.brace[0], WARY],
  [ACT.brace[1], BRACE, E.io],
  // 2º tranco: é empurrada, junta o corpo e empurra de volta.
  [ACT.shoved[0], BRACE],
  [ACT.shoved[0] + 0.1, SHOVED_FAR, E.out],
  [ACT.shoved[0] + 0.24, SHOVED, E.sine],
  [ACT.gather[0], SHOVED],
  [ACT.push[0] - 0.02, GATHER, E.io],
  [ACT.push[0] + 0.12, pressed3, E.out],
  // 3º tranco: encostada, cede junto com a haste; depois escorrega, arma o corpo e se joga.
  [ACT.shoved[1], pressed3],
  [ACT.shoved[1] + 0.12, BOWLED_FAR, E.out],
  [ACT.shoved[1] + 0.28, BOWLED, E.sine],
  [ACT.gather[1], BOWLED],
  [ACT.dive[0] - 0.06, WINDUP, E.io],
  [ACT.dive[0], WINDUP],
  // O bote: sai do chão depressa, e desce na haste. A batida (achatar, voltar) e os arrancos vêm por cima, em `heaveOf`.
  [ACT.dive[0] + 0.09, LUNGE, E.out],
  [ACT.dive[1], pressed4, E.in],
  // A quarta gota: a haste a põe de pé, a leva de costas e a larga sentada.
  [ACT.taken[0], pressed4],
  [(ACT.taken[0] + ACT.taken[1]) / 2, ROLL, E.lin],
  [ACT.taken[1], carried, E.lin],
  [KICK[3] + 0.335, carried],
  [SIT, SAT_HIT, E.lin],
  [ACT.flat[0], SAT_OVER, E.sine],
  [ACT.flat[0] + 0.08, SAT, E.sine],
  // Segura achatada, sentada, até a onda acabar de passar: é o impacto, e precisa de quadros limpos.
  [ACT.flat[1], SAT],
  [ACT.flat[1] + 0.1, SAT_FORTH, E.out],
  [ACT.flat[1] + 0.21, SAT_BACK, E.sine],
  [ACT.sat, SAT_DOWN, E.sine],
  // Tenta levantar, e não dá.
  [ACT.rise[0], SAT_DOWN],
  [ACT.rise[1], SINK, E.sine],
  [ACT.rise[2], RISE_HALF, E.out],
  [ACT.rise[3], RISE_STUCK, E.sine],
  [ACT.rise[4], RISE_UP, E.io],
  [ACT.rise[4] + 0.08, RISE, E.sine],
  [ACT.rise[5], RISE],
  [ACT.rise[6], SLUMP, E.in],
  [ACT.rest[0], SLUMP_UP, E.out],
  // Cede: tomba para a frente até a haste segurar.
  [ACT.rest[1], REST_DEEP, E.in],
  [ACT.rest[2], SLEEP, E.sine],
];

// ---- O rosto ----
// Cada expressão é uma pose inteira, de que só o rosto é lido: assim `mixPose` serve às duas trilhas.

const face = (changes: Partial<Pose>): Pose => ({
  ...FIRM,
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
  ...changes,
});

const LOOK = {
  /** O susto do primeiro tranco: o rosto da pose 2, de olho na haste que a jogou. */
  startle: but(JOLT, { gaze: [0.8, 0.25] }),
  flinch: face({ faceSize: 1.1, gaze: [0.8, 0.3], pupil: 0.8, nearLid: 0.7, farLid: 0.65, squint: 0.3, nearBrow: [-0.5, 5], farBrow: [-0.5, 5], mouth: [9, 0.35, 0] }),
  /** Desconfiada, de olho na base da haste. */
  wary: face({ gaze: [0.75, 0.35], pupil: 0.9, nearLid: 0.1, farLid: 0.08, squint: 0.1, nearBrow: [-0.4, 4], farBrow: [-0.4, 5], mouth: [9, 0, -0.4] }),
  /** Vê a segunda gota ainda no ar e a acompanha até bater no reservatório. */
  falling: face({ nod: -0.25, gaze: [0.95, -0.8], pupil: 0.9, nearLid: 0.05, farLid: 0.05, nearBrow: [-0.45, 5], farBrow: [-0.45, 6], mouth: [8, 0.2, 0] }),
  drop: face({ nod: -0.15, gaze: [0.95, -0.45], pupil: 0.9, nearLid: 0.05, farLid: 0.05, nearBrow: [-0.45, 5], farBrow: [-0.45, 6], mouth: [8, 0.2, 0] }),
  /** Fincada, de dentes cerrados, segue o pulso pelo conduto, do pé do reservatório até a base da haste. */
  braced: face({ nod: 0.1, gaze: [0.95, 0.15], pupil: 0.95, nearLid: 0.45, farLid: 0.25, squint: 0.4, nearBrow: [0.35, -2], farBrow: [0.2, -1], mouth: [14, 0.5, 0], grit: 1 }),
  grit: face({ nod: 0.2, gaze: [0.7, 0.5], nearLid: 0.6, farLid: 0.3, squint: 0.5, nearBrow: [0.35, -2], farBrow: [0.2, -1], mouth: [14, 0.5, 0], grit: 1 }),
  shock: face({ faceSize: 1.12, nod: -0.1, gaze: [0.6, -0.35], pupil: 0.75, nearLid: 0, farLid: 0, nearBrow: [-0.5, 6], farBrow: [-0.5, 7], mouth: [10, 0.7, 0] }),
  /** A raiva de quem vai empurrar de volta. */
  mad: face({ nod: 0.1, gaze: [0.7, -0.05], pupil: 0.95, nearLid: 0.3, farLid: 0.25, squint: 0.45, nearBrow: [0.55, -2], farBrow: [0.5, -2], mouth: [13, 0.4, 0], grit: 1 }),
  /** Empurrando, um olho se abre para o reservatório quando a terceira gota bate; e ela se encolhe para o tranco. */
  peek: but(PUSH, { gaze: [1, -0.25], nearLid: 0.75, farLid: 0.05, squint: 0.3, nearBrow: [-0.1, 1], farBrow: [-0.3, 4], mouth: [13, 0.4, 0] }),
  squeeze: but(PUSH, { gaze: [0.7, 0.3], nearLid: 1, farLid: 0.85, squint: 0.75, nearBrow: [0.45, -2], farBrow: [0.4, -2], mouth: [16, 0.65, 0] }),
  bowled: face({ faceSize: 1.18, nod: -0.2, gaze: [0.55, -0.55], pupil: 0.65, nearLid: 0, farLid: 0, nearBrow: [-0.6, 7], farBrow: [-0.6, 8], mouth: [11, 0.9, 0] }),
  furious: face({ gaze: [0.7, -0.3], pupil: 0.9, nearLid: 0.35, farLid: 0.3, squint: 0.55, nearBrow: [0.7, -3], farBrow: [0.65, -3], mouth: [15, 0.55, 0], grit: 1 }),
  /** No bote a boca abre; na batida, os dois olhos apertam por uns quadros. */
  yell: face({ faceSize: 1.1, nod: 0.1, gaze: [0.8, -0.1], pupil: 0.9, nearLid: 0.4, farLid: 0.35, squint: 0.5, nearBrow: [0.7, -3], farBrow: [0.65, -3], mouth: [17, 1, 0] }),
  thud: face({ faceSize: 1.12, nod: 0.2, gaze: [0.7, 0.2], nearLid: 1, farLid: 1, squint: 0.85, nearBrow: [0.5, -2], farBrow: [0.45, -2], mouth: [18, 0.6, 0], grit: 1 }),
  /** A cara de esforço da pose 3 levada mais longe: um olho apertado, o outro aberto na haste, os dentes maiores. */
  ram: face({ faceSize: 1.12, nod: 0.15, gaze: [0.8, -0.15], pupil: 0.85, nearLid: 1, farLid: 0.1, squint: 0.6, nearBrow: [0.6, -3], farBrow: [0.3, 2], mouth: [18, 0.75, 0], grit: 1 }),
  /** Perdendo força: a sobrancelha cai e o olho aberto começa a pesar. O rosto desenhado da pose 4, com o sono nos dois olhos, vem depois. */
  fading: face({ faceSize: 1.06, nod: 0.2, gaze: [0.7, 0.15], pupil: 0.9, nearLid: 1, farLid: 0.45, squint: 0.5, nearBrow: [-0.2, -1], farBrow: [-0.4, 2], mouth: [15, 0.55, 0], grit: 1 }),
  /** O reservatório transborda: ela olha para lá antes de a haste vir. */
  glance: but(ALLIN, { gaze: [1, -0.15], nearLid: 0.35, farLid: 0.4, squint: 0.2, nearBrow: [-0.5, 3], farBrow: [-0.5, 4], mouth: [12, 0.35, 0], grit: 0 }),
  wince: but(SAT, { faceSize: 1.05, cross: [0, 0], nearLid: 1, farLid: 1, squint: 0.8, nearBrow: [0.3, 0], farBrow: [0.3, 0], mouth: [14, 0.5, 0], grit: 1 }),
  /** Sentada, olha a haste que passou por cima dela: entendeu. */
  lever: face({ nod: -0.35, gaze: [0.6, -0.7], pupil: 0.9, nearLid: 0.12, farLid: 0.15, nearBrow: [-0.55, 4], farBrow: [-0.55, 5], mouth: [9, 0, -0.7] }),
  /** Emperrada no meio do caminho: aperta os olhos e faz mais força. */
  stuck: but(RISE, { nearLid: 0.95, farLid: 0.7, squint: 0.55, nearBrow: [0.2, 0], farBrow: [0, 1], mouth: [15, 0.6, 0] }),
  spent: but(RISE, { gaze: [0.3, 0.6], nearLid: 0.85, farLid: 0.8, squint: 0.15, nearBrow: [-0.45, 0], farBrow: [-0.45, 0], mouth: [10, 0.2, 0], grit: 0 }),
};

/** Os instantes são os da sobrancelha: o olhar chega antes dela e a boca, depois. */
const FACE: readonly Cut[] = [
  [0, FIRM],
  // O susto vem depois do tranco: o rosto ainda é o de antes quando o corpo já saiu do chão.
  [KICK[0] + 0.07, FIRM],
  [KICK[0] + 0.17, LOOK.startle, E.out],
  [ACT.hop.land - 0.02, LOOK.startle],
  [ACT.hop.land + 0.06, LOOK.flinch, E.sine],
  [ACT.hop.land + 0.21, LOOK.wary, E.sine],
  // Olha a gota que cai, e é por vê-la que finca o casco antes do tranco.
  [ACT.hop.land + 0.28, LOOK.falling, E.out],
  [HIT[1] + 0.06, LOOK.drop, E.lin],
  [HIT[1] + 0.12, LOOK.drop],
  [KICK[1] - 0.19, LOOK.braced, E.sine],
  [KICK[1], LOOK.grit, E.lin],
  [KICK[1] + 0.1, LOOK.grit],
  [KICK[1] + 0.18, LOOK.shock, E.out],
  [KICK[1] + 0.27, LOOK.shock],
  [KICK[1] + 0.38, LOOK.mad, E.sine],
  [KICK[1] + 0.5, LOOK.mad],
  [KICK[1] + 0.62, PUSH, E.out],
  [HIT[2], PUSH],
  [HIT[2] + 0.1, LOOK.peek, E.out],
  [HIT[2] + 0.2, LOOK.peek],
  [KICK[2] - 0.06, LOOK.squeeze, E.sine],
  [KICK[2] + 0.07, LOOK.squeeze],
  [KICK[2] + 0.15, LOOK.bowled, E.out],
  [KICK[2] + 0.26, LOOK.bowled],
  [KICK[2] + 0.38, LOOK.furious, E.sine],
  [ACT.dive[0] + 0.02, LOOK.furious],
  [ACT.dive[0] + 0.09, LOOK.yell, E.out],
  [ACT.dive[1] - 0.01, LOOK.yell],
  [ACT.dive[1] + 0.04, LOOK.thud, E.out],
  [ACT.dive[1] + 0.13, LOOK.thud],
  [ACT.dive[1] + 0.23, LOOK.ram, E.sine],
  // Enquanto ganha terreno, a cara é a de esforço; quando os arrancos já não rendem, o sono pesa.
  [ACT.surge[4], LOOK.ram],
  [ACT.surge[5], LOOK.fading, E.sine],
  [ACT.surge[6] + 0.02, ALLIN, E.sine],
  [HIT[3], ALLIN],
  [HIT[3] + 0.08, LOOK.glance, E.out],
  [KICK[3] + 0.04, LOOK.glance],
  [KICK[3] + 0.14, TAKEN, E.out],
  [SIT - 0.02, TAKEN],
  [SIT + 0.05, LOOK.wince, E.out],
  // De olhos apertados até a onda passar; só então os abre, tonta, e olha a haste.
  [ACT.flat[1] + 0.02, LOOK.wince],
  [ACT.flat[1] + 0.14, SAT, E.sine],
  [ACT.sat - 0.1, SAT],
  [ACT.sat + 0.02, LOOK.lever, E.io],
  [ACT.rise[0] + 0.03, LOOK.lever],
  [ACT.rise[1] + 0.03, RISE, E.sine],
  [ACT.rise[2], RISE],
  [ACT.rise[3], LOOK.stuck, E.sine],
  [ACT.rise[4] - 0.04, RISE, E.sine],
  [ACT.rise[5] - 0.08, RISE],
  [ACT.rise[6] - 0.04, LOOK.spent, E.sine],
  [ACT.rest[0], LOOK.spent],
  // Os olhos fecham antes de o corpo tombar: é o sono que a leva, e não um tombo.
  [ACT.rest[0] + 0.2, SLEEP, E.sine],
];

// ---- O que continua no extremo segurado ----

/** De 0 a 1 dentro de um trecho, entrando e saindo em `fade` segundos. */
const during = (t: number, from: number, to: number, fade = 0.2) => span(t, from, from + fade) * (1 - span(t, to - fade, to));

/** A respiração: calma na pose 1, curta depois do susto, arfando enquanto segura a haste na pose 3, ofegante sentada, funda e lenta dormindo. */
const breathOf = (t: number) =>
  0.014 * during(t, -1, ACT.hop.off + 0.2) * Math.sin((t / 2.6) * 2 * Math.PI) +
  0.012 * during(t, ACT.hop.set, ACT.brace[1]) * Math.sin((t / 1.1) * 2 * Math.PI) +
  0.013 * during(t, ACT.push[1], ACT.shoved[1], 0.15) * Math.sin((t / 0.47) * 2 * Math.PI) +
  0.02 * during(t, ACT.sat, ACT.rise[1]) * Math.sin(((t - ACT.sat) / 0.9) * 2 * Math.PI) +
  0.03 * span(t, ACT.rest[2] - 0.1, ACT.rest[2] + 0.5) * Math.sin(((t - ACT.rest[2]) / 4.2) * 2 * Math.PI);

/** As piscadas: uma lenta, de quem está tranquila; e uma sentada, quando tira os olhos do nada e os leva à haste. */
const blinkOf = (t: number) => 0.6 * pulse(t, 2.62, 0.22) + pulse(t, ACT.sat - 0.11, 0.1);

/** Fazendo força, ela treme com a haste: nos dois empurrões e enquanto segura. */
const effortOf = (t: number) => during(t, ACT.push[0] + 0.1, ACT.shoved[1] + 0.03, 0.12) + during(t, ACT.dive[1], KICK[3] + 0.1, 0.12);

/** O olho aberto da terceira tentativa aperta um nada a cada arranco. */
const grimaceOf = (t: number) => ACT.surge.slice(1).reduce((sum, at, index) => sum + 0.35 * DRIVE[index + 1] * pulse(t, at - 0.01, 0.15), 0);

/** A força de cada arranco: o primeiro é a batida do bote; os três últimos já não ganham terreno. */
const DRIVE = [1, 0.9, 0.78, 0.62, 0.42, 0.32, 0.22] as const;

/**
 * O corpo na terceira tentativa, em pulsos que se veem no plano: o valor soma ao achatamento. Na
 * batida do bote ela chega esticada, achata contra a haste por uns quadros e volta; em cada
 * arranco recolhe um nada, estica contra a haste e achata nela, cada vez com menos força.
 */
const heaveOf = (t: number) => ({
  hit: key(t - ACT.surge[0], [
    [-0.06, 0],
    [-0.01, 0.07, E.sine],
    [0.05, -0.14, E.out],
    [0.12, -0.13],
    [0.21, 0.03, E.sine],
    [0.3, 0, E.sine],
  ]),
  surge: ACT.surge.slice(1).reduce(
    (sum, at, index) =>
      sum +
      DRIVE[index + 1] *
        key(t - at, [
          [-0.08, 0],
          [-0.02, -0.04, E.sine],
          [0.06, 0.11, E.out],
          [0.14, -0.08, E.sine],
          [0.24, 0, E.sine],
        ]),
    0,
  ),
});

/**
 * Os cascos na terceira tentativa, sempre no piso: a cada arranco um deles empurra, escorregando
 * para trás encostado no chão até o arranco seguinte, e o outro volta para a frente num passinho.
 * `slip` vai de 0 (à frente) a 1 (atrás); `lift`, de 0 a 1, é o passinho.
 */
const strideOf = (t: number) => {
  const hoof = (drives: 0 | 1) => {
    let slip = drives === 0 ? 0 : 1;
    let lift = 0;
    ACT.surge.forEach((at, index) => {
      if (t < at) {
        return;
      }
      if (index % 2 === drives) {
        slip = E.out(span(t, at, ACT.surge[index + 1] ?? KICK[3] + 0.12));
        lift = 0;
      } else {
        const step = span(t, at, at + 0.1);
        slip = 1 - E.io(step);
        lift = Math.sin(Math.PI * step);
      }
    });
    return { slip, lift };
  };
  return { near: hoof(0), far: hoof(1), on: during(t, ACT.dive[1] - 0.03, KICK[3] + 0.14, 0.06) };
};

/** Os passos, que saem do chão em vez de arrastar: o casco que recua para fincar, e os dois que ela junta embaixo de si para levantar. */
const stepOf = (t: number) => ({
  near: 7 * pulse(t, ACT.brace[0] + 0.02, 0.14) + 7 * pulse(t, ACT.rise[1] + 0.01, 0.14),
  far: 4 * pulse(t, ACT.rise[1], 0.12),
});

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

/** Quanto o que está mais baixo nela (um casco, a barriga) está acima do chão: é o que afasta a sombra. */
export const liftOf = (pose: Pose) => {
  const hoof = (ankle: Vec, foot: number) => stand(0, foot)[1] - ankle[1];
  const belly = -pose.hip[1] - (4 + 0.5 * Math.abs(pose.lean));
  return Math.max(0, Math.min(hoof(pose.nearAnkle, pose.nearFoot), hoof(pose.farAnkle, pose.farFoot), belly));
};

/** A Vigília num instante: a pose que o boneco desenha, onde o meio dela está (para a sombra) e quanto saiu do chão. */
export const vigiliaAt = (t: number) => {
  const body = track(t, BODY);
  // O rosto troca em sequência curta: o olhar, as pálpebras, a sobrancelha, a boca.
  const eyes = track(t + 0.06, FACE);
  const lids = track(t + 0.03, FACE);
  const brows = track(t, FACE);
  const lips = track(t - 0.04, FACE);

  const effort = effortOf(t);
  const shake = strain(t) * effort;
  // Na pose 7 o tremor é o do braço que não aguenta: um pouco quando emperra, e lá em cima.
  const quiver =
    (0.6 * during(t, ACT.rise[2], ACT.rise[3] + 0.04, 0.05) + during(t, ACT.rise[4], ACT.rise[5] + 0.06, 0.07)) * Math.sin(t * 8.5 * 2 * Math.PI);
  // E o casco de trás vai escorregando até ela desabar.
  const slide = 10 * E.in(span(t, ACT.rise[4] + 0.1, ACT.rise[5] + 0.04)) * (1 - span(t, ACT.rise[5] + 0.04, ACT.rise[6]));
  const asleep = span(t, ACT.rest[2] - 0.1, ACT.rest[2] + 0.5) * Math.sin(((t - ACT.rest[2]) / 4.2) * 2 * Math.PI);
  const step = stepOf(t);
  const shut = blinkOf(t);

  // A terceira tentativa. O corpo pulsa ao longo do próprio eixo, e a base anda no sentido contrário:
  // é a testa que fica na haste, e o que estica e achata é o corpo atrás dela.
  const { hit, surge } = heaveOf(t);
  const heave = hit + surge;
  // Na batida a base vem inteira atrás da testa, e os cascos saem do chão por uns quadros; nos arrancos
  // ela anda menos, para os cascos continuarem no piso, e o resto é a testa que entra mais na haste.
  const drift = 110 * (hit + 0.6 * surge);
  const lean = body.lean + 1.2 * shake + 2 * quiver - 0.9 * asleep - 26 * heave;
  const axis: Vec = [Math.sin((lean * Math.PI) / 180), -Math.cos((lean * Math.PI) / 180)];
  const stride = strideOf(t);
  // O casco no piso: o tornozelo sobe quando o bico finca, e o passinho o tira do chão.
  const hoof = (ankle: Vec, foot: number, now: { slip: number; lift: number }, reach: Vec, tilt: Vec, height: number) => {
    const angle = mix(tilt[0], tilt[1], now.slip);
    const [x, y] = stand(ankle[0] + mix(reach[0], reach[1], now.slip), angle);
    return {
      ankle: [mix(ankle[0], x, stride.on), mix(ankle[1], y - height * now.lift, stride.on)] as Vec,
      foot: mix(foot, angle, stride.on),
    };
  };
  const near = hoof(body.nearAnkle, body.nearFoot, stride.near, [7, -3], [28, 50], 6);
  const far = hoof(body.farAnkle, body.farFoot, stride.far, [6, -2], [25, 45], 5);

  const pose: Pose = {
    ...body,
    hip: [body.hip[0] + 2.5 * shake + 1.2 * quiver - drift * axis[0], body.hip[1] - drift * axis[1]],
    // Dormindo, a cabeça pende um pouco mais a cada expiração.
    lean,
    stretch: body.stretch + breathOf(t) + heave,
    // O braço de cá acompanha os arrancos.
    nearHand: [body.nearHand[0] - 60 * heave, body.nearHand[1] + 40 * heave],
    nearAnkle: [near.ankle[0] - slide, near.ankle[1] - step.near],
    nearFoot: near.foot,
    farAnkle: [far.ankle[0], far.ankle[1] - step.far],
    farFoot: far.foot,
    nod: eyes.nod,
    gaze: eyes.gaze,
    cross: eyes.cross,
    pupil: lids.pupil,
    nearLid: clamp01(lids.nearLid + shut),
    farLid: clamp01(lids.farLid + shut + grimaceOf(t)),
    squint: lids.squint,
    faceSize: brows.faceSize,
    nearBrow: brows.nearBrow,
    farBrow: brows.farBrow,
    mouth: lips.mouth,
    grit: lips.grit,
  };
  return { pose, x: bones(pose).center[0], lift: liftOf(pose) };
};
