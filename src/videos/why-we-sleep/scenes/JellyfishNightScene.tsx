import "../../../design/fonts";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import {
  cameraBetween,
  framing,
  type CameraState,
  seenAt,
} from "../../../components/Camera";
import { useStage } from "../../../components/Cast";
import { Grain } from "../../../components/Grain";
import { wave } from "../../../components/Idle";
import { Place } from "../../../components/Place";
import { Pop } from "../../../components/Pop";
import { clamp01, cue, linear, mix, ramp } from "../../../components/timing";
import { typography } from "../../../design/tokens";
import type { SceneProps } from "../../../video/NarratedVideo";
import { Shot, useShotLength } from "../../../video/Shot";
import { leaveStart } from "../../../video/stage";
import { ink, jellyfish, lagoon, blend } from "../palette";
import { LAB, TANK_CENTER } from "../parts/Laboratory";
import { JELLYFISH_SPOT } from "../parts/Lagoon";
import { FISH_WATCHING, LAGOON } from "../parts/lagoonCameras";
import { LagoonShot, type FishSpot } from "../parts/LagoonShot";
import {
  PULSES_ASLEEP,
  PULSES_AWAKE,
  type PulseRhythm,
  pulseCycles,
  settledPhase,
} from "../parts/pulse";
import {
  JELLYFISH_WIDTH,
  LooseJellyfish,
  RESTING_Y,
  TankJellyfish,
  TankShot,
} from "../parts/TankShot";
import { INSIDE_END, InsideLeaving } from "./JellyfishScene";
import { NEVER, Prelude, Preluded, Standing } from "./MaybeBrainScene";

// A câmera recua de "por dentro" do sino até o plano médio da lagoa, e o índigo abre para a noite dela: o
// caminho do fim de `jellyfish`, ao contrário, com o mesmo peso.
const RECEDE_FRAMES = 20;
// Os braços caem em menos tempo que a partitura pede, para assentar meio segundo antes da troca.
const SLOW_DOWN_SECONDS = 0.9;
// Quanto os braços caem quando o ritmo cai, e quanto mais no plano de perto.
const DROOP = { slow: 0.7, close: 0.8 };
// O plano médio deriva um pouco na direção dela.
const MEDIUM_END = framing([860, 640], 1.94, [900, 560]);
const YAWN_FRAMES = 8;

type Night = {
  /** O ritmo do pulso na cena inteira, em quadros do vídeo. */
  readonly rhythm: readonly PulseRhythm[];
  /** Os pulsos a somar à contagem num quadro do vídeo; ver `JellyfishNightScene`. */
  readonly phaseAt: (videoFrame: number) => number;
};

type SlowShotProps = Night & {
  /** Quadros do plano em que ela desacelera e em que o peixe boceja. */
  readonly slowAt: number;
  readonly yawnAt: number;
  readonly clock: number;
};

