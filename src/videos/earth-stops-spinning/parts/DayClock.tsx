import { useId } from "react";
import { blockBrake, ink } from "../palette";
import { SvgText } from "./kit";

/**
 * O relógio de um dia: o ponteiro dá uma volta por dia, e o aro em volta do
 * mostrador é o próprio dia, do risco do alto até o risco do alto. É nele que
 * o dia ganha ou perde uma lasca, e por isso ele volta no mesmo lugar e no
 * mesmo tamanho em `earthquake`, `the-moon-brake` e `corals`.
 *
 * A lasca de verdade (milionésimos ou milésimos de segundo) não se vê no aro:
 * quem a mostra é a lupa, pousada no fim do dia. Tudo vai dentro de um SVG.
 */

/** Onde o relógio fica no quadro, em todo plano que o tem. */
export const DAY_CLOCK = { cx: 560, cy: 470, r: 280 } as const;
/** A lente grande da lupa, ao lado dele. */
const LENS = { cx: 1330, cy: 390, r: 230 } as const;
/** As duas linhas da medida, embaixo da lente. */
const NOTE = { x: LENS.cx, y: [740, 812] } as const;

// O aro: a que distância do centro fica o meio dele, e a largura, em fração do raio.
const RING = { at: 0.92, width: 0.13 } as const;

/** Um ponto a `hour` horas do alto, no sentido do ponteiro, a `radius` do centro. */
const around = (cx: number, cy: number, radius: number, hour: number): readonly [number, number] => {
  const angle = (hour / 24) * Math.PI * 2;
  return [cx + radius * Math.sin(angle), cy - radius * Math.cos(angle)];
};

type DayClockProps = {
  readonly cx?: number;
  readonly cy?: number;
  readonly r?: number;
  /** Onde está o ponteiro, em horas: 0 e 24 são o alto. */
  readonly hand?: number;
  /** Quantas horas o dia deste relógio dura: o aro só cobre esse tanto da volta. */
  readonly day?: number;
  /** A cor do aro. */
  readonly color?: string;
};

export const DayClock: React.FC<DayClockProps> = ({
  cx = DAY_CLOCK.cx,
  cy = DAY_CLOCK.cy,
  r = DAY_CLOCK.r,
  hand = 0,
  day = 24,
  color = blockBrake.day,
}) => {
  const ring = r * RING.at;
  const end = around(cx, cy, ring, day);
  const tip = around(cx, cy, r * 0.56, hand);
  return (
    <g>
      {/* A sombra que o solta do fundo liso. */}
      <circle cx={cx} cy={cy + r * 0.06} r={r} fill={blockBrake.rim} opacity={0.16} />
      {/* A volta de 24 h, apagada, e por cima o tanto que este dia dura. */}
      <circle cx={cx} cy={cy} r={ring} fill="none" stroke={blockBrake.rim} strokeWidth={r * RING.width} opacity={0.3} />
      {day >= 24 ? (
        <circle cx={cx} cy={cy} r={ring} fill="none" stroke={color} strokeWidth={r * RING.width} />
      ) : (
        <path
          d={`M${cx},${cy - ring} A${ring},${ring} 0 ${day > 12 ? 1 : 0} 1 ${end[0]},${end[1]}`}
          fill="none"
          stroke={color}
          strokeWidth={r * RING.width}
        />
      )}
      <circle cx={cx} cy={cy} r={r * 0.82} fill={blockBrake.face} stroke={blockBrake.rim} strokeWidth={r * 0.035} />
      {Array.from({ length: 24 }, (_, hour) => {
        const long = hour % 6 === 0;
        const from = around(cx, cy, r * (long ? 0.62 : 0.68), hour);
        const to = around(cx, cy, r * 0.75, hour);
        return (
          <line
            key={hour}
            x1={from[0]}
            y1={from[1]}
            x2={to[0]}
            y2={to[1]}
            stroke={blockBrake.rim}
            strokeWidth={r * (long ? 0.04 : 0.022)}
            strokeLinecap="round"
            opacity={long ? 1 : 0.55}
          />
        );
      })}
      {/* O risco do alto: onde o dia começa e onde ele acaba. */}
      <line
        x1={cx}
        y1={cy - r * (RING.at - RING.width * 0.62)}
        x2={cx}
        y2={cy - r * (RING.at + RING.width * 0.62)}
        stroke={blockBrake.rim}
        strokeWidth={r * 0.03}
        strokeLinecap="round"
      />
      <line
        x1={cx}
        y1={cy}
        x2={tip[0]}
        y2={tip[1]}
        stroke={blockBrake.rim}
        strokeWidth={r * 0.06}
        strokeLinecap="round"
      />
      <circle cx={cx} cy={cy} r={r * 0.08} fill={blockBrake.sliver} />
    </g>
  );
};

/** A lasca: um pedaço do aro, do tamanho que a lente mostra. Centrada em (0, 0). */
export const DaySliver: React.FC<{ readonly size?: number; readonly color?: string }> = ({
  size = 1,
  color = blockBrake.sliver,
}) => <rect x={-33 * size} y={-55 * size} width={66 * size} height={110 * size} rx={7 * size} fill={color} />;

