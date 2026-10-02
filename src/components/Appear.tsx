import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { motion } from "../design/tokens";

type AppearProps = {
  /** Quadro, no tempo da cena, em que o elemento entra. */
  readonly at: number;
  readonly children: React.ReactNode;
};

/** Entrada padrão do canal: o elemento surge crescendo, na curva e no tempo dos tokens. */
export const Appear: React.FC<AppearProps> = ({ at, children }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <div
      style={{
        opacity: interpolate(
          frame,
          [at, at + motion.seconds.enter * fps],
          [0, 1],
          {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          },
        ),
        scale: interpolate(
          frame,
          [at, at + motion.seconds.enter * fps],
          [0.7, 1],
          {
            easing: motion.enter,
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            output: "perceptual-scale",
          },
        ),
      }}
    >
      {children}
    </div>
  );
};
