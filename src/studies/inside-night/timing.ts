// A partitura do trecho em números: as curvas, as deixas e o estado de cada
// coisa num instante. Tudo aqui é função pura do tempo, em segundos: cada
// quadro é desenhado sozinho, e o que tem inércia (a pálpebra da janela que
// cai) é refeito do zero até o instante pedido.
//
// A fala: "Só que o corpo cobra o sono que faltou, como quem cobra uma
// dívida." Começa em 3,40. "corpo" 3,80; "cobra" 4,16; "sono" 4,68; "faltou"
// 5,06; "como" 5,74; "quem" 6,06; "cobra" 6,24; "dívida" 6,70; fim em 7,10.

import { Easing } from "remotion";
import { cameraBetween, framing, type CameraState } from "../../components/Camera";

export type Vec = readonly [number, number];
type Ease = (u: number) => number;

// ---- Curvas e quadros-chave ----

export const E = {
  /** Com peso: acelera e desacelera. */
  io: Easing.inOut(Easing.cubic),
  /** Com peso, mais manso: o pico de velocidade é menor. */
  sine: Easing.inOut(Easing.sin),
  /** Chega e assenta. */
  out: Easing.out(Easing.cubic),
  /** Queda, e o que cede: começa parado e ganha velocidade. */
  in: Easing.in(Easing.quad),
  /** Chega com sobra: passa do ponto e volta. */
  back: Easing.out(Easing.back(1.8)),
  lin: (u: number) => u,
} as const;

type Key = readonly [at: number, value: number, ease?: Ease];

/** O valor num instante, entre quadros-chave em segundos; a curva de cada trecho é a da chegada. */
export const key = (t: number, keys: readonly Key[]): number => {
  if (t <= keys[0][0]) {
    return keys[0][1];
  }
  for (let index = 1; index < keys.length; index++) {
    const [at, value, ease = E.io] = keys[index];
    if (t <= at) {
      const [start, from] = keys[index - 1];
      return from + (value - from) * ease((t - start) / (at - start));
    }
  }
  return keys[keys.length - 1][1];
};

export const clamp01 = (value: number) => Math.min(1, Math.max(0, value));
/** De 0 a 1 entre dois instantes. */
export const span = (t: number, from: number, to: number) => clamp01((t - from) / (to - from));
export const mix = (from: number, to: number, u: number) => from + (to - from) * u;
export const mixV = (from: Vec, to: Vec, u: number): Vec => [mix(from[0], to[0], u), mix(from[1], to[1], u)];

/** O que sobra de um impacto: 1 no instante, morrendo depois. */
export const decay = (t: number, at: number, rate: number) => (t < at ? 0 : Math.exp(-(t - at) * rate));
/** Um balanço que morre: o que treme depois de bater, o cabo que vibra. */
export const wobble = (t: number, at: number, hertz: number, rate: number) =>
  decay(t, at, rate) * Math.sin((t - at) * hertz * 2 * Math.PI);
/** Vai a 1 e volta, entre `at` e `at + length`. */
export const pulse = (t: number, at: number, length: number) => {
  const u = (t - at) / length;
  return u <= 0 || u >= 1 ? 0 : Math.sin(Math.PI * u);
};

// ---- As deixas ----

/** As quatro gotas: o instante em que cada uma bate no líquido. As do meio caem nos dois "cobra". */
export const HIT = [3.0, 4.13, 6.23, 8.8] as const;
/** O pulso chega à base da alavanca e ela dá o tranco: 0,4 s depois da gota. A última não espera: transborda. */
export const KICK = [3.4, 4.53, 6.63, 8.9] as const;
/** O Contador carimba a conta: a lâmpada acende no instante em que o corpo dele bate. A do meio cai em "faltou". */
export const MARK = [3.64, 5.04, 7.14] as const;
/**
 * A onda de luz sai do reservatório quando a última gota bate: nasce do
 * tamanho dele (`head`) e anda a esta velocidade, em pixels de tela por segundo.
 */
export const WAVE = { at: HIT[3], speed: 1650, head: 230 } as const;
/**
 * Ele fecha o livro: o resto do cumprimento (olhar o nível antes, virar para ela e tocar a aba do
 * quepe depois) é contado a partir daqui. Fica cedo o bastante para o toque no quepe acabar quando a
 * última gota solta do bico (8,2): mais tarde, a mesura disputava o olho com a queda dela.
 */
