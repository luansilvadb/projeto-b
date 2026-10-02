import { Composition, Folder, Still } from "remotion";
import { IdentitySheet } from "./design/IdentitySheet";
import { MOTION_SAMPLE_SECONDS, MotionSample } from "./design/MotionSample";
import { FPS, HEIGHT, WIDTH } from "./format";
import { Demo, demoMetadata } from "./videos/demo";

// O id de cada composição é o nome da pasta do vídeo em src/videos/.
// A duração vem da narração, calculada pelo calculateMetadata de cada vídeo.
export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="demo"
        component={Demo}
        width={WIDTH}
        height={HEIGHT}
        fps={30}
        defaultProps={{ narration: null, music: null }}
        calculateMetadata={demoMetadata}
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
      </Folder>
    </>
  );
};
