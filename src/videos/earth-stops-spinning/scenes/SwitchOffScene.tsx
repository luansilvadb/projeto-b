import { Sequence, useCurrentFrame, useVideoConfig } from "remotion";
import { cue, ramp } from "../../../components/timing";
import type { SceneProps } from "../../../video/NarratedVideo";
import { Shot } from "../../../video/Shot";
import { Vignette } from "../../../vignette/Vignette";
import { ink } from "../palette";
import { Globe } from "../parts/Globe";
import { Frame, Push, SpaceBackdrop, Svg } from "../parts/kit";
import { LeverStation } from "../parts/Lever";

export const STAGE = {
  earth: { cx: 620, cy: 520, r: 330 },
  lever: { x: 1450, y: 900 },
} as const;
const TURN_SECONDS = 14;

type Props = {
  /** O quadro em que ela põe as mãos na alavanca. */
  readonly grabAt: number;
};

/** A alavanca "giro" ao lado da Terra: a Vigília olha a Terra e põe as mãos na haste. */
const TheLever: React.FC<Props> = ({ grabAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <Frame backdrop={<SpaceBackdrop light={[0.05, 0.1]} />}>
      <Push focus={[1200, 640]} from={1} to={1.08}>
        <Svg>
          <Globe {...STAGE.earth} spin={frame / fps / TURN_SECONDS} />
          <LeverStation
            {...STAGE.lever}
            on={1}
            hands={ramp(frame, grabAt, 0.5 * fps)}
            // Antes de pegar, ela olha a Terra, por cima do ombro.
            rest={{ turn: 0.15, gaze: [-0.8, -0.4], nod: -0.3, mouth: [10, 0.2, 0.3] }}
            shadow={ink.dark}
          />
        </Svg>
      </Push>
    </Frame>
  );
};

export const SwitchOffScene: React.FC<SceneProps> = ({ scene, shots }) => (
  <>
    <Shot range={shots[0]} name="a alavanca do giro">
      <TheLever grabAt={cue(scene, "desligar")} />
    </Shot>
    {/* No silêncio depois da fala, a vinheta do canal abre sobre o plano. */}
    <Sequence
      from={scene.durationInFrames - scene.holdFrames}
      durationInFrames={scene.holdFrames}
      name="vinheta"
    >
      <Vignette />
    </Sequence>
  </>
);
