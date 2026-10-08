import { useId } from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { cameraBetween, framing } from "../../../components/Camera";
import { FlatStage, Stay, useStage } from "../../../components/Cast";
import { Grain } from "../../../components/Grain";
import { wave } from "../../../components/Idle";
import { Label } from "../../../components/Label";
import { Place } from "../../../components/Place";
import { Pop, grown } from "../../../components/Pop";
import { SvgLayer } from "../../../components/SvgLayer";
import { cue, linear, mix, ramp, clamp } from "../../../components/timing";
import type { SceneProps } from "../../../video/NarratedVideo";
import { Shot, useShotLength } from "../../../video/Shot";
import { idea, ink } from "../palette";
import {
  braked,
  Herd,
  herdPhase,
  SleepingElephant,
  type HerdMember,
  type HerdStride,
} from "../parts/Herd";
import { SAVANNA_GROUND_Y, SavannaShadow } from "../parts/savanna/RichTheme";
import { IdeaBackdrop, IdeaShadow } from "../parts/IdeaBackdrop";
import { ELEPHANT_HOURS } from "../parts/SleepRuler";
import { Tag } from "../parts/Tag";
import { VacantSign } from "../parts/VacantSign";
import { onScreen, risenAt, SavannaStage } from "./ElephantsScene";
import { BRAIN_MAP_LEAD, BrainMapPrelude } from "./MaybeBrainScene";
import { Drift, DRIFT, Grow, undrifted } from "./SleepDebtScene";

// As duas do estudo, lado a lado e pequenas no plano: só duas. A de trás vem primeiro. Andam para a
// direita: a da frente é a que dorme virada para a régua e para o pedestal nos planos seguintes, e
// passa de um a outro sem se virar.
const PAIR: readonly HerdMember[] = [
  { x: 1160, y: -16, width: 290, seed: "pair-second", flipped: true },
  { x: 820, y: 16, width: 310, seed: "pair-first", flipped: true },
];
// A da frente: é ela quem para, dorme e continua nos planos de fundo liso.
const FIRST = 1;
// A caminhada delas: de quão longe vêm, em pixels, e a velocidade, em pixels por quadro. O que falta
// quando o plano aberto acaba é percorrido na freada do seguinte (`least` é o mínimo que ela tem).
const WALK = { from: 260, speed: 2, least: 8 };
const MOON = 0.36;
const WIDE = framing([960, 540], 1);
// O plano aberto deriva devagar para as duas, e termina no quadro composto.
const PAIR_SPOT = [960, 800] as const;
const WIDE_START = framing(PAIR_SPOT, 0.96, PAIR_SPOT);
/** A da frente, no plano médio: é ela quem para e dorme. */
const ON_ONE = framing([840, 780], 2, [900, 700]);
const ONLY_TWO = { x: 990, y: 560 };
// A barra das duas horas sobre elas, com a ponta em aberto: o número ainda não é certo.
const DOUBT = { x: 640, y: 380, sure: 250, open: 230, height: 66 };

type ShotClock = {
  /** O quadro do vídeo em que o plano começa: o relógio do cenário. */
  readonly clock: number;
};

type PairProps = {
  /** Sem a da frente: quando ela já saiu do chão da savana e é desenhada por cima dele. */
  readonly alone?: boolean;
  /** Quanto falta andar, em pixels, e a passada; paradas, nada. */
  readonly ahead?: number;
  readonly stride?: HerdStride;
  /** A tromba de cada uma, quando a cena a conduz, e quanto cada uma dorme. */
  readonly trunk?: readonly (number | undefined)[];
  readonly asleep?: readonly [number, number];
  readonly seconds: number;
};

/** As duas elefantas no chão da savana, de noite. Vai dentro de `SavannaStage`. */
const Pair: React.FC<PairProps> = ({
  alone = false,
  ahead = 0,
  stride,
  trunk,
  asleep = [0, 0],
  seconds,
}) => (
  // Elas vêm da esquerda.
  <AbsoluteFill style={{ translate: `${-ahead}px 0` }}>
    <Herd
      // A de trás é a primeira da lista: sozinha, fica com os valores dela.
      members={alone ? PAIR.slice(0, FIRST) : PAIR}
      daylight={0}
      stride={stride}
      trunk={trunk}
      asleep={asleep}
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
  readonly bare?: boolean;
};

