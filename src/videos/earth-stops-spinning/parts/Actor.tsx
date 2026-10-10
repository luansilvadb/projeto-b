import { bones, Vigilia, type Vec, type VigiliaPose } from "../../../art/Vigilia";
import { explorer, explorerGear, home, vigilia } from "../palette";

/**
 * Os dois atores do vídeo, na construção chibi da trupe (`src/art/Vigilia.tsx`):
 * a Vigília, que faz "você", e o Explorador, o mesmo ovo de casaco coral e
 * gorro, que vive perto do polo. As poses moram aqui; uma cena que precisa de
 * outra escreve `{ ...STAND, ... }` e mistura com `mixPose`.
 *
 * O espaço das poses: a origem é o chão embaixo dela, y para baixo; de pé, ela
 * tem uns 140 de altura e olha para a direita. `flip` a vira para a esquerda.
 */

/** O tornozelo de um casco chapado no chão, em `x`. */
const foot = (x: number): Vec => [x, -6.2];

/** De pé, virada de três quartos, os braços soltos. */
export const STAND: VigiliaPose = {
  hip: [0, -26],
  lean: 0,
  stretch: 1,
  head: 0,
  nearHand: [-26, -24],
  nearElbow: 1,
  farHand: [34, -26],
  farElbow: 1,
  nearAnkle: foot(-12),
  nearKnee: 1,
  nearFoot: 0,
  farAnkle: foot(16),
  farKnee: 1,
  farFoot: 0,
  turn: 0.55,
  nod: 0,
  faceSize: 1,
  gaze: [0.3, 0],
  cross: [0, 0],
  pupil: 1,
  nearLid: 0.12,
  farLid: 0.12,
  squint: 0,
  nearBrow: [0, 0],
  farBrow: [0, 0],
  mouth: [11, 0, 0.5],
  grit: 0,
};

/** A xícara na mão de lá, na altura do peito: a pose de quem toma café na janela. */
export const CUP: VigiliaPose = {
  ...STAND,
  farHand: [52, -52],
  farElbow: 1,
  nearLid: 0.3,
  farLid: 0.3,
  mouth: [11, 0, 0.8],
};

/** Olha para cima e para a frente: o Sol na janela, a Terra ao lado. */
export const LOOK_UP: VigiliaPose = {
  ...CUP,
  lean: -5,
  nod: -0.7,
  gaze: [0.6, -0.6],
  nearLid: 0.05,
  farLid: 0.05,
  mouth: [10, 0.25, 0.4],
};

/** Olha para baixo, para a xícara. */
export const LOOK_DOWN: VigiliaPose = {
  ...CUP,
  nod: 0.6,
  gaze: [0.5, 0.8],
  nearLid: 0.4,
  farLid: 0.4,
};

/** O susto: esticada, o rosto grande, os olhos arregalados. */
export const STARTLED: VigiliaPose = {
  ...CUP,
  hip: [0, -32],
  stretch: 1.1,
  lean: -8,
  faceSize: 1.18,
  pupil: 0.7,
  nearLid: 0,
  farLid: 0,
  nearBrow: [-0.5, 7],
  farBrow: [-0.5, 8],
  mouth: [10, 0.85, 0],
  nearHand: [-50, -70],
  nearElbow: -1,
};

/** As duas mãos numa alavanca à frente dela, para cima: `hands` é onde a manopla está, no espaço da pose. */
export const onLever = (hands: Vec, pose: Partial<VigiliaPose> = {}): VigiliaPose => ({
  ...STAND,
  turn: 0.9,
  lean: 10,
  nod: -0.3,
  gaze: [0.6, -0.4],
  nearHand: [hands[0] - 8, hands[1] + 8],
  farHand: [hands[0] + 6, hands[1] - 6],
  nearElbow: 1,
  farElbow: 1,
  mouth: [11, 0, 0.1],
  ...pose,
});

