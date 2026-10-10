import { useCurrentFrame, useVideoConfig } from "remotion";
import { popOpacity, popScale } from "../../../components/Pop";
import { cue, ramp } from "../../../components/timing";
import type { SceneProps } from "../../../video/NarratedVideo";
import { Shot, useShotLength } from "../../../video/Shot";
import { earth, ink } from "../palette";
import { Globe, LatitudeRing } from "../parts/Globe";
import { Frame, Push, SpaceBackdrop, Svg } from "../parts/kit";
import { WindArrows } from "../parts/Wind";

const EARTH = { cx: 960, cy: 540, r: 350 } as const;
// A cintura alargada do gancho: pequena, só para se ver o colchete abrir.
const BULGE = 0.05;
const TURN_SECONDS = 14;

type Props = {
  /** O quadro em que cada coisa acende: o mar, a cintura, o vento. */
  readonly at: readonly [number, number, number];
};

/** Um colchete que marca a largura da cintura, de um dos lados. */
const Bracket: React.FC<{ readonly side: 1 | -1; readonly grown: number; readonly opacity: number }> = ({
  side,
  grown,
  opacity,
}) => {
  const x = EARTH.cx + side * (EARTH.r * (1 + BULGE) + 46);
  return (
    <g opacity={opacity} transform={`translate(${x} ${EARTH.cy}) scale(${grown})`}>
      <path
        d={`M${-side * 26},-84 L0,-84 L0,84 L${-side * 26},84`}
        fill="none"
        stroke={ink.accent}
        strokeWidth={12}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
  );
};

/** A Terra girando, de lado; o mar na cintura, a cintura mais larga e o vento que se curva acendem um a um. */
const ThreeThings: React.FC<Props> = ({ at }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const length = useShotLength();
  const wide = ramp(frame, at[1], 0.6 * fps);
  const blow = ramp(frame, at[2], 0.5 * fps);
  // A seta mal sai reta e já entorta: a curva cheia fica à vista pelo menos 1,5 s antes de o plano acabar.
  const bend = ramp(frame, Math.min(at[2] + 0.2 * fps, length - 2.1 * fps), 0.6 * fps);
  return (
    <Frame backdrop={<SpaceBackdrop light={[0.1, 0.1]} />}>
      <Push focus={[EARTH.cx, EARTH.cy]} to={1.05}>
        <Svg>
          <Globe {...EARTH} spin={frame / fps / TURN_SECONDS} bulge={BULGE * wide} />
          {/* O mar em volta da cintura. */}
          <LatitudeRing
            {...EARTH}
            lat={0}
            bulge={BULGE * wide}
            color={earth.waterLight}
            width={26}
            opacity={0.9 * popOpacity(frame, at[0], 0.4 * fps)}
          />
          {([-1, 1] as const).map((side) => (
            <Bracket
              key={side}
              side={side}
              grown={popScale(frame, at[1], 0.3 * fps)}
              opacity={popOpacity(frame, at[1], 0.3 * fps)}
            />
          ))}
          <WindArrows {...EARTH} curve={bend} drawn={blow} />
        </Svg>
      </Push>
    </Frame>
  );
};

export const WhatSpinDoesScene: React.FC<SceneProps> = ({ scene, shots }) => (
  <Shot range={shots[0]} name="o que o giro faz">
    <ThreeThings at={[cue(scene, "mar"), cue(scene, "alarga"), cue(scene, "entorta")]} />
  </Shot>
);
