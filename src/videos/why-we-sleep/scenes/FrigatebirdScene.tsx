import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Frigatebird } from "../../../art/Animals";
import { Appear } from "../../../components/Appear";
import { Label } from "../../../components/Label";
import { Place } from "../../../components/Place";
import { palette } from "../../../design/tokens";
import type { SceneProps } from "../../../video/NarratedVideo";
import { Stage } from "../parts/Stage";
import { SunAndMoon } from "../parts/SunAndMoon";
import { cue } from "../parts/timing";
import { WaterSurface } from "../parts/WaterSurface";

const OCEAN_Y = 840;
const FLIGHT_DAYS = 10;
const CIRCLE = { x: 700, y: 580, rx: 200, ry: 60, seconds: 4 };
// Quanto a ave inclina o corpo ao fazer a curva.
const BANK_DEGREES = 10;

export const FrigatebirdScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const daysAppear = cue(scene, "dez");
  const angle = (frame / (CIRCLE.seconds * fps)) * Math.PI * 2;
  const day = Math.round(
    interpolate(
      frame,
      [daysAppear, scene.durationInFrames - 0.4 * fps],
      [1, FLIGHT_DAYS],
      { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
    ),
  );

  return (
    <Stage scene={scene}>
      <SunAndMoon crossingSeconds={0.7} />
      <WaterSurface y={OCEAN_Y} />
      <Place
        x={CIRCLE.x + CIRCLE.rx * Math.cos(angle)}
        y={CIRCLE.y + CIRCLE.ry * Math.sin(angle)}
        style={{ rotate: `${-BANK_DEGREES * Math.sin(angle)}deg` }}
      >
        <Frigatebird width={440} color={palette.paper} />
      </Place>
      <Place x={1440} y={580}>
        <Appear at={daysAppear}>
          <Label size="headline">
            {day} {day === 1 ? "dia" : "dias"}
          </Label>
        </Appear>
      </Place>
    </Stage>
  );
};
