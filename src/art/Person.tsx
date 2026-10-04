import { useId } from "react";
import { taperPath, type Point } from "./shapes";

export type PersonColors = {
  readonly skin: string;
  readonly skinShade: string;
  /** A pálpebra: um tom entre a pele e a sombra dela. */
  readonly lid: string;
  readonly blush: string;
  readonly hair: string;
  readonly hairLight: string;
  readonly top: string;
  readonly topShade: string;
  readonly topLight: string;
  readonly pants: string;
  readonly pantsShade: string;
  readonly shoe: string;
  readonly shoeShade: string;
  /** As mãos: a cor da pele, ou a da luva. */
  readonly hand: string;
  readonly handShade: string;
  readonly eye: string;
  readonly pupil: string;
  readonly mouth: string;
};

export type Expression =
  | "neutral"
  | "curious"
  | "puzzled"
  | "surprised"
  | "sleepy"
  | "yawning"
  | "asleep"
  | "reading";

type Arm = {
  /** Onde a mão fica, em unidades do desenho: a origem é o chão entre os pés, e y sobe para o negativo. */
  readonly hand: Point;
  /** Quanto o cotovelo abre para fora do corpo. */
  readonly bend?: number;
};

type PersonProps = {
  /** Altura da figura, dos pés ao alto do cabelo, em pixels do quadro. */
  readonly height: number;
  readonly colors: PersonColors;
  readonly expression?: Expression;
  /** O braço do lado de quem olha: fica na frente do corpo. */
  readonly frontArm?: Arm;
  /** O braço do outro lado: fica atrás do tronco. */
  readonly backArm?: Arm;
  /** Avental sobre a roupa: a cor e a do bolso. */
  readonly apron?: readonly [string, string];
  /** Coque no lugar do topete. */
  readonly bun?: boolean;
  /** Figurante: dois pontos no lugar do rosto. */
  readonly plainFace?: boolean;
  /** O que a figura segura, em SVG e nas unidades do desenho: fica entre o tronco e o braço da frente. */
  readonly held?: React.ReactNode;
  /** O que ela segura cobre o braço da frente, e só a mão aparece por cima: uma placa, uma prancheta. */
  readonly heldInFront?: boolean;
  /** A piscada, de 0 (como a expressão manda) a 1 (fechado). */
  readonly blink?: number;
  /** Figurante de mau humor: com o rosto de dois pontos, ganha sobrancelhas juntas e boca caída. */
  readonly grumpy?: boolean;
  /** Óculos redondos: a cor da armação. */
  readonly glasses?: string;
};

// A figura cabe nesta caixa, com os pés no meio da base.
const VIEW = { width: 400, height: 650 };
const FRONT_SHOULDER: Point = [-70, -346];
const BACK_SHOULDER: Point = [72, -338];
// Em pé e à vontade: um braço solto, o outro com a mão na cintura.
const RELAXED: { front: Required<Arm>; back: Required<Arm> } = {
  front: { hand: [-136, -214], bend: 26 },
  back: { hand: [100, -214], bend: 73 },
};
const EYE = { gap: 42, radius: 27, y: -462 };

type Face = {
  /** Quanto a pálpebra cobre o olho, de 0 a 1. */
  readonly lid: number;
  readonly closed?: boolean;
  /** Para onde as pupilas olham, de -1 a 1 em cada eixo. */
  readonly look: Point;
  readonly pupil: number;
  /** Altura das pontas de cada sobrancelha: de fora e de dentro, esquerda e direita. */
  readonly brows: readonly [number, number, number, number];
  readonly mouth: "smile" | "side" | "open" | "small" | "yawn";
  /** Inclinação da cabeça, em graus. */
  readonly tilt: number;
  /** Quanto os ombros caem. */
  readonly slump: number;
};

