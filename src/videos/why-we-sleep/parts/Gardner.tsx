import "../../../design/fonts";
import { AbsoluteFill } from "remotion";
import {
  Person,
  type Expression,
  type PersonColors,
} from "../../../art/Person";
import type { Point } from "../../../art/shapes";
import { Place } from "../../../components/Place";
import { Pop } from "../../../components/Pop";
import { SvgLayer } from "../../../components/SvgLayer";
import { ALREADY_SHOWN } from "../../../components/timing";
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
export const friends: readonly [PersonColors, PersonColors] = [
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
export const dement: PersonColors = sleepResearcher;

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

type GazeProps = {
  readonly height: number;
  readonly colors: PersonColors;
  readonly expression: Expression;
  /** Para onde os olhos vão, de -1 a 1 em cada eixo. */
  readonly toward: Point;
};

/**
 * O olhar para um ponto do quadro: os olhos da pessoa redesenhados por cima
 * dos dela, com a pupila encostada na borda do lado para onde ela olha. O
 * desenho da pessoa só desvia a pupila um pouco, e de longe os três pareciam
 * olhar para a câmera.
 */
const Gaze: React.FC<GazeProps> = ({ height, colors, expression, toward }) => (
  <svg
    width={(400 * height) / 650}
    height={height}
    viewBox="-200 -650 400 650"
    style={{ position: "absolute", left: 0, top: 0 }}
    overflow="visible"
  >
    <g transform={`rotate(2.5 0 -180) rotate(${HEAD_TILT[expression]} 0 -390)`}>
      {[-1, 1].map((side) => {
        const x = side * EYE.gap + toward[0] * 13;
        const y = EYE.y + toward[1] * 13;
        return (
          <g key={side}>
            <circle
              cx={side * EYE.gap}
              cy={EYE.y}
              r={EYE.radius + 0.5}
              fill={colors.eye}
            />
            <circle cx={x} cy={y} r={13} fill={colors.pupil} />
            <circle cx={x - 5} cy={y - 6} r={4.7} fill={colors.eye} />
          </g>
        );
      })}
    </g>
  </svg>
);

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
}) => (
  <>
    <Place x={x} y={y} anchor="bottom" style={{ scale: `${flip ? -1 : 1} 1` }}>
      <Pop at={enter} from={0.8} origin="bottom">
        <div style={{ position: "relative" }}>
          <Person
            height={height}
            colors={gardner}
            expression={expression}
            frontArm={frontArm}
            backArm={backArm}
          />
          {gaze ? (
            <Gaze
              height={height}
              colors={gardner}
              expression={expression}
              toward={gaze}
            />
          ) : null}
          {tired > 0 ? (
            // As olheiras: o desenho da pessoa não as tem; ficam por cima, com a inclinação da cabeça.
            <svg
              width={(400 * height) / 650}
              height={height}
              viewBox="-200 -650 400 650"
              style={{ position: "absolute", left: 0, top: 0 }}
              overflow="visible"
            >
              <g
                transform={`rotate(2.5 0 -180) rotate(${HEAD_TILT[expression]} 0 -390)`}
                opacity={tired}
              >
                {[-1, 1].map((side) => (
                  <path
                    key={side}
                    d={`M${side * EYE.gap - 26},${EYE.y + EYE.radius - 2} Q${side * EYE.gap},${EYE.y + EYE.radius + 30} ${side * EYE.gap + 26},${EYE.y + EYE.radius - 2} Q${side * EYE.gap},${EYE.y + EYE.radius + 12} ${side * EYE.gap - 26},${EYE.y + EYE.radius - 2} Z`}
                    fill={gardner.skinShade}
                    stroke={gardner.skinShade}
                    strokeWidth={4}
                    strokeLinejoin="round"
                  />
                ))}
              </g>
            </svg>
          ) : null}
        </div>
      </Pop>
    </Place>
    {nameAt === undefined ? null : (
      <Place x={x} y={y - height - 60}>
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
};

// Os ombros da pessoa e o braço esticado de quem aponta: os mesmos valores de art/Person.
const SHOULDERS = { front: [-70, -346], back: [72, -338] } as const;
const POINTING = { front: [-140, -400], back: [140, -400] } as const;

/** Um dos dois amigos: figurante com rosto, para poder olhar o cartaz e apontar. */
export const Friend: React.FC<FriendProps> = ({
  x,
  y,
  height,
  which,
  expression = "neutral",
  gaze,
  pointing,
}) => {
  const arm = pointing === "left" ? "front" : "back";
  const hand = POINTING[arm];
  // O dedo continua a direção do braço, do ombro para a mão.
  const reach = Math.hypot(
    hand[0] - SHOULDERS[arm][0],
    hand[1] - SHOULDERS[arm][1],
  );
  const toward = [
    (hand[0] - SHOULDERS[arm][0]) / reach,
    (hand[1] - SHOULDERS[arm][1]) / reach,
  ] as const;

  return (
    <Place x={x} y={y} anchor="bottom">
      <div style={{ position: "relative" }}>
        <Person
          height={height}
          colors={friends[which]}
          expression={expression}
          frontArm={
            pointing === "left" ? { hand: POINTING.front, bend: 14 } : undefined
          }
          backArm={
            pointing === "right" ? { hand: POINTING.back, bend: 14 } : undefined
          }
        />
        {gaze ? (
          <Gaze
            height={height}
            colors={friends[which]}
            expression={expression}
            toward={gaze}
          />
        ) : null}
        {pointing ? (
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
              x2={hand[0] + toward[0] * 62}
              y2={hand[1] + toward[1] * 62}
              stroke={
                arm === "front" ? friends[which].hand : friends[which].handShade
              }
              strokeWidth={17}
              strokeLinecap="round"
            />
          </svg>
        ) : null}
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
};

/** William Dement: pesquisador de jaleco, de prancheta na mão, observando. Sem gesto clínico. */
export const Dement: React.FC<DementProps> = ({
  x,
  y,
  height,
  flip = false,
  nameAt,
  on = "lilac",
}) => (
  <>
    <Place x={x} y={y} anchor="bottom" style={{ scale: `${flip ? -1 : 1} 1` }}>
      <Person
        height={height}
        colors={dement}
        expression="curious"
        held={<NotesBoard />}
        heldInFront
        frontArm={{ hand: [-128, -250], bend: 30 }}
        backArm={{ hand: [18, -300], bend: 52 }}
      />
    </Place>
    {nameAt === undefined ? null : (
      <Place x={x} y={y - height - 60}>
        <Pop at={nameAt}>
          <Tag size="note" on={on}>
            William Dement
          </Tag>
        </Pop>
      </Place>
    )}
  </>
);

type ViewProps = {
  /** O ponto do quarto que vai para o centro do quadro, e a aproximação. */
  readonly focus: readonly [number, number];
  readonly zoom: number;
  readonly children: React.ReactNode;
};

/** O enquadramento de um plano do quarto: o mesmo cenário, mais de perto ou mais de longe. */
export const View: React.FC<ViewProps> = ({ focus, zoom, children }) => (
  <AbsoluteFill
    style={{
      transformOrigin: "0 0",
      translate: `${960 - focus[0] * zoom}px ${540 - focus[1] * zoom}px`,
      scale: `${zoom}`,
    }}
  >
    {children}
  </AbsoluteFill>
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
 * da direita, o cartaz do recorde e o calendário. Os planos mais fechados são
 * enquadramentos (`View`) deste mesmo quarto.
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
export const POSTER = { width: 340, height: 230 };

type RecordPosterProps = {
  /** O centro do cartaz no quadro. */
  readonly x: number;
  readonly y: number;
  readonly enter?: number;
};

/** O cartaz pregado na parede: "recorde: 260 h", o que os três querem bater. É texto do mundo, o mesmo nos planos do quarto. */
export const RecordPoster: React.FC<RecordPosterProps> = ({
  x,
  y,
  enter = ALREADY_SHOWN,
}) => (
  <Place x={x} y={y} style={{ rotate: "-3deg" }}>
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
};

/**
 * O calendário de parede do quarto: a folha de dezembro de 1963, que vira e
 * deixa janeiro de 1964 à vista. O mês vai numa etiqueta, presa embaixo.
 */
export const WallCalendar: React.FC<WallCalendarProps> = ({
  x,
  y,
  scale = 1,
  turned = 0,
  filled = [27, 0],
  on = "lilac",
  monthAt = ALREADY_SHOWN,
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
      }}
    >
      <Calendar x={0} y={0} days={MONTH_DAYS} filled={filled[1]} />
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
    </div>
    <Place x={x} y={y + (PAGE.height / 2) * scale + 62}>
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
};

/** O contador de horas acordado: um visor que sobe e muda de cor ao passar do recorde do cartaz. */
export const HourCounter: React.FC<HourCounterProps> = ({
  x,
  y,
  hours,
  record = 260,
}) => {
  const colors = hours > record ? stopwatchAlarm : stopwatch;
  return (
    <Place x={x} y={y}>
      <div
        style={{
          padding: 16,
          borderRadius: 36,
          background: colors.rim,
        }}
      >
        <div
          style={{
            minWidth: 360,
            padding: "14px 26px",
            borderRadius: 22,
            background: colors.display,
            color: colors.text,
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
    </Place>
  );
};

type EmptyDiscProps = {
  /** O centro do tampo do disco no quadro. */
  readonly x: number;
  readonly y: number;
  readonly scale?: number;
};

/**
 * O disco dos ratos, vazio, sobre a bandeja de água. É um desenho provisório:
 * o disco do experimento está em `parts/Rats.tsx`, e é ele que deve entrar
 * aqui quando estiver pronto.
 */
export const EmptyDisc: React.FC<EmptyDiscProps> = ({ x, y, scale = 1 }) => (
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
      <rect x={-282} y={96} width={564} height={24} rx={12} fill={lab.water} />
      <rect x={-16} y={0} width={32} height={150} fill={lab.platformShade} />
      <ellipse cy={22} rx={250} ry={50} fill={lab.platformShade} />
      <ellipse rx={250} ry={50} fill={lab.platform} />
      {/* A marca do tampo: é ela que mostra o giro. */}
      <ellipse cx={150} cy={14} rx={34} ry={10} fill={lab.clip} />
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
};

/** Os três balões sobre Gardner: enjoo, um branco, raiva. Sem texto. */
export const Symptoms: React.FC<SymptomsProps> = ({ spots, at, head }) => (
  <>
    {SYMPTOMS.map((icon, index) => {
      const [x, y] = spots[index];
      // As duas bolinhas do balão de pensamento, a caminho da cabeça.
      const toward = (t: number): Point => [
        (head[0] - x) * t,
        (head[1] - y) * t,
      ];
      const length = Math.hypot(head[0] - x, head[1] - y) || 1;
      return (
        <Place key={index} x={x} y={y}>
          <Pop at={at[index]}>
            <svg
              width={BALLOON * 2}
              height={BALLOON * 2}
              viewBox={`${-BALLOON} ${-BALLOON} ${BALLOON * 2} ${BALLOON * 2}`}
              overflow="visible"
            >
              {[
                { t: (BALLOON + 26) / length, r: 18 },
                { t: (BALLOON + 62) / length, r: 11 },
              ].map(({ t, r }) => (
                <circle
                  key={r}
                  cx={toward(t)[0]}
                  cy={toward(t)[1]}
                  r={r}
                  fill={ink.ring}
                />
              ))}
              <circle r={BALLOON} fill={ink.ring} />
              {icon}
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
};

/** O quarto vazio: o chão, o cartaz do recorde e o calendário, nos lugares de `ROOM`. */
export const Bedroom: React.FC<BedroomProps> = ({
  hue,
  turned,
  filled,
  on = "lilac",
}) => (
  <>
    <RoomFloor hue={hue} y={ROOM.floor} />
    <RecordPoster {...ROOM.poster} />
    <WallCalendar {...ROOM.calendar} turned={turned} filled={filled} on={on} />
  </>
);
