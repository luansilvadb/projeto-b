import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { Earth } from "../../../art/Earth";
import { Build } from "../../../components/Camera";
import {
  Cast,
  FlatStage,
  Stay,
  Troupe,
  useStage,
} from "../../../components/Cast";
import { Grain } from "../../../components/Grain";
import { wave } from "../../../components/Idle";
import { Place } from "../../../components/Place";
import { SvgLayer } from "../../../components/SvgLayer";
import { cue, linear, mix, ramp } from "../../../components/timing";
import type { SceneProps } from "../../../video/NarratedVideo";
import { Shot, useShotLength } from "../../../video/Shot";
import {
  leaveProgress,
  markFor,
  SCENERY_EXIT_FRAMES,
} from "../../../video/stage";
import { IdeaBackdrop, IdeaShadow } from "../parts/IdeaBackdrop";
import {
  Magnifier,
  SEARCH_GLOBE,
  SEARCH_SIGN,
  searchSpin,
} from "../parts/Search";
import {
  SeaFloor,
  TIMELINE,
  TIMELINE_END,
  TIMELINE_FLOOR,
} from "../parts/Timeline";
import { VacantSign } from "../parts/VacantSign";
import {
  Ahead,
  Early,
  NEVER,
  Prelude,
  useCastScale,
} from "./MaybeBrainScene";
import { AMONG_LEAD, OneOfThemOpening } from "./OneOfThemScene";
import { Drift } from "./SleepDebtScene";

// A aproximação lenta do plano da procura, a mesma do animatic: de 6% a 14% mais perto, em volta do pé do pedestal.
const PUSH = { focus: [1100, 940], from: 1.06, by: 0.08 } as const;
// O globo e o pedestal já estão no lugar quando a fala começa: começam a entrar antes de a cena
// chegar, no fim de `stockroom-solid`, quando a pessoa já saiu e o balão encolhe. Quantos quadros antes
// da cena cada um começa, e quanto a marcação do palco é adiantada para isso. O pedestal vem um quadro
// depois do globo: mais cedo, o contorno vazio dele crescia em volta do balão, que ainda estava ali, e
// a caixa da lembrança parecia ocupar o pedestal.
const LEAD = { sign: 7, globe: 8 };
const SIGN_SOONER = markFor("prop").enterAt + LEAD.sign;
const GLOBE_SOONER = markFor("actor", SEARCH_GLOBE.x).enterAt + LEAD.globe;
// A última volta da lupa: uma elipse sobre o globo, percorrida a velocidade
// constante, que começa e termina no alto, à direita (o ponto em que a lupa
// estava no quadro composto).
const ORBIT = {
  x: SEARCH_GLOBE.x + 20,
  y: SEARCH_GLOBE.y - 20,
  rx: 190,
  ry: 150,
  from: -40,
};
// Parada, ela baixa: a lente desce, vai um pouco para fora do globo, e o cabo cai. Em pixels e em graus.
const LOWERED = { x: 46, y: 150, tilt: 16, seconds: 0.6 };
// O foco de luz espera aceso a meio, e sobe de vez quando a lupa já baixou: a procura acabou, e o lugar ficou vazio.
const LIGHT = { before: 0.3, seconds: 0.6 };

/** A aproximação do plano da procura num quadro dele. */
const searchZoom = (frame: number, length: number): number =>
  PUSH.from + (PUSH.by * frame) / length;

type SearchPose = {
  /** Onde a lente está, a inclinação da lupa, e o brilho do foco de luz do pedestal. */
  readonly lens: readonly [number, number];
  readonly tilt: number;
  readonly light: number;
};

/** A lupa e o foco de luz num quadro do plano, que pode ser negativo: antes de ele chegar, a lupa paira no ponto de partida. */
const searchPose = (
  frame: number,
  fps: number,
  turnAt: number,
  stopAt: number,
  lightAt: number,
): SearchPose => {
  const seconds = frame / fps;
  // A volta é a velocidade constante; o baixar tem peso.
  const angle =
    ((ORBIT.from + 360 * linear(frame, turnAt, stopAt - turnAt)) * Math.PI) /
    180;
  const lowered = ramp(frame, stopAt, LOWERED.seconds * fps);
  // Antes da volta e depois de baixar, a mão que a segura não é firme: a lente paira.
  const turning = frame >= turnAt && frame < stopAt ? 1 : 0;
  const hover = 1 - turning;
  return {
    lens: [
      ORBIT.x +
        ORBIT.rx * Math.cos(angle) +
        LOWERED.x * lowered +
        5 * hover * wave(seconds, 2.9),
      ORBIT.y +
        ORBIT.ry * Math.sin(angle) +
        LOWERED.y * lowered +
        6 * hover * wave(seconds, 2.3, 0.4),
    ],
    tilt: LOWERED.tilt * lowered + 1.5 * hover * wave(seconds, 3.7),
    light: mix(LIGHT.before, 1, ramp(frame, lightAt, LIGHT.seconds * fps)),
  };
};

