import { Tag } from "../parts/Tag";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { cameraBetween, framing } from "../../../components/Camera";
import { Place } from "../../../components/Place";
import { Pop } from "../../../components/Pop";
import type { SceneProps } from "../../../video/NarratedVideo";
import { Shot } from "../../../video/Shot";
import { cue, linear, mix, ramp } from "../../../components/timing";
import { Herd, SAVANNA_WIDE, SavannaShot } from "./ElephantsScene";

/** Quanto tempo elas chegaram a ficar acordadas, segundo o estudo. */
const AWAKE_HOURS = 46;
// Quantos ciclos de dia e noite passam enquanto elas andam: quase dois dias.
const CYCLES = 1.9;
const WALK_SPEED = 40;
// O plano médio chega perto das duas; o amanhecer as encontra parando.
const CLOSE = framing([1050, 700], 1.6, [960, 560]);
const CAMERA_SECONDS = 0.8;

/** Dia e noite se alternam como um cosseno: 1 ao meio-dia, 0 à meia-noite. */
const daylightAt = (cycles: number) =>
  0.5 - 0.5 * Math.cos(cycles * Math.PI * 2);

type WalkingShotProps = {
  /** Quadro do plano em que o contador entra, e em que chega a 46. */
  readonly countAt: number;
  readonly countDoneAt: number;
};

/** Elas andam sem parar enquanto o céu vira dia, noite e dia; o contador sobe até 46 h. */
const WalkingShot: React.FC<WalkingShotProps> = ({ countAt, countDoneAt }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const seconds = frame / fps;
  // Começa de noite: meio ciclo adiantado.
  const cycles = 0.5 + CYCLES * linear(frame, 0, durationInFrames);
  const hours = Math.round(
    AWAKE_HOURS * linear(frame, countAt, countDoneAt - countAt),
  );

  return (
    <>
      <SavannaShot
        camera={SAVANNA_WIDE}
        daylight={daylightAt(cycles)}
        orb={cycles % 1}
      >
        <div style={{ translate: `${-WALK_SPEED * seconds}px 0` }}>
          <Herd
            daylight={daylightAt(cycles)}
            walking={1}
            asleep={0}
            seconds={seconds}
          />
        </div>
      </SavannaShot>
      <Place x={1560} y={220}>
        <Pop at={countAt}>
          <Tag size="label" on="peach">
            {hours} h
          </Tag>
        </Pop>
      </Place>
    </>
  );
};

type StopShotProps = {
  /** Quadro do plano em que elas param, e em que os olhos fecham. */
  readonly stopAt: number;
  readonly sleepAt: number;
};

/** De perto, no amanhecer: as duas enfim param e dormem. */
const StopShot: React.FC<StopShotProps> = ({ stopAt, sleepAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const seconds = frame / fps;
  const walking = 1 - ramp(frame, stopAt, 0.6 * fps);
  const asleep = ramp(frame, sleepAt, 0.6 * fps);
  const daylight = mix(0.55, 0.8, ramp(frame, 0, 2 * fps));

  return (
    <SavannaShot
      camera={cameraBetween(
        SAVANNA_WIDE,
        CLOSE,
        ramp(frame, 0, CAMERA_SECONDS * fps),
      )}
      daylight={daylight}
      orb={0.08}
    >
      <Herd
        daylight={daylight}
        walking={walking}
        asleep={asleep}
        seconds={seconds}
      />
    </SavannaShot>
  );
};

export const ElephantsAwakeScene: React.FC<SceneProps> = ({ scene, shots }) => (
  <>
    <Shot range={shots[0]} name="quase dois dias acordadas">
      <WalkingShot
        countAt={cue(scene, "quase")}
        countDoneAt={cue(scene, "acordadas")}
      />
    </Shot>
    <Shot range={shots[1]} name="nunca pararam de dormir">
      <StopShot
        stopAt={cue(scene, "chegaram", 2) - shots[1].from}
        sleepAt={cue(scene, "zero") - shots[1].from}
      />
    </Shot>
  </>
);