const FACES: Record<Expression, Face> = {
  neutral: {
    lid: 0.1,
    look: [0, 0],
    pupil: 13,
    brows: [0, 0, 0, 0],
    mouth: "smile",
    tilt: 0,
    slump: 0,
  },
  curious: {
    lid: 0,
    look: [0.7, -0.35],
    pupil: 13,
    brows: [0, 0, -4, -16],
    mouth: "side",
    tilt: 7,
    slump: 0,
  },
  puzzled: {
    lid: 0.25,
    look: [0.6, -0.5],
    pupil: 12,
    brows: [-10, 2, 6, -6],
    mouth: "side",
    tilt: -8,
    slump: 0,
  },
  surprised: {
    lid: 0,
    look: [0, -0.1],
    pupil: 9,
    brows: [-14, -16, -16, -14],
    mouth: "open",
    tilt: 0,
    slump: 0,
  },
  sleepy: {
    lid: 0.58,
    look: [0, 0.55],
    pupil: 13,
    brows: [6, -2, -2, 6],
    mouth: "small",
    tilt: -9,
    slump: 10,
  },
  yawning: {
    lid: 0.8,
    look: [0, 0.6],
    pupil: 13,
    brows: [-2, -10, -10, -2],
    mouth: "yawn",
    tilt: -6,
    slump: 6,
  },
  asleep: {
    lid: 1,
    closed: true,
    look: [0, 0],
    pupil: 13,
    brows: [4, 0, 0, 4],
    mouth: "small",
    tilt: 12,
    slump: 12,
  },
  reading: {
    lid: 0.45,
    look: [-0.5, 0.8],
    pupil: 13,
    brows: [0, 0, 0, 0],
    mouth: "small",
    tilt: -6,
    slump: 0,
  },
};

/** A pálpebra desce da posição da expressão até fechar; no fim da descida o olho vira um traço. */
const blinking = (face: Face, blink: number): Face =>
  blink <= 0
    ? face
    : {
        ...face,
        lid: face.lid + (1 - face.lid) * blink,
        closed: face.closed || blink > 0.9,
      };

/** O cotovelo: o meio do caminho entre o ombro e a mão, empurrado para fora. */
const elbow = (shoulder: Point, hand: Point, bend: number): Point => {
  const dx = hand[0] - shoulder[0];
  const dy = hand[1] - shoulder[1];
  const length = Math.hypot(dx, dy) || 1;
  return [
    (shoulder[0] + hand[0]) / 2 - (dy / length) * bend,
    (shoulder[1] + hand[1]) / 2 + (dx / length) * bend,
  ];
};

/** A mão fica um pouco além da ponta da manga, na direção do braço. */
const handCenter = (from: Point, hand: Point): Point => {
  const dx = hand[0] - from[0];
  const dy = hand[1] - from[1];
  const length = Math.hypot(dx, dy) || 1;
  return [hand[0] + (dx / length) * 14, hand[1] + (dy / length) * 14];
};

const eyes = (face: Face, colors: PersonColors, clipId: string) =>
  [-1, 1].map((side) => {
    const x = side * EYE.gap;
    const { radius, y } = EYE;
    const brows = side < 0 ? face.brows.slice(0, 2) : face.brows.slice(2);
    const brow = (
      <line
        x1={x - radius * 0.75}
        y1={y - radius - 16 + brows[0]}
        x2={x + radius * 0.75}
        y2={y - radius - 16 + brows[1]}
        stroke={colors.hair}
        strokeWidth={8}
        strokeLinecap="round"
      />
    );
    const blush = (
      <ellipse
        cx={x + side * radius * 1.1}
        cy={y + radius * 1.25}
        rx={radius * 0.72}
        ry={radius * 0.42}
        fill={colors.blush}
        opacity={0.55}
      />
    );
    if (face.closed) {
      return (
        <g key={side}>
          <path
            d={`M${x - radius * 0.8},${y} Q${x},${y + radius * 0.55} ${x + radius * 0.8},${y}`}
            fill="none"
            stroke={colors.hair}
            strokeWidth={7}
            strokeLinecap="round"
          />
          {brow}
          {blush}
        </g>
      );
    }

    const pupilX = x + face.look[0] * radius * 0.36;
    const pupilY = y + face.look[1] * radius * 0.36;
    const lidEdge = y - radius + 2 * radius * face.lid;
    return (
      <g key={side}>
        <clipPath id={`${clipId}-${side}`}>
          <circle cx={x} cy={y} r={radius} />
        </clipPath>
        <circle cx={x} cy={y} r={radius} fill={colors.eye} />
        <g clipPath={`url(#${clipId}-${side})`}>
          <circle cx={pupilX} cy={pupilY} r={face.pupil} fill={colors.pupil} />
          <circle
            cx={pupilX - face.pupil * 0.4}
            cy={pupilY - face.pupil * 0.45}
            r={face.pupil * 0.36}
            fill={colors.eye}
          />
          {face.lid > 0 ? (
            <path
              d={`M${x - radius - 2},${y - radius - 2} L${x + radius + 2},${y - radius - 2} L${x + radius + 2},${lidEdge} Q${x},${lidEdge + 6} ${x - radius - 2},${lidEdge} Z`}
              fill={colors.lid}
            />
          ) : null}
        </g>
        {brow}
        {blush}
      </g>
    );
  });

