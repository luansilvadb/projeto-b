import { useId } from "react";
import {
  AbsoluteFill,
  random,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Cassiopea } from "../../../art/Cassiopea";
import { Person } from "../../../art/Person";
import { taperPath, type Point } from "../../../art/shapes";
import { Leftovers } from "../../../components/Actors";
import { Camera, Layer, type CameraState } from "../../../components/Camera";
import { Grain } from "../../../components/Grain";
import { breath, wave } from "../../../components/Idle";
import { Place } from "../../../components/Place";
import { SvgLayer } from "../../../components/SvgLayer";
import {
  ink,
  jellyfish,
  lab,
  lagoon,
  researcher,
  savanna,
  sky,
} from "../palette";
import { HOLDING_CLIPBOARD, HeldClipboard } from "./Clipboard";
import {
  BENCH_Y,
  LabBench,
  LabWall,
  PLATFORM_Y,
  TANK,
  TANK_CENTER,
  Tank,
} from "./Laboratory";
import { type PulseRhythm, pulseCycles, pulseShape } from "./pulse";

/**
 * O que os planos de laboratório da água-viva dividem: o tanque sobre a
 * bancada, a janela que diz a hora, a pesquisadora com a prancheta dos dois
 * testes, a água-viva no lugar dela, os jatos e a luz apagada. De um plano
 * para o outro mudam a câmera, a hora e o que acontece dentro do vidro.
 */

/** Onde a pesquisadora fica: os pés dela, atrás da bancada, à esquerda do tanque. */
export const RESEARCHER = { x: 392, y: 966, height: 760 };
/** Largura do sino da água-viva dentro do tanque. */
export const JELLYFISH_WIDTH = 300;
// Do centro do desenho dela até onde o sino encosta no apoio, em fração da largura do sino.
const RESTING = 62 / 330;
/** O centro dela quando está pousada na plataforma, quando boia sem apoio e quando pousa no chão do tanque. */
export const RESTING_Y = PLATFORM_Y - JELLYFISH_WIDTH * RESTING;
export const FLOATING_Y = 520;
export const FLOOR_Y = BENCH_Y - 24 - JELLYFISH_WIDTH * RESTING;

/** A deriva de quem boia solta na água: sobe e desce e gira de leve. */
export const floating = (seconds: number) => ({
  y: 12 * wave(seconds, 2.6),
  tilt: 3 * wave(seconds, 3.4, 0.3),
});

// A janela fica à direita do tanque, no lugar da vidraria daquele canto da prateleira.
const WINDOW = { x: 1612, y: 36, width: 280, height: 470 };

type Hour = "day" | "night";

/** A janela do laboratório: é ela que diz se é dia ou noite lá fora. Vai sobre a parede. */
const LabWindow: React.FC<{ hour: Hour }> = ({ hour }) => {
  const id = useId();
  const { x, y, width, height } = WINDOW;
  const tones =
    hour === "day" ? [sky.day.top, sky.day.bottom] : savanna.night.sky;

  return (
    <SvgLayer>
      <defs>
        <linearGradient id={id} x1={0} y1={0} x2={0} y2={1}>
          <stop offset={0} stopColor={tones[0]} />
          <stop offset={1} stopColor={tones[1]} />
        </linearGradient>
      </defs>
      <rect
        x={x - 18}
        y={y - 18}
        width={width + 36}
        height={height + 36}
        rx={26}
        fill={lab.platform}
      />
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={12}
        fill={`url(#${id})`}
      />
      {hour === "day" ? (
        <>
          <circle
            cx={x + 150}
            cy={y + 130}
            r={92}
            fill={sky.day.cloud}
            opacity={0.45}
          />
          <circle cx={x + 150} cy={y + 130} r={62} fill={sky.day.sun} />
        </>
      ) : (
        <>
          <path
            transform={`translate(${x + 86} ${y + 70}) scale(1.25)`}
            d="M 62 10 A 42 42 0 1 0 90 62 A 34 34 0 1 1 62 10 Z"
            fill={ink.moon}
          />
          {[
            [60, 250, 7],
            [200, 300, 5],
            [120, 380, 6],
            [226, 60, 5],
          ].map(([sx, sy, r]) => (
            <circle key={sx} cx={x + sx} cy={y + sy} r={r} fill={ink.ring} />
          ))}
        </>
      )}
      {/* A travessa e o peitoril. */}
      <rect
        x={x}
        y={y + height * 0.56}
        width={width}
        height={14}
        fill={lab.platform}
      />
      <rect
        x={x - 34}
        y={y + height + 12}
        width={width + 68}
        height={22}
        rx={11}
        fill={lab.platformShade}
      />
    </SvgLayer>
  );
};

