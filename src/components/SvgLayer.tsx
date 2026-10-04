import { AbsoluteFill, useVideoConfig } from "remotion";
import { markFor } from "../video/stage";
import { castScale, useStage } from "./Cast";

type SvgLayerProps = {
  readonly children: React.ReactNode;
};

/**
 * SVG do tamanho do quadro: as coordenadas dos filhos são pixels do vídeo.
 * Num palco dividido de fundo liso, o desenho entra crescendo do próprio
 * centro e sai encolhendo nele, na marcação dos objetos de cena.
 */
export const SvgLayer: React.FC<SvgLayerProps> = ({ children }) => {
  const { width, height } = useVideoConfig();
  const stage = useStage();
  return (
    <AbsoluteFill>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width={width}
        height={height}
        overflow="visible"
      >
        {stage.cast ? (
          <g
            style={{
              // O centro é o do que está desenhado, e não o do quadro.
              transformBox: "fill-box",
              transformOrigin: "center",
              scale: `${castScale(stage, markFor("prop"))}`,
            }}
          >
            {children}
          </g>
        ) : (
          children
        )}
      </svg>
    </AbsoluteFill>
  );
};
