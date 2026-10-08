import { useId, useMemo } from "react";
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
import { cameraBetween } from "../../../components/Camera";
import {
  Cast,
  FlatStage,
  StageContext,
  Stay,
  useStage,
} from "../../../components/Cast";
import { Grain } from "../../../components/Grain";
import { blink, wave } from "../../../components/Idle";
import { Place } from "../../../components/Place";
import { Pop, grown } from "../../../components/Pop";
import { SvgLayer } from "../../../components/SvgLayer";
import {
  cue,
  drop,
  linear,
  mix,
  ramp,
  clamp01,
  clamp,
} from "../../../components/timing";
import type { SceneProps } from "../../../video/NarratedVideo";
import { Shot, useShotLength } from "../../../video/Shot";
import { ink, person, personInPajamas, daylightTones } from "../palette";
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
import { SavannaStage } from "./ElephantsScene";
import { PAIR_RISE, PairPrelude } from "./ElephantVerdictScene";
import { Drift, DRIFT } from "./SleepDebtScene";
import { QUARTER_END } from "./TwoHoursScene";

// Ela anda para a direita, sozinha no plano aberto: é a que dormia em pé na cena anterior, virada
// para o mesmo lado e com a mesma pausa viva, e a direção é a do tempo na faixa e a da pessoa do
// plano seguinte.
const WALKER: HerdMember = {
  ...QUARTER_END.sleeper,
  x: 840,
  y: 20,
  width: 380,
};
// A caminhada, em pixels por quadro: o passo de uma elefanta adulta. A câmera
// a acompanha, e no quadro ela só deriva devagar para a direita: é o chão que passa.
const WALK = { ahead: 270, speed: 3.6, drift: 4 / 3 };
// A câmera parte deste deslocamento, à esquerda, e termina no oposto dele.
const TRACK_FROM = WALK.ahead - 100;
// O sol nasce na volta 0 e o plano termina duas horas antes de a segunda noite acabar: as 46 horas,
// de 48. Ele abre no fim da noite da cena anterior, com a lua onde ela a deixou: a lua acaba de se
// pôr, o sol nasce, e a luz vira no lugar (as varreduras saíram, decisão do usuário).
const SPAN = { from: QUARTER_END.orb / 2 - 0.5, cycles: (2 * 46) / 48 };
// O primeiro amanhecer é mais lento que os outros: a noite da cena anterior vira dia à vista, em
// 0,7 s, e não em 5 quadros. É a menor medida que ainda dá noite cheia no primeiro quadro.
const FIRST_DAWN = { twilight: 0.63, until: 0.25 };
// A câmera sai do enquadramento da cena anterior e chega ao deste, com peso, enquanto ela acorda;
// só então ela anda. Em quadros.
const ARRIVE = { frames: 22, wakeAt: 3, wake: 10, walkAt: 16, walk: 14 };
// O rastro do sol e da lua: dois dias e duas noites numa faixa, que se enche conforme eles passam.
const TRAIL = { x: 560, y: 300, width: 800, height: 88 };
const HOURS_TAG = { x: 960, y: TRAIL.y + TRAIL.height + 76 };
// A faixa entra crescendo quando a câmera chega.
const TRAIL_IN = { at: 20, frames: 12 };
// A saída do plano, em quadros antes da troca, uma coisa de cada vez: a etiqueta e a faixa de dois
// dias encolhem no ponto; a savana desce com a elefanta; e só com ela já abaixo do lugar da faixa
// de três dias é que essa cresce, e depois a cama. Nunca há duas faixas na tela.
const LEAVE = { tag: 31, trail: 29, shrink: 9, savanna: 26, tail: 3 };
// Enquanto sai, a segunda noite acaba: o tempo corre até o amanhecer do terceiro dia (a lua se
// põe, o céu esquenta). É sobre esse céu, e não sobre a noite, que o fundo do plano seguinte toma
// a cor: noite com pêssego dava um cinza-pardo. `twilight` 1 é a medida que ainda dá noite cheia
// no ponto em que as 46 horas param.
const LAST_DAWN = { before: 22, frames: 24, twilight: 1 };

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
        fill={daylightTones.night.contact}
        opacity={0.3}
      />
      <g clipPath={`url(#${id}-strip)`}>
        <g clipPath={`url(#${id}-passed)`}>
          <rect
            x={x}
            y={y}
            width={width}
            height={height}
            fill={daylightTones.night.sky[0]}
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
                fill={daylightTones.dusk.sun}
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
                fill={daylightTones.night.sky[0]}
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
const STRIP_BEFORE = { frames: 11, strip: 10, bed: 3, bedFrames: 8 };

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

