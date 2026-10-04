import { Tag } from "../parts/Tag";
import {
  AbsoluteFill,
  interpolateColors,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Elephant } from "../../../art/Elephant";
import { Person } from "../../../art/Person";
import { Silhouette } from "../../../art/Silhouettes";
import {
  Camera,
  cameraBetween,
  framing,
  type CameraState,
} from "../../../components/Camera";
import { Cast, Stay, useStage } from "../../../components/Cast";
import { Grain } from "../../../components/Grain";
import { blink, breath, wave } from "../../../components/Idle";
import { Place } from "../../../components/Place";
import { Pop } from "../../../components/Pop";
import { SvgLayer } from "../../../components/SvgLayer";
import type { SceneProps } from "../../../video/NarratedVideo";
import { Shot } from "../../../video/Shot";
import { elephant, ink, personInPajamas } from "../palette";
import { SAVANNA_GROUND_Y, Savanna, SavannaShadow } from "../parts/Savanna";
import { ELEPHANT_HOURS, OUR_HOURS, SleptBars } from "../parts/SleepRuler";
import { cue, linear, mix, ramp } from "../../../components/timing";
import { MEASURE } from "./AlmostEscapedScene";
import { daylightAt } from "./FrigatebirdScene";

/** As duas elefantas no plano aberto: a da frente e a de trás, um pouco menor. */
export const HERD = [
  { x: 900, y: 0, width: 540, seed: "lead" },
  { x: 1330, y: -70, width: 440, seed: "second" },
] as const;
export const SAVANNA_WIDE = framing([960, 540], 1);
const SAVANNA_WIDE_END = framing([1000, 760], 1.04, [1000, 760]);
/** O plano médio da elefanta que dorme, com o céu livre em cima para a comparação. */
const SAVANNA_MEDIUM = framing([HERD[0].x - 40, 620], 1.35, [960, 720]);
// Quanto elas andam por segundo, e o balanço do passo.
const WALK_SPEED = 40;
const STEP_SECONDS = 1.3;
// Quantos dias e noites passam no plano em que ela não dorme: quase dois.
const AWAKE_CYCLES = 1.9;

type HerdProps = {
  readonly daylight: number;
  /** Quanto elas andam, de 0 (paradas) a 1 (a passo). */
  readonly walking: number;
  /** Quanto dormem, de 0 (acordadas) a 1 (olhos fechados, tromba caída). */
  readonly asleep: number;
  readonly collar?: boolean;
  readonly seconds: number;
};

/** As duas elefantas, cada uma no seu ritmo: andam, param, dormem em pé. */
export const Herd: React.FC<HerdProps> = ({
  daylight,
  walking,
  asleep,
  collar = false,
  seconds,
}) => (
  <>
    <SvgLayer>
      {HERD.map(({ x, y, width }) => (
        <SavannaShadow
          key={x}
          x={x}
          y={SAVANNA_GROUND_Y + y + 6}
          width={width * 0.8}
          daylight={daylight}
        />
      ))}
    </SvgLayer>
    {[...HERD].reverse().map(({ x, y, width, seed }, index) => {
      const phase = index * 0.5;
      const stride = walking * wave(seconds, STEP_SECONDS, phase);
      const bob =
        walking * 6 * Math.abs(wave(seconds, STEP_SECONDS / 2, phase));
      return (
        <Place
          key={seed}
          id={`elephant-${seed}`}
          x={x}
          y={SAVANNA_GROUND_Y + y - bob}
          anchor="bottom"
          style={{
            scale: `1 ${breath(seconds, seed, { amplitude: 0.012, period: 4.5 })}`,
          }}
        >
          <Elephant
            width={width}
            colors={elephant}
            lid={Math.max(asleep, blink(seconds, seed))}
            droop={asleep}
            trunk={0.15 * (1 - asleep) + 0.1 * wave(seconds, 3.1, phase)}
            ear={0.3 * (1 - asleep) + 0.2 * Math.abs(wave(seconds, 2.2, phase))}
            stride={stride}
            collar={collar ? 0.5 + 0.5 * wave(seconds, 1, phase) : undefined}
          />
        </Place>
      );
    })}
  </>
);

type SavannaShotProps = {
  readonly camera: CameraState;
  readonly daylight: number;
  readonly orb: number;
  readonly children: React.ReactNode;
};

/** A savana vista pela câmera, com o rebanho e o que mais houver no plano do chão. */
export const SavannaShot: React.FC<SavannaShotProps> = ({
  camera,
  daylight,
  orb,
  children,
}) => (
  <AbsoluteFill>
    <Camera {...camera}>
      <Savanna daylight={daylight} orb={orb}>
        {children}
      </Savanna>
    </Camera>
    <Grain />
  </AbsoluteFill>
);

type TwoHoursShotProps = {
  /** Quadros do plano em que a barra dela entra e em que ganha o número. */
  readonly fillAt: number;
  readonly hoursAt: number;
};

