import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Frigatebird } from "../../../art/Animals";
import { Appear } from "../../../components/Appear";
import { Label } from "../../../components/Label";
import { Place } from "../../../components/Place";
import { palette } from "../../../design/tokens";
import type { SceneProps } from "../../../video/NarratedVideo";
import { NamedDayBar } from "../parts/NamedDayBar";
import { Stage } from "../parts/Stage";
import { cue, ramp } from "../parts/timing";
import { ELEPHANT_SLEEP } from "./ElephantsScene";
import { FRIGATEBIRD_FLIGHT_SLEEP } from "./FlyingNapsScene";
import { HUMAN_SLEEP } from "./SleepCostScene";

// Em terra, a fragata passou 53% do tempo dormindo.
const FRIGATEBIRD_LAND_SLEEP = 0.53;

export const AlmostNoSleepScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const lands = cue(scene, "terra");

  return (
    <Stage scene={scene}>
      <NamedDayBar name="você" y={250} asleep={HUMAN_SLEEP} />
      <NamedDayBar name="elefanta" y={430} asleep={ELEPHANT_SLEEP} />
      <NamedDayBar
        name="fragata"
        y={610}
        asleep={interpolate(
          ramp(frame, cue(scene, "muito"), 0.8 * fps),
          [0, 1],
          [FRIGATEBIRD_FLIGHT_SLEEP, FRIGATEBIRD_LAND_SLEEP],
        )}
      />
      <Place x={760} y={860}>
        <Appear at={lands}>
          <Frigatebird width={300} color={palette.paper} />
        </Appear>
      </Place>
      <Place x={1160} y={860}>
        <Appear at={lands}>
          <Label size="note" tag={palette.accent.base}>
            em terra
          </Label>
        </Appear>
      </Place>
    </Stage>
  );
};
