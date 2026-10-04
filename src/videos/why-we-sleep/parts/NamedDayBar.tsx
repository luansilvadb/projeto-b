import { useCurrentFrame, useVideoConfig } from "remotion";
import { Appear } from "../../../components/Appear";
import { Label } from "../../../components/Label";
import { Place } from "../../../components/Place";
import { motion } from "../../../design/tokens";
import { DayBar } from "./DayBar";
import { ramp } from "../../../components/timing";

type NamedDayBarProps = {
  readonly name: string;
  readonly y: number;
  /** Fração das 24 horas passada dormindo. */
  readonly asleep: number;
  /** Quadro da cena em que a barra entra. */
  readonly at?: number;
};

const NAME_X = 330;
const BAR = { x: 1160, width: 1200 };
const FILL_SECONDS = 0.6;

/** Barra de 24 horas com o nome do animal à esquerda, para comparar umas com as outras. */
export const NamedDayBar: React.FC<NamedDayBarProps> = ({
  name,
  y,
  asleep,
  at = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // A fatia de sono cresce depois que a barra entrou, para o olho acompanhar o tamanho dela.
  const filled = ramp(
    frame,
    at + motion.seconds.enter * fps,
    FILL_SECONDS * fps,
  );

  return (
    <>
      <Place x={NAME_X} y={y}>
        <Appear at={at}>
          <Label size="note">{name}</Label>
        </Appear>
      </Place>
      <Place x={BAR.x} y={y}>
        <Appear at={at}>
          <DayBar width={BAR.width} asleep={asleep * filled} />
        </Appear>
      </Place>
    </>
  );
};
