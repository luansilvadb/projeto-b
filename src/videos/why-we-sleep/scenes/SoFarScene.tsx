import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { Cassiopea } from "../../../art/Cassiopea";
import { Elephant } from "../../../art/Elephant";
import { Stopwatch } from "../../../art/Stopwatch";
import { Stay, Troupe } from "../../../components/Cast";
import { Grain } from "../../../components/Grain";
import { Place } from "../../../components/Place";
import { Pop } from "../../../components/Pop";
import { SlowPush } from "../../../components/SlowPush";
import { SvgLayer } from "../../../components/SvgLayer";
import {
  ALREADY_SHOWN,
  cue,
  mix,
  ramp,
  settle,
} from "../../../components/timing";
import type { SceneProps } from "../../../video/NarratedVideo";
import { Shot } from "../../../video/Shot";
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
import { IconRow } from "../parts/IconRow";
import { PULSES_ASLEEP, pulseCycles, pulseShape, steady } from "../parts/pulse";
import { RatDisc } from "../parts/Rats";
import { Magnifier } from "../parts/Search";
import { Tag } from "../parts/Tag";
import { VacantSign } from "../parts/VacantSign";
import { ROW_HUE } from "./FivePartsScene";

/**
 * O resumo dos três jeitos de escapar. No primeiro plano, a fila dos ícones
 * pequena no alto e, embaixo dela, as três molduras já reservadas, vazias,
 * cada uma com o número do jeito. Depois a fila sai e cada moldura se enche
 * na fala dela: a de que a fala trata fica grande, e as outras, pequenas, ao
 * lado. No fim, as três ficam em cima e o pedestal "acordado 24 h" continua
 * vazio.
 */

/** Tamanho de uma moldura em escala 1; a terceira é mais larga, porque guarda duas lembranças. */
const PANEL = { width: 520, height: 600, border: 12, radius: 44 };
const WIDE_PANEL = 860;
const WIDTHS = [PANEL.width, PANEL.width, WIDE_PANEL] as const;

type Slot = { readonly x: number; readonly y: number; readonly scale: number };

type Layout = {
  /** Onde a fila dos ícones fica. */
  readonly row: Slot;
  /** Onde cada moldura fica. */
  readonly panels: readonly [Slot, Slot, Slot];
};

// A fila no alto, pequena e no meio: o canto de cima à direita é do bolso da conta (`POCKET_CORNER`).
const ROW_TOP: Slot = { x: 960, y: 166, scale: 0.6 };
const ROW_CENTER: Slot = { x: 960, y: 520, scale: 1.05 };
const ROW_GONE: Slot = { x: 960, y: -260, scale: 0.6 };
// Sob a fila, as três molduras reservadas; o selo da fonte ocupa o canto de baixo à direita.
const RESERVED_Y = 660;
// Sem a fila, a moldura de que a fala trata fica no meio da altura do quadro.
const FOCUS_Y = 540;

/**
 * O arranjo de cada plano; o primeiro é de onde a fila vem, no centro, como
 * nas outras voltas dela. A fila só fica no primeiro plano: com ela, as
 * molduras cheias somavam nove textos à vista.
 */
const RESERVED: Layout["panels"] = [
  { x: 472, y: RESERVED_Y, scale: 0.62 },
  { x: 854, y: RESERVED_Y, scale: 0.62 },
  { x: 1341, y: RESERVED_Y, scale: 0.62 },
];
const START: Layout = { row: ROW_CENTER, panels: RESERVED };
const LAYOUTS: readonly Layout[] = [
  { row: ROW_TOP, panels: RESERVED },
  {
    row: ROW_GONE,
    panels: [
      { x: 560, y: FOCUS_Y, scale: 1.2 },
      { x: 1110, y: FOCUS_Y, scale: 0.5 },
      { x: 1520, y: FOCUS_Y, scale: 0.5 },
    ],
  },
  {
    row: ROW_GONE,
    panels: [
      { x: 300, y: FOCUS_Y, scale: 0.5 },
      { x: 820, y: FOCUS_Y, scale: 1.3 },
      { x: 1450, y: FOCUS_Y, scale: 0.5 },
    ],
  },
  {
    row: ROW_GONE,
    panels: [
      { x: 250, y: FOCUS_Y - 40, scale: 0.44 },
      { x: 520, y: FOCUS_Y - 40, scale: 0.44 },
      { x: 1180, y: FOCUS_Y - 40, scale: 1.08 },
    ],
  },
  {
    row: ROW_GONE,
    panels: [
      { x: 500, y: 270, scale: 0.6 },
      { x: 862, y: 270, scale: 0.6 },
      { x: 1326, y: 270, scale: 0.6 },
    ],
  },
];

