import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Earth } from "../../../art/Earth";
import { LightPulse } from "../../../art/LightPulse";
import { Sun } from "../../../art/Sun";
import { Appear } from "../../../components/Appear";
import { Backdrop } from "../../../components/Backdrop";
import { Layer } from "../../../components/Camera";
import { Glow } from "../../../components/Glow";
import { Grain } from "../../../components/Grain";
import { Label } from "../../../components/Label";
import { Place } from "../../../components/Place";
import { StarField } from "../../../components/StarField";
import { SvgLayer } from "../../../components/SvgLayer";
import { palette, shape } from "../../../design/tokens";
import { cueFrame } from "../../../narration/timeline";
import type { SceneProps } from "../../../video/NarratedVideo";

const SUN = { x: 300, y: 620 };
const EARTH = { x: 1620, y: 620 };
// O caminho da luz começa e termina na borda de cada astro.
const PATH = { from: SUN.x + 150, to: EARTH.x - 90, y: 620 };

export const DistanceScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();

  // Sem easing: a luz viaja em velocidade constante.
  const pulseX = interpolate(
    frame,
    [0.4 * fps, scene.durationInFrames - 0.6 * fps],
    [PATH.from, PATH.to],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const distanceAppears = cueFrame(scene, "cento");

  return (
    <AbsoluteFill>
      <Backdrop />
      <StarField seed="distance" />
      <SvgLayer>
        <line
          x1={PATH.from}
          y1={PATH.y}
          x2={PATH.to}
          y2={PATH.y}
          stroke={palette.mist}
          strokeWidth={shape.stroke.thin}
          strokeDasharray="2 22"
          strokeLinecap="round"
          opacity={0.6}
        />
        <line
          x1={PATH.from}
          y1={PATH.y}
          x2={pulseX}
          y2={PATH.y}
          stroke={palette.sun.light}
          strokeWidth={shape.stroke.regular}
          strokeLinecap="round"
        />
      </SvgLayer>
      <Layer depth={1} light>
        <Place x={SUN.x} y={SUN.y}>
          <Glow radius={330} color={palette.sun.dark} opacity={0.55} />
        </Place>
      </Layer>
      <Place x={SUN.x} y={SUN.y}>
        <Sun radius={120} />
      </Place>
      <Place x={EARTH.x} y={EARTH.y}>
        <Earth radius={64} />
      </Place>
      <Place x={pulseX} y={PATH.y}>
        <LightPulse radius={14} />
      </Place>
      <Place x={width / 2} y={380}>
        <Appear at={distanceAppears}>
          <Label size="headline">150 milhões de km</Label>
        </Appear>
      </Place>
      <Grain />
    </AbsoluteFill>
  );
};
