import { useCurrentFrame, useVideoConfig } from "remotion";
import { Person } from "../../../art/Person";
import { Grain } from "../../../components/Grain";
import { blink, breath } from "../../../components/Idle";
import { Place } from "../../../components/Place";
import { Pop } from "../../../components/Pop";
import { SlowPush } from "../../../components/SlowPush";
import { SvgLayer } from "../../../components/SvgLayer";
import { ALREADY_SHOWN, cue, ramp } from "../../../components/timing";
import type { SceneProps } from "../../../video/NarratedVideo";
import { Shot } from "../../../video/Shot";
import { person } from "../palette";
import { IdeaBackdrop, IdeaShadow } from "../parts/IdeaBackdrop";
import { SleepBill } from "../parts/SleepBill";
import { LifeBar, STANDING } from "../parts/LifeBar";
import { Timeline } from "../parts/Timeline";

type LitShotProps = {
  /** Quadro do plano em que o terço escuro se acende. */
  readonly litAt: number;
};

/** O primeiro plano do vídeo, de volta: a mesma pessoa, a mesma barra, e o terço escuro se acende em índigo. */
const LitShot: React.FC<LitShotProps> = ({ litAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const seconds = frame / fps;

  return (
    <SlowPush
      focus={[1200, 620]}
      by={0.06}
      backdrop={<IdeaBackdrop hue="peach" spot={[0.5, 0.5]} />}
    >
      <LifeBar lit={ramp(frame, litAt, 0.8 * fps)} thirdAt={ALREADY_SHOWN} />
      <SvgLayer>
        <IdeaShadow hue="peach" x={STANDING.x} y={STANDING.y + 6} width={380} />
      </SvgLayer>
      <Place
        x={STANDING.x}
        y={STANDING.y}
        anchor="bottom"
        style={{ scale: `1 ${breath(seconds, "you")}` }}
      >
        <Person
          height={STANDING.height}
          colors={person}
          expression="neutral"
          blink={blink(seconds, "you")}
        />
      </Place>
      <Grain />
    </SlowPush>
  );
};

// A conta no fim da linha: cabe no espaço que a `Timeline` reserva ali.
const BILL_SCALE = 0.86;

type SleepersShotProps = {
  /** Quadro do plano em que a conta entra no fim da linha. */
  readonly billAt: number;
};

// De quanto em quanto os bichos entram na linha, em segundos.
const SLEEPER_STAGGER = 0.35;

/**
 * A linha do tempo com os bichos dormindo ao longo dela. No fim da linha, na
 * fala "cobra", entra a conta de sono com o carimbo "cobrado", a mesma do bicho
 * da savana.
 */
const SleepersShot: React.FC<SleepersShotProps> = ({ billAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const at = (index: number) =>
    Math.round((0.3 + index * SLEEPER_STAGGER) * fps);

  return (
    <>
      <Timeline
        drawn={ramp(frame, 0, 1.2 * fps)}
        jellyfish
        sleepersAt={[at(0), at(1), at(2)]}
      >
        {/* A `Timeline` já centra o filho no fim da linha: um recuo a mais punha a conta sobre a pessoa e a ponta da seta. */}
        <Pop at={billAt}>
          <SleepBill scale={BILL_SCALE} lines={3} stamp={1} />
        </Pop>
      </Timeline>
      <Grain />
    </>
  );
};

export const WhatItIsScene: React.FC<SceneProps> = ({ scene, shots }) => (
  <>
    <Shot range={shots[0]} name="o terço se acende">
      <LitShot litAt={cue(scene, "terço")} />
    </Shot>
    <Shot range={shots[1]} name="os animais dormem desde antes do cérebro">
      <SleepersShot billAt={cue(scene, "cobra") - shots[1].from} />
    </Shot>
  </>
);
