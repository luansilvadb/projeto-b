import { random, useCurrentFrame, useVideoConfig } from "remotion";
import { palette } from "../design/tokens";
import { SvgLayer } from "./SvgLayer";

type DriftersProps = {
  readonly count?: number;
  /** Semente do sorteio: a mesma semente espalha sempre as mesmas partículas. */
  readonly seed?: string;
  readonly color?: string;
  /** Opacidade da partícula mais visível; as outras ficam abaixo disso. */
  readonly opacity?: number;
  /** Raio da menor e da maior partícula, em pixels. */
  readonly size?: readonly [number, number];
  /** Multiplica a velocidade: plâncton numa corrente deriva mais que poeira no ar. */
  readonly speed?: number;
};

// Pixels por segundo da partícula mais rápida; todas sobem devagar e derivam de lado.
const RISE = 14;
const SIDEWAYS = 8;

/** Resto sempre positivo, para a partícula que sai por um lado voltar pelo outro. */
const wrap = (value: number, size: number) => ((value % size) + size) % size;

/**
 * Partículas em suspensão, derivando devagar, para o meio que as tem: plâncton
 * na água, grãos no tecido. No ar do mundo leem como sujeira.
 */
export const Drifters: React.FC<DriftersProps> = ({
  count = 46,
  seed = "drifters",
  color = palette.paper,
  opacity = 0.22,
  size = [1.5, 5],
  speed = 1,
}) => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const seconds = frame / fps;

  return (
    <SvgLayer>
      {Array.from({ length: count }, (_, index) => {
        const pick = (trait: string) => random(`${seed}-${trait}-${index}`);
        return (
          <circle
            key={index}
            cx={wrap(
              pick("x") * width +
                seconds * speed * SIDEWAYS * (pick("side") * 2 - 1) +
                10 * Math.sin(seconds * 0.7 + pick("phase") * 6),
              width,
            )}
            cy={wrap(
              pick("y") * height -
                seconds * speed * RISE * (0.3 + pick("rise")),
              height,
            )}
            r={size[0] + pick("size") * (size[1] - size[0])}
            fill={color}
            opacity={opacity * (0.35 + 0.65 * pick("light"))}
          />
        );
      })}
    </SvgLayer>
  );
};
