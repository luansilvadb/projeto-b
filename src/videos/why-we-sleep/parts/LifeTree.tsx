import { clamp01 } from "../../../components/timing";

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
  /** Quanto do tronco já subiu do pé à forquilha, de 0 a 1. Por padrão, inteiro. */
  readonly trunk?: number;
  /**
   * Quantos bichos já brotaram na ponta dos ramos, da esquerda para a direita:
   * a parte inteira é quantos estão prontos, e a fração é o quanto o seguinte
   * já cresceu. Sem valor, brotam todos de uma vez quando a árvore termina.
   */
  readonly buds?: number;
  /**
   * Quantos bichos já fecharam os olhos, na mesma ordem e com a mesma fração.
   * Sem valor, todos estão de olhos fechados.
   */
  readonly closed?: number;
  /**
   * Quanto os galhos caros já cresceram, de 0 a 1: o ramo sai da forquilha e o
   * bicho brota na ponta, com o peso dele. Por padrão, inteiros.
   */
  readonly costly?: number;
  /**
   * Até onde o galho cortado cai, em unidades do desenho (a árvore tem 720 de
   * altura): com valor, ele cai inteiro até lá, girando, e quem o tira de
   * vista é a borda do quadro. Sem valor, cai um pouco e some no ar.
   */
  readonly dropTo?: number;
  /**
   * O instante, em segundos, para os bichos ressonarem: cada um cresce e
   * encolhe um nada, na própria fase. Sem valor, ficam parados.
   */
  readonly doze?: number;
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
// Que parte do crescimento de um galho caro é o ramo saindo da forquilha; o resto é o bicho brotando.
const COSTLY_BRANCH = 0.6;

const branch = (tip: readonly [number, number]) =>
  `M${FORK[0]},${FORK[1]} Q${(tip[0] + FORK[0]) / 2},${FORK[1] - 10} ${tip[0]},${tip[1]}`;

type BudProps = {
  readonly at: readonly [number, number];
  readonly fill: string;
  readonly eye: string;
  /** Quanto o bicho já brotou, de 0 a 1: cresce da ponta do ramo, com sobra. */
  readonly sprouted?: number;
  /** Quanto os olhos já fecharam, de 0 (dois pontos abertos) a 1 (o traço de quem dorme). */
  readonly shut?: number;
  /** A respiração de quem dorme: o tamanho do bicho, em fração, em volta de 1. */
  readonly swell?: number;
};

const unit = (value: number) => clamp01(value);

