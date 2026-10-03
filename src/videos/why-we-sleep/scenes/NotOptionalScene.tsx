import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Shop } from "../../../art/Shop";
import { Place } from "../../../components/Place";
import type { SceneProps } from "../../../video/NarratedVideo";
import { Stage } from "../parts/Stage";
import { cue, ramp } from "../parts/timing";

export const CLOSED_SHOP = { x: 960, y: 580, width: 820 };

export const NotOptionalScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <Stage scene={scene} grave still>
      <Place
        x={CLOSED_SHOP.x}
        y={CLOSED_SHOP.y}
        style={{
          scale: interpolate(frame, [0, scene.durationInFrames], [1, 1.18]),
        }}
      >
        <Shop
          width={CLOSED_SHOP.width}
          shutter={1}
          lit={0}
          glow={ramp(frame, cue(scene, "dentro"), 0.6 * fps)}
        />
      </Place>
    </Stage>
  );
};
