import { useId } from "react";
import { Place } from "../../../components/Place";
import { Pop } from "../../../components/Pop";
import { SvgLayer } from "../../../components/SvgLayer";
import { ink, lagoon, signs, type TagTone } from "../palette";
import { Tag } from "./Tag";
import { clamp01 } from "../../../components/timing";

/** A fração da vida que se passa dormindo: um terço. */
const SLEPT_SHARE = 1 / 3;

/**
 * Onde a barra fica quando ninguém diz outra coisa: de um lado ao outro do
 * quadro, na altura do peito de quem está em pé no centro (`STANDING`).
 */
const LIFE_BAR = { x: 160, y: 640, width: 1600, height: 150 };
/** Quem fica em pé na frente da barra: os pés e a altura. */
export const STANDING = { x: 960, y: 1040, height: 760 };

type Box = {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
};

type LifeBarProps = {
  /** Onde a barra fica, em pixels do quadro. Por padrão, `LIFE_BAR`. */
  readonly box?: Box;
  /** Quanto da barra já se desenhou, da esquerda para a direita, de 0 a 1. */
  readonly drawn?: number;
  /** Quanto do terço dormido, no fim da barra, já escureceu, de 0 a 1. */
  readonly asleep?: number;
  /**
   * Quanto o terço escuro já se acendeu em índigo, de 0 a 1: é o fechamento,
   * em que o terço deixa de ser um buraco na vida e ganha lua e estrelas.
   */
  readonly lit?: number;
  /** Quadro em que a etiqueta "um terço" entra, presa ao terço; sem valor, não há etiqueta. */
  readonly thirdAt?: number;
  /** O fundo sobre o qual a etiqueta fica. */
  readonly on?: TagTone;
  /**
   * Quanto do céu do terço aceso já entrou, de 0 a 1: as estrelas estouram
   * uma a uma, da esquerda para a direita, e a lua cresce por último. Por
   * padrão, inteiro: o céu só acompanha `lit`.
   */
  readonly sky?: number;
  /** O instante, em segundos, para as estrelas piscarem, cada uma na própria fase. Sem valor, paradas. */
  readonly twinkle?: number;
};

// As estrelas do terço aceso: posição em fração do terço e raio em fração da altura.
const STARS = [
  [0.14, 0.3, 0.05],
  [0.3, 0.68, 0.035],
  [0.44, 0.26, 0.04],
  [0.86, 0.7, 0.05],
  [0.9, 0.24, 0.03],
] as const;

// O céu entra em partes: cada estrela ocupa duas, a seguinte começa uma depois, e a lua fecha.
const SKY_PARTS = STARS.length + 2;

/** A entrada com sobra de uma peça do céu, num trecho do caminho de 0 a 1: do nada, passa do tamanho e assenta. */
const entered = (sky: number, from: number, to: number): number => {
  const t = clamp01((sky - from) / (to - from));
  return t < 0.7 ? (t / 0.7) * 1.25 : 1.25 - ((t - 0.7) / 0.3) * 0.25;
};

/**
 * A vida inteira numa barra só: o tempo acordado em coral e, no fim dela, o
 * terço dormido. No gancho o terço escurece; no fechamento ele se acende em
 * índigo. É o mesmo desenho nas duas voltas.
 */
export const LifeBar: React.FC<LifeBarProps> = ({
  box = LIFE_BAR,
  drawn = 1,
  asleep = 1,
  lit = 0,
  thirdAt,
  on = "peach",
  sky = 1,
  twinkle,
}) => {
  const id = useId();
  const { x, y, width, height } = box;
  const slept = width * SLEPT_SHARE * asleep;
  const sleptX = x + width - slept;
  const thirdX = x + width * (1 - SLEPT_SHARE);
  const thirdWidth = width * SLEPT_SHARE;

  return (
    <>
      <SvgLayer>
        <defs>
          <clipPath id={`${id}-bar`}>
            <rect
              x={x}
              y={y}
              width={width * drawn}
              height={height}
              rx={height / 2}
            />
          </clipPath>
          <radialGradient id={`${id}-glow`}>
            <stop offset={0} stopColor={ink.moon} stopOpacity={0.6} />
            <stop offset={1} stopColor={ink.moon} stopOpacity={0} />
          </radialGradient>
        </defs>
        {/* O halo do terço aceso: fica atrás da barra e só existe no fechamento. */}
        <ellipse
          cx={thirdX + thirdWidth / 2}
          cy={y + height / 2}
          rx={thirdWidth * 0.72}
          ry={height * 1.5}
          fill={`url(#${id}-glow)`}
          opacity={lit}
        />
        <g clipPath={`url(#${id}-bar)`}>
          <rect x={x} y={y} width={width} height={height} fill={ink.tag} />
          {/* O volume da barra: sombra embaixo, faixa de luz em cima. */}
          <rect
            x={x}
            y={y + height * 0.66}
            width={width}
            height={height * 0.34}
            fill={ink.tagEdge}
          />
          <rect
            x={x + height * 0.4}
            y={y + height * 0.16}
            width={width - height * 0.8}
            height={height * 0.12}
            rx={height * 0.06}
            fill={ink.ring}
            opacity={0.35}
          />
          {/* O terço dormido: escuro no gancho. */}
          <rect
            x={sleptX}
            y={y}
            width={slept}
            height={height}
            fill={lagoon.night.water[3]}
          />
          {/* O mesmo terço, aceso em índigo, com a lua e as estrelas da noite. */}
          <g opacity={lit}>
            <rect
              x={sleptX}
              y={y}
              width={slept}
              height={height}
              fill={signs.seal[0]}
            />
            <rect
              x={sleptX}
              y={y + height * 0.66}
              width={slept}
              height={height * 0.34}
              fill={lagoon.night.water[0]}
            />
            {STARS.map(([sx, sy, r], index) => (
              <circle
                key={sx}
                cx={thirdX + thirdWidth * sx}
                cy={y + height * sy}
                r={
                  height *
                  r *
                  entered(sky, index / SKY_PARTS, (index + 2) / SKY_PARTS) *
                  (twinkle === undefined
                    ? 1
                    : 1 +
                      0.22 *
                        Math.sin(twinkle * (1.9 + index * 0.37) + index * 2.1))
                }
                fill={ink.moon}
              />
            ))}
            <g
              transform={`translate(${thirdX + thirdWidth * 0.64} ${y + height * 0.48}) scale(${(height / 150) * entered(sky, (STARS.length - 1) / SKY_PARTS, 1)})`}
            >
              <path
                d="M10,-46 A46,46 0 1 0 46,14 A38,38 0 1 1 10,-46 Z"
                fill={ink.moon}
              />
            </g>
          </g>
        </g>
      </SvgLayer>
      {thirdAt === undefined ? null : (
        <Place x={thirdX + thirdWidth / 2} y={y - 70}>
          <Pop at={thirdAt}>
            <Tag size="note" on={on}>
              um terço
            </Tag>
          </Pop>
        </Place>
      )}
    </>
  );
};
