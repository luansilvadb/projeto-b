import "../../../design/fonts";
import { useId } from "react";
import {
  Easing,
  interpolate,
  interpolateColors,
  useCurrentFrame,
} from "remotion";
import {
  Person,
  type Expression,
  type PersonColors,
  type Stride,
} from "../../../art/Person";
import type { Point } from "../../../art/shapes";
import { Leftovers } from "../../../components/Actors";
import { Camera, Layer, type CameraState } from "../../../components/Camera";
import { Place } from "../../../components/Place";
import { Pop } from "../../../components/Pop";
import { SvgLayer } from "../../../components/SvgLayer";
import { ALREADY_SHOWN, clamp01 } from "../../../components/timing";
import { typography } from "../../../design/tokens";
import {
  alarmClock,
  chalkboard,
  coin,
  customer,
  gardner as gardnerColors,
  goods,
  idea,
  ink,
  lab,
  lagoon,
  person,
  researcher,
  savanna,
  sleepResearcher,
  stopwatch,
  stopwatchAlarm,
  type TagTone,
} from "../palette";
import { Calendar } from "./Calendar";
import { Tag } from "./Tag";

/**
 * O bloco de Randy Gardner: ele, os dois amigos, William Dement e o que há no
 * quarto (o cartaz do recorde, o calendário, o contador de horas). A cama em
 * que ele dorme é a de todo mundo, `parts/Bed.tsx`, com as cores `gardner`.
 * Nenhum dos quatro é retrato: não há fonte para a aparência deles, e quem
 * diz quem é quem é a etiqueta de nome (simplificação aprovada em art.md).
 */

type Hue = keyof typeof idea;

/**
 * Gardner: blusa laranja e cabelo castanho-avermelhado, as cores do freguês.
 * Não pode ser lido como a pessoa "você", que é a de blusa azul.
 */
export const gardner: PersonColors = gardnerColors;

/** Os dois amigos: um de verde e cabelo ruivo, o outro de amarelo. Nenhum de azul nem de laranja. */
const friends: readonly [PersonColors, PersonColors] = [
  {
    ...person,
    hair: idea.peach.contact,
    hairLight: savanna.day.far,
    top: goods.items[1],
    topShade: lagoon.day.grass[2],
    topLight: idea.mint.spot,
    pants: researcher.pants,
    pantsShade: researcher.pantsShade,
    shoe: sleepResearcher.shoe,
    shoeShade: sleepResearcher.shoeShade,
  },
  {
    ...person,
    skin: researcher.skin,
    skinShade: researcher.skinShade,
    lid: researcher.lid,
    hand: researcher.skin,
    handShade: researcher.skinShade,
    top: goods.crate,
    topShade: goods.crateShade,
    topLight: coin.shine,
    pants: customer.pants,
    pantsShade: customer.pantsShade,
    shoe: customer.shoe,
    shoeShade: customer.shoeShade,
  },
];

/**
 * Dement: o jaleco e o cabelo grisalho dos pesquisadores, sem os óculos
 * redondos, que são de Rechtschaffen. De cabelo escuro e da altura dos
 * rapazes, lia como um quarto rapaz de jaleco (decisão do usuário).
 */
const dement: PersonColors = sleepResearcher;

// Os olhos da pessoa e a inclinação da cabeça em cada expressão: os mesmos valores de art/Person.
const EYE = { gap: 42, radius: 27, y: -462 };
const HEAD_TILT: Record<Expression, number> = {
  neutral: 0,
  curious: 7,
  puzzled: -8,
  surprised: 0,
  sleepy: -9,
  yawning: -6,
  asleep: 12,
  reading: -6,
};

type Arm = { readonly hand: Point; readonly bend?: number };

// Quanto a pálpebra de cada expressão cobre o olho, e a pupila de quem se espanta: os mesmos valores de art/Person.
const LIDS: Record<Expression, number> = {
  neutral: 0.1,
  curious: 0,
  puzzled: 0.25,
  surprised: 0,
  sleepy: 0.58,
  yawning: 0.8,
  asleep: 1,
  reading: 0.45,
};
const pupilOf = (expression: Expression) =>
  expression === "surprised" ? 9 : 13;

type GazeProps = {
  readonly height: number;
  readonly colors: PersonColors;
  readonly expression: Expression;
  /** Para onde os olhos vão, de -1 a 1 em cada eixo. */
  readonly toward: Point;
  /** A piscada, de 0 a 1: a mesma que a pessoa recebe. */
  readonly blink?: number;
};

/**
 * O olhar para um ponto do quadro: os olhos da pessoa redesenhados por cima
 * dos dela, com a pupila encostada na borda do lado para onde ela olha. O
 * desenho da pessoa só desvia a pupila um pouco, e de longe os três pareciam
 * olhar para a câmera. A pálpebra é a da expressão, e desce com a piscada;
 * com o olho fechado, quem aparece é o traço da pessoa, por baixo.
 */
