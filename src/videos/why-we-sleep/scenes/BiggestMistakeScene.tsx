import { useMemo } from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  interpolateColors,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {
  Build,
  Camera,
  cameraBetween,
  framing,
  Layer,
  type CameraState,
} from "../../../components/Camera";
import {
  FlatStage,
  StageContext,
  Stay,
  Troupe,
  useStage,
} from "../../../components/Cast";
import { Grain } from "../../../components/Grain";
import { wave } from "../../../components/Idle";
import { Place } from "../../../components/Place";
import { Pop } from "../../../components/Pop";
import { SvgLayer } from "../../../components/SvgLayer";
import { ALREADY_SHOWN, cue, drop, linear, mix, ramp, settle, clamp } from "../../../components/timing";
import { typography } from "../../../design/tokens";
import { HEIGHT, WIDTH } from "../../../format";
import type { SceneProps } from "../../../video/NarratedVideo";
import { Shot, useShotLength } from "../../../video/Shot";
import { chalkboard, idea, ink, lab, tags } from "../palette";
import {
  Board,
  BOARD_WIDE,
  chalkStamp,
  chalkTree,
  Quote,
  Researcher,
  Stamp,
  type Box,
} from "../parts/Chalkboard";
import { LifeTree } from "../parts/LifeTree";
import { Tag } from "../parts/Tag";


/**
 * A parede do laboratório, a mesma do corredor: é o fundo de todos os planos
 * da cena, e por isso a troca de um para o outro não recolore o palco.
 */
const LabWall: React.FC = () => (
  <AbsoluteFill
    style={{ background: `linear-gradient(${lab.wall[0]}, ${lab.wall[1]})` }}
  />
);

const CALENDAR = { x: 1380, y: 400, width: 440, height: 500 };
const HEADER = 120;
// O calendário conta as décadas até os 44 anos que a fala diz.
const DECADES = [0, 10, 20, 30, 40, 44] as const;
// A última folha, a dos 44, vira mais devagar e assenta: é nela que o olho para.
const LAST_TURN_FRAMES = 8;

/** Os anos escritos numa folha do calendário. */
const Years: React.FC<{ years: number }> = ({ years }) => (
  <div
    style={{
      fontFamily: typography.family,
      fontWeight: 900,
      fontSize: typography.size.display * 1.3,
      lineHeight: 1,
      color: ink.dark,
      textAlign: "center",
    }}
  >
    {years}
    <div style={{ fontSize: typography.size.note, fontWeight: 700 }}>anos</div>
  </div>
);

type WallCalendarProps = {
  /** Quantos anos a folha de cima mostra, e quantos a de baixo dela. */
  readonly years: number;
  readonly next: number;
  /** Quanto a folha de cima já virou, de 0 a 1. */
  readonly turned: number;
};

