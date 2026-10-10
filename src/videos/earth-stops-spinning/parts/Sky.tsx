import { useId } from "react";
import { space } from "../palette";

/**
 * A Lua e o Sol do vídeo, sem rosto. Vão dentro de um SVG; (cx, cy) é o centro.
 */

type MoonProps = {
  readonly cx: number;
  readonly cy: number;
  readonly r: number;
  /**
   * Onde está a linha da sombra, de -1 a 1: com -1 a Lua inteira está clara,
   * com 0 a metade direita está escura, com 1 está toda escura.
   */
  readonly night?: number;
};

export const Moon: React.FC<MoonProps> = ({ cx, cy, r, night = -1 }) => {
  const id = useId();
  const edge = cx + r * (1 - (night + 1));
  return (
    <g>
      <defs>
        <clipPath id={`${id}-disc`}>
          <circle cx={cx} cy={cy} r={r} />
        </clipPath>
      </defs>
      <circle cx={cx} cy={cy} r={r} fill={space.moon} />
      <g clipPath={`url(#${id}-disc)`}>
        <g fill={space.moonCrater}>
          <circle cx={cx - r * 0.35} cy={cy - r * 0.3} r={r * 0.2} />
          <circle cx={cx + r * 0.3} cy={cy + r * 0.1} r={r * 0.14} />
          <circle cx={cx - r * 0.1} cy={cy + r * 0.5} r={r * 0.17} />
          <circle cx={cx + r * 0.45} cy={cy - r * 0.5} r={r * 0.09} />
        </g>
        <rect x={edge} y={cy - r} width={r * 2.2} height={r * 2} fill={space.sky[0]} opacity={0.78} />
      </g>
    </g>
  );
};

type SunDiscProps = {
  readonly cx: number;
  readonly cy: number;
  readonly r: number;
  /** Quanto ele já inchou e avermelhou, de 0 (o Sol de hoje) a 1. */
  readonly red?: number;
};

export const SunDisc: React.FC<SunDiscProps> = ({ cx, cy, r, red = 0 }) => (
  <g>
    <circle cx={cx} cy={cy} r={r * 1.5} fill={red > 0.5 ? space.sunRed : space.sunCore} opacity={0.22} />
    <circle cx={cx} cy={cy} r={r} fill={red > 0.5 ? space.sunRed : space.sun} />
    <circle cx={cx - r * 0.16} cy={cy - r * 0.16} r={r * 0.7} fill={red > 0.5 ? space.sunEdge : space.sunCore} opacity={0.55} />
  </g>
);
