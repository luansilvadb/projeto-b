import { useId } from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { wave } from "../../../components/Idle";
import { Place } from "../../../components/Place";
import { Pop, popOpacity, popScale } from "../../../components/Pop";
import { clamp01, cue, mix, ramp, settle } from "../../../components/timing";
import type { SceneProps } from "../../../video/NarratedVideo";
import { Shot, useShotLength } from "../../../video/Shot";
import { blockBrake, ink, sea, space, vigilia } from "../palette";
import { DAY_CLOCK, DayClock, DaySliver } from "../parts/DayClock";
import { Frame, IdeaBackdrop, Push, SeaBackdrop, SourceSeal, Svg, Tag } from "../parts/kit";
import { HEIGHT, WIDTH } from "../../../format";

// A altura de uma linha de crescimento do coral, visto por fora.
const BAND = 22;

type CoralProps = {
  /** O meio da base. */
  readonly x: number;
  readonly y: number;
  /** Quantas linhas ele já tem; a fração é a linha que está crescendo. */
  readonly bands: number;
  readonly scale?: number;
  /** O tempo, em segundos, para os tentáculos balançarem. */
  readonly seconds?: number;
  readonly opacity?: number;
};

/**
 * Um coral genérico, em chifre: uma pilha de linhas de crescimento que alarga
 * para cima, com os tentáculos no alto. A linha mais nova é a clara.
 */
