import { useCurrentFrame } from "remotion";
import { Appear } from "../../../components/Appear";
import { Label } from "../../../components/Label";
import { Place } from "../../../components/Place";
import { SvgLayer } from "../../../components/SvgLayer";
import { palette, shape } from "../../../design/tokens";
import type { SceneProps } from "../../../video/NarratedVideo";
import { Answers } from "../parts/Answers";
import { LivingJellyfish } from "../parts/LivingJellyfish";
import { Moon, ORIGIN, OriginLine } from "../parts/OriginLine";
import { Stage } from "../parts/Stage";
import { cue, PULSES_ASLEEP } from "../parts/timing";
import { MARKER_LABEL_Y, MARKER_Y } from "./HydraScene";

const TOP_Y = 330;
// Onde a ligação entre as respostas e a água-viva é cortada.
const GAP = { from: 900, to: 1220, x: 1060 };

export const OlderThanAnswersScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const notEnough = cue(scene, "sozinho");
  const older = cue(scene, "antigo");

  return (
    <Stage scene={scene} grave>
      <Answers xs={[360, 560, 760]} y={TOP_Y} size={150} disputed />
      <Place x={1460} y={TOP_Y}>
        <LivingJellyfish size={360} rhythm={PULSES_ASLEEP} />
      </Place>
      {frame >= notEnough ? (
        <SvgLayer>
          <line
            x1={GAP.from}
            x2={GAP.to}
            y1={TOP_Y}
            y2={TOP_Y}
            stroke={palette.mist}
            strokeWidth={shape.stroke.regular}
            strokeDasharray="4 26"
            strokeLinecap="round"
          />
          <path
            d={`M ${GAP.x - 34} ${TOP_Y - 34} L ${GAP.x + 34} ${TOP_Y + 34} M ${GAP.x + 34} ${TOP_Y - 34} L ${GAP.x - 34} ${TOP_Y + 34}`}
            stroke={palette.accent.base}
            strokeWidth={shape.stroke.regular * 1.5}
            strokeLinecap="round"
          />
        </SvgLayer>
      ) : null}
      {frame >= older ? <OriginLine /> : null}
      <Place x={ORIGIN.sleepX} y={MARKER_Y}>
        <Appear at={older}>
          <Moon size={120} />
        </Appear>
      </Place>
      <Place x={ORIGIN.sleepX} y={MARKER_LABEL_Y}>
        <Appear at={older}>
          <Label size="note" tag={palette.sun.light}>
            sono
          </Label>
        </Appear>
      </Place>
      <Answers
        xs={[1080, 1220, 1360]}
        y={MARKER_Y}
        size={100}
        at={[older + 6, older + 9, older + 12]}
        disputed
      />
      <Place x={1220} y={MARKER_LABEL_Y}>
        <Appear at={older + 6}>
          <Label size="note" tag={palette.ocean.light}>
            respostas
          </Label>
        </Appear>
      </Place>
    </Stage>
  );
};