export const SNAP = 7.82;
/**
 * Ela cai sentada: o instante em que o ovo mais achata no chão. A haste a leva de costas até o
 * batente (9,23), ela toca o chão no quadro seguinte (9,27) e achata até aqui. Com o corpo antigo,
 * que caía sozinho depois do batente, era 9,36.
 */
export const SIT = 9.29;

/**
 * A atuação da Vigília em volta do mecanismo: os instantes de cada ação, que `acting.ts` encena.
 * Cada tranco tem uma resposta com mais corpo que a anterior, e a quarta gota a derruba.
 */
export const ACT = {
  /** 1º tranco, pose 2: a haste a pega desprevenida. O corpo sai do chão um quadro depois dela, chega ao alto e volta. */
  hop: { off: KICK[0] + 0.04, top: KICK[0] + 0.16, land: KICK[0] + 0.38, set: KICK[0] + 0.62 },
  /** Ela vê a segunda gota cair e já espera: recua um casco, o finca e segura assim até o tranco. */
  brace: [KICK[1] - 0.43, KICK[1] - 0.21],
  /**
   * No 2º e no 3º tranco a haste a empurra para trás e ela escorrega: um quadro depois da haste no 2º,
   * em que só as mãos a tocam; junto com ela no 3º, em que está encostada.
   */
  shoved: [KICK[1] + 0.035, KICK[2] + 0.01],
  /** Passado o susto, junta o corpo para responder: no 2º, abaixa; no 3º, arma o bote. */
  gather: [KICK[1] + 0.33, KICK[2] + 0.33],
  /** 2º tranco, pose 3: empurra a haste de volta, no trecho em que `LEVER` sobe até o lugar. */
  push: [KICK[1] + 0.47, KICK[1] + 1.2],
  /** 3º tranco, pose 4: o bote. Sai do chão e bate na haste, que treme. */
  dive: [KICK[2] + 0.58, KICK[2] + 0.73],
  /**
   * E empurra em arrancos, um casco de cada vez: a cada um a haste sobe um degrau (`LEVER`). O
   * primeiro é a batida do bote; os quatro primeiros ganham terreno, antes de a câmera andar; os
   * três últimos, mais fracos e mais espaçados, já não ganham nada.
   */
  surge: [KICK[2] + 0.73, KICK[2] + 0.89, KICK[2] + 1.07, KICK[2] + 1.25, KICK[2] + 1.51, KICK[2] + 1.77, KICK[2] + 2.03],
  /** A quarta gota: a haste a põe de pé, a leva de costas (pose 5) e a larga no chão em `SIT` (pose 6). */
  taken: [KICK[3] + 0.12, KICK[3] + 0.25],
  /**
   * Sentada, fica achatada e de olhos apertados até a onda de luz acabar de passar por ela (9,43):
   * o impacto tem de ser visto sem o véu. Só no fim deste trecho se recompõe.
   */
  flat: [SIT + 0.11, SIT + 0.28],
  /** Senta de vez; depois olha a haste. */
  sat: SIT + 0.6,
  /**
   * Pose 7, de quem está exausta: afunda; sobe até a metade; emperra e cede um nada; sobe o resto;
   * treme lá em cima; e desaba de volta.
   */
  rise: [10.1, 10.2, 10.36, 10.46, 10.66, 10.86, 11.0],
  /** Pose 8: tomba para a frente até a testa bater na haste, e assenta. */
  rest: [11.1, 11.36, 11.54],
} as const;

// ---- A alavanca ----

/** A alavanca firme, como no quadro aprovado: graus a partir da vertical, negativo para o lado de dormir. */
export const HOLD = -8.06;
const OVER = -52.5;

