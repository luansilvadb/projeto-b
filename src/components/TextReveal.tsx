import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { motion } from "../design/tokens";

type TextRevealProps = {
  /** Quadro, no tempo de quem o contém, em que o texto começa a aparecer. */
  readonly at: number;
  readonly seconds?: number;
  readonly children: React.ReactNode;
};

/**
 * Texto que entra por uma máscara que abre da esquerda para a direita, como
 * se fosse escrito, em vez de surgir por opacidade.
 */
export const TextReveal: React.FC<TextRevealProps> = ({
  at,
  seconds = 0.35,
  children,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const shown = interpolate(frame, [at, at + seconds * fps], [0, 100], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: motion.smooth,
  });

  return (
    <div style={{ clipPath: `inset(-20% ${100 - shown}% -20% -5%)` }}>
      {children}
    </div>
  );
};
