import { useCurrentFrame, useVideoConfig } from "remotion";
import { wave } from "../../../components/Idle";
import { Place } from "../../../components/Place";
import { Pop, popOpacity, popScale } from "../../../components/Pop";
import { cue, mix, ramp, settle } from "../../../components/timing";
import type { SceneProps } from "../../../video/NarratedVideo";
import { Shot } from "../../../video/Shot";
import { BrakeMoon } from "../parts/BrakeMoon";
import { DayClock, DayLens, DayNote } from "../parts/DayClock";
import { Globe } from "../parts/Globe";
import { Frame, IdeaBackdrop, Push, SourceSeal, SpaceBackdrop, Svg, Tag } from "../parts/kit";
import { Moon } from "../parts/Sky";

const TURN_SECONDS = 14;
// A lupa pousa no fim do dia logo que o plano abre, em segundos.
const LENS_AT = 0.15;
// O plano aberto: a Terra e a Lua, cada uma num terço.
const FAR = { earth: { cx: 700, cy: 590, r: 260 }, moon: { cx: 1430, cy: 380, r: 84 } } as const;
// O plano do freio: a Lua na mesma altura da Terra, na linha dos dois calombos.
const NEAR = { earth: { cx: 760, cy: 560, r: 300 }, moon: { cx: 1610, cy: 560, r: 100 } } as const;

/** A Lua ao lado da Terra girando. */
const Beside: React.FC<{ readonly moonAt: number }> = ({ moonAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const seconds = frame / fps;
  // Ela vem chegando pela direita e está no lugar quando a fala a nomeia.
  const arrived = ramp(frame, 0, Math.max(moonAt, 0.5 * fps));
  return (
    <Frame backdrop={<SpaceBackdrop light={[0.05, 0.1]} />}>
      <Push focus={[1000, 520]} to={1.06}>
        <Svg>
          <Globe {...FAR.earth} spin={seconds / TURN_SECONDS} />
          <Moon
            cx={mix(1840, FAR.moon.cx, arrived)}
            cy={mix(250, FAR.moon.cy, arrived) + 8 * wave(seconds, 5)}
            r={FAR.moon.r}
            night={-0.35}
          />
        </Svg>
      </Push>
    </Frame>
  );
};

type ScrapeProps = {
  /** Os quadros da cena já passados, para o globo seguir de onde estava. */
  readonly since: number;
  /** O quadro em que o calombo vira sapata. */
  readonly brakeAt: number;
};

/** A Lua levanta o mar em dois calombos; a Terra gira por baixo, e eles raspam nela como a sapata de um freio. */
const Scrape: React.FC<ScrapeProps> = ({ since, brakeAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <Frame backdrop={<SpaceBackdrop light={[0.05, 0.1]} />}>
      {/* A câmera chega: parte aberta, como o plano anterior. */}
      <Push focus={[1100, 560]} from={0.8} to={1} progress={settle(frame, 0, 0.6 * fps)}>
        <Push focus={[1100, 560]} to={1.04}>
          <Svg>
            <BrakeMoon
              {...NEAR}
              rise={ramp(frame, 0.15 * fps, 0.8 * fps)}
              press={ramp(frame, brakeAt, 0.4 * fps)}
              seconds={frame / fps}
            />
            <Globe {...NEAR.earth} spin={(since + frame) / fps / TURN_SECONDS} />
          </Svg>
          <Place x={1330} y={440}>
            <Pop at={brakeAt + 0.3 * fps}>
              <Tag on="dark" size="seal">
                comparação
              </Tag>
            </Pop>
          </Place>
        </Push>
      </Push>
    </Frame>
  );
};

type LongerProps = {
  /** A lasca chega; a medida aparece. */
  readonly at: readonly [number, number];
};

/** O relógio de um dia ganha uma lasca. */
const Longer: React.FC<LongerProps> = ({ at }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <Frame backdrop={<IdeaBackdrop hue="lilac" spot={[0.3, 0.45]} />}>
      <Push to={1.04}>
        <Svg>
          <DayClock hand={24 * ramp(frame, 0, Math.max(at[0], 0.5 * fps))} />
          <DayLens open={popScale(frame, LENS_AT * fps, 0.3 * fps)} mode="in" moved={ramp(frame, at[0], 0.6 * fps)} />
          <DayNote
            lines={["+1,8 milésimo de segundo", "por século (média medida)"]}
            opacity={popOpacity(frame, at[1], 0.4 * fps)}
          />
        </Svg>
      </Push>
      <SourceSeal>Stephenson et al., 2016</SourceSeal>
    </Frame>
  );
};

export const TheMoonBrakeScene: React.FC<SceneProps> = ({ scene, shots }) => (
  <>
    <Shot range={shots[0]} name="a Lua ao lado da Terra">
      <Beside moonAt={cue(scene, "Lua")} />
    </Shot>
    <Shot range={shots[1]} name="a maré raspa como um freio">
      <Scrape since={shots[1].from} brakeAt={cue(scene, "freio", 2) - shots[1].from} />
    </Shot>
    <Shot range={shots[2]} name="o dia ganha uma lasca">
      <Longer
        at={[cue(scene, "quase") - shots[2].from, cue(scene, "milésimos") - shots[2].from]}
      />
    </Shot>
  </>
);