type LabResearcherProps = {
  /** O visto de cada linha da prancheta, de 0 a 1. */
  readonly checked?: readonly [number, number];
};

/** A pesquisadora atrás da bancada, com a prancheta dos dois testes virada para quem assiste. */
export const LabResearcher: React.FC<LabResearcherProps> = ({ checked }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <Place
      x={RESEARCHER.x}
      y={RESEARCHER.y}
      anchor="bottom"
      style={{ scale: `1 ${breath(frame / fps, "researcher")}` }}
    >
      <Person
        height={RESEARCHER.height}
        colors={researcher}
        bun
        plainFace
        {...HOLDING_CLIPBOARD}
        held={<HeldClipboard checked={checked} />}
        heldInFront
      />
    </Place>
  );
};

type TankJellyfishProps = {
  /** O centro dela, em pixels do cenário. Padrão: pousada na plataforma. */
  readonly x?: number;
  readonly y?: number;
  /** Inclinação do corpo, em graus. */
  readonly tilt?: number;
  readonly droop?: number;
  /** Ritmo do pulso ao longo do plano. */
  readonly rhythm: readonly PulseRhythm[];
};

/** A água-viva dentro do tanque: sempre nas cores de dia, que é como o laboratório a vê. */
export const TankJellyfish: React.FC<TankJellyfishProps> = ({
  x = TANK_CENTER,
  y = RESTING_Y,
  tilt = 0,
  droop = 0,
  rhythm,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <Place x={x} y={y} style={{ rotate: `${tilt}deg` }}>
      <Cassiopea
        width={JELLYFISH_WIDTH}
        colors={jellyfish.day}
        droop={droop}
        pulse={pulseShape(pulseCycles(frame, fps, rhythm))}
        sway={0.3 * wave(frame / fps, 5)}
      />
    </Place>
  );
};

// Os jatos saem da parede esquerda do vidro e chegam à borda do sino.
const JET = {
  from: TANK.x + 14,
  to: TANK_CENTER - 170,
  dash: 36,
  gap: 26,
  speed: 16,
};
const JET_HEIGHTS = [RESTING_Y - 70, RESTING_Y - 30, RESTING_Y + 10];

type JetsProps = {
  /** Quanto as correntes já avançaram, de 0 (na parede do vidro) a 1 (nela). */
  readonly reach: number;
};

