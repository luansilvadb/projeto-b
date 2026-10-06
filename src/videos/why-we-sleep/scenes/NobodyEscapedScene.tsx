import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { Earth } from "../../../art/Earth";
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
import {
  ALREADY_SHOWN,
  cue,
  linear,
  mix,
  ramp,
} from "../../../components/timing";
import type { SceneProps } from "../../../video/NarratedVideo";
import { Shot, useShotLength } from "../../../video/Shot";
import { markFor } from "../../../video/stage";
import { ink } from "../palette";
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
  Timeline,
} from "../parts/Timeline";
import { VacantSign } from "../parts/VacantSign";
import {
  Ahead,
  Early,
  NEVER,
  Prelude,
  Sooner,
  useCastScale,
} from "./MaybeBrainScene";
import { AMONG_LEAD, OneOfThemOpening } from "./OneOfThemScene";
import { Drift } from "./SleepDebtScene";

// A aproximação lenta do plano da procura, a mesma do animatic: de 6% a 14% mais perto, em volta do pé do pedestal.
const PUSH = { focus: [1100, 940], from: 1.06, by: 0.08 } as const;
// O globo e o pedestal já estão no lugar quando "A procura" soa: começam a entrar antes de a cena
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
// O foco de luz espera aceso a meio, e sobe de vez quando a fala diz que o lugar ficou vazio.
const LIGHT = { before: 0.3, seconds: 0.6 };

/** A aproximação do plano da procura num quadro dele. */
const searchZoom = (frame: number, length: number): number =>
  PUSH.from + (PUSH.by * frame) / length;

/**
 * Onde o pedestal está na tela, e de que tamanho, quando o plano da procura
 * termina: o plano da linha do tempo o recebe dali e o leva até o fim da linha.
 */
const SIGN_AT_HANDOVER = {
  x: PUSH.focus[0] + (SEARCH_SIGN.x - PUSH.focus[0]) * (PUSH.from + PUSH.by),
  y: PUSH.focus[1] + (SEARCH_SIGN.y - PUSH.focus[1]) * (PUSH.from + PUSH.by),
  scale: SEARCH_SIGN.scale * (PUSH.from + PUSH.by),
};

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
  /** Se o pedestal ainda é deste plano: o seguinte o recebe e passa a desenhá-lo. */
  readonly sign?: boolean;
};

/**
 * O elenco do plano da procura num quadro dele: é o mesmo desenho no prelúdio,
 * antes da cena, e no plano. O globo e a lupa vêm primeiro, e o pedestal logo depois.
 */
const SearchCast: React.FC<SearchCastProps> = ({
  frame,
  length,
  until,
  sign = true,
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
      {/* O pedestal entra com o plano, mas não sai: o plano seguinte o leva para o fim da linha do tempo. */}
      {sign
        ? staged(
            SIGN_SOONER,
            <Stay only="leaving">
              <Cast origin={[SEARCH_SIGN.x, SEARCH_SIGN.y]}>
                <Stay>
                  <VacantSign {...SEARCH_SIGN} light={light} />
                </Stay>
              </Cast>
            </Stay>,
          )
        : null}
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
  const stage = useStage();
  const pose = searchPose(frame, fps, turnAt, stopAt, lightAt);

  return (
    <AbsoluteFill>
      <FlatStage backdrop={<IdeaBackdrop hue="mint" spot={[0.32, 0.5]} />}>
        <SearchCast
          frame={frame}
          length={length}
          {...pose}
          sign={!stage.handedOver}
        />
      </FlatStage>
      <Grain />
    </AbsoluteFill>
  );
};

// A marca do sono, nas medidas da linha do tempo: onde fica e a altura do ícone.
const SLEEP_MARK = { x: 240, icon: 130 };
// O pedestal no fim da linha, pousado na areia.
const END_SIGN = { x: TIMELINE_END.x, y: TIMELINE_FLOOR - 24, scale: 0.68 };
// Em quantos quadros o pedestal vai do lugar em que a procura o deixou até o fim da linha.
const SIGN_TRAVEL_FRAMES = 24;
// A marca do sono, a água-viva e a linha estão no lugar na primeira palavra, que é "sono".
const LINE_SOONER = 30;
const LINE_SECONDS = 0.5;
const BRACKET_SECONDS = 0.8;
// A câmera do plano: desliza devagar para o fim da linha, até o pedestal
// vazio. O plano abre deslocado `pan` pixels para o lado do passado; no
// deslize a câmera também chega `closer` mais perto do pedestal, que é o que
// faz dele o destino. Antes do deslize ela já anda um nada (`creep`), para o
// plano não ficar preso.
const SLIDE = { pan: 80, creep: 12, closer: 0.04 };
// O fundo do mar anda junto com o que está pousado nele. Para a borda dele não
// aparecer no deslize, é desenhado maior, em volta do pé do pedestal: assim a
// areia sob o pedestal não sai do lugar.
const FLOOR_OVERSCAN = 1.07;

type SeaStageProps = {
  /** Quanto a câmera ainda está deslocada para o lado do passado, em pixels: o quadro inteiro anda junto. */
  readonly pan: number;
  /** A aproximação da câmera, em volta do pé do pedestal. Por padrão, nenhuma. */
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
}) => (
  <FlatStage
    backdrop={
      <Troupe cast={false}>
        <AbsoluteFill
          style={{
            transformOrigin: `${END_SIGN.x}px ${END_SIGN.y}px`,
            translate: `${pan}px 0`,
            scale: `${FLOOR_OVERSCAN * zoom}`,
          }}
        >
          <SeaFloor shimmer />
        </AbsoluteFill>
      </Troupe>
    }
  >
    <AbsoluteFill
      style={{
        transformOrigin: `${END_SIGN.x}px ${END_SIGN.y}px`,
        translate: `${pan}px 0`,
        scale: `${zoom}`,
      }}
    >
      {children}
    </AbsoluteFill>
  </FlatStage>
);

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

