import { useId } from "react";
import { random } from "remotion";
import { normalOnCurve, pointOnCurve, taperPath, type Point } from "./shapes";

/** Tons de uma franja: três tons do babado, acento e brilho. */
type FrillTones = readonly [string, string, string, string, string];

export type CassiopeaColors = {
  /** O sino, por fora, e a sombra e a luz rebatida nele. */
  readonly dome: string;
  readonly domeShade: string;
  readonly bounce: string;
  /** A borda em lóbulos, a parte de trás dela e os traços claros. */
  readonly rim: string;
  readonly rimBack: string;
  readonly marks: string;
  /** A boca do sino, côncava: sombra em cima, luz embaixo, canais e centro. */
  readonly inner: string;
  readonly innerLight: string;
  readonly canal: string;
  readonly core: string;
  readonly stalk: string;
  readonly stalkShade: string;
  readonly stalkBack: string;
  readonly stalkBackShade: string;
  readonly frills: FrillTones;
  readonly frillsBack: FrillTones;
  /** Apêndice em folha: corpo e nervura. */
  readonly paddle: readonly [string, string];
  readonly rimLight: string;
  /** Cor do halo das franjas quando elas brilham no escuro. */
  readonly glow: string | null;
  readonly nerves: string;
};

type CassiopeaProps = {
  /** Largura do sino, de borda a borda, em pixels do quadro. */
  readonly width: number;
  readonly colors: CassiopeaColors;
  /** 0 é o sino relaxado; 1, contraído no auge do pulso. */
  readonly pulse?: number;
  /** Quanto os braços caem: 0 acordada, 1 dormindo. */
  readonly droop?: number;
  /** Para que lado a corrente leva os braços, de -1 a 1. */
  readonly sway?: number;
  /** Rede de nervos acesa por cima do corpo, de 0 a 1. O corpo fica translúcido junto. */
  readonly nerves?: number;
};

// O sino, de lado: a borda fica em cima e a cúpula desce até o chão.
const RIM = { rx: 330, ry: 66, y: -92 };
const FLOOR = 124;
const LAPPETS = 22;
const CANALS = 5;
// Margem do desenho em volta do centro: os braços sobem, a sombra desce.
const VIEW = { x: -480, y: -520, width: 960, height: 1040 };

// Cada braço: x da base, e x e altura da ponta acima da borda.
// Os de trás são menores e ficam por baixo.
const BACK_ARMS = [
  [-90, -250, 260],
  [-30, -95, 330],
  [30, 90, 340],
  [90, 245, 270],
] as const;
const FRONT_ARMS = [
  [-120, -360, 170],
  [-45, -180, 280],
  [45, 170, 290],
  [120, 355, 180],
] as const;
// Quantos babados cada braço leva, da metade até a ponta.
const RUFFLES = 9;

type ArmStyle = {
  readonly widths: readonly [number, number];
  readonly tones: FrillTones;
  readonly stalk: string;
  readonly shade: string;
  readonly glow: string | null;
};

type Pose = {
  readonly droop: number;
  readonly sway: number;
  /** A altura da borda, de onde os braços saem. */
  readonly rimY: number;
};

/** A curva de um braço na pose pedida: mole, ele pende para fora; dormindo, pende mais. */
const armCurve = (
  baseX: number,
  tipX: number,
  rise: number,
  { droop, sway, rimY }: Pose,
) => {
  const base: Point = [baseX, rimY - 6];
  const end: Point = [
    tipX * (1 + 0.12 * droop) + sway * 22 * (rise / 260),
    rimY - rise * (1 - 0.45 * droop),
  ];
  // O braço sobe quase reto e só então abre: é o que o faz parecer mole, e não um galho.
  const control: Point = [
    base[0] + (end[0] - base[0]) * 0.2 + sway * 10,
    rimY - rise * (1.05 - 0.3 * droop),
  ];
  return { base, end, control };
};

/**
 * Um braço oral: um talo mole e, da metade para a ponta, babados translúcidos
 * dos dois lados, que diminuem até a ponta. É o babado, e não o talo, que se vê.
 */
