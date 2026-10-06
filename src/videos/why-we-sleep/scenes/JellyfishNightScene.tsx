import "../../../design/fonts";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { cameraBetween, framing } from "../../../components/Camera";
import { Grain } from "../../../components/Grain";
import { wave } from "../../../components/Idle";
import { Place } from "../../../components/Place";
import { Pop } from "../../../components/Pop";
import { cue, mix, ramp } from "../../../components/timing";
import { typography } from "../../../design/tokens";
import type { SceneProps } from "../../../video/NarratedVideo";
import { Shot, type Wipe, useShotLength } from "../../../video/Shot";
import { ink, lagoon } from "../palette";
import { LAB, TANK_CENTER } from "../parts/Laboratory";
import { FISH_WATCHING, LAGOON } from "../parts/lagoonCameras";
import { LagoonShot, type FishSpot } from "../parts/LagoonShot";
import {
  PULSES_ASLEEP,
  PULSES_AWAKE,
  type PulseRhythm,
  settledPhase,
  steady,
} from "../parts/pulse";
import { TankJellyfish, TankShot } from "../parts/TankShot";
import { InsideAtEnd } from "./JellyfishScene";
import { Standing } from "./MaybeBrainScene";
import { Sweep } from "./NightFallsScene";

// A noite desce sobre "por dentro", o último quadro da cena anterior: é a varredura deste plano.
const NIGHTFALL: Wipe = { frames: 8, from: "top" };
// Os braços caem em menos tempo que a partitura pede, para assentar meio segundo antes da troca.
const SLOW_DOWN_SECONDS = 0.9;
// Quanto os braços caem quando o ritmo cai, e quanto mais no plano de perto.
const DROOP = { slow: 0.7, close: 0.8 };
// O plano médio deriva um pouco na direção dela.
const MEDIUM_END = framing([860, 640], 1.94, [900, 560]);
const YAWN_FRAMES = 8;

type Night = {
  /** O ritmo do pulso na cena inteira, em quadros do vídeo, e os pulsos a somar para ele terminar na contagem de quem dorme. */
  readonly rhythm: readonly PulseRhythm[];
  readonly phase: number;
};

type SlowShotProps = Night & {
  /** Quadros do plano em que ela desacelera e em que o peixe boceja. */
  readonly slowAt: number;
  readonly yawnAt: number;
  readonly clock: number;
};

