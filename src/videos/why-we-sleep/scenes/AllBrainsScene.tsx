import { Brain } from "../../../art/Brain";
import { Appear } from "../../../components/Appear";
import { Place } from "../../../components/Place";
import type { SceneProps } from "../../../video/NarratedVideo";
import { Answers } from "../parts/Answers";
import { Stage } from "../parts/Stage";
import { cue } from "../../../components/timing";

export const AllBrainsScene: React.FC<SceneProps> = ({ scene }) => (
  <Stage scene={scene}>
    <Answers
      xs={[660, 960, 1260]}
      y={560}
      size={180}
      at={[
        cue(scene, "Estoque"),
        cue(scene, "prateleiras"),
        cue(scene, "faxina"),
      ]}
    />
    {/* O contorno do cérebro envolve as três respostas: todas vieram dele. */}
    <Place x={960} y={540}>
      <Appear at={cue(scene, "cérebros")}>
        <Brain width={1250} />
      </Appear>
    </Place>
  </Stage>
);
