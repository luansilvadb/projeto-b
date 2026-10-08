import {
  Easing,
  interpolate,
  interpolateColors,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {
  cameraBetween,
  framing,
  type CameraState,
} from "../../../components/Camera";
import { breath, wave } from "../../../components/Idle";
import { Onomatopoeia } from "../../../components/Onomatopoeia";
import { Place } from "../../../components/Place";
import { grown, Pop, POP_SECONDS, popScale } from "../../../components/Pop";
import { SvgLayer } from "../../../components/SvgLayer";
import {
  ALREADY_SHOWN,
  cue,
  drop,
  linear,
  mix,
  ramp,
  clamp,
} from "../../../components/timing";
import type { SceneProps } from "../../../video/NarratedVideo";
import { Shot, useShotLength } from "../../../video/Shot";
import { ink, lab, researcher, signs, sound, tags } from "../palette";
import { Calendar } from "../parts/Calendar";
import { BENCH_Y } from "../parts/Laboratory";
import {
  Rat,
  RatLab,
  RatRow,
  RATS,
  ratIdle,
  rowRatSpot,
  withIdle,
  type DiscRatPose,
  type RatMotion,
} from "../parts/Rats";
import { Tag } from "../parts/Tag";
import { Prelude } from "./MaybeBrainScene";
import { EXAM_LEAD, UnknownCauseOpening } from "./UnknownCauseScene";
import {
  DISC_LABEL,
  DISC_LANDING,
  DISC_MEDIUM_END,
  DiscLeaving,
  discRatsAtRest,
  SNORE,
} from "./RatsDiscScene";

/**
 * A bancada continua de `rats-disc`, e é uma só: a câmera não anda de lado
 * (decisão do usuário, em score.md). No primeiro plano ela fecha nos dois
 * ratos do disco, que ficam onde estão: o aparelho encolhe sob eles, eles
 * pisam na bancada e o terceiro cresce ao lado. No segundo ela recua: os três
 * encolhem até virar parte da fila dos dez, os outros crescem ao lado deles e
 * o calendário cresce na parede.
 */

// Os ratos de comparação são os do disco, do tamanho deles: quem os faz encher a largura do quadro é a
// câmera. As medidas do plano foram compostas com ratos de 440 px a 1,36 de aproximação; `NEAR` é quanto a
// câmera fecha a mais para o rato do disco, de 260 px, ficar desse tamanho.
const NEAR = 440 / 260;
const CONTROLS = {
  // O do meio é o que já cochilava no disco: a fila se arma em volta dele.
  x: 1410,
  y: DISC_LANDING,
  width: 260,
  spacing: 500 / NEAR,
  count: 3,
};
const ON_CONTROLS = framing(
  [CONTROLS.x, CONTROLS.y - 150 / NEAR],
  1.36 * NEAR,
  [960, 600],
);
// Onde a deriva do plano de perto termina: é daqui que a câmera recua para os dez.
const ON_CONTROLS_END = framing(
  [CONTROLS.x, CONTROLS.y - 150 / NEAR],
  1.375 * NEAR,
  [960, 600],
);
const BADGE = {
  x: CONTROLS.x + 540 / NEAR,
  y: CONTROLS.y - 380 / NEAR,
  radius: 70,
};
// Limpar o focinho: quanto o rato se ergue, em fração de `GROOM_UP` graus, e por quantos quadros esfrega.
const GROOM_UP = 15;
const GROOM = { after: 6, rise: 6, rub: 20, down: 7 };
// O aparelho sai de baixo dos dois em 0,5 s; a etiqueta do disco se recolhe antes, e o terceiro rato cresce
// quando os dois já estão quase na bancada. Em quadros do plano.
const LAND = { frames: 15, third: 9 };
// A etiqueta "comparação" é a do disco e continua sobre quem ela já nomeava, o que cochila: onde o centro
// dela fica na bancada, a partir dos pés dele. Acima e à esquerda do ronco, com a linha até a cabeça dele.
const LABEL = { dx: -110, dy: -226 };
// A respiração e a pausa viva de cada um: os dois primeiros continuam as do disco, sem salto.
const BREATH_SEEDS = ["disc-rat-0", "disc-rat-1", "control-2"] as const;
const IDLE_SEEDS = ["disc-0", "disc-1", "control-2"] as const;
const BREATH = { amplitude: 0.03, period: 2.4 };

/** Quanto o primeiro se ergue e esfrega o focinho, e quanto o terceiro fareja o ar, num quadro do plano. */
const controlActs = (frame: number, fps: number, wellAt: number) => {
  // O primeiro se ergue e esfrega o focinho logo depois do visto; o terceiro fareja o ar um pouco depois.
  const groomed = frame - wellAt - GROOM.after;
  const up = interpolate(
    groomed,
    [
      0,
      GROOM.rise,
      GROOM.rise + GROOM.rub,
      GROOM.rise + GROOM.rub + GROOM.down,
    ],
    [0, 1, 1, 0],
    { ...clamp, easing: Easing.inOut(Easing.quad) },
  );
  return {
    up,
    rubbing: up * wave(groomed / fps, 0.2),
    sniffed: interpolate(groomed - 12, [0, 5, 16, 22], [0, 1, 1, 0], {
      ...clamp,
      easing: Easing.inOut(Easing.quad),
    }),
  };
};

// Depois de tudo: ninguém se limpa nem fareja.
const AT_EASE = { up: 0, rubbing: 0, sniffed: 0 };

/** Um rato de comparação num instante: a inclinação, a respiração, o que ele faz e a pausa viva dele. */
const controlRat = (
  index: number,
  seconds: number,
  { up, rubbing, sniffed }: typeof AT_EASE,
) => ({
  rotate:
    GROOM_UP *
    (index === 0
      ? up * (1 + 0.16 * rubbing)
      : index === 2
        ? 0.5 * sniffed
        : // Quem cochila pende um nada a cada expiração.
          -0.08 * (1 + wave(seconds, 4.4, 0.2))),
  stretch: breath(seconds, BREATH_SEEDS[index], BREATH),
  own: (index === 1
    ? { lid: 1 }
    : index === 0
      ? { lid: 0.7 * up, whisker: 9 * rubbing, ear: 10 * rubbing }
      : {
          whisker: 10 * sniffed * wave(seconds, 0.16),
          lid: 0,
        }) as RatMotion,
  idle: ratIdle(seconds, IDLE_SEEDS[index], 1),
});

type TrioRat = {
  /** O meio dos pés e o comprimento, em pixels do cenário. */
  readonly x: number;
  readonly y: number;
  readonly width: number;
  /** Quanto dele já entrou, em escala a partir das patas. Por padrão, 1. */
  readonly size?: number;
  readonly rotate: number;
  readonly stretch: number;
  readonly motion: RatMotion;
  /** De 0 (em cima do disco, com a sombra no tampo dele) a 1 (na bancada). Por padrão, 1. */
  readonly landed?: number;
  /** De 0 (de perto, com volume) a 1 (a silhueta da fila). Por padrão, 0. */
  readonly flat?: number;
};

/**
 * Os três que atravessam as trocas no palco: os dois do disco e o terceiro.
 * São desenhados aqui, e não por `RatDisc` nem por `RatRow`, porque passam de
 * um ao outro: descem do disco para a bancada e, depois, encolhem até virar
 * três dos dez da fila, com o volume saindo por cima da silhueta.
 */
const Trio: React.FC<{ rats: readonly TrioRat[] }> = ({ rats }) => (
  <>
    <SvgLayer>
      {rats.map(({ x, y, width, size = 1, landed = 1 }, index) => (
        <ellipse
          key={index}
          cx={x + 6 * (1 - landed)}
          cy={y + mix(-2, 2, landed)}
          rx={width * mix(0.44, 0.46, landed) * Math.min(1, size)}
          ry={mix(11, width * 0.07, landed) * Math.min(1, size)}
          fill={interpolateColors(
            landed,
            [0, 1],
            [researcher.handShade, lab.contact],
          )}
          opacity={mix(0.7, 0.22, landed)}
        />
      ))}
    </SvgLayer>
    {rats.map(
      ({ x, y, width, size = 1, rotate, stretch, motion, flat = 0 }, index) => (
        <Place
          key={index}
          x={x}
          y={y}
          anchor="bottom"
          style={{
            // O rato se ergue em volta das patas de trás, como no disco e na fila.
            transformOrigin: "72% 100%",
            rotate: `${rotate}deg`,
            scale: `${size} ${size * stretch}`,
          }}
        >
          <div style={{ position: "relative" }}>
            {flat > 0 ? <Rat width={width} motion={motion} /> : null}
            {flat < 1 ? (
              <div
                style={{
                  position: flat > 0 ? "absolute" : "relative",
                  left: 0,
                  top: 0,
                  opacity: 1 - flat,
                }}
              >
                <Rat width={width} close motion={motion} />
              </div>
            ) : null}
          </div>
        </Place>
      ),
    )}
  </>
);

type ControlsMarksProps = {
  /** O tempo do vídeo, em segundos. */
  readonly seconds: number;
  /** De 0 (o ronco onde estava no disco) a 1 (sobre quem cochila na bancada). Por padrão, 1. */
  readonly landed?: number;
  /** Quadro do plano em que o visto de "saudáveis" entra; sem valor, já está lá. */
  readonly wellAt?: number;
  /** Quanto os três já saíram, de 0 a 1: encolhem no próprio ponto. */
  readonly gone?: number;
};

/** O que diz quem são os três: o ronco de quem cochila, a etiqueta "comparação" e o visto de "saudáveis". */
const ControlsMarks: React.FC<ControlsMarksProps> = ({
  seconds,
  landed = 1,
  wellAt = ALREADY_SHOWN,
  gone = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const frames = POP_SECONDS * fps;
  const napper = rowRatSpot(1, CONTROLS);
  const left = 1 - gone;
  // A etiqueta, do lugar dela no disco ao da bancada; `sized` é quanto ela e a linha encolhem no cenário para
  // ficar do mesmo tamanho no quadro, com a câmera mais perto.
  const sized = mix(1, 1 / ON_CONTROLS.zoom / DISC_LABEL.scale, landed);
  const head = [napper.x - 20, napper.y - CONTROLS.width * 0.5 + 6] as const;
  const root = [
    mix(DISC_LABEL.root[0], head[0], landed),
    mix(DISC_LABEL.root[1], head[1], landed),
  ] as const;
  const tag = [
    mix(DISC_LABEL.tag[0], napper.x + LABEL.dx, landed),
    mix(DISC_LABEL.tag[1], napper.y + LABEL.dy, landed),
  ] as const;
  // No disco a linha chega pela esquerda da etiqueta; na bancada, pela direita, que é onde o rato está.
  const tip = [
    tag[0] + mix(-30, 22, landed) * sized,
    tag[1] + 30 * sized,
  ] as const;
  // A letra do ronco, do tamanho deste plano; no disco ela era menor.
  const snoreSize = 96;

  return (
    <>
      {/* O ronco é o mesmo do disco: acompanha quem cochila até a bancada. */}
      <Place
        x={mix(SNORE.x, napper.x + 40 / NEAR, landed)}
        y={mix(SNORE.y, napper.y - CONTROLS.width * 0.5 - 70 / NEAR, landed)}
        style={{
          scale: `${left * mix((SNORE.scale * SNORE.size) / snoreSize, 1 / ON_CONTROLS.zoom, landed)}`,
          // Sobe e desce com a respiração de quem dorme.
          translate: `-50% calc(-50% + ${mix(SNORE.bob(seconds), 6 * wave(seconds, 4.4, 0.2), landed)}px)`,
          rotate: `${2 * wave(seconds, 3.1)}deg`,
        }}
      >
        <Onomatopoeia
          at={ALREADY_SHOWN}
          size={snoreSize}
          color={sound.warm}
          edge={sound.edge}
          tilt={12}
          fade={0.22}
        >
          ZZZ
        </Onomatopoeia>
      </Place>
      {/* A etiqueta do disco, com a linha: desce com o rato que ela nomeia e fica sobre ele. Saindo, a linha se
          recolhe para dentro dela. */}
      <SvgLayer>
        <path
          d={`M${mix(root[0], tip[0], gone)},${mix(root[1], tip[1], gone)} L${tip[0]},${tip[1]}`}
          stroke={tags.mint.fill}
          // Sem comprimento, a ponta redonda da linha ainda seria um ponto: a grossura sai com ela.
          strokeWidth={DISC_LABEL.stroke * sized * Math.min(1, left * 4)}
          strokeLinecap="round"
        />
        <circle
          cx={mix(root[0], tip[0], gone)}
          cy={mix(root[1], tip[1], gone)}
          r={DISC_LABEL.dot * sized * left}
          fill={tags.mint.fill}
        />
      </SvgLayer>
      <Place
        x={tag[0]}
        y={tag[1]}
        style={{ scale: `${left * DISC_LABEL.scale * sized}` }}
      >
        <Tag size="note" on="mint">
          comparação
        </Tag>
      </Place>
      {/* O visto: saudáveis. A mesma marca verde dos ícones vencidos da fila; o risco se desenha depois de o selo assentar. */}
      {frame >= wellAt && left > 0 ? (
        <SvgLayer>
          <g
            transform={`translate(${BADGE.x} ${BADGE.y}) scale(${
              (left / NEAR) *
              interpolate(
                frame,
                [wellAt, wellAt + frames * 0.7, wellAt + frames],
                [0, 1.12, 1],
                { ...clamp, easing: Easing.out(Easing.quad) },
              )
            })`}
          >
            <circle r={BADGE.radius + 10} fill={ink.ring} />
            <circle r={BADGE.radius} fill={signs.seal[1]} />
            <path
              d="M-32,2 L-10,26 L34,-24"
              fill="none"
              stroke={ink.ring}
              strokeWidth={18}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="100 100"
              strokeDashoffset={100 * (1 - ramp(frame, wellAt + 4, 7))}
            />
          </g>
        </SvgLayer>
      ) : null}
    </>
  );
};

// Os dez impedidos de dormir, em fila sobre a bancada, e o calendário na parede, por cima deles.
const TEN = { x: 960, y: BENCH_Y + 8, width: 176, spacing: 178 };
const CALENDAR = { x: 960, y: 400, scale: 2, days: 32 };
const TEN_WIDE = framing([960, 540], 1);
// O plano dos dez chega aberto e se aproxima um nada; o seguinte recua devagar dali até o quadro aberto.
const TEN_NEAR = framing([960, 620], 1.035, [960, 620]);
// Os três de comparação viram estes três da fila, no meio dela: a câmera recua sem andar de lado.
const TRIO_SLOT = 4;
// Os outros sete crescem ao lado, do meio para as pontas: o quadro do plano em que cada lugar da fila entra.
// Cada um espera o quadro abrir até o lugar dele, e os da direita esperam os três passarem por onde ficam.
const TEN_IN = [16, 14, 12, 10, 0, 0, 0, 15, 16, 18] as const;
const TEN_IN_FRAMES = 9;
// O calendário cresce na parede com a câmera quase chegando: antes, os três ainda vêm do lugar do disco para
// o meio da fila, e o calendário parado na parede denunciaria que eles andam de lado. O quadro em que começa e quanto leva.
const CALENDAR_IN = { at: 12, frames: 12 };
// O experimento durou de 11 a 32 dias: o primeiro e o último rato a sair dele.
const FIRST_DAY = 11;
const LAST_DAY = 32;
// Quantos dias o calendário já riscou quando o plano dos dez termina.
const DAYS_BEFORE = 10;
// A ordem em que os ratos saem: sorteada uma vez, para não ser da esquerda para a direita.
const ORDER = [6, 2, 9, 0, 4, 7, 1, 8, 3, 5] as const;
// As medidas do calendário de `parts/Calendar.tsx`, que ele não exporta: célula, vão e colunas.
const GRID = { cell: 30, gap: 8, columns: 7, padding: 18 };
// Meia largura do papel do calendário, na escala do plano: a linha da etiqueta para na borda dele.
const PAPER_HALF =
  ((GRID.columns * (GRID.cell + GRID.gap) - GRID.gap) / 2 + GRID.padding) *
  CALENDAR.scale;
// Baixar a cabeça: o intervalo entre um rato e o seguinte e quanto cada um leva, em quadros. Devagar, sem tranco.
const BOW = { step: 3, frames: 16 };
// A cor sai de cada rato em 0,6 s.
const FADE_FRAMES = 18;
// A pausa viva da fila, de cabeça baixa: eles quase não farejam.
const TEN_ALIVE = 0.35;
// O calendário sai antes de a bancada descer e de Rechtschaffen subir na frente dele: as etiquetas dos
// dias se recolhem primeiro, e o papel encolhe no ponto. Quadros antes do fim do plano, e quanto cada um leva.
const WALL_OUT = { before: 19, marks: 6, paper: 8 };

/** O centro da célula de um dia, no cenário, com o calendário na escala do plano. */
const daySpot = (day: number) => {
  const rows = Math.ceil(CALENDAR.days / GRID.columns);
  const pitch = GRID.cell + GRID.gap;
  const width = GRID.columns * pitch - GRID.gap;
  const height = rows * pitch - GRID.gap;
  const column = (day - 1) % GRID.columns;
  const row = Math.floor((day - 1) / GRID.columns);
  return {
    x:
      CALENDAR.x +
      (column * pitch + GRID.cell / 2 - width / 2) * CALENDAR.scale,
    y: CALENDAR.y + (row * pitch + GRID.cell / 2 - height / 2) * CALENDAR.scale,
  };
};

type DayMarkProps = {
  readonly day: number;
  /** Quadro do plano em que a marca entra. */
  readonly at: number;
  /** De que lado do calendário a etiqueta fica. */
  readonly side: -1 | 1;
  /** Quanto do calendário está na parede, e quanto a etiqueta já saiu: o aro vai com o papel. */
  readonly paper: number;
  readonly gone: number;
};

/** A marca de um dia do calendário: o aro em volta da célula e a etiqueta, ligada a ela por uma linha que sai do calendário. */
const DayMark: React.FC<DayMarkProps> = ({ day, at, side, paper, gone }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const frames = POP_SECONDS * fps;
  const spot = daySpot(day);
  // O aro vem de fora e fecha em volta da célula.
  const size =
    (GRID.cell * CALENDAR.scale + 22) *
    popScale(frame, at, frames, 1.7, 0.94) *
    paper;
  const tagX = CALENDAR.x + side * 520;
  const edge = CALENDAR.x + side * PAPER_HALF;
  const line = ramp(frame, at + 2, 7) * (1 - gone);
  const ring = {
    x: mix(CALENDAR.x, spot.x, paper),
    y: mix(CALENDAR.y, spot.y, paper),
  };

  return frame < at ? null : (
    <>
      <SvgLayer>
        <path
          d={`M${edge},${spot.y} L${edge + (tagX - side * 150 - edge) * line},${spot.y}`}
          stroke={lab.clip}
          strokeWidth={8}
          strokeLinecap="round"
          opacity={line > 0 ? 1 : 0}
        />
        <rect
          x={ring.x - size / 2}
          y={ring.y - size / 2}
          width={size}
          height={size}
          rx={18 * paper}
          fill="none"
          stroke={lab.clip}
          strokeWidth={10 * paper}
        />
      </SvgLayer>
      <Place x={tagX} y={spot.y} style={{ scale: `${1 - gone}` }}>
        <Pop at={at + 5}>
          <Tag size="note" on="mint">
            {`dia ${day}`}
          </Tag>
        </Pop>
      </Place>
    </>
  );
};

type TenSetProps = {
  readonly seconds: number;
  /** Quantos dias o calendário já riscou. */
  readonly day: number;
  /** Quadro do plano em que os ratos baixam a cabeça, em cascata; sem valor, já baixaram. */
  readonly bowAt?: number;
  /** Quadros do plano em que o dia 11 e o dia 32 ganham a marca; sem valor, não há marca e ninguém saiu. */
  readonly marks?: readonly [number, number];
};

type TenWallProps = Pick<TenSetProps, "day" | "marks"> & {
  /** Quanto do calendário está na parede, em escala em volta do centro dele. Por padrão, inteiro. */
  readonly paper?: number;
  /** Quanto as etiquetas dos dias já saíram, de 0 a 1. */
  readonly marksGone?: number;
};

/** O calendário na parede. Vai em `wall`, atrás da bancada. */
const TenWall: React.FC<TenWallProps> = ({
  day,
  marks,
  paper = 1,
  marksGone = 0,
}) => (
  <>
    <div
      style={{
        position: "absolute",
        inset: 0,
        scale: `${CALENDAR.scale * paper}`,
        transformOrigin: `${CALENDAR.x}px ${CALENDAR.y}px`,
      }}
    >
      <Calendar
        x={CALENDAR.x}
        y={CALENDAR.y}
        days={CALENDAR.days}
        filled={day}
        gradual
      />
    </div>
    {marks ? (
      <>
        <DayMark
          day={FIRST_DAY}
          at={marks[0]}
          side={-1}
          paper={paper}
          gone={marksGone}
        />
        <DayMark
          day={LAST_DAY}
          at={marks[1]}
          side={1}
          paper={paper}
          gone={marksGone}
        />
      </>
    ) : null}
  </>
);

type TenRowProps = Omit<TenSetProps, "day"> & {
  /** Quanto de cada rato já entrou, como em `RatRow`. Por padrão, todos no lugar. */
  readonly present?: (index: number) => number;
};

/**
 * Os dez ratos em fila sob o calendário. Eles baixam a cabeça em cascata e
 * ficam quietos; depois, um a um, a cor sai devagar e sobra a silhueta. Não
 * há queda, estouro nem tremor: é o único trecho do vídeo assim.
 */
const TenRow: React.FC<TenRowProps> = ({ seconds, bowAt, marks, present }) => {
  const frame = useCurrentFrame();
  const bowed = (index: number) =>
    bowAt === undefined ? 1 : ramp(frame, bowAt + index * BOW.step, BOW.frames);
  // Cada um sai na sua vez, do primeiro (dia 11) ao último (dia 32), na ordem sorteada.
  const gone = (index: number) =>
    marks === undefined
      ? 0
      : ramp(
          frame,
          marks[0] + ((marks[1] - marks[0]) * ORDER[index]) / (RATS - 1),
          FADE_FRAMES,
        );

  return (
    <RatRow
      {...TEN}
      state={() => "awake"}
      seconds={seconds}
      seed="ten"
      // De cabeça baixa eles quase não farejam: a pausa viva continua, mas baixa.
      alive={TEN_ALIVE}
      bowed={bowed}
      present={present}
      motion={(index) => ({
        // A pálpebra pesa quando a cabeça baixa, e fecha quando a cor sai.
        lid: Math.max(0.55 * bowed(index), gone(index)),
        gone: gone(index),
      })}
    />
  );
};

type StageProps = {
  /** O quadro do vídeo em que o plano começa: o relógio de quem respira. */
  readonly videoClock: number;
};

type BenchProps = {
  readonly camera: CameraState;
  readonly wall?: React.ReactNode;
  readonly children: React.ReactNode;
};

/** A bancada de `rats-disc`, com a câmera escrita pelo plano. */
const Bench: React.FC<BenchProps> = ({ camera, wall, children }) => (
  <RatLab steady camera={camera} wall={wall}>
    {children}
  </RatLab>
);

/** A pose de quem estava no disco, a caminho da de quem está na bancada: o olho arregalado e a orelha virada se desfazem. */
const stepDown = (
  pose: DiscRatPose,
  own: RatMotion,
  landed: number,
): RatMotion => ({
  ...own,
  lid: mix(pose.motion?.lid ?? 0, own.lid ?? 0, landed),
  wide: (pose.motion?.wide ?? 0) * (1 - landed),
  ear: (own.ear ?? 0) + (pose.motion?.ear ?? 0) * (1 - landed),
});

type ControlsShotProps = StageProps & {
  /** Quadro do plano em que o visto de "saudáveis" entra. */
  readonly wellAt: number;
};

/**
 * A câmera fecha nos dois ratos do disco, que ficam: o aparelho encolhe sob
 * eles, o terceiro cresce ao lado, e os três são os de comparação. O visto
 * fecha o resultado.
 */
const ControlsShot: React.FC<ControlsShotProps> = ({ videoClock, wellAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const length = useShotLength();
  const arrive = 0.7 * fps;
  const seconds = (videoClock + frame) / fps;
  // O visto espera a câmera chegar.
  const well = Math.max(wellAt, arrive + 9);
  const acts = controlActs(frame, fps, well);
  const landed = ramp(frame, 0, LAND.frames);
  const onDisc = discRatsAtRest(seconds, fps);
  const rats = Array.from({ length: CONTROLS.count }, (_, index): TrioRat => {
    const spot = rowRatSpot(index, CONTROLS);
    const rat = controlRat(index, seconds, acts);
    const from = onDisc[index];
    return from === undefined
      ? {
          ...spot,
          width: CONTROLS.width,
          size: grown(frame, LAND.third),
          rotate: rat.rotate,
          stretch: rat.stretch,
          motion: withIdle(rat.own, rat.idle),
        }
      : {
          x: mix(from.x, spot.x, landed),
          y: mix(from.y, spot.y, landed),
          width: CONTROLS.width,
          rotate: mix(from.pose.tilt ?? 0, rat.rotate, landed),
          stretch: rat.stretch * mix(from.pose.stretch ?? 1, 1, landed),
          motion: withIdle(stepDown(from.pose, rat.own, landed), rat.idle),
          landed,
        };
  });

  return (
    <Bench
      camera={cameraBetween(
        DISC_MEDIUM_END,
        cameraBetween(
          ON_CONTROLS,
          ON_CONTROLS_END,
          linear(frame, arrive, length - arrive),
        ),
        ramp(frame, 0, arrive),
      )}
    >
      <DiscLeaving videoClock={videoClock} leaving={1 - landed} />
      <Trio rats={rats} />
      <ControlsMarks seconds={seconds} landed={landed} wellAt={well} />
    </Bench>
  );
};

/**
 * A câmera recua dos três até os dez, em fila, sob o calendário: os três
 * encolhem até virar três da fila, os outros sete crescem ao lado, e o
 * calendário cresce na parede e começa a se preencher; eles baixam a cabeça
 * em cascata.
 */
const CountShot: React.FC<StageProps & { fillAt: number; bowAt: number }> = ({
  videoClock,
  fillAt,
  bowAt,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const length = useShotLength();
  const arrive = 0.7 * fps;
  const seconds = (videoClock + frame) / fps;
  // O primeiro dia só se risca com o calendário no lugar.
  const from = Math.max(fillAt, CALENDAR_IN.at + CALENDAR_IN.frames - 3);
  const joined = ramp(frame, 0, arrive);
  // O volume sai por cima da silhueta na segunda metade do caminho, com o rato já pequeno.
  const flat = ramp(frame, arrive * 0.4, arrive * 0.55);
  const trio = Array.from({ length: CONTROLS.count }, (_, index): TrioRat => {
    const rat = controlRat(index, seconds, AT_EASE);
    const here = rowRatSpot(index, CONTROLS);
    const slot = TRIO_SLOT + index;
    const there = rowRatSpot(slot, TEN);
    // O que `RatRow` faz com este lugar da fila: é nele que o rato chega, sem salto.
    const idle = ratIdle(seconds, `ten-${slot}`, TEN_ALIVE);
    const close = withIdle(rat.own, rat.idle);
    return {
      x: mix(here.x, there.x, joined),
      y: mix(here.y, there.y, joined),
      width: mix(CONTROLS.width, TEN.width, joined),
      rotate: mix(rat.rotate, 0.14 * idle.whisker, joined),
      stretch: mix(rat.stretch, breath(seconds, `ten-${slot}`, BREATH), joined),
      motion: {
        // Quem cochilava abre o olho no caminho.
        lid: mix(close.lid ?? 0, idle.lid, joined),
        whisker: (close.whisker ?? 0) * (1 - joined),
        ear: (close.ear ?? 0) * (1 - joined),
        tail: (close.tail ?? 0) * (1 - joined),
      },
      flat,
    };
  });
  const arrived = frame >= arrive;
  // O recuo é em volta do rato do meio: ele vai em linha reta do ponto do quadro em que estava ao lugar dele
  // na fila, e a câmera abre em volta. Entre dois enquadramentos (`cameraBetween`), a aproximação e o
  // deslocamento andam em curvas diferentes, e os três balançavam de um lado ao outro no caminho.
  const lead = [
    rowRatSpot(1, CONTROLS),
    rowRatSpot(TRIO_SLOT + 1, TEN),
  ] as const;
  const recede = framing(
    [mix(lead[0].x, lead[1].x, joined), mix(lead[0].y, lead[1].y, joined)],
    ON_CONTROLS_END.zoom ** (1 - joined),
    [
      mix(960, lead[1].x, joined),
      // Onde o enquadramento de perto põe os pés dele; aberto, o quadro é o próprio cenário.
      mix(600 + (ON_CONTROLS_END.zoom * 150) / NEAR, lead[1].y, joined),
    ],
  );

  return (
    <Bench
      camera={
        arrived
          ? cameraBetween(
              TEN_WIDE,
              TEN_NEAR,
              linear(frame, arrive, length - arrive),
            )
          : recede
      }
      wall={
        <TenWall
          day={DAYS_BEFORE * linear(frame, from, length - from)}
          paper={grown(frame, CALENDAR_IN.at, CALENDAR_IN.frames)}
        />
      }
    >
      <TenRow
        seconds={seconds}
        bowAt={Math.max(bowAt, arrive)}
        present={(index) =>
          index >= TRIO_SLOT && index < TRIO_SLOT + CONTROLS.count
            ? // Os três do meio são os de comparação, até chegarem.
              arrived
              ? 1
              : 0
            : grown(frame, TEN_IN[index], TEN_IN_FRAMES)
        }
      />
      {arrived ? null : <Trio rats={trio} />}
      {/* O ronco, a etiqueta e o visto dos três encolhem no ponto quando a câmera começa a recuar. */}
      <ControlsMarks seconds={seconds} gone={drop(frame, 0, 8)} />
    </Bench>
  );
};

type DeclineShotProps = StageProps & {
  /** Quadros do plano em que o primeiro rato sai (dia 11) e em que o último sai (dia 32). */
  readonly firstAt: number;
  readonly lastAt: number;
};

/** O dia 11 e o dia 32 ganham marca; entre um e outro, a cor sai dos ratos, um a um. A câmera recua devagar. */
const DeclineShot: React.FC<DeclineShotProps> = ({
  videoClock,
  firstAt,
  lastAt,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const length = useShotLength();
  // O dia 11 se risca na deixa; daí o calendário corre até o dia 32, que fecha junto com o último rato.
  const day =
    DAYS_BEFORE +
    ramp(frame, firstAt - 4, 8) +
    (LAST_DAY - FIRST_DAY) * linear(frame, firstAt + 4, lastAt - firstAt);
  const out = length - WALL_OUT.before;

  return (
    <Bench
      camera={cameraBetween(TEN_NEAR, TEN_WIDE, linear(frame, 0, length))}
      wall={
        <TenWall
          day={day}
          marks={[firstAt, lastAt + 4]}
          marksGone={drop(frame, out, WALL_OUT.marks)}
          paper={1 - drop(frame, out + WALL_OUT.marks - 2, WALL_OUT.paper)}
        />
      }
    >
      <TenRow seconds={(videoClock + frame) / fps} marks={[firstAt, lastAt]} />
    </Bench>
  );
};

export const RatsResultScene: React.FC<SceneProps> = ({ scene, shots }) => (
  <>
    <Shot range={shots[0]} name="os ratos de comparação, inteiros e bem">
      <ControlsShot
        videoClock={scene.from}
        wellAt={cue(scene, "continuaram")}
      />
    </Shot>
    <Shot range={shots[1]} name="os dez em fila, sob o calendário">
      <CountShot
        videoClock={scene.from + shots[1].from}
        fillAt={cue(scene, "impedidos") - shots[1].from}
        bowAt={cue(scene, "morreram") - shots[1].from}
      />
    </Shot>
    <Shot range={shots[2]} name="do dia 11 ao dia 32, viram silhuetas">
      <DeclineShot
        videoClock={scene.from + shots[2].from}
        firstAt={cue(scene, "onze") - shots[2].from}
        lastAt={cue(scene, "pouco") - shots[2].from}
      />
      {/* Rechtschaffen e a ficha de `unknown-cause` entram aqui, por cima da bancada que desce: a troca de
          cena não deixa a tela só com a parede. */}
      <Prelude lead={EXAM_LEAD}>
        {(until) => <UnknownCauseOpening until={until} />}
      </Prelude>
    </Shot>
  </>
);
