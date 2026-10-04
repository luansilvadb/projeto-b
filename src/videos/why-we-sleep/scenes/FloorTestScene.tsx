import { Leftovers } from "../../../components/Actors";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { Cassiopea } from "../../../art/Cassiopea";
import { Person } from "../../../art/Person";
import {
  Camera,
  Layer,
  cameraBetween,
  type CameraState,
} from "../../../components/Camera";
import { Grain } from "../../../components/Grain";
import { breath, wave } from "../../../components/Idle";
import { Place } from "../../../components/Place";
import { POP_SECONDS, popOpacity, popScale } from "../../../components/Pop";
import { SvgLayer } from "../../../components/SvgLayer";
import "../../../design/fonts";
import { typography } from "../../../design/tokens";
import type { SceneProps } from "../../../video/NarratedVideo";
import { Shot } from "../../../video/Shot";
import { ink, jellyfish, lab, researcher } from "../palette";
import {
  Glove,
  LAB,
  LabBench,
  LabWall,
  PLATFORM_Y,
  TANK_CENTER,
  Tank,
} from "../parts/Laboratory";
import {
  ALREADY_SHOWN,
  cue,
  mix,
  ramp,
  settle,
} from "../../../components/timing";
import { PULSES_ASLEEP, pulseShape } from "../parts/pulse";

/** Onde a pesquisadora fica nos planos de laboratório: os pés dela, atrás da bancada. */
export const RESEARCHER = { x: 380, y: 980, height: 760, lean: 5 };
/** Do centro da borda do sino até onde ele encosta no apoio, em relação à largura do sino. */
export const RESTING = 62 / 330;
export const JELLYFISH_WIDTH = 300;
/** Onde ela pousa quando está sobre a plataforma. */
export const RESTING_Y = PLATFORM_Y - JELLYFISH_WIDTH * RESTING;
/** Onde ela boia sem a plataforma. */
export const FLOATING_Y = 520;

/** A deriva de quem boia solta na água: sobe e desce e gira de leve. */
export const floating = (seconds: number) => ({
  y: 12 * wave(seconds, 2.6),
  tilt: 3 * wave(seconds, 3.4, 0.3),
});
const QUESTIONS = ["dormindo?", "parada?"];
const LEAN_SECONDS = 0.5;
const CAMERA_SECONDS = 0.5;
const PULL_SECONDS = 0.5;
const DRIFT_SECONDS = 1;
// A luva vem de cima, pela borda do tanque, e segura a ponta esquerda da plataforma.
const GLOVE_FROM = { x: 900, y: 320 };
const PLATFORM_HALF = 210;
// A plataforma sai do quadro pela esquerda, por trás do vidro.
const PULL = -560;

type ClipboardProps = {
  /** Quadro do plano em que cada pergunta aparece na prancheta. */
  readonly questionsAt: readonly number[];
};

/** A prancheta com as duas hipóteses por marcar, nas unidades do desenho da pesquisadora. */
const Clipboard: React.FC<ClipboardProps> = ({ questionsAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <g transform="rotate(-4 40 -266)">
      <rect
        x={-150}
        y={-372}
        width={370}
        height={212}
        rx={18}
        fill={lab.clip}
      />
      <rect
        x={-136}
        y={-358}
        width={342}
        height={184}
        rx={10}
        fill={lab.paper}
      />
      <rect
        x={2}
        y={-388}
        width={66}
        height={30}
        rx={10}
        fill={researcher.pantsShade}
      />
      {QUESTIONS.map((question, row) => {
        const at = questionsAt[row];
        const scale = popScale(frame, at, POP_SECONDS * fps);
        return (
          <g
            key={question}
            transform={`translate(-116 ${-318 + row * 84}) translate(100 21) scale(${scale}) translate(-100 -21)`}
            opacity={popOpacity(frame, at, POP_SECONDS * fps)}
          >
            <rect
              width={42}
              height={42}
              rx={9}
              fill="none"
              stroke={lab.clip}
              strokeWidth={7}
            />
            <text
              x={60}
              y={36}
              fontFamily={typography.family}
              fontWeight={typography.weight}
              fontSize={46}
              fill={ink.dark}
            >
              {question}
            </text>
          </g>
        );
      })}
    </g>
  );
};

type LabProps = {
  readonly camera: CameraState;
  readonly children: React.ReactNode;
};

/** O laboratório visto pela câmera: tudo no mesmo plano, do fundo ao vidro. */
export const Lab: React.FC<LabProps> = ({ camera, children }) => (
  <AbsoluteFill>
    <Camera {...camera}>
      <Layer depth={1}>
        {children}
        <Leftovers />
      </Layer>
    </Camera>
    <Grain />
  </AbsoluteFill>
);

type WatchingResearcherProps = {
  /** Quanto ela está inclinada para o vidro, de 0 a 1. */
  readonly lean: number;
  readonly questionsAt: readonly number[];
};

