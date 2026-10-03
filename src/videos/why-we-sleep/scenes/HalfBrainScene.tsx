import { useCurrentFrame, useVideoConfig } from "remotion";
import { BrainTop } from "../../../art/Brain";
import { Appear } from "../../../components/Appear";
import { Label } from "../../../components/Label";
import { Place } from "../../../components/Place";
import { palette } from "../../../design/tokens";
import type { SceneProps } from "../../../video/NarratedVideo";
import { Stage } from "../parts/Stage";
import { cue, ramp } from "../parts/timing";

const BRAIN = { x: 860, y: 540, width: 520 };

const Eye: React.FC = () => (
  <svg width={220} height={130} viewBox="0 0 220 130">
    <path d="M 10 65 Q 110 -30 210 65 Q 110 160 10 65 Z" fill={palette.paper} />
    <circle cx={110} cy={65} r={34} fill={palette.ocean.dark} />
  </svg>
);

export const HalfBrainScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const leftRests = cue(scene, "descansa");
  const rightWatches = cue(scene, "vigiar");

  return (
    <Stage scene={scene}>
      <Place x={BRAIN.x} y={BRAIN.y}>
        <BrainTop
          width={BRAIN.width}
          left={1 - ramp(frame, leftRests, 0.6 * fps)}
          right={1}
        />
      </Place>
      <Place x={330} y={BRAIN.y}>
        <Appear at={leftRests}>
          <Label size="note" tag={palette.ocean.light}>
            dorme
          </Label>
        </Appear>
      </Place>
      <Place x={1430} y={450}>
        <Appear at={rightWatches}>
          <Eye />
        </Appear>
      </Place>
      <Place x={1430} y={630}>
        <Appear at={rightWatches}>
          <Label size="note" tag={palette.accent.base}>
            respira e vigia
          </Label>
        </Appear>
      </Place>
    </Stage>
  );
};
