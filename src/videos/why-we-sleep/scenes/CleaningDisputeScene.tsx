import { Tag } from "../parts/Tag";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { Person } from "../../../art/Person";
import { Grain } from "../../../components/Grain";
import { breath, wave } from "../../../components/Idle";
import { Label } from "../../../components/Label";
import { Place } from "../../../components/Place";
import { Pop } from "../../../components/Pop";
import { SlowPush } from "../../../components/SlowPush";
import { SvgLayer } from "../../../components/SvgLayer";
import type { SceneProps } from "../../../video/NarratedVideo";
import { Shot } from "../../../video/Shot";
import { goods, ink, researcher, sleepResearcher } from "../palette";
import { AnswerIcon } from "../parts/AnswerIcon";
import { IdeaBackdrop, IdeaShadow } from "../parts/IdeaBackdrop";
import { InsideBackdrop } from "../parts/InsideBackdrop";
import { Broom } from "../parts/ShopInside";
import { Stream } from "../parts/Stream";
import { cue } from "../../../components/timing";
import { AWAKE_CYCLE_SECONDS } from "./CleaningScene";

const HALF = { width: 700, height: 60 };
const VERSIONS = [
  { year: "2013", x: 150, asleep: 2 },
  // Em 2024 a remoção medida foi cerca de 30% mais lenta no sono.
  { year: "2024", x: 1070, asleep: 0.7 },
] as const;

type TrophyShotProps = {
  /** Quadro do plano em que o troféu entra. */
  readonly trophyAt: number;
};

/** Parecia a resposta definitiva: a vassoura ganha um troféu. */
const TrophyShot: React.FC<TrophyShotProps> = ({ trophyAt }) => (
  <SlowPush
    focus={[960, 540]}
    backdrop={<IdeaBackdrop hue="mint" spot={[0.5, 0.5]} />}
  >
    <Place x={860} y={570}>
      <AnswerIcon answer="cleaning" size={640} />
    </Place>
    <Place x={1380} y={360}>
      <Pop at={trophyAt}>
        <svg width={340} height={392} viewBox="-65 -80 130 150">
          <path
            d="M-36,-70 L36,-70 Q36,-6 0,4 Q-36,-6 -36,-70 Z M-36,-56 q-28,0 -22,26 q4,16 26,18 M36,-56 q28,0 22,26 q-4,16 -26,18"
            fill={goods.trophy}
            stroke={goods.trophy}
            strokeWidth={8}
            fillRule="evenodd"
          />
          <rect x={-8} y={0} width={16} height={34} fill={goods.trophy} />
          <rect
            x={-40}
            y={32}
            width={80}
            height={22}
            rx={8}
            fill={goods.broomStick}
          />
        </svg>
      </Pop>
    </Place>
    <Grain />
  </SlowPush>
);

/** As duas medições lado a lado: em 2013 o sono acelera a limpeza; em 2024, ela fica mais lenta. */
const VersionsShot: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const flow = frame / fps / AWAKE_CYCLE_SECONDS;

  return (
    <SlowPush focus={[960, 560]} by={0.05} backdrop={<InsideBackdrop />}>
      {VERSIONS.map(({ year, x, asleep }) => (
        <div key={year}>
          <Stream x={x} y={400} {...HALF} flow={flow} seed={`${year}-awake`} />
          <Stream
            x={x}
            y={800}
            {...HALF}
            flow={flow * asleep}
            seed={`${year}-asleep`}
            asleep
          />
          <Place x={x + HALF.width / 2} y={110}>
            <Tag size="label" on="night">
              {year}
            </Tag>
          </Place>
          <Place x={x + 120} y={225}>
            <Label size="note" color={ink.paper}>
              acordado
            </Label>
          </Place>
          <Place x={x + 120} y={625}>
            <Label size="note" color={ink.paper}>
              dormindo
            </Label>
          </Place>
        </div>
      ))}
      <Place x={960} y={610}>
        <Pop at={0.5 * fps} from={1.6}>
          <Label size="display" color={ink.moon}>
            ?
          </Label>
        </Pop>
      </Place>
      <Grain />
    </SlowPush>
  );
};

const RIVALS = [
  { x: 520, colors: researcher, bun: true },
  { x: 1400, colors: sleepResearcher, bun: false },
] as const;

/** A briga não acabou: dois pesquisadores puxam a mesma vassoura, cada um para um lado. */
const TugShot: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const seconds = frame / fps;
  const pull = 40 * wave(seconds, 0.9);

  return (
    <SlowPush
      focus={[960, 560]}
      by={0.06}
      backdrop={<IdeaBackdrop hue="mint" spot={[0.5, 0.5]} />}
    >
      <SvgLayer>
        {RIVALS.map(({ x }) => (
          <IdeaShadow key={x} hue="mint" x={x + pull} y={1026} width={320} />
        ))}
        <Broom x={560 + pull} y={640} tilt={-90} length={680} />
      </SvgLayer>
      {RIVALS.map(({ x, colors, bun }, index) => (
        <Place
          key={x}
          x={x + pull}
          y={1020}
          anchor="bottom"
          style={{
            rotate: `${(index === 0 ? -7 : 7) + (index === 0 ? -1 : 1) * 3 * wave(seconds, 0.9)}deg`,
            scale: `${index === 0 ? -1 : 1} ${breath(seconds, `rival-${index}`)}`,
          }}
        >
          <Person
            height={700}
            colors={colors}
            bun={bun}
            expression="puzzled"
            frontArm={{ hand: [-190, -330], bend: 10 }}
            backArm={{ hand: [-150, -350], bend: 10 }}
          />
        </Place>
      ))}
      <Grain />
    </SlowPush>
  );
};

export const CleaningDisputeScene: React.FC<SceneProps> = ({
  scene,
  shots,
}) => (
  <>
    <Shot range={shots[0]} name="parecia a resposta definitiva">
      <TrophyShot trophyAt={cue(scene, "definitiva")} />
    </Shot>
    <Shot range={shots[1]} name="2013 contra 2024">
      <VersionsShot />
    </Shot>
    <Shot range={shots[2]} name="a briga ainda não acabou">
      <TugShot />
    </Shot>
  </>
);
