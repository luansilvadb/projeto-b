import { random, useCurrentFrame, useVideoConfig } from "remotion";
import { wave } from "../../../components/Idle";
import { Place } from "../../../components/Place";
import { Pop, popOpacity, popScale } from "../../../components/Pop";
import { cue, drop, mix, ramp, settle } from "../../../components/timing";
import { WIDTH } from "../../../format";
import type { SceneProps } from "../../../video/NarratedVideo";
import { Shot } from "../../../video/Shot";
import { idea, ink, storm } from "../palette";
import { Arrow, Frame, IdeaBackdrop, Push, SourceSeal, StormBackdrop, Svg, SvgText, Tag } from "../parts/kit";
import { Arrive } from "../parts/SpeedKit";

const HORIZON = 800;

// Para onde cada folha aponta: em leque, com o ar calmo, e todas para leste, com o vento.
const FRONDS: readonly (readonly [number, number])[] = [
  [-168, -46],
  [-128, -28],
  [-92, -12],
  [-58, 6],
  [-22, 24],
  [12, 44],
];

type PalmProps = {
  readonly x: number;
  readonly height: number;
  /** Quanto o vento a deita, de 0 a 1. */
  readonly bend: number;
  readonly seed: number;
};

/** Uma palmeira em silhueta: o tronco se curva e as folhas se alinham para leste. A base fica na origem. */
const Palm: React.FC<PalmProps> = ({ x, height, bend, seed }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const top: readonly [number, number] = [height * 0.5 * bend, -height * (1 - 0.22 * bend)];
  const reach = height * 0.46;
  return (
    <g transform={`translate(${x} 0)`} fill="none" stroke={storm.carried} strokeLinecap="round">
      <path d={`M0,0 Q${height * 0.08 * bend},${-height * 0.62} ${top[0]},${top[1]}`} strokeWidth={26} />
      {FRONDS.map(([calm, blown], index) => {
        // As folhas batem mais quanto mais forte o vento.
        const flutter = 7 * bend * wave(frame / fps, 0.22, seed + index / FRONDS.length);
        const angle = ((mix(calm, blown, bend) + flutter) * Math.PI) / 180;
        const tip = [top[0] + reach * Math.cos(angle), top[1] + reach * Math.sin(angle)];
        const droop = reach * 0.3 * (1 - 0.6 * bend);
        return (
          <path
            key={index}
            d={`M${top[0]},${top[1]} Q${(top[0] + tip[0]) / 2},${(top[1] + tip[1]) / 2 - droop} ${tip[0]},${tip[1] + droop * 0.6}`}
            strokeWidth={20}
          />
        );
      })}
    </g>
  );
};

// A casa: a parede fica (por enquanto), e as telhas saem uma a uma, de cima para baixo.
const HOUSE = { x: 380, wall: [170, 104] } as const;
const TILE = { width: 58, height: 26 } as const;
// As telhas do telhado, de cima para baixo: a fileira de baixo sobra dos dois lados da parede.
const ROOF_TILES: readonly (readonly [number, number])[] = [
  [0, 3],
  [-29, 2],
  [29, 2],
  [-58, 1],
  [0, 1],
  [58, 1],
  [-87, 0],
  [-29, 0],
  [29, 0],
  [87, 0],
];
const LOOSE_TILES = 18;
// As pedras do chão: onde ficam, abaixo do horizonte, e o tamanho de cada uma.
const ROCKS: readonly (readonly [number, number, number])[] = [
  [700, 110, 1],
  [1340, 170, 1.4],
  [1690, 80, 0.8],
];

type SweepProps = {
  /** O quadro em que o ar começa a levar as telhas, o em que ele dispara e o em que o número entra. */
  readonly airAt: number;
  readonly runAt: number;
  readonly numberAt: number;
};

