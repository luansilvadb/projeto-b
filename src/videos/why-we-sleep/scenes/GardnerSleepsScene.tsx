import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import type { Expression } from "../../../art/Person";
import { Cast, FlatStage, Stay, useStage } from "../../../components/Cast";
import { Grain } from "../../../components/Grain";
import { blink, breath, wave } from "../../../components/Idle";
import { Place } from "../../../components/Place";
import { grown, Pop, popScale } from "../../../components/Pop";
import { SvgLayer } from "../../../components/SvgLayer";
import {
  cue,
  drop,
  linear,
  mix,
  ramp,
  shake,
  clamp01,
} from "../../../components/timing";
import type { SceneProps } from "../../../video/NarratedVideo";
import { Shot, useShotLength } from "../../../video/Shot";
import { chalkboard, lagoon } from "../palette";
import { Bed } from "../parts/Bed";
import {
  Dement,
  Gardner,
  RoomFloor,
  SleepClock,
  Symptoms,
  gardner,
  type Flush,
} from "../parts/Gardner";
import { IdeaBackdrop, IdeaShadow } from "../parts/IdeaBackdrop";
import {
  BILL_LINES,
  BillPocket,
  BillToPocket,
  DETAIL,
  DETAIL_NIGHTS,
  POCKET_CORNER,
  SleepBill,
  SleepBillDetail,
  billHeight,
} from "../parts/SleepBill";
import { Tag } from "../parts/Tag";
import { glance, swapUnderLid } from "./AwakeRecordScene";
import { flash } from "./MaybeBrainScene";
import { RECAP_LEAD, RecapPrelude } from "./SoFarScene";
import { billSway } from "./SkipANightScene";
import { Drift, driftZoom, undrifted } from "./SleepDebtScene";

const ROOM_HUE = "lilac";
// O chão fica acima do selo da fonte, que neste plano é comprido.
const FLOOR = 940;
const AWAKE = { x: 620, y: FLOOR, height: 600 };
// Dement é um adulto ao lado de um rapaz de dezessete anos: mais alto que ele.
const OBSERVER = { x: 1380, y: FLOOR, height: 710 };
// A cabeça de Gardner, para onde os balões apontam, e os três em arco sobre ela.
const HEAD = [AWAKE.x, AWAKE.y - AWAKE.height * 0.74] as const;
const BALLOONS = [
  [340, 370],
  [620, 190],
  [900, 370],
] as const;
// O ponto para o qual o plano deriva: entre a cabeça dele e os balões.
const WATCHED_FOCUS = [700, 480] as const;
const WATCHED_DRIFT = 0.04;

type Arm = { readonly hand: readonly [number, number]; readonly bend: number };
type Pose = { readonly front: Arm; readonly back: Arm };

// As poses dele, nas unidades do desenho da pessoa: solto e sonolento; a mão na barriga, de quem enjoa; a mão na
// cabeça, de quem procura uma lembrança; e os braços duros, de punhos fechados, de quem se irrita.
const POSES: readonly Pose[] = [
  {
    front: { hand: [-136, -214], bend: 26 },
    back: { hand: [100, -214], bend: 73 },
  },
  {
    front: { hand: [-18, -246], bend: -44 },
    back: { hand: [92, -250], bend: 64 },
  },
  {
    front: { hand: [-132, -220], bend: 22 },
    back: { hand: [132, -478], bend: 62 },
  },
  {
    front: { hand: [-156, -238], bend: 4 },
    back: { hand: [158, -236], bend: 8 },
  },
];
const armBetween = (from: Arm, to: Arm, t: number): Arm => ({
  hand: [mix(from.hand[0], to.hand[0], t), mix(from.hand[1], to.hand[1], t)],
  bend: mix(from.bend, to.bend, t),
});
// Cada pose chega pouco depois de o balão dela estourar (a reação vem depois da causa), neste tempo, em quadros.
const POSE = { after: 3, frames: 9 };
// O verde de quem enjoa e o vermelho de quem se irrita, no rosto dele: os tons dos balões.
const QUEASY = { color: lagoon.day.grass[0], amount: 0.42 };
const ANGRY = { color: chalkboard.stamp, amount: 0.32 };

type SubjectProps = {
  readonly x: number;
  readonly y: number;
  readonly height: number;
  /** Quanto de cada pose de sintoma ele já tomou, de 0 a 1, na ordem da fala. */
  readonly poses?: readonly [number, number, number];
  readonly expression?: Expression;
  readonly gaze?: readonly [number, number];
  readonly blink?: number;
  readonly lean?: number;
  readonly breath?: number;
  /** A boca de quem se irrita. */
  readonly frown?: boolean;
};

