import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { Build, Camera, Layer, cameraBetween, framing } from "./Camera";
import { FlatStage, Troupe } from "./Cast";

type SlowPushProps = {
  /** O ponto do quadro para o qual a câmera se aproxima: o ponto focal do plano. */
  readonly focus: readonly [number, number];
  /** Quanto a câmera se aproxima do começo ao fim do plano, em fração. */
  readonly by?: number;
  /**
   * A aproximação com que o plano começa. Serve ao plano que continua o
   * enquadramento do anterior: ele parte de onde o outro parou, sem salto.
   */
  readonly from?: number;
  /** O que fica parado atrás, fora da câmera: um fundo liso ou em degradê. */
  readonly backdrop?: React.ReactNode;
  readonly children: React.ReactNode;
};

/**
 * A aproximação lenta de um plano sem motivo de câmera: tão lenta que só se
 * nota comparando o começo com o fim, mas que impede o quadro de congelar.
 * Dura o plano inteiro, do enquadramento composto para um pouco mais perto.
 */
export const SlowPush: React.FC<SlowPushProps> = ({
  focus,
  by = 0.04,
  from = 1,
  backdrop,
  children,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const camera = cameraBetween(
    framing(focus, from, focus),
    framing(focus, from + by, focus),
    frame / durationInFrames,
  );

  return (
    <AbsoluteFill>
      <FlatStage backdrop={backdrop}>
        {/* Aqui não há chão para subir: quem entra e sai é o elenco. */}
        <Build>
          <Camera {...camera}>
            <Layer depth={1}>
              <Troupe>{children}</Troupe>
            </Layer>
          </Camera>
        </Build>
      </FlatStage>
    </AbsoluteFill>
  );
};