/** A noite desce, os cachos acendem em ciano, e os anéis do pulso saem mais espaçados; o peixe boceja. */
const SlowShot: React.FC<SlowShotProps> = ({
  slowAt,
  yawnAt,
  clock,
  rhythm,
  phase,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const length = useShotLength();
  const slowing = ramp(frame, slowAt, SLOW_DOWN_SECONDS * fps);

  return (
    <Sweep
      wipe={NIGHTFALL}
      under={
        <AbsoluteFill>
          <InsideAtEnd seconds={(clock + frame) / fps} fps={fps} />
          <Grain />
        </AbsoluteFill>
      }
    >
      {/* A lagoa já está de pé sob a borda que desce: não sobe com o palco. */}
      <Standing>
        <LagoonShot
          time="night"
          camera={cameraBetween(LAGOON.medium, MEDIUM_END, frame / length)}
          clock={clock}
          rhythm={rhythm}
          phase={phase}
          droop={DROOP.slow * slowing}
          rings
          fish={{
            ...FISH_WATCHING,
            look: [-0.3 - 0.3 * slowing, 0.6],
            yawn: ramp(frame, yawnAt, YAWN_FRAMES),
          }}
        />
      </Standing>
    </Sweep>
  );
};

// A interrogação fica no vazio à direita dela, acima do sino.
const QUESTION = { x: 1520, y: 300 };
const CAMERA_SECONDS = 0.7;
// O peixe dá espaço quando a câmera fecha nela, e volta para espiar: de onde, até onde, e quanto fica.
const FISH_AWAY = { x: 1470, y: 560 };
const FISH_PEEKS = { x: 1150, y: 706 };
const PEEK = { in: 0.4, out: 0.35 };

type QuestionShotProps = Night & {
  /** Quadros do plano em que a interrogação entra, em que o peixe chega perto e em que ele se afasta. */
  readonly questionAt: number;
  readonly peekAt: number;
  readonly awayAt: number;
  readonly clock: number;
};

/** Ela de perto, quieta no fundo, com uma interrogação: dormindo, ou só parada? O peixe vem espiar. */
const QuestionShot: React.FC<QuestionShotProps> = ({
  questionAt,
  peekAt,
  awayAt,
  clock,
  rhythm,
  phase,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const length = useShotLength();
  const seconds = (clock + frame) / fps;
  const arriving = CAMERA_SECONDS * fps;
  // O bocejo do plano anterior termina; ele se afasta enquanto a câmera fecha, volta para espiar e vai embora.
  const leaving = ramp(frame, 4, arriving);
  const peeking =
    ramp(frame, peekAt, PEEK.in * fps) - ramp(frame, awayAt, PEEK.out * fps);
  const fish: FishSpot = {
    x: mix(mix(FISH_WATCHING.x, FISH_AWAY.x, leaving), FISH_PEEKS.x, peeking),
    y: mix(mix(FISH_WATCHING.y, FISH_AWAY.y, leaving), FISH_PEEKS.y, peeking),
    width: FISH_WATCHING.width,
    yawn: 1 - ramp(frame, 0, 10),
    // Ele recua de frente para ela, sem virar: a cauda só bate depressa quando vem espiar.
    swimming: frame >= peekAt && frame < peekAt + PEEK.in * fps,
    look: [-0.9, 0.2 - 0.5 * peeking],
    tilt: -6 * peeking * (frame < awayAt ? 1 : 0),
  };

  return (
    <AbsoluteFill>
      <LagoonShot
        time="night"
        camera={cameraBetween(
          MEDIUM_END,
          cameraBetween(LAGOON.asleep, LAGOON.asleepEnd, frame / length),
          ramp(frame, 0, arriving),
        )}
        clock={clock}
        rhythm={rhythm}
        phase={phase}
        droop={mix(DROOP.slow, DROOP.close, ramp(frame, 0, arriving))}
        // Os anéis que já saíram continuam abrindo; de perto, não saem outros.
        rings
        ringsUntil={clock}
        fish={fish}
      />
      <Place
        x={QUESTION.x}
        y={QUESTION.y}
        style={{ rotate: `${10 + 5 * wave(seconds, 2.2)}deg` }}
      >
        <Pop at={questionAt} from={0.4} overshoot={1.2}>
          <div
            style={{
              fontFamily: typography.family,
              fontWeight: typography.weight,
              fontSize: typography.size.display * 2.6,
              lineHeight: 1,
              color: ink.moon,
              WebkitTextStroke: `22px ${lagoon.night.vignette}`,
              paintOrder: "stroke fill",
            }}
          >
            ?
          </div>
        </Pop>
      </Place>
    </AbsoluteFill>
  );
};

type LabShotProps = {
  /** Quadros do plano em que a pesquisadora ergue a prancheta e em que as duas linhas se escrevem. */
  readonly raiseAt: number;
  readonly writeAt: number;
  readonly clock: number;
};

/** No laboratório: ela num tanque de vidro, sobre a plataforma, e a pesquisadora ergue a prancheta dos dois testes. */
const LabShot: React.FC<LabShotProps> = ({ raiseAt, writeAt, clock }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const length = useShotLength();
  const lineFrames = 0.3 * fps;

  return (
    <TankShot
      camera={cameraBetween(LAB.medium, LAB.mediumEnd, frame / length)}
      researcher={[0, 0]}
      board={{
        raised: ramp(frame, raiseAt, 0.5 * fps),
        written: [
          ramp(frame, writeAt, lineFrames),
          ramp(frame, writeAt + lineFrames, lineFrames),
        ],
      }}
      platform={TANK_CENTER}
      clock={clock}
    >
      <TankJellyfish
        droop={DROOP.close}
        rhythm={steady(PULSES_ASLEEP)}
        clock={clock}
      />
    </TankShot>
  );
};

export const JellyfishNightScene: React.FC<SceneProps> = ({ scene, shots }) => {
  const { fps } = useVideoConfig();
  const slowAt = cue(scene, "pulsa");
  // O ritmo da cena, no relógio do vídeo: acordada até a deixa, e dali em diante a 39 por minuto.
  const rhythm = [
    { from: 0, perMinute: PULSES_AWAKE },
    { from: scene.from + slowAt, perMinute: PULSES_ASLEEP },
  ];
  const night = { rhythm, phase: settledPhase(fps, rhythm) };
  const awayAt = cue(scene, "parada") - shots[1].from + 0.2 * fps;
  return (
    <>
      <Shot range={shots[0]} name="de noite ela pulsa mais devagar">
        <SlowShot
          {...night}
          slowAt={slowAt}
          yawnAt={cue(scene, "devagar")}
          clock={scene.from}
        />
      </Shot>
      <Shot range={shots[1]} name="dormindo, ou só parada?">
        <QuestionShot
          {...night}
          // A interrogação espera a câmera assentar.
          questionAt={Math.max(
            cue(scene, "prova") - shots[1].from,
            CAMERA_SECONDS * fps,
          )}
          // O peixe sai meio segundo antes da troca, com folga para a saída.
          peekAt={
            Math.min(cue(scene, "estar"), shots[1].to - 1.5 * fps) -
            shots[1].from
          }
          awayAt={Math.min(awayAt, shots[1].to - shots[1].from - 0.9 * fps)}
          clock={scene.from + shots[1].from}
        />
      </Shot>
      <Shot range={shots[2]} name="no laboratório, a prancheta dos dois testes">
        <LabShot
          raiseAt={cue(scene, "pesquisadores") - shots[2].from}
          writeAt={cue(scene, "dois") - shots[2].from}
          clock={scene.from + shots[2].from}
        />
      </Shot>
    </>
  );
};
