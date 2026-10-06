import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { Person } from "../../../art/Person";
import { useMemo } from "react";
import {
  Cast,
  FlatStage,
  StageContext,
  Stay,
  useStage,
} from "../../../components/Cast";
import { Grain } from "../../../components/Grain";
import { blink, breath, wave } from "../../../components/Idle";
import { Place } from "../../../components/Place";
import { Pop } from "../../../components/Pop";
import { SvgLayer } from "../../../components/SvgLayer";
import { cue, linear, mix, ramp } from "../../../components/timing";
import type { SceneProps } from "../../../video/NarratedVideo";
import { Shot, useShotLength } from "../../../video/Shot";
import { chalkboard, idea, ink, sky, street, tags } from "../palette";
import { Bed } from "../parts/Bed";
import { Mug } from "../parts/Belongings";
import { IdeaBackdrop, IdeaShadow } from "../parts/IdeaBackdrop";
import {
  HoursClock,
  StudyShelf,
  SUBJECTS,
  SyllableSheet,
  TestBadge,
} from "../parts/SyllableList";
import { Tag } from "../parts/Tag";
import { flash, Prelude, Sooner } from "./MaybeBrainScene";
import { HEAD_LEAD, StockroomOpening } from "./StockroomScene";
import { centeredAt, SHEET as CLOSE_LIST } from "./MemoryTestScene";
import { Drift, driftZoom, Grow, undrifted } from "./SleepDebtScene";

/**
 * Quem está aqui sai depois da marcação de sempre: é o que os dois planos têm
 * em comum, e fica na tela até o plano seguinte chegar, para a troca não
 * deixar o quadro só com o fundo.
 */
export const Later: React.FC<{ by: number; children: React.ReactNode }> = ({
  by,
  children,
}) => {
  const stage = useStage();
  const later = useMemo(
    () => ({ ...stage, leave: (delay = 0) => stage.leave(delay + by) }),
    [stage, by],
  );
  return (
    <StageContext.Provider value={later}>{children}</StageContext.Provider>
  );
};

/** O fundo liso das três voltas desta cena. */
const HUE = "peach";

// A tela dividida: a noite de quem dormiu à esquerda, o dia de quem ficou acordado à direita.
const GROUND = 880;
const HOURS = 8;
const WINDOW = { width: 250, height: 250 };

type WindowProps = {
  /** O centro da janela, em pixels do quadro. */
  readonly x: number;
  readonly y: number;
  readonly night: boolean;
  /** O tempo, em segundos: as estrelas piscam e o sol respira. */
  readonly seconds: number;
};

/** A janela do quarto: a lua e as estrelas, ou o sol. Vai dentro de um SvgLayer. */
const RoomWindow: React.FC<WindowProps> = ({ x, y, night, seconds }) => {
  const left = x - WINDOW.width / 2;
  const top = y - WINDOW.height / 2;
  return (
    <g>
      <rect
        x={left - 14}
        y={top - 14}
        width={WINDOW.width + 28}
        height={WINDOW.height + 28}
        rx={30}
        fill={ink.paper}
      />
      <rect
        x={left}
        y={top}
        width={WINDOW.width}
        height={WINDOW.height}
        rx={18}
        fill={night ? street.night.sky[0] : sky.day.top}
      />
      <rect
        x={left}
        y={top + WINDOW.height * 0.55}
        width={WINDOW.width}
        height={WINDOW.height * 0.45}
        rx={18}
        fill={night ? street.night.sky[1] : sky.day.bottom}
      />
      {night ? (
        <>
          {[
            [0.2, 0.24],
            [0.3, 0.66],
            [0.82, 0.72],
          ].map(([sx, sy]) => (
            <circle
              key={sx}
              cx={left + WINDOW.width * sx}
              cy={top + WINDOW.height * sy}
              // Cada estrela pisca no seu tempo.
              r={6 + 2 * wave(seconds, 1.7 + sx, sy)}
              fill={ink.moon}
            />
          ))}
          <path
            d="M10,-44 A44,44 0 1 0 44,14 A35,35 0 1 1 10,-44 Z"
            fill={ink.moon}
            transform={`translate(${left + WINDOW.width * 0.6} ${top + WINDOW.height * 0.4})`}
          />
        </>
      ) : (
        <circle
          cx={left + WINDOW.width * 0.62}
          cy={top + WINDOW.height * 0.4}
          r={46 + 3 * wave(seconds, 3.1)}
          fill={sky.day.sun}
        />
      )}
      <rect
        x={x - 6}
        y={top}
        width={12}
        height={WINDOW.height}
        fill={ink.paper}
      />
      <rect
        x={left - 34}
        y={top + WINDOW.height + 8}
        width={WINDOW.width + 68}
        height={26}
        rx={13}
        fill={ink.paper}
      />
    </g>
  );
};

