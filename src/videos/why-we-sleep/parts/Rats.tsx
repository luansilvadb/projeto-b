import "../../../design/fonts";
import { useId } from "react";
import { AbsoluteFill, interpolateColors } from "remotion";
import { taperPath } from "../../../art/shapes";
import { Silhouette } from "../../../art/Silhouettes";
import {
  Build,
  Camera,
  Layer,
  useBuild,
  type CameraState,
} from "../../../components/Camera";
import { Grain } from "../../../components/Grain";
import { blink, breath, phaseOf, wave } from "../../../components/Idle";
import { Place } from "../../../components/Place";
import { SvgLayer } from "../../../components/SvgLayer";
import { typography } from "../../../design/tokens";
import { elephant, lab, rat, researcher } from "../palette";
import { BENCH_Y, LabWall } from "./Laboratory";
import { clamp01 } from "../../../components/timing";

/**
 * Os ratos do experimento de Rechtschaffen (art.md): brancos, de orelha
 * rosada, em silhueta com olho; nos closes, o mesmo rato com volume
 * (`close`). Quem sai do experimento vira silhueta
 * apagada; nenhum rato é desenhado em sofrimento. Aqui ficam o rato, o disco
 * sobre a bandeja de água com os dois ratos em cima, a fila dos dez e o
 * laboratório sem tanque em que eles aparecem.
 */

/** De olho aberto, com a pálpebra a meio, cochilando, ou já fora do experimento: só a silhueta. */
type RatState = "awake" | "sleepy" | "asleep" | "gone";

// A caixa do desenho do rato em `Silhouettes` e o olho dele, nas unidades dela.
const VIEW = { width: 260, height: 130 };
const EYE = { x: 44, y: 82, radius: 6 };
// Nenhum traço com menos de 4 px no quadro: o olho fechado engrossa nos ratos pequenos.
const MIN_STROKE = 4.5;

type RatProps = {
  /** Comprimento do rato, do focinho à ponta do rabo, em pixels do quadro. */
  readonly width: number;
  readonly state?: RatState;
  /**
   * De perto: o rato é o assunto do plano e ganha volume (sombra, barriga,
   * orelha com interior, patas, bigode e cauda em tubo). Nas filas e nas
   * molduras ele continua em silhueta, que é o que cabe no tamanho delas.
   */
  readonly close?: boolean;
  /** O movimento do rato; sem valor, é o desenho parado de sempre. */
  readonly motion?: RatMotion;
};

/**
 * O movimento de um rato, por cima do `state`. Sem valores, o rato é o
 * desenho parado: é o que recebem as cenas que não o animam.
 */
export type RatMotion = {
  /** Quanto a pálpebra está fechada, de 0 a 1: o olho fecha e abre aos poucos, em vez de trocar de estado num quadro. */
  readonly lid?: number;
  /** Quanto a cor já saiu, de 0 a 1: o rato a caminho da silhueta apagada. Só na silhueta. */
  readonly gone?: number;
  /** Os bigodes e a orelha da frente, em graus em volta do repouso. Só de perto. */
  readonly whisker?: number;
  readonly ear?: number;
  /** A ponta da cauda sobe (negativo) ou desce, em unidades do desenho. Só de perto. */
  readonly tail?: number;
  /** O olho arregalado, de 0 a 1. */
  readonly wide?: number;
  /**
   * A passada, como em `Person`: `step` cresce um inteiro a cada pata que
   * toca o chão, e `amount` vai de 0 (parado) a 1. As patas alternam em
   * diagonal e o corpo sobe e desce a cada passo. Só de perto.
   */
  readonly gait?: { readonly step: number; readonly amount?: number };
};

/**
 * A pausa viva de um rato num instante: fareja em rajadas (os bigodes), mexe
 * a orelha de vez em quando, balança a cauda e pisca. Cada rato tem a sua
 * fase, pela semente. `amount` vai de 0 (parado) a 1.
 */
export const ratIdle = (
  seconds: number,
  seed: string,
  amount = 1,
): Required<Pick<RatMotion, "lid" | "whisker" | "ear" | "tail">> => {
  // Farejar vem em rajadas: os bigodes tremem depressa por um instante e sossegam.
  const sniffing = Math.max(0, wave(seconds, 2.3, phaseOf(`sniff-${seed}`)));
  return {
    lid: amount * blink(seconds, `rat-${seed}`, { every: [1.8, 4.6] }),
    whisker:
      amount *
      (2 * wave(seconds, 1.7, phaseOf(`whisk-${seed}`)) +
        7 * sniffing * wave(seconds, 0.2, phaseOf(seed))),
    ear:
      amount *
      -16 *
      blink(seconds, `ear-${seed}`, { every: [1.4, 3.8], seconds: 0.3 }),
    tail: amount * 7 * wave(seconds, 2.9, phaseOf(`tail-${seed}`)),
  };
};

