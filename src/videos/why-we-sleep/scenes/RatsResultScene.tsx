import { useCurrentFrame, useVideoConfig } from "remotion";
import { cameraBetween, framing } from "../../../components/Camera";
import { Onomatopoeia } from "../../../components/Onomatopoeia";
import { Place } from "../../../components/Place";
import {
  Pop,
  POP_SECONDS,
  popOpacity,
  popScale,
} from "../../../components/Pop";
import { SvgLayer } from "../../../components/SvgLayer";
import { cue, linear, ramp } from "../../../components/timing";
import type { SceneProps } from "../../../video/NarratedVideo";
import { Shot } from "../../../video/Shot";
import { ink, lab, signs, sound } from "../palette";
import { Calendar } from "../parts/Calendar";
import { BENCH_Y } from "../parts/Laboratory";
import { RatLab, RatRow, RATS, rowRatSpot, type RatState } from "../parts/Rats";
import { Tag } from "../parts/Tag";

// Os ratos de comparação, de perto: três deles enchem a largura do quadro.
const CONTROLS = {
  x: 960,
  y: BENCH_Y + 10,
  width: 440,
  spacing: 500,
  count: 3,
};
const ON_CONTROLS = framing([960, 660], 1.36, [960, 600]);
const BADGE = { x: 1500, y: 430, radius: 70 };

type ControlsShotProps = {
  /** Quadro do plano em que o visto de "saudáveis" entra. */
  readonly wellAt: number;
};

/** Os ratos de comparação, de perto, inteiros e bem: um deles cochila, e o visto fecha o resultado. */
const ControlsShot: React.FC<ControlsShotProps> = ({ wellAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const frames = POP_SECONDS * fps;
  const napper = rowRatSpot(1, CONTROLS);

  return (
    <RatLab camera={ON_CONTROLS}>
      <RatRow
        {...CONTROLS}
        state={(index) => (index === 1 ? "asleep" : "awake")}
        seconds={frame / fps}
        close
      />
      <Place
        x={napper.x + 40}
        y={napper.y - CONTROLS.width * 0.5 - 70}
        style={{ scale: `${1 / ON_CONTROLS.zoom}` }}
      >
        <Onomatopoeia
          at={0.3 * fps}
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
      {/* O visto: saudáveis. A mesma marca verde dos ícones vencidos da fila. */}
      <SvgLayer>
        <g
          transform={`translate(${BADGE.x} ${BADGE.y}) scale(${popScale(frame, wellAt, frames, 0.4, 1.2)})`}
          opacity={popOpacity(frame, wellAt, frames)}
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
          />
        </g>
      </SvgLayer>
    </RatLab>
  );
};

// Os dez impedidos de dormir, em fila sobre a bancada, e o calendário na parede, por cima deles.
const TEN = { x: 960, y: BENCH_Y + 8, width: 176, spacing: 178 };
const CALENDAR = { x: 960, y: 400, scale: 2, days: 32 };
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

/** O dia em que o rato de cada lugar da fila sai do experimento. */
const lastDayOf = (index: number) =>
  FIRST_DAY + ((LAST_DAY - FIRST_DAY) * ORDER[index]) / (RATS - 1);

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

/** A marca de um dia do calendário: o aro em volta da célula e a etiqueta, ligada a ela. */
const DayMark: React.FC<DayMarkProps> = ({ day, at, side }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const frames = POP_SECONDS * fps;
  const spot = daySpot(day);
  const size = GRID.cell * CALENDAR.scale + 22;
  const tagX = CALENDAR.x + side * 520;

  return (
    <>
      <SvgLayer>
        <g opacity={popOpacity(frame, at, frames)}>
          <path
            d={`M${CALENDAR.x + side * PAPER_HALF},${spot.y} L${tagX - side * 150},${spot.y}`}
            stroke={lab.clip}
            strokeWidth={8}
            strokeLinecap="round"
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
        </g>
      </SvgLayer>
      <Place x={tagX} y={spot.y}>
        <Pop at={at}>
          <Tag size="note" on="mint">
            {`dia ${day}`}
          </Tag>
        </Pop>
      </Place>
    </>
  );
};

type TenShotProps = {
  /** Quantos dias o calendário já riscou. */
  readonly day: number;
  /** A aproximação com que o plano começa: ele vem do plano de perto. */
  readonly from?: number;
  /** Quadros do plano em que o dia 11 e o dia 32 ganham a marca; sem valor, não há marca. */
  readonly marks?: readonly [number, number];
};

/** Os dez ratos em fila sob o calendário; quem já saiu do experimento é silhueta. */
const TenShot: React.FC<TenShotProps> = ({ day, from = 1, marks }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const state = (index: number): RatState =>
    day >= lastDayOf(index) ? "gone" : "awake";

  return (
    <RatLab
      camera={cameraBetween(
        framing([960, 620], from, [960, 620]),
        framing([960, 540], 1),
        ramp(frame, 0, 0.7 * fps),
      )}
      wall={
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
            />
          </div>
          {marks ? (
            <>
              <DayMark day={FIRST_DAY} at={marks[0]} side={-1} />
              <DayMark day={LAST_DAY} at={marks[1]} side={1} />
            </>
          ) : null}
        </>
      }
    >
      <RatRow {...TEN} state={state} seconds={frame / fps} />
    </RatLab>
  );
};

/** Os dez em fila, e o calendário começa a se preencher. */
const CountShot: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  return (
    <TenShot
      from={1.2}
      day={DAYS_BEFORE * linear(frame, 0.6 * fps, durationInFrames - 0.6 * fps)}
    />
  );
};

type DeclineShotProps = {
  /** Quadros do plano em que o primeiro rato sai (dia 11) e em que o último sai (dia 32). */
  readonly firstAt: number;
  readonly lastAt: number;
};

/** O dia 11 e o dia 32 ganham marca; entre um e outro, os ratos viram silhuetas, um a um. */
const DeclineShot: React.FC<DeclineShotProps> = ({ firstAt, lastAt }) => {
  const frame = useCurrentFrame();
  const day =
    frame < firstAt
      ? DAYS_BEFORE
      : FIRST_DAY +
        (LAST_DAY - FIRST_DAY) * linear(frame, firstAt, lastAt - firstAt);
  return <TenShot day={day} marks={[firstAt, lastAt]} />;
};

export const RatsResultScene: React.FC<SceneProps> = ({ scene, shots }) => (
  <>
    <Shot range={shots[0]} name="os ratos de comparação, inteiros e bem">
      <ControlsShot wellAt={cue(scene, "saudáveis")} />
    </Shot>
    <Shot range={shots[1]} name="os dez em fila, sob o calendário">
      <CountShot />
    </Shot>
    <Shot range={shots[2]} name="do dia 11 ao dia 32, viram silhuetas">
      <DeclineShot
        firstAt={cue(scene, "onze") - shots[2].from}
        lastAt={cue(scene, "mês") - shots[2].from}
      />
    </Shot>
  </>
);
