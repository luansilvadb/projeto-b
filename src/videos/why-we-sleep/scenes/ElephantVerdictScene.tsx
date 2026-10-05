import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { Camera, cameraBetween, framing } from "../../../components/Camera";
import { Grain } from "../../../components/Grain";
import { Label } from "../../../components/Label";
import { Place } from "../../../components/Place";
import {
  Pop,
  POP_SECONDS,
  popOpacity,
  popScale,
} from "../../../components/Pop";
import { SvgLayer } from "../../../components/SvgLayer";
import { cue, mix, ramp } from "../../../components/timing";
import type { SceneProps } from "../../../video/NarratedVideo";
import { Shot } from "../../../video/Shot";
import { idea, ink } from "../palette";
import { Herd, SleepingElephant, type HerdMember } from "../parts/Herd";
import { IdeaBackdrop, IdeaShadow } from "../parts/IdeaBackdrop";
import { Savanna } from "../parts/Savanna";
import { ELEPHANT_HOURS } from "../parts/SleepRuler";
import { Tag } from "../parts/Tag";
import { VacantSign } from "../parts/VacantSign";

// As duas do estudo, lado a lado e pequenas no plano: só duas. A de trás vem primeiro.
const PAIR: readonly HerdMember[] = [
  { x: 1160, y: -16, width: 290, seed: "pair-second" },
  { x: 820, y: 16, width: 310, seed: "pair-first" },
];
const WALK_SPEED = 30;
const MOON = 0.36;
const WIDE = framing([960, 540], 1);
/** A da frente, no plano médio: é ela quem para e dorme. */
const ON_ONE = framing([840, 780], 2, [900, 700]);
const ONLY_TWO = { x: 990, y: 560 };
// A barra das duas horas sobre elas, com a ponta em aberto: o número ainda não é certo.
const DOUBT = { x: 640, y: 380, sure: 250, open: 230, height: 66 };

type PairProps = {
  /** Quanto a câmera já chegou à da frente, de 0 a 1. */
  readonly closer?: number;
  /** Quanto falta andar, em pixels; paradas, zero. */
  readonly ahead?: number;
  readonly asleep?: readonly [number, number];
};

/** As duas elefantas na savana de noite. */
const Pair: React.FC<PairProps> = ({
  closer = 0,
  ahead = 0,
  asleep = [0, 0],
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <Camera {...cameraBetween(WIDE, ON_ONE, closer)}>
      <Savanna daylight={0} orb={MOON}>
        <AbsoluteFill style={{ translate: `${ahead}px 0` }}>
          <Herd
            members={PAIR}
            daylight={0}
            walking={ahead > 0 ? 1 : 0}
            asleep={asleep}
            seconds={frame / fps}
          />
        </AbsoluteFill>
      </Savanna>
    </Camera>
  );
};

type DoubtProps = {
  /** Quadro do plano em que a barra entra. */
  readonly at: number;
};

/**
 * A incerteza do número, sem depender da etiqueta: a barra "2 h" delas tem a
 * ponta tracejada, que não se sabe onde termina, e a interrogação fica presa
 * ao número.
 */
const Doubt: React.FC<DoubtProps> = ({ at }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const frames = POP_SECONDS * fps;
  const { x, y, sure, open, height } = DOUBT;
  const end = x + sure + open;

  return (
    <AbsoluteFill style={{ opacity: popOpacity(frame, at, frames) }}>
      <SvgLayer>
        <rect
          x={x + 5}
          y={y - height / 2 + 5}
          width={sure + open - 10}
          height={height - 10}
          rx={height / 2 - 5}
          fill={ink.tag}
          fillOpacity={0.3}
          stroke={ink.tag}
          strokeWidth={10}
          strokeDasharray="20 18"
          strokeLinecap="round"
        />
        <path
          d={`M${x + height / 2},${y - height / 2} L${x + sure},${y - height / 2} L${x + sure},${y + height / 2} L${x + height / 2},${y + height / 2} A${height / 2},${height / 2} 0 0 1 ${x + height / 2},${y - height / 2} Z`}
          fill={ink.tag}
        />
      </SvgLayer>
      <Place x={end + 24} y={y} style={{ translate: "0 -50%" }}>
        <Tag size="note" on="night">
          2 h
        </Tag>
      </Place>
      <Place x={end + 236} y={y - 34} style={{ rotate: "12deg" }}>
        <Pop at={at + 0.25 * fps}>
          <Label size="headline" color={ink.moon}>
            ?
          </Label>
        </Pop>
      </Place>
    </AbsoluteFill>
  );
};