/** A câmera recua de dentro do sino até a lagoa de noite, os cachos acesos em ciano; os anéis do pulso saem mais espaçados, e o peixe boceja. */
const SlowShot: React.FC<SlowShotProps> = ({
  slowAt,
  yawnAt,
  clock,
  rhythm,
  phaseAt,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const length = useShotLength();
  const slowing = ramp(frame, slowAt, SLOW_DOWN_SECONDS * fps);
  const phase = phaseAt(clock + frame);
  const receding = frame < RECEDE_FRAMES;
  const camera = cameraBetween(
    INSIDE_END,
    cameraBetween(LAGOON.medium, MEDIUM_END, frame / length),
    ramp(frame, 0, RECEDE_FRAMES),
  );

  return (
    <AbsoluteFill>
      {/* A lagoa já está de pé sob o índigo que abre: não sobe com o palco. */}
      <Standing>
        <LagoonShot
          time="night"
          camera={camera}
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
          // Enquanto a câmera recua, quem a desenha é "por dentro", por cima do índigo.
          absent={receding}
        />
      </Standing>
      {receding ? (
        <>
          <InsideLeaving
            camera={camera}
            seconds={(clock + frame) / fps}
            cycles={phase + pulseCycles(clock + frame, fps, rhythm)}
            // O índigo abre junto com o recuo e acaba um pouco antes dele, como entrou.
            left={linear(frame, 2, RECEDE_FRAMES - 5)}
          />
          <Grain />
        </>
      ) : null}
    </AbsoluteFill>
  );
};

// A interrogação fica no vazio à direita dela, acima do sino.
const QUESTION = { x: 1520, y: 300 };
const CAMERA_SECONDS = 0.7;
// O peixe dá espaço quando a câmera fecha nela, e volta para espiar: de onde, até onde, e quanto fica.
const FISH_AWAY = { x: 1470, y: 560 };
const FISH_PEEKS = { x: 1150, y: 706 };
const PEEK = { in: 0.4, out: 0.35 };

// A passagem da lagoa para o laboratório: a água-viva fica na tela, a câmera recua dela, a lagoa desce e o
// laboratório sobe em volta. Em quadros a partir da troca: quando o recuo começa e quanto dura, e quantos
// quadros antes da troca o laboratório começa a subir.
const TO_LAB = { from: -16, frames: 26, lead: 14 };
// Onde ela fica dentro do tanque, no cenário do laboratório.
const IN_TANK = [TANK_CENTER, RESTING_Y] as const;
const SPOT = [JELLYFISH_SPOT.x, JELLYFISH_SPOT.y] as const;

type Passage = {
  /** Quanto do recuo já foi feito, de 0 a 1. */
  readonly done: number;
  /** A câmera de cada cenário: as duas põem a água-viva no mesmo ponto do quadro, do mesmo tamanho. */
  readonly lagoon: CameraState;
  readonly lab: CameraState;
  /** Onde ela está no quadro, e a largura do sino. */
  readonly x: number;
  readonly y: number;
  readonly width: number;
};

/** O enquadramento do plano de perto da lagoa, depois de a câmera chegar: a aproximação lenta. */
const asleepCamera = (frame: number, length: number): CameraState =>
  cameraBetween(LAGOON.asleep, LAGOON.asleepEnd, frame / length);

/**
 * A passagem num quadro `t`, contado a partir da troca (negativo antes dela),
 * dadas as durações do plano de perto da lagoa e do plano do laboratório. A
 * câmera sai de onde a aproximação lenta da lagoa a deixou e chega ao plano
 * médio do laboratório, com peso.
 */
const toLab = (t: number, lagoonLength: number, labLength: number): Passage => {
  const before = asleepCamera(lagoonLength + TO_LAB.from, lagoonLength);
  const from = seenAt(before, SPOT);
  const done = ramp(t, TO_LAB.from, TO_LAB.frames);
  const lab = cameraBetween(
    // O laboratório visto de onde ela fica do tamanho que tinha na lagoa, no mesmo ponto do quadro.
    framing(
      IN_TANK,
      (JELLYFISH_SPOT.width * before.zoom) / JELLYFISH_WIDTH,
      from,
    ),
    cameraBetween(LAB.medium, LAB.mediumEnd, clamp01(t / labLength)),
    done,
  );
  const [x, y] = seenAt(lab, IN_TANK);
  const width = JELLYFISH_WIDTH * lab.zoom;
  return {
    done,
    lab,
    lagoon: framing(SPOT, width / JELLYFISH_SPOT.width, [x, y]),
    x,
    y,
    width,
  };
};

type SleeperProps = Night & {
  /** O centro dela no quadro e a largura do sino. */
  readonly x: number;
  readonly y: number;
  readonly width: number;
  /** Quanto ela já passou da pintura da lagoa de noite à do tanque, de 0 a 1. */
  readonly inTank: number;
  readonly clock: number;
};

/** Ela, dormindo, solta dos dois cenários durante a passagem: é o mesmo desenho antes e depois da troca. */
const Sleeper: React.FC<SleeperProps> = ({
  x,
  y,
  width,
  inTank,
  clock,
  rhythm,
  phaseAt,
}) => {
  const frame = clock + useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <LooseJellyfish
      x={x}
      y={y}
      width={width}
      colors={blend(jellyfish.night, jellyfish.day, inTank)}
      droop={DROOP.close}
      cycles={phaseAt(frame) + pulseCycles(frame, fps, rhythm)}
      seconds={frame / fps}
      // A corrente da lagoa leva os braços mais que a água parada do tanque.
      sway={mix(0.5, 0.3, inTank)}
    />
  );
};

type LabViewProps = {
  readonly camera: CameraState;
  /** Quadros do plano em que a pesquisadora ergue a prancheta e em que as duas linhas se escrevem. */
  readonly raiseAt: number;
  readonly writeAt: number;
  readonly clock: number;
  /** O que está dentro do tanque. */
  readonly children?: React.ReactNode;
};

