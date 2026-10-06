import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {
  Build,
  cameraBetween,
  framing,
  useBuild,
} from "../../../components/Camera";
import { FlatStage, useStage } from "../../../components/Cast";
import { Grain } from "../../../components/Grain";
import { wave } from "../../../components/Idle";
import { Onomatopoeia } from "../../../components/Onomatopoeia";
import { Place } from "../../../components/Place";
import { SvgLayer } from "../../../components/SvgLayer";
import { cue, linear, mix, ramp, clamp, clamp01 } from "../../../components/timing";
import type { SceneProps } from "../../../video/NarratedVideo";
import { Shot, useShotLength } from "../../../video/Shot";
import { enterProgress } from "../../../video/stage";
import { alarmClock, chalkboard, sound } from "../palette";
import { Calendar } from "../parts/Calendar";
import {
  Chalkboard,
  chalkStamp,
  Researcher,
  type Box,
} from "../parts/Chalkboard";
import { IdeaBackdrop } from "../parts/IdeaBackdrop";
import {
  ICONS,
  IconRow,
  MapIcon,
  iconSpot,
  type IconKey,
} from "../parts/IconRow";
import { BENCH_Y, Glove, LAB } from "../parts/Laboratory";
import { Rat, RatLab, RatRow, RATS, ratIdle, withIdle } from "../parts/Rats";
import { Tag } from "../parts/Tag";
import { ROW_HUE, rowLife } from "./FivePartsScene";
import { NEVER, Prelude } from "./MaybeBrainScene";
import { RatsDiscOpening } from "./RatsDiscScene";
import { Drift, DRIFT } from "./SleepDebtScene";

// A fila no mesmo lugar das outras voltas dela.
const ROW = { x: 960, y: 560, scale: 1.12 };
// Quanto o ícone aceso cresce em relação aos vizinhos.
const GROWN = 1.3;

/** Um tremor que morre: `turns` idas e voltas em `frames` quadros, a partir de `at`. */
const shake = (
  frame: number,
  at: number,
  frames: number,
  degrees: number,
  turns: number,
): number => {
  const t = (frame - at) / frames;
  return t <= 0 || t >= 1
    ? 0
    : degrees * (1 - t) * Math.sin(t * turns * Math.PI * 2);
};

/** Cresce do próprio ponto, passa um pouco do tamanho e assenta: a entrada de quem tem forma, em escala. */
const grown = (frame: number, at: number, frames: number): number =>
  interpolate(frame, [at, at + frames * 0.7, at + frames], [0, 1.06, 1], {
    ...clamp,
    easing: Easing.out(Easing.quad),
  });

// A fila entra em cascata no começo do plano: o intervalo entre um ícone e o seguinte, e quanto cada um leva, em quadros.
const ROW_IN = { at: -3, step: 2, each: 8 };
// O X do contorno só entra com a fila inteira no lugar.
const CROSS_NOT_BEFORE = ROW_IN.at + 4 * ROW_IN.step + ROW_IN.each;
// Em quantos quadros um ícone passa de um estado a outro.
const TURN_FRAMES = 9;

// A cascata começa estes quadros antes da cena, por baixo do pedestal de `older-than-brain`, que encolhe:
// sem isso a fila abria o plano já a meio tamanho, depois de um quadro só com o fundo.
const ROW_LEAD = 5;

type MapRowProps = {
  /** O quadro do plano que se desenha: negativo, antes de ele chegar. */
  readonly frame: number;
  /** Quadros do plano em que o contorno ganha o X e em que o despertador acende. */
  readonly crossAt: number;
  readonly nextAt: number;
  /** Quanto o fundo já passou do menta do pedestal ao lilás: os ícones apagados vão junto. */
  readonly tinted: number;
};

