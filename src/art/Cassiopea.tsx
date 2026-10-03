import { useId } from "react";
import { random } from "remotion";
import { normalOnCurve, pointOnCurve, taperPath, type Point } from "./shapes";

/** Tons de um cacho: centro, dois tons do anel, acento e brilho. */
type FrillTones = readonly [string, string, string, string, string];

export type CassiopeaColors = {
  /** O lado de baixo do sino, que pousa no chão, e a sombra e a luz rebatida nele. */
  readonly dome: string;
  readonly domeShade: string;
  readonly bounce: string;
  /** A borda em lóbulos, a parte de trás dela e os traços claros. */
  readonly rim: string;
  readonly rimBack: string;
  readonly marks: string;
  /** O disco de dentro, côncavo: sombra em cima, luz embaixo, canais e centro. */
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
  /** Cor do halo dos cachos quando eles brilham no escuro. */
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

const RIM = { rx: 330, ry: 92 };
const DOME = 124;
const LAPPETS = 26;
const CANALS = 18;
// Margem do desenho em volta do centro da borda: os braços sobem, a sombra desce.
const VIEW = { x: -480, y: -520, width: 960, height: 1040 };

// Cada braço: x da base, x e y da ponta, em relação ao centro da borda.
// Os de trás são menores e ficam por baixo; os de fora, na frente, levam o apêndice em folha.
const BACK_ARMS = [
  [-70, -250, -330],
  [-25, -95, -410],
  [25, 85, -420],
  [70, 245, -340],
] as const;
const FRONT_ARMS = [
  [-98, -400, -170],
  [-36, -185, -300],
  [36, 170, -310],
  [98, 395, -185],
] as const;
// Em que ponto do braço nasce cada galho.
const BRANCHES = [0.46, 0.66, 0.84];
const PADDLE_BRANCH = 0.66;

type ArmStyle = {
  readonly widths: readonly [number, number];
  readonly tones: FrillTones;
  readonly stalk: string;
  readonly shade: string;
  readonly paddle: readonly [string, string] | null;
  readonly glow: string | null;
};

type Pose = {
  readonly droop: number;
  readonly sway: number;
  readonly lift: number;
};

/** A curva de um braço na pose pedida: dormindo, a ponta desce e abre para o lado. */
const armCurve = (base: Point, tip: Point, { droop, sway, lift }: Pose) => {
  const end: Point = [
    tip[0] * (1 + 0.1 * droop) + sway * 16 * (Math.abs(tip[1]) / 420),
    tip[1] * (1 - 0.3 * droop) * lift,
  ];
  const control: Point = [
    base[0] + (end[0] - base[0]) * 0.12,
    base[1] + (end[1] - base[1]) * 0.86,
  ];
  return { end, control };
};

/** Um cacho: uma bola grande cercada de menores, com a sombra do conjunto deslocada por baixo. */
const floret = (
  key: string,
  [x, y]: Point,
  size: number,
  tones: FrillTones,
  shade: string,
) => {
  const turn = random(`${key}-turn`) * Math.PI;
  const balls = [
    { x, y, r: size, tone: tones[0] },
    ...Array.from({ length: 6 }, (_, index) => {
      const angle = turn + (index / 6) * Math.PI * 2;
      const distance = size * (0.85 + random(`${key}-far-${index}`) * 0.2);
      return {
        x: x + Math.cos(angle) * distance,
        y: y + Math.sin(angle) * distance * 0.85,
        r: size * (0.48 + random(`${key}-size-${index}`) * 0.2),
        tone: tones[1 + (index % 2)],
      };
    }),
  ];

  return (
    <g key={key}>
      {balls.map((ball, index) => (
        <circle
          key={`shade-${index}`}
          cx={ball.x + size * 0.14}
          cy={ball.y + size * 0.24}
          r={ball.r}
          fill={shade}
        />
      ))}
      {balls.map((ball, index) => (
        <circle
          key={`ball-${index}`}
          cx={ball.x}
          cy={ball.y}
          r={ball.r}
          fill={ball.tone}
        />
      ))}
      <circle
        cx={x - size * 0.3}
        cy={y - size * 0.32}
        r={size * 0.3}
        fill={tones[4]}
        opacity={0.9}
      />
      <circle
        cx={x + size * 0.55}
        cy={y + size * 0.3}
        r={size * 0.2}
        fill={tones[3]}
      />
      <circle
        cx={x - size * 0.75}
        cy={y + size * 0.45}
        r={size * 0.16}
        fill={tones[3]}
      />
    </g>
  );
};

/** Um braço com os galhos, os cachos nas pontas e, se houver, o halo e o apêndice em folha. */
const arm = (
  key: string,
  base: Point,
  tip: Point,
  style: ArmStyle,
  pose: Pose,
  glowId: string,
) => {
  const [startWidth, endWidth] = style.widths;
  const { end, control } = armCurve(base, tip, pose);
  // Tudo no braço é proporcional à largura dele: os de trás saem menores.
  const size = startWidth / 46;
  const shadeFrom: Point = [base[0] + startWidth * 0.22, base[1]];
  const shadeControl: Point = [control[0] + startWidth * 0.2, control[1]];
  const shadeTo: Point = [end[0] + endWidth * 0.2, end[1]];

  const stalks = [
    <path
      key="stalk"
      d={taperPath(base, control, end, startWidth, endWidth)}
      fill={style.stalk}
    />,
    // Faixa de sombra de um lado do braço: dá volume sem degradê.
    <path
      key="shade"
      d={taperPath(
        shadeFrom,
        shadeControl,
        shadeTo,
        startWidth * 0.38,
        endWidth * 0.3,
      )}
      fill={style.shade}
    />,
  ];
  const florets: React.ReactElement[] = [];
  const halos: React.ReactElement[] = [];
  const paddles: React.ReactElement[] = [];
  const bloom = (name: string, at: Point, radius: number) => {
    florets.push(
      floret(`${key}-${name}`, at, radius, style.tones, style.shade),
    );
    if (style.glow) {
      halos.push(
        <circle
          key={name}
          cx={at[0]}
          cy={at[1]}
          r={radius * 3.2}
          fill={`url(#${glowId})`}
        />,
      );
    }
  };

  let side = end[0] >= base[0] ? 1 : -1;
  for (const t of BRANCHES) {
    const from = pointOnCurve(base, control, end, t);
    const [nx, ny] = normalOnCurve(base, control, end, t);
    const length = (128 - t * 56) * size;
    const to: Point = [
      from[0] + nx * side * length * 0.9,
      from[1] + ny * side * length * 0.9 - length * 0.5 * (1 - pose.droop),
    ];
    const middle: Point = [
      from[0] + nx * side * length * 0.7,
      from[1] + ny * side * length * 0.7 - length * 0.02,
    ];
    stalks.push(
      <path
        key={`branch-${t}`}
        d={taperPath(from, middle, to, startWidth * 0.5, endWidth * 0.75)}
        fill={style.stalk}
      />,
    );
    bloom(`branch-${t}`, [to[0], to[1] - 6 * size], (25 - t * 8) * size);

    if (style.paddle && t === PADDLE_BRANCH) {
      const angle =
        (Math.atan2(to[1] - middle[1], to[0] - middle[0]) * 180) / Math.PI;
      paddles.push(
        <g
          key="paddle"
          transform={`translate(${to[0]} ${to[1]}) rotate(${angle + side * 24}) translate(${52 * size} 0)`}
        >
          <ellipse rx={50 * size} ry={14 * size} fill={style.paddle[0]} />
          <ellipse
            cx={-4 * size}
            rx={32 * size}
            ry={4.5 * size}
            fill={style.paddle[1]}
          />
        </g>,
      );
    }
    side = -side;
  }
  bloom("tip", end, 27 * size);

  return (
    <g key={key}>
      {halos}
      {stalks}
      {paddles}
      {florets}
    </g>
  );
};

/**
 * Cassiopea, a água-viva que vive pousada de cabeça para baixo: o sino vira um
 * disco raso no chão e os oito braços ramificados sobem. É vista um pouco de
 * cima. O centro do desenho é o centro da borda do sino.
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
  const scale = width / (RIM.rx * 2);
  // No pulso, a borda fecha um pouco, o corpo engrossa e os braços sobem.
  const rx = RIM.rx * (1 - 0.05 * pulse);
  const ry = RIM.ry * (1 + 0.08 * pulse);
  const dome = DOME * (1 + 0.04 * pulse);
  const pose: Pose = { droop, sway, lift: 1 + 0.03 * pulse };
  const domePath = `M${-rx * 0.976},8 C${-rx * 0.91},${dome * 0.78} ${-rx * 0.515},${dome - 2} 0,${dome} C${rx * 0.515},${dome - 2} ${rx * 0.91},${dome * 0.78} ${rx * 0.976},8 Z`;

  const lappets = Array.from({ length: LAPPETS }, (_, index) => {
    const angle = (index / LAPPETS) * Math.PI * 2;
    return {
      x: Math.cos(angle),
      y: Math.sin(angle),
      front: Math.sin(angle) > -0.15,
    };
  });

  const armStyle = (back: boolean): ArmStyle => ({
    widths: back ? [34, 12] : [46, 17],
    tones: back ? colors.frillsBack : colors.frills,
    stalk: back ? colors.stalkBack : colors.stalk,
    shade: back ? colors.stalkBackShade : colors.stalkShade,
    paddle: null,
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
        {colors.glow ? (
          <radialGradient id={glowId}>
            <stop offset={0} stopColor={colors.glow} stopOpacity={0.5} />
            <stop offset={1} stopColor={colors.glow} stopOpacity={0} />
          </radialGradient>
        ) : null}
      </defs>

      <g opacity={1 - 0.45 * nerves}>
        <path d={domePath} fill={colors.dome} />
        <g clipPath={`url(#${domeId})`}>
          <path
            d={`M-300,${dome - 40} C-170,${dome - 2} 170,${dome - 2} 300,${dome - 40} L300,${dome + 4} L-300,${dome + 4} Z`}
            fill={colors.domeShade}
          />
        </g>
        <path
          d={`M-150,${dome - 8} C-60,${dome} 60,${dome} 150,${dome - 8} C60,${dome - 5} -60,${dome - 5} -150,${dome - 8} Z`}
          fill={colors.bounce}
          opacity={0.7}
        />

        {lappets.map((lappet, index) => (
          <circle
            key={index}
            cx={lappet.x * rx}
            cy={lappet.y * ry}
            r={lappet.front ? 30 : 24}
            fill={lappet.front ? colors.rim : colors.rimBack}
          />
        ))}
        <ellipse rx={rx} ry={ry} fill={colors.rim} />
        {lappets.map((lappet, index) => (
          <line
            key={index}
            x1={lappet.x * rx * 0.9}
            y1={lappet.y * ry * 0.9}
            x2={lappet.x * rx * 1.05}
            y2={lappet.y * ry * 1.12}
            stroke={colors.marks}
            strokeWidth={lappet.front ? 9 : 6}
            strokeLinecap="round"
            opacity={lappet.front ? 0.95 : 0.6}
          />
        ))}

        <ellipse cy={-4} rx={rx * 0.764} ry={ry * 0.696} fill={colors.inner} />
        <path
          d={`M${-rx * 0.727},6 C${-rx * 0.455},${ry * 0.76} ${rx * 0.455},${ry * 0.76} ${rx * 0.727},6 C${rx * 0.455},${ry * 0.5} ${-rx * 0.455},${ry * 0.5} ${-rx * 0.727},6 Z`}
          fill={colors.innerLight}
        />
        {Array.from({ length: CANALS }, (_, index) => {
          const angle = (index / CANALS) * Math.PI * 2;
          return (
            <line
              key={index}
              x1={Math.cos(angle) * rx * 0.29}
              y1={-4 + Math.sin(angle) * ry * 0.28}
              x2={Math.cos(angle) * rx * 0.74}
              y2={-4 + Math.sin(angle) * ry * 0.66}
              stroke={colors.canal}
              strokeWidth={4}
              strokeLinecap="round"
              opacity={0.55}
            />
          );
        })}
        <ellipse cy={-6} rx={rx * 0.358} ry={ry * 0.37} fill={colors.core} />

        <g opacity={0.92}>
          {BACK_ARMS.map(([baseX, tipX, tipY], index) =>
            arm(
              `${id}-back-${index}`,
              [baseX, -16],
              [tipX, tipY],
              armStyle(true),
              pose,
              glowId,
            ),
          )}
        </g>
        {FRONT_ARMS.map(([baseX, tipX, tipY], index) =>
          arm(
            `${id}-front-${index}`,
            [baseX, 6],
            [tipX, tipY],
            {
              ...armStyle(false),
              paddle: Math.abs(tipX) > 300 ? colors.paddle : null,
            },
            pose,
            glowId,
          ),
        )}
        {/* Brilho na borda voltada para a luz. */}
        <path
          d={`M${-rx * 0.91},${ry * 0.24} C${-rx * 0.667},${ry * 0.67} ${-rx * 0.273},${ry * 0.87} ${rx * 0.03},${ry * 0.89}`}
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
          {/* Rede sem centro: um anel no sino, raios até a borda e um fio por braço. */}
          <ellipse cy={-4} rx={rx * 0.56} ry={ry * 0.5} strokeWidth={5} />
          <ellipse cy={0} rx={rx * 0.93} ry={ry * 0.9} strokeWidth={4} />
          {Array.from({ length: CANALS }, (_, index) => {
            const angle = ((index + 0.5) / CANALS) * Math.PI * 2;
            return (
              <line
                key={index}
                x1={Math.cos(angle) * rx * 0.56}
                y1={-4 + Math.sin(angle) * ry * 0.5}
                x2={Math.cos(angle) * rx * 0.93}
                y2={Math.sin(angle) * ry * 0.9}
                strokeWidth={3.5}
              />
            );
          })}
          {[...BACK_ARMS, ...FRONT_ARMS].map(([baseX, tipX, tipY], index) => {
            const base: Point = [baseX, index < BACK_ARMS.length ? -16 : 6];
            const { end, control } = armCurve(base, [tipX, tipY], pose);
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
