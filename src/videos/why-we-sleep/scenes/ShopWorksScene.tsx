import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { Shop } from "../../../art/Shop";
import { Place } from "../../../components/Place";
import type { SceneProps } from "../../../video/NarratedVideo";
import { ChapterCard } from "../parts/ChapterCard";
import { MouseStamp } from "../parts/MouseStamp";
import { ShelfStock, ShopInterior } from "../parts/ShopInterior";
import { Stage } from "../parts/Stage";
import { cue, ramp } from "../../../components/timing";
import { CLOSED_SHOP } from "./NotOptionalScene";

export const ShopWorksScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // A porta fica transparente e mostra o interior da loja.
  const inside = ramp(frame, cue(scene, "trabalha"), 0.8 * fps);

  return (
    <Stage scene={scene} still>
      <AbsoluteFill style={{ opacity: inside }}>
        <ShopInterior />
        <ShelfStock scale={() => 1} />
      </AbsoluteFill>
      <Place
        x={CLOSED_SHOP.x}
        y={CLOSED_SHOP.y}
        style={{ opacity: 1 - inside }}
      >
        <Shop width={CLOSED_SHOP.width} shutter={1} lit={0} glow={1} />
      </Place>
      <MouseStamp at={cue(scene, "camundongos")} />
      <ChapterCard title="Para quê, afinal?" from={0} to={1.6 * fps} />
    </Stage>
  );
};
