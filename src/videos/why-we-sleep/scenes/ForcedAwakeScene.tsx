import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { cameraBetween, framing } from "../../../components/Camera";
import { Grain } from "../../../components/Grain";
import { wave } from "../../../components/Idle";
import { Onomatopoeia } from "../../../components/Onomatopoeia";
import { Place } from "../../../components/Place";
import { SvgLayer } from "../../../components/SvgLayer";
import { cue, linear, mix, ramp } from "../../../components/timing";
import type { SceneProps } from "../../../video/NarratedVideo";
import { Shot } from "../../../video/Shot";
import { alarmClock, sound } from "../palette";
import { Calendar } from "../parts/Calendar";
import { Chalkboard, Researcher, type Box } from "../parts/Chalkboard";
import { IdeaBackdrop } from "../parts/IdeaBackdrop";
import { IconRow, MapIcon, iconSpot } from "../parts/IconRow";
import { BENCH_Y, Glove, LAB } from "../parts/Laboratory";
import { Rat, RatLab, RatRow } from "../parts/Rats";
import { ROW_HUE } from "./FivePartsScene";

// A fila no mesmo lugar das outras voltas dela.
const ROW = { x: 960, y: 560, scale: 1.12 };
// Quanto o ícone aceso cresce em relação aos vizinhos.
const GROWN = 1.3;

type MapShotProps = {
  /** Quadros do plano em que o contorno ganha o X e em que o despertador acende. */
  readonly crossAt: number;
  readonly nextAt: number;
};

/** A fila volta: o contorno sem cérebro, "2", ganha um X, e o despertador, "3", acende. */
const MapShot: React.FC<MapShotProps> = ({ crossAt, nextAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill>
      <IdeaBackdrop hue={ROW_HUE} spot={[0.5, 0.5]} />
      <IconRow
        {...ROW}
        hue={ROW_HUE}
        states={{
          eyes: "check",
          ruler: "cross",
          brain: frame >= crossAt ? "cross" : "on",
          alarm: frame >= nextAt ? "on" : "off",
        }}
        since={{ brain: crossAt, alarm: nextAt }}
        grow={{ alarm: mix(1, GROWN, ramp(frame, nextAt, 0.5 * fps)) }}
      />
      <Grain />
    </AbsoluteFill>
  );
};

// O rato sonolento é o assunto: no centro, grande, com o despertador sobre ele.
const SLEEPY = { x: 860, width: 640 };
const CLOCK = { x: 1250, y: 330, radius: 124 };
// No ícone, o corpo do despertador tem este raio, em fração do diâmetro do medalhão.
const ICON_BODY = (56 * 0.82) / 220;
const SPOT = iconSpot("alarm", ROW);
const WALL_CALENDAR = { x: 330, y: 430, scale: 1.5, days: 32 };

type AlarmClockProps = {
  /** O raio do corpo, em pixels do quadro. */
  readonly radius: number;
  /** Tocando: os riscos saem das campainhas. */
  readonly ringing: boolean;
};

/** O despertador do ícone, fora do medalhão: os pés, as campainhas, o corpo, o mostrador e os ponteiros. */
export const AlarmClock: React.FC<AlarmClockProps> = ({ radius, ringing }) => (
  <svg
    width={radius * 4}
    height={radius * 4}
    viewBox="-112 -112 224 224"
    overflow="visible"
  >
    {[-1, 1].map((side) => (
      <g key={side}>
        <rect
          x={side * 34 - 7}
          y={36}
          width={14}
          height={30}
          rx={7}
          fill={alarmClock.bell}
          transform={`rotate(${-side * 24} ${side * 34} 40)`}
        />
        <circle cx={side * 40} cy={-46} r={22} fill={alarmClock.bell} />
        {ringing ? (
          <path
            d={`M${side * 74},-70 L${side * 90},-82 M${side * 80},-48 L${side * 100},-50 M${side * 62},-88 L${side * 70},-104`}
            stroke={alarmClock.bell}
            strokeWidth={7}
            strokeLinecap="round"
          />
        ) : null}
      </g>
    ))}
    <circle cy={4} r={56} fill={alarmClock.body} />
    <circle cy={4} r={42} fill={alarmClock.face} />
    <path
      d="M0,4 L0,-22 M0,4 L18,14"
      fill="none"
      stroke={alarmClock.hand}
      strokeWidth={8}
      strokeLinecap="round"
    />
  </svg>
);