/** Gardner depois de onze dias: de pé, com pálpebras pesadas e uma das poses dos sintomas. */
const Subject: React.FC<SubjectProps> = ({
  x,
  y,
  height,
  poses = [0, 0, 0],
  expression = "sleepy",
  gaze,
  blink: lids = 0,
  lean = 0,
  breath: body = 1,
  frown,
}) => {
  const arm = (side: "front" | "back") =>
    poses.reduce(
      (from, weight, index) => armBetween(from, POSES[index + 1][side], weight),
      POSES[0][side],
    );
  // O enjoo sai do rosto quando a pose seguinte chega; a raiva fica.
  const flush: Flush =
    poses[2] > 0
      ? { ...ANGRY, amount: ANGRY.amount * poses[2] }
      : { ...QUEASY, amount: QUEASY.amount * (poses[0] - poses[1]) };

  return (
    <Gardner
      x={x}
      y={y}
      height={height}
      expression={expression}
      gaze={gaze}
      blink={lids}
      lean={lean}
      breath={body}
      frontArm={arm("front")}
      backArm={arm("back")}
      flush={flush}
      frown={frown}
    />
  );
};

/** O balanço de quem mal fica em pé, em graus. */
const tiredSway = (seconds: number): number => 2.2 * wave(seconds, 2.9, 0.15);
const tiredBreath = (seconds: number): number =>
  breath(seconds, "gardner", { amplitude: 0.025, period: 4.1 });
/** A piscada lenta de quem está com sono. */
const tiredBlink = (seconds: number): number =>
  blink(seconds, "gardner-awake", { every: [1.8, 3.4], seconds: 0.3 });

/** Quantos quadros antes do plano dele Gardner já entra no palco, no fim do plano das mesas. */
export const SUBJECT_BEFORE_FRAMES = 14;

type WaitingSubjectProps = {
  /** O quadro em que ele começa a crescer, no tempo de quem o desenha, e o quadro do vídeo. */
  readonly at: number;
  readonly clock: number;
};

/**
 * Gardner de pé, oscilando, como o plano de Dement o encontra: o plano das
 * mesas o desenha nos últimos quadros dele, para a primeira palavra do plano
 * seguinte já o achar no lugar.
 */