type SearchGlobeProps = Pick<SearchPose, "lens" | "tilt"> & {
  readonly seconds: number;
};

/** O globo, a sombra dele e a lupa, que entram e saem juntos, na marcação do palco em que estão. */
const SearchGlobe: React.FC<SearchGlobeProps> = ({ lens, tilt, seconds }) => {
  const globeIn = useCastScale(SEARCH_GLOBE.x);
  const lensIn = useCastScale(ORBIT.x);
  return (
    <>
      <SvgLayer>
        <IdeaShadow
          hue="mint"
          x={SEARCH_GLOBE.x}
          y={SEARCH_GLOBE.y + SEARCH_GLOBE.radius + 60}
          width={SEARCH_GLOBE.radius * 1.5 * globeIn}
        />
      </SvgLayer>
      <Place x={SEARCH_GLOBE.x} y={SEARCH_GLOBE.y}>
        {/* O globo gira como no gancho, sem parar: quem para é a procura. */}
        <Earth radius={SEARCH_GLOBE.radius} spin={searchSpin(seconds)} />
      </Place>
      {/* A lupa cresce e encolhe em volta da lente, onde ela estiver, junto com o globo. */}
      <AbsoluteFill
        style={{
          transformOrigin: `${lens[0]}px ${lens[1]}px`,
          scale: `${lensIn}`,
        }}
      >
        <Magnifier x={lens[0]} y={lens[1]} tilt={tilt} />
      </AbsoluteFill>
    </>
  );
};

type SearchCastProps = SearchPose & {
  /** O quadro do plano que se desenha, e a duração dele, para a aproximação. */
  readonly frame: number;
  readonly length: number;
  /** Quantos quadros faltam para o plano começar, quando é a cena anterior quem desenha isto. */
  readonly until?: number;
};

/**
 * O elenco do plano da procura num quadro dele: é o mesmo desenho no prelúdio,
 * antes da cena, e no plano. O globo e a lupa vêm primeiro, e o pedestal logo depois.
 */
const SearchCast: React.FC<SearchCastProps> = ({
  frame,
  length,
  until,
  lens,
  tilt,
  light,
}) => {
  const { fps } = useVideoConfig();
  // No plano, a entrada continua de onde o prelúdio parou; no prelúdio, é a de `until` quadros antes.
  const staged = (by: number, children: React.ReactNode) =>
    until === undefined ? (
      <Early by={by}>{children}</Early>
    ) : (
      <Ahead until={until} by={by}>
        {children}
      </Ahead>
    );
  return (
    // Antes de o plano chegar, a aproximação está no começo dela.
    <Drift focus={PUSH.focus} zoom={searchZoom(Math.max(0, frame), length)}>
      {staged(
        GLOBE_SOONER,
        <SearchGlobe lens={lens} tilt={tilt} seconds={frame / fps} />,
      )}
      {/* O pedestal sai por último, depois do globo e da lupa: o lugar vazio é a última coisa do plano. */}
      {staged(
        SIGN_SOONER,
        <Cast origin={[SEARCH_SIGN.x, SEARCH_SIGN.y]}>
          <Stay>
            <VacantSign {...SEARCH_SIGN} light={light} />
          </Stay>
        </Cast>,
      )}
    </Drift>
  );
};

/** Quantos quadros antes da cena o prelúdio da procura começa. */
export const SEARCH_LEAD = Math.max(LEAD.sign, LEAD.globe);

/**
 * O pedestal, o globo e a lupa entrando, antes de a cena começar: o último
 * plano de `stockroom-solid` os desenha por baixo do balão que encolhe, e a
 * troca não deixa a tela só com o fundo. `until` é quantos quadros faltam para a cena.
 */
export const SearchPrelude: React.FC<{ until: number }> = ({ until }) => {
  const { fps } = useVideoConfig();
  return (
    <SearchCast
      frame={-until}
      length={1}
      until={until}
      // Nenhuma deixa do plano aconteceu ainda.
      {...searchPose(-until, fps, NEVER, NEVER + 1, NEVER)}
    />
  );
};

type SearchEndsShotProps = {
  /** Quadros do plano em que a lupa começa a última volta, em que para, e em que o foco de luz sobe. */
  readonly turnAt: number;
  readonly stopAt: number;
  readonly lightAt: number;
};

