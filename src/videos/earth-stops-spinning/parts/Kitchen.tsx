import { AbsoluteFill } from "remotion";
import { home, space } from "../palette";
import { Svg } from "./kit";

/**
 * A cozinha de quem assiste, de manhã: a parede quente, a janela grande à
 * direita, o balcão embaixo dela e o chão. É o lugar de `casa`; a janela volta
 * do gancho ao fechamento. Quem está nela pisa em `KITCHEN.floor`.
 */
export const KITCHEN = {
  /** A janela: o vidro, por dentro da moldura. */
  window: { x: 980, y: 170, width: 640, height: 470 },
  /** A altura do chão, onde a Vigília pisa. */
  floor: 900,
  /** Onde ela fica, de frente para a janela. */
  stand: [700, 900] as const,
} as const;

type KitchenProps = {
  /** A altura do Sol no vidro, de 0 (abaixo do peitoril) a 1 (no alto); sem valor, não há Sol. */
  readonly sun?: number;
  /** Onde o Sol está no vidro, da esquerda (0) para a direita (1). */
  readonly sunAt?: number;
  /** Quanto a cortina se afasta da vertical, em graus: parada é 0. */
  readonly curtain?: number;
  /** O que mais aparece pela janela, recortado pelo vidro, em pixels do quadro. */
  readonly outside?: React.ReactNode;
  /** A cor do céu no vidro, de cima para baixo, quando não é a da manhã. */
  readonly sky?: readonly [string, string];
  /** O que está na cozinha, por cima do cenário, em pixels do quadro (dentro do mesmo SVG). */
  readonly children?: React.ReactNode;
};

export const Kitchen: React.FC<KitchenProps> = ({
  sun,
  sunAt = 0.5,
  curtain = 0,
  outside,
  sky = home.sky,
  children,
}) => {
  const w = KITCHEN.window;
  const sunY = w.y + w.height * (1.15 - 0.95 * (sun ?? 0));
  const sunX = w.x + w.width * sunAt;
  return (
    <AbsoluteFill
      style={{ background: `linear-gradient(${home.wall[0]}, ${home.wall[1]})` }}
    >
      <Svg>
        <defs>
          <linearGradient id="kitchen-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={sky[0]} />
            <stop offset="1" stopColor={sky[1]} />
          </linearGradient>
          <radialGradient id="kitchen-glow">
            <stop offset="0.4" stopColor={home.frame} stopOpacity={0.5} />
            <stop offset="1" stopColor={home.frame} stopOpacity={0} />
          </radialGradient>
          <clipPath id="kitchen-glass">
            <rect x={w.x} y={w.y} width={w.width} height={w.height} rx={18} />
          </clipPath>
        </defs>
        {/* A luz da janela na parede. */}
        <ellipse cx={w.x + w.width / 2} cy={w.y + w.height / 2} rx={760} ry={560} fill="url(#kitchen-glow)" />
        {/* A janela. */}
        <rect x={w.x - 26} y={w.y - 26} width={w.width + 52} height={w.height + 52} rx={30} fill={home.frameShade} />
        <rect x={w.x - 16} y={w.y - 16} width={w.width + 32} height={w.height + 32} rx={24} fill={home.frame} />
        <rect x={w.x} y={w.y} width={w.width} height={w.height} rx={18} fill="url(#kitchen-sky)" />
        <g clipPath="url(#kitchen-glass)">
          {sun === undefined ? null : (
            <>
              <circle cx={sunX} cy={sunY} r={150} fill={space.sunCore} opacity={0.35} />
              <circle cx={sunX} cy={sunY} r={88} fill={space.sun} />
              <circle cx={sunX - 14} cy={sunY - 14} r={62} fill={space.sunCore} opacity={0.6} />
            </>
          )}
          {outside}
        </g>
        {/* A travessa da janela. */}
        <rect x={w.x + w.width / 2 - 7} y={w.y} width={14} height={w.height} fill={home.frame} />
        <rect x={w.x - 44} y={w.y + w.height + 16} width={w.width + 88} height={26} rx={10} fill={home.frame} />
        {/* A cortina, presa em cima: é o ar da cozinha. */}
        <g transform={`rotate(${curtain} ${w.x - 30} ${w.y - 40})`}>
          <path
            d={`M${w.x - 70},${w.y - 40} L${w.x + 60},${w.y - 40} Q${w.x + 30},${w.y + 200} ${w.x + 10},${w.y + 430} L${w.x - 80},${w.y + 430} Z`}
            fill={home.curtain}
          />
          <path
            d={`M${w.x - 70},${w.y - 40} L${w.x - 30},${w.y - 40} Q${w.x - 44},${w.y + 200} ${w.x - 50},${w.y + 430} L${w.x - 80},${w.y + 430} Z`}
            fill={home.curtainShade}
          />
        </g>
        <rect x={w.x - 110} y={w.y - 58} width={w.width + 220} height={22} rx={11} fill={home.frameShade} />
        {/* O balcão debaixo da janela. */}
        <rect x={w.x - 120} y={KITCHEN.floor - 190} width={w.width + 420} height={190} fill={home.counter} />
        <rect x={w.x - 140} y={KITCHEN.floor - 214} width={w.width + 460} height={30} rx={8} fill={home.counterShade} />
        <rect x={w.x - 120} y={KITCHEN.floor - 60} width={w.width + 420} height={60} fill={home.counterShade} opacity={0.6} />
        {/* O chão. */}
        <rect x={0} y={KITCHEN.floor} width={1920} height={180} fill={home.floor} />
        <rect x={0} y={KITCHEN.floor} width={1920} height={16} fill={home.floorShade} />
        {children}
      </Svg>
    </AbsoluteFill>
  );
};