type SideTableProps = {
  /** O meio do tampo, em pixels do quadro. */
  readonly x: number;
  readonly hue: keyof typeof idea;
};
const TABLE_TOP = GROUND - 150;

/** A mesa de cabeceira. Vai dentro de um SvgLayer; a lista fica por cima, de pé, encostada na parede. */
const SideTable: React.FC<SideTableProps> = ({ x, hue }) => (
  <g>
    <IdeaShadow hue={hue} x={x} y={GROUND + 4} width={220} />
    {[-70, 54].map((leg) => (
      <rect
        key={leg}
        x={x + leg}
        y={TABLE_TOP + 20}
        width={16}
        height={GROUND - TABLE_TOP - 20}
        rx={8}
        fill={chalkboard.frame}
      />
    ))}
    <rect
      x={x - 100}
      y={TABLE_TOP + 24}
      width={200}
      height={56}
      rx={12}
      fill={chalkboard.frame}
    />
    <rect
      x={x - 116}
      y={TABLE_TOP}
      width={232}
      height={30}
      rx={15}
      fill={idea.peach.top}
    />
  </g>
);

// Quem dormiu: deitada, com a cabeça à esquerda; a mesa de cabeceira, com a lista, aos pés da cama.
const BED = { x: 372, scale: 0.57 };
const NIGHT_TABLE = 842;
// Quem ficou acordada: de pé, com a caneca, ao lado da mesma mesa e da mesma lista.
const AWAKE = { x: 1560, height: 600 };
const DAY_TABLE = 1210;
const LIST = { width: 112, tilt: 5 };
const LIST_HEIGHT = (LIST.width * 560) / 360;
// As duas listas nas mesas de cabeceira: é delas que o plano do teste parte.
const TABLE_LISTS = [
  { x: NIGHT_TABLE, y: TABLE_TOP - LIST_HEIGHT / 2 + 4, tilt: LIST.tilt },
  { x: DAY_TABLE, y: TABLE_TOP - LIST_HEIGHT / 2 + 4, tilt: -LIST.tilt },
] as const;
const SPLIT_FOCUS = [960, 600] as const;
// Os dois lados abrem o plano: entram antes da marcação de sempre.
const SPLIT_SOONER = 12;
// Apagado, cada lado fica sob um véu da cor de contato do fundo dele.
const DIM = 0.62;
// A lista de perto da cena anterior se divide em duas, uma para cada mesa de cabeceira: em quantos quadros.
const SPLIT_FRAMES = 18;
// Em quantos segundos o relógio de cada lado corre as oito horas, a velocidade constante.
const CLOCK_SECONDS = { slept: 1.6, awake: 1 };

type SplitShotProps = {
  /** Quadros do plano em que acende o lado de quem dormiu e o de quem ficou acordada. */
  readonly sleptAt: number;
  readonly awakeAt: number;
  readonly clock: number;
};

