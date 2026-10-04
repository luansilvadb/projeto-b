import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { Dolphin } from "../../../art/Dolphin";
import { Fish } from "../../../art/Fish";
import { Sfx } from "../../../audio/Sfx";
import {
  Camera,
  cameraBetween,
  framing,
  type CameraState,
} from "../../../components/Camera";
import { Grain } from "../../../components/Grain";
import { blink, wave } from "../../../components/Idle";
import { Label } from "../../../components/Label";
import { Place } from "../../../components/Place";
import { Pop } from "../../../components/Pop";
import type { SceneProps } from "../../../video/NarratedVideo";
import { Shot } from "../../../video/Shot";
import { dolphin, fish as fishColors, ink } from "../palette";
import { OpenSea, SURFACE_Y, Spout } from "../parts/OpenSea";
import { cue, mix, ramp, settle } from "../../../components/timing";

/** O golfinho no plano do assunto: onde nada, e quanto mede. */
export const DOLPHIN = { x: 960, y: 720, width: 620 };
/** A testemunha: o peixe, pequeno, no canto de baixo. */
const WITNESS = { x: 420, y: 880, width: 90 };
export const SEA_CAMERA = {
  medium: framing([960, 540], 1),
  mediumEnd: framing([960, 620], 1.04, [960, 620]),
  /** De perto, embaixo d'água, com a superfície no alto do quadro. */
  close: framing([980, 760], 1.7, [960, 600]),
  /** De perto, na superfície: a linha d'água no terço de cima. */
  surface: framing([980, 540], 1.5, [960, 560]),
} as const;
const RISE_SECONDS = 0.6;
const SINK_SECONDS = 1.2;
const DIVE_SECONDS = 0.8;

type SeaShotProps = {
  readonly camera: CameraState;
  readonly children: React.ReactNode;
};

/** O mar aberto visto pela câmera, com o que estiver na água. */
export const SeaShot: React.FC<SeaShotProps> = ({ camera, children }) => (
  <AbsoluteFill>
    <Camera {...camera}>
      <OpenSea>{children}</OpenSea>
    </Camera>
    <Grain />
  </AbsoluteFill>
);

type SwimmingDolphinProps = {
  readonly x: number;
  readonly y: number;
  readonly tilt: number;
  readonly lid?: number;
  readonly look?: readonly [number, number];
  readonly mouth?: number;
  readonly seconds: number;
  /** Virado para a direita. */
  readonly flip?: boolean;
};

/** O golfinho com a pausa viva de quem nada: a cauda bate, o corpo ondula. */
export const SwimmingDolphin: React.FC<SwimmingDolphinProps> = ({
  x,
  y,
  tilt,
  lid = 0.1,
  look,
  mouth,
  seconds,
  flip = false,
}) => (
  <Place
    id="dolphin"
    x={x}
    y={y + 6 * wave(seconds, 2.2)}
    style={{ rotate: `${tilt}deg`, scale: flip ? "-1 1" : undefined }}
  >
    <Dolphin
      width={DOLPHIN.width}
      colors={dolphin}
      lid={Math.max(lid, blink(seconds, "dolphin"))}
      look={look}
      tail={7 * wave(seconds, 0.9)}
      mouth={mouth}
    />
  </Place>
);

type BreathShotProps = {
  /** Quadro do plano em que ele sobe, e em que sopra. */
  readonly riseAt: number;
  readonly breatheAt: number;
};