const Gaze: React.FC<GazeProps> = ({
  height,
  colors,
  expression,
  toward,
  blink = 0,
}) => {
  const id = useId();
  if (blink > 0.9 || expression === "asleep") {
    return null;
  }
  const lid = LIDS[expression] + (1 - LIDS[expression]) * blink;
  const pupil = pupilOf(expression);
  return (
    <svg
      width={(400 * height) / 650}
      height={height}
      viewBox="-200 -650 400 650"
      style={{ position: "absolute", left: 0, top: 0 }}
      overflow="visible"
    >
      <g
        transform={`rotate(2.5 0 -180) rotate(${HEAD_TILT[expression]} 0 -390)`}
      >
        {[-1, 1].map((side) => {
          const center = side * EYE.gap;
          const x = center + toward[0] * (26 - pupil);
          const y = EYE.y + toward[1] * (26 - pupil);
          const edge = EYE.y - EYE.radius + 2 * EYE.radius * lid;
          return (
            <g key={side}>
              <clipPath id={`${id}-${side}`}>
                <circle cx={center} cy={EYE.y} r={EYE.radius + 0.5} />
              </clipPath>
              <circle
                cx={center}
                cy={EYE.y}
                r={EYE.radius + 0.5}
                fill={colors.eye}
              />
              <g clipPath={`url(#${id}-${side})`}>
                <circle cx={x} cy={y} r={pupil} fill={colors.pupil} />
                <circle
                  cx={x - pupil * 0.4}
                  cy={y - pupil * 0.45}
                  r={pupil * 0.36}
                  fill={colors.eye}
                />
                {lid > 0 ? (
                  <path
                    d={`M${center - EYE.radius - 2},${EYE.y - EYE.radius - 2} L${center + EYE.radius + 2},${EYE.y - EYE.radius - 2} L${center + EYE.radius + 2},${edge} Q${center},${edge + 6} ${center - EYE.radius - 2},${edge} Z`}
                    fill={colors.lid}
                  />
                ) : null}
              </g>
            </g>
          );
        })}
      </g>
    </svg>
  );
};

/** Um tom que sobe ao rosto: o verde de quem enjoa, o vermelho de quem se irrita. */
export type Flush = { readonly color: string; readonly amount: number };

type FaceMarksProps = {
  readonly height: number;
  readonly colors: PersonColors;
  readonly expression: Expression;
  readonly tired: number;
  readonly flush?: Flush;
  readonly frown?: boolean;
};

// A boca da pessoa, nas unidades do desenho dela (art/Person).
const MOUTH_Y = EYE.y + EYE.radius * 1.85;

/**
 * O que o desenho da pessoa não tem e fica por cima do rosto, com a inclinação
 * da cabeça: as olheiras, o tom que sobe às bochechas e a boca virada para
 * baixo de quem se irrita (que cobre a da expressão).
 */
const FaceMarks: React.FC<FaceMarksProps> = ({
  height,
  colors,
  expression,
  tired,
  flush,
  frown = false,
}) => {
  const id = useId();
  const flushed = flush !== undefined && flush.amount > 0;
  if (tired <= 0 && !flushed && !frown) {
    return null;
  }
  return (
    <svg
      width={(400 * height) / 650}
      height={height}
      viewBox="-200 -650 400 650"
      style={{ position: "absolute", left: 0, top: 0 }}
      overflow="visible"
    >
      <g
        transform={`rotate(2.5 0 -180) rotate(${HEAD_TILT[expression]} 0 -390)`}
      >
        {frown ? (
          <>
            <rect
              x={-22}
              y={MOUTH_Y - 12}
              width={62}
              height={30}
              rx={12}
              fill={colors.skin}
            />
            <path
              d={`M-17,${MOUTH_Y + 10} Q0,${MOUTH_Y - 6} 17,${MOUTH_Y + 10}`}
              fill="none"
              stroke={colors.mouth}
              strokeWidth={7}
              strokeLinecap="round"
            />
          </>
        ) : null}
        {flushed ? (
          // Abaixo dos olhos, dentro do contorno do rosto, sem borda: o tom se desfaz para os lados.
          <>
            <defs>
              <radialGradient id={id}>
                <stop offset={0.35} stopColor={flush.color} stopOpacity={1} />
                <stop offset={1} stopColor={flush.color} stopOpacity={0} />
              </radialGradient>
            </defs>
            <ellipse
              cy={-416}
              rx={104}
              ry={46}
              fill={`url(#${id})`}
              opacity={flush.amount}
            />
          </>
        ) : null}
        {tired > 0 ? (
          <g opacity={tired}>
            {[-1, 1].map((side) => (
              <path
                key={side}
                d={`M${side * EYE.gap - 26},${EYE.y + EYE.radius - 2} Q${side * EYE.gap},${EYE.y + EYE.radius + 30} ${side * EYE.gap + 26},${EYE.y + EYE.radius - 2} Q${side * EYE.gap},${EYE.y + EYE.radius + 12} ${side * EYE.gap - 26},${EYE.y + EYE.radius - 2} Z`}
                fill={colors.skinShade}
                stroke={colors.skinShade}
                strokeWidth={4}
                strokeLinejoin="round"
              />
            ))}
          </g>
        ) : null}
      </g>
    </svg>
  );
};

