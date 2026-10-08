import { useId } from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  interpolateColors,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {
  Elephant,
  STRIDE_LENGTH,
  type ElephantColors,
} from "../../../art/Elephant";
import {
  cameraBetween,
  framing,
  type CameraState,
} from "../../../components/Camera";
import { FlatStage, Stay, useStage } from "../../../components/Cast";
import { Grain } from "../../../components/Grain";
import { blink, breath, phaseOf, wave } from "../../../components/Idle";
import { Label } from "../../../components/Label";
import { Place } from "../../../components/Place";
import { Pop } from "../../../components/Pop";
import { SvgLayer } from "../../../components/SvgLayer";
import { cue, linear, mix, ramp, clamp } from "../../../components/timing";
import type { SceneProps } from "../../../video/NarratedVideo";
import { Shot, useShotLength } from "../../../video/Shot";
import { leaveProgress, SCENERY_EXIT_FRAMES } from "../../../video/stage";
import { elephant, elephantNight, ink } from "../palette";
import {
  daylightAt,
  Herd,
  herdPhase,
  orbAt,
  type HerdMember,
  type HerdStride,
} from "../parts/Herd";
import { SAVANNA_GROUND_Y, SavannaShadow } from "../parts/savanna/RichTheme";
import { IdeaBackdrop, IdeaShadow } from "../parts/IdeaBackdrop";
import { Tag } from "../parts/Tag";
import { VacantSign } from "../parts/VacantSign";
import { onScreen, SavannaStage } from "./ElephantsScene";
import { BRAIN_MAP_LEAD, BrainMapPrelude } from "./MaybeBrainScene";
import { Drift, DRIFT, Grow, undrifted } from "./SleepDebtScene";

// As duas do estudo, lado a lado e pequenas no plano: só duas. A de trás vem primeiro. Andam para a
// direita: a da frente é a que para ao lado do pedestal no plano seguinte, virada para ele, e passa
// de um plano ao outro sem se virar.
const PAIR: readonly HerdMember[] = [
  { x: 1160, y: -16, width: 290, seed: "pair-second", flipped: true },
  { x: 820, y: 16, width: 310, seed: "pair-first", flipped: true },
];
// A da frente: é ela quem continua no plano de fundo liso, e dorme lá.
const FIRST = 1;
const FRONT = PAIR[FIRST];
// A caminhada delas: de quão longe vêm, em pixels, e a velocidade, em pixels por quadro.
const WALK = { from: 260, speed: 2 };
const MOON = 0.36;
/**
 * A savana começa a subir antes de o plano aberto chegar, sob o plano anterior:
 * `lead` quadros antes, quando a cama e a faixa dele já encolheram. Sobe em
 * `frames` quadros.
 */
export const PAIR_RISE = { lead: 10, frames: 26 };
// Ela entra no entardecer e anoitece no lugar: o tempo corre do pôr do sol até a lua chegar ao
// lugar dela, subindo, em `frames` quadros a contar do começo da subida. Sobre o pêssego do plano
// anterior o céu que toma a cor é o quente, e não o da noite, que dava um cinza-pardo. `twilight`
// é a medida que dá noite cheia com a lua quase no lugar.
const NIGHTFALL = { frames: 30, twilight: 0.6 };
const WIDE = framing([960, 540], 1);
// O plano aberto deriva devagar para as duas, e termina no quadro composto.
const PAIR_SPOT = [960, 800] as const;
const WIDE_START = framing(PAIR_SPOT, 0.96, PAIR_SPOT);
const ONLY_TWO = { x: 990, y: 560 };
// A barra das duas horas sobre elas, com a ponta em aberto: o número ainda não é certo.
const DOUBT = { x: 640, y: 380, sure: 250, open: 230, height: 66 };

/** A câmera do plano aberto no quadro `at` dele; antes de ele chegar, e sem a duração, está no começo da deriva. */
const wideCamera = (at: number, length?: number): CameraState =>
  cameraBetween(
    WIDE_START,
    WIDE,
    length === undefined ? 0 : linear(at, 0, length),
  );

type ShotClock = {
  /** O quadro do vídeo em que o plano começa: o relógio do cenário. */
  readonly clock: number;
};

