import { interpolateColors, useCurrentFrame, useVideoConfig } from "remotion";
import { Person } from "../../../art/Person";
import { Silhouette } from "../../../art/Silhouettes";
import { cameraBetween, framing } from "../../../components/Camera";
import { Stay, useStage } from "../../../components/Cast";
import { wave } from "../../../components/Idle";
import { Label } from "../../../components/Label";
import { Place } from "../../../components/Place";
import { Pop, POP_SECONDS, popScale } from "../../../components/Pop";
import { SvgLayer } from "../../../components/SvgLayer";
import { cue, mix, ramp, settle, clamp01 } from "../../../components/timing";
import type { SceneProps } from "../../../video/NarratedVideo";
import { Shot } from "../../../video/Shot";
import { ink, personInPajamas } from "../palette";
import { Herd, type HerdMember } from "../parts/Herd";
import { ELEPHANT_HOURS, OUR_HOURS, RULER } from "../parts/SleepRuler";
import { Tag } from "../parts/Tag";
import { SavannaStage, TRUNK_END } from "./ElephantsScene";
import { Grow } from "./SleepDebtScene";

// Uma delas, de noite, dormindo em pé: embaixo, no meio, com o céu livre em cima para a régua.
// É a matriarca que adormeceu no plano da tromba, virada para o mesmo lado e com a mesma pausa
// viva: a câmera recua dela até aqui, e na savana deste plano ela é maior e está no meio.
const SLEEPER: HerdMember = { ...TRUNK_END.sleeper, x: 960, y: 50, width: 600 };
const NIGHT = framing([960, 540], 1);
/** O segundo plano chega um pouco mais perto dela, por baixo das barras. */
const NIGHT_CLOSER = framing([960, 760], 1.12, [960, 830]);
// A lua fica à direita, depois do fim da régua: atrás das barras ela sumiria.
const MOON = 0.705;
// A cena abre no close da tromba, da cena anterior, e a câmera recua até o plano médio, com peso. Em segundos.
const PULL_BACK = 0.8;

type ShotClock = {
  /** O quadro do vídeo em que o plano começa: o relógio do cenário. */
  readonly clock: number;
};

type NightProps = ShotClock & {
  /** Quanto a câmera já recuou do close da tromba, da cena anterior, de 0 a 1. */
  readonly back?: number;
  /** Quanto a câmera já chegou ao enquadramento de perto, de 0 a 1. */
  readonly closer?: number;
};

/** A savana de noite, com a elefanta dormindo em pé. */
const Night: React.FC<NightProps> = ({ back = 1, closer = 0, clock }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const from = TRUNK_END.sleeper;

  return (
    <SavannaStage
      camera={cameraBetween(
        TRUNK_END.camera,
        cameraBetween(NIGHT, NIGHT_CLOSER, closer),
        back,
      )}
      daylight={0}
      orb={mix(TRUNK_END.orb, MOON, back)}
      clock={clock}
    >
      <Herd
        // Ela vai do lugar e do tamanho que tinha na manada aos deste plano junto com a câmera;
        // o tamanho, em progressão geométrica, como a aproximação.
        members={[
          {
            ...SLEEPER,
            x: mix(from.x, SLEEPER.x, back),
            y: mix(from.y, SLEEPER.y ?? 0, back),
            width: from.width * (SLEEPER.width / from.width) ** back,
          },
        ]}
        daylight={0}
        asleep={1}
        // A tromba chega solta do plano anterior e só então pende como um pêndulo.
        trunk={0.03 * back * (1 + wave((clock + frame) / fps, 4.7, from.phase))}
        seconds={(clock + frame) / fps}
      />
    </SavannaStage>
  );
};

/**
 * As duas barras sobre a régua, em dois enquadramentos: a régua inteira, de
 * 24 horas, e de perto, com as oito horas ocupando a largura do quadro. Cada
 * medida do desenho vai de um ao outro, e é assim que a câmera "fecha nas
 * barras": a régua cresce, e o que passa das oito horas sai pela direita.
 */