type DayLensProps = {
  /** Quanto a lupa já abriu, de 0 a 1 (a escala da entrada). */
  readonly open: number;
  /** `out`: a lasca sai do fim do dia, e o dia encurta. `in`: ela chega e encosta depois do fim, e o dia alonga. */
  readonly mode: "out" | "in";
  /** Quanto a lasca já andou, de 0 a 1. */
  readonly moved: number;
};

/**
 * A lupa sobre o fim do dia do relógio: um aro pequeno no alto dele e, ligada
 * a esse aro, a lente grande, que mostra o aro do dia de perto, com o risco
 * do fim e a lasca.
 */
export const DayLens: React.FC<DayLensProps> = ({ open, mode, moved }) => {
  const id = useId();
  if (open <= 0) {
    return null;
  }
  const spot = { x: DAY_CLOCK.cx, y: DAY_CLOCK.cy - DAY_CLOCK.r * RING.at, r: 38 };
  // O risco do fim do dia, dentro da lente, e a largura da lasca.
  const mark = LENS.cx + 30;
  const width = 66;
  // Onde a lasca descansa depois de sair: acima do fim, torta. A que chega vem de fora da lente.
  const away = mode === "out" ? { x: mark + 44, y: LENS.cy - 128, tilt: 18 } : { x: mark + 210, y: LENS.cy - 330, tilt: 40 };
  const home = { x: mode === "out" ? mark - width / 2 : mark + width / 2, y: LENS.cy };
  const gone = mode === "out" ? moved : 1 - moved;
  return (
    <g opacity={Math.min(1, open * 2)}>
      {/* O que liga o ponto do relógio à lente. */}
      <path
        d={`M${spot.x},${spot.y - spot.r} L${LENS.cx - LENS.r * 0.5},${LENS.cy - LENS.r * 0.86} L${LENS.cx - LENS.r * 0.5},${LENS.cy + LENS.r * 0.86} L${spot.x},${spot.y + spot.r} Z`}
        fill={blockBrake.face}
        opacity={0.28}
      />
      <circle cx={spot.x} cy={spot.y} r={spot.r} fill="none" stroke={blockBrake.rim} strokeWidth={10} />
      <g transform={`translate(${LENS.cx} ${LENS.cy}) scale(${open}) translate(${-LENS.cx} ${-LENS.cy})`}>
        <defs>
          <clipPath id={`${id}-glass`}>
            <circle cx={LENS.cx} cy={LENS.cy} r={LENS.r} />
          </clipPath>
        </defs>
        <line
          x1={LENS.cx + LENS.r * 0.7}
          y1={LENS.cy + LENS.r * 0.7}
          x2={LENS.cx + LENS.r * 0.7 + 96}
          y2={LENS.cy + LENS.r * 0.7 + 96}
          stroke={blockBrake.handle}
          strokeWidth={44}
          strokeLinecap="round"
        />
        <circle cx={LENS.cx} cy={LENS.cy} r={LENS.r} fill={blockBrake.face} />
        <g clipPath={`url(#${id}-glass)`}>
          {/* O trilho da volta, que segue; e o dia, que acaba no risco (ou antes dele, quando a lasca sai). */}
          <rect x={LENS.cx - LENS.r} y={LENS.cy - 55} width={LENS.r * 2} height={110} fill={blockBrake.rim} opacity={0.14} />
          <rect
            x={LENS.cx - LENS.r}
            y={LENS.cy - 55}
            width={LENS.r + (mode === "out" ? mark - width : mark) - LENS.cx}
            height={110}
            fill={blockBrake.day}
          />
          <g
            transform={`translate(${home.x + (away.x - home.x) * gone} ${home.y + (away.y - home.y) * gone}) rotate(${away.tilt * gone})`}
          >
            {/* Antes de sair ela é dia como o resto do aro; solta, ganha a cor de lasca. */}
            <DaySliver color={mode === "out" && moved <= 0 ? blockBrake.day : blockBrake.sliver} />
          </g>
          <line
            x1={mark}
            y1={LENS.cy - 96}
            x2={mark}
            y2={LENS.cy + 96}
            stroke={blockBrake.rim}
            strokeWidth={10}
            strokeLinecap="round"
          />
        </g>
        <circle cx={LENS.cx} cy={LENS.cy} r={LENS.r} fill="none" stroke={blockBrake.rim} strokeWidth={22} />
      </g>
    </g>
  );
};

/** A medida da lasca, em duas linhas, embaixo da lente. */
export const DayNote: React.FC<{
  readonly lines: readonly [string, string];
  readonly opacity: number;
}> = ({ lines, opacity }) => (
  <g opacity={opacity}>
    {lines.map((line, index) => (
      <SvgText key={line} x={NOTE.x} y={NOTE.y[index]} fill={ink.dark}>
        {line}
      </SvgText>
    ))}
  </g>
);
