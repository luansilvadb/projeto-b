import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Sun } from "../../../art/Sun";
import { Sfx } from "../../../audio/Sfx";
import { Appear } from "../../../components/Appear";
import { Backdrop } from "../../../components/Backdrop";
import { Camera, Layer } from "../../../components/Camera";
import { Glow } from "../../../components/Glow";
import { Grain } from "../../../components/Grain";
import { Label } from "../../../components/Label";
import { Place } from "../../../components/Place";
import { StarField } from "../../../components/StarField";
import { palette } from "../../../design/tokens";
import { cueFrame } from "../../../narration/timeline";
import type { SceneProps } from "../../../video/NarratedVideo";

const SUN = { x: 620, y: 540 };

export const SunScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const breathing = Math.sin((frame / fps) * 1.6);
  const timeAppears = cueFrame(scene, "oito");

  return (
    <AbsoluteFill>
      <Backdrop />
      <Camera zoom={interpolate(frame, [0, scene.durationInFrames], [1, 1.1])}>
        <Layer depth={0.2}>
          <StarField />
        </Layer>
        <Layer depth={1} light>
          <Place x={SUN.x} y={SUN.y} style={{ scale: 1 + 0.04 * breathing }}>
            <Glow radius={620} color={palette.sun.dark} opacity={0.55} />
          </Place>
        </Layer>
        <Layer depth={1}>
          <Place x={SUN.x} y={SUN.y}>
            <Sun radius={250} />
          </Place>
        </Layer>
      </Camera>
      <Place x={1400} y={540}>
        <Appear at={timeAppears}>
          <Label size="display">8 min 19 s</Label>
        </Appear>
      </Place>
      <Sfx name="appear" from={timeAppears} />
      <Grain />
    </AbsoluteFill>
  );
};
