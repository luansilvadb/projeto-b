import { useCurrentFrame, useVideoConfig } from "remotion";
import { Appear } from "../../../components/Appear";
import { Label } from "../../../components/Label";
import { Place } from "../../../components/Place";
import { palette } from "../../../design/tokens";
import type { SceneProps } from "../../../video/NarratedVideo";
import { ChapterCard } from "../parts/ChapterCard";
import { RatRow } from "../parts/RatRow";
import { Stage } from "../parts/Stage";
import { cue } from "../parts/timing";

export const RatsQuestionScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const ratsAppear = cue(scene, "dez");

  return (
    <Stage scene={scene} grave>
      <Place x={width / 2} y={320}>
        <Appear at={cue(scene, "oitenta")}>
          <Label size="headline">1989</Label>
        </Appear>
      </Place>
      <RatRow
        y={620}
        color={palette.sun.light}
        opacity={(index) => (frame >= ratsAppear + index * 2 ? 1 : 0)}
      />
      <ChapterCard title="Sem saída" from={0} to={1.6 * fps} />
    </Stage>
  );
};