type GardnerProps = {
  /** O chão entre os pés, no quadro. */
  readonly x: number;
  readonly y: number;
  readonly height: number;
  readonly expression?: Expression;
  /** As olheiras, de 0 a 1: crescem com as horas sem dormir. */
  readonly tired?: number;
  /** Virado para a esquerda. */
  readonly flip?: boolean;
  /** Para onde ele olha, de -1 a 1 em cada eixo; sem valor, o olhar é o da expressão. */
  readonly gaze?: Point;
  readonly frontArm?: Arm;
  readonly backArm?: Arm;
  /** Quadro em que ele entra, crescendo dos pés; sem valor, já está em cena. */
  readonly enter?: number;
  /** Quadro em que a etiqueta "Randy Gardner" entra; sem valor, não há etiqueta. */
  readonly nameAt?: number;
  /** A etiqueta que ele leva: por padrão, o nome. */
  readonly name?: string;
  readonly on?: TagTone;
  /** A piscada, de 0 a 1: é sob ela que a expressão troca. */
  readonly blink?: number;
  /** A respiração: a altura do corpo num instante, em volta de 1. */
  readonly breath?: number;
  /** A largura do corpo, de -1 (virado para a esquerda) a 1: a meia-volta passa pelo zero. Sem valor, vem de `flip`. */
  readonly facing?: number;
  /** Quanto o corpo pende, em graus, em volta dos pés. */
  readonly lean?: number;
  /** A passada de quem anda (ver art/Person). */
  readonly stride?: Stride;
  /** A identidade dele no palco: entre dois planos do mesmo cenário, ele vai de um lugar ao outro. */
  readonly id?: string;
  /** O tom que sobe ao rosto. */
  readonly flush?: Flush;
  /** A boca virada para baixo, de quem se irrita: o desenho da pessoa não tem essa. */
  readonly frown?: boolean;
  /** Quanto a etiqueta já saiu, de 0 a 1: encolhe no lugar. */
  readonly nameGone?: number;
};

/** Randy Gardner, de pé: o mesmo rapaz nas três cenas do bloco. */
export const Gardner: React.FC<GardnerProps> = ({
  x,
  y,
  height,
  expression = "neutral",
  tired = 0,
  flip = false,
  gaze,
  frontArm,
  backArm,
  enter = ALREADY_SHOWN,
  nameAt,
  name = "Randy Gardner",
  on = "lilac",
  blink = 0,
  breath = 1,
  facing,
  lean = 0,
  stride,
  id,
  flush,
  frown,
  nameGone = 0,
}) => (
  <>
    <Place
      id={id}
      x={x}
      y={y}
      anchor="bottom"
      style={{
        scale: `${facing ?? (flip ? -1 : 1)} ${breath}`,
        rotate: lean === 0 ? undefined : `${lean}deg`,
      }}
    >
      <Pop at={enter} from={0.8} origin="bottom">
        <div style={{ position: "relative" }}>
          <Person
            height={height}
            colors={gardner}
            expression={expression}
            frontArm={frontArm}
            backArm={backArm}
            blink={blink}
            stride={stride}
          />
          {gaze ? (
            <Gaze
              height={height}
              colors={gardner}
              expression={expression}
              toward={gaze}
              blink={blink}
            />
          ) : null}
          <FaceMarks
            height={height}
            colors={gardner}
            expression={expression}
            tired={tired}
            flush={flush}
            frown={frown}
          />
        </div>
      </Pop>
    </Place>
    {nameAt === undefined || nameGone >= 1 ? null : (
      <Place
        x={x}
        y={y - height - 60}
        style={nameGone > 0 ? { scale: `${1 - nameGone}` } : undefined}
      >
        <Pop at={nameAt}>
          <Tag size="note" on={on}>
            {name}
          </Tag>
        </Pop>
      </Place>
    )}
  </>
);

type FriendProps = {
  readonly x: number;
  readonly y: number;
  readonly height: number;
  /** Qual dos dois amigos. */
  readonly which: 0 | 1;
  readonly expression?: Expression;
  /** Para onde ele olha, de -1 a 1 em cada eixo; sem valor, o olhar é o da expressão. */
  readonly gaze?: Point;
  /** Aponta para o lado em que Gardner está: o da direita ou o da esquerda de quem assiste. */
  readonly pointing?: "left" | "right";
  /** Quanto o braço que aponta já subiu, de 0 (solto) a 1; pode passar de 1 na sobra. Por padrão, 1. */
  readonly reach?: number;
  /** A pose dos braços quando ele não aponta: quem joga a moeda, por exemplo. */
  readonly frontArm?: Arm;
  readonly backArm?: Arm;
  readonly blink?: number;
  /** A respiração: a altura do corpo num instante, em volta de 1. */
  readonly breath?: number;
  /** Quadro em que ele entra, crescendo dos pés; sem valor, já está em cena. */
  readonly enter?: number;
  /** A identidade dele no palco. */
  readonly id?: string;
};

// Os ombros da pessoa, o braço solto e o braço esticado de quem aponta: os mesmos valores de art/Person.
const SHOULDERS = { front: [-70, -346], back: [72, -338] } as const;
const POINTING = { front: [-140, -400], back: [140, -400] } as const;
const LOOSE = {
  front: { hand: [-136, -214], bend: 26 },
  back: { hand: [100, -214], bend: 73 },
} as const;
const POINT_BEND = 14;

