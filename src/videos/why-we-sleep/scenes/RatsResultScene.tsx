import { Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import {
  cameraBetween,
  framing,
  type CameraState,
} from "../../../components/Camera";
import { wave } from "../../../components/Idle";
import { Onomatopoeia } from "../../../components/Onomatopoeia";
import { Place } from "../../../components/Place";
import { Pop, POP_SECONDS, popScale } from "../../../components/Pop";
import { SvgLayer } from "../../../components/SvgLayer";
import { ALREADY_SHOWN, cue, linear, ramp, clamp } from "../../../components/timing";
import type { SceneProps } from "../../../video/NarratedVideo";
import { Shot, useShotLength } from "../../../video/Shot";
import { ink, lab, signs, sound } from "../palette";
import { Calendar } from "../parts/Calendar";
import { BENCH_Y } from "../parts/Laboratory";
import { BENCH_SPAN, RatLab, RatRow, RATS, rowRatSpot } from "../parts/Rats";
import { Tag } from "../parts/Tag";
import { Prelude } from "./MaybeBrainScene";
import { EXAM_LEAD, UnknownCauseOpening } from "./UnknownCauseScene";
import {
  BENCH_STRETCHES,
  DISC_MEDIUM_END,
  DiscAtRest,
  DiscPlaque,
} from "./RatsDiscScene";

/**
 * A bancada continua de `rats-disc`: a câmera desliza do disco para os ratos
 * de comparação, no segundo trecho, e deles para os dez em fila sob o
 * calendário, no terceiro. Cada plano desenha o trecho em que está e o de
 * onde a câmera vem, enquanto ela ainda o vê.
 */
const SECOND = BENCH_SPAN;
const THIRD = 2 * BENCH_SPAN;
// Depois destes quadros a câmera já deixou o trecho anterior, e ele não é mais desenhado.
const LEFT_BEHIND = 26;

// Os ratos de comparação, de perto: três deles enchem a largura do quadro.
const CONTROLS = {
  x: SECOND + 960,
  y: BENCH_Y + 10,
  width: 440,
  spacing: 500,
  count: 3,
};
const ON_CONTROLS = framing([SECOND + 960, 660], 1.36, [960, 600]);
// Onde a deriva do plano de perto termina: é daqui que a câmera desliza para os dez.
const ON_CONTROLS_END = framing([SECOND + 960, 660], 1.375, [960, 600]);
const BADGE = { x: SECOND + 1500, y: 430, radius: 70 };
// Limpar o focinho: quanto o rato se ergue, em fração de `GROOM_UP` graus, e por quantos quadros esfrega.
const GROOM_UP = 15;
const GROOM = { after: 6, rise: 6, rub: 20, down: 7 };

type ControlsSetProps = {
  /** O tempo do vídeo, em segundos. */
  readonly seconds: number;
  /** Quadros do plano em que o ronco aparece e em que o visto de "saudáveis" entra; sem valores, já estão lá. */
  readonly snoreAt?: number;
  readonly wellAt?: number;
};

/** O segundo trecho da bancada: os ratos de comparação, inteiros e bem. Um cochila, os outros se limpam e farejam. */
const ControlsSet: React.FC<ControlsSetProps> = ({
  seconds,
  snoreAt = ALREADY_SHOWN,
  wellAt = ALREADY_SHOWN,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const frames = POP_SECONDS * fps;
  const napper = rowRatSpot(1, CONTROLS);
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
  const rubbing = up * wave(groomed / fps, 0.2);
  const sniffed = interpolate(groomed - 12, [0, 5, 16, 22], [0, 1, 1, 0], {
    ...clamp,
    easing: Easing.inOut(Easing.quad),
  });

  return (
    <>
      <RatRow
        {...CONTROLS}
        state={() => "awake"}
        seconds={seconds}
        close
        alive={1}
        seed="control"
        lookUp={GROOM_UP}
        raised={(index) =>
          index === 0
            ? up * (1 + 0.16 * rubbing)
            : index === 2
              ? 0.5 * sniffed
              : // Quem cochila pende um nada a cada expiração.
                -0.08 * (1 + wave(seconds, 4.4, 0.2))
        }
        motion={(index) =>
          index === 1
            ? { lid: 1 }
            : index === 0
              ? { lid: 0.7 * up, whisker: 9 * rubbing, ear: 10 * rubbing }
              : { whisker: 10 * sniffed * wave(seconds, 0.16), lid: 0 }
        }
      />
      <Place
        x={napper.x + 40}
        y={napper.y - CONTROLS.width * 0.5 - 70}
        style={{
          scale: `${1 / ON_CONTROLS.zoom}`,
          // O ronco sobe e desce com a respiração de quem dorme.
          translate: `-50% calc(-50% + ${6 * wave(seconds, 4.4, 0.2)}px)`,
          rotate: `${2 * wave(seconds, 3.1)}deg`,
        }}
      >
        <Onomatopoeia
          at={snoreAt}
          size={96}
          color={sound.warm}
          edge={sound.edge}
          tilt={12}
          fade={0.22}
        >
          ZZZ
        </Onomatopoeia>
      </Place>
      <Place
        x={rowRatSpot(0, CONTROLS).x}
        y={CONTROLS.y - CONTROLS.width * 0.5 - 56}
        style={{ scale: `${1 / ON_CONTROLS.zoom}` }}
      >
        <Tag size="note" on="mint">
          comparação
        </Tag>
      </Place>
      {/* O visto: saudáveis. A mesma marca verde dos ícones vencidos da fila; o risco se desenha depois de o selo assentar. */}
      {frame >= wellAt ? (
        <SvgLayer>
          <g
            transform={`translate(${BADGE.x} ${BADGE.y}) scale(${interpolate(
              frame,
              [wellAt, wellAt + frames * 0.7, wellAt + frames],
              [0, 1.12, 1],
              { ...clamp, easing: Easing.out(Easing.quad) },
            )})`}
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
const TEN = { x: THIRD + 960, y: BENCH_Y + 8, width: 176, spacing: 178 };
const CALENDAR = { x: THIRD + 960, y: 400, scale: 2, days: 32 };
const TEN_WIDE = framing([THIRD + 960, 540], 1);
// O plano dos dez chega aberto e se aproxima um nada; o seguinte recua devagar dali até o quadro aberto.
const TEN_NEAR = framing([THIRD + 960, 620], 1.035, [960, 620]);
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
};

/** A marca de um dia do calendário: o aro em volta da célula e a etiqueta, ligada a ela por uma linha que sai do calendário. */
const DayMark: React.FC<DayMarkProps> = ({ day, at, side }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const frames = POP_SECONDS * fps;
  const spot = daySpot(day);
  // O aro vem de fora e fecha em volta da célula.
  const size =
    (GRID.cell * CALENDAR.scale + 22) * popScale(frame, at, frames, 1.7, 0.94);
  const tagX = CALENDAR.x + side * 520;
  const edge = CALENDAR.x + side * PAPER_HALF;
  const line = ramp(frame, at + 2, 7);

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
          x={spot.x - size / 2}
          y={spot.y - size / 2}
          width={size}
          height={size}
          rx={18}
          fill="none"
          stroke={lab.clip}
          strokeWidth={10}
        />
      </SvgLayer>
      <Place x={tagX} y={spot.y}>
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

/** O terceiro trecho: o calendário na parede. Vai em `wall`, atrás da bancada. */
const TenWall: React.FC<Pick<TenSetProps, "day" | "marks">> = ({
  day,
  marks,
}) => (
  <>
    <div
      style={{
        position: "absolute",
        inset: 0,
        scale: `${CALENDAR.scale}`,
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
        <DayMark day={FIRST_DAY} at={marks[0]} side={-1} />
        <DayMark day={LAST_DAY} at={marks[1]} side={1} />
      </>
    ) : null}
  </>
);

/**
 * Os dez ratos em fila sob o calendário. Eles baixam a cabeça em cascata e
 * ficam quietos; depois, um a um, a cor sai devagar e sobra a silhueta. Não
 * há queda, estouro nem tremor: é o único trecho do vídeo assim.
 */
const TenRow: React.FC<Omit<TenSetProps, "day">> = ({
  seconds,
  bowAt,
  marks,
}) => {
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
      alive={0.35}
      bowed={bowed}
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

/** A bancada comprida de `rats-disc`, com a câmera escrita pelo plano. */
const Bench: React.FC<BenchProps> = ({ camera, wall, children }) => (
  <RatLab steady span={BENCH_STRETCHES} camera={camera} wall={wall}>
    {children}
  </RatLab>
);

type ControlsShotProps = StageProps & {
  /** Quadro do plano em que o visto de "saudáveis" entra. */
  readonly wellAt: number;
};

/** A câmera desliza do disco para os ratos de comparação, de perto; o visto fecha o resultado. */
const ControlsShot: React.FC<ControlsShotProps> = ({ videoClock, wellAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const length = useShotLength();
  const arrive = 0.7 * fps;

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
      wall={frame < LEFT_BEHIND ? <DiscPlaque /> : null}
    >
      {frame < LEFT_BEHIND ? <DiscAtRest videoClock={videoClock} /> : null}
      <ControlsSet
        seconds={(videoClock + frame) / fps}
        // O ronco e o visto esperam a câmera chegar.
        snoreAt={arrive + 3}
        wellAt={Math.max(wellAt, arrive + 9)}
      />
    </Bench>
  );
};

/** A câmera desliza aos dez, em fila, sob o calendário, que começa a se preencher; eles baixam a cabeça em cascata. */
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
  // O primeiro dia só se risca com o calendário no quadro.
  const from = Math.max(fillAt, arrive - 8);

  return (
    <Bench
      camera={cameraBetween(
        ON_CONTROLS_END,
        cameraBetween(
          TEN_WIDE,
          TEN_NEAR,
          linear(frame, arrive, length - arrive),
        ),
        ramp(frame, 0, arrive),
      )}
      wall={<TenWall day={DAYS_BEFORE * linear(frame, from, length - from)} />}
    >
      {frame < LEFT_BEHIND ? <ControlsSet seconds={seconds} /> : null}
      <TenRow seconds={seconds} bowAt={Math.max(bowAt, arrive)} />
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

  return (
    <Bench
      camera={cameraBetween(TEN_NEAR, TEN_WIDE, linear(frame, 0, length))}
      wall={<TenWall day={day} marks={[firstAt, lastAt + 4]} />}
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