type Layout = {
  /** Onde fica o zero e quantos pixels vale uma hora. */
  readonly zero: number;
  readonly hour: number;
  /** A altura do meio de cada barra e a da linha da régua. */
  readonly ours: number;
  readonly hers: number;
  readonly ruler: number;
  /** A altura das barras, o tamanho de quem é o dono de cada uma e onde ele fica. */
  readonly bar: number;
  readonly who: number;
  readonly whoX: number;
  /** Até que hora a régua vai, e de quantas em quantas horas a marca é grande. */
  readonly hours: number;
};
const WHOLE: Layout = {
  zero: RULER.x,
  hour: RULER.width / RULER.hours,
  ours: 150,
  hers: 250,
  ruler: 320,
  bar: 54,
  who: 100,
  whoX: RULER.x - 100,
  hours: RULER.hours,
};
const NEAR: Layout = {
  zero: 400,
  hour: 1180 / OUR_HOURS,
  ours: 172,
  hers: 266,
  ruler: 332,
  bar: 64,
  who: 96,
  whoX: 320,
  hours: OUR_HOURS,
};
// De perto, as etiquetas "2 h" e "um quarto" ficam debaixo da régua.
const TAGS_Y = 428;
// O lugar vago, antes de a barra dela entrar: mais comprido que ela, sem medir nada.
const SLOT_HOURS = 3;
const SLOTS = OUR_HOURS / ELEPHANT_HOURS;
// As cópias da barra dela: o intervalo entre uma e a seguinte e quanto cada uma leva para chegar, em quadros.
const COPY = { gap: 7.5, frames: 10, inset: 5 };
// A barra dela pisca uma vez: quanto dura, em quadros, e quanto cresce.
const FLASH = { frames: 12, swell: 0.3 };

const layoutAt = (near: number): Layout => ({
  zero: mix(WHOLE.zero, NEAR.zero, near),
  // A escala cresce em progressão geométrica, como uma câmera que se aproxima.
  hour: WHOLE.hour * (NEAR.hour / WHOLE.hour) ** near,
  ours: mix(WHOLE.ours, NEAR.ours, near),
  hers: mix(WHOLE.hers, NEAR.hers, near),
  ruler: mix(WHOLE.ruler, NEAR.ruler, near),
  bar: mix(WHOLE.bar, NEAR.bar, near),
  who: mix(WHOLE.who, NEAR.who, near),
  whoX: mix(WHOLE.whoX, NEAR.whoX, near),
  hours: mix(WHOLE.hours, NEAR.hours, near),
});

type BarsProps = {
  /** Quanto a câmera já fechou nas barras, de 0 (a régua inteira) a 1. */
  readonly near?: number;
  /** Quanto da régua já se desenhou, e os quadros em que os números das pontas entram. */
  readonly drawn?: number;
  readonly endsAt?: readonly [number, number];
  /** A nossa barra: quanto encheu, e os quadros em que o dono e o "8 h" entram. */
  readonly ours?: number;
  readonly oursAt?: readonly [number, number];
  /** O lugar vago debaixo dela: quanto já se desenhou. */
  readonly slot?: number;
  /** A barra dela: quanto encheu, o quadro em que a silhueta toma o lugar vago e o do "2 h". */
  readonly hers?: number;
  readonly hersAt?: readonly [number, number];
  /** Quadro em que a barra dela pisca. */
  readonly flashAt?: number;
  /** Quadros em que a barra dela começa a se copiar e em que a fração ganha nome; sem valores, não há cópias. */
  readonly copyAt?: number;
  readonly quarterAt?: number;
};

const SHOWN = -1000;

