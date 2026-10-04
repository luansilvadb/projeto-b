import { Tag } from "../parts/Tag";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { Person } from "../../../art/Person";
import { Grain } from "../../../components/Grain";
import { blink, breath, wave } from "../../../components/Idle";
import { Place } from "../../../components/Place";
import { Pop } from "../../../components/Pop";
import { SlowPush } from "../../../components/SlowPush";
import { SvgLayer } from "../../../components/SvgLayer";
import type { SceneProps } from "../../../video/NarratedVideo";
import { Shot } from "../../../video/Shot";
import { ink, lab, person, researcher } from "../palette";
import { Calendar } from "../parts/Calendar";
import { IdeaBackdrop, IdeaShadow } from "../parts/IdeaBackdrop";
import { cue, linear, ramp } from "../../../components/timing";

/** Quantos dias o recorde durou: 264 horas. */
const AWAKE_DAYS = 11;
// A pessoa no lugar do rato: em pé sobre o disco do experimento.
const DISC = { x: 960, y: 840, rx: 300, ry: 46 };
const CROSS = 330;
const STUDENT = { x: 520, y: 980, height: 700 };
const OBSERVER = { x: 1500, y: 980, height: 640 };

type NotWithPeopleShotProps = {
  /** Quadro do plano em que o X cai sobre a ideia. */
  readonly crossAt: number;
};

/** Uma pessoa no lugar do rato, sobre o disco: com gente, isso não se faz. */
const NotWithPeopleShot: React.FC<NotWithPeopleShotProps> = ({ crossAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const seconds = frame / fps;
  const crossed = ramp(frame, crossAt, 0.3 * fps);

  return (
    <SlowPush
      focus={[960, 560]}
      backdrop={<IdeaBackdrop hue="peach" spot={[0.5, 0.5]} />}
    >
      <SvgLayer>
        <rect
          x={DISC.x - 26}
          y={DISC.y}
          width={52}
          height={240}
          fill={lab.platformShade}
        />
        <ellipse
          cx={DISC.x}
          cy={DISC.y + 22}
          rx={DISC.rx}
          ry={DISC.ry}
          fill={lab.platformShade}
        />
        <ellipse
          cx={DISC.x}
          cy={DISC.y}
          rx={DISC.rx}
          ry={DISC.ry}
          fill={lab.platform}
        />
        <ellipse
          cx={DISC.x + DISC.rx * 0.7 * Math.cos(seconds * 2.6)}
          cy={DISC.y + DISC.ry * 0.7 * Math.sin(seconds * 2.6)}
          rx={40}
          ry={11}
          fill={lab.clip}
        />
      </SvgLayer>
      <Place
        x={DISC.x}
        y={DISC.y + 8}
        anchor="bottom"
        style={{ scale: `1 ${breath(seconds, "you")}` }}
      >
        <Person
          height={640}
          colors={person}
          expression={crossed > 0 ? "surprised" : "sleepy"}
          blink={blink(seconds, "you")}
        />
      </Place>
      <SvgLayer>
        <g
          stroke={ink.tagEdge}
          strokeWidth={54}
          strokeLinecap="round"
          opacity={crossed}
        >
          <line
            x1={960 - CROSS}
            y1={540 - CROSS}
            x2={960 - CROSS + 2 * CROSS * crossed}
            y2={540 - CROSS + 2 * CROSS * crossed}
          />
          <line
            x1={960 + CROSS}
            y1={540 - CROSS}
            x2={960 + CROSS - 2 * CROSS * crossed}
            y2={540 - CROSS + 2 * CROSS * crossed}
          />
        </g>
      </SvgLayer>
      <Grain />
    </SlowPush>
  );
};

type RecordShotProps = {
  /** Quadros do plano em que os dias começam a contar e em que fecham em onze. */
  readonly countAt: number;
  readonly doneAt: number;
};

/** O rapaz de olhos arregalados, o pesquisador ao lado com a prancheta e o calendário de onze dias. */
const RecordShot: React.FC<RecordShotProps> = ({ countAt, doneAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const seconds = frame / fps;
  const tired = linear(frame, countAt, doneAt - countAt);

  return (
    <SlowPush
      focus={[900, 600]}
      by={0.06}
      backdrop={<IdeaBackdrop hue="peach" spot={[0.3, 0.45]} />}
    >
      <SvgLayer>
        <IdeaShadow hue="peach" x={STUDENT.x} y={STUDENT.y + 6} width={320} />
        <IdeaShadow hue="peach" x={OBSERVER.x} y={OBSERVER.y + 6} width={300} />
      </SvgLayer>
      <Place
        x={STUDENT.x}
        y={STUDENT.y}
        anchor="bottom"
        style={{
          scale: `1 ${breath(seconds, "student")}`,
          // Ele vai pendendo de sono, e se segura.
          rotate: `${4 * tired * wave(seconds, 2.2)}deg`,
        }}
      >
        <Person
          height={STUDENT.height}
          colors={person}
          expression="surprised"
          blink={blink(seconds, "student", { every: [1, 2.5] })}
        />
      </Place>
      <Place
        x={OBSERVER.x}
        y={OBSERVER.y}
        anchor="bottom"
        style={{ scale: `-1 ${breath(seconds, "observer")}` }}
      >
        <Person
          height={OBSERVER.height}
          colors={researcher}
          plainFace
          frontArm={{ hand: [-150, -300], bend: 30 }}
        />
      </Place>
      <Calendar
        on="peach"
        x={1010}
        y={430}
        days={AWAKE_DAYS}
        filled={AWAKE_DAYS * tired}
        label="11 dias acordado"
        labelAt={doneAt}
      />
      <Place x={1010} y={190}>
        <Pop at={0.3 * fps}>
          <Tag size="note" on="peach">
            1964
          </Tag>
        </Pop>
      </Place>
      <Grain />
    </SlowPush>
  );
};

export const AwakeRecordScene: React.FC<SceneProps> = ({ scene, shots }) => (
  <>
    <Shot range={shots[0]} name="com gente, ninguém fez">
      <NotWithPeopleShot crossAt={cue(scene, "ninguém")} />
    </Shot>
    <Shot range={shots[1]} name="onze dias acordado">
      <RecordShot
        countAt={cue(scene, "ficou") - shots[1].from}
        doneAt={cue(scene, "acordado") - shots[1].from}
      />
    </Shot>
  </>
);
