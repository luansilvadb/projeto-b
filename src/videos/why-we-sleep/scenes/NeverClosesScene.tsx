import {
  AbsoluteFill,
  random,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Camera, cameraBetween, framing } from "../../../components/Camera";
import { Grain } from "../../../components/Grain";
import type { SceneProps } from "../../../video/NarratedVideo";
import { Shot } from "../../../video/Shot";
import { LIT_SHOP, SHOP_ROW, ShopRow, type ShopState } from "../parts/ShopRow";
import { cue, linear, ramp } from "../../../components/timing";
import { daylightAt } from "./FrigatebirdScene";

// A loja da fragata, no fim da rua: o plano médio a enquadra com as vizinhas; o close, a vitrine.
const LIT_X = SHOP_ROW[LIT_SHOP].x;
const STREET_CAMERA = {
  medium: framing([LIT_X - 100, 720], 1.5, [960, 600]),
  mediumEnd: framing([LIT_X - 100, 720], 1.56, [960, 600]),
  window: framing([LIT_X - 60, 700], 3.2, [960, 560]),
};
// Quantos dias passam atrás da loja que não fecha.
const CYCLES = 1.5;
const FLICKER_FRAMES = 3;

type OpenShotProps = {
  /** Quadro do plano em que as vizinhas começam a abrir e fechar com os dias. */
  readonly daysAt: number;
};

/** A loja da fragata é a única acesa; sol e lua passam, a porta não desce, as vizinhas abrem e fecham. */
const OpenShot: React.FC<OpenShotProps> = ({ daysAt }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const cycles = CYCLES * linear(frame, daysAt, durationInFrames - daysAt);
  const daylight = daylightAt(cycles);
  const shops: ShopState[] = SHOP_ROW.map((_, index) =>
    index === LIT_SHOP
      ? { shutter: 0, lamp: 1, lit: true }
      : // As vizinhas fecham de noite e abrem de dia: a porta acompanha a luz.
        { shutter: 1 - ramp(daylight * 100, 40, 20), lamp: 1 },
  );

  return (
    <AbsoluteFill>
      <Camera
        {...cameraBetween(
          STREET_CAMERA.medium,
          STREET_CAMERA.mediumEnd,
          frame / durationInFrames,
        )}
      >
        <ShopRow
          shops={shops}
          orb={[LIT_X - 700 + 1400 * (cycles % 1), 200]}
          daylight={daylight}
        />
      </Camera>
      <Grain />
    </AbsoluteFill>
  );
};

type FlickerShotProps = {
  /** Quadro do plano em que a lâmpada começa a falhar. */
  readonly failAt: number;
};

/** De perto, a vitrine acesa: a lâmpada falha, apaga e volta. */
const FlickerShot: React.FC<FlickerShotProps> = ({ failAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const failing = frame >= failAt;
  const flicker = failing
    ? random(`flicker-${Math.floor(frame / FLICKER_FRAMES)}`) < 0.45
      ? 0.15
      : 1
    : 1;
  const shops: ShopState[] = SHOP_ROW.map((_, index) =>
    index === LIT_SHOP
      ? { shutter: 0, lamp: flicker, lit: flicker > 0.5 }
      : { shutter: 1, lamp: 1 },
  );

  return (
    <AbsoluteFill>
      <Camera
        {...cameraBetween(
          STREET_CAMERA.mediumEnd,
          STREET_CAMERA.window,
          ramp(frame, 0, 0.6 * fps),
        )}
      >
        <ShopRow shops={shops} orb={[LIT_X - 500, 200]} />
      </Camera>
      <Grain />
    </AbsoluteFill>
  );
};

export const NeverClosesScene: React.FC<SceneProps> = ({ scene, shots }) => (
  <>
    <Shot range={shots[0]} name="aberta até tarde por uns dias">
      <OpenShot daysAt={cue(scene, "aguenta")} />
    </Shot>
    <Shot range={shots[1]} name="e se ela nunca fechar?">
      <FlickerShot failAt={cue(scene, "nunca") - shots[1].from + 4} />
    </Shot>
  </>
);
