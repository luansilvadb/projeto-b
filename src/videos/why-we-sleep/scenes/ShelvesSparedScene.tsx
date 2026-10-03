import { useCurrentFrame, useVideoConfig } from "remotion";
import type { SceneProps } from "../../../video/NarratedVideo";
import { MouseStamp } from "../parts/MouseStamp";
import { ShelfStock, ShopInterior } from "../parts/ShopInterior";
import { Stage } from "../parts/Stage";
import { cue, ramp } from "../parts/timing";
import { SHRUNK } from "./ShelvesScene";

// O que não vendeu encolhe mais um pouco e abre espaço na prateleira.
const CLEARED = 0.6;

export const ShelvesSparedScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const spared = ramp(frame, cue(scene, "maiores"), 0.5 * fps);
  const cleared = ramp(frame, cue(scene, "espaço"), 0.8 * fps);

  return (
    <Stage scene={scene} still>
      <ShopInterior />
      <ShelfStock
        scale={(item) =>
          item.large ? 1 : SHRUNK - (SHRUNK - CLEARED) * cleared
        }
        highlight={(item) => (item.large ? spared : 0)}
        ghost
      />
      <MouseStamp />
    </Stage>
  );
};
