import { useId } from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  interpolateColors,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {
  Person,
  type Expression,
  type PersonColors,
} from "../../../art/Person";
import { Cast, FlatStage, Stay, useStage } from "../../../components/Cast";
import { Grain } from "../../../components/Grain";
import { blink, wave } from "../../../components/Idle";
import { Place } from "../../../components/Place";
import { Pop } from "../../../components/Pop";
import { SvgLayer } from "../../../components/SvgLayer";
import { cue, drop, linear, mix, ramp, clamp01 } from "../../../components/timing";
import type { SceneProps } from "../../../video/NarratedVideo";
import { Shot, useShotLength, type Wipe } from "../../../video/Shot";
import { ink, person, personInPajamas, savanna } from "../palette";
import { Bed } from "../parts/Bed";
import {
  DAY_STRIP,
  DayStrip,
  daylightAt,
  Herd,
  orbAt,
  stripX,
  type HerdMember,
} from "../parts/Herd";
import { IdeaBackdrop } from "../parts/IdeaBackdrop";
import { Tag } from "../parts/Tag";
import { HERDS_RISE, SavannaStage } from "./ElephantsScene";
import { PairPrelude } from "./ElephantVerdictScene";
import { Sweep } from "./NightFallsScene";
import { Drift, DRIFT } from "./SleepDebtScene";
import { QuarterStill } from "./TwoHoursScene";

// Ela anda para a esquerda, sozinha no plano aberto.
const WALKER: HerdMember = {
  x: 1080,
  y: 20,
  width: 380,
  seed: "awake",
};
// A caminhada, em pixels por quadro: o passo de uma elefanta adulta. A câmera
// a acompanha, e no quadro ela só deriva devagar para a esquerda: é o chão que passa.
const WALK = { ahead: 270, speed: 3.6, drift: 4 / 3 };
// A câmera parte deste deslocamento, à direita, e termina no oposto dele.
const TRACK_FROM = WALK.ahead - 100;
// Começa ao nascer do sol e termina duas horas antes de a segunda noite acabar: as 46 horas, de 48.
const SPAN = { from: 0, cycles: (2 * 46) / 48 };
// O rastro do sol e da lua: dois dias e duas noites numa faixa, que se enche conforme eles passam.
const TRAIL = { x: 560, y: 300, width: 800, height: 88 };
const HOURS_TAG = { x: 960, y: TRAIL.y + TRAIL.height + 76 };
// O dia varre a noite da cena anterior, da direita, em 0,25 s.
const DAYBREAK: Wipe = { frames: 8, from: "right" };
// A faixa entra crescendo depois de a varredura passar.
const TRAIL_IN = { at: 9, frames: 12 };

type PassedDaysProps = {
  /** Quanto das duas voltas já passou, de 0 a 1. */
  readonly passed: number;
};

/**
 * O que o sol e a lua deixam para trás: uma faixa de dois dias, na mesma
 * pintura da faixa de três dias do plano seguinte (o dia claro, com o sol; a
 * noite escura, com a lua). Cada astro que passa no céu enche o trecho dele,
 * e é a faixa que diz "quase dois dias" no quadro parado.
 */