/** O sono dela contra o nosso, sobre a régua: as duas barras, o lugar vago antes de ela chegar e as cópias que enchem a nossa. */
const Bars: React.FC<BarsProps> = ({
  near = 0,
  drawn = 1,
  endsAt = [SHOWN, SHOWN],
  ours = 1,
  oursAt = [SHOWN, SHOWN],
  slot = 1,
  hers = 1,
  hersAt = [SHOWN, SHOWN],
  flashAt,
  copyAt,
  quarterAt = SHOWN,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const layout = layoutAt(near);
  const frames = POP_SECONDS * fps;
  const at = (hours: number) => layout.zero + layout.hour * hours;
  const half = layout.bar / 2;
  const hersWidth = layout.hour * ELEPHANT_HOURS - 2 * COPY.inset * near;
  const hersX = layout.zero + COPY.inset * near;
  const taken = hersAt[0] > SHOWN ? ramp(frame, hersAt[0], 0.3 * fps) : 1;
  // O lugar vago encolhe até o tamanho da barra que chega, e some debaixo dela.
  const slotWidth = layout.hour * mix(SLOT_HOURS, ELEPHANT_HOURS, hers) * slot;
  const flash =
    flashAt === undefined
      ? 0
      : Math.sin(
          Math.PI * clamp01((frame - flashAt) / FLASH.frames),
        );
  const end = layout.hours * drawn;

  return (
    <>
      <SvgLayer>
        {/* A nossa barra, do zero às oito horas. */}
        <rect
          x={layout.zero}
          y={layout.ours - half}
          width={layout.hour * OUR_HOURS * ours}
          height={layout.bar}
          rx={Math.min(half, (layout.hour * OUR_HOURS * ours) / 2)}
          fill={ink.tag}
        />
        {/* O lugar vago: o contorno de uma barra e o de quem ainda não chegou. */}
        {slot > 0 && hers < 1 ? (
          <g
            fill="none"
            stroke={ink.paper}
            strokeWidth={6}
            strokeLinecap="round"
            strokeDasharray="16 14"
            opacity={Math.min(1, slot * 5) * (1 - hers)}
          >
            <rect
              x={layout.zero}
              y={layout.hers - half}
              width={slotWidth}
              height={layout.bar}
              rx={Math.min(half, slotWidth / 2)}
            />
            <circle
              cx={layout.whoX}
              cy={layout.hers}
              r={44 * Math.min(1, slot * 1.6) * (1 - taken)}
            />
          </g>
        ) : null}
        {/* As cópias saem de baixo da barra dela, uma a uma, e deslizam até o lugar ao longo da nossa. */}
        {copyAt === undefined
          ? null
          : Array.from({ length: SLOTS - 1 }, (_, index) => {
              const from = copyAt + index * COPY.gap;
              return frame < from ? null : (
                <rect
                  key={index}
                  x={
                    hersX +
                    (index + 1) *
                      layout.hour *
                      ELEPHANT_HOURS *
                      settle(frame, from, COPY.frames)
                  }
                  y={layout.hers - half}
                  width={hersWidth}
                  height={layout.bar}
                  rx={half}
                  fill={ink.moon}
                />
              );
            })}
        {/* A barra dela, que para em duas horas. */}
        <rect
          x={hersX}
          y={layout.hers - half * (1 + FLASH.swell * flash)}
          width={hersWidth * hers}
          height={layout.bar * (1 + FLASH.swell * flash)}
          rx={Math.min(half, (hersWidth * hers) / 2)}
          fill={interpolateColors(flash, [0, 1], [ink.tag, ink.paper])}
        />
        {/* A régua: uma marca por hora. De longe, as grandes são de seis em seis horas; de perto, de duas em duas. */}
        <g stroke={ink.paper} strokeWidth={6} strokeLinecap="round">
          <line
            x1={layout.zero}
            y1={layout.ruler}
            x2={at(end)}
            y2={layout.ruler}
          />
          {Array.from({ length: RULER.hours + 1 }, (_, hour) => {
            if (hour > end) {
              return null;
            }
            const major = mix(
              hour % 6 === 0 ? 1 : 0,
              hour % ELEPHANT_HOURS === 0 ? 1 : 0,
              near,
            );
            return (
              <line
                key={hour}
                x1={at(hour)}
                y1={layout.ruler}
                x2={at(hour)}
                y2={layout.ruler + mix(16, 30, major)}
                opacity={mix(0.6, 1, major)}
              />
            );
          })}
        </g>
      </SvgLayer>
      {/* Os números das pontas da régua: de perto, saem, que a régua passa do quadro. */}
      {(
        [
          ["0", 0, endsAt[0]],
          ["24 h", RULER.hours, endsAt[1]],
        ] as const
      ).map(([text, hours, shownAt]) =>
        near < 1 && frame >= shownAt ? (
          <Place key={text} x={at(hours)} y={layout.ruler + 70}>
            <div
              style={{
                scale: `${popScale(frame, shownAt, frames) * (1 - near)}`,
              }}
            >
              <Label size="note" color={ink.paper}>
                {text}
              </Label>
            </div>
          </Place>
        ) : null,
      )}
      <Place x={layout.whoX} y={layout.ours}>
        <Grow at={oursAt[0]} frames={frames}>
          <Person
            height={layout.who}
            colors={personInPajamas}
            expression="asleep"
          />
        </Grow>
      </Place>
      <Place
        x={at(OUR_HOURS) + 24}
        y={layout.ours}
        style={{ translate: "0 -50%", transformOrigin: "0 50%" }}
      >
        <Pop at={oursAt[1]}>
          <Tag size="note" on="night">
            8 h
          </Tag>
        </Pop>
      </Place>
      <Place x={layout.whoX} y={layout.hers}>
        <Grow at={hersAt[0]} frames={frames}>
          <Silhouette kind="elephant" width={layout.who} color={ink.paper} />
        </Grow>
      </Place>
      {/* O "2 h" nasce na ponta da barra dela; de perto, desce para debaixo da régua, e as cópias ficam com o lugar. */}
      <Place
        x={mix(at(ELEPHANT_HOURS) + 24, at(ELEPHANT_HOURS / 2), near)}
        y={mix(layout.hers, TAGS_Y, near)}
        style={{
          translate: `${mix(0, -50, near)}% -50%`,
          transformOrigin: `${mix(0, 50, near)}% 50%`,
        }}
      >
        <Pop at={hersAt[1]}>
          <Tag size="note" on="night">
            2 h
          </Tag>
        </Pop>
      </Place>
      {copyAt === undefined ? null : (
        <Place x={at(OUR_HOURS / 2 + ELEPHANT_HOURS / 2)} y={TAGS_Y}>
          <Pop at={quarterAt}>
            <Tag size="note" on="night">
              um quarto
            </Tag>
          </Pop>
        </Place>
      )}
    </>
  );
};

// A entrada da régua e da nossa barra, em quadros do plano, com a câmera já quase no lugar.
const ENTER = { ruler: 16, rulerFrames: 16, ours: 20, oursFrames: 16, slot: 32 };

type BarShotProps = ShotClock & {
  /** Quadros do plano em que a barra dela entra e em que pisca. */
  readonly fillAt: number;
  readonly flashAt: number;
};

/** A câmera recua da tromba até ela inteira, que dorme em pé, e a régua entra sobre ela; a barra dela toma o lugar vago, debaixo da nossa, e para em duas horas. */
const BarShot: React.FC<BarShotProps> = ({ fillAt, flashAt, clock }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const stage = useStage();
  const rulerEnd = ENTER.ruler + ENTER.rulerFrames;
  const oursEnd = ENTER.ours + ENTER.oursFrames;

  return (
    <>
      <Night back={ramp(frame, 0, PULL_BACK * fps)} clock={clock} />
      {/* As barras continuam no plano seguinte: não saem com este, e quando o outro chega é ele quem as desenha. */}
      {frame < ENTER.ruler || stage.handedOver ? null : (
        <Stay>
          <Bars
            drawn={ramp(frame, ENTER.ruler, ENTER.rulerFrames)}
            endsAt={[ENTER.ruler + 2, rulerEnd]}
            ours={ramp(frame, ENTER.ours, ENTER.oursFrames)}
            oursAt={[ENTER.ours, oursEnd]}
            slot={ramp(frame, ENTER.slot, 0.4 * fps)}
            hers={ramp(frame, fillAt, 0.5 * fps)}
            hersAt={[fillAt, fillAt + 0.4 * fps]}
            flashAt={flashAt}
          />
        </Stay>
      )}
    </>
  );
};

type QuarterShotProps = ShotClock & {
  /** Quadros do plano em que a barra dela começa a se copiar e em que a fração ganha nome. */
  readonly copyAt: number;
  readonly quarterAt: number;
};

/** O quadro em que a última cópia chega, para um plano que começa a copiar em `copyAt`. */
const copiedAt = (copyAt: number): number =>
  copyAt + (SLOTS - 2) * COPY.gap + COPY.frames;

/** O sono dela cabe quatro vezes no nosso: a barra dela se copia até encher a nossa. */
const QuarterShot: React.FC<QuarterShotProps> = ({
  copyAt,
  quarterAt,
  clock,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const near = ramp(frame, 0, 0.6 * fps);

  return (
    <>
      <Night closer={near} clock={clock} />
      {/* As barras já estavam no palco: não entram de novo. No fim, encolhem no próprio ponto, antes de o dia nascer na cena seguinte. */}
      <Stay only="entering">
        <Bars
          near={near}
          copyAt={copyAt}
          // O nome da fração só entra com a última cópia no lugar.
          quarterAt={Math.max(quarterAt, copiedAt(copyAt) - 2)}
        />
      </Stay>
    </>
  );
};

/**
 * O fim da cena, para a seguinte partir dele: a câmera de perto, a lua e a
 * elefanta que dorme em pé.
 */
export const QUARTER_END = {
  camera: NIGHT_CLOSER,
  orb: MOON,
  sleeper: SLEEPER,
};

export const TwoHoursScene: React.FC<SceneProps> = ({ scene, shots }) => (
  <>
    <Shot range={shots[0]} name="ela dorme em pé; a barra para em 2 h">
      <BarShot
        fillAt={cue(scene, "duas")}
        flashAt={cue(scene, "menores")}
        clock={scene.from}
      />
    </Shot>
    <Shot range={shots[1]} name="um quarto do nosso sono">
      <QuarterShot
        copyAt={cue(scene, "dorme") - shots[1].from}
        quarterAt={cue(scene, "quarto") - shots[1].from}
        clock={scene.from + shots[1].from}
      />
    </Shot>
  </>
);
