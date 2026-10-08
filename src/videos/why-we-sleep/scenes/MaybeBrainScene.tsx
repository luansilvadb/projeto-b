import { useMemo } from "react";
import {
  AbsoluteFill,
  Freeze,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Brain } from "../../../art/Brain";
import { Elephant } from "../../../art/Elephant";
import { Person } from "../../../art/Person";
import {
  Build,
  cameraBetween,
  framing,
  useBuild,
} from "../../../components/Camera";
import {
  castScale,
  FlatStage,
  StageContext,
  Stay,
  useStage,
  type Stage,
} from "../../../components/Cast";
import { Grain } from "../../../components/Grain";
import { blink, breath, wave } from "../../../components/Idle";
import { Place } from "../../../components/Place";
import { Pop, popScale } from "../../../components/Pop";
import { SvgLayer } from "../../../components/SvgLayer";
import { cue, drop, mix, ramp, clamp } from "../../../components/timing";
import type { SceneProps } from "../../../video/NarratedVideo";
import { Shot, useShotLength } from "../../../video/Shot";
import { enterProgress, markFor } from "../../../video/stage";
import {
  brainHalves,
  chalkboard,
  elephant,
  idea,
  ink,
  lab,
  person,
  researcher,
} from "../palette";
import { IdeaBackdrop, IdeaShadow } from "../parts/IdeaBackdrop";
import {
  ICONS,
  IconRow,
  MapIcon,
  iconSpot,
  type IconKey,
} from "../parts/IconRow";
import { LAB, TANK_CENTER } from "../parts/Laboratory";
import { Tag } from "../parts/Tag";
import { RESEARCHER, TankShot } from "../parts/TankShot";
import { ROW_HUE, rowLife } from "./FivePartsScene";
import { JellyfishOpening } from "./JellyfishScene";
import { Drift, Grow, driftZoom, drifted } from "./SleepDebtScene";

/**
 * O elenco de um plano entra antes da marcação de sempre: quem abre o plano
 * precisa estar no lugar quando a primeira palavra dele soa, e a marcação só o
 * põe lá meio segundo depois. Serve às cenas do capítulo da água-viva.
 */
export const Sooner: React.FC<{ by: number; children: React.ReactNode }> = ({
  by,
  children,
}) => {
  const stage = useStage();
  const sooner = useMemo(
    () => ({
      ...stage,
      enter: (delay = 0, frames?: number) =>
        stage.enter(Math.max(0, delay - by), frames),
    }),
    [stage, by],
  );
  return (
    <StageContext.Provider value={sooner}>{children}</StageContext.Provider>
  );
};

/**
 * Como `Sooner`, sem parar no primeiro quadro: a entrada começou `by` quadros
 * antes da marcação, mesmo que isso caia antes de o plano começar. Serve ao
 * plano que abre uma cena cujo elenco já vinha entrando no fim da cena
 * anterior, desenhado por ela com `Ahead`: ele continua de onde ela parou.
 */
export const Early: React.FC<{ by: number; children: React.ReactNode }> = ({
  by,
  children,
}) => {
  const stage = useStage();
  const early = useMemo(
    () => ({
      ...stage,
      enter: (delay = 0, frames?: number) => stage.enter(delay - by, frames),
    }),
    [stage, by],
  );
  return (
    <StageContext.Provider value={early}>{children}</StageContext.Provider>
  );
};

/**
 * O palco de um plano `until` quadros antes de ele começar: o elenco que está
 * aqui dentro tem a escala que terá com `Early by` nesse quadro, e não sai. É
 * o prelúdio: o último plano de uma cena desenha, por baixo do que ainda tem
 * na tela, o elenco da cena seguinte já entrando (as cenas não se sobrepõem
 * antes do primeiro quadro da nova), e a troca não deixa a tela só com o fundo.
 */
export const Ahead: React.FC<{
  until: number;
  by: number;
  children: React.ReactNode;
}> = ({ until, by, children }) => {
  const ahead = useMemo(
    () => ({
      enter: (delay = 0, frames?: number) =>
        enterProgress(-until, delay - by, frames),
      leave: () => 0,
      handedOver: false,
      cast: true,
    }),
    [until, by],
  );
  return (
    <StageContext.Provider value={ahead}>{children}</StageContext.Provider>
  );
};