/** Tela dividida: a mesma pessoa dormindo logo depois de decorar, e passando as mesmas horas acordada. */
const SplitShot: React.FC<SplitShotProps> = ({ sleptAt, awakeAt, clock }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const stage = useStage();
  const seconds = (clock + frame) / fps;
  const slept = ramp(frame, sleptAt, 0.4 * fps);
  const awake = ramp(frame, awakeAt, 0.4 * fps);
  // Os véus chegam com o fundo, e não num quadro só.
  const arrived = stage.enter();
  const length = useShotLength();
  // A lista vem de onde a cena anterior a deixou, já descontada a deriva deste plano.
  const zoom = driftZoom(0, length);
  const parted = ramp(frame, 0, SPLIT_FRAMES);
  const listFrom = undrifted([CLOSE_LIST.x, CLOSE_LIST.y], SPLIT_FOCUS, zoom);
  const big = CLOSE_LIST.width / zoom;

  return (
    <AbsoluteFill>
      <FlatStage
        backdrop={
          <>
            <AbsoluteFill style={{ clipPath: "inset(0 50% 0 0)" }}>
              <IdeaBackdrop hue="lilac" spot={[0.22, 0.6]} />
            </AbsoluteFill>
            <AbsoluteFill style={{ clipPath: "inset(0 0 0 50%)" }}>
              <IdeaBackdrop hue={HUE} spot={[0.8, 0.55]} />
            </AbsoluteFill>
          </>
        }
      >
        <Sooner by={SPLIT_SOONER}>
          <Drift focus={SPLIT_FOCUS}>
            <Cast origin={[250, 250]}>
              <SvgLayer>
                <RoomWindow x={250} y={250} night seconds={seconds} />
              </SvgLayer>
            </Cast>
            <Cast origin={[700, 250]} order={1}>
              <SvgLayer>
                <HoursClock
                  x={700}
                  y={250}
                  radius={100}
                  hours={
                    HOURS *
                    linear(frame, sleptAt + 6, CLOCK_SECONDS.slept * fps)
                  }
                />
              </SvgLayer>
            </Cast>
            <Cast origin={[NIGHT_TABLE, GROUND]} order={2}>
              <SvgLayer>
                <SideTable x={NIGHT_TABLE} hue="lilac" />
              </SvgLayer>
            </Cast>
            <Cast origin={[BED.x, GROUND]}>
              <Bed
                {...BED}
                y={GROUND}
                colors={SUBJECTS[0]}
                hue="lilac"
                // O cobertor no verde da blusa dele: o azul é só de Gardner.
                blanket="green"
                snoreAt={sleptAt + 8}
                snoreSize={96}
                breath={breath(seconds, "slept", {
                  amplitude: 0.035,
                  period: 4.8,
                })}
              />
            </Cast>
            <Cast origin={[1700, 250]} order={1}>
              <SvgLayer>
                <RoomWindow x={1700} y={250} night={false} seconds={seconds} />
              </SvgLayer>
            </Cast>
            <Cast origin={[1210, 250]}>
              <SvgLayer>
                <HoursClock
                  x={1210}
                  y={250}
                  radius={100}
                  hours={
                    HOURS *
                    linear(frame, awakeAt + 6, CLOCK_SECONDS.awake * fps)
                  }
                />
              </SvgLayer>
            </Cast>
            <Cast origin={[DAY_TABLE, GROUND]} order={2}>
              <SvgLayer>
                <SideTable x={DAY_TABLE} hue={HUE} />
              </SvgLayer>
            </Cast>
            <Cast origin={[AWAKE.x, GROUND]} order={3}>
              <SvgLayer>
                <IdeaShadow hue={HUE} x={AWAKE.x} y={GROUND + 4} width={300} />
              </SvgLayer>
            </Cast>
            <Place
              x={AWAKE.x}
              y={GROUND}
              anchor="bottom"
              style={{
                scale: `1 ${breath(seconds, "awake")}`,
                // Quem espera as horas passarem troca o peso de um pé para o outro.
                rotate: `${1.1 * wave(seconds, 4.7, 0.2)}deg`,
              }}
            >
              <Person
                height={AWAKE.height}
                colors={SUBJECTS[0]}
                blink={blink(seconds, "awake")}
                frontArm={{ hand: [-150, -310], bend: 24 }}
                held={<Mug seconds={seconds} />}
              />
            </Place>
            {/*
              A lista de perto da cena anterior se divide em duas, que pousam nas mesas de cabeceira; e
              as duas continuam no plano seguinte, que as leva para o centro. Aqui não entram nem saem.
            */}
            {stage.handedOver
              ? null
              : TABLE_LISTS.map(({ x, y, tilt }) => (
                  <Stay key={x}>
                    <Place
                      x={0}
                      y={0}
                      style={{
                        translate: centeredAt(
                          mix(listFrom[0], x, parted),
                          mix(listFrom[1], y, parted),
                        ),
                        rotate: `${mix(CLOSE_LIST.tilt, tilt, parted)}deg`,
                      }}
                    >
                      <SyllableSheet
                        width={big * (LIST.width / big) ** parted}
                        // Pequena, a letra fica abaixo do legível: vira o traço da tarja.
                        written={1 - ramp(frame, 3, 9)}
                      />
                    </Place>
                  </Stay>
                ))}
          </Drift>
        </Sooner>
        {/* Cada lado só acende na oração dele: até lá existe, apagado. */}
        <AbsoluteFill
          style={{
            clipPath: "inset(0 50% 0 0)",
            background: idea.lilac.contact,
            opacity: DIM * (1 - slept) * arrived,
          }}
        />
        <AbsoluteFill
          style={{
            clipPath: "inset(0 0 0 50%)",
            background: idea.peach.contact,
            opacity: DIM * (1 - awake) * arrived,
          }}
        />
        {/* A divisória corta o quadro do meio para as pontas, e sai como entrou. */}
        <AbsoluteFill
          style={{
            scale: `1 ${ramp(frame, 0, 12) * (1 - stage.leave(4))}`,
          }}
        >
          <SvgLayer>
            <rect x={953} y={0} width={14} height={1080} fill={ink.paper} />
          </SvgLayer>
        </AbsoluteFill>
        <Grain />
      </FlatStage>
    </AbsoluteFill>
  );
};