const LEVER: readonly Key[] = [
  // A primeira gota só empurra: ela absorve sem sair do lugar.
  [KICK[0], HOLD],
  [KICK[0] + 0.07, -10.8, E.out],
  [KICK[0] + 0.36, -7.4, E.io],
  [KICK[0] + 0.54, HOLD, E.sine],
  // A segunda: o tranco, ela escorrega, finca o pé e empurra de volta.
  [KICK[1], HOLD],
  [KICK[1] + 0.09, -19.5, E.out],
  [KICK[1] + 0.24, -17.6, E.sine],
  [KICK[1] + 0.47, -18.6, E.sine],
  [KICK[1] + 1.2, -6.6, E.io],
  [KICK[1] + 1.4, HOLD, E.sine],
  // A terceira: tranco maior, e ela só recupera a metade.
  [KICK[2], HOLD],
  [KICK[2] + 0.12, -31.5, E.out],
  [KICK[2] + 0.3, -28.8, E.sine],
  [ACT.surge[0], -29.8, E.sine],
  // Ela bate na haste e a empurra em arrancos: a cada um a haste sobe um degrau depressa e cede um
  // pouco até o seguinte. A metade é a mesma de antes (-18,6), mas chega em degraus, e os três
  // primeiros cabem antes de a câmera começar a andar (7,73).
  [ACT.surge[0] + 0.06, -25.6, E.out],
  [ACT.surge[1], -26.5, E.sine],
  [ACT.surge[1] + 0.07, -22.6, E.out],
  [ACT.surge[2], -23.4, E.sine],
  [ACT.surge[2] + 0.07, -20.3, E.out],
  [ACT.surge[3], -21, E.sine],
  [ACT.surge[3] + 0.08, -18.6, E.out],
  [ACT.surge[4], -19.6, E.sine],
  // Os últimos arrancos já não ganham nada: vai perdendo terreno, e a última gota leva a alavanca até o batente.
  [ACT.surge[4] + 0.08, -19, E.out],
  [ACT.surge[5], -20.2, E.sine],
  [ACT.surge[5] + 0.08, -19.8, E.out],
  [ACT.surge[6], -20.9, E.sine],
  [ACT.surge[6] + 0.08, -20.6, E.out],
  [KICK[3], -21.5, E.lin],
  [KICK[3] + 0.33, -55.5, E.in],
  [KICK[3] + 0.44, -50.4, E.out],
  [KICK[3] + 0.57, -53.2, E.sine],
  [KICK[3] + 0.7, OVER, E.sine],
];

/** O tremor de quem faz força, em graus da alavanca: cresce com o cansaço e some quando ela perde. */
export const strain = (t: number) =>
  key(t, [
    [0, 0.2],
    [6.6, 0.22, E.lin],
    [7.4, 0.45, E.lin],
    [8.9, 0.5, E.lin],
    [9.0, 0, E.lin],
  ]) *
  (0.6 * Math.sin(t * 7.3 * 2 * Math.PI) + 0.4 * Math.sin(t * 11.3 * 2 * Math.PI + 1));

/** A haste acusa o bote: treme uns quadros quando ela bate nela. É pequeno, e não entra na conta da pálpebra. */
const thump = (t: number) => 2.2 * wobble(t, ACT.surge[0], 7.5, 9);

/** Onde a alavanca está, sem o tremor: é o que o cabo e a pálpebra da janela seguem. */
const leverSteady = (t: number) => key(t, LEVER);
export const leverAngle = (t: number) => leverSteady(t) + strain(t) + thump(t);

// ---- A pálpebra da janela ----

/**
 * A pálpebra é um gomo de esfera: a barra dela vai de -0,8 (aberta, só a
 * borda de cima) a 1,03 (fechada, encostada embaixo), em frações da altura da
 * janela. O cabo só segura: quando a alavanca cede, a pálpebra cai com o
 * próprio peso, mais devagar que a alavanca, e o cabo fica frouxo até ela
 * chegar; quando a alavanca volta, sobe junto.
 */
export const LID = { open: -0.8, shut: 1.03, gravity: 6, terminal: 1.1 } as const;
const lidAllowed = (t: number) =>
  LID.open + ((HOLD - leverSteady(t)) / (HOLD - OVER)) * (LID.shut - LID.open);

const STEP = 1 / 120;

export const lidAt = (t: number): { readonly h: number; readonly slack: number } => {
  let h: number = LID.open;
  let speed = 0;
  for (let now = 0; now < t; now += STEP) {
    const allowed = lidAllowed(now);
    if (h >= allowed) {
      h = allowed;
      speed = 0;
    } else {
      speed = Math.min(speed + LID.gravity * STEP, LID.terminal);
      h = Math.min(h + speed * STEP, allowed);
    }
  }
  return { h, slack: Math.max(0, lidAllowed(t) - h) };
};