/** Quantos quadros antes da cena o plano que a abre começa a entrar, quando a cena anterior o desenha. */
const PRELUDE_LEAD = 8;

// A entrada adiantada de um plano inteiro: o cenário e o elenco começam antes, e o fundo não. O fundo é
// quem pede a entrada sem atraso nem duração (`FlatStage`, a cor que acompanha o fundo): ele só toma a
// cor quando a cena chega, por cima da cena anterior, e adiantado cobriria o que ela ainda tem na tela.
const hastened =
  (enter: Stage["enter"], by: number): Stage["enter"] =>
  (delay = 0, frames) =>
    delay === 0 && frames === undefined ? enter() : enter(delay - by, frames);

type PreludeProps = {
  /** Quantos quadros antes da cena o cenário começa a subir, e quantos o elenco se adianta. */
  readonly lead?: number;
  readonly cast?: number;
  readonly children: React.ReactNode;
};

/**
 * O prelúdio de um plano inteiro: nos últimos `lead` quadros do plano em que
 * está, desenha por cima dele o plano que abre a cena seguinte, parado no
 * primeiro quadro, sem o fundo, com o cenário já subindo e o elenco já
 * entrando. A troca de cena não deixa a tela só com o fundo, e a
 * ordem das camadas não muda quando a cena chega: o plano novo já estava por
 * cima. A cena seguinte abre com `Preluded`, de onde isto parou.
 */
export const Prelude: React.FC<
  Omit<PreludeProps, "children"> & {
    /**
     * O plano que abre a cena seguinte, com as deixas dele em `NEVER`. Quem
     * entra por conta própria, e não pela marcação do palco, pede quantos
     * quadros faltam para a cena e adianta a entrada com eles.
     */
    readonly children: React.ReactNode | ((until: number) => React.ReactNode);
  }
> = ({ lead = PRELUDE_LEAD, cast = lead, children }) => {
  const frame = useCurrentFrame();
  const until = useShotLength() - frame;
  const stage = useMemo<Stage>(
    () => ({
      enter: hastened(
        (delay, frames) => enterProgress(-until, delay, frames),
        cast,
      ),
      leave: () => 0,
      handedOver: false,
      cast: true,
    }),
    [until, cast],
  );
  // Quando a cena chega, é ela quem desenha o plano.
  if (until <= 0 || until > Math.max(lead, cast)) {
    return null;
  }
  return (
    // O plano fica no primeiro quadro dele: nenhuma deixa aconteceu, e cada curva está no começo dela. (Não
    // num quadro negativo: o `AbsoluteFill` do Remotion é um `Sequence`, e não desenha nada antes do quadro 0.)
    <Freeze frame={0}>
      <StageContext.Provider value={stage}>
        <Build lit={0} risen={enterProgress(lead - until)}>
          {typeof children === "function" ? children(until) : children}
        </Build>
      </StageContext.Provider>
    </Freeze>
  );
};

/**
 * O plano que abre uma cena e que a cena anterior já vinha desenhando com
 * `Prelude`, com os mesmos `lead` e `cast`: o cenário e o elenco continuam a
 * entrada de onde o prelúdio parou, e a saída é a do palco.
 */
export const Preluded: React.FC<PreludeProps> = ({
  lead = PRELUDE_LEAD,
  cast = lead,
  children,
}) => {
  const frame = useCurrentFrame();
  const stage = useStage();
  const built = useBuild();
  const early = useMemo(
    () => ({ ...stage, enter: hastened(stage.enter, cast) }),
    [stage, cast],
  );
  return (
    <StageContext.Provider value={early}>
      <Build
        {...built}
        // Enquanto o fundo ainda toma a cor dele, o plano está chegando: depois disso vale o palco, que o tira de cena.
        risen={built.lit < 1 ? enterProgress(frame + lead) : built.risen}
      >
        {children}
      </Build>
    </StageContext.Provider>
  );
};

/**
 * A escala com que o palco põe e tira o elenco que está em `x`, adiantada em
 * `by` quadros: para a sombra crescer com o dono. Com `early`, a entrada pode
 * ter começado antes do plano, como em `Early`.
 */