/** Dois movimentos somados: a pálpebra fica com a mais fechada; o resto soma. */
export const withIdle = (
  motion: RatMotion | undefined,
  idle: RatMotion,
): RatMotion => ({
  ...motion,
  lid: Math.max(motion?.lid ?? 0, idle.lid ?? 0),
  whisker: (motion?.whisker ?? 0) + (idle.whisker ?? 0),
  ear: (motion?.ear ?? 0) + (idle.ear ?? 0),
  tail: (motion?.tail ?? 0) + (idle.tail ?? 0),
});

// As cores do rato de perto. A ficha dá o branco e o rosado da orelha; os tons de volume vêm de quem já mora
// no laboratório (o branco frio e a sombra da plataforma) e do interior da orelha da elefanta, o rosa mais fundo.
const COAT = {
  base: lab.platform,
  light: rat.body,
  shade: lab.platformShade,
  pink: rat.ear,
  pinkDeep: elephant.earInside,
};
// O corpo de perto, na mesma caixa da silhueta e com o olho no mesmo lugar: a cabeça se separa do dorso
// por uma baixa na nuca, a anca é redonda e a barriga sai do chão.
const BODY =
  "M8,97 C14,80 32,66 52,60 C64,56 72,58 84,54 C104,40 150,34 184,50 C208,62 222,88 216,108 C212,120 198,124 180,124 L64,124 C40,122 18,112 8,97 Z";
const TAIL = {
  from: [208, 106],
  bend: [244, 122],
  to: [258, 72],
} as const;

type CloseRatProps = {
  readonly width: number;
  readonly state: RatState;
  readonly motion?: RatMotion;
};

// Quanto cada pata avança e sobe no passo, e quanto o corpo sobe com ele, nas unidades do desenho.
const STEP = { reach: 14, lift: 10, bob: 4 };

type EyelidProps = {
  /** Quanto a pálpebra já desceu, de 0 a 1. */
  readonly lid: number;
  readonly radius: number;
  /** A cor do corpo em volta do olho, e a do risco do olho fechado. */
  readonly skin: string;
  readonly line: string;
  readonly stroke: number;
};

/**
 * A pálpebra que desce: uma tampa da cor do corpo, cortada no contorno do
 * olho, que vem de cima; quando acaba de fechar, sobra o risco do olho
 * fechado. É o estado intermediário entre o olho aberto e o cochilo.
 */
const Eyelid: React.FC<EyelidProps> = ({ lid, radius, skin, line, stroke }) => {
  const id = useId();
  const reach = radius + 3;
  const shut = clamp01((lid - 0.82) / 0.18);
  return (
    <>
      <defs>
        <clipPath id={id}>
          <circle cx={EYE.x} cy={EYE.y} r={reach} />
        </clipPath>
      </defs>
      <rect
        x={EYE.x - reach}
        y={EYE.y - reach}
        width={reach * 2}
        height={reach * 2 * Math.min(1, lid / 0.9)}
        fill={skin}
        clipPath={`url(#${id})`}
      />
      {shut > 0 ? (
        <path
          d={`M${EYE.x - radius - 2},${EYE.y - 1} q${radius + 2},${(radius + 2) * shut} ${(radius + 2) * 2},0`}
          fill="none"
          stroke={line}
          strokeWidth={stroke}
          strokeLinecap="round"
          opacity={shut}
        />
      ) : null}
    </>
  );
};

