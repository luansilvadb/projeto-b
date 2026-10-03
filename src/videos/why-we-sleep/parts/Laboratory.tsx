import { useId } from "react";
import {
  AbsoluteFill,
  random,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { taperPath, type Point } from "../../../art/shapes";
import { framing } from "../../../components/Camera";
import { SvgLayer } from "../../../components/SvgLayer";
import { lab, researcher } from "../palette";

/** O tanque no plano médio: a caixa de vidro, o nível da água e o chão dele, em pixels do quadro. */
export const TANK = { x: 760, y: 250, width: 800, height: 550, water: 300 };
/** A altura da bancada, onde o tanque pousa. */
export const BENCH_Y = TANK.y + TANK.height;
/** O centro do tanque, onde a água-viva fica. */
export const TANK_CENTER = TANK.x + TANK.width / 2;

/**
 * Os enquadramentos do laboratório, no mesmo cenário: o plano médio da bancada
 * e o close dentro do tanque, em que o vidro coincide com as bordas do quadro.
 */
export const LAB = {
  medium: framing([960, 540], 1),
  /** O fim da aproximação lenta do plano médio. */
  mediumEnd: framing([TANK_CENTER, 600], 1.03, [TANK_CENTER, 600]),
  close: framing([TANK_CENTER, 600], 2.4),
} as const;

// Bolhas que sobem na água do tanque: pixels por segundo da mais rápida.
const BUBBLES = 9;
const RISE = 70;

/** A parede do laboratório, com a prateleira de vidraria ao fundo. Fica atrás de tudo. */
export const LabWall: React.FC = () => (
  <AbsoluteFill
    style={{ background: `linear-gradient(${lab.wall[0]}, ${lab.wall[1]})` }}
  >
    <SvgLayer>
      <rect x={0} y={206} width={1920} height={16} rx={8} fill={lab.shelf} />
      {/* Vidraria na prateleira: em silhueta, perto da cor da parede, para não disputar com o tanque. */}
      <g fill={lab.shelf}>
        <rect x={120} y={96} width={64} height={110} rx={16} />
        <path d="M250,206 L282,120 L282,84 L322,84 L322,120 L354,206 Z" />
        <rect x={430} y={126} width={96} height={80} rx={14} />
        <circle cx={640} cy={160} r={46} />
        <rect x={622} y={84} width={36} height={50} rx={8} />
        <rect x={1640} y={70} width={84} height={136} rx={18} />
        <path d="M1790,206 L1816,132 L1816,96 L1850,96 L1850,132 L1876,206 Z" />
      </g>
    </SvgLayer>
  </AbsoluteFill>
);

/** A bancada: fica na frente de quem está atrás dela e por baixo do tanque. */
export const LabBench: React.FC = () => (
  <SvgLayer>
    <rect
      x={0}
      y={BENCH_Y}
      width={1920}
      height={1080 - BENCH_Y}
      fill={lab.bench}
    />
    <rect x={0} y={BENCH_Y} width={1920} height={26} fill={lab.benchTop} />
    <rect
      x={0}
      y={BENCH_Y + 150}
      width={1920}
      height={130}
      fill={lab.benchShade}
    />
    <ellipse
      cx={TANK.x + TANK.width / 2}
      cy={BENCH_Y + 14}
      rx={TANK.width * 0.56}
      ry={22}
      fill={lab.contact}
      opacity={0.22}
    />
  </SvgLayer>
);

type TankProps = {
  /** Onde a plataforma está: o x do centro dela. Sem isso, o tanque não tem plataforma. */
  readonly platform?: number;
  /** O que está dentro da água, em pixels do quadro. */
  readonly children?: React.ReactNode;
};

/** Altura do tampo da plataforma em que a água-viva pousa. */
export const PLATFORM_Y = 640;

/** O tanque de vidro com água, de frente. O conteúdo fica entre a água e o reflexo do vidro. */
export const Tank: React.FC<TankProps> = ({ platform, children }) => {
  const id = useId();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { x, y, width, height, water } = TANK;
  const depth = y + height - water;

  return (
    <>
      <SvgLayer>
        <defs>
          <linearGradient id={id} x1={0} y1={0} x2={0} y2={1}>
            <stop offset={0} stopColor={lab.water} stopOpacity={0.55} />
            <stop offset={1} stopColor={lab.waterDeep} stopOpacity={0.75} />
          </linearGradient>
        </defs>
        <rect
          x={x}
          y={water}
          width={width}
          height={depth}
          rx={18}
          fill={`url(#${id})`}
        />
        {/* A superfície da água, vista um pouco de cima. */}
        <ellipse
          cx={x + width / 2}
          cy={water}
          rx={width / 2}
          ry={14}
          fill={lab.water}
          opacity={0.9}
        />
        {Array.from({ length: BUBBLES }, (_, index) => {
          const pick = (trait: string) => random(`bubble-${trait}-${index}`);
          const climb = (frame / fps) * RISE * (0.4 + pick("speed"));
          return (
            <circle
              key={index}
              cx={x + 40 + pick("x") * (width - 80) + 6 * Math.sin(climb / 40)}
              cy={
                water +
                20 +
                ((((pick("y") * depth - climb) % (depth - 30)) + (depth - 30)) %
                  (depth - 30))
              }
              r={4 + pick("size") * 7}
              fill="none"
              stroke={lab.glass}
              strokeWidth={3}
              opacity={0.5}
            />
          );
        })}
        {platform === undefined ? null : (
          <g>
            <rect
              x={platform - 210}
              y={PLATFORM_Y}
              width={420}
              height={26}
              rx={13}
              fill={lab.platform}
            />
            <rect
              x={platform - 210}
              y={PLATFORM_Y + 16}
              width={420}
              height={10}
              rx={5}
              fill={lab.platformShade}
            />
            <rect
              x={platform - 14}
              y={PLATFORM_Y + 26}
              width={28}
              height={BENCH_Y - PLATFORM_Y - 30}
              fill={lab.platformShade}
            />
          </g>
        )}
      </SvgLayer>
      {children}
      <SvgLayer>
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          rx={18}
          fill="none"
          stroke={lab.glass}
          strokeWidth={12}
          opacity={0.95}
        />
        <path
          d={`M${x + 40},${y + 50} L${x + 40},${y + height - 80}`}
          stroke={lab.glass}
          strokeWidth={10}
          strokeLinecap="round"
          opacity={0.6}
        />
        <path
          d={`M${x + 70},${y + 50} L${x + 70},${y + 190}`}
          stroke={lab.glass}
          strokeWidth={8}
          strokeLinecap="round"
          opacity={0.45}
        />
      </SvgLayer>
    </>
  );
};

type GloveProps = {
  /** De onde o braço vem (fora do quadro) e onde a mão segura, em pixels do quadro. */
  readonly from: Point;
  readonly to: Point;
  /** Largura da manga, que dá a escala da mão. */
  readonly size: number;
};

/** O braço da pesquisadora, de jaleco e luva, que entra no quadro e segura algo. Vai dentro de um SvgLayer. */
export const Glove: React.FC<GloveProps> = ({ from, to, size }) => {
  const control: Point = [
    (from[0] + to[0]) / 2,
    (from[1] + to[1]) / 2 - size * 0.5,
  ];
  const angle =
    (Math.atan2(to[1] - control[1], to[0] - control[0]) * 180) / Math.PI;
  return (
    <g>
      <path
        d={taperPath(from, control, to, size * 1.25, size)}
        fill={researcher.top}
      />
      <path
        d={taperPath(
          [from[0], from[1] + size * 0.3],
          [control[0], control[1] + size * 0.3],
          [to[0], to[1] + size * 0.24],
          size * 0.5,
          size * 0.4,
        )}
        fill={researcher.topShade}
      />
      <g transform={`translate(${to[0]} ${to[1]}) rotate(${angle})`}>
        {/* A luva: o punho, a palma fechada e o polegar por cima do que ela segura. */}
        <rect
          x={-size * 0.2}
          y={-size * 0.52}
          width={size * 0.5}
          height={size * 1.04}
          rx={size * 0.2}
          fill={researcher.handShade}
        />
        <rect
          x={size * 0.1}
          y={-size * 0.6}
          width={size * 1.05}
          height={size * 1.2}
          rx={size * 0.5}
          fill={researcher.hand}
        />
        <rect
          x={size * 0.4}
          y={-size * 0.78}
          width={size * 0.62}
          height={size * 0.44}
          rx={size * 0.22}
          fill={researcher.handShade}
        />
      </g>
    </g>
  );
};
