import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Label } from "../../../components/Label";
import { Place } from "../../../components/Place";
import { palette } from "../../../design/tokens";
import type { SceneProps } from "../../../video/NarratedVideo";
import { BoxIcon } from "../parts/Icons";
import { MouseStamp } from "../parts/MouseStamp";
import {
  COUNTER,
  STOCKROOM,
  ShelfStock,
  ShopInterior,
} from "../parts/ShopInterior";
import { Stage } from "../parts/Stage";
import { cue, ramp } from "../parts/timing";

const BOX = 100;
const BOXES = [0, 1, 2, 3];
// Altura do arco que a caixa faz no caminho do balcão ao depósito.
const CARRY_HEIGHT = 260;

/** Onde cada caixa espera no balcão e onde fica empilhada no depósito. */
const boxPath = (index: number) => ({
  counter: {
    x: COUNTER.x + 70 + index * BOX,
    y: COUNTER.y - BOX / 2,
  },
  stockroom: {
    x: STOCKROOM.x + 80 + (index % 2) * 120,
    y: STOCKROOM.y + STOCKROOM.height - BOX / 2 - Math.floor(index / 2) * BOX,
  },
});

export const StockroomScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const replayStarts = cue(scene, "repassa");
  const moveStarts = cue(scene, "leva");

  return (
    <Stage scene={scene} still>
      <ShopInterior />
      <ShelfStock scale={() => 1} opacity={0.35} />
      <Place x={COUNTER.x + COUNTER.width / 2} y={COUNTER.y - 180}>
        <Label size="note" tag={palette.sun.base}>
          memórias recentes
        </Label>
      </Place>
      {BOXES.map((index) => {
        const { counter, stockroom } = boxPath(index);
        const moved = ramp(frame, moveStarts + index * 5, 0.9 * fps);
        // Cada caixa "acende" na sua vez enquanto o cérebro repassa as memórias.
        const replayed = Math.sin(
          Math.PI * ramp(frame, replayStarts + index * 7, 0.4 * fps),
        );
        return (
          <Place
            key={index}
            x={interpolate(moved, [0, 1], [counter.x, stockroom.x])}
            // A caixa sobe num arco por cima das prateleiras até o depósito.
            y={
              interpolate(moved, [0, 1], [counter.y, stockroom.y]) -
              CARRY_HEIGHT * Math.sin(Math.PI * moved)
            }
            style={{ scale: 1 + 0.25 * replayed }}
          >
            <BoxIcon size={BOX} />
          </Place>
        );
      })}
      <MouseStamp />
    </Stage>
  );
};
