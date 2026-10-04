import { Tag } from "../parts/Tag";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { framing } from "../../../components/Camera";
import { wave } from "../../../components/Idle";
import { Place } from "../../../components/Place";
import { Pop } from "../../../components/Pop";
import type { SceneProps } from "../../../video/NarratedVideo";
import { Shot } from "../../../video/Shot";
import { LabWall } from "../parts/Laboratory";
import { RatDiscs } from "../parts/RatDiscs";
import { cue } from "../../../components/timing";
import { Lab } from "./FloorTestScene";
import { DISCS_Y } from "./RatsAwakeScene";
import { Bench } from "./RatsQuestionScene";

// De perto: três dos dez ratos enchem o quadro.
const CLOSE = framing([960, DISCS_Y - 30], 2.6);
// O disco deles gira e para: é na parada que eles dormem.
const SPIN_SECONDS = 3;

type ControlShotProps = {
  /** Quadro do plano em que a diferença deles ganha nome. */
  readonly sleepAt: number;
};

/** Os ratos de comparação: os mesmos discos, e eles cochilando entre um giro e outro, inteiros e bem. */
const ControlShot: React.FC<ControlShotProps> = ({ sleepAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const seconds = frame / fps;
  const spinning = wave(seconds, SPIN_SECONDS) > 0.6;

  return (
    <AbsoluteFill>
      <Lab camera={CLOSE}>
        <LabWall />
        <Bench />
        <RatDiscs
          y={DISCS_Y}
          state={() => (spinning ? "awake" : "asleep")}
          seconds={seconds}
          spinning={spinning}
        />
      </Lab>
      <Place x={960} y={200}>
        <Pop at={sleepAt}>
          <Tag size="note" on="mint">
            podiam dormir
          </Tag>
        </Pop>
      </Place>
    </AbsoluteFill>
  );
};

export const RatsControlScene: React.FC<SceneProps> = ({ scene, shots }) => (
  <Shot range={shots[0]} name="os ratos de comparação">
    <ControlShot sleepAt={cue(scene, "podiam")} />
  </Shot>
);
