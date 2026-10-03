import { createContext, useContext, useMemo } from "react";
import { AbsoluteFill } from "remotion";
import { HEIGHT, WIDTH } from "../format";

export type CameraState = {
  /** Deslocamento da câmera em pixels, no plano do assunto. */
  readonly x: number;
  readonly y: number;
  readonly zoom: number;
};

const CameraContext = createContext<CameraState>({ x: 0, y: 0, zoom: 1 });

type FramePoint = readonly [number, number];

/**
 * Câmera que enquadra um ponto do plano do assunto: com a aproximação pedida,
 * o ponto `subject` do cenário vai parar em `at`, que por padrão é o centro
 * do quadro. É assim que um plano aberto vira médio ou close sem redesenhar.
 */
export const framing = (
  subject: FramePoint,
  zoom: number,
  at: FramePoint = [WIDTH / 2, HEIGHT / 2],
): CameraState => ({
  // As camadas crescem em volta do centro do quadro e depois se deslocam.
  x: WIDTH / 2 + zoom * (subject[0] - WIDTH / 2) - at[0],
  y: HEIGHT / 2 + zoom * (subject[1] - HEIGHT / 2) - at[1],
  zoom,
});

/**
 * A câmera a meio caminho entre dois enquadramentos, com `t` de 0 a 1. A
 * aproximação interpola em escala geométrica, para a velocidade aparente ser
 * a mesma indo de 1 para 2 ou de 2 para 4.
 */
export const cameraBetween = (
  from: CameraState,
  to: CameraState,
  t: number,
): CameraState => ({
  x: from.x + (to.x - from.x) * t,
  y: from.y + (to.y - from.y) * t,
  zoom: from.zoom * (to.zoom / from.zoom) ** t,
});

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