/** O rato de perto: as mesmas proporções da silhueta, construído em formas empilhadas. */
const CloseRat: React.FC<CloseRatProps> = ({ width, state, motion }) => {
  const id = useId();
  // Nenhum traço com menos de 4 px no quadro: o bigode e o olho fechado engrossam nos ratos menores.
  const stroke = Math.max(2.4, (MIN_STROKE * VIEW.width) / width);
  const gait = motion?.gait;
  const walking = gait ? (gait.amount ?? 1) : 0;
  const cycle = (gait?.step ?? 0) * Math.PI;
  // As patas alternam em diagonal: a da frente deste lado vai com a de trás do outro.
  const paw = (pair: 0 | 1) => {
    const at = cycle + pair * Math.PI;
    return `translate(${STEP.reach * walking * Math.cos(at)} ${-STEP.lift * walking * Math.max(0, Math.sin(at))})`;
  };
  const bob = -STEP.bob * walking * Math.abs(Math.sin(cycle));
  const wide = motion?.wide ?? 0;
  const eye = (EYE.radius + 1.5) * (1 + 0.28 * wide);
  const tail = [TAIL.to[0], TAIL.to[1] + (motion?.tail ?? 0)] as const;
  return (
    <svg
      width={width}
      height={(width * VIEW.height) / VIEW.width}
      viewBox={`0 0 ${VIEW.width} ${VIEW.height}`}
      overflow="visible"
    >
      <defs>
        <clipPath id={id}>
          <path d={BODY} />
        </clipPath>
      </defs>
      {/* As patas do outro lado, mais escuras. */}
      <ellipse
        cx={92}
        cy={124}
        rx={12}
        ry={5.5}
        fill={COAT.pinkDeep}
        transform={paw(1)}
      />
      <ellipse
        cx={160}
        cy={124.5}
        rx={15}
        ry={5.5}
        fill={COAT.pinkDeep}
        transform={paw(0)}
      />
      <g transform={`translate(0 ${bob})`}>
        {/* A cauda, em tubo que afina, com a sombra por baixo. */}
        <path
          d={taperPath(TAIL.from, TAIL.bend, tail, 15, 6)}
          fill={COAT.pinkDeep}
          transform="translate(1.5 3.5)"
        />
        <path
          d={taperPath(TAIL.from, TAIL.bend, tail, 14, 5)}
          fill={COAT.pink}
        />
        {/* A orelha de trás, mais escura. */}
        <circle cx={64} cy={38} r={19} fill={COAT.shade} />
        <circle cx={65} cy={39} r={12} fill={COAT.pinkDeep} />

        <path d={BODY} fill={COAT.base} />
        <g clipPath={`url(#${id})`}>
          {/* A luz vem de cima e da esquerda: a barriga e o peito ficam mais claros que o dorso. */}
          <path d="M30,112 C58,96 132,94 172,124 L40,128 Z" fill={COAT.light} />
          {/* A sombra: sob o queixo, atrás da pata da frente, na dobra da anca e na garupa. */}
          <path
            d="M4,98 C18,112 40,121 66,124 L66,132 L0,132 Z"
            fill={COAT.shade}
          />
          <path
            d="M62,126 C52,112 56,96 68,86 C62,102 68,116 82,126 Z"
            fill={COAT.shade}
          />
          <path
            d="M148,126 C138,98 156,72 186,70 C168,82 160,104 168,126 Z"
            fill={COAT.shade}
          />
          <path
            d="M184,50 C208,62 222,88 216,108 C212,120 198,124 180,124 C200,116 208,96 202,78 C198,66 192,56 184,50 Z"
            fill={COAT.shade}
          />
          {/* A sombra da orelha na nuca. */}
          <path
            d="M70,58 C84,66 104,62 112,48 L112,40 L70,44 Z"
            fill={COAT.shade}
          />
        </g>
      </g>
      {/* As patas deste lado. */}
      <ellipse
        cx={68}
        cy={125}
        rx={14}
        ry={6}
        fill={COAT.pink}
        transform={paw(0)}
      />
      <ellipse
        cx={190}
        cy={125.5}
        rx={18}
        ry={6}
        fill={COAT.pink}
        transform={paw(1)}
      />
      <g transform={`translate(0 ${bob})`}>
        {/* A orelha: a borda branca, o rosado e o interior, mais fundo. Gira em volta do pé dela, na cabeça. */}
        <g transform={`rotate(${motion?.ear ?? 0} 86 60)`}>
          <circle cx={88} cy={36} r={25} fill={COAT.light} />
          <circle cx={89} cy={37} r={18} fill={COAT.pink} />
          <path
            d="M80,46 C76,36 82,26 92,26 C100,26 105,33 104,41 C98,34 88,36 80,46 Z"
            fill={COAT.pinkDeep}
          />
        </g>
        {/* O focinho e o bigode, que treme em volta da raiz. */}
        <circle cx={9} cy={96} r={5.5} fill={COAT.pink} />
        <g
          fill="none"
          stroke={COAT.shade}
          strokeWidth={stroke}
          strokeLinecap="round"
          transform={`rotate(${motion?.whisker ?? 0} 23 102)`}
        >
          <path d="M22,98 Q4,86 -16,86" />
          <path d="M22,102 Q2,102 -18,104" />
          <path d="M24,106 Q8,114 -10,120" />
        </g>
        {/* O olho, com o brilho; a pálpebra de quem está com sono; o risco de quem cochila. */}
        {motion?.lid !== undefined ? (
          <>
            <circle cx={EYE.x} cy={EYE.y} r={eye} fill={rat.eye} />
            <circle
              cx={EYE.x - 2.4}
              cy={EYE.y - 2.6}
              r={2.4 * (1 + 0.28 * wide)}
              fill={COAT.light}
            />
            <Eyelid
              lid={motion.lid}
              radius={eye}
              skin={COAT.base}
              line={rat.eye}
              stroke={Math.max(3.4, stroke)}
            />
          </>
        ) : state === "asleep" ? (
          <path
            d={`M${EYE.x - 9},${EYE.y - 1} q9,9 18,0`}
            fill="none"
            stroke={rat.eye}
            strokeWidth={Math.max(3.4, stroke)}
            strokeLinecap="round"
          />
        ) : (
          <>
            <circle cx={EYE.x} cy={EYE.y} r={eye} fill={rat.eye} />
            <circle
              cx={EYE.x - 2.4}
              cy={EYE.y - 2.6}
              r={2.4}
              fill={COAT.light}
            />
            {state === "sleepy" ? (
              <path
                d={`M${EYE.x - EYE.radius - 4},${EYE.y + 1} A${EYE.radius + 4},${EYE.radius + 4} 0 0 1 ${EYE.x + EYE.radius + 4},${EYE.y + 1} Z`}
                fill={COAT.base}
              />
            ) : null}
          </>
        )}
      </g>
    </svg>
  );
};

