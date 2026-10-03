import { useCurrentFrame, useVideoConfig } from "remotion";
import { cameraBetween } from "../../../components/Camera";
import { wave } from "../../../components/Idle";
import type { SceneProps } from "../../../video/NarratedVideo";
import { Shot } from "../../../video/Shot";
import { FISH_WATCHING, LAGOON } from "../parts/lagoonCameras";
import { LagoonShot } from "../parts/LagoonShot";
import { PulseLabel } from "../parts/PulseLabel";
import { PULSES_AWAKE, mix, ramp, settle, steady } from "../parts/timing";

const CAMERA_SECONDS = 0.8;
// O vídeo abre deslizando pela lagoa, do lado por onde o peixe entra, até o enquadramento aberto.
const SLIDE_SECONDS = 1.6;
// O peixe entra pela direita e para ao vê-la; no close, chega mais perto para olhar.
const FISH_ARRIVES = { x: 1290, y: 560 };
const FISH_SWIM_SECONDS = 0.9;
const FISH_APPROACH_SECONDS = 0.6;
// Um anel passa pelo peixe a cada pulso; o olho dele acompanha.
const RING_SECONDS = 60 / PULSES_AWAKE;
/** O contador do ritmo de dia, preso ao sino no close; a noite o varre no plano seguinte. */
export const AWAKE_LABEL = {
  value: PULSES_AWAKE,
  at: [1520, 880],
  target: [1215, 700],
  tone: "dark",
} as const;

const WideShot: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const slideFrames = SLIDE_SECONDS * fps;
  const swim = settle(frame, 6, FISH_SWIM_SECONDS * fps);
  const camera =
    frame < slideFrames
      ? cameraBetween(
          LAGOON.wideStart,
          LAGOON.wide,
          ramp(frame, 0, slideFrames),
        )
      : cameraBetween(
          LAGOON.wide,
          LAGOON.wideEnd,
          (frame - slideFrames) / (durationInFrames - slideFrames),
        );

  return (
    <LagoonShot
      time="day"
      camera={camera}
      rhythm={steady(PULSES_AWAKE)}
      fish={{
        x: mix(2080, FISH_ARRIVES.x, swim),
        y: mix(610, FISH_ARRIVES.y, swim),
        width: FISH_WATCHING.width,
        look: [-0.8, 0.5],
        swimming: swim < 1,
      }}
    />
  );
};

const BellShot: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const arrived = CAMERA_SECONDS * fps;
  const approach = settle(frame, 0, FISH_APPROACH_SECONDS * fps);

  return (
    <>
      <LagoonShot
        time="day"
        camera={cameraBetween(
          LAGOON.wideEnd,
          LAGOON.bell,
          ramp(frame, 0, arrived),
        )}
        rhythm={steady(PULSES_AWAKE)}
        rings
        fish={{
          x: mix(FISH_ARRIVES.x, FISH_WATCHING.x, approach),
          y: mix(FISH_ARRIVES.y, FISH_WATCHING.y, approach),
          width: FISH_WATCHING.width,
          look: [-0.9 + 0.3 * wave(frame / fps, RING_SECONDS), 0.6],
          swimming: approach < 1,
        }}
      />
      <PulseLabel {...AWAKE_LABEL} enter={arrived} />
    </>
  );
};

export const JellyfishPulseScene: React.FC<SceneProps> = ({ shots }) => (
  <>
    <Shot range={shots[0]} name="a lagoa de longe">
      <WideShot />
    </Shot>
    <Shot range={shots[1]} name="o sino de perto">
      <BellShot />
    </Shot>
  </>
);