/** De 0 (aberta) a 1 (fechada): quanto da luz da janela a pálpebra já tirou. */
export const shutOf = (h: number) => clamp01((h - LID.open) / (LID.shut - LID.open));

// ---- O reservatório ----

/**
 * O nível: sobe um nada com a primeira gota e cada vez mais com as outras,
 * porque o vidro afunila; a terceira o leva ao gargalo, em "dívida", e a
 * última, à boca.
 */
export const levelAt = (t: number) =>
  key(t, [
    [HIT[0], 548],
    [HIT[0] + 0.22, 538, E.out],
    [HIT[0] + 0.42, 539.5, E.sine],
    [HIT[1], 538, E.lin],
    [HIT[1] + 0.26, 511, E.out],
    [HIT[1] + 0.48, 514, E.sine],
    [HIT[2], 508, E.lin],
    // A subida grande leva o tempo todo até "dívida", passa um pouco do ponto e assenta.
    [HIT[2] + 0.47, 365, E.io],
    [HIT[2] + 0.66, 374, E.sine],
    [HIT[2] + 0.82, 372, E.sine],
    [HIT[3], 352, E.lin],
    [HIT[3] + 0.26, 205, E.io],
  ]);

/** A pressão, de 0 a 1: é o que faz o reservatório brilhar mais, o líquido ferver e o salão esquentar. */
export const pressureAt = (t: number) =>
  key(t, [
    [HIT[0], 0],
    [HIT[0] + 0.3, 0.05, E.out],
    [HIT[1], 0.05],
    [HIT[1] + 0.35, 0.14, E.out],
    [HIT[2], 0.16, E.lin],
    [HIT[2] + 0.52, 0.5, E.out],
    [HIT[3], 0.62, E.lin],
    [HIT[3] + 0.2, 1, E.out],
  ]);

/** Depois de transbordar, a luz do reservatório respira devagar, e o salão inteiro com ela. */
export const BREATH = 4.6;
export const dozeAt = (t: number) => span(t, 9.6, 11) * Math.sin(((t - 9.6) / BREATH) * 2 * Math.PI);

type Drop = {
  /** A altura da gota, de 0 (pendurada no bico) a 1 (no nível). */
  readonly fall: number;
  /** O tamanho: cresce enquanto ela se forma no bico. */
  readonly size: number;
  /** Quanto a queda a estica. */
  readonly stretch: number;
};

const SWELL = [1.1, 1, 1, 1.3] as const;
const FALL = [0.45, 0.45, 0.45, 0.6] as const;
const SIZE = [1, 1.08, 1.4, 1.75] as const;

/** As gotas que existem num instante: cada uma incha no bico, solta e cai acelerando. A última é maior e mais lenta. */
export const dropsAt = (t: number): readonly Drop[] =>
  HIT.flatMap((hit, index) => {
    const loose = hit - FALL[index];
    const born = loose - SWELL[index];
    if (t < born || t >= hit) {
      return [];
    }
    if (t < loose) {
      const grown = (t - born) / SWELL[index];
      // Pendurada, ela cresce para fora do bico e estica um pouco antes de soltar.
      return [{ fall: 0, size: SIZE[index] * E.out(grown) ** 0.7, stretch: 1 + 0.16 * grown ** 3 }];
    }
    const fallen = (t - loose) / FALL[index];
    return [{ fall: fallen ** 2, size: SIZE[index], stretch: 1.16 + 0.5 * fallen }];
  });

/** Há quanto tempo cada gota bateu (negativo: ainda não): os anéis na superfície e o clarão saem daqui. */
export const sinceHit = (t: number) => HIT.map((hit) => t - hit);

/** A cada gota o reservatório clareia um instante, e a luz dele no salão vai junto. */
export const throbAt = (t: number) =>
  // Sobe em dois quadros, para ser clarão e não piscada, e morre devagar.
  HIT.reduce((sum, hit, index) => sum + FORCE[index] * span(t, hit, hit + 0.07) * decay(t, hit + 0.07, 4.5), 0);

/** A força de cada pulso: cada gota cobra mais que a anterior. */
export const FORCE = [0.45, 0.75, 1.15, 1.6] as const;

/**
 * O pulso no conduto: de 0 (o pé do reservatório) a 1 (a base da alavanca).
 * Sai um instante depois da gota, o tempo de a batida descer pelo líquido, e
 * chega junto com o tranco.
 */
