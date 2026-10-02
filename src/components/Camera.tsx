import { createContext, useContext, useMemo } from "react";
import { AbsoluteFill } from "remotion";

type CameraState = {
  /** Deslocamento da câmera em pixels, no plano do assunto. */
  readonly x: number;
  readonly y: number;
  readonly zoom: number;
};

const CameraContext = createContext<CameraState>({ x: 0, y: 0, zoom: 1 });

type CameraProps = Partial<CameraState> & {
  readonly children: React.ReactNode;
};

/** Move todas as camadas filhas de uma vez; cada uma responde conforme sua profundidade. */
export const Camera: React.FC<CameraProps> = ({
  x = 0,
  y = 0,
  zoom = 1,
  children,
}) => {
  const state = useMemo(() => ({ x, y, zoom }), [x, y, zoom]);
  return (
    <CameraContext.Provider value={state}>{children}</CameraContext.Provider>
  );
};

type LayerProps = {
  /** 0 é o infinito (não se move); 1 é o plano do assunto (acompanha a câmera por inteiro). */
  readonly depth: number;
  /**
   * Camada de luz: soma ao que está atrás em vez de cobrir. Halos precisam
   * disto, e precisa ser na camada, porque a mesclagem não atravessa um
   * elemento transformado.
   */
  readonly light?: boolean;
  readonly children: React.ReactNode;
};

/** Camada de parallax: quanto mais distante, menos reage ao movimento da câmera. */
export const Layer: React.FC<LayerProps> = ({
  depth,
  light = false,
  children,
}) => {
  const camera = useContext(CameraContext);
  return (
    <AbsoluteFill
      style={{
        translate: `${-camera.x * depth}px ${-camera.y * depth}px`,
        scale: 1 + (camera.zoom - 1) * depth,
        mixBlendMode: light ? "screen" : undefined,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};