export const useCastScale = (x: number, by = 0, early = false): number => {
  const stage = useStage();
  return castScale(
    {
      ...stage,
      enter: (delay = 0, frames) =>
        stage.enter(early ? delay - by : Math.max(0, delay - by), frames),
    },
    markFor("actor", x),
  );
};

/**
 * O cenário deste plano não sobe nem desce com o palco: já está de pé no
 * primeiro quadro e continua de pé no último. Serve ao plano que faz a própria
 * passagem por dentro (a varredura, a câmera que atravessa o sino), com o
 * cenário inteiro por baixo dela.
 */
export const Standing: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const built = useBuild();
  return (
    <Build {...built} lit={1} risen={1}>
      {children}
    </Build>
  );
};

/** Um vaivém que morre: `turns` idas e voltas em `frames` quadros, a partir de `at`. */
export const shake = (
  frame: number,
  at: number,
  frames: number,
  amount: number,
  turns: number,
): number => {
  const t = (frame - at) / frames;
  return t <= 0 || t >= 1
    ? 0
    : amount * (1 - t) * Math.sin(t * turns * Math.PI * 2);
};

/** Um pisca: sobe a 1 em `frames / 2` quadros e volta, a partir de `at`. */
export const flash = (frame: number, at: number, frames: number): number =>
  interpolate(frame, [at, at + frames / 2, at + frames], [0, 1, 0], clamp);

// A fila no mesmo lugar em que `debt-returns` a deixou.
const ROW = { x: 960, y: 560, scale: 1.12 };
// A cascata da entrada: quadros entre um ícone e o seguinte, e quantos cada um leva para assentar.
const CASCADE = { step: 2, frames: 9 };
const TURN_SECONDS = 0.3;
// Aceso, o contorno do cérebro fica maior que os outros: é dele que o plano seguinte parte.
const CHOSEN = 1.3;

// A fila começa a entrar estes quadros antes da cena, por baixo do pedestal de `elephant-verdict`, que encolhe.
const MAP_LEAD = 9;

type MapRowProps = {
  /** O quadro do plano que se desenha: negativo, antes de ele chegar. */
  readonly frame: number;
  /** A duração do plano, para a deriva. */
  readonly length: number;
  /** Quadros do plano em que a régua ganha o X e em que o contorno do cérebro acende. */
  readonly crossAt: number;
  readonly nextAt: number;
  /** O quadro do vídeo em que o plano começa: o pulso da fila conta nele. */
  readonly clock: number;
  /** Quanto o fundo já passou do menta do pedestal ao lilás: os ícones apagados vão junto. */
  readonly tinted: number;
};

/** A fila do plano num quadro dele: é o mesmo desenho no prelúdio, antes da cena, e no plano. */
const MapRow: React.FC<MapRowProps> = ({
  frame,
  length,
  crossAt,
  nextAt,
  clock,
  tinted,
}) => {
  const { fps } = useVideoConfig();
  const life = rowLife((clock + frame) / fps);
  const turnFrames = TURN_SECONDS * fps;
  // A fila entra em cascata, e a cascata começa antes da cena: na primeira palavra ela já está no lugar.
  const present: Partial<Record<IconKey, number>> = {};
  ICONS.forEach((icon, index) => {
    const at = index * CASCADE.step - MAP_LEAD;
    present[icon] = popScale(frame, at, CASCADE.frames, 0);
  });

  return (
    <IconRow
      {...ROW}
      // A deriva termina no quadro composto: é dele que o contorno sai no plano seguinte.
      scale={ROW.scale * driftZoom(frame, length)}
      hue={ROW_HUE}
      tint={{ from: "mint", progress: tinted }}
      states={{
        eyes: "check",
        ruler: frame >= crossAt ? "cross" : "on",
        brain: frame >= nextAt ? "on" : "off",
      }}
      // Antes da cena nada mudou ainda, e o relógio de quem desenha o prelúdio é outro.
      since={frame < 0 ? {} : { ruler: crossAt, brain: nextAt }}
      turning={{
        ...(frame >= crossAt
          ? {
              ruler: {
                from: "on",
                progress: ramp(frame, crossAt, turnFrames),
              },
            }
          : {}),
        ...(frame >= nextAt
          ? {
              brain: {
                from: "off",
                progress: ramp(frame, nextAt, turnFrames),
              },
            }
          : {}),
      }}
      grow={{
        ...life.grow,
        brain:
          (life.grow.brain ?? 1) *
          mix(1, CHOSEN, ramp(frame, nextAt, 0.5 * fps)),
      }}
      lift={life.lift}
      tilt={life.tilt}
      motion={life.motion}
      present={present}
    />
  );
};

