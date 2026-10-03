import { Appear } from "../../../components/Appear";
import { Label } from "../../../components/Label";
import { Place } from "../../../components/Place";
import { palette } from "../../../design/tokens";
import type { SceneProps } from "../../../video/NarratedVideo";
import { Answers } from "../parts/Answers";
import { Stage } from "../parts/Stage";
import { cue } from "../parts/timing";

const ICONS_Y = 440;
const LABELS_Y = 690;
// Cada resposta entra na palavra da narração que a nomeia.
const ANSWERS = [
  { x: 520, cue: "memórias", text: "memórias", tag: palette.sun.base },
  { x: 960, cue: "conexões", text: "conexões", tag: palette.ocean.light },
  { x: 1400, cue: "Talvez", text: "limpeza?", tag: palette.accent.base },
] as const;

export const WhySleepScene: React.FC<SceneProps> = ({ scene }) => (
  <Stage scene={scene} grave>
    <Answers
      xs={[ANSWERS[0].x, ANSWERS[1].x, ANSWERS[2].x]}
      y={ICONS_Y}
      size={220}
      at={[
        cue(scene, ANSWERS[0].cue),
        cue(scene, ANSWERS[1].cue),
        cue(scene, ANSWERS[2].cue),
      ]}
      disputed
    />
    {ANSWERS.map((answer) => (
      <Place key={answer.cue} x={answer.x} y={LABELS_Y}>
        <Appear at={cue(scene, answer.cue)}>
          <Label size="note" tag={answer.tag}>
            {answer.text}
          </Label>
        </Appear>
      </Place>
    ))}
  </Stage>
);