/** O bicho na ponta do ramo: uma bolinha de olho fechado. */
const Bud: React.FC<BudProps> = ({
  at,
  fill,
  eye,
  sprouted = 1,
  shut = 1,
  swell = 1,
}) => {
  // Brota passando do tamanho e volta, como toda entrada do vídeo.
  const size =
    swell *
    (sprouted < 0.7
      ? (sprouted / 0.7) * 1.12
      : 1.12 - ((sprouted - 0.7) / 0.3) * 0.12);
  // A pálpebra desce: os pontos achatam até sumir e o traço abre no lugar deles.
  const open = unit(1 - shut * 2);
  const arc = unit(shut * 2 - 1);
  return (
    <g
      transform={`translate(${at[0]} ${at[1]}) scale(${size}) translate(${-at[0]} ${-at[1]})`}
      opacity={sprouted > 0 ? 1 : 0}
    >
      <circle cx={at[0]} cy={at[1]} r={BUD} fill={fill} />
      {open > 0
        ? [-14, 14].map((side) => (
            <ellipse
              key={side}
              cx={at[0] + side}
              cy={at[1] + 2}
              rx={7}
              ry={8 * open}
              fill={eye}
            />
          ))
        : null}
      {arc > 0 ? (
        <path
          d={`M${at[0] - 20},${at[1] - 2} Q${at[0]},${at[1] - 2 + 18 * arc} ${at[0] + 20},${at[1] - 2}`}
          fill="none"
          stroke={eye}
          strokeWidth={8}
          strokeLinecap="round"
        />
      ) : null}
    </g>
  );
};

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
  trunk = 1,
  buds,
  closed,
  costly = 1,
  dropTo,
  doze,
}) => (
  <svg
    width={width}
    height={(width * VIEW.height) / VIEW.width}
    viewBox={`0 0 ${VIEW.width} ${VIEW.height}`}
    overflow="visible"
  >
    <g fill="none" stroke={color} strokeWidth={18} strokeLinecap="round">
      <path
        d={`M500,${VIEW.height} L${FORK[0]},${FORK[1]}`}
        pathLength={1}
        strokeDasharray={trunk < 1 ? 1 : undefined}
        strokeDashoffset={trunk < 1 ? 1 - trunk : undefined}
        opacity={trunk > 0 ? 1 : 0}
      />
      {TIPS.map((tip) => (
        <path
          key={tip[0]}
          d={branch(tip)}
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1 - grown}
          // Com o ramo ainda por nascer, a ponta redonda do traço não fica solta na forquilha.
          opacity={grown > 0 || trunk >= 1 ? 1 : 0}
        />
      ))}
    </g>
    {buds === undefined
      ? grown >= 1
        ? TIPS.map((tip, index) => (
            <Bud
              key={tip[0]}
              at={tip}
              fill={bud}
              eye={eye}
              shut={closed === undefined ? 1 : unit(closed - index)}
              swell={
                doze === undefined
                  ? 1
                  : 1 + 0.06 * Math.sin(doze * 1.4 + index * 1.7)
              }
            />
          ))
        : null
      : TIPS.map((tip, index) => (
          <Bud
            key={tip[0]}
            at={tip}
            fill={bud}
            eye={eye}
            sprouted={unit(buds - index)}
            shut={closed === undefined ? 1 : unit(closed - index)}
          />
        ))}
    {cut === undefined
      ? null
      : COSTLY.map(({ tip, side, burden }, index) => (
          <g
            key={burden}
            // O ramo cortado cai girando para fora: some no ar ou, com `dropTo`, cai até sair do quadro.
            transform={
              dropTo === undefined
                ? `translate(0 ${260 * cut[index] ** 2}) rotate(${side * 50 * cut[index]} ${tip[0]} ${tip[1]})`
                : `translate(${side * 60 * cut[index]} ${dropTo * cut[index]}) rotate(${side * 70 * cut[index]} ${tip[0]} ${tip[1]})`
            }
            opacity={
              // Caído de vez, o galho não existe mais: sem isto, sobraria parado onde a queda terminou.
              costly <= 0 || cut[index] >= 1
                ? 0
                : dropTo === undefined
                  ? 1 - cut[index]
                  : 1
            }
          >
            <path
              d={branch(tip)}
              fill="none"
              stroke={color}
              strokeWidth={18}
              strokeLinecap="round"
              pathLength={costly < 1 ? 1 : undefined}
              strokeDasharray={costly < 1 ? 1 : undefined}
              strokeDashoffset={
                costly < 1 ? 1 - unit(costly / COSTLY_BRANCH) : undefined
              }
            />
            <g
              fill="none"
              stroke={bud}
              strokeWidth={16}
              strokeLinecap="round"
              strokeLinejoin="round"
              // O peso (o chifre, a cauda) cresce do bicho, junto com ele.
              transform={
                costly < 1
                  ? `translate(${tip[0]} ${tip[1]}) scale(${unit((costly - COSTLY_BRANCH) / (1 - COSTLY_BRANCH))}) translate(${-tip[0]} ${-tip[1]})`
                  : undefined
              }
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
            <Bud
              at={tip}
              fill={bud}
              eye={eye}
              sprouted={
                costly < 1
                  ? unit((costly - COSTLY_BRANCH) / (1 - COSTLY_BRANCH))
                  : 1
              }
            />
          </g>
        ))}
  </svg>
);
