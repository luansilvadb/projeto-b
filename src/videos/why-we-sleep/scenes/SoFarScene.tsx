import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Cassiopea } from "../../../art/Cassiopea";
import { Elephant } from "../../../art/Elephant";
import { Stopwatch } from "../../../art/Stopwatch";
import { FlatStage, Stay, Troupe, useStage } from "../../../components/Cast";
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
  clamp,
} from "../../../components/timing";
import type { SceneProps } from "../../../video/NarratedVideo";
import { Shot, useShotLength } from "../../../video/Shot";
import { markFor } from "../../../video/stage";
import { gardner } from "../parts/Gardner";
import {
  elephant,
  idea,
  ink,
  jellyfish,
  lab,
  lagoon,
  stopwatch,
} from "../palette";
import { Bed } from "../parts/Bed";
import { IdeaBackdrop } from "../parts/IdeaBackdrop";
import { ICONS, IconRow, type IconKey } from "../parts/IconRow";
import { PULSES_ASLEEP, pulseCycles, pulseShape, steady } from "../parts/pulse";
import { RatDisc } from "../parts/Rats";
import { Magnifier } from "../parts/Search";
import { Tag } from "../parts/Tag";
import { VacantSign } from "../parts/VacantSign";
import { LAST_MAP_LEAD, LastMapPrelude } from "./ButWhatScene";
import { ROW_HUE, rowLife } from "./FivePartsScene";
import { Grow } from "./SleepDebtScene";
import { grown } from "../../../components/Pop";

/**
 * O resumo dos três jeitos de escapar, que a fala não lista mais: a tela
 * carrega tudo. O primeiro plano abre com a fila dos ícones pequena no alto e,
 * embaixo dela, as três molduras já reservadas, apagadas, cada uma com o
 * número do jeito. Com a fila assentada, o despertador ganha o X, sozinho; só
 * então a fila sai por cima, e as três crescem lado a lado e acendem uma a uma, depressa, cada uma
 * com o resultado do jeito dela. No segundo plano as três ficam em cima e o
 * pedestal "acordado 24 h" continua vazio.
 *
 * Os dois planos são um palco só: o segundo parte do arranjo em que o primeiro
 * terminou, e quem desenha o que os dois têm em comum é o plano novo.
 */

/** Tamanho de uma moldura em escala 1; a terceira é mais larga, porque guarda duas lembranças. */
const PANEL = { width: 520, height: 600, border: 12, radius: 44 };
const WIDE_PANEL = 860;
const WIDTHS = [PANEL.width, PANEL.width, WIDE_PANEL] as const;

type Slot = { readonly x: number; readonly y: number; readonly scale: number };
type Panels = readonly [Slot, Slot, Slot];

type Layout = {
  /** Onde cada moldura fica. */
  readonly panels: Panels;
  /** O ponto do quadro para o qual o plano deriva: a moldura de que a fala trata. */
  readonly focus: readonly [number, number];
};

// A fila no alto, pequena e no meio: o canto de cima à direita é do bolso da conta (`POCKET_CORNER`).
const ROW_TOP: Slot = { x: 960, y: 166, scale: 0.6 };
// Por onde a fila sai, no segundo plano: por cima do quadro.
const ROW_GONE_Y = -260;
// Sob a fila, as três molduras reservadas; o selo da fonte ocupa o canto de baixo à direita.
const RESERVED_Y = 660;
// Sem a fila, as três ocupam a largura do quadro, um pouco abaixo do meio: a pílula do número fica acima de cada uma.
const LISTED = { y: 556, scale: 0.84 };

/**
 * Os três arranjos das molduras: reservadas sob a fila, com que o primeiro
 * plano abre; lado a lado, na largura do quadro, em que ele as acende; e no
 * alto, sobre o pedestal, no segundo. A fila sai antes de elas acenderem: com
 * ela, as molduras cheias somavam nove textos à vista.
 */
