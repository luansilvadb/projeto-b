import {
  AbsoluteFill,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Cassiopea } from "../../../art/Cassiopea";
import { Person } from "../../../art/Person";
import { Silhouette, type SilhouetteKind } from "../../../art/Silhouettes";
import { Stopwatch } from "../../../art/Stopwatch";
import { Grain } from "../../../components/Grain";
import { blink, breath, phaseOf, wave } from "../../../components/Idle";
import { Place } from "../../../components/Place";
import { Pop } from "../../../components/Pop";
import { SlowPush } from "../../../components/SlowPush";
import { SvgLayer } from "../../../components/SvgLayer";
import { HEIGHT, WIDTH } from "../../../format";
import type { SceneProps } from "../../../video/NarratedVideo";
import { Shot } from "../../../video/Shot";
import { crowd, ink, jellyfish, lagoon, person, stopwatch } from "../palette";
import { IdeaBackdrop, IdeaShadow } from "../parts/IdeaBackdrop";
import { TANK_CENTER } from "../parts/Laboratory";
import {
  SLEEP_SIGNS,
  Seal,
  SignPanel,
  type SleepSign,
} from "../parts/SleepSigns";
import {
  PULSES_ASLEEP,
  cue,
  mix,
  pulseShape,
  ramp,
  settle,
} from "../parts/timing";
import { FiveSecondsScene, SETTLED_SECONDS } from "./FiveSecondsScene";
import { floating } from "./FloorTestScene";

const PANEL = { width: 480, height: 560, y: 550 };
const PANEL_X = [370, 960, 1550];
const LIGHT_UP_SECONDS = 0.3;
// O laboratório encolhe até caber no painel do meio, com o tanque no centro dele.
const SHRINK_SECONDS = 0.35;
const LAB_FOCUS = { x: TANK_CENTER, y: 600 };
const LAB_SCALE = PANEL.height / HEIGHT;

type PanelSceneProps = {
  readonly sign: SleepSign;
};

/** A cena de cada sinal, dentro do painel dele: a mesma água-viva em três situações, viva. */
const PanelScene: React.FC<PanelSceneProps> = ({ sign }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const seconds = frame / fps;
  const pulse = pulseShape((seconds * PULSES_ASLEEP) / 60);
  const sway = 0.5 * wave(seconds, 4, phaseOf(sign));

  switch (sign) {
    // De noite, parada no fundo, com os cachos acesos.
    case "quiet":
      return (
        <>
          <div
            style={{
              position: "absolute",
              inset: "440px 0 0 0",
              background: lagoon.night.sand[1],
            }}
          />
          <Place x={240} y={400}>
            <Cassiopea
              width={260}
              colors={jellyfish.night}
              droop={0.8}
              pulse={pulse}
              sway={sway}
            />
          </Place>
        </>
      );
    // Sem apoio, boiando, com o cronômetro parado em cinco.
    case "slow":
      return (
        <>
          <Place
            x={270}
            y={350 + floating(seconds).y}
            style={{ rotate: `${-10 + floating(seconds).tilt}deg` }}
          >
            <Cassiopea
              width={240}
              colors={jellyfish.day}
              droop={1}
              pulse={pulse}
              sway={sway}
            />
          </Place>
          <Place x={112} y={128}>
            <Stopwatch width={120} colors={stopwatch} reading="5,0 s" />
          </Place>
        </>
      );
    // De dia, quando devia estar acordada, dormindo.
    case "rebound":
      return (
        <>
          <div
            style={{
              position: "absolute",
              inset: "440px 0 0 0",
              background: lagoon.day.sand[1],
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: `radial-gradient(circle 260px at 16% 0%, ${ink.ring}D9, transparent)`,
            }}
          />
          <Place x={240} y={400}>
            <Cassiopea
              width={260}
              colors={jellyfish.day}
              droop={1}
              pulse={pulse}
              sway={sway}
            />
          </Place>
        </>
      );
  }
};

