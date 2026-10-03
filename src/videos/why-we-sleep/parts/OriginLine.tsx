import { SvgLayer } from "../../../components/SvgLayer";
import { palette, shape } from "../../../design/tokens";

/** Linha do tempo da evolução: o sono à esquerda, o cérebro mais tarde, à direita. */
export const ORIGIN = {
  y: 800,
  from: 300,
  to: 1620,
  sleepX: 520,
  brainX: 1300,
};

export const OriginLine: React.FC = () => (
  <SvgLayer>
    <line
      x1={ORIGIN.from}
      x2={ORIGIN.to}
      y1={ORIGIN.y}
      y2={ORIGIN.y}
      stroke={palette.mist}
      strokeWidth={shape.stroke.regular}
      strokeLinecap="round"
    />
    <path
      d={`M ${ORIGIN.to - 30} ${ORIGIN.y - 24} L ${ORIGIN.to + 6} ${ORIGIN.y} L ${ORIGIN.to - 30} ${ORIGIN.y + 24}`}
      fill="none"
      stroke={palette.mist}
      strokeWidth={shape.stroke.regular}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </SvgLayer>
);

type MoonProps = {
  readonly size: number;
};

/** Lua crescente: o marcador do sono. */
export const Moon: React.FC<MoonProps> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 100 100">
    <path
      d="M 62 10 A 42 42 0 1 0 90 62 A 34 34 0 1 1 62 10 Z"
      fill={palette.sun.light}
    />
  </svg>
);