const LAYOUTS: readonly Layout[] = [
  {
    panels: [
      { x: 472, y: RESERVED_Y, scale: 0.62 },
      { x: 854, y: RESERVED_Y, scale: 0.62 },
      { x: 1341, y: RESERVED_Y, scale: 0.62 },
    ],
    focus: [960, 560],
  },
  {
    // As três à vista de uma vez: acendem em pouco mais de um segundo, e não há tempo de ir de uma a outra.
    panels: [
      { x: 325, y: LISTED.y, scale: LISTED.scale },
      { x: 818, y: LISTED.y, scale: LISTED.scale },
      { x: 1453, y: LISTED.y, scale: LISTED.scale },
    ],
    focus: [960, LISTED.y],
  },
  {
    panels: [
      { x: 500, y: 270, scale: 0.6 },
      { x: 862, y: 270, scale: 0.6 },
      { x: 1326, y: 270, scale: 0.6 },
    ],
    focus: [960, 640],
  },
];
// A deriva de cada plano: quanto o arranjo se aproxima do assunto, do começo ao fim dele.
const DRIFT = 0.025;

const between = (from: Slot, to: Slot, t: number): Slot => ({
  x: mix(from.x, to.x, t),
  y: mix(from.y, to.y, t),
  // A escala interpola em progressão geométrica, como uma câmera: a velocidade aparente é a mesma do começo ao fim.
  scale: from.scale * (to.scale / from.scale) ** t,
});

/** Uma moldura um pouco mais perto do assunto do plano: a deriva em `by`. */
const pushed = (
  slot: Slot,
  focus: readonly [number, number],
  by: number,
): Slot => ({
  x: focus[0] + (slot.x - focus[0]) * (1 + by),
  y: focus[1] + (slot.y - focus[1]) * (1 + by),
  scale: slot.scale * (1 + by),
});

// Quanto as molduras vazias se veem enquanto esperam a vez delas.
const WAITING = 0.38;
// Apagada, a moldura flutua devagar no lugar, cada uma na sua fase: quantos pixels, e em quantos segundos vai e volta.
const HOVER = { pixels: 7, seconds: 3.2 };
// Em quantos quadros uma moldura acende.
const LIGHT_FRAMES = 10;
// Quantos quadros depois de acender o que a moldura guarda começa a entrar.
const ENTER_AFTER = 2;

type PanelProps = {
  readonly slot: Slot;
  readonly width: number;
  /** O número do jeito: o mesmo da pílula sob o ícone dele, na fila. */
  readonly number: string;
  /** Quanto a moldura já acendeu, de 0 (apagada, à espera) a 1. */
  readonly lit: number;
  /** A lembrança, desenhada em pixels da moldura. */
  readonly children: React.ReactNode;
};

/**
 * Uma moldura de borda clara com o número do jeito no canto. Vazia, é um
 * lugar reservado, apagado, no tom escuro do fundo; acesa, guarda a lembrança
 * de um capítulo.
 */
const Panel: React.FC<PanelProps> = ({
  slot,
  width,
  number,
  lit,
  children,
}) => (
  <div
    // O lugar vai pela transformação: a moldura deriva menos de um pixel por quadro, e por `left` e `top` andaria em degraus.
    style={{
      position: "absolute",
      left: 0,
      top: 0,
      translate: `calc(-50% + ${slot.x}px) calc(-50% + ${slot.y}px)`,
    }}
  >
    <div
      style={{
        position: "relative",
        scale: `${slot.scale}`,
        opacity: mix(WAITING, 1, lit),
      }}
    >
      <div
        style={{
          position: "relative",
          width,
          height: PANEL.height,
          overflow: "hidden",
          borderRadius: PANEL.radius,
          border: `${PANEL.border}px solid ${ink.paper}`,
        }}
      >
        <AbsoluteFill
          style={{ background: idea[ROW_HUE].contact, opacity: 0.22 }}
        />
        {/* O que está dentro da moldura vai e vem com ela, e não por conta própria. */}
        <Stay>
          <Troupe cast={false}>{children}</Troupe>
        </Stay>
      </div>
      <div style={{ position: "absolute", left: 30, top: -40 }}>
        <Tag on="lilac" size="note">
          {number}
        </Tag>
      </div>
    </div>
  </div>
);

