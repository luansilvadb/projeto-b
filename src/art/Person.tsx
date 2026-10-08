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

/** A passada de quem anda: em que ponto do ciclo a figura está, e com quanta amplitude. */
export type Stride = {
  /**
   * A fase da passada, em passos: a cada inteiro um pé toca o chão, com os
   * dois pés afastados e o corpo no ponto mais baixo; no meio do caminho
   * (0,5, 1,5...) um pé passa pelo outro no ar e o corpo está no alto. Dois
   * passos fecham o ciclo. Quem anda faz a fase crescer com a distância.
   */
  readonly step: number;
  /**
   * Quanto da passada vale, de 0 (parada: o desenho de sempre) a 1. Serve para
   * partir e chegar aos poucos; por padrão, 1.
   */
  readonly gait?: number;
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
  /**
   * A passada: as pernas alternam, o corpo sobe e desce a cada passo e os
   * braços balançam ao contrário das pernas. A figura anda para a direita de
   * quem olha; quem anda para a esquerda espelha o desenho. Sem valor, ela
   * está parada, como sempre foi desenhada.
   */
  readonly stride?: Stride;
  /**
   * Quanto o tronco e a cabeça pendem sobre o quadril, em graus, para a
   * direita de quem olha: é o corpo inteiro que conta o sono, o peso de uma
   * caixa ou o bocejo, e não só a cabeça.
   */
  readonly lean?: number;
};

// A figura cabe nesta caixa, com os pés no meio da base.
const VIEW = { width: 400, height: 650 };
const FRONT_SHOULDER: Point = [-70, -346];
const BACK_SHOULDER: Point = [72, -338];
// Em pé e à vontade, os dois braços soltos (a mão na cintura fica para quando
// for a ação). O de trás fica afastado do tronco, com um vazio entre os dois
// (colado nele, o braço some na silhueta), e mais alto e dobrado que o da frente.
const RELAXED: { front: Required<Arm>; back: Required<Arm> } = {
  front: { hand: [-136, -214], bend: 26 },
  back: { hand: [134, -252], bend: 28 },
};
const EYE = { gap: 42, radius: 27, y: -462 };
// A passada, nas unidades do desenho: quanto cada pé avança e recua, quanto
// sobe no ar, quanto o corpo sobe ao passar sobre o pé de apoio, quanto as
// mãos balançam e quantos graus a ponta do pé no ar desce.
const GAIT = { reach: 34, lift: 40, bob: 14, swing: 30, toe: 16 };
const HIP_Y = -196;
// A perna de apoio fica sob a cabeça e a outra aberta, cada sapato apontando
// para o seu lado; a passada e o balanço dos braços são largos.
const BUILT = {
  // `long` é o comprimento do sapato: o do pé de apoio é mais curto, para os dois não serem espelho um do outro.
  legs: {
    back: { hip: 46, knee: [68, -116], ankle: [86, -36], toe: 1, long: 56 },
    front: {
      hip: -42,
      knee: [-40, -112],
      ankle: [-30, -36],
      toe: -1,
      long: 42,
    },
  },
  reach: 1.7,
  // O ponto do chão, sob o corpo, em volta do qual os pés de quem anda vão e vêm.
  center: 14,
  swing: 1.4,
  // Quantos graus o calcanhar do pé de trás sobe no fim da passada.
  heel: 16,
} as const;

type Step = {
  /** Quanto o pé está à frente (positivo) ou atrás do lugar de repouso, e quanto está no ar. */
  readonly forward: number;
  readonly lifted: number;
};

const STANDING: Step = { forward: 0, lifted: 0 };

/** Onde está cada pé, quanto o corpo subiu e quanto as mãos balançaram, num ponto da passada. */
const walking = (stride: Stride | undefined) => {
  const gait = stride?.gait ?? 1;
  if (stride === undefined || gait <= 0) {
    return { front: STANDING, back: STANDING, bob: 0, swing: 0 };
  }
  const angle = Math.PI * stride.step;
  const along = Math.cos(angle) * gait;
  const up = Math.sin(angle) * gait;
  return {
    // O pé que está no ar é o que vai para a frente; o de apoio recua no chão.
    front: { forward: GAIT.reach * along, lifted: Math.max(0, -up) },
    back: { forward: -GAIT.reach * along, lifted: Math.max(0, up) },
    bob: GAIT.bob * Math.abs(up),
    // A mão de cada lado vai para trás quando o pé desse lado vai para a frente.
    swing: GAIT.swing * along,
  };
};