// As duas listas na hora do teste, grandes, e as duas pessoas à direita, pequenas.
const SHEETS = { xs: [430, 900], y: 580, width: 410 };
const SHEET_HEIGHT = (SHEETS.width * 560) / 360;
// O colchete vai da borda da primeira lista até antes do selo da segunda, que fica no canto dela.
const BRACKET = {
  from: SHEETS.xs[0] - SHEETS.width / 2 + 20,
  to: SHEETS.xs[1] + SHEETS.width / 2 - 110,
};
const PAIR = { xs: [1400, 1610], y: 900, height: 340 };
// As sílabas que cada lista ainda guarda: a de quem dormiu, seis; a de quem ficou acordada, quatro.
// A fonte só diz que quem dormiu esqueceu menos, em todos os intervalos: a diferença aqui é
// ilustrativa e fica pequena de propósito, para o quadro não afirmar "o dobro".
const FORGOTTEN: readonly [readonly number[], readonly number[]] = [
  [2, 5, 7, 9],
  [0, 1, 3, 4, 6, 8],
];
const KINDS = ["slept", "awake"] as const;
const TEST_FOCUS = [665, 580] as const;
// A câmera chega às listas: em quantos quadros elas vêm das mesas de cabeceira até o centro.
const ARRIVE_FRAMES = 18;
// As sílabas apagam uma a uma: o intervalo entre elas, e quanto cada uma leva.
const FORGET = { step: 3, seconds: 0.3 };
const PAIR_SOONER = 12;
// As duas pessoas são as mesmas do plano seguinte: saem por último, quando ele já chegou.
const PAIR_LATER = 12;

