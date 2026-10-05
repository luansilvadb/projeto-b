import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { Stopwatch } from "../../../art/Stopwatch";
import { taperPath, type Point } from "../../../art/shapes";
import { cameraBetween, framing } from "../../../components/Camera";
import { Grain } from "../../../components/Grain";
import { wave } from "../../../components/Idle";
import { Place } from "../../../components/Place";
import { Pop } from "../../../components/Pop";
import { SlowPush } from "../../../components/SlowPush";
import { SvgLayer } from "../../../components/SvgLayer";
import { cue, linear, mix, ramp, settle } from "../../../components/timing";
import type { SceneProps } from "../../../video/NarratedVideo";
import { Shot } from "../../../video/Shot";
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
import { PULSES_ASLEEP, PULSES_AWAKE, steady } from "../parts/pulse";
import { BillPocket, POCKET_CORNER } from "../parts/SleepBill";
import {
  FLOATING_Y,
  FLOOR_Y,
  RESTING_Y,
  TankJellyfish,
  TankShot,
  floating,
} from "../parts/TankShot";

// O tanque enche o quadro, e a pesquisadora, de mãos na prancheta, fica de fora: quem puxa é outra mão.
const ON_TANK = framing([1300, 545], 1.7);
// De perto, dentro do vidro: cabe ela boiando no alto e o chão do tanque, para onde ela desce.
const IN_TANK = framing([TANK_CENTER, 530], 2);
const CAMERA_SECONDS = 0.5;
const PULL_SECONDS = 0.5;
const DRIFT_SECONDS = 1;
// A luva vem de cima, pela boca do tanque, e segura a ponta esquerda da plataforma.
const GLOVE_FROM = { x: 880, y: 90 };
const PLATFORM_HALF = 210;
// A plataforma sai pela esquerda, por trás do vidro.
const PULL = -900;

type PullShotProps = {
  /** Quadro do plano em que a plataforma é puxada. */
  readonly pulledAt: number;
};