const PassedDays: React.FC<PassedDaysProps> = ({ passed }) => {
  const id = useId();
  const { x, y, width, height } = TRAIL;
  const part = width / 4;
  const middle = y + height / 2;
  const reached = x + width * passed;

  return (
    <SvgLayer>
      <defs>
        <clipPath id={`${id}-strip`}>
          <rect x={x} y={y} width={width} height={height} rx={height / 2} />
        </clipPath>
        <clipPath id={`${id}-passed`}>
          <rect x={x} y={y} width={width * passed} height={height} />
        </clipPath>
      </defs>
      {/* O que falta passar: a faixa reservada, só a sombra dela. */}
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={height / 2}
        fill={savanna.night.contact}
        opacity={0.3}
      />
      <g clipPath={`url(#${id}-strip)`}>
        <g clipPath={`url(#${id}-passed)`}>
          <rect
            x={x}
            y={y}
            width={width}
            height={height}
            fill={savanna.night.sky[0]}
          />
          {[0, 2].map((day) => (
            <g key={day}>
              <rect
                x={x + day * part}
                y={y}
                width={part}
                height={height}
                fill={ink.paper}
              />
              <circle
                cx={x + (day + 0.5) * part}
                cy={middle}
                r={26}
                fill={savanna.dusk.sun}
              />
            </g>
          ))}
          {[1, 3].map((night) => (
            <g key={night}>
              <circle
                cx={x + (night + 0.5) * part}
                cy={middle}
                r={24}
                fill={ink.moon}
              />
              <circle
                cx={x + (night + 0.5) * part + 11}
                cy={middle - 7}
                r={20}
                fill={savanna.night.sky[0]}
              />
            </g>
          ))}
        </g>
      </g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={height / 2}
        fill="none"
        stroke={ink.paper}
        strokeWidth={8}
      />
      {/* A divisa entre a primeira volta e a segunda. */}
      <rect
        x={x + width / 2 - 4}
        y={y - 18}
        width={8}
        height={height + 36}
        rx={4}
        fill={ink.paper}
      />
      {/* Onde o tempo está agora. */}
      <rect
        x={reached - 8}
        y={y - 14}
        width={16}
        height={height + 28}
        rx={8}
        fill={ink.tag}
      />
    </SvgLayer>
  );
};

// Acorda na segunda de manhã (hora 6 da faixa) e só para na madrugada de quarta: 46 horas depois.
const WOKE = 6;
const AWAKE_HOURS = 46;
const BEDTIME = WOKE + AWAKE_HOURS;
const WALKING = { height: 440 };
// A cama em que ela se deita: quem dorme nela fica do tamanho de quem andava (a peça desenha a figura com 800 px).
const BED_SCALE = WALKING.height / 800;
const STRIP_TOP = DAY_STRIP.y - 9;
const BED_X = stripX(BEDTIME);
// O ponto para o qual o plano deriva: a cama, onde a travessia acaba.
const BED_FOCUS = [BED_X, 520] as const;
// A faixa de três dias e a cama entram nos últimos quadros do plano da savana, enquanto o cenário desce:
// na primeira palavra do plano delas, já estão no lugar. Em quadros: quando começam e quanto cada uma leva.
const STRIP_BEFORE = { frames: 16, strip: 11, bed: 5, bedFrames: 10 };

// As etiquetas dos dias ainda não entraram: cada uma estoura na fala, no plano seguinte.
const NOT_YET = 1e6;

type WaitingBedProps = {
  /** O que muda quando ela chega; sem valores, a cama vazia, de cobertor dobrado. */
  readonly bed?: Partial<React.ComponentProps<typeof Bed>>;
};

/** A cama no começo da quarta, sobre a faixa. */
const WaitingBed: React.FC<WaitingBedProps> = ({ bed }) => (
  <Bed
    x={BED_X}
    y={STRIP_TOP}
    scale={BED_SCALE}
    colors={person}
    hue="peach"
    shadow={false}
    occupied={false}
    cover={0}
    {...bed}
  />
);

type ShotClock = {
  /** O quadro do vídeo em que o plano começa: o relógio do cenário. */
  readonly clock: number;
};

type AwakeShotProps = ShotClock & {
  /** Quadro do plano em que o tempo acordada ganha número. */
  readonly hoursAt: number;
};