/** A savana de noite, de longe, num quadro do plano aberto: as duas andam, pequenas. */
const WidePair: React.FC<WidePairProps> = ({ at, length, bare, clock }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const walked = WALK.speed * at;

  return (
    <SavannaStage
      camera={cameraBetween(
        WIDE_START,
        WIDE,
        length === undefined ? 0 : linear(at, 0, length),
      )}
      daylight={0}
      orb={MOON}
      clock={clock}
      // A savana começa a subir antes de o plano chegar, como a das manadas.
      risen={risenAt(at)}
      bare={bare}
    >
      <Pair
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

type OnlyTwoShotProps = ShotClock & {
  /** Quadros do plano em que a etiqueta entra e em que a ponta da barra fica em aberto. */
  readonly twoAt: number;
  readonly doubtAt: number;
};

/** As duas, pequenas, andando de noite: uma amostra de só duas. */
const OnlyTwoShot: React.FC<OnlyTwoShotProps> = ({ twoAt, doubtAt, clock }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const length = useShotLength();

  return (
    <>
      <WidePair at={Math.min(frame, length)} length={length} clock={clock} />
      <Doubt at={doubtAt} seconds={(clock + frame) / fps} />
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
    </>
  );
};

// A régua do plano seguinte entra nos últimos quadros deste, enquanto o cenário desce.
// Em quadros: quando começa e quanto leva.
// Começa depois de a elefanta sair de onde a barra vai ficar: uma não cresce por baixo da outra.
const RULER_BEFORE = { frames: 12, ruler: 10 };
// A elefanta que dorme é comum aos dois planos: não desce com o chão. Quando ele começa a descer,
// ela vai do lugar e do tamanho que tem na savana aos da régua, com peso. Em quadros antes da troca.
const STAYS = { before: 20, frames: 18 };
// A tromba de quem adormece em pé cai em 0,8 s; a pálpebra desce em 0,3 s.
const DROWSE = { trunk: 0.8, lid: 0.3 };

type AsleepShotProps = ShotClock & {
  /** Quantos quadros durou o plano anterior: é dele que vem o ponto em que a caminhada está. */
  readonly walkedFor: number;
  /** Quadros do plano em que a tromba da frente cai e em que o olho dela fecha; a de trás vai um pouco antes. */
  readonly trunkAt: number;
  readonly sleepAt: number;
};

/** A câmera chega a uma delas, que para de andar; a tromba cai, o olho fecha: ela dorme em pé. */
const AsleepShot: React.FC<AsleepShotProps> = ({
  walkedFor,
  trunkAt,
  sleepAt,
  clock,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const stage = useStage();
  const length = useShotLength();
  const seconds = (clock + frame) / fps;
  // A freada: a velocidade cai em linha reta até zero, e a passada encurta junto.
  const { brake, left: ahead } = braked(WALK, walkedFor, frame);
  // A tromba perde o balanço e desce até ficar solta; a de trás começa antes.
  const idle = (phase: number) => 0.15 + 0.1 * wave(seconds, 3.1, phase);
  const falling = (at: number, phase: number) =>
    idle(phase) * (1 - ramp(frame, at, DROWSE.trunk * fps));
  const lid = (at: number) => ramp(frame, at, DROWSE.lid * fps);
  const beforeAt = length - RULER_BEFORE.frames;
  const first = PAIR[FIRST];
  const leavesAt = length - STAYS.before;
  const leaving = frame >= leavesAt;
  const moved = ramp(frame, leavesAt, STAYS.frames);
  // Onde ela está na tela, no enquadramento em que a câmera parou, nas medidas do plano seguinte.
  const zoom = 1 - DRIFT;
  const [fromX, fromY] = undrifted(
    onScreen(ON_ONE, [first.x, SAVANNA_GROUND_Y + (first.y ?? 0)]),
    ZERO_FOCUS,
    zoom,
  );
  const fromWidth = (first.width * ON_ONE.zoom) / zoom;
  return (
    <>
      <SavannaStage
        camera={cameraBetween(WIDE, ON_ONE, ramp(frame, 0, 0.6 * fps))}
        daylight={0}
        orb={MOON}
        clock={clock}
      >
        {/* A sombra dela é do chão, e desce com ele. */}
        {leaving ? (
          <SvgLayer>
            <SavannaShadow
              x={first.x}
              y={SAVANNA_GROUND_Y + (first.y ?? 0) + 6}
              width={first.width * 0.8}
              daylight={0}
            />
          </SvgLayer>
        ) : null}
        <Pair
          alone={leaving}
          ahead={ahead}
          stride={{
            along: WALK.speed * (walkedFor + frame),
            pace: Math.max(0, 1 - frame / brake),
          }}
          trunk={[falling(trunkAt - 0.3 * fps, 0), falling(trunkAt, 0.37)]}
          asleep={[lid(sleepAt - 0.3 * fps), lid(sleepAt)]}
          seconds={seconds}
        />
      </SavannaStage>
      {/* A régua do plano seguinte entra aqui, enquanto a savana desce, e a elefanta que dorme vai até
          o lugar dela ao lado da régua: a troca não deixa a tela vazia, e ela não sai. Quando o plano
          seguinte chega, é ele quem as desenha. */}
      {leaving && !stage.handedOver ? (
        <Stay>
          <Drift focus={ZERO_FOCUS} zoom={zoom}>
            {frame >= beforeAt ? (
              <AbsoluteFill
                style={{
                  transformOrigin: `${CLOSE.zero + CLOSE.hour}px ${CLOSE.bar}px`,
                  scale: `${grown(frame, beforeAt, RULER_BEFORE.ruler)}`,
                }}
              >
                <CloseRuler />
              </AbsoluteFill>
            ) : null}
            {/* Ainda de noite: é o fundo do plano seguinte que a clareia, quando toma a cor. */}
            <Sleeper
              x={mix(fromX, WHO.x, moved)}
              y={mix(fromY, WHO.y, moved)}
              width={mix(fromWidth, WHO.width, moved)}
              lit={0}
              seconds={seconds}
            />
          </Drift>
        </Stay>
      ) : null}
    </>
  );
};

const HUE = "mint";
const TONE = idea[HUE].contact;
// A régua, de perto: o zero e as primeiras horas enchem o quadro, com as demais saindo pela direita.
// A barra dela vai do zero a "2 h"; a elefanta, grande, fica cortada pela borda esquerda.
const CLOSE = { zero: 560, hour: 420, line: 690, bar: 440, height: 230 };
const SHOWN_HOURS = 4;
const ZERO = { y: CLOSE.line + 148, radius: 104 };
const WHO = { x: CLOSE.zero - 370, y: CLOSE.bar + 150, width: 500 };
// A barra tenta chegar mais perto do zero: quanto encolhe, em horas, e os tempos, em quadros (encolhe, treme, volta).
const SHRINK = { hours: 0.3, in: 9, shake: 10, back: 6 };
// O plano deriva para o zero, que é onde a pergunta está.
const ZERO_FOCUS = [CLOSE.zero, CLOSE.line] as const;

type CloseRulerProps = {
  /** Quadro em que a barra tenta encolher, e quadro em que o contorno do zero pisca; sem valores, nada acontece. */
  readonly shrinkAt?: number;
  readonly emptyAt?: number;
};

/** O começo da régua de 24 horas: a barra dela em "2 h" e o zero, onde nenhuma barra parou. */
const CloseRuler: React.FC<CloseRulerProps> = ({ shrinkAt, emptyAt }) => {
  const frame = useCurrentFrame();
  // Encolhe um pouco na direção do zero, treme sem conseguir passar dali, e volta para as duas horas.
  const shaken = shrinkAt === undefined ? 0 : frame - shrinkAt - SHRINK.in;
  const lost =
    shrinkAt === undefined
      ? 0
      : interpolate(
          frame,
          [
            shrinkAt,
            shrinkAt + SHRINK.in,
            shrinkAt + SHRINK.in + SHRINK.shake,
            shrinkAt + SHRINK.in + SHRINK.shake + SHRINK.back,
          ],
          [0, 1, 1, 0],
          { ...clamp, easing: Easing.inOut(Easing.quad) },
        ) +
        (shaken > 0 && shaken < SHRINK.shake
          ? 0.25 * Math.sin((shaken / SHRINK.shake) * Math.PI * 6)
          : 0);
  const width = CLOSE.hour * (ELEPHANT_HOURS - SHRINK.hours * lost);
  // O contorno vazio pisca duas vezes: cresce e clareia, e volta.
  const blinked = emptyAt === undefined ? 1 : (frame - emptyAt) / 16;
  const flash =
    blinked <= 0 || blinked >= 1 ? 0 : Math.sin(blinked * Math.PI * 2) ** 2;

  return (
    <>
      <SvgLayer>
        <rect
          x={CLOSE.zero}
          y={CLOSE.bar - CLOSE.height / 2}
          width={width}
          height={CLOSE.height}
          rx={CLOSE.height / 2}
          fill={ink.tag}
        />
        <g stroke={TONE} strokeWidth={14} strokeLinecap="round">
          <line
            x1={CLOSE.zero}
            y1={CLOSE.line}
            x2={CLOSE.zero + CLOSE.hour * SHOWN_HOURS}
            y2={CLOSE.line}
          />
          {Array.from({ length: SHOWN_HOURS }, (_, hour) => (
            <line
              key={hour}
              x1={CLOSE.zero + hour * CLOSE.hour}
              y1={CLOSE.line}
              x2={CLOSE.zero + hour * CLOSE.hour}
              y2={CLOSE.line + (hour === 0 ? 40 : 44)}
              opacity={hour === 0 ? 1 : 0.6}
            />
          ))}
        </g>
        {/* O lugar de quem zerasse o sono: um contorno, vazio. */}
        <circle
          cx={CLOSE.zero}
          cy={ZERO.y}
          r={ZERO.radius * (1 + 0.14 * flash)}
          fill={ink.tag}
          fillOpacity={0.35 * flash}
          stroke={ink.tag}
          strokeWidth={14 + 6 * flash}
          strokeDasharray="30 24"
          strokeLinecap="round"
        />
      </SvgLayer>
      <Place x={CLOSE.zero} y={ZERO.y}>
        <Label size="headline" color={TONE}>
          0
        </Label>
      </Place>
      <Place
        x={CLOSE.zero + width + 36}
        y={CLOSE.bar}
        style={{ translate: "0 -50%" }}
      >
        <Tag size="headline" on={HUE}>
          2 h
        </Tag>
      </Place>
    </>
  );
};

// O plano aberto: ela dorme à esquerda, virada para o pedestal, que continua vazio.
const GROUND = 960;
const SLEEPER = { x: 600, width: 520 };
const SIGN = { x: 1290, y: GROUND, scale: 0.8 };
// De onde a câmera vem: no plano da régua, ela está mais para cima e para a esquerda, e um pouco menor.
const FROM_RULER = {
  x: WHO.x - SLEEPER.x,
  y: WHO.y - GROUND,
  scale: WHO.width / SLEEPER.width,
};
// O foco de luz pisca duas vezes sobre o contorno vazio: a que brilho desce e em quantos quadros.
const FLICKER = { low: 0.25, frames: 16 };

type SleeperProps = {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  /** Quanto o fundo liso já a ilumina, de 0 (a pintura de noite, da savana, sem a sombra do fundo) a 1. */
  readonly lit?: number;
  readonly seconds: number;
};

/**
 * A elefanta dormindo em pé sobre o fundo liso, com a sombra dela. É a da
 * frente da savana, com a mesma respiração e a mesma orelha.
 */
const Sleeper: React.FC<SleeperProps> = ({
  x,
  y,
  width,
  lit = 1,
  seconds,
}) => (
  <>
    <SvgLayer>
      <g opacity={lit}>
        <IdeaShadow hue={HUE} x={x} y={y + 6} width={width * 0.8} />
      </g>
    </SvgLayer>
    <SleepingElephant
      x={x}
      y={y}
      width={width}
      flipped
      seed={PAIR[FIRST].seed}
      phase={herdPhase(FIRST)}
      daylight={lit}
      seconds={seconds}
    />
  </>
);

type ZeroShotProps = ShotClock & {
  readonly shrinkAt: number;
  readonly emptyAt: number;
};

/** A régua de perto: a barra dela tenta chegar ao zero, treme e fica nas duas horas; o zero continua vazio. */
const ZeroShot: React.FC<ZeroShotProps> = ({ shrinkAt, emptyAt, clock }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const stage = useStage();
  const seconds = (clock + frame) / fps;

  return (
    <AbsoluteFill>
      <FlatStage backdrop={<IdeaBackdrop hue={HUE} spot={[0.4, 0.5]} />}>
        <Drift focus={ZERO_FOCUS}>
          {/* A régua já estava no palco, entrou no fim do plano anterior: não entra de novo; sai com este. */}
          <Stay only="entering">
            <CloseRuler shrinkAt={shrinkAt} emptyAt={emptyAt} />
          </Stay>
          {/* Ela também já estava, e continua no plano seguinte: quando ele chega, é ele quem a desenha.
              Chega com a pintura de noite e clareia junto com o fundo. */}
          {stage.handedOver ? null : (
            <Stay>
              <Sleeper {...WHO} lit={stage.enter()} seconds={seconds} />
            </Stay>
          )}
        </Drift>
        <Grain />
      </FlatStage>
    </AbsoluteFill>
  );
};

type VacantShotProps = ShotClock & {
  /** Quadro do plano em que o foco de luz pisca. */
  readonly flickerAt: number;
};

/** A câmera recua da régua até o pedestal "acordado 24 h", que segue sem dono; a elefanta dorme ao lado dele. */
const VacantShot: React.FC<VacantShotProps> = ({ flickerAt, clock }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const stage = useStage();
  const length = useShotLength();
  const seconds = (clock + frame) / fps;
  // A elefanta é o que os dois planos têm em comum: a câmera vai do lugar dela na régua ao chão do pedestal, com peso.
  const back = ramp(frame, 0, 0.7 * fps);
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
        <AbsoluteFill
          style={{
            transformOrigin: `${SLEEPER.x}px ${GROUND}px`,
            translate: `${mix(FROM_RULER.x, 0, back)}px ${mix(FROM_RULER.y, 0, back)}px`,
            scale: `${mix(FROM_RULER.scale, 1, back)}`,
          }}
        >
          {/* O pedestal entra crescendo do chão enquanto a câmera recua; sai como o resto do plano. */}
          <Stay only="entering">
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
            {/* Ela já estava no palco, no plano da régua: não entra de novo. */}
            <Sleeper
              x={SLEEPER.x}
              y={GROUND}
              width={SLEEPER.width}
              seconds={seconds}
            />
          </Stay>
        </AbsoluteFill>
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
    <Shot range={shots[1]} name="ela para e dorme em pé">
      <AsleepShot
        walkedFor={shots[0].to - shots[0].from}
        trunkAt={cue(scene, "sempre") - shots[1].from}
        sleepAt={cue(scene, "dormir") - shots[1].from}
        clock={scene.from + shots[1].from}
      />
    </Shot>
    <Shot range={shots[2]} name="2 h na régua; o zero, vazio">
      <ZeroShot
        shrinkAt={cue(scene, "perto") - shots[2].from}
        emptyAt={cue(scene, "parou") - shots[2].from}
        clock={scene.from + shots[2].from}
      />
    </Shot>
    <Shot range={shots[3]} name="o pedestal segue sem dono">
      <VacantShot
        flickerAt={cue(scene, "parar") - shots[3].from}
        clock={scene.from + shots[3].from}
      />
    </Shot>
  </>
);
