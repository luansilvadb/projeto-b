import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { Person } from "../../../art/Person";
import { Silhouette } from "../../../art/Silhouettes";
import { Camera, cameraBetween, framing } from "../../../components/Camera";
import { Grain } from "../../../components/Grain";
import { Place } from "../../../components/Place";
import {
  Pop,
  POP_SECONDS,
  popOpacity,
  popScale,
} from "../../../components/Pop";
import { SvgLayer } from "../../../components/SvgLayer";
import { cue, ramp } from "../../../components/timing";
import type { SceneProps } from "../../../video/NarratedVideo";
import { Shot } from "../../../video/Shot";
import { ink, personInPajamas } from "../palette";
import { Herd, type HerdMember } from "../parts/Herd";
import { Savanna } from "../parts/Savanna";
import { ELEPHANT_HOURS, OUR_HOURS, SleptBars } from "../parts/SleepRuler";
import { Tag } from "../parts/Tag";

// Uma delas, de noite, dormindo em pé: embaixo, no meio, com o céu livre em cima para a régua.
const SLEEPER: HerdMember = { x: 960, y: 50, width: 600, seed: "sleeper" };
const NIGHT = framing([960, 540], 1);
/** O segundo plano chega um pouco mais perto dela, por baixo das barras. */
const NIGHT_CLOSER = framing([960, 760], 1.12, [960, 830]);
// A lua fica à direita, depois do fim da régua: atrás das barras ela sumiria.
const MOON = 0.705;
const BARS_TOP = 150;

type NightProps = {
  /** Quanto a câmera já chegou ao enquadramento de perto, de 0 a 1. */
  readonly closer?: number;
};

/** A savana de noite, com a elefanta dormindo em pé. */
const Night: React.FC<NightProps> = ({ closer = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <Camera {...cameraBetween(NIGHT, NIGHT_CLOSER, closer)}>
      <Savanna daylight={0} orb={MOON}>
        <Herd
          members={[SLEEPER]}
          daylight={0}
          asleep={1}
          seconds={frame / fps}
        />
      </Savanna>
    </Camera>
  );
};

type BarShotProps = {
  /** Quadros do plano em que a barra dela entra e em que ganha o número. */
  readonly fillAt: number;
  readonly hoursAt: number;
};

/** A barra dela entra no lugar vago, debaixo da nossa, e para em duas horas. */
const BarShot: React.FC<BarShotProps> = ({ fillAt, hoursAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill>
      <Night />
      <SleptBars
        on="night"
        top={BARS_TOP}
        tone={ink.paper}
        ours={{}}
        elephant={{
          filled: ramp(frame, fillAt, 0.5 * fps),
          labelAt: hoursAt,
        }}
      />
      <Grain />
    </AbsoluteFill>
  );
};

// As duas barras de perto, na mesma escala: as oito horas ocupam a largura do quadro.
const QUARTER = { x: 400, y: 140, width: 1180, height: 64, gap: 30 };
const SLOTS = OUR_HOURS / ELEPHANT_HOURS;
const SLOT_WIDTH = QUARTER.width / SLOTS;
const HOUR_WIDTH = QUARTER.width / OUR_HOURS;
const HERS_Y = QUARTER.y + QUARTER.height + QUARTER.gap;
const RULER_Y = HERS_Y + QUARTER.height + 34;
const TAGS_Y = RULER_Y + 96;
const WHO_SIZE = 96;
const COPY_STAGGER_SECONDS = 0.22;

type QuarterShotProps = {
  /** Quadros do plano em que a barra dela começa a se copiar e em que a fração ganha nome. */
  readonly copyAt: number;
  readonly quarterAt: number;
};

/** O sono dela cabe quatro vezes no nosso: a barra dela se copia até encher a nossa. */
const QuarterShot: React.FC<QuarterShotProps> = ({ copyAt, quarterAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const frames = POP_SECONDS * fps;

  return (
    <AbsoluteFill>
      <Night closer={ramp(frame, 0, 0.7 * fps)} />
      <SvgLayer>
        <rect
          x={QUARTER.x}
          y={QUARTER.y}
          width={QUARTER.width}
          height={QUARTER.height}
          rx={QUARTER.height / 2}
          fill={ink.tag}
        />
        {Array.from({ length: SLOTS }, (_, slot) => {
          // A primeira é a barra dela; as outras são as cópias, que entram uma a uma.
          const at =
            slot === 0
              ? -frames
              : copyAt + (slot - 1) * COPY_STAGGER_SECONDS * fps;
          const width = (SLOT_WIDTH - 10) * popScale(frame, at, frames, 0.4);
          return (
            <rect
              key={slot}
              x={QUARTER.x + slot * SLOT_WIDTH + 5}
              y={HERS_Y}
              width={width}
              height={QUARTER.height}
              rx={QUARTER.height / 2}
              fill={slot === 0 ? ink.tag : ink.moon}
              opacity={popOpacity(frame, at, frames)}
            />
          );
        })}
        {/* A régua, de perto: do zero às oito horas, uma marca por hora. */}
        <g stroke={ink.paper} strokeWidth={6} strokeLinecap="round">
          <line
            x1={QUARTER.x}
            y1={RULER_Y}
            x2={QUARTER.x + QUARTER.width}
            y2={RULER_Y}
          />
          {Array.from({ length: OUR_HOURS + 1 }, (_, hour) => (
            <line
              key={hour}
              x1={QUARTER.x + hour * HOUR_WIDTH}
              y1={RULER_Y}
              x2={QUARTER.x + hour * HOUR_WIDTH}
              y2={RULER_Y + (hour % ELEPHANT_HOURS === 0 ? 30 : 16)}
              opacity={hour % ELEPHANT_HOURS === 0 ? 1 : 0.6}
            />
          ))}
        </g>
      </SvgLayer>
      <Place x={QUARTER.x - 80} y={QUARTER.y + QUARTER.height / 2}>
        <Person
          height={WHO_SIZE}
          colors={personInPajamas}
          expression="asleep"
        />
      </Place>
      <Place x={QUARTER.x - 80} y={HERS_Y + QUARTER.height / 2}>
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
      <Place x={QUARTER.x + SLOT_WIDTH / 2} y={TAGS_Y}>
        <Tag size="note" on="night">
          2 h
        </Tag>
      </Place>
      <Place x={QUARTER.x + QUARTER.width / 2 + SLOT_WIDTH / 2} y={TAGS_Y}>
        <Pop at={quarterAt}>
          <Tag size="note" on="night">
            um quarto
          </Tag>
        </Pop>
      </Place>
      <Grain />
    </AbsoluteFill>
  );
};

export const TwoHoursScene: React.FC<SceneProps> = ({ scene, shots }) => (
  <>
    <Shot range={shots[0]} name="ela dorme em pé; a barra para em 2 h">
      <BarShot fillAt={cue(scene, "média")} hoursAt={cue(scene, "duas")} />
    </Shot>
    <Shot range={shots[1]} name="um quarto do nosso sono">
      <QuarterShot
        copyAt={cue(scene, "dorme") - shots[1].from}
        quarterAt={cue(scene, "quarto") - shots[1].from}
      />
    </Shot>
  </>
);
