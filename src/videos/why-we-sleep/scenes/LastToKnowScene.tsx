import { useCurrentFrame, useVideoConfig } from "remotion";
import { cameraBetween, framing } from "../../../components/Camera";
import { cue, ramp } from "../../../components/timing";
import type { SceneProps } from "../../../video/NarratedVideo";
import { Shot } from "../../../video/Shot";
import {
  Critter,
  DEN,
  DEN_CLOSE,
  NIGHT_ORB,
  SavannaShot,
  Stalker,
  THICKET,
  Thicket,
} from "./NightFallsScene";

// A câmera recua do bicho para a moita: ele dormindo de um lado, embaixo, e os olhos do outro, mais altos.
const ON_EYES = framing(
  [(DEN.x + THICKET.x) / 2 - 30, DEN.y - 90],
  3.5,
  [960, 600],
);

type EyesShotProps = {
  /** Quadros do plano em que os olhos acendem e em que a sombra avança. */
  readonly litAt: number;
  readonly nearAt: number;
};

/** Dois olhos acendem no capim atrás do bicho, que continua dormindo; a sombra avança devagar. */
const EyesShot: React.FC<EyesShotProps> = ({ litAt, nearAt }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const seconds = frame / fps;

  return (
    <SavannaShot
      camera={cameraBetween(DEN_CLOSE, ON_EYES, ramp(frame, 0, 1.2 * fps))}
      daylight={0}
      orb={NIGHT_ORB + 0.04}
    >
      <Thicket daylight={0} seconds={seconds} stir={0.3}>
        <Stalker
          lit={ramp(frame, litAt, 0.2 * fps)}
          out={ramp(frame, nearAt, durationInFrames - nearAt)}
          seconds={seconds}
        />
      </Thicket>
      <Critter daylight={0} rest={1} asleep={1} seconds={seconds} />
    </SavannaShot>
  );
};

export const LastToKnowScene: React.FC<SceneProps> = ({ scene, shots }) => (
  <Shot range={shots[0]} name="os olhos no capim">
    <EyesShot litAt={cue(scene, "predador")} nearAt={cue(scene, "perto")} />
  </Shot>
);