const Coral: React.FC<CoralProps> = ({ x, y, bands, scale = 1, seconds = 0, opacity = 1 }) => {
  const width = (row: number) => 80 + 170 * (1 - Math.exp(-row / 5));
  const lean = (row: number) => 46 * (1 - Math.cos(row / 11));
  const rows = Math.ceil(bands);
  const top = -bands * BAND;
  const crown = { x: lean(rows - 1), width: width(rows - 1) };
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`} opacity={opacity}>
      {Array.from({ length: 6 }, (_, index) => {
        const at = crown.x + ((index - 2.5) / 6) * crown.width * 0.86;
        const sway = 9 * wave(seconds, 2.4, index * 0.17);
        return (
          <g key={index}>
            <line
              x1={at}
              y1={top + 6}
              x2={at + sway}
              y2={top - 34}
              stroke={sea.coralLine}
              strokeWidth={12}
              strokeLinecap="round"
            />
            <circle cx={at + sway} cy={top - 38} r={10} fill={sea.coralLine} />
          </g>
        );
      })}
      {Array.from({ length: rows }, (_, row) => {
        const height = Math.min(1, bands - row) * BAND;
        const w = width(row);
        const left = lean(row) - w / 2;
        const bottom = -row * BAND;
        return (
          <g key={row}>
            <rect
              x={left}
              y={bottom - height}
              width={w}
              height={height + 1}
              rx={Math.min(10, height / 2)}
              fill={row >= bands - 1 ? sea.coralLine : sea.coral}
            />
            {/* A sombra do lado de lá e o lábio de baixo, que separa uma linha da outra. */}
            <rect x={left + w * 0.72} y={bottom - height} width={w * 0.28} height={height} rx={Math.min(10, height / 2)} fill={sea.coralShade} opacity={0.4} />
            <rect x={left + 6} y={bottom - 6} width={w - 12} height={6} rx={3} fill={sea.coralShade} opacity={row === 0 ? 0 : 0.7} />
          </g>
        );
      })}
    </g>
  );
};

// O relógio de hoje fica onde o relógio de um dia sempre fica; o do coral, ao lado.
const CORAL_CLOCK = { cx: 1360 } as const;
// A fila de lascas: do pé do relógio ao ponto em que ela some.
const ROW = { from: [900, 820], to: [1800, 250], count: 36 } as const;

/** A lasca do relógio se repete numa fila que some no fim de uma linha do tempo. */
const Repeats: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const length = useShotLength();
  const source = [DAY_CLOCK.cx, DAY_CLOCK.cy - DAY_CLOCK.r * 0.92] as const;
  return (
    <Frame backdrop={<IdeaBackdrop hue="lilac" spot={[0.3, 0.45]} />}>
      {/* A câmera chega: sai de perto do alto do relógio, de onde as lascas partem. */}
      <Push focus={[DAY_CLOCK.cx, 300]} from={1.18} to={1} progress={settle(frame, 0, 0.6 * fps)}>
        <Svg>
          {/* A linha do tempo: afina até sumir. */}
          <path
            d={`M${ROW.from[0] - 60},${ROW.from[1] + 66} L${ROW.to[0]},${ROW.to[1]} L${ROW.from[0] - 60},${ROW.from[1] + 52} Z`}
            fill={ink.dark}
            stroke={ink.dark}
            strokeWidth={4}
            strokeLinejoin="round"
          />
          <DayClock hand={((frame / (0.6 * fps)) * 24) % 24} />
          {Array.from({ length: ROW.count }, (_, index) => {
            // Cada lasca fica mais longe e menor que a anterior, e parte do alto do relógio.
            const away = 1 - 0.9 ** index;
            const leaves = 0.25 * fps + (index / ROW.count) ** 0.8 * 0.72 * length;
            if (frame < leaves) {
              return null;
            }
            const landed = ramp(frame, leaves, 0.35 * fps);
            const slot = [mix(ROW.from[0], ROW.to[0], away), mix(ROW.from[1], ROW.to[1], away)] as const;
            return (
              <g
                key={index}
                transform={`translate(${mix(source[0], slot[0], landed)} ${mix(source[1], slot[1], landed) - 90 * Math.sin(Math.PI * landed)})`}
              >
                <DaySliver size={mix(0.45, 0.9 * (1 - away) + 0.03, landed)} />
              </g>
            );
          })}
        </Svg>
      </Push>
    </Frame>
  );
};

// Quantas vezes o Sol passa durante o plano do recife, e com quantas linhas o coral começa.
const PASSES = 6;
const START_BANDS = 13;

/** Um recife antigo: um coral cresce uma linha fina a cada passagem do Sol. */
const Reef: React.FC<{ readonly tagAt: number }> = ({ tagAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const length = useShotLength();
  const seconds = frame / fps;
  const day = (frame / length) * PASSES;
  const pass = day % 1;
  // O Sol cruza por cima da água, da esquerda para a direita; a luz sobe e desce com ele.
  const light = Math.sin(Math.PI * pass);
  const sun = { x: mix(-280, WIDTH + 280, pass), y: 200 - 130 * light };
  return (
    <Frame backdrop={<SeaBackdrop />}>
      <Push focus={[760, 620]} to={1.05}>
        <Svg>
          <circle cx={sun.x} cy={sun.y} r={300} fill={space.sunCore} opacity={0.2} />
          <circle cx={sun.x} cy={sun.y} r={110} fill={space.sunCore} opacity={0.9} />
          <path
            d={`M${sun.x - 50},${sun.y} L${sun.x + 50},${sun.y} L${sun.x + 420},${HEIGHT} L${sun.x + 40},${HEIGHT} Z`}
            fill={space.sunCore}
            opacity={0.12 * light}
          />
          <path
            d="M0,960 L0,700 Q180,600 380,720 Q520,560 760,700 Q1000,640 1180,740 Q1420,560 1640,700 Q1800,640 1920,690 L1920,960 Z"
            fill={sea.reef}
            opacity={0.55}
          />
          <Coral x={270} y={940} bands={9} scale={0.85} seconds={seconds + 1} opacity={0.8} />
          <Coral x={1560} y={935} bands={6} scale={1.1} seconds={seconds + 2} opacity={0.8} />
          <path d="M0,930 Q480,880 960,925 T1920,905 L1920,1080 L0,1080 Z" fill={sea.land} />
          <path d="M0,1010 Q600,965 1200,1015 T1920,995 L1920,1080 L0,1080 Z" fill={sea.landShade} opacity={0.6} />
          {/* A noite entre uma passagem e outra: escurece o recife, e não o coral, que é o assunto. */}
          <ellipse cx={770} cy={925} rx={210} ry={26} fill={sea.landShade} />
          <rect width={WIDTH} height={HEIGHT} fill={sea.deep} opacity={0.26 * (1 - light)} />
          <Coral x={760} y={925} bands={START_BANDS + Math.floor(day) + ramp(pass, 0.3, 0.35)} seconds={seconds} />
        </Svg>
        <Place x={1380} y={470}>
          <Pop at={tagAt}>
            <Tag on="light">há 400 milhões de anos</Tag>
          </Pop>
        </Place>
      </Push>
    </Frame>
  );
};

type Slab = {
  readonly x: number;
  readonly w: number;
  readonly top: number;
  readonly bottom: number;
  /** A faixa de um ano: de onde até onde. */
  readonly year: readonly [number, number];
  /** Quantas linhas são desenhadas dentro da faixa de um ano. */
  readonly lines: number;
};

/**
 * Os dois cortes. A faixa de um ano tem a mesma altura nos dois, e as linhas
 * desenhadas são uma amostra na proporção de 400 para 365 (uma a cada nove
 * dias, mais ou menos): quem dá a contagem é a etiqueta.
 */
const OLD: Slab = { x: 330, w: 400, top: 110, bottom: 1140, year: [250, 800], lines: 44 };
const NOW: Slab = { x: 1500, w: 240, top: 160, bottom: 900, year: [255, 805], lines: 40 };
const LENS = { r: 135, zoom: 2.6 } as const;

const spacing = (slab: Slab) => (slab.year[1] - slab.year[0]) / slab.lines;

/** Um coral em corte: o miolo claro, com as linhas de um dia e os dois riscos que fecham um ano. */
const Section: React.FC<{ readonly slab: Slab }> = ({ slab }) => {
  const id = useId();
  const step = spacing(slab);
  const first = slab.year[0] - Math.floor((slab.year[0] - slab.top) / step) * step;
  const shape = { x: slab.x, y: slab.top, width: slab.w, height: slab.bottom - slab.top, rx: 70 };
  return (
    <g>
      <defs>
        <clipPath id={`${id}-cut`}>
          <rect {...shape} />
        </clipPath>
      </defs>
      <rect {...shape} fill={sea.coralLine} />
      <g clipPath={`url(#${id}-cut)`}>
        {Array.from({ length: Math.ceil((slab.bottom - first) / step) }, (_, index) => (
          <line
            key={index}
            x1={slab.x}
            x2={slab.x + slab.w}
            y1={first + index * step}
            y2={first + index * step}
            stroke={sea.coral}
            strokeWidth={4}
          />
        ))}
        {slab.year.map((y) => (
          <line key={y} x1={slab.x} x2={slab.x + slab.w} y1={y} y2={y} stroke={sea.coralShade} strokeWidth={12} />
        ))}
      </g>
      <rect {...shape} fill="none" stroke={sea.coral} strokeWidth={20} />
    </g>
  );
};

