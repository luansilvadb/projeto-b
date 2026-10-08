import { useId } from "react";
import {
  AbsoluteFill,
  interpolateColors,
  random,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Cassiopea, type CassiopeaColors } from "../../../art/Cassiopea";
import { Person } from "../../../art/Person";
import { taperPath, type Point } from "../../../art/shapes";
import { Leftovers } from "../../../components/Actors";
import {
  Build,
  Camera,
  Layer,
  Wall,
  useBuild,
  type CameraState,
} from "../../../components/Camera";
import { Grain } from "../../../components/Grain";
import { blink, breath, wave } from "../../../components/Idle";
import { Place } from "../../../components/Place";
import { SvgLayer } from "../../../components/SvgLayer";
import {
  ink,
  jellyfish,
  lab,
  lagoon,
  researcher,
  daylightTones,
  sky,
} from "../palette";
import { HeldClipboard, holdingClipboard } from "./Clipboard";
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

// O sol e a lua da janela: onde ficam no vidro, e quanto cada um desce para sair por baixo dele.
const WINDOW_ORB = { x: 150, y: 130, sunFalls: 500, moonFalls: 900 };

/**
 * A janela do laboratório: é ela que diz se é dia ou noite lá fora. Vai sobre
 * a parede. `daylight` vai de 0 (noite) a 1 (dia), e o caminho entre os dois é
 * o amanhecer: o céu muda de cor, a lua desce para fora do vidro, as estrelas
 * somem e o sol sobe.
 */
