import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { Stopwatch } from "../../../art/Stopwatch";
import {
  Camera,
  cameraBetween,
  framing,
  type CameraState,
} from "../../../components/Camera";
import { Grain } from "../../../components/Grain";
import { wave } from "../../../components/Idle";
import { Place } from "../../../components/Place";
import { Pop } from "../../../components/Pop";
import { cue, linear, ramp } from "../../../components/timing";
import type { SceneProps } from "../../../video/NarratedVideo";
import { Shot, type Wipe } from "../../../video/Shot";
import { stopwatch } from "../palette";
import { Calendar } from "../parts/Calendar";
import { daylightAt, Herd, orbAt, type HerdMember } from "../parts/Herd";
import { Savanna } from "../parts/Savanna";

// As duas manadas vêm uma de cada lado e se encontram no meio do quadro. As
// duas matriarcas do estudo são as que vão à frente, maiores e mais perto: é
// só isso que as distingue. Não levam colar: o sono foi medido pela tromba, e
// o colar sugeria outra coisa (decisão do usuário). As de trás vêm primeiro.
const LEFT_HERD: readonly HerdMember[] = [
  { x: 250, y: -76, width: 200, seed: "left-far", flipped: true },
  { x: 470, y: -44, width: 225, seed: "left-mid", flipped: true },
  { x: 110, y: -10, width: 130, seed: "left-calf", flipped: true },
];
const RIGHT_HERD: readonly HerdMember[] = [
  { x: 1670, y: -76, width: 200, seed: "right-far" },
  { x: 1450, y: -44, width: 225, seed: "right-mid" },
  { x: 1810, y: -10, width: 130, seed: "right-calf" },
];
const MATRIARCHS = {
  left: { x: 770, y: 20, width: 330, seed: "matriarch-left", flipped: true },
  right: { x: 1150, y: 20, width: 330, seed: "matriarch-right" },
} as const;
// Quanto cada manada ainda tem por andar quando o plano aberto começa.
const WALK = 170;

const WIDE = framing([960, 540], 1);
/** As duas de perto, frente a frente: enchem o quadro, e o rabo de cada uma sai pela borda. */
const CLOSE = framing([960, 760], 2.5, [960, 600]);
/** O plano médio: as duas embaixo, com o céu livre em cima para o sol e a lua passarem. */
const MEDIUM = framing([960, 760], 1.5, [960, 720]);

type HerdsProps = {
  readonly camera: CameraState;
  readonly daylight: number;
  readonly orb: number;
  /** Quanto falta andar, em pixels, e quanto andam, de 0 a 1. */
  readonly apart?: number;
  readonly walking?: number;
};

/** As duas manadas na savana, vistas pela câmera. */
const Herds: React.FC<HerdsProps> = ({
  camera,
  daylight,
  orb,
  apart = 0,
  walking = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const seconds = frame / fps;

  return (
    <Camera {...camera}>
      <Savanna daylight={daylight} orb={orb}>
        <AbsoluteFill style={{ translate: `${-apart}px 0` }}>
          <Herd
            members={[...LEFT_HERD, MATRIARCHS.left]}
            daylight={daylight}
            walking={walking}
            seconds={seconds}
          />
        </AbsoluteFill>
        <AbsoluteFill style={{ translate: `${apart}px 0` }}>
          <Herd
            members={[...RIGHT_HERD, MATRIARCHS.right]}
            daylight={daylight}
            walking={walking}
            seconds={seconds + 0.4}
          />
        </AbsoluteFill>
      </Savanna>
    </Camera>
  );
};

/** A savana de dia: as duas manadas caminham, cada matriarca à frente da sua. */
const HerdsShot: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  return (
    <AbsoluteFill>
      <Herds
        camera={WIDE}
        daylight={1}
        orb={0.3}
        apart={WALK * (1 - linear(frame, 0, durationInFrames))}
        walking={1}
      />
      <Grain />
    </AbsoluteFill>
  );
};

/** As duas matriarcas de perto: presas pequenas, orelhas grandes. */
const MatriarchsShot: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill>
      <Herds
        camera={cameraBetween(WIDE, CLOSE, ramp(frame, 0, 0.8 * fps))}
        daylight={1}
        orb={0.3}
      />
      <Grain />
    </AbsoluteFill>
  );
};

// O calendário no canto de cima, à direita; o selo da fonte fica no de baixo.
const CALENDAR = { x: 1560, y: 310, scale: 1.4, days: 35 };
// Quantos dias e noites passam enquanto o calendário enche, e a hora em que o plano abre.
const SPAN = { from: 0.12, cycles: 2.6 };

