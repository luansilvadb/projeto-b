import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Stopwatch } from "../../../art/Stopwatch";
import { taperPath, type Point } from "../../../art/shapes";
import { cameraBetween, framing } from "../../../components/Camera";
import { Cast, FlatStage, Stay, useStage } from "../../../components/Cast";
import { Grain } from "../../../components/Grain";
import { wave } from "../../../components/Idle";
import { Place } from "../../../components/Place";
import { Pop } from "../../../components/Pop";
import { SvgLayer } from "../../../components/SvgLayer";
import { cue, linear, mix, ramp, settle, clamp } from "../../../components/timing";
import type { SceneProps } from "../../../video/NarratedVideo";
import { Shot, useShotLength } from "../../../video/Shot";
import {
  customer,
  idea,
  personInPajamas,
  stopwatch,
  stopwatchAlarm,
} from "../palette";
import { Bed, bedShoulder } from "../parts/Bed";
import { Clipboard } from "../parts/Clipboard";
import { IdeaBackdrop } from "../parts/IdeaBackdrop";
import { Glove, LAB, PLATFORM_Y, TANK_CENTER } from "../parts/Laboratory";
import {
  PULSES_ASLEEP,
  PULSES_AWAKE,
  type PulseRhythm,
  pulseCycles,
  pulseFrame,
  steady,
} from "../parts/pulse";
import { BillPocket, POCKET_CORNER } from "../parts/SleepBill";
import {
  FLOATING_Y,
  FLOOR_Y,
  RESTING_Y,
  TankJellyfish,
  TankShot,
  floating,
} from "../parts/TankShot";
import { BILL_LEAD, JellyfishDebtOpening } from "./JellyfishDebtScene";
import { Prelude, Sooner, flash, shake } from "./MaybeBrainScene";
import { billSway } from "./SkipANightScene";
import { Drift } from "./SleepDebtScene";

// O tanque enche o quadro, e a pesquisadora, de mãos na prancheta, fica de fora: quem puxa é outra mão.
const ON_TANK = framing([1300, 545], 1.7);
// A aproximação lenta desse plano, até a troca.
const ON_TANK_END = framing([1300, 545], 1.75);
// De perto, dentro do vidro: cabe ela boiando no alto e o chão do tanque, para onde ela desce.
const IN_TANK = framing([TANK_CENTER, 530], 2);
const IN_TANK_END = framing([TANK_CENTER, 530], 2.05);
const PULL_CAMERA_SECONDS = 0.7;
const ADRIFT_CAMERA_SECONDS = 0.6;
// A mão desce, segura, recua a plataforma (o aviso) e a puxa de uma vez.
const REACH_SECONDS = 0.6;
const WINDUP_SECONDS = 0.3;
const PULL_SECONDS = 0.4;
const DRIFT_SECONDS = 1;
// A luva vem de cima, pela boca do tanque, e segura a ponta esquerda da plataforma.
const GLOVE_FROM = { x: 880, y: 90 };
const PLATFORM_HALF = 210;
// Quanto a plataforma recua antes do puxão, e até onde ela vai: sai pela esquerda, por trás do vidro.
const WINDUP = 34;
const PULL = -900;
// Boiando, ela fica inclinada.
const ADRIFT_TILT = -10;

type Loose = {
  /** O ritmo do pulso nos dois planos do tanque, em quadros do vídeo: ela para de pulsar quando perde o apoio, e volta ao acordar. */
  readonly rhythm: readonly PulseRhythm[];
};

type PullShotProps = Loose & {
  /** Quadros do plano em que a mão desce, em que a plataforma é puxada e em que ela começa a subir, solta. */
  readonly reachAt: number;
  readonly pulledAt: number;
  readonly looseAt: number;
  /** O quadro do vídeo em que o plano começa. */
  readonly clock: number;
};

