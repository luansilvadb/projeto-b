import "../../../design/fonts";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { cameraBetween } from "../../../components/Camera";
import { Place } from "../../../components/Place";
import { Pop } from "../../../components/Pop";
import { cue, ramp } from "../../../components/timing";
import { typography } from "../../../design/tokens";
import type { SceneProps } from "../../../video/NarratedVideo";
import { Shot } from "../../../video/Shot";
import { ink, lagoon } from "../palette";
import { LAB, TANK_CENTER } from "../parts/Laboratory";
import { FISH_WATCHING, LAGOON } from "../parts/lagoonCameras";
import { LagoonShot } from "../parts/LagoonShot";
import { PULSES_ASLEEP, PULSES_AWAKE, steady } from "../parts/pulse";
import { TankJellyfish, TankShot } from "../parts/TankShot";

// A noite desce sobre a lagoa do plano anterior: é a varredura deste plano.
const NIGHTFALL_SECONDS = 0.4;
const SLOW_DOWN_SECONDS = 1;

type SlowShotProps = {
  /** Quadro do plano em que ela desacelera. */
  readonly slowAt: number;
};

/** A lagoa escurece e os anéis do pulso saem mais espaçados; o peixe boceja. */
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
        mood: slowing > 0.3 ? "yawning" : "curious",
        look: [-0.3, 0.6],
      }}
    />
  );
};

// A interrogação fica no vazio à direita dela, acima do sino.
const QUESTION = { x: 1520, y: 300 };
const CAMERA_SECONDS = 0.6;

type QuestionShotProps = {
  /** Quadro do plano em que a interrogação entra. */
  readonly questionAt: number;
};

/** Ela de perto, quieta no fundo, com uma interrogação: dormindo, ou só parada? */
const QuestionShot: React.FC<QuestionShotProps> = ({ questionAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill>
      <LagoonShot
        time="night"
        camera={cameraBetween(
          LAGOON.medium,
          LAGOON.asleep,
          ramp(frame, 0, CAMERA_SECONDS * fps),
        )}
        rhythm={steady(PULSES_ASLEEP)}
        droop={0.8}
      />
      <Place x={QUESTION.x} y={QUESTION.y} style={{ rotate: "10deg" }}>
        <Pop at={questionAt} from={0.4} overshoot={1.2}>
          <div
            style={{
              fontFamily: typography.family,
              fontWeight: typography.weight,
              fontSize: typography.size.display * 2.6,
              lineHeight: 1,
              color: ink.moon,
              WebkitTextStroke: `22px ${lagoon.night.vignette}`,
              paintOrder: "stroke fill",
            }}
          >
            ?
          </div>
        </Pop>
      </Place>
    </AbsoluteFill>
  );
};

/** No laboratório: ela num tanque de vidro, sobre a plataforma, e a pesquisadora com a prancheta em branco. */
const LabShot: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  return (
    <TankShot
      camera={cameraBetween(
        LAB.medium,
        LAB.mediumEnd,
        frame / durationInFrames,
      )}
      researcher={[0, 0]}
      platform={TANK_CENTER}
    >
      <TankJellyfish droop={0.8} rhythm={steady(PULSES_ASLEEP)} />
    </TankShot>
  );
};

export const JellyfishNightScene: React.FC<SceneProps> = ({ scene, shots }) => (
  <>
    <Shot range={shots[0]} name="de noite ela pulsa mais devagar">
      <SlowShot slowAt={cue(scene, "pulsa")} />
    </Shot>
    <Shot range={shots[1]} name="dormindo, ou só parada?">
      <QuestionShot questionAt={cue(scene, "parada") - shots[1].from} />
    </Shot>
    <Shot range={shots[2]} name="no laboratório, a prancheta em branco">
      <LabShot />
    </Shot>
  </>
);
