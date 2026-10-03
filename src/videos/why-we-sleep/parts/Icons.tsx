import { palette } from "../../../design/tokens";

type IconProps = {
  readonly size: number;
};

/** O estoque: guardar memórias. */
export const BoxIcon: React.FC<IconProps> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 100 100">
    <rect x={14} y={34} width={72} height={52} rx={4} fill={palette.sun.base} />
    <path d="M 14 34 L 50 18 L 86 34 Z" fill={palette.sun.light} />
    <rect x={44} y={34} width={12} height={52} fill={palette.sun.dark} />
  </svg>
);

/** As prateleiras: aparar conexões. */
export const ShelfIcon: React.FC<IconProps> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 100 100">
    {[38, 62, 86].map((y, shelf) => (
      <g key={y}>
        <line
          x1={10}
          x2={90}
          y1={y}
          y2={y}
          stroke={palette.mist}
          strokeWidth={6}
          strokeLinecap="round"
        />
        {[26, 50, 74].map((x, item) => (
          <circle
            key={x}
            cx={x}
            cy={y - 4 - (5 + ((shelf + item) % 3) * 2)}
            r={5 + ((shelf + item) % 3) * 2}
            fill={palette.ocean.light}
          />
        ))}
      </g>
    ))}
  </svg>
);

type DropIconProps = IconProps & {
  /** Só o contorno tracejado: a resposta que está em disputa. */
  readonly dashed?: boolean;
};

/** A faxina: limpar o cérebro. */
export const DropIcon: React.FC<DropIconProps> = ({ size, dashed = false }) => (
  <svg width={size} height={size} viewBox="0 0 100 100">
    <path
      d="M 50 10 C 50 10 20 48 20 64 A 30 30 0 0 0 80 64 C 80 48 50 10 50 10 Z"
      fill={dashed ? "none" : palette.ocean.base}
      stroke={palette.ocean.light}
      strokeWidth={5}
      strokeDasharray={dashed ? "10 9" : undefined}
      strokeLinecap="round"
    />
  </svg>
);
