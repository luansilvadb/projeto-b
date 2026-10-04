import { createContext, useContext, useId } from "react";
import { AbsoluteFill } from "remotion";

type GrainProps = {
  readonly opacity?: number;
};

const GrainOff = createContext(false);

type WithoutGrainProps = {
  readonly children: React.ReactNode;
};

/**
 * Desliga a granulação do que estiver dentro. Serve para um plano inteiro
 * posto dentro de outro (num quadro, numa janela): o de fora já granula o
 * quadro todo, e cada granulação a mais é um filtro de tela cheia recalculado
 * a cada quadro, que é o que mais pesa na pré-visualização.
 */
export const WithoutGrain: React.FC<WithoutGrainProps> = ({ children }) => (
  <GrainOff.Provider value>{children}</GrainOff.Provider>
);

/** Granulação sobre o quadro inteiro, para o vetor chapado não parecer estéril. */
export const Grain: React.FC<GrainProps> = ({ opacity = 0.14 }) => {
  const filterId = useId();
  const off = useContext(GrainOff);
  if (off) {
    return null;
  }
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