const mouth = (shape: Face["mouth"], color: string) => {
  const y = EYE.y + EYE.radius * 1.85;
  const stroke = {
    fill: "none",
    stroke: color,
    strokeLinecap: "round",
  } as const;
  switch (shape) {
    case "smile":
      return (
        <path
          d={`M-17,${y} Q0,${y + 15} 17,${y}`}
          strokeWidth={7}
          {...stroke}
        />
      );
    case "side":
      return (
        <path
          d={`M2,${y + 3} Q14,${y + 9} 26,${y - 1}`}
          strokeWidth={7}
          {...stroke}
        />
      );
    case "small":
      return (
        <path
          d={`M-9,${y + 3} Q0,${y + 7} 9,${y + 3}`}
          strokeWidth={6}
          {...stroke}
        />
      );
    case "open":
      return <ellipse cy={y + 5} rx={10} ry={13} fill={color} />;
    case "yawn":
      return <ellipse cy={y + 10} rx={17} ry={22} fill={color} />;
  }
};

/**
 * A pessoa que faz o papel de "você": cabeça grande, tronco numa forma só,
 * braços e pernas em tubo. O rosto muda pela pálpebra, pela sobrancelha e pela
 * boca; a pose, pelas mãos. A base do desenho é o chão entre os pés.
 */