export const pulsesAt = (t: number) =>
  HIT.flatMap((hit, index) => {
    const from = hit + (index === 3 ? 0.02 : 0.1);
    const along = (t - from) / (KICK[index] - from);
    return along > 0 && along < 1.45 ? [{ along, force: FORCE[index] }] : [];
  });

/** O clarão na boca do conduto, junto da alavanca, quando o pulso chega. */
export const arrivalAt = (t: number) =>
  KICK.reduce((glow, kick, index) => Math.max(glow, FORCE[index] * decay(t, kick, index === 3 ? 0.6 : 5)), 0);

/** A lua e as estrelas andam enquanto a câmera chega: a noite passando. Já vêm andando no primeiro quadro, e assentam com a câmera. */
export const nightAt = (t: number) => 1 - (1 - span(t, 0, 3.5)) ** 2;

// ---- A câmera ----

const SETTLED: CameraState = { x: 0, y: 0, zoom: 1 };
/**
 * O fim: o reservatório, os dois, a conta acesa embaixo e a janela fechada por
 * cima dela. O gargalo sai pelo alto do quadro de propósito: com a boca
 * encostada na borda, o quadro ficava sem folga em cima e embaixo.
 */
const CLOSE = framing([1182, 600], 1.45);
const ARRIVE = 3.2;
/**
 * A abertura: a câmera está no alto, à esquerda, e a lente fechada na janela.
 * A câmera desce e a lente abre no mesmo movimento, e é por isso que as
 * camadas andam cada uma na sua velocidade.
 */
const OPENING = { x: -620, y: -420, lens: 1.5, shift: [637, 357] } as const;

export type Shot = {
  readonly camera: CameraState;
  /** A lente: aproxima o quadro inteiro por igual, em volta do centro, e o desloca. */
  readonly lens: { readonly scale: number; readonly x: number; readonly y: number };
};

export const shotAt = (t: number): Shot => {
  // A viagem já vem andando no primeiro quadro, e a descida vai um pouco à frente do resto. A curva mansa
  // espalha o caminho pelos três segundos: com a cúbica ele cabia em um, e o resto era só assentar.
  const across = E.sine(span(t, -0.2, ARRIVE));
  const down = 1 - (1 - across) ** 1.35;
  // Durante a fala a câmera só deriva; depois dela, aproxima devagar.
  const closer = 0.035 * E.sine(span(t, ARRIVE - 0.4, 7.1)) + 0.965 * E.sine(span(t, 7.1, 10.4));
  const pushed = cameraBetween(SETTLED, CLOSE, closer);
  return {
    camera: {
      x: pushed.x + OPENING.x * (1 - across),
      y: pushed.y + OPENING.y * (1 - down),
      zoom: pushed.zoom,
    },
    lens: {
      scale: 1 + (OPENING.lens - 1) * (1 - across),
      x: OPENING.shift[0] * (1 - across),
      y: OPENING.shift[1] * (1 - down),
    },
  };
};

// ---- A Vigília ----
// A atuação dela é pose a pose, sobre as poses desenhadas, e mora em `acting.ts`:
// aqui ficam só os instantes dela (`ACT`, lá em cima), que são da partitura.

// ---- O Contador ----

/** A carimbada: ele sobe na ponta dos pés e bate com o corpo inteiro. O valor é quanto o corpo desce, em pixels. */
const stampAt = (t: number) =>
  MARK.reduce(
    (sum, mark) =>
      sum +
      key(t - mark, [
        [-0.28, 0],
        [-0.07, -11, E.out],
        [0, 7.5, E.in],
        [0.1, -3, E.out],
        [0.28, 0, E.sine],
      ]),
    0,
  );