const between = (from: Slot, to: Slot, t: number): Slot => ({
  x: mix(from.x, to.x, t),
  y: mix(from.y, to.y, t),
  scale: mix(from.scale, to.scale, t),
});

type PanelProps = {
  readonly slot: Slot;
  readonly width: number;
  /** O número do jeito: o mesmo da pílula sob o ícone dele, na fila. */
  readonly number: string;
  /** Quadro do plano em que a moldura entra; por padrão, já está no quadro. */
  readonly at?: number;
  /** Quadro do plano em que a lembrança enche a moldura; sem valor, ela segue vazia. */
  readonly fillAt?: number;
  /** Quanto a moldura se vê, de 0 a 1: vazia e à espera, fica apagada. */
  readonly presence?: number;
  /** A lembrança, desenhada em pixels da moldura. */
  readonly children: React.ReactNode;
};

/**
 * Uma moldura de borda clara com o número do jeito no canto. Vazia, é um
 * lugar reservado, no tom escuro do fundo; cheia, guarda a lembrança de um
 * capítulo.
 */
const Panel: React.FC<PanelProps> = ({
  slot,
  width,
  number,
  at = ALREADY_SHOWN,
  fillAt,
  presence = 1,
  children,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const filled = fillAt === undefined ? 0 : ramp(frame, fillAt, 0.3 * fps);
  return (
    <Place x={slot.x} y={slot.y}>
      <Pop at={at}>
        <div
          style={{
            position: "relative",
            scale: `${slot.scale}`,
            opacity: presence,
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
            <AbsoluteFill
              style={{
                opacity: filled,
                scale: `${mix(1.12, 1, filled)}`,
              }}
            >
              <Stay>
                <Troupe cast={false}>{children}</Troupe>
              </Stay>
            </AbsoluteFill>
          </div>
          <div style={{ position: "absolute", left: 30, top: -40 }}>
            <Tag on="lilac" size="note">
              {number}
            </Tag>
          </div>
        </div>
      </Pop>
    </Place>
  );
};

// A régua de 24 horas dentro da primeira moldura, e as duas horas da elefanta nela.
const BAR = { x: 60, y: 420, width: 400, height: 36, hours: 2 / 24 };

type ElephantMemoryProps = {
  /** Sem o número: no último plano a moldura é pequena e o "2 h" era o sexto texto do quadro; a barra diz o mesmo. */
  readonly bare?: boolean;
};

/** A primeira lembrança: a elefanta dormindo em pé, e a barra do sono dela, "2 h". */
const ElephantMemory: React.FC<ElephantMemoryProps> = ({ bare = false }) => (
  <>
    <AbsoluteFill
      style={{
        background: `linear-gradient(${idea.peach.top}, ${idea.peach.bottom})`,
      }}
    />
    <SvgLayer>
      <ellipse
        cx={260}
        cy={376}
        rx={180}
        ry={18}
        fill={idea.peach.contact}
        opacity={0.24}
      />
      <rect
        x={BAR.x}
        y={BAR.y}
        width={BAR.width}
        height={BAR.height}
        rx={BAR.height / 2}
        fill={ink.tag}
        opacity={0.3}
      />
      <rect
        x={BAR.x}
        y={BAR.y}
        width={Math.max(BAR.height, BAR.width * BAR.hours)}
        height={BAR.height}
        rx={BAR.height / 2}
        fill={ink.tag}
      />
    </SvgLayer>
    <Place x={260} y={370} anchor="bottom">
      <Elephant width={410} colors={elephant} lid={1} droop={1} trunk={0} />
    </Place>
    {bare ? null : (
      <Place x={BAR.x + 78} y={BAR.y + BAR.height + 58}>
        <Tag on="peach" size="note">
          2 h
        </Tag>
      </Place>
    )}
  </>
);

// Do centro do desenho da água-viva até onde o sino encosta no chão, em fração da largura do sino.
const RESTING = 124 / 660;
const SEABED = 440;

/** A segunda lembrança: a água-viva dormindo no fundo, de braços caídos, pulsando devagar. */
const JellyfishMemory: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <>
      <AbsoluteFill
        style={{
          background: `linear-gradient(${lagoon.night.water[0]}, ${lagoon.night.water[2]})`,
        }}
      />
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
      <Place x={260} y={SEABED + 12 - 330 * RESTING}>
        <Cassiopea
          width={330}
          colors={jellyfish.night}
          droop={0.8}
          pulse={pulseShape(pulseCycles(frame, fps, steady(PULSES_ASLEEP)))}
        />
      </Place>
    </>
  );
};

const HALF = WIDE_PANEL / 2;
const FLOOR = 420;
// A cama cabe na metade direita da moldura, com folga dos dois lados.
const BED = { x: HALF + HALF / 2, y: FLOOR + 44, scale: 0.33 };

/**
 * A terceira lembrança, em duas metades: o disco com o rato do teste em
 * silhueta, e o rapaz na cama com o relógio em "14 h".
 */
const ForcedMemory: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <>
      <AbsoluteFill
        style={{
          background: `linear-gradient(${lab.wall[0]}, ${lab.wall[1]})`,
        }}
      />
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
      </SvgLayer>
      <RatDisc
        x={HALF / 2}
        y={FLOOR + 76}
        scale={0.48}
        rats={["gone", "awake"]}
        seconds={frame / fps}
      />
      <SvgLayer>
        {/* A divisória das duas metades, da cor da moldura. */}
        <rect
          x={HALF - PANEL.border / 2}
          y={0}
          width={PANEL.border}
          height={PANEL.height}
          fill={ink.paper}
        />
      </SvgLayer>
      {/* Randy Gardner, com as cores dele e o cobertor dele, na cama de todo plano em que alguém dorme. */}
      <Bed {...BED} colors={gardner} blanket="blue" hue="mint" />
      <Place x={BED.x + 40} y={150}>
        <Stopwatch width={150} colors={stopwatch} reading="14 h" />
      </Place>
    </>
  );
};

