import { palette } from "../design/tokens";

type SilhouetteProps = {
  readonly width: number;
  readonly color?: string;
};

/** Elefante de perfil, olhando para a esquerda. */
export const Elephant: React.FC<SilhouetteProps> = ({
  width,
  color = palette.mist,
}) => (
  <svg width={width} height={width * 0.73} viewBox="0 0 300 220">
    <g fill={color}>
      <ellipse cx={175} cy={100} rx={100} ry={66} />
      <circle cx={78} cy={88} r={50} />
      {[102, 150, 208, 244].map((x) => (
        <rect key={x} x={x} y={130} width={30} height={84} rx={8} />
      ))}
    </g>
    <path
      d="M 42 104 C 28 140 34 170 26 200"
      fill="none"
      stroke={color}
      strokeWidth={22}
      strokeLinecap="round"
    />
    <ellipse
      cx={104}
      cy={86}
      rx={26}
      ry={40}
      fill={palette.dusk}
      opacity={0.45}
    />
  </svg>
);

/** Golfinho de perfil, nadando para a esquerda: bico, nadadeira curva e cauda fina. */
export const Dolphin: React.FC<SilhouetteProps> = ({
  width,
  color = palette.ocean.light,
}) => (
  <svg width={width} height={width * 0.47} viewBox="0 0 300 140">
    <g fill={color}>
      <path d="M 6 80 L 42 70 C 60 40 170 30 232 58 C 246 64 258 67 270 66 L 292 56 L 287 71 L 294 86 L 270 78 C 200 110 90 110 42 88 Z" />
      <path d="M 140 42 C 150 22 164 12 180 10 C 172 24 173 36 182 47 Z" />
      <path d="M 96 94 C 100 110 112 122 128 124 C 121 112 122 101 130 95 Z" />
    </g>
    <circle cx={62} cy={70} r={5} fill={palette.ink} />
  </svg>
);

/** Fragata planando, vista de baixo: asas longas e cauda em forquilha. */
export const Frigatebird: React.FC<SilhouetteProps> = ({
  width,
  color = palette.ink,
}) => (
  <svg width={width} height={width * 0.4} viewBox="0 0 400 160">
    <path
      d="M 0 60 L 110 20 L 185 70 L 200 60 L 215 70 L 290 20 L 400 60 L 290 50 L 220 96 L 236 152 L 200 112 L 164 152 L 180 96 L 110 50 Z"
      fill={color}
    />
  </svg>
);

/** Hidra: um tubo preso pelo pé, com tentáculos no topo. */
export const Hydra: React.FC<SilhouetteProps> = ({
  width,
  color = palette.leaf.base,
}) => (
  <svg width={width} height={width * 1.9} viewBox="0 0 160 300">
    <g fill="none" stroke={color} strokeWidth={9} strokeLinecap="round">
      <path d="M 80 118 C 60 90 30 90 14 50" />
      <path d="M 80 118 C 66 80 50 60 50 16" />
      <path d="M 80 118 C 80 80 78 50 84 8" />
      <path d="M 80 118 C 94 80 110 60 112 18" />
      <path d="M 80 118 C 100 90 130 92 148 54" />
    </g>
    <rect x={64} y={108} width={32} height={164} rx={16} fill={color} />
    <ellipse cx={80} cy={276} rx={36} ry={11} fill={color} />
  </svg>
);

/** Camundongo de perfil, olhando para a esquerda. */
export const Mouse: React.FC<SilhouetteProps> = ({
  width,
  color = palette.mist,
}) => (
  <svg width={width} height={width * 0.58} viewBox="0 0 120 70">
    <path
      d="M 100 50 C 114 50 116 34 106 28"
      fill="none"
      stroke={color}
      strokeWidth={4}
      strokeLinecap="round"
    />
    <g fill={color}>
      <ellipse cx={64} cy={46} rx={40} ry={22} />
      <circle cx={28} cy={44} r={17} />
      <circle cx={34} cy={24} r={11} />
    </g>
  </svg>
);

/** Pessoa deitada na cama, de perfil. */
export const Sleeper: React.FC<SilhouetteProps> = ({
  width,
  color = palette.mist,
}) => (
  <svg width={width} height={width * 0.4} viewBox="0 0 300 120">
    <rect x={10} y={84} width={280} height={18} rx={6} fill={color} />
    <rect x={20} y={58} width={62} height={26} rx={10} fill={palette.paper} />
    <circle cx={58} cy={44} r={22} fill={color} />
    <path d="M 84 84 C 96 40 210 44 284 84 Z" fill={palette.ocean.base} />
  </svg>
);