/** No tanque, a mão de luva segura a plataforma, recua e a tira de uma vez de baixo dela. */
const PullShot: React.FC<PullShotProps> = ({
  reachAt,
  pulledAt,
  looseAt,
  clock,
  rhythm,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const length = useShotLength();
  const seconds = (clock + frame) / fps;
  const reach = ramp(frame, reachAt, REACH_SECONDS * fps);
  const windup = ramp(
    frame,
    pulledAt - WINDUP_SECONDS * fps,
    WINDUP_SECONDS * fps,
  );
  const pull = settle(frame, pulledAt, PULL_SECONDS * fps);
  const platformX = TANK_CENTER + WINDUP * windup * (1 - pull) + PULL * pull;
  const drift = ramp(frame, looseAt, DRIFT_SECONDS * fps);
  const adrift = floating(seconds);
  const handle: Point = [platformX - PLATFORM_HALF + 24, PLATFORM_Y + 8];
  // Sem o apoio, ela treme no lugar e afunda um pouco antes de começar a subir.
  const jolt = shake(frame, pulledAt, 0.6 * fps, 1, 2.5);
  const sag = 14 * ramp(frame, pulledAt + 2, 0.5 * fps) * (1 - drift);

  return (
    <TankShot
      camera={cameraBetween(
        LAB.mediumEnd,
        cameraBetween(ON_TANK, ON_TANK_END, frame / length),
        ramp(frame, 0, PULL_CAMERA_SECONDS * fps),
      )}
      researcher={[0, 0]}
      platform={platformX}
      clock={clock}
    >
      <TankJellyfish
        x={TANK_CENTER + 7 * jolt}
        y={mix(RESTING_Y, FLOATING_Y, drift) + adrift.y * drift + sag}
        tilt={(ADRIFT_TILT + adrift.tilt) * drift + 3 * jolt}
        droop={0.8 + 0.2 * drift}
        rhythm={rhythm}
        clock={clock}
      />
      {reach > 0 ? (
        <SvgLayer>
          <Glove
            from={[GLOVE_FROM.x + PULL * pull * 0.5, GLOVE_FROM.y]}
            to={[
              mix(GLOVE_FROM.x, handle[0], reach),
              mix(GLOVE_FROM.y + 60, handle[1], reach),
            ]}
            size={60}
          />
        </SvgLayer>
      ) : null}
    </TankShot>
  );
};

// O cronômetro fica no vazio à direita dela, longe dos braços.
const WATCH = { x: 1540, y: 300, width: 300 };
const SECONDS_LIMIT = 5;
// O tranco: os braços abrem de uma vez; virar-se e nadar até o fundo leva mais.
const OPEN_SECONDS = 0.3;
const SWIM_SECONDS = 0.8;

type AdriftShotProps = Loose & {
  /** Quadros do plano em que o cronômetro começa a contar, em que chega a "5 s" e em que ela acorda. */
  readonly countAt: number;
  readonly fiveAt: number;
  readonly wakeAt: number;
  readonly clock: number;
};

/** De perto, ela boia sem pulsar enquanto o cronômetro corre até "5 s"; então abre os braços de uma vez, se vira e nada para o fundo. */
const AdriftShot: React.FC<AdriftShotProps> = ({
  countAt,
  fiveAt,
  wakeAt,
  clock,
  rhythm,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const length = useShotLength();
  const seconds = (clock + frame) / fps;
  const counting = SECONDS_LIMIT * linear(frame, countAt, fiveAt - countAt);
  const counted = Math.floor(counting);
  // Cada segundo é um tique: o cronômetro dá um pulo pequeno quando o número troca, e um maior ao chegar ao limite.
  const tick =
    frame < countAt
      ? 0
      : counted >= SECONDS_LIMIT
        ? 2.4 * flash(frame, fiveAt - 1, 8)
        : Math.max(0, 1 - (counting - counted) * 5);
  const alarm = ramp(frame, fiveAt, 4);
  const open = settle(frame, wakeAt, OPEN_SECONDS * fps);
  const swimAt = wakeAt + OPEN_SECONDS * fps;
  const swim = ramp(frame, swimAt, SWIM_SECONDS * fps);
  // Vira-se antes de descer: o corpo endireita na primeira metade do nado.
  const righted = ramp(frame, swimAt, SWIM_SECONDS * fps * 0.6);
  const adrift = floating(seconds);
  const watch = (colors: typeof stopwatch) => (
    <Stopwatch
      width={WATCH.width}
      colors={colors}
      reading={`${Math.min(counted, SECONDS_LIMIT)} s`}
    />
  );

  return (
    <AbsoluteFill>
      <TankShot
        camera={cameraBetween(
          ON_TANK_END,
          cameraBetween(IN_TANK, IN_TANK_END, frame / length),
          ramp(frame, 0, ADRIFT_CAMERA_SECONDS * fps),
        )}
        clock={clock}
      >
        <TankJellyfish
          x={TANK_CENTER + 5 * shake(frame, wakeAt, 0.4 * fps, 1, 2)}
          y={
            mix(FLOATING_Y + adrift.y * (1 - open), FLOOR_Y, swim) +
            // Ao pousar no chão do tanque, afunda um nada e volta.
            shake(frame, swimAt + SWIM_SECONDS * fps - 2, 0.4 * fps, 6, 1)
          }
          tilt={
            (ADRIFT_TILT + adrift.tilt) * (1 - righted) +
            // O tranco joga o corpo para o outro lado antes de ele se endireitar.
            6 * flash(frame, wakeAt, OPEN_SECONDS * fps)
          }
          droop={1 - open}
          rhythm={rhythm}
          clock={clock}
        />
      </TankShot>
      <Place
        x={WATCH.x}
        y={WATCH.y}
        style={{
          rotate: `${6 + 1.2 * wave(seconds, 3.3)}deg`,
          scale: `${1 + 0.045 * tick}`,
        }}
      >
        <Pop at={countAt - 8}>
          <div style={{ position: "relative" }}>
            {watch(stopwatch)}
            {/* No limite, o visor passa ao vermelho por cima do outro, em poucos quadros. */}
            {alarm > 0 ? (
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  opacity: alarm,
                }}
              >
                {watch(stopwatchAlarm)}
              </div>
            ) : null}
          </div>
        </Pop>
      </Place>
    </AbsoluteFill>
  );
};