/** O calendário de parede: as argolas, o cabeçalho coral e a folha com os anos já passados. */
const WallCalendar: React.FC<WallCalendarProps> = ({ years, next, turned }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { x, y, width, height } = CALENDAR;
  const turning = turned > 0 && turned < 1;
  return (
    // Pendurado no prego, o calendário balança de leve: é o que se mexe atrás dele enquanto ele só respira.
    <AbsoluteFill
      style={{
        transformOrigin: `${x}px ${y - height / 2 - 34}px`,
        rotate: `${1.3 * wave(frame / fps, 3.3, 0.2)}deg`,
      }}
    >
      <SvgLayer>
        {/* O prego e as folhas de baixo, um pouco fora de esquadro. */}
        <circle
          cx={x}
          cy={y - height / 2 - 34}
          r={12}
          fill={idea.peach.contact}
        />
        <rect
          x={x - width / 2 + 14}
          y={y - height / 2 + 18}
          width={width}
          height={height}
          rx={26}
          fill={idea.peach.contact}
          opacity={0.3}
        />
        <rect
          x={x - width / 2}
          y={y - height / 2}
          width={width}
          height={height}
          rx={26}
          fill={ink.ring}
        />
        <path
          d={`M${x - width / 2},${y - height / 2 + HEADER} L${x - width / 2},${y - height / 2 + 26} Q${x - width / 2},${y - height / 2} ${x - width / 2 + 26},${y - height / 2} L${x + width / 2 - 26},${y - height / 2} Q${x + width / 2},${y - height / 2} ${x + width / 2},${y - height / 2 + 26} L${x + width / 2},${y - height / 2 + HEADER} Z`}
          fill={ink.tag}
        />
        {[-120, 0, 120].map((offset) => (
          <rect
            key={offset}
            x={x + offset - 11}
            y={y - height / 2 - 30}
            width={22}
            height={70}
            rx={11}
            fill={ink.dark}
          />
        ))}
      </SvgLayer>
      {/* A folha de baixo: a que aparece quando a de cima vira. */}
      <Place x={x} y={y + 40}>
        <Years years={turning ? next : years} />
      </Place>
      {/*
        A folha que vira: presa às argolas, ela sobe encolhendo para o
        cabeçalho, com os anos dela, e escurece um pouco ao dobrar. O número
        nunca troca à vista: quem troca é a folha.
      */}
      {turning ? (
        <div
          style={{
            position: "absolute",
            left: x - width / 2,
            top: y - height / 2 + HEADER,
            width,
            height: height - HEADER,
            borderRadius: "0 0 26px 26px",
            overflow: "hidden",
            background: ink.ring,
            transformOrigin: "50% 0",
            scale: `1 ${1 - turned}`,
          }}
        >
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: height / 2 + 40 - HEADER,
              translate: "-50% -50%",
            }}
          >
            <Years years={years} />
          </div>
          <AbsoluteFill
            style={{ background: idea.peach.contact, opacity: 0.4 * turned }}
          />
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

// Quantos quadros antes dos outros objetos de cena a linha da etiqueta sai do palco: junto com a etiqueta.
const LINE_LEAVES_EARLY = 5;

/** Faz o que está dentro sair do palco um pouco antes da marcação: a linha vai embora com a etiqueta que ela prende. */
const WithItsTag: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const stage = useStage();
  const early = useMemo(
    () => ({
      ...stage,
      leave: (delay = 0) => stage.leave(delay - LINE_LEAVES_EARLY),
    }),
    [stage],
  );
  return (
    <StageContext.Provider value={early}>{children}</StageContext.Provider>
  );
};

/**
 * Adianta a entrada no palco de quem está dentro, em quadros: o elenco de um
 * plano precisa estar no lugar quando a primeira palavra dele soa, e a
 * marcação de sempre só o põe lá meio segundo depois.
 */
const Sooner: React.FC<{ by: number; children: React.ReactNode }> = ({
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

type Pose = {
  /** Os pés dele, em pixels do quadro, e a altura. */
  readonly x: number;
  readonly y: number;
  readonly height: number;
};

/** Onde um ponto do cenário vai parar no quadro, com a câmera dada: o inverso de `framing`. */
const project = (
  camera: CameraState,
  point: readonly [number, number],
): readonly [number, number] => [
  WIDTH / 2 + camera.zoom * (point[0] - WIDTH / 2) - camera.x,
  HEIGHT / 2 + camera.zoom * (point[1] - HEIGHT / 2) - camera.y,
];

/** Onde um ponto do quadro vai parar com a aproximação `zoom` em volta de `focus`. */
const pushedPoint = (
  point: readonly [number, number],
  focus: readonly [number, number],
  zoom: number,
): readonly [number, number] => [
  focus[0] + (point[0] - focus[0]) * zoom,
  focus[1] + (point[1] - focus[1]) * zoom,
];

/** Onde um retângulo do quadro vai parar com a aproximação `zoom` em volta de `focus`. */
const pushed = (
  box: Box,
  focus: readonly [number, number],
  zoom: number,
): Box => ({
  x: focus[0] + (box.x - focus[0]) * zoom,
  y: focus[1] + (box.y - focus[1]) * zoom,
  width: box.width * zoom,
  height: box.height * zoom,
});

const shifted = (box: Box, by: number): Box => ({ ...box, x: box.x + by });

/** A aproximação lenta de `ShotPush` num quadro do plano. */
const slowPushAt = (frame: number, length: number, by: number): number =>
  1 + (by * frame) / length;

type ShotPushProps = {
  /** O ponto do quadro para o qual a câmera se aproxima. */
  readonly focus: readonly [number, number];
  /** Quanto a câmera se aproxima do começo ao fim do plano, em fração. */
  readonly by: number;
  readonly backdrop: React.ReactNode;
  readonly children: React.ReactNode;
};

/**
 * A aproximação lenta de `SlowPush`, com a aproximação de cada quadro dada
 * por `slowPushAt`: quando o plano seguinte chega, a câmera está exatamente em
 * `by`, e é daí que ele recebe o que os dois têm em comum. `SlowPush` hoje
 * também conta pela duração do plano no roteiro, mas interpola a aproximação
 * em progressão geométrica; aqui ela é linear, e os planos que desfazem a
 * aproximação no meio do caminho (o texto que não cresce com a câmera) usam a
 * mesma `slowPushAt`. Por isso este não foi trocado por aquele.
 */
export const ShotPush: React.FC<ShotPushProps> = ({
  focus,
  by,
  backdrop,
  children,
}) => {
  const frame = useCurrentFrame();
  const length = useShotLength();
  return (
    <AbsoluteFill>
      <FlatStage backdrop={backdrop}>
        {/* Aqui não há chão para subir: quem entra e sai é o elenco. */}
        <Build>
          <Camera {...framing(focus, slowPushAt(frame, length, by), focus)}>
            <Layer depth={1}>
              <Troupe>{children}</Troupe>
            </Layer>
          </Camera>
        </Build>
      </FlatStage>
    </AbsoluteFill>
  );
};

// O plano do rosto: os pés dele (fora do quadro), a altura e a aproximação lenta.
const INTRO = { x: 640, y: 1520, height: 1280 } as const;
const INTRO_FOCUS = [820, 520] as const;
const INTRO_PUSH = 0.04;
// A etiqueta de nome, a partir dos pés dele, e a linha que a prende ao ombro.
const NAME_OFFSET = [700, -620] as const;
const NAME_LINE = { from: [922, 900], to: [1070, 900] } as const;
// O palco leva meio segundo para pôr o elenco no lugar, e a fala começa antes disso: ele entra já no primeiro quadro.
const INTRO_SOONER = 12;

type IntroShotProps = {
  /** Quadros do plano em que o nome entra, em que as folhas começam a virar e em que a dos 44 anos vira. */
  readonly nameAt: number;
  readonly decadesAt: number;
  readonly yearsAt: number;
};

/** O pesquisador, da cintura para cima; atrás dele, o calendário de parede troca de década. */
const IntroShot: React.FC<IntroShotProps> = ({
  nameAt,
  decadesAt,
  yearsAt,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const stage = useStage();
  // As décadas viram em cascata, a intervalos iguais, até a fala chegar a
  // "quatro"; aí vira a última folha, mais devagar.
  const last = DECADES.length - 1;
  const step = Math.max(3, (yearsAt - decadesAt) / (last - 1));
  const turn =
    frame < yearsAt
      ? Math.min(last - 1, Math.max(0, (frame - decadesAt) / step))
      : last - 1 + settle(frame, yearsAt, LAST_TURN_FRAMES);
  const page = Math.min(last, Math.floor(turn));
  const drawn = ramp(frame, nameAt, 0.27 * fps);

  return (
    <Sooner by={INTRO_SOONER}>
      <ShotPush
        focus={INTRO_FOCUS}
        by={INTRO_PUSH}
        backdrop={<LabWall />}
      >
        <WallCalendar
          years={DECADES[page]}
          next={DECADES[Math.min(last, page + 1)]}
          turned={turn - page}
        />
        {/* A linha da etiqueta: sai do ombro dele e chega a ela, junto com o estouro. */}
        <WithItsTag>
          <SvgLayer>
            <g opacity={drawn > 0 ? 1 : 0}>
              <circle
                cx={NAME_LINE.from[0]}
                cy={NAME_LINE.from[1]}
                r={12}
                fill={tags.peach.fill}
              />
              <line
                x1={NAME_LINE.from[0]}
                y1={NAME_LINE.from[1]}
                x2={mix(NAME_LINE.from[0], NAME_LINE.to[0], drawn)}
                y2={mix(NAME_LINE.from[1], NAME_LINE.to[1], drawn)}
                stroke={tags.peach.fill}
                strokeWidth={10}
                strokeLinecap="round"
              />
            </g>
          </SvgLayer>
        </WithItsTag>
        {/*
          Da cintura para cima: quem fala é o assunto, e o calendário fica
          atrás dele. Ele é o mesmo do plano seguinte: não sai do palco, e
          quando o corredor chega é aquele plano que o desenha, daqui.
        */}
        {stage.handedOver ? null : (
          <Stay only="leaving">
            <Researcher {...INTRO} />
          </Stay>
        )}
        {/* O nome só estoura na palavra, com ele já assentado: não entra com o elenco. */}
        <Stay only="entering">
          <Place x={INTRO.x + NAME_OFFSET[0]} y={INTRO.y + NAME_OFFSET[1]}>
            <Pop at={nameAt}>
              <Tag size="note" on="peach">
                Allan Rechtschaffen
              </Tag>
            </Pop>
          </Place>
        </Stay>
        <Grain />
      </ShotPush>
    </Sooner>
  );
};

const DOOR = { x: 1120, y: 900, width: 330, height: 600 };
const SIGN = { x: DOOR.x, y: DOOR.y - DOOR.height - 110 };
// A folha da porta entreaberta: quanto a borda livre avança e quanto ela sobe e desce em perspectiva.
const AJAR = { edge: 90, top: 14, bottom: 22 };
// Ele espera à esquerda e anda até a porta, em três passos.
const WALK = { from: 520, to: 850, seconds: 1, steps: 3 };
// No corredor: a altura dos pés dele e a dele.
const HALL = { feet: DOOR.y + 70, height: 560 };
// A câmera recua até o corredor inteiro e, daí até o fim do plano, deriva devagar na direção da porta.
const CORRIDOR = framing([960, 540], 1);
const CORRIDOR_NEARER = framing([1000, 600], 1.035, [1000, 600]);
const PULL_BACK_FRAMES = 24;
// A placa só estoura com o corredor quase no lugar.
const SIGN_AFTER_FRAMES = 16;
// E sai pelo caminho da entrada, em 0,2 s, terminando logo antes de a câmera partir para o plano das aspas.
const SIGN_LEAVES = { before: 7, frames: 6 };
const REACH_FRAMES = 10;
const OPEN_SECONDS = 0.6;
// Em que fração da caminhada a passada cresce ao partir e some ao chegar.
const GAIT_EDGE = 0.16;
// Antes de a câmera ir até ele, ele solta a maçaneta: o braço desce, e a expressão troca de olho fechado.
const LET_GO = { before: 18, frames: 8 };

// O plano das aspas: o quadro-negro, ele ao lado e a aproximação lenta.
const QUOTE_BOARD: Box = { x: 700, y: 130, width: 1100, height: 760 };
const QUOTE_FOCUS = [1250, 510] as const;
const QUOTE_PUSH = 0.06;
const QUOTE_HIM: Pose = { x: 360, y: 1240, height: 980 };
// A câmera vai do corredor até ele, ao lado do quadro: começa antes de o
// plano das aspas chegar e termina dentro dele. O quadro-negro entra pela
// direita no mesmo movimento, como o que a câmera encontra ao chegar.
const APPROACH = { lead: 12, frames: 16, board: 1300 };
const CLOSE_ON_HIM = framing(
  [WALK.to, HALL.feet],
  QUOTE_HIM.height / HALL.height,
  [QUOTE_HIM.x, QUOTE_HIM.y],
);

/** De 0 a 1, quanto a câmera já foi do corredor até ele, `sinceCut` quadros depois (ou antes, negativo) de o plano das aspas chegar. */
const approached = (sinceCut: number): number =>
  ramp(sinceCut, -APPROACH.lead, APPROACH.frames);

type Hall = {
  /** Quantos quadros o plano do corredor dura. */
  readonly length: number;
  /** Onde ele estava no quadro quando o plano do rosto passou o palco ao corredor. */
  readonly intro: Pose;
};

/** A câmera do corredor num quadro do plano dele: recua de perto dele, deriva, e no fim vai até ele de novo. */
const hallCamera = (frame: number, { length, intro }: Hall): CameraState => {
  // De perto: ele no mesmo lugar e do mesmo tamanho em que o plano do rosto o deixou.
  const nearHim = framing([WALK.from, HALL.feet], intro.height / HALL.height, [
    intro.x,
    intro.y,
  ]);
  const wide = cameraBetween(
    nearHim,
    cameraBetween(CORRIDOR, CORRIDOR_NEARER, frame / length),
    ramp(frame, 0, PULL_BACK_FRAMES),
  );
  return cameraBetween(wide, CLOSE_ON_HIM, approached(frame - length));
};

type LabDoorShotProps = {
  /** Quadros do plano em que a placa estoura, em que ele começa a andar e em que abre a porta. */
  readonly signAt: number;
  readonly walkAt: number;
  readonly openAt: number;
  readonly hall: Hall;
  /** Há quantos quadros ele está no palco quando o plano começa. */
  readonly since: number;
};

/** A porta do laboratório, com a placa em cima; ele chega e a abre. */
const LabDoorShot: React.FC<LabDoorShotProps> = ({
  signAt,
  walkAt,
  openAt,
  hall,
  since,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const stage = useStage();
  const { x, y, width, height } = DOOR;
  const walkFrames = WALK.seconds * fps;
  // Ele parte e chega devagar. A passada conta os passos pela distância, e não
  // pelo tempo: os pés andam mais depressa no meio do caminho, com o corpo.
  // Parte e chega com um pé no ar (a fase 0,5), que é como o passo começa e fecha.
  const walked = ramp(frame, walkAt, walkFrames);
  const going = linear(frame, walkAt, walkFrames);
  const gait = Math.max(
    0,
    Math.min(1, going / GAIT_EDGE, (1 - going) / GAIT_EDGE),
  );
  const feet = mix(WALK.from, WALK.to, walked);
  // A mão vai à maçaneta logo antes de a porta abrir, e a porta abre com peso.
  // No fim do plano ele a solta: é com o braço solto que a câmera o encontra.
  const letGoAt = hall.length - LET_GO.before;
  const reach =
    ramp(frame, openAt - REACH_FRAMES, REACH_FRAMES) -
    ramp(frame, letGoAt, LET_GO.frames);
  const open = ramp(frame, openAt, OPEN_SECONDS * fps);
  const edge = x - width / 2 + AJAR.edge * open;
  const arrived = approached(frame - hall.length);

  return (
    <AbsoluteFill>
      <Camera {...hallCamera(frame, hall)}>
        {/* A parede toma a cor dela no lugar; o corredor sobe para o palco e desce dele. */}
        <Layer depth={0}>
          <AbsoluteFill
            style={{
              background: `linear-gradient(${lab.wall[0]}, ${lab.wall[1]})`,
            }}
          />
        </Layer>
        <Layer depth={1}>
          <SvgLayer>
            {/* O corredor: o rodapé, o piso e a faixa da parede. De perto a câmera vê mais para os lados e para baixo. */}
            <rect
              x={-1600}
              y={560}
              width={5120}
              height={16}
              rx={8}
              fill={lab.shelf}
            />
            <rect x={-1600} y={y} width={5120} height={900} fill={lab.bench} />
            <rect
              x={-1600}
              y={y}
              width={5120}
              height={22}
              fill={lab.benchTop}
            />
            <rect
              x={-1600}
              y={y + 150}
              width={5120}
              height={750}
              fill={lab.benchShade}
            />
            {/* O quadro de avisos, ao lado: papéis presos, perto da cor da parede. */}
            <rect
              x={250}
              y={300}
              width={300}
              height={220}
              rx={18}
              fill={lab.shelf}
            />
            <rect
              x={280}
              y={330}
              width={100}
              height={130}
              rx={8}
              fill={lab.wall[0]}
            />
            <rect
              x={410}
              y={350}
              width={110}
              height={80}
              rx={8}
              fill={lab.wall[0]}
            />
            {/* A porta: o batente, o vão escuro e a folha com o visor, que se abre para dentro. */}
            <rect
              x={x - width / 2 - 26}
              y={y - height - 26}
              width={width + 52}
              height={height + 26}
              rx={18}
              fill={lab.benchShade}
            />
            <rect
              x={x - width / 2}
              y={y - height}
              width={width}
              height={height}
              fill={lab.contact}
            />
            <path
              d={`M${edge},${y - height + AJAR.top * open} L${x + width / 2},${y - height} L${x + width / 2},${y} L${edge},${y + AJAR.bottom * open} Z`}
              fill={lab.platform}
            />
            <path
              d={`M${x + width / 2 - 40 * open},${y - height} L${x + width / 2},${y - height} L${x + width / 2},${y} L${x + width / 2 - 40 * open},${y + 4 * open} Z`}
              fill={lab.platformShade}
            />
            <rect
              x={edge + 40}
              y={y - height + 80}
              width={120}
              height={170}
              rx={16}
              fill={lab.water}
            />
            <circle
              cx={edge + 32}
              cy={y - height / 2 + 30}
              r={16}
              fill={lab.clip}
            />
            {/* A luz que sai pelo vão, no piso: só existe com a porta aberta, e tremula de leve. */}
            <path
              d={`M${x - width / 2},${y} L${edge},${y} L${x - width / 2 - 40},${y + 150} L${x - width / 2 - 260},${y + 150} Z`}
              fill={lab.benchTop}
              opacity={(0.7 + 0.14 * wave(frame / fps, 1.9)) * open}
            />
            <ellipse
              cx={feet}
              cy={y + 76}
              rx={150}
              ry={18}
              fill={lab.contact}
              opacity={0.3}
            />
          </SvgLayer>
          {/* A placa do laboratório: texto do mundo, sobre a porta. */}
          <Place x={SIGN.x} y={SIGN.y}>
            <Pop at={Math.max(signAt, SIGN_AFTER_FRAMES)}>
              <div
                style={{
                  // A placa sai, encolhendo, antes de a câmera ir até ele: no caminho ela cruzava o rosto dele.
                  scale: `${1 - drop(frame, hall.length - APPROACH.lead - SIGN_LEAVES.before, SIGN_LEAVES.frames)}`,
                  fontFamily: typography.family,
                  fontWeight: 700,
                  fontSize: typography.size.note,
                  lineHeight: 1.1,
                  whiteSpace: "nowrap",
                  color: lab.paper,
                  background: lab.clip,
                  border: `8px solid ${lab.paper}`,
                  borderRadius: 22,
                  padding: "0.3em 0.7em",
                }}
              >
                Laboratório do Sono · Chicago
              </div>
            </Pop>
          </Place>
        </Layer>
        {/*
          Ele não sobe nem desce com o corredor: já estava no palco no plano
          do rosto e continua no das aspas. A câmera é que se afasta dele e
          volta; quando o plano seguinte chega, é ele quem o desenha.
        */}
        {stage.handedOver ? null : (
          <Build>
            <Layer depth={1}>
              <Researcher
                x={feet}
                y={HALL.feet}
                height={HALL.height}
                since={since}
                reach={reach}
                stride={{ step: 0.5 + WALK.steps * walked, gait }}
                // Andando, o corpo pende um pouco para a frente.
                tilt={3.5 * Math.sin(Math.PI * going)}
                // A expressão troca com a pálpebra fechada, quando o braço sobe e quando desce.
                lid={Math.max(
                  interpolate(
                    frame,
                    [openAt - 8, openAt - 5, openAt - 2],
                    [0, 1, 0],
                    clamp,
                  ),
                  interpolate(
                    frame,
                    [letGoAt + 1, letGoAt + 4, letGoAt + 7],
                    [0, 1, 0],
                    clamp,
                  ),
                )}
              />
            </Layer>
          </Build>
        )}
      </Camera>
      {/* O quadro-negro do plano seguinte chega pela direita enquanto a câmera vai até ele. */}
      {stage.handedOver || arrived <= 0 ? null : (
        <Stay>
          <Board {...shifted(QUOTE_BOARD, mix(APPROACH.board, 0, arrived))} />
        </Stay>
      )}
      <Grain />
    </AbsoluteFill>
  );
};

// O gesto, em três tempos: o braço recua e o corpo pende para longe do quadro
// (o preparo), o braço sobe de uma vez e passa do ponto, e assenta. No meio da
// subida ele já olha para o quadro: a expressão troca de olho fechado.
const GESTURE = { at: 2, prep: 7, sweep: 4, back: 4, settle: 6 };
// O giz não espera mais que o quadro: as aspas abrem quando ele chega.
const QUOTE_AFTER_FRAMES = APPROACH.frames - APPROACH.lead;
// A frase é apagada antes de a câmera recuar: as linhas passam a giz esmaecido.
const ERASE_BEFORE = 15;
// O recuo para o quadro inteiro: ele e o quadro das aspas diminuem juntos e
// saem pela esquerda, e o quadro grande chega pela direita. Começa antes de o
// plano seguinte chegar e termina dentro dele.
const RECEDE = {
  lead: 12,
  frames: 18,
  scale: 0.5,
  around: [360, 700],
  left: 1140,
  board: 1800,
} as const;

/** De 0 a 1, quanto a câmera já recuou do quadro das aspas, `sinceCut` quadros depois (ou antes) de o plano do quadro inteiro chegar. */
const receded = (sinceCut: number): number =>
  ramp(sinceCut, -RECEDE.lead, RECEDE.frames);

/** O plano das aspas visto de mais longe: tudo o que está dentro diminui junto e sai pela esquerda. */
const Receding: React.FC<{ by: number; children: React.ReactNode }> = ({
  by,
  children,
}) => (
  <AbsoluteFill
    style={{
      transformOrigin: `${RECEDE.around[0]}px ${RECEDE.around[1]}px`,
      translate: `${-RECEDE.left * by}px 0`,
      scale: `${mix(1, RECEDE.scale, by)}`,
    }}
  >
    {children}
  </AbsoluteFill>
);

type QuoteShotProps = {
  /** Quadros do plano em que as aspas abrem, em que cada linha se escreve e em que as aspas fecham. */
  readonly openAt: number;
  readonly linesAt: readonly [number, number, number];
  readonly closeAt: number;
  readonly hall: Hall;
  /** Há quantos quadros ele está no palco quando o plano começa. */
  readonly since: number;
};

/** De perto: ele se vira para o quadro-negro e as aspas se abrem nele; a frase é dele. */
const QuoteShot: React.FC<QuoteShotProps> = ({
  openAt,
  linesAt,
  closeAt,
  hall,
  since,
}) => {
  const frame = useCurrentFrame();
  const stage = useStage();
  const length = useShotLength();
  // A câmera ainda está chegando do corredor: ele vem de onde ela o deixou.
  const arrived = approached(frame);
  const camera = hallCamera(hall.length + frame, hall);
  const feet = project(camera, [WALK.to, HALL.feet]);
  const him: Pose =
    arrived < 1
      ? { x: feet[0], y: feet[1], height: HALL.height * camera.zoom }
      : QUOTE_HIM;
  const prep = ramp(frame, GESTURE.at, GESTURE.prep);
  const sweepAt = GESTURE.at + GESTURE.prep;
  const sweep = interpolate(frame, [sweepAt, sweepAt + GESTURE.sweep], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.quad),
  });
  const back = ramp(frame, sweepAt + GESTURE.sweep, GESTURE.back);
  const rest = ramp(
    frame,
    sweepAt + GESTURE.sweep + GESTURE.back,
    GESTURE.settle,
  );
  const quoteAt = Math.max(openAt, QUOTE_AFTER_FRAMES);
  const away = receded(frame - length);
  // O quadro grande chega em pixels do quadro; aqui dentro a aproximação lenta já ampliou tudo um pouco.
  const zoom = slowPushAt(frame, length, QUOTE_PUSH);
  const wide = pushed(
    shifted(BOARD_WIDE, mix(RECEDE.board, 0, away)),
    QUOTE_FOCUS,
    1 / zoom,
  );

  return (
    <ShotPush
      focus={QUOTE_FOCUS}
      by={QUOTE_PUSH}
      backdrop={<LabWall />}
    >
      {/*
        Nada daqui entra nem sai pela marcação do palco: ele e o quadro chegam
        com a câmera e vão embora com ela. Quando o plano seguinte chega, é
        ele quem desenha o que ainda está saindo.
      */}
      {stage.handedOver ? null : (
        <Stay>
          <Receding by={away}>
            <Board {...shifted(QUOTE_BOARD, mix(APPROACH.board, 0, arrived))} />
            {arrived < 1 ? null : (
              <Quote
                box={QUOTE_BOARD}
                at={quoteAt}
                linesAt={linesAt}
                closeAt={closeAt}
                erasedAt={length - ERASE_BEFORE}
              />
            )}
            <Researcher
              {...him}
              since={since}
              reach={-0.4 * prep + 1.54 * sweep - 0.18 * back + 0.04 * rest}
              tilt={-4 * prep + 7 * sweep - 1.2 * back - 0.6 * rest}
              lid={interpolate(
                frame,
                [sweepAt - 1, sweepAt + 1, sweepAt + 3, sweepAt + 5],
                [0, 1, 1, 0],
                clamp,
              )}
            />
          </Receding>
          {away <= 0 ? null : <Board {...wide} />}
        </Stay>
      )}
      <Grain />
    </ShotPush>
  );
};

// A árvore: o tronco sobe, os ramos se abrem, os bichos brotam um a um e fecham os olhos um a um.
const TREE = {
  trunk: [3, 8],
  branches: [8, 11],
  budsAt: 16,
  budEvery: 2,
  eyesAt: 32,
  eyeEvery: 3,
} as const;
// O quadro treme quando o carimbo encosta nele: quantos quadros depois de a descida começar, e por quanto tempo.
const SHAKE = { after: 3, frames: 10, pixels: 10 };
const VERDICT_FOCUS = [960, 540] as const;
const VERDICT_PUSH = 0.04;
// Parado, o quadro pendurado balança um nada, e o carimbo com ele.
const HANG = { degrees: 0.35, seconds: 5.3 };

/**
 * A árvore da vida passa do quadro-negro para o plano seguinte, em que a
 * evolução a poda: ela não sai da tela. O quadro cresce em volta dela até a
 * moldura sair do quadro, e a árvore troca o giz pelas cores do fundo lilás
 * enquanto vai para o lugar novo. Começa antes de o plano seguinte chegar e
 * termina dentro dele; `TimeToFixScene` desenha a segunda metade.
 */
const TREE_MORPH = { lead: 10, frames: 20, board: 2.4 } as const;

/** De 0 a 1, quanto a árvore já foi do quadro-negro ao lugar dela na poda, `sinceCut` quadros depois (ou antes) de o plano da poda chegar. */
export const treeMorphed = (sinceCut: number): number =>
  ramp(sinceCut, -TREE_MORPH.lead, TREE_MORPH.frames);

type TreeTones = {
  readonly color: string;
  readonly bud: string;
  readonly eye: string;
};

/**
 * As cores da árvore no mesmo instante. A árvore inteira toma primeiro o
 * coral dos bichos, e só depois os ramos escurecem até o roxo: do giz direto
 * ao roxo, eles passariam por um lilás igual ao do fundo novo e sumiriam.
 */
export const treeTones = (sinceCut: number, to: TreeTones): TreeTones => ({
  color: interpolateColors(
    sinceCut,
    [-7, 2, 5, 11],
    [chalkboard.chalk, to.bud, to.bud, to.color],
  ),
  bud: interpolateColors(sinceCut, [-7, 2], [chalkboard.chalk, to.bud]),
  eye: interpolateColors(sinceCut, [-7, 2], [chalkboard.face, to.eye]),
});

/** Onde a árvore de giz está no quadro (o pé do tronco e a largura) quando o plano da poda chega: é de onde ele a recebe. */
export const chalkTreeAtHandover = (): {
  readonly x: number;
  readonly y: number;
  readonly width: number;
} => {
  const zoom = 1 + VERDICT_PUSH;
  const tree = chalkTree(BOARD_WIDE);
  const [x, y] = pushedPoint([tree.x, tree.y], VERDICT_FOCUS, zoom);
  return { x, y, width: tree.width * zoom };
};

/** A árvore da poda, como `TimeToFixScene` a desenha: o pé do tronco, a largura e as cores. */
export const PRUNED_TREE = {
  x: 1040,
  y: 1010,
  width: 1240,
  color: idea.lilac.contact,
  bud: ink.tag,
  eye: ink.dark,
} as const;

type VerdictShotProps = {
  /** Quadros do plano em que o carimbo aparece no ar e em que bate. */
  readonly raisedAt: number;
  readonly stampAt: number;
  /** A aproximação lenta do plano das aspas quando este plano chegou. */
  readonly quoteZoom: number;
  /** Há quantos quadros o pesquisador está no palco quando o plano começa. */
  readonly since: number;
};

/** No quadro, a árvore da vida com todos os ramos dormindo, e o carimbo enorme por cima: "erro?". */
const VerdictShot: React.FC<VerdictShotProps> = ({
  raisedAt,
  stampAt,
  quoteZoom,
  since,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const stage = useStage();
  const length = useShotLength();
  const seconds = frame / fps;
  // O tremor: um vaivém que morre depressa, nos dois eixos, fora de fase.
  const shaken = frame - (stampAt + SHAKE.after);
  const shake =
    shaken < 0 || shaken > SHAKE.frames
      ? 0
      : SHAKE.pixels * (1 - shaken / SHAKE.frames) ** 2;
  // A câmera ainda está recuando do plano das aspas: o quadro grande chega pela direita.
  const away = receded(frame);
  const box = shifted(BOARD_WIDE, mix(RECEDE.board, 0, away));
  const stamp = chalkStamp(box);
  // No fim, a árvore vai para o plano seguinte: em pixels do quadro, e aqui
  // dentro a aproximação lenta já ampliou tudo um pouco.
  const zoom = slowPushAt(frame, length, VERDICT_PUSH);
  const sinceCut = frame - length;
  const morphed = treeMorphed(sinceCut);
  const from = chalkTreeAtHandover();
  const [treeX, treeY] = pushedPoint(
    [mix(from.x, PRUNED_TREE.x, morphed), mix(from.y, PRUNED_TREE.y, morphed)],
    VERDICT_FOCUS,
    1 / zoom,
  );
  const here = chalkTree(box);

  return (
    <ShotPush
      focus={VERDICT_FOCUS}
      by={VERDICT_PUSH}
      backdrop={<LabWall />}
    >
      {/* O que o plano das aspas deixou saindo: ele e o quadro pequeno, com a frase apagada. */}
      {away >= 1 ? null : (
        <Stay>
          <AbsoluteFill
            style={{
              transformOrigin: `${QUOTE_FOCUS[0]}px ${QUOTE_FOCUS[1]}px`,
              scale: `${quoteZoom}`,
            }}
          >
            <Receding by={away}>
              <Board {...QUOTE_BOARD} />
              <Quote
                box={QUOTE_BOARD}
                at={ALREADY_SHOWN}
                linesAt={[ALREADY_SHOWN, ALREADY_SHOWN, ALREADY_SHOWN]}
                closeAt={ALREADY_SHOWN}
                erasedAt={ALREADY_SHOWN}
              />
              <Researcher {...QUOTE_HIM} since={since} reach={1} />
            </Receding>
          </AbsoluteFill>
        </Stay>
      )}
      <div
        style={{
          position: "absolute",
          inset: 0,
          transformOrigin: `${BOARD_WIDE.x + BOARD_WIDE.width / 2}px ${BOARD_WIDE.y - 60}px`,
          translate: `${shake * Math.cos(shaken * 2.3)}px ${shake * Math.sin(shaken * 3.1)}px`,
          rotate: `${HANG.degrees * wave(seconds, HANG.seconds)}deg`,
        }}
      >
        <Stay>
          {/* O quadro cresce em volta da árvore até a moldura sair do quadro: a face dele vira o fundo. */}
          <AbsoluteFill
            style={{
              transformOrigin: `${from.x}px ${from.y - from.width * 0.4}px`,
              scale: `${mix(1, TREE_MORPH.board, morphed)}`,
            }}
          >
            <Board {...box} />
          </AbsoluteFill>
          {/* A árvore é a mesma do plano seguinte: quando ele chega, é ele quem a desenha. */}
          {stage.handedOver ? null : (
            <Place
              x={morphed > 0 ? treeX : here.x}
              y={morphed > 0 ? treeY : here.y}
              anchor="bottom"
            >
              <LifeTree
                width={
                  morphed > 0
                    ? mix(from.width, PRUNED_TREE.width, morphed) / zoom
                    : here.width
                }
                {...treeTones(sinceCut, PRUNED_TREE)}
                trunk={ramp(frame, TREE.trunk[0], TREE.trunk[1])}
                grown={ramp(frame, TREE.branches[0], TREE.branches[1])}
                buds={Math.max(0, (frame - TREE.budsAt) / TREE.budEvery)}
                closed={Math.max(0, (frame - TREE.eyesAt) / TREE.eyeEvery)}
              />
            </Place>
          )}
        </Stay>
        {/* O carimbo sai do palco antes de o quadro crescer: encolhe no próprio ponto. */}
        <Stay only="entering">
          <Stamp
            x={stamp.x}
            y={stamp.y}
            size={stamp.size}
            at={stampAt}
            raisedAt={raisedAt}
          />
        </Stay>
      </div>
      <Grain />
    </ShotPush>
  );
};

export const BiggestMistakeScene: React.FC<SceneProps> = ({ scene, shots }) => {
  const lengths = shots.map((shot) => shot.to - shot.from);
  // Onde ele está no quadro quando o plano do rosto passa o palco ao corredor.
  const introZoom = 1 + INTRO_PUSH;
  const [introX, introY] = pushedPoint(
    [INTRO.x, INTRO.y],
    INTRO_FOCUS,
    introZoom,
  );
  const hall: Hall = {
    length: lengths[1],
    intro: { x: introX, y: introY, height: INTRO.height * introZoom },
  };

  return (
    <>
      <Shot range={shots[0]} name="o pesquisador e os 44 anos">
        <IntroShot
          nameAt={cue(scene, "Réctchafen")}
          decadesAt={cue(scene, "quarenta")}
          yearsAt={cue(scene, "quatro")}
        />
      </Shot>
      <Shot range={shots[1]} name="o laboratório do sono, em Chicago">
        <LabDoorShot
          signAt={cue(scene, "Universidade") - shots[1].from}
          walkAt={cue(scene, "Chicago") - shots[1].from}
          openAt={cue(scene, "resumia") - shots[1].from}
          hall={hall}
          since={lengths[0]}
        />
      </Shot>
      <Shot range={shots[2]} name="a frase é dele">
        <QuoteShot
          openAt={cue(scene, "se") - shots[2].from}
          linesAt={[
            cue(scene, "sono", 2) - shots[2].from,
            cue(scene, "uma") - shots[2].from,
            cue(scene, "absolutamente") - shots[2].from,
          ]}
          closeAt={cue(scene, "vital") - shots[2].from}
          hall={hall}
          since={lengths[0] + lengths[1]}
        />
      </Shot>
      <Shot range={shots[3]} name="o maior erro da evolução?">
        <VerdictShot
          raisedAt={cue(scene, "erro") - shots[3].from}
          stampAt={cue(scene, "evolução") - shots[3].from}
          quoteZoom={1 + QUOTE_PUSH}
          since={lengths[0] + lengths[1] + lengths[2]}
        />
      </Shot>
    </>
  );
};
