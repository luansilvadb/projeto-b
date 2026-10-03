import { useCurrentFrame, useVideoConfig } from "remotion";
import { Appear } from "../../../components/Appear";
import { Label } from "../../../components/Label";
import { Place } from "../../../components/Place";
import { palette } from "../../../design/tokens";
import type { SceneProps } from "../../../video/NarratedVideo";
import { RatRow } from "../parts/RatRow";
import { Stage } from "../parts/Stage";
import { cue } from "../parts/timing";

export const RatsControlScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const controlsAppear = cue(scene, "Outros");

  return (
    <Stage scene={scene} grave>
      <Place x={width / 2} y={300}>
        <Label size="note" tag={palette.sun.light}>
          sem dormir
        </Label>
      </Place>
      <RatRow y={440} color={palette.sun.light} />
      <Place x={width / 2} y={640}>
        <Appear at={controlsAppear}>
          <Label size="note" tag={palette.ocean.light}>
            podiam dormir
          </Label>
        </Appear>
      </Place>
      <RatRow
        y={780}
        color={palette.ocean.light}
        // Os que dormem piscam devagar, cada um no seu tempo.
        opacity={(index) =>
          frame < controlsAppear
            ? 0
            : 0.75 + 0.25 * Math.sin((frame / fps) * 2 + index)
        }
      />
    </Stage>
  );
};