// A cama no chão do plano, de cabeça para a esquerda: é a peça de quem dorme no vídeo inteiro.
const BED = { x: 905, y: 930, scale: 1 };
const BED_FOCUS = [860, 620] as const;
// O ombro de cima, que a mão sacode, e de onde o braço vem.
const SHOULDER_SPOT = bedShoulder(BED);
const SHOULDER: Point = [SHOULDER_SPOT.x, SHOULDER_SPOT.y];
// Quem chama está ao lado da cama, quase todo fora do quadro: do alto entra um pedaço do ombro dele, e dali o
// braço desce curto, em diagonal, até o ombro dela. Vindo reto da borda, comprido e fino, o braço lia como um cano.
const CALLER = { x: 1090, y: -260, width: 450, height: 400, radius: 130 };
const CALLER_SHOULDER: Point = [1190, 60];
// De quão alto o braço entra, e em quantos segundos.
const ARM = { from: -640, seconds: 0.3 };
// As três sacudidas: quantos quadros uma leva, e quantos separam uma da seguinte.
const NUDGE = { frames: 9, every: 9 };
// A prancheta fica no canto de cima à esquerda: o da direita é do bolso da conta.
const CORNER = { x: 430, y: 230, scale: 0.7 };
// O plano abre com a cama e os dois cantos já no lugar: a fala começa no primeiro quadro.
const BED_SOONER = 30;

/** Uma sacudida: empurra, volta além do ponto e assenta. De -1 a 1. */
const nudgeAt = (frame: number, at: number): number =>
  interpolate(
    frame,
    [at, at + 2, at + 5, at + NUDGE.frames],
    [0, 1, -0.45, 0],
    clamp,
  );

type ShakenShotProps = {
  /** Quadros do plano em que a prancheta ganha o visto, em que o braço entra e em que vem a terceira sacudida. */
  readonly checkAt: number;
  readonly armAt: number;
  readonly thirdAt: number;
  readonly clock: number;
};