/** De noite, elas dormem em pé; a barra delas entra debaixo da nossa e para em duas horas. */
const TwoHoursShot: React.FC<TwoHoursShotProps> = ({ fillAt, hoursAt }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  // A noite sobe ao palco em volta da régua, que vem da cena anterior e não
  // sai da tela: só muda de cor, sobe e abre lugar para a barra da elefanta.
  const entered = useStage().enter();

  return (
    <AbsoluteFill>
      <SavannaShot
        camera={cameraBetween(
          SAVANNA_WIDE,
          SAVANNA_WIDE_END,
          frame / durationInFrames,
        )}
        daylight={0}
        orb={0.86}
      >
        <Herd daylight={0} walking={0} asleep={1} seconds={frame / fps} />
      </SavannaShot>
      <AbsoluteFill
        style={{
          // A régua chega com a câmera da cena anterior, e assenta.
          scale: `${mix(1 + MEASURE.push, 1, entered)}`,
          transformOrigin: `${MEASURE.focus[0]}px ${MEASURE.focus[1]}px`,
        }}
      >
        <Stay only="entering">
          <SleptBars
            on="night"
            top={mix(MEASURE.top, 120, entered)}
            tone={interpolateColors(entered, [0, 1], [ink.dark, ink.paper])}
            spread={entered}
            ours={{}}
            elephant={{
              filled: ramp(frame, fillAt, 0.5 * fps),
              labelAt: hoursAt,
            }}
          />
        </Stay>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// As duas barras de perto, na mesma escala: as oito horas ocupam a largura do quadro.
const QUARTER = { x: 400, y: 150, width: 1180, height: 64, gap: 30 };
const SLOTS = OUR_HOURS / ELEPHANT_HOURS;
const SLOT_WIDTH = QUARTER.width / SLOTS;
const SLOT_STAGGER_SECONDS = 0.22;
const WHO_SIZE = 96;

/** O sono dela cabe quatro vezes no nosso: a barra dela, repetida debaixo da nossa. */
const QuarterShot: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const hersY = QUARTER.y + QUARTER.height + QUARTER.gap;

  return (
    <AbsoluteFill>
      <SavannaShot camera={SAVANNA_MEDIUM} daylight={0} orb={0.9}>
        <Herd daylight={0} walking={0} asleep={1} seconds={frame / fps} />
      </SavannaShot>
      <SvgLayer>
        <rect
          x={QUARTER.x}
          y={QUARTER.y}
          width={QUARTER.width}
          height={QUARTER.height}
          rx={QUARTER.height / 2}
          fill={ink.tag}
        />
        {Array.from({ length: SLOTS }, (_, slot) => (
          <rect
            key={slot}
            x={QUARTER.x + slot * SLOT_WIDTH + 5}
            y={hersY}
            width={SLOT_WIDTH - 10}
            height={QUARTER.height}
            rx={QUARTER.height / 2}
            // A primeira é a barra dela; as outras marcam quantas vezes ela cabe.
            fill={slot === 0 ? ink.tag : "none"}
            stroke={ink.paper}
            strokeWidth={slot === 0 ? 0 : 6}
            strokeDasharray="18 14"
            opacity={ramp(frame, slot * SLOT_STAGGER_SECONDS * fps, 0.2 * fps)}
          />
        ))}
      </SvgLayer>
      <Place x={QUARTER.x - 80} y={QUARTER.y + QUARTER.height / 2}>
        <Person
          height={WHO_SIZE}
          colors={personInPajamas}
          expression="asleep"
        />
      </Place>
      <Place x={QUARTER.x - 80} y={hersY + QUARTER.height / 2}>
        <Silhouette kind="elephant" width={WHO_SIZE} color={ink.paper} />
      </Place>
      <Place
        x={QUARTER.x + QUARTER.width + 24}
        y={QUARTER.y + QUARTER.height / 2}
        style={{ translate: "0 -50%" }}
      >
        <Tag size="note" on="night">
          8 h
        </Tag>
      </Place>
      <Place x={QUARTER.x + SLOT_WIDTH / 2} y={hersY + QUARTER.height + 60}>
        <Tag size="note" on="night">
          2 h
        </Tag>
      </Place>
    </AbsoluteFill>
  );
};

type AwakeShotProps = {
  /** Quadro do plano em que o tempo acordada ganha número. */
  readonly hoursAt: number;
};

/** O sol e a lua passam duas vezes sobre elas, que seguem andando de olhos abertos. */
const AwakeShot: React.FC<AwakeShotProps> = ({ hoursAt }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const seconds = frame / fps;
  // Começa de manhã; cada volta inteira é um dia e uma noite.
  const cycles = 0.3 + AWAKE_CYCLES * linear(frame, 0, durationInFrames);
  // O astro nasce à esquerda no começo do dia e de novo no começo da noite.
  const orb = (((cycles % 1) + 0.75) % 0.5) * 2;

  return (
    <AbsoluteFill>
      <SavannaShot
        camera={SAVANNA_WIDE}
        daylight={daylightAt(cycles)}
        orb={orb}
      >
        <div style={{ translate: `${160 - WALK_SPEED * seconds}px 0` }}>
          <Herd
            daylight={daylightAt(cycles)}
            walking={1}
            asleep={0}
            seconds={seconds}
          />
        </div>
      </SavannaShot>
      <Cast origin={[520, 260]}>
        <Place x={520} y={260}>
          <Pop at={hoursAt}>
            <Tag size="note" on="peach">
              46 h acordada
            </Tag>
          </Pop>
        </Place>
      </Cast>
    </AbsoluteFill>
  );
};

export const ElephantsScene: React.FC<SceneProps> = ({ scene, shots }) => (
  <>
    <Shot range={shots[0]} name="duas horas por dia">
      <TwoHoursShot fillAt={cue(scene, "dorme")} hoursAt={cue(scene, "só")} />
    </Shot>
    <Shot range={shots[1]} name="um quarto do nosso sono">
      <QuarterShot />
    </Shot>
    <Shot range={shots[2]} name="quase dois dias acordada">
      <AwakeShot hoursAt={cue(scene, "dois") - shots[2].from} />
    </Shot>
  </>
);