/** Um dos dois amigos: figurante com rosto, para poder olhar o cartaz e apontar. */
export const Friend: React.FC<FriendProps> = ({
  x,
  y,
  height,
  which,
  expression = "neutral",
  gaze,
  pointing,
  reach = 1,
  frontArm,
  backArm,
  blink = 0,
  breath = 1,
  enter = ALREADY_SHOWN,
  id,
}) => {
  const frame = useCurrentFrame();
  // Ele entra crescendo dos pés, sem opacidade: passa um pouco do tamanho e assenta.
  const entered = interpolate(
    frame,
    [enter, enter + 8, enter + 11],
    [0, 1.06, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.quad),
    },
  );
  const arm = pointing === "left" ? "front" : "back";
  const rest = {
    front: { ...LOOSE.front, ...frontArm },
    back: { ...LOOSE.back, ...backArm },
  };
  // O braço vai do repouso até o gesto: a mão sobe e o cotovelo estica.
  const raised: Arm = {
    hand: [
      rest[arm].hand[0] + (POINTING[arm][0] - rest[arm].hand[0]) * reach,
      rest[arm].hand[1] + (POINTING[arm][1] - rest[arm].hand[1]) * reach,
    ],
    bend: rest[arm].bend + (POINT_BEND - rest[arm].bend) * reach,
  };
  const hand = raised.hand;
  // O dedo continua a direção do braço, do ombro para a mão.
  const length =
    Math.hypot(hand[0] - SHOULDERS[arm][0], hand[1] - SHOULDERS[arm][1]) || 1;
  const toward = [
    (hand[0] - SHOULDERS[arm][0]) / length,
    (hand[1] - SHOULDERS[arm][1]) / length,
  ] as const;
  // Ele só estica o dedo com o braço já quase no alto.
  const finger = clamp01((reach - 0.5) / 0.4);

  return (
    <Place id={id} x={x} y={y} anchor="bottom" style={{ scale: `1 ${breath}` }}>
      <div style={{ scale: `${entered}`, transformOrigin: "50% 100%" }}>
        <div style={{ position: "relative" }}>
          <Person
            height={height}
            colors={friends[which]}
            expression={expression}
            blink={blink}
            frontArm={pointing === "left" ? raised : frontArm}
            backArm={pointing === "right" ? raised : backArm}
          />
          {gaze ? (
            <Gaze
              height={height}
              colors={friends[which]}
              expression={expression}
              toward={gaze}
              blink={blink}
            />
          ) : null}
          {pointing && finger > 0 ? (
            // O dedo esticado: a mão da pessoa é um círculo, e sem ele o braço erguido lê como aceno.
            <svg
              width={(400 * height) / 650}
              height={height}
              viewBox="-200 -650 400 650"
              style={{ position: "absolute", left: 0, top: 0 }}
              overflow="visible"
            >
              <line
                transform="rotate(2.5 0 -180)"
                x1={hand[0] + toward[0] * 14}
                y1={hand[1] + toward[1] * 14}
                x2={hand[0] + toward[0] * (14 + 48 * finger)}
                y2={hand[1] + toward[1] * (14 + 48 * finger)}
                stroke={
                  arm === "front"
                    ? friends[which].hand
                    : friends[which].handShade
                }
                strokeWidth={17}
                strokeLinecap="round"
              />
            </svg>
          ) : null}
        </div>
      </div>
    </Place>
  );
};

/** A prancheta de Dement, nas unidades do desenho da pessoa: papel com linhas, sem texto. */
const NotesBoard: React.FC = () => (
  <g transform="translate(-58 -286) rotate(-7)">
    <rect x={-84} y={-106} width={168} height={212} rx={20} fill={lab.clip} />
    <rect x={-66} y={-82} width={132} height={172} rx={10} fill={lab.paper} />
    <rect
      x={-38}
      y={-122}
      width={76}
      height={36}
      rx={12}
      fill={researcher.pantsShade}
    />
    {[0, 1, 2, 3].map((line) => (
      <rect
        key={line}
        x={-50}
        y={-56 + line * 34}
        width={line === 3 ? 60 : 100}
        height={12}
        rx={6}
        fill={lab.paperLine}
      />
    ))}
  </g>
);

type DementProps = {
  readonly x: number;
  readonly y: number;
  readonly height: number;
  /** Virado para a esquerda, para olhar quem está desse lado. */
  readonly flip?: boolean;
  /** Quadro em que a etiqueta "William Dement" entra; sem valor, não há etiqueta. */
  readonly nameAt?: number;
  readonly on?: TagTone;
  /** A passada de quem anda (ver art/Person). */
  readonly stride?: Stride;
  readonly blink?: number;
  /** A respiração: a altura do corpo num instante, em volta de 1. */
  readonly breath?: number;
  /** Quanto ele anota, de -1 a 1: a mão que segura a caneta vai e vem sobre a prancheta. */
  readonly note?: number;
  /** Onde a etiqueta de nome fica, quando ele ainda não chegou ao lugar dele. Por padrão, sobre ele. */
  readonly nameX?: number;
};

/** William Dement: pesquisador de jaleco, de prancheta na mão, observando. Sem gesto clínico. */
export const Dement: React.FC<DementProps> = ({
  x,
  y,
  height,
  flip = false,
  nameAt,
  on = "lilac",
  stride,
  blink = 0,
  breath = 1,
  note = 0,
  nameX,
}) => (
  <>
    <Place
      x={x}
      y={y}
      anchor="bottom"
      style={{ scale: `${flip ? -1 : 1} ${breath}` }}
    >
      <Person
        height={height}
        colors={dement}
        expression="curious"
        held={<NotesBoard />}
        heldInFront
        blink={blink}
        stride={stride}
        frontArm={{ hand: [-128, -250], bend: 30 }}
        backArm={{ hand: [18 + 16 * note, -300 + 9 * note], bend: 52 }}
      />
    </Place>
    {nameAt === undefined ? null : (
      <Place x={nameX ?? x} y={y - height - 60}>
        <Pop at={nameAt}>
          <Tag size="note" on={on}>
            William Dement
          </Tag>
        </Pop>
      </Place>
    )}
  </>
);

type RoomSetProps = {
  readonly camera: CameraState;
  readonly children: React.ReactNode;
};