type PairProps = {
  /** Sem a da frente: quando ela já saiu do chão da savana e é desenhada por cima dele. */
  readonly alone?: boolean;
  /** Quanto falta andar, em pixels, e a passada. */
  readonly ahead: number;
  readonly stride: HerdStride;
  /** 1 é dia, 0 é noite. */
  readonly daylight: number;
  readonly seconds: number;
};

/** As duas elefantas no chão da savana. Vai dentro de `SavannaStage`. */
const Pair: React.FC<PairProps> = ({
  alone = false,
  ahead,
  stride,
  daylight,
  seconds,
}) => (
  // Elas vêm da esquerda.
  <AbsoluteFill style={{ translate: `${-ahead}px 0` }}>
    {/* A sombra da que saiu é do chão, e desce com ele. */}
    {alone ? (
      <SvgLayer>
        <SavannaShadow
          x={FRONT.x}
          y={SAVANNA_GROUND_Y + (FRONT.y ?? 0) + 6}
          width={FRONT.width * 0.8}
          daylight={daylight}
        />
      </SvgLayer>
    ) : null}
    <Herd
      // A de trás é a primeira da lista: sozinha, fica com os valores dela.
      members={alone ? PAIR.slice(0, FIRST) : PAIR}
      daylight={daylight}
      stride={stride}
      seconds={seconds}
    />
  </AbsoluteFill>
);

type DoubtProps = {
  /** Quadro do plano em que a ponta da barra fica em aberto. */
  readonly at: number;
  readonly seconds: number;
};

/**
 * A incerteza do número, sem depender da etiqueta: a barra "2 h" delas entra
 * inteira e, na fala, a ponta se recolhe e deixa o contorno tracejado, que não
 * se sabe onde termina; a interrogação fica presa ao número, balançando.
 */
const Doubt: React.FC<DoubtProps> = ({ at, seconds }) => {
  const id = useId();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { x, y, sure, open, height } = DOUBT;
  const end = x + sure + open;
  // A parte cheia recua da ponta até onde o número é certo.
  const filled = sure + open * (1 - ramp(frame, at, 0.5 * fps));

  return (
    <>
      <SvgLayer>
        <rect
          x={x + 5}
          y={y - height / 2 + 5}
          width={sure + open - 10}
          height={height - 10}
          rx={height / 2 - 5}
          fill={ink.tag}
          fillOpacity={0.3}
          stroke={ink.tag}
          strokeWidth={10}
          strokeDasharray="20 18"
          strokeLinecap="round"
        />
        {/* A parte cheia, cortada pela forma da barra: inteira, tem a ponta redonda; recuada, termina reta. */}
        <clipPath id={id}>
          <rect
            x={x}
            y={y - height / 2}
            width={sure + open}
            height={height}
            rx={height / 2}
          />
        </clipPath>
        <rect
          x={x}
          y={y - height / 2}
          width={filled}
          height={height}
          fill={ink.tag}
          clipPath={`url(#${id})`}
        />
      </SvgLayer>
      <Place x={end + 24} y={y} style={{ translate: "0 -50%" }}>
        <Tag size="note" on="night">
          2 h
        </Tag>
      </Place>
      <Place
        x={end + 236}
        y={y - 34}
        style={{ rotate: `${12 + 7 * wave(seconds, 1.6)}deg` }}
      >
        <Pop at={at + 0.25 * fps}>
          <Label size="headline" color={ink.moon}>
            ?
          </Label>
        </Pop>
      </Place>
    </>
  );
};

type WidePairProps = ShotClock & {
  /** O quadro do plano aberto que se desenha: negativo, antes de ele chegar. */
  readonly at: number;
  /** A duração do plano aberto, para a deriva da câmera; antes de ele chegar, a câmera está no começo dela. */
  readonly length?: number;
  /** Quanto as camadas já desceram de volta, de 0 a 1: a saída do plano. O céu não desce. */
  readonly sunk?: number;
  /** Sem a da frente, que já saiu do chão. */
  readonly alone?: boolean;
  readonly bare?: boolean;
};

