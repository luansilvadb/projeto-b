import { AbsoluteFill, useVideoConfig } from "remotion";

type SvgLayerProps = {
  readonly children: React.ReactNode;
};

/** SVG do tamanho do quadro: as coordenadas dos filhos são pixels do vídeo. */
export const SvgLayer: React.FC<SvgLayerProps> = ({ children }) => {
  const { width, height } = useVideoConfig();
  return (
    <AbsoluteFill>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width={width}
        height={height}
        overflow="visible"
      >
        {children}
      </svg>
    </AbsoluteFill>
  );
};
