import { useCurrentFrame, useVideoConfig } from "remotion";
import { mixPose, type VigiliaPose } from "../../../art/Vigilia";
import { cue, ramp } from "../../../components/timing";
import type { SceneProps } from "../../../video/NarratedVideo";
import { Shot, useShotLength } from "../../../video/Shot";
import { home } from "../palette";
import { CUP, Cup, LOOK_DOWN, LOOK_UP, Vig } from "../parts/Actor";
import { alive } from "../parts/EndAlive";
import { Kitchen, KITCHEN } from "../parts/Kitchen";
import { Frame, Push } from "../parts/kit";

const AT_PEACE: VigiliaPose = { ...LOOK_UP, nearLid: 0.2, farLid: 0.2, mouth: [12, 0, 1] };

type Props = {
  /** O quadro em que ela olha o café, e o quadro em que olha o Sol. */
  readonly coffeeAt: number;
  readonly sunAt: number;
  /** O quadro em que a fala acaba e o silêncio começa. */
  readonly quietAt: number;
};

/**
 * A janela do começo (`OneTurnScene`, plano 1), na mesma composição: o café
 * sem uma onda; ela olha o café, depois o Sol, que sobe. No silêncio do fim
 * ela continua ali, respirando, com o Sol ainda subindo.
 */
const SameWindow: React.FC<Props> = ({ coffeeAt, sunAt, quietAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const length = useShotLength();
  const down = ramp(frame, coffeeAt, 0.5 * fps);
  const up = ramp(frame, sunAt - 6, 0.6 * fps);
  // No silêncio ela fica com o Sol: o rosto assenta num sorriso.
  const content = ramp(frame, quietAt - 0.3 * fps, 0.6 * fps);
  const pose = mixPose(mixPose(mixPose(CUP, LOOK_DOWN, down), LOOK_UP, up), AT_PEACE, content);
  return (
    <Frame
      backdrop={
        <Push focus={[1100, 520]} to={1.05}>
          <Kitchen sun={0.1 + 0.55 * ramp(frame, coffeeAt, length - coffeeAt)} sunAt={0.7}>
            <Vig
              x={KITCHEN.stand[0]}
              y={KITCHEN.stand[1]}
              scale={3.4}
              pose={alive(pose, frame / fps, "only-clue")}
              shadow={home.contact}
              // O café não faz uma onda: `slosh` fica em zero, e só o vapor se mexe.
              held={<Cup steam={frame / 9} />}
            />
          </Kitchen>
        </Push>
      }
    >
      {null}
    </Frame>
  );
};

export const OnlyClueScene: React.FC<SceneProps> = ({ scene, shots }) => (
  <Shot range={shots[0]} name="a única pista">
    <SameWindow
      coffeeAt={cue(scene, "liso")}
      sunAt={cue(scene, "Sol")}
      quietAt={scene.durationInFrames - scene.holdFrames}
    />
  </Shot>
);
