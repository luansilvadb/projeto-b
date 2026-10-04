import { Hydra } from "../../../art/Animals";
import { Brain } from "../../../art/Brain";
import { Appear } from "../../../components/Appear";
import { Idle } from "../../../components/Idle";
import { Label } from "../../../components/Label";
import { Place } from "../../../components/Place";
import { palette } from "../../../design/tokens";
import type { SceneProps } from "../../../video/NarratedVideo";
import { LivingJellyfish } from "../parts/LivingJellyfish";
import { Moon, ORIGIN, OriginLine } from "../parts/OriginLine";
import { Stage } from "../parts/Stage";
import { cue } from "../../../components/timing";
import { PULSES_ASLEEP } from "../parts/pulse";

export const MARKER_Y = ORIGIN.y - 110;
export const MARKER_LABEL_Y = ORIGIN.y + 90;

export const HydraScene: React.FC<SceneProps> = ({ scene }) => {
  const hydraAppears = cue(scene, "hidra");
  const sleepFirst = cue(scene, "primeiro");
  const brainLater = cue(scene, "depois");

  return (
    <Stage scene={scene}>
      <Place x={560} y={340}>
        <LivingJellyfish size={380} rhythm={PULSES_ASLEEP} />
      </Place>
      <Place x={1080} y={350}>
        <Appear at={hydraAppears}>
          <Idle sway={3} seconds={6}>
            <Hydra width={200} />
          </Idle>
        </Appear>
      </Place>
      <Place x={1360} y={350}>
        <Appear at={hydraAppears}>
          <Label size="note" tag={palette.leaf.base}>
            hidra
          </Label>
        </Appear>
      </Place>
      <OriginLine />
      <Place x={ORIGIN.sleepX} y={MARKER_Y}>
        <Appear at={sleepFirst}>
          <Moon size={120} />
        </Appear>
      </Place>
      <Place x={ORIGIN.sleepX} y={MARKER_LABEL_Y}>
        <Appear at={sleepFirst}>
          <Label size="note" tag={palette.sun.light}>
            sono
          </Label>
        </Appear>
      </Place>
      <Place x={ORIGIN.brainX} y={MARKER_Y}>
        <Appear at={brainLater}>
          <Brain width={150} />
        </Appear>
      </Place>
      <Place x={ORIGIN.brainX} y={MARKER_LABEL_Y}>
        <Appear at={brainLater}>
          <Label size="note" tag={palette.ocean.light}>
            cérebro
          </Label>
        </Appear>
      </Place>
    </Stage>
  );
};
