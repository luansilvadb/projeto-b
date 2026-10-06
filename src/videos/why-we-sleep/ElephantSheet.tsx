import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Elephant } from "../../art/Elephant";
import { Camera, framing } from "../../components/Camera";
import { Grain } from "../../components/Grain";
import { Label } from "../../components/Label";
import { Place } from "../../components/Place";
import { SvgLayer } from "../../components/SvgLayer";
import {
  elephant,
  elephantFinish,
  elephantNight,
  elephantNightFinish,
  ink,
  savanna,
} from "./palette";
import { Savanna, SAVANNA_GROUND_Y, SavannaShadow } from "./parts/Savanna";

const ROWS = [
  { time: "day", colors: elephant, finish: elephantFinish },
  { time: "night", colors: elephantNight, finish: elephantNightFinish },
] as const;
const ROW = 540;
const COLUMN = 960;
const WIDTH = 600;
// O plano de noite: a elefanta dormindo, de perto, com a lua à frente dela.
const CLOSE = framing([900, 690], 1.9);
const MOON = 0.36;
const SLEEPING = { lid: 1, droop: 1, trunk: 0, ear: 0.1 } as const;

/**
 * Folha do piloto do polimento, em três quadros: no 0, a elefanta sozinha, de
 * dia e de noite, antes e depois do acabamento; no 1, o plano de noite com o
 * acabamento dela e da savana; no 2, o mesmo plano como está no animatic.
 */
export const ElephantSheet: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame === 0) {
    return (
      <AbsoluteFill>
        {ROWS.map(({ time, colors, finish }, row) => (
          <AbsoluteFill
            key={time}
            style={{
              top: row * ROW,
              height: ROW,
              background: `linear-gradient(${savanna[time].sky[0]}, ${savanna[time].sky[1]})`,
            }}
          >
            {[undefined, finish].map((applied, column) => (
              <div key={column}>
                <Place x={COLUMN * (column + 0.5)} y={ROW - 50} anchor="bottom">
                  <Elephant width={WIDTH} colors={colors} finish={applied} />
                </Place>
                <Place x={COLUMN * column + 110} y={48}>
                  <Label size="note" color={ink.dark} tag={ink.paper}>
                    {column === 0 ? "antes" : "depois"}
                  </Label>
                </Place>
              </div>
            ))}
          </AbsoluteFill>
        ))}
      </AbsoluteFill>
    );
  }
  const finish = frame === 1;
  return (
    <AbsoluteFill>
      <Camera {...CLOSE}>
        <Savanna daylight={0} orb={MOON} finish={finish}>
          <SvgLayer>
            <SavannaShadow
              x={finish ? 990 : 930}
              y={SAVANNA_GROUND_Y + 4}
              width={finish ? 660 : 560}
              daylight={0}
            />
          </SvgLayer>
          <Place x={900} y={SAVANNA_GROUND_Y + 6} anchor="bottom">
            <Elephant
              width={560}
              colors={elephantNight}
              finish={finish ? elephantNightFinish : undefined}
              {...SLEEPING}
            />
          </Place>
        </Savanna>
      </Camera>
      <Grain />
    </AbsoluteFill>
  );
};
