import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Elephant } from "../../art/Elephant";
import { Camera, framing } from "../../components/Camera";
import { Grain } from "../../components/Grain";
import { Place } from "../../components/Place";
import { SvgLayer } from "../../components/SvgLayer";
import { elephant, elephantNight, daylightTones } from "./palette";
import { RichSavannaBackdrop } from "./parts/savanna/RichSavannaReference";
import { SAVANNA_GROUND_Y, SavannaShadow } from "./parts/savanna/RichTheme";

const ROWS = [
  { time: "day", colors: elephant },
  { time: "night", colors: elephantNight },
] as const;
const ROW = 540;
const WIDTH = 600;
// O plano de noite: a elefanta dormindo, de perto, com a lua à frente dela.
const CLOSE = framing([900, 690], 1.9);
const MOON = 0.36;
const SLEEPING = { lid: 1, droop: 1, trunk: 0, ear: 0.1 } as const;

/**
 * Folha de modelo da elefanta, em dois quadros: no 0, ela sozinha, de dia e
 * de noite; no 1, o plano de noite, dormindo na savana.
 */
export const ElephantSheet: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame === 0) {
    return (
      <AbsoluteFill>
        {ROWS.map(({ time, colors }, row) => (
          <AbsoluteFill
            key={time}
            style={{
              top: row * ROW,
              height: ROW,
              background: `linear-gradient(${daylightTones[time].sky[0]}, ${daylightTones[time].sky[1]})`,
            }}
          >
            <Place x={960} y={ROW - 50} anchor="bottom">
              <Elephant width={WIDTH} colors={colors} />
            </Place>
          </AbsoluteFill>
        ))}
      </AbsoluteFill>
    );
  }
  return (
    <AbsoluteFill>
      <Camera {...CLOSE}>
        <RichSavannaBackdrop daylight={0} orb={MOON}>
          <SvgLayer>
            <SavannaShadow
              x={990}
              y={SAVANNA_GROUND_Y + 4}
              width={660}
              daylight={0}
            />
          </SvgLayer>
          <Place x={900} y={SAVANNA_GROUND_Y + 6} anchor="bottom">
            <Elephant width={560} colors={elephantNight} {...SLEEPING} />
          </Place>
        </RichSavannaBackdrop>
      </Camera>
      <Grain />
    </AbsoluteFill>
  );
};
