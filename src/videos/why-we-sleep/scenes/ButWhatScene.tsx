import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {
  Build,
  cameraBetween,
  framing,
  useBuild,
  type CameraState,
} from "../../../components/Camera";
import { FlatStage, Stay, useStage } from "../../../components/Cast";
import { Grain } from "../../../components/Grain";
import { wave } from "../../../components/Idle";
import { Label } from "../../../components/Label";
import { Place } from "../../../components/Place";
import { Pop, popScale } from "../../../components/Pop";
import { SvgLayer } from "../../../components/SvgLayer";
import {
  clamp,
  cue,
  drop,
  linear,
  mix,
  ramp,
} from "../../../components/timing";
import type { SceneProps } from "../../../video/NarratedVideo";
import { Shot, useShotLength } from "../../../video/Shot";
import { ink, street } from "../palette";
import { AnswerIcon } from "../parts/AnswerIcon";
import {
  ICONS,
  IconRow,
  MapIcon,
  iconSpot,
  type IconKey,
} from "../parts/IconRow";
import { IdeaBackdrop } from "../parts/IdeaBackdrop";
import {
  FRONT,
  FRONT_CLOSE,
  FRONT_OPENING,
  ShopFront,
} from "../parts/ShopFront";
import { ROW_HUE, rowLife } from "./FivePartsScene";
import { NEVER, flash } from "./MaybeBrainScene";
import { driftZoom } from "./SleepDebtScene";

// A fila um pouco à esquerda do centro: o último ícone, o da loja, tem espaço para crescer.
const ROW = { x: 900, y: 540, scale: 1.15 };
const GROWN = 1.3;
// A cascata da entrada: quadros entre um ícone e o seguinte, e quantos cada um leva para assentar.
const CASCADE = { step: 2, frames: 9 };
const TURN_SECONDS = 0.3;

// A cascata começa estes quadros antes da cena, por baixo das molduras e da lupa de `so-far`, que encolhem.
const MAP_LEAD = 10;

type MapRowProps = {
  /** O quadro do plano que se desenha: negativo, antes de ele chegar. */
  readonly frame: number;
  /** A duração do plano, para a deriva. */
  readonly length: number;
  /** Quadro do plano em que a porta da loja acende. */
  readonly shopAt: number;
  /** O quadro do vídeo em que o plano começa: o pulso da fila conta nele. */
  readonly clock: number;
  /** Quanto o fundo já passou do menta do pedestal ao lilás: os ícones apagados vão junto. */
  readonly tinted: number;
};

/** A fila do plano num quadro dele: é o mesmo desenho no prelúdio, antes da cena, e no plano. */
const MapRow: React.FC<MapRowProps> = ({
  frame,
  length,
  shopAt,
  clock,
  tinted,
}) => {
  const { fps } = useVideoConfig();
  const life = rowLife((clock + frame) / fps);
  // A fila entra em cascata, e a cascata começa antes da cena: na primeira palavra ela já está no lugar.
  const present: Partial<Record<IconKey, number>> = {};
  ICONS.forEach((icon, index) => {
    const at = index * CASCADE.step - MAP_LEAD;
    present[icon] = popScale(frame, at, CASCADE.frames, 0);
  });

  return (
    <IconRow
      {...ROW}
      // A deriva termina no quadro composto: é dele que o ícone da loja parte no plano seguinte.
      scale={ROW.scale * driftZoom(frame, length)}
      hue={ROW_HUE}
      tint={{ from: "mint", progress: tinted }}
      states={{
        eyes: "check",
        ruler: "cross",
        brain: "cross",
        alarm: "cross",
        shop: frame >= shopAt ? "on" : "off",
      }}
      // Antes da cena nada mudou ainda, e o relógio de quem desenha o prelúdio é outro.
      since={frame < 0 ? {} : { shop: shopAt }}
      turning={
        frame >= shopAt
          ? {
              shop: {
                from: "off",
                progress: ramp(frame, shopAt, TURN_SECONDS * fps),
              },
            }
          : {}
      }
      grow={{
        ...life.grow,
        shop:
          (life.grow.shop ?? 1) * mix(1, GROWN, ramp(frame, shopAt, 0.5 * fps)),
      }}
      lift={life.lift}
      tilt={life.tilt}
      motion={life.motion}
      present={present}
    />
  );
};

/** Quantos quadros antes da cena o prelúdio da fila começa. */
export const LAST_MAP_LEAD = MAP_LEAD;

type MapPreludeProps = {
  /** Quantos quadros faltam para a cena começar. */
  readonly until: number;
  /** O quadro do vídeo em que a cena começa. */
  readonly clock: number;
};