export const WaitingSubject: React.FC<WaitingSubjectProps> = ({
  at,
  clock,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const seconds = (clock + frame) / fps;
  return (
    <Drift focus={WATCHED_FOCUS} zoom={1 - WATCHED_DRIFT}>
      <AbsoluteFill
        style={{
          transformOrigin: `${AWAKE.x}px ${AWAKE.y}px`,
          scale: `${grown(frame, at)}`,
        }}
      >
        <SvgLayer>
          <IdeaShadow hue={ROOM_HUE} x={AWAKE.x} y={FLOOR + 6} width={300} />
        </SvgLayer>
        <Subject
          {...AWAKE}
          gaze={[0, 0.55]}
          blink={tiredBlink(seconds)}
          lean={tiredSway(seconds)}
          breath={tiredBreath(seconds)}
        />
      </AbsoluteFill>
    </Drift>
  );
};

// Dement vem de fora do quadro, andando: cinco passos, e freia ao chegar.
const ENTRANCE = { from: 2300, frames: 34, steps: 5, brake: 7 };
// A cada sintoma ele anota: a mão vai e vem sobre a prancheta, pouco depois do balão.
const NOTE = { after: 14, frames: 18, turns: 2.5 };
// O chão do quarto sobe de baixo do quadro e desce na saída.
const FLOOR_RISE = { by: 210, frames: 14 };

type WatchedShotProps = {
  /** Quadros do plano em que Dement começa a entrar e em que o nome dele estoura. */
  readonly walkAt: number;
  readonly nameAt: number;
  /** Quadro em que cada balão estoura, na ordem da fala. */
  readonly at: readonly [number, number, number];
  readonly clock: number;
};

/** Ao lado do rapaz, Dement observa, de prancheta; três balões estouram sobre ele, e a cada um ele muda de pose: enjoo, um branco, raiva. */
const WatchedShot: React.FC<WatchedShotProps> = ({
  walkAt,
  nameAt,
  at,
  clock,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const stage = useStage();
  const seconds = (clock + frame) / fps;
  const arriveAt = walkAt + ENTRANCE.frames;
  const walked = 1 - (1 - clamp01((frame - walkAt) / ENTRANCE.frames)) ** 1.5;
  const observerX = mix(ENTRANCE.from, OBSERVER.x, walked);
  const gait = clamp01((arriveAt - frame) / ENTRANCE.brake);
  const standing = ramp(frame, arriveAt - 2, 8);
  const poses = at.map((popped) =>
    ramp(frame, popped + POSE.after, POSE.frames),
  ) as [number, number, number];
  // O rosto troca sob a pálpebra, quando cada pose começa.
  const swaps = at.map((popped) => swapUnderLid(frame, popped + POSE.after, 6));
  const expression: Expression = swaps[2].done
    ? "puzzled"
    : swaps[1].done
      ? "curious"
      : "sleepy";
  // Enjoado, ele aperta os olhos.
  const squeezed = 0.5 * (poses[0] - poses[1]);
  const eyes = glance(frame, [
    [0, 0, 0.55],
    [arriveAt - 12, 1, 0.3],
    [arriveAt + 14, 0, 0.55],
    [at[0] + POSE.after, 0, 1],
    [at[1] + POSE.after + 1, 0.3, -1],
    [at[2] + POSE.after + 1, 1, 0.15],
  ]);
  const lean =
    tiredSway(seconds) * (1 - 0.7 * poses[2]) +
    3 * (poses[0] - poses[1]) -
    1.5 * (poses[1] - poses[2]) +
    3.5 * poses[2] +
    // Irritado, ele bate o pé.
    shake(frame, at[2] + POSE.after + 4, 12, 2.2, 2);
  const body =
    tiredBreath(seconds) *
    (1 - 0.035 * (poses[0] - poses[1])) *
    (1 + 0.03 * poses[2]);
  const note = at.reduce(
    (sum, popped) =>
      sum + shake(frame, popped + NOTE.after, NOTE.frames, 1, NOTE.turns),
    0,
  );
  const sunk =
    FLOOR_RISE.by * (1 - ramp(frame, 0, FLOOR_RISE.frames) + stage.leave(6));

  return (
    <AbsoluteFill>
      <FlatStage backdrop={<IdeaBackdrop hue={ROOM_HUE} spot={[0.34, 0.45]} />}>
        <Drift focus={WATCHED_FOCUS} by={WATCHED_DRIFT}>
          {/* O chão não cresce de um ponto, como o elenco: sobe e desce. */}
          <Stay>
            <RoomFloor hue={ROOM_HUE} y={FLOOR + sunk} />
          </Stay>
          {/* Ele já estava de pé quando o plano chegou, e é quem o plano seguinte leva até a cama: não entra nem sai. */}
          {stage.handedOver ? null : (
            <Stay>
              <SvgLayer>
                <IdeaShadow
                  hue={ROOM_HUE}
                  x={AWAKE.x}
                  y={FLOOR + 6}
                  width={300}
                />
              </SvgLayer>
              <Subject
                {...AWAKE}
                poses={poses}
                expression={expression}
                gaze={eyes}
                frown={swaps[2].done}
                blink={Math.max(
                  tiredBlink(seconds),
                  squeezed,
                  ...swaps.map((swap) => swap.lid),
                )}
                lean={lean}
                breath={body}
              />
            </Stay>
          )}
          {/* Dement vem de fora do quadro, andando: não entra crescendo; sai com o plano. */}
          <Stay only="entering">
            <SvgLayer>
              <IdeaShadow
                hue={ROOM_HUE}
                x={observerX}
                y={FLOOR + 6}
                width={320}
              />
            </SvgLayer>
            <Dement
              {...OBSERVER}
              x={observerX}
              flip
              stride={{ step: ENTRANCE.steps * walked, gait }}
              blink={blink(seconds, "dement")}
              breath={mix(1, breath(seconds, "dement"), standing)}
              note={note}
              nameAt={nameAt}
              nameX={OBSERVER.x}
              on={ROOM_HUE}
            />
            <Symptoms spots={BALLOONS} at={at} head={HEAD} seconds={seconds} />
          </Stay>
        </Drift>
        <Grain />
      </FlatStage>
    </AbsoluteFill>
  );
};

const BED_HUE = "mint";
/** As horas que ele dormiu de uma vez. */
const SLEPT_HOURS = 14;
// A cama no meio do quadro, com o relógio encostado no pé dela e "14 h" sob ele: um bloco só. A régua e a
// barra "8 h" saíram com a comparação, que a fala não faz mais.
const BED_HIGH = { x: 770, y: 740, scale: 0.72 };
// No plano da conta, a cama desce e vai para a direita da conta aberta.
const BED_LOW = { x: 1240, y: 920, scale: 0.72 };
const CLOCK = { x: 1380, y: 500, radius: 170 };
// A cama desenha quem dorme com 800 de altura, um nada à esquerda do meio dela.
const SLEEPER = { height: 800, x: -5 };
// O ponto para o qual os planos da cama derivam.
const CRASH_FOCUS = [960, 600] as const;
const CRASH_DRIFT = 0.05;

/** A respiração de quem dorme na cama: o cobertor sobe e desce. */
const asleepBreath = (seconds: number): number =>
  1 + 0.05 * wave(seconds, 4.4, 0.2);
/** Onde quem vai se deitar fica de pé, diante de uma cama. */
const beside = (bed: { x: number; y: number; scale: number }) => ({
  x: bed.x + SLEEPER.x * bed.scale,
  y: bed.y,
  height: SLEEPER.height * bed.scale,
});

// Ele vai do lugar em que estava até a frente da cama, que se monta em volta: em quadros. `stand` é o quadro
// em que a cama passa a desenhá-lo, de pé diante dela: ela já está inteira no lugar.
const TO_BED = { frames: 12, calm: 10, stand: 16 };
// Deitar: balança para a frente (aviso), tomba de costas no colchão, e o cobertor sobe. Em quadros.
const LIE = { notBefore: 19, warn: 4, fall: 11, cover: 9, sway: 6 };
// O relógio dá a volta e passa dela em 1 s, a velocidade constante: parte em "dormiu" e chega em "catorze horas".
const AROUND_SECONDS = 1;
// De onde a cama cresce, a partir do chão dela, em pixels do quadro: bem à direita dele e à altura do peito.
// Ela entra na marcação dos objetos de cena, quatro quadros depois de ele dar o passo: adiantada, chegava
// ao lugar com ele ainda parado, e a cabeceira passava atrás da cabeça dele.
const BED_FROM = { x: 240, y: 190 };

type CrashShotProps = {
  /** Quadros do plano em que ele se deita e em que o relógio começa a correr. */
  readonly lieAt: number;
  readonly hoursAt: number;
  readonly clock: number;
};

/** Ele desaba na cama, e o relógio dá a volta e passa dela, até "14 h". */
const CrashShot: React.FC<CrashShotProps> = ({ lieAt, hoursAt, clock }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const stage = useStage();
  const length = useShotLength();
  const seconds = (clock + frame) / fps;
  const zoom = driftZoom(frame, length, CRASH_DRIFT);
  // Ele chega como o plano anterior o deixou, irritado, e vai para a frente da cama enquanto se acalma.
  const walking = ramp(frame, 0, TO_BED.frames);
  const calm = ramp(frame, 0, TO_BED.calm);
  const before = undrifted([AWAKE.x, AWAKE.y], CRASH_FOCUS, zoom);
  const spot = beside(BED_HIGH);
  const swap = swapUnderLid(frame, 2, 6);
  // Daqui em diante quem o desenha é a cama, de pé diante dela, no mesmo ponto e na mesma pose.
  const standAt = TO_BED.stand;
  const fallAt = lieAt + LIE.warn;
  const landAt = fallAt + LIE.fall;
  const lying = frame >= landAt;
  // O corpo afunda no colchão com a queda e volta.
  const landed = (frame - landAt) / (0.3 * fps);
  const sink =
    landed <= 0 || landed >= 1
      ? 0
      : 0.07 * (1 - landed) * Math.sin(Math.PI * landed);
  const around = AROUND_SECONDS * fps;

  return (
    <AbsoluteFill>
      <FlatStage backdrop={<IdeaBackdrop hue={BED_HUE} spot={[0.36, 0.36]} />}>
        <Drift focus={CRASH_FOCUS} by={CRASH_DRIFT}>
          {/* A cama continua no plano seguinte, que passa a desenhá-la: entra com este e não sai. */}
          {stage.handedOver ? null : (
            <Stay only="leaving">
              <>
                {/* A cama cresce de um ponto ao lado dele, abaixo do lugar dela, e sobe até lá com ele já a caminho: chega por trás do tronco, e não da cabeça. */}
                <Cast
                  origin={[BED_HIGH.x + BED_FROM.x, BED_HIGH.y + BED_FROM.y]}
                >
                  <Bed
                    {...BED_HIGH}
                    colors={gardner}
                    blanket="blue"
                    hue={BED_HUE}
                    occupied={frame >= standAt}
                    standing={1 - drop(frame, fallAt, LIE.fall)}
                    lean={LIE.sway * ramp(frame, lieAt - 2, LIE.warn + 2)}
                    // O rosto de quem dorme entra com o olho já fechado, no meio da queda.
                    state={frame >= fallAt + LIE.fall / 2 ? "asleep" : "sleepy"}
                    blink={Math.max(
                      tiredBlink(seconds),
                      ramp(frame, lieAt, LIE.warn),
                    )}
                    cover={ramp(frame, landAt - 2, LIE.cover)}
                    breath={lying ? asleepBreath(seconds) - sink : 1}
                    snoreAt={landAt + 4}
                  />
                </Cast>
              </>
            </Stay>
          )}
          <SleepClock
            {...CLOCK}
            hours={SLEPT_HOURS * linear(frame, hoursAt, around)}
          />
          {/* O número fica preso ao relógio, e estoura quando o ponteiro para. */}
          <Place x={CLOCK.x} y={CLOCK.y + CLOCK.radius + 62}>
            <Pop at={hoursAt + around}>
              <Tag size="note" on={BED_HUE}>
                14 h
              </Tag>
            </Pop>
          </Place>
          {/* Por cima da cama, que entra enquanto ele vai até ela. */}
          {frame < standAt ? (
            <Stay>
              <Subject
                x={mix(before[0], spot.x, walking)}
                y={mix(before[1], spot.y, walking)}
                height={mix(AWAKE.height / zoom, spot.height, walking)}
                poses={[0, 0, 1 - calm]}
                expression={swap.done ? "sleepy" : "puzzled"}
                gaze={swap.done ? undefined : [1, 0.15]}
                frown={!swap.done}
                blink={Math.max(tiredBlink(seconds), swap.lid)}
                lean={(tiredSway(seconds) * 0.3 + 3.5) * (1 - calm)}
                breath={mix(tiredBreath(seconds) * 1.03, 1, calm)}
              />
            </Stay>
          ) : null}
        </Drift>
        {/* O bolso da conta volta ao canto, cheio: a conta sai dele no plano seguinte, que passa a desenhá-lo. Fora da deriva, para estar no canto exato. */}
        {stage.handedOver ? null : (
          <Stay only="leaving">
            <Place
              x={POCKET_CORNER.x}
              y={POCKET_CORNER.y}
              style={{ rotate: `${2 * billSway(seconds)}deg` }}
            >
              <BillPocket scale={POCKET_CORNER.scale} />
            </Place>
          </Stay>
        )}
        <Grain />
      </FlatStage>
    </AbsoluteFill>
  );
};

// A conta se abre à esquerda da cama, sob a linha do bolso.
const BILL = { x: 440, y: 190, scale: 1.3 };
// A cama desce; a conta sai do bolso logo depois, e leva 0,7 s para chegar e se abrir. A fala não diz a
// regra: quem a lembra é o carimbo "cobrado", que precisa de quadros parados para ser lido.
const LOWER_FRAMES = 18;
const OUT = { at: 2, seconds: 0.7 };
// Quantos quadros a conta fica aberta, de frente, antes de virar: o carimbo pisca uma vez nesse tempo.
const READ_FRAMES = 16;
// O ponto para o qual a cama deriva, e quanto.
const BILL_FOCUS = [1240, 700] as const;
const BILL_DRIFT = 0.04;

// A conta de perto enche o quadro.
const CLOSE_BILL = 1.4;
const CLOSE_CENTER = [960, 520] as const;
// A aproximação lenta da conta de perto é uma só: começa quando ela vira e termina no plano da seta.
const CLOSE_DRIFT = { from: 0.965, between: 0.985 };
// A conta vem para o meio, cresce e vira: de frente, o papel "sono devido"; do outro lado, as onze noites.
// A cama e o bolso encolhem nos lugares deles enquanto isso.
const TURN = { frames: 18, clear: 8 };
// A meia-volta do papel, a velocidade constante, dentro da viagem: com a curva da viagem, o papel passava de
// meio aberto de um lado a meio aberto do outro em dois quadros, e o de perfil ficava vazio. `edge` é a largura
// mínima, em fração: de perfil o papel ainda tem espessura.
const FLIP = { at: 2, frames: 13, edge: 0.05 };
// De perto, o papel balança menos que ao lado da cama, em fração do balanço da conta.
const PAPER_SWAY = 0.8;
// As noites são riscadas uma a uma, a partir destes quadros depois de a conta começar a virar (o verso já
// se vê), com este intervalo; "14 h" estoura do outro lado com a fila de riscos na metade.
const STRIKE = { after: 11, every: 2, hoursAfter: 21 };
// As luas piscam juntas, duas vezes.
const MOONS = { at: 4, frames: 10, gap: 11 };
// Nos últimos instantes do último plano o bolso aparece no canto dele, vazio, pronto para receber a conta:
// ela encolhe um pouco e vai para o lado, para os dois caberem.
const ASIDE = { x: -120, scale: 0.84, before: 25, frames: 12, pocketAfter: 4 };
// A saída: a conta vai para o bolso, que estava ali para isso, encolhendo e dobrando no caminho; ele a
// engole, dá um pulo pequeno e encolhe no lugar. Antes, ela ficava inteira até a troca e sumia sem forma
// sob o fundo da cena seguinte. Em quadros antes da troca: quando ela parte e quanto leva; o tamanho
// com que chega, em fração do de perto, e quanto dobra e inclina; e o bolso, que termina de sair logo
// depois de a cena seguinte chegar.
const STOW = {
  before: 12,
  frames: 9,
  size: 0.09,
  width: 0.6,
  tilt: 14,
  bump: 0.12,
  pocketBefore: 1,
  pocketFrames: 4,
};

type DetailProps = {
  /** O meio da conta no quadro, a altura dela em fração da final, e a largura (a meia-volta passa pelo zero). */
  readonly x: number;
  readonly y: number;
  readonly size: number;
  readonly width?: number;
  readonly tilt?: number;
  readonly nights: number;
  readonly hours: number;
  readonly hoursSize: number;
  readonly pulse?: number;
  readonly arrow?: number;
  readonly tagSize?: number;
};

/** A conta de perto, posta pelo meio dela: é o mesmo desenho nos dois planos por que ela passa. */
const Detail: React.FC<DetailProps> = ({
  x,
  y,
  size,
  width = 1,
  tilt = 0,
  arrow = 0,
  tagSize = 0,
  ...bill
}) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      translate: "-50% -50%",
      rotate: `${tilt}deg`,
      scale: `${width} 1`,
    }}
  >
    <SleepBillDetail
      scale={CLOSE_BILL * size}
      on={BED_HUE}
      arrow={arrow}
      tagSize={tagSize}
      {...bill}
    />
  </div>
);

