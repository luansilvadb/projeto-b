import { useId } from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { Place } from "../../../components/Place";
import { Pop, popScale } from "../../../components/Pop";
import { cue, linear, mix, ramp } from "../../../components/timing";
import type { SceneProps } from "../../../video/NarratedVideo";
import { Shot, useShotLength } from "../../../video/Shot";
import { space } from "../palette";
import { MOON_LEVELS, Thermometer } from "../parts/ClimateThermometer";
import { Frame, Push, SourceSeal, SpaceBackdrop, Svg, Tag } from "../parts/kit";
import { Moon, SunDisc } from "../parts/Sky";

const MOON = { cx: 960, cy: 462, r: 310 } as const;

type HalvesProps = {
  /** O quadro em que cada etiqueta entra: o dia, a noite. */
  readonly at: readonly [number, number];
  /** O quadro em que a fala diz que lugar é esse. */
  readonly moonAt: number;
};

// De perto, o disco não cabe no quadro: só chão cinza, e a linha da sombra andando nele.
const CLOSE = { from: 4.7, to: 4.1 } as const;
// A linha da sombra, em pixels da Lua a partir do meio dela: vem da direita.
const SHADOW = { from: 100, to: -25 } as const;

/**
 * A resposta fica guardada até a fala: o plano abre colado no chão, com a linha
 * da sombra andando, e a câmera só abre até a Lua inteira em "que é a Lua".
 * As etiquetas ficam presas ao quadro, cada uma do lado que nomeia: de perto,
 * sobre o chão claro e o escuro; de longe, debaixo de cada metade.
 */
const TwoHalves: React.FC<HalvesProps> = ({ at, moonAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const length = useShotLength();
  const opened = ramp(frame, moonAt - 0.9 * fps, 0.9 * fps + 4);
  const zoom = mix(CLOSE.from, CLOSE.to, linear(frame, 0, Math.max(1, moonAt - 0.9 * fps))) ** (1 - opened);
  const r = MOON.r * zoom;
  return (
    <Frame backdrop={<SpaceBackdrop light={[0, 0.4]} />}>
      <Svg>
        <Moon
          cx={MOON.cx}
          // De perto o meio da Lua é o meio do quadro; aberta, ela sobe para dar lugar às etiquetas.
          cy={mix(540, MOON.cy, opened)}
          r={r}
          night={-mix(SHADOW.from, SHADOW.to, frame / length) / MOON.r}
        />
      </Svg>
      <Place x={600} y={880}>
        <Pop at={at[0]}>
          <Tag on="dark">dia: 2 semanas</Tag>
        </Pop>
      </Place>
      <Place x={1340} y={880}>
        <Pop at={at[1]}>
          <Tag on="note">noite: 2 semanas</Tag>
        </Pop>
      </Place>
    </Frame>
  );
};

const GROUND = "M0,770 Q960,690 1920,770 L1920,1080 L0,1080 Z";
const PROBE = { x: 900, y: 792, height: 600 } as const;

type GroundProps = {
  /** Os quadros da fala: o chão esquenta, o número do dia, a sombra chega, o número da noite. */
  readonly at: readonly [number, number, number, number];
};

/** O chão da Lua, de perto: o termômetro sobe de dia e despenca quando a sombra passa. */
const OnTheGround: React.FC<GroundProps> = ({ at }) => {
  const id = useId();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const night = linear(frame, at[2], 1.3 * fps);
  const level = mix(
    mix(0.3, MOON_LEVELS.day, ramp(frame, at[0], 1.1 * fps)),
    MOON_LEVELS.night,
    ramp(frame, at[2] + 0.3 * fps, 1.4 * fps),
  );
  return (
    <Frame backdrop={<SpaceBackdrop light={[0.1, 0.2]} />}>
      {/* Chega de perto do termômetro, abre até o chão em volta e depois só se aproxima devagar. */}
      <Push focus={[PROBE.x, 620]} from={1.2} to={1} progress={ramp(frame, 0, 0.6 * fps)}>
        <Push focus={[PROBE.x, 620]} to={1.04}>
          <Svg>
            <defs>
              <clipPath id={id}>
                {/* A sombra vem da direita, como na Lua do plano anterior. */}
                <rect x={mix(2300, -400, night)} y={0} width={2800} height={1080} />
              </clipPath>
            </defs>
            {/* O Sol se põe à esquerda quando a noite chega. */}
            <SunDisc cx={300} cy={mix(250, 900, night)} r={74} />
            <path d={GROUND} transform="translate(0 -26) scale(1 1.02)" fill={space.moonShade} />
            <path d={GROUND} fill={space.moon} />
            <g fill={space.moonCrater}>
              <ellipse cx={420} cy={860} rx={150} ry={26} />
              <ellipse cx={1340} cy={830} rx={110} ry={18} />
              <ellipse cx={1560} cy={960} rx={190} ry={30} />
              <ellipse cx={760} cy={1010} rx={120} ry={20} />
            </g>
            {/* A cova em que ele está fincado: o fundo atrás, a borda de cá na frente do bulbo. */}
            <ellipse cx={PROBE.x} cy={PROBE.y - 26} rx={150} ry={30} fill={space.moonCrater} />
            <Thermometer
              {...PROBE}
              level={level}
              markSize="label"
              marks={[
                { at: MOON_LEVELS.day, text: "120 °C", shown: popScale(frame, at[1], 0.3 * fps, 0) },
                { at: MOON_LEVELS.night, text: "−130 °C", shown: popScale(frame, at[3], 0.3 * fps, 0) },
              ]}
            />
            <ellipse cx={PROBE.x} cy={PROBE.y + 2} rx={150} ry={42} fill={space.moon} />
            <path d={GROUND} transform="translate(0 -26) scale(1 1.02)" fill={space.sky[0]} opacity={0.78} clipPath={`url(#${id})`} />
          </Svg>
          <Place x={1300} y={900}>
            <Pop at={0.5 * fps}>
              <Tag on="dark">perto do equador</Tag>
            </Pop>
          </Place>
        </Push>
      </Push>
      <SourceSeal>NASA, LRO</SourceSeal>
    </Frame>
  );
};

export const TheMoonCaseScene: React.FC<SceneProps> = ({ scene, shots }) => (
  <>
    <Shot range={shots[0]} name="a Lua, dia e noite">
      {/* O primeiro "dia" da fala é o da Terra ("um dia tão longo"); o da Lua é o segundo. */}
      <TwoHalves at={[cue(scene, "dia", 2), cue(scene, "noite")]} moonAt={cue(scene, "Lua")} />
    </Shot>
    <Shot range={shots[1]} name="o termômetro no chão da Lua">
      <OnTheGround
        at={[
          cue(scene, "chega") - shots[1].from,
          cue(scene, "cento") - shots[1].from,
          cue(scene, "cai") - shots[1].from,
          cue(scene, "cento", 2) - shots[1].from,
        ]}
      />
    </Shot>
  </>
);