/**
 * A fila entrando, antes de a cena começar: o último plano de `so-far` a
 * desenha por baixo das molduras, do pedestal e da lupa, que encolhem, e a
 * troca não deixa a tela só com o fundo. O plano abre no estado em que isto parou.
 */
export const LastMapPrelude: React.FC<MapPreludeProps> = ({ until, clock }) => (
  <MapRow
    frame={-until}
    // Antes do plano a deriva está no começo dela, seja qual for a duração.
    length={1}
    shopAt={NEVER}
    clock={clock}
    tinted={0}
  />
);

type MapShotProps = {
  /** Quadro do plano em que a porta da loja acende. */
  readonly shopAt: number;
  /** O quadro do vídeo em que o plano começa: o pulso da fila conta nele. */
  readonly clock: number;
};

/** A fila volta pela última vez: os três jeitos estão riscados, e a porta da loja acende e cresce. */
const MapShot: React.FC<MapShotProps> = ({ shopAt, clock }) => {
  const frame = useCurrentFrame();
  const stage = useStage();
  const length = useShotLength();

  return (
    <AbsoluteFill>
      <FlatStage backdrop={<IdeaBackdrop hue={ROW_HUE} spot={[0.8, 0.5]} />}>
        {/* A fila entra na cascata dela e continua no plano seguinte, que a redesenha desde o primeiro quadro: o palco não a põe nem a tira. */}
        {stage.handedOver ? null : (
          <Stay>
            <MapRow
              frame={frame}
              length={length}
              shopAt={shopAt}
              clock={clock}
              tinted={stage.enter()}
            />
          </Stay>
        )}
        <Grain />
      </FlatStage>
    </AbsoluteFill>
  );
};

// A porta de enrolar no meio do quadro, em plano médio; a câmera chega um pouco mais perto ao longo do plano.
const DOOR = {
  x: FRONT.x,
  y: FRONT_OPENING.y + FRONT_OPENING.height / 2,
  bottom: FRONT_OPENING.y + FRONT_OPENING.height,
};
// A câmera olha um pouco acima da porta, para a placa da lua caber no quadro.
const LIFT = 70;
const DOOR_MEDIUM = framing([DOOR.x, DOOR.y - LIFT], 1.08);
const DOOR_MEDIUM_END = framing([DOOR.x, DOOR.y - LIFT + 10], 1.14);
// De perto, a câmera continua chegando devagar até o fim do plano.
const DOOR_CLOSE_END = framing([DOOR.x, DOOR.y], 1.76);
// O ícone da loja, onde o plano anterior o deixou.
const ICON = iconSpot("shop", ROW);
// No desenho do ícone (220 de lado): a largura da porta de enrolar, a que distância do centro fica a
// fresta de luz por baixo dela, o raio do disco da noite e o do anel claro.
const ICON_ART = { side: 220, door: 108, gap: 72, disc: 100, ring: 110 };
// O ícone vira a loja: quando a câmera parte, em quantos quadros chega, e por quantos o desenho do
// ícone ainda cobre a loja de verdade, pequena, antes de sair.
const BECOME = { at: 1, frames: 27, swapAt: 2, swap: 5 };
// O fundo passa à noite da rua no lugar, e o disco do ícone, que é da cor dela, some dentro dela.
const NIGHT = { frames: 12 };
// O anel claro do ícone afina até sumir, em volta da loja que cresce.
const RING = { at: 3, frames: 9 };
// A rua sobe em camadas em volta da loja, quando a câmera já está perto. Ela parte de mais fundo que o
// palco a poria (`from`, em alturas de subida): com a câmera longe tudo é pequeno, a descida de sempre
// encolhe junto, e a calçada inteira apareceria no pé do quadro.
const STREET = { at: 6, frames: 18, from: -4 };
// A fila encolhe, um ícone depois do outro.
const SHRINK = { step: 1, frames: 7 };
// A sombra de quem passa lá dentro leva este tempo para cruzar a fresta, a velocidade constante.
const PASS_SECONDS = 1.2;

/** Onde um ponto do plano do assunto aparece na tela, com a câmera em `camera`. */
export const seen = (
  camera: CameraState,
  [x, y]: readonly [number, number],
): readonly [number, number] => [
  960 + camera.zoom * (x - 960) - camera.x,
  540 + camera.zoom * (y - 540) - camera.y,
];

/** A lâmpada da fachada: acesa, com um tremor pequeno. */
export const lampAt = (seconds: number): number =>
  0.88 + 0.08 * wave(seconds, 1.9) + 0.04 * wave(seconds, 0.37, 0.2);

type DoorShotProps = {
  /** Quadros do plano em que a luz por baixo da porta passa a oscilar e em que a sombra passa por trás da fresta. */
  readonly glowAt: number;
  readonly passAt: number;
  readonly clock: number;
};

