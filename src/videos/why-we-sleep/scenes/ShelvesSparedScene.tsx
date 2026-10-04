import { Tag } from "../parts/Tag";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { Person } from "../../../art/Person";
import { Camera, Layer, framing } from "../../../components/Camera";
import { Grain } from "../../../components/Grain";
import { breath } from "../../../components/Idle";
import { Place } from "../../../components/Place";
import { Pop } from "../../../components/Pop";
import { SlowPush } from "../../../components/SlowPush";
import type { SceneProps } from "../../../video/NarratedVideo";
import { Shot } from "../../../video/Shot";
import { researcher } from "../palette";
import { InsideBackdrop } from "../parts/InsideBackdrop";
import {
  FLOOR_Y,
  Keeper,
  SHELVES,
  ShelfGoods,
  ShopInside,
} from "../parts/ShopInside";
import { SynapseRow } from "../parts/Synapses";
import { cue, linear, ramp } from "../../../components/timing";
import { SHELVES_MEDIUM } from "./ShelvesScene";

// As dez conexões enchem a largura do quadro: o rosto de cada uma precisa ser lido.
const TEN = { x: 213, step: 166, radius: 82, y: 620 };

type TenShotProps = {
  /** Quadros do plano em que as pequenas encolhem e em que as grandes ganham destaque. */
  readonly shrinkAt: number;
  readonly sparedAt: number;
};

/** Dez conexões em fila: oito encolhem, as duas maiores ficam como estão. */
const TenShot: React.FC<TenShotProps> = ({ shrinkAt, sparedAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <SlowPush focus={[960, 560]} by={0.06} backdrop={<InsideBackdrop />}>
      <SynapseRow
        {...TEN}
        slept={ramp(frame, shrinkAt, 0.7 * fps)}
        highlight={ramp(frame, sparedAt, 0.3 * fps)}
      />
      <Place x={960} y={250}>
        <Pop at={shrinkAt + 0.5 * fps}>
          <Tag size="label" on="night">
            8 em cada 10 encolhem
          </Tag>
        </Pop>
      </Place>
      <Grain />
    </SlowPush>
  );
};

/** De porta baixada, a lojista tira das prateleiras o que sobra; os itens grandes ficam. */
const TrimShot: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const seconds = frame / fps;

  return (
    <AbsoluteFill>
      <Camera {...SHELVES_MEDIUM}>
        <Layer depth={1}>
          <ShopInside time="night">
            <ShelfGoods
              overflowing
              trimmed={linear(frame, 0, durationInFrames * 0.85)}
            />
            <Keeper
              x={SHELVES.x - 150}
              seconds={seconds}
              flip
              backArm={{
                hand: [170, -420 + 90 * Math.sin(seconds * 4)],
                bend: 20,
              }}
            />
          </ShopInside>
        </Layer>
      </Camera>
      <Grain />
    </AbsoluteFill>
  );
};

const CRITIC = { x: SHELVES.x + SHELVES.width + 190, height: 560 };

/** A ideia ainda tem críticos: uma pesquisadora de braços cruzados e uma interrogação presa à prateleira. */
const CriticShot: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const seconds = frame / fps;

  return (
    <AbsoluteFill>
      <Camera
        {...framing([SHELVES.x + SHELVES.width - 20, 600], 1.7, [860, 560])}
      >
        <Layer depth={1}>
          <ShopInside time="night">
            <ShelfGoods trimmed={1} />
            <Place
              x={CRITIC.x}
              y={FLOOR_Y + 10}
              anchor="bottom"
              style={{ scale: `1 ${breath(seconds, "critic")}` }}
            >
              <Person
                height={CRITIC.height}
                colors={researcher}
                bun
                expression="puzzled"
                frontArm={{ hand: [50, -280], bend: 40 }}
                backArm={{ hand: [-50, -270], bend: 40 }}
              />
            </Place>
            <Place x={SHELVES.x + SHELVES.width - 70} y={SHELVES.ys[0] - 40}>
              <Pop at={0.3 * fps} from={1.6}>
                <Tag size="headline" on="night">
                  ?
                </Tag>
              </Pop>
            </Place>
          </ShopInside>
        </Layer>
      </Camera>
      <Grain />
    </AbsoluteFill>
  );
};

export const ShelvesSparedScene: React.FC<SceneProps> = ({ scene, shots }) => (
  <>
    <Shot range={shots[0]} name="oito em cada dez encolhem">
      <TenShot shrinkAt={cue(scene, "oito")} sparedAt={cue(scene, "maiores")} />
    </Shot>
    <Shot range={shots[1]} name="a loja tira o que sobra">
      <TrimShot />
    </Shot>
    <Shot range={shots[2]} name="a ideia ainda tem críticos">
      <CriticShot />
    </Shot>
  </>
);
