import { Tag } from "../parts/Tag";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { Person } from "../../../art/Person";
import { Grain } from "../../../components/Grain";
import { breath } from "../../../components/Idle";
import { Place } from "../../../components/Place";
import { Pop } from "../../../components/Pop";
import { SlowPush } from "../../../components/SlowPush";
import type { SceneProps } from "../../../video/NarratedVideo";
import { Shot } from "../../../video/Shot";
import { ink, person } from "../palette";
import { AnswerIcon } from "../parts/AnswerIcon";
import { IdeaBackdrop } from "../parts/IdeaBackdrop";
import { Crate } from "../parts/ShopInside";
import { cue } from "../../../components/timing";

const SOLID = {
  icon: { x: 580, y: 440, size: 380 },
  // Da cintura para cima: quem acorda lembrando é o assunto.
  you: { x: 1300, y: 1560, height: 1250 },
  thought: { x: 1730, y: 240, size: 240 },
};

type SolidShotProps = {
  /** Quadros do plano em que o selo entra e em que a pessoa se lembra. */
  readonly sealAt: number;
  readonly recallAt: number;
};

/** A resposta mais sólida: o estoque ganha o selo de um século de pesquisa, e a pessoa acorda lembrando. */
const SolidShot: React.FC<SolidShotProps> = ({ sealAt, recallAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const seconds = frame / fps;

  return (
    <SlowPush
      focus={[960, 560]}
      backdrop={<IdeaBackdrop hue="peach" spot={[0.6, 0.5]} />}
    >
      <Place x={SOLID.icon.x} y={SOLID.icon.y}>
        <AnswerIcon answer="stock" size={SOLID.icon.size} />
      </Place>
      <Place
        x={SOLID.icon.x}
        y={SOLID.icon.y + 290}
        style={{ rotate: "-4deg" }}
      >
        <Pop at={sealAt} from={1.5}>
          <Tag size="note" on="peach">
            mais de 100 anos de pesquisa
          </Tag>
        </Pop>
      </Place>
      <Place
        x={SOLID.you.x}
        y={SOLID.you.y}
        anchor="bottom"
        style={{ scale: `1 ${breath(seconds, "you")}` }}
      >
        <Person
          height={SOLID.you.height}
          colors={person}
          expression={frame >= recallAt ? "curious" : "sleepy"}
        />
      </Place>
      {/* O que ela lembra ao acordar: o rosto da etiqueta. */}
      <Place x={SOLID.thought.x} y={SOLID.thought.y}>
        <Pop at={recallAt}>
          <svg
            width={SOLID.thought.size}
            height={SOLID.thought.size}
            viewBox="-80 -110 160 160"
          >
            <circle cy={-30} r={80} fill={ink.ring} />
            <Crate x={0} y={14} scale={0.9} memory="face" />
          </svg>
        </Pop>
      </Place>
      <Grain />
    </SlowPush>
  );
};

export const StockroomSolidScene: React.FC<SceneProps> = ({ scene, shots }) => (
  <Shot range={shots[0]} name="a resposta mais sólida">
    <SolidShot sealAt={cue(scene, "século")} recallAt={cue(scene, "guardar")} />
  </Shot>
);
