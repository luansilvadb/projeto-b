import { Tag } from "../parts/Tag";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { Person } from "../../../art/Person";
import { Grain } from "../../../components/Grain";
import { blink, breath } from "../../../components/Idle";
import { Onomatopoeia } from "../../../components/Onomatopoeia";
import { Place } from "../../../components/Place";
import { Pop } from "../../../components/Pop";
import { SlowPush } from "../../../components/SlowPush";
import { SvgLayer } from "../../../components/SvgLayer";
import type { SceneProps } from "../../../video/NarratedVideo";
import { Shot } from "../../../video/Shot";
import { idea, ink, person, personInPajamas, sound } from "../palette";
import { HUGGING, Pillow } from "../parts/Belongings";
import { IdeaBackdrop, IdeaShadow } from "../parts/IdeaBackdrop";
import { cue, linear, ramp } from "../../../components/timing";
import { HUMAN_SLEEP } from "./SleepCostScene";

/** A barra de uma vida inteira: o terço dormido fica no fim dela, escuro. A cena final a retoma. */
// A barra passa atrás de quem está em pé, na altura do peito: a pessoa é o assunto, e a barra é a vida dela.
export const LIFE_BAR = { x: 160, y: 680, width: 1600, height: 130 };
export const STANDING = { x: 960, y: 1030, height: 700 };

type LifeBarProps = {
  /** Quanto da barra já se desenhou, e quanto do terço dormido já escureceu, de 0 a 1. */
  readonly drawn: number;
  readonly asleep: number;
};

/** A vida como uma barra só, com o terço dormido escuro no fim. */
export const LifeBar: React.FC<LifeBarProps> = ({ drawn, asleep }) => {
  const sleptWidth = LIFE_BAR.width * HUMAN_SLEEP;
  return (
    <SvgLayer>
      <rect
        x={LIFE_BAR.x}
        y={LIFE_BAR.y}
        width={LIFE_BAR.width * drawn}
        height={LIFE_BAR.height}
        rx={LIFE_BAR.height / 2}
        fill={ink.tag}
      />
      <rect
        x={LIFE_BAR.x + LIFE_BAR.width - sleptWidth * asleep}
        y={LIFE_BAR.y}
        width={sleptWidth * asleep}
        height={LIFE_BAR.height}
        rx={LIFE_BAR.height / 2}
        fill={idea.lilac.contact}
      />
    </SvgLayer>
  );
};

type BarShotProps = {
  /** Quadros do plano em que o terço começa a escurecer e em que ganha nome. */
  readonly sleepAt: number;
  readonly thirdAt: number;
};

/** A vida inteira numa barra; um terço dela escurece. */
const BarShot: React.FC<BarShotProps> = ({ sleepAt, thirdAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const seconds = frame / fps;

  return (
    <SlowPush
      focus={[960, 560]}
      backdrop={<IdeaBackdrop hue="peach" spot={[0.5, 0.5]} />}
    >
      <LifeBar
        drawn={ramp(frame, 0, 0.7 * fps)}
        asleep={ramp(frame, sleepAt, 0.7 * fps)}
      />
      <Place
        x={LIFE_BAR.x + LIFE_BAR.width * (1 - HUMAN_SLEEP / 2)}
        y={LIFE_BAR.y - 80}
      >
        <Pop at={thirdAt}>
          <Tag size="note" on="peach">
            um terço
          </Tag>
        </Pop>
      </Place>
      <SvgLayer>
        <IdeaShadow hue="peach" x={STANDING.x} y={STANDING.y + 6} width={360} />
      </SvgLayer>
      <Place
        x={STANDING.x}
        y={STANDING.y}
        anchor="bottom"
        style={{ scale: `1 ${breath(seconds, "you")}` }}
      >
        <Pop at={0} from={0.8} origin="bottom">
          <Person
            height={STANDING.height}
            colors={person}
            expression={frame >= thirdAt ? "surprised" : "curious"}
            blink={blink(seconds, "you")}
          />
        </Pop>
      </Place>
      <Grain />
    </SlowPush>
  );
};

const SLEEPER = { x: 900, y: 1150, height: 950 };
const SNORE = { x: 640, y: 260 };
const WINDOW = { x: 1260, y: 170, width: 460, height: 380 };

type AsleepShotProps = {
  /** Quadro do plano em que a rua começa a passar pela janela. */
  readonly worldAt: number;
};

/** A pessoa dorme; pela janela, o mundo segue sem ela. */
export const AsleepShot: React.FC<AsleepShotProps> = ({ worldAt }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const seconds = frame / fps;
  // Faróis cruzam a janela, um depois do outro.
  const passing = linear(frame, worldAt, durationInFrames - worldAt);

  return (
    <SlowPush
      focus={[960, 560]}
      by={0.06}
      backdrop={<IdeaBackdrop hue="lilac" spot={[0.4, 0.55]} />}
    >
      <SvgLayer>
        <rect
          {...WINDOW}
          rx={28}
          fill={idea.lilac.contact}
          stroke={ink.paper}
          strokeWidth={14}
        />
        <clipPath id="third-of-life-window">
          <rect {...WINDOW} rx={28} />
        </clipPath>
        <g clipPath="url(#third-of-life-window)">
          {[0, 0.45].map((delay) => (
            <circle
              key={delay}
              cx={
                WINDOW.x -
                80 +
                (WINDOW.width + 160) * ((passing * 1.6 + delay) % 1)
              }
              cy={WINDOW.y + WINDOW.height - 70}
              r={34}
              fill={ink.moon}
              opacity={frame >= worldAt ? 0.9 : 0}
            />
          ))}
          <circle
            cx={WINDOW.x + 330}
            cy={WINDOW.y + 100}
            r={44}
            fill={ink.moon}
          />
        </g>
      </SvgLayer>
      <Place
        x={SLEEPER.x}
        y={SLEEPER.y}
        anchor="bottom"
        style={{
          rotate: `${8 * ramp(frame, 0, 0.5 * fps)}deg`,
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
      <Place x={SNORE.x} y={SNORE.y}>
        <Onomatopoeia
          at={0.4 * fps}
          size={150}
          color={sound.warm}
          edge={sound.edge}
          tilt={12}
          fade={0.22}
        >
          ZZZ
        </Onomatopoeia>
      </Place>
      <Grain />
    </SlowPush>
  );
};

export const ThirdOfLifeScene: React.FC<SceneProps> = ({ scene, shots }) => (
  <>
    <Shot range={shots[0]} name="um terço da vida">
      <BarShot sleepAt={cue(scene, "passar")} thirdAt={cue(scene, "terço")} />
    </Shot>
    <Shot range={shots[1]} name="dormindo, sem ver o mundo passar">
      <AsleepShot worldAt={cue(scene, "acontece") - shots[1].from} />
    </Shot>
  </>
);
