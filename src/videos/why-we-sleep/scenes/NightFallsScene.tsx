import {
  AbsoluteFill,
  interpolateColors,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Antelope } from "../../../art/Antelope";
import { taperPath } from "../../../art/shapes";
import {
  Camera,
  cameraBetween,
  framing,
  Layer,
  type CameraState,
} from "../../../components/Camera";
import { Grain } from "../../../components/Grain";
import { blink, breath, wave } from "../../../components/Idle";
import { Onomatopoeia } from "../../../components/Onomatopoeia";
import { Place } from "../../../components/Place";
import { SvgLayer } from "../../../components/SvgLayer";
import { cue, linear, mix, ramp } from "../../../components/timing";
import type { SceneProps } from "../../../video/NarratedVideo";
import { Shot, type Wipe } from "../../../video/Shot";
import { antelope, antelopeNight, ink, savanna, sound } from "../palette";
import { SAVANNA_GROUND_Y, Savanna, SavannaShadow } from "../parts/Savanna";

/**
 * O lugar do bloco 2: o pé de uma acácia, onde o bicho pequeno se deita, e a
 * moita de capim alto atrás dele. As cenas seguintes (`last-to-know`,
 * `skip-a-night`, `sleep-debt`) voltam a este mesmo ponto da savana.
 */
export const DEN = { x: 1380, y: SAVANNA_GROUND_Y + 40, width: 220 };
/** A moita atrás dele, de onde o predador espia. */
export const THICKET = { x: DEN.x + 250, y: SAVANNA_GROUND_Y + 30 };

export const DEN_WIDE = framing([960, 540], 1);
/** O plano médio: o bicho e a moita, com a árvore inteira em cima. */
export const DEN_MEDIUM = framing([DEN.x + 40, DEN.y - 110], 2.9, [960, 640]);
/**
 * De perto: o bicho deitado enche o quadro, do focinho à anca, e da moita
 * sobra a beirada, atrás dele. Deitado ele é largo e baixo, e por isso o close
 * é bem mais fechado que o plano médio: com menos, ele ficava do tamanho dos
 * planos vizinhos.
 */
export const DEN_CLOSE = framing([DEN.x - 20, DEN.y - 44], 5.6, [900, 640]);

/** Onde a lua está quando a noite cai: alta, à esquerda, para aparecer também nos planos de perto. */
export const NIGHT_ORB = 0.36;
// A noite entra varrendo o entardecer; o dia, a noite.
export const NIGHTFALL: Wipe = { frames: 14, from: "right" };

type SavannaShotProps = {
  readonly camera: CameraState;
  readonly daylight: number;
  readonly orb?: number;
  readonly children: React.ReactNode;
};

// A acácia do pé da qual ele dorme: a mesma de `Savanna` (x, copa e altura), repetida aqui para o luar acompanhá-la.
const DEN_TREE = { x: 1500, width: 320, height: 280 };
// O meio da base da copa: a silhueta de trás cresce a partir daqui, só para cima e para os lados.
const CANOPY = {
  x: DEN_TREE.x + 10,
  y: SAVANNA_GROUND_Y - DEN_TREE.height + 66,
};
const canopyPath = () => {
  const { x, width } = DEN_TREE;
  const top = SAVANNA_GROUND_Y - DEN_TREE.height;
  return `M${x - width / 2},${top + 50} C${x - width * 0.3},${top - 30} ${x + width * 0.35},${top - 40} ${x + width / 2 + 20},${top + 40} C${x + width * 0.2},${top + 70} ${x - width * 0.2},${top + 70} ${x - width / 2},${top + 50} Z`;
};

/**
 * O luar na acácia. De noite a copa tem quase a cor do céu e sumia: atrás
 * dela vai a mesma silhueta um tom acima, maior, e outra na cor da lua,
 * deslocada para o lado de onde a luz vem, que sobra como borda. Fica na
 * profundidade das árvores, dentro do céu, que não se move: é o único jeito
 * de chegar atrás da copa sem mexer no cenário.
 */
const Moonlight: React.FC = () => (
  <Layer depth={0.6}>
    <SvgLayer>
      <path
        d={canopyPath()}
        fill={savanna.night.far}
        transform={`translate(${CANOPY.x} ${CANOPY.y}) scale(1.12 1.4) translate(${-CANOPY.x} ${-CANOPY.y})`}
      />
      <path
        d={canopyPath()}
        fill={ink.moon}
        opacity={0.8}
        transform="translate(-5 -6)"
      />
    </SvgLayer>
  </Layer>
);

// A profundidade das árvores no cenário (`Savanna`), e a altura da beira do chão sob a acácia, no plano do assunto.
const TREE_DEPTH = 0.6;
const TRUNK_FOOT = SAVANNA_GROUND_Y - 48;