/**
 * Um rato, de perfil, olhando para a esquerda. É a silhueta de figurante com
 * a orelha rosada; por cima dela vão a pálpebra de quem está com sono e o
 * risco do olho de quem cochila. Com `close`, é o desenho de perto.
 */
export const Rat: React.FC<RatProps> = ({
  width,
  state = "awake",
  close = false,
  motion,
}) => {
  const gone = state === "gone";
  if (close && !gone) {
    return <CloseRat width={width} state={state} motion={motion} />;
  }
  // Quanto a cor já saiu: a silhueta apagada é o fim do caminho, e não uma troca.
  const faded = gone ? 1 : (motion?.gone ?? 0);
  const tone = (from: string) =>
    faded <= 0
      ? from
      : faded >= 1
        ? rat.gone
        : interpolateColors(faded, [0, 1], [from, rat.gone]);
  const lid = motion?.lid;
  const stroke = Math.max(3.4, (MIN_STROKE * VIEW.width) / width);
  return (
    <div style={{ position: "relative", opacity: 1 - 0.4 * faded }}>
      <Silhouette
        kind="mouse"
        width={width}
        color={tone(rat.body)}
        shade={gone ? undefined : tone(rat.ear)}
        eye={
          gone
            ? undefined
            : lid !== undefined || state === "awake" || state === "sleepy"
              ? tone(rat.eye)
              : undefined
        }
      />
      <svg
        width={width}
        height={(width * VIEW.height) / VIEW.width}
        viewBox={`0 0 ${VIEW.width} ${VIEW.height}`}
        overflow="visible"
        style={{ position: "absolute", left: 0, top: 0 }}
      >
        {gone ? null : lid !== undefined ? (
          <Eyelid
            lid={lid}
            radius={EYE.radius}
            skin={tone(rat.body)}
            line={tone(rat.eye)}
            stroke={stroke}
          />
        ) : (
          <>
            {state === "sleepy" ? (
              // A pálpebra é da cor do corpo e cobre a metade de cima do olho.
              <path
                d={`M${EYE.x - EYE.radius - 2},${EYE.y + 1} A${EYE.radius + 2},${EYE.radius + 2} 0 0 1 ${EYE.x + EYE.radius + 2},${EYE.y + 1} Z`}
                fill={rat.body}
              />
            ) : null}
            {state === "asleep" ? (
              <path
                d={`M${EYE.x - 8},${EYE.y - 1} q8,8 16,0`}
                fill="none"
                stroke={rat.eye}
                strokeWidth={stroke}
                strokeLinecap="round"
              />
            ) : null}
          </>
        )}
      </svg>
    </div>
  );
};

type BenchProps = {
  /** O tampo é o chão da sala: sem a frente escura da bancada. */
  readonly floor?: boolean;
};

/** A bancada do laboratório sem o tanque: o tampo e a frente. Como chão, só o tampo. */
const RatBench: React.FC<BenchProps> = ({ floor = false }) => (
  <SvgLayer>
    <rect
      x={-400}
      y={BENCH_Y}
      width={2720}
      height={1500 - BENCH_Y}
      fill={lab.bench}
    />
    <rect x={-400} y={BENCH_Y} width={2720} height={26} fill={lab.benchTop} />
    {floor ? null : (
      <rect
        x={-400}
        y={BENCH_Y + 150}
        width={2720}
        height={600}
        fill={lab.benchShade}
      />
    )}
  </SvgLayer>
);

type PlaqueProps = {
  /** O centro da placa, em pixels do cenário. */
  readonly x: number;
  readonly y: number;
};

/** A placa do laboratório, na parede: texto do mundo, a mesma da porta do gancho, em duas linhas para caber ao lado do aparelho. */
export const LabPlaque: React.FC<PlaqueProps> = ({ x, y }) => (
  <Place x={x} y={y}>
    <div
      style={{
        fontFamily: typography.family,
        fontWeight: 700,
        fontSize: typography.size.note,
        lineHeight: 1.1,
        whiteSpace: "nowrap",
        textAlign: "center",
        color: lab.paper,
        background: lab.clip,
        border: `8px solid ${lab.paper}`,
        borderRadius: 22,
        padding: "0.3em 0.7em",
      }}
    >
      Laboratório do Sono
      <br />
      Chicago
    </div>
  </Place>
);

