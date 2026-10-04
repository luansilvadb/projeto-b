import { useCurrentFrame, useVideoConfig } from "remotion";
import { Person } from "../../../art/Person";
import { cameraBetween } from "../../../components/Camera";
import { blink, breath } from "../../../components/Idle";
import { Label } from "../../../components/Label";
import { Place } from "../../../components/Place";
import { Pop } from "../../../components/Pop";
import type { SceneProps } from "../../../video/NarratedVideo";
import { Shot } from "../../../video/Shot";
import { ink, person } from "../palette";
import {
  FRONT,
  FRONT_CLOSE,
  FRONT_OPENING,
  FRONT_WIDE,
  ShopFront,
} from "../parts/ShopFront";

const WIDE_END = cameraBetween(FRONT_WIDE, FRONT_CLOSE, 0.15);
/** Onde a interrogação fica: no meio da porta de enrolar. */
export const DOOR_MARK = {
  x: FRONT.x,
  y: FRONT_OPENING.y + FRONT_OPENING.height / 2,
};

/** A porta da loja baixada, de noite, com luz saindo por baixo: lá dentro, alguém trabalha. */
const BusyShot: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  return (
    <ShopFront
      time="night"
      shutter={1}
      busy
      camera={cameraBetween(FRONT_WIDE, WIDE_END, frame / durationInFrames)}
    />
  );
};

/** De perto: uma interrogação na porta, e a pessoa se inclina para espiar o que acontece lá dentro. */
const PeekShot: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const seconds = frame / fps;

  return (
    <ShopFront time="night" shutter={1} busy camera={FRONT_CLOSE}>
      <Place x={DOOR_MARK.x - 40} y={DOOR_MARK.y}>
        <Pop at={4} from={1.6}>
          <Label size="display" color={ink.moon}>
            ?
          </Label>
        </Pop>
      </Place>
      <Place
        x={FRONT.x + 330}
        y={FRONT.ground + 30}
        anchor="bottom"
        style={{
          rotate: "-9deg",
          scale: `-1 ${breath(seconds, "you")}`,
        }}
      >
        <Person
          height={360}
          colors={person}
          expression="curious"
          blink={blink(seconds, "you")}
        />
      </Place>
    </ShopFront>
  );
};

export const ButWhatScene: React.FC<SceneProps> = ({ shots }) => (
  <>
    <Shot range={shots[0]} name="a porta baixada, com luz lá dentro">
      <BusyShot />
    </Shot>
    <Shot range={shots[1]} name="mas o quê?">
      <PeekShot />
    </Shot>
  </>
);
