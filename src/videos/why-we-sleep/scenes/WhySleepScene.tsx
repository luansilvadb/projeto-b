import { useVideoConfig } from "remotion";
import { Grain } from "../../../components/Grain";
import { Label } from "../../../components/Label";
import { Place } from "../../../components/Place";
import { Pop } from "../../../components/Pop";
import { SlowPush } from "../../../components/SlowPush";
import type { SceneProps } from "../../../video/NarratedVideo";
import { Shot } from "../../../video/Shot";
import { idea, ink } from "../palette";
import { ANSWERS, AnswerIcon } from "../parts/AnswerIcon";
import { IdeaBackdrop } from "../parts/IdeaBackdrop";
import { ShopFront } from "../parts/ShopFront";
import { DOOR_MARK } from "./ButWhatScene";

const ICONS = { xs: [700, 1140, 1580], y: 560, size: 400 };
const STAGGER_SECONDS = 0.3;

/** A porta baixada, por fora, de noite, ainda com a interrogação. */
const StillAskingShot: React.FC = () => (
  <ShopFront time="night" shutter={1} busy>
    <Place x={DOOR_MARK.x - 40} y={DOOR_MARK.y}>
      <Label size="display" color={ink.moon}>
        ?
      </Label>
    </Place>
  </ShopFront>
);

/** A interrogação fica pequena no canto, e as três respostas acendem ao lado dela. */
const EnoughShot: React.FC = () => {
  const { fps } = useVideoConfig();
  return (
    <SlowPush
      focus={[1160, 560]}
      backdrop={<IdeaBackdrop hue="lilac" spot={[0.6, 0.5]} />}
    >
      <Place x={300} y={560}>
        <Label size="headline" color={idea.lilac.contact}>
          ?
        </Label>
      </Place>
      {ANSWERS.map((answer, index) => (
        <Place key={answer} x={ICONS.xs[index]} y={ICONS.y}>
          <Pop at={(0.2 + index * STAGGER_SECONDS) * fps}>
            <AnswerIcon answer={answer} size={ICONS.size} />
          </Pop>
        </Place>
      ))}
      <Grain />
    </SlowPush>
  );
};

export const WhySleepScene: React.FC<SceneProps> = ({ shots }) => (
  <>
    <Shot range={shots[0]} name="a ciência ainda está procurando">
      <StillAskingShot />
    </Shot>
    <Shot range={shots[1]} name="mas já sabemos o bastante">
      <EnoughShot />
    </Shot>
  </>
);