type ShrinkingLabProps = {
  /** Quanto o laboratório já encolheu, de 0 (o quadro inteiro) a 1 (o painel). */
  readonly progress: number;
  /** Já dentro do painel, a janela é o próprio painel; fora, ela fica onde o painel vai estar. */
  readonly insidePanel?: boolean;
};

/**
 * O plano anterior, assentado, encolhendo até o tamanho do painel do meio: a
 * janela fecha em volta do tanque enquanto o desenho diminui.
 */
const ShrinkingLab: React.FC<ShrinkingLabProps> = ({
  progress,
  insidePanel = false,
}) => {
  const { fps } = useVideoConfig();
  const width = mix(WIDTH, PANEL.width, progress);
  const height = mix(HEIGHT, PANEL.height, progress);
  const scale = mix(1, LAB_SCALE, progress);
  // O tanque vai do lugar dele no quadro para o centro da janela.
  const target = [
    mix(LAB_FOCUS.x, width / 2, progress),
    mix(LAB_FOCUS.y, height / 2, progress),
  ];

  return (
    <div
      style={{
        position: "absolute",
        left: insidePanel ? 0 : PANEL_X[1] - width / 2,
        top: insidePanel ? 0 : PANEL.y - height / 2,
        width,
        height,
        borderRadius: 36 * progress,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          width: WIDTH,
          height: HEIGHT,
          transformOrigin: "0 0",
          transform: `translate(${target[0] - scale * LAB_FOCUS.x}px, ${target[1] - scale * LAB_FOCUS.y}px) scale(${scale})`,
        }}
      >
        <Sequence from={-Math.round(SETTLED_SECONDS * fps)}>
          <FiveSecondsScene />
        </Sequence>
      </div>
    </div>
  );
};

type PanelsShotProps = {
  /** Quadro do plano em que cada painel acende. */
  readonly lights: readonly number[];
};

const PanelsShot: React.FC<PanelsShotProps> = ({ lights }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const shrink = ramp(frame, 0, SHRINK_SECONDS * fps);

  return (
    <AbsoluteFill>
      <IdeaBackdrop hue="lilac" spot={[0.5, 0.5]} />
      {SLEEP_SIGNS.map((sign, index) =>
        index === 1 && shrink < 1 ? null : (
          <SignPanel
            key={sign}
            sign={sign}
            x={PANEL_X[index]}
            y={PANEL.y}
            width={PANEL.width}
            height={PANEL.height}
            lit={ramp(frame, lights[index], LIGHT_UP_SECONDS * fps)}
          >
            {/* O painel do meio guarda o laboratório até acender com a cena do sinal. */}
            {index === 1 && frame < lights[1] ? (
              <ShrinkingLab progress={1} insidePanel />
            ) : (
              <PanelScene sign={sign} />
            )}
          </SignPanel>
        ),
      )}
      {shrink < 1 ? <ShrinkingLab progress={shrink} /> : null}
      <Grain />
    </AbsoluteFill>
  );
};

type ParadeAnimal = {
  readonly kind: SilhouetteKind;
  readonly x: number;
  /** Altura do centro do bicho: quem nada e quem voa fica acima do chão. */
  readonly y: number;
  readonly width: number;
  readonly grounded: boolean;
};