/**
 * O quarto como cenário do palco: uma câmera e uma camada só. Nos planos
 * seguidos do quarto (`sets` em index.tsx) a câmera continua de onde o plano
 * anterior a deixou, e quem tem `id` vai de um lugar ao outro.
 */
export const RoomSet: React.FC<RoomSetProps> = ({ camera, children }) => (
  <Camera {...camera}>
    <Layer depth={1}>
      {children}
      <Leftovers />
    </Layer>
  </Camera>
);

type FloorProps = {
  readonly hue: Hue;
  /** A altura do chão no quadro. */
  readonly y: number;
};

/** O chão do quarto: uma faixa mais escura que a parede e o rodapé. Passa das bordas, para a câmera poder andar. */
export const RoomFloor: React.FC<FloorProps> = ({ hue, y }) => (
  <SvgLayer>
    <rect
      x={-1500}
      y={y - 34}
      width={4920}
      height={900}
      fill={idea[hue].contact}
      opacity={0.3}
    />
    <rect
      x={-1500}
      y={y - 46}
      width={4920}
      height={14}
      fill={idea[hue].spot}
      opacity={0.7}
    />
  </SvgLayer>
);

/**
 * O quarto dos três rapazes, em coordenadas do plano aberto: o chão, onde cada
 * um fica (o amigo de verde, Gardner no meio, o amigo de amarelo) e, na parede
 * da direita, o cartaz do recorde e o calendário.
 */
export const ROOM = {
  floor: 960,
  boys: [
    { x: 280, height: 600 },
    { x: 570, height: 640 },
    { x: 860, height: 600 },
  ],
  poster: { x: 1190, y: 420 },
  calendar: { x: 1610, y: 420, scale: 1.1 },
} as const;

/** Tamanho do cartaz do recorde, em escala 1. */
const POSTER = { width: 340, height: 230 };

type RecordPosterProps = {
  /** O centro do cartaz no quadro. */
  readonly x: number;
  readonly y: number;
  readonly enter?: number;
  /** Quanto o papel balança nos percevejos, em graus. */
  readonly sway?: number;
};

/** O cartaz pregado na parede: "recorde: 260 h", o que os três querem bater. É texto do mundo, o mesmo nos planos do quarto. */
const RecordPoster: React.FC<RecordPosterProps> = ({
  x,
  y,
  enter = ALREADY_SHOWN,
  sway = 0,
}) => (
  <Place x={x} y={y} style={{ rotate: `${-3 + sway}deg` }}>
    <Pop at={enter}>
      <div
        style={{
          position: "relative",
          width: POSTER.width,
          height: POSTER.height,
          borderRadius: 16,
          background: idea.peach.spot,
          boxShadow: `10px 12px 0 ${idea.lilac.contact}40`,
          display: "grid",
          alignContent: "center",
          justifyItems: "center",
          fontFamily: typography.family,
          fontWeight: typography.weight,
          lineHeight: 1.08,
          color: ink.dark,
        }}
      >
        <div style={{ fontSize: typography.size.note }}>recorde</div>
        <div
          style={{ fontSize: typography.size.label, color: chalkboard.frame }}
        >
          260 h
        </div>
        {/* Os dois percevejos, nos cantos de cima. */}
        {[18, POSTER.width - 44].map((left) => (
          <div
            key={left}
            style={{
              position: "absolute",
              left,
              top: 14,
              width: 26,
              height: 26,
              borderRadius: 13,
              background: chalkboard.stamp,
            }}
          />
        ))}
      </div>
    </Pop>
  </Place>
);

// O calendário de `parts/Calendar`, em escala 1: sete colunas de 30 px com 8 de vão, e a margem do papel.
const PAGE = { width: 294, height: 218 };
const MONTH_DAYS = 31;

type WallCalendarProps = {
  /** O centro da folha no quadro. */
  readonly x: number;
  readonly y: number;
  readonly scale?: number;
  /** Quanto a folha de dezembro de 1963 já virou, de 0 a 1: por baixo dela está janeiro de 1964. */
  readonly turned?: number;
  /** Quantos dias de cada mês já passaram: dezembro e janeiro. */
  readonly filled?: readonly [number, number];
  readonly on?: TagTone;
  /** Quadro em que a etiqueta do mês entra. */
  readonly monthAt?: number;
  /** Quadro em que o calendário estoura na parede; sem valor, já está nela. */
  readonly enter?: number;
  /** Quanto ele balança no prego, em graus. */
  readonly sway?: number;
};

/**
 * O calendário de parede do quarto: a folha de dezembro de 1963, que vira e
 * deixa janeiro de 1964 à vista. O mês vai numa etiqueta, presa embaixo: na
 * virada ela gira com a folha e volta com o mês novo.
 */