/** A fila do plano num quadro dele: é o mesmo desenho no prelúdio, antes da cena, e no plano. */
const MapRow: React.FC<MapRowProps> = ({ frame, crossAt, nextAt, tinted }) => {
  const { fps } = useVideoConfig();
  const life = rowLife(frame / fps);
  const cross = Math.max(crossAt, CROSS_NOT_BEFORE);
  const present: Partial<Record<IconKey, number>> = {};
  ICONS.forEach((icon, index) => {
    present[icon] = grown(
      frame,
      ROW_IN.at - ROW_LEAD + index * ROW_IN.step,
      ROW_IN.each,
    );
  });

  return (
    <IconRow
      {...ROW}
      hue={ROW_HUE}
      // A fila entra sobre o menta do pedestal: os ícones apagados passam ao lilás junto com o fundo.
      tint={{ from: "mint", progress: tinted }}
      states={{
        eyes: "check",
        ruler: "cross",
        brain: frame >= cross ? "cross" : "on",
        alarm: frame >= nextAt ? "on" : "off",
      }}
      // Antes da cena nada mudou ainda, e o relógio de quem desenha o prelúdio é outro.
      since={frame < 0 ? {} : { brain: cross, alarm: nextAt }}
      turning={{
        ...(frame >= cross
          ? {
              brain: {
                from: "on",
                progress: ramp(frame, cross, TURN_FRAMES),
              },
            }
          : {}),
        ...(frame >= nextAt
          ? {
              alarm: {
                from: "off",
                progress: ramp(frame, nextAt, TURN_FRAMES),
              },
            }
          : {}),
      }}
      present={present}
      motion={life.motion}
      lift={life.lift}
      tilt={{
        ...life.tilt,
        // Aceso, o despertador chacoalha: é o gesto dele, como em `five-parts`.
        alarm:
          (life.tilt.alarm ?? 0) + shake(frame, nextAt + 3, 0.6 * fps, 11, 5),
      }}
      grow={{
        ...life.grow,
        alarm:
          (life.grow.alarm ?? 1) *
          mix(1, GROWN, ramp(frame, nextAt, 0.5 * fps)),
      }}
    />
  );
};

/** Quantos quadros antes da cena o prelúdio da fila começa. */
export const ALARM_MAP_LEAD = ROW_LEAD - ROW_IN.at;

/**
 * A fila entrando, antes de a cena começar: o último plano de
 * `older-than-brain` a desenha por baixo do pedestal que encolhe. O plano abre
 * no estado em que isto parou. `until` é quantos quadros faltam para a cena.
 */
export const AlarmMapPrelude: React.FC<{ until: number }> = ({ until }) => (
  // A deriva do plano, no começo dela.
  <Drift focus={[ROW.x, ROW.y]} zoom={1 - DRIFT}>
    <MapRow frame={-until} crossAt={NEVER} nextAt={NEVER} tinted={0} />
  </Drift>
);

type MapShotProps = {
  /** Quadros do plano em que o contorno ganha o X e em que o despertador acende. */
  readonly crossAt: number;
  readonly nextAt: number;
};

/** A fila volta: o contorno sem cérebro, "2", ganha um X, e o despertador, "3", acende e chacoalha. */
const MapShot: React.FC<MapShotProps> = ({ crossAt, nextAt }) => {
  const frame = useCurrentFrame();
  const stage = useStage();

  return (
    <AbsoluteFill>
      <FlatStage backdrop={<IdeaBackdrop hue={ROW_HUE} spot={[0.5, 0.5]} />}>
        {/* A deriva termina no quadro composto: o plano seguinte parte dele, com a fila no lugar exato. */}
        <Drift focus={[ROW.x, ROW.y]}>
          <MapRow
            frame={frame}
            crossAt={crossAt}
            nextAt={nextAt}
            tinted={stage.enter()}
          />
        </Drift>
        <Grain />
      </FlatStage>
    </AbsoluteFill>
  );
};

// O rato sonolento é o assunto: no centro, grande, com o despertador sobre ele.
const SLEEPY = { x: 860, width: 640 };
const CLOCK = { x: 1250, y: 330, radius: 124 };
// No ícone, o corpo do despertador tem este raio, em fração do diâmetro do medalhão.
const ICON_BODY = (56 * 0.82) / 220;
const SPOT = iconSpot("alarm", ROW);
// O calendário da parede já tem estes dias riscados quando o plano começa; a fala risca mais dois.
const WALL_CALENDAR = { x: 330, y: 430, scale: 1.5, days: 32, filled: 5 };
// De onde a mão vem, fora do quadro, e quanto ela está afastada antes de chegar.
const HAND = { from: [2040, 60], away: [900, -300] } as const;