type BillShotProps = {
  /** Quadro do plano em que a conta, aberta ao lado da cama, vem para o meio e vira. */
  readonly turnAt: number;
  readonly clock: number;
};

/**
 * A conta carimbada sai do bolso marcado no canto e se abre ao lado da cama
 * dele; lido o carimbo, ela vem para o meio, de perto, e vira: de um lado as
 * onze noites, riscadas uma a uma, e do outro só "14 h".
 */
const BillShot: React.FC<BillShotProps> = ({ turnAt, clock }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const stage = useStage();
  const length = useShotLength();
  const seconds = (clock + frame) / fps;
  const zoom = driftZoom(frame, length, BILL_DRIFT);
  // A cama vem de onde o plano anterior a deixou.
  const lowered = ramp(frame, 0, LOWER_FRAMES);
  const high = undrifted([BED_HIGH.x, BED_HIGH.y], BILL_FOCUS, zoom);
  const outFrames = OUT.seconds * fps;
  const out = ramp(frame, OUT.at, outFrames);
  // O carimbo pisca uma vez, com a conta recém-aberta.
  const stamped = flash(frame, OUT.at + outFrames, 8);
  // Daqui em diante, o quadro do plano contado de quando a conta vira.
  const turning = frame - turnAt;
  const turned = ramp(turning, 0, TURN.frames);
  const cleared = ramp(turning, 0, TURN.clear);
  const drift = mix(
    CLOSE_DRIFT.from,
    CLOSE_DRIFT.between,
    clamp01(turning / (length - turnAt)),
  );
  // A conta aberta ao lado da cama: a altura dela, e o meio do papel.
  const openHeight = billHeight(BILL_LINES) * BILL.scale;
  const closeHeight = DETAIL.height * CLOSE_BILL * drift;
  // A altura cresce em proporção, para a velocidade aparente ser a mesma do começo ao fim.
  const height = openHeight * (closeHeight / openHeight) ** turned;
  const x = mix(BILL.x, CLOSE_CENTER[0], turned);
  const y = mix(BILL.y + openHeight / 2, CLOSE_CENTER[1], turned);
  // De frente até o perfil, e do perfil até o outro lado.
  const side = Math.cos(Math.PI * linear(turning, FLIP.at, FLIP.frames));
  const facing =
    side > 0 ? Math.max(side, FLIP.edge) : Math.min(side, -FLIP.edge);
  // Aberta, a conta balança; a inclinação se desfaz no caminho para o meio.
  const sway =
    billSway(seconds + 0.9) *
    ramp(frame, OUT.at + outFrames, 12) *
    (1 - ramp(turning, 0, TURN.frames / 2));
  const strikeAt = STRIKE.after;
  const hoursAt = STRIKE.hoursAfter;

  return (
    <AbsoluteFill>
      <FlatStage backdrop={<IdeaBackdrop hue={BED_HUE} spot={[0.62, 0.6]} />}>
        <Stay>
          {/* A cama desce para o lado da conta e, quando a conta vira, encolhe no lugar dela. */}
          {cleared < 1 ? (
            <Drift focus={BILL_FOCUS} by={BILL_DRIFT}>
              <AbsoluteFill
                style={{
                  transformOrigin: `${BED_LOW.x}px ${BED_LOW.y - 120}px`,
                  scale: `${1 - cleared}`,
                }}
              >
                <Bed
                  x={mix(high[0], BED_LOW.x, lowered)}
                  y={mix(high[1], BED_LOW.y, lowered)}
                  scale={mix(BED_HIGH.scale / zoom, BED_LOW.scale, lowered)}
                  colors={gardner}
                  blanket="blue"
                  hue={BED_HUE}
                  breath={asleepBreath(seconds)}
                  snoreAt={-fps}
                />
              </AbsoluteFill>
            </Drift>
          ) : null}
          {turning < 0 ? (
            // O caminho de `debt-returns`, ao contrário: o maço sai do bolso, viaja e se desdobra. Aberta, a conta balança.
            <BillToPocket
              from={[BILL.x, BILL.y]}
              scale={BILL.scale}
              progress={1 - out}
              creased
              tilt={sway}
              pocketTilt={2 * billSway(seconds)}
              stamp={1 - 0.25 * stamped}
            />
          ) : (
            <>
              {/* O bolso vazio encolhe no lugar dele. */}
              {cleared < 1 ? (
                <div
                  style={{
                    position: "absolute",
                    left: POCKET_CORNER.x,
                    top: POCKET_CORNER.y,
                    translate: "-50% -50%",
                    rotate: `${2 * billSway(seconds)}deg`,
                    scale: `${1 - cleared}`,
                  }}
                >
                  <BillPocket scale={POCKET_CORNER.scale} filled={0} />
                </div>
              ) : null}
              {facing > 0 ? (
                <div
                  style={{
                    position: "absolute",
                    left: x,
                    top: y - height / 2,
                    translate: "-50% 0",
                    transformOrigin: "50% 0",
                    rotate: `${sway}deg`,
                    scale: `${facing} 1`,
                  }}
                >
                  <SleepBill
                    scale={(BILL.scale * height) / openHeight}
                    stamp={1}
                  />
                </div>
              ) : stage.handedOver ? null : (
                // O verso é do plano seguinte também: ele o recebe daqui.
                <Detail
                  x={x}
                  y={y}
                  size={height / (DETAIL.height * CLOSE_BILL)}
                  width={-facing}
                  tilt={
                    PAPER_SWAY *
                    billSway(seconds + 0.9) *
                    ramp(turning, TURN.frames, 12)
                  }
                  nights={
                    DETAIL_NIGHTS *
                    linear(turning, strikeAt, DETAIL_NIGHTS * STRIKE.every)
                  }
                  hours={linear(turning, hoursAt, 3)}
                  hoursSize={popScale(turning, hoursAt, 0.3 * fps, 0.6, 1.1)}
                />
              )}
            </>
          )}
        </Stay>
        <Grain />
      </FlatStage>
    </AbsoluteFill>
  );
};