/** O laboratório do plano 3: o tanque sobre a plataforma, e a pesquisadora, que ergue a prancheta dos dois testes. */
const LabView: React.FC<LabViewProps> = ({
  camera,
  raiseAt,
  writeAt,
  clock,
  children,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const lineFrames = 0.3 * fps;

  return (
    <TankShot
      camera={camera}
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
      {children}
    </TankShot>
  );
};

type QuestionShotProps = Night & {
  /** Quadros do plano em que a interrogação entra, em que o peixe chega perto e em que ele se afasta. */
  readonly questionAt: number;
  readonly peekAt: number;
  readonly awayAt: number;
  readonly clock: number;
  /** A duração do plano do laboratório, que começa a subir aqui. */
  readonly labLength: number;
};

/** Ela de perto, quieta no fundo, com uma interrogação: dormindo, ou só parada? O peixe vem espiar. */
const QuestionShot: React.FC<QuestionShotProps> = ({
  questionAt,
  peekAt,
  awayAt,
  clock,
  labLength,
  ...night
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const stage = useStage();
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
  // No fim, a passagem para o laboratório: a câmera recua dela, e a lagoa desce de baixo dela.
  const t = frame - length;
  const passage = toLab(t, length, labLength);
  const camera =
    t < TO_LAB.from
      ? cameraBetween(
          MEDIUM_END,
          asleepCamera(frame, length),
          ramp(frame, 0, arriving),
        )
      : passage.lagoon;
  // Quando a lagoa começa a descer, ela se solta da areia e fica: quem a desenha é a passagem, por cima.
  const afloat = frame >= leaveStart(length);
  const [x, y] = seenAt(camera, SPOT);

  return (
    <AbsoluteFill>
      <LagoonShot
        time="night"
        camera={camera}
        clock={clock}
        rhythm={night.rhythm}
        phase={night.phaseAt(clock + frame)}
        droop={mix(DROOP.slow, DROOP.close, ramp(frame, 0, arriving))}
        // Os anéis que já saíram continuam abrindo; de perto, não saem outros.
        rings
        ringsUntil={clock}
        fish={fish}
        absent={afloat}
      />
      {/* O laboratório começa a subir aqui, por cima da lagoa que desce: a troca não deixa a tela só com a água. */}
      <Prelude lead={TO_LAB.lead}>
        {(until) => (
          <LabView
            camera={toLab(-until, length, labLength).lab}
            raiseAt={NEVER}
            writeAt={NEVER}
            clock={clock + length}
          />
        )}
      </Prelude>
      {/* Depois da troca, é o plano do laboratório quem a desenha. */}
      {afloat && !stage.handedOver ? (
        <Sleeper
          {...night}
          x={x}
          y={y}
          width={JELLYFISH_SPOT.width * camera.zoom}
          inTank={passage.done}
          clock={clock}
        />
      ) : null}
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

type LabShotProps = Night & {
  /** Quadros do plano em que a pesquisadora ergue a prancheta e em que as duas linhas se escrevem. */
  readonly raiseAt: number;
  readonly writeAt: number;
  readonly clock: number;
  /** A duração do plano de perto da lagoa, de onde a câmera vem. */
  readonly before: number;
};

/** No laboratório: a câmera acaba de recuar dela, já num tanque de vidro, sobre a plataforma, e a pesquisadora ergue a prancheta dos dois testes. */
const LabShot: React.FC<LabShotProps> = ({
  raiseAt,
  writeAt,
  clock,
  before,
  ...night
}) => {
  const frame = useCurrentFrame();
  const length = useShotLength();
  const passage = toLab(frame, before, length);
  // Enquanto o laboratório sobe, ela não sobe com ele: fica por cima, onde a câmera a vê. Depois, é do tanque.
  const arriving = frame < TO_LAB.from + TO_LAB.frames + 2;

  return (
    <AbsoluteFill>
      <LabView
        camera={passage.lab}
        raiseAt={raiseAt}
        writeAt={writeAt}
        clock={clock}
      >
        {arriving ? null : (
          <TankJellyfish
            droop={DROOP.close}
            rhythm={night.rhythm}
            phase={night.phaseAt(clock + frame)}
            clock={clock}
          />
        )}
      </LabView>
      {arriving ? (
        <Sleeper
          {...night}
          x={passage.x}
          y={passage.y}
          width={passage.width}
          inTank={passage.done}
          clock={clock}
        />
      ) : null}
    </AbsoluteFill>
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
  // A cena abre no ponto do pulso em que `jellyfish` a deixou e termina na contagem de quem dorme desde o
  // quadro 0, que é a das cenas do tanque: a diferença entre as duas, menos de meio pulso, é somada aos
  // poucos ao longo da cena, e o sino não salta em nenhuma das duas trocas.
  const settled = settledPhase(fps, rhythm);
  const offset = settled - Math.round(settled);
  const night: Night = {
    rhythm,
    phaseAt: (videoFrame) =>
      offset * clamp01((videoFrame - scene.from) / shots[2].to),
  };
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
          labLength={shots[2].to - shots[2].from}
        />
      </Shot>
      <Shot range={shots[2]} name="no laboratório, a prancheta dos dois testes">
        <Preluded lead={TO_LAB.lead}>
          <LabShot
            {...night}
            raiseAt={cue(scene, "pesquisadores") - shots[2].from}
            writeAt={cue(scene, "dois") - shots[2].from}
            clock={scene.from + shots[2].from}
            before={shots[1].to - shots[1].from}
          />
        </Preluded>
      </Shot>
    </>
  );
};
