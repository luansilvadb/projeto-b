import { Tag } from "../parts/Tag";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { Person } from "../../../art/Person";
import { Grain } from "../../../components/Grain";
import { blink, breath } from "../../../components/Idle";
import { Label } from "../../../components/Label";
import { Place } from "../../../components/Place";
import { Pop } from "../../../components/Pop";
import { SlowPush } from "../../../components/SlowPush";
import { SvgLayer } from "../../../components/SvgLayer";
import type { SceneProps } from "../../../video/NarratedVideo";
import { Shot } from "../../../video/Shot";
import { chalkboard, ink, sleepResearcher } from "../palette";
import { IdeaBackdrop } from "../parts/IdeaBackdrop";
import { LifeTree } from "../parts/LifeTree";
import { cue, ramp } from "../../../components/timing";

type Box = {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
};

/** O quadro-negro: a moldura de madeira e a face escura, onde o giz escreve. */
const Board: React.FC<Box> = ({ x, y, width, height }) => (
  <SvgLayer>
    <rect
      x={x - 22}
      y={y - 22}
      width={width + 44}
      height={height + 44}
      rx={30}
      fill={chalkboard.frame}
    />
    <rect
      x={x}
      y={y}
      width={width}
      height={height}
      rx={14}
      fill={chalkboard.face}
    />
  </SvgLayer>
);

type ResearcherProps = {
  readonly x: number;
  readonly y: number;
  readonly height: number;
  /** Ele aponta para o quadro, à direita dele. */
  readonly pointing?: boolean;
};

/** O pesquisador de óculos, de jaleco, com a pausa viva de quem fala. */
const Researcher: React.FC<ResearcherProps> = ({
  x,
  y,
  height,
  pointing = false,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const seconds = frame / fps;

  return (
    <Place
      x={x}
      y={y}
      anchor="bottom"
      style={{ scale: `1 ${breath(seconds, "rechtschaffen")}` }}
    >
      <Person
        height={height}
        colors={sleepResearcher}
        glasses={ink.dark}
        expression={pointing ? "curious" : "neutral"}
        blink={blink(seconds, "rechtschaffen")}
        backArm={pointing ? { hand: [190, -400], bend: 20 } : undefined}
      />
    </Place>
  );
};

const INTRO_BOARD = { x: 880, y: 170, width: 860, height: 560 };

type IntroShotProps = {
  /** Quadro do plano em que o nome dele entra. */
  readonly nameAt: number;
};

/** Um pesquisador diante do quadro-negro, e o nome dele. */
const IntroShot: React.FC<IntroShotProps> = ({ nameAt }) => (
  <SlowPush
    focus={[760, 520]}
    backdrop={<IdeaBackdrop hue="peach" spot={[0.3, 0.5]} />}
  >
    <Board {...INTRO_BOARD} />
    {/* Da cintura para cima: quem fala é o assunto, e o quadro fica atrás dele. */}
    <Researcher x={500} y={1500} height={1250} />
    <Place x={1310} y={900}>
      <Pop at={nameAt}>
        <Tag size="note" on="peach">
          Allan Rechtschaffen
        </Tag>
      </Pop>
    </Place>
    <Grain />
  </SlowPush>
);

const QUOTE_BOARD = { x: 700, y: 130, width: 1100, height: 760 };
// As linhas de giz entre as aspas: a frase que ele escreveu, sem as palavras.
const QUOTE_LINES = [0.82, 0.9, 0.6] as const;

/** De perto: ele aponta para o quadro e as aspas se abrem nele; a frase é dele. */
const QuoteShot: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <SlowPush
      focus={[1250, 510]}
      by={0.06}
      backdrop={<IdeaBackdrop hue="peach" spot={[0.6, 0.5]} />}
    >
      <Board {...QUOTE_BOARD} />
      <SvgLayer>
        {QUOTE_LINES.map((length, index) => (
          <rect
            key={index}
            x={QUOTE_BOARD.x + 190}
            y={QUOTE_BOARD.y + 300 + index * 90}
            width={
              (QUOTE_BOARD.width - 380) *
              length *
              ramp(frame, (0.3 + index * 0.35) * fps, 0.4 * fps)
            }
            height={22}
            rx={11}
            fill={chalkboard.chalk}
            opacity={0.85}
          />
        ))}
      </SvgLayer>
      <Place x={QUOTE_BOARD.x + 150} y={QUOTE_BOARD.y + 210}>
        <Pop at={4}>
          <Label size="display" color={chalkboard.chalk}>
            “
          </Label>
        </Pop>
      </Place>
      <Place
        x={QUOTE_BOARD.x + QUOTE_BOARD.width - 150}
        y={QUOTE_BOARD.y + 640}
      >
        <Pop at={1.4 * fps}>
          <Label size="display" color={chalkboard.chalk}>
            ”
          </Label>
        </Pop>
      </Place>
      <Researcher x={360} y={1240} height={980} pointing />
      <Grain />
    </SlowPush>
  );
};

const TREE_BOARD = { x: 200, y: 90, width: 1520, height: 900 };

type VerdictShotProps = {
  /** Quadro do plano em que o carimbo cai. */
  readonly stampAt: number;
};

/** No quadro, a árvore da vida com todos os ramos dormindo, e o carimbo por cima: "erro?". */
const VerdictShot: React.FC<VerdictShotProps> = ({ stampAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <SlowPush
      focus={[960, 540]}
      backdrop={<IdeaBackdrop hue="peach" spot={[0.5, 0.5]} />}
    >
      <Board {...TREE_BOARD} />
      <Place x={960} y={TREE_BOARD.y + TREE_BOARD.height - 20} anchor="bottom">
        <LifeTree
          width={1240}
          color={chalkboard.chalk}
          bud={chalkboard.chalk}
          eye={chalkboard.face}
          grown={ramp(frame, 0, 0.6 * fps)}
        />
      </Place>
      <Place x={1340} y={800} style={{ rotate: "-9deg" }}>
        <Pop at={stampAt} from={1.8}>
          <Label size="display" color={ink.dark} tag={chalkboard.stamp}>
            erro?
          </Label>
        </Pop>
      </Place>
      <Grain />
    </SlowPush>
  );
};

export const BiggestMistakeScene: React.FC<SceneProps> = ({ scene, shots }) => (
  <>
    <Shot range={shots[0]} name="o pesquisador e o quadro-negro">
      <IntroShot nameAt={cue(scene, "Álan")} />
    </Shot>
    <Shot range={shots[1]} name="a frase é dele">
      <QuoteShot />
    </Shot>
    <Shot range={shots[2]} name="o maior erro da evolução?">
      <VerdictShot stampAt={cue(scene, "evolução") - shots[2].from} />
    </Shot>
  </>
);
