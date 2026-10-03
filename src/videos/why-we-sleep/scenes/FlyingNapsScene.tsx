import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { Frigatebird } from "../../../art/Animals";
import { Appear } from "../../../components/Appear";
import { Idle } from "../../../components/Idle";
import { Label } from "../../../components/Label";
import { Place } from "../../../components/Place";
import { palette } from "../../../design/tokens";
import type { SceneProps } from "../../../video/NarratedVideo";
import { DayBar } from "../parts/DayBar";
import { Stage } from "../parts/Stage";
import { cue } from "../parts/timing";

// Sono em voo medido na fragata: 0,69 hora por dia.
export const FRIGATEBIRD_FLIGHT_SLEEP = 0.69 / 24;
const NAP = { everySeconds: 1.1, lastsSeconds: 0.25 };

export const FlyingNapsScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const napsStart = cue(scene, "cochilos");
  const totalAppears = cue(scene, "Somando");
  const merged = cue(scene, "quarenta");
  const napping =
    frame >= napsStart &&
    frame < totalAppears &&
    (frame - napsStart) % (NAP.everySeconds * fps) < NAP.lastsSeconds * fps;

  return (
    <Stage scene={scene}>
      <Place x={620} y={380 + 14 * Math.sin(frame / fps)}>
        <Idle sway={3} seconds={5} origin="50% 50%">
          <Frigatebird width={480} color={palette.paper} />
        </Idle>
      </Place>
      <Place x={1400} y={380}>
        <Appear at={cue(scene, "onze")}>
          <Label size="headline">11 s</Label>
        </Appear>
      </Place>
      {/* Cada cochilo escurece o quadro por um instante. */}
      {napping ? (
        <AbsoluteFill style={{ background: palette.ink, opacity: 0.65 }} />
      ) : null}
      <Place x={width / 2} y={680}>
        <Appear at={merged}>
          <Label size="note" tag={palette.accent.base}>
            41 min por dia
          </Label>
        </Appear>
      </Place>
      <Place x={width / 2} y={820}>
        <Appear at={totalAppears}>
          <DayBar
            width={1400}
            asleep={FRIGATEBIRD_FLIGHT_SLEEP}
            scattered={frame < merged}
          />
        </Appear>
      </Place>
    </Stage>
  );
};
