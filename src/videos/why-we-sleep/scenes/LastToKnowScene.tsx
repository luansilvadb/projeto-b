import { useCurrentFrame, useVideoConfig } from "remotion";
import { cameraBetween, framing } from "../../../components/Camera";
import type { SceneProps } from "../../../video/NarratedVideo";
import { Shot } from "../../../video/Shot";
import { LURK, Lurker, PREY, Prey } from "../parts/Prey";
import {
  ALREADY_SHOWN,
  cue,
  linear,
  mix,
  ramp,
} from "../../../components/timing";
import { SavannaShot } from "./ElephantsScene";
import { LossBadges, NIGHT_ORB, PREY_MEDIUM } from "./NightFallsScene";

const CLOSE = framing([(PREY.x + LURK.x) / 2, PREY.y - 170], 1.75);
// Quanto a lua anda durante o plano, a partir de onde a cena anterior a deixou.
const ORB_DRIFT = 0.04;
// Em quanto tempo os ícones da cena anterior saem, em segundos.
const BADGES_OUT_SECONDS = 0.3;
const SHOWN = [ALREADY_SHOWN, ALREADY_SHOWN, ALREADY_SHOWN] as const;

type EyesShotProps = {
  /** Quadros do plano em que os olhos acendem e em que a sombra avança. */
  readonly litAt: number;
  readonly nearAt: number;
};

/** Dois olhos acendem no capim atrás do antílope, que continua dormindo. */
const EyesShot: React.FC<EyesShotProps> = ({ litAt, nearAt }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const seconds = frame / fps;

  return (
    <SavannaShot
      camera={cameraBetween(
        PREY_MEDIUM,
        CLOSE,
        ramp(frame, 0, durationInFrames),
      )}
      daylight={0}
      orb={mix(
        NIGHT_ORB,
        NIGHT_ORB + ORB_DRIFT,
        linear(frame, 0, durationInFrames),
      )}
    >
      <Lurker
        lit={ramp(frame, litAt, 0.25 * fps)}
        out={ramp(frame, nearAt, 1.4 * fps)}
        seconds={seconds}
      />
      <Prey daylight={0} rest={1} asleep={1} seconds={seconds} />
      {/* A cena continua a anterior: os ícones dela ainda estão no quadro, e saem. */}
      <LossBadges at={SHOWN} gone={ramp(frame, 0, BADGES_OUT_SECONDS * fps)} />
    </SavannaShot>
  );
};

export const LastToKnowScene: React.FC<SceneProps> = ({ scene, shots }) => (
  <Shot range={shots[0]} name="os olhos no capim">
    <EyesShot litAt={cue(scene, "fome")} nearAt={cue(scene, "perto")} />
  </Shot>
);
