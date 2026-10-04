import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { Frigatebird } from "../../../art/Frigatebird";
import {
  Camera,
  cameraBetween,
  framing,
  type CameraState,
} from "../../../components/Camera";
import { useStage } from "../../../components/Cast";
import { Grain } from "../../../components/Grain";
import { blink, wave } from "../../../components/Idle";
import { Onomatopoeia } from "../../../components/Onomatopoeia";
import { Place } from "../../../components/Place";
import type { SceneProps } from "../../../video/NarratedVideo";
import { Shot } from "../../../video/Shot";
import { frigatebird, frigatebirdNight, ink, sound } from "../palette";
import { Calendar } from "../parts/Calendar";
import { SkyOcean } from "../parts/SkyOcean";
import { SleptBars } from "../parts/SleepRuler";
import { cue, linear, mix, ramp } from "../../../components/timing";

/** A fragata no plano do assunto: onde plana e a envergadura. */
export const BIRD = { x: 900, y: 440, span: 420 };
export const SKY_CAMERA = {
  wide: framing([960, 540], 1),
  wideEnd: framing([BIRD.x, BIRD.y], 1.05, [BIRD.x, BIRD.y]),
  /** Perto dela planando. */
  medium: framing([BIRD.x, BIRD.y], 2.2, [960, 520]),
  /** Ela planando na metade de baixo do quadro, com o céu livre em cima para a comparação. */
  low: framing([BIRD.x, BIRD.y], 1.15, [960, 830]),
  /** A cabeça enchendo o quadro. */
  head: framing([BIRD.x - 150, BIRD.y - 10], 5, [900, 540]),
} as const;
const FLIGHT_DAYS = 10;
// De quão longe, à direita, a fragata entra voando no palco.
const BIRD_FLY_IN = 800;
// O cochilo em pleno voo: quando as pálpebras fecham e quando abrem, em segundos do plano.
const NAP_SECONDS = [0.5, 1.9] as const;
const NAP_SINK = 14;

/** Dia e noite se alternam como um cosseno: 1 ao meio-dia, 0 à meia-noite. */
export const daylightAt = (cycles: number) =>
  0.5 - 0.5 * Math.cos(cycles * Math.PI * 2);

type GlidingBirdProps = {
  readonly x: number;
  readonly y: number;
  readonly daylight: number;
  readonly lid?: number;
  /** Inclinação do voo, em graus: positivo desce. */
  readonly tilt?: number;
  readonly seconds: number;
  readonly span?: number;
};

/** A fragata planando, com a pausa viva de quem plana: inclina devagar, ajusta as asas, pisca. */
export const GlidingBird: React.FC<GlidingBirdProps> = ({
  x,
  y,
  daylight,
  lid = 0.1,
  tilt = 0,
  seconds,
  span = BIRD.span,
}) => (
  <Place
    id="frigatebird"
    x={x}
    y={y + 8 * wave(seconds, 3.2)}
    style={{ rotate: `${tilt + 3 * wave(seconds, 4.1, 0.2)}deg` }}
  >
    <Frigatebird
      width={span}
      colors={daylight < 0.5 ? frigatebirdNight : frigatebird}
      lid={Math.max(lid, blink(seconds, "frigatebird"))}
      sweep={0.3 * wave(seconds, 2.7)}
    />
  </Place>
);

type SkyShotProps = {
  readonly camera: CameraState;
  readonly daylight: number;
  readonly orb?: number;
  readonly island?: number;
  readonly extras?: React.ReactNode;
  readonly children: React.ReactNode;
};

export const SkyShot: React.FC<SkyShotProps> = ({
  camera,
  daylight,
  orb,
  island,
  extras,
  children,
}) => (
  <AbsoluteFill>
    <Camera {...camera}>
      <SkyOcean daylight={daylight} orb={orb} island={island} extras={extras}>
        {children}
      </SkyOcean>
    </Camera>
    <Grain />
  </AbsoluteFill>
);