/** O chão do equador, parado; o ar passa por cima varrendo palmeiras, telhas e poeira para leste. */
const Sweep: React.FC<SweepProps> = ({ airAt, runAt, numberAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const gale = ramp(frame, runAt, 0.7 * fps);
  const bend = 0.4 + 0.6 * gale + 0.04 * wave(frame / fps, 0.5);
  // A palmeira do meio é arrancada quando o vento dispara.
  const torn = drop(frame, runAt + 0.5 * fps, 1.1 * fps);
  return (
    <Frame backdrop={<StormBackdrop wind={0.35 + 0.65 * gale} horizon={HORIZON} />}>
      <Push focus={[960, 700]}>
        <Svg>
          {/* O que fica: o chão, as pedras e a fundação da casa, claros. */}
          <g fill={storm.fixed}>
            {ROCKS.map(([x, y, size], index) => (
              <path
                key={index}
                d="M-60,0 Q-56,-34 -18,-42 Q34,-50 60,0 Z"
                transform={`translate(${x} ${HORIZON + y}) scale(${size})`}
              />
            ))}
            <rect x={HOUSE.x - HOUSE.wall[0] / 2 - 22} y={HORIZON - 6} width={HOUSE.wall[0] + 44} height={26} rx={8} />
          </g>
          <g transform={`translate(0 ${HORIZON})`}>
            <Palm x={860} height={300} bend={bend} seed={0.1} />
            <g
              transform={`translate(${1180 + torn * 1500} ${-420 * Math.sin(torn * Math.PI * 0.7)}) rotate(${torn * 250})`}
            >
              <Palm x={0} height={260} bend={bend} seed={0.5} />
            </g>
            <Palm x={1520} height={330} bend={bend} seed={0.8} />
            {/* A casa, em silhueta. */}
            <rect
              x={HOUSE.x - HOUSE.wall[0] / 2}
              y={-HOUSE.wall[1]}
              width={HOUSE.wall[0]}
              height={HOUSE.wall[1]}
              fill={storm.carried}
            />
            <rect x={HOUSE.x - 20} y={-56} width={40} height={56} rx={6} fill={storm.dustDeep} />
            {ROOF_TILES.map(([dx, row], index) => {
              const gone = drop(frame, airAt + index * 0.1 * fps, 0.9 * fps);
              return (
                <rect
                  key={index}
                  x={-TILE.width / 2}
                  y={-TILE.height / 2}
                  width={TILE.width}
                  height={TILE.height}
                  rx={5}
                  fill={storm.carried}
                  transform={`translate(${HOUSE.x + dx + gone * 1900} ${-HOUSE.wall[1] - TILE.height * (row + 0.5) - 260 * Math.sin(gone * Math.PI * 0.8)}) rotate(${gone * 600})`}
                />
              );
            })}
          </g>
          {/* As telhas e os cacos que o ar já leva, de fora do quadro. */}
          {Array.from({ length: LOOSE_TILES }, (_, index) => {
            const pick = (trait: string) => random(`tile-${trait}-${index}`);
            const span = WIDTH + 600;
            const x = ((pick("x") * span + frame * (34 + pick("speed") * 40) * (0.5 + 0.5 * gale)) % span) - 300;
            return (
              <rect
                key={index}
                x={-22}
                y={-9}
                width={44}
                height={18}
                rx={4}
                fill={storm.carried}
                opacity={ramp(frame, airAt, 0.8 * fps) * (0.55 + 0.45 * pick("near"))}
                transform={`translate(${x} ${210 + pick("y") * 540 + 26 * wave(frame / fps, 0.7, pick("phase"))}) rotate(${frame * (10 + pick("turn") * 24)}) scale(${0.6 + 0.6 * pick("near")})`}
              />
            );
          })}
          <Arrow
            from={[1010, 250]}
            to={[1330, 250]}
            color={storm.fixed}
            width={16}
            drawn={settle(frame, numberAt + 0.15 * fps, 0.5 * fps)}
          />
        </Svg>
        <Place x={690} y={250}>
          <Pop at={numberAt}>
            <Tag on="warm" size="label">
              1.670 km/h
            </Tag>
          </Pop>
        </Place>
      </Push>
    </Frame>
  );
};

// A régua de vento: a mesma nos dois planos. A escala inteira é a velocidade do
// ar na parada, e a barra do recorde fica na proporção dela.
const RULER = { x: 210, full: 1500, floor: 730 } as const;
const SPEED = { record: 408, stop: 1670 } as const;
const RECORD = (RULER.full * SPEED.record) / SPEED.stop;
const BAR = { height: 90, first: 380, second: 590 } as const;
const HUE = "sky";
// A câmera do plano do recorde: fechada na primeira barra. O plano seguinte parte dela e abre a régua inteira.
const NEAR = { focus: [50, 330], scale: 1.4 } as const;

/** O anemômetro: três copos num eixo, vistos de lado, girando. A base da haste fica na origem. */
const Anemometer: React.FC<{ readonly angle: number }> = ({ angle }) => (
  <g>
    <rect x={-7} y={-96} width={14} height={96} rx={7} fill={ink.dark} />
    {[0, 1, 2]
      .map((index) => angle + (index * Math.PI * 2) / 3)
      // Os copos de lá vão antes: os de cá passam na frente da haste.
      .sort((a, b) => Math.cos(a) - Math.cos(b))
      .map((turn, index) => (
        <g key={index}>
          <line
            x1={0}
            y1={-96}
            x2={70 * Math.sin(turn)}
            y2={-96 + 9 * Math.cos(turn)}
            stroke={ink.dark}
            strokeWidth={8}
            strokeLinecap="round"
          />
          <circle cx={70 * Math.sin(turn)} cy={-96 + 9 * Math.cos(turn)} r={19 + 4 * Math.cos(turn)} fill={ink.stop} />
        </g>
      ))}
    <circle cx={0} cy={-96} r={11} fill={ink.dark} />
  </g>
);

type RulerProps = {
  /** Quanto cada barra já cresceu, de 0 a 1. */
  readonly first: number;
  readonly second?: number;
  /** O quadro em que cada texto entra; sem valor, ainda não entrou. */
  readonly recordAt: number;
  readonly nameAt: number;
  readonly stopAt?: number;
  /** O giro do anemômetro, e quanto ele já foi levado pelo vento da segunda barra. */
  readonly whirl: number;
  readonly flung?: number;
};

/** A régua de vento deitada: a barra do recorde, com o anemômetro na ponta, e a do vento da parada. */
const WindRuler: React.FC<RulerProps> = ({
  first,
  second = 0,
  recordAt,
  nameAt,
  stopAt,
  whirl,
  flung = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const tip = RULER.x + RECORD * first;
  const text = RULER.x + RECORD + 110;
  // Cada texto cresce em volta do próprio ponto: em volta do alto do quadro, ele subia para cima do vizinho.
  const pop = (at: number, y: number) => ({
    opacity: popOpacity(frame, at, 0.3 * fps),
    transform: `translate(${text} ${y}) scale(${popScale(frame, at, 0.3 * fps, 0.85, 1.03)}) translate(${-text} ${-y})`,
  });
  return (
    <>
      {/* A régua: o zero, o chão e um risco a cada 100 km/h. */}
      <g stroke={idea[HUE].contact} strokeLinecap="round">
        <line x1={RULER.x} y1={BAR.first - 40} x2={RULER.x} y2={RULER.floor} strokeWidth={10} />
        <line x1={RULER.x} y1={RULER.floor} x2={RULER.x + RULER.full} y2={RULER.floor} strokeWidth={10} />
        {Array.from({ length: Math.floor(SPEED.stop / 100) }, (_, index) => {
          const x = RULER.x + ((index + 1) * 100 * RULER.full) / SPEED.stop;
          return (
            <line
              key={index}
              x1={x}
              y1={RULER.floor}
              x2={x}
              y2={RULER.floor - (index % 5 === 4 ? 30 : 16)}
              strokeWidth={6}
            />
          );
        })}
      </g>
      <rect x={RULER.x} y={BAR.first} width={RECORD * first} height={BAR.height} rx={12} fill={idea[HUE].contact} />
      <g
        transform={`translate(${Math.max(RULER.x + 44, tip - 30) + flung * 2200} ${BAR.first - flung * 700}) rotate(${flung * 900})`}
      >
        <Anemometer angle={whirl} />
      </g>
      <g {...pop(recordAt, BAR.first + 12)}>
        <SvgText x={text} y={BAR.first + 12} size="label" fill={ink.dark} anchor="start">
          408 km/h
        </SvgText>
      </g>
      <g {...pop(nameAt, BAR.first + 86)}>
        <SvgText x={text} y={BAR.first + 92} size="note" fill={ink.dark} anchor="start">
          ciclone Olivia, 1996
        </SvgText>
      </g>
      {second > 0 ? (
        <>
          <rect x={RULER.x} y={BAR.second} width={RULER.full * second} height={BAR.height} rx={12} fill={ink.stop} />
          {/* Quantas barras do recorde cabem nela. */}
          {[1, 2, 3, 4].map((times) =>
            RECORD * times < RULER.full * second ? (
              <line
                key={times}
                x1={RULER.x + RECORD * times}
                y1={BAR.second}
                x2={RULER.x + RECORD * times}
                y2={BAR.second + BAR.height}
                stroke={ink.paper}
                strokeWidth={6}
                opacity={0.7}
              />
            ) : null,
          )}
        </>
      ) : null}
      {stopAt === undefined ? null : (
        <SvgText
          x={RULER.x + RULER.full}
          y={BAR.second - 62}
          size="label"
          fill={ink.dark}
          anchor="end"
          opacity={popOpacity(frame, stopAt, 0.3 * fps)}
        >
          1.670 km/h
        </SvgText>
      )}
    </>
  );
};

type RecordProps = {
  /** O quadro em que a barra do recorde cresce, o em que o número dela entra e o em que entra o nome do ciclone. */
  readonly barAt: number;
  readonly recordAt: number;
  readonly nameAt: number;
};

/** A primeira barra: o recorde de rajada, com o anemômetro girando sem parar na ponta. */
const TheRecord: React.FC<RecordProps> = ({ barAt, recordAt, nameAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <Frame backdrop={<IdeaBackdrop hue={HUE} />}>
      <Push focus={NEAR.focus} from={NEAR.scale} to={NEAR.scale * 1.03}>
        <Svg>
          <WindRuler
            first={ramp(frame, barAt, 0.7 * fps)}
            recordAt={recordAt}
            nameAt={nameAt}
            // Parado ele já roda; com a rajada, dispara.
            whirl={frame * 0.1 + Math.max(0, frame - barAt) * 0.42}
          />
        </Svg>
      </Push>
      <SourceSeal>Courtney et al., 2012</SourceSeal>
    </Frame>
  );
};

/** Na mesma régua, a segunda barra cresce até quatro vezes a primeira, e o anemômetro sai voando. */
const FourTimes: React.FC<{ readonly growAt: number }> = ({ growAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <Frame backdrop={<IdeaBackdrop hue={HUE} />}>
      <Arrive from={NEAR.scale * 1.03} focus={NEAR.focus}>
        <Svg>
          <WindRuler
            first={1}
            second={ramp(frame, growAt, 0.8 * fps)}
            recordAt={-100}
            nameAt={-100}
            stopAt={growAt + 0.7 * fps}
            whirl={frame * 0.52 + Math.max(0, frame - growAt) * 0.5}
            flung={drop(frame, growAt + 0.1 * fps, 0.7 * fps)}
          />
        </Svg>
      </Arrive>
      {/* A barra do recorde continua à vista: o selo dela também. */}
      <SourceSeal>Courtney et al., 2012</SourceSeal>
    </Frame>
  );
};

export const WindScene: React.FC<SceneProps> = ({ scene, shots }) => {
  const { fps } = useVideoConfig();
  return (
    <>
      <Shot range={shots[0]} name="o ar sobre o chão parado">
        <Sweep airAt={cue(scene, "ar")} runAt={cue(scene, "correndo")} numberAt={cue(scene, "mil")} />
      </Shot>
      <Shot range={shots[1]} name="o recorde de rajada">
        <TheRecord
          barAt={cue(scene, "rajada") - shots[1].from}
          recordAt={cue(scene, "quatrocentos") - shots[1].from}
          nameAt={cue(scene, "ciclone") - shots[1].from}
        />
      </Shot>
      <Shot range={shots[2]} name="quatro vezes">
        {/* A barra espera a câmera abrir a régua, mesmo que a fala chegue antes. */}
        <FourTimes growAt={Math.max(0.5 * fps, cue(scene, "quatro") - shots[2].from)} />
      </Shot>
    </>
  );
};
