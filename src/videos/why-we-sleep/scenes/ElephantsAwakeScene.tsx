import { useVideoConfig } from "remotion";
import { Elephant } from "../../../art/Animals";
import { Appear } from "../../../components/Appear";
import { Idle } from "../../../components/Idle";
import { Label } from "../../../components/Label";
import { Place } from "../../../components/Place";
import type { SceneProps } from "../../../video/NarratedVideo";
import { DayBar } from "../parts/DayBar";
import { Stage } from "../parts/Stage";
import { cue } from "../parts/timing";
import { ELEPHANT_SLEEP } from "./ElephantsScene";

// Dois dias seguidos, lado a lado, sem nenhuma fatia de sono.
const AWAKE_DAYS = [610, 1310];

export const ElephantsAwakeScene: React.FC<SceneProps> = ({ scene }) => {
  const { fps, width } = useVideoConfig();

  return (
    <Stage scene={scene}>
      <Place x={width / 2} y={270}>
        <Appear at={cue(scene, "quase")}>
          <Label size="headline">46 h acordadas</Label>
        </Appear>
      </Place>
      {AWAKE_DAYS.map((x, day) => (
        <Place key={x} x={x} y={470}>
          <Appear at={0.2 * fps + day * 4}>
            <DayBar width={680} asleep={0} />
          </Appear>
        </Place>
      ))}
      <Place x={380} y={800}>
        <Idle breath={0.02} seconds={5}>
          <Elephant width={340} />
        </Idle>
      </Place>
      <Place x={1180} y={820}>
        <Appear at={cue(scene, "nunca")}>
          <DayBar width={1000} asleep={ELEPHANT_SLEEP} />
        </Appear>
      </Place>
    </Stage>
  );
};
