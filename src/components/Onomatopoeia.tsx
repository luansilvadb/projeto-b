import "../design/fonts";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { typography } from "../design/tokens";
import { POP_SECONDS, popOpacity, popScale } from "./Pop";

type OnomatopoeiaProps = {
  /** O som, em uma palavra: "ZZZ", "PLOFT", "SNIP". */
  readonly children: string;
  /** Quadro, no tempo de quem o contém, em que o som acontece. */
  readonly at: number;
  /** Altura da primeira letra, em pixels do quadro. */
  readonly size?: number;
  readonly color: string;
  readonly edge: string;
  /** Inclinação da palavra inteira, em graus. */
  readonly tilt?: number;
  /**
   * Quanto cada letra encolhe em relação à anterior: um som que some no ar
   * ("ZZZ") sobe e diminui; um impacto ("PLOFT") fica do mesmo tamanho.
   */
  readonly fade?: number;
};

/**
 * O som da ação, desenhado: letras grossas com contorno, em arco, saindo de
 * quem faz o som. Entra com sobra no quadro do som; nunca carrega informação.
 */
export const Onomatopoeia: React.FC<OnomatopoeiaProps> = ({
  children,
  at,
  size = 120,
  color,
  edge,
  tilt = -10,
  fade = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const frames = POP_SECONDS * fps;
  const letters = [...children];
  const middle = (letters.length - 1) / 2;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-end",
        rotate: `${tilt}deg`,
        opacity: popOpacity(frame, at, frames),
        scale: popScale(frame, at, frames, 0.4, 1.15),
        fontFamily: typography.family,
        fontWeight: 900,
        lineHeight: 1,
        whiteSpace: "nowrap",
        color,
        WebkitTextStroke: `${size * 0.14}px ${edge}`,
        paintOrder: "stroke fill",
      }}
    >
      {letters.map((letter, index) => {
        const shrink = (1 - fade) ** index;
        return (
          <span
            key={index}
            style={{
              fontSize: size * shrink,
              // O arco: as letras do meio sobem; com `fade`, cada letra sobe mais que a anterior.
              translate: `0 ${-size * (0.12 * (1 - ((index - middle) / (middle || 1)) ** 2) + fade * index * 0.9)}px`,
              rotate: `${(index - middle) * 5}deg`,
            }}
          >
            {letter}
          </span>
        );
      })}
    </div>
  );
};
