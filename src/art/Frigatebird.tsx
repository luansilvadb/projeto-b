import { taperPath, type Point } from "./shapes";

export type FrigatebirdColors = {
  readonly body: string;
  readonly shade: string;
  readonly light: string;
  readonly beak: string;
  readonly eye: string;
  readonly pupil: string;
};

type FrigatebirdProps = {
  /** Envergadura, em pixels do quadro. */
  readonly width: number;
  readonly colors: FrigatebirdColors;
};

// Vista de cima, voando para a esquerda; a origem é o centro do corpo.
const GLIDING = { x: -360, y: -380, width: 720, height: 760, span: 680 };

const eye = (
  at: Point,
  radius: number,
  lid: number,
  colors: FrigatebirdColors,
  skin: string,
) => (
  <>
    <circle cx={at[0]} cy={at[1]} r={radius} fill={colors.eye} />
    <circle cx={at[0] - 2} cy={at[1]} r={radius * 0.55} fill={colors.pupil} />
    <circle cx={at[0] - 4} cy={at[1] - 2} r={radius * 0.2} fill={colors.eye} />
    {lid > 0 ? (
      <path
        d={`M${at[0] - radius - 2},${at[1] - radius - 2} L${at[0] + radius + 2},${at[1] - radius - 2} L${at[0] + radius + 2},${at[1] - radius - 2 + (2 * radius + 4) * lid} Q${at[0]},${at[1] - radius + 1 + (2 * radius + 4) * lid} ${at[0] - radius - 2},${at[1] - radius - 2 + (2 * radius + 4) * lid} Z`}
        fill={skin}
      />
    ) : null}
  </>
);

/**
 * A fragata: corpo em fuso preto-azulado, asas longas e anguladas em W, cauda
 * em forquilha, bico comprido com a ponta em gancho. Vista de cima, como
 * quem a olha do alto.
 */
export const Frigatebird: React.FC<FrigatebirdProps> = ({
  width,
  colors,
}) => {
  const scale = width / GLIDING.span;

  // Cada asa sai do ombro para fora em dois trechos: até o punho, à frente, e dali até a ponta afilada, para trás.
  const wing = (side: 1 | -1) => {
    const wrist: Point = [-70, side * 140];
    const tip: Point = [120, side * 330];
    const arm = taperPath([0, side * 20], [-50, side * 80], wrist, 96, 56);
    const hand = taperPath(wrist, [-20, side * 250], tip, 56, 6);
    return (
      <g key={side}>
        <path d={arm} fill={colors.body} />
        <path d={hand} fill={colors.body} />
        {/* A borda de luz na frente da asa, e a sombra ao longo de trás. */}
        <path
          d={taperPath(
            [-40, side * 24],
            [wrist[0] - 22, wrist[1] - side * 10],
            [tip[0] - 24, tip[1] - side * 18],
            14,
            3,
          )}
          fill={colors.light}
          opacity={0.7}
        />
        <path
          d={taperPath(
            [34, side * 40],
            [wrist[0] + 30, wrist[1] + side * 6],
            [tip[0] - 6, tip[1] - side * 4],
            34,
            3,
          )}
          fill={colors.shade}
          opacity={0.8}
        />
      </g>
    );
  };

  return (
    <svg
      width={GLIDING.width * scale}
      height={GLIDING.height * scale}
      viewBox={`${GLIDING.x} ${GLIDING.y} ${GLIDING.width} ${GLIDING.height}`}
      overflow="visible"
    >
      {wing(-1)}
      {wing(1)}

      {/* Cauda em forquilha, vista de cima. */}
      <path
        d="M70,-8 C110,-12 150,-40 200,-90 C176,-44 160,-16 146,0 C160,16 176,44 200,90 C150,40 110,12 70,8 Z"
        fill={colors.shade}
      />

      {/* Corpo em fuso, com a borda de luz no dorso. */}
      <path
        d="M-120,0 C-100,-36 -50,-50 10,-48 C60,-46 100,-30 110,0 C100,30 60,46 10,48 C-50,50 -100,36 -120,0 Z"
        fill={colors.body}
      />
      <path
        d="M-100,-10 C-70,-34 -20,-40 40,-36 C0,-30 -50,-24 -100,-10 Z"
        fill={colors.light}
        opacity={0.6}
      />

      {/* Cabeça virada um pouco, para o olho aparecer, e o bico em gancho. */}
      <circle cx={-128} cy={-6} r={30} fill={colors.body} />
      <path
        d="M-150,-14 C-190,-20 -230,-18 -262,-8 C-274,-4 -278,4 -270,10 C-260,6 -250,4 -240,4 L-152,10 Z"
        fill={colors.beak}
      />
      <path
        d="M-154,4 C-190,2 -224,2 -250,4 C-230,10 -200,14 -156,12 Z"
        fill={colors.shade}
        opacity={0.4}
      />
      {eye([-124, -16], 9, 0.1, colors, colors.body)}
    </svg>
  );
};