// A transformação, em quadros: os outros ícones encolhem, o despertador viaja até a mão,
// o medalhão se recolhe atrás dele e o laboratório sobe por baixo.
const ROW_OUT = { step: 2, each: 8 };
const TRAVEL = { at: 2, frames: 18 };
const DISC_OUT = { at: 4, frames: 11 };
const LAB_IN = { at: 1, frames: 22 };
// O toque: por quanto tempo ele chacoalha forte, quanto duram os riscos e o "TRIIIM".
const RING = { frames: 26, streaks: 13, shown: 10, leaving: 6 };
// Entre um dia riscado e o seguinte, e quanto cada risco leva, em quadros.
const STRIKE = { gap: 12, frames: 8 };

type AlarmClockProps = {
  /** O raio do corpo, em pixels do quadro. */
  readonly radius: number;
  /** Tocando: os riscos saem das campainhas. */
  readonly ringing: boolean;
  /** Quanto os riscos do toque já saíram, de 0 a 1: crescem das campainhas para fora. Por padrão, inteiros. */
  readonly streaks?: number;
};

// Os riscos do toque, de um lado: de onde cada um sai e até onde vai.
const STREAKS = [
  [74, -70, 90, -82],
  [80, -48, 100, -50],
  [62, -88, 70, -104],
] as const;

/** O despertador do ícone, fora do medalhão: os pés, as campainhas, o corpo, o mostrador e os ponteiros. */
export const AlarmClock: React.FC<AlarmClockProps> = ({
  radius,
  ringing,
  streaks = 1,
}) => (
  <svg
    width={radius * 4}
    height={radius * 4}
    viewBox="-112 -112 224 224"
    overflow="visible"
  >
    {[-1, 1].map((side) => (
      <g key={side}>
        <rect
          x={side * 34 - 7}
          y={36}
          width={14}
          height={30}
          rx={7}
          fill={alarmClock.bell}
          transform={`rotate(${-side * 24} ${side * 34} 40)`}
        />
        <circle cx={side * 40} cy={-46} r={22} fill={alarmClock.bell} />
        {ringing && streaks > 0 ? (
          <path
            d={STREAKS.map(
              ([x1, y1, x2, y2]) =>
                `M${side * x1},${y1} L${side * mix(x1, x2, streaks)},${mix(y1, y2, streaks)}`,
            ).join(" ")}
            stroke={alarmClock.bell}
            strokeWidth={7}
            strokeLinecap="round"
          />
        ) : null}
      </g>
    ))}
    <circle cy={4} r={56} fill={alarmClock.body} />
    <circle cy={4} r={42} fill={alarmClock.face} />
    <path
      d="M0,4 L0,-22 M0,4 L18,14"
      fill="none"
      stroke={alarmClock.hand}
      strokeWidth={8}
      strokeLinecap="round"
    />
  </svg>
);

type AlarmShotProps = {
  /** Quadros do plano em que o despertador toca e em que o calendário risca o primeiro dia. */
  readonly ringAt: number;
  readonly strikeAt: number;
  /** O quadro da cena em que o plano começa: a fila continua pulsando de onde estava. */
  readonly clock: number;
};

/**
 * O ícone do despertador sai da fila, cresce e vira o despertador que uma mão
 * segura sobre o rato sonolento; atrás, o calendário risca um dia depois do
 * outro. O plano abre no último quadro do anterior: a fila se desfaz à vista
 * e o laboratório sobe por baixo dela.
 */
