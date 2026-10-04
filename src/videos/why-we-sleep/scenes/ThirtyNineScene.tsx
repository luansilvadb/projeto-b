import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Appear } from "../../../components/Appear";
import { Place } from "../../../components/Place";
import { palette } from "../../../design/tokens";
import type { SceneProps } from "../../../video/NarratedVideo";
import { LivingJellyfish } from "../parts/LivingJellyfish";
import { PulseCounter } from "../parts/PulseCounter";
import { restingY } from "../parts/Sea";
import { Stage } from "../parts/Stage";
import { cue } from "../../../components/timing";
import { PULSES_ASLEEP } from "../parts/pulse";

// O enquadramento com que o vídeo abria antes de o gancho ser redesenhado.
// Esta cena ainda não foi refeita e continua nele.
const JELLYFISH = { x: 700, size: 620 };
const COUNTER = { x: 1400, y: 480 };
const FADE_OUT_SECONDS = 0.8;

/** O mesmo quadro da primeira cena, agora à noite: o vídeo fecha onde abriu. */
export const ThirtyNineScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill>
      <Stage scene={scene} sea={1}>
        <Place x={JELLYFISH.x} y={restingY(JELLYFISH.size)}>
          <LivingJellyfish size={JELLYFISH.size} rhythm={PULSES_ASLEEP} />
        </Place>
        <Place x={COUNTER.x} y={COUNTER.y}>
          <Appear at={cue(scene, "Trinta")}>
            <PulseCounter value={PULSES_ASLEEP} />
          </Appear>
        </Place>
      </Stage>
      <AbsoluteFill
        style={{
          background: palette.ink,
          opacity: interpolate(
            frame,
            [
              scene.durationInFrames - FADE_OUT_SECONDS * fps,
              scene.durationInFrames,
            ],
            [0, 1],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
          ),
        }}
      />
    </AbsoluteFill>
  );
};
