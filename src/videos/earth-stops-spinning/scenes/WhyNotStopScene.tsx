import { useCurrentFrame, useVideoConfig } from "remotion";
import { cue, mix, ramp } from "../../../components/timing";
import type { SceneProps } from "../../../video/NarratedVideo";
import { Shot } from "../../../video/Shot";
import { ink } from "../palette";
import { Globe } from "../parts/Globe";
import { Frame, Push, SpaceBackdrop, Svg } from "../parts/kit";
import { LeverStation } from "../parts/Lever";
import { STAGE } from "./SwitchOffScene";

const TURN_SECONDS = 14;
// Em quantos segundos a Terra volta do repouso ao ritmo de sempre.
const SPIN_UP_SECONDS = 1.8;

/** As voltas dadas `seconds` depois de ligada: parte de parada, acelera e segue no ritmo de sempre. */
const spunUp = (seconds: number): number => {
  const t = Math.max(0, seconds);
  return (t < SPIN_UP_SECONDS ? (t * t) / (2 * SPIN_UP_SECONDS) : t - SPIN_UP_SECONDS / 2) / TURN_SECONDS;
};

/** A Vigília empurra a alavanca de volta para ligado, e a Terra volta a girar. */
const BackOn: React.FC<{ readonly pushAt: number }> = ({ pushAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const on = ramp(frame, pushAt, 0.5 * fps);
  // Com a alavanca no lugar, ela olha a Terra por cima do ombro.
  const looked = ramp(frame, pushAt + 0.8 * fps, 0.4 * fps);
  return (
    <Frame backdrop={<SpaceBackdrop light={[0.05, 0.1]} />}>
      <Push focus={[1200, 640]} from={1.08} to={1.02}>
        <Svg>
          <Globe {...STAGE.earth} spin={0.3 + spunUp((frame - pushAt) / fps - 0.3)} />
          <LeverStation
            {...STAGE.lever}
            on={on}
            hands={ramp(frame, 2, 0.4 * fps)}
            grip={{
              // O esforço do empurrão: o corpo vai junto com a haste.
              lean: 4 + 10 * on - 10 * looked,
              turn: mix(0.9, 0.2, looked),
              gaze: [mix(0.6, -0.8, looked), -0.4],
              mouth: [11, 0, mix(-0.2, 0.8, looked)],
              grit: 1 - on,
            }}
            shadow={ink.dark}
          />
        </Svg>
      </Push>
    </Frame>
  );
};

export const WhyNotStopScene: React.FC<SceneProps> = ({ scene, shots }) => (
  <Shot range={shots[0]} name="a alavanca volta para ligado">
    <BackOn pushAt={cue(scene, "religar")} />
  </Shot>
);
