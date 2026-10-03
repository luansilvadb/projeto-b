import { interpolateColors } from "remotion";
import { palette } from "../design/tokens";

type ShopProps = {
  readonly width: number;
  /** Quanto a porta de enrolar desceu, de 0 a 1. Um par fecha cada metade em separado. */
  readonly shutter?: number | readonly [number, number];
  /** Luz da vitrine: 0 apagada, 1 acesa. */
  readonly lit?: number;
  /** Luz que escapa pelas frestas da porta fechada. */
  readonly glow?: number;
};

const OPENING = { x: 50, y: 150, width: 300, height: 170 };
const STRIPES = 8;
const SLAT_GAP = 17;

/** Altura da loja para uma dada largura. */
export const shopHeight = (width: number) => width * 0.85;

/** Uma loja de frente: toldo listrado, vitrine e porta de enrolar. */
export const Shop: React.FC<ShopProps> = ({
  width,
  shutter = 0,
  lit = 1,
  glow = 0,
}) => {
  const halves = typeof shutter === "number" ? [shutter, shutter] : shutter;
  const halfWidth = OPENING.width / 2;
  const slatColor = interpolateColors(
    glow,
    [0, 1],
    [palette.dusk, palette.sun.light],
  );

  return (
    <svg width={width} height={shopHeight(width)} viewBox="0 0 400 340">
      <rect
        x={20}
        y={70}
        width={360}
        height={270}
        rx={10}
        fill={palette.ocean.dark}
      />
      <rect
        {...OPENING}
        fill={interpolateColors(lit, [0, 1], [palette.ink, palette.sun.light])}
      />
      {halves.map((amount, side) => {
        const height = OPENING.height * amount;
        const x = OPENING.x + halfWidth * side;
        return (
          <g key={side}>
            <rect
              x={x}
              y={OPENING.y}
              width={halfWidth}
              height={height}
              fill={palette.mist}
            />
            {Array.from(
              { length: Math.floor(height / SLAT_GAP) },
              (_, slat) => (
                <line
                  key={slat}
                  x1={x}
                  x2={x + halfWidth}
                  y1={OPENING.y + (slat + 1) * SLAT_GAP}
                  y2={OPENING.y + (slat + 1) * SLAT_GAP}
                  stroke={slatColor}
                  strokeWidth={3}
                />
              ),
            )}
          </g>
        );
      })}
      {Array.from({ length: STRIPES }, (_, stripe) => (
        <rect
          key={stripe}
          x={10 + (380 / STRIPES) * stripe}
          y={96}
          width={380 / STRIPES}
          height={46}
          fill={stripe % 2 === 0 ? palette.accent.base : palette.paper}
        />
      ))}
    </svg>
  );
};