export const Person: React.FC<PersonProps> = ({
  height,
  colors,
  expression = "neutral",
  frontArm,
  backArm,
  apron,
  bun = false,
  plainFace = false,
  held,
  heldInFront = false,
  blink = 0,
  grumpy = false,
  glasses,
}) => {
  const id = useId();
  const face = blinking(FACES[expression], blink);
  const scale = height / VIEW.height;
  const front = { ...RELAXED.front, ...frontArm };
  const back = { ...RELAXED.back, ...backArm };
  const frontShoulder: Point = [
    FRONT_SHOULDER[0],
    FRONT_SHOULDER[1] + face.slump,
  ];
  const backShoulder: Point = [BACK_SHOULDER[0], BACK_SHOULDER[1] + face.slump];
  const frontElbow = elbow(frontShoulder, front.hand, front.bend);
  // O braço de trás abre para o outro lado.
  const backElbow = elbow(backShoulder, back.hand, -back.bend);
  const frontHand = handCenter(frontElbow, front.hand);
  const backHand = handCenter(backElbow, back.hand);
  const shoulderY = -380 + face.slump;
  const torso = `M-82,${shoulderY + 28} Q-84,${shoulderY + 2} -56,${shoulderY} L56,${shoulderY} Q84,${shoulderY + 2} 82,${shoulderY + 28} L98,-190 Q100,-164 74,-164 L-74,-164 Q-100,-164 -98,-190 Z`;

  return (
    <svg
      width={VIEW.width * scale}
      height={height}
      viewBox={`${-VIEW.width / 2} ${-VIEW.height} ${VIEW.width} ${VIEW.height}`}
      overflow="visible"
    >
      <defs>
        <clipPath id={`${id}-torso`}>
          <path d={torso} />
        </clipPath>
      </defs>

      {/* O peso fica numa perna; a outra abre um pouco. */}
      <path
        d={taperPath([44, -196], [60, -112], [70, -34], 60, 46)}
        fill={colors.pantsShade}
      />
      <rect
        x={36}
        y={-38}
        width={80}
        height={38}
        rx={19}
        fill={colors.shoeShade}
      />
      <path
        d={taperPath([-40, -196], [-42, -110], [-42, -34], 60, 46)}
        fill={colors.pants}
      />
      <rect x={-88} y={-38} width={78} height={38} rx={19} fill={colors.shoe} />

      {/* O tronco inclina um pouco sobre o quadril, para a figura não ficar dura. */}
      <g transform="rotate(2.5 0 -180)">
        <path
          d={taperPath(backShoulder, backElbow, back.hand, 46, 36)}
          fill={colors.topShade}
        />
        <circle
          cx={backHand[0]}
          cy={backHand[1]}
          r={22}
          fill={colors.handShade}
        />
        <rect
          x={-24}
          y={-404}
          width={48}
          height={40}
          rx={12}
          fill={colors.skinShade}
        />

        <path d={torso} fill={colors.top} />
        <g clipPath={`url(#${id}-torso)`}>
          <path
            d="M36,-392 C74,-300 60,-220 46,-160 L110,-160 L110,-392 Z"
            fill={colors.topShade}
          />
          <path
            d={`M-40,${shoulderY - 2} Q0,${shoulderY + 28} 40,${shoulderY - 2} L40,${shoulderY - 14} L-40,${shoulderY - 14} Z`}
            fill={colors.topLight}
          />
        </g>
        {apron ? (
          <>
            <path
              d={`M-30,${shoulderY} L-44,-330 L-58,-200 Q-60,-174 -38,-174 L42,-174 Q64,-174 62,-200 L46,-330 L30,${shoulderY} L18,${shoulderY} L26,-330 L-26,-330 L-18,${shoulderY} Z`}
              fill={apron[0]}
            />
            <rect
              x={-24}
              y={-270}
              width={50}
              height={40}
              rx={10}
              fill={apron[1]}
            />
          </>
        ) : null}

        {heldInFront ? null : held}

        {/* A sombra do braço sobre o tronco: sem ela, os dois têm a mesma cor e o braço some. */}
        <g clipPath={`url(#${id}-torso)`}>
          <path
            d={taperPath(frontShoulder, frontElbow, front.hand, 46, 34)}
            fill={colors.topShade}
            transform="translate(8 10)"
          />
        </g>
        <circle
          cx={frontShoulder[0]}
          cy={frontShoulder[1]}
          r={24}
          fill={colors.top}
        />
        <path
          d={taperPath(frontShoulder, frontElbow, front.hand, 46, 34)}
          fill={colors.top}
        />
        {heldInFront ? held : null}
        <circle cx={frontHand[0]} cy={frontHand[1]} r={22} fill={colors.hand} />

        <g transform={`rotate(${face.tilt} 0 -390)`}>
          <circle cx={-106} cy={-466} r={19} fill={colors.skinShade} />
          <circle cx={106} cy={-466} r={19} fill={colors.skin} />
          <ellipse cy={-480} rx={108} ry={102} fill={colors.skin} />
          {/* A sombra da franja na testa e o cabelo numa forma só, com uma faixa de brilho. */}
          <path
            d="M-104,-498 C-70,-520 -34,-512 -8,-524 C24,-538 70,-530 104,-498 C96,-486 60,-508 22,-506 C-12,-504 -30,-490 -56,-494 C-78,-498 -92,-492 -104,-498 Z"
            fill={colors.skinShade}
          />
          <path
            d="M-112,-484 C-118,-566 -64,-600 2,-598 C72,-596 120,-560 112,-482 C100,-516 66,-538 24,-536 C-6,-534 -26,-518 -52,-522 C-82,-526 -100,-508 -112,-484 Z"
            fill={colors.hair}
          />
          {bun ? (
            <circle cx={10} cy={-612} r={38} fill={colors.hair} />
          ) : (
            <path
              d="M30,-596 C52,-628 86,-626 92,-602 C76,-610 56,-606 44,-590 Z"
              fill={colors.hair}
            />
          )}
          <path
            d="M-66,-570 C-34,-588 16,-590 50,-578 C18,-580 -30,-578 -66,-570 Z"
            fill={colors.hairLight}
          />
          {plainFace ? (
            <>
              {[-1, 1].map((side) => (
                <circle
                  key={side}
                  cx={side * EYE.gap}
                  cy={EYE.y}
                  r={11}
                  fill={colors.pupil}
                />
              ))}
              {grumpy ? (
                <g
                  stroke={colors.hair}
                  strokeWidth={8}
                  strokeLinecap="round"
                  fill="none"
                >
                  {[-1, 1].map((side) => (
                    <line
                      key={side}
                      x1={side * (EYE.gap + 22)}
                      y1={EYE.y - 40}
                      x2={side * (EYE.gap - 14)}
                      y2={EYE.y - 26}
                    />
                  ))}
                  <path
                    d={`M-16,${EYE.y + 56} Q0,${EYE.y + 46} 16,${EYE.y + 56}`}
                    stroke={colors.mouth}
                    strokeWidth={7}
                  />
                </g>
              ) : null}
            </>
          ) : (
            <>
              {eyes(face, colors, id)}
              {mouth(face.mouth, colors.mouth)}
            </>
          )}
          {glasses ? (
            <g fill="none" stroke={glasses} strokeWidth={7}>
              {[-1, 1].map((side) => (
                <circle
                  key={side}
                  cx={side * EYE.gap}
                  cy={EYE.y}
                  r={EYE.radius + 9}
                />
              ))}
              <path
                d={`M${-EYE.gap + EYE.radius + 9},${EYE.y - 6} Q0,${EYE.y - 14} ${EYE.gap - EYE.radius - 9},${EYE.y - 6}`}
              />
            </g>
          ) : null}
        </g>
      </g>
    </svg>
  );
};
