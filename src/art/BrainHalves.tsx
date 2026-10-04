import { useId } from "react";

export type BrainHalvesColors = {
  /** O hemisfério acordado: a cor acesa e o miolo quase branco do brilho. */
  readonly awake: string;
  readonly awakeCore: string;
  /** O hemisfério dormindo: apagado, mas com cor. */
  readonly asleep: string;
  readonly asleepShade: string;
  readonly fold: string;
  /** O olho de cada metade: aberto na que vigia, fechado na que dorme. */
  readonly eye: string;
  readonly pupil: string;
  readonly lid: string;
};

type BrainHalvesProps = {
  /** Largura dos dois hemisférios juntos, em pixels do quadro. */
  readonly width: number;
  readonly colors: BrainHalvesColors;
  /** Atividade de cada lado, de 0 (dormindo) a 1 (acordado). */
  readonly left: number;
  readonly right: number;
};

// Um hemisfério visto de cima: a metade esquerda; a direita é o espelho.
const HEMISPHERE =
  "M-6,-112 C-60,-116 -96,-70 -98,-14 C-100,40 -80,96 -36,112 C-20,118 -8,116 -6,112 Z";
const FOLDS = [
  "M-22,-92 C-46,-80 -60,-56 -48,-30",
  "M-74,-50 C-56,-30 -70,2 -52,18",
  "M-78,30 C-56,36 -50,66 -62,88",
  "M-30,-40 C-14,-10 -34,16 -18,48",
  "M-36,60 C-26,76 -34,94 -22,104",
];

/** Mistura, em cor, do apagado ao aceso: aproximação por opacidade entre as duas camadas. */
const activityOf = (value: number) => Math.max(0, Math.min(1, value));

/**
 * O cérebro do golfinho visto de cima, em dois hemisférios: um acende enquanto
 * o outro dorme. Cada lado tem as suas dobras; o aceso ganha brilho.
 */
export const BrainHalves: React.FC<BrainHalvesProps> = ({
  width,
  colors,
  left,
  right,
}) => {
  const id = useId();
  const scale = width / 200;

  return (
    <svg
      width={200 * scale}
      height={236 * scale}
      viewBox="-100 -118 200 236"
      overflow="visible"
    >
      <defs>
        <radialGradient id={id}>
          <stop offset={0} stopColor={colors.awake} stopOpacity={0.55} />
          <stop offset={1} stopColor={colors.awake} stopOpacity={0} />
        </radialGradient>
      </defs>
      {[left, right].map((value, side) => {
        const activity = activityOf(value);
        return (
          <g key={side} transform={side === 0 ? undefined : "scale(-1 1)"}>
            {activity > 0 ? (
              <ellipse
                cx={-50}
                cy={0}
                rx={90}
                ry={150}
                fill={`url(#${id})`}
                opacity={activity}
              />
            ) : null}
            <path
              d={HEMISPHERE}
              fill={colors.asleepShade}
              transform="translate(0 6)"
            />
            <path d={HEMISPHERE} fill={colors.asleep} />
            <path d={HEMISPHERE} fill={colors.awake} opacity={activity} />
            <path
              d="M-10,-104 C-48,-104 -76,-70 -82,-30 C-70,-66 -46,-92 -10,-96 Z"
              fill={colors.awakeCore}
              opacity={0.25 + 0.5 * activity}
            />
            <g
              fill="none"
              stroke={colors.fold}
              strokeWidth={6}
              strokeLinecap="round"
              opacity={0.35 + 0.65 * activity}
            >
              {FOLDS.map((fold) => (
                <path key={fold} d={fold} />
              ))}
            </g>
            {/* O olho: abre com a atividade; dormindo, vira um arco fechado. */}
            {activity > 0.15 ? (
              <g>
                <ellipse
                  cx={-56}
                  cy={-6}
                  rx={21}
                  ry={21 * activity}
                  fill={colors.eye}
                />
                <ellipse
                  cx={-61}
                  cy={-5}
                  rx={11}
                  ry={11 * activity}
                  fill={colors.pupil}
                />
                <circle cx={-65} cy={-9} r={4 * activity} fill={colors.eye} />
                <path
                  d="M-80,-36 L-36,-30"
                  fill="none"
                  stroke={colors.fold}
                  strokeWidth={6}
                  strokeLinecap="round"
                  opacity={activity}
                />
              </g>
            ) : (
              <path
                d="M-76,-8 Q-56,10 -36,-8"
                fill="none"
                stroke={colors.lid}
                strokeWidth={6}
                strokeLinecap="round"
              />
            )}
          </g>
        );
      })}
    </svg>
  );
};
