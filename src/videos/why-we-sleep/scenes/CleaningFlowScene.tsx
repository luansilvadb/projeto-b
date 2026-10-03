import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Appear } from "../../../components/Appear";
import { Label } from "../../../components/Label";
import { Place } from "../../../components/Place";
import type { SceneProps } from "../../../video/NarratedVideo";
import { CellGrid, GAP_ASLEEP, GAP_AWAKE } from "../parts/CellGrid";
import { MouseStamp } from "../parts/MouseStamp";
import { Stage } from "../parts/Stage";
import { cue, ramp } from "../parts/timing";
import { HEADLINE_Y, TISSUE } from "./CleaningScene";

export const CleaningFlowScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const spaceWidens = cue(scene, "sessenta");
  const residueLeaves = cue(scene, "resíduos");

  return (
    <Stage scene={scene} still>
      <Place x={TISSUE.x} y={TISSUE.y}>
        <CellGrid
          width={TISSUE.width}
          gap={interpolate(
            ramp(frame, spaceWidens, fps),
            [0, 1],
            [GAP_AWAKE, GAP_ASLEEP],
          )}
          // Sem easing: os resíduos são levados em ritmo constante até saírem do tecido.
          flow={interpolate(
            frame,
            [residueLeaves, residueLeaves + 3 * fps],
            [0, 1],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
          )}
        />
      </Place>
      <Place x={width / 2} y={HEADLINE_Y}>
        <Appear at={spaceWidens}>
          <Label size="headline">+60% de espaço</Label>
        </Appear>
      </Place>
      <MouseStamp />
    </Stage>
  );
};