type RatLabProps = {
  readonly camera: CameraState;
  /** O tampo da bancada vira o chão da sala. */
  readonly floor?: boolean;
  /** O que fica na parede, atrás da bancada: a placa, o calendário, o quadro-negro. */
  readonly wall?: React.ReactNode;
  /**
   * O plano escreve a própria câmera a partir do enquadramento em que o
   * anterior parou, com peso: ele assume o cenário de uma vez, em vez de
   * deixar o palco misturar a câmera herdada com a nova (a mistura do palco
   * começa a toda velocidade). Por padrão, é o palco quem mistura.
   */
  readonly steady?: boolean;
  /**
   * Quantas larguras de quadro a bancada tem: a parede e o tampo se repetem
   * para a direita, e a câmera pode deslizar de um trecho a outro. Por padrão, uma.
   */
  readonly span?: number;
  /** O que está sobre a bancada, em pixels do cenário. */
  readonly children?: React.ReactNode;
};

/** A largura de um trecho da bancada: a do quadro. */
export const BENCH_SPAN = 1920;

/**
 * O molde dos planos de laboratório dos ratos: a parede da água-viva, a
 * bancada sem tanque e a câmera. O que fica por cima do quadro (etiqueta,
 * onomatopeia) é a cena quem põe, depois dele.
 */
export const RatLab: React.FC<RatLabProps> = ({
  camera,
  floor,
  wall,
  steady = false,
  span = 1,
  children,
}) => {
  const stage = useBuild();
  const stretches = Array.from({ length: span }, (_, index) => index);
  return (
    <AbsoluteFill>
      <Build {...stage} takeover={steady ? 1 : stage.takeover}>
        <Camera {...camera}>
          <Layer depth={1}>
            {stretches.map((index) => (
              <AbsoluteFill
                key={index}
                style={{ translate: `${index * BENCH_SPAN}px 0` }}
              >
                <LabWall />
              </AbsoluteFill>
            ))}
            {wall}
            {stretches.map((index) => (
              <AbsoluteFill
                key={index}
                style={{ translate: `${index * BENCH_SPAN}px 0` }}
              >
                <RatBench floor={floor} />
              </AbsoluteFill>
            ))}
            {children}
          </Layer>
        </Camera>
      </Build>
      <Grain />
    </AbsoluteFill>
  );
};

/**
 * O disco, em escala 1: o tampo, a borda, a altura dele sobre a água e a
 * bandeja rasa. O ponto de referência é o meio da base da bandeja, na bancada.
 */
export const DISC = {
  rx: 320,
  ry: 58,
  edge: 24,
  /** Do tampo do disco até a boca da bandeja. */
  lift: 96,
  tray: { rx: 430, ry: 64, depth: 46 },
  /** Comprimento de cada rato e distância de cada um ao centro do disco. */
  rat: 260,
  apart: 150,
};
/** Da base da bandeja até o tampo do disco, em escala 1. */
const DISC_TOP = DISC.tray.depth + DISC.tray.ry + DISC.lift;
// As marcas do tampo: são elas que mostram o giro.
const SPOKES = 6;

type DiscPlacement = {
  /** O meio da base da bandeja, em pixels do cenário. */
  readonly x: number;
  readonly y: number;
  readonly scale?: number;
};

/**
 * Onde cada rato do disco fica no cenário: o meio dos pés e o alto da cabeça.
 * O primeiro (0) é o do teste, à esquerda; o segundo (1), o de comparação.
 */
export const discRatSpot = (
  index: 0 | 1,
  { x, y, scale = 1 }: DiscPlacement,
): { readonly x: number; readonly y: number; readonly top: number } => {
  const feet = y - (DISC_TOP - 14) * scale;
  return {
    x: x + (index === 0 ? -1 : 1) * DISC.apart * scale,
    y: feet,
    top: feet - ((DISC.rat * VIEW.height) / VIEW.width) * scale,
  };
};

/** A pose de um rato do disco, em volta do lugar dele: por padrão, parado no lugar. */
export type DiscRatPose = {
  /** Quanto ele está fora do lugar, em pixels de escala 1: de onde pula, para onde o giro o leva. */
  readonly dx?: number;
  readonly dy?: number;
  /** A inclinação do corpo, em graus, em volta das patas de trás: positivo ergue a frente. */
  readonly tilt?: number;
  /** A altura do corpo, em fração: abaixo de 1 ele se agacha, acima se estica. */
  readonly stretch?: number;
  /** Quanto da sombra dele está no tampo, de 0 a 1: no ar e fora do disco, nenhuma. */
  readonly shadow?: number;
  readonly motion?: RatMotion;
};

