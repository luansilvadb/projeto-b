import { interpolateColors } from "remotion";
import { mixPose, type VigiliaPose } from "../../../art/Vigilia";
import { lever as colors } from "../palette";
import { onLever, STAND, Vig } from "./Actor";
import { SvgText } from "./kit";

/**
 * A alavanca "rotação": o que separa o experimento mental do mundo de verdade.
 * Ligada, a haste pende para a direita e a luz é verde; desligada, pende para
 * a esquerda (menos, para a manopla não cobrir quem a segura) e a luz é vermelha. Vai dentro de um SVG; (x, y) é o meio da base,
 * no chão dela.
 */

/** O ângulo da haste, em graus da vertical, ligada e desligada. */
export const LEVER_ANGLE = { on: 28, off: -8 } as const;
/** O comprimento da haste, do eixo à manopla, com `scale` 1. */
export const LEVER_LENGTH = 230;
/** A altura do eixo acima da base, com `scale` 1. */
export const LEVER_HUB = 70;

/**
 * Um ponto da haste, a partir da base, com a alavanca `on` de 0 (desligada) a
 * 1 (ligada): `s` vai de 0 (o eixo) a 1 (a manopla).
 */
export const leverPoint = (on: number, s = 1, scale = 1): readonly [number, number] => {
  const angle = ((LEVER_ANGLE.off + (LEVER_ANGLE.on - LEVER_ANGLE.off) * on) * Math.PI) / 180;
  return [
    Math.sin(angle) * LEVER_LENGTH * s * scale,
    -(LEVER_HUB + Math.cos(angle) * LEVER_LENGTH * s) * scale,
  ];
};

type LeverProps = {
  readonly x: number;
  readonly y: number;
  /** De 0 (desligada) a 1 (ligada). */
  readonly on: number;
  readonly scale?: number;
};

/** A haste e a manopla: desenhadas por cima de quem a segura, para a alavanca desligada não sumir atrás dela. */
const LeverRod: React.FC<LeverProps> = ({ x, y, on, scale = 1 }) => {
  const angle = LEVER_ANGLE.off + (LEVER_ANGLE.on - LEVER_ANGLE.off) * on;
  return (
    <g transform={`translate(${x} ${y - LEVER_HUB * scale}) scale(${scale}) rotate(${angle})`}>
      <rect x={-11} y={-LEVER_LENGTH} width={22} height={LEVER_LENGTH} rx={11} fill={colors.rod} />
      <circle cx={0} cy={-LEVER_LENGTH} r={34} fill={colors.knobShade} />
      <circle cx={-5} cy={-LEVER_LENGTH - 5} r={27} fill={colors.knob} />
      <circle cx={0} cy={0} r={15} fill={colors.base} />
    </g>
  );
};

/** A base, com a placa e a luz. */
const LeverBase: React.FC<LeverProps> = ({ x, y, on, scale = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`}>
    <ellipse cx={0} cy={6} rx={170} ry={20} fill={colors.base} opacity={0.5} />
    <path d="M-150,0 L-120,-96 Q0,-130 120,-96 L150,0 Z" fill={colors.base} />
    <path d="M-120,-96 Q0,-130 120,-96 L112,-78 Q0,-110 -112,-78 Z" fill={colors.baseLight} />
    <circle cx={0} cy={-LEVER_HUB} r={26} fill={colors.baseLight} />
    {/* A placa com o nome do que ela liga. */}
    <rect x={-74} y={-50} width={148} height={46} rx={10} fill={colors.plate} />
    <SvgText x={0} y={-27} size={28} fill={colors.plateText}>
      rotação
    </SvgText>
    <circle cx={112} cy={-30} r={11} fill={interpolateColors(on, [0, 1], [colors.off, colors.on])} />
  </g>
);

export const Lever: React.FC<LeverProps> = (props) => (
  <>
    <LeverBase {...props} />
    <LeverRod {...props} />
  </>
);

// A Vigília é maior que a alavanca e a pega pela haste, a um terço do caminho:
// o braço dela é curto, e a manopla fica fora do alcance.
const OPERATOR = { scale: 2.6, offset: -190, grip: 0.3 } as const;

type LeverStationProps = LeverProps & {
  /** Quanto as mãos dela estão na haste, de 0 (de pé ao lado, solta) a 1 (agarrada). */
  readonly hands: number;
  /** O que muda na pose dela agarrada: o rosto da hesitação, do esforço. */
  readonly grip?: Partial<VigiliaPose>;
  /** O que muda na pose dela solta. */
  readonly rest?: Partial<VigiliaPose>;
  readonly shadow?: string;
};

/**
 * A alavanca com a Vigília ao lado, à esquerda dela: o palco do experimento.
 * As mãos acompanham a haste quando a alavanca anda.
 */
export const LeverStation: React.FC<LeverStationProps> = ({
  x,
  y,
  on,
  scale = 1,
  hands,
  grip,
  rest,
  shadow,
}) => {
  const k = OPERATOR.scale * scale;
  const [gx, gy] = leverPoint(on, OPERATOR.grip, scale);
  // O ponto da haste no espaço da pose dela.
  const held = onLever([(gx - OPERATOR.offset * scale) / k, gy / k], grip);
  return (
    <>
      <LeverBase x={x} y={y} on={on} scale={scale} />
      <Vig
        x={x + OPERATOR.offset * scale}
        y={y}
        scale={k}
        pose={mixPose({ ...STAND, turn: 0.8, ...rest }, held, hands)}
        shadow={shadow}
      />
      <LeverRod x={x} y={y} on={on} scale={scale} />
    </>
  );
};
