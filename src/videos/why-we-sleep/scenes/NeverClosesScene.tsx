import { useCurrentFrame } from "remotion";
import type { SceneProps } from "../../../video/NarratedVideo";
import { Stage } from "../parts/Stage";
import { Street } from "../parts/Street";
import { SunAndMoon } from "../parts/SunAndMoon";
import { cue } from "../parts/timing";

const FLICKER_FRAMES = 4;

export const NeverClosesScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  // Depois de dias sem fechar, a luz da loja começa a falhar.
  const failing = frame >= cue(scene, "nunca");
  const dimmed = Math.floor(frame / FLICKER_FRAMES) % 2 === 0;

  return (
    <Stage scene={scene}>
      <SunAndMoon crossingSeconds={0.8} />
      <Street openLit={failing && dimmed ? 0.3 : 1} />
    </Stage>
  );
};
