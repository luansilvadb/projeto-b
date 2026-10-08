import { AbsoluteFill, useCurrentFrame } from "remotion";
import { useShotLength } from "../video/Shot";
import { Build, Camera, Layer, cameraBetween, framing } from "./Camera";
import { FlatStage, Troupe } from "./Cast";

type SlowPushProps = {
  /** O ponto do quadro para o qual a câmera se aproxima: o ponto focal do plano. */
  readonly focus: readonly [number, number];
  /** Quanto a câmera se aproxima do começo ao fim do plano, em fração. */
  readonly by?: number;
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
  backdrop,
  children,
}) => {
  const frame = useCurrentFrame();
  // A duração do roteiro, e não a do `Sequence`: no palco contínuo esta vem
  // esticada pelos quadros da passagem, e a aproximação pularia na troca.
  const durationInFrames = useShotLength();
  const camera = cameraBetween(
    framing(focus, 1, focus),
    framing(focus, 1 + by, focus),
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