type AlarmShotProps = {
  /** Quadro do plano em que o despertador toca. */
  readonly ringAt: number;
};

/**
 * O ícone do despertador sai da fila, cresce e vira o despertador que uma mão
 * segura sobre o rato sonolento; atrás, o calendário risca um dia depois do outro.
 */
const AlarmShot: React.FC<AlarmShotProps> = ({ ringAt }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const seconds = frame / fps;
  const ringing = frame >= ringAt;
  // O ícone viaja da fila até a mão; na segunda metade, o medalhão some e fica o despertador.
  const moved = ramp(frame, 2, 0.6 * fps);
  const real = ramp(frame, 2 + 0.3 * fps, 0.3 * fps);
  const x = mix(SPOT.x, CLOCK.x, moved);
  const y = mix(SPOT.y, CLOCK.y, moved);
  const iconSize =
    SPOT.size *
    GROWN *
    (CLOCK.radius / ICON_BODY / (SPOT.size * GROWN)) ** moved;
  const shake = ringing ? 7 * wave(seconds, 0.12) : 0;

  return (
    <AbsoluteFill>
      <RatLab
        camera={cameraBetween(
          LAB.medium,
          framing([960, 600], 1.04, [960, 600]),
          frame / durationInFrames,
        )}
        wall={
          <div
            style={{
              position: "absolute",
              inset: 0,
              scale: `${WALL_CALENDAR.scale}`,
              transformOrigin: `${WALL_CALENDAR.x}px ${WALL_CALENDAR.y}px`,
            }}
          >
            <Calendar
              x={WALL_CALENDAR.x}
              y={WALL_CALENDAR.y}
              days={WALL_CALENDAR.days}
              filled={1 + 9 * linear(frame, 0.5 * fps, durationInFrames)}
            />
          </div>
        }
      >
        <SvgLayer>
          <ellipse
            cx={SLEEPY.x}
            cy={BENCH_Y + 10}
            rx={SLEEPY.width * 0.46}
            ry={26}
            fill={alarmClock.hand}
            opacity={0.14}
          />
        </SvgLayer>
        <Place x={SLEEPY.x} y={BENCH_Y + 8} anchor="bottom">
          <Rat
            width={SLEEPY.width}
            state={ringing ? "sleepy" : "asleep"}
            close
          />
        </Place>
        {/* A mão entra com o despertador, do canto de cima. */}
        <AbsoluteFill
          style={{
            translate: `${(1 - moved) * 900}px ${(moved - 1) * 300}px`,
          }}
        >
          <SvgLayer>
            <Glove
              from={[2040, 60]}
              to={[CLOCK.x + CLOCK.radius * 0.7, CLOCK.y + 10]}
              size={110}
            />
          </SvgLayer>
        </AbsoluteFill>
      </RatLab>
      {/* A fila de onde o ícone saiu some por cima do laboratório. */}
      <AbsoluteFill style={{ opacity: 1 - ramp(frame, 2, 0.4 * fps) }}>
        <IdeaBackdrop hue={ROW_HUE} spot={[0.5, 0.5]} />
        <IconRow
          {...ROW}
          hue={ROW_HUE}
          states={{ eyes: "check", ruler: "cross", brain: "cross" }}
          omit={["alarm"]}
        />
      </AbsoluteFill>
      <Place x={x} y={y} style={{ opacity: 1 - real }}>
        <MapIcon icon="alarm" state="on" hue={ROW_HUE} size={iconSize} />
      </Place>
      <Place x={x} y={y} style={{ opacity: real, rotate: `${shake}deg` }}>
        <AlarmClock radius={iconSize * ICON_BODY} ringing={ringing} />
      </Place>
      <Place x={760} y={250}>
        <Onomatopoeia
          at={ringAt}
          size={130}
          color={sound.hot}
          edge={sound.edge}
        >
          TRIIIM
        </Onomatopoeia>
      </Place>
    </AbsoluteFill>
  );
};

