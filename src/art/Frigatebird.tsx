import { taperPath, type Point } from "./shapes";

export type FrigatebirdColors = {
  readonly body: string;
  readonly shade: string;
  readonly light: string;
  /** O peito claro da fêmea, que foi a acompanhada no estudo. */
  readonly breast: string;
  readonly beak: string;
  readonly eye: string;
  readonly pupil: string;
};

type FrigatebirdProps = {
  /** Envergadura planando, ou comprimento do bico à cauda pousada, em pixels do quadro. */
  readonly width: number;
  readonly colors: FrigatebirdColors;
  /** Planando, vista de cima, com as asas abertas em W; pousada, vista de lado, com as asas recolhidas. */
  readonly pose?: "gliding" | "perched";
  /** Quanto a pálpebra cobre o olho, de 0 a 1: o cochilo em pleno voo. */
  readonly lid?: number;
  /** Planando: quanto as asas se inclinam para trás, de -1 a 1, como quem ajusta o voo. */
  readonly sweep?: number;
};

// Planando: vista de cima, voando para a esquerda; a origem é o centro do corpo.
const GLIDING = { x: -360, y: -380, width: 720, height: 760, span: 680 };
// Pousada: de lado, olhando para a esquerda; a origem é onde os pés agarram o galho.
const PERCHED = { x: -200, y: -300, width: 400, height: 320, length: 360 };

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
 * em forquilha, bico comprido com a ponta em gancho. Planando é vista de cima,
 * como quem a olha do alto; pousada, de lado.
 */
export const Frigatebird: React.FC<FrigatebirdProps> = ({
  width,
  colors,
  pose = "gliding",
  lid = 0.1,
  sweep = 0,
}) => {
  if (pose === "perched") {
    return <Perched width={width} colors={colors} lid={lid} />;
  }
  const scale = width / GLIDING.span;

  // Cada asa sai do ombro para fora em dois trechos: até o punho, à frente, e dali até a ponta afilada, para trás.
  const wing = (side: 1 | -1) => {
    const wrist: Point = [-70 + 30 * sweep, side * 140];
    const tip: Point = [120 + 70 * sweep, side * 330];
    const arm = taperPath([0, side * 20], [-50, side * 80], wrist, 96, 56);
    const hand = taperPath(wrist, [-20 + 30 * sweep, side * 250], tip, 56, 6);
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
      {eye([-124, -16], 9, lid, colors, colors.body)}
    </svg>
  );
};

type PerchedProps = {
  readonly width: number;
  readonly colors: FrigatebirdColors;
  readonly lid: number;
};

/** Pousada: de lado, asas recolhidas ao longo do corpo, agarrada a um galho. */
const Perched: React.FC<PerchedProps> = ({ width, colors, lid }) => {
  const scale = width / PERCHED.length;

  return (
    <svg
      width={PERCHED.width * scale}
      height={PERCHED.height * scale}
      viewBox={`${PERCHED.x} ${PERCHED.y} ${PERCHED.width} ${PERCHED.height}`}
      overflow="visible"
    >
      {/* Cauda em forquilha, caída atrás. */}
      <path
        d="M60,-150 C100,-130 150,-90 190,-30 C160,-60 130,-80 110,-90 C120,-60 130,-30 150,10 C110,-40 80,-90 50,-130 Z"
        fill={colors.shade}
      />
      {/* Corpo em fuso inclinado, peito claro à frente. */}
      <path
        d="M-120,-200 C-90,-250 -20,-260 40,-230 C90,-204 100,-150 70,-110 C40,-70 -40,-60 -90,-90 C-130,-114 -140,-160 -120,-200 Z"
        fill={colors.body}
      />
      <path
        d="M-120,-190 C-110,-130 -70,-90 -10,-80 C-50,-70 -100,-90 -118,-130 Z"
        fill={colors.breast}
      />
      {/* A asa recolhida ao longo do dorso. */}
      <path
        d="M-60,-230 C-10,-250 50,-230 90,-190 C130,-150 160,-110 180,-70 C140,-100 100,-120 60,-130 C20,-140 -30,-170 -60,-230 Z"
        fill={colors.shade}
      />
      <path
        d="M-40,-224 C10,-236 60,-214 96,-180 C60,-196 20,-206 -40,-224 Z"
        fill={colors.light}
        opacity={0.5}
      />
      {/* Cabeça e bico. */}
      <circle cx={-134} cy={-250} r={30} fill={colors.body} />
      <path
        d="M-156,-258 C-196,-264 -236,-262 -268,-252 C-280,-248 -284,-240 -276,-234 C-266,-238 -256,-240 -246,-240 L-158,-234 Z"
        fill={colors.beak}
      />
      {eye([-130, -260], 9, lid, colors, colors.body)}
      {/* Pés agarrados ao galho. */}
      {[-40, -10].map((x) => (
        <path
          key={x}
          d={taperPath([x, -80], [x - 6, -40], [x - 10, -4], 14, 8)}
          fill={colors.beak}
        />
      ))}
    </svg>
  );
};
