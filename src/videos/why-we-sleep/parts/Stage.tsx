import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Backdrop } from "../../../components/Backdrop";
import { Camera, Layer, Wall } from "../../../components/Camera";
import { Drifters } from "../../../components/Drifters";
import { Grain } from "../../../components/Grain";
import { motion, palette } from "../../../design/tokens";
import type { SceneTimeline } from "../../../narration/timeline";
import { Sea } from "./Sea";

type StageProps = {
  readonly scene: SceneTimeline;
  /** Põe a cena no fundo do mar: 0 é dia, 1 é noite. */
  readonly sea?: number;
  /** O capítulo dos ratos: fundo fechado e nenhum enfeite em movimento. */
  readonly grave?: boolean;
  /**
   * A cena continua o quadro da anterior: sem aproximação da câmera nem
   * entrada, que dariam um salto no corte.
   */
  readonly still?: boolean;
  readonly children: React.ReactNode;
};

const PUSH_IN = 1.05;
const ENTER_FRAMES = 8;
const ENTER_RISE = 24;

/**
 * Palco de toda cena do vídeo: fundo, partículas em suspensão atrás do
 * assunto, uma câmera que se aproxima devagar e a granulação por cima.
 */
export const Stage: React.FC<StageProps> = ({
  scene,
  sea,
  grave = false,
  still = false,
  children,
}) => {
  const frame = useCurrentFrame();
  const underwater = sea !== undefined;
  const entered = still
    ? 1
    : interpolate(frame, [0, ENTER_FRAMES], [0, 1], {
        extrapolateRight: "clamp",
        easing: motion.smooth,
      });

  return (
    <AbsoluteFill>
      {underwater ? null : (
        <Backdrop bottom={grave ? palette.ink : undefined} />
      )}
      <Camera
        zoom={
          still
            ? 1
            : interpolate(frame, [0, scene.durationInFrames], [1, PUSH_IN])
        }
      >
        {/* O chão do mar se aproxima junto com quem está pousado nele. */}
        {underwater ? (
          <Layer depth={1}>
            <Wall>
              <Sea night={sea} />
            </Wall>
          </Layer>
        ) : null}
        {grave ? null : (
          <Layer depth={0.4}>
            <Drifters
              seed={underwater ? "plankton" : "dust"}
              count={underwater ? 70 : 46}
              opacity={underwater ? 0.4 : 0.22}
            />
          </Layer>
        )}
        <Layer depth={1}>
          <AbsoluteFill
            style={{
              opacity: entered,
              translate: `0px ${(1 - entered) * ENTER_RISE}px`,
            }}
          >
            {children}
          </AbsoluteFill>
        </Layer>
      </Camera>
      <Grain />
    </AbsoluteFill>
  );
};