/** O quadro de uma deixa que ainda não aconteceu: no prelúdio, antes da cena, nenhuma aconteceu. (Finito: `interpolate` recusa o infinito.) */
export const NEVER = 1e6;

/** Quantos quadros antes da cena o prelúdio da fila começa. */
export const BRAIN_MAP_LEAD = MAP_LEAD;

type MapPreludeProps = {
  /** Quantos quadros faltam para a cena começar. */
  readonly until: number;
  /** O quadro do vídeo em que a cena começa. */
  readonly clock: number;
};

/**
 * A fila entrando, antes de a cena começar: o último plano de
 * `elephant-verdict` a desenha por baixo do pedestal que encolhe, e a troca
 * não deixa a tela só com o fundo. O plano abre no estado em que isto parou.
 */
export const BrainMapPrelude: React.FC<MapPreludeProps> = ({
  until,
  clock,
}) => (
  <MapRow
    frame={-until}
    // Antes do plano a deriva está no começo dela, seja qual for a duração.
    length={1}
    crossAt={NEVER}
    nextAt={NEVER}
    clock={clock}
    tinted={0}
  />
);

type MapShotProps = {
  /** Quadros do plano em que a régua ganha o X e em que o contorno do cérebro acende. */
  readonly crossAt: number;
  readonly nextAt: number;
  /** O quadro do vídeo em que o plano começa: o pulso da fila conta nele. */
  readonly clock: number;
};

