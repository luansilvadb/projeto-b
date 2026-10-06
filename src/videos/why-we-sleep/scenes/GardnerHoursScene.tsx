import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type { Expression } from "../../../art/Person";
import { Build, type CameraState } from "../../../components/Camera";
import { FlatStage, Stay, useStage } from "../../../components/Cast";
import { Grain } from "../../../components/Grain";
import { blink, breath, wave } from "../../../components/Idle";
import { Place } from "../../../components/Place";
import { SvgLayer } from "../../../components/SvgLayer";
import { cue, drop, linear, mix, ramp } from "../../../components/timing";
import type { SceneProps } from "../../../video/NarratedVideo";
import { Shot, useShotLength } from "../../../video/Shot";
import { CoffeeTable } from "../parts/CoffeeTable";
import {
  Bedroom,
  Gardner,
  HourCounter,
  ROOM,
  RoomSet,
  TossedCoin,
  gardner,
} from "../parts/Gardner";
import { IdeaBackdrop, IdeaShadow } from "../parts/IdeaBackdrop";
import {
  COIN_REST,
  LeavingFriends,
  Room,
  glance,
  grown,
  settling,
  shifting,
  swapUnderLid,
} from "./AwakeRecordScene";
import { SUBJECT_BEFORE_FRAMES, WaitingSubject } from "./GardnerSleepsScene";
import { flash, shake } from "./MaybeBrainScene";
import { Drift } from "./SleepDebtScene";

const ROOM_HUE = "lilac";

// De perto, o mesmo quarto: ele, o cartaz com o contador embaixo e o calendário.
const CLOSE = { focus: [1150, 590], zoom: 1.2 } as const;
const AWAKE = { x: 680, height: 640 };
const COUNTER = { x: ROOM.poster.x, y: 672 };
// O contador entra já perto do recorde: o que a fala conta é a passagem por ele.
const HOURS = { from: 236, record: 260, to: 264 };
// A vigília foi de 28 de dezembro a 8 de janeiro: dezembro acaba, a folha vira e janeiro enche até o dia 8.
const DECEMBER = { from: 27, to: 31 };
const JANUARY_DAYS = 8;
// O contador estoura com a câmera já perto; o calendário vira aos 2 s.
const COUNTER_AT = 16;
const TURN = { seconds: 2, frames: 15 };
// Os amigos do plano anterior saem nestes quadros.
const LEAVE_FRAMES = 8;
// O bocejo no meio da contagem, em quadros a partir do começo dela.
const YAWN = { after: 38, lasts: 24 };

type Timing = {
  /** Quadros do plano em que o contador começa a correr e em que passa do recorde. */
  readonly countAt: number;
  readonly crossAt: number;
};

/** Em que quadro o contador para em 264, correndo a velocidade constante. */
const doneAt = ({ countAt, crossAt }: Timing): number =>
  countAt +
  ((HOURS.to - HOURS.from) * (crossAt - countAt)) / (HOURS.record - HOURS.from);

type VigilProps = Timing & {
  /** O quadro do plano que é desenhado: o plano das mesas o redesenha depois do fim, encolhendo. */
  readonly at: number;
  /** Quanto ele já veio do lugar que tinha entre os amigos, de 0 a 1. */
  readonly arrived: number;
  /** O quadro do vídeo em que o plano começa. */
  readonly clock: number;
  /** Quanto o chão já desceu, em pixels: o quarto desmontando. */
  readonly sunk?: number;
};

/**
 * O que há no quarto durante a vigília: o contador de horas sobe ao lado dele,
 * passa do "260 h" do cartaz e para em "264 h"; o calendário vira para janeiro
 * de 1964; as olheiras crescem. Vai dentro do cenário do quarto.
 */
