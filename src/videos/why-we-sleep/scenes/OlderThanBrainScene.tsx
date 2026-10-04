import { AbsoluteFill, useVideoConfig } from "remotion";
import { Brain } from "../../../art/Brain";
import { Cassiopea } from "../../../art/Cassiopea";
import { Appear } from "../../../components/Appear";
import { Drifters } from "../../../components/Drifters";
import { Grain } from "../../../components/Grain";
import { Label } from "../../../components/Label";
import { Place } from "../../../components/Place";
import { SlowPush } from "../../../components/SlowPush";
import { palette } from "../../../design/tokens";
import type { SceneProps } from "../../../video/NarratedVideo";
import { Shot } from "../../../video/Shot";
import { brainHalves, idea, ink, jellyfish, lagoon } from "../palette";
import { IdeaBackdrop } from "../parts/IdeaBackdrop";
import { LifeTree } from "../parts/LifeTree";
import { Moon, ORIGIN, OriginLine } from "../parts/OriginLine";
import { cue } from "../../../components/timing";
import { VacantSign } from "../parts/VacantSign";

const MARKER_Y = ORIGIN.y - 110;
const MARKER_LABEL_Y = ORIGIN.y + 90;

type TimelineShotProps = {
  /** Quadros do plano em que o cérebro entra na linha e em que o tempo ganha número. */
  readonly brainAt: number;
  readonly yearsAt: number;
};

/** A linha do tempo no fundo do mar: o sono está nela antes do primeiro cérebro. */
export const TimelineShot: React.FC<TimelineShotProps> = ({
  brainAt,
  yearsAt,
}) => (
  <SlowPush
    focus={[960, 600]}
    backdrop={
      // O fundo do mar em índigo, com a areia violeta embaixo: as cores da lagoa de noite.
      <AbsoluteFill
        style={{
          background: `linear-gradient(${lagoon.night.water[0]}, ${lagoon.night.water[2]} 70%, ${lagoon.night.sand[1]} 88%, ${lagoon.night.sand[2]})`,
        }}
      />
    }
  >
    <Drifters seed="plankton" count={70} opacity={0.4} />
    <Place x={ORIGIN.sleepX} y={430}>
      <Cassiopea width={520} colors={jellyfish.night} droop={0.8} />
    </Place>
    <OriginLine />
    <Place x={ORIGIN.sleepX} y={MARKER_Y}>
      <Moon size={120} />
    </Place>
    <Place x={ORIGIN.sleepX} y={MARKER_LABEL_Y}>
      <Label size="note" tag={palette.sun.light}>
        sono
      </Label>
    </Place>
    <Place x={ORIGIN.brainX} y={MARKER_Y}>
      <Appear at={brainAt}>
        <Brain
          width={190}
          color={brainHalves.asleepShade}
          fill={brainHalves.awake}
          eyes={[brainHalves.eye, brainHalves.pupil]}
          folds
        />
      </Appear>
    </Place>
    <Place x={ORIGIN.brainX} y={MARKER_LABEL_Y}>
      <Appear at={brainAt}>
        <Label size="note" tag={palette.ocean.light}>
          cérebro
        </Label>
      </Appear>
    </Place>
    <Place x={1290} y={200}>
      <Appear at={yearsAt}>
        <Label size="label" tag={palette.sun.light}>
          mais de 500 milhões de anos
        </Label>
      </Appear>
    </Place>
    <Grain />
  </SlowPush>
);

/** A árvore da vida inteira, todos os ramos dormindo; o lugar de quem vive acordado segue vazio. */
const NobodyShot: React.FC = () => {
  const { fps } = useVideoConfig();
  return (
    <SlowPush
      focus={[960, 600]}
      backdrop={<IdeaBackdrop hue="mint" spot={[0.4, 0.45]} />}
    >
      <Place x={720} y={1010} anchor="bottom">
        <LifeTree
          width={1080}
          color={idea.mint.contact}
          bud={ink.tag}
          eye={ink.dark}
        />
      </Place>
      <Appear at={0.5 * fps}>
        <VacantSign x={1580} y={960} />
      </Appear>
      <Grain />
    </SlowPush>
  );
};

export const OlderThanBrainScene: React.FC<SceneProps> = ({ scene, shots }) => (
  <>
    <Shot range={shots[0]} name="o sono antes do cérebro">
      <TimelineShot
        brainAt={cue(scene, "cérebro")}
        yearsAt={cue(scene, "quinhentos")}
      />
    </Shot>
    <Shot range={shots[1]} name="bicho nenhum se livrou">
      <NobodyShot />
    </Shot>
  </>
);
