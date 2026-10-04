import { Tag } from "../parts/Tag";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { Antelope } from "../../../art/Antelope";
import { Person } from "../../../art/Person";
import { useStage } from "../../../components/Cast";
import { Grain } from "../../../components/Grain";
import { breath } from "../../../components/Idle";
import { Place } from "../../../components/Place";
import { Pop } from "../../../components/Pop";
import { SlowPush } from "../../../components/SlowPush";
import { SvgLayer } from "../../../components/SvgLayer";
import { CASCADE_STEP } from "../../../video/stage";
import type { SceneProps } from "../../../video/NarratedVideo";
import { Shot } from "../../../video/Shot";
import { antelope, personInPajamas } from "../palette";
import { HUGGING, Pillow } from "../parts/Belongings";
import { IdeaBackdrop, IdeaShadow } from "../parts/IdeaBackdrop";
import { LAGOON } from "../parts/lagoonCameras";
import { LagoonShot } from "../parts/LagoonShot";
import { SLEEP_SIGNS, Seal } from "../parts/SleepSigns";
import { cue } from "../../../components/timing";
import { PULSES_ASLEEP, steady } from "../parts/pulse";

/** O que cada selo diz, na ordem da fala. */
const SIGN_NAMES = ["parada", "lenta", "cobra depois"] as const;
// Os selos ficam em coluna, à direita da água-viva, cada um com o nome ao lado.
const COLUMN = { x: 1260, y: 300, step: 220, size: 170 };

type SealsShotProps = {
  /** Quadro do plano em que cada selo acende, na ordem da fala. */
  readonly at: readonly [number, number, number];
};

/** A água-viva dormindo e, ao lado, os três selos do sono, um por item da fala. */
const SealsShot: React.FC<SealsShotProps> = ({ at }) => {
  const stage = useStage();

  return (
    <AbsoluteFill>
      <LagoonShot
        time="night"
        camera={LAGOON.medium}
        rhythm={steady(PULSES_ASLEEP)}
        droop={0.8}
      />
      {SLEEP_SIGNS.map((sign, index) => (
        <Place
          key={sign}
          x={COLUMN.x}
          y={COLUMN.y + index * COLUMN.step}
          style={{
            translate: "0 -50%",
            transformOrigin: "0 50%",
            // Os selos saem em cascata antes de o plano seguinte chegar.
            scale: `${1 - stage.leave(index * CASCADE_STEP)}`,
          }}
        >
          <Pop at={at[index]}>
            <div style={{ display: "flex", alignItems: "center", gap: 30 }}>
              <Seal sign={sign} size={COLUMN.size} />
              <Tag size="note" on="night">
                {SIGN_NAMES[index]}
              </Tag>
            </div>
          </Pop>
        </Place>
      ))}
    </AbsoluteFill>
  );
};

const GROUND_Y = 900;
const SLEEPERS = { antelope: 520, person: 1400 };
const SEAL_ROW = { y: 250, gap: 150, size: 130 };
const STAMP_STAGGER_SECONDS = 0.12;

/** Os mesmos três selos sobre o bicho da savana e sobre a pessoa: a definição vale para qualquer um. */
const AnyoneShot: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const seconds = frame / fps;

  return (
    <SlowPush
      focus={[960, 560]}
      backdrop={<IdeaBackdrop hue="mint" spot={[0.5, 0.5]} />}
    >
      <SvgLayer>
        <IdeaShadow
          hue="mint"
          x={SLEEPERS.antelope}
          y={GROUND_Y + 6}
          width={460}
        />
        <IdeaShadow
          hue="mint"
          x={SLEEPERS.person}
          y={GROUND_Y + 6}
          width={260}
        />
      </SvgLayer>
      <Place x={SLEEPERS.antelope} y={GROUND_Y} anchor="bottom">
        <div
          style={{
            scale: `1 ${breath(seconds, "antelope", { amplitude: 0.02, period: 4.5 })}`,
          }}
        >
          <Antelope width={560} colors={antelope} rest={1} lid={1} ear={0.1} />
        </div>
      </Place>
      <Place
        x={SLEEPERS.person}
        y={GROUND_Y}
        anchor="bottom"
        style={{
          scale: `1 ${breath(seconds, "sleeper", { amplitude: 0.02, period: 5 })}`,
        }}
      >
        <Person
          height={520}
          colors={personInPajamas}
          expression="asleep"
          {...HUGGING}
          held={<Pillow />}
        />
      </Place>
      {Object.values(SLEEPERS).map((x, sleeper) =>
        SLEEP_SIGNS.map((sign, index) => (
          <Place
            key={`${x}-${sign}`}
            x={x + (index - 1) * SEAL_ROW.gap}
            y={SEAL_ROW.y}
          >
            <Pop
              at={(0.2 + (sleeper * 3 + index) * STAMP_STAGGER_SECONDS) * fps}
              from={1.6}
            >
              <Seal sign={sign} size={SEAL_ROW.size} />
            </Pop>
          </Place>
        )),
      )}
      <Grain />
    </SlowPush>
  );
};

export const ThreeSignsScene: React.FC<SceneProps> = ({ scene, shots }) => (
  <>
    <Shot range={shots[0]} name="os três sinais do sono">
      <SealsShot
        at={[cue(scene, "Parada"), cue(scene, "lenta"), cue(scene, "cobrando")]}
      />
    </Shot>
    <Shot range={shots[1]} name="vale para qualquer bicho">
      <AnyoneShot />
    </Shot>
  </>
);