/** O colchete da faixa de um ano, aberto para o lado do corte. */
const YearBracket: React.FC<{ readonly x: number; readonly year: readonly [number, number]; readonly side: 1 | -1 }> = ({
  x,
  year,
  side,
}) => (
  <path
    d={`M${x - side * 24},${year[0]} L${x},${year[0]} L${x},${year[1]} L${x - side * 24},${year[1]}`}
    fill="none"
    stroke={ink.dark}
    strokeWidth={10}
    strokeLinecap="round"
    strokeLinejoin="round"
  />
);

type CountingProps = {
  /** A lupa começa a descer pela faixa; chega ao fim dela. */
  readonly sweep: readonly [number, number];
  /** O coral de hoje entra. */
  readonly todayAt: number;
};

/** O coral em corte: a mão da Vigília, com uma lupa, conta as linhas dentro da faixa de um ano. */
const Counting: React.FC<CountingProps> = ({ sweep, todayAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const id = useId();
  const counted = ramp(frame, sweep[0], Math.max(sweep[1] - sweep[0], fps));
  const lens = { x: OLD.x + OLD.w / 2, y: mix(OLD.year[0] + 50, OLD.year[1] - 50, counted) };
  const reach = LENS.r * Math.SQRT1_2;
  const hand = { x: lens.x - reach - 92, y: lens.y + reach + 92 };
  const step = spacing(OLD);
  const today = popScale(frame, todayAt, 0.3 * fps);
  const zoom = mix(1.45, 1.22, settle(frame, 0, 0.6 * fps)) * mix(1, 1 / 1.22, ramp(frame, todayAt - 0.5 * fps, 0.7 * fps));
  return (
    <Frame backdrop={<SeaBackdrop />}>
      {/* A câmera chega entrando no coral, fica perto dele durante a contagem e abre quando o coral de hoje entra. */}
      <Push focus={[OLD.x, 620]} from={zoom} to={zoom}>
        <Push focus={[900, 540]} to={1.03}>
          <Svg>
            <Section slab={OLD} />
            <YearBracket x={OLD.x + OLD.w + 44} year={OLD.year} side={1} />
            <g
              opacity={popOpacity(frame, todayAt, 0.3 * fps)}
              transform={`translate(${NOW.x + NOW.w / 2} 530) scale(${today}) translate(${-NOW.x - NOW.w / 2} -530)`}
            >
              <Section slab={NOW} />
              <YearBracket x={NOW.x - 44} year={NOW.year} side={-1} />
            </g>
            {/* Só a mão dela: o braço entra pelo canto de baixo. */}
            <line
              x1={110}
              y1={HEIGHT + 120}
              x2={hand.x}
              y2={hand.y}
              stroke={vigilia.limb}
              strokeWidth={66}
              strokeLinecap="round"
            />
            <line
              x1={lens.x - reach}
              y1={lens.y + reach}
              x2={hand.x}
              y2={hand.y}
              stroke={blockBrake.handle}
              strokeWidth={34}
              strokeLinecap="round"
            />
            <circle cx={hand.x} cy={hand.y} r={50} fill={vigilia.hand} />
            <defs>
              <clipPath id={`${id}-glass`}>
                <circle cx={lens.x} cy={lens.y} r={LENS.r} />
              </clipPath>
            </defs>
            <circle cx={lens.x} cy={lens.y} r={LENS.r} fill={sea.coralLine} />
            <g clipPath={`url(#${id}-glass)`}>
              {/* As mesmas linhas, de perto. */}
              {Array.from({ length: OLD.lines + 1 }, (_, index) => {
                const y = lens.y + (OLD.year[0] + index * step - lens.y) * LENS.zoom;
                const edge = index === 0 || index === OLD.lines;
                return Math.abs(y - lens.y) > LENS.r + 12 ? null : (
                  <line
                    key={index}
                    x1={lens.x - LENS.r}
                    x2={lens.x + LENS.r}
                    y1={y}
                    y2={y}
                    stroke={edge ? sea.coralShade : sea.coral}
                    strokeWidth={edge ? 24 : 10}
                  />
                );
              })}
            </g>
            <circle cx={lens.x} cy={lens.y} r={LENS.r} fill="none" stroke={ink.dark} strokeWidth={18} />
          </Svg>
          <Place x={OLD.x + OLD.w + 80} y={470} style={{ translate: "0 -50%" }}>
            <Pop at={sweep[0]}>
              <Tag on="light">{counted < 1 ? Math.round(400 * counted) : "cerca de 400 dias"}</Tag>
            </Pop>
          </Place>
          <Place x={NOW.x - 80} y={610} style={{ translate: "-100% -50%" }}>
            <Pop at={todayAt + 0.15 * fps}>
              <Tag on="light">365</Tag>
            </Pop>
          </Place>
        </Push>
      </Push>
      <SourceSeal>Wells, 1963, via Florida Museum</SourceSeal>
    </Frame>
  );
};

/** Dois relógios lado a lado: o de hoje e o do coral, cujo dia acaba duas horas antes. */
const TwoClocks: React.FC<{ readonly shortAt: number }> = ({ shortAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // Os dois ponteiros andam juntos; o do coral chega ao fim do dia dele quando a fala diz as horas.
  const start = 0.3 * fps;
  const turn = (Math.max(shortAt - start, fps) * 24) / 22;
  // Uma volta só: o resultado (22 h parado, 24 h fechado) fica na tela até o corte.
  const hour = 24 * clamp01((frame - start) / turn);
  return (
    <Frame backdrop={<IdeaBackdrop hue="lilac" spot={[0.5, 0.45]} />}>
      <Push to={1.04}>
        <Svg>
          <DayClock hand={hour} />
          <DayClock cx={CORAL_CLOCK.cx} hand={Math.min(22, hour)} day={22} color={sea.coral} />
          <Coral x={CORAL_CLOCK.cx + 300} y={DAY_CLOCK.cy + DAY_CLOCK.r} bands={15} scale={0.5} seconds={frame / fps} />
        </Svg>
        <Place x={DAY_CLOCK.cx} y={880}>
          <Tag on="light" size="label">
            24 h
          </Tag>
        </Place>
        <Place x={CORAL_CLOCK.cx} y={880}>
          <Pop at={shortAt}>
            <Tag on="light" size="label">
              cerca de 22 h
            </Tag>
          </Pop>
        </Place>
      </Push>
    </Frame>
  );
};

export const CoralsScene: React.FC<SceneProps> = ({ scene, shots }) => (
  <>
    <Shot range={shots[0]} name="a lasca se repete">
      <Repeats />
    </Shot>
    <Shot range={shots[1]} name="o recife antigo">
      <Reef tagAt={cue(scene, "centenas") - shots[1].from} />
    </Shot>
    <Shot range={shots[2]} name="contando as linhas">
      <Counting
        sweep={[cue(scene, "linhas") - shots[2].from, cue(scene, "quatrocentas") - shots[2].from]}
        todayAt={cue(scene, "trezentas") - shots[2].from}
      />
    </Shot>
    <Shot range={shots[3]} name="24 h e 22 h">
      <TwoClocks shortAt={cue(scene, "vinte") - shots[3].from} />
    </Shot>
  </>
);
