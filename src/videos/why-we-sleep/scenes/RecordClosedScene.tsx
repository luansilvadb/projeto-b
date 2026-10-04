import { Tag } from "../parts/Tag";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { Person } from "../../../art/Person";
import { Grain } from "../../../components/Grain";
import { blink, breath } from "../../../components/Idle";
import { Label } from "../../../components/Label";
import { Onomatopoeia } from "../../../components/Onomatopoeia";
import { Place } from "../../../components/Place";
import { Pop } from "../../../components/Pop";
import { SlowPush } from "../../../components/SlowPush";
import { SvgLayer } from "../../../components/SvgLayer";
import type { SceneProps } from "../../../video/NarratedVideo";
import { Shot } from "../../../video/Shot";
import {
  coin,
  idea,
  ink,
  person,
  personInPajamas,
  puzzle,
  sound,
} from "../palette";
import { HUGGING, Pillow } from "../parts/Belongings";
import { IdeaBackdrop, IdeaShadow } from "../parts/IdeaBackdrop";
import { cue, ramp } from "../../../components/timing";

const STUDENT = { x: 620, y: 1420, height: 1150 };
const SLEEPER = { x: 960, y: 1180, height: 1000 };
const BALLOON = 120;

/** O que ele sentiu, na ordem da fala: o desenho de cada balão, em volta do centro dele. */
const SYMPTOMS = [
  {
    // Enjoo: uma espiral.
    at: [1200, 250],
    icon: (
      <path
        d="M-54,6 a54,54 0 1 1 54,54 a36,36 0 1 1 -36,-36 a18,18 0 1 1 18,18"
        stroke={idea.mint.contact}
      />
    ),
  },
  {
    // Um branco: reticências num contorno vazio.
    at: [1480, 440],
    icon: (
      <>
        <circle r={58} stroke={idea.lilac.contact} strokeDasharray="18 16" />
        {[-26, 0, 26].map((x) => (
          <circle
            key={x}
            cx={x}
            r={7}
            fill={idea.lilac.contact}
            stroke="none"
          />
        ))}
      </>
    ),
  },
  {
    // Raiva: um rabisco em zigue-zague.
    at: [1230, 650],
    icon: (
      <path
        d="M-58,26 L-34,-34 L-12,20 L10,-40 L32,18 L56,-28"
        stroke={ink.tagEdge}
        strokeLinejoin="round"
      />
    ),
  },
] as const;

type SymptomsShotProps = {
  /** Quadro do plano em que cada balão acende, na ordem da fala. */
  readonly at: readonly [number, number, number];
};

/** De perto, o rapaz exausto; três balões acendem sobre ele: enjoo, um branco, raiva. */
const SymptomsShot: React.FC<SymptomsShotProps> = ({ at }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const seconds = frame / fps;

  return (
    <SlowPush
      focus={[900, 520]}
      by={0.06}
      backdrop={<IdeaBackdrop hue="peach" spot={[0.35, 0.5]} />}
    >
      <Place
        x={STUDENT.x}
        y={STUDENT.y}
        anchor="bottom"
        style={{ scale: `1 ${breath(seconds, "student")}` }}
      >
        <Person
          height={STUDENT.height}
          colors={person}
          expression="sleepy"
          blink={blink(seconds, "student", { every: [1, 2.5] })}
        />
      </Place>
      {SYMPTOMS.map(({ at: [x, y], icon }, index) => (
        <Place key={index} x={x} y={y}>
          <Pop at={at[index]}>
            <svg
              width={BALLOON * 2}
              height={BALLOON * 2}
              viewBox={`${-BALLOON} ${-BALLOON} ${BALLOON * 2} ${BALLOON * 2}`}
            >
              <circle r={BALLOON} fill={ink.ring} />
              <g fill="none" strokeWidth={14} strokeLinecap="round">
                {icon}
              </g>
            </svg>
          </Pop>
        </Place>
      ))}
      <Grain />
    </SlowPush>
  );
};

type CrashShotProps = {
  /** Quadro do plano em que a etiqueta das catorze horas entra. */
  readonly hoursAt: number;
};

