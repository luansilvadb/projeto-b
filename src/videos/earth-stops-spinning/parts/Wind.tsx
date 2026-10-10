import { ink } from "../palette";

type WindArrowsProps = {
  readonly cx: number;
  readonly cy: number;
  readonly r: number;
  /** Quanto o giro entorta o caminho, de 0 (reto) a 1 (a curva de hoje). */
  readonly curve: number;
  /** Quanto de cada seta já foi desenhado, de 0 a 1. */
  readonly drawn?: number;
  readonly color?: string;
  readonly opacity?: number;
};

// As setas saem de perto do equador rumo aos polos. No hemisfério norte o
// desvio é para a direita de quem vai, e no sul, para a esquerda: nos dois
// casos, para leste, a direita do quadro.
const STARTS: readonly (readonly [number, 1 | -1])[] = [
  [-0.42, 1],
  [0.12, 1],
  [-0.18, -1],
  [0.36, -1],
];

/**
 * As setas do vento sobre a Terra de lado: as mesmas do gancho ao fechamento.
 * Com `curve` 1 elas se curvam para leste; com 0, seguem retas. Vão dentro de
 * um SVG, por cima do globo.
 */
export const WindArrows: React.FC<WindArrowsProps> = ({
  cx,
  cy,
  r,
  curve,
  drawn = 1,
  color = ink.paper,
  opacity = 1,
}) => {
  if (drawn <= 0) {
    return null;
  }
  return (
    <g opacity={opacity} fill="none" stroke={color} strokeWidth={r * 0.035} strokeLinecap="round">
      {STARTS.map(([at, toward], index) => {
        const x0 = cx + at * r;
        const y0 = cy - toward * r * 0.14;
        const rise = r * 0.5 * drawn;
        const bend = r * 0.34 * curve * drawn;
        const x1 = x0 + bend;
        const y1 = y0 - toward * rise;
        // A ponta aponta para onde a curva termina: reta, para o polo; curva, para leste.
        const heading = (Math.atan2(-toward * rise * (1 - 0.7 * curve), bend * 1.6 + 0.001) * 180) / Math.PI;
        const head = r * 0.06;
        return (
          <g key={index}>
            <path d={`M${x0},${y0} Q${x0},${y1} ${x1},${y1}`} />
            <path
              d={`M${-head},${-head} L${head * 0.4},0 L${-head},${head}`}
              transform={`translate(${x1} ${y1}) rotate(${curve < 0.05 ? -toward * 90 : heading})`}
            />
          </g>
        );
      })}
    </g>
  );
};