const LabWindow: React.FC<{ daylight: number; clock: number }> = ({
  daylight,
  clock,
}) => {
  const id = useId();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // A pausa viva da janela: o halo do sol e o da lua respiram, e as estrelas cintilam.
  const seconds = (clock + frame) / fps;
  const halo = 0.5 + 0.5 * wave(seconds, 3.2);
  const { x, y, width, height } = WINDOW;
  const night = daylightTones.night.sky;
  const tones = [sky.day.top, sky.day.bottom].map((tone, index) =>
    interpolateColors(daylight, [0, 1], [night[index], tone]),
  );
  const sunY = y + WINDOW_ORB.y + WINDOW_ORB.sunFalls * (1 - daylight);
  const moonFall = WINDOW_ORB.moonFalls * daylight;
  const stars = Math.max(0, 1 - 2 * daylight);

  return (
    <SvgLayer>
      <defs>
        <linearGradient id={id} x1={0} y1={0} x2={0} y2={1}>
          <stop offset={0} stopColor={tones[0]} />
          <stop offset={1} stopColor={tones[1]} />
        </linearGradient>
        <clipPath id={`${id}-pane`}>
          <rect x={x} y={y} width={width} height={height} rx={12} />
        </clipPath>
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
      {/* O astro só existe dentro do vidro: sai e entra por baixo dele. */}
      <g clipPath={`url(#${id}-pane)`}>
        {daylight > 0 ? (
          <>
            <circle
              cx={x + WINDOW_ORB.x}
              cy={sunY}
              r={92 + 8 * halo}
              fill={sky.day.cloud}
              opacity={0.45 - 0.1 * halo}
            />
            <circle cx={x + WINDOW_ORB.x} cy={sunY} r={62} fill={sky.day.sun} />
          </>
        ) : null}
        {daylight < 1 ? (
          <>
            <circle
              cx={x + WINDOW_ORB.x}
              cy={y + WINDOW_ORB.y + moonFall}
              r={84 + 10 * halo}
              fill={ink.moon}
              opacity={0.1 + 0.08 * halo}
            />
            <path
              transform={`translate(${x + 86} ${y + 70 + moonFall}) scale(1.25)`}
              d="M 62 10 A 42 42 0 1 0 90 62 A 34 34 0 1 1 62 10 Z"
              fill={ink.moon}
            />
            {[
              [60, 250, 7],
              [200, 300, 5],
              [120, 380, 6],
              [226, 60, 5],
            ].map(([sx, sy, r], star) => (
              <circle
                key={sx}
                cx={x + sx}
                cy={y + sy}
                r={r * stars}
                fill={ink.ring}
                opacity={
                  0.65 + 0.35 * wave(seconds, 1.9 + star * 0.4, star / 4)
                }
              />
            ))}
          </>
        ) : null}
      </g>
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

/** O que a pesquisadora faz com a prancheta num plano. Sem valores, ela a segura erguida, com as duas linhas escritas. */
type Board = {
  /** Quanto ela já ergueu a prancheta, de 0 (baixa, atrás da bancada) a 1. */
  readonly raised?: number;
  /** Quanto de cada linha já se escreveu, de 0 a 1. */
  readonly written?: readonly [number, number];
  /**
   * Quanto ela já saiu de cena, de 0 a 1: encolhe nos próprios pés, como todo
   * elenco do palco, e de mãos vazias, porque a prancheta ficou com a cena.
   */
  readonly gone?: number;
  /**
   * Quanto ela já chegou, de 0 a 1, no plano em que entra com o cenário já no
   * palco: cresce dos próprios pés, com a prancheta na mão. Por padrão, inteira.
   */
  readonly arrived?: number;
};

type LabResearcherProps = Board & {
  /** O visto de cada linha da prancheta, de 0 a 1. */
  readonly checked?: readonly [number, number];
  readonly clock?: number;
};

/** A pesquisadora atrás da bancada, com a prancheta dos dois testes virada para quem assiste. */
const LabResearcher: React.FC<LabResearcherProps> = ({
  checked,
  raised = 1,
  written,
  gone = 0,
  arrived = 1,
  clock = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const seconds = (clock + frame) / fps;
  const size = (1 - gone) * arrived;
  if (size <= 0) {
    return null;
  }

  return (
    <Place
      x={RESEARCHER.x}
      y={RESEARCHER.y}
      anchor="bottom"
      style={{
        scale: `${size} ${size * breath(seconds, "researcher")}`,
      }}
    >
      <Person
        height={RESEARCHER.height}
        colors={researcher}
        bun
        plainFace
        blink={blink(seconds, "researcher")}
        {...holdingClipboard(raised)}
        held={
          gone > 0 ? undefined : (
            <HeldClipboard
              checked={checked}
              raised={raised}
              written={written}
            />
          )
        }
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
  /**
   * Quadros a somar ao relógio do plano, e pulsos a somar à contagem (ver
   * `settledPhase`): com o quadro do vídeo em que o plano começa, o ritmo é
   * contado no relógio do vídeo e o sino não salta na troca de plano.
   */
  readonly clock?: number;
  readonly phase?: number;
};

/** A água-viva dentro do tanque: sempre nas cores de dia, que é como o laboratório a vê. */
export const TankJellyfish: React.FC<TankJellyfishProps> = ({
  x = TANK_CENTER,
  y = RESTING_Y,
  tilt = 0,
  droop = 0,
  rhythm,
  clock = 0,
  phase = 0,
}) => {
  const frame = clock + useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <Place x={x} y={y} style={{ rotate: `${tilt}deg` }}>
      <Cassiopea
        width={JELLYFISH_WIDTH}
        colors={jellyfish.day}
        droop={droop}
        pulse={pulseShape(phase + pulseCycles(frame, fps, rhythm))}
        sway={0.3 * wave(frame / fps, 5)}
      />
    </Place>
  );
};

type LooseJellyfishProps = {
  /** O centro dela e a largura do sino, em pixels do quadro. */
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly colors?: CassiopeaColors;
  readonly droop?: number;
  /** A contagem de pulsos e o instante, em segundos, no relógio do vídeo. */
  readonly cycles: number;
  readonly seconds: number;
  /** Quanto a corrente leva os braços de um lado para o outro. */
  readonly sway?: number;
};

/**
 * A água-viva solta do cenário, em pixels do quadro: para a troca em que ela
 * fica na tela enquanto o cenário sai de baixo dela e o seguinte sobe em
 * volta. Quem a desenha dá o lugar e o tamanho que ela tinha no cenário, visto
 * pela câmera, e ela não entra nem sai com o palco.
 */
export const LooseJellyfish: React.FC<LooseJellyfishProps> = ({
  x,
  y,
  width,
  colors = jellyfish.day,
  droop = 0,
  cycles,
  seconds,
  sway = 0.3,
}) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      translate: "-50% -50%",
    }}
  >
    <Cassiopea
      width={width}
      colors={colors}
      droop={droop}
      pulse={pulseShape(cycles)}
      sway={sway * wave(seconds, 5)}
    />
  </div>
);

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
   * A hora a caminho de outra, de 0 (noite) a 1 (dia): o amanhecer visto na
   * janela, sem trocar de pintura. Vale acima de `hour`.
   */
  readonly daylight?: number;
  /**
   * O tanque fora do lugar dele na bancada: quanto está deslocado, em pixels
   * do cenário, e a escala, em volta do pé dele. É o tanque que já estava na
   * tela no plano anterior, noutro tamanho: ele não sobe com o laboratório, e
   * vai dali até o lugar dele enquanto a bancada chega por baixo.
   */
  readonly tankAt?: {
    readonly x: number;
    readonly y: number;
    readonly scale: number;
  };
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
  /** O que a pesquisadora faz com a prancheta; vale quando ela está no plano. */
  readonly board?: Board;
  /**
   * O quadro do vídeo em que o plano começa: a janela, as bolhas e a
   * respiração dela passam a contar no relógio do vídeo e não saltam na troca.
   */
  readonly clock?: number;
  /** Quanto a luz está apagada, de 0 a 1, quando há `lightsOff`. Por padrão, toda. */
  readonly dark?: number;
};

