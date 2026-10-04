import { Tag } from "../parts/Tag";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { Person } from "../../../art/Person";
import { Grain } from "../../../components/Grain";
import { breath } from "../../../components/Idle";
import { Place } from "../../../components/Place";
import { Pop } from "../../../components/Pop";
import { SlowPush } from "../../../components/SlowPush";
import { SvgLayer } from "../../../components/SvgLayer";
import type { SceneProps } from "../../../video/NarratedVideo";
import { Shot } from "../../../video/Shot";
import { ink, personInPajamas } from "../palette";
import { HUGGING, Pillow } from "../parts/Belongings";
import { IdeaBackdrop, IdeaShadow } from "../parts/IdeaBackdrop";
import { ShopFront } from "../parts/ShopFront";
import { rulerX, SleepBar, SleepRuler } from "../parts/SleepRuler";
import { cue, ramp } from "../../../components/timing";
import { AllAtOnceShot } from "./ManyReasonsScene";
import { AsleepShot, LIFE_BAR, LifeBar, STANDING } from "./ThirdOfLifeScene";

/** A recomendação para adultos: pelo menos sete horas por noite. */
const RECOMMENDED_HOURS = 7;
const BAR_Y = 250;
// Quem dorme é o assunto: no centro, grande, com a barra presa a ela.
const SLEEPER = { x: 960, y: 1100, height: 700 };

type SevenHoursShotProps = {
  /** Quadros do plano em que a barra enche e em que ganha o número. */
  readonly fillAt: number;
  readonly hoursAt: number;
};

/** A pessoa do começo se deita, e a barra dela marca a recomendação: sete horas ou mais. */
const SevenHoursShot: React.FC<SevenHoursShotProps> = ({ fillAt, hoursAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const seconds = frame / fps;

  return (
    <SlowPush
      focus={[960, 420]}
      backdrop={<IdeaBackdrop hue="mint" spot={[0.5, 0.65]} />}
    >
      <SleepBar
        y={BAR_Y}
        hours={RECOMMENDED_HOURS}
        filled={ramp(frame, fillAt, 0.7 * fps)}
        label="7 h ou mais"
        labelAt={hoursAt}
      />
      <SleepRuler y={BAR_Y + 70} color={ink.dark} />
      <SvgLayer>
        <line
          x1={rulerX(RECOMMENDED_HOURS / 2)}
          y1={BAR_Y + 50}
          x2={SLEEPER.x}
          y2={SLEEPER.y - SLEEPER.height + 60}
          stroke={ink.dark}
          strokeWidth={6}
          strokeLinecap="round"
          strokeDasharray="4 16"
          opacity={0.6 * ramp(frame, hoursAt, 0.3 * fps)}
        />
        <IdeaShadow hue="mint" x={SLEEPER.x} y={SLEEPER.y + 6} width={300} />
      </SvgLayer>
      <Place
        x={SLEEPER.x}
        y={SLEEPER.y}
        anchor="bottom"
        style={{
          scale: `1 ${breath(seconds, "sleeper", { amplitude: 0.02, period: 5 })}`,
        }}
      >
        <Person
          height={SLEEPER.height}
          colors={personInPajamas}
          expression="asleep"
          {...HUGGING}
          held={<Pillow />}
        />
      </Place>
      <Grain />
    </SlowPush>
  );
};

/** A barra da vida inteira do primeiro plano do vídeo, com o terço dormido escuro. */
const ThirdShot: React.FC = () => (
  <SlowPush
    focus={[960, 560]}
    backdrop={<IdeaBackdrop hue="peach" spot={[0.5, 0.5]} />}
  >
    <LifeBar drawn={1} asleep={1} />
    <SvgLayer>
      <IdeaShadow hue="peach" x={STANDING.x} y={STANDING.y + 6} width={360} />
    </SvgLayer>
    <Place x={STANDING.x} y={STANDING.y} anchor="bottom">
      <Person
        height={STANDING.height}
        colors={personInPajamas}
        expression="asleep"
        {...HUGGING}
        held={<Pillow />}
      />
    </Place>
    <Place x={LIFE_BAR.x + LIFE_BAR.width * (5 / 6)} y={LIFE_BAR.y - 80}>
      <Pop at={4}>
        <Tag size="note" on="peach">
          um terço
        </Tag>
      </Pop>
    </Place>
    <Grain />
  </SlowPush>
);

type ReopenShotProps = {
  /** Quadro do plano em que amanhece e a porta sobe. */
  readonly dawnAt: number;
  /** A porta já está baixada quando o plano começa: ele vem de dentro da loja fechada. */
  readonly closed?: boolean;
};

/** O terço escuro é a loja de porta baixada, com a luz acesa lá dentro; amanhece, e a porta sobe. */
const ReopenShot: React.FC<ReopenShotProps> = ({ dawnAt, closed = false }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const dawn = ramp(frame, dawnAt, 1.2 * fps);

  return (
    <ShopFront
      time="night"
      daylight={dawn}
      // A porta baixa no começo do plano e sobe com o dia.
      shutter={
        (closed ? 1 : ramp(frame, 0, 0.8 * fps)) -
        ramp(frame, dawnAt + 0.4 * fps, fps)
      }
      busy={dawn < 0.5}
    />
  );
};

export const TonightScene: React.FC<SceneProps> = ({ scene, shots }) => (
  <>
    <Shot range={shots[0]} name="pelo menos sete horas por noite">
      <SevenHoursShot
        fillAt={cue(scene, "dormir")}
        hoursAt={cue(scene, "sete")}
      />
    </Shot>
    <Shot range={shots[1]} name="aquele terço da vida">
      <ThirdShot />
    </Shot>
    {/* O fecho repete a abertura do vídeo: a mesma pessoa dormindo, com o mundo passando pela janela. */}
    <Shot range={shots[2]} name="de olhos fechados, como no começo">
      <AsleepShot worldAt={cue(scene, "acontece") - shots[2].from} />
    </Shot>
    <Shot range={shots[3]} name="o que acontece do lado de dentro">
      <AllAtOnceShot />
    </Shot>
    <Shot range={shots[4]} name="para poder abrir de novo amanhã">
      <ReopenShot closed dawnAt={cue(scene, "abrir") - shots[4].from} />
    </Shot>
  </>
);
