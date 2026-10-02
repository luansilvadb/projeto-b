import { AbsoluteFill, useVideoConfig } from "remotion";
import { Earth } from "../art/Earth";
import { Sun } from "../art/Sun";
import { Appear } from "../components/Appear";
import { Backdrop } from "../components/Backdrop";
import { Grain } from "../components/Grain";
import { Label } from "../components/Label";
import { Place } from "../components/Place";
import { StarField } from "../components/StarField";
import { motion, palette } from "./tokens";

export const MOTION_SAMPLE_SECONDS = 4;

const FIRST_ENTRY_SECONDS = 0.5;

/**
 * Amostra do movimento da direção de arte ativa: desenhos, texto e etiquetas
 * entrando em sequência, para julgar a curva, a duração e o escalonamento.
 */
export const MotionSample: React.FC = () => {
  const { fps } = useVideoConfig();
  /** Quadro de entrada do elemento, pela ordem dele na sequência. */
  const entry = (order: number) =>
    (FIRST_ENTRY_SECONDS + order * motion.seconds.stagger) * fps;

  return (
    <AbsoluteFill>
      <Backdrop />
      <StarField seed="motion-sample" />
      <Place x={420} y={400}>
        <Appear at={entry(0)}>
          <Sun radius={170} />
        </Appear>
      </Place>
      <Place x={800} y={400}>
        <Appear at={entry(1)}>
          <Earth radius={110} />
        </Appear>
      </Place>
      <Place x={1380} y={400}>
        <Appear at={entry(2)}>
          <Label size="headline">8 min 19 s</Label>
        </Appear>
      </Place>
      <Place x={380} y={760}>
        <Appear at={entry(3)}>
          <Label size="note" tag={palette.accent.base}>
            Órbita
          </Label>
        </Appear>
      </Place>
      <Place x={720} y={760}>
        <Appear at={entry(4)}>
          <Label size="note" tag={palette.sun.base}>
            Fusão
          </Label>
        </Appear>
      </Place>
      <Place x={1100} y={760}>
        <Appear at={entry(5)}>
          <Label size="note" tag={palette.ocean.base}>
            Atmosfera
          </Label>
        </Appear>
      </Place>
      <Place x={1520} y={760}>
        <Appear at={entry(6)}>
          <Label size="note" tag={palette.leaf.light}>
            Fotossíntese
          </Label>
        </Appear>
      </Place>
      <Grain />
    </AbsoluteFill>
  );
};