type MemoryProps = {
  /** Quadro do plano em que a moldura acende: o fundo da lembrança toma a cor dele. Sem valor, já está aceso. */
  readonly litAt?: number;
  /** O tempo do vídeo, em segundos: quem dorme respira sem saltar na troca de plano. */
  readonly seconds: number;
};

/** O fundo de uma lembrança, que acende: a cor toma o lugar do tom apagado da moldura. */
const MemoryLight: React.FC<{
  at: number;
  background: string;
  children?: React.ReactNode;
}> = ({ at, background, children }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{ background, opacity: ramp(frame, at, LIGHT_FRAMES) }}
    >
      {children}
    </AbsoluteFill>
  );
};

// A régua de 24 horas dentro da primeira moldura, e as duas horas da elefanta nela.
const BAR = { x: 60, y: 420, width: 400, height: 36, hours: 2 / 24 };

type ElephantMemoryProps = MemoryProps & {
  /** Quadros do plano em que a elefanta e a barra entram; sem valor, já estão lá. */
  readonly at?: number;
  /** Quadro do plano em que o "2 h" sai: no último plano a moldura é pequena e ele era o sexto texto do quadro. Sem valor, fica. */
  readonly bareAt?: number;
};

/** A primeira lembrança: a elefanta dormindo em pé, e a barra do sono dela, "2 h". */
const ElephantMemory: React.FC<ElephantMemoryProps> = ({
  litAt = ALREADY_SHOWN,
  at = ALREADY_SHOWN,
  bareAt,
  seconds,
}) => {
  const frame = useCurrentFrame();
  // A régua se desenha da esquerda para a direita, e as duas horas enchem em seguida: tudo assentado antes de a fala chegar ao jeito seguinte.
  const track = ramp(frame, at + 2, 8);
  const hours = ramp(frame, at + 8, 7);
  const full = Math.max(BAR.height, BAR.width * BAR.hours);
  return (
    <>
      <MemoryLight
        at={litAt}
        background={`linear-gradient(${idea.peach.top}, ${idea.peach.bottom})`}
      />
      <SvgLayer>
        <ellipse
          cx={260}
          cy={376}
          rx={180 * Math.min(1, grown(frame, at, 11))}
          ry={18 * Math.min(1, grown(frame, at, 11))}
          fill={idea.peach.contact}
          opacity={0.24}
        />
        {track > 0 ? (
          <rect
            x={BAR.x}
            y={BAR.y}
            width={Math.max(BAR.height, BAR.width * track)}
            height={BAR.height}
            rx={BAR.height / 2}
            fill={ink.tag}
            opacity={0.3}
          />
        ) : null}
        {hours > 0 ? (
          <rect
            x={BAR.x}
            y={BAR.y + (BAR.height * (1 - Math.min(1, hours * 2))) / 2}
            width={mix(BAR.height * 0.4, full, hours)}
            height={BAR.height * Math.min(1, hours * 2)}
            rx={BAR.height / 2}
            fill={ink.tag}
          />
        ) : null}
      </SvgLayer>
      <Place
        x={260}
        y={370}
        anchor="bottom"
        // Dormindo em pé, o corpo sobe e desce devagar.
        style={{ scale: `1 ${1 + 0.018 * wave(seconds, 4.8, 0.1)}` }}
      >
        <Grow at={at} origin="bottom">
          <Elephant
            width={410}
            colors={elephant}
            lid={1}
            droop={1}
            trunk={0}
            ear={0.12 + 0.12 * wave(seconds, 5.6, 0.4)}
          />
        </Grow>
      </Place>
      <Place x={BAR.x + 78} y={BAR.y + BAR.height + 58}>
        <div
          style={{
            scale: `${grown(frame, at + 12, 9) * (bareAt === undefined ? 1 : 1 - ramp(frame, bareAt, 8))}`,
          }}
        >
          <Tag on="peach" size="note">
            2 h
          </Tag>
        </div>
      </Place>
    </>
  );
};