/** Arremessada: no ar, deitada para trás, os braços e os cascos soltos. */
export const FLUNG: VigiliaPose = {
  ...STAND,
  hip: [0, -60],
  lean: -55,
  stretch: 1.12,
  turn: 0.2,
  faceSize: 1.2,
  nearHand: [-70, -100],
  nearElbow: -1,
  farHand: [60, -110],
  farElbow: 1,
  nearAnkle: [-30, -24],
  nearFoot: -30,
  farAnkle: [10, -40],
  farFoot: -50,
  pupil: 0.65,
  nearLid: 0,
  farLid: 0,
  nearBrow: [-0.7, 7],
  farBrow: [-0.7, 8],
  mouth: [13, 1, 0],
};

/** Inclinada para a frente, espiando alguma coisa de perto. */
export const PEEK: VigiliaPose = {
  ...STAND,
  lean: 18,
  turn: 0.95,
  nod: 0.2,
  gaze: [0.8, 0.2],
  nearLid: 0,
  farLid: 0,
  nearHand: [20, -40],
  farHand: [56, -48],
  mouth: [9, 0.3, 0.2],
};

/** Firma os pés e fecha os olhos: quem espera o pior. */
export const BRACED: VigiliaPose = {
  ...STAND,
  hip: [0, -20],
  stretch: 0.9,
  lean: -10,
  nearAnkle: foot(-26),
  farAnkle: foot(28),
  nearLid: 1,
  farLid: 1,
  squint: 0.7,
  nearBrow: [0.4, -2],
  farBrow: [0.4, -2],
  mouth: [14, 0.5, 0],
  grit: 1,
  nearHand: [30, -60],
  farHand: [58, -66],
};

/** O tropeço: um passo à frente, o corpo passando do pé. */
export const STUMBLE: VigiliaPose = {
  ...STAND,
  hip: [22, -24],
  lean: 22,
  stretch: 1.04,
  nearAnkle: foot(-20),
  farAnkle: foot(52),
  nearLid: 0,
  farLid: 0,
  pupil: 0.75,
  nearBrow: [-0.4, 5],
  farBrow: [-0.4, 6],
  mouth: [10, 0.6, 0],
  nearHand: [-40, -56],
  nearElbow: -1,
  farHand: [70, -50],
};

/** Um olho aberto, o outro ainda fechado: conferindo se acabou. */
export const ONE_EYE: VigiliaPose = {
  ...STAND,
  hip: [22, -26],
  nearAnkle: foot(10),
  farAnkle: foot(40),
  nearLid: 1,
  farLid: 0,
  gaze: [0.2, 0],
  nearBrow: [0.2, 0],
  farBrow: [-0.4, 6],
  mouth: [9, 0, -0.2],
  farHand: [74, -52],
};

type ActorProps = {
  readonly x: number;
  readonly y: number;
  readonly pose: VigiliaPose;
  /** O tamanho, em relação ao desenho (uns 140 de altura). */
  readonly scale?: number;
  /** Virada para a esquerda. */
  readonly flip?: boolean;
  /** A sombra de contato no chão: a cor dela; sem valor, não há sombra. */
  readonly shadow?: string;
  /** O que ela leva na mão de lá: desenhado em volta da mão, no espaço da pose. */
  readonly held?: React.ReactNode;
};