/** A fila volta: a régua, "1", ganha um X, e o contorno sem cérebro, "2", acende. */
const MapShot: React.FC<MapShotProps> = ({ crossAt, nextAt, clock }) => {
  const frame = useCurrentFrame();
  const stage = useStage();
  const length = useShotLength();

  return (
    <AbsoluteFill>
      <FlatStage backdrop={<IdeaBackdrop hue={ROW_HUE} spot={[0.5, 0.5]} />}>
        {/* A fila continua no plano seguinte, que passa a desenhá-la: aqui ela não sai. */}
        {stage.handedOver ? null : (
          <Stay>
            <MapRow
              frame={frame}
              length={length}
              crossAt={crossAt}
              nextAt={nextAt}
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

// O contorno parte de onde estava na fila, já crescido, e enche o quadro.
const SPOT = iconSpot("brain", ROW);
const FULL = { x: 960, y: 540, size: 1020 };
const GROW = { at: 2, seconds: 0.9 };
// A fila encolhe atrás dele, um ícone depois do outro.
const SHRINK = { step: 2, frames: 10 };

/** O contorno aceso, solto da fila, no ponto e no tamanho pedidos: é o mesmo desenho nos dois planos por que ele passa. */
const BrainDisc: React.FC<{
  x: number;
  y: number;
  size: number;
  tilt: number;
}> = ({ x, y, size, tilt }) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      translate: "-50% -50%",
      rotate: `${tilt}deg`,
    }}
  >
    <MapIcon icon="brain" state="on" hue={ROW_HUE} size={size} />
  </div>
);

// O disco cheio gira devagar, de um lado para o outro: é o tracejado dele que se vê mexer.
const discTilt = (seconds: number): number => 4 * wave(seconds, 5.2, 0.1);

/** O contorno do cérebro sai da fila e cresce até encher o quadro; a fila encolhe atrás dele. */
const GrowShot: React.FC<{ clock: number }> = ({ clock }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const stage = useStage();
  const seconds = (clock + frame) / fps;
  const life = rowLife(seconds);
  const grown = ramp(frame, GROW.at, GROW.seconds * fps);
  const present: Partial<Record<IconKey, number>> = {};
  ICONS.forEach((icon, index) => {
    // O contorno da fila some logo, por baixo do que cresce; os outros, da esquerda para a direita.
    present[icon] =
      1 -
      ramp(
        frame,
        GROW.at + (icon === "brain" ? 0 : index * SHRINK.step),
        icon === "brain" ? 4 : SHRINK.frames,
      );
  });
  const from = SPOT.size * CHOSEN * (life.grow.brain ?? 1);

  return (
    <AbsoluteFill>
      <FlatStage backdrop={<IdeaBackdrop hue={ROW_HUE} spot={[0.5, 0.5]} />}>
        <Stay>
          <IconRow
            {...ROW}
            hue={ROW_HUE}
            states={{ eyes: "check", ruler: "cross", brain: "on" }}
            grow={{ ...life.grow, brain: (life.grow.brain ?? 1) * CHOSEN }}
            lift={life.lift}
            tilt={life.tilt}
            motion={life.motion}
            present={present}
          />
          {/* O plano seguinte recebe o disco cheio e o leva para a cabeça da elefanta. */}
          {stage.handedOver ? null : (
            <BrainDisc
              x={mix(SPOT.x, FULL.x, grown)}
              y={mix(
                SPOT.y + (life.lift.brain ?? 0) * ROW.scale,
                FULL.y,
                grown,
              )}
              // A escala cresce em proporção, para a velocidade aparente ser a mesma do começo ao fim.
              size={from * (FULL.size / from) ** grown}
              tilt={mix(life.tilt.brain ?? 0, discTilt(seconds), grown)}
            />
          )}
        </Stay>
        <Grain />
      </FlatStage>
    </AbsoluteFill>
  );
};

const GROUND = 980;
const ELEPHANT = { x: 520, width: 800 };
const YOU = { x: 1420, height: 760 };
// Onde o cérebro fica dentro de cada cabeça, nas unidades de cada desenho, e a largura dele.
const ELEPHANT_BRAIN = { x: 92, y: -330, width: 88 };
// Na pessoa ele fica dentro do contorno da cabeça, entre o alto do cabelo e as sobrancelhas: maior, saía pelo alto e lia como chapéu.
const PERSON_BRAIN = { x: 4, y: -540, width: 104 };
const SIGN = { x: 985, y: 330, drop: 420 };
const SUSPECTS_FOCUS = [960, 520] as const;
// A elefanta abre o plano: entra no primeiro quadro, e o disco do plano anterior pousa na cabeça dela nestes quadros.
const ELEPHANT_SOONER = 24;
const DISC_LANDS = 12;

type LitBrainProps = {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly at: number;
  readonly seconds: number;
};

/** O cérebro aceso dentro de uma cabeça: o halo claro por trás e o desenho, com as dobras. */
const LitBrain: React.FC<LitBrainProps> = ({ x, y, width, at, seconds }) => {
  const glow = 0.75 + 0.25 * wave(seconds, 1.6, x / 1920);

  return (
    // Não entra com o palco, e sim na deixa dele; sai com o dono.
    <Stay only="entering">
      <Place x={x} y={y}>
        <Pop at={at}>
          <div style={{ position: "relative" }}>
            <div
              style={{
                position: "absolute",
                inset: -width * 0.32,
                borderRadius: "50%",
                background: `radial-gradient(closest-side, ${ink.ring}, ${ink.ring}00)`,
                opacity: glow,
                scale: `${1 + 0.08 * wave(seconds, 1.6, x / 1920)}`,
              }}
            />
            <div style={{ position: "relative" }}>
              <Brain
                width={width}
                color={brainHalves.asleepShade}
                fill={brainHalves.awake}
                folds
              />
            </div>
          </div>
        </Pop>
      </Place>
    </Stay>
  );
};

type SuspectsShotProps = {
  /** Quadros do plano em que a pessoa entra, em que a placa desce e em que os dois olham para ela. */
  readonly youAt: number;
  readonly signAt: number;
  readonly lookAt: number;
  readonly clock: number;
};

/** A elefanta e a pessoa lado a lado, cada uma com o cérebro aceso na cabeça; a placa "culpado?" desce entre os dois. */
const SuspectsShot: React.FC<SuspectsShotProps> = ({
  youAt,
  signAt,
  lookAt,
  clock,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const stage = useStage();
  const length = useShotLength();
  const seconds = (clock + frame) / fps;
  const elephantScale = ELEPHANT.width / 520;
  const youScale = YOU.height / 650;
  const elephantIn = useCastScale(ELEPHANT.x, ELEPHANT_SOONER);
  const youOut = 1 - stage.leave(markFor("actor", YOU.x).leaveAt);
  const youIn = ramp(frame, youAt, 8) * youOut;
  // A placa cai, passa do ponto, balança nos fios e para; na saída, sobe de volta.
  const hung = drop(frame, signAt, 0.3 * fps);
  const swing =
    shake(frame, signAt + 0.3 * fps, 0.5 * fps, 7, 1.5) +
    0.6 * wave(seconds, 3.1);
  const signY =
    SIGN.y -
    SIGN.drop * (1 - hung) -
    (SIGN.y + 160) * stage.leave() +
    shake(frame, signAt + 0.3 * fps, 0.4 * fps, 16, 1);
  const looking = ramp(frame, lookAt, 6);
  const head = {
    x: ELEPHANT.x + ELEPHANT_BRAIN.x * elephantScale,
    y: GROUND + ELEPHANT_BRAIN.y * elephantScale,
    width: ELEPHANT_BRAIN.width * elephantScale,
  };
  // O disco que enchia o quadro no plano anterior encolhe até a cabeça dela, e ali vira o cérebro aceso.
  const landing = ramp(frame, 0, DISC_LANDS);
  const zoom = driftZoom(frame, length);
  const target = drifted([head.x, head.y], SUSPECTS_FOCUS, zoom);
  const discSize =
    FULL.size * ((head.width * 1.3 * zoom) / FULL.size) ** landing;

  return (
    <AbsoluteFill>
      <FlatStage backdrop={<IdeaBackdrop hue="peach" spot={[0.5, 0.42]} />}>
        <Drift focus={SUSPECTS_FOCUS}>
          <SvgLayer>
            <IdeaShadow
              hue="peach"
              x={ELEPHANT.x}
              y={GROUND + 6}
              width={ELEPHANT.width * 0.8 * elephantIn}
            />
            <IdeaShadow
              hue="peach"
              x={YOU.x}
              y={GROUND + 6}
              width={YOU.height * 0.5 * youIn}
            />
          </SvgLayer>
          {/* A elefanta olha para o meio do quadro: o desenho, que olha para a esquerda, é espelhado. */}
          <Sooner by={ELEPHANT_SOONER}>
            <Place
              x={ELEPHANT.x}
              y={GROUND}
              anchor="bottom"
              style={{
                scale: `-1 ${breath(seconds, "suspect-elephant", { amplitude: 0.012, period: 4.5 })}`,
              }}
            >
              <Elephant
                width={ELEPHANT.width}
                colors={elephant}
                lid={blink(seconds, "suspect-elephant")}
                trunk={0.2 + 0.12 * looking + 0.03 * wave(seconds, 3.7)}
                ear={0.4 + 0.12 * wave(seconds, 2.9)}
                look={[mix(0.2, 0.6, looking), mix(0.2, -0.5, looking)]}
              />
            </Place>
          </Sooner>
          {/* A pessoa entra na palavra dela, crescendo dos pés; a expressão troca com a pálpebra fechada. */}
          <Stay only="entering">
            <Place
              x={YOU.x}
              y={GROUND}
              anchor="bottom"
              style={{
                scale: `1 ${breath(seconds, "you")}`,
                rotate: `${-1.5 * looking}deg`,
              }}
            >
              <Grow at={youAt} origin="bottom">
                <Person
                  height={YOU.height}
                  colors={person}
                  expression={frame >= lookAt + 2 ? "surprised" : "curious"}
                  blink={Math.max(
                    blink(seconds, "you"),
                    flash(frame, lookAt - 1, 6),
                  )}
                />
              </Grow>
            </Place>
          </Stay>
          <LitBrain {...head} at={DISC_LANDS - 2} seconds={seconds} />
          <LitBrain
            x={YOU.x + PERSON_BRAIN.x * youScale}
            y={GROUND + PERSON_BRAIN.y * youScale}
            width={PERSON_BRAIN.width * youScale}
            at={youAt + 10}
            seconds={seconds}
          />
          {/* A placa desce do alto, pendurada por dois fios, e fica torta como toda placa pendurada. */}
          {frame >= signAt ? (
            <Stay>
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  transformOrigin: `${SIGN.x}px -20px`,
                  rotate: `${swing * 0.3}deg`,
                }}
              >
                <SvgLayer>
                  <path
                    d={`M${SIGN.x - 150},-20 L${SIGN.x - 150},${signY - 30} M${SIGN.x + 150},-20 L${SIGN.x + 150},${signY - 44}`}
                    stroke={idea.peach.contact}
                    strokeWidth={8}
                    strokeLinecap="round"
                  />
                </SvgLayer>
                <Place
                  x={SIGN.x}
                  y={signY}
                  style={{ rotate: `${-3 + swing * 0.7}deg` }}
                >
                  <div
                    style={{
                      border: `8px solid ${chalkboard.stamp}`,
                      borderRadius: 999,
                    }}
                  >
                    <Tag size="label" on="peach">
                      culpado?
                    </Tag>
                  </div>
                </Place>
              </div>
            </Stay>
          ) : null}
        </Drift>
        {/* Fora da deriva: o disco parte do quadro exato em que o plano anterior o deixou. */}
        {frame < DISC_LANDS + 3 ? (
          <Stay>
            <div
              style={{
                position: "absolute",
                inset: 0,
                transformOrigin: `${target[0]}px ${target[1]}px`,
                scale: `${1 - ramp(frame, DISC_LANDS, 3)}`,
              }}
            >
              <BrainDisc
                x={mix(FULL.x, target[0], landing)}
                y={mix(FULL.y, target[1], landing)}
                size={discSize}
                tilt={discTilt(seconds) * (1 - landing)}
              />
            </div>
          </Stay>
        ) : null}
        <Grain />
      </FlatStage>
    </AbsoluteFill>
  );
};

