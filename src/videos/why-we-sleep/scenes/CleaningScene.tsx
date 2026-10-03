import { useVideoConfig } from "remotion";
import { Appear } from "../../../components/Appear";
import { Label } from "../../../components/Label";
import { Place } from "../../../components/Place";
import type { SceneProps } from "../../../video/NarratedVideo";
import { CellGrid, GAP_AWAKE } from "../parts/CellGrid";
import { MouseStamp } from "../parts/MouseStamp";
import { Stage } from "../parts/Stage";
import { cue } from "../parts/timing";

export const TISSUE = { x: 960, y: 620, width: 1200 };
export const HEADLINE_Y = 190;

export const CleaningScene: React.FC<SceneProps> = ({ scene }) => {
  const { width } = useVideoConfig();

  return (
    <Stage scene={scene} still>
      <Place x={TISSUE.x} y={TISSUE.y}>
        <CellGrid width={TISSUE.width} gap={GAP_AWAKE} flow={0} />
      </Place>
      <Place x={width / 2} y={HEADLINE_Y}>
        <Appear at={cue(scene, "treze")}>
          <Label size="headline">2013</Label>
        </Appear>
      </Place>
      <MouseStamp />
    </Stage>
  );
};