/** O globo sob a lupa, como no gancho: ela dá a última volta, para e baixa; o pedestal continua vazio. */
const SearchEndsShot: React.FC<SearchEndsShotProps> = ({
  turnAt,
  stopAt,
  lightAt,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const length = useShotLength();
  const pose = searchPose(frame, fps, turnAt, stopAt, lightAt);

  return (
    <AbsoluteFill>
      <FlatStage backdrop={<IdeaBackdrop hue="mint" spot={[0.32, 0.5]} />}>
        <SearchCast frame={frame} length={length} {...pose} />
      </FlatStage>
      <Grain />
    </AbsoluteFill>
  );
};

// O fim da linha do tempo, na areia: o ponto em volta do qual a câmera dela se aproxima.
const LINE_END = { x: TIMELINE_END.x, y: TIMELINE_FLOOR - 24 };
// O fundo do mar anda junto com o que está pousado nele. Para a borda dele não
// aparecer no deslize, é desenhado maior, em volta do fim da linha: assim a
// areia ali não sai do lugar.
const FLOOR_OVERSCAN = 1.07;

type SeaStageProps = {
  /** Quanto a câmera ainda está deslocada para o lado do passado, em pixels: o quadro inteiro anda junto. */
  readonly pan: number;
  /** A aproximação da câmera, em volta do fim da linha. Por padrão, nenhuma. */
  readonly zoom?: number;
  readonly children: React.ReactNode;
};

/**
 * O fundo do mar como fundo do plano (toma a cor dele sobre o anterior) e, por
 * cima, o elenco: a linha do tempo e o que está no fim dela. Os dois deslizam
 * juntos com a câmera.
 */
export const SeaStage: React.FC<SeaStageProps> = ({
  pan,
  zoom = 1,
  children,
}) => {
  const frame = useCurrentFrame();
  const length = useShotLength();
  const stage = useStage();
  // Na saída o fundo do mar desce em camadas, como a lagoa: desfeito junto com a água, o recife ficava
  // a meia opacidade sobre o plano seguinte. Na entrada ele continua tomando a cor inteiro, como fundo.
  const sunk =
    stage.leave() > 0
      ? leaveProgress(frame, length, 0, SCENERY_EXIT_FRAMES)
      : 0;
  return (
    <FlatStage
      backdrop={
        <Troupe cast={false}>
          <AbsoluteFill
            style={{
              transformOrigin: `${LINE_END.x}px ${LINE_END.y}px`,
              translate: `${pan}px 0`,
              scale: `${FLOOR_OVERSCAN * zoom}`,
            }}
          >
            <Build lit={1} risen={1 - sunk}>
              <SeaFloor shimmer layered />
            </Build>
          </AbsoluteFill>
        </Troupe>
      }
    >
      <AbsoluteFill
        style={{
          transformOrigin: `${LINE_END.x}px ${LINE_END.y}px`,
          translate: `${pan}px 0`,
          scale: `${zoom}`,
        }}
      >
        {children}
      </AbsoluteFill>
    </FlatStage>
  );
};

type LineGroupProps = {
  /** O começo da linha no quadro, em pixels: o ponto para o qual ela recolhe. */
  readonly from: number;
  readonly children: React.ReactNode;
};

/**
 * A linha do tempo e o que está preso a ela, como uma coisa só na saída: cada
 * um entra por conta própria e, quando o plano termina, a linha recolhe para o
 * começo dela levando todos juntos.
 */
export const LineGroup: React.FC<LineGroupProps> = ({ from, children }) => {
  const stage = useStage();
  return (
    <AbsoluteFill
      style={{
        transformOrigin: `${from}px ${TIMELINE.y}px`,
        scale: `${1 - stage.leave(6)}`,
      }}
    >
      <Stay only="leaving">{children}</Stay>
    </AbsoluteFill>
  );
};

export const NobodyEscapedScene: React.FC<SceneProps> = ({ scene, shots }) => {
  const { fps } = useVideoConfig();
  const searchFrames = shots[0].to - shots[0].from;
  return (
    <Shot range={shots[0]} name="a procura termina no pedestal vazio">
      <SearchEndsShot
        // A fala é curta: a última volta começa com o plano, e a lupa para e baixa em "animais".
        turnAt={0}
        stopAt={cue(scene, "animais")}
        // O foco sobe em "história" e assenta meio segundo antes de o palco começar a sair.
        lightAt={Math.min(
          cue(scene, "história"),
          searchFrames - (LIGHT.seconds + 0.5) * fps,
        )}
      />
      {/* A pessoa de `one-of-them` cresce aqui, no meio do palco, quando o globo e a lupa já saíram e o
          pedestal encolhe: a troca de cena não deixa a tela só com o fundo. */}
      <Prelude lead={AMONG_LEAD}>
        {(until) => <OneOfThemOpening until={until} />}
      </Prelude>
    </Shot>
  );
};