/** No tanque, a mão de luva segura a plataforma e a tira de uma vez de baixo dela. */
const PullShot: React.FC<PullShotProps> = ({ pulledAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const seconds = frame / fps;
  const arrived = CAMERA_SECONDS * fps;
  // A mão chega à plataforma antes do puxão, e avisa: recua um pouco.
  const reach = ramp(frame, arrived, 0.6 * fps);
  const windup = ramp(frame, pulledAt - 0.3 * fps, 0.3 * fps);
  const pull = PULL * settle(frame, pulledAt, PULL_SECONDS * fps);
  const platformX = TANK_CENTER + 30 * windup + pull;
  const drift = ramp(frame, pulledAt + 6, DRIFT_SECONDS * fps);
  const adrift = floating(seconds);
  const handle: Point = [platformX - PLATFORM_HALF + 24, PLATFORM_Y + 8];

  return (
    <TankShot
      camera={cameraBetween(LAB.mediumEnd, ON_TANK, ramp(frame, 0, arrived))}
      researcher={[0, 0]}
      platform={platformX}
    >
      <TankJellyfish
        y={mix(RESTING_Y, FLOATING_Y, drift) + adrift.y * drift}
        tilt={(-10 + adrift.tilt) * drift}
        droop={0.8 + 0.2 * drift}
        rhythm={steady(PULSES_ASLEEP)}
      />
      {reach > 0 ? (
        <SvgLayer>
          <Glove
            from={[GLOVE_FROM.x + pull * 0.5, GLOVE_FROM.y]}
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
// O tranco: os braços abrem de uma vez; nadar até o fundo leva mais.
const OPEN_SECONDS = 0.3;
const SWIM_SECONDS = 0.9;

type AdriftShotProps = {
  /** Quadros do plano em que o cronômetro chega a "5 s" e em que ela acorda. */
  readonly fiveAt: number;
  readonly wakeAt: number;
};

/** De perto, ela boia parada enquanto o cronômetro corre até "5 s"; então dá um tranco, se vira e desce. */
const AdriftShot: React.FC<AdriftShotProps> = ({ fiveAt, wakeAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const seconds = frame / fps;
  const counted = Math.floor(SECONDS_LIMIT * linear(frame, 8, fiveAt - 8));
  const open = settle(frame, wakeAt, OPEN_SECONDS * fps);
  const swim = ramp(frame, wakeAt + OPEN_SECONDS * fps, SWIM_SECONDS * fps);
  const adrift = floating(seconds);

  return (
    <AbsoluteFill>
      <TankShot
        camera={cameraBetween(
          ON_TANK,
          IN_TANK,
          ramp(frame, 0, CAMERA_SECONDS * fps),
        )}
      >
        <TankJellyfish
          y={mix(FLOATING_Y + adrift.y, FLOOR_Y, swim)}
          tilt={(-10 + adrift.tilt) * (1 - open)}
          droop={1 - open}
          rhythm={[
            { from: 0, perMinute: PULSES_ASLEEP },
            { from: wakeAt, perMinute: PULSES_AWAKE },
          ]}
        />
      </TankShot>
      <Place x={WATCH.x} y={WATCH.y} style={{ rotate: "6deg" }}>
        <Pop at={4}>
          <Stopwatch
            width={WATCH.width}
            colors={counted >= SECONDS_LIMIT ? stopwatchAlarm : stopwatch}
            reading={`${counted} s`}
          />
        </Pop>
      </Place>
    </AbsoluteFill>
  );
};

// A cama no chão do plano, de cabeça para a esquerda: é a peça de quem dorme no vídeo inteiro.
const BED = { x: 905, y: 930, scale: 1 };
// O ombro de cima, que a mão sacode, e de onde o braço vem.
const SHOULDER_SPOT = bedShoulder(BED);
const SHOULDER: Point = [SHOULDER_SPOT.x, SHOULDER_SPOT.y];
// Quem chama está ao lado da cama, quase todo fora do quadro: do alto entra um pedaço do ombro dele, e dali o
// braço desce curto, em diagonal, até o ombro dela. Vindo reto da borda, comprido e fino, o braço lia como um cano.
const CALLER = { x: 1090, y: -260, width: 450, height: 400, radius: 130 };
const CALLER_SHOULDER: Point = [1190, 60];
// A prancheta fica no canto de cima à esquerda: o da direita é do bolso da conta.
const CORNER = { x: 430, y: 230, scale: 0.7 };

type ShakenShotProps = {
  /** Quadros do plano em que ela abre o olho e em que a prancheta ganha o visto. */
  readonly openAt: number;
  readonly checkAt: number;
};

/** A pessoa na cama: uma mão a sacode pelo ombro e ela demora a abrir o olho. No canto, o primeiro visto da prancheta. */
const ShakenShot: React.FC<ShakenShotProps> = ({ openAt, checkAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const seconds = frame / fps;
  // A mão sacode sem parar; ela só responde no fim.
  const shake = wave(seconds, 0.32);
  const hand: Point = [SHOULDER[0] + 10 * shake, SHOULDER[1] + 4 * shake];
  // O cotovelo dobra um pouco para fora: o braço faz um ângulo, e não uma reta.
  const elbow: Point = [1100 + 5 * shake, 318 + 2 * shake];
  // A manga acaba antes do pulso: o fim do braço é pele, como a mão.
  const wrist: Point = [
    mix(elbow[0], hand[0], 0.5),
    mix(elbow[1], hand[1], 0.5),
  ];

  return (
    <SlowPush
      focus={[860, 620]}
      backdrop={<IdeaBackdrop hue="lilac" spot={[0.46, 0.55]} />}
    >
      <Bed
        {...BED}
        colors={personInPajamas}
        hue="lilac"
        state={frame >= openAt ? "sleepy" : "asleep"}
        nudge={shake}
      />
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
          d={taperPath(CALLER_SHOULDER, elbow, wrist, 124, 72)}
          fill={customer.topShade}
        />
        <rect
          x={CALLER.x}
          y={CALLER.y}
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
        {/* Os riscos do sacudir, dos dois lados do ombro. */}
        <g
          fill="none"
          stroke={idea.lilac.contact}
          strokeWidth={9}
          strokeLinecap="round"
          opacity={0.5 + 0.5 * Math.abs(shake)}
        >
          <path d={`M${SHOULDER[0] - 74},${SHOULDER[1] - 96} q-30,14 -34,48`} />
          <path
            d={`M${SHOULDER[0] - 104},${SHOULDER[1] - 132} q-44,22 -50,70`}
          />
          <path d={`M${SHOULDER[0] + 84},${SHOULDER[1] - 84} q30,14 34,46`} />
        </g>
      </SvgLayer>
      <Place x={CORNER.x} y={CORNER.y} style={{ rotate: "-4deg" }}>
        <Clipboard
          scale={CORNER.scale}
          checked={[ramp(frame, checkAt, 0.3 * fps), 0]}
        />
      </Place>
      {/* O bolso volta, cheio: a conta sai dele no plano seguinte. */}
      <Place x={POCKET_CORNER.x} y={POCKET_CORNER.y}>
        <Pop at={0.3 * fps}>
          <BillPocket scale={POCKET_CORNER.scale} />
        </Pop>
      </Place>
      <Grain />
    </SlowPush>
  );
};

export const JellyfishPlatformScene: React.FC<SceneProps> = ({
  scene,
  shots,
}) => {
  const { fps } = useVideoConfig();
  return (
    <>
      <Shot range={shots[0]} name="a plataforma some de baixo dela">
        <PullShot
          // A mão precisa chegar à plataforma antes de puxá-la.
          pulledAt={Math.max(1.3 * fps, cue(scene, "plataforma"))}
        />
      </Shot>
      <Shot range={shots[1]} name="boiando até 5 s; depois o tranco">
        <AdriftShot
          fiveAt={cue(scene, "segundos") - shots[1].from}
          wakeAt={cue(scene, "acordar") - shots[1].from}
        />
      </Shot>
      <Shot range={shots[2]} name="você, sacudido pelo ombro">
        <ShakenShot
          openAt={cue(scene, "chama") - shots[2].from}
          checkAt={cue(scene, "dorme") - shots[2].from}
        />
      </Shot>
    </>
  );
};