// O contorno vazio dentro do tanque: o lugar do cérebro do bicho que ela vai buscar.
const CONTOUR = { x: TANK_CENTER, y: 560, width: 430 };
// A aproximação lenta do plano, na direção do contorno.
const CONTOUR_END = framing([CONTOUR.x, CONTOUR.y], 1.03, [
  CONTOUR.x,
  CONTOUR.y,
]);
// Ela abre o plano: sobe com o laboratório, sem esperar a marcação do elenco.
const RESEARCHER_SOONER = 16;
// O braço que aponta: de solto ao lado do corpo até o contorno, nas unidades do desenho da pessoa.
const POINTING = {
  rest: { hand: [112, -228], bend: 10 },
  out: { hand: [236, -372], bend: -26 },
} as const;

type NetProps = {
  /** Quanto a rede subiu no ombro, em unidades do desenho, e quanto girou, em graus. */
  readonly lift: number;
  readonly turn: number;
};

/** A rede de pesca no ombro, nas unidades do desenho da pessoa: o cabo, o aro e a malha. */
const Net: React.FC<NetProps> = ({ lift, turn }) => (
  // Gira em volta do ombro, onde o cabo se apoia.
  <g transform={`translate(0 ${-lift}) rotate(${turn} -84 -170)`}>
    <path
      d="M-84,-170 L-196,-640"
      stroke={chalkboard.frame}
      strokeWidth={16}
      strokeLinecap="round"
    />
    <g transform="translate(-212 -700) rotate(-14)">
      <path
        d="M-78,0 C-70,96 -30,150 0,154 C30,150 70,96 78,0 Z"
        fill={lab.glass}
        opacity={0.7}
      />
      <path
        d="M-52,10 L-24,138 M0,10 L0,150 M52,10 L24,138 M-74,50 L74,50 M-56,100 L56,100"
        fill="none"
        stroke={lab.platformShade}
        strokeWidth={5}
        strokeLinecap="round"
      />
      <ellipse rx={84} ry={22} fill="none" stroke={lab.clip} strokeWidth={14} />
    </g>
  </g>
);

