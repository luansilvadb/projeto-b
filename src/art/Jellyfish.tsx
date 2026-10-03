import { palette } from "../design/tokens";

type JellyfishProps = {
  readonly size: number;
  /** 0 é o sino relaxado; 1, contraído no auge do pulso. */
  readonly pulse?: number;
  /** Para que lado a corrente leva a ponta dos braços, de -1 a 1. */
  readonly sway?: number;
  /** Opacidade da rede de nervos desenhada sobre o sino. */
  readonly nerves?: number;
};

// Posição horizontal da base de cada braço, em unidades do viewBox.
const ARMS = [-58, -38, -19, 0, 19, 38, 58];
const SPOKES = 10;

/** Água-viva Cassiopea: vive pousada com o sino para baixo e os braços para cima. */
export const Jellyfish: React.FC<JellyfishProps> = ({
  size,
  pulse = 0,
  sway = 0,
  nerves = 0,
}) => {
  const rx = 90 - 10 * pulse;
  const ry = 30 + 7 * pulse;

  return (
    <svg
      width={size}
      height={size}
      viewBox="-100 -100 200 200"
      overflow="visible"
    >
      <ellipse cy={52} rx={rx} ry={ry} fill={palette.accent.base} />
      <ellipse
        cy={44}
        rx={rx * 0.78}
        ry={ry * 0.42}
        fill={palette.accent.dark}
      />
      {nerves > 0 ? (
        <g
          stroke={palette.paper}
          strokeWidth={2.5}
          fill="none"
          opacity={nerves}
        >
          <ellipse cy={56} rx={rx * 0.62} ry={ry * 0.5} />
          {Array.from({ length: SPOKES }, (_, index) => {
            const angle = (index / SPOKES) * Math.PI * 2;
            return (
              <line
                key={index}
                x1={Math.cos(angle) * rx * 0.25}
                y1={56 + Math.sin(angle) * ry * 0.2}
                x2={Math.cos(angle) * rx * 0.92}
                y2={54 + Math.sin(angle) * ry * 0.85}
              />
            );
          })}
        </g>
      ) : null}
      {ARMS.map((x) => {
        const height = 78 - Math.abs(x) * 0.55 + 8 * pulse;
        const tipX = x * 1.25 + sway * 7;
        return (
          <g key={x}>
            <path
              d={`M ${x * 0.8} 42 Q ${x} ${42 - height * 0.6} ${tipX} ${42 - height}`}
              fill="none"
              stroke={palette.accent.light}
              strokeWidth={13}
              strokeLinecap="round"
            />
            <circle
              cx={tipX}
              cy={42 - height}
              r={11}
              fill={palette.sun.light}
            />
          </g>
        );
      })}
    </svg>
  );
};