type OnlyTwoShotProps = {
  /** Quadros do plano em que a etiqueta entra e em que a barra de ponta em aberto aparece. */
  readonly twoAt: number;
  readonly doubtAt: number;
};

/** As duas, pequenas, andando de noite: uma amostra de só duas. */
const OnlyTwoShot: React.FC<OnlyTwoShotProps> = ({ twoAt, doubtAt }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  return (
    <AbsoluteFill>
      <Pair ahead={(WALK_SPEED * (durationInFrames - frame)) / fps} />
      <Doubt at={doubtAt} />
      <Place x={ONLY_TWO.x} y={ONLY_TWO.y}>
        <Pop at={twoAt}>
          <Tag size="note" on="night">
            só duas
          </Tag>
        </Pop>
      </Place>
      <Grain />
    </AbsoluteFill>
  );
};

type AsleepShotProps = {
  /** Quadro do plano em que a da frente adormece; a outra vai logo depois. */
  readonly sleepAt: number;
};

/** Uma delas para, a tromba cai, o olho fecha: ela dorme em pé. */
const AsleepShot: React.FC<AsleepShotProps> = ({ sleepAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill>
      <Pair
        closer={ramp(frame, 0, 0.8 * fps)}
        asleep={[
          ramp(frame, sleepAt + 0.5 * fps, 0.6 * fps),
          ramp(frame, sleepAt, 0.6 * fps),
        ]}
      />
      <Grain />
    </AbsoluteFill>
  );
};

const HUE = "mint";
const TONE = idea[HUE].contact;
// A régua, de perto: o zero e as primeiras horas enchem o quadro, com as demais saindo pela direita.
// A barra dela vai do zero a "2 h"; a elefanta, grande, fica cortada pela borda esquerda.
const CLOSE = { zero: 560, hour: 420, line: 690, bar: 440, height: 230 };
const SHOWN_HOURS = 4;
const ZERO = { y: CLOSE.line + 148, radius: 104 };
const WHO = { x: CLOSE.zero - 370, y: CLOSE.bar + 150, width: 500 };

type CloseRulerProps = {
  /** Quadro em que a marca do zero ganha o contorno vazio. */
  readonly emptyAt: number;
};

