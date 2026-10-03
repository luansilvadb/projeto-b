import { useCurrentFrame, useVideoConfig } from "remotion";
import { Dolphin } from "../../../art/Animals";
import { Sfx } from "../../../audio/Sfx";
import { Place } from "../../../components/Place";
import { SvgLayer } from "../../../components/SvgLayer";
import { palette, shape } from "../../../design/tokens";
import type { SceneProps } from "../../../video/NarratedVideo";
import { Stage } from "../parts/Stage";
import { cue, ramp } from "../parts/timing";
import { WaterSurface } from "../parts/WaterSurface";

const SURFACE_Y = 380;
const DOLPHIN = { x: 960, width: 480, depth: 620, climb: 190 };
const DIVE_SECONDS = 3.4;
// Onde o ar sai, acima da cabeça do golfinho quando ele chega à superfície.
const SPOUT = { x: 800, y: 300, height: 90 };
const SPOUT_SECONDS = 0.8;

export const DolphinProblemScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const breathes = cue(scene, "respirar");
  // O ciclo é ancorado na deixa: o golfinho está no alto quando a narração diz "respirar".
  const cycle = ((frame - breathes) / (DIVE_SECONDS * fps)) * Math.PI * 2;
  const spout = ramp(frame, breathes, SPOUT_SECONDS * fps);
  const breathing = frame >= breathes && spout < 1;

  return (
    <Stage scene={scene}>
      <Sfx name="splash" from={breathes} />
      <WaterSurface y={SURFACE_Y} />
      {breathing ? (
        <SvgLayer>
          {[-50, 0, 50].map((lean) => (
            <line
              key={lean}
              x1={SPOUT.x + lean * 0.4}
              y1={SPOUT.y}
              x2={SPOUT.x + lean * (0.4 + 0.6 * spout)}
              y2={SPOUT.y - SPOUT.height * spout}
              stroke={palette.paper}
              strokeWidth={shape.stroke.regular}
              strokeLinecap="round"
              opacity={1 - spout}
            />
          ))}
        </SvgLayer>
      ) : null}
      <Place
        x={DOLPHIN.x}
        y={DOLPHIN.depth - DOLPHIN.climb * Math.cos(cycle)}
        style={{ rotate: `${18 * Math.sin(cycle)}deg` }}
      >
        <Dolphin width={DOLPHIN.width} />
      </Place>
    </Stage>
  );
};