// Quanto as molduras vazias se veem enquanto esperam a vez delas.
const WAITING = 0.38;
const SIGN = { x: 960, y: 1016, scale: 0.8 };
const LENS = { x: 1340, y: 740, size: 96 };

type RecapShotProps = {
  /** O plano da cena, de 0 a 4: diz o arranjo e de qual arranjo ele vem. */
  readonly shot: number;
  /** Quadro do plano em que o despertador ganha o X; sem valor, já tem. */
  readonly crossAt?: number;
  /** Quadro do plano em que a lupa pousa ao lado do pedestal. */
  readonly lensAt?: number;
};

/** A fila, as molduras e, no fim, o pedestal: o mesmo palco nos cinco planos, em arranjos diferentes. */
const RecapShot: React.FC<RecapShotProps> = ({ shot, crossAt, lensAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const from = shot === 0 ? START : LAYOUTS[shot - 1];
  const to = LAYOUTS[shot];
  // O arranjo muda no começo do plano; no primeiro, a fila sobe um pouco depois de aparecer.
  const moved = ramp(frame, shot === 0 ? 0.5 * fps : 0, 0.6 * fps);
  const row = between(from.row, to.row, moved);
  const last = shot === LAYOUTS.length - 1;
  const answer = last ? ramp(frame, 0, 0.5 * fps) : 0;
  const landed = lensAt === undefined ? 0 : settle(frame, lensAt, 0.6 * fps);
  const memories = [
    <ElephantMemory key="elephant" bare={last} />,
    <JellyfishMemory key="jellyfish" />,
    <ForcedMemory key="forced" />,
  ];

  return (
    <SlowPush
      focus={[960, 600]}
      by={0.03}
      backdrop={
        <>
          <IdeaBackdrop hue={ROW_HUE} spot={[0.5, 0.6]} />
          {/* A resposta é outra ideia: o fundo passa ao menta do gancho, onde o pedestal nasceu. */}
          <AbsoluteFill style={{ opacity: answer }}>
            <IdeaBackdrop hue="mint" spot={[0.5, 0.7]} />
          </AbsoluteFill>
        </>
      }
    >
      {last ? (
        <AbsoluteFill
          style={{ opacity: answer, translate: `0 ${(1 - answer) * 240}px` }}
        >
          <VacantSign {...SIGN} />
        </AbsoluteFill>
      ) : null}
      {/* A fila sai pelo alto no começo do segundo plano, e não volta. */}
      {shot <= 1 ? (
        <IconRow
          {...row}
          hue={ROW_HUE}
          states={{
            eyes: "check",
            ruler: "cross",
            brain: "cross",
            alarm: crossAt !== undefined && frame < crossAt ? "on" : "cross",
          }}
          since={crossAt === undefined ? {} : { alarm: crossAt }}
        />
      ) : null}
      {to.panels.map((slot, index) => (
        <Panel
          key={index}
          slot={between(from.panels[index], slot, moved)}
          width={WIDTHS[index]}
          number={`${index + 1}`}
          // As três entram vazias, uma depois da outra, quando a fila sobe.
          at={shot === 0 ? (0.7 + 0.12 * index) * fps : ALREADY_SHOWN}
          // Vazias, as três ficam apagadas: no primeiro plano quem fala é o X do despertador.
          // Acendem na deixa "Dormindo", quando a primeira cresce.
          presence={
            shot === 0 ? WAITING : shot === 1 ? mix(WAITING, 1, moved) : 1
          }
          // A moldura do plano se enche depois de crescer; as anteriores já estão cheias.
          fillAt={
            index + 1 === shot
              ? 0.4 * fps
              : index + 1 < shot
                ? ALREADY_SHOWN
                : undefined
          }
        >
          {memories[index]}
        </Panel>
      ))}
      {lensAt === undefined ? null : (
        <AbsoluteFill
          style={{
            opacity: frame >= lensAt ? 1 : 0,
            translate: `${(1 - landed) * 700}px ${(landed - 1) * 200}px`,
          }}
        >
          <Magnifier {...LENS} />
        </AbsoluteFill>
      )}
      <Grain />
    </SlowPush>
  );
};

export const SoFarScene: React.FC<SceneProps> = ({ scene, shots }) => (
  <>
    <Shot range={shots[0]} name="no alto, o despertador ganha um X">
      <RecapShot shot={0} crossAt={cue(scene, "falharam")} />
    </Shot>
    <Shot range={shots[1]} name="moldura 1: a elefanta e as duas horas">
      <RecapShot shot={1} />
    </Shot>
    <Shot range={shots[2]} name="moldura 2: a água-viva dorme">
      <RecapShot shot={2} />
    </Shot>
    <Shot range={shots[3]} name="moldura 3: os ratos e as 14 horas">
      <RecapShot shot={3} />
    </Shot>
    <Shot range={shots[4]} name="o pedestal continua vazio">
      <RecapShot shot={4} lensAt={cue(scene, "resposta") - shots[4].from} />
    </Shot>
  </>
);
