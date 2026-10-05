import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { Grain } from "../../../components/Grain";
import { Place } from "../../../components/Place";
import { SlowPush } from "../../../components/SlowPush";
import { SvgLayer } from "../../../components/SvgLayer";
import { cue, ramp, settle } from "../../../components/timing";
import { typography } from "../../../design/tokens";
import type { SceneProps } from "../../../video/NarratedVideo";
import { Shot } from "../../../video/Shot";
import { idea, ink, lab } from "../palette";
import {
  Board,
  Chalkboard,
  Quote,
  Researcher,
  type Box,
} from "../parts/Chalkboard";
import { IdeaBackdrop } from "../parts/IdeaBackdrop";

const CALENDAR = { x: 1380, y: 400, width: 440, height: 500 };
// O calendário conta as décadas até os 44 anos que a fala diz.
const DECADES = [10, 20, 30, 40, 44] as const;

type WallCalendarProps = {
  /** Quantos anos a folha de cima mostra. */
  readonly years: number;
  /** Quanto a folha anterior já virou, de 0 a 1. */
  readonly turned: number;
};

/** O calendário de parede: as argolas, o cabeçalho coral e a folha com os anos já passados. */
const WallCalendar: React.FC<WallCalendarProps> = ({ years, turned }) => {
  const { x, y, width, height } = CALENDAR;
  return (
    <>
      <SvgLayer>
        {/* O prego e as folhas de baixo, um pouco fora de esquadro. */}
        <circle
          cx={x}
          cy={y - height / 2 - 34}
          r={12}
          fill={idea.peach.contact}
        />
        <rect
          x={x - width / 2 + 14}
          y={y - height / 2 + 18}
          width={width}
          height={height}
          rx={26}
          fill={idea.peach.contact}
          opacity={0.3}
        />
        <rect
          x={x - width / 2}
          y={y - height / 2}
          width={width}
          height={height}
          rx={26}
          fill={ink.ring}
        />
        <path
          d={`M${x - width / 2},${y - height / 2 + 120} L${x - width / 2},${y - height / 2 + 26} Q${x - width / 2},${y - height / 2} ${x - width / 2 + 26},${y - height / 2} L${x + width / 2 - 26},${y - height / 2} Q${x + width / 2},${y - height / 2} ${x + width / 2},${y - height / 2 + 26} L${x + width / 2},${y - height / 2 + 120} Z`}
          fill={ink.tag}
        />
        {[-120, 0, 120].map((offset) => (
          <rect
            key={offset}
            x={x + offset - 11}
            y={y - height / 2 - 30}
            width={22}
            height={70}
            rx={11}
            fill={ink.dark}
          />
        ))}
        {/* A folha que vira: sobe e some, e a de baixo aparece. */}
        <rect
          x={x - width / 2}
          y={y - height / 2 + 120}
          width={width}
          height={(height - 120) * (1 - turned)}
          fill={idea.peach.spot}
          opacity={turned > 0 && turned < 1 ? 0.9 : 0}
        />
      </SvgLayer>
      <Place x={x} y={y + 40}>
        <div
          style={{
            fontFamily: typography.family,
            fontWeight: 900,
            fontSize: typography.size.display * 1.3,
            lineHeight: 1,
            color: ink.dark,
            textAlign: "center",
          }}
        >
          {years}
          <div style={{ fontSize: typography.size.note, fontWeight: 700 }}>
            anos
          </div>
        </div>
      </Place>
    </>
  );
};

type IntroShotProps = {
  /** Quadros do plano em que o nome entra e em que o calendário chega aos 44 anos. */
  readonly nameAt: number;
  readonly yearsAt: number;
};

