import { useCurrentFrame, useVideoConfig } from "remotion";
import { Cassiopea } from "../../../art/Cassiopea";
import { Fish } from "../../../art/Fish";
import { wave } from "../../../components/Idle";
import { Place } from "../../../components/Place";
import { SvgLayer } from "../../../components/SvgLayer";
import type { SceneProps } from "../../../video/NarratedVideo";
import { Shot } from "../../../video/Shot";
import { fish as fishColors, ink, jellyfish } from "../palette";
import {
  BENCH_Y,
  LAB,
  LabBench,
  LabWall,
  TANK_CENTER,
  Tank,
} from "../parts/Laboratory";
import { FISH_WATCHING, LAGOON } from "../parts/lagoonCameras";
import { LagoonShot } from "../parts/LagoonShot";
import { cue, mix, ramp, settle } from "../../../components/timing";
import {
  PULSES_ASLEEP,
  PULSES_AWAKE,
  pulseCycles,
  pulseShape,
} from "../parts/pulse";
import {
  FLOATING_Y,
  JELLYFISH_WIDTH,
  Lab,
  PullShot,
  RESTING,
  floating,
} from "./FloorTestScene";

const NIGHTFALL_SECONDS = 0.35;
const SLOW_DOWN_SECONDS = 1.2;
// A mão precisa chegar à plataforma antes de puxá-la.
const REACH_SECONDS = 1.3;
// O tranco: os braços abrem de uma vez; nadar até o fundo leva mais.
const STARTLE_SECONDS = 0.4;
const OPEN_SECONDS = 0.3;
const SWIM_SECONDS = 0.9;
// O chão do tanque, para onde ela nada depois.
const FLOOR_Y = BENCH_Y - 24 - JELLYFISH_WIDTH * RESTING;
/** O peixe do tanque, a testemunha do susto. */
const TANK_FISH = { x: TANK_CENTER + 250, y: 500, width: 90 };
const BUBBLES = [0, 0.3, 0.6] as const;

type SlowShotProps = {
  /** Quadro do plano em que ela desacelera. */
  readonly slowAt: number;
};

/** A lagoa escurece e os anéis do pulso saem mais espaçados. */
const SlowShot: React.FC<SlowShotProps> = ({ slowAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const slowing = ramp(frame, slowAt, SLOW_DOWN_SECONDS * fps);

  return (
    <LagoonShot
      time="night"
      nightfall={ramp(frame, 0, NIGHTFALL_SECONDS * fps)}
      camera={LAGOON.medium}
      rhythm={[
        { from: 0, perMinute: PULSES_AWAKE },
        { from: slowAt, perMinute: PULSES_ASLEEP },
      ]}
      droop={0.7 * slowing}
      rings
      fish={{
        ...FISH_WATCHING,
        mood: slowing > 0.6 ? "yawning" : "curious",
        look: [-0.3, 0.6],
      }}
    />
  );
};

/** Sem apoio, ela boia parada; então dá um tranco, se vira e desce nadando. O peixe se assusta. */
const StartleShot: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const seconds = frame / fps;
  const wakeAt = STARTLE_SECONDS * fps;
  const open = settle(frame, wakeAt, OPEN_SECONDS * fps);
  const swim = ramp(frame, wakeAt + OPEN_SECONDS * fps, SWIM_SECONDS * fps);
  const adrift = floating(seconds);
  const startled = frame >= wakeAt + 3;

  return (
    <Lab camera={LAB.close}>
      <LabWall />
      <LabBench />
      <Tank>
        <Place
          x={TANK_CENTER}
          y={mix(FLOATING_Y + adrift.y, FLOOR_Y, swim)}
          style={{ rotate: `${(-10 + adrift.tilt) * (1 - open)}deg` }}
        >
          <Cassiopea
            width={JELLYFISH_WIDTH}
            colors={jellyfish.day}
            droop={1 - open}
            pulse={pulseShape(
              pulseCycles(frame, fps, [
                { from: 0, perMinute: PULSES_ASLEEP },
                { from: wakeAt, perMinute: PULSES_AWAKE },
              ]),
            )}
          />
        </Place>
        <Place
          x={TANK_FISH.x + (startled ? 30 : 0)}
          y={TANK_FISH.y + 6 * wave(seconds, 2.6)}
        >
          <Fish
            width={TANK_FISH.width}
            colors={fishColors.day}
            mood={startled ? "scared" : "curious"}
            look={[-0.9, 0.4]}
            tail={(startled ? 10 : 4) * wave(seconds, startled ? 0.4 : 1.1)}
          />
        </Place>
        {startled ? (
          <SvgLayer>
            {BUBBLES.map((delay) => {
              const rise = ((seconds - wakeAt / fps) * 0.9 + delay) % 1;
              return (
                <circle
                  key={delay}
                  cx={TANK_FISH.x - 50 + 16 * Math.sin(rise * 9 + delay * 7)}
                  cy={TANK_FISH.y - 10 - 150 * rise}
                  r={5 + 7 * rise}
                  fill="none"
                  stroke={ink.ring}
                  strokeWidth={3}
                  opacity={1 - rise}
                />
              );
            })}
          </SvgLayer>
        ) : null}
      </Tank>
    </Lab>
  );
};

export const JellyfishNightScene: React.FC<SceneProps> = ({ scene, shots }) => {
  const { fps } = useVideoConfig();
  return (
    <>
      <Shot range={shots[0]} name="de noite ela pulsa mais devagar">
        <SlowShot slowAt={cue(scene, "devagar")} />
      </Shot>
      <Shot range={shots[1]} name="tiram o apoio de baixo dela">
        <PullShot
          pulledAt={Math.max(
            REACH_SECONDS * fps,
            cue(scene, "dela") - shots[1].from,
          )}
        />
      </Shot>
      <Shot range={shots[2]} name="o tranco">
        <StartleShot />
      </Shot>
    </>
  );
};