type RatDiscProps = DiscPlacement & {
  /** O estado do rato do teste e o do rato de comparação. */
  readonly rats: readonly [RatState, RatState];
  /** Quanto o disco já girou, em voltas. */
  readonly turn?: number;
  /** Quanto o giro já levou os dois na direção da borda, em pixels de escala 1. */
  readonly carried?: number;
  /** Eles andam para ficar em cima: de 0 a 1, o quanto o passo sobe. */
  readonly step?: number;
  readonly seconds: number;
  /** Os ratos de perto, com volume e com a sombra deles no tampo. */
  readonly close?: boolean;
  /** A pose de cada rato; sem valor, parado no lugar. */
  readonly poses?: readonly [DiscRatPose?, DiscRatPose?];
  /** A pausa viva dos dois (bigodes, orelha, cauda, piscada), de 0 a 1. Por padrão, só respiram. */
  readonly alive?: number;
  /**
   * A água da bandeja ondula: a fase das ondas, que cresce com o tempo (um
   * inteiro por onda que nasce), e a força delas, de 0 a 1. Sem valor, parada.
   */
  readonly ripple?: { readonly phase: number; readonly strength: number };
  /** O aparelho sem os ratos: quem os desenha é a cena. Por padrão, com eles. */
  readonly empty?: boolean;
  /** O giro rápido: quanto os riscos de velocidade do tampo aparecem, de 0 a 1. Por padrão, nenhum. */
  readonly streaks?: number;
};

// Os riscos de velocidade: arcos finos na frente do tampo, na direção do giro (atrás, passariam pelo focinho dos ratos).
// O raio (em fração do disco) e o trecho de cada um, em graus.
const STREAK_ARCS = [
  [0.93, 48, 88],
  [0.78, 84, 122],
  [0.93, 112, 146],
  [0.6, 44, 74],
] as const;

// Quantas ondas a água mostra de uma vez, do disco para a borda da bandeja.
const RIPPLES = 3;

/**
 * O aparelho do experimento: um disco sobre uma bandeja rasa de água, com os
 * dois ratos em cima, o do teste e o de comparação. Quando o disco gira, os
 * dois precisam andar para ficar fora da água.
 */