// O quadro-negro do gancho na parede do laboratório, com o pesquisador ao lado e os ratos aos pés dele.
const BOARD: Box = { x: 650, y: 50, width: 1130, height: 500 };
const RECHTSCHAFFEN = { x: 270, y: 1040, height: 700 };
// A fileira termina antes do selo da fonte, que ocupa o canto de baixo à direita: a cauda do último rato encostava nele.
const TEN = { x: 1000, y: 1006, width: 200, spacing: 196, rows: 2 } as const;
const WIDE = framing([960, 540], 1);
// De perto: as duas fileiras de ratos enchem a largura. O enquadramento desce até a calha do quadro-negro
// sair por cima: cortada no alto, era uma barra sem nome.
const ON_RATS = framing([TEN.x + 20, TEN.y - 65], 1.72, [960, 590]);
// Quanto cada rato se ergue pela frente, em graus: com menos, eles olhavam para a esquerda, e não para o quadro.
const LOOK_UP = 24;

type BoardShotProps = {
  /** Quanto o quadro já abriu, de 0 (os ratos de perto) a 1 (a sala inteira). */
  readonly opened: number;
  /** Quadro do plano em que a etiqueta de nome entra; sem valor, não há. */
  readonly nameAt?: number;
  /** Só os ratos: de perto, do pesquisador sobrava a mão no canto, uma bola cor de pele sem dono. */
  readonly alone?: boolean;
};

/**
 * A sala de Rechtschaffen: ele diante do quadro-negro do gancho, com a árvore
 * e o carimbo "erro?", e os dez ratos aos pés do quadro, olhando para cima.
 * De perto, só os ratos; aberto, a sala inteira.
 */
const BoardShot: React.FC<BoardShotProps> = ({
  opened,
  nameAt,
  alone = false,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <RatLab
      floor
      camera={cameraBetween(ON_RATS, WIDE, opened)}
      wall={<Chalkboard box={BOARD} stamp="full" />}
    >
      {alone ? null : (
        <Researcher
          {...RECHTSCHAFFEN}
          pointing
          nameAt={nameAt}
          nameOffset={[180, -RECHTSCHAFFEN.height - 60]}
          on="mint"
        />
      )}
      <RatRow
        {...TEN}
        state={() => "awake"}
        seconds={frame / fps}
        lookUp={LOOK_UP}
      />
    </RatLab>
  );
};

/** O quadro abre dos ratos para a sala inteira, no começo do plano. */
const OpeningShot: React.FC<{ nameAt: number }> = ({ nameAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return <BoardShot opened={ramp(frame, 0, 0.9 * fps)} nameAt={nameAt} />;
};

export const ForcedAwakeScene: React.FC<SceneProps> = ({ scene, shots }) => {
  const { fps } = useVideoConfig();
  return (
    <>
      <Shot range={shots[0]} name="o contorno ganha um X; o despertador acende">
        <MapShot
          crossAt={cue(scene, "segundo")}
          // O despertador acende ainda neste plano, com folga: no seguinte ele já sai da fila.
          nextAt={Math.min(cue(scene, "Resta"), shots[0].to - 0.9 * fps)}
        />
      </Shot>
      <Shot range={shots[1]} name="o despertador sobre o rato sonolento">
        <AlarmShot ringAt={cue(scene, "acordado") - shots[1].from} />
      </Shot>
      <Shot range={shots[2]} name="dez ratos, de perto, olham para cima">
        <BoardShot opened={0} alone />
      </Shot>
      <Shot
        range={shots[3]}
        name="Rechtschaffen, o quadro-negro e os dez ratos"
      >
        <OpeningShot nameAt={cue(scene, "Álan") - shots[3].from} />
      </Shot>
    </>
  );
};