/**
 * O sapato em cunha: o calcanhar sob o tornozelo (`at`, no chão) e a ponta para
 * o lado `toe`, com `long` de comprimento. Quem desenha as pernas à parte (a
 * pessoa sentada à mesa) calça o mesmo sapato.
 */
export const Shoe: React.FC<{
  readonly at: Point;
  readonly toe: number;
  readonly long: number;
  readonly fill: string;
  readonly transform?: string;
}> = ({ at: [x, y], toe, long, fill, transform }) => (
  <path
    d={`M${x - toe * 26},${y} L${x + toe * long},${y} C${x + toe * (long + 22)},${y} ${x + toe * (long + 20)},${y - 26} ${x + toe * (long - 4)},${y - 30} C${x + toe * (long - 20)},${y - 33} ${x + toe * 28},${y - 46} ${x + toe * 22},${y - 46} L${x - toe * 26},${y - 46} Z`}
    fill={fill}
    stroke={fill}
    strokeWidth={10}
    strokeLinejoin="round"
    transform={transform}
  />
);

/**
 * A perna: larga no quadril, afinando até o tornozelo, com
 * o sapato em cunha (o calcanhar sob o tornozelo, a ponta para o lado `toe`).
 */
const builtLeg = (
  side: (typeof BUILT.legs)[keyof typeof BUILT.legs],
  step: Step,
  bob: number,
  fill: string,
  shoeFill: string,
  toe: number,
  width: number,
  hipShift: number,
  walked: number,
) => {
  const rise = GAIT.lift * step.lifted;
  // Andando, os dois pés vão e vêm em volta do mesmo ponto, sob o corpo: em
  // volta dos lugares de quem está parada, um extremo da passada juntava os
  // dois pés num só e o outro os abria demais.
  const rest = side.ankle[0] + (BUILT.center - side.ankle[0]) * walked;
  const ankle: Point = [rest + step.forward, side.ankle[1] - rise];
  const knee: Point = [
    side.knee[0] +
      (BUILT.center - side.ankle[0]) * walked * 0.55 +
      step.forward * 0.55 +
      16 * step.lifted,
    side.knee[1] - bob * 0.5 - rise * 0.55,
  ];
  const [x, y] = [ankle[0], ankle[1] + 36];
  const long = side.long;
  // No fim da passada o pé de trás fica na ponta: o calcanhar sobe, girando em volta dela.
  const trailing = rise === 0 ? Math.max(0, -step.forward * toe) : 0;
  const heel = (BUILT.heel * trailing) / (GAIT.reach * BUILT.reach);
  return (
    <>
      <path
        d={taperPath(
          [side.hip + hipShift, HIP_Y - bob],
          knee,
          ankle,
          width,
          44,
        )}
        fill={fill}
      />
      <Shoe
        at={[x, y]}
        toe={toe}
        long={long}
        fill={shoeFill}
        transform={
          rise !== 0
            ? `rotate(${GAIT.toe * step.lifted * toe} ${x} ${y - 36})`
            : heel > 0
              ? `rotate(${heel * toe} ${x + toe * long} ${y})`
              : undefined
        }
      />
    </>
  );
};

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
  stride,
  lean: ownLean = 0,
}) => {
  const id = useId();
  const paced = walking(stride);
  // A passada abre mais e os braços balançam mais que o ciclo de base.
  const gait = {
    ...paced,
    front: { ...paced.front, forward: paced.front.forward * BUILT.reach },
    back: { ...paced.back, forward: paced.back.forward * BUILT.reach },
    swing: paced.swing * BUILT.swing,
  };
  const posture = blinking(FACES[expression], blink);
  // Quem boceja enche o peito: os ombros sobem e a cabeça vai para trás.
  // E quem dorme em pé desaba: os ombros caem e a cabeça pende mais.
  const face =
    expression === "yawning"
      ? { ...posture, slump: -10, tilt: -11 }
      : expression === "asleep"
        ? { ...posture, slump: 24, tilt: 20 }
        : posture;
  const scale = height / VIEW.height;
  const posedFront = { ...RELAXED.front, ...frontArm };
  const posedBack = { ...RELAXED.back, ...backArm };
  // Andando, as mãos balançam em arco: vão e vêm, e sobem um pouco nas pontas.
  const swung = (arm: Required<Arm>, by: number): Required<Arm> =>
    by === 0
      ? arm
      : {
          ...arm,
          hand: [arm.hand[0] + by, arm.hand[1] - Math.abs(by) * 0.3],
        };
  const front = swung(posedFront, -gait.swing);
  const back = swung(posedBack, gait.swing);
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
  // O tronco em feijão: ombros caídos e redondos, mais largo no quadril e de barra em curva.
  const torso = `M-78,${shoulderY + 40} C-82,${shoulderY + 16} -52,${shoulderY + 10} 0,${shoulderY + 10} C52,${shoulderY + 10} 82,${shoulderY + 16} 78,${shoulderY + 40} C84,-300 94,-252 96,-216 C98,-190 82,-176 0,-176 C-82,-176 -98,-190 -96,-216 C-94,-252 -84,-300 -78,${shoulderY + 40} Z`;
  // Parada ou andando, a figura pende um pouco sobre o quadril.
  const walked = stride === undefined ? 0 : (stride.gait ?? 1);
  // Andar não inclina o tronco por conta própria: dobrado sobre pernas a prumo, com o rosto descansado, ele lê
  // como coluna quebrada. Quem inclina o corpo de quem anda é a cena, a figura inteira, quando há cansaço para contar.
  const lean = 2.5 + ownLean;
  // Quando o tronco pende para um lado, o quadril vai para o outro: dos pés à cabeça, a figura faz um C.
  const hipShift = -ownLean * 2.4;
  // Quem dorme em pé afunda a cabeça nos ombros, até o queixo cobrir o pescoço.
  const sunk = expression === "asleep" ? 24 : 0;
  const arm = { front: [54, 34], back: [52, 36] };

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
      {/* Andando, os dois sapatos apontam para onde ela vai. */}
      {builtLeg(
        BUILT.legs.back,
        gait.back,
        gait.bob,
        colors.pantsShade,
        colors.shoeShade,
        1,
        74,
        hipShift,
        walked,
      )}
      {builtLeg(
        BUILT.legs.front,
        gait.front,
        gait.bob,
        colors.pants,
        colors.shoe,
        walked > 0 ? 1 : -1,
        84,
        hipShift,
        walked,
      )}
      {/* O quadril: a massa de onde as duas pernas nascem, sob a barra do tronco. */}
      <path
        transform={`translate(${hipShift} ${-gait.bob})`}
        d="M-82,-236 C-98,-204 -96,-150 -46,-144 Q4,-182 54,-144 C98,-150 100,-204 84,-236 Z"
        fill={colors.pants}
      />

      {/* O tronco inclina um pouco sobre o quadril, para a figura não ficar dura. */}
      <g
        transform={
          gait.bob === 0
            ? `translate(${hipShift} 0) rotate(${lean} 0 -180)`
            : `translate(${hipShift} ${-gait.bob}) rotate(${lean} 0 -180)`
        }
      >
        <circle
          cx={backShoulder[0]}
          cy={backShoulder[1]}
          r={arm.back[0] / 2}
          fill={colors.topShade}
        />
        <path
          d={taperPath(
            backShoulder,
            backElbow,
            back.hand,
            arm.back[0],
            arm.back[1],
          )}
          fill={colors.topShade}
        />
        <circle
          cx={backHand[0]}
          cy={backHand[1]}
          r={22}
          fill={colors.handShade}
        />
        {/* O pescoço abre em curva até os ombros: a cabeça deixa de encostar no tronco num ponto só. */}
        <path
          d={`M-36,-404 C-36,${shoulderY} -44,${shoulderY + 10} -58,${shoulderY + 14} L58,${shoulderY + 14} C44,${shoulderY + 10} 36,${shoulderY} 36,-404 Z`}
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
            d={taperPath(
              frontShoulder,
              frontElbow,
              front.hand,
              arm.front[0],
              arm.front[1],
            )}
            fill={colors.topShade}
            transform="translate(8 10)"
          />
        </g>
        <circle
          cx={frontShoulder[0]}
          cy={frontShoulder[1]}
          r={arm.front[0] / 2 + 1}
          fill={colors.top}
        />
        <path
          d={taperPath(
            frontShoulder,
            frontElbow,
            front.hand,
            arm.front[0],
            arm.front[1],
          )}
          fill={colors.top}
        />
        {heldInFront ? held : null}
        <circle cx={frontHand[0]} cy={frontHand[1]} r={22} fill={colors.hand} />

        <g transform={`translate(0 ${sunk}) rotate(${face.tilt} 0 -390)`}>
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