type TestShotProps = {
  /** Quadros do plano em que as sílabas começam a apagar, em que o colchete e a etiqueta entram, e em que entra "só duas". */
  readonly forgetAt: number;
  readonly tagAt: number;
  readonly onlyAt: number;
  readonly clock: number;
};

/** Na hora do teste, a lista de quem dormiu tem mais sílabas acesas; as duas pessoas são "só duas". */
const TestShot: React.FC<TestShotProps> = ({
  forgetAt,
  tagAt,
  onlyAt,
  clock,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const length = useShotLength();
  const seconds = (clock + frame) / fps;
  const top = SHEETS.y - SHEET_HEIGHT / 2;
  const zoom = driftZoom(0, length);
  const arrived = ramp(frame, 0, ARRIVE_FRAMES);
  // O colchete abre do meio para as pontas, e as pernas dele descem depois.
  const middle = (BRACKET.from + BRACKET.to) / 2;
  const spread = ramp(frame, tagAt, 9);
  const legs = ramp(frame, tagAt + 7, 6);
  const bracket = {
    from: mix(middle, BRACKET.from, spread),
    to: mix(middle, BRACKET.to, spread),
  };

  return (
    <AbsoluteFill>
      <FlatStage backdrop={<IdeaBackdrop hue={HUE} spot={[0.36, 0.55]} />}>
        <Drift focus={TEST_FOCUS}>
          <Cast origin={[middle, top - 70]}>
            <SvgLayer>
              {/* O colchete que põe as duas listas sob a mesma etiqueta. */}
              {frame >= tagAt ? (
                <path
                  d={`M${bracket.from},${top - 70 + 48 * legs} L${bracket.from},${top - 70} L${bracket.to},${top - 70} L${bracket.to},${top - 70 + 48 * legs}`}
                  fill="none"
                  stroke={tags.peach.fill}
                  strokeWidth={8}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              ) : null}
            </SvgLayer>
          </Cast>
          <Stay only="entering">
            <Place x={middle} y={top - 70}>
              <Pop at={tagAt + 5}>
                <Tag on={HUE} size="note">
                  de 1 a 8 h depois
                </Tag>
              </Pop>
            </Place>
          </Stay>
          {SHEETS.xs.map((x, index) => {
            // Cada lista vem da mesa de cabeceira do lado dela, crescendo; já no lugar, flutua de leve.
            const from = undrifted(
              [TABLE_LISTS[index].x, TABLE_LISTS[index].y],
              TEST_FOCUS,
              zoom,
            );
            const small = LIST.width / zoom;
            return (
              <Stay key={x} only="entering">
                <Place
                  x={0}
                  y={0}
                  style={{
                    translate: centeredAt(
                      mix(from[0], x, arrived),
                      mix(from[1], SHEETS.y, arrived) +
                        4 * arrived * wave(seconds, 3.9, index * 0.37),
                    ),
                    rotate: `${TABLE_LISTS[index].tilt * (1 - arrived) + 0.6 * arrived * wave(seconds, 4.6, 0.2 + index * 0.4)}deg`,
                  }}
                >
                  <SyllableSheet
                    // A escala cresce em proporção, para a velocidade aparente ser a mesma do começo ao fim.
                    width={small * (SHEETS.width / small) ** arrived}
                    // As letras aparecem quando a folha já tem tamanho para elas.
                    written={ramp(frame, 6, 10)}
                    lit={Array.from({ length: 10 }, (_, syllable) => {
                      const order = FORGOTTEN[index].indexOf(syllable);
                      // A de quem ficou acordada apaga primeiro; a outra, logo depois, e menos.
                      const at =
                        forgetAt + order * FORGET.step + (index === 0 ? 8 : 0);
                      return order < 0
                        ? 1
                        : 1 - ramp(frame, at, FORGET.seconds * fps);
                    })}
                  />
                </Place>
              </Stay>
            );
          })}
          {SHEETS.xs.map((x, index) => (
            <Stay key={x} only="entering">
              <Place
                x={x + SHEETS.width / 2 - 30}
                y={top + 16 + 4 * wave(seconds, 3.9, index * 0.37)}
              >
                <Grow at={ARRIVE_FRAMES - 4 + index * 3}>
                  <TestBadge kind={KINDS[index]} size={120} />
                </Grow>
              </Place>
            </Stay>
          ))}
          <Later by={PAIR_LATER}>
            <Sooner by={PAIR_SOONER}>
              {PAIR.xs.map((x, index) => (
                <Cast key={x} origin={[x, PAIR.y]} order={2 + index}>
                  <SvgLayer>
                    <IdeaShadow hue={HUE} x={x} y={PAIR.y + 4} width={180} />
                  </SvgLayer>
                </Cast>
              ))}
              {PAIR.xs.map((x, index) => (
                <Place
                  key={x}
                  x={x}
                  y={PAIR.y}
                  anchor="bottom"
                  style={{ scale: `1 ${breath(seconds, `pair-${index}`)}` }}
                >
                  <Person
                    height={PAIR.height}
                    colors={SUBJECTS[index]}
                    bun={index === 1}
                    blink={Math.max(
                      blink(seconds, `pair-${index}`),
                      // A etiqueta estoura sobre elas, e as duas piscam, uma depois da outra.
                      flash(frame, onlyAt + 5 + index * 4, 5),
                    )}
                  />
                </Place>
              ))}
            </Sooner>
          </Later>
          <Stay only="entering">
            <Place
              x={(PAIR.xs[0] + PAIR.xs[1]) / 2}
              y={PAIR.y - PAIR.height - 70}
            >
              <Pop at={onlyAt}>
                <Tag on={HUE} size="note">
                  só duas
                </Tag>
              </Pop>
            </Place>
          </Stay>
        </Drift>
        <Grain />
      </FlatStage>
    </AbsoluteFill>
  );
};

// Em quadro aberto: as duas pessoas, pequenas, à esquerda, olham a estante que cresce à direita.
// Na frente dela, as duas se perdiam entre os livros; e a sombra da estante fica acima do selo da fonte.
const SHELF = { x: 1140, y: 880, width: 940, rows: 6 };
const CROWD = { xs: [270, 480], y: 900, height: 400 };
const SHELF_FOCUS = [960, 700] as const;
// A estante cresce prateleira por prateleira: o intervalo entre elas e quanto cada uma leva, em quadros.
const SHELVE = { step: 6, frames: 9 };
// A câmera recua no começo do plano, com peso, e depois deriva até o quadro composto.
const PULL_BACK = { from: 1.1, to: 1.035, frames: 18 };
const CROWD_SOONER = 14;

type ShelfShotProps = {
  /** Quadros do plano em que a estante começa a crescer e em que a etiqueta entra. */
  readonly growAt: number;
  readonly centuryAt: number;
  readonly clock: number;
};

/** Atrás das duas pessoas, a estante de estudos cresce até "mais de 100 anos de pesquisa". */
const ShelfShot: React.FC<ShelfShotProps> = ({ growAt, centuryAt, clock }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const length = useShotLength();
  const seconds = (clock + frame) / fps;
  const grown = Array.from({ length: SHELF.rows }, (_, row) =>
    ramp(frame, growAt + row * SHELVE.step, SHELVE.frames),
  ).reduce((sum, row) => sum + row, 0);
  const zoom =
    mix(PULL_BACK.from, PULL_BACK.to, ramp(frame, 0, PULL_BACK.frames)) -
    (PULL_BACK.to - 1) *
      linear(frame, PULL_BACK.frames, length - PULL_BACK.frames);

  return (
    <AbsoluteFill>
      <FlatStage backdrop={<IdeaBackdrop hue={HUE} spot={[0.5, 0.5]} />}>
        <Drift focus={SHELF_FOCUS} zoom={zoom}>
          {/* A estante cresce do chão, e não com o palco; sai com ele. */}
          <Stay only="entering">
            <Cast origin={[SHELF.x, SHELF.y]}>
              <SvgLayer>
                <IdeaShadow
                  hue={HUE}
                  x={SHELF.x}
                  y={SHELF.y + 6}
                  width={(SHELF.width + 60) * Math.min(1, grown)}
                />
                {grown > 0 ? <StudyShelf {...SHELF} grown={grown} /> : null}
              </SvgLayer>
            </Cast>
          </Stay>
          <Sooner by={CROWD_SOONER}>
            {CROWD.xs.map((x, index) => (
              <Cast key={x} origin={[x, CROWD.y]} order={index}>
                <SvgLayer>
                  <IdeaShadow hue={HUE} x={x} y={CROWD.y + 4} width={210} />
                </SvgLayer>
              </Cast>
            ))}
            {CROWD.xs.map((x, index) => (
              <Place
                key={x}
                x={x}
                y={CROWD.y}
                anchor="bottom"
                style={{
                  scale: `1 ${breath(seconds, `pair-${index}`)}`,
                  // Olhando a estante subir, o corpo vai um pouco para trás; depois, o peso troca de pé.
                  rotate: `${-2 * ramp(frame, growAt + 6, 0.8 * fps) + 0.9 * wave(seconds, 3.1, index * 0.45)}deg`,
                }}
              >
                <Person
                  height={CROWD.height}
                  colors={SUBJECTS[index]}
                  bun={index === 1}
                  // Elas olham para a estante, à direita e para cima; o espanto troca de rosto sob a pálpebra.
                  expression={
                    frame >= centuryAt + 3 + index * 3 ? "surprised" : "curious"
                  }
                  blink={Math.max(
                    blink(seconds, `pair-${index}`),
                    flash(frame, centuryAt + index * 3, 6),
                  )}
                />
              </Place>
            ))}
          </Sooner>
          <Stay only="entering">
            <Place x={SHELF.x} y={128}>
              <Pop at={centuryAt}>
                <Tag on={HUE} size="note">
                  mais de 100 anos de pesquisa
                </Tag>
              </Pop>
            </Place>
          </Stay>
        </Drift>
        <Grain />
      </FlatStage>
    </AbsoluteFill>
  );
};

export const MemoryResultScene: React.FC<SceneProps> = ({ scene, shots }) => (
  <>
    <Shot range={shots[0]} name="dormindo, ou as mesmas horas acordada">
      <SplitShot
        sleptAt={cue(scene, "dormiam")}
        awakeAt={cue(scene, "passavam")}
        clock={scene.from}
      />
    </Shot>
    <Shot range={shots[1]} name="as duas listas na hora do teste">
      <TestShot
        // As sílabas só apagam com as listas no lugar.
        forgetAt={Math.max(
          ARRIVE_FRAMES + 2,
          cue(scene, "dormiam", 2) - shots[1].from,
        )}
        tagAt={cue(scene, "esqueciam") - shots[1].from}
        onlyAt={cue(scene, "só") - shots[1].from}
        clock={scene.from + shots[1].from}
      />
    </Shot>
    <Shot range={shots[2]} name="um século de estudos">
      <ShelfShot
        growAt={cue(scene, "resultado") - shots[2].from}
        centuryAt={cue(scene, "século") - shots[2].from}
        clock={scene.from + shots[2].from}
      />
      {/* A lista e a cabeça de `stockroom` crescem aqui, por cima da estante que encolhe: a troca de cena
          não deixa a tela só com o fundo. */}
      <Prelude lead={HEAD_LEAD}>
        {(until) => (
          <StockroomOpening clock={scene.from + shots[2].to} until={until} />
        )}
      </Prelude>
    </Shot>
  </>
);
