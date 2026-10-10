import { useCurrentFrame, useVideoConfig } from "remotion";
import { Place } from "../../../components/Place";
import { Pop, popOpacity, popScale } from "../../../components/Pop";
import { ALREADY_SHOWN } from "../../../components/timing";
import { ink, space, tags } from "../palette";
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

// Os quatro casos que a fileira resume e, entre os dois últimos, a vaga do
// dia de um ano (365 fica entre 128 e 256). As etiquetas alternam em cima e
// embaixo para caberem no tamanho de nota.
export const GLOBE_ROW = {
  y: 540,
  r: 115,
  slots: [
    { x: 410, days: 16, label: "giro de 16 dias", below: true },
    { x: 705, days: 64, label: "64 dias", below: false },
    { x: 1000, days: 128, label: "128 dias", below: true },
    { x: 1295, days: null, label: "dia de um ano", below: false },
    { x: 1590, days: 256, label: "256 dias", below: true },
  ],
} as const;

// Em quantos segundos de tela o globo de 16 dias dá uma volta; os outros, na proporção.
const FASTEST_TURN_SECONDS = 5;

type GlobeRowProps = {
  /**
   * O relógio do giro, em quadros. A fileira aparece em dois planos seguidos:
   * um conta para trás do próprio fim e o outro, do zero, para o giro não
   * pular no corte.
   */
  readonly clock: number;
  /** O quadro do plano em que cada posição entra; sem valor, já estão lá. */
  readonly enter?: readonly number[];
  /** A opacidade das etiquetas. */
  readonly labels?: number;
  /** A opacidade de tudo o que não é o último globo. */
  readonly rest?: number;
};

/** A fileira de globos simulados, do giro mais rápido ao mais lento, com a vaga vazia. */
export const GlobeRow: React.FC<GlobeRowProps> = ({ clock, enter, labels = 1, rest = 1 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { y, r, slots } = GLOBE_ROW;
  return (
    <>
      <Svg>
        {slots.map(({ x, days }, index) => {
          const at = enter?.[index] ?? ALREADY_SHOWN;
          return (
            <g
              key={x}
              opacity={popOpacity(frame, at, 0.3 * fps) * (index === slots.length - 1 ? 1 : rest)}
              transform={`translate(${x} ${y}) scale(${popScale(frame, at, 0.3 * fps)})`}
            >
              {days === null ? (
                <>
                  <circle r={r - 6} fill={ink.paper} opacity={0.16} />
                  <circle
                    r={r - 6}
                    fill="none"
                    stroke={tags.light.fill}
                    strokeWidth={10}
                    strokeLinecap="round"
                    strokeDasharray="26 24"
                    // O tracejado anda devagar: a vaga está viva, à espera.
                    strokeDashoffset={-clock * 0.5}
                  />
                </>
              ) : (
                <SimGlobe
                  cx={0}
                  cy={0}
                  r={r}
                  spin={clock / fps / ((FASTEST_TURN_SECONDS * days) / 16)}
                />
              )}
            </g>
          );
        })}
      </Svg>
      {slots.map(({ x, label, below }, index) => (
        <Place key={label} x={x} y={y + (below ? 1 : -1) * (r + 78)} style={{ opacity: labels }}>
          <Pop at={(enter?.[index] ?? ALREADY_SHOWN) + 0.15 * fps}>
            <Tag on="light">{label}</Tag>
          </Pop>
        </Place>
      ))}
    </>
  );
};
