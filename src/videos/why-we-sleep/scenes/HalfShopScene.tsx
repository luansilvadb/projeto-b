import { useCurrentFrame, useVideoConfig } from "remotion";
import { BrainTop } from "../../../art/Brain";
import { Shop } from "../../../art/Shop";
import { Appear } from "../../../components/Appear";
import { Place } from "../../../components/Place";
import { palette } from "../../../design/tokens";
import type { SceneProps } from "../../../video/NarratedVideo";
import { Stage } from "../parts/Stage";
import { cue, ramp } from "../parts/timing";

const SHOP = { x: 1260, y: 580, width: 760 };
// Centro da metade aberta da vitrine, onde o funcionário fica.
const CLERK = { x: SHOP.x + 142, y: SHOP.y + 150 };

/** O funcionário que ficou no caixa: braços cruzados e sobrancelhas baixas. */
const Clerk: React.FC = () => (
  <svg width={140} height={250} viewBox="0 0 100 180">
    <circle cx={50} cy={34} r={26} fill={palette.ink} />
    <rect x={18} y={66} width={64} height={110} rx={18} fill={palette.ink} />
    <path
      d="M 22 108 L 78 92 M 22 92 L 78 108"
      stroke={palette.mist}
      strokeWidth={9}
      strokeLinecap="round"
    />
    <path
      d="M 34 26 L 46 32 M 66 26 L 54 32"
      stroke={palette.paper}
      strokeWidth={4}
      strokeLinecap="round"
    />
  </svg>
);

export const HalfShopScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const swap = ramp(frame, cue(scene, "trocam"), 0.6 * fps);

  return (
    <Stage scene={scene}>
      <Place x={400} y={540}>
        <BrainTop width={380} left={swap} right={1 - swap} />
      </Place>
      <Place x={SHOP.x} y={SHOP.y}>
        <Appear at={cue(scene, "metade")}>
          <Shop width={SHOP.width} shutter={[1, 0]} />
        </Appear>
      </Place>
      <Place x={CLERK.x} y={CLERK.y}>
        <Appear at={cue(scene, "funcionário")}>
          <Clerk />
        </Appear>
      </Place>
    </Stage>
  );
};
