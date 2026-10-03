import { useCurrentFrame, useVideoConfig } from "remotion";
import { Elephant } from "../../../art/Animals";
import { Appear } from "../../../components/Appear";
import { Idle } from "../../../components/Idle";
import { Label } from "../../../components/Label";
import { Place } from "../../../components/Place";
import { SvgLayer } from "../../../components/SvgLayer";
import { palette } from "../../../design/tokens";
import type { SceneProps } from "../../../video/NarratedVideo";
import { NamedDayBar } from "../parts/NamedDayBar";
import { Stage } from "../parts/Stage";
import { cue, ramp } from "../parts/timing";
import { HUMAN_SLEEP } from "./SleepCostScene";

export const ELEPHANT_SLEEP = 2 / 24;
const TRACKED_DAYS = 35;
const CALENDAR = { x: 1270, y: 170, cell: 42, gap: 10, columns: 7 };

export const ElephantsScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const monthEnds = cue(scene, "mês");
  const daysTracked = Math.floor(
    TRACKED_DAYS * ramp(frame, 0.4 * fps, monthEnds - 0.4 * fps),
  );
  // "Duas" abre a cena ("Duas elefantas"); a segunda é "duas horas".
  const barsAppear = cue(scene, "duas", 2);

  return (
    <Stage scene={scene}>
      <Place x={380} y={330}>
        <Idle breath={0.02} seconds={5}>
          <Elephant width={460} />
        </Idle>
      </Place>
      <Place x={800} y={390}>
        <Idle breath={0.02} seconds={4.2} phase={0.4}>
          <Elephant width={320} />
        </Idle>
      </Place>
      <SvgLayer>
        {Array.from({ length: TRACKED_DAYS }, (_, day) => (
          <rect
            key={day}
            x={
              CALENDAR.x +
              (day % CALENDAR.columns) * (CALENDAR.cell + CALENDAR.gap)
            }
            y={
              CALENDAR.y +
              Math.floor(day / CALENDAR.columns) *
                (CALENDAR.cell + CALENDAR.gap)
            }
            width={CALENDAR.cell}
            height={CALENDAR.cell}
            rx={8}
            fill={day < daysTracked ? palette.leaf.base : palette.dusk}
          />
        ))}
      </SvgLayer>
      <Place x={1447} y={500}>
        <Appear at={monthEnds}>
          <Label size="note" tag={palette.leaf.base}>
            35 dias
          </Label>
        </Appear>
      </Place>
      <NamedDayBar name="você" y={700} asleep={HUMAN_SLEEP} at={barsAppear} />
      <NamedDayBar
        name="elefanta"
        y={900}
        asleep={ELEPHANT_SLEEP}
        at={barsAppear}
      />
      <Place x={1640} y={800}>
        <Appear at={barsAppear}>
          <Label size="label">2 h</Label>
        </Appear>
      </Place>
    </Stage>
  );
};
