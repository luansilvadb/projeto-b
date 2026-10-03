import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { cameraBetween } from "../../../components/Camera";
import type { SceneProps } from "../../../video/NarratedVideo";
import { Shot } from "../../../video/Shot";
import { FISH_WATCHING, LAGOON } from "../parts/lagoonCameras";
import { LagoonShot } from "../parts/LagoonShot";
import { PulseLabel } from "../parts/PulseLabel";
import {
  ALREADY_SHOWN,
  PULSES_ASLEEP,
  PULSES_AWAKE,
  cue,
  mix,
  ramp,
  settle,
  steady,
} from "../parts/timing";
import { AWAKE_LABEL } from "./JellyfishPulseScene";

// Onde o peixe para quando o focinho encosta na ponta do braço.
const FISH_TOUCHING = { x: 1131, y: 636 };

const NIGHTFALL_SECONDS = 0.35;
const RECEDE_SECONDS = 0.9;
const SLOW_DOWN_SECONDS = 1.2;
const CAMERA_SECONDS = 0.6;
const APPROACH_SECONDS = 0.5;
// Quanto tempo ela leva para notar o toque, e quanto demora a recolher.
const NOTICE_SECONDS = 0.8;
const RECOIL_SECONDS = 0.6;

type NightfallShotProps = {
  /** Quadro do plano em que a noite começa a descer. */
  readonly nightAt: number;
  /** Quadro do plano em que ela desacelera: a câmera recua e os braços caem. */
  readonly slowAt: number;
  /** Quadro do plano em que o contador entra. */
  readonly countAt: number;
};

/** A mesma lagoa escurece de cima para baixo; ela desacelera e o contador troca. */
const NightfallShot: React.FC<NightfallShotProps> = ({
  nightAt,
  slowAt,
  countAt,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const nightfall = ramp(frame, nightAt, NIGHTFALL_SECONDS * fps);
  const slowing = ramp(frame, slowAt, SLOW_DOWN_SECONDS * fps);

  return (
    <>
      <LagoonShot
        time="night"
        nightfall={nightfall}
        camera={cameraBetween(
          LAGOON.bell,
          LAGOON.medium,
          ramp(frame, slowAt, RECEDE_SECONDS * fps),
        )}
        rhythm={[
          { from: 0, perMinute: PULSES_AWAKE },
          { from: slowAt, perMinute: PULSES_ASLEEP },
        ]}
        droop={0.7 * slowing}
        rings
        fish={{
          ...FISH_WATCHING,
          mood: slowing > 0.6 ? "yawning" : "curious",
          look: [-0.3, 0.6],
        }}
      />
      {/* O contador de dia fica até a noite passar por cima dele. */}
      {nightfall < 1 ? (
        <AbsoluteFill style={{ clipPath: `inset(${nightfall * 100}% 0 0 0)` }}>
          <PulseLabel {...AWAKE_LABEL} enter={ALREADY_SHOWN} />
        </AbsoluteFill>
      ) : null}
      <PulseLabel
        value={PULSES_ASLEEP}
        at={[360, 240]}
        target={[600, 520]}
        enter={countAt}
      />
    </>
  );
};

/** O peixe encosta o focinho no braço dela; só depois de um instante ela recolhe. */
const TouchShot: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const arrived = CAMERA_SECONDS * fps;
  const approach = settle(frame, arrived - 3, APPROACH_SECONDS * fps);
  const touched = arrived - 3 + APPROACH_SECONDS * fps;
  const recoil = ramp(
    frame,
    touched + NOTICE_SECONDS * fps,
    RECOIL_SECONDS * fps,
  );

  return (
    <LagoonShot
      time="night"
      camera={cameraBetween(
        LAGOON.medium,
        LAGOON.touch,
        ramp(frame, 0, arrived),
      )}
      rhythm={steady(PULSES_ASLEEP)}
      droop={0.7 - 0.2 * recoil}
      sway={-0.6 * recoil}
      fish={{
        x: mix(FISH_WATCHING.x, FISH_TOUCHING.x, approach),
        y: mix(FISH_WATCHING.y, FISH_TOUCHING.y, approach),
        width: FISH_WATCHING.width,
        look: [-1, 0.1],
        swimming: approach > 0 && approach < 1,
      }}
    />
  );
};

export const JellyfishNightScene: React.FC<SceneProps> = ({ scene, shots }) => (
  <>
    <Shot range={shots[0]} name="a lagoa escurece">
      <NightfallShot
        nightAt={cue(scene, "Quando")}
        slowAt={cue(scene, "desacelera")}
        countAt={cue(scene, "Trinta")}
      />
    </Shot>
    <Shot range={shots[1]} name="o peixe encosta">
      <TouchShot />
    </Shot>
  </>
);