type TrunkLightProps = {
  readonly camera: CameraState;
};

/**
 * O luar no tronco. O tronco fica sobre as colinas, e por isso a borda dele
 * não cabe atrás do céu, como a da copa: sem ela, o tronco se confundia com o
 * capim da moita e a copa virava um arco solto. Aqui o tronco é redesenhado
 * com a borda na cor da lua, como em `third-of-life`, antes da moita e do
 * bicho. Vai no plano do assunto, e por isso desfaz a diferença de parallax
 * até a profundidade das árvores: fica exatamente sobre o tronco do cenário.
 */
const TrunkLight: React.FC<TrunkLightProps> = ({ camera }) => {
  const near = camera.zoom;
  const far = 1 + (camera.zoom - 1) * TREE_DEPTH;
  const { x, height } = DEN_TREE;
  const trunk = taperPath(
    [x, SAVANNA_GROUND_Y - 30],
    [x + 10, SAVANNA_GROUND_Y - height * 0.6],
    [x + 24, SAVANNA_GROUND_Y - height + 30],
    26,
    12,
  );
  return (
    // O chão do cenário esconde o pé do tronco; aqui, por cima do chão, ele é cortado na mesma altura.
    <AbsoluteFill style={{ clipPath: `inset(0 0 ${1080 - TRUNK_FOOT}px 0)` }}>
      <AbsoluteFill
        style={{
          translate: `${((1 - TREE_DEPTH) * camera.x) / near}px ${((1 - TREE_DEPTH) * camera.y) / near}px`,
          scale: `${far / near}`,
        }}
      >
        <SvgLayer>
          {/* A borda para na base da copa: por cima dela, riscava a silhueta. */}
          <clipPath id="trunk-light">
            <rect
              x={x - 200}
              y={SAVANNA_GROUND_Y - height + 62}
              width={400}
              height={height}
            />
          </clipPath>
          <g clipPath="url(#trunk-light)">
            <path
              d={trunk}
              fill={ink.moon}
              opacity={0.6}
              transform="translate(-5 0)"
            />
          </g>
          <path d={trunk} fill={savanna.night.trees} />
        </SvgLayer>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** Um plano na savana: a câmera, o cenário em camadas e a granulação. De noite, a árvore ganha o luar. */
export const SavannaShot: React.FC<SavannaShotProps> = ({
  camera,
  daylight,
  orb,
  children,
}) => (
  <AbsoluteFill>
    <Camera {...camera}>
      <Savanna
        daylight={daylight}
        orb={orb}
        sky={daylight < 0.25 ? <Moonlight /> : undefined}
      >
        {daylight < 0.25 ? <TrunkLight camera={camera} /> : null}
        {children}
      </Savanna>
    </Camera>
    <Grain />
  </AbsoluteFill>
);

type CritterProps = {
  /** 1 é dia, 0 é noite: escolhe a pintura do bicho e a da sombra. */
  readonly daylight: number;
  /** Deitado, de 0 a 1. */
  readonly rest?: number;
  /** Dormindo, de 0 a 1: fecha o olho, baixa a orelha, pende a cabeça. */
  readonly asleep?: number;
  /** De vigia: olho arregalado, orelha em pé, cabeça erguida. */
  readonly alert?: boolean;
  /** Devendo sono: a olheira, de 0 a 1; as pálpebras ficam a meio. */
  readonly tired?: number;
  /**
   * Cochilando em pé, de 0 a 1: os joelhos da frente cedem, o pescoço desce
   * e a cabeça fica pendurada, de orelha caída, sem o olho fechar de todo.
   */
  readonly nod?: number;
  /** Andando, de 0 a 1. */
  readonly walking?: number;
  /** Virado para a direita, para a moita. O desenho olha para a esquerda. */
  readonly flipped?: boolean;
  readonly x?: number;
  readonly seconds: number;
};

/** O bicho pequeno do bloco 2: o antílope do elenco, do tamanho de quem é visto de longe. */
export const Critter: React.FC<CritterProps> = ({
  daylight,
  rest = 0,
  asleep = 0,
  alert = false,
  tired = 0,
  nod = 0,
  walking = 0,
  flipped = false,
  x = DEN.x,
  seconds,
}) => (
  <>
    <SvgLayer>
      <SavannaShadow
        x={x}
        y={DEN.y + 4}
        width={DEN.width * 0.8}
        daylight={daylight}
      />
    </SvgLayer>
    <Place
      x={x}
      y={DEN.y}
      anchor="bottom"
      style={{
        scale: `${flipped ? -1 : 1} ${breath(seconds, "critter", { amplitude: 0.014, period: asleep > 0.5 ? 4.5 : 3 })}`,
      }}
    >
      <Antelope
        width={DEN.width}
        colors={daylight > 0.25 ? antelope : antelopeNight}
        rest={Math.max(rest, NOD.buckle * nod)}
        droop={Math.max(asleep, nod)}
        tired={tired}
        lid={
          alert
            ? 0
            : Math.max(
                asleep,
                0.55 * tired,
                NOD.lid * nod,
                blink(seconds, "critter"),
              )
        }
        look={
          alert
            ? [-0.8, -0.1]
            : [0.5 * wave(seconds, 2.9) * (1 - nod), 0.1 + 0.7 * nod]
        }
        ear={alert ? 1 : 0.9 - 0.75 * Math.max(asleep, nod)}
        stride={walking * wave(seconds, 0.7)}
        turn={
          alert
            ? -8 + 3 * wave(seconds, 3.1)
            : (1 - asleep) * 4 * wave(seconds, 3.7) + NOD.head * nod
        }
      />
    </Place>
  </>
);

// O cochilo em pé: quanto os joelhos cedem, quanto o focinho aponta para o chão e quanto a pálpebra desce.
const NOD = { buckle: 0.16, head: -38, lid: 0.66 };

/** A cor de uma coisa da savana entre a noite, o entardecer e o dia. */
const lightOf = (key: "grass" | "trees", daylight: number) =>
  interpolateColors(
    daylight,
    [0, 0.5, 1],
    [savanna.night[key], savanna.dusk[key], savanna.day[key]],
  );

// As folhas da moita: x da base, altura e inclinação; as de trás e as da frente.
const BACK_BLADES = [
  [-150, 150, -26],
  [-112, 196, -8],
  [-78, 170, 14],
  [-40, 214, -12],
  [-4, 184, 10],
  [34, 220, 22],
  [70, 176, -10],
  [108, 204, 16],
  [146, 156, 30],
] as const;
const FRONT_BLADES = [
  [-166, 92, -24],
  [-128, 124, 10],
  [-92, 100, -14],
  [-52, 132, 8],
  [-14, 96, -10],
  [26, 128, 14],
  [64, 102, -8],
  [102, 122, 18],
  [140, 94, 26],
] as const;

type ThicketProps = {
  readonly daylight: number;
  readonly seconds: number;
  /** Quanto o capim se mexe, de 0 (só o vento) a 1 (alguém passa por ele). */
  readonly stir?: number;
  /** Quem está dentro da moita: fica entre as folhas de trás e as da frente. */
  readonly children?: React.ReactNode;
};

/** A moita de capim alto atrás do bicho. Vai dentro do `SavannaShot`. */
export const Thicket: React.FC<ThicketProps> = ({
  daylight,
  seconds,
  stir = 0,
  children,
}) => {
  const sway = (index: number) =>
    (6 + 22 * stir) * wave(seconds, stir > 0 ? 0.5 : 3.2, index / 5);
  return (
    <>
      <SvgLayer>
        {BACK_BLADES.map(([x, height, lean], index) => (
          <path
            key={x}
            d={taperPath(
              [THICKET.x + x, THICKET.y],
              [THICKET.x + x - lean / 2, THICKET.y - height * 0.55],
              [THICKET.x + x + lean + sway(index), THICKET.y - height],
              17,
              4,
            )}
            fill={lightOf("trees", daylight)}
          />
        ))}
      </SvgLayer>
      {children}
      <SvgLayer>
        {FRONT_BLADES.map(([x, height, lean], index) => (
          <path
            key={x}
            d={taperPath(
              [THICKET.x + x, THICKET.y + 26],
              [THICKET.x + x - lean / 2, THICKET.y + 26 - height * 0.55],
              [THICKET.x + x + lean + sway(index + 2), THICKET.y + 26 - height],
              19,
              4,
            )}
            fill={lightOf("grass", daylight)}
          />
        ))}
      </SvgLayer>
    </>
  );
};

type StalkerProps = {
  /** Quanto os olhos estão acesos, de 0 a 1. */
  readonly lit: number;
  /** Quanto a sombra saiu da moita, na direção do bicho, de 0 a 1. */
  readonly out?: number;
  /** Quanto da sombra já se vê, de 0 a 1. */
  readonly shown?: number;
  readonly seconds: number;
};

/** O predador: uma sombra sem rosto dentro da moita e dois olhos, os mesmos do primeiro ícone da fila. */
export const Stalker: React.FC<StalkerProps> = ({
  lit,
  out = 0,
  shown = 1,
  seconds,
}) => {
  const x = THICKET.x + 10 - 90 * out;
  const y = THICKET.y - 6;
  return (
    <SvgLayer>
      {/* Só a cabeça e os ombros, agachados: o resto fica dentro do capim. */}
      <g
        transform={`translate(${x} ${y}) scale(0.5)`}
        fill={savanna.night.contact}
        opacity={shown * (0.7 + 0.3 * out)}
      >
        <path d="M-150,40 C-156,-90 -110,-190 -20,-200 C60,-196 150,-130 300,-110 C380,-100 420,-40 420,40 Z" />
        <path d="M-110,-160 L-128,-246 L-58,-196 Z M30,-176 L52,-252 L-10,-204 Z" />
      </g>
      {[-17, 17].map((offset) => (
        <ellipse
          key={offset}
          cx={x - 28 + offset}
          cy={y - 66}
          rx={10}
          ry={6.5 * lit * (1 - 0.9 * blink(seconds, "stalker"))}
          fill={ink.moon}
        />
      ))}
    </SvgLayer>
  );
};

// De quão longe ele vem andando até o pé da árvore.
const WALK_IN = 430;

/** A savana ao entardecer, de longe: o bicho caminha sozinho para debaixo da árvore. */
const DuskShot: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const seconds = frame / fps;
  const arrived = linear(frame, 0, durationInFrames - 0.5 * fps);

  return (
    <SavannaShot camera={DEN_WIDE} daylight={0.5} orb={0.33}>
      <Thicket daylight={0.5} seconds={seconds} />
      <Critter
        daylight={0.5}
        x={DEN.x + WALK_IN * (1 - arrived)}
        walking={arrived < 1 ? 1 : 0}
        seconds={seconds}
      />
    </SavannaShot>
  );
};

type LyingShotProps = {
  /** Quadros do plano em que ele se deita e em que fecha os olhos. */
  readonly lieAt: number;
  readonly closeAt: number;
};

/** A savana anoitece; o bicho se enrosca sob a árvore e fecha os olhos. */
const LyingShot: React.FC<LyingShotProps> = ({ lieAt, closeAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const seconds = frame / fps;

  return (
    <SavannaShot camera={DEN_MEDIUM} daylight={0} orb={NIGHT_ORB}>
      <Thicket daylight={0} seconds={seconds} />
      <Critter
        daylight={0}
        rest={ramp(frame, lieAt, 0.6 * fps)}
        asleep={ramp(frame, closeAt, 0.4 * fps)}
        seconds={seconds}
      />
    </SavannaShot>
  );
};

// O ronco sai da cabeça dele, pousada no chão, e sobe para o céu livre.
const SNORE = { x: 800, y: 300 };

type AsleepShotProps = {
  /** Quadro do plano em que o capim se mexe. */
  readonly stirAt: number;
};

/** De perto, ele ressona; atrás dele, o capim se mexe. */
const AsleepShot: React.FC<AsleepShotProps> = ({ stirAt }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const seconds = frame / fps;
  const stir = ramp(frame, stirAt, 0.4 * fps);

  return (
    <>
      <SavannaShot
        camera={cameraBetween(DEN_MEDIUM, DEN_CLOSE, ramp(frame, 0, 0.8 * fps))}
        daylight={0}
        orb={mix(
          NIGHT_ORB,
          NIGHT_ORB + 0.04,
          linear(frame, 0, durationInFrames),
        )}
      >
        {/* Só o capim se mexe: quem está nele aparece na cena seguinte. */}
        <Thicket daylight={0} seconds={seconds} stir={stir} />
        <Critter daylight={0} rest={1} asleep={1} seconds={seconds} />
      </SavannaShot>
      <Place x={SNORE.x} y={SNORE.y}>
        <Onomatopoeia
          at={0.5 * fps}
          size={200}
          color={sound.cool}
          edge={sound.edge}
          tilt={-12}
          fade={0.22}
        >
          zzz
        </Onomatopoeia>
      </Place>
    </>
  );
};

export const NightFallsScene: React.FC<SceneProps> = ({ scene, shots }) => (
  <>
    <Shot
      range={shots[0]}
      name="o bicho vai para debaixo da árvore"
      hold={NIGHTFALL.frames}
    >
      <DuskShot />
    </Shot>
    <Shot range={shots[1]} name="anoitece e ele se deita" wipe={NIGHTFALL}>
      <LyingShot
        lieAt={cue(scene, "deita") - shots[1].from}
        closeAt={cue(scene, "fecha") - shots[1].from}
      />
    </Shot>
    <Shot range={shots[2]} name="ele ressona; o capim se mexe">
      <AsleepShot stirAt={cue(scene, "acontece") - shots[2].from} />
    </Shot>
  </>
);