type EndOfLineShotProps = {
  /** Quadros do plano em que a marca do sono pulsa, em que o colchete dos anos abre, e entre os quais a câmera desliza. */
  readonly pulseAt: number;
  readonly yearsAt: number;
  readonly slideAt: number;
  readonly stopAt: number;
  /** Quantos quadros o pedestal já tinha no palco quando o plano começou. */
  readonly signClock: number;
};

/** A linha do tempo inteira, da marca do sono até hoje; a câmera desliza até o fim dela, onde o pedestal ficou vazio. */
const EndOfLineShot: React.FC<EndOfLineShotProps> = ({
  pulseAt,
  yearsAt,
  slideAt,
  stopAt,
  signClock,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const seconds = frame / fps;
  const slid = ramp(frame, slideAt, stopAt - slideAt);
  const pan =
    SLIDE.pan -
    SLIDE.creep * linear(frame, 0, slideAt) -
    (SLIDE.pan - SLIDE.creep) * slid;
  const drawn = ramp(frame, 0, LINE_SECONDS * fps);
  // O pedestal vem de onde a procura o deixou, encolhendo, até pousar no fim da linha.
  const arrived = ramp(frame, 0, SIGN_TRAVEL_FRAMES);
  const sign = {
    x: mix(SIGN_AT_HANDOVER.x - SLIDE.pan, END_SIGN.x, arrived),
    y: mix(SIGN_AT_HANDOVER.y, END_SIGN.y, arrived),
    scale: mix(SIGN_AT_HANDOVER.scale, END_SIGN.scale, arrived),
  };

  return (
    <AbsoluteFill>
      <Sooner by={LINE_SOONER}>
        <SeaStage pan={pan} zoom={1 + SLIDE.closer * slid}>
          <>
            {/* O pedestal já estava no palco: não entra; sai com o plano. */}
            <Stay only="entering">
              <Cast origin={[END_SIGN.x, END_SIGN.y]}>
                <Stay>
                  <VacantSign
                    {...sign}
                    // No caminho o foco baixa (grande, sobre o mar que escurece, ele viraria uma
                    // parede de luz) e reacende ao pousar; depois respira: é a pausa viva do lugar vazio.
                    light={
                      (1 -
                        0.65 * ramp(frame, 0, 6) * (1 - ramp(frame, 14, 14))) *
                      (0.9 + 0.1 * wave(seconds, 3.3))
                    }
                    clock={signClock}
                  />
                </Stay>
              </Cast>
            </Stay>
            <LineGroup from={SLEEP_MARK.x}>
              <>
                <Timeline
                  floor={false}
                  eased
                  alive
                  jellyfish
                  drawn={drawn}
                  arrow={ramp(frame, 0, 6)}
                  sleepAt={ALREADY_SHOWN}
                  brainAt={ALREADY_SHOWN}
                  yearsAt={yearsAt}
                  bracketSeconds={BRACKET_SECONDS}
                />
              </>
              <SvgLayer>
                {/* A marca do sono pulsa: dois anéis de luz saem da lua, um depois do outro. */}
                {[0, 7].map((delay) => {
                  const age = (frame - pulseAt - delay) / (0.6 * fps);
                  return age > 0 && age < 1 ? (
                    <circle
                      key={delay}
                      cx={SLEEP_MARK.x}
                      cy={TIMELINE.y - SLEEP_MARK.icon}
                      r={60 + 90 * (1 - (1 - age) ** 2)}
                      fill="none"
                      stroke={ink.moon}
                      strokeWidth={10 * (1 - age)}
                      opacity={1 - age}
                    />
                  ) : null;
                })}
              </SvgLayer>
            </LineGroup>
          </>
        </SeaStage>
      </Sooner>
      <Grain />
    </AbsoluteFill>
  );
};

export const NobodyEscapedScene: React.FC<SceneProps> = ({ scene, shots }) => {
  const { fps } = useVideoConfig();
  const searchFrames = shots[0].to - shots[0].from;
  return (
    <>
      <Shot range={shots[0]} name="a procura termina sem ele">
        <SearchEndsShot
          turnAt={cue(scene, "procura")}
          stopAt={cue(scene, "termina")}
          // O foco sobe em "sem" e assenta meio segundo antes da troca.
          lightAt={Math.min(
            cue(scene, "sem"),
            searchFrames - (LIGHT.seconds + 0.5) * fps,
          )}
        />
      </Shot>
      <Shot range={shots[1]} name="meio bilhão de anos, e o pedestal vazio">
        <EndOfLineShot
          // A marca pulsa quando já cresceu no lugar dela.
          pulseAt={Math.max(10, cue(scene, "sono") - shots[1].from)}
          yearsAt={cue(scene, "quinhentos") - shots[1].from}
          slideAt={cue(scene, "nenhum") - shots[1].from}
          stopAt={cue(scene, "parar") - shots[1].from}
          signClock={searchFrames}
        />
        {/* A pessoa de `one-of-them` cresce aqui, por cima da linha do tempo que encolhe: a troca de cena não
            deixa a tela só com o fundo do mar. */}
        <Prelude lead={AMONG_LEAD}>
          {(until) => <OneOfThemOpening until={until} />}
        </Prelude>
      </Shot>
    </>
  );
};