/** O dia varre a noite; o sol e a lua passam duas vezes sobre ela, que segue andando de olhos abertos, e a câmera a acompanha. */
const AwakeShot: React.FC<AwakeShotProps> = ({ hoursAt, clock }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const length = useShotLength();
  const seconds = (clock + frame) / fps;
  const passing = linear(frame, 0, length);
  const cycles = SPAN.from + SPAN.cycles * passing;
  const daylight = daylightAt(cycles);
  const walked = WALK.speed * frame;
  const stage = useStage();
  const beforeAt = length - STRIP_BEFORE.frames;
  /** A entrada de quem tem forma: cresce do próprio ponto, passa um pouco do tamanho e assenta. */
  const grown = (at: number, frames: number) =>
    interpolate(frame, [at, at + frames * 0.7, at + frames], [0, 1.06, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.quad),
    });

  return (
    <>
      <Sweep wipe={DAYBREAK} under={<QuarterStill clock={clock} />}>
        <SavannaStage
          // A câmera anda com ela, um pouco mais devagar: o chão e as árvores passam, cada camada no seu passo.
          camera={{
            x: TRACK_FROM - (WALK.speed - WALK.drift) * frame,
            y: 0,
            zoom: 1,
          }}
          daylight={daylight}
          orb={orbAt(cycles)}
          clock={clock}
        >
          <AbsoluteFill style={{ translate: `${WALK.ahead - walked}px 0` }}>
            <Herd
              members={[WALKER]}
              daylight={daylight}
              stride={{ along: walked, pace: 1 }}
              seconds={seconds}
            />
          </AbsoluteFill>
        </SavannaStage>
      </Sweep>
      {/* A faixa de três dias e a cama do plano seguinte entram aqui, enquanto a savana desce: a troca não
          deixa a tela vazia. Quando o plano delas chega, é ele quem as desenha. */}
      {frame >= beforeAt && !stage.handedOver ? (
        <Stay>
          <Drift focus={BED_FOCUS} zoom={1 - DRIFT}>
            <AbsoluteFill
              style={{
                transformOrigin: `${DAY_STRIP.x + DAY_STRIP.width / 2}px ${DAY_STRIP.y + DAY_STRIP.height / 2}px`,
                scale: `${grown(beforeAt, STRIP_BEFORE.strip)}`,
              }}
            >
              <DayStrip
                names={["segunda", "terça", "quarta"]}
                namedAt={[NOT_YET, NOT_YET, NOT_YET]}
                on="peach"
              />
            </AbsoluteFill>
            <AbsoluteFill
              style={{
                transformOrigin: `${BED_X}px ${STRIP_TOP}px`,
                scale: `${grown(beforeAt + STRIP_BEFORE.bed, STRIP_BEFORE.bedFrames)}`,
              }}
            >
              <WaitingBed />
            </AbsoluteFill>
          </Drift>
        </Stay>
      ) : null}
      {/* A faixa e o número não entram com o plano: nascem depois da varredura. Saem encolhendo, com ele. */}
      <Stay only="entering">
        {frame >= TRAIL_IN.at ? (
          <AbsoluteFill
            style={{
              transformOrigin: `${TRAIL.x + TRAIL.width / 2}px ${TRAIL.y + TRAIL.height / 2}px`,
              scale: `${grown(TRAIL_IN.at, TRAIL_IN.frames)}`,
            }}
          >
            <PassedDays passed={(SPAN.cycles / 2) * passing} />
          </AbsoluteFill>
        ) : null}
        <Place x={HOURS_TAG.x} y={HOURS_TAG.y}>
          <Pop at={hoursAt}>
            {/* A etiqueta tem a cor do céu sob ela: passa da de dia à de noite junto com a luz. */}
            <div style={{ position: "relative" }}>
              <Tag size="note" on="night">
                46 h acordada
              </Tag>
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  opacity: daylight,
                }}
              >
                <Tag size="note" on="peach">
                  46 h acordada
                </Tag>
              </div>
            </div>
          </Pop>
        </Place>
      </Stay>
    </>
  );
};

// A freada antes da cama, em quadros.
const BRAKE_FRAMES = 8;
// Quanto do caminho vale um passo, em pixels: descansada, o passo é curto e
// ligeiro; no terceiro dia ela arrasta os pés, e cada passo demora mais.
const STEP = { fresh: 105, spent: 150 };
// Quanto o corpo pende para a frente no fim, em graus, e quanto a passada encolhe.
const SPENT = { lean: 12, gait: 0.5 };
// Ela se deita: balança para a frente (aviso), tomba de costas no colchão e o cobertor a cobre. Em quadros.
const LIE = { warn: 4, fall: 11, cover: 9, sway: 5 };
// Em quantos quadros a pálpebra fecha antes de o rosto trocar, e abre depois.
const LID_FRAMES = 3;

