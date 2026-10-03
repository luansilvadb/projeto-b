import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { Person } from "../../../art/Person";
import { Silhouette } from "../../../art/Silhouettes";
import { Stopwatch } from "../../../art/Stopwatch";
import {
  Camera,
  Layer,
  cameraBetween,
  framing,
} from "../../../components/Camera";
import { Grain } from "../../../components/Grain";
import { blink, breath, wave } from "../../../components/Idle";
import { Label } from "../../../components/Label";
import { Place } from "../../../components/Place";
import { POP_SECONDS, Pop, popScale } from "../../../components/Pop";
import { SvgLayer } from "../../../components/SvgLayer";
import type { SceneProps } from "../../../video/NarratedVideo";
import { Shot, type Wipe } from "../../../video/Shot";
import {
  crowd,
  idea,
  ink,
  person,
  personInPajamas,
  stopwatch,
  stopwatchAlarm,
} from "../palette";
import { Book, HUGGING, Mug, Pillow } from "../parts/Belongings";
import { IdeaBackdrop, IdeaShadow } from "../parts/IdeaBackdrop";
import { LabWall } from "../parts/Laboratory";
import { LAGOON } from "../parts/lagoonCameras";
import { LagoonShot } from "../parts/LagoonShot";
import { PULSES_ASLEEP, cue, mix, ramp, steady } from "../parts/timing";

/** Fração do dia que uma pessoa passa dormindo: cerca de um terço. As barras de 24 horas das outras cenas usam o mesmo valor. */
export const HUMAN_SLEEP = 1 / 3;

// O cronômetro enche o quadro; no fim, a câmera entra no visor até o coral cobrir tudo.
const WATCH = { x: 960, y: 550, width: 800 };
const WATCH_CAMERA = {
  full: framing([WATCH.x, WATCH.y], 1, [WATCH.x, WATCH.y]),
  fullEnd: framing([WATCH.x, WATCH.y], 1.05, [WATCH.x, WATCH.y]),
  display: framing([WATCH.x, WATCH.y], 4.5, [WATCH.x, WATCH.y]),
};
const DIVE_SECONDS = 0.4;
// O visor pisca duas vezes em "cinco segundos": aviso insistente.
const FLASH_FRAMES = 5;
const FLASHES = 4;
// O coral do visor drena de cima para baixo e revela a lagoa.
const DRAIN: Wipe = { frames: 12, from: "top" };

type WatchShotProps = {
  /** Quadro do plano em que o visor passa ao coral: os cinco segundos viram o problema. */
  readonly alarmAt: number;
  /** Quadro do plano em que o visor começa a piscar. */
  readonly flashAt: number;
  /** Quadro do plano em que a câmera entra no visor. */
  readonly diveAt: number;
};