const Vigil: React.FC<VigilProps> = ({
  at,
  arrived,
  clock,
  countAt,
  crossAt,
  sunk,
}) => {
  const { fps } = useVideoConfig();
  const seconds = (clock + at) / fps;
  const done = doneAt({ countAt, crossAt });
  const counted = linear(at, countAt, done - countAt);
  const turnAt = TURN.seconds * fps - 4;
  // O susto do sorteio vira sono: a troca acontece sob a pálpebra. Depois, um bocejo no meio da contagem.
  const drowsy = swapUnderLid(at, 3, 8);
  const yawnAt = countAt + YAWN.after;
  const opening = swapUnderLid(at, yawnAt, 6);
  const closing = swapUnderLid(at, yawnAt + YAWN.lasts, 6);
  const expression: Expression = !drowsy.done
    ? "surprised"
    : opening.done && !closing.done
      ? "yawning"
      : "sleepy";
  // Ele olha o contador quando ele estoura e quando passa do recorde; no resto do tempo, os olhos caem.
  const eyes = glance(at, [
    [0, 0, 0.3],
    [COUNTER_AT + 3, 1, 0.25],
    [countAt + 18, 0.2, 0.7],
    [crossAt + 4, 1, 0.2],
    [done + 12, 0.1, 0.75],
  ]);
  const clamp = {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  } as const;
  // O pulo do visor ao passar do recorde, e um menor ao parar.
  const bump =
    interpolate(at, [crossAt, crossAt + 3, crossAt + 9], [1, 1.16, 1], clamp) *
    (1 + 0.05 * flash(at, done, 8));

  return (
    <>
      <Bedroom
        hue={ROOM_HUE}
        on={ROOM_HUE}
        turned={ramp(at, turnAt, TURN.frames)}
        filled={[
          mix(DECEMBER.from, DECEMBER.to, linear(at, COUNTER_AT + 2, 36)),
          JANUARY_DAYS *
            linear(at, turnAt + TURN.frames, done - turnAt - TURN.frames),
        ]}
        sunk={sunk}
        seconds={seconds}
      />
      <SvgLayer>
        <IdeaShadow
          hue={ROOM_HUE}
          x={mix(ROOM.boys[1].x, AWAKE.x, arrived)}
          y={ROOM.floor + 6}
          width={AWAKE.height * 0.46}
        />
      </SvgLayer>
      {/* Os dois amigos saem: encolhem nos próprios pés. */}
      {at < LEAVE_FRAMES ? (
        <LeavingFriends seconds={seconds} gone={ramp(at, 0, LEAVE_FRAMES)} />
      ) : null}
      {/* A moeda do sorteio sai do chão: encolhe onde caiu. */}
      {at < 7 ? (
        <div
          style={{
            position: "absolute",
            inset: 0,
            transformOrigin: `${COIN_REST.x}px ${COIN_REST.y}px`,
            scale: `${1 - ramp(at, 0, 7)}`,
          }}
        >
          <TossedCoin {...COIN_REST} />
        </div>
      ) : null}
      <Gardner
        id="gardner"
        {...AWAKE}
        y={ROOM.floor}
        expression={expression}
        gaze={drowsy.done ? eyes : undefined}
        blink={Math.max(
          blink(seconds, "gardner-awake", { every: [1.8, 3.4], seconds: 0.3 }),
          drowsy.lid,
          opening.lid,
          closing.lid,
        )}
        // Ele dá dois passos até o lugar novo, e depois mal fica em pé: balança, e leva um susto com o pulo do visor.
        stride={
          arrived < 1
            ? { step: 2 * arrived, gait: Math.sin(Math.PI * arrived) }
            : undefined
        }
        lean={
          shifting(seconds) * (1 - ramp(at, 0, 24)) +
          1.8 * wave(seconds, 3.3, 0.4) * ramp(at, 20, 30) +
          shake(at, crossAt + 3, 12, 2.4, 1.5) +
          2 * ramp(at, done + 10, 24)
        }
        breath={breath(seconds, "gardner", {
          amplitude: mix(0.02, 0.028, counted),
        })}
        tired={0.4 * ramp(at, 4, 16) + 0.6 * counted}
      />
      <HourCounter
        {...COUNTER}
        hours={mix(HOURS.from, HOURS.to, counted)}
        record={HOURS.record}
        hot={ramp(at, crossAt, 6)}
        bump={bump}
        enter={COUNTER_AT}
      />
    </>
  );
};

/** A câmera do plano da vigília num quadro dele: fecha em Gardner e no contador, e deriva até o quadro composto. */
const vigilCamera = (at: number, length: number): CameraState =>
  settling(CLOSE.focus, CLOSE.zoom, at / length);

type VigilShotProps = Timing & { readonly clock: number };