/** A pessoa na cama: uma mão a sacode pelo ombro, três vezes, e só na terceira ela abre o olho a meio. No canto, o primeiro visto da prancheta. */
const ShakenShot: React.FC<ShakenShotProps> = ({
  checkAt,
  armAt,
  thirdAt,
  clock,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const stage = useStage();
  const seconds = (clock + frame) / fps;
  const nudges = [thirdAt - 2 * NUDGE.every, thirdAt - NUDGE.every, thirdAt];
  const push = nudges.reduce((sum, at) => sum + nudgeAt(frame, at), 0);
  // Enquanto ninguém a chama, só o cobertor sobe e desce.
  const asleepBreath = 0.35 * wave(seconds, 4.6);
  // O braço desce de fora do quadro, pousa a mão no ombro dela e sai por onde veio.
  const armIn = ramp(frame, armAt, ARM.seconds * fps) * (1 - stage.leave());
  const lift = ARM.from * (1 - armIn);
  const hand: Point = [SHOULDER[0] + 10 * push, SHOULDER[1] + 4 * push + lift];
  // O cotovelo dobra um pouco para fora: o braço faz um ângulo, e não uma reta.
  const elbow: Point = [1100 + 5 * push, 318 + 2 * push + lift];
  // A manga acaba antes do pulso: o fim do braço é pele, como a mão.
  const wrist: Point = [
    mix(elbow[0], hand[0], 0.5),
    mix(elbow[1], hand[1], 0.5),
  ];

  return (
    <AbsoluteFill>
      <FlatStage backdrop={<IdeaBackdrop hue="lilac" spot={[0.46, 0.55]} />}>
        <Sooner by={BED_SOONER}>
          <Drift focus={BED_FOCUS}>
            <Cast origin={[BED.x, BED.y]}>
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  transformOrigin: `${BED.x}px ${BED.y}px`,
                  scale: `1 ${1 + 0.006 * wave(seconds, 4.6)}`,
                }}
              >
                <Bed
                  {...BED}
                  colors={personInPajamas}
                  hue="lilac"
                  // O olho abre no meio da terceira sacudida, com o corpo ainda em movimento.
                  state={frame >= thirdAt + 3 ? "sleepy" : "asleep"}
                  nudge={push + asleepBreath * (1 - armIn)}
                />
              </div>
            </Cast>
            {armIn > 0 ? (
              <SvgLayer>
                {/* Quem chama: o ombro no alto do quadro, o braço e a mão no ombro dela. Sem dono à vista. */}
                <path
                  d={`M${wrist[0]},${wrist[1]} L${hand[0]},${hand[1]}`}
                  fill="none"
                  stroke={customer.skin}
                  strokeWidth={54}
                  strokeLinecap="round"
                />
                {/* A manga no tom escuro do laranja: no claro, era a forma mais saturada do quadro. */}
                <path
                  d={taperPath(
                    [CALLER_SHOULDER[0], CALLER_SHOULDER[1] + lift],
                    elbow,
                    wrist,
                    124,
                    72,
                  )}
                  fill={customer.topShade}
                />
                <rect
                  x={CALLER.x}
                  y={CALLER.y + lift}
                  width={CALLER.width}
                  height={CALLER.height}
                  rx={CALLER.radius}
                  fill={customer.topShade}
                />
                <ellipse
                  cx={hand[0] - 6}
                  cy={hand[1] + 10}
                  rx={44}
                  ry={38}
                  fill={customer.skin}
                />
                <ellipse
                  cx={hand[0] - 36}
                  cy={hand[1] + 30}
                  rx={22}
                  ry={16}
                  fill={customer.skinShade}
                />
                {/* Os riscos do sacudir, dos dois lados do ombro: só enquanto a mão sacode. */}
                {Math.abs(push) > 0.02 ? (
                  <g
                    fill="none"
                    stroke={idea.lilac.contact}
                    strokeWidth={9}
                    strokeLinecap="round"
                    opacity={Math.min(1, Math.abs(push) * 2)}
                  >
                    <path
                      d={`M${SHOULDER[0] - 74},${SHOULDER[1] - 96} q-30,14 -34,48`}
                    />
                    <path
                      d={`M${SHOULDER[0] - 104},${SHOULDER[1] - 132} q-44,22 -50,70`}
                    />
                    <path
                      d={`M${SHOULDER[0] + 84},${SHOULDER[1] - 84} q30,14 34,46`}
                    />
                  </g>
                ) : null}
              </SvgLayer>
            ) : null}
            <Place
              x={CORNER.x}
              y={CORNER.y}
              style={{ rotate: `${-4 + 0.5 * billSway(seconds + 1)}deg` }}
            >
              <Clipboard
                scale={CORNER.scale}
                checked={[ramp(frame, checkAt, 0.3 * fps), 0]}
              />
            </Place>
          </Drift>
          {/* O bolso volta, cheio, e fica: a conta sai dele no plano seguinte, que passa a desenhá-lo. Fora da deriva, para estar no canto exato. */}
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
        </Sooner>
        <Grain />
      </FlatStage>
    </AbsoluteFill>
  );
};

