import { useCurrentFrame, useVideoConfig } from "remotion";
import { SvgLayer } from "../../../components/SvgLayer";
import { palette } from "../../../design/tokens";

type SunAndMoonProps = {
  /** Segundos que cada astro leva para cruzar o céu. */
  readonly crossingSeconds: number;
};

/** Sol e lua cruzando o céu em sequência: os dias passando. */
export const SunAndMoon: React.FC<SunAndMoonProps> = ({ crossingSeconds }) => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const crossings = frame / (crossingSeconds * fps);
  const progress = crossings % 1;
  const isSun = Math.floor(crossings) % 2 === 0;

  return (
    <SvgLayer>
      <circle
        cx={progress * width}
        cy={300 - 150 * Math.sin(progress * Math.PI)}
        r={isSun ? 46 : 38}
        fill={isSun ? palette.sun.base : palette.paper}
      />
    </SvgLayer>
  );
};