/** Ele precisa subir para respirar: sobe, rompe a superfície, sopra e desce. */
const BreathShot: React.FC<BreathShotProps> = ({ riseAt, breatheAt }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const seconds = frame / fps;
  const rise = settle(frame, riseAt, RISE_SECONDS * fps);
  const dive = ramp(frame, breatheAt + 0.4 * fps, DIVE_SECONDS * fps);
  // Sobe até a cabeça sair da água, e desce de novo.
  const y = mix(mix(DOLPHIN.y, SURFACE_Y + 40, rise), DOLPHIN.y, dive);
  const tilt = mix(mix(0, 26, rise), -14, dive);
  const spout = ramp(frame, breatheAt, 0.6 * fps);
  // Ele entra nadando pela direita e segue devagar até subir.
  const arrive = settle(frame, 0, 1.4 * fps);
  const x =
    mix(DOLPHIN.x + 1300, DOLPHIN.x + 80, arrive) -
    80 * ramp(frame, 1.4 * fps, riseAt);

  return (
    <SeaShot
      camera={cameraBetween(
        SEA_CAMERA.medium,
        SEA_CAMERA.mediumEnd,
        frame / durationInFrames,
      )}
    >
      <Sfx name="splash" from={breatheAt} />
      <SwimmingDolphin x={x} y={y} tilt={tilt} seconds={seconds} />
      <Spout x={DOLPHIN.x - 230} y={SURFACE_Y - 20} progress={spout} />
      <Place
        x={WITNESS.x}
        y={WITNESS.y + 8 * wave(seconds, 2.6, 0.4)}
        style={{ scale: "-1 1" }}
      >
        <Fish
          width={WITNESS.width}
          colors={fishColors.day}
          look={[0.8, -0.5]}
          tail={5 * wave(seconds, 1.1)}
          blink={blink(seconds, "sea-fish")}
        />
      </Place>
    </SeaShot>
  );
};

type SinkShotProps = {
  /** Quadro do plano em que ele tenta dormir, e em que acorda assustado. */
  readonly sleepAt: number;
  readonly wakeAt: number;
};

/** Ele tenta apagar: os olhos fecham, o corpo afunda; o susto o traz de volta. */
const SinkShot: React.FC<SinkShotProps> = ({ sleepAt, wakeAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const seconds = frame / fps;
  const arrived = 0.6 * fps;
  const dozing = ramp(frame, sleepAt, 0.4 * fps);
  const sinking = ramp(frame, sleepAt, SINK_SECONDS * fps);
  const startled = settle(frame, wakeAt, 0.5 * fps);
  const lid = mix(dozing, 0, startled);
  const y = mix(
    mix(DOLPHIN.y, DOLPHIN.y + 220, sinking),
    DOLPHIN.y - 60,
    startled,
  );
  const tilt = mix(mix(0, 34, sinking), -20, startled);

  return (
    <SeaShot
      camera={cameraBetween(
        SEA_CAMERA.mediumEnd,
        SEA_CAMERA.close,
        ramp(frame, 0, arrived),
      )}
    >
      <SwimmingDolphin
        x={DOLPHIN.x}
        y={y}
        tilt={tilt}
        lid={lid}
        look={startled > 0 ? [0.2, -0.8] : undefined}
        seconds={seconds}
      />
      {/* O "z" do cochilo, que estoura no susto. */}
      {frame >= sleepAt + 4 && frame < wakeAt + 4 ? (
        <Place x={DOLPHIN.x - 240} y={y - 160 - 20 * ((seconds * 0.8) % 1)}>
          <Pop at={sleepAt + 4}>
            <Label size="label" color={ink.paper}>
              z
            </Label>
          </Pop>
        </Place>
      ) : null}
      <Place
        x={WITNESS.x + 120}
        y={WITNESS.y + 60 + 8 * wave(seconds, 2.6, 0.4)}
        style={{ scale: "-1 1" }}
      >
        <Fish
          width={WITNESS.width}
          colors={fishColors.day}
          mood={frame >= wakeAt + 3 ? "scared" : "curious"}
          look={[0.8, -0.3]}
          tail={5 * wave(seconds, 1.1)}
          blink={blink(seconds, "sea-fish")}
        />
      </Place>
    </SeaShot>
  );
};

export const DolphinProblemScene: React.FC<SceneProps> = ({ scene, shots }) => (
  <>
    <Shot range={shots[0]} name="subir para respirar">
      <BreathShot
        riseAt={cue(scene, "subir")}
        breatheAt={cue(scene, "respirar")}
      />
    </Shot>
    <Shot range={shots[1]} name="não pode apagar">
      <SinkShot
        sleepAt={cue(scene, "dormir") - shots[1].from}
        wakeAt={cue(scene, "fora") - shots[1].from}
      />
    </Shot>
  </>
);
