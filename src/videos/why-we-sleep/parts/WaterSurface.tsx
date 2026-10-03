import { useCurrentFrame, useVideoConfig } from "remotion";
import { SvgLayer } from "../../../components/SvgLayer";
import { palette, shape } from "../../../design/tokens";

type WaterSurfaceProps = {
  /** Altura média da superfície, em pixels do quadro. */
  readonly y: number;
};

const WAVE = { length: 320, height: 9, pixelsPerSecond: 60, step: 40 };
// A água passa das bordas para a aproximação da câmera não revelar o fim dela.
const OVERSCAN = 200;

/** Mar visto de lado: a água abaixo e a linha da superfície ondulando devagar. */
export const WaterSurface: React.FC<WaterSurfaceProps> = ({ y }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const drift = (frame / fps) * WAVE.pixelsPerSecond;

  const points: string[] = [];
  for (let x = -OVERSCAN; x <= width + OVERSCAN; x += WAVE.step) {
    const wave = Math.sin(((x + drift) / WAVE.length) * Math.PI * 2);
    points.push(`${x} ${y + WAVE.height * wave}`);
  }
  const surface = `M ${points.join(" L ")}`;

  return (
    <SvgLayer>
      <path
        d={`${surface} V ${height + OVERSCAN} H ${-OVERSCAN} Z`}
        fill={palette.ocean.dark}
      />
      <path
        d={surface}
        fill="none"
        stroke={palette.ocean.light}
        strokeWidth={shape.stroke.regular}
        strokeLinejoin="round"
      />
    </SvgLayer>
  );
};