// Os bichos que desfilam: "qualquer animal". Cada um na altura do lugar em que vive.
const PARADE: readonly ParadeAnimal[] = [
  { kind: "fish", x: 250, y: 650, width: 210, grounded: false },
  { kind: "elephant", x: 600, y: 702, width: 270, grounded: true },
  { kind: "dolphin", x: 960, y: 620, width: 290, grounded: false },
  { kind: "frigatebird", x: 1320, y: 530, width: 300, grounded: false },
  { kind: "mouse", x: 1670, y: 744, width: 230, grounded: true },
];
const GROUND_Y = 806;
const SEAL_ROW_Y = 200;
const BIG_SEAL_X = [760, 960, 1160];
// Os painéis encolhem até os selos enquanto o fundo troca de cor.
const SEAL_SECONDS = 0.5;
const BACKDROP_WIPE_SECONDS = 0.3;
// Os bichos entram pela direita, um atrás do outro, e param cada um no seu lugar.
const WALK_SECONDS = 0.6;
const WALK_STAGGER_SECONDS = 0.12;
const ENTER_FROM = WIDTH + 400;
// Cada bicho recebe os três selos, um atrás do outro.
const STAMP_STAGGER_SECONDS = 0.1;
const ANIMAL_STAGGER_SECONDS = 0.17;

type ParadeShotProps = {
  /** Quadro do plano em que os bichos começam a entrar. */
  readonly paradeAt: number;
  /** Quadro do plano em que os selos começam a pousar nos bichos. */
  readonly stampAt: number;
};

