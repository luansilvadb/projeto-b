import { useCurrentFrame, useVideoConfig } from "remotion";
import { Person } from "../../../art/Person";
import { Grain } from "../../../components/Grain";
import { blink, breath, wave } from "../../../components/Idle";
import { Place } from "../../../components/Place";
import {
  Pop,
  POP_SECONDS,
  popOpacity,
  popScale,
} from "../../../components/Pop";
import { SlowPush } from "../../../components/SlowPush";
import { cue } from "../../../components/timing";
import type { SceneProps } from "../../../video/NarratedVideo";
import { Shot } from "../../../video/Shot";
import { chalkboard, ink, savanna, sleepResearcher } from "../palette";
import { Balance, ExamSheet, panSpot } from "../parts/ExamSheet";
import { BENCH_Y, LAB, LabWall } from "../parts/Laboratory";
import { Rat, RatLab } from "../parts/Rats";
import { Tag } from "../parts/Tag";
import { AlarmClock } from "./ForcedAwakeScene";

// A prancheta do exame é o assunto: grande, à direita; Rechtschaffen, da cintura para cima, à esquerda.
// Ela termina acima do selo da fonte, que ocupa o canto de baixo à direita.
const SHEET = { x: 1250, y: 520, scale: 1.02 };
const RECHTSCHAFFEN = { x: 500, y: 1330, height: 1040 };

type ExamShotProps = {
  /** Quadro do plano em que a interrogação entra na linha em branco. */
  readonly unknownAt: number;
};

/** A prancheta de exame, preenchida, com a linha "causa da morte" em branco; Rechtschaffen coça a cabeça. */
const ExamShot: React.FC<ExamShotProps> = ({ unknownAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const seconds = frame / fps;
  const frames = POP_SECONDS * fps;

  return (
    <SlowPush focus={[1160, 600]} by={0.05} backdrop={<LabWall />}>
      {/* O mesmo pesquisador de `Researcher`, com a mão na cabeça: a pose que a peça não tem. */}
      <Place
        x={RECHTSCHAFFEN.x}
        y={RECHTSCHAFFEN.y}
        anchor="bottom"
        style={{ scale: `1 ${breath(seconds, "rechtschaffen")}` }}
      >
        <Person
          height={RECHTSCHAFFEN.height}
          colors={sleepResearcher}
          glasses={ink.dark}
          expression="puzzled"
          blink={blink(seconds, "rechtschaffen")}
          // A mão sobe até a cabeça e coça.
          frontArm={{
            hand: [-126 + 8 * wave(seconds, 0.5), -566],
            bend: 40,
          }}
        />
      </Place>
      <Place x={SHEET.x} y={SHEET.y} style={{ rotate: "3deg" }}>
        <ExamSheet
          scale={SHEET.scale}
          question={
            popOpacity(frame, unknownAt, frames) *
            popScale(frame, unknownAt, frames, 0.4, 1.2)
          }
        />
      </Place>
      <Grain />
    </SlowPush>
  );
};

const SCALE = { x: 960, y: BENCH_Y + 26 };
const PAN_RAT = 250;
// O despertador do prato do estresse: o raio do corpo dele.
const PAN_CLOCK = 62;
const NO_SLEEP = 104;

/**
 * A falta de sono, sem letra: a lua riscada, no desenho dos ícones riscados
 * de `third-of-life` (disco claro, figura escura, risco coral).
 */
const NoSleep: React.FC = () => (
  <svg
    width={NO_SLEEP}
    height={NO_SLEEP}
    viewBox="-52 -52 104 104"
    overflow="visible"
  >
    <circle r={50} fill={ink.paper} />
    <path
      d="M10,-32 A32,32 0 1 0 32,10 A25,25 0 1 1 10,-32 Z"
      fill={savanna.night.sky[0]}
    />
    <path
      d="M-34,34 L34,-34"
      stroke={chalkboard.stamp}
      strokeWidth={12}
      strokeLinecap="round"
    />
  </svg>
);
// A balança oscila e não se decide: o quanto pende para cada lado, e em quanto tempo vai e volta.
const SWING = { degrees: 5, seconds: 2.8 };

type DebateShotProps = {
  /** Quadros do plano em que cada etiqueta entra. */
  readonly sleepAt: number;
  readonly stressAt: number;
};

/**
 * A balança das duas causas, uma em cada prato: de um lado o rato de pálpebra
 * caída, com a lua riscada (a falta de sono); do outro, o despertador que
 * toca (o estresse de ser acordado à força). Com um rato igual em cada prato,
 * só as etiquetas diziam a diferença. Ela oscila e não se decide.
 */
const DebateShot: React.FC<DebateShotProps> = ({ sleepAt, stressAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const seconds = frame / fps;
  const tilt = SWING.degrees * wave(seconds, SWING.seconds);
  const pans = ([-1, 1] as const).map((side) =>
    panSpot(side, { ...SCALE, tilt }),
  );

  return (
    <RatLab camera={LAB.medium}>
      <Balance
        {...SCALE}
        tilt={tilt}
        // O rato olha para o outro prato, por cima do braço da balança: é espelhado.
        left={
          <div style={{ position: "relative" }}>
            <div style={{ scale: "-1 1" }}>
              <Rat width={PAN_RAT} state="sleepy" />
            </div>
            <div style={{ position: "absolute", left: -30, top: -70 }}>
              <NoSleep />
            </div>
          </div>
        }
        right={
          // Os pés do despertador pousam no prato; ele treme enquanto toca.
          <div
            style={{
              // A caixa do desenho sobra por baixo dos pés: ele desce esse tanto.
              translate: `0 ${PAN_CLOCK * 0.7}px`,
              transformOrigin: "50% 80%",
              rotate: `${5 * wave(seconds, 0.14)}deg`,
            }}
          >
            <AlarmClock radius={PAN_CLOCK} ringing />
          </div>
        }
      />
      <Place x={pans[0].x} y={pans[0].y + 130}>
        <Pop at={sleepAt}>
          <Tag size="note" on="mint">
            sem sono
          </Tag>
        </Pop>
      </Place>
      <Place x={pans[1].x} y={pans[1].y + 130}>
        <Pop at={stressAt}>
          <Tag size="note" on="mint">
            estresse
          </Tag>
        </Pop>
      </Place>
    </RatLab>
  );
};

export const UnknownCauseScene: React.FC<SceneProps> = ({ scene, shots }) => (
  <>
    <Shot range={shots[0]} name="a causa da morte, em branco">
      <ExamShot unknownAt={cue(scene, "sem")} />
    </Shot>
    <Shot range={shots[1]} name="falta de sono ou estresse?">
      <DebateShot
        sleepAt={cue(scene, "falta") - shots[1].from}
        stressAt={cue(scene, "estresse") - shots[1].from}
      />
    </Shot>
  </>
);