/**
 * O molde de todo plano do laboratório: parede, janela, pesquisadora, bancada
 * e tanque, vistos pela câmera. O que fica por cima do quadro (cronômetro,
 * onomatopeia) é a cena quem põe, depois dele.
 */
export const TankShot: React.FC<TankShotProps> = ({
  camera,
  hour = "night",
  daylight = hour === "day" ? 1 : 0,
  tankAt,
  lightsOff,
  researcher: checked,
  platform,
  children,
  board,
  clock = 0,
  dark = 1,
}) => {
  const tank = (
    <Tank platform={platform} clock={clock}>
      {children}
    </Tank>
  );
  return (
    <AbsoluteFill>
      <Camera {...camera}>
        <Layer depth={1}>
          <LabWall />
          <LabWindow daylight={daylight} clock={clock} />
          {checked ? (
            <LabResearcher checked={checked} clock={clock} {...board} />
          ) : null}
          <LabBench />
          {tankAt ? (
            <InPlace>
              <AbsoluteFill
                style={{
                  transformOrigin: `${TANK_CENTER}px ${BENCH_Y}px`,
                  translate: `${tankAt.x}px ${tankAt.y}px`,
                  scale: `${tankAt.scale}`,
                }}
              >
                {tank}
              </AbsoluteFill>
            </InPlace>
          ) : (
            tank
          )}
          <Leftovers />
        </Layer>
      </Camera>
      {lightsOff ? (
        <AbsoluteFill
          style={{
            // O tanque fica aceso; em volta, o laboratório mergulha no índigo da noite.
            background: `radial-gradient(ellipse 40% 52% at ${lightsOff[0] * 100}% ${lightsOff[1] * 100}%, ${lab.glass} 55%, ${lagoon.night.water[1]})`,
            opacity: 0.88 * dark,
            mixBlendMode: "multiply",
          }}
        />
      ) : null}
      <Grain />
    </AbsoluteFill>
  );
};

/**
 * O que já estava no palco quando o cenário chega: não sobe com a camada em
 * que está. É o `Wall` do cenário (que fica no lugar enquanto a camada sobe)
 * sem a opacidade de quem ainda toma a cor.
 */
const InPlace: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const built = useBuild();
  return (
    // Sem nome de plano: este `Build` só muda a luz do que está dentro, e não é o cenário do palco.
    <Build {...built} lit={1} shot={null} heir={null} tracked={false}>
      <Wall>{children}</Wall>
    </Build>
  );
};
