import { Tag } from "../parts/Tag";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { Silhouette } from "../../../art/Silhouettes";
import { cameraBetween } from "../../../components/Camera";
import { Grain } from "../../../components/Grain";
import { breath } from "../../../components/Idle";
import { Label } from "../../../components/Label";
import { Onomatopoeia } from "../../../components/Onomatopoeia";
import { Place } from "../../../components/Place";
import { Pop } from "../../../components/Pop";
import { SlowPush } from "../../../components/SlowPush";
import { SvgLayer } from "../../../components/SvgLayer";
import type { SceneProps } from "../../../video/NarratedVideo";
import { Shot } from "../../../video/Shot";
import { goods, ink, rat, sound } from "../palette";
import { InsideBackdrop } from "../parts/InsideBackdrop";
import { BENCH_Y, LAB, LabWall } from "../parts/Laboratory";
import { FLOOR_Y, ShopInside, Sweeper } from "../parts/ShopInside";
import { Stream } from "../parts/Stream";
import { cue, mix, ramp } from "../../../components/timing";
import { Lab } from "./FloorTestScene";
import { Bench } from "./RatsQuestionScene";
import { InMice } from "./ShelvesScene";

const SWEEPER = { x: 900, height: 600 };
// Um ciclo da corrente de quem está acordado; dormindo, o estudo de 2013 mediu o dobro da velocidade.
export const AWAKE_CYCLE_SECONDS = 5;
const STREAM = { x: 260, width: 1400, height: 110 };

/** A lojista com balde e vassoura, de porta baixada. */
const BroomShot: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const seconds = frame / fps;

  return (
    <>
      <AbsoluteFill>
        <SlowPush focus={[SWEEPER.x, 620]} by={0.06}>
          <ShopInside time="night">
            <SvgLayer>
              {/* O balde, ao lado dela. */}
              <path
                d={`M${SWEEPER.x + 250},${FLOOR_Y - 130} l150,0 l-18,130 l-114,0 Z`}
                fill={goods.bucket}
              />
              <path
                d={`M${SWEEPER.x + 256},${FLOOR_Y - 126} q69,-110 138,0`}
                fill="none"
                stroke={ink.paper}
                strokeWidth={8}
              />
            </SvgLayer>
            <Sweeper x={SWEEPER.x} height={SWEEPER.height} seconds={seconds} />
          </ShopInside>
        </SlowPush>
        <Grain />
      </AbsoluteFill>
    </>
  );
};

// O camundongo que dorme é o assunto: no centro, grande.
const MOUSE = { x: 960, width: 780 };

/** No laboratório, um camundongo dorme: é nele que a faxina foi medida, em 2013. */
const MouseShot: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const seconds = frame / fps;

  return (
    <AbsoluteFill>
      <Lab
        camera={cameraBetween(
          LAB.medium,
          LAB.mediumEnd,
          frame / durationInFrames,
        )}
      >
        <LabWall />
        <Bench />
        <Place
          x={MOUSE.x}
          y={BENCH_Y + 6}
          anchor="bottom"
          style={{
            scale: `1 ${breath(seconds, "mouse", { amplitude: 0.04, period: 3.5 })}`,
          }}
        >
          <Silhouette
            kind="mouse"
            width={MOUSE.width}
            color={rat.body}
            shade={rat.ear}
          />
        </Place>
        <SvgLayer>
          <path
            d={`M${MOUSE.x - MOUSE.width * 0.33 - 24},${BENCH_Y - MOUSE.width * 0.18} q24,22 48,0`}
            fill="none"
            stroke={rat.eye}
            strokeWidth={10}
            strokeLinecap="round"
          />
        </SvgLayer>
        <Place x={MOUSE.x - 40} y={BENCH_Y - MOUSE.width * 0.55}>
          <Onomatopoeia
            at={0.5 * fps}
            size={110}
            color={sound.warm}
            edge={sound.edge}
            tilt={12}
            fade={0.22}
          >
            zzz
          </Onomatopoeia>
        </Place>
      </Lab>
      <Place x={420} y={330}>
        <Pop at={4}>
          <Tag size="label" on="mint">
            2013
          </Tag>
        </Pop>
      </Place>
      <InMice at={0.4 * fps} />
    </AbsoluteFill>
  );
};

type WideningShotProps = {
  /** Quadro do plano em que o espaço entre as células se alarga. */
  readonly widenAt: number;
};

/** Por dentro da cabeça dele: as células se afastam e o fluido corre entre elas, levando os grãos de resíduo. */
const WideningShot: React.FC<WideningShotProps> = ({ widenAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const wide = ramp(frame, widenAt, 0.9 * fps);
  const height = mix(STREAM.height * 0.6, STREAM.height * 1.5, wide);

  return (
    <SlowPush focus={[960, 540]} by={0.06} backdrop={<InsideBackdrop />}>
      <Stream
        {...STREAM}
        y={540 - height / 2}
        height={height}
        flow={frame / fps / AWAKE_CYCLE_SECONDS}
        seed="widening"
      />
      <Grain />
    </SlowPush>
  );
};

/** As duas correntes lado a lado: dormindo, os grãos são levados no dobro da velocidade. */
const TwiceShot: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const flow = frame / fps / AWAKE_CYCLE_SECONDS;

  return (
    <SlowPush focus={[960, 540]} by={0.05} backdrop={<InsideBackdrop />}>
      <Stream {...STREAM} y={270} flow={flow} seed="awake" />
      <Stream {...STREAM} y={760} flow={flow * 2} seed="asleep" asleep />
      <Place x={STREAM.x + 130} y={90}>
        <Label size="note" color={ink.paper}>
          acordado
        </Label>
      </Place>
      <Place x={STREAM.x + 220} y={580}>
        <Tag size="note" on="night">
          dormindo: 2×
        </Tag>
      </Place>
      <Grain />
    </SlowPush>
  );
};

export const CleaningScene: React.FC<SceneProps> = ({ scene, shots }) => (
  <>
    <Shot range={shots[0]} name="a faxina">
      <BroomShot />
    </Shot>
    <Shot range={shots[1]} name="um estudo com camundongos, 2013">
      <MouseShot />
    </Shot>
    <Shot range={shots[2]} name="o espaço entre as células se alarga">
      <WideningShot widenAt={cue(scene, "alargando") - shots[2].from} />
    </Shot>
    <Shot range={shots[3]} name="duas vezes mais rápido">
      <TwiceShot />
    </Shot>
  </>
);
