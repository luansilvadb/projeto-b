import { useCurrentFrame, useVideoConfig } from "remotion";
import { Cassiopea } from "../../../art/Cassiopea";
import { Person } from "../../../art/Person";
import { Stopwatch } from "../../../art/Stopwatch";
import { cameraBetween } from "../../../components/Camera";
import { breath } from "../../../components/Idle";
import { Place } from "../../../components/Place";
import type { SceneProps } from "../../../video/NarratedVideo";
import { jellyfish, researcher, stopwatch } from "../palette";
import {
  BENCH_Y,
  LAB,
  LabBench,
  LabWall,
  TANK_CENTER,
  Tank,
} from "../parts/Laboratory";
import { mix, ramp, settle } from "../../../components/timing";
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
  RESEARCHER,
  RESTING,
  floating,
} from "./FloorTestScene";

// O tempo que ela leva para perceber que ficou sem apoio, segundo o estudo.
const REACTION_SECONDS = 5;
// Os braços abrem de uma vez; nadar até o fundo leva mais.
const OPEN_SECONDS = 0.3;
const SWIM_SECONDS = 0.9;
/** Depois disto, o laboratório está assentado: ela no fundo, o cronômetro parado em cinco. */
export const SETTLED_SECONDS = REACTION_SECONDS + OPEN_SECONDS + SWIM_SECONDS;
const CAMERA_SECONDS = 0.6;
// O chão do tanque, para onde ela nada depois.
const FLOOR_Y = BENCH_Y - 24 - JELLYFISH_WIDTH * RESTING;
// A mão que ergue o cronômetro, nas unidades do desenho da pesquisadora.
const WATCH_HAND = [236, -360] as const;

/** O segundo com uma casa, como o visor de um cronômetro: "3,2 s". */
const formatSeconds = (seconds: number): string =>
  `${seconds.toFixed(1).replace(".", ",")} s`;

/**
 * O tanque sem a plataforma: ela boia enquanto o cronômetro conta, e só então
 * acorda e nada para o fundo. É uma cena inteira e também a imagem que o plano
 * seguinte encolhe até virar painel.
 */
export const FiveSecondsScene: React.FC<Partial<SceneProps>> = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const seconds = frame / fps;
  const wakeAt = REACTION_SECONDS * fps;
  const open = settle(frame, wakeAt, OPEN_SECONDS * fps);
  const swim = ramp(frame, wakeAt + OPEN_SECONDS * fps, SWIM_SECONDS * fps);
  const adrift = floating(seconds);
  const scale = RESEARCHER.height / 650;
  const rhythm = [
    { from: 0, perMinute: PULSES_ASLEEP },
    { from: wakeAt, perMinute: PULSES_AWAKE },
  ];

  return (
    <Lab
      camera={cameraBetween(
        LAB.close,
        LAB.medium,
        ramp(frame, 0, CAMERA_SECONDS * fps),
      )}
    >
      <LabWall />
      <Place
        x={RESEARCHER.x}
        y={RESEARCHER.y}
        anchor="bottom"
        style={{
          rotate: `${RESEARCHER.lean}deg`,
          scale: `1 ${breath(seconds, "researcher")}`,
        }}
      >
        <Person
          height={RESEARCHER.height}
          colors={researcher}
          bun
          plainFace
          backArm={{ hand: [WATCH_HAND[0], WATCH_HAND[1]], bend: 40 }}
        />
      </Place>
      {/* O cronômetro fica na mão erguida, entre ela e o tanque. */}
      <Place
        x={RESEARCHER.x + WATCH_HAND[0] * scale}
        y={RESEARCHER.y + WATCH_HAND[1] * scale - 70}
      >
        <Stopwatch
          width={180}
          colors={stopwatch}
          reading={formatSeconds(Math.min(seconds, REACTION_SECONDS))}
        />
      </Place>
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
            pulse={pulseShape(pulseCycles(frame, fps, rhythm))}
          />
        </Place>
      </Tank>
    </Lab>
  );
};
