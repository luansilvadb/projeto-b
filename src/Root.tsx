import { AntelopeSheet } from "./videos/why-we-sleep/AntelopeSheet";
import { ElephantSheet } from "./videos/why-we-sleep/ElephantSheet";
import { JellyfishSheet } from "./videos/why-we-sleep/JellyfishSheet";
import { SunsetPilot } from "./videos/why-we-sleep/SunsetPilot";
import { PersonSheet } from "./videos/why-we-sleep/PersonSheet";
import { Composition, Folder, Still } from "remotion";
import { IdentitySheet } from "./design/IdentitySheet";
import { MOTION_SAMPLE_SECONDS, MotionSample } from "./design/MotionSample";
import { FPS, HEIGHT, WIDTH } from "./format";
import { Vignette } from "./vignette/Vignette";
import { WhyWeSleep, whyWeSleepMetadata } from "./videos/why-we-sleep";

// O id de cada composição é o nome da pasta do vídeo em src/videos/.
// A duração vem da narração, calculada pelo calculateMetadata de cada vídeo.
// A vinheta dura o silêncio que cada roteiro reserva para ela; sozinha, dura isto.
const VIGNETTE_PREVIEW_SECONDS = 6;

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="why-we-sleep"
        component={WhyWeSleep}
        width={WIDTH}
        height={HEIGHT}
        fps={30}
        defaultProps={{ narration: null, music: null }}
        calculateMetadata={whyWeSleepMetadata}
      />
      {/* Referência viva da direção de arte ativa em src/design/tokens.ts. */}
      <Folder name="design">
        <Still
          id="identity-sheet"
          component={IdentitySheet}
          width={WIDTH}
          height={HEIGHT}
        />
        <Composition
          id="motion-sample"
          component={MotionSample}
          width={WIDTH}
          height={HEIGHT}
          fps={FPS}
          durationInFrames={MOTION_SAMPLE_SECONDS * FPS}
        />
        {/* A folha de modelo da água-viva: todas as poses, para julgar o desenho. */}
        <Still
          id="agua-viva"
          component={JellyfishSheet}
          width={WIDTH}
          height={HEIGHT}
        />
        {/* O piloto do polimento: a elefanta antes e depois (quadro 0) e o plano de noite com e sem acabamento (1 e 2). */}
        <Composition
          id="elefanta"
          component={ElephantSheet}
          width={WIDTH}
          height={HEIGHT}
          fps={FPS}
          durationInFrames={3}
        />
        {/* A folha da pessoa: as poses em silhueta numa cor só (quadro 0) e pintadas (1). */}
        <Composition
          id="pessoa"
          component={PersonSheet}
          width={WIDTH}
          height={HEIGHT}
          fps={FPS}
          durationInFrames={2}
        />
        {/* A folha do antílope: as poses em silhueta numa cor só (quadro 0) e pintadas (1). */}
        <Composition
          id="antilope"
          component={AntelopeSheet}
          width={WIDTH}
          height={HEIGHT}
          fps={FPS}
          durationInFrames={2}
        />
        {/* O piloto do cenário rico: a savana no pôr do sol. */}
        <Still
          id="por-do-sol"
          component={SunsetPilot}
          width={WIDTH}
          height={HEIGHT}
        />
        {/* A vinheta do canal sozinha, para ver e ajustar sem o vídeo em volta. */}
        <Composition
          id="vinheta"
          component={Vignette}
          width={WIDTH}
          height={HEIGHT}
          fps={FPS}
          durationInFrames={VIGNETTE_PREVIEW_SECONDS * FPS}
        />
      </Folder>
    </>
  );
};