const arm = (
  key: string,
  [baseX, tipX, rise]: readonly [number, number, number],
  style: ArmStyle,
  pose: Pose,
  glowId: string,
) => {
  const [startWidth, endWidth] = style.widths;
  const { base, end, control } = armCurve(baseX, tipX, rise, pose);
  const size = startWidth / 40;

  const ruffles = Array.from({ length: RUFFLES }, (_, index) => {
    const t = 0.42 + (index / (RUFFLES - 1)) * 0.58;
    const [x, y] = pointOnCurve(base, control, end, t);
    const [nx, ny] = normalOnCurve(base, control, end, t);
    const side = index % 2 === 0 ? 1 : -1;
    const radius =
      (40 - 16 * t) * size * (0.9 + 0.2 * random(`${key}-${index}`));
    return {
      x: x + nx * side * radius * 0.55,
      y: y + ny * side * radius * 0.55,
      radius,
      tone: style.tones[index % 3],
    };
  });

  return (
    <g key={key}>
      {style.glow ? (
        <circle
          cx={end[0]}
          cy={end[1]}
          r={95 * size}
          fill={`url(#${glowId})`}
        />
      ) : null}
      <path
        d={taperPath(base, control, end, startWidth, endWidth)}
        fill={style.stalk}
      />
      {ruffles.map((ruffle, index) => (
        <ellipse
          key={`shade-${index}`}
          cx={ruffle.x + ruffle.radius * 0.16}
          cy={ruffle.y + ruffle.radius * 0.26}
          rx={ruffle.radius}
          ry={ruffle.radius * 0.82}
          fill={style.shade}
          opacity={0.7}
        />
      ))}
      {ruffles.map((ruffle, index) => (
        <ellipse
          key={`ruffle-${index}`}
          cx={ruffle.x}
          cy={ruffle.y}
          rx={ruffle.radius}
          ry={ruffle.radius * 0.82}
          fill={ruffle.tone}
          opacity={0.92}
        />
      ))}
      {ruffles
        .filter((_, index) => index % 3 === 1)
        .map((ruffle, index) => (
          <circle
            key={`light-${index}`}
            cx={ruffle.x - ruffle.radius * 0.3}
            cy={ruffle.y - ruffle.radius * 0.3}
            r={ruffle.radius * 0.28}
            fill={style.tones[4]}
            opacity={0.85}
          />
        ))}
    </g>
  );
};

/**
 * Cassiopea, a água-viva que vive pousada de cabeça para baixo: o sino, uma
 * cúpula translúcida de borda em lóbulos, fica no chão com a boca para cima, e
 * dela sobem os oito braços moles e franjados. É a mesma forma de uma
 * água-viva comum, virada: de cabeça para cima, ela nada. O centro do desenho
 * fica acima do chão, onde o sino pousa.
 */
