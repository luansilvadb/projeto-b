import { ink, tags } from "../palette";
import { Question, SvgText } from "./kit";

type GaugeProps = {
  readonly x: number;
  readonly y: number;
  /** O raio do mostrador. */
  readonly r?: number;
  /** Onde o ponteiro está, de 0 (parado) a 1 (o fim da escala). */
  readonly value: number;
  /** O número embaixo do mostrador; sem valor, ele está apagado e leva uma interrogação. */
  readonly label?: string;
  /** Aceso ou apagado, quando isso não vem do número: aceso sem `label`, mede sem dizer quanto. */
  readonly lit?: boolean;
};

/**
 * O velocímetro: um arco, o ponteiro e o número. Apagado, mostra uma
 * interrogação no lugar do número; aceso sem número, só o arco e o ponteiro.
 * Vai dentro de um SVG; (x, y) é o eixo do ponteiro.
 */
export const Gauge: React.FC<GaugeProps> = ({ x, y, r = 150, value, label, lit = label !== undefined }) => {
  const angle = -120 + 240 * Math.min(1, Math.max(0, value));
  const arc = (from: number, to: number) => {
    const point = (degrees: number) => {
      const turn = ((degrees - 90) * Math.PI) / 180;
      return `${r * Math.cos(turn)},${r * Math.sin(turn)}`;
    };
    return `M${point(from)} A${r},${r} 0 ${to - from > 180 ? 1 : 0} 1 ${point(to)}`;
  };
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle r={r + 34} fill={tags.light.fill} />
      <path d={arc(-120, 120)} fill="none" stroke={ink.paper} strokeWidth={18} strokeLinecap="round" opacity={0.25} />
      {lit ? (
        <path d={arc(-120, Math.max(-119.9, angle))} fill="none" stroke={ink.accent} strokeWidth={18} strokeLinecap="round" />
      ) : null}
      <g transform={`rotate(${angle})`}>
        <path d={`M-9,0 L0,${-r + 14} L9,0 Z`} fill={lit ? ink.stop : ink.paper} opacity={lit ? 1 : 0.4} />
      </g>
      <circle r={17} fill={ink.paper} />
      {label !== undefined ? (
        <SvgText x={0} y={r * 0.62} size={r * 0.3} fill={ink.paper}>
          {label}
        </SvgText>
      ) : lit ? null : (
        <Question x={0} y={r * 0.6} size={r * 0.6} />
      )}
    </g>
  );
};