type DeeperShotProps = {
  /** Quadros do plano em que a seta desce e em que "mais fundo" estoura. */
  readonly arrowAt: number;
  readonly tagAt: number;
  readonly clock: number;
};

/** As luas riscadas piscam em "perdido"; a seta desce de "14 h" com "mais fundo"; no fim, a conta vai um pouco para o lado, o bolso aparece ao lado dela, e ela entra nele. */
const DeeperShot: React.FC<DeeperShotProps> = ({ arrowAt, tagAt, clock }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const length = useShotLength();
  const stage = useStage();
  const seconds = (clock + frame) / fps;
  const drift = mix(CLOSE_DRIFT.between, 1, Math.min(1, frame / length));
  const asideAt = length - ASIDE.before;
  const aside = ramp(frame, asideAt, ASIDE.frames);
  const pocketAt = asideAt + ASIDE.pocketAfter;
  // A conta vai para o bolso, com peso; chegando, some dentro dele, que mostra a ponta dela.
  const stowAt = length - STOW.before;
  const stowed = ramp(frame, stowAt, STOW.frames);
  const kept = ramp(frame, stowAt + STOW.frames - 3, 3);
  const size = drift * mix(1, ASIDE.scale, aside);
  // O bolso encolhe no lugar dele, e termina logo depois de a cena seguinte chegar.
  const gone = drop(frame, length - STOW.pocketBefore, STOW.pocketFrames);

  return (
    <AbsoluteFill>
      <FlatStage backdrop={<IdeaBackdrop hue={BED_HUE} spot={[0.5, 0.5]} />}>
        {/* A fila e as molduras de `so-far` entram aqui, por baixo da conta que vai para o bolso: a troca
            de cena não deixa a tela só com o fundo. Quando a cena delas chega, é ela quem as desenha. */}
        {frame >= length - RECAP_LEAD - 3 && !stage.handedOver ? (
          <RecapPrelude until={length - frame} clock={clock + length} />
        ) : null}
        <Stay>
          {stowed < 1 ? (
            <Detail
              x={mix(
                CLOSE_CENTER[0] + ASIDE.x * aside,
                POCKET_CORNER.x,
                stowed,
              )}
              y={mix(CLOSE_CENTER[1], POCKET_CORNER.y, stowed)}
              // A escala cai em proporção, para a velocidade aparente ser a mesma do começo ao fim.
              size={size * (STOW.size / size) ** stowed}
              width={mix(1, STOW.width, stowed)}
              tilt={
                PAPER_SWAY * billSway(seconds + 0.9) * (1 - stowed) +
                STOW.tilt * stowed
              }
              nights={DETAIL_NIGHTS}
              hours={1}
              hoursSize={1}
              // "O sono perdido": as onze noites piscam juntas.
              pulse={
                flash(frame, MOONS.at, MOONS.frames) +
                flash(frame, MOONS.at + MOONS.gap, MOONS.frames)
              }
              arrow={ramp(frame, arrowAt, 0.5 * fps)}
              tagSize={
                frame < tagAt ? 0 : popScale(frame, tagAt, 0.3 * fps, 0.6, 1.08)
              }
            />
          ) : null}
          {frame >= pocketAt ? (
            <div
              style={{
                position: "absolute",
                left: POCKET_CORNER.x,
                top: POCKET_CORNER.y,
                translate: "-50% -50%",
                rotate: `${2 * billSway(seconds)}deg`,
                // Ao receber a conta, ele dá um pulo pequeno.
                scale: `${grown(frame, pocketAt, 10) * (1 + STOW.bump * flash(frame, stowAt + STOW.frames - 3, 6)) * (1 - gone)}`,
              }}
            >
              <BillPocket scale={POCKET_CORNER.scale} filled={kept} />
            </div>
          ) : null}
        </Stay>
        <Grain />
      </FlatStage>
    </AbsoluteFill>
  );
};

