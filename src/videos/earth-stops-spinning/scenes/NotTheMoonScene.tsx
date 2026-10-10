import { useCurrentFrame, useVideoConfig } from "remotion";
import { wave } from "../../../components/Idle";
import { popOpacity, popScale } from "../../../components/Pop";
import { cue, mix, ramp } from "../../../components/timing";
import type { SceneProps } from "../../../video/NarratedVideo";
import { Shot, useShotLength } from "../../../video/Shot";
import { earth, ink } from "../palette";
import { GlobeRow, NightSide } from "../parts/ClimateGlobes";
import { MOON_LEVELS, Thermometer } from "../parts/ClimateThermometer";
import { Globe } from "../parts/Globe";
import { Frame, IdeaBackdrop, Push, Question, SourceSeal, SpaceBackdrop, Svg } from "../parts/kit";
import { Moon } from "../parts/Sky";

// A Terra parada, de lado, com a luz vindo da esquerda: o lado claro e o
// escuro são metades, como na Lua.
const StillEarth: React.FC<{
  readonly cx: number;
  readonly cy: number;
  readonly r: number;
  /** Quanto da camada de ar já apareceu, de 0 a 1. */
  readonly air: number;
}> = ({ cx, cy, r, air }) => (
  <>
    <circle cx={cx} cy={cy} r={r * (0.94 + 0.2 * air)} fill={earth.air} opacity={0.3 * Math.min(1, air)} />
    <Globe cx={cx} cy={cy} r={r} spin={0.06} shade={0} />
    <NightSide cx={cx} cy={cy} r={r} />
  </>
);

const PAIR = {
  moon: { cx: 480, cy: 560, r: 230 },
  earth: { cx: 1310, cy: 560, r: 290 },
} as const;
const HEAT_BLOBS = 6;
// Quantos segundos uma mancha de calor leva do lado claro ao escuro.
const CROSSING_SECONDS = 3.2;

type AirProps = {
  /** Os quadros em que o ar aparece e em que o calor começa a ser levado. */
  readonly at: readonly [number, number];
};

/** A Lua e a Terra parada sob a mesma luz: só a Terra tem ar, que leva calor do lado claro para o escuro. */
const OnlyEarthHasAir: React.FC<AirProps> = ({ at }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { moon, earth: globe } = PAIR;
  const air = popScale(frame, at[0], 0.4 * fps, 0);
  const carried = (frame - at[1]) / fps / CROSSING_SECONDS;
  return (
    <Frame backdrop={<SpaceBackdrop light={[0, 0.5]} />}>
      <Push focus={[globe.cx, globe.cy]} to={1.05}>
        <Svg>
          <Moon {...moon} night={0} />
          <StillEarth {...globe} air={air} />
          {/* As manchas de calor saem do lado claro, passam por cima e por baixo e esfriam no escuro. */}
          {carried <= 0
            ? null
            : ([1, -1] as const).flatMap((over) =>
                Array.from({ length: HEAT_BLOBS }, (_, index) => {
                  const along = (carried + index / HEAT_BLOBS + (over === 1 ? 0 : 0.1)) % 1;
                  // Só existem as manchas que já saíram do lado claro depois da deixa.
                  if (along > carried) {
                    return null;
                  }
                  const angle = Math.PI * (1 - mix(0.06, 0.94, along));
                  const radius = globe.r * 1.07;
                  return (
                    <circle
                      key={`${over}-${index}`}
                      cx={globe.cx + radius * Math.cos(angle)}
                      cy={globe.cy - over * radius * Math.sin(angle)}
                      // A mancha sai cheia do lado claro e vai se gastando até o escuro.
                      r={34 * (1 - 0.6 * along) * Math.min(1, along * 8)}
                      fill={ink.hot}
                      opacity={1 - along ** 3}
                    />
                  );
                }),
              )}
        </Svg>
      </Push>
    </Frame>
  );
};

