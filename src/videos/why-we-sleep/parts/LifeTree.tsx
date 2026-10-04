type LifeTreeProps = {
  readonly width: number;
  /** Cor dos galhos, e a dos bichos na ponta de cada um. */
  readonly color: string;
  readonly bud: string;
  /** Cor do olho fechado de cada bicho; por padrão, a dos galhos. */
  readonly eye?: string;
  /** Quanto da árvore já cresceu, de 0 a 1. */
  readonly grown?: number;
  /**
   * Os dois galhos que carregam um custo (um chifre grande demais, uma cauda a
   * mais): sem valor, a árvore não os tem; de 0 a 1, o quanto cada um já foi
   * cortado, o da esquerda e o da direita.
   */
  readonly cut?: readonly [number, number];
};

const VIEW = { width: 1000, height: 720 };
const FORK = [500, 450] as const;
// A ponta de cada ramo: um bicho, de olhos fechados.
const TIPS = [
  [150, 300],
  [270, 150],
  [420, 80],
  [580, 80],
  [730, 150],
  [850, 300],
  [500, 230],
] as const;
// Os ramos caros, mais baixos e para fora: são os que a tesoura alcança.
const COSTLY = [
  { tip: [70, 520], side: -1, burden: "antler" },
  { tip: [930, 520], side: 1, burden: "tail" },
] as const;
/** Onde a tesoura corta cada ramo caro, em fração da largura e da altura do desenho. */
export const CUT_POINTS = [
  [0.3, 0.68],
  [0.7, 0.68],
] as const;
const BUD = 46;

const branch = (tip: readonly [number, number]) =>
  `M${FORK[0]},${FORK[1]} Q${(tip[0] + FORK[0]) / 2},${FORK[1] - 10} ${tip[0]},${tip[1]}`;

type BudProps = {
  readonly at: readonly [number, number];
  readonly fill: string;
  readonly eye: string;
};

/** O bicho na ponta do ramo: uma bolinha de olho fechado. */
const Bud: React.FC<BudProps> = ({ at, fill, eye }) => (
  <>
    <circle cx={at[0]} cy={at[1]} r={BUD} fill={fill} />
    <path
      d={`M${at[0] - 20},${at[1] - 2} Q${at[0]},${at[1] + 16} ${at[0] + 20},${at[1] - 2}`}
      fill="none"
      stroke={eye}
      strokeWidth={8}
      strokeLinecap="round"
    />
  </>
);

/**
 * A árvore da vida, simplificada: um tronco que se abre em ramos, e na ponta
 * de cada ramo um bicho de olhos fechados. A base do desenho é o pé do tronco.
 */
export const LifeTree: React.FC<LifeTreeProps> = ({
  width,
  color,
  bud,
  eye = color,
  grown = 1,
  cut,
}) => (
  <svg
    width={width}
    height={(width * VIEW.height) / VIEW.width}
    viewBox={`0 0 ${VIEW.width} ${VIEW.height}`}
    overflow="visible"
  >
    <g fill="none" stroke={color} strokeWidth={18} strokeLinecap="round">
      <path d={`M500,${VIEW.height} L${FORK[0]},${FORK[1]}`} />
      {TIPS.map((tip) => (
        <path
          key={tip[0]}
          d={branch(tip)}
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1 - grown}
        />
      ))}
    </g>
    {grown >= 1
      ? TIPS.map((tip) => <Bud key={tip[0]} at={tip} fill={bud} eye={eye} />)
      : null}
    {cut === undefined
      ? null
      : COSTLY.map(({ tip, side, burden }, index) => (
          <g
            key={burden}
            // O ramo cortado cai girando para fora e some.
            transform={`translate(0 ${260 * cut[index] ** 2}) rotate(${side * 50 * cut[index]} ${tip[0]} ${tip[1]})`}
            opacity={1 - cut[index]}
          >
            <path
              d={branch(tip)}
              fill="none"
              stroke={color}
              strokeWidth={18}
              strokeLinecap="round"
            />
            <g
              fill="none"
              stroke={bud}
              strokeWidth={16}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {burden === "antler" ? (
                <path
                  d={`M${tip[0] - 14},${tip[1] - 30} l-30,-110 m12,44 l-52,-30 m64,74 l44,-120 m-16,44 l56,-22`}
                />
              ) : (
                <path
                  d={`M${tip[0] + 30},${tip[1] + 20} q90,10 70,-70 q-14,-50 -56,-30 M${tip[0] + 20},${tip[1] + 34} q120,60 150,-40`}
                />
              )}
            </g>
            <Bud at={tip} fill={bud} eye={eye} />
          </g>
        ))}
  </svg>
);