export const GardnerSleepsScene: React.FC<SceneProps> = ({ scene, shots }) => {
  const { fps } = useVideoConfig();
  const walkAt = cue(scene, "por");
  const crash = shots[1].from;
  const bill = shots[2].from;
  const deeper = shots[3].from;
  const arrowAt = cue(scene, "sono", 3) - deeper;
  return (
    <>
      <Shot range={shots[0]} name="Dement observa; enjoo, um branco, raiva">
        <WatchedShot
          walkAt={walkAt}
          // O nome dele estoura com ele já parado.
          nameAt={Math.max(cue(scene, "sono"), walkAt + ENTRANCE.frames + 1)}
          at={[
            cue(scene, "náusea"),
            cue(scene, "memória"),
            cue(scene, "irritado"),
          ]}
          clock={scene.from}
        />
      </Shot>
      <Shot range={shots[1]} name="ele desaba na cama: 14 h">
        <CrashShot
          lieAt={Math.max(cue(scene, "deitou") - crash, LIE.notBefore)}
          hoursAt={cue(scene, "dormiu") - crash}
          clock={scene.from + crash}
        />
      </Shot>
      <Shot range={shots[2]} name="a conta: cobrado; onze noites, 14 h">
        <BillShot
          // A conta só vira com o carimbo lido.
          turnAt={Math.max(
            cue(scene, "acordado") - bill,
            OUT.at + OUT.seconds * fps + READ_FRAMES,
          )}
          clock={scene.from + bill}
        />
      </Shot>
      <Shot range={shots[3]} name="a seta: mais fundo">
        <DeeperShot
          arrowAt={arrowAt}
          tagAt={Math.max(cue(scene, "mais") - deeper, arrowAt + 10)}
          clock={scene.from + deeper}
        />
      </Shot>
    </>
  );
};