type ResearcherShotProps = {
  /** Quadros do plano em que ela aponta e em que ajeita a rede. */
  readonly pointAt: number;
  readonly netAt: number;
  readonly clock: number;
};

/** A pesquisadora, de rede de pesca no ombro, aponta para o contorno vazio: foi testado. */
const ResearcherShot: React.FC<ResearcherShotProps> = ({
  pointAt,
  netAt,
  clock,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const length = useShotLength();
  const seconds = (clock + frame) / fps;
  // O braço passa um pouco do ponto e volta: é um gesto, não um ponteiro.
  const pointing =
    ramp(frame, pointAt, 0.4 * fps) +
    shake(frame, pointAt + 0.4 * fps, 0.3 * fps, 0.06, 1);
  // Ajeitar a rede: a mão sobe pelo cabo, a rede sobe e gira um pouco, e tudo volta a pousar no ombro.
  const hitch = flash(frame, netAt, 0.5 * fps) ** 0.7;

  return (
    <AbsoluteFill>
      <TankShot
        camera={cameraBetween(LAB.medium, CONTOUR_END, frame / length)}
        hour="day"
        clock={clock}
      >
        <Place
          x={CONTOUR.x}
          y={CONTOUR.y + 8 * wave(seconds, 3)}
          style={{ rotate: `${-5 + 1.5 * wave(seconds, 4.3, 0.4)}deg` }}
        >
          <Brain width={CONTOUR.width} color={ink.ring} dashed folds />
        </Place>
      </TankShot>
      {/* Ela fica na frente da bancada, grande: é quem age neste plano. */}
      <Sooner by={RESEARCHER_SOONER}>
        <Place
          x={RESEARCHER.x + 40}
          y={1150}
          anchor="bottom"
          style={{ scale: `1 ${breath(seconds, "researcher")}` }}
        >
          <Person
            height={900}
            colors={researcher}
            bun
            plainFace
            blink={blink(seconds, "net-researcher")}
            frontArm={{ hand: [-100, -236 - 34 * hitch], bend: 30 + 8 * hitch }}
            backArm={{
              hand: [
                mix(POINTING.rest.hand[0], POINTING.out.hand[0], pointing),
                mix(POINTING.rest.hand[1], POINTING.out.hand[1], pointing),
              ],
              bend: mix(POINTING.rest.bend, POINTING.out.bend, pointing),
            }}
            held={<Net lift={18 * hitch} turn={-5 * hitch} />}
          />
        </Place>
      </Sooner>
    </AbsoluteFill>
  );
};

export const MaybeBrainScene: React.FC<SceneProps> = ({ scene, shots }) => {
  const { fps } = useVideoConfig();
  const crossAt = cue(scene, "primeiro");
  return (
    <>
      <Shot range={shots[0]} name="a régua ganha um X; o contorno acende">
        <MapShot
          crossAt={crossAt}
          // O contorno acende ainda neste plano, com folga: no seguinte ele já cresce.
          nextAt={Math.min(cue(scene, "limite"), shots[0].to - 0.9 * fps)}
          clock={scene.from}
        />
      </Shot>
      <Shot range={shots[1]} name="o contorno enche o quadro">
        <GrowShot clock={scene.from + shots[1].from} />
      </Shot>
      <Shot range={shots[2]} name="o cérebro é o culpado?">
        <SuspectsShot
          youAt={cue(scene, "você") - shots[2].from - 8}
          signAt={cue(scene, "pode") - shots[2].from}
          lookAt={cue(scene, "necessidade") - shots[2].from}
          clock={scene.from + shots[2].from}
        />
      </Shot>
      <Shot range={shots[3]} name="a pesquisadora aponta para o contorno vazio">
        <ResearcherShot
          pointAt={8}
          netAt={cue(scene, "foi") - shots[3].from}
          clock={scene.from + shots[3].from}
        />
        {/* A lagoa de `jellyfish` sobe aqui, por cima do laboratório que desce: a troca de cena não deixa a
            tela só com a parede. */}
        <Prelude>
          <JellyfishOpening clock={scene.from + shots[3].to} />
        </Prelude>
      </Shot>
    </>
  );
};
