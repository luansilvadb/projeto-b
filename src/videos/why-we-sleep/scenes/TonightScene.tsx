import { random, useCurrentFrame } from "remotion";
import { StarField } from "../../../components/StarField";
import { SvgLayer } from "../../../components/SvgLayer";
import { palette } from "../../../design/tokens";
import type { SceneProps } from "../../../video/NarratedVideo";
import { Stage } from "../parts/Stage";
import { cue } from "../parts/timing";

const BUILDING = { x: 560, y: 200, width: 800, height: 900 };
const WINDOW = { width: 110, height: 100, columns: 4, rows: 5 };
const WINDOWS = WINDOW.columns * WINDOW.rows;
// A janela do espectador: a primeira a apagar, na deixa da narração.
const YOUR_WINDOW = 9;
const FRAMES_BETWEEN_WINDOWS = 5;

// Ordem em que as outras janelas apagam, sorteada uma vez.
const SWITCH_OFF_ORDER = Array.from({ length: WINDOWS }, (_, index) => index)
  .filter((index) => index !== YOUR_WINDOW)
  .sort((a, b) => random(`window-${a}`) - random(`window-${b}`));

export const TonightScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const youLieDown = cue(scene, "deitar");

  const isLit = (index: number) => {
    if (index === YOUR_WINDOW) {
      return frame < youLieDown;
    }
    const turn = SWITCH_OFF_ORDER.indexOf(index) + 1;
    return frame < youLieDown + turn * FRAMES_BETWEEN_WINDOWS;
  };

  return (
    <Stage scene={scene}>
      <StarField seed="tonight" count={160} />
      <SvgLayer>
        <rect {...BUILDING} rx={12} fill={palette.ocean.dark} />
        {Array.from({ length: WINDOWS }, (_, index) => (
          <rect
            key={index}
            x={BUILDING.x + 80 + (index % WINDOW.columns) * 177}
            y={BUILDING.y + 70 + Math.floor(index / WINDOW.columns) * 150}
            width={WINDOW.width}
            height={WINDOW.height}
            rx={8}
            fill={isLit(index) ? palette.sun.light : palette.ink}
          />
        ))}
      </SvgLayer>
    </Stage>
  );
};
