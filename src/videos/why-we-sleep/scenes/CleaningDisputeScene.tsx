import { useCurrentFrame, useVideoConfig } from "remotion";
import { Appear } from "../../../components/Appear";
import { Label } from "../../../components/Label";
import { Place } from "../../../components/Place";
import { palette } from "../../../design/tokens";
import type { SceneProps } from "../../../video/NarratedVideo";
import { CellGrid, GAP_ASLEEP } from "../parts/CellGrid";
import { MouseStamp } from "../parts/MouseStamp";
import { Stage } from "../parts/Stage";
import { cue } from "../parts/timing";

const STUDY_WIDTH = 720;
const STUDY_Y = 640;
const YEAR_Y = 380;
const EARLIER = { x: 480, year: "2013" };
const LATER = { x: 1440, year: "2024" };
// Voltas dos resíduos por segundo: o que cada estudo viu durante o sono.
const FAST_FLOW = 0.35;
const SLOW_FLOW = 0.1;

export const CleaningDisputeScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const laterAppears = cue(scene, "vinte");
  const slowsDown = cue(scene, "lenta");
  const seconds = frame / fps;
  const slowSeconds = Math.max(0, frame - slowsDown) / fps;

  return (
    <Stage scene={scene}>
      <Place x={EARLIER.x} y={YEAR_Y}>
        <Label size="note" tag={palette.ocean.light}>
          {EARLIER.year}
        </Label>
      </Place>
      <Place x={EARLIER.x} y={STUDY_Y}>
        <CellGrid
          width={STUDY_WIDTH}
          gap={GAP_ASLEEP}
          flow={seconds * FAST_FLOW}
          loop
        />
      </Place>
      <Place x={LATER.x} y={YEAR_Y}>
        <Appear at={laterAppears}>
          <Label size="note" tag={palette.accent.base}>
            {LATER.year}
          </Label>
        </Appear>
      </Place>
      <Place x={LATER.x} y={STUDY_Y}>
        <Appear at={laterAppears}>
          <CellGrid
            width={STUDY_WIDTH}
            gap={GAP_ASLEEP}
            flow={(seconds - slowSeconds) * FAST_FLOW + slowSeconds * SLOW_FLOW}
            loop
          />
        </Appear>
      </Place>
      <Place x={width / 2} y={STUDY_Y}>
        <Appear at={cue(scene, "discutem")}>
          <Label size="display">?</Label>
        </Appear>
      </Place>
      <MouseStamp />
    </Stage>
  );
};
