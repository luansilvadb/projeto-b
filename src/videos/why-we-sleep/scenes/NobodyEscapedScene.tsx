import { useCurrentFrame, useVideoConfig } from "remotion";
import { Grain } from "../../../components/Grain";
import { SlowPush } from "../../../components/SlowPush";
import { ALREADY_SHOWN, cue, ramp } from "../../../components/timing";
import type { SceneProps } from "../../../video/NarratedVideo";
import { Shot } from "../../../video/Shot";
import { IdeaBackdrop } from "../parts/IdeaBackdrop";
import { Search } from "../parts/Search";
import { Timeline } from "../parts/Timeline";

/** O globo sob a lupa, como no gancho, e o pedestal ainda vazio: a procura termina sem ele. */
const SearchShot: React.FC = () => (
  <SlowPush
    focus={[1100, 940]}
    by={0.08}
    from={1.06}
    backdrop={<IdeaBackdrop hue="mint" spot={[0.32, 0.5]} />}
  >
    <Search />
    <Grain />
  </SlowPush>
);

type TimelineShotProps = {
  /** Quadro do plano em que a etiqueta dos anos entra. */
  readonly yearsAt: number;
};

/** A linha do tempo inteira, da água-viva até hoje, e no fim dela o pedestal que ninguém ocupou. */
const TimelineShot: React.FC<TimelineShotProps> = ({ yearsAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <>
      <Timeline
        drawn={ramp(frame, 0, 1.2 * fps)}
        jellyfish
        sleepAt={ALREADY_SHOWN}
        brainAt={ALREADY_SHOWN}
        yearsAt={yearsAt}
        pedestal
      />
      <Grain />
    </>
  );
};

export const NobodyEscapedScene: React.FC<SceneProps> = ({ scene, shots }) => (
  <>
    <Shot range={shots[0]} name="a procura termina sem ele">
      <SearchShot />
    </Shot>
    <Shot range={shots[1]} name="meio bilhão de anos, e o pedestal vazio">
      <TimelineShot yearsAt={cue(scene, "quinhentos") - shots[1].from} />
    </Shot>
  </>
);
