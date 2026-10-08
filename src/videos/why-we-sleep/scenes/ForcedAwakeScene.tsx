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
import {
  cue,
  drop,
  linear,
  mix,
  ramp,
  clamp,
  clamp01,
  shake,
} from "../../../components/timing";
import type { SceneProps } from "../../../video/NarratedVideo";
import { Shot, useShotLength } from "../../../video/Shot";
import { enterProgress } from "../../../video/stage";
import { alarmClock, sound } from "../palette";
import { Calendar } from "../parts/Calendar";
import { Chalkboard, Researcher, type Box } from "../parts/Chalkboard";
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
import { grown } from "../../../components/Pop";

// A fila no mesmo lugar das outras voltas dela.
const ROW = { x: 960, y: 560, scale: 1.12 };
// Quanto o ícone aceso cresce em relação aos vizinhos.
const GROWN = 1.3;

// A fila entra em cascata no começo do plano: o intervalo entre um ícone e o seguinte, e quanto cada um leva, em quadros.
const ROW_IN = { at: -3, step: 2, each: 8 };
// Em quantos quadros um ícone passa de um estado a outro.
const TURN_FRAMES = 9;

// A cascata começa estes quadros antes da cena, por baixo do pedestal de `older-than-brain`, que encolhe:
// sem isso a fila abria o plano já a meio tamanho, depois de um quadro só com o fundo.
const ROW_LEAD = 5;
// O plano dura 1,4 s e não tem frase própria: é o X que diz que o segundo jeito acabou. Para ser um
// acontecimento, ele cai com a fila inteira assentada e o contorno aceso e parado estes quadros: caindo
// quando o ícone dele assentava, perdia-se na cascata e na troca de cor do fundo.
const CROSS_HOLD = 6;
const CROSS_AT =
  ROW_IN.at -
  ROW_LEAD +
  (ICONS.length - 1) * ROW_IN.step +
  ROW_IN.each +
  CROSS_HOLD;

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
        brain: frame >= crossAt ? "cross" : "on",
        alarm: frame >= nextAt ? "on" : "off",
      }}
      // Antes da cena nada mudou ainda, e o relógio de quem desenha o prelúdio é outro.
      since={frame < 0 ? {} : { brain: crossAt, alarm: nextAt }}
      turning={{
        ...(frame >= crossAt
          ? {
              brain: {
                from: "on",
                progress: ramp(frame, crossAt, TURN_FRAMES),
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
          (life.tilt.alarm ?? 0) + shake(frame, nextAt + 3, 0.5 * fps, 11, 5),
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
// Onde a aproximação lenta do plano termina: é daqui que a câmera do plano da sala abre.
const ALARM_END = framing([960, 600], 1.04, [960, 600]);
// O laboratório fica para o plano da sala: quem sai é o rato e o calendário, que encolhem no próprio ponto
// logo antes da troca. O atraso de cada um, em quadros depois de a saída do palco começar.
const LEAVE_AFTER = { calendar: 6, rat: 10 };
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
  const ratLeft = 1 - stage.leave(LEAVE_AFTER.rat);
  const calendarLeft = 1 - stage.leave(LEAVE_AFTER.calendar);
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
            ALARM_END,
            linear(frame, 0, length),
          )}
          wall={
            <>
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  scale: `${WALL_CALENDAR.scale * calendarLeft}`,
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
              {/* O quadro-negro do plano seguinte já cresce aqui, na mesma parede, enquanto o rato encolhe:
                  a troca não deixa a sala vazia. */}
              {frame >= length - ROOM_IN.lead ? (
                <RoomBoard frame={frame - length} />
              ) : null}
            </>
          }
        >
          <SvgLayer>
            <ellipse
              cx={SLEEPY.x}
              cy={BENCH_Y + 10}
              rx={SLEEPY.width * 0.46 * ratLeft}
              ry={26 * ratLeft}
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
              scale: `${ratLeft} ${ratLeft * (1 + 0.025 * wave(seconds, 3.2, 0.1) + 0.05 * jolt)}`,
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
                  ...ratIdle(seconds, "sleepy", clamp01(startled / 12)),
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
// Quanto cada rato se ergue pela frente, em graus: com menos, eles olhavam para a esquerda, e não para o quadro.
const LOOK_UP = 24;
// A sala se monta no laboratório do despertador, que fica: a câmera abre um nada e a frente escura da bancada
// desce (o tampo vira o chão), o quadro-negro cresce na parede, onde estava o calendário, e ele cresce dos pés.
// Em quadros: quanto a câmera leva, quanto o quadro-negro e ele levam para crescer, e quantos quadros antes
// do plano o quadro-negro começa (o plano do despertador o desenha: sem isso a troca tinha um quadro só de parede).
const ROOM_IN = { camera: 18, board: 14, him: 12, lead: 8 };

/** O quadro-negro do gancho crescendo na parede, num quadro do plano da sala: negativo, antes de ele chegar. */
const RoomBoard: React.FC<{ frame: number }> = ({ frame }) => (
  <AbsoluteFill
    style={{
      transformOrigin: `${BOARD.x + BOARD.width / 2}px ${BOARD.y + BOARD.height / 2}px`,
      scale: `${grown(frame, -ROOM_IN.lead, ROOM_IN.board)}`,
    }}
  >
    <Chalkboard box={BOARD} stamp="full" />
  </AbsoluteFill>
);
// Os dez entram em cascata: o intervalo entre um e o seguinte (0,08 s) e quanto cada um leva, em quadros.
// O primeiro espera o quadro-negro começar a crescer: é a parede que diz onde eles estão.
const RATS_IN = { at: 3, step: 2.4, each: 9 };
// Erguer o corpo: o agachar que avisa, a subida com sobra e o assentar, em quadros a partir da deixa.
const RISE = { crouch: 4, up: 8, settle: 5, over: 1.14 };
// A etiqueta de nome encolhe no ponto antes de a sala sair: quantos quadros antes do fim do plano, e quanto leva.
const NAME_OUT = { before: 22, frames: 9 };

type OpeningShotProps = {
  /** O quadro da cena em que o plano começa: os ratos respiram e farejam no relógio dela. */
  readonly clock: number;
  /** Quadros do plano em que ele entra na sala e em que a etiqueta de nome entra. */
  readonly himAt: number;
  readonly nameAt: number;
};

/**
 * A sala de Rechtschaffen, aberta, no laboratório do plano do despertador: a
 * parede e a bancada ficam, o quadro-negro do gancho cresce na parede, com a
 * árvore e o carimbo "erro?", os dez ratos entram em cascata aos pés dele e,
 * com ele na sala, erguem o corpo e olham para cima. A fala não o
 * reapresenta: quem o faz reconhecer é o quadro-negro e a etiqueta de nome.
 */
const OpeningShot: React.FC<OpeningShotProps> = ({ clock, himAt, nameAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const length = useShotLength();
  const seconds = (clock + frame) / fps;
  const opened = ramp(frame, 0, ROOM_IN.camera);
  // Eles só se erguem com os dez no lugar e com ele já na sala: é para o quadro que olham.
  const lookAt = Math.max(
    himAt + ROOM_IN.him,
    RATS_IN.at + (RATS - 1) * RATS_IN.step + RATS_IN.each + RISE.crouch,
  );
  // Cada rato se ergue com um quadro de diferença do vizinho: juntos, mas não como uma peça só.
  const raised = (index: number) =>
    interpolate(
      frame - (index % 3),
      [
        lookAt - RISE.crouch,
        lookAt,
        lookAt + RISE.up,
        lookAt + RISE.up + RISE.settle,
      ],
      [0, -0.12, RISE.over, 1],
      { ...clamp, easing: Easing.out(Easing.quad) },
    );

  return (
    <RatLab
      floor
      front={1 - opened}
      steady
      camera={cameraBetween(
        ALARM_END,
        cameraBetween(
          WIDE,
          WIDE_END,
          linear(frame, ROOM_IN.camera, length - ROOM_IN.camera),
        ),
        opened,
      )}
      wall={<RoomBoard frame={frame} />}
    >
      {frame < himAt ? null : (
        <AbsoluteFill
          style={{
            transformOrigin: `${RECHTSCHAFFEN.x}px ${RECHTSCHAFFEN.y}px`,
            scale: `${grown(frame, himAt, ROOM_IN.him)}`,
          }}
        >
          <Researcher
            {...RECHTSCHAFFEN}
            nameAt={nameAt}
            nameOffset={[180, -RECHTSCHAFFEN.height - 60]}
            on="mint"
            // A etiqueta sai antes de a sala descer: descendo com ela, cruzava com a placa de `rats-disc`, que sobe.
            nameGone={drop(frame, length - NAME_OUT.before, NAME_OUT.frames)}
          />
        </AbsoluteFill>
      )}
      <RatRow
        {...TEN}
        state={() => "awake"}
        seconds={seconds}
        lookUp={LOOK_UP}
        alive={1}
        raised={raised}
        present={(index) =>
          grown(frame, RATS_IN.at + index * RATS_IN.step, RATS_IN.each)
        }
        seed="ten"
      />
    </RatLab>
  );
};

export const ForcedAwakeScene: React.FC<SceneProps> = ({ scene, shots }) => {
  const opening = shots[2].from;
  const himAt = cue(scene, "no") - opening;
  return (
    <>
      <Shot range={shots[0]} name="o contorno ganha um X; o despertador acende">
        {/* O plano não tem frase própria: o X cai com a fila no lugar, e o despertador acende dentro de
            "terceiro", quando o X acabou de cair: são duas batidas, e não uma. */}
        <MapShot
          crossAt={CROSS_AT}
          nextAt={Math.max(cue(scene, "terceiro"), CROSS_AT + TURN_FRAMES)}
        />
      </Shot>
      <Shot range={shots[1]} name="o despertador sobre o rato sonolento">
        <AlarmShot
          ringAt={cue(scene, "força") - shots[1].from}
          strikeAt={cue(scene, "Foi") - shots[1].from}
          clock={shots[1].from}
        />
      </Shot>
      <Shot
        range={shots[2]}
        name="Rechtschaffen, o quadro-negro e os dez ratos"
      >
        <OpeningShot
          clock={opening}
          himAt={himAt}
          // A etiqueta espera ele assentar.
          nameAt={Math.max(cue(scene, "Álan") - opening, himAt + ROOM_IN.him)}
        />
        {/* A bancada do disco de `rats-disc` sobe aqui, por cima da do quadro-negro, que desce: a troca de cena
            não deixa a tela só com a parede. */}
        <Prelude>
          <RatsDiscOpening videoClock={scene.from + shots[2].to} />
        </Prelude>
      </Shot>
    </>
  );
};
