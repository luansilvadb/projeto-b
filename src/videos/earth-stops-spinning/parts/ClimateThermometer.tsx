import { interpolateColors } from "remotion";
import { mix } from "../../../components/timing";
import { typography } from "../../../design/tokens";
import { blockDay, ink, tags } from "../palette";
import { SvgText } from "./kit";

/** Onde ficam, na coluna, os dois extremos medidos no chão da Lua. */
export const MOON_LEVELS = { day: 0.86, night: 0.14 } as const;

type Mark = {
  /** A altura na coluna, de 0 a 1. */
  readonly at: number;
  readonly text: string;
  /** A escala da entrada, de 0 a 1 (com sobra, um pouco mais); sem valor, já está lá. */
  readonly shown?: number;
};

type ThermometerProps = {
  /** O meio da base: o termômetro fica em pé em (x, y). */
  readonly x: number;
  readonly y: number;
  readonly height: number;
  /** A coluna, de 0 a 1. Sem valor, não há leitura: o tubo fica vazio. */
  readonly level?: number;
  /** Os números presos à coluna, à direita. Sem eles, o termômetro não tem marcação. */
  readonly marks?: readonly Mark[];
  readonly markSize?: "label" | "note";
};

/**
 * O termômetro das cenas de temperatura: uma caixa escura (para ler sobre a
 * Lua, a Terra e o céu), o tubo claro e a coluna, que vai do azul do frio ao
 * laranja do calor conforme sobe. Vai dentro de um SVG.
 */
export const Thermometer: React.FC<ThermometerProps> = ({
  x,
  y,
  height,
  level,
  marks = [],
  markSize = "note",
}) => {
  const tube = height * 0.1;
  const pad = tube * 0.34;
  const bulb = tube * 1.05;
  const bulbY = y - bulb - pad;
  const top = y - height;
  const low = bulbY - bulb - tube * 0.2;
  const high = top + pad + tube * 0.7;
  const color =
    level === undefined
      ? blockDay.idle
      : // A troca de cor é rápida, no meio da coluna: devagar, o azul e o laranja davam um cinza.
        interpolateColors(level, [0.44, 0.56], [ink.cold, ink.hot]);
  const inset = tube * 0.2;
  const size = typography.size[markSize];
  return (
    <g>
      <rect x={x - tube / 2 - pad} y={top} width={tube + 2 * pad} height={bulbY - top} rx={tube / 2 + pad} fill={ink.dark} />
      <circle cx={x} cy={bulbY} r={bulb + pad} fill={ink.dark} />
      <rect x={x - tube / 2} y={top + pad} width={tube} height={bulbY - top - pad} rx={tube / 2} fill={ink.paper} />
      <circle cx={x} cy={bulbY} r={bulb} fill={ink.paper} />
      <circle cx={x} cy={bulbY} r={bulb - inset} fill={color} />
      {level === undefined ? null : (
        <rect
          x={x - tube / 2 + inset}
          y={mix(low, high, level)}
          width={tube - 2 * inset}
          height={bulbY - mix(low, high, level)}
          rx={tube / 2 - inset}
          fill={color}
        />
      )}
      {marks.map(({ at, text, shown = 1 }) => {
        const markY = mix(low, high, at);
        const edge = x + tube / 2 + pad;
        // A pílula da etiqueta do vídeo, desenhada no SVG para ficar presa à coluna.
        const width = size * (0.5 * text.length + 1.1);
        return shown <= 0 ? null : (
          <g key={text} opacity={Math.min(1, shown * 2)}>
            <rect x={edge - 4} y={markY - 5} width={34} height={10} rx={5} fill={tags.dark.fill} />
            <g transform={`translate(${edge + 26 + width / 2} ${markY}) scale(${shown})`}>
              <rect x={-width / 2} y={-size * 0.72} width={width} height={size * 1.44} rx={size * 0.72} fill={tags.dark.fill} />
              <SvgText x={0} y={size * 0.04} size={markSize} fill={tags.dark.text}>
                {text}
              </SvgText>
            </g>
          </g>
        );
      })}
    </g>
  );
};
