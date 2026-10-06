import { useId } from "react";
import { AbsoluteFill } from "remotion";

type GrainProps = {
  readonly opacity?: number;
};

/** Granulação sobre o quadro inteiro, para o vetor chapado não parecer estéril. */
export const Grain: React.FC<GrainProps> = ({ opacity = 0.14 }) => {
  const filterId = useId();
  return (
    <AbsoluteFill style={{ mixBlendMode: "overlay", opacity }}>
      <svg width="100%" height="100%">
        <filter id={filterId}>
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.8"
            numOctaves="2"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter={`url(#${filterId})`} />
      </svg>
    </AbsoluteFill>
  );
};