export const Cassiopea: React.FC<CassiopeaProps> = ({
  width,
  colors,
  pulse = 0,
  droop = 0,
  sway = 0,
  nerves = 0,
}) => {
  const id = useId();
  const glowId = `${id}-glow`;
  const domeId = `${id}-dome`;
  const sheenId = `${id}-sheen`;
  const scale = width / (RIM.rx * 2);
  // No pulso, a borda fecha e sobe: é o sino se contraindo, como o de qualquer água-viva.
  const rx = RIM.rx * (1 - 0.13 * pulse);
  const ry = RIM.ry * (1 - 0.1 * pulse);
  const rimY = RIM.y - 20 * pulse;
  const pose: Pose = { droop, sway, rimY };
  const depth = FLOOR - rimY;
  const domePath = `M${-rx},${rimY} C${-rx * 1.03},${rimY + depth * 0.78} ${-rx * 0.56},${FLOOR} 0,${FLOOR} C${rx * 0.56},${FLOOR} ${rx * 1.03},${rimY + depth * 0.78} ${rx},${rimY} Z`;

  const lappets = Array.from({ length: LAPPETS }, (_, index) => {
    const angle = (index / LAPPETS) * Math.PI * 2;
    return {
      x: Math.cos(angle) * rx,
      y: rimY + Math.sin(angle) * ry,
      front: Math.sin(angle) > -0.1,
    };
  });

  const armStyle = (back: boolean): ArmStyle => ({
    widths: back ? [30, 10] : [40, 14],
    tones: back ? colors.frillsBack : colors.frills,
    stalk: back ? colors.stalkBack : colors.stalk,
    shade: back ? colors.stalkBackShade : colors.stalkShade,
    glow: back ? null : colors.glow,
  });

  return (
    <svg
      width={VIEW.width * scale}
      height={VIEW.height * scale}
      viewBox={`${VIEW.x} ${VIEW.y} ${VIEW.width} ${VIEW.height}`}
      overflow="visible"
    >
      <defs>
        <clipPath id={domeId}>
          <path d={domePath} />
        </clipPath>
        <linearGradient id={sheenId} x1={0} y1={0} x2={0} y2={1}>
          <stop offset={0} stopColor={colors.innerLight} stopOpacity={0.75} />
          <stop offset={1} stopColor={colors.innerLight} stopOpacity={0} />
        </linearGradient>
        {colors.glow ? (
          <radialGradient id={glowId}>
            <stop offset={0} stopColor={colors.glow} stopOpacity={0.5} />
            <stop offset={1} stopColor={colors.glow} stopOpacity={0} />
          </radialGradient>
        ) : null}
      </defs>

      <g opacity={1 - 0.45 * nerves}>
        {/* Os lóbulos de trás da borda, por baixo de tudo. */}
        {lappets
          .filter((lappet) => !lappet.front)
          .map((lappet, index) => (
            <circle
              key={index}
              cx={lappet.x}
              cy={lappet.y}
              r={24}
              fill={colors.rimBack}
            />
          ))}

        {/* A cúpula: translúcida, deixa ver o fundo e os canais que descem da borda. */}
        <path d={domePath} fill={colors.dome} opacity={0.72} />
        <g clipPath={`url(#${domeId})`}>
          <rect
            x={-rx}
            y={rimY}
            width={rx * 2}
            height={depth * 0.6}
            fill={`url(#${sheenId})`}
          />
          <path
            d={`M${-rx},${FLOOR - depth * 0.3} C${-rx * 0.5},${FLOOR + 6} ${rx * 0.5},${FLOOR + 6} ${rx},${FLOOR - depth * 0.3} L${rx},${FLOOR + 10} L${-rx},${FLOOR + 10} Z`}
            fill={colors.domeShade}
            opacity={0.8}
          />
          {Array.from({ length: CANALS }, (_, index) => {
            const across = (index / (CANALS - 1)) * 2 - 1;
            return (
              <path
                key={index}
                d={`M${across * rx * 0.86},${rimY + ry * 0.6} Q${across * rx * 0.8},${rimY + depth * 0.7} ${across * rx * 0.34},${FLOOR - 8}`}
                fill="none"
                stroke={colors.canal}
                strokeWidth={5}
                strokeLinecap="round"
                opacity={0.5}
              />
            );
          })}
          <ellipse
            cx={-rx * 0.38}
            cy={rimY + depth * 0.5}
            rx={rx * 0.14}
            ry={depth * 0.22}
            fill={colors.bounce}
            opacity={0.35}
            transform={`rotate(18 ${-rx * 0.38} ${rimY + depth * 0.5})`}
          />
        </g>

        {/* A boca do sino, vista um pouco de cima. */}
        <ellipse cy={rimY} rx={rx} ry={ry} fill={colors.rim} />
        <ellipse
          cy={rimY + 2}
          rx={rx * 0.84}
          ry={ry * 0.74}
          fill={colors.inner}
        />
        <path
          d={`M${-rx * 0.8},${rimY + 6} C${-rx * 0.5},${rimY + ry * 0.82} ${rx * 0.5},${rimY + ry * 0.82} ${rx * 0.8},${rimY + 6} C${rx * 0.5},${rimY + ry * 0.5} ${-rx * 0.5},${rimY + ry * 0.5} ${-rx * 0.8},${rimY + 6} Z`}
          fill={colors.innerLight}
        />
        <ellipse
          cy={rimY - 2}
          rx={rx * 0.4}
          ry={ry * 0.42}
          fill={colors.core}
        />

        <g opacity={0.92}>
          {BACK_ARMS.map((shape, index) =>
            arm(`${id}-back-${index}`, shape, armStyle(true), pose, glowId),
          )}
        </g>
        {FRONT_ARMS.map((shape, index) =>
          arm(`${id}-front-${index}`, shape, armStyle(false), pose, glowId),
        )}

        {/* Os lóbulos da frente da borda, com os traços claros: a marca do bicho. */}
        {lappets
          .filter((lappet) => lappet.front)
          .map((lappet, index) => (
            <g key={index}>
              <circle
                cx={lappet.x}
                cy={lappet.y + 6}
                r={28}
                fill={colors.rim}
              />
              <line
                x1={lappet.x * 0.97}
                y1={lappet.y}
                x2={lappet.x * 1.03}
                y2={lappet.y + 22}
                stroke={colors.marks}
                strokeWidth={9}
                strokeLinecap="round"
                opacity={0.95}
              />
            </g>
          ))}
        {/* Brilho na borda voltada para a luz. */}
        <path
          d={`M${-rx * 0.94},${rimY + ry * 0.3} C${-rx * 0.7},${rimY + ry * 0.86} ${-rx * 0.3},${rimY + ry} ${rx * 0.02},${rimY + ry * 1.02}`}
          fill="none"
          stroke={colors.rimLight}
          strokeWidth={7}
          strokeLinecap="round"
          opacity={0.45}
        />
      </g>

      {nerves > 0 ? (
        <g
          fill="none"
          stroke={colors.nerves}
          strokeLinecap="round"
          opacity={nerves}
        >
          {/* Rede sem centro: um anel na borda, fios que descem pela cúpula e um fio por braço. */}
          <ellipse cy={rimY} rx={rx * 0.93} ry={ry * 0.9} strokeWidth={5} />
          {Array.from({ length: CANALS }, (_, index) => {
            const across = (index / (CANALS - 1)) * 2 - 1;
            return (
              <path
                key={index}
                d={`M${across * rx * 0.86},${rimY + ry * 0.6} Q${across * rx * 0.8},${rimY + depth * 0.7} ${across * rx * 0.34},${FLOOR - 8}`}
                strokeWidth={3.5}
              />
            );
          })}
          {[...BACK_ARMS, ...FRONT_ARMS].map(([baseX, tipX, rise], index) => {
            const { base, end, control } = armCurve(baseX, tipX, rise, pose);
            return (
              <g key={index}>
                <path
                  d={`M${base[0]},${base[1]} Q${control[0]},${control[1]} ${end[0]},${end[1]}`}
                  strokeWidth={5}
                />
                <circle
                  cx={end[0]}
                  cy={end[1]}
                  r={9}
                  fill={colors.nerves}
                  stroke="none"
                />
              </g>
            );
          })}
        </g>
      ) : null}
    </svg>
  );
};
