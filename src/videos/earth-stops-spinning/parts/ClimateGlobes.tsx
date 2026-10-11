import { useCurrentFrame, useVideoConfig } from "remotion";
import { Place } from "../../../components/Place";
import { Pop, popOpacity, popScale } from "../../../components/Pop";
import { ALREADY_SHOWN } from "../../../components/timing";
import { ink, space } from "../palette";
import { Globe } from "./Globe";
import { Svg, Tag } from "./kit";

/**
 * O lado da noite de um disco: a metade oposta à luz. Sem giro, é a linha reta
 * de um lado claro e um escuro, como na Lua. `turn` (graus, sentido horário)
 * diz para onde a metade escura aponta: 0 é a direita do quadro.
 */
export const NightSide: React.FC<{
  readonly cx: number;
  readonly cy: number;
  readonly r: number;
  readonly turn?: number;
  readonly opacity?: number;
}> = ({ cx, cy, r, turn = 0, opacity = 0.66 }) => (
  <path
    d={`M0,${-r} A${r},${r} 0 0 1 0,${r} Z`}
    transform={`translate(${cx} ${cy}) rotate(${turn})`}
    fill={space.sky[0]}
    opacity={opacity}
  />
);

/** Um globo de modelo de clima: a Terra com a grade de latitude e longitude por cima. */
export const SimGlobe: React.FC<{
  readonly cx: number;
  readonly cy: number;
  readonly r: number;
  readonly spin: number;
}> = ({ cx, cy, r, spin }) => (
  <Globe cx={cx} cy={cy} r={r} spin={spin} caps={false}>
    <g fill="none" stroke={ink.paper} strokeWidth={1.8} opacity={0.5}>
      {[-60, -30, 0, 30, 60].map((lat) => (
        <line
          key={lat}
          x1={-100}
          x2={100}
          y1={-100 * Math.sin((lat * Math.PI) / 180)}
          y2={-100 * Math.sin((lat * Math.PI) / 180)}
        />
      ))}
      <line y1={-100} y2={100} />
      <ellipse rx={50} ry={100} />
      <ellipse rx={87} ry={100} />
    </g>
  </Globe>
);

// Os quatro casos que a fileira resume, do giro mais rápido ao mais lento. O
// dia de um ano não tem vaga aqui: a fala diz antes que ninguém o testou, e a
// fileira só mostra o que foi rodado.
export const GLOBE_ROW = {
  y: 520,
  r: 150,
  slots: [
    { x: 375, days: 16, label: "giro de 16 dias" },
    { x: 765, days: 64, label: "64 dias" },
    { x: 1155, days: 128, label: "128 dias" },
    { x: 1545, days: 256, label: "256 dias" },
  ],
} as const;

/**
 * O globo que cresce para mostrar a circulação: o de 128 dias. Nos modelos, o
 * ar só atravessa do lado claro ao escuro a partir de giros de 64 dias; o de
 * 16 ainda não mostra isso.
 */
export const GROWING_SLOT = GLOBE_ROW.slots[2];

// Em quantos segundos de tela o globo de 16 dias dá uma volta; os outros, na proporção.
const FASTEST_TURN_SECONDS = 5;

type GlobeRowProps = {
  /** O relógio do giro, em quadros. */
  readonly clock: number;
  /** O quadro do plano em que cada posição entra; sem valor, já estão lá. */
  readonly enter?: readonly number[];
  /** A opacidade das etiquetas. */
  readonly labels?: number;
  /** A opacidade de tudo o que não é o globo que cresce. */
  readonly rest?: number;
};

/** A fileira de globos simulados, do giro mais rápido ao mais lento. */
export const GlobeRow: React.FC<GlobeRowProps> = ({ clock, enter, labels = 1, rest = 1 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { y, r, slots } = GLOBE_ROW;
  return (
    <>
      <Svg>
        {slots.map((slot, index) => {
          const at = enter?.[index] ?? ALREADY_SHOWN;
          return (
            <g
              key={slot.x}
              opacity={popOpacity(frame, at, 0.3 * fps) * (slot === GROWING_SLOT ? 1 : rest)}
              transform={`translate(${slot.x} ${y}) scale(${popScale(frame, at, 0.3 * fps)})`}
            >
              <SimGlobe cx={0} cy={0} r={r} spin={clock / fps / ((FASTEST_TURN_SECONDS * slot.days) / 16)} />
            </g>
          );
        })}
      </Svg>
      {slots.map(({ x, label }, index) => (
        <Place key={label} x={x} y={y + r + 78} style={{ opacity: labels }}>
          <Pop at={(enter?.[index] ?? ALREADY_SHOWN) + 0.15 * fps}>
            <Tag on="light">{label}</Tag>
          </Pop>
        </Place>
      ))}
    </>
  );
};
