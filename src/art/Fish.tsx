import { useId } from "react";

export type FishColors = {
  readonly body: string;
  /** Dorso, nadadeiras e cauda. */
  readonly top: string;
  readonly belly: string;
  readonly fin: string;
  readonly stripe: string;
  readonly blush: string;
  readonly pupil: string;
  readonly mouth: string;
};

export type FishMood = "curious" | "scared" | "yawning" | "asleep";

type FishProps = {
  /** Comprimento do peixe, do focinho à ponta da cauda, em pixels do quadro. */
  readonly width: number;
  readonly colors: FishColors;
  readonly mood?: FishMood;
  /** Para onde a pupila olha, de -1 a 1 em cada eixo. */
  readonly look?: readonly [number, number];
  /** A piscada, de 0 (como o humor manda) a 1 (fechado). */
  readonly blink?: number;
  /** Ângulo da cauda, em graus: positivo balança para baixo. */
  readonly tail?: number;
};

// Simétrico em volta do centro do corpo, para o desenho ser posicionado por ele.
const VIEW = { x: -140, y: -110, width: 280, height: 220 };
const EYE = { x: -42, y: -12 };
// A cauda gira onde encontra o corpo.
const TAIL_BASE = { x: 66, y: 0 };

const eye = (
  mood: FishMood,
  look: readonly [number, number],
  blink: number,
  colors: FishColors,
) => {
  // Bocejando, a pálpebra desce até quase a metade; a piscada fecha o resto.
  const lid = Math.max(mood === "yawning" ? 0.45 : 0, blink);
  if (mood === "asleep" || lid > 0.9) {
    return (
      <path
        d={`M${EYE.x - 16},${EYE.y + 2} Q${EYE.x},${EYE.y + 14} ${EYE.x + 16},${EYE.y + 2}`}
        fill="none"
        stroke={colors.pupil}
        strokeWidth={6}
        strokeLinecap="round"
      />
    );
  }

  // Assustado, o olho cresce e a pupila encolhe.
  const radius = mood === "scared" ? 23 : 20;
  const pupil = mood === "scared" ? 8 : 11.5;
  const reach = radius - pupil - 2;
  const pupilX = EYE.x + look[0] * reach;
  const pupilY = EYE.y + look[1] * reach;
  const brow = mood === "scared" ? -10 : 0;
  const lidEdge = EYE.y - 22 + 44 * lid;
  return (
    <>
      <circle cx={EYE.x} cy={EYE.y} r={radius} fill="#FFFFFF" />
      <circle cx={pupilX} cy={pupilY} r={pupil} fill={colors.pupil} />
      <circle
        cx={pupilX - pupil * 0.38}
        cy={pupilY - pupil * 0.42}
        r={pupil * 0.34}
        fill="#FFFFFF"
      />
      {lid > 0 ? (
        <path
          d={`M${EYE.x - 22},${EYE.y - 22} L${EYE.x + 22},${EYE.y - 22} L${EYE.x + 22},${lidEdge} Q${EYE.x},${lidEdge + 6} ${EYE.x - 22},${lidEdge} Z`}
          fill={colors.body}
        />
      ) : null}
      <path
        d={`M${EYE.x - 24},${EYE.y - 24 + brow} Q${EYE.x - 2},${EYE.y - 34 + brow} ${EYE.x + 18},${EYE.y - 22 + brow}`}
        fill="none"
        stroke={colors.top}
        strokeWidth={6}
        strokeLinecap="round"
      />
    </>
  );
};

/** A boca do peixe é um ponto; ela abre no susto e no bocejo. */
const MOUTH: Record<FishMood, readonly [number, number]> = {
  curious: [5.5, 7.5],
  scared: [8, 10],
  yawning: [11, 15],
  asleep: [4, 5],
};

/**
 * Peixe pequeno de olho grande, de perfil, olhando para a esquerda. É a
 * testemunha das cenas de água: reage pelo que não tem rosto e dá escala.
 * O centro do desenho é o centro do corpo.
 */
export const Fish: React.FC<FishProps> = ({
  width,
  colors,
  mood = "curious",
  look = [-0.6, 0.5],
  blink = 0,
  tail = 0,
}) => {
  const clipId = useId();
  const scale = width / 214;
  const [mouthX, mouthY] = MOUTH[mood];

  return (
    <svg
      width={VIEW.width * scale}
      height={VIEW.height * scale}
      viewBox={`${VIEW.x} ${VIEW.y} ${VIEW.width} ${VIEW.height}`}
      overflow="visible"
    >
      <defs>
        <clipPath id={clipId}>
          <ellipse rx={82} ry={54} />
        </clipPath>
      </defs>
      <g transform={`rotate(${tail} ${TAIL_BASE.x} ${TAIL_BASE.y})`}>
        <path d="M66,0 L132,-50 Q112,0 132,50 Z" fill={colors.fin} />
        <path d="M78,0 L118,-28 Q106,0 118,28 Z" fill={colors.body} />
      </g>
      <path d="M-24,-46 Q8,-98 52,-44 Z" fill={colors.fin} />
      <ellipse rx={82} ry={54} fill={colors.body} />
      <g clipPath={`url(#${clipId})`}>
        <ellipse cx={14} cy={-46} rx={96} ry={40} fill={colors.top} />
        <ellipse cx={-8} cy={40} rx={76} ry={26} fill={colors.belly} />
        <path
          d="M8,-60 L24,-60 L14,60 L-2,60 Z"
          fill={colors.stripe}
          opacity={0.85}
        />
        <path
          d="M40,-60 L52,-60 L44,60 L32,60 Z"
          fill={colors.stripe}
          opacity={0.6}
        />
      </g>
      <ellipse
        cx={6}
        cy={16}
        rx={23}
        ry={12}
        transform="rotate(24 6 16)"
        fill={colors.fin}
      />
      <ellipse
        cx={-50}
        cy={16}
        rx={13}
        ry={7}
        fill={colors.blush}
        opacity={0.75}
      />
      {eye(mood, look, blink, colors)}
      <ellipse cx={-79} cy={10} rx={mouthX} ry={mouthY} fill={colors.mouth} />
    </svg>
  );
};
