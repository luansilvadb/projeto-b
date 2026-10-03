import { useCurrentFrame, useVideoConfig } from "remotion";
import { Appear } from "../../../components/Appear";
import { Label } from "../../../components/Label";
import { Place } from "../../../components/Place";
import type { SceneProps } from "../../../video/NarratedVideo";
import { MouseStamp } from "../parts/MouseStamp";
import { ShelfStock, ShopInterior } from "../parts/ShopInterior";
import { Stage } from "../parts/Stage";
import { cue, ramp } from "../parts/timing";

// A fonte mede a área de contato 18% menor: o raio encolhe pela raiz quadrada.
export const SHRUNK = Math.sqrt(1 - 0.18);

export const ShelvesScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const shrinks = cue(scene, "dezoito");
  const shrunk = ramp(frame, shrinks, 0.8 * fps);

  return (
    <Stage scene={scene} still>
      <ShopInterior />
      <ShelfStock
        // As conexões maiores são poupadas, como a cena seguinte destaca.
        scale={(item) => (item.large ? 1 : 1 - (1 - SHRUNK) * shrunk)}
        ghost={frame >= shrinks}
      />
      <Place x={width / 2} y={190}>
        <Appear at={shrinks}>
          <Label size="headline">18% menores</Label>
        </Appear>
      </Place>
      <MouseStamp />
    </Stage>
  );
};