const AlarmShot: React.FC<AlarmShotProps> = ({ ringAt, strikeAt, clock }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const length = useShotLength();
  const stage = useStage();
  const build = useBuild();
  const seconds = frame / fps;
  // A fila do plano anterior, no relógio da cena: ela não salta na troca.
  const life = rowLife((clock + frame) / fps);
  const ring = Math.max(ringAt, TRAVEL.at + TRAVEL.frames);
  const rung = frame - ring;
  // O ícone viaja da fila até a mão, com peso; o balanço da fila morre no caminho.
  const moved = ramp(frame, TRAVEL.at, TRAVEL.frames);
  const x = mix(SPOT.x, CLOCK.x, moved);
  const y = mix(SPOT.y + (life.lift.alarm ?? 0) * ROW.scale, CLOCK.y, moved);
  const iconFrom = SPOT.size * GROWN * (life.grow.alarm ?? 1);
  const iconSize = iconFrom * (CLOCK.radius / ICON_BODY / iconFrom) ** moved;
  // O medalhão se recolhe atrás do despertador, que fica.
  const disc =
    1 -
    interpolate(frame, [DISC_OUT.at, DISC_OUT.at + DISC_OUT.frames], [0, 1], {
      ...clamp,
      easing: Easing.in(Easing.quad),
    });
  // Toca: chacoalha forte, e depois só o tique-taque.
  const tilt =
    (life.tilt.alarm ?? 0) * (1 - moved) +
    (rung < 0
      ? 0
      : 9 * Math.max(0.16, 1 - rung / RING.frames) * wave(rung / fps, 0.12));
  const streaks =
    rung < 0
      ? 0
      : interpolate(
          rung,
          [0, 3, RING.streaks - 4, RING.streaks],
          [0, 1, 1, 0],
          clamp,
        );
  const soundGone = interpolate(
    rung,
    [RING.shown, RING.shown + RING.leaving],
    [0, 1],
    { ...clamp, easing: Easing.in(Easing.quad) },
  );
  // O laboratório toma o lugar do fundo da fila: a parede ganha a cor e a bancada sobe, com o rato em cima.
  const labIn = enterProgress(frame, LAB_IN.at, LAB_IN.frames);
  // O que estava na fila encolhe no próprio ponto, um depois do outro.
  const gone = (index: number) =>
    interpolate(
      frame,
      [index * ROW_OUT.step, index * ROW_OUT.step + ROW_OUT.each],
      [0, 1],
      { ...clamp, easing: Easing.in(Easing.quad) },
    );
  const present: Partial<Record<IconKey, number>> = {};
  ICONS.filter((icon) => icon !== "alarm").forEach((icon, index) => {
    present[icon] = 1 - gone(index);
  });
  // O susto do rato: dois quadros depois do toque ele se estica, e a pálpebra sobe até o meio.
  const startled = rung - 2;
  const lid =
    startled < 0
      ? 1
      : interpolate(startled, [0, 5, 22, 44], [1, 0.38, 0.5, 0.62], clamp);
  const jolt =
    startled < 0 ? 0 : interpolate(startled, [0, 3, 9], [0, 1, 0], clamp);
  // A mão vai embora com o despertador quando o plano entrega o palco.
  const left = stage.leave();
  const away = 1 - moved + left;
  const strikes =
    ramp(frame, strikeAt, STRIKE.frames) +
    ramp(frame, strikeAt + STRIKE.gap, STRIKE.frames);

  return (
    <AbsoluteFill>
      <IdeaBackdrop hue={ROW_HUE} spot={[0.5, 0.5]} />
      <Build
        {...build}
        lit={Math.min(build.lit, labIn)}
        risen={Math.min(build.risen, labIn)}
      >
        <RatLab
          camera={cameraBetween(
            LAB.medium,
            framing([960, 600], 1.04, [960, 600]),
            linear(frame, 0, length),
          )}
          wall={
            <div
              style={{
                position: "absolute",
                inset: 0,
                scale: `${WALL_CALENDAR.scale}`,
                transformOrigin: `${WALL_CALENDAR.x}px ${WALL_CALENDAR.y}px`,
              }}
            >
              <Calendar
                x={WALL_CALENDAR.x}
                y={WALL_CALENDAR.y}
                days={WALL_CALENDAR.days}
                filled={WALL_CALENDAR.filled + strikes}
                gradual
              />
            </div>
          }
        >
          <SvgLayer>
            <ellipse
              cx={SLEEPY.x}
              cy={BENCH_Y + 10}
              rx={SLEEPY.width * 0.46}
              ry={26}
              fill={alarmClock.hand}
              opacity={0.14}
            />
          </SvgLayer>
          <Place
            x={SLEEPY.x}
            y={BENCH_Y + 8}
            anchor="bottom"
            style={{
              transformOrigin: "72% 100%",
              rotate: `${3 * jolt}deg`,
              // Dormindo, respira devagar e fundo; o susto o estica um instante.
              scale: `1 ${1 + 0.025 * wave(seconds, 3.2, 0.1) + 0.05 * jolt}`,
            }}
          >
            <Rat
              width={SLEEPY.width}
              state="sleepy"
              close
              motion={withIdle(
                { lid, ear: -18 * jolt },
                // Acordado à força, ele volta a farejar aos poucos.
                {
                  ...ratIdle(
                    seconds,
                    "sleepy",
                    clamp01(startled / 12),
                  ),
                  lid: 0,
                },
              )}
            />
          </Place>
        </RatLab>
      </Build>
      {/* A mão entra com o despertador, do canto de cima. */}
      <AbsoluteFill
        style={{
          translate: `${away * HAND.away[0]}px ${away * HAND.away[1]}px`,
        }}
      >
        <SvgLayer>
          <Glove
            from={[HAND.from[0], HAND.from[1]]}
            to={[CLOCK.x + CLOCK.radius * 0.7, CLOCK.y + 10]}
            size={110}
          />
        </SvgLayer>
      </AbsoluteFill>
      {/* A fila de onde o ícone saiu: os outros quatro e a pílula "3" encolhem, da esquerda para a direita. */}
      {frame < 4 * ROW_OUT.step + ROW_OUT.each ? (
        <>
          <IconRow
            {...ROW}
            hue={ROW_HUE}
            states={{ eyes: "check", ruler: "cross", brain: "cross" }}
            omit={["alarm"]}
            present={present}
            motion={life.motion}
            lift={life.lift}
            tilt={life.tilt}
            grow={life.grow}
          />
          <div
            style={{
              position: "absolute",
              left: SPOT.x,
              top:
                SPOT.y +
                (life.lift.alarm ?? 0) * ROW.scale +
                (SPOT.size / 2 + 54 * ROW.scale) +
                (SPOT.size * (GROWN * (life.grow.alarm ?? 1) - 1)) / 2,
              translate: "-50% -50%",
              scale: `${ROW.scale * (1 - gone(3))}`,
            }}
          >
            <Tag on={ROW_HUE} size="note">
              3
            </Tag>
          </div>
        </>
      ) : null}
      {/* O ícone e o despertador são um desenho só: o medalhão encolhe por baixo e o despertador segue, crescendo. */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          translate: `${x + left * HAND.away[0]}px ${y + left * HAND.away[1]}px`,
        }}
      >
        {disc > 0 ? (
          <div
            style={{
              position: "absolute",
              translate: "-50% -50%",
              scale: `${disc}`,
              rotate: `${tilt}deg`,
            }}
          >
            <MapIcon icon="alarm" state="on" hue={ROW_HUE} size={iconSize} />
          </div>
        ) : null}
        <div
          style={{
            position: "absolute",
            translate: "-50% -50%",
            rotate: `${tilt}deg`,
          }}
        >
          <AlarmClock
            radius={iconSize * ICON_BODY}
            ringing={rung >= 0}
            streaks={streaks}
          />
        </div>
      </div>
      {/* "TRIIIM" estoura com o toque e sai logo, pelo caminho da entrada. */}
      {rung >= 0 && soundGone < 1 ? (
        <div
          style={{
            position: "absolute",
            left: 760,
            top: 250 - 30 * soundGone,
            translate: "-50% -50%",
            scale: `${1 - soundGone}`,
          }}
        >
          <Onomatopoeia
            at={ring}
            size={130}
            color={sound.hot}
            edge={sound.edge}
          >
            TRIIIM
          </Onomatopoeia>
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

// O quadro-negro do gancho na parede do laboratório, com o pesquisador ao lado e os ratos aos pés dele.
const BOARD: Box = { x: 650, y: 50, width: 1130, height: 500 };
const RECHTSCHAFFEN = { x: 270, y: 1040, height: 700 };
// A fileira termina antes do selo da fonte, que ocupa o canto de baixo à direita: a cauda do último rato encostava nele.
const TEN = { x: 1000, y: 1006, width: 200, spacing: 196, rows: 2 } as const;
const WIDE = framing([960, 540], 1);
// A sala aberta ainda se aproxima um nada até o fim do plano, na direção do quadro-negro.
const WIDE_END = framing([1100, 500], 1.03, [1100, 500]);
// De perto: as duas fileiras de ratos enchem a largura. O enquadramento desce até a calha do quadro-negro
// sair por cima: cortada no alto, era uma barra sem nome.
const ON_RATS = framing([TEN.x + 20, TEN.y - 65], 1.72, [960, 590]);
// Quanto cada rato se ergue pela frente, em graus: com menos, eles olhavam para a esquerda, e não para o quadro.
const LOOK_UP = 24;
// Os dez entram em cascata: o intervalo entre um e o seguinte (0,08 s) e quanto cada um leva, em quadros.
const RATS_IN = { at: 4, step: 2.4, each: 9 };
// Erguer o corpo: o agachar que avisa, a subida com sobra e o assentar, em quadros a partir da deixa.
const RISE = { crouch: 4, up: 8, settle: 5, over: 1.14 };
// O carimbo pisca: um halo que cresce em volta dele e some, duas vezes. Meia largura e meia altura do carimbo, em tamanhos da letra.
const STAMP_HALO = { halfWidth: 1.72, halfHeight: 0.7, frames: 13, gap: 15 };

type BoardShotProps = {
  /** O quadro da cena em que o plano começa: os ratos respiram e farejam de onde estavam. */
  readonly clock: number;
  /** Quanto o quadro já abriu, de 0 (os ratos de perto) a 1 (a sala inteira), e quanto já derivou depois de chegar. */
  readonly opened: number;
  readonly drifted: number;
  /** Quadro do plano em que os ratos começam a entrar; sem valor, já estão lá. */
  readonly ratsAt?: number;
  /** Quadro do plano em que os ratos erguem o corpo; sem valor, já olham para cima. */
  readonly lookAt?: number;
  /** Quadro do plano em que a etiqueta de nome entra; sem valor, não há. */
  readonly nameAt?: number;
  /** Quadro do plano em que ele aponta o carimbo; sem valor, fica de braço solto. */
  readonly pointAt?: number;
  /** Há quantos quadros ele está na sala quando o plano começa. */
  readonly since?: number;
};

/**
 * A sala de Rechtschaffen: ele diante do quadro-negro do gancho, com a árvore
 * e o carimbo "erro?", e os dez ratos aos pés do quadro, olhando para cima.
 * De perto, só os ratos (ele está na sala, fora do quadro, de braço solto);
 * aberto, a sala inteira.
 */
const BoardShot: React.FC<BoardShotProps> = ({
  clock,
  opened,
  drifted,
  ratsAt,
  lookAt,
  nameAt,
  pointAt,
  since = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const seconds = (clock + frame) / fps;
  const stamp = chalkStamp(BOARD);
  // Cada rato se ergue com um quadro de diferença do vizinho: juntos, mas não como uma peça só.
  const lag = (index: number) => index % 3;
  const raised = (index: number) =>
    lookAt === undefined
      ? 1
      : interpolate(
          frame - lag(index),
          [
            lookAt - RISE.crouch,
            lookAt,
            lookAt + RISE.up,
            lookAt + RISE.up + RISE.settle,
          ],
          [0, -0.12, RISE.over, 1],
          { ...clamp, easing: Easing.out(Easing.quad) },
        );
  const reach = pointAt === undefined ? 0 : ramp(frame, pointAt, 0.5 * fps);
  // A expressão dele troca no meio do gesto, sob a pálpebra fechada.
  const lid =
    pointAt === undefined
      ? 0
      : interpolate(
          frame,
          [pointAt + 3, pointAt + 6, pointAt + 9, pointAt + 13],
          [0, 1, 1, 0],
          clamp,
        );
  const pointed = pointAt === undefined ? -1 : frame - pointAt - 0.5 * fps;

  return (
    <RatLab
      floor
      steady
      camera={cameraBetween(
        // De perto a câmera fica: o quadro já tem os dez entrando e se erguendo, e mais perto a borda cortava o rato da ponta.
        ON_RATS,
        cameraBetween(WIDE, WIDE_END, drifted),
        opened,
      )}
      wall={
        <>
          <Chalkboard box={BOARD} stamp="full" />
          {/* O carimbo pisca quando ele o aponta: um halo da cor dele cresce em volta e some. */}
          <SvgLayer>
            {[0, 1].map((pulse) => {
              const t = (pointed - pulse * STAMP_HALO.gap) / STAMP_HALO.frames;
              if (t <= 0 || t >= 1) {
                return null;
              }
              const size = 1 + 0.38 * (1 - (1 - t) ** 2);
              const halfWidth = STAMP_HALO.halfWidth * stamp.size * size;
              const halfHeight = STAMP_HALO.halfHeight * stamp.size * size;
              return (
                <rect
                  key={pulse}
                  x={stamp.x - halfWidth}
                  y={stamp.y - halfHeight}
                  width={halfWidth * 2}
                  height={halfHeight * 2}
                  rx={stamp.size * 0.3 * size}
                  fill="none"
                  stroke={chalkboard.stamp}
                  strokeWidth={22 * (1 - t)}
                  opacity={1 - t}
                  transform={`rotate(-9 ${stamp.x} ${stamp.y})`}
                />
              );
            })}
          </SvgLayer>
        </>
      }
    >
      <Researcher
        {...RECHTSCHAFFEN}
        reach={reach}
        lid={lid}
        nameAt={nameAt}
        nameOffset={[180, -RECHTSCHAFFEN.height - 60]}
        on="mint"
        since={since}
      />
      <RatRow
        {...TEN}
        state={() => "awake"}
        seconds={seconds}
        lookUp={LOOK_UP}
        alive={1}
        raised={raised}
        present={
          ratsAt === undefined
            ? undefined
            : (index) =>
                grown(frame, ratsAt + index * RATS_IN.step, RATS_IN.each)
        }
        seed="ten"
      />
    </RatLab>
  );
};

type RatsShotProps = {
  readonly clock: number;
  /** Quadro do plano em que os dez erguem o corpo e olham para cima. */
  readonly lookAt: number;
};

/** De perto: os dez entram em cascata, em duas fileiras, e na fala erguem o corpo, juntos. */
const RatsShot: React.FC<RatsShotProps> = ({ clock, lookAt }) => {
  return (
    <BoardShot
      clock={clock}
      opened={0}
      drifted={0}
      ratsAt={RATS_IN.at}
      lookAt={Math.max(
        lookAt,
        RATS_IN.at + (RATS - 1) * RATS_IN.step + RATS_IN.each + RISE.crouch,
      )}
    />
  );
};

type OpeningShotProps = {
  readonly clock: number;
  readonly nameAt: number;
  readonly pointAt: number;
  /** Quantos quadros durou o plano de perto: ele já estava na sala. */
  readonly since: number;
};

/** A câmera sobe e recua dos ratos para a sala inteira, no começo do plano; ele aponta o carimbo na fala. */
const OpeningShot: React.FC<OpeningShotProps> = ({
  clock,
  nameAt,
  pointAt,
  since,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const length = useShotLength();
  const arrive = 0.9 * fps;
  return (
    <BoardShot
      clock={clock}
      opened={ramp(frame, 0, arrive)}
      drifted={linear(frame, arrive, length - arrive)}
      // A etiqueta espera a câmera assentar.
      nameAt={Math.max(nameAt, arrive)}
      pointAt={pointAt}
      since={since}
    />
  );
};

export const ForcedAwakeScene: React.FC<SceneProps> = ({ scene, shots }) => (
  <>
    <Shot range={shots[0]} name="o contorno ganha um X; o despertador acende">
      <MapShot crossAt={cue(scene, "segundo")} nextAt={cue(scene, "falhou")} />
    </Shot>
    <Shot range={shots[1]} name="o despertador sobre o rato sonolento">
      <AlarmShot
        ringAt={cue(scene, "que") - shots[1].from}
        strikeAt={cue(scene, "acordado") - shots[1].from}
        clock={shots[1].from}
      />
    </Shot>
    <Shot range={shots[2]} name="dez ratos, de perto, olham para cima">
      <RatsShot
        clock={shots[2].from}
        lookAt={cue(scene, "dez") - shots[2].from}
      />
    </Shot>
    <Shot range={shots[3]} name="Rechtschaffen, o quadro-negro e os dez ratos">
      <OpeningShot
        clock={shots[3].from}
        nameAt={cue(scene, "Álan") - shots[3].from}
        pointAt={cue(scene, "maior") - shots[3].from}
        since={shots[3].from - shots[2].from}
      />
      {/* A bancada do disco de `rats-disc` sobe aqui, por cima da do quadro-negro, que desce: a troca de cena
          não deixa a tela só com a parede. */}
      <Prelude>
        <RatsDiscOpening videoClock={scene.from + shots[3].to} />
      </Prelude>
    </Shot>
  </>
);