/** A savana de noite, de longe, num quadro do plano aberto: as duas andam, pequenas. */
const WidePair: React.FC<WidePairProps> = ({
  at,
  length,
  sunk = 0,
  alone,
  bare,
  clock,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const walked = WALK.speed * at;
  // Meia volta é o pôr do sol; a lua nasce ali e sobe até o lugar dela.
  const cycles = mix(
    0.5,
    0.5 + MOON / 2,
    ramp(at, -PAIR_RISE.lead, NIGHTFALL.frames),
  );
  const daylight = daylightAt(cycles, NIGHTFALL.twilight);
  // A savana começa a subir antes de o plano chegar, como a das manadas.
  const risen = interpolate(
    at,
    [-PAIR_RISE.lead, PAIR_RISE.frames - PAIR_RISE.lead],
    [0, 1],
    { ...clamp, easing: Easing.out(Easing.cubic) },
  );

  return (
    <SavannaStage
      camera={wideCamera(at, length)}
      daylight={daylight}
      orb={orbAt(cycles)}
      clock={clock}
      risen={risen * (1 - sunk)}
      lit={risen}
      bare={bare}
    >
      <Pair
        alone={alone}
        daylight={daylight}
        ahead={WALK.from - walked}
        stride={{ along: walked, pace: 1 }}
        seconds={(clock + frame) / fps}
      />
    </SavannaStage>
  );
};

type PairPreludeProps = {
  /** Quantos quadros faltam para o plano aberto começar. */
  readonly until: number;
  /** O quadro do vídeo em que começa o plano que desenha isto: o relógio do cenário. */
  readonly clock: number;
};

/**
 * Os primeiros quadros da subida da savana de noite, para o plano anterior
 * desenhar por baixo do que ele ainda tem na tela: a troca não deixa o quadro
 * só com o fundo.
 */
export const PairPrelude: React.FC<PairPreludeProps> = ({ until, clock }) => (
  <WidePair at={-until} clock={clock} bare />
);

const HUE = "mint";
// O plano do pedestal: ela para à esquerda, virada para ele, que continua vazio.
const GROUND = 960;
const SLEEPER = { x: 600, width: 520 };
const SIGN = { x: 1290, y: GROUND, scale: 0.8 };
// O plano deriva para o lugar vazio em cima do pedestal, que é onde a pergunta está.
const SLOT_FOCUS = [SIGN.x, 620] as const;
// A elefanta da frente é comum aos dois planos: não desce com o chão. Quando ele começa a descer,
// ela vai do lugar e do tamanho que tem na savana aos do pedestal, com peso, e para de andar no
// caminho. Em quadros: quanto antes da troca, quanto leva a viagem e quanto leva a freada.
const STAYS = { before: 20, frames: 18, brake: 16 };
// A tromba de quem adormece em pé cai em 0,8 s; a pálpebra desce e a cabeça pende em 0,4 s.
const DROWSE = { trunk: 0.8, lid: 0.4 };
// O foco de luz pisca duas vezes sobre o contorno vazio: a que brilho desce e em quantos quadros.
const FLICKER = { low: 0.25, frames: 16 };

const ELEPHANT_KEYS = Object.keys(elephant) as (keyof ElephantColors)[];
// A fase da orelha e da tromba e a do passo: as que ela tem na `Herd` da savana.
const FRONT_PHASE = herdPhase(FIRST);
const FRONT_GAIT = phaseOf(`gait-${FRONT.seed}`);
// Quantos pixels do quadro ela avança por volta do ciclo de passos, no tamanho que tem na savana.
const FRONT_STRIDE = (STRIDE_LENGTH * FRONT.width) / 520;

type FrontProps = {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  /** Quanto o fundo liso já a ilumina, de 0 (a pintura de noite, da savana, sem a sombra do fundo) a 1. */
  readonly lit?: number;
  /** A caminhada: quanto já andou, em pixels da savana, e o tamanho da passada. Parada, sem valores. */
  readonly stride?: HerdStride;
  /** Quanto a tromba já caiu e quanto ela já dorme (olho fechado, cabeça pendida), de 0 a 1. */
  readonly slack?: number;
  readonly asleep?: number;
  readonly seconds: number;
};

/**
 * A elefanta da frente fora do chão da savana, com a sombra do fundo liso: é o
 * desenho que a `Herd` faz dela, com o mesmo passo, a mesma respiração e a
 * mesma orelha, para ela não mudar de pose quando sai de lá; aqui ela freia,
 * para, deixa a tromba cair e dorme em pé.
 */
const Front: React.FC<FrontProps> = ({
  x,
  y,
  width,
  lit = 1,
  stride = { along: 0, pace: 0 },
  slack = 0,
  asleep = 0,
  seconds,
}) => {
  const awake = 1 - asleep;
  const gait = stride.along / FRONT_STRIDE + FRONT_GAIT;
  const bob =
    stride.pace * width * 0.012 * (0.5 - 0.5 * Math.cos(gait * Math.PI * 8));
  const nod = 0.07 * stride.pace * Math.sin(gait * Math.PI * 4);
  // A pintura passa da noite ao dia com o fundo, em vez de trocar num quadro.
  const colors = Object.fromEntries(
    ELEPHANT_KEYS.map((key) => [
      key,
      interpolateColors(lit, [0, 1], [elephantNight[key], elephant[key]]),
    ]),
  ) as ElephantColors;

  return (
    <>
      <SvgLayer>
        <g opacity={lit}>
          <IdeaShadow hue={HUE} x={x} y={y + 6} width={width * 0.8} />
        </g>
      </SvgLayer>
      <Place
        x={x}
        y={y - bob}
        anchor="bottom"
        style={{
          scale: `-1 ${breath(seconds, FRONT.seed, { amplitude: 0.012, period: 4.5 })}`,
        }}
      >
        <Elephant
          width={width}
          colors={colors}
          // Quem dorme não pisca.
          lid={Math.max(asleep, awake * blink(seconds, FRONT.seed))}
          droop={Math.max(0, asleep + nod)}
          trunk={
            (1 - slack) * (0.15 + 0.1 * wave(seconds, 3.1, FRONT_PHASE)) +
            // Dormindo, a tromba pende e ainda oscila um nada, como um pêndulo.
            asleep * 0.03 * (1 + wave(seconds, 4.7, FRONT_PHASE))
          }
          ear={0.3 * awake + 0.2 * Math.abs(wave(seconds, 2.2, FRONT_PHASE))}
          gait={gait}
          pace={stride.pace}
        />
      </Place>
    </>
  );
};

type OnlyTwoShotProps = ShotClock & {
  /** Quadros do plano em que a etiqueta entra e em que a ponta da barra fica em aberto. */
  readonly twoAt: number;
  readonly doubtAt: number;
};

/** As duas, pequenas, andando de noite: uma amostra de só duas. */
const OnlyTwoShot: React.FC<OnlyTwoShotProps> = ({ twoAt, doubtAt, clock }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const stage = useStage();
  const length = useShotLength();
  const seconds = (clock + frame) / fps;
  const at = Math.min(frame, length);
  const leavesAt = length - STAYS.before;
  const leaving = frame >= leavesAt;
  // A freada dela: a velocidade cai em linha reta até zero, e a passada encurta junto.
  const braking = Math.min(Math.max(0, frame - leavesAt), STAYS.brake);
  const ahead =
    WALK.from -
    WALK.speed *
      (leavesAt + braking - (braking * braking) / (2 * STAYS.brake));
  const moved = ramp(frame, leavesAt, STAYS.frames);
  // Onde ela está na tela, vista pela câmera do plano, nas medidas do plano seguinte, que começa
  // com a deriva dele aberta.
  const camera = wideCamera(at, length);
  const zoom = 1 - DRIFT;
  const [fromX, fromY] = undrifted(
    onScreen(camera, [FRONT.x - ahead, SAVANNA_GROUND_Y + (FRONT.y ?? 0)]),
    SLOT_FOCUS,
    zoom,
  );
  const fromWidth = (FRONT.width * camera.zoom) / zoom;

  return (
    <>
      <WidePair
        at={at}
        length={length}
        clock={clock}
        // O plano seguinte tem outro fundo: as camadas descem, com a de trás, no prazo do palco.
        sunk={leaveProgress(frame, length, 0, SCENERY_EXIT_FRAMES)}
        alone={leaving}
      />
      <Doubt at={doubtAt} seconds={seconds} />
      {/* A etiqueta estoura na fala, e não com o plano; sai com ele. */}
      <Stay only="entering">
        <Place x={ONLY_TWO.x} y={ONLY_TWO.y}>
          <Pop at={twoAt}>
            <Tag size="note" on="night">
              só duas
            </Tag>
          </Pop>
        </Place>
      </Stay>
      {/* A da frente não desce com a savana: vai até o lugar dela ao lado do pedestal, ainda com a
          pintura de noite, e a troca não deixa a tela vazia. Quando o plano seguinte chega, é ele
          quem a desenha. */}
      {leaving && !stage.handedOver ? (
        <Stay>
          <Drift focus={SLOT_FOCUS} zoom={zoom}>
            <Front
              x={mix(fromX, SLEEPER.x, moved)}
              y={mix(fromY, GROUND, moved)}
              width={mix(fromWidth, SLEEPER.width, moved)}
              lit={0}
              stride={{
                along: WALK.speed * frame,
                pace: 1 - braking / STAYS.brake,
              }}
              seconds={seconds}
            />
          </Drift>
        </Stay>
      ) : null}
    </>
  );
};

type VacantShotProps = ShotClock & {
  /** Quadros do plano em que a tromba dela cai, em que o olho fecha e em que o foco de luz pisca. */
  readonly trunkAt: number;
  readonly sleepAt: number;
  readonly flickerAt: number;
};

/** O pedestal "acordado 24 h" cresce ao lado dela e segue sem dono; a tromba cai, o olho fecha: nem ela. */
const VacantShot: React.FC<VacantShotProps> = ({
  trunkAt,
  sleepAt,
  flickerAt,
  clock,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const stage = useStage();
  const length = useShotLength();
  const seconds = (clock + frame) / fps;
  const blinked = (frame - flickerAt) / FLICKER.frames;
  const light =
    blinked <= 0 || blinked >= 1
      ? 1
      : 1 - (1 - FLICKER.low) * Math.sin(blinked * Math.PI * 2) ** 2;

  return (
    <AbsoluteFill>
      <FlatStage backdrop={<IdeaBackdrop hue={HUE} spot={[0.62, 0.5]} />}>
        {/* A fila de `maybe-brain` entra aqui, por baixo do pedestal que encolhe: a troca de cena não
            deixa a tela só com o fundo. Quando a cena dela chega, é ela quem a desenha. */}
        {frame >= length - BRAIN_MAP_LEAD && !stage.handedOver ? (
          <BrainMapPrelude until={length - frame} clock={clock + length} />
        ) : null}
        <Drift focus={SLOT_FOCUS}>
          <Stay only="entering">
            {/* O pedestal entra crescendo do chão; sai como o resto do plano. */}
            <div
              style={{
                position: "absolute",
                left: SIGN.x,
                top: SIGN.y,
              }}
            >
              <Grow at={3} frames={14}>
                <AbsoluteFill
                  style={{
                    left: -SIGN.x,
                    top: -SIGN.y,
                    width: 1920,
                    height: 1080,
                  }}
                >
                  <VacantSign {...SIGN} light={light} />
                </AbsoluteFill>
              </Grow>
            </div>
            {/* Ela já estava no palco, veio da savana: não entra de novo. Chega com a pintura de
                noite e clareia junto com o fundo. */}
            <Front
              x={SLEEPER.x}
              y={GROUND}
              width={SLEEPER.width}
              lit={stage.enter()}
              slack={ramp(frame, trunkAt, DROWSE.trunk * fps)}
              asleep={ramp(frame, sleepAt, DROWSE.lid * fps)}
              seconds={seconds}
            />
          </Stay>
        </Drift>
        <Grain />
      </FlatStage>
    </AbsoluteFill>
  );
};

export const ElephantVerdictScene: React.FC<SceneProps> = ({
  scene,
  shots,
}) => (
  <>
    <Shot range={shots[0]} name="só duas elefantas">
      <OnlyTwoShot
        twoAt={cue(scene, "duas")}
        doubtAt={cue(scene, "pouco")}
        clock={scene.from}
      />
    </Shot>
    <Shot range={shots[1]} name="o pedestal segue sem dono; nem ela">
      <VacantShot
        trunkAt={cue(scene, "nem") - shots[1].from}
        sleepAt={cue(scene, "conseguiu") - shots[1].from}
        flickerAt={cue(scene, "parar") - shots[1].from}
        clock={scene.from + shots[1].from}
      />
    </Shot>
  </>
);
