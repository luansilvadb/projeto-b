import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { Grain } from "../../../components/Grain";
import type { SceneProps } from "../../../video/NarratedVideo";
import { Shot } from "../../../video/Shot";
import { savanna } from "../palette";
import { LAGOON } from "../parts/lagoonCameras";
import { LagoonShot } from "../parts/LagoonShot";
import { ALREADY_SHOWN, cue } from "../../../components/timing";
import { PULSES_ASLEEP, steady } from "../parts/pulse";
import { Herd, SavannaShot } from "./ElephantsScene";
import { BIRD, GlidingBird, SKY_CAMERA, SkyShot } from "./FrigatebirdScene";
import { TimelineShot } from "./OlderThanBrainScene";
import { PANEL_X, Panel } from "./SoFarScene";
import { VacantSign } from "../parts/VacantSign";
import { framing } from "../../../components/Camera";

const HERD_CLOSE = framing([1060, 640], 1.1);
// Os três quadros sobem para a fileira de cima, e o pedestal fica embaixo deles.
const ROW = { y: 290, width: 540, height: 400 };

type SleepersShotProps = {
  /** Quadro do plano em que cada uma entra, na palavra dela: a elefanta, a fragata, a água-viva. */
  readonly at: readonly [number, number, number];
};

/** As três dormindo, cada uma no seu quadro: a elefanta em pé, a fragata no ar, a água-viva no fundo. */
const SleepersShot: React.FC<SleepersShotProps> = ({ at }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const seconds = frame / fps;

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(${savanna.night.sky[0]}, ${savanna.night.sky[1]})`,
      }}
    >
      {/* O lugar de quem não dorme, ainda vazio, embaixo das três que dormem. */}
      <VacantSign x={960} y={1020} scale={0.8} />
      <Panel x={PANEL_X[0]} at={at[0]} {...ROW}>
        <SavannaShot camera={HERD_CLOSE} daylight={0} orb={0.8}>
          <Herd daylight={0} walking={0} asleep={1} seconds={seconds} />
        </SavannaShot>
      </Panel>
      <Panel x={PANEL_X[1]} at={at[1]} {...ROW}>
        <SkyShot camera={SKY_CAMERA.medium} daylight={0} orb={0.3}>
          <GlidingBird
            x={BIRD.x}
            y={BIRD.y}
            daylight={0}
            lid={1}
            seconds={seconds}
          />
        </SkyShot>
      </Panel>
      <Panel x={PANEL_X[2]} at={at[2]} focus={900} {...ROW}>
        <LagoonShot
          time="night"
          camera={LAGOON.medium}
          rhythm={steady(PULSES_ASLEEP)}
          droop={0.8}
        />
      </Panel>
      <Grain />
    </AbsoluteFill>
  );
};

export const NobodyEscapedScene: React.FC<SceneProps> = ({ scene, shots }) => (
  <>
    <Shot range={shots[0]} name="meio bilhão de anos">
      <TimelineShot
        brainAt={ALREADY_SHOWN}
        yearsAt={cue(scene, "quinhentos")}
      />
    </Shot>
    <Shot
      range={shots[1]}
      name="nem a elefanta, nem a fragata, nem a água-viva"
    >
      <SleepersShot
        at={[
          0,
          cue(scene, "fragata") - shots[1].from,
          cue(scene, "água") - shots[1].from,
        ]}
      />
    </Shot>
  </>
);