/** O rosto de quem está acordado há tantas horas: os olhos caem a cada dia. */
const FACES: readonly (readonly [number, Expression])[] = [
  [0, "neutral"],
  [16, "sleepy"],
  [34, "yawning"],
];
const faceAfter = (hours: number): Expression =>
  [...FACES].reverse().find(([from]) => hours >= from)?.[1] ?? "neutral";

const PERSON_KEYS = Object.keys(person) as (keyof PersonColors)[];

/** A roupa de dia virando o pijama: as cores passam de uma à outra enquanto ela se deita. */
const dressed = (pajamas: number): PersonColors =>
  pajamas <= 0
    ? person
    : pajamas >= 1
      ? personInPajamas
      : (Object.fromEntries(
          PERSON_KEYS.map((key) => [
            key,
            interpolateColors(
              pajamas,
              [0, 1],
              [person[key], personInPajamas[key]],
            ),
          ]),
        ) as PersonColors);

type ThreeDaysShotProps = ShotClock & {
  /** Quadros do plano em que ela passa pelo meio da segunda, em que chega à cama e em que a quarta ganha nome. */
  readonly mondayAt: number;
  readonly arriveAt: number;
  readonly wednesdayAt: number;
};

/** A pessoa atravessa segunda, terça e a madrugada de quarta andando, cada vez mais curvada, e só então se deita. */
const ThreeDaysShot: React.FC<ThreeDaysShotProps> = ({
  mondayAt,
  arriveAt,
  wednesdayAt,
  clock,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const stage = useStage();
  const length = useShotLength();
  const seconds = (clock + frame) / fps;
  // Ela atravessa a faixa a velocidade constante, que a faixa é o tempo, e só freia diante da cama.
  // A velocidade é a que a faz passar pelo meio da segunda e chegar à cama nos quadros pedidos.
  const speed = (BED_X - stripX(12)) / (arriveAt - mondayAt - BRAKE_FRAMES / 2);
  const brakeAt = arriveAt - BRAKE_FRAMES;
  const xAt = (at: number): number => {
    if (at <= brakeAt) {
      return BED_X - speed * (BRAKE_FRAMES / 2 + brakeAt - at);
    }
    const left = Math.max(0, arriveAt - at);
    return BED_X - (speed * left * left) / (2 * BRAKE_FRAMES);
  };
  const hourAt = (at: number) =>
    ((xAt(at) - DAY_STRIP.x) / DAY_STRIP.width) * 72;
  /** O quadro em que ela chega a uma hora da faixa, enquanto anda a velocidade constante. */
  const reaches = (hours: number) =>
    brakeAt - (BED_X - (speed * BRAKE_FRAMES) / 2 - stripX(hours)) / speed;
  const x = xAt(frame);
  const hour = hourAt(frame);
  const tired = clamp01((hour - WOKE) / AWAKE_HOURS);
  const pace = clamp01((arriveAt - frame) / BRAKE_FRAMES);
  // A fase da passada cresce com o caminho, e cada passo fica mais comprido conforme ela cansa.
  let step = 0;
  for (let at = reaches(WOKE) - 60; at < Math.min(frame, arriveAt); at++) {
    const spent = clamp01((hourAt(at) - WOKE) / AWAKE_HOURS);
    step += (xAt(at + 1) - xAt(at)) / mix(STEP.fresh, STEP.spent, spent);
  }
  // A troca de rosto acontece com a pálpebra fechada.
  const lids = FACES.slice(1).reduce((most, [hours]) => {
    const at = Math.round(reaches(WOKE + hours));
    return Math.max(
      most,
      interpolate(
        frame,
        [at - LID_FRAMES, at, at + 1, at + 1 + LID_FRAMES],
        [0, 1, 1, 0],
        { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
      ),
    );
  }, 0);
  const face = faceAfter(hourAt(Math.min(frame, arriveAt)) - WOKE + 0.01);
  // Diante da cama: o corpo vai um pouco à frente, tomba de costas no colchão, e o cobertor sobe.
  const fallAt = arriveAt + LIE.warn;
  const landAt = fallAt + LIE.fall;
  const standing = 1 - drop(frame, fallAt, LIE.fall);
  const lean =
    SPENT.lean * tired + LIE.sway * ramp(frame, arriveAt - 2, LIE.warn + 2);
  const arrived = frame >= arriveAt;
  const lying = frame >= landAt;
  // O corpo afunda no colchão com a queda e volta.
  const landed = (frame - landAt) / (0.3 * fps);
  const sink =
    landed <= 0 || landed >= 1
      ? 0
      : 0.07 * (1 - landed) * Math.sin(Math.PI * landed);

  return (
    <AbsoluteFill>
      <FlatStage backdrop={<IdeaBackdrop hue="peach" spot={[0.5, 0.45]} />}>
        {/* A savana da cena seguinte já sobe por baixo da faixa e da cama, que encolhem: a troca não deixa a tela só com o fundo. */}
        {frame >= length - HERDS_RISE.lead && !stage.handedOver ? (
          <PairPrelude until={length - frame} clock={clock} />
        ) : null}
        <Drift focus={BED_FOCUS}>
          {/* A faixa e a cama já estavam no palco, entraram no fim do plano anterior: não entram de novo; saem com este. */}
          <Stay only="entering">
            <DayStrip
              names={["segunda", "terça", "quarta"]}
              namedAt={[mondayAt, reaches(36), wednesdayAt]}
              awake={hour > WOKE ? [WOKE, hour] : undefined}
              on="peach"
            />
            <Cast origin={[BED_X, STRIP_TOP - 80]}>
              <WaitingBed
                bed={{
                  // De pijama, como em todo plano de cama: a roupa de dia vira o pijama enquanto ela se deita.
                  colors: dressed(ramp(frame, fallAt, LIE.fall)),
                  occupied: arrived,
                  standing,
                  lean,
                  // O rosto de quem dorme entra com o olho já fechado.
                  state: frame >= fallAt + LIE.fall / 2 ? "asleep" : "waking",
                  blink: ramp(frame, arriveAt, LIE.warn),
                  cover: ramp(frame, landAt - 2, LIE.cover),
                  breath: lying
                    ? 1 - sink + 0.035 * wave(seconds, 4.4, 0.2)
                    : 1,
                }}
              />
            </Cast>
          </Stay>
          {arrived ? null : (
            // Ela vem de fora do quadro, andando: não entra crescendo.
            <div
              style={{
                position: "absolute",
                // O mesmo ponto em que a cama a desenha de pé, quando ela chega.
                left: x - 5 * BED_SCALE,
                top: STRIP_TOP - WALKING.height / 2,
                translate: "-50% -50%",
                // Quanto mais horas acordada, mais o corpo pende para a frente.
                rotate: `${lean}deg`,
              }}
            >
              <Person
                height={WALKING.height}
                colors={person}
                expression={face}
                blink={Math.max(blink(seconds, "you"), lids)}
                stride={{
                  step,
                  gait: pace * mix(1, SPENT.gait, tired),
                }}
              />
            </div>
          )}
        </Drift>
        <Grain />
      </FlatStage>
    </AbsoluteFill>
  );
};

export const ElephantAwakeScene: React.FC<SceneProps> = ({ scene, shots }) => {
  const from = shots[1].from;

  return (
    <>
      <Shot range={shots[0]} name="46 horas acordada: dois dias e duas noites">
        <AwakeShot hoursAt={cue(scene, "quarenta")} clock={scene.from} />
      </Shot>
      <Shot range={shots[1]} name="de segunda de manhã à madrugada de quarta">
        <ThreeDaysShot
          mondayAt={cue(scene, "segunda") - from}
          arriveAt={cue(scene, "madrugada") - from}
          wednesdayAt={cue(scene, "quarta") - from}
          clock={scene.from + from}
        />
      </Shot>
    </>
  );
};
