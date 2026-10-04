import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { BrainHalves } from "../../../art/BrainHalves";
import { Person } from "../../../art/Person";
import { DOOR, Storefront } from "../../../art/Storefront";
import {
  Camera,
  Layer,
  cameraBetween,
  framing,
} from "../../../components/Camera";
import { Grain } from "../../../components/Grain";
import { breath, wave } from "../../../components/Idle";
import { Place } from "../../../components/Place";
import { Pop } from "../../../components/Pop";
import { SlowPush } from "../../../components/SlowPush";
import type { SceneProps } from "../../../video/NarratedVideo";
import { Shot } from "../../../video/Shot";
import { brainHalves, person, shop } from "../palette";
import { InsideBackdrop } from "../parts/InsideBackdrop";
import { ShopStreet, StreetShadow } from "../parts/ShopStreet";
import { SvgLayer } from "../../../components/SvgLayer";
import { cue, ramp } from "../../../components/timing";
import { BRAIN } from "./HalfBrainScene";

type SwapShotProps = {
  /** Quadro do plano em que os lados trocam. */
  readonly swapAt: number;
};

/** Depois, eles trocam: o lado aceso apaga e o apagado acende. */
const SwapShot: React.FC<SwapShotProps> = ({ swapAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const seconds = frame / fps;
  const swap = ramp(frame, swapAt, 0.5 * fps);

  return (
    <SlowPush
      focus={[BRAIN.x, BRAIN.y]}
      by={0.04}
      backdrop={<InsideBackdrop />}
    >
      <Place x={BRAIN.x} y={BRAIN.y + 6 * wave(seconds, 3.4)}>
        <BrainHalves
          width={BRAIN.width}
          colors={brainHalves}
          left={swap}
          right={1 - swap}
        />
      </Place>
      <Grain />
    </SlowPush>
  );
};

// A loja do golfinho no plano médio, e o funcionário na porta aberta.
const SHOP = { x: 900, ground: 880, width: 760 };
const SHOP_SCALE = SHOP.width / 520;
const CLERK = {
  x: SHOP.x + (DOOR.x + DOOR.width / 2) * SHOP_SCALE,
  y: SHOP.ground - 36 * SHOP_SCALE,
  height: 300,
};
const SHUTTER_SECONDS = 1;

type ClerkShotProps = {
  /** Quadro do plano em que a porta desce sobre a vitrine, e em que o funcionário aparece. */
  readonly closeAt: number;
  readonly clerkAt: number;
};

/** Fechar metade da loja e deixar um funcionário mal-humorado no caixa. */
const ClerkShot: React.FC<ClerkShotProps> = ({ closeAt, clerkAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const seconds = frame / fps;
  const shutter = ramp(frame, closeAt, SHUTTER_SECONDS * fps);

  return (
    <AbsoluteFill>
      <Camera
        {...cameraBetween(
          framing([SHOP.x, 600], 1, [SHOP.x, 600]),
          // Quando o funcionário aparece, a câmera vai até ele.
          framing([CLERK.x - 60, 640], 1.5),
          ramp(frame, clerkAt, 1.2 * fps),
        )}
      >
        <ShopStreet time="night" ground={SHOP.ground} orb={[1620, 180]} />
        <Layer depth={1}>
          <SvgLayer>
            <StreetShadow
              time="night"
              x={SHOP.x}
              y={SHOP.ground + 8}
              width={SHOP.width}
            />
          </SvgLayer>
          <Place x={SHOP.x} y={SHOP.ground} anchor="bottom">
            <Storefront
              width={SHOP.width}
              colors={shop.lit}
              sign="fin"
              shutter={shutter}
              half
              doorOpen
            />
          </Place>
          <Place
            x={CLERK.x}
            y={CLERK.y}
            anchor="bottom"
            style={{
              scale: `1 ${breath(seconds, "clerk", { amplitude: 0.015, period: 3 })}`,
            }}
          >
            <Pop at={clerkAt} from={0.8} origin="bottom">
              <Person
                height={CLERK.height}
                colors={person}
                plainFace
                grumpy
                frontArm={{ hand: [60, -290], bend: 70 }}
                backArm={{ hand: [-60, -300], bend: 70 }}
              />
            </Pop>
          </Place>
        </Layer>
      </Camera>
      <Grain />
    </AbsoluteFill>
  );
};

export const HalfShopScene: React.FC<SceneProps> = ({ scene, shots }) => (
  <>
    <Shot range={shots[0]} name="eles trocam">
      <SwapShot swapAt={cue(scene, "trocam")} />
    </Shot>
    <Shot range={shots[1]} name="metade da loja e um funcionário">
      <ClerkShot
        closeAt={cue(scene, "meia") - shots[1].from}
        clerkAt={cue(scene, "funcionário") - shots[1].from}
      />
    </Shot>
  </>
);