/** A pesquisadora atrás da bancada, olhando o tanque com a prancheta. */
const WatchingResearcher: React.FC<WatchingResearcherProps> = ({
  lean,
  questionsAt,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <Place
      x={RESEARCHER.x + 20 * lean}
      y={RESEARCHER.y}
      anchor="bottom"
      style={{
        rotate: `${RESEARCHER.lean * lean}deg`,
        scale: `1 ${breath(frame / fps, "researcher")}`,
      }}
    >
      <Person
        height={RESEARCHER.height}
        colors={researcher}
        bun
        plainFace
        frontArm={{ hand: [-146, -262], bend: 34 }}
        backArm={{ hand: [224, -270], bend: 30 }}
        held={<Clipboard questionsAt={questionsAt} />}
        heldInFront
      />
    </Place>
  );
};

type TankShotProps = {
  /** Quadro do plano em que a pesquisadora se inclina para o vidro. */
  readonly leanAt: number;
  readonly questionsAt: readonly number[];
};

/** O laboratório no plano médio: ela sobre a plataforma, a pesquisadora olhando com a prancheta. */
const TankShot: React.FC<TankShotProps> = ({ leanAt, questionsAt }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const seconds = frame / fps;

  return (
    <Lab
      camera={cameraBetween(
        LAB.medium,
        LAB.mediumEnd,
        frame / durationInFrames,
      )}
    >
      <LabWall />
      <WatchingResearcher
        lean={ramp(frame, leanAt, LEAN_SECONDS * fps)}
        questionsAt={questionsAt}
      />
      <LabBench />
      <Tank platform={TANK_CENTER}>
        <Place x={TANK_CENTER} y={RESTING_Y}>
          <Cassiopea
            width={JELLYFISH_WIDTH}
            colors={jellyfish.day}
            droop={0.8}
            pulse={pulseShape((seconds * PULSES_ASLEEP) / 60)}
          />
        </Place>
      </Tank>
    </Lab>
  );
};

type PullShotProps = {
  /** Quadro do plano em que a plataforma é puxada. */
  readonly pulledAt: number;
};

/** A câmera entra no tanque; a mão de luva segura a plataforma e a puxa de uma vez. */
export const PullShot: React.FC<PullShotProps> = ({ pulledAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const seconds = frame / fps;
  const arrived = CAMERA_SECONDS * fps;
  // A mão chega à plataforma antes do puxão, e avisa: recua um pouco.
  const reach = ramp(frame, arrived + 6, 0.6 * fps);
  const windup = ramp(frame, pulledAt - 0.3 * fps, 0.3 * fps);
  const pull = PULL * settle(frame, pulledAt, PULL_SECONDS * fps);
  const platformX = TANK_CENTER + 30 * windup + pull;
  const drift = ramp(frame, pulledAt + 6, DRIFT_SECONDS * fps);
  const handle = [platformX - PLATFORM_HALF + 24, PLATFORM_Y + 8] as const;

  return (
    <Lab
      camera={cameraBetween(LAB.mediumEnd, LAB.close, ramp(frame, 0, arrived))}
    >
      <LabWall />
      {/* Ela continua onde estava enquanto a câmera entra no tanque. */}
      <WatchingResearcher
        lean={1}
        questionsAt={[ALREADY_SHOWN, ALREADY_SHOWN]}
      />
      <LabBench />
      <Tank platform={platformX}>
        <Place
          x={TANK_CENTER}
          y={mix(RESTING_Y, FLOATING_Y, drift) + floating(seconds).y * drift}
          style={{
            rotate: `${-10 * drift + floating(seconds).tilt * drift}deg`,
          }}
        >
          <Cassiopea
            width={JELLYFISH_WIDTH}
            colors={jellyfish.day}
            droop={0.8 + 0.2 * drift}
            pulse={pulseShape((seconds * PULSES_ASLEEP) / 60)}
          />
        </Place>
        {reach > 0 ? (
          <SvgLayer>
            <Glove
              from={[GLOVE_FROM.x + pull * 0.3, GLOVE_FROM.y]}
              to={[
                mix(GLOVE_FROM.x, handle[0], reach),
                mix(GLOVE_FROM.y + 60, handle[1], reach),
              ]}
              size={60}
            />
          </SvgLayer>
        ) : null}
      </Tank>
    </Lab>
  );
};

export const FloorTestScene: React.FC<SceneProps> = ({ scene, shots }) => (
  <>
    <Shot range={shots[0]} name="dormindo ou parada?">
      <TankShot
        leanAt={cue(scene, "provar")}
        questionsAt={[cue(scene, "dormia"), cue(scene, "parada")]}
      />
    </Shot>
    <Shot range={shots[1]} name="a mão puxa a plataforma">
      <PullShot pulledAt={cue(scene, "puxaram") - shots[1].from} />
    </Shot>
  </>
);