/** O pesquisador, da cintura para cima; atrás dele, o calendário de parede troca de década. */
const IntroShot: React.FC<IntroShotProps> = ({ nameAt, yearsAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // As décadas viram a intervalos iguais e a última folha cai na fala "quarenta e quatro".
  const step = Math.max(6, (yearsAt - 0.4 * fps) / (DECADES.length - 1));
  const turn = Math.min(
    DECADES.length - 1,
    Math.max(0, (frame - 0.4 * fps) / step),
  );
  const page = Math.floor(turn);

  return (
    <SlowPush
      focus={[820, 520]}
      backdrop={<IdeaBackdrop hue="peach" spot={[0.36, 0.5]} />}
    >
      <WallCalendar
        years={DECADES[page]}
        turned={
          page === DECADES.length - 1 ? 1 : settle(turn - page, 0.75, 0.25)
        }
      />
      {/* Da cintura para cima: quem fala é o assunto, e o calendário fica atrás dele. */}
      <Researcher
        x={640}
        y={1520}
        height={1280}
        nameAt={nameAt}
        nameOffset={[700, -620]}
      />
      <Grain />
    </SlowPush>
  );
};

const DOOR = { x: 1120, y: 900, width: 330, height: 600 };
const SIGN = { x: DOOR.x, y: DOOR.y - DOOR.height - 110 };

/** A porta do laboratório, com a placa em cima; ele chega e entra. */
const LabDoorShot: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const walked = ramp(frame, 0, durationInFrames);
  const { x, y, width, height } = DOOR;

  return (
    <AbsoluteFill
      style={{ background: `linear-gradient(${lab.wall[0]}, ${lab.wall[1]})` }}
    >
      <SvgLayer>
        {/* O corredor: o rodapé, o piso e a faixa da parede. */}
        <rect x={0} y={560} width={1920} height={16} rx={8} fill={lab.shelf} />
        <rect x={0} y={y} width={1920} height={200} fill={lab.bench} />
        <rect x={0} y={y} width={1920} height={22} fill={lab.benchTop} />
        <rect
          x={0}
          y={y + 150}
          width={1920}
          height={50}
          fill={lab.benchShade}
        />
        {/* O quadro de avisos, ao lado: papéis presos, perto da cor da parede. */}
        <rect
          x={250}
          y={300}
          width={300}
          height={220}
          rx={18}
          fill={lab.shelf}
        />
        <rect
          x={280}
          y={330}
          width={100}
          height={130}
          rx={8}
          fill={lab.wall[0]}
        />
        <rect
          x={410}
          y={350}
          width={110}
          height={80}
          rx={8}
          fill={lab.wall[0]}
        />
        {/* A porta entreaberta: o batente, o vão escuro e a folha com o visor. */}
        <rect
          x={x - width / 2 - 26}
          y={y - height - 26}
          width={width + 52}
          height={height + 26}
          rx={18}
          fill={lab.benchShade}
        />
        <rect
          x={x - width / 2}
          y={y - height}
          width={width}
          height={height}
          fill={lab.contact}
        />
        <path
          d={`M${x - width / 2 + 90},${y - height + 14} L${x + width / 2},${y - height} L${x + width / 2},${y} L${x - width / 2 + 90},${y + 22} Z`}
          fill={lab.platform}
        />
        <path
          d={`M${x + width / 2 - 40},${y - height} L${x + width / 2},${y - height} L${x + width / 2},${y} L${x + width / 2 - 40},${y + 4} Z`}
          fill={lab.platformShade}
        />
        <rect
          x={x - width / 2 + 130}
          y={y - height + 80}
          width={120}
          height={170}
          rx={16}
          fill={lab.water}
        />
        <circle
          cx={x - width / 2 + 122}
          cy={y - height / 2 + 30}
          r={16}
          fill={lab.clip}
        />
        {/* A luz que sai pelo vão, no piso. */}
        <path
          d={`M${x - width / 2},${y} L${x - width / 2 + 90},${y} L${x - width / 2 - 40},${y + 150} L${x - width / 2 - 260},${y + 150} Z`}
          fill={lab.benchTop}
          opacity={0.7}
        />
        <ellipse
          cx={520 + 330 * walked}
          cy={y + 76}
          rx={150}
          ry={18}
          fill={lab.contact}
          opacity={0.3}
        />
      </SvgLayer>
      {/* A placa do laboratório: texto do mundo, sobre a porta. */}
      <Place x={SIGN.x} y={SIGN.y}>
        <div
          style={{
            fontFamily: typography.family,
            fontWeight: 700,
            fontSize: typography.size.note,
            lineHeight: 1.1,
            whiteSpace: "nowrap",
            color: lab.paper,
            background: lab.clip,
            border: `8px solid ${lab.paper}`,
            borderRadius: 22,
            padding: "0.3em 0.7em",
          }}
        >
          Laboratório do Sono · Chicago
        </div>
      </Place>
      <Researcher x={520 + 330 * walked} y={y + 70} height={560} pointing />
      <Grain />
    </AbsoluteFill>
  );
};

const QUOTE_BOARD: Box = { x: 700, y: 130, width: 1100, height: 760 };

/** De perto: ele se vira para o quadro-negro e as aspas se abrem nele; a frase é dele. */
const QuoteShot: React.FC = () => (
  <SlowPush
    focus={[1250, 510]}
    by={0.06}
    backdrop={<IdeaBackdrop hue="peach" spot={[0.6, 0.5]} />}
  >
    <Board {...QUOTE_BOARD}>
      <Quote box={QUOTE_BOARD} at={4} />
    </Board>
    <Researcher x={360} y={1240} height={980} pointing />
    <Grain />
  </SlowPush>
);

type VerdictShotProps = {
  /** Quadro do plano em que o carimbo cai. */
  readonly stampAt: number;
};

/** No quadro, a árvore da vida com todos os ramos dormindo, e o carimbo enorme por cima: "erro?". */
const VerdictShot: React.FC<VerdictShotProps> = ({ stampAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <SlowPush
      focus={[960, 540]}
      backdrop={<IdeaBackdrop hue="peach" spot={[0.5, 0.5]} />}
    >
      <Chalkboard
        grown={ramp(frame, 0, 0.5 * fps)}
        stamp="full"
        stampAt={stampAt}
      />
      <Grain />
    </SlowPush>
  );
};

export const BiggestMistakeScene: React.FC<SceneProps> = ({ scene, shots }) => (
  <>
    <Shot range={shots[0]} name="o pesquisador e os 44 anos">
      <IntroShot nameAt={cue(scene, "Álan")} yearsAt={cue(scene, "quarenta")} />
    </Shot>
    <Shot range={shots[1]} name="o laboratório do sono, em Chicago">
      <LabDoorShot />
    </Shot>
    <Shot range={shots[2]} name="a frase é dele">
      <QuoteShot />
    </Shot>
    <Shot range={shots[3]} name="o maior erro da evolução?">
      <VerdictShot stampAt={cue(scene, "erro") - shots[3].from} />
    </Shot>
  </>
);
