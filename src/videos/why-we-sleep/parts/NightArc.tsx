import type { TagTone } from "../palette";
import { Tag } from "./Tag";
import { Place } from "../../../components/Place";
import { Pop } from "../../../components/Pop";
import { SvgLayer } from "../../../components/SvgLayer";
import { ink } from "../palette";
import { ALREADY_SHOWN } from "../../../components/timing";

type NightArcProps = {
  /** Centro da base do arco e o raio, em pixels do quadro. */
  readonly x: number;
  readonly y: number;
  readonly radius: number;
  /** O trecho dormido, em frações do arco (0 à esquerda, 1 à direita). */
  readonly slept: readonly [number, number];
  /** Quanto do trecho dormido já está desenhado, de 0 a 1. */
  readonly drawn?: number;
  /** Onde a lua está no arco; sem valor, não há lua. */
  readonly moon?: number;
  /** Texto do colchete sobre o trecho dormido, e o quadro em que entra. */
  readonly label?: string;
  readonly labelAt?: number;
  /** O fundo sobre o qual a etiqueta fica. */
  readonly on?: TagTone;
  readonly color?: string;
};

/** Ponto do arco na fração pedida: 0 nasce à esquerda, 1 se põe à direita. */
const along = (x: number, y: number, radius: number, t: number) => {
  const angle = Math.PI * (1 - t);
  return [x + radius * Math.cos(angle), y - radius * Math.sin(angle)] as const;
};

/** Onde a etiqueta do trecho dormido fica: acima do meio dele, fora do arco. */
export const arcLabelAt = (
  x: number,
  y: number,
  radius: number,
  slept: readonly [number, number],
) => {
  const [lx, ly] = along(x, y, radius + 90, (slept[0] + slept[1]) / 2);
  return [lx, ly - 40] as const;
};

/**
 * A noite como um arco no céu, o caminho da lua: o trecho em que o bicho
 * dormiu fica marcado em cheio, e um colchete o mede. Quem dorme pouco tem um
 * pedaço curto; quem dorme muito, quase o arco inteiro.
 */
export const NightArc: React.FC<NightArcProps> = ({
  x,
  y,
  radius,
  slept,
  drawn = 1,
  moon,
  label,
  labelAt = ALREADY_SHOWN,
  on = "night",
  color = ink.paper,
}) => {
  const [from, to] = slept;
  const end = from + (to - from) * drawn;
  const arc = (r: number, a: number, b: number) => {
    const [x1, y1] = along(x, y, r, a);
    const [x2, y2] = along(x, y, r, b);
    return `M${x1},${y1} A${r},${r} 0 0 1 ${x2},${y2}`;
  };
  const mid = arcLabelAt(x, y, radius, slept);
  const moonAt = moon === undefined ? null : along(x, y, radius, moon);

  return (
    <>
      <SvgLayer>
        <path
          d={arc(radius, 0, 1)}
          fill="none"
          stroke={color}
          strokeWidth={4}
          strokeDasharray="2 16"
          strokeLinecap="round"
          opacity={0.7}
        />
        {end > from ? (
          <path
            d={arc(radius, from, end)}
            fill="none"
            stroke={color}
            strokeWidth={22}
            strokeLinecap="round"
          />
        ) : null}
        {drawn >= 1 ? (
          // O colchete: do começo ao fim do trecho, um pouco acima dele.
          <path
            d={arc(radius + 34, from, to)}
            fill="none"
            stroke={color}
            strokeWidth={5}
            strokeLinecap="round"
            opacity={0.9}
          />
        ) : null}
        {moonAt ? (
          <circle cx={moonAt[0]} cy={moonAt[1]} r={30} fill={ink.moon} />
        ) : null}
      </SvgLayer>
      {label ? (
        <Place x={mid[0]} y={mid[1]}>
          <Pop at={labelAt}>
            <Tag size="note" on={on}>
              {label}
            </Tag>
          </Pop>
        </Place>
      ) : null}
    </>
  );
};
