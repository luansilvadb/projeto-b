import { Tag } from "../parts/Tag";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { Silhouette } from "../../../art/Silhouettes";
import { Camera, Layer, framing } from "../../../components/Camera";
import { Grain } from "../../../components/Grain";
import { Label } from "../../../components/Label";
import { Place } from "../../../components/Place";
import { Pop } from "../../../components/Pop";
import { SlowPush } from "../../../components/SlowPush";
import type { SceneProps } from "../../../video/NarratedVideo";
import { Shot } from "../../../video/Shot";
import { ink, rat } from "../palette";
import { InsideBackdrop } from "../parts/InsideBackdrop";
import { SHELVES, ShelfGoods, ShopInside } from "../parts/ShopInside";
import { SynapseRow } from "../parts/Synapses";
import { cue, ramp } from "../../../components/timing";

export const SHELVES_MEDIUM = framing(
  [SHELVES.x + SHELVES.width / 2, 620],
  1.35,
);
const ROWS = { x: 300, step: 146, radius: 64, awake: 400, slept: 790 };

/** O selo de que a medida foi feita em camundongos, no canto do quadro. */
export const InMice: React.FC<{ readonly at: number }> = ({ at }) => (
  <Place x={1400} y={150}>
    <Pop at={at}>
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <Silhouette
          kind="mouse"
          width={120}
          color={rat.body}
          shade={rat.ear}
          eye={rat.eye}
        />
        <Tag size="note" on="night">
          em camundongos
        </Tag>
      </div>
    </Pop>
  </Place>
);

/** De dia, as prateleiras transbordam: há mercadoria por cima e pelo chão. */
const OverflowShot: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  return (
    <>
      <AbsoluteFill>
        <Camera
          {...framing(
            [SHELVES.x + SHELVES.width / 2, 620],
            1.25 + 0.06 * (frame / durationInFrames),
          )}
        >
          <Layer depth={1}>
            <ShopInside time="day">
              <ShelfGoods overflowing />
            </ShopInside>
          </Layer>
        </Camera>
        <Grain />
      </AbsoluteFill>
    </>
  );
};

type CompareShotProps = {
  /** Quadro do plano em que a fileira de depois do sono entra. */
  readonly sleptAt: number;
};

/** Por dentro: as conexões depois de um dia acordado e depois do sono; as de baixo são menores. */
const CompareShot: React.FC<CompareShotProps> = ({ sleptAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <SlowPush focus={[960, 580]} by={0.05} backdrop={<InsideBackdrop />}>
      <SynapseRow {...ROWS} y={ROWS.awake} slept={0} />
      <Place x={ROWS.x + 80} y={ROWS.awake - 170}>
        <Label size="note" color={ink.paper}>
          acordado
        </Label>
      </Place>
      <div style={{ opacity: ramp(frame, sleptAt, 0.3 * fps) }}>
        <SynapseRow
          {...ROWS}
          y={ROWS.slept}
          slept={ramp(frame, sleptAt + 0.3 * fps, 0.6 * fps)}
        />
        <Place x={ROWS.x + 150} y={ROWS.slept - 170}>
          <Label size="note" color={ink.paper}>
            depois do sono
          </Label>
        </Place>
      </div>
      <InMice at={4} />
      <Grain />
    </SlowPush>
  );
};

export const ShelvesScene: React.FC<SceneProps> = ({ scene, shots }) => (
  <>
    <Shot range={shots[0]} name="prateleiras transbordando">
      <OverflowShot />
    </Shot>
    <Shot range={shots[1]} name="as conexões, acordado e depois do sono">
      <CompareShot sleptAt={cue(scene, "menores") - shots[1].from} />
    </Shot>
  </>
);
