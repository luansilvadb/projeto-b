import { useCurrentFrame, useVideoConfig } from "remotion";
import { Frigatebird } from "../../../art/Frigatebird";
import { cameraBetween, framing } from "../../../components/Camera";
import { blink, breath } from "../../../components/Idle";
import { Label } from "../../../components/Label";
import { Place } from "../../../components/Place";
import { popScale } from "../../../components/Pop";
import type { SceneProps } from "../../../video/NarratedVideo";
import { Shot } from "../../../video/Shot";
import { frigatebird, frigatebirdNight, ink } from "../palette";
import { ISLAND } from "../parts/SkyOcean";
import { cue, linear, mix, ramp, settle } from "../../../components/timing";
import { BIRD, GlidingBird, SKY_CAMERA, SkyShot } from "./FrigatebirdScene";

// Perto do galho em que ela pousa, com a ilha embaixo.
const LAND_CAMERA = framing([1300, 640], 1.5, [960, 600]);
const ISLAND_SECONDS = 0.8;
const NIGHTFALL_SECONDS = 1.5;

type QuestionShotProps = {
  /** Quadro do plano em que a interrogação cresce, e em que estoura. */
  readonly askAt: number;
  readonly burstAt: number;
};

/** Dá para viver quase sem dormir? A interrogação cresce presa a ela e estoura no "não". */
const QuestionShot: React.FC<QuestionShotProps> = ({ askAt, burstAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const seconds = frame / fps;
  const burst = settle(frame, burstAt, 0.2 * fps);
  const dip = ramp(frame, burstAt, 0.5 * fps);

  return (
    <>
      <SkyShot camera={SKY_CAMERA.medium} daylight={1} orb={0.6}>
        <GlidingBird
          x={BIRD.x}
          y={BIRD.y}
          daylight={1}
          tilt={14 * dip}
          seconds={seconds}
        />
      </SkyShot>
      {burst < 1 ? (
        <Place
          x={1300}
          y={300}
          style={{
            scale: `${popScale(frame, askAt, 0.3 * fps) * mix(1, 1.6, burst)}`,
            opacity: 1 - burst,
          }}
        >
          <Label size="display" color={ink.dark}>
            ?
          </Label>
        </Place>
      ) : null}
    </>
  );
};

type LandShotProps = {
  /** Quadro do plano em que ela pousa, e em que dorme. */
  readonly landAt: number;
  readonly sleepAt: number;
};

/** De volta à terra firme: a ilha entra, ela pousa num galho e dorme a noite inteira. */
const LandShot: React.FC<LandShotProps> = ({ landAt, sleepAt }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const seconds = frame / fps;
  // A ilha já está no lugar quando ela chega ao galho.
  const island = ramp(frame, 0, Math.min(ISLAND_SECONDS * fps, landAt - 2));
  const descent = ramp(frame, 0, landAt);
  const landed = frame >= landAt;
  const asleep = ramp(frame, sleepAt, 0.5 * fps);
  const daylight = 1 - ramp(frame, sleepAt, NIGHTFALL_SECONDS * fps);
  const moon = mix(
    0.05,
    0.95,
    linear(frame, sleepAt, durationInFrames - sleepAt),
  );
  const [branchX, branchY] = ISLAND.branch;

  return (
    <SkyShot
      camera={cameraBetween(
        SKY_CAMERA.medium,
        LAND_CAMERA,
        ramp(frame, 0, 0.8 * fps),
      )}
      daylight={daylight}
      orb={daylight < 0.5 ? moon : 0.75}
      island={island}
    >
      {landed ? (
        <Place
          x={branchX - 60}
          y={branchY + 28}
          anchor="bottom"
          style={{
            scale: `1 ${breath(seconds, "perched", { amplitude: 0.02, period: 5 })}`,
          }}
        >
          <Frigatebird
            width={200}
            colors={daylight < 0.5 ? frigatebirdNight : frigatebird}
            pose="perched"
            lid={Math.max(asleep, blink(seconds, "perched"))}
          />
        </Place>
      ) : (
        <GlidingBird
          x={mix(BIRD.x, branchX - 40, descent)}
          y={mix(BIRD.y, branchY - 60, descent)}
          daylight={daylight}
          tilt={18 * descent}
          seconds={seconds}
          span={mix(BIRD.span, BIRD.span * 0.7, descent)}
        />
      )}
    </SkyShot>
  );
};

export const AlmostNoSleepScene: React.FC<SceneProps> = ({ scene, shots }) => (
  <>
    <Shot range={shots[0]} name="dá para viver quase sem dormir?">
      <QuestionShot askAt={cue(scene, "quase")} burstAt={cue(scene, "Só")} />
    </Shot>
    <Shot range={shots[1]} name="de volta à terra firme">
      <LandShot
        landAt={cue(scene, "firme") - shots[1].from + 6}
        sleepAt={cue(scene, "dorme") - shots[1].from}
      />
    </Shot>
  </>
);