type CountShotProps = {
  /** Quadros do plano em que o calendário acaba de encher e em que ganha o número. */
  readonly fullAt: number;
  readonly daysAt: number;
};

/** O sol e a lua passam sobre as duas enquanto um calendário de 35 dias se preenche no canto. */
const CountShot: React.FC<CountShotProps> = ({ fullAt, daysAt }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const cycles = SPAN.from + SPAN.cycles * linear(frame, 0, durationInFrames);

  return (
    <AbsoluteFill>
      <Herds
        camera={cameraBetween(CLOSE, MEDIUM, ramp(frame, 0, 0.7 * fps))}
        daylight={daylightAt(cycles)}
        orb={orbAt(cycles)}
      />
      {/* A peça é pequena para um canto de quadro: cresce em volta do próprio centro. */}
      <AbsoluteFill
        style={{
          scale: `${CALENDAR.scale}`,
          transformOrigin: `${CALENDAR.x}px ${CALENDAR.y}px`,
        }}
      >
        <Calendar
          x={CALENDAR.x}
          y={CALENDAR.y}
          days={CALENDAR.days}
          filled={Math.round(
            CALENDAR.days * linear(frame, 0.4 * fps, fullAt - 0.4 * fps),
          )}
          label="35 dias"
          labelAt={daysAt}
          on="peach"
          enter={0.1 * fps}
        />
      </AbsoluteFill>
      <Grain />
    </AbsoluteFill>
  );
};

// A noite entra varrendo o dia, como em `night-falls`.
const NIGHTFALL: Wipe = { frames: 14, from: "right" };
// De perto, uma delas virada para a direita: a cabeça à esquerda, a tromba no meio, o cronômetro ao lado.
const SLEEPER: HerdMember = {
  x: 560,
  y: 160,
  width: 1500,
  seed: "trunk",
  flipped: true,
};
const WATCH = { x: 1610, y: 560, width: 330, minutes: 5 };

type TrunkShotProps = {
  /** Quadros do plano em que a tromba para, em que o cronômetro chega aos cinco minutos e em que o olho fecha. */
  readonly stillAt: number;
  readonly fiveAt: number;
  readonly asleepAt: number;
};

/** A tromba, que não parava, fica imóvel; o cronômetro ao lado corre até "5 min". */
const TrunkShot: React.FC<TrunkShotProps> = ({ stillAt, fiveAt, asleepAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const seconds = frame / fps;
  const moving = 1 - ramp(frame, stillAt, 0.3 * fps);
  const minutes = Math.round(
    WATCH.minutes * linear(frame, stillAt + 0.2 * fps, fiveAt - stillAt),
  );

  return (
    <AbsoluteFill>
      <Camera {...WIDE}>
        <Savanna daylight={0} orb={0.57}>
          <Herd
            members={[SLEEPER]}
            daylight={0}
            asleep={ramp(frame, asleepAt, 0.6 * fps)}
            // Inquieta, a tromba sobe e desce em dois ritmos; parada, cai solta.
            trunk={
              moving *
              (0.32 + 0.2 * wave(seconds, 0.9) + 0.08 * wave(seconds, 0.37))
            }
            seconds={seconds}
          />
        </Savanna>
      </Camera>
      <Place x={WATCH.x} y={WATCH.y}>
        <Pop at={0.2 * fps}>
          <Stopwatch
            width={WATCH.width}
            colors={stopwatch}
            reading={`${minutes} min`}
          />
        </Pop>
      </Place>
      <Grain />
    </AbsoluteFill>
  );
};

export const ElephantsScene: React.FC<SceneProps> = ({ scene, shots }) => (
  <>
    <Shot range={shots[0]} name="duas manadas, cada uma com a sua matriarca">
      <HerdsShot />
    </Shot>
    <Shot range={shots[1]} name="as duas matriarcas, de perto">
      <MatriarchsShot />
    </Shot>
    <Shot
      range={shots[2]}
      name="35 dias: o sol e a lua passam"
      hold={NIGHTFALL.frames}
    >
      <CountShot
        fullAt={cue(scene, "dias") - shots[2].from}
        daysAt={cue(scene, "trinta") - shots[2].from}
      />
    </Shot>
    <Shot
      range={shots[3]}
      name="a tromba para; o cronômetro corre até 5 min"
      wipe={NIGHTFALL}
    >
      <TrunkShot
        stillAt={cue(scene, "parada") - shots[3].from}
        fiveAt={cue(scene, "cinco", 2) - shots[3].from}
        asleepAt={cue(scene, "sono", 2) - shots[3].from}
      />
    </Shot>
  </>
);