/** O contador de horas sobe ao lado dele, passa do "260 h" do cartaz e para em "264 h"; o calendário vira para janeiro de 1964. */
const VigilShot: React.FC<VigilShotProps> = ({ clock, ...timing }) => {
  const frame = useCurrentFrame();
  const stage = useStage();
  const length = useShotLength();
  const arrived = stage.enter();

  return (
    <Room
      camera={vigilCamera(frame, length)}
      // A mancha clara vai dos três para ele e o contador.
      spot={[mix(0.34, 0.56, arrived), 0.5]}
    >
      {/* O quarto não desce no fim: o plano das mesas o recebe daqui e o encolhe. */}
      {stage.handedOver ? null : (
        <Vigil at={frame} arrived={arrived} clock={clock} {...timing} />
      )}
    </Room>
  );
};

const TABLES_HUE = "mint";
/** As manhãs seguintes a uma noite em claro: uma por dia sem dormir. */
const MORNINGS = 11;
// Duas fileiras, lidas da esquerda para a direita e de cima para baixo: seis mesas e cinco.
const ROWS = [
  { count: 6, first: 235, floor: 575 },
  { count: 5, first: 235, floor: 990 },
] as const;
const STEP = 300;
const SITTER = 215;
// O quarto encolhe até o lugar da primeira mesa, em 0,5 s.
const SHRINK = {
  frames: 15,
  to: [ROWS[0].first, ROWS[0].floor - 110] as const,
  floor: 420,
  away: 30000,
};
// As mesas entram uma a uma, a 0,15 s uma da outra; cada uma cresce do chão.
const TABLES = { notBefore: 4, every: 4.5, grow: 11 };
// Quão caído ele está em cada mesa: um pouco mais a cada manhã. Na última, a cabeça só encosta na deixa.
const WORN = 0.085;
// A cabeça da última: os olhos fecham, ela cai até o tampo e quica; a xícara treme. Em quadros.
const KNOCK = { lids: 8, fall: 10, bounce: 7, rattle: 12 };
// Quanto a cabeça de quem ainda está acordado cede e volta: as figuras são pequenas, e com menos o plano parava.
const NOD = 0.1;
const TABLES_FOCUS = [960, 560] as const;
const TABLES_DRIFT = 0.05;

type TablesShotProps = {
  /** Quadros do plano em que a primeira mesa entra e em que a cabeça da última encosta no tampo. */
  readonly firstAt: number;
  readonly knockAt: number;
  /** O plano da vigília, que este redesenha encolhendo: os tempos, a duração e o quadro do vídeo em que começa. */
  readonly vigil: Timing & { readonly length: number; readonly clock: number };
  readonly clock: number;
};

