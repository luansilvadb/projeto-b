import { useCurrentFrame, useVideoConfig } from "remotion";
import { BrainHalves } from "../../../art/BrainHalves";
import { cameraBetween } from "../../../components/Camera";
import { Grain } from "../../../components/Grain";
import { wave } from "../../../components/Idle";
import { Onomatopoeia } from "../../../components/Onomatopoeia";
import { Place } from "../../../components/Place";
import { Pop } from "../../../components/Pop";
import { SlowPush } from "../../../components/SlowPush";
import { SvgLayer } from "../../../components/SvgLayer";
import type { SceneProps } from "../../../video/NarratedVideo";
import { Shot } from "../../../video/Shot";
import { brainHalves, ink, sound } from "../palette";
import { InsideBackdrop } from "../parts/InsideBackdrop";
import { SURFACE_Y, Spout } from "../parts/OpenSea";
import { cue, mix, ramp, settle } from "../../../components/timing";
import {
  DOLPHIN,
  SEA_CAMERA,
  SeaShot,
  SwimmingDolphin,
} from "./DolphinProblemScene";

/** O cérebro de cima, no centro do quadro. */
export const BRAIN = { x: 960, y: 540, width: 720 };

// A inclinação do golfinho, que nada virado para a esquerda: ele sobe de
// cabeça, porque respira pelo espiráculo, no alto dela, e mergulha de cabeça.
const HEAD_UP = 26;
const HEAD_DOWN = -14;
// Onde fica o espiráculo quando ele está de cabeça para fora: atrás do olho, acima da linha da água.
const BLOWHOLE = { x: -125, y: -78 };

type BreathShotProps = {
  /** Quadros do plano em que ele sobe e em que sopra. */
  readonly riseAt: number;
  readonly breatheAt: number;
};

/** Ele sobe, respira na superfície e mergulha de novo. */
const BreathShot: React.FC<BreathShotProps> = ({ riseAt, breatheAt }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const rise = settle(frame, riseAt, 0.6 * fps);
  const dive = ramp(frame, breatheAt + 0.5 * fps, 0.8 * fps);

  return (
    <SeaShot
      camera={cameraBetween(
        SEA_CAMERA.medium,
        SEA_CAMERA.mediumEnd,
        frame / durationInFrames,
      )}
    >
      <SwimmingDolphin
        x={DOLPHIN.x}
        y={mix(mix(DOLPHIN.y, SURFACE_Y + 40, rise), DOLPHIN.y, dive)}
        tilt={mix(mix(0, HEAD_UP, rise), HEAD_DOWN, dive)}
        seconds={frame / fps}
      />
      <Spout
        x={DOLPHIN.x + BLOWHOLE.x}
        y={SURFACE_Y + BLOWHOLE.y}
        progress={ramp(frame, breatheAt, 0.6 * fps)}
      />
      <Place x={DOLPHIN.x + BLOWHOLE.x + 190} y={SURFACE_Y + BLOWHOLE.y - 110}>
        <Onomatopoeia
          at={breatheAt}
          size={100}
          color={sound.warm}
          edge={sound.edge}
        >
          PFFF
        </Onomatopoeia>
      </Place>
    </SeaShot>
  );
};

type BrainShotProps = {
  /** Quadro do plano em que um dos lados apaga. */
  readonly restAt: number;
};

/** Por dentro: o cérebro em duas metades; uma apaga, a outra fica acesa. */
const BrainShot: React.FC<BrainShotProps> = ({ restAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const seconds = frame / fps;
  const resting = ramp(frame, restAt, 0.6 * fps);

  return (
    <SlowPush focus={[BRAIN.x, BRAIN.y]} by={0.1} backdrop={<InsideBackdrop />}>
      <Place x={BRAIN.x} y={BRAIN.y + 6 * wave(seconds, 3.4)}>
        <Pop at={0} from={0.8} seconds={0.4}>
          <BrainHalves
            width={BRAIN.width}
            colors={brainHalves}
            left={(1 - resting) * (0.85 + 0.15 * wave(seconds, 1.1))}
            right={0.85 + 0.15 * wave(seconds, 1.1, 0.5)}
          />
        </Pop>
      </Place>
      {/* O ronco da metade que dorme. */}
      <Place x={BRAIN.x - 520} y={BRAIN.y - 300}>
        <Onomatopoeia
          at={restAt + 0.5 * fps}
          size={140}
          color={sound.warm}
          edge={sound.edge}
          tilt={12}
          fade={0.22}
        >
          ZZZ
        </Onomatopoeia>
      </Place>
      {/* A linha que separa as metades. */}
      <SvgLayer>
        <line
          x1={BRAIN.x}
          y1={BRAIN.y - 440}
          x2={BRAIN.x}
          y2={BRAIN.y + 440}
          stroke={ink.paper}
          strokeWidth={6}
          strokeDasharray="4 18"
          strokeLinecap="round"
          opacity={0.8}
        />
      </SvgLayer>
      <Grain />
    </SlowPush>
  );
};

type WatchShotProps = {
  /** Quadro do plano em que ele se vira e mostra o outro lado. */
  readonly turnAt: number;
};

/** De perto: deste lado o olho está fechado; ele se vira, e o outro olho está aberto, vigiando. */
const WatchShot: React.FC<WatchShotProps> = ({ turnAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const seconds = frame / fps;
  const turning = ramp(frame, turnAt, 0.3 * fps);
  const turned = turning > 0.5;

  return (
    <SeaShot camera={SEA_CAMERA.close}>
      <div
        style={{
          // Ele gira em torno do próprio eixo: o corpo afina até virar e abre do outro lado.
          scale: `${Math.cos(turning * Math.PI)} 1`,
          transformOrigin: `${DOLPHIN.x}px ${DOLPHIN.y}px`,
        }}
      >
        <SwimmingDolphin
          x={DOLPHIN.x}
          y={DOLPHIN.y}
          tilt={0}
          lid={turned ? 0 : 1}
          look={turned ? [0.6 * wave(seconds, 1.6), 0.4] : undefined}
          seconds={seconds}
        />
      </div>
    </SeaShot>
  );
};

export const HalfBrainScene: React.FC<SceneProps> = ({ scene, shots }) => (
  <>
    <Shot range={shots[0]} name="subir para respirar">
      <BreathShot
        riseAt={cue(scene, "subir")}
        breatheAt={cue(scene, "respirar")}
      />
    </Shot>
    <Shot range={shots[1]} name="metade do cérebro de cada vez">
      <BrainShot restAt={cue(scene, "metade") - shots[1].from} />
    </Shot>
    <Shot range={shots[2]} name="a outra metade vigia">
      <WatchShot turnAt={cue(scene, "outra") - shots[2].from} />
    </Shot>
  </>
);
