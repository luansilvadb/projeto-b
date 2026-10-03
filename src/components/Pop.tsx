import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { motion } from "../design/tokens";

/** Quanto dura uma entrada com sobra, em segundos. */
export const POP_SECONDS = 0.3;

/**
 * A escala de uma entrada com sobra que começa no quadro `at` e dura `frames`:
 * cresce, passa um pouco do tamanho final e assenta. Para elementos de SVG;
 * para HTML, use o componente Pop.
 */
export const popScale = (
  frame: number,
  at: number,
  frames: number,
  from = 0.6,
  overshoot = 1.06,
): number =>
  interpolate(
    frame,
    [at, at + frames * 0.7, at + frames],
    [from, overshoot, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: motion.smooth,
    },
  );

/** A opacidade da mesma entrada: só acompanha os primeiros quadros, para a forma entrar sólida. */
export const popOpacity = (frame: number, at: number, frames: number): number =>
  interpolate(frame, [at, at + frames * 0.4], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

type PopProps = {
  /** Quadro, no tempo de quem o contém, em que o elemento entra. */
  readonly at: number;
  /** Tamanho inicial, em fração do final. */
  readonly from?: number;
  /** Quanto passa do tamanho final antes de assentar. */
  readonly overshoot?: number;
  readonly seconds?: number;
  /** De onde o elemento cresce: do centro, ou dos pés para quem está em pé. */
  readonly origin?: "center" | "bottom";
  readonly children: React.ReactNode;
};

/** Entrada com sobra de um elemento de HTML: um número, uma etiqueta, um objeto. */
export const Pop: React.FC<PopProps> = ({
  at,
  from = 0.6,
  overshoot = 1.06,
  seconds = POP_SECONDS,
  origin = "center",
  children,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const frames = seconds * fps;

  return (
    <div
      style={{
        opacity: popOpacity(frame, at, frames),
        scale: popScale(frame, at, frames, from, overshoot),
        transformOrigin: origin === "bottom" ? "50% 100%" : undefined,
      }}
    >
      {children}
    </div>
  );
};