/** O cronômetro enche o quadro, parado em cinco segundos. */
const WatchShot: React.FC<WatchShotProps> = ({ alarmAt, flashAt, diveAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const flashing =
    frame >= flashAt && frame < flashAt + FLASH_FRAMES * FLASHES
      ? Math.floor((frame - flashAt) / FLASH_FRAMES) % 2 === 1
      : false;
  const alarmed = frame >= alarmAt && !flashing;
  // O susto do alarme: o corpo dá um pulo pequeno.
  const jolt = popScale(frame, alarmAt, POP_SECONDS * fps, 1, 1.04);
  const camera =
    frame < diveAt
      ? cameraBetween(WATCH_CAMERA.full, WATCH_CAMERA.fullEnd, frame / diveAt)
      : cameraBetween(
          WATCH_CAMERA.fullEnd,
          WATCH_CAMERA.display,
          ramp(frame, diveAt, DIVE_SECONDS * fps),
        );

  return (
    <AbsoluteFill>
      <Camera {...camera}>
        <Layer depth={1}>
          <LabWall />
          <Place x={WATCH.x} y={WATCH.y} style={{ scale: `${jolt}` }}>
            <Stopwatch
              width={WATCH.width}
              colors={alarmed ? stopwatchAlarm : stopwatch}
              reading="5,0 s"
            />
          </Place>
        </Layer>
      </Camera>
      <Grain />
    </AbsoluteFill>
  );
};

// O peixe dorme no canto da lagoa; a sombra cresce atrás dele.
const SLEEPING_FISH = { x: 1500, y: 706, width: 110 };
const PREDATOR = { x: 1700, y: 430, width: 800 };
const LOOM_SECONDS = 1.3;
const NOOK_END = framing([1640, 620], 2.06, [1060, 560]);

type PredatorShotProps = {
  /** Quadro do plano em que a sombra começa a crescer. */
  readonly loomAt: number;
  /** Quadro do plano em que o peixe abre um olho, e em que se assusta. */
  readonly noticeAt: number;
  readonly scareAt: number;
};

/** O peixe dorme em primeiro plano; a sombra cresce atrás dele, e só então ele abre um olho. */
const PredatorShot: React.FC<PredatorShotProps> = ({
  loomAt,
  noticeAt,
  scareAt,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const loom = ramp(frame, loomAt, LOOM_SECONDS * fps);
  const noticing = frame >= noticeAt;
  const scared = frame >= scareAt;

  return (
    <LagoonShot
      time="night"
      camera={cameraBetween(LAGOON.nook, NOOK_END, frame / durationInFrames)}
      rhythm={steady(PULSES_ASLEEP)}
      droop={0.8}
      fish={{
        ...SLEEPING_FISH,
        mood: scared ? "scared" : noticing ? "curious" : "asleep",
        // Primeiro só um olho entreaberto; o susto vem depois.
        lid: scared ? 0 : mix(1, 0.5, ramp(frame, noticeAt, 0.3 * fps)),
        look: [0.9, -0.4],
        tilt: scared ? 0 : 8,
      }}
    >
      {/* A sombra vem por trás de quem dorme. */}
      <Place
        x={PREDATOR.x}
        y={PREDATOR.y + 8 * wave(frame / fps, 1.8)}
        style={{
          opacity: 0.7 * loom,
          scale: `${mix(0.4, 1, loom)}`,
          filter: "blur(4px)",
        }}
      >
        <Silhouette
          kind="predator"
          width={PREDATOR.width}
          color={crowd.predator}
        />
      </Place>
    </LagoonShot>
  );
};

/** O terço da vida: a mesma pessoa três vezes, e uma das três dorme. */
const THIRDS = { x: [520, 960, 1400], y: 930, height: 600, tile: 400 };
const ENTER_STAGGER_SECONDS = 0.2;
const THIRDS_CAMERA = {
  first: framing([THIRDS.x[0], 660], 1.35, [760, 600]),
  all: framing([960, 540], 1),
};
const RECEDE_SECONDS = 0.8;

type ThirdShotProps = {
  /** Quadro do plano em que a primeira pessoa entra. */
  readonly peopleAt: number;
  /** Quadro do plano em que o terço de quem dorme é marcado. */
  readonly thirdAt: number;
};

const ThirdShot: React.FC<ThirdShotProps> = ({ peopleAt, thirdAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const seconds = frame / fps;
  const scale = THIRDS.height / 650;
  const sleeperTop = THIRDS.y - 628 * scale;
  const enterAt = (index: number) =>
    peopleAt + index * ENTER_STAGGER_SECONDS * fps;
  const marked = ramp(frame, thirdAt, POP_SECONDS * fps);

  return (
    <AbsoluteFill>
      <IdeaBackdrop hue="peach" spot={[0.5, 0.45]} />
      {/* A câmera começa na primeira pessoa e recua conforme as outras entram na fila. */}
      <Camera
        {...cameraBetween(
          THIRDS_CAMERA.first,
          THIRDS_CAMERA.all,
          ramp(frame, enterAt(1), RECEDE_SECONDS * fps),
        )}
      >
        <Layer depth={1}>
          <SvgLayer>
            {/* O chão em três partes iguais: a parte de quem dorme leva a cor de acento. */}
            {THIRDS.x.map((x, index) => (
              <rect
                key={x}
                x={x - THIRDS.tile / 2}
                y={THIRDS.y - 10}
                width={THIRDS.tile}
                height={44}
                rx={22}
                fill={index === 2 && marked > 0.5 ? ink.tag : idea.peach.spot}
                opacity={index === 2 && marked > 0.5 ? 1 : 0.85}
              />
            ))}
            {THIRDS.x.map((x) => (
              <IdeaShadow
                key={x}
                hue="peach"
                x={x}
                y={THIRDS.y + 8}
                width={260}
              />
            ))}
            {frame >= enterAt(2) + 6 ? (
              <g
                transform={`translate(0 ${-6 * Math.abs(wave(seconds, 2.4))})`}
                opacity={0.5 + 0.5 * Math.abs(wave(seconds, 2.4))}
              >
                <path
                  d={`M${THIRDS.x[2]},${sleeperTop - 96} L${THIRDS.x[2]},${sleeperTop - 22}`}
                  stroke={ink.dark}
                  strokeWidth={5}
                  strokeLinecap="round"
                />
                <circle
                  cx={THIRDS.x[2]}
                  cy={sleeperTop - 18}
                  r={9}
                  fill={ink.dark}
                />
              </g>
            ) : null}
          </SvgLayer>

          <Place
            x={THIRDS.x[0]}
            y={THIRDS.y}
            anchor="bottom"
            style={{ scale: `1 ${breath(seconds, "coffee")}` }}
          >
            <Pop at={enterAt(0)} origin="bottom">
              <Person
                height={THIRDS.height}
                colors={person}
                blink={blink(seconds, "coffee")}
                frontArm={{ hand: [-150, -310], bend: 24 }}
                held={<Mug seconds={seconds} />}
              />
            </Pop>
          </Place>
          <Place
            x={THIRDS.x[1]}
            y={THIRDS.y}
            anchor="bottom"
            style={{ scale: `1 ${breath(seconds, "reader")}` }}
          >
            <Pop at={enterAt(1)} origin="bottom">
              <Person
                height={THIRDS.height}
                colors={person}
                expression="reading"
                blink={blink(seconds, "reader")}
                frontArm={{ hand: [-78, -262], bend: 44 }}
                backArm={{ hand: [84, -262], bend: 44 }}
                held={<Book />}
              />
            </Pop>
          </Place>
          <Place
            x={THIRDS.x[2]}
            y={THIRDS.y}
            anchor="bottom"
            style={{
              // Quem dorme respira mais fundo e devagar.
              scale: `1 ${breath(seconds, "sleeper", { amplitude: 0.02, period: 5 })}`,
            }}
          >
            <Pop at={enterAt(2)} origin="bottom">
              <Person
                height={THIRDS.height}
                colors={personInPajamas}
                expression="asleep"
                {...HUGGING}
                held={<Pillow />}
              />
            </Pop>
          </Place>
          <Place x={THIRDS.x[2]} y={sleeperTop - 140}>
            <Pop at={thirdAt}>
              <Label size="note" color={ink.dark} tag={ink.tag}>
                1/3 da vida
              </Label>
            </Pop>
          </Place>
        </Layer>
      </Camera>
      <Grain />
    </AbsoluteFill>
  );
};

export const SleepCostScene: React.FC<SceneProps> = ({ scene, shots }) => {
  const watchFrames = shots[0].to - shots[0].from;
  const { fps } = useVideoConfig();
  return (
    <>
      <Shot range={shots[0]} name="cinco segundos" hold={DRAIN.frames}>
        <WatchShot
          alarmAt={cue(scene, "problema")}
          flashAt={cue(scene, "cinco")}
          diveAt={watchFrames - DIVE_SECONDS * fps}
        />
      </Shot>
      <Shot range={shots[1]} name="o predador chega" wipe={DRAIN}>
        <PredatorShot
          loomAt={cue(scene, "dormindo") - shots[1].from}
          noticeAt={cue(scene, "notar") - shots[1].from}
          scareAt={cue(scene, "perigo") - shots[1].from}
        />
      </Shot>
      <Shot range={shots[2]} name="um terço da vida">
        <ThirdShot
          peopleAt={cue(scene, "Você") - shots[2].from}
          thirdAt={cue(scene, "terço") - shots[2].from}
        />
      </Shot>
    </>
  );
};
