import {
  AbsoluteFill,
  Easing,
  interpolate,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { trunkTipAt } from "../../../art/Elephant";
import { Stopwatch } from "../../../art/Stopwatch";
import {
  Build,
  Camera,
  cameraBetween,
  framing,
  useBuild,
  type CameraState,
} from "../../../components/Camera";
import { Cast, Stay, Troupe } from "../../../components/Cast";
import { Grain } from "../../../components/Grain";
import { wave } from "../../../components/Idle";
import { Place } from "../../../components/Place";
import { Pop } from "../../../components/Pop";
import { SvgLayer } from "../../../components/SvgLayer";
import { cue, linear, mix, ramp, clamp } from "../../../components/timing";
import type { SceneProps } from "../../../video/NarratedVideo";
import { Shot, useShotLength, type Wipe } from "../../../video/Shot";
import { ink, stopwatch } from "../palette";
import { Calendar } from "../parts/Calendar";
import {
  braked,
  daylightAt,
  Herd,
  orbAt,
  type HerdMember,
  type HerdStride,
} from "../parts/Herd";
import { Savanna, SAVANNA_GROUND_Y } from "../parts/Savanna";
import { polished } from "../polish";
import { Sweep } from "./NightFallsScene";
import { Grow } from "./SleepDebtScene";

type SavannaStageProps = {
  readonly camera: CameraState;
  readonly daylight: number;
  readonly orb?: number;
  /**
   * O quadro do vídeo em que o plano começa. O cenário conta o tempo a partir
   * dele, e não do começo do plano: o capim, a poeira e as estrelas continuam
   * de onde estavam na troca de plano, em vez de saltar.
   */
  readonly clock: number;
  /**
   * Quanto do cenário já subiu, de 0 a 1, quando é o plano quem conduz a
   * subida (ela começa antes de ele chegar); sem valor, o palco conduz.
   */
  readonly risen?: number;
  /** Sem a granulação: para quem desenha o cenário por baixo de outro plano. */
  readonly bare?: boolean;
  readonly children: React.ReactNode;
};

/**
 * Um plano na savana das elefantas: a câmera, o cenário em camadas e a
 * granulação. Os planos seguidos do capítulo estão no mesmo cenário, e cada um
 * parte do enquadramento, da luz e do astro em que o anterior terminou,
 * escrito no próprio plano. Por isso o plano assume o cenário de uma vez
 * (`takeover` 1), como os de `night-falls`: a mistura do palco começa a toda
 * velocidade, e a câmera daqui tem peso.
 */
export const SavannaStage: React.FC<SavannaStageProps> = ({
  camera,
  daylight,
  orb,
  clock,
  risen,
  bare = false,
  children,
}) => {
  const stage = useBuild();
  const build = risen === undefined ? stage : { ...stage, lit: risen, risen };
  return (
    <AbsoluteFill>
      <Build {...build} takeover={1}>
        {/* Dentro daqui o quadro é o do vídeo: é o relógio do cenário. */}
        <Sequence from={-clock} layout="none">
          <Camera {...camera}>
            <Savanna daylight={daylight} orb={orb} finish={polished()}>
              {children}
            </Savanna>
          </Camera>
        </Sequence>
      </Build>
      {bare ? null : <Grain />}
    </AbsoluteFill>
  );
};

/** Onde um ponto do chão da savana aparece no quadro, visto por uma câmera. */
const onScreen = (
  camera: CameraState,
  [x, y]: readonly [number, number],
): readonly [number, number] => [
  960 + camera.zoom * (x - 960) - camera.x,
  540 + camera.zoom * (y - 540) - camera.y,
];

// As duas manadas vêm uma de cada lado e se encontram no meio do quadro. As
// duas matriarcas do estudo são as que vão à frente, maiores e mais perto: é
// só isso que as distingue. Não levam colar: o sono foi medido pela tromba, e
// o colar sugeria outra coisa (decisão do usuário). As de trás vêm primeiro.
const LEFT_HERD: readonly HerdMember[] = [
  { x: 250, y: -76, width: 200, seed: "left-far", flipped: true },
  { x: 470, y: -44, width: 225, seed: "left-mid", flipped: true },
  { x: 110, y: -10, width: 130, seed: "left-calf", flipped: true },
];
const RIGHT_HERD: readonly HerdMember[] = [
  { x: 1670, y: -76, width: 200, seed: "right-far" },
  { x: 1450, y: -44, width: 225, seed: "right-mid" },
  { x: 1810, y: -10, width: 130, seed: "right-calf" },
];
const MATRIARCHS = {
  left: { x: 770, y: 20, width: 330, seed: "matriarch-left", flipped: true },
  right: { x: 1150, y: 20, width: 330, seed: "matriarch-right" },
} as const;
const LEFT = [...LEFT_HERD, MATRIARCHS.left];
const RIGHT = [...RIGHT_HERD, MATRIARCHS.right];
// A matriarca é a última de cada lista.
const MATRIARCH = LEFT.length - 1;
// A caminhada: de quão longe cada manada vem, em pixels, e a velocidade, em
// pixels por quadro: o passo de um elefante. As matriarcas já aparecem na
// borda e as outras entram atrás delas. O que falta quando o plano aberto acaba
// é percorrido na freada do plano seguinte (`least` é o mínimo que ela tem).
const WALK = { from: 450, speed: 2.3, least: 12 };
// O cumprimento: a tromba sobe, fica e desce, em quadros; a da segunda vem depois.
const GREET = { up: 10, hold: 8, down: 14, gap: 12, height: 0.85 };

const WIDE = framing([960, 540], 1);
// O plano aberto deriva devagar para onde as duas vão se encontrar, e termina no quadro composto.
const MEETING = [960, 760] as const;
const WIDE_START = framing(MEETING, 0.96, MEETING);
/** As duas de perto, frente a frente: enchem o quadro, e o rabo de cada uma sai pela borda. */
const CLOSE = framing([960, 760], 2.5, [960, 600]);
/** O plano médio: as duas embaixo, com o céu livre em cima para o sol e a lua passarem. */
const MEDIUM = framing([960, 760], 1.5, [960, 720]);
// O sol dos planos de dia.
const DAY_ORB = 0.3;

/** A tromba de quem está acordada e à vontade: balança devagar. */
const idleTrunk = (seconds: number, phase: number): number =>
  0.15 + 0.1 * wave(seconds, 3.1, phase);

/** Encostadas, as duas trombas ainda se mexem um pouco, uma contra a outra. */
const touchOf = (seconds: number): number => 0.94 + 0.06 * wave(seconds, 1.7);

/** A tromba que não para: sobe e desce em dois ritmos. */
const restlessTrunk = (seconds: number): number =>
  0.32 + 0.2 * wave(seconds, 0.9) + 0.08 * wave(seconds, 0.37);

type HerdsProps = {
  readonly daylight: number;
  /** Quanto falta andar, em pixels. */
  readonly apart?: number;
  readonly stride?: HerdStride;
  /** A tromba e o cumprimento de cada matriarca, a da esquerda e a da direita. */
  readonly trunks: readonly [number, number];
  readonly reach?: number;
  /** Quanto a matriarca da esquerda dorme, de 0 a 1. */
  readonly asleep?: number;
  /** Quanto a manada da direita recuou, em pixels, de costas, e com que passada (0 quando já parou). */
  readonly away?: number;
  readonly awayPace?: number;
  readonly seconds: number;
};

/** As duas manadas no chão da savana. Vai dentro de `SavannaStage`. */
const Herds: React.FC<HerdsProps> = ({
  daylight,
  apart = 0,
  stride,
  trunks,
  reach = 0,
  asleep = 0,
  away = 0,
  awayPace = 0,
  seconds,
}) => (
  <>
    <AbsoluteFill style={{ translate: `${-apart}px 0` }}>
      <Herd
        members={LEFT}
        daylight={daylight}
        stride={stride}
        trunk={LEFT.map((_, index) =>
          index === MATRIARCH ? trunks[0] : undefined,
        )}
        reach={LEFT.map((_, index) => (index === MATRIARCH ? reach : 0))}
        asleep={LEFT.map((_, index) => (index === MATRIARCH ? asleep : 0))}
        seconds={seconds}
      />
    </AbsoluteFill>
    <AbsoluteFill style={{ translate: `${apart + away}px 0` }}>
      <Herd
        members={RIGHT}
        daylight={daylight}
        // Recuando, as patas fazem o ciclo ao contrário.
        stride={away > 0 ? { along: -away, pace: awayPace } : stride}
        trunk={RIGHT.map((_, index) =>
          index === MATRIARCH ? trunks[1] : undefined,
        )}
        reach={RIGHT.map((_, index) => (index === MATRIARCH ? reach : 0))}
        seconds={seconds + 0.4}
      />
    </AbsoluteFill>
  </>
);

type ShotClock = {
  /** O quadro do vídeo em que o plano começa: o relógio do cenário. */
  readonly clock: number;
};

/**
 * A savana começa a subir antes de o plano aberto chegar: `lead` quadros
 * antes, sob o que o plano anterior ainda tem na tela, para a troca não deixar
 * o quadro só com o fundo. Quem desenha esses quadros é o plano anterior, com
 * `HerdsPrelude`.
 */
export const HERDS_RISE = { lead: 16, frames: 26 };

/** Quanto do cenário já subiu, de 0 a 1, no quadro `at` do plano que o abre (negativo antes de ele chegar). */
export const risenAt = (at: number): number =>
  interpolate(
    at,
    [-HERDS_RISE.lead, HERDS_RISE.frames - HERDS_RISE.lead],
    [0, 1],
    {
      ...clamp,
      easing: Easing.out(Easing.cubic),
    },
  );

type WideHerdsProps = ShotClock & {
  /** O quadro do plano aberto que se desenha: negativo, antes de ele chegar. */
  readonly at: number;
  /** A duração do plano aberto, para a deriva da câmera; antes de ele chegar, a câmera está no começo dela. */
  readonly length?: number;
  /** Quadro do plano em que as duas da frente levantam a tromba. */
  readonly greetAt?: number;
  readonly bare?: boolean;
};

/** A savana de dia, de longe, num quadro do plano aberto: as duas manadas caminham uma para a outra. */
const WideHerds: React.FC<WideHerdsProps> = ({
  at,
  length,
  greetAt = Infinity,
  bare,
  clock,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const seconds = (clock + frame) / fps;
  const walked = WALK.speed * at;
  /** A tromba que se ergue num cumprimento e volta a balançar. */
  const greeting = (from: number, phase: number) =>
    mix(
      idleTrunk(seconds, phase),
      GREET.height,
      from === Infinity
        ? 0
        : interpolate(
            at,
            [
              from,
              from + GREET.up,
              from + GREET.up + GREET.hold,
              from + GREET.up + GREET.hold + GREET.down,
            ],
            [0, 1, 1, 0],
            {
              ...clamp,
              easing: Easing.inOut(Easing.quad),
            },
          ),
    );

  return (
    <SavannaStage
      camera={cameraBetween(
        WIDE_START,
        WIDE,
        length === undefined ? 0 : linear(at, 0, length),
      )}
      daylight={1}
      orb={DAY_ORB}
      clock={clock}
      risen={risenAt(at)}
      bare={bare}
    >
      <Herds
        daylight={1}
        apart={WALK.from - walked}
        stride={{ along: walked, pace: 1 }}
        trunks={[greeting(greetAt, 0.1), greeting(greetAt + GREET.gap, 0.6)]}
        seconds={seconds}
      />
    </SavannaStage>
  );
};

type HerdsPreludeProps = {
  /** Quantos quadros faltam para o plano aberto da savana começar. */
  readonly until: number;
  /** O quadro do vídeo em que começa o plano que desenha isto: o relógio do cenário. */
  readonly clock: number;
};

/**
 * Os primeiros quadros da subida da savana, para o plano anterior desenhar por
 * baixo do que ele ainda tem na tela: é o mesmo cenário, na mesma câmera e no
 * mesmo ponto da subida e da caminhada em que o plano aberto o assume.
 */
export const HerdsPrelude: React.FC<HerdsPreludeProps> = ({ until, clock }) => (
  <WideHerds at={-until} clock={clock} bare />
);

type HerdsShotProps = ShotClock & {
  /** Quadro do plano em que as duas da frente levantam a tromba. */
  readonly greetAt: number;
};

/** A savana de dia: as duas manadas entram caminhando, cada matriarca à frente da sua. */
const HerdsShot: React.FC<HerdsShotProps> = ({ greetAt, clock }) => {
  const frame = useCurrentFrame();
  const length = useShotLength();

  return (
    <WideHerds
      at={Math.min(frame, length)}
      length={length}
      greetAt={greetAt}
      clock={clock}
    />
  );
};

// As trombas se encostam depois de as duas pararem: quando começam a se estender e em quantos quadros.
const TOUCH = { after: -8, frames: 18 };

type MatriarchsShotProps = ShotClock & {
  /** Quantos quadros durou o plano aberto: é dele que vem o ponto em que a caminhada está. */
  readonly walkedFor: number;
};

/** As duas matriarcas de perto: param frente a frente e encostam as trombas. */
const MatriarchsShot: React.FC<MatriarchsShotProps> = ({
  walkedFor,
  clock,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const seconds = (clock + frame) / fps;
  // A freada: a velocidade cai em linha reta até zero, e a passada encurta junto.
  const { brake, left: apart } = braked(WALK, walkedFor, frame);
  const touching =
    ramp(frame, brake + TOUCH.after, TOUCH.frames) * touchOf(seconds);

  return (
    <SavannaStage
      camera={cameraBetween(WIDE, CLOSE, ramp(frame, 0, 0.7 * fps))}
      daylight={1}
      orb={DAY_ORB}
      clock={clock}
    >
      <Herds
        daylight={1}
        apart={apart}
        stride={{
          along: WALK.speed * (walkedFor + frame),
          pace: Math.max(0, 1 - frame / brake),
        }}
        trunks={[idleTrunk(seconds, 0.1), idleTrunk(seconds, 0.6)]}
        reach={touching}
        seconds={seconds}
      />
    </SavannaStage>
  );
};

// O calendário no canto de cima, à direita; o selo da fonte fica no de baixo.
const CALENDAR = { x: 1560, y: 310, scale: 1.4, days: 35 };
// Os dias e as noites que passam enquanto o plano dura. Começa na hora do sol
// dos planos anteriores e termina de dia, para a noite do plano seguinte ter o que varrer.
const SPAN = { from: DAY_ORB / 2, cycles: 2.015 };
// O registro da tromba: um cartão no canto de cima, à esquerda, onde uma linha
// vai sendo desenhada conforme a tromba se mexe. A largura é o tempo; a altura, a tromba.
const RECORD = {
  x: 430,
  y: 300,
  width: 460,
  height: 150,
  pad: 30,
  at: 14,
  line: 8,
};
// A tromba inquieta chega ao ritmo dela aos poucos, saindo do cumprimento.
const RESTLESS_FRAMES = 12;
/** Onde está a ponta da tromba da matriarca da esquerda, no chão da savana. Ela olha para a direita: o desenho vai espelhado. */
const trunkTip = (trunk: number): readonly [number, number] => {
  const { x, y, width } = MATRIARCHS.left;
  const scale = width / 520;
  const [tipX, tipY] = trunkTipAt(trunk, 0, polished());
  return [x - scale * tipX, SAVANNA_GROUND_Y + y + scale * tipY];
};

type CountShotProps = ShotClock & {
  /** Quadros do plano em que o calendário entra e em que ganha o número. */
  readonly calendarAt: number;
  readonly daysAt: number;
};

/** A tromba de uma delas não para, e um registro a acompanha; o sol e a lua passam, e um calendário de 35 dias se preenche. */
const CountShot: React.FC<CountShotProps> = ({ calendarAt, daysAt, clock }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const length = useShotLength();
  const seconds = (clock + frame) / fps;
  const cycles = SPAN.from + SPAN.cycles * linear(frame, 0, length);
  const camera = cameraBetween(CLOSE, MEDIUM, ramp(frame, 0, 0.6 * fps));
  const trunkAt = (at: number) =>
    mix(
      idleTrunk((clock + at) / fps, 0.1),
      restlessTrunk((clock + at) / fps),
      ramp(at, 0, RESTLESS_FRAMES),
    );
  const trunk = trunkAt(frame);
  // O registro começa quando o cartão assenta e para de correr antes de o plano acabar.
  const recordFrom = RECORD.at + RECORD.line;
  const recordTo = length - 0.6 * fps;
  const inner = RECORD.width - 2 * RECORD.pad;
  const penX = (at: number) =>
    RECORD.x -
    inner / 2 +
    inner * linear(at, recordFrom, recordTo - recordFrom);
  const penY = (at: number) =>
    RECORD.y - (trunkAt(at) - 0.32) * ((RECORD.height - 2 * RECORD.pad) / 0.56);
  const recorded = Math.min(frame, recordTo);
  const trace: string[] = [];
  for (let at = recordFrom; at <= recorded; at++) {
    trace.push(`${penX(at).toFixed(1)},${penY(at).toFixed(1)}`);
  }
  const tip = onScreen(camera, trunkTip(trunk));
  const pen = [penX(recorded), penY(recorded)] as const;
  const drawn = ramp(frame, RECORD.at, RECORD.line);
  // O calendário se preenche em cascata, um dia depois do outro, e o número fecha a conta.
  const filled = Math.round(
    CALENDAR.days * linear(frame, calendarAt + 5, daysAt - calendarAt + 6),
  );

  return (
    <>
      <SavannaStage
        camera={camera}
        daylight={daylightAt(cycles)}
        orb={orbAt(cycles)}
        clock={clock}
      >
        <Herds
          daylight={daylightAt(cycles)}
          trunks={[trunk, idleTrunk(seconds, 0.6)]}
          // As trombas se soltam do cumprimento enquanto a câmera recua.
          reach={touchOf(seconds) * (1 - ramp(frame, 0, 0.5 * fps))}
          seconds={seconds}
        />
      </SavannaStage>
      {/* O cartão e a linha não entram com o plano: nascem quando a câmera chega. Saem encolhendo, como o resto do que está solto. */}
      <Stay only="entering">
        {frame >= RECORD.at ? (
          // O cartão, a linha e o registro são uma coisa só: saem juntos, em volta do cartão.
          <Cast origin={[RECORD.x, RECORD.y]}>
            <Troupe cast={false}>
              <SvgLayer>
                {/* A linha fina que sai da tromba e vai até a ponta do registro. */}
                <line
                  x1={tip[0]}
                  y1={tip[1]}
                  x2={mix(tip[0], pen[0], drawn)}
                  y2={mix(tip[1], pen[1], drawn)}
                  stroke={ink.paper}
                  strokeWidth={5}
                  strokeLinecap="round"
                  strokeDasharray="2 12"
                />
              </SvgLayer>
              <Place x={RECORD.x} y={RECORD.y}>
                <Grow at={RECORD.at} frames={RECORD.line + 2}>
                  <div
                    style={{
                      width: RECORD.width,
                      height: RECORD.height,
                      borderRadius: 18,
                      background: ink.paper,
                    }}
                  />
                </Grow>
              </Place>
              <SvgLayer>
                {/* A linha de base do registro: a tromba parada. */}
                <line
                  x1={RECORD.x - inner / 2}
                  y1={RECORD.y + RECORD.height / 2 - RECORD.pad}
                  x2={RECORD.x - inner / 2 + inner * drawn}
                  y2={RECORD.y + RECORD.height / 2 - RECORD.pad}
                  stroke={ink.tagEdge}
                  strokeWidth={4}
                  strokeLinecap="round"
                  opacity={0.25}
                />
                {trace.length > 1 ? (
                  <polyline
                    points={trace.join(" ")}
                    fill="none"
                    stroke={ink.tag}
                    strokeWidth={7}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                ) : null}
                {frame >= recordFrom ? (
                  <circle cx={pen[0]} cy={pen[1]} r={9} fill={ink.tagEdge} />
                ) : null}
              </SvgLayer>
            </Troupe>
          </Cast>
        ) : null}
        {/* A peça é pequena para um canto de quadro: cresce em volta do próprio centro. */}
        <AbsoluteFill
          style={{
            scale: `${CALENDAR.scale}`,
            transformOrigin: `${CALENDAR.x}px ${CALENDAR.y}px`,
          }}
        >
          <Calendar
            x={CALENDAR.x}
            y={CALENDAR.y}
            days={CALENDAR.days}
            filled={filled}
            label="35 dias"
            labelAt={daysAt}
            on="peach"
            enter={calendarAt}
          />
        </AbsoluteFill>
      </Stay>
    </>
  );
};

/** A noite desce do alto do quadro sobre o dia, em 0,25 s, como em `night-falls`. */
const NIGHTFALL: Wipe = { frames: 8, from: "top" };
// A lua do plano da tromba.
const TRUNK_ORB = 0.57;
/**
 * De perto, a matriarca da esquerda: a cabeça à esquerda, a tromba no meio, o
 * cronômetro ao lado. É a mesma elefanta dos planos anteriores, e a câmera é
 * que chega a ela.
 */
const TRUNK = framing(
  [MATRIARCHS.left.x, SAVANNA_GROUND_Y + MATRIARCHS.left.y],
  1500 / MATRIARCHS.left.width,
  [560, 1040],
);
const WATCH = { x: 1610, y: 560, width: 330, minutes: 5 };
// De perto só cabe a que é medida: enquanto a câmera chega, a outra manada recua isto, em pixels do chão.
const RETREAT = { by: 170, seconds: 0.8 };
// A tromba desacelera e para em 0,8 s; o cronômetro corre por 1,5 s.
const STILL_SECONDS = 0.8;
const COUNT_SECONDS = 1.5;

type WatchProps = {
  readonly minutes: number;
  /** Quanto o cronômetro cresce além do tamanho, em fração: o pulo de quando chega aos cinco. */
  readonly bump?: number;
};

const Watch: React.FC<WatchProps> = ({ minutes, bump = 0 }) => (
  <div style={{ scale: `${1 + bump}` }}>
    <Stopwatch
      width={WATCH.width}
      colors={stopwatch}
      reading={`${minutes} min`}
    />
  </div>
);

type TrunkShotProps = ShotClock & {
  /** Quadros do plano em que o cronômetro entra e em que o olho fecha. */
  readonly watchAt: number;
  readonly asleepAt: number;
};

/** A noite desce e a câmera chega à tromba, que desacelera e para; o cronômetro ao lado corre até "5 min", e ela adormece. */
const TrunkShot: React.FC<TrunkShotProps> = ({ watchAt, asleepAt, clock }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const seconds = (clock + frame) / fps;
  const camera = cameraBetween(MEDIUM, TRUNK, ramp(frame, 0, 0.7 * fps));
  // A tromba perde o embalo: o vaivém encolhe e ela desce até ficar solta.
  const moving = 1 - ramp(frame, 2, STILL_SECONDS * fps);
  const trunk = moving * restlessTrunk(seconds);
  const asleep = ramp(frame, asleepAt, 0.6 * fps);
  const countFrom = watchAt + 0.3 * fps;
  const fiveAt = countFrom + COUNT_SECONDS * fps;
  const minutes = Math.floor(
    WATCH.minutes * linear(frame, countFrom, COUNT_SECONDS * fps),
  );
  const landed = (frame - fiveAt) / (0.3 * fps);
  const bump =
    landed <= 0 || landed >= 1 ? 0 : 0.08 * Math.sin(Math.PI * landed);
  const lastDay = SPAN.from + SPAN.cycles;
  const retreat = ramp(frame, 0, RETREAT.seconds * fps);
  const herds = (daylight: number) => (
    <Herds
      daylight={daylight}
      trunks={[trunk, idleTrunk(seconds, 0.6)]}
      asleep={asleep}
      away={RETREAT.by * retreat}
      // A passada cresce e encolhe com a velocidade do recuo.
      awayPace={Math.sin(Math.PI * retreat)}
      seconds={seconds}
    />
  );

  return (
    <>
      <Sweep
        wipe={NIGHTFALL}
        under={
          // O dia em que o plano anterior terminou, visto pela câmera deste.
          <SavannaStage
            camera={camera}
            daylight={daylightAt(lastDay)}
            orb={orbAt(lastDay)}
            clock={clock}
          >
            {herds(daylightAt(lastDay))}
          </SavannaStage>
        }
      >
        <SavannaStage
          camera={camera}
          daylight={0}
          orb={TRUNK_ORB}
          clock={clock}
        >
          {herds(0)}
        </SavannaStage>
      </Sweep>
      {/* O cronômetro estoura na fala, e não com o plano; no fim, é a varredura da cena seguinte que o leva. */}
      <Stay>
        <Place x={WATCH.x} y={WATCH.y}>
          <Pop at={watchAt}>
            <Watch minutes={minutes} bump={bump} />
          </Pop>
        </Place>
      </Stay>
    </>
  );
};

/**
 * O último quadro do plano da tromba, para a cena seguinte redesenhar por
 * baixo da varredura dela: a matriarca dormindo em pé, de perto, e o
 * cronômetro em "5 min". A respiração continua, pelo relógio do vídeo.
 */
export const TrunkStill: React.FC<ShotClock> = ({ clock }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const seconds = (clock + frame) / fps;

  return (
    <>
      <SavannaStage camera={TRUNK} daylight={0} orb={TRUNK_ORB} clock={clock}>
        <Herds
          daylight={0}
          trunks={[0, idleTrunk(seconds, 0.6)]}
          asleep={1}
          away={RETREAT.by}
          seconds={seconds}
        />
      </SavannaStage>
      <Stay>
        <Place x={WATCH.x} y={WATCH.y}>
          <Watch minutes={WATCH.minutes} />
        </Place>
      </Stay>
    </>
  );
};

export const ElephantsScene: React.FC<SceneProps> = ({ scene, shots }) => (
  <>
    <Shot range={shots[0]} name="duas manadas, cada uma com a sua matriarca">
      <HerdsShot greetAt={cue(scene, "elefantas")} clock={scene.from} />
    </Shot>
    <Shot range={shots[1]} name="as duas matriarcas, de perto">
      <MatriarchsShot
        walkedFor={shots[0].to - shots[0].from}
        clock={scene.from + shots[1].from}
      />
    </Shot>
    <Shot range={shots[2]} name="35 dias: o sol e a lua passam">
      <CountShot
        calendarAt={cue(scene, "trinta") - shots[2].from}
        daysAt={cue(scene, "dias") - shots[2].from}
        clock={scene.from + shots[2].from}
      />
    </Shot>
    <Shot range={shots[3]} name="a tromba para; o cronômetro corre até 5 min">
      <TrunkShot
        watchAt={cue(scene, "cinco", 2) - shots[3].from}
        asleepAt={cue(scene, "sono", 2) - shots[3].from}
        clock={scene.from + shots[3].from}
      />
    </Shot>
  </>
);
