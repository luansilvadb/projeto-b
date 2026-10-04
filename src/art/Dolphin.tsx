import { useId } from "react";
import { taperPath, type Point } from "./shapes";

export type DolphinColors = {
  readonly back: string;
  readonly belly: string;
  readonly shade: string;
  readonly light: string;
  readonly eye: string;
  readonly pupil: string;
  readonly mouth: string;
};

type DolphinProps = {
  /** Comprimento do bico à cauda, em pixels do quadro. */
  readonly width: number;
  readonly colors: DolphinColors;
  /** Quanto a pálpebra cobre o olho, de 0 a 1. Cada lado do cérebro dorme por vez: aqui é o olho visível. */
  readonly lid?: number;
  readonly look?: Point;
  /** Batida da cauda, em graus: positivo para baixo. */
  readonly tail?: number;
  /** A boca: 0 fechada, 1 aberta no bocejo. */
  readonly mouth?: number;
};

// O desenho é simétrico em volta do centro do corpo; de perfil, olhando para a esquerda.
const VIEW = { x: -260, y: -140, width: 520, height: 280 };
const EYE = { x: -150, y: -20, radius: 12 };
const TAIL_BASE: Point = [150, 4];

/**
 * O golfinho, de perfil: corpo em fuso, bico, testa redonda, nadadeira dorsal
 * curva e cauda em meia-lua. O sorriso é a linha da boca, que ele tem de
 * verdade. O centro do desenho é o centro do corpo.
 */
export const Dolphin: React.FC<DolphinProps> = ({
  width,
  colors,
  lid = 0.1,
  look = [-0.4, 0.2],
  tail = 0,
  mouth = 0,
}) => {
  const id = useId();
  const scale = width / 500;
  const pupilX = EYE.x + look[0] * 5;
  const pupilY = EYE.y + look[1] * 5;

  return (
    <svg
      width={VIEW.width * scale}
      height={VIEW.height * scale}
      viewBox={`${VIEW.x} ${VIEW.y} ${VIEW.width} ${VIEW.height}`}
      overflow="visible"
    >
      <defs>
        <clipPath id={id}>
          <path d={BODY} />
        </clipPath>
      </defs>

      {/* Cauda: a nadadeira horizontal, vista de lado e um pouco de cima, girando onde encontra o corpo. */}
      <g transform={`rotate(${tail} ${TAIL_BASE[0]} ${TAIL_BASE[1]})`}>
        <path
          d="M150,-10 C180,-14 204,-22 226,-40 C246,-56 258,-58 262,-52 C254,-36 240,-20 232,-8 C240,0 248,14 254,28 C250,34 238,30 222,20 C202,8 180,4 150,12 Z"
          fill={colors.back}
        />
        <path
          d="M170,2 C196,6 216,10 232,-8 C214,-18 194,-12 170,2 Z"
          fill={colors.shade}
          opacity={0.5}
        />
      </g>

      {/* Nadadeira de trás, mais escura. */}
      <path
        d={taperPath([-60, 30], [-30, 62], [-6, 88], 34, 10)}
        fill={colors.shade}
      />

      <path d={BODY} fill={colors.back} />
      <g clipPath={`url(#${id})`}>
        {/* A barriga clara sobe até a boca e afina para a cauda. */}
        <path
          d="M-260,6 C-220,10 -180,20 -140,28 C-80,40 0,44 80,32 C120,26 150,16 180,4 L180,120 L-260,120 Z"
          fill={colors.belly}
        />
        <path
          d="M-150,-60 C-80,-84 20,-84 100,-56 C30,-70 -60,-72 -150,-52 Z"
          fill={colors.light}
        />
        {/* Sombra na base da cauda. */}
        <path
          d="M100,-40 C130,-20 150,-4 172,6 L172,-60 Z"
          fill={colors.shade}
          opacity={0.35}
        />
      </g>

      {/* Nadadeira dorsal: baixa e curva para trás, em foice. */}
      <path
        d="M10,-70 C30,-104 60,-122 96,-126 C78,-110 70,-92 72,-66 Z"
        fill={colors.back}
      />
      {/* Nadadeira da frente. */}
      <path
        d={taperPath([-90, 34], [-60, 66], [-30, 92], 36, 10)}
        fill={colors.back}
      />

      {/* A boca: a linha do sorriso, que abre no bocejo. */}
      <path
        d={`M-250,10 C-226,${16 + 10 * mouth} -200,${20 + 14 * mouth} -172,${12 + 6 * mouth}`}
        fill="none"
        stroke={colors.mouth}
        strokeWidth={5}
        strokeLinecap="round"
      />
      {mouth > 0 ? (
        <path
          d={`M-246,10 C-226,${14 + 12 * mouth} -200,${18 + 18 * mouth} -176,12 Z`}
          fill={colors.mouth}
        />
      ) : null}

      {/* Olho, perto do bico, com pálpebra. */}
      <circle cx={EYE.x} cy={EYE.y} r={EYE.radius} fill={colors.eye} />
      <circle cx={pupilX} cy={pupilY} r={7} fill={colors.pupil} />
      <circle cx={pupilX - 2.5} cy={pupilY - 2.5} r={2.5} fill={colors.eye} />
      {lid > 0 ? (
        <path
          d={`M${EYE.x - 14},${EYE.y - 14} L${EYE.x + 14},${EYE.y - 14} L${EYE.x + 14},${EYE.y - 14 + 28 * lid} Q${EYE.x},${EYE.y - 10 + 28 * lid} ${EYE.x - 14},${EYE.y - 14 + 28 * lid} Z`}
          fill={colors.back}
        />
      ) : null}
      {lid > 0.9 ? (
        <path
          d={`M${EYE.x - 11},${EYE.y + 2} Q${EYE.x},${EYE.y + 10} ${EYE.x + 11},${EYE.y + 2}`}
          fill="none"
          stroke={colors.shade}
          strokeWidth={4}
          strokeLinecap="round"
        />
      ) : null}
    </svg>
  );
};

// Corpo em fuso: bico fino à esquerda, testa redonda (o melão), afinando muito até a cauda.
const BODY =
  "M-256,8 C-236,-6 -214,-20 -186,-32 C-160,-62 -110,-76 -50,-74 C30,-72 100,-50 140,-26 C156,-16 166,-6 170,0 C160,10 148,18 130,26 C80,48 0,60 -70,54 C-120,50 -170,40 -200,28 C-224,20 -244,14 -256,8 Z";