type TenDaysShotProps = {
  /** Quadros do plano em que o calendário entra e em que fecha os dez dias. */
  readonly countAt: number;
  readonly countDoneAt: number;
};

/** Céu imenso, mar lá embaixo, sem terra à vista: ela plana enquanto o calendário enche dez dias. */
const TenDaysShot: React.FC<TenDaysShotProps> = ({ countAt, countDoneAt }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const progress = frame / durationInFrames;
  // O dia toma o céu da cena anterior, o mar sobe, e a fragata entra voando.
  const entered = useStage().enter();

  return (
    <AbsoluteFill>
      <SkyShot
        camera={cameraBetween(SKY_CAMERA.wide, SKY_CAMERA.wideEnd, progress)}
        daylight={1}
        orb={0.7}
      >
        <GlidingBird
          x={mix(BIRD.x + 460, BIRD.x, progress) + BIRD_FLY_IN * (1 - entered)}
          y={mix(BIRD.y - 60, BIRD.y, progress)}
          daylight={1}
          seconds={frame / fps}
        />
      </SkyShot>
      <Calendar
        on="lilac"
        x={1560}
        y={250}
        days={FLIGHT_DAYS}
        filled={FLIGHT_DAYS * linear(frame, countAt, countDoneAt - countAt)}
        label="10 dias no ar"
        labelAt={countDoneAt}
        enter={countAt}
      />
    </AbsoluteFill>
  );
};

type FortyMinutesShotProps = {
  /** Quadro do plano em que a barra dela entra. */
  readonly minutesAt: number;
};

/** De noite, a barra dela entra debaixo das outras duas: um fiapo. */
const FortyMinutesShot: React.FC<FortyMinutesShotProps> = ({ minutesAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill>
      <SkyShot camera={SKY_CAMERA.low} daylight={0} orb={0.2}>
        <GlidingBird x={BIRD.x} y={BIRD.y} daylight={0} seconds={frame / fps} />
      </SkyShot>
      <SleptBars
        on="night"
        top={110}
        tone={ink.paper}
        ours={{}}
        elephant={{}}
        frigatebird={{
          filled: ramp(frame, minutesAt, 0.4 * fps),
          labelAt: minutesAt + 0.2 * fps,
        }}
      />
    </AbsoluteFill>
  );
};

// O "zz" do cochilo, acima da cabeça dela, em pixels do quadro.
const NAP_SOUND = { x: 620, y: 300 };

/** De perto: as pálpebras fecham por um instante, ela afunda um pouco no ar e abre os olhos. */
const NapShot: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const napping =
    ramp(frame, NAP_SECONDS[0] * fps, 0.25 * fps) -
    ramp(frame, NAP_SECONDS[1] * fps, 0.15 * fps);

  return (
    <AbsoluteFill>
      <SkyShot camera={SKY_CAMERA.head} daylight={0}>
        <GlidingBird
          x={BIRD.x}
          y={BIRD.y + NAP_SINK * napping}
          daylight={0}
          lid={napping}
          tilt={4 * napping}
          seconds={frame / fps}
        />
      </SkyShot>
      <div style={{ opacity: napping }}>
        <Place x={NAP_SOUND.x} y={NAP_SOUND.y}>
          <Onomatopoeia
            at={NAP_SECONDS[0] * fps}
            size={90}
            color={sound.cool}
            edge={sound.edge}
            fade={0.25}
          >
            zz
          </Onomatopoeia>
        </Place>
      </div>
    </AbsoluteFill>
  );
};

export const FrigatebirdScene: React.FC<SceneProps> = ({ scene, shots }) => (
  <>
    <Shot range={shots[0]} name="dez dias no ar">
      <TenDaysShot
        countAt={cue(scene, "dez")}
        countDoneAt={cue(scene, "oceano")}
      />
    </Shot>
    <Shot range={shots[1]} name="quarenta minutos por dia">
      <FortyMinutesShot minutesAt={cue(scene, "quarenta") - shots[1].from} />
    </Shot>
    <Shot range={shots[2]} name="cochilos em pleno voo">
      <NapShot />
    </Shot>
  </>
);
