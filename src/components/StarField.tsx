import { random, useCurrentFrame, useVideoConfig } from "remotion";
import { palette } from "../design/tokens";
import { SvgLayer } from "./SvgLayer";

type StarFieldProps = {
  readonly count?: number;
  /** Semente do sorteio: a mesma semente desenha sempre o mesmo céu. */
  readonly seed?: string;
};

// O campo passa das bordas do quadro para o movimento de câmera não revelar o fim dele.
const OVERSCAN = 0.1;

/** Céu estrelado procedural, com cada estrela cintilando no próprio ritmo. */
export const StarField: React.FC<StarFieldProps> = ({
  count = 240,
  seed = "stars",
}) => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const seconds = frame / fps;

  return (
    <SvgLayer>
      {Array.from({ length: count }, (_, index) => {
        const pick = (trait: string) => random(`${seed}-${trait}-${index}`);
        const twinkle = Math.sin(
          seconds * (0.6 + pick("speed") * 1.4) + pick("phase") * Math.PI * 2,
        );
        return (
          <circle
            key={index}
            cx={(pick("x") * (1 + 2 * OVERSCAN) - OVERSCAN) * width}
            cy={(pick("y") * (1 + 2 * OVERSCAN) - OVERSCAN) * height}
            r={1 + pick("size") * 2.4}
            fill={palette.paper}
            opacity={0.55 + 0.4 * twinkle}
          />
        );
      })}
    </SvgLayer>
  );
};
