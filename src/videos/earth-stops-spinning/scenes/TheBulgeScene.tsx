import { useCurrentFrame, useVideoConfig } from "remotion";
import { Place } from "../../../components/Place";
import { Pop, popOpacity, popScale } from "../../../components/Pop";
import { cue, ramp } from "../../../components/timing";
import type { SceneProps } from "../../../video/NarratedVideo";
import { Shot } from "../../../video/Shot";
import { ink } from "../palette";
import { Caveat, CUT_BULGE, CutEarth, CutRays } from "../parts/CutEarth";
import { Frame, Push, SpaceBackdrop, Svg, SvgText } from "../parts/kit";

// A Terra fica um pouco a oeste do centro: o número do pedaço a mais ocupa o lado leste.
const EARTH = { cx: 800, cy: 550, r: 320 } as const;
const TURN_SECONDS = 14;

type Props = {
  /** Os quadros em que a cintura alarga, os raios saem, o do polo deita sobre o outro e o pedaço a mais acende. */
  readonly at: { readonly waist: number; readonly rays: number; readonly swing: number; readonly extra: number };
};

/** A Terra em corte, girando: a cintura alarga, e os dois raios, na mesma régua, mostram o pedaço a mais. */
const TheWaist: React.FC<Props> = ({ at }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const bulge = CUT_BULGE * ramp(frame, at.waist, 0.9 * fps);
  const tipX = EARTH.cx + EARTH.r * (1 + bulge);
  return (
    <Frame backdrop={<SpaceBackdrop light={[0.08, 0.1]} />}>
      <Push focus={[EARTH.cx + 200, EARTH.cy]} to={1.05}>
        <Svg>
          <CutEarth {...EARTH} bulge={bulge} spin={frame / fps / TURN_SECONDS} />
          <CutRays
            {...EARTH}
            bulge={bulge}
            drawn={ramp(frame, at.rays, 0.6 * fps)}
            swung={ramp(frame, at.swing, 0.7 * fps)}
            lit={ramp(frame, at.extra, 0.3 * fps)}
          />
          <g
            transform={`translate(${tipX + 50} ${EARTH.cy}) scale(${popScale(frame, at.extra + 4, 0.3 * fps)})`}
            opacity={popOpacity(frame, at.extra + 4, 0.3 * fps)}
          >
            <SvgText x={0} y={0} size="label" fill={ink.accent} anchor="start">
              21 km
            </SvgText>
          </g>
        </Svg>
        {/* Encostada na borda da cintura, do lado de fora: é ela que está exagerada. */}
        <Place x={500} y={300}>
          <Pop at={at.waist + 6}>
            <Caveat on="dark">exagerado</Caveat>
          </Pop>
        </Place>
      </Push>
    </Frame>
  );
};

export const TheBulgeScene: React.FC<SceneProps> = ({ scene, shots }) => (
  <Shot range={shots[0]} name="a cintura e os dois raios">
    <TheWaist
      at={{
        waist: cue(scene, "espalha"),
        rays: cue(scene, "centro"),
        swing: cue(scene, "equador"),
        extra: cue(scene, "vinte"),
      }}
    />
  </Shot>
);