export const JellyfishPlatformScene: React.FC<SceneProps> = ({
  scene,
  shots,
}) => {
  const { fps } = useVideoConfig();
  // A mão chega à plataforma e recua antes de puxá-la.
  const reachAt = Math.max(cue(scene, "primeiro"), 0.4 * fps);
  const pulledAt = Math.max(
    cue(scene, "tiraram") + 4,
    reachAt + (REACH_SECONDS + WINDUP_SECONDS) * fps,
  );
  const wakeAt = cue(scene, "acordar");
  // Sem o apoio, ela termina o pulso em que estava e para: boia sem pulsar até acordar.
  const asleep = steady(PULSES_ASLEEP);
  const still = pulseFrame(
    Math.ceil(pulseCycles(scene.from + pulledAt, fps, asleep)),
    fps,
    asleep,
  );
  const rhythm = [
    ...asleep,
    { from: still, perMinute: 0 },
    { from: scene.from + wakeAt, perMinute: PULSES_AWAKE },
  ];
  const countAt = ADRIFT_CAMERA_SECONDS * fps;
  // As três sacudidas: a terceira cai em "chama", e as outras duas vêm antes dela.
  const thirdAt = cue(scene, "chama") - shots[2].from + 2;
  return (
    <>
      <Shot range={shots[0]} name="a plataforma some de baixo dela">
        <PullShot
          rhythm={rhythm}
          reachAt={reachAt}
          pulledAt={pulledAt}
          looseAt={Math.max(cue(scene, "repente"), pulledAt + 0.5 * fps)}
          clock={scene.from}
        />
      </Shot>
      <Shot range={shots[1]} name="boiando até 5 s; depois o tranco">
        <AdriftShot
          rhythm={rhythm}
          countAt={countAt}
          fiveAt={cue(scene, "antes") - shots[1].from}
          wakeAt={wakeAt - shots[1].from}
          clock={scene.from + shots[1].from}
        />
      </Shot>
      <Shot range={shots[2]} name="você, sacudido pelo ombro">
        <ShakenShot
          // A prancheta ganha o visto depois de assentar no canto.
          checkAt={Math.max(cue(scene, "demora") - shots[2].from, 0.5 * fps)}
          armAt={Math.min(
            cue(scene, "quando") - shots[2].from,
            thirdAt - 2 * NUDGE.every - ARM.seconds * fps,
          )}
          thirdAt={thirdAt}
          clock={scene.from + shots[2].from}
        />
        {/* O tanque de `jellyfish-debt` cresce aqui, por cima da cama que encolhe: a troca de cena não deixa a
            tela só com o fundo. */}
        <Prelude lead={BILL_LEAD}>
          <JellyfishDebtOpening clock={scene.from + shots[2].to} />
        </Prelude>
      </Shot>
      {/* O puxão. */}
    </>
  );
};