/**
 * O ícone cresce e vira a porta da loja baixada, no palco comum: os outros
 * ícones encolhem no ponto, o fundo passa à noite, o anel do ícone afina e
 * some, e a loja de verdade, que estava no lugar do desenho dele, cresce com a
 * câmera enquanto a rua sobe em camadas em volta dela.
 */
const DoorShot: React.FC<DoorShotProps> = ({ glowAt, passAt, clock }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const length = useShotLength();
  const built = useBuild();
  const seconds = (clock + frame) / fps;
  const life = rowLife(seconds);
  // O ícone como o plano anterior o deixou, no último quadro dele: o pulso e a flutuação da fila.
  const before = rowLife((clock - 1) / fps);
  const size = ICON.size * GROWN * (before.grow.shop ?? 1);
  const spot = [ICON.x, ICON.y + (before.lift.shop ?? 0) * ROW.scale] as const;
  // A câmera em que a fresta de luz da loja de verdade cai sobre a do ícone, com a porta da mesma largura.
  const tiny = framing(
    [DOOR.x, DOOR.bottom],
    ((ICON_ART.door / ICON_ART.side) * size) / FRONT_OPENING.width,
    [spot[0], spot[1] + (ICON_ART.gap / ICON_ART.side) * size],
  );
  const camera = cameraBetween(
    tiny,
    cameraBetween(DOOR_MEDIUM, DOOR_MEDIUM_END, Math.min(1, frame / length)),
    ramp(frame, BECOME.at, BECOME.frames),
  );
  // O disco e o anel do ícone acompanham a loja: o centro e o raio vêm de onde a porta está na tela.
  const door = FRONT_OPENING.width * camera.zoom;
  const gap = seen(camera, [DOOR.x, DOOR.bottom]);
  const center = [gap[0], gap[1] - (ICON_ART.gap / ICON_ART.door) * door];
  const radius = (ICON_ART.disc / ICON_ART.door) * door;
  const ring =
    ((ICON_ART.ring - ICON_ART.disc) / ICON_ART.door) *
    door *
    (1 - ramp(frame, RING.at, RING.frames));
  const night = linear(frame, 0, NIGHT.frames);
  const shrinking =
    frame < 1 + (ICONS.length - 1) * SHRINK.step + SHRINK.frames;
  const present: Partial<Record<IconKey, number>> = {};
  ICONS.forEach((icon, index) => {
    present[icon] = 1 - drop(frame, 1 + index * SHRINK.step, SHRINK.frames);
  });
  const swapped = linear(frame, BECOME.swapAt, BECOME.swap);

  return (
    <AbsoluteFill>
      {/* O disco do ícone é a noite da rua: quando o fundo chega à cor dele, não há mais disco. */}
      {night < 1 ? (
        <SvgLayer>
          <circle
            cx={center[0]}
            cy={center[1]}
            r={radius}
            fill={street.night.sky[0]}
            opacity={1 - night}
          />
        </SvgLayer>
      ) : null}
      {/* A noite e a subida da rua são contadas daqui, e não do palco: a loja é a ponte, e a rua só sobe com a câmera já perto dela. */}
      <Build
        {...built}
        lit={night}
        risen={interpolate(
          frame,
          [STREET.at, STREET.at + STREET.frames],
          [STREET.from, 1],
          { ...clamp, easing: Easing.out(Easing.cubic) },
        )}
      >
        <ShopFront
          halo={1}
          time="night"
          shutter={1}
          busy
          standing
          clock={clock}
          camera={camera}
          // A luz fica parada até a deixa; nela, dá um tranco e passa a oscilar.
          flicker={
            1.7 * ramp(frame, glowAt, 0.3 * fps) -
            0.7 * ramp(frame, glowAt + 0.3 * fps, 1 * fps)
          }
          passing={
            frame >= passAt && frame < passAt + PASS_SECONDS * fps
              ? linear(frame, passAt, PASS_SECONDS * fps)
              : undefined
          }
          lamp={lampAt(seconds)}
        />
      </Build>
      {shrinking ? (
        <IconRow
          {...ROW}
          hue={ROW_HUE}
          states={{
            eyes: "check",
            ruler: "cross",
            brain: "cross",
            alarm: "cross",
          }}
          omit={["shop"]}
          grow={life.grow}
          lift={life.lift}
          tilt={life.tilt}
          motion={life.motion}
          present={present}
        />
      ) : null}
      {ring > 0 ? (
        <SvgLayer>
          <circle
            cx={center[0]}
            cy={center[1]}
            r={radius + ring / 2}
            fill="none"
            stroke={ink.ring}
            strokeWidth={ring}
          />
        </SvgLayer>
      ) : null}
      {/* O desenho do ícone cobre a loja pequena nos primeiros quadros: é o mesmo desenho, e a troca não se vê. */}
      {swapped < 1 ? (
        <div
          style={{
            position: "absolute",
            left: center[0],
            top: center[1],
            translate: "-50% -50%",
            opacity: 1 - swapped,
          }}
        >
          <MapIcon
            icon="shop"
            state="on"
            hue={ROW_HUE}
            size={(ICON_ART.side / ICON_ART.door) * door}
          />
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

const MEDALLION = 150;
const CAMERA_SECONDS = 0.8;
// A rua sai cedo e depressa: começa a descer estes quadros antes da troca e some neste tanto, antes
// de a sala de `memory-test` subir. Na marcação do palco ela ainda descia três quadros depois da troca,
// e a sala subia sobre ela.
// A rua termina de descer no quadro em que `memory-test` chega: mais cedo, sobravam dez quadros só de céu.
const STREET_OUT = { lead: 17, frames: 17 };

type AnswerShotProps = {
  /** Quadros do plano em que a interrogação entra, em que o medalhão acende e em que ele pulsa. */
  readonly askAt: number;
  readonly answerAt: number;
  readonly pulseAt: number;
  readonly clock: number;
};

/** De perto: a interrogação na porta e, sobre ela, o medalhão da caixa de estoque. */
const AnswerShot: React.FC<AnswerShotProps> = ({
  askAt,
  answerAt,
  pulseAt,
  clock,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const length = useShotLength();
  const seconds = (clock + frame) / fps;
  const arrive = CAMERA_SECONDS * fps;
  // O medalhão pulsa duas vezes, como um coração, e o clarão cresce com ele.
  const beat =
    flash(frame, pulseAt, 0.4 * fps) +
    0.6 * flash(frame, pulseAt + 0.45 * fps, 0.4 * fps);
  const lit = ramp(frame, answerAt, 0.4 * fps);
  const built = useBuild();

  return (
    <Build
      {...built}
      risen={1 - drop(frame, length - STREET_OUT.lead, STREET_OUT.frames)}
    >
      <ShopFront
        halo={1}
        time="night"
        shutter={1}
        busy
        clock={clock}
        lamp={lampAt(seconds)}
        // Continua o plano anterior: a câmera parte de onde ele parou, chega à porta e segue chegando devagar.
        camera={cameraBetween(
          cameraBetween(DOOR_MEDIUM_END, FRONT_CLOSE, ramp(frame, 0, arrive)),
          DOOR_CLOSE_END,
          linear(frame, arrive, length - arrive),
        )}
      >
        <Place
          x={DOOR.x}
          y={DOOR.y + 76}
          // A interrogação balança devagar, pendurada na dúvida.
          style={{ rotate: `${4 * wave(seconds, 3.4, 0.2)}deg` }}
        >
          <Pop at={askAt} from={0.7} overshoot={1.08}>
            <Label size="display" color={ink.moon}>
              ?
            </Label>
          </Pop>
        </Place>
        <Place
          x={DOOR.x}
          y={DOOR.y - 94 + 5 * wave(seconds, 4.1)}
          style={{ scale: `${1 + 0.1 * beat}` }}
        >
          <Pop at={answerAt}>
            <div style={{ position: "relative", padding: 46 }}>
              {/* O clarão atrás do medalhão: ele acende, e depois respira. */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: "50%",
                  background: `radial-gradient(circle, ${ink.moon}CC 55%, transparent 70%)`,
                  opacity: lit * (0.8 + 0.2 * wave(seconds, 2.2) + 0.2 * beat),
                  scale: `${mix(0.6, 1, lit) * (1 + 0.04 * wave(seconds, 2.2) + 0.14 * beat)}`,
                }}
              />
              <div style={{ position: "relative" }}>
                <AnswerIcon answer="stock" size={MEDALLION} />
              </div>
            </div>
          </Pop>
        </Place>
      </ShopFront>
    </Build>
  );
};

export const ButWhatScene: React.FC<SceneProps> = ({ scene, shots }) => (
  <>
    <Shot range={shots[0]} name="os três jeitos riscados; a loja acende">
      <MapShot shopAt={cue(scene, "última")} clock={scene.from} />
    </Shot>
    <Shot range={shots[1]} name="o ícone vira a porta da loja, de noite">
      <DoorShot
        glowAt={cue(scene, "consegue") - shots[1].from}
        passAt={cue(scene, "faz", 2) - shots[1].from}
        clock={scene.from + shots[1].from}
      />
    </Shot>
    <Shot range={shots[2]} name="a interrogação e o medalhão da caixa">
      <AnswerShot
        askAt={cue(scene, "está") - shots[2].from}
        answerAt={cue(scene, "parte", 2) - shots[2].from}
        pulseAt={cue(scene, "memória") - shots[2].from}
        clock={scene.from + shots[2].from}
      />
    </Shot>
  </>
);