/** A mesa do café da noite em claro, repetida onze vezes; em cada uma ele está mais caído sobre a xícara. */
const TablesShot: React.FC<TablesShotProps> = ({
  firstAt,
  knockAt,
  vigil,
  clock,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const stage = useStage();
  const length = useShotLength();
  const seconds = (clock + frame) / fps;
  const fallAt = knockAt - KNOCK.fall;
  const bounce = (frame - knockAt) / KNOCK.bounce;
  const knock = (frame - knockAt) / KNOCK.rattle;
  const waitingAt = length - SUBJECT_BEFORE_FRAMES;

  return (
    <AbsoluteFill>
      <FlatStage backdrop={<IdeaBackdrop hue={TABLES_HUE} spot={[0.5, 0.5]} />}>
        {/* O quarto do plano anterior, depois do último quadro dele: encolhe e some onde a primeira mesa nasce. */}
        {frame < SHRINK.frames ? (
          <AbsoluteFill
            style={{
              transformOrigin: `${SHRINK.to[0]}px ${SHRINK.to[1]}px`,
              scale: `${1 - ramp(frame, 0, SHRINK.frames)}`,
            }}
          >
            <Build>
              <RoomSet camera={vigilCamera(vigil.length, vigil.length)}>
                <Vigil
                  at={vigil.length + frame}
                  arrived={1}
                  clock={vigil.clock}
                  countAt={vigil.countAt}
                  crossAt={vigil.crossAt}
                  // O chão desce para fora do quadro e, já fora dele, vai para longe: encolhida
                  // com o quarto, a faixa dele voltava ao quadro como um retângulo solto.
                  sunk={
                    SHRINK.floor * ramp(frame, 0, 8) +
                    (frame >= 5 ? SHRINK.away : 0)
                  }
                />
              </RoomSet>
            </Build>
          </AbsoluteFill>
        ) : null}
        <Drift focus={TABLES_FOCUS} by={TABLES_DRIFT}>
          {/* As mesas não entram com o palco, e sim uma a uma; saem com ele. */}
          <Stay only="entering">
            {Array.from({ length: MORNINGS }, (_, index) => {
              const row = index < ROWS[0].count ? ROWS[0] : ROWS[1];
              const column =
                index < ROWS[0].count ? index : index - ROWS[0].count;
              const last = index === MORNINGS - 1;
              const at = firstAt + index * TABLES.every;
              // Cada um tem o seu tempo: o vapor, a respiração e o cochilo começam em pontos diferentes.
              const own = seconds + index * 0.83;
              const worn = last
                ? WORN * index +
                  (1 - WORN * index) * drop(frame, fallAt, KNOCK.fall) -
                  (bounce <= 0 || bounce >= 1
                    ? 0
                    : 0.05 * Math.sin(Math.PI * bounce))
                : WORN * index;
              // Os mais caídos já dormem; o último só quando a cabeça bate no tampo.
              const asleep = last ? frame >= knockAt : worn > 0.6;
              return (
                <Place key={index} x={row.first + column * STEP} y={row.floor}>
                  <div
                    style={{
                      scale: `${grown(frame, at, TABLES.grow)}`,
                      transformOrigin: "50% 100%",
                    }}
                  >
                    <CoffeeTable
                      colors={gardner}
                      hue={TABLES_HUE}
                      height={SITTER}
                      // Sonolento, a cabeça cede um pouco e volta.
                      slump={
                        worn +
                        NOD *
                          (1 - worn) *
                          (0.5 + 0.5 * wave(own, 2.3 + 0.13 * index))
                      }
                      asleep={asleep}
                      tired={0.3 + (0.7 * index) / (MORNINGS - 1)}
                      seconds={own}
                      blink={Math.max(
                        blink(own, `morning-${index}`),
                        last ? ramp(frame, fallAt - KNOCK.lids, KNOCK.lids) : 0,
                      )}
                      breath={
                        1 +
                        mix(0.035, 0.06, worn) * wave(own, 3.4 + 0.1 * index)
                      }
                      mugShake={
                        last && knock > 0 && knock < 1
                          ? 7 * (1 - knock) * Math.sin(knock * Math.PI * 6)
                          : 0
                      }
                      softSteam
                    />
                  </div>
                </Place>
              );
            })}
          </Stay>
        </Drift>
        {/* Quem abre o plano seguinte entra aqui, enquanto as mesas encolhem: a fala dele já o encontra de pé. */}
        {frame >= waitingAt && !stage.handedOver ? (
          <Stay>
            <WaitingSubject at={waitingAt} clock={clock} />
          </Stay>
        ) : null}
        <Grain />
      </FlatStage>
    </AbsoluteFill>
  );
};

export const GardnerHoursScene: React.FC<SceneProps> = ({ scene, shots }) => {
  const { fps } = useVideoConfig();
  const tables = shots[1].from;
  // O contador passa do recorde em "quatro a mais", e começa a correr em "ficou", com ele já na tela.
  const timing = {
    countAt: Math.max(cue(scene, "ficou"), COUNTER_AT + 0.4 * fps),
    crossAt: cue(scene, "quatro", 2),
  };
  return (
    <>
      <Shot range={shots[0]} name="o contador passa do recorde e para em 264 h">
        <VigilShot {...timing} clock={scene.from} />
      </Shot>
      <Shot range={shots[1]} name="onze manhãs seguintes, uma atrás da outra">
        <TablesShot
          firstAt={Math.max(cue(scene, "onze") - tables, TABLES.notBefore)}
          knockAt={cue(scene, "uma", 2) - tables + KNOCK.fall}
          vigil={{
            ...timing,
            length: shots[0].to - shots[0].from,
            clock: scene.from,
          }}
          clock={scene.from + tables}
        />
      </Shot>
    </>
  );
};