export const RatDisc: React.FC<RatDiscProps> = ({
  x,
  y,
  scale = 1,
  rats,
  turn = 0,
  carried = 0,
  step = 0,
  seconds,
  close = false,
  poses,
  alive = 0,
  ripple,
  empty = false,
  streaks = 0,
}) => {
  const { rx, ry, edge, tray } = DISC;
  // A boca da bandeja e o tampo do disco, a partir da base.
  const mouth = y - tray.depth - tray.ry;
  const top = y - DISC_TOP;
  const angle = turn * Math.PI * 2;

  return (
    <div style={{ scale: `${scale}`, transformOrigin: `${x}px ${y}px` }}>
      <SvgLayer>
        <ellipse
          cx={x}
          cy={y - tray.ry + 10}
          rx={tray.rx * 1.06}
          ry={tray.ry * 0.8}
          fill={lab.contact}
          opacity={0.22}
        />
        {/* A bandeja: a parede, a borda clara e a água rasa. */}
        <ellipse
          cx={x}
          cy={mouth + tray.depth}
          rx={tray.rx}
          ry={tray.ry}
          fill={lab.platformShade}
        />
        <rect
          x={x - tray.rx}
          y={mouth}
          width={tray.rx * 2}
          height={tray.depth}
          fill={lab.platformShade}
        />
        <ellipse
          cx={x}
          cy={mouth}
          rx={tray.rx}
          ry={tray.ry}
          fill={lab.platform}
        />
        <ellipse
          cx={x}
          cy={mouth + 6}
          rx={tray.rx - 22}
          ry={tray.ry - 12}
          fill={lab.water}
        />
        {/* As ondas: anéis claros que nascem sob o disco e morrem na borda da bandeja. */}
        {ripple && ripple.strength > 0
          ? Array.from({ length: RIPPLES }, (_, ring) => {
              const out = (((ripple.phase + ring / RIPPLES) % 1) + 1) % 1;
              return (
                <ellipse
                  key={ring}
                  cx={x}
                  cy={mouth + 6}
                  rx={rx * 0.9 + (tray.rx - 30 - rx * 0.9) * out}
                  ry={ry * 0.68 + (tray.ry - 16 - ry * 0.68) * out}
                  fill="none"
                  stroke={lab.platform}
                  strokeWidth={5}
                  opacity={0.7 * ripple.strength * Math.sin(out * Math.PI)}
                />
              );
            })
          : null}
        {/* A sombra do disco na água. */}
        <ellipse
          cx={x}
          cy={mouth + 4}
          rx={rx * 0.96}
          ry={ry * 0.72}
          fill={lab.waterDeep}
        />
        {/* O eixo, o disco e a borda dele. */}
        <rect
          x={x - 18}
          y={top + edge}
          width={36}
          height={mouth - top - edge + 10}
          fill={researcher.handShade}
        />
        <ellipse
          cx={x}
          cy={top + edge}
          rx={rx}
          ry={ry}
          fill={researcher.handShade}
        />
        <rect
          x={x - rx}
          y={top}
          width={rx * 2}
          height={edge}
          fill={researcher.handShade}
        />
        <ellipse cx={x} cy={top} rx={rx} ry={ry} fill={researcher.hand} />
        <g stroke={researcher.handShade} strokeWidth={7} strokeLinecap="round">
          {Array.from({ length: SPOKES }, (_, spoke) => {
            const at = angle + (spoke * Math.PI * 2) / SPOKES;
            return (
              <line
                key={spoke}
                x1={x + rx * 0.16 * Math.cos(at)}
                y1={top + ry * 0.16 * Math.sin(at)}
                x2={x + rx * 0.9 * Math.cos(at)}
                y2={top + ry * 0.9 * Math.sin(at)}
              />
            );
          })}
        </g>
        <ellipse
          cx={x + rx * 0.76 * Math.cos(angle + 0.5)}
          cy={top + ry * 0.76 * Math.sin(angle + 0.5)}
          rx={24}
          ry={8}
          fill={lab.platform}
        />
        {streaks > 0 ? (
          <g
            fill="none"
            stroke={lab.platform}
            strokeWidth={5}
            strokeLinecap="round"
            opacity={0.85 * streaks}
          >
            {STREAK_ARCS.map(([radius, from, to], arc) => {
              const point = (degrees: number) =>
                `${x + rx * radius * Math.cos((degrees * Math.PI) / 180)},${top + ry * radius * Math.sin((degrees * Math.PI) / 180)}`;
              return (
                <path
                  key={arc}
                  d={`M${point(from)} A${rx * radius},${ry * radius} 0 0 1 ${point(to)}`}
                />
              );
            })}
          </g>
        ) : null}
        {/* De perto, cada rato pousa no tampo com a sombra dele. */}
        {close && !empty
          ? rats.map((state, index) =>
              state === "gone" ? null : (
                <ellipse
                  key={index}
                  cx={
                    x +
                    (index === 0 ? -1 : 1) * DISC.apart +
                    carried +
                    (poses?.[index]?.dx ?? 0) +
                    6
                  }
                  cy={top + 12}
                  rx={DISC.rat * 0.44 * (poses?.[index]?.shadow ?? 1)}
                  ry={11 * (poses?.[index]?.shadow ?? 1)}
                  fill={researcher.handShade}
                  opacity={0.7}
                />
              ),
            )
          : null}
      </SvgLayer>
      {empty
        ? null
        : rats.map((state, index) => {
            const side = index === 0 ? -1 : 1;
            const pose = poses?.[index];
            // Cada um dá o passo no seu tempo: os dois nunca sobem juntos.
            const lift =
              state === "gone"
                ? 0
                : step * 8 * Math.abs(Math.sin(seconds * 9 + index * 1.4));
            const breathing =
              state === "gone"
                ? 1
                : breath(seconds, `disc-rat-${index}`, {
                    amplitude: 0.03,
                    period: 2.4,
                  });
            const motion =
              alive > 0 && state !== "gone"
                ? withIdle(
                    pose?.motion,
                    ratIdle(seconds, `disc-${index}`, alive),
                  )
                : pose?.motion;
            return (
              <Place
                key={index}
                x={x + side * DISC.apart + carried}
                y={top + 14 - lift}
                anchor="bottom"
                style={{
                  // O pulo e o arrasto vão pela transformação: por `left` e `top` ele andaria em degraus de 1 px.
                  translate: `calc(-50% + ${pose?.dx ?? 0}px) calc(-100% + ${pose?.dy ?? 0}px)`,
                  // Ele se ergue e se agacha em volta das patas de trás.
                  transformOrigin: "72% 100%",
                  rotate: `${pose?.tilt ?? 0}deg`,
                  scale: `1 ${breathing * (pose?.stretch ?? 1)}`,
                }}
              >
                <Rat
                  width={DISC.rat}
                  state={state}
                  close={close}
                  motion={motion}
                />
              </Place>
            );
          })}
    </div>
  );
};

/** Os dez ratos impedidos de dormir. */
export const RATS = 10;