/** Os jatos de água que não a deixam descansar, com bolhas onde batem. Vai dentro do tanque. */
export const Jets: React.FC<JetsProps> = ({ reach }) => {
  const frame = useCurrentFrame();
  const id = useId();
  if (reach <= 0) {
    return null;
  }
  return (
    <SvgLayer>
      <defs>
        <linearGradient id={id} x1={0} y1={0} x2={1} y2={0}>
          <stop offset={0} stopColor={ink.ring} stopOpacity={0.15} />
          <stop offset={1} stopColor={ink.ring} stopOpacity={0.6} />
        </linearGradient>
      </defs>
      {/* O bico de cada jato, preso ao vidro. */}
      {JET_HEIGHTS.map((y) => (
        <rect
          key={y}
          x={JET.from - 6}
          y={y - 16}
          width={34}
          height={32}
          rx={10}
          fill={lab.platformShade}
        />
      ))}
      {JET_HEIGHTS.map((y, index) => {
        const tipX = JET.from + (JET.to - index * 14 - JET.from) * reach;
        const to: Point = [tipX, y - 6 + index * 6];
        // A corrente ondula um pouco, como água e não como um cano.
        const bend = y - 8 + 6 * Math.sin(frame / 3 + index);
        return (
          <g key={y}>
            <path
              d={taperPath(
                [JET.from + 20, y],
                [(JET.from + to[0]) / 2, bend],
                to,
                8,
                30,
              )}
              fill={`url(#${id})`}
            />
            <ellipse
              cx={to[0]}
              cy={to[1]}
              rx={10}
              ry={16}
              fill={ink.ring}
              opacity={0.6}
            />
            <line
              x1={JET.from + 34}
              x2={to[0] - 16}
              y1={y - 2}
              y2={to[1]}
              stroke={ink.ring}
              strokeWidth={5}
              strokeLinecap="round"
              strokeDasharray={`${JET.dash} ${JET.gap}`}
              strokeDashoffset={-frame * JET.speed}
              opacity={0.9}
            />
            {reach >= 1
              ? Array.from({ length: 5 }, (_, bubble) => {
                  const pick = (trait: string) =>
                    random(`jet-${index}-${trait}-${bubble}`);
                  return (
                    <circle
                      key={bubble}
                      cx={to[0] - 40 + pick("x") * 100}
                      cy={
                        to[1] -
                        30 +
                        pick("y") * 60 -
                        ((frame * (0.6 + pick("rise"))) % 40)
                      }
                      r={4 + pick("size") * 6}
                      fill="none"
                      stroke={ink.ring}
                      strokeWidth={4}
                      opacity={0.8}
                    />
                  );
                })
              : null}
          </g>
        );
      })}
    </SvgLayer>
  );
};

type TankShotProps = {
  readonly camera: CameraState;
  /** A hora lá fora, na janela. */
  readonly hour?: Hour;
  /**
   * A luz do laboratório apagada: tudo mergulha no índigo, menos o tanque.
   * O valor é o ponto do quadro, em fração, em que o tanque aceso fica.
   */
  readonly lightsOff?: readonly [number, number];
  /** A pesquisadora ao lado do tanque, com os vistos da prancheta; sem valor, ela não está no plano. */
  readonly researcher?: readonly [number, number];
  /** O x do centro da plataforma; sem valor, o tanque não tem plataforma. */
  readonly platform?: number;
  /** O que está dentro da água, em pixels do cenário. */
  readonly children?: React.ReactNode;
};

/**
 * O molde de todo plano do laboratório: parede, janela, pesquisadora, bancada
 * e tanque, vistos pela câmera. O que fica por cima do quadro (cronômetro,
 * onomatopeia) é a cena quem põe, depois dele.
 */
export const TankShot: React.FC<TankShotProps> = ({
  camera,
  hour = "night",
  lightsOff,
  researcher: checked,
  platform,
  children,
}) => (
  <AbsoluteFill>
    <Camera {...camera}>
      <Layer depth={1}>
        <LabWall />
        <LabWindow hour={hour} />
        {checked ? <LabResearcher checked={checked} /> : null}
        <LabBench />
        <Tank platform={platform}>{children}</Tank>
        <Leftovers />
      </Layer>
    </Camera>
    {lightsOff ? (
      <AbsoluteFill
        style={{
          // O tanque fica aceso; em volta, o laboratório mergulha no índigo da noite.
          background: `radial-gradient(ellipse 40% 52% at ${lightsOff[0] * 100}% ${lightsOff[1] * 100}%, ${lab.glass} 55%, ${lagoon.night.water[1]})`,
          opacity: 0.88,
          mixBlendMode: "multiply",
        }}
      />
    ) : null}
    <Grain />
  </AbsoluteFill>
);