export const contadorAt = (t: number) => {
  const sink = stampAt(t);
  // O que está solto no corpo chega atrasado: o quepe e a mão do livro.
  const lagged = stampAt(t - 0.07);
  /** De 0 (para o reservatório) a 1 (para ela). */
  const turned = E.io(span(t, SNAP + 0.08, SNAP + 0.32));
  return {
    sink:
      sink +
      key(t, [
        // O cumprimento: uma mesura curta.
        [SNAP + 0.44, 0],
        [SNAP + 0.58, 3.5, E.io],
        [SNAP + 0.8, 0, E.io],
      ]),
    stretch:
      MARK.reduce(
        (sum, mark) =>
          sum +
          key(t - mark, [
            [-0.28, 0],
            [-0.07, 0.08, E.out],
            [0.01, -0.13, E.in],
            [0.11, 0.05, E.out],
            [0.3, 0, E.sine],
          ]),
        1,
      ) +
      0.012 * Math.sin(t * 2.3),
    /** Os calcanhares saem do chão antes da batida. */
    tiptoe: MARK.reduce(
      (most, mark) =>
        Math.max(
          most,
          key(t - mark, [
            [-0.28, 0],
            [-0.07, 1, E.out],
            [0, 0, E.in],
          ]),
        ),
      0,
    ),
    /** O tronco: -5 é o do quadro aprovado, pendendo para trás de quem olha para cima. */
    lean: key(t, [
      // A primeira lâmpada ele confere com a cabeça; as outras, nem isso.
      [MARK[0] - 0.34, -5],
      [MARK[0] - 0.06, 4, E.io],
      [MARK[0] + 0.3, 3, E.sine],
      [MARK[0] + 0.7, -5.5, E.io],
      [MARK[1], -6.5, E.lin],
      [SNAP - 0.52, -7, E.lin],
      // Olha o nível, lá no gargalo.
      [SNAP - 0.24, -12.5, E.io],
      [SNAP - 0.08, -12, E.sine],
      [SNAP + 0.12, -5, E.io],
      // Vira para ela e cumprimenta.
      [SNAP + 0.32, -3, E.sine],
      [SNAP + 0.44, -2.5, E.sine],
      [SNAP + 0.58, -13, E.io],
      [SNAP + 0.8, -5, E.io],
      [9.4, -4, E.sine],
      [10, -7, E.io],
    ]),
    turned,
    /** Para onde ele olha: o nível, que sobe; a lâmpada, na primeira conta; ela, no fim. */
    gaze: [
      mix(
        key(t, [
          [MARK[0] - 0.34, 3.6],
          [MARK[0] - 0.1, 4.5, E.io],
          [MARK[0] + 0.3, 4.5],
          [MARK[0] + 0.6, 3.6, E.io],
        ]),
        -4.6,
        turned,
      ),
      key(t, [
        [MARK[0] - 0.34, 0],
        [MARK[0] - 0.1, 5, E.io],
        [MARK[0] + 0.3, 5],
        [MARK[0] + 0.6, -0.5, E.io],
        [HIT[2], -1, E.lin],
        [HIT[2] + 0.5, -4, E.out],
        [SNAP - 0.52, -4],
        [SNAP - 0.24, -6, E.io],
        [SNAP + 0.08, -5],
        [SNAP + 0.32, 0, E.io],
        [KICK[3] + 0.1, 0],
        // Acompanha a queda dela.
        [SIT, 4, E.io],
        [10.6, 3.5, E.sine],
      ]),
    ] as Vec,
    /** As pálpebras: 0 é a reta do quadro aprovado; ele fecha os olhos na mesura. */
    lids: key(t, [
      [SNAP + 0.44, 0],
      [SNAP + 0.56, 1, E.sine],
      [SNAP + 0.7, 1],
      [SNAP + 0.84, 0, E.sine],
    ]),
    /** O quepe e a mão do livro, em relação ao corpo. */
    cap: 0.5 * (lagged - sink),
    bookBob: 0.55 * (lagged - sink),
    /** O livro: de 1 (aberto) a 0 (fechado), e depois debaixo do braço. */
    open: key(t, [
      [SNAP - 0.1, 1],
      [SNAP, 0, E.in],
    ]),
    bookUp: key(t, [
      [SNAP - 0.52, 0],
      [SNAP - 0.24, -3, E.io],
      [SNAP - 0.12, -7, E.out],
      [SNAP, 2, E.in],
      [SNAP + 0.14, 0, E.out],
    ]),
    tucked: E.io(span(t, SNAP + 0.08, SNAP + 0.32)),
    /** A mão de cá: de 0 (atrás das costas) a 1 (na aba do quepe), e depois solta ao lado. */
    salute: key(t, [
      [SNAP + 0.28, 0],
      [SNAP + 0.48, 1, E.io],
      [9.42, 1],
      [9.82, 0, E.io],
    ]),
    atEase: span(t, 9.42, 9.82),
  };
};