const Posed: React.FC<ActorProps & { readonly children: React.ReactNode }> = ({
  x,
  y,
  pose,
  scale = 1,
  flip = false,
  shadow,
  held,
  children,
}) => {
  const hand = bones(pose).farArm.end;
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -scale : scale} ${scale})`}>
      {shadow ? (
        <ellipse cx={pose.hip[0]} cy={4} rx={62} ry={10} fill={shadow} opacity={0.28} />
      ) : null}
      {children}
      {held ? <g transform={`translate(${hand[0]} ${hand[1]})`}>{held}</g> : null}
    </g>
  );
};

/** A Vigília, "você". Vai dentro de um SVG; (x, y) é o chão embaixo dela. */
export const Vig: React.FC<ActorProps> = (props) => (
  <Posed {...props}>
    <Vigilia pose={props.pose} colors={vigilia} cold={0.6} />
  </Posed>
);

/** O gorro, os óculos na testa, o pompom e o cachecol: acompanham o ovo na pose. */
const Hat: React.FC<{ readonly pose: VigiliaPose }> = ({ pose }) => {
  const wide = 1 / Math.sqrt(pose.stretch);
  return (
    <g
      transform={`translate(${pose.hip[0]} ${pose.hip[1]}) rotate(${pose.lean}) scale(${wide} ${pose.stretch})`}
    >
      {/* O cachecol: é ele que diz que o corpo coral é um casaco, e não a pele. */}
      <path d="M-46,-37 Q0,-21 47,-39 L48,-27 Q0,-8 -47,-25 Z" fill={explorerGear.hatBand} />
      {/* A ponta do cachecol fica nas costas: de frente, cai no meio do peito. */}
      <g transform={`translate(${30 * (1 - Math.min(1, pose.turn))} 0)`}>
        <path d="M-34,-27 L-40,2 L-24,4 L-22,-23 Z" fill={explorerGear.hatBand} />
        <path d="M-40,2 L-24,4 L-25,-4 L-39,-6 Z" fill={explorerGear.mugShade} />
      </g>
      <path
        d="M-44,-78 C-42,-100 -24,-114 0,-114 C24,-114 42,-100 44,-78 Z"
        fill={explorerGear.hat}
      />
      <rect x={-47} y={-84} width={94} height={15} rx={7} fill={explorerGear.hatBand} />
      <circle cx={0} cy={-120} r={13} fill={explorerGear.pompom} />
      {/* Os óculos de neve, erguidos na faixa do gorro, do lado para onde ele olha. */}
      <g transform={`translate(${10 * pose.turn} -94)`}>
        <rect x={-22} y={-9} width={44} height={18} rx={9} fill={explorerGear.hat} />
        <circle cx={-10} cy={0} r={7} fill={explorerGear.goggles} />
        <circle cx={10} cy={0} r={7} fill={explorerGear.goggles} />
      </g>
    </g>
  );
};

/** O Explorador, perto do polo: o mesmo ovo, de casaco coral e gorro. */
export const Explorer: React.FC<ActorProps> = (props) => (
  <Posed {...props}>
    <Vigilia pose={props.pose} colors={explorer} cold={0.8} />
    <Hat pose={props.pose} />
  </Posed>
);

type CupProps = {
  /** Quanto o café se inclina dentro da xícara, em graus: é o que mostra se o chão está liso. */
  readonly slosh?: number;
  /** As cores da louça: a xícara branca da Vigília, ou a caneca amarela do Explorador. */
  readonly body?: string;
  readonly shade?: string;
  readonly steam?: number;
};

/** A xícara de café, para `held`: o objeto de cena que volta do gancho ao fim. */
export const Cup: React.FC<CupProps> = ({
  slosh = 0,
  body = home.cup,
  shade = home.cupShade,
  steam = 0,
}) => (
  <g transform="translate(6 -10)">
    {steam > 0 ? (
      <path
        d={`M-4,-22 q${6 * Math.sin(steam)},-10 0,-20 q${-6 * Math.sin(steam)},-10 0,-20`}
        fill="none"
        stroke={home.steam}
        strokeWidth={4}
        strokeLinecap="round"
        opacity={0.6}
      />
    ) : null}
    <path d="M14,-8 q16,0 14,12 q-2,10 -14,8" fill="none" stroke={shade} strokeWidth={6} />
    <path d="M-18,-14 L18,-14 L14,16 Q0,22 -14,16 Z" fill={body} />
    <path d="M6,-14 L18,-14 L14,16 Q10,19 6,19 Z" fill={shade} />
    <ellipse cx={0} cy={-14} rx={18} ry={5} fill={shade} />
    <ellipse cx={0} cy={-14} rx={14} ry={3.4} fill={home.coffee} transform={`rotate(${slosh} 0 -14)`} />
  </g>
);

/** A caneca do Explorador. */
export const Mug: React.FC<{ readonly slosh?: number }> = ({ slosh }) => (
  <Cup slosh={slosh} body={explorerGear.mug} shade={explorerGear.mugShade} />
);