const WallCalendar: React.FC<WallCalendarProps> = ({
  x,
  y,
  scale = 1,
  turned = 0,
  filled = [27, 0],
  on = "lilac",
  monthAt = ALREADY_SHOWN,
  enter = ALREADY_SHOWN,
  sway = 0,
}) => (
  <>
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: 0,
        height: 0,
        scale: `${scale}`,
        // Pendurado pelo alto: balança em volta da espiral.
        transformOrigin: `0 ${-PAGE.height / 2}px`,
        rotate: sway === 0 ? undefined : `${sway}deg`,
      }}
    >
      <Pop at={enter}>
        <Calendar x={0} y={0} days={MONTH_DAYS} filled={filled[1]} gradual />
        {turned < 1 ? (
          // A folha de cima sobe pela espiral: encolhe para o alto até sumir.
          <div
            style={{
              position: "absolute",
              left: 0,
              top: -PAGE.height / 2,
              width: 0,
              height: 0,
              transformOrigin: "0 0",
              scale: `1 ${1 - turned}`,
            }}
          >
            <Calendar
              x={0}
              y={PAGE.height / 2}
              days={MONTH_DAYS}
              filled={filled[0]}
              gradual
            />
          </div>
        ) : null}
        {/* A espiral que prende as folhas, no alto. */}
        <div
          style={{
            position: "absolute",
            left: -PAGE.width / 2,
            top: -PAGE.height / 2 - 22,
            width: PAGE.width,
            height: 34,
            borderRadius: 14,
            background: chalkboard.stamp,
          }}
        />
      </Pop>
    </div>
    <Place
      x={x}
      y={y + (PAGE.height / 2) * scale + 62}
      // O mês troca com a etiqueta de perfil: ela fecha, troca e abre.
      style={{ scale: `1 ${Math.abs(1 - 2 * turned)}` }}
    >
      <Pop at={monthAt}>
        <Tag size="note" on={on}>
          {turned > 0.5 ? "jan. 1964" : "dez. 1963"}
        </Tag>
      </Pop>
    </Place>
  </>
);

type HourCounterProps = {
  /** O centro do contador no quadro. */
  readonly x: number;
  readonly y: number;
  /** As horas acordado que o visor mostra. */
  readonly hours: number;
  /** As horas do recorde: ao passar delas, o visor muda de cor. */
  readonly record?: number;
  /** Quanto o visor já tomou a cor de alarme, de 0 a 1. Sem valor, troca ao passar do recorde. */
  readonly hot?: number;
  /** O tamanho do contador num instante, em volta de 1: o pulo ao passar do recorde. */
  readonly bump?: number;
  /** Quadro em que o contador estoura; sem valor, já está em cena. */
  readonly enter?: number;
};

/** O contador de horas acordado: um visor que sobe e muda de cor ao passar do recorde do cartaz. */
export const HourCounter: React.FC<HourCounterProps> = ({
  x,
  y,
  hours,
  record = 260,
  hot,
  bump = 1,
  enter = ALREADY_SHOWN,
}) => {
  const heat = hot ?? (hours > record ? 1 : 0);
  const tone = (key: "rim" | "display" | "text") =>
    interpolateColors(heat, [0, 1], [stopwatch[key], stopwatchAlarm[key]]);
  return (
    <Place x={x} y={y} style={{ scale: `${bump}` }}>
      <Pop at={enter}>
        <div
          style={{
            padding: 16,
            borderRadius: 36,
            background: tone("rim"),
          }}
        >
          <div
            style={{
              minWidth: 360,
              padding: "14px 26px",
              borderRadius: 22,
              background: tone("display"),
              color: tone("text"),
              fontFamily: typography.family,
              fontWeight: typography.weight,
              fontSize: typography.size.headline,
              fontVariantNumeric: "tabular-nums",
              lineHeight: 1.1,
              textAlign: "center",
              whiteSpace: "nowrap",
            }}
          >
            {Math.floor(hours)} h
          </div>
        </div>
      </Pop>
    </Place>
  );
};

type EmptyDiscProps = {
  /** O centro do tampo do disco no quadro. */
  readonly x: number;
  readonly y: number;
  readonly scale?: number;
  /** Quanto o tampo girou, em radianos: a marca dele dá a volta. */
  readonly turn?: number;
  /** A água da bandeja: o brilho dela vai e vem, de -1 a 1. */
  readonly ripple?: number;
};

// A marca do tampo anda nesta elipse; em repouso fica à direita, na frente.
const MARK = { rx: 165, ry: 33.5, rest: Math.acos(150 / 165) };

/**
 * O disco dos ratos, vazio, sobre a bandeja de água. É um desenho provisório:
 * o disco do experimento está em `parts/Rats.tsx`, e é ele que deve entrar
 * aqui quando estiver pronto.
 */
export const EmptyDisc: React.FC<EmptyDiscProps> = ({
  x,
  y,
  scale = 1,
  turn = 0,
  ripple = 0,
}) => (
  <Place x={x} y={y}>
    <svg
      width={640 * scale}
      height={360 * scale}
      viewBox="-320 -110 640 360"
      overflow="visible"
    >
      <rect x={-300} y={70} width={600} height={150} rx={34} fill={lab.glass} />
      <rect
        x={-282}
        y={96}
        width={564}
        height={108}
        rx={22}
        fill={lab.waterDeep}
      />
      <rect
        x={-282}
        y={96 - 3 * ripple}
        width={564}
        height={24 + 3 * ripple}
        rx={12}
        fill={lab.water}
      />
      <rect x={-16} y={0} width={32} height={150} fill={lab.platformShade} />
      <ellipse cy={22} rx={250} ry={50} fill={lab.platformShade} />
      <ellipse rx={250} ry={50} fill={lab.platform} />
      {/* A marca do tampo: é ela que mostra o giro. */}
      <ellipse
        cx={MARK.rx * Math.cos(MARK.rest + turn)}
        cy={MARK.ry * Math.sin(MARK.rest + turn)}
        rx={34}
        ry={10}
        fill={lab.clip}
      />
    </svg>
  </Place>
);

type TossedCoinProps = {
  readonly x: number;
  readonly y: number;
  /** A volta da moeda no ar, em radianos: de frente em 0, de lado em 90 graus. */
  readonly spin?: number;
  readonly radius?: number;
};