type RowLayout = {
  /** O centro da fila e o chão dela, em pixels do cenário. */
  readonly x?: number;
  readonly y: number;
  /** Comprimento de cada rato e distância entre dois vizinhos. */
  readonly width?: number;
  readonly spacing?: number;
  readonly count?: number;
  /** Em duas fileiras desencontradas, a de trás um pouco acima: cabem maiores no quadro. */
  readonly rows?: 1 | 2;
};

/** Onde cada rato da fila fica: o meio dos pés dele. */
export const rowRatSpot = (
  index: number,
  { x = 960, y, width = 170, spacing = 174, count = RATS, rows = 1 }: RowLayout,
): { readonly x: number; readonly y: number } => {
  if (rows === 1) {
    return { x: x + (index - (count - 1) / 2) * spacing, y };
  }
  const perRow = Math.ceil(count / 2);
  const back = index < perRow;
  const place = back ? index : index - perRow;
  return {
    x:
      x +
      (place - (perRow - 1) / 2) * spacing +
      (back ? spacing / 4 : -spacing / 4),
    y: back ? y - width * 0.4 : y,
  };
};

type RatRowProps = RowLayout & {
  readonly state: (index: number) => RatState;
  readonly seconds: number;
  /** Eles olham para cima: o corpo se ergue pela frente, nestes graus. */
  readonly lookUp?: number;
  /** Poucos ratos, de perto: cada um com volume. */
  readonly close?: boolean;
  /** A pausa viva de cada um (farejar, piscar; de perto, bigodes, orelha e cauda), de 0 a 1. Por padrão, só respiram. */
  readonly alive?: number;
  /** Quanto de `lookUp` cada rato já fez, de 0 a 1 (pode passar de 1, na sobra). Por padrão, 1. */
  readonly raised?: (index: number) => number;
  /** Quanto cada rato baixou a cabeça, de 0 a 1: o corpo cede pela frente e achata um pouco. */
  readonly bowed?: (index: number) => number;
  /** Quanto de cada rato já entrou, em escala a partir das patas: 0 fora, 1 no lugar. Por padrão, 1. */
  readonly present?: (index: number) => number;
  /** O movimento de cada rato, além do `state`. */
  readonly motion?: (index: number) => RatMotion | undefined;
  /** Uma semente para as fases: filas diferentes não respiram juntas. */
  readonly seed?: string;
};

// A cabeça baixa: quanto o corpo cede pela frente, em graus, e quanto achata.
const BOW = { degrees: 7, squash: 0.18 };

/**
 * Ratos em fila sobre a bancada, sem disco: os dez impedidos de dormir, ou os
 * de comparação. Cada um respira no seu tempo; quem saiu do experimento fica
 * parado, em silhueta.
 */
export const RatRow: React.FC<RatRowProps> = ({
  state,
  seconds,
  lookUp = 0,
  close = false,
  alive = 0,
  raised,
  bowed,
  present,
  motion,
  seed = "row-rat",
  ...layout
}) => {
  const { width = 170, count = RATS } = layout;
  const spots = Array.from({ length: count }, (_, index) =>
    rowRatSpot(index, layout),
  );

  return (
    <>
      <SvgLayer>
        {spots.map((spot, index) => (
          <ellipse
            key={index}
            cx={spot.x}
            cy={spot.y + 2}
            rx={width * 0.46 * Math.min(1, present?.(index) ?? 1)}
            ry={width * 0.07 * Math.min(1, present?.(index) ?? 1)}
            fill={lab.contact}
            opacity={0.22}
          />
        ))}
      </SvgLayer>
      {spots.map((spot, index) => {
        const mood = state(index);
        const own = motion?.(index);
        // Quem perde a cor vai parando: a respiração e o farejar morrem com ela.
        const living = mood === "gone" ? 0 : 1 - (own?.gone ?? 0);
        const bow = bowed?.(index) ?? 0;
        const idle = ratIdle(seconds, `${seed}-${index}`, alive * living);
        // Na silhueta não há bigode: farejar é o focinho que sobe e desce um nada.
        const sniff = close ? 0 : 0.14 * idle.whisker;
        const breathing = breath(seconds, `${seed}-${index}`, {
          amplitude: 0.03 * living,
          period: 2.4,
        });
        return (
          <Place
            key={index}
            x={spot.x}
            y={spot.y}
            anchor="bottom"
            style={{
              // O rato se ergue em volta das patas de trás.
              transformOrigin: "72% 100%",
              rotate: `${lookUp * (raised?.(index) ?? 1) * (mood === "gone" ? 0 : 1) + sniff - BOW.degrees * bow}deg`,
              scale: `${present?.(index) ?? 1} ${(present?.(index) ?? 1) * breathing * (1 - BOW.squash * bow)}`,
            }}
          >
            <Rat
              width={width}
              state={mood}
              close={close}
              motion={alive > 0 && mood !== "gone" ? withIdle(own, idle) : own}
            />
          </Place>
        );
      })}
    </>
  );
};