/** O dia nasce sobre a que dormia; ela acorda e anda, o sol e a lua passam duas vezes sobre ela, de olhos abertos, e a câmera a acompanha. */
const AwakeShot: React.FC<AwakeShotProps> = ({ hoursAt, clock }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const length = useShotLength();
  const seconds = (clock + frame) / fps;
  const passing = linear(frame, 0, length);
  const counted = mix(SPAN.from, SPAN.cycles, passing);
  const cycles =
    counted +
    (2 - SPAN.cycles) *
      ramp(frame, length - LAST_DAWN.before, LAST_DAWN.frames);
  const daylight = daylightAt(
    cycles,
    cycles < FIRST_DAWN.until
      ? FIRST_DAWN.twilight
      : cycles > SPAN.cycles
        ? LAST_DAWN.twilight
        : undefined,
  );
  // A savana desce devagar e acelera, com a elefanta em cima; o céu fica.
  const sunk = interpolate(
    frame,
    [length - LEAVE.savanna, length + LEAVE.tail],
    [0, 1],
    { ...clamp, easing: Easing.in(Easing.cubic) },
  );
  const walked = WALK.speed * frame;
  const stage = useStage();
  const beforeAt = length - STRIP_BEFORE.frames;
  // Ela vai do lugar e do tamanho em que dormia aos da caminhada junto com a câmera.
  const arrived = ramp(frame, 0, ARRIVE.frames);
  const slept = QUARTER_END.sleeper;
  return (
    <>
      <SavannaStage
        camera={cameraBetween(
          QUARTER_END.camera,
          // A câmera anda com ela, um pouco mais devagar: o chão e as árvores passam, cada camada no seu passo.
          {
            x: (WALK.speed - WALK.drift) * frame - TRACK_FROM,
            y: 0,
            zoom: 1,
          },
          arrived,
        )}
        daylight={daylight}
        orb={orbAt(cycles)}
        clock={clock}
        risen={1 - sunk}
        lit={1}
      >
        <Herd
          members={[
            {
              ...WALKER,
              x: mix(slept.x, WALKER.x - WALK.ahead + walked, arrived),
              y: mix(slept.y ?? 0, WALKER.y ?? 0, arrived),
              width: slept.width * (WALKER.width / slept.width) ** arrived,
            },
          ]}
          daylight={daylight}
          asleep={1 - ramp(frame, ARRIVE.wakeAt, ARRIVE.wake)}
          // As patas só começam o passo quando a câmera chega: antes disso ela está parada.
          stride={{
            along: walked,
            pace: ramp(frame, ARRIVE.walkAt, ARRIVE.walk),
          }}
          seconds={seconds}
        />
      </SavannaStage>
      {/* A faixa de três dias e a cama do plano seguinte entram aqui, enquanto a savana desce: a troca não
          deixa a tela vazia. Quando o plano delas chega, é ele quem as desenha. */}
      {frame >= beforeAt && !stage.handedOver ? (
        <Stay>
          <Drift focus={BED_FOCUS} zoom={1 - DRIFT}>
            <AbsoluteFill
              style={{
                transformOrigin: `${DAY_STRIP.x + DAY_STRIP.width / 2}px ${DAY_STRIP.y + DAY_STRIP.height / 2}px`,
                scale: `${grown(frame, beforeAt, STRIP_BEFORE.strip)}`,
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
                scale: `${grown(frame, beforeAt + STRIP_BEFORE.bed, STRIP_BEFORE.bedFrames)}`,
              }}
            >
              <WaitingBed />
            </AbsoluteFill>
          </Drift>
        </Stay>
      ) : null}
      {/* A faixa e o número não entram com o plano: nascem quando a câmera chega. Saem encolhendo no
          ponto, na marcação do próprio plano: antes de a faixa de três dias aparecer. */}
      <Stay>
        {frame >= TRAIL_IN.at ? (
          <AbsoluteFill
            style={{
              transformOrigin: `${TRAIL.x + TRAIL.width / 2}px ${TRAIL.y + TRAIL.height / 2}px`,
              scale: `${grown(frame, TRAIL_IN.at, TRAIL_IN.frames) * (1 - drop(frame, length - LEAVE.trail, LEAVE.shrink))}`,
            }}
          >
            <PassedDays passed={Math.max(0, counted) / 2} />
          </AbsoluteFill>
        ) : null}
        <Place
          x={HOURS_TAG.x}
          y={HOURS_TAG.y}
          style={{
            scale: `${1 - drop(frame, length - LEAVE.tag, LEAVE.shrink)}`,
          }}
        >
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
  // A marcação de saída do elenco, adiantada: dentro de `Stay`, quem sai é este palco.
  const early = useMemo(
    () => ({
      ...stage,
      enter: () => 1,
      leave: (delay = 0) => stage.leave(delay - PAIR_RISE.lead + 4),
    }),
    [stage],
  );
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
        clamp,
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
        {frame >= length - PAIR_RISE.lead && !stage.handedOver ? (
          <PairPrelude until={length - frame} clock={clock} />
        ) : null}
        <Drift focus={BED_FOCUS}>
          {/* A faixa e a cama já estavam no palco, entraram no fim do plano anterior: não entram de novo; saem
              com este, uns quadros antes da marcação do palco, para a savana só apontar com elas já fora. */}
          <Stay only="entering">
            <StageContext.Provider value={early}>
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
            </StageContext.Provider>
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