const TRIO = {
  moon: { cx: 440, cy: 560, r: 250 },
  earth: { cx: 1330, cy: 560, r: 330 },
  base: 850,
  height: 560,
} as const;

type OpenProps = {
  /** O quadro em que as interrogações entram. */
  readonly askAt: number;
};

/** O termômetro da Lua, com os dois números, e os dois da Terra parada: sem marcação, só interrogação. */
const NoNumbers: React.FC<OpenProps> = ({ askAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { moon, earth: globe, base, height } = TRIO;
  // A coluna da Lua vai e volta entre os dois extremos que ela mede.
  const swing = 0.5 + 0.5 * wave(frame / fps, 5, 0.25);
  return (
    <Frame backdrop={<SpaceBackdrop light={[0, 0.5]} />}>
      <Push focus={[960, 560]} from={1.12} to={1} progress={ramp(frame, 0, 0.6 * fps)}>
        <Push focus={[globe.cx, globe.cy]} to={1.04}>
          <Svg>
            <Moon {...moon} night={0} />
            <StillEarth {...globe} air={1} />
            <Thermometer
              x={moon.cx + 110}
              y={base}
              height={height}
              level={mix(MOON_LEVELS.night, MOON_LEVELS.day, swing)}
              marks={[
                { at: MOON_LEVELS.day, text: "120 °C" },
                { at: MOON_LEVELS.night, text: "−130 °C" },
              ]}
            />
            {/* Um no lado claro, outro no escuro: nenhum dos dois tem leitura. */}
            {([-1, 1] as const).map((side) => {
              const x = globe.cx + side * 170 - 50;
              return (
                <g key={side}>
                  <Thermometer x={x} y={base} height={height} />
                  <g
                    opacity={popOpacity(frame, askAt + (side + 1) * 3, 0.3 * fps)}
                    transform={`translate(${x + 128} ${base - height * 0.56}) scale(${popScale(frame, askAt + (side + 1) * 3, 0.3 * fps)})`}
                  >
                    <Question x={0} y={0} size={132} />
                  </g>
                </g>
              );
            })}
          </Svg>
        </Push>
      </Push>
    </Frame>
  );
};

type RowProps = {
  /** Os quadros em que os globos simulados e a vaga do dia de um ano entram. */
  readonly at: readonly [number, number];
};

/** A fileira dos modelos de clima: giros cada vez mais lentos, e a vaga do dia de um ano, que ninguém rodou. */
const SimulatedRow: React.FC<RowProps> = ({ at }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const length = useShotLength();
  // Os quatro globos entram em fila; a vaga só aparece quando a fala chega nela.
  const order = [0, 1, 2, null, 3] as const;
  return (
    <Frame backdrop={<IdeaBackdrop hue="peach" spot={[0.5, 0.5]} />}>
      <Push to={1.03}>
        <GlobeRow
          clock={frame - length}
          enter={order.map((turn) => (turn === null ? at[1] : at[0] + turn * 0.18 * fps))}
        />
      </Push>
      <SourceSeal>Way et al., 2018; Guzewich et al., 2020</SourceSeal>
    </Frame>
  );
};

export const NotTheMoonScene: React.FC<SceneProps> = ({ scene, shots }) => (
  <>
    <Shot range={shots[0]} name="só a Terra tem ar">
      <OnlyEarthHasAir at={[cue(scene, "ar"), cue(scene, "calor")]} />
    </Shot>
    <Shot range={shots[1]} name="os globos simulados">
      {/*
        A fileira já vem entrando no corte: o primeiro globo está inteiro no primeiro quadro.
        A vaga do "dia de um ano" não entra aqui: a fala só chega nela no plano seguinte.
      */}
      <SimulatedRow at={[-9, Number.MAX_SAFE_INTEGER]} />
    </Shot>
    <Shot range={shots[2]} name="termômetros sem número">
      <NoNumbers askAt={cue(scene, "número") - shots[2].from} />
    </Shot>
  </>
);