/** Depois, ele desaba: catorze horas de sono. */
const CrashShot: React.FC<CrashShotProps> = ({ hoursAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const seconds = frame / fps;

  return (
    <SlowPush
      focus={[960, 520]}
      by={0.06}
      backdrop={<IdeaBackdrop hue="lilac" spot={[0.5, 0.5]} />}
    >
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
      <Place x={560} y={260}>
        <Onomatopoeia
          at={0.6 * fps}
          size={150}
          color={sound.warm}
          edge={sound.edge}
          tilt={12}
          fade={0.22}
        >
          ZZZ
        </Onomatopoeia>
      </Place>
      <Place x={1460} y={300}>
        <Pop at={hoursAt}>
          <Tag size="label" on="lilac">
            14 h de sono
          </Tag>
        </Pop>
      </Place>
      <Grain />
    </SlowPush>
  );
};

// O livro dos recordes, fechado, de frente.
// O livro é o assunto: no centro, enchendo o quadro.
const BOOK = { x: 560, y: 140, width: 800, height: 780 };

type BookShotProps = {
  /** Quadro do plano em que a fita lacra o livro. */
  readonly sealedAt: number;
};

/** O livro dos recordes fechado, lacrado com uma fita: "perigoso". */
const BookShot: React.FC<BookShotProps> = ({ sealedAt }) => (
  <SlowPush
    focus={[960, 540]}
    by={0.07}
    backdrop={<IdeaBackdrop hue="mint" spot={[0.5, 0.5]} />}
  >
    <SvgLayer>
      <IdeaShadow
        hue="mint"
        x={BOOK.x + BOOK.width / 2}
        y={BOOK.y + BOOK.height + 50}
        width={BOOK.width * 1.1}
      />
      {/* As páginas, que sobram por baixo e à direita da capa. */}
      <rect
        x={BOOK.x + 24}
        y={BOOK.y + 24}
        width={BOOK.width}
        height={BOOK.height}
        rx={20}
        fill={idea.lilac.top}
      />
      <rect {...BOOK} rx={20} fill={puzzle.board} />
      <rect
        x={BOOK.x}
        y={BOOK.y}
        width={70}
        height={BOOK.height}
        rx={20}
        fill={puzzle.hole}
      />
      {/* A medalha da capa e as linhas do título. */}
      <circle
        cx={BOOK.x + BOOK.width / 2 + 30}
        cy={BOOK.y + 220}
        r={110}
        fill={coin.face}
      />
      <circle
        cx={BOOK.x + BOOK.width / 2 + 30}
        cy={BOOK.y + 220}
        r={76}
        fill={coin.edge}
      />
      {[0, 1].map((line) => (
        <rect
          key={line}
          x={BOOK.x + 190 + line * 60}
          y={BOOK.y + 410 + line * 70}
          width={BOOK.width - 320 - line * 120}
          height={30}
          rx={15}
          fill={puzzle.pieces[1]}
        />
      ))}
    </SvgLayer>
    <Place
      x={BOOK.x + BOOK.width / 2}
      y={BOOK.y + BOOK.height / 2 + 40}
      style={{ rotate: "-14deg" }}
    >
      <Pop at={sealedAt} from={1.7}>
        <div style={{ padding: "0 180px", background: ink.tag }}>
          <Label size="label" color={ink.dark}>
            perigoso
          </Label>
        </div>
      </Pop>
    </Place>
    <Grain />
  </SlowPush>
);

export const RecordClosedScene: React.FC<SceneProps> = ({ scene, shots }) => (
  <>
    <Shot range={shots[0]} name="enjoo, um branco, raiva">
      <SymptomsShot
        at={[
          cue(scene, "náusea"),
          cue(scene, "falhas"),
          cue(scene, "irritação"),
        ]}
      />
    </Shot>
    <Shot range={shots[1]} name="catorze horas de sono">
      <CrashShot hoursAt={cue(scene, "catorze") - shots[1].from} />
    </Shot>
    <Shot range={shots[2]} name="o livro dos recordes se fecha">
      <BookShot sealedAt={cue(scene, "perigoso") - shots[2].from} />
    </Shot>
  </>
);