// Do centro do desenho da água-viva até onde o sino encosta no chão, em fração da largura do sino.
const RESTING = 124 / 660;
const SEABED = 440;
// A água-viva desce do alto da moldura até a areia, nestes quadros, e levanta uma nuvem de areia ao pousar.
const SINK = { from: 520, frames: 18 };

type JellyfishMemoryProps = MemoryProps & {
  /** Quadro do plano em que ela entra; sem valor, já está pousada. */
  readonly at?: number;
};

/** A segunda lembrança: a água-viva dormindo no fundo, de braços caídos, pulsando devagar. */
const JellyfishMemory: React.FC<JellyfishMemoryProps> = ({
  litAt = ALREADY_SHOWN,
  at = ALREADY_SHOWN,
  seconds,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sunk = ramp(frame, at, SINK.frames);
  const landed = frame - at - SINK.frames;
  // Ao pousar, o sino achata um instante e a areia sobe dos dois lados.
  const squash = interpolate(landed, [0, 3, 10], [0, 1, 0], clamp);
  const dust = interpolate(landed, [0, 14], [0, 1], clamp);
  return (
    <>
      <MemoryLight
        at={litAt}
        background={`linear-gradient(${lagoon.night.water[0]}, ${lagoon.night.water[2]})`}
      >
        <SvgLayer>
          <rect
            x={0}
            y={SEABED}
            width={PANEL.width}
            height={PANEL.height - SEABED}
            fill={lagoon.night.sand[0]}
          />
          <rect
            x={0}
            y={SEABED}
            width={PANEL.width}
            height={14}
            fill={lagoon.night.sandEdge}
          />
          <rect
            x={0}
            y={SEABED + 90}
            width={PANEL.width}
            height={PANEL.height - SEABED - 90}
            fill={lagoon.night.sand[1]}
          />
        </SvgLayer>
      </MemoryLight>
      {frame >= at ? (
        <>
          <SvgLayer>
            {landed >= 0 && dust < 1
              ? [-1, 1].map((side) => (
                  <circle
                    key={side}
                    cx={260 + side * (150 + 60 * dust)}
                    cy={SEABED - 6 - 26 * dust}
                    r={16 + 14 * dust}
                    fill={lagoon.night.sandEdge}
                    opacity={0.7 * (1 - dust)}
                  />
                ))
              : null}
          </SvgLayer>
          <Place
            x={260}
            y={SEABED + 12 - 330 * RESTING - SINK.from * (1 - sunk)}
            style={{
              transformOrigin: "50% 80%",
              scale: `${1 + 0.06 * squash} ${1 - 0.1 * squash}`,
            }}
          >
            <Cassiopea
              width={330}
              colors={jellyfish.night}
              droop={0.8}
              pulse={pulseShape(
                pulseCycles(seconds * fps, fps, steady(PULSES_ASLEEP)),
              )}
            />
          </Place>
        </>
      ) : null}
    </>
  );
};

const HALF = WIDE_PANEL / 2;
const FLOOR = 420;
// A cama cabe na metade direita da moldura, com folga dos dois lados.
const BED = { x: HALF + HALF / 2, y: FLOOR + 44, scale: 0.33 };
const DISC = { x: HALF / 2, y: FLOOR + 76, scale: 0.48 };

type ForcedMemoryProps = MemoryProps & {
  /** Quadros do plano em que o disco, a cama e o relógio entram; sem valores, já estão lá. */
  readonly discAt?: number;
  readonly bedAt?: number;
  readonly clockAt?: number;
};

/**
 * A terceira lembrança, em duas metades: o disco com o rato do teste em
 * silhueta, e o rapaz na cama com o relógio em "14 h".
 */
const ForcedMemory: React.FC<ForcedMemoryProps> = ({
  litAt = ALREADY_SHOWN,
  discAt = ALREADY_SHOWN,
  bedAt = ALREADY_SHOWN,
  clockAt = ALREADY_SHOWN,
  seconds,
}) => {
  const frame = useCurrentFrame();
  return (
    <>
      <MemoryLight
        at={litAt}
        background={`linear-gradient(${lab.wall[0]}, ${lab.wall[1]})`}
      >
        <SvgLayer>
          <rect
            x={0}
            y={FLOOR}
            width={WIDE_PANEL}
            height={PANEL.height - FLOOR}
            fill={lab.bench}
          />
          <rect
            x={0}
            y={FLOOR}
            width={WIDE_PANEL}
            height={14}
            fill={lab.benchTop}
          />
          {/* A divisória das duas metades, da cor da moldura. */}
          <rect
            x={HALF - PANEL.border / 2}
            y={0}
            width={PANEL.border}
            height={PANEL.height}
            fill={ink.paper}
          />
        </SvgLayer>
      </MemoryLight>
      {/* O disco cresce da base dele, na bancada. */}
      <AbsoluteFill
        style={{
          transformOrigin: `${DISC.x}px ${DISC.y}px`,
          scale: `${grown(frame, discAt, 12)}`,
        }}
      >
        <RatDisc
          {...DISC}
          rats={["gone", "awake"]}
          seconds={seconds}
          // O disco continua girando devagar, e o rato de comparação fareja: a lembrança não é uma foto.
          turn={-seconds / 9}
          alive={1}
        />
      </AbsoluteFill>
      {/* Randy Gardner, com as cores dele e o cobertor dele, na cama de todo plano em que alguém dorme. */}
      <AbsoluteFill
        style={{
          transformOrigin: `${BED.x}px ${BED.y}px`,
          scale: `${grown(frame, bedAt, 12)}`,
        }}
      >
        <Bed
          {...BED}
          colors={gardner}
          blanket="blue"
          hue="mint"
          breath={1 + 0.035 * wave(seconds, 4.4, 0.2)}
        />
      </AbsoluteFill>
      <Place x={BED.x + 40} y={150}>
        <Grow at={clockAt} frames={10}>
          <Stopwatch width={150} colors={stopwatch} reading="14 h" />
        </Grow>
      </Place>
    </>
  );
};

const SIGN = { x: 960, y: 1016, scale: 0.8 };
const LENS = { x: 1340, y: 740, size: 96 };
/**
 * A fila e as molduras começam a entrar estes quadros antes da cena, no fim de
 * `gardner-sleeps`, por baixo da conta que vai para o bolso.
 */
export const RECAP_LEAD = 8;
// A fila entra em cascata: o quadro em que começa, o intervalo entre um ícone e o seguinte, e quanto cada um leva.
const ROW_IN = { at: -3 - RECAP_LEAD, step: 2, each: 8 };
// As molduras entram logo depois, uma a uma.
const PANELS_IN = { at: 2 - RECAP_LEAD, step: 3, each: 10 };
// O primeiro plano não tem deixa (a fala é "Para a pergunta do começo, a resposta é que"): as batidas dele,
// em quadros. A fila e as molduras assentam, com o despertador aceso e parado; ele ganha o X, sozinho (os três
// X piscando juntos em seguida não se distinguiam, e o X caía no meio da chegada); só com o X posto a fila
// sai por cima e as molduras crescem (`grow`, em `growFrames`); as molduras acendem a 0,2 s uma da outra, e a
// cama entra depois do disco. Tudo assentado 0,8 s antes de "nenhum", que abre o plano do pedestal.
const BEATS = {
  cross: 16,
  grow: 28,
  growFrames: 18,
  panels: [31, 37, 43],
  bed: 49,
} as const;
// O último plano: o pedestal sobe de baixo do quadro, e a lupa vem do alto e pousa ao lado dele.
const RISE = { at: 3, frames: 21, from: 560 };
const LAND = { frames: 17, from: [640, -420], tilt: -28 } as const;

/** A fila do primeiro plano, quanto de cada ícone já entrou num quadro dele. */
const rowPresent = (frame: number): Partial<Record<IconKey, number>> => {
  const present: Partial<Record<IconKey, number>> = {};
  ICONS.forEach((icon, index) => {
    present[icon] = grown(frame, ROW_IN.at + index * ROW_IN.step, ROW_IN.each);
  });
  return present;
};

/** Quanto a moldura `index` do primeiro plano já entrou num quadro dele. */
const panelIn = (frame: number, index: number): number =>
  grown(frame, PANELS_IN.at + index * PANELS_IN.step, PANELS_IN.each);

/** A flutuação de uma moldura apagada, em pixels: cada uma na sua fase. */
const hovering = (seconds: number, index: number, scale: number): number =>
  HOVER.pixels * scale * wave(seconds, HOVER.seconds, index / 3);

type RecapPreludeProps = {
  /** Quantos quadros faltam para a cena começar. */
  readonly until: number;
  /** O quadro do vídeo em que a cena começa. */
  readonly clock: number;
};

/**
 * A fila e as molduras apagadas entrando, antes de a cena começar: o último
 * plano de `gardner-sleeps` as desenha por baixo da conta, que vai para o
 * bolso, e a troca não deixa a tela só com o fundo. O primeiro plano abre no
 * estado em que isto parou.
 */
export const RecapPrelude: React.FC<RecapPreludeProps> = ({ until, clock }) => {
  const { fps } = useVideoConfig();
  const frame = -until;
  // A fila pulsa no relógio da cena; as molduras flutuam no do vídeo, como no plano.
  const life = rowLife(frame / fps);
  const seconds = (clock + frame) / fps;
  return (
    <Stay>
      <IconRow
        x={ROW_TOP.x}
        y={ROW_TOP.y}
        scale={ROW_TOP.scale}
        hue={ROW_HUE}
        // O fundo ainda é o menta da conta: os ícones apagados são da cor dele.
        tint={{ from: "mint", progress: 0 }}
        states={{ eyes: "check", ruler: "cross", brain: "cross", alarm: "on" }}
        present={rowPresent(frame)}
        motion={life.motion}
        lift={life.lift}
        tilt={life.tilt}
        grow={life.grow}
      />
      {LAYOUTS[0].panels.map((slot, index) => {
        const y = slot.y + hovering(seconds, index, slot.scale);
        return (
          <div
            key={index}
            style={{
              position: "absolute",
              inset: 0,
              transformOrigin: `${slot.x}px ${y}px`,
              scale: `${panelIn(frame, index)}`,
            }}
          >
            <Panel
              slot={{ ...slot, y }}
              width={WIDTHS[index]}
              number={`${index + 1}`}
              lit={0}
            >
              {null}
            </Panel>
          </div>
        );
      })}
    </Stay>
  );
};

type Marks = {
  /** Quadro do plano em que o despertador ganha o X (plano 1). */
  readonly crossAt?: number;
  /** Quadros do plano em que cada moldura acende e se enche, da esquerda para a direita (plano 1). */
  readonly panelsAt?: readonly [number, number, number];
  /** Quadros do plano em que a cama entra na terceira moldura, depois do disco (plano 1). */
  readonly bedAt?: number;
  /** Quadros do plano em que a lupa pousa e em que o foco de luz acende (plano 2). */
  readonly lensAt?: number;
  readonly lightAt?: number;
};

type RecapShotProps = Marks & {
  /** O plano do pedestal, o último; sem isso, o da fila e das molduras. */
  readonly last?: boolean;
  /** O quadro da cena, e o do vídeo, em que o plano começa. */
  readonly clock: number;
  readonly videoClock: number;
};

/** A fila, as molduras e, no fim, o pedestal: o mesmo palco nos dois planos, em arranjos diferentes. */
const RecapShot: React.FC<RecapShotProps> = ({
  last = false,
  clock,
  videoClock,
  crossAt,
  panelsAt,
  bedAt = ALREADY_SHOWN,
  lensAt,
  lightAt,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const length = useShotLength();
  const stage = useStage();
  const seconds = (videoClock + frame) / fps;
  const to = LAYOUTS[last ? 2 : 1];
  // O primeiro plano parte das molduras reservadas; o último, de onde a deriva do primeiro terminou.
  const from = last
    ? LAYOUTS[1].panels.map((slot) => pushed(slot, LAYOUTS[1].focus, DRIFT))
    : LAYOUTS[0].panels;
  // As molduras vão de um arranjo ao outro com peso: crescem quando a fila sai, recuam quando o pedestal sobe.
  const moved = last
    ? ramp(frame, 0, 0.8 * fps)
    : ramp(frame, BEATS.grow, BEATS.growFrames);
  const drifting = DRIFT * linear(frame, 0, length);
  // No primeiro plano cada moldura acende na vez dela; no último, as três já estão acesas.
  const litAt = (index: number) => panelsAt?.[index];
  const lit = (index: number) => {
    const at = litAt(index);
    return last ? 1 : at === undefined ? 0 : ramp(frame, at, LIGHT_FRAMES);
  };
  // O que a moldura guarda entra logo depois de ela acender.
  const enterAt = (index: number) => {
    const at = litAt(index);
    return at === undefined ? undefined : at + ENTER_AFTER;
  };

  const slots = to.panels.map((slot, index) => {
    const at = between(from[index], pushed(slot, to.focus, drifting), moved);
    // Quem ainda espera a vez flutua; ao acender, assenta.
    const hover = (1 - lit(index)) * hovering(seconds, index, at.scale);
    return { ...at, y: at.y + hover };
  });
  // A resposta é outra ideia: o fundo passa ao menta do gancho, onde o pedestal nasceu.
  const answer = last ? ramp(frame, 0, 0.8 * fps) : 0;
  // A fila: pulsa no alto, o despertador ganha o X, e ela sai por cima.
  const life = rowLife((clock + frame) / fps);
  const crossed = crossAt === undefined || frame >= crossAt;
  const rowY = mix(ROW_TOP.y, ROW_GONE_Y, ramp(frame, BEATS.grow, 0.4 * fps));
  const memories = [
    <ElephantMemory
      key="elephant"
      seconds={seconds}
      litAt={litAt(0)}
      at={enterAt(0)}
      bareAt={last ? 0 : undefined}
    />,
    <JellyfishMemory
      key="jellyfish"
      seconds={seconds}
      litAt={litAt(1)}
      at={enterAt(1)}
    />,
    <ForcedMemory
      key="forced"
      seconds={seconds}
      litAt={litAt(2)}
      discAt={enterAt(2)}
      bedAt={bedAt}
      // O relógio entra com a cama: depois dela, era o último a chegar e o menor texto do quadro.
      clockAt={bedAt}
    />,
  ];
  // O pedestal sobe de baixo do quadro; a lupa vem do alto, pousa ao lado dele e fica pairando.
  const risen = ramp(frame, RISE.at, RISE.frames);
  const landed = lensAt === undefined ? 0 : ramp(frame, lensAt, LAND.frames);
  const settled =
    lensAt === undefined
      ? 0
      : interpolate(
          frame - lensAt - LAND.frames,
          [-6, 0, 5, 12],
          [1, -0.25, 0.12, 0],
          clamp,
        );
  const lightOn = lightAt === undefined ? 0 : ramp(frame, lightAt, 12);
  // Só o último plano entrega o palco a outra cena: aí cada coisa encolhe no próprio ponto, na marcação do elenco.
  const leaving = (x: number) =>
    last ? 1 - stage.leave(markFor("actor", x).leaveAt) : 1;

  const cast = (
    <>
      {last ? (
        <AbsoluteFill
          style={{
            transformOrigin: `${SIGN.x}px ${SIGN.y - 160}px`,
            scale: `${leaving(SIGN.x)}`,
          }}
        >
          <AbsoluteFill style={{ translate: `0 ${(1 - risen) * RISE.from}px` }}>
            <VacantSign
              {...SIGN}
              // Aceso, o foco respira devagar sobre o contorno, que continua vazio.
              light={lightOn * (0.9 + 0.1 * wave(seconds, 3.2))}
            />
          </AbsoluteFill>
        </AbsoluteFill>
      ) : null}
      {/* A fila sai pelo alto quando as molduras crescem, e não volta. */}
      {!last && rowY > ROW_GONE_Y ? (
        <IconRow
          x={ROW_TOP.x}
          y={rowY}
          scale={ROW_TOP.scale}
          hue={ROW_HUE}
          // Ela entra sobre o menta da conta de Gardner: os ícones apagados passam ao lilás junto com o fundo.
          tint={{ from: "mint", progress: stage.enter() }}
          states={{
            eyes: "check",
            ruler: "cross",
            brain: "cross",
            alarm: crossed ? "cross" : "on",
          }}
          since={crossAt === undefined ? {} : { alarm: crossAt }}
          turning={
            crossAt !== undefined && crossed
              ? { alarm: { from: "on", progress: ramp(frame, crossAt, 9) } }
              : {}
          }
          present={rowPresent(frame)}
          motion={life.motion}
          lift={life.lift}
          tilt={life.tilt}
          grow={life.grow}
        />
      ) : null}
      {slots.map((slot, index) => (
        <div
          key={index}
          style={{
            position: "absolute",
            inset: 0,
            // No primeiro plano as três entram apagadas, uma depois da outra, crescendo do próprio ponto.
            transformOrigin: `${slot.x}px ${slot.y}px`,
            scale: `${last ? leaving(slot.x) : panelIn(frame, index)}`,
          }}
        >
          <Panel
            slot={slot}
            width={WIDTHS[index]}
            number={`${index + 1}`}
            lit={lit(index)}
          >
            {/* Apagada, a moldura não tem lembrança dentro. */}
            {last || frame >= (litAt(index) ?? Infinity)
              ? memories[index]
              : null}
          </Panel>
        </div>
      ))}
      {lensAt === undefined || frame < lensAt ? null : (
        <AbsoluteFill
          style={{
            transformOrigin: `${LENS.x}px ${LENS.y}px`,
            scale: `${leaving(LENS.x)}`,
          }}
        >
          <AbsoluteFill
            style={{
              translate: `${(1 - landed) * LAND.from[0]}px ${(1 - landed) * LAND.from[1] + 5 * landed * wave(seconds, 3.4)}px`,
            }}
          >
            <Magnifier
              {...LENS}
              tilt={
                LAND.tilt * (1 - landed) + 9 * settled + 2 * wave(seconds, 4.6)
              }
            />
          </AbsoluteFill>
        </AbsoluteFill>
      )}
    </>
  );

  return (
    <AbsoluteFill>
      <FlatStage
        backdrop={
          <>
            <IdeaBackdrop hue={ROW_HUE} spot={[0.5, 0.6]} />
            <AbsoluteFill style={{ opacity: answer }}>
              <IdeaBackdrop hue="mint" spot={[0.5, 0.7]} />
            </AbsoluteFill>
          </>
        }
      >
        {/* O que os planos têm em comum não entra nem sai na troca: o plano novo assume o desenho.
            O último entrega o palco a outra cena, e é ele mesmo quem encolhe cada coisa. */}
        {/* A fila de `but-what` entra no fim do último plano, por baixo do que encolhe: a troca de cena
            não deixa a tela só com o fundo. Quando a cena dela chega, é ela quem a desenha. */}
        {last && frame >= length - LAST_MAP_LEAD && !stage.handedOver ? (
          <LastMapPrelude until={length - frame} clock={videoClock + length} />
        ) : null}
        {!last && stage.handedOver ? null : <Stay>{cast}</Stay>}
        <Grain />
      </FlatStage>
    </AbsoluteFill>
  );
};

export const SoFarScene: React.FC<SceneProps> = ({ scene, shots }) => {
  const clock = (shot: number) => ({
    clock: shots[shot].from,
    videoClock: scene.from + shots[shot].from,
  });
  return (
    <>
      <Shot
        range={shots[0]}
        name="o despertador ganha um X; as três molduras acendem"
      >
        <RecapShot
          {...clock(0)}
          crossAt={BEATS.cross}
          panelsAt={BEATS.panels}
          bedAt={BEATS.bed}
        />
      </Shot>
      <Shot range={shots[1]} name="o pedestal continua vazio">
        <RecapShot
          last
          {...clock(1)}
          // A lupa pousa em "estudado", e o foco acende sobre o contorno vazio em "conseguiu".
          lensAt={cue(scene, "estudado") - shots[1].from}
          lightAt={cue(scene, "conseguiu") - shots[1].from}
        />
      </Shot>
    </>
  );
};
