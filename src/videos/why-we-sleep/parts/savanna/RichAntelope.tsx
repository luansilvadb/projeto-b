import { AntelopeDrawing } from "../../../../art/AntelopeDrawing";
import { blink, wave } from "../../../../components/Idle";
import { linear, ramp } from "../../../../components/timing";
import { useStudyTime } from "../../../../studies/savanna-reference/SavannaReference";
import { antelopePaint } from "../../../../art/Antelope";
import { antelope, antelopeNight } from "../../palette";
import { useRichTheme } from "./RichTheme";

// O estudo usa a mesma folha de modelo das cenas narradas, com seu relógio
// próprio. Os gestos do teste não substituem as deixas do roteiro do vídeo.
export const RichAntelope = () => {
  const colors = antelopePaint(
    useRichTheme().moonlight > 0.5 ? antelopeNight : antelope,
  );
  const t = useStudyTime();
  const attentive = ramp(t, 1.5, 1.15) - ramp(t, 5.8, 1.3);
  return (
    <AntelopeDrawing
      colors={colors}
      breathing={1 + 0.008 * wave(t, 3.8)}
      turn={-4 * attentive + 0.3 * wave(t, 4.6)}
      lid={blink(t, "savanna-rich-antelope", {
        every: [2.5, 3.8],
        seconds: 0.17,
      })}
      earAngle={-5 * attentive + 1.5 * wave(t, 2.6)}
      tailAngle={
        (linear(t, 3.9, 0.2) - ramp(t, 4.1, 0.8)) * -9 + 1.5 * wave(t, 3.2)
      }
    />
  );
};
