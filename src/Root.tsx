import { Composition } from "remotion";
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
        fps={FPS}
        defaultProps={{ narration: null, music: null }}
        calculateMetadata={demoMetadata}
      />
    </>
  );
};