/** O começo da régua de 24 horas: a barra dela em "2 h" e o zero, onde nenhuma barra parou. */
const CloseRuler: React.FC<CloseRulerProps> = ({ emptyAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const frames = POP_SECONDS * fps;

  return (
    <>
      <SvgLayer>
        <IdeaShadow hue={HUE} x={WHO.x} y={WHO.y + 6} width={WHO.width * 0.8} />
        <rect
          x={CLOSE.zero}
          y={CLOSE.bar - CLOSE.height / 2}
          width={CLOSE.hour * ELEPHANT_HOURS}
          height={CLOSE.height}
          rx={CLOSE.height / 2}
          fill={ink.tag}
        />
        <g stroke={TONE} strokeWidth={14} strokeLinecap="round">
          <line
            x1={CLOSE.zero}
            y1={CLOSE.line}
            x2={CLOSE.zero + CLOSE.hour * SHOWN_HOURS}
            y2={CLOSE.line}
          />
          {Array.from({ length: SHOWN_HOURS }, (_, hour) => (
            <line
              key={hour}
              x1={CLOSE.zero + hour * CLOSE.hour}
              y1={CLOSE.line}
              x2={CLOSE.zero + hour * CLOSE.hour}
              y2={CLOSE.line + (hour === 0 ? 40 : 44)}
              opacity={hour === 0 ? 1 : 0.6}
            />
          ))}
        </g>
        {/* O lugar de quem zerasse o sono: um contorno, vazio. */}
        <circle
          cx={CLOSE.zero}
          cy={ZERO.y}
          r={ZERO.radius * popScale(frame, emptyAt, frames)}
          fill="none"
          stroke={ink.tag}
          strokeWidth={14}
          strokeDasharray="30 24"
          strokeLinecap="round"
          opacity={popOpacity(frame, emptyAt, frames)}
        />
      </SvgLayer>
      <SleepingElephant
        x={WHO.x}
        y={WHO.y}
        width={WHO.width}
        flipped
        seconds={frame / fps}
      />
      <Place x={CLOSE.zero} y={ZERO.y}>
        <Label size="headline" color={TONE}>
          0
        </Label>
      </Place>
      <Place
        x={CLOSE.zero + CLOSE.hour * ELEPHANT_HOURS + 36}
        y={CLOSE.bar}
        style={{ translate: "0 -50%" }}
      >
        <Tag size="headline" on={HUE}>
          2 h
        </Tag>
      </Place>
    </>
  );
};

type ZeroShotProps = {
  readonly emptyAt: number;
};

/** A régua de perto: ela chegou a duas horas, e o zero continua vazio. */
const ZeroShot: React.FC<ZeroShotProps> = ({ emptyAt }) => (
  <AbsoluteFill>
    <IdeaBackdrop hue={HUE} spot={[0.4, 0.5]} />
    <CloseRuler emptyAt={emptyAt} />
    <Grain />
  </AbsoluteFill>
);

// O plano aberto: ela dorme à esquerda, virada para o pedestal, que continua vazio.
const GROUND = 960;
const SLEEPER = { x: 600, width: 520 };
const SIGN = { x: 1290, y: GROUND, scale: 0.8 };

/** O pedestal "acordado 24 h" segue sem dono; a elefanta dorme ao lado dele. */
const VacantShot: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // A câmera recua da régua, que fica pequena e some, e o chão com os dois aparece.
  const back = ramp(frame, 0, 0.5 * fps);

  return (
    <AbsoluteFill>
      <IdeaBackdrop hue={HUE} spot={[0.62, 0.5]} />
      <AbsoluteFill
        style={{
          opacity: 1 - back,
          scale: `${mix(1, 0.45, back)}`,
          transformOrigin: `${SLEEPER.x}px ${GROUND - 200}px`,
        }}
      >
        <CloseRuler emptyAt={-POP_SECONDS * fps} />
      </AbsoluteFill>
      <AbsoluteFill
        style={{
          opacity: back,
          scale: `${mix(1.5, 1, back)}`,
          transformOrigin: `${SLEEPER.x}px ${GROUND - 200}px`,
        }}
      >
        <VacantSign {...SIGN} />
        <SvgLayer>
          <IdeaShadow
            hue={HUE}
            x={SLEEPER.x}
            y={GROUND + 6}
            width={SLEEPER.width * 0.8}
          />
        </SvgLayer>
        <SleepingElephant
          x={SLEEPER.x}
          y={GROUND}
          width={SLEEPER.width}
          flipped
          seconds={frame / fps}
        />
      </AbsoluteFill>
      <Grain />
    </AbsoluteFill>
  );
};

export const ElephantVerdictScene: React.FC<SceneProps> = ({
  scene,
  shots,
}) => (
  <>
    <Shot range={shots[0]} name="só duas elefantas">
      <OnlyTwoShot twoAt={cue(scene, "só")} doubtAt={cue(scene, "pouco")} />
    </Shot>
    <Shot range={shots[1]} name="ela para e dorme em pé">
      <AsleepShot sleepAt={cue(scene, "voltaram") - shots[1].from} />
    </Shot>
    <Shot range={shots[2]} name="2 h na régua; o zero, vazio">
      <ZeroShot emptyAt={cue(scene, "escapar") - shots[2].from} />
    </Shot>
    <Shot range={shots[3]} name="o pedestal segue sem dono">
      <VacantShot />
    </Shot>
  </>
);
