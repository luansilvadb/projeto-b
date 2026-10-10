import { useId } from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { wave } from "../../../components/Idle";
import { popOpacity } from "../../../components/Pop";
import { cue, mix, ramp, settle } from "../../../components/timing";
import type { SceneProps } from "../../../video/NarratedVideo";
import { Shot } from "../../../video/Shot";
import { ink, space } from "../palette";
import { Globe } from "../parts/Globe";
import { Frame, Push, SpaceBackdrop, Svg, SvgText } from "../parts/kit";
import { LeverStation } from "../parts/Lever";
import { SunDisc } from "../parts/Sky";
import { STAGE } from "./SwitchOffScene";

const TURN_SECONDS = 14;
// Em quantos segundos a Terra volta do repouso ao ritmo de sempre.
const SPIN_UP_SECONDS = 1.8;

/** As voltas dadas `seconds` depois de ligada: parte de parada, acelera e segue no ritmo de sempre. */
const spunUp = (seconds: number): number => {
  const t = Math.max(0, seconds);
  return (t < SPIN_UP_SECONDS ? (t * t) / (2 * SPIN_UP_SECONDS) : t - SPIN_UP_SECONDS / 2) / TURN_SECONDS;
};

/** A Vigília empurra a alavanca de volta para ligado, e a Terra volta a girar. */
const BackOn: React.FC<{ readonly pushAt: number }> = ({ pushAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const on = ramp(frame, pushAt, 0.5 * fps);
  // Com a alavanca no lugar, ela olha a Terra por cima do ombro.
  const looked = ramp(frame, pushAt + 0.8 * fps, 0.4 * fps);
  return (
    <Frame backdrop={<SpaceBackdrop light={[0.05, 0.1]} />}>
      <Push focus={[1200, 640]} from={1.08} to={1.02}>
        <Svg>
          <Globe {...STAGE.earth} spin={0.3 + spunUp((frame - pushAt) / fps - 0.3)} />
          <LeverStation
            {...STAGE.lever}
            on={on}
            hands={ramp(frame, 2, 0.4 * fps)}
            grip={{
              // O esforço do empurrão: o corpo vai junto com a haste.
              lean: 4 + 10 * on - 10 * looked,
              turn: mix(0.9, 0.2, looked),
              gaze: [mix(0.6, -0.8, looked), -0.4],
              mouth: [11, 0, mix(-0.2, 0.8, looked)],
              grit: 1 - on,
            }}
            shadow={ink.dark}
          />
        </Svg>
      </Push>
    </Frame>
  );
};

const SUN = { cx: 40, cy: 520, r: 300 } as const;
const EARTH = { cx: 770, cy: 540, r: 210 } as const;
const TANK = { x: 1400, top: 190, bottom: 690, width: 270 } as const;
const YEARS = 39000;

/** Um número inteiro com ponto de milhar. */
const thousands = (value: number): string =>
  value < 1000 ? `${value}` : `${Math.floor(value / 1000)}.${String(value % 1000).padStart(3, "0")}`;

/** O reservatório: um vidro aberto em cima que enche de luz, de 0 a 1. */
const Reservoir: React.FC<{ readonly fill: number; readonly seconds: number }> = ({ fill, seconds }) => {
  const id = useId();
  const left = TANK.x - TANK.width / 2;
  const height = TANK.bottom - TANK.top;
  const level = TANK.bottom - (height - 30) * fill;
  return (
    <g>
      <defs>
        <clipPath id={id}>
          <rect x={left} y={TANK.top} width={TANK.width} height={height} rx={44} />
        </clipPath>
        <radialGradient id={`${id}-glow`}>
          <stop offset="0.3" stopColor={space.sunCore} stopOpacity={0.5} />
          <stop offset="1" stopColor={space.sunCore} stopOpacity={0} />
        </radialGradient>
      </defs>
      {/* A luz guardada ilumina em volta: cresce com o nível. */}
      <ellipse
        cx={TANK.x}
        cy={(level + TANK.bottom) / 2}
        rx={TANK.width * (0.6 + 0.5 * fill)}
        ry={height * (0.2 + 0.5 * fill)}
        fill={`url(#${id}-glow)`}
        opacity={fill}
      />
      <g clipPath={`url(#${id})`}>
        <rect x={left} y={level} width={TANK.width} height={TANK.bottom - level} fill={space.sun} />
        <path
          d={`M${left},${level} q${TANK.width / 4},${-14 * wave(seconds, 1.7)} ${TANK.width / 2},0 t${TANK.width / 2},0 v26 h${-TANK.width} Z`}
          fill={space.sunCore}
        />
      </g>
      <path
        d={`M${left},${TANK.top - 30} V${TANK.bottom - 44} a44,44 0 0 0 44,44 H${left + TANK.width - 44} a44,44 0 0 0 44,-44 V${TANK.top - 30}`}
        fill={ink.paper}
        fillOpacity={0.14}
        stroke={ink.paper}
        strokeWidth={10}
        strokeLinecap="round"
        opacity={0.85}
      />
    </g>
  );
};

// O caminho da luz, da Terra à boca do reservatório.
const FLOW = { from: [900, 380], bend: [1130, 20], to: [TANK.x, TANK.top + 20] } as const;
const along = (u: number, axis: 0 | 1): number =>
  (1 - u) ** 2 * FLOW.from[axis] + 2 * u * (1 - u) * FLOW.bend[axis] + u ** 2 * FLOW.to[axis];

type SunEnergyProps = {
  /** O quadro em que o contador chega ao fim. */
  readonly fullAt: number;
};

/** O Sol ilumina a Terra; ao lado, o reservatório enche de luz e o contador de anos corre. */
const SunEnergy: React.FC<SunEnergyProps> = ({ fullAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const seconds = frame / fps;
  const startAt = 0.5 * fps;
  const fill = ramp(frame, startAt, Math.max(fps, fullAt - startAt));
  const years = Math.round((YEARS * fill) / 100) * 100;
  const flowing = popOpacity(frame, startAt - 8, 10) * (1 - ramp(frame, fullAt, 0.4 * fps));
  return (
    <Frame backdrop={<SpaceBackdrop light={[0, 0.5]} />}>
      {/* Chega mais fechado na Terra e abre até caber o reservatório. */}
      <Push focus={[EARTH.cx, EARTH.cy]} from={1.3} to={1} progress={settle(frame, 0, 0.7 * fps)}>
        <Push focus={[1100, 500]} to={1.04}>
          <Svg>
            {/* O feixe do Sol até a Terra. */}
            <path
              d={`M${SUN.cx},${SUN.cy - SUN.r} L${EARTH.cx},${EARTH.cy - EARTH.r} L${EARTH.cx},${EARTH.cy + EARTH.r} L${SUN.cx},${SUN.cy + SUN.r} Z`}
              fill={space.sunCore}
              opacity={0.13 + 0.03 * wave(seconds, 3.1)}
            />
            <SunDisc {...SUN} />
            <Globe {...EARTH} spin={seconds / TURN_SECONDS} shade={0.6} />
            {/* A luz que chega, a caminho do reservatório. */}
            {Array.from({ length: 7 }, (_, index) => {
              const u = (seconds * 0.55 + index / 7) % 1;
              return (
                <circle
                  key={index}
                  cx={along(u, 0)}
                  cy={along(u, 1)}
                  r={13 - 4 * u}
                  fill={space.sun}
                  opacity={flowing * Math.min(1, u * 6, (1 - u) * 6)}
                />
              );
            })}
            <Reservoir fill={fill} seconds={seconds} />
            <SvgText x={TANK.x} y={TANK.bottom + 96} size="headline" fill={ink.accent} opacity={popOpacity(frame, startAt, 8)}>
              {thousands(years)}
            </SvgText>
            <SvgText x={TANK.x} y={TANK.bottom + 190} opacity={popOpacity(frame, startAt, 8)}>
              anos de Sol
            </SvgText>
          </Svg>
        </Push>
      </Push>
    </Frame>
  );
};

export const WhyNotStopScene: React.FC<SceneProps> = ({ scene, shots }) => (
  <>
    <Shot range={shots[0]} name="a alavanca volta para ligado">
      <BackOn pushAt={cue(scene, "Terra")} />
    </Shot>
    <Shot range={shots[1]} name="39.000 anos de Sol">
      <SunEnergy fullAt={cue(scene, "anos") - shots[1].from} />
    </Shot>
  </>
);