/** Os três painéis viram selos, e cada bicho que passa recebe os três. */
const ParadeShot: React.FC<ParadeShotProps> = ({ paradeAt, stampAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const seconds = frame / fps;
  const toSeal = ramp(frame, 0, SEAL_SECONDS * fps);
  const mintWipe = ramp(frame, 2, BACKDROP_WIPE_SECONDS * fps);

  return (
    <SlowPush
      focus={[960, 600]}
      backdrop={
        <>
          <IdeaBackdrop hue="lilac" spot={[0.5, 0.5]} />
          <AbsoluteFill
            style={{ clipPath: `inset(${(1 - mintWipe) * 100}% 0 0 0)` }}
          >
            <IdeaBackdrop hue="mint" spot={[0.5, 0.2]} />
          </AbsoluteFill>
        </>
      }
    >
      <SvgLayer>
        {PARADE.filter(({ grounded }) => grounded).map(
          ({ x, width }, index) => (
            <IdeaShadow
              key={x}
              hue="mint"
              x={animalX(index === 0 ? 1 : 4, frame, fps, paradeAt)}
              y={GROUND_Y}
              width={width * 0.9}
            />
          ),
        )}
      </SvgLayer>
      {SLEEP_SIGNS.map((sign, index) =>
        toSeal < 1 ? (
          <Place
            key={sign}
            x={mix(PANEL_X[index], BIG_SEAL_X[index], toSeal)}
            y={mix(PANEL.y, SEAL_ROW_Y, toSeal)}
            style={{ scale: `${mix(1, 150 / (PANEL.width + 20), toSeal)}` }}
          >
            <SignPanel
              sign={sign}
              x={0}
              y={0}
              width={PANEL.width}
              height={PANEL.height}
              lit={1}
            >
              <PanelScene sign={sign} />
            </SignPanel>
          </Place>
        ) : (
          <Place key={sign} x={BIG_SEAL_X[index]} y={SEAL_ROW_Y}>
            <Pop at={SEAL_SECONDS * fps} from={0.85} seconds={0.2}>
              <Seal sign={sign} size={150} />
            </Pop>
          </Place>
        ),
      )}
      {PARADE.map(({ kind, x, y, width, grounded }, animal) => {
        const walk = ramp(
          frame,
          paradeAt + animal * WALK_STAGGER_SECONDS * fps,
          WALK_SECONDS * fps,
        );
        const moving = walk > 0 && walk < 1;
        const phase = phaseOf(kind);
        // Quem anda pula um pouco a cada passo; quem nada ou voa ondula.
        const bob = grounded
          ? (moving ? 10 : 0) * Math.abs(wave(seconds, 0.3, phase))
          : 6 * wave(seconds, 2.2, phase);
        const tilt = grounded
          ? 0
          : (moving ? 6 : 3) * wave(seconds, 1.6, phase);
        return (
          <div key={kind}>
            <Place
              x={animalX(animal, frame, fps, paradeAt)}
              y={y - bob}
              style={{ rotate: `${tilt}deg` }}
            >
              <Silhouette
                kind={kind}
                width={width}
                color={crowd.body}
                shade={crowd.shade}
                eye={crowd.eye}
              />
            </Place>
            {SLEEP_SIGNS.map((sign, index) => (
              <Place key={sign} x={x + (index - 1) * 70} y={y - 160 - bob}>
                <Pop
                  at={
                    stampAt +
                    (animal * ANIMAL_STAGGER_SECONDS +
                      index * STAMP_STAGGER_SECONDS) *
                      fps
                  }
                >
                  <Seal sign={sign} size={62} />
                </Pop>
              </Place>
            ))}
          </div>
        );
      })}
      <Grain />
    </SlowPush>
  );
};

/** Onde um bicho da fila está num quadro: vindo da direita até o seu lugar. */
const animalX = (
  animal: number,
  frame: number,
  fps: number,
  paradeAt: number,
): number =>
  mix(
    ENTER_FROM,
    PARADE[animal].x,
    ramp(
      frame,
      paradeAt + animal * WALK_STAGGER_SECONDS * fps,
      WALK_SECONDS * fps,
    ),
  );

// A pessoa de perto: a cabeça enche o quadro e os três selos pousam sobre ela.
const CLOSE_UP = { x: 960, y: 1570, height: 1300 };
const SEAL_LAND_Y = 150;
const LAND_SECONDS = 0.3;
const POINT_SECONDS = 0.3;

type YouShotProps = {
  /** Quadro do plano em que os selos começam a pousar. */
  readonly sealsAt: number;
  /** Quadro do plano em que ela se surpreende e aponta para si. */
  readonly pointAt: number;
};

const YouShot: React.FC<YouShotProps> = ({ sealsAt, pointAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const seconds = frame / fps;
  const point = settle(frame, pointAt, POINT_SECONDS * fps);

  return (
    <SlowPush
      focus={[960, 520]}
      by={0.08}
      backdrop={<IdeaBackdrop hue="peach" spot={[0.5, 0.5]} />}
    >
      <Place
        x={CLOSE_UP.x}
        y={CLOSE_UP.y}
        anchor="bottom"
        style={{ scale: `1 ${breath(seconds, "you")}` }}
      >
        <Person
          height={CLOSE_UP.height}
          colors={person}
          expression={point > 0 ? "surprised" : "yawning"}
          blink={blink(seconds, "you")}
          frontArm={{
            hand: [mix(-120, -24, point), mix(-250, -300, point)],
            bend: 70,
          }}
        />
      </Place>
      {SLEEP_SIGNS.map((sign, index) => {
        const at = sealsAt + index * 4;
        const landing = settle(frame, at, LAND_SECONDS * fps);
        return (
          <Place
            key={sign}
            x={BIG_SEAL_X[index]}
            y={mix(SEAL_LAND_Y - 90, SEAL_LAND_Y, landing)}
          >
            <Pop at={at} from={0.8}>
              <Seal sign={sign} size={150} />
            </Pop>
          </Place>
        );
      })}
      <Grain />
    </SlowPush>
  );
};

export const ThreeSignsScene: React.FC<SceneProps> = ({ scene, shots }) => (
  <>
    <Shot range={shots[0]} name="os três sinais">
      <PanelsShot
        lights={[
          cue(scene, "Quieta"),
          cue(scene, "lenta"),
          cue(scene, "atrasado"),
        ]}
      />
    </Shot>
    <Shot range={shots[1]} name="qualquer animal">
      <ParadeShot
        paradeAt={cue(scene, "três") - shots[1].from}
        stampAt={cue(scene, "qualquer") - shots[1].from}
      />
    </Shot>
    <Shot range={shots[2]} name="inclusive você">
      <YouShot
        sealsAt={cue(scene, "Inclusive") - shots[2].from + 4}
        pointAt={cue(scene, "você") - shots[2].from}
      />
    </Shot>
  </>
);