/** A moeda do cara ou coroa. */
export const TossedCoin: React.FC<TossedCoinProps> = ({
  x,
  y,
  spin = 0,
  radius = 46,
}) => {
  const facing = Math.max(0.12, Math.abs(Math.cos(spin)));
  return (
    <Place x={x} y={y}>
      <svg
        width={radius * 2}
        height={radius * 2}
        viewBox={`${-radius} ${-radius} ${radius * 2} ${radius * 2}`}
        overflow="visible"
      >
        <ellipse cy={6} rx={radius} ry={radius * facing} fill={coin.edge} />
        <ellipse rx={radius} ry={radius * facing} fill={coin.face} />
        <ellipse
          rx={radius * 0.62}
          ry={radius * 0.62 * facing}
          fill={coin.shine}
        />
      </svg>
    </Place>
  );
};

const BALLOON = 100;

const FACE = 70;
const FACE_LINE = {
  fill: "none",
  stroke: ink.dark,
  strokeWidth: 9,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

/**
 * O que ele sentiu, na ordem da fala, em três rostos: os sinais abstratos
 * (espiral, reticências, rabisco) não se liam sem legenda.
 *
 * - enjoo: o rosto verde, de olhos apertados, bochecha cheia e a boca em onda;
 * - um branco: o rosto pálido, de olhar para cima, com o pensamento vazio, um
 *   contorno tracejado, e a interrogação;
 * - raiva: o rosto vermelho, de sobrancelha em V, boca virada e fumaça.
 */
const SYMPTOMS = [
  <g key="nausea">
    <circle r={FACE} fill={lagoon.day.grass[0]} />
    <path
      d={`M${-FACE},10 A${FACE},${FACE} 0 0 0 ${FACE},10 Z`}
      fill={idea.mint.contact}
      opacity={0.45}
    />
    <path d="M-40,-28 L-18,-16 L-40,-4 M40,-28 L18,-16 L40,-4" {...FACE_LINE} />
    <path d="M-30,30 q10,-14 20,0 t20,0 t20,0" {...FACE_LINE} />
    {/* A gota de suor frio. */}
    <path
      d="M56,-62 C66,-46 72,-38 72,-28 A16,16 0 0 1 40,-28 C40,-38 48,-46 56,-62 Z"
      fill={ink.glow}
    />
  </g>,
  <g key="blank">
    <circle cy={22} r={FACE - 10} fill={idea.lilac.spot} />
    {/* O pensamento que não vem: um contorno vazio no lugar dele. */}
    <circle
      cx={-22}
      cy={-52}
      r={30}
      fill={ink.ring}
      stroke={idea.lilac.contact}
      strokeWidth={8}
      strokeDasharray="13 11"
      strokeLinecap="round"
    />
    {[-24, 22].map((eye) => (
      <g key={eye}>
        <circle cx={eye} cy={14} r={15} fill={ink.ring} />
        <circle cx={eye - 4} cy={8} r={8} fill={ink.dark} />
      </g>
    ))}
    <path d="M-12,52 L14,52" {...FACE_LINE} />
    <text
      x={48}
      y={-22}
      textAnchor="middle"
      fontFamily={typography.family}
      fontWeight={typography.weight}
      fontSize={typography.size.label}
      fill={idea.lilac.contact}
    >
      ?
    </text>
  </g>,
  <g key="anger">
    {/* A fumaça de quem ferve, saindo pelos lados. */}
    {[-1, 1].map((side) => (
      <g key={side} fill={idea.peach.top}>
        <circle cx={side * 74} cy={-50} r={17} />
        <circle cx={side * 88} cy={-72} r={11} />
      </g>
    ))}
    <circle r={FACE} fill={chalkboard.stamp} />
    <path
      d={`M${-FACE},10 A${FACE},${FACE} 0 0 0 ${FACE},10 Z`}
      fill={alarmClock.bell}
      opacity={0.5}
    />
    <path
      d="M-48,-40 L-14,-22 M48,-40 L14,-22"
      {...FACE_LINE}
      strokeWidth={13}
    />
    <circle cx={-26} cy={-6} r={9} fill={ink.dark} />
    <circle cx={26} cy={-6} r={9} fill={ink.dark} />
    <path d="M-26,40 Q0,16 26,40" {...FACE_LINE} />
  </g>,
] as const;

type SymptomsProps = {
  /** O centro de cada balão, na ordem da fala, e o quadro em que cada um acende. */
  readonly spots: readonly [Point, Point, Point];
  readonly at: readonly [number, number, number];
  /** A cabeça de quem sente: os balões apontam para ela. */
  readonly head: Point;
  /** O tempo, em segundos: os balões boiam, cada um na própria fase. Sem valor, parados. */
  readonly seconds?: number;
};

/** Os três balões sobre Gardner: enjoo, um branco, raiva. Sem texto. */
export const Symptoms: React.FC<SymptomsProps> = ({
  spots,
  at,
  head,
  seconds,
}) => (
  <>
    {SYMPTOMS.map((icon, index) => {
      const [x, y] = spots[index];
      // As duas bolinhas do balão de pensamento, a caminho da cabeça.
      const toward = (t: number): Point => [
        (head[0] - x) * t,
        (head[1] - y) * t,
      ];
      const length = Math.hypot(head[0] - x, head[1] - y) || 1;
      const float =
        seconds === undefined
          ? 0
          : Math.sin((seconds / (2.7 + 0.5 * index) + index / 3) * Math.PI * 2);
      return (
        <Place key={index} x={x} y={y}>
          <Pop at={at[index]}>
            <svg
              width={BALLOON * 2}
              height={BALLOON * 2}
              viewBox={`${-BALLOON} ${-BALLOON} ${BALLOON * 2} ${BALLOON * 2}`}
              overflow="visible"
            >
              {/* As bolinhas ficam presas à cabeça; o balão é que boia, e elas pulsam fora de fase com ele. */}
              {[
                { t: (BALLOON + 26) / length, r: 18 },
                { t: (BALLOON + 62) / length, r: 11 },
              ].map(({ t, r }, dot) => (
                <circle
                  key={r}
                  cx={toward(t)[0]}
                  cy={toward(t)[1] + 3 * float * (1 - dot)}
                  r={r * (1 - 0.08 * float * (dot === 0 ? 1 : -1))}
                  fill={ink.ring}
                />
              ))}
              <g transform={`translate(0 ${7 * float}) rotate(${1.5 * float})`}>
                <circle r={BALLOON} fill={ink.ring} />
                {icon}
              </g>
            </svg>
          </Pop>
        </Place>
      );
    })}
  </>
);

type SleepClockProps = {
  /** O centro do relógio no quadro. */
  readonly x: number;
  readonly y: number;
  readonly radius?: number;
  /** Quantas horas o ponteiro já andou: catorze dão uma volta inteira e mais duas horas. */
  readonly hours: number;
};

/** O relógio que dá a volta enquanto ele dorme: o rastro do ponteiro passa de uma volta. */
export const SleepClock: React.FC<SleepClockProps> = ({
  x,
  y,
  radius = 150,
  hours,
}) => {
  const turn = (hour: number) => (hour / 12) * Math.PI * 2 - Math.PI / 2;
  // O rastro é uma espiral: cada volta fica um pouco mais para fora, para a segunda não cobrir a primeira.
  const steps = Math.max(1, Math.ceil(hours * 6));
  const trail = Array.from({ length: steps + 1 }, (_, index) => {
    const hour = (hours * index) / steps;
    const reach = radius * (0.42 + 0.02 * hour);
    return `${(reach * Math.cos(turn(hour))).toFixed(1)},${(reach * Math.sin(turn(hour))).toFixed(1)}`;
  }).join(" L");
  const hand = turn(hours);

  return (
    <Place x={x} y={y}>
      <svg
        width={radius * 2}
        height={radius * 2}
        viewBox={`${-radius} ${-radius} ${radius * 2} ${radius * 2}`}
        overflow="visible"
      >
        <circle r={radius} fill={stopwatch.rim} />
        <circle r={radius - 16} fill={ink.ring} />
        {Array.from({ length: 12 }, (_, hour) => (
          <line
            key={hour}
            x1={(radius - 30) * Math.cos(turn(hour))}
            y1={(radius - 30) * Math.sin(turn(hour))}
            x2={(radius - (hour % 3 === 0 ? 52 : 42)) * Math.cos(turn(hour))}
            y2={(radius - (hour % 3 === 0 ? 52 : 42)) * Math.sin(turn(hour))}
            stroke={stopwatch.rim}
            strokeWidth={hour % 3 === 0 ? 10 : 6}
            strokeLinecap="round"
          />
        ))}
        {hours > 0 ? (
          <path
            d={`M${trail}`}
            fill="none"
            stroke={ink.tag}
            strokeWidth={14}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : null}
        <line
          x2={(radius - 58) * Math.cos(hand)}
          y2={(radius - 58) * Math.sin(hand)}
          stroke={ink.dark}
          strokeWidth={12}
          strokeLinecap="round"
        />
        <circle r={13} fill={ink.dark} />
      </svg>
    </Place>
  );
};

type BedroomProps = {
  readonly hue: Hue;
  /** Quanto a folha de dezembro já virou, e os dias passados de cada mês. */
  readonly turned?: number;
  readonly filled?: readonly [number, number];
  readonly on?: TagTone;
  /** Quadros em que o cartaz e o calendário estouram na parede; sem valor, já estão nela. */
  readonly posterAt?: number;
  readonly calendarAt?: number;
  /** Quanto o chão ainda está abaixo do lugar dele, em pixels: o quarto montando. */
  readonly sunk?: number;
  /** O tempo, em segundos: os papéis da parede balançam de leve. Sem valor, parados. */
  readonly seconds?: number;
};

/** O quarto vazio: o chão, o cartaz do recorde e o calendário, nos lugares de `ROOM`. */
export const Bedroom: React.FC<BedroomProps> = ({
  hue,
  turned,
  filled,
  on = "lilac",
  posterAt,
  calendarAt,
  sunk = 0,
  seconds,
}) => {
  const swing = (period: number, phase: number) =>
    seconds === undefined
      ? 0
      : Math.sin((seconds / period + phase) * Math.PI * 2);
  return (
    <>
      <RoomFloor hue={hue} y={ROOM.floor + sunk} />
      <RecordPoster
        {...ROOM.poster}
        enter={posterAt}
        sway={1.1 * swing(4.3, 0.2)}
      />
      <WallCalendar
        {...ROOM.calendar}
        turned={turned}
        filled={filled}
        on={on}
        enter={calendarAt}
        // A etiqueta do mês entra logo depois da folha.
        monthAt={calendarAt === undefined ? undefined : calendarAt + 5}
        sway={1.5 * swing(3.7, 0.6)}
      />
    </>
  );
};
