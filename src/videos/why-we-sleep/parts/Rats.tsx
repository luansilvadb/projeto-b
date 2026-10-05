import "../../../design/fonts";
import { useId } from "react";
import { AbsoluteFill } from "remotion";
import { taperPath } from "../../../art/shapes";
import { Silhouette } from "../../../art/Silhouettes";
import { Camera, Layer, type CameraState } from "../../../components/Camera";
import { Grain } from "../../../components/Grain";
import { breath } from "../../../components/Idle";
import { Place } from "../../../components/Place";
import { SvgLayer } from "../../../components/SvgLayer";
import { typography } from "../../../design/tokens";
import { elephant, lab, rat, researcher } from "../palette";
import { BENCH_Y, LabWall } from "./Laboratory";

/**
 * Os ratos do experimento de Rechtschaffen (art.md): brancos, de orelha
 * rosada, em silhueta com olho; nos closes, o mesmo rato com volume
 * (`close`). Quem sai do experimento vira silhueta
 * apagada; nenhum rato é desenhado em sofrimento. Aqui ficam o rato, o disco
 * sobre a bandeja de água com os dois ratos em cima, a fila dos dez e o
 * laboratório sem tanque em que eles aparecem.
 */

/** De olho aberto, com a pálpebra a meio, cochilando, ou já fora do experimento: só a silhueta. */
export type RatState = "awake" | "sleepy" | "asleep" | "gone";

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
};

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
};

/** O rato de perto: as mesmas proporções da silhueta, construído em formas empilhadas. */
const CloseRat: React.FC<CloseRatProps> = ({ width, state }) => {
  const id = useId();
  // Nenhum traço com menos de 4 px no quadro: o bigode e o olho fechado engrossam nos ratos menores.
  const stroke = Math.max(2.4, (MIN_STROKE * VIEW.width) / width);
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
      {/* A cauda, em tubo que afina, com a sombra por baixo. */}
      <path
        d={taperPath(TAIL.from, TAIL.bend, TAIL.to, 15, 6)}
        fill={COAT.pinkDeep}
        transform="translate(1.5 3.5)"
      />
      <path
        d={taperPath(TAIL.from, TAIL.bend, TAIL.to, 14, 5)}
        fill={COAT.pink}
      />
      {/* As patas do outro lado e a orelha de trás, mais escuras. */}
      <ellipse cx={92} cy={124} rx={12} ry={5.5} fill={COAT.pinkDeep} />
      <ellipse cx={160} cy={124.5} rx={15} ry={5.5} fill={COAT.pinkDeep} />
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
      {/* As patas deste lado. */}
      <ellipse cx={68} cy={125} rx={14} ry={6} fill={COAT.pink} />
      <ellipse cx={190} cy={125.5} rx={18} ry={6} fill={COAT.pink} />
      {/* A orelha: a borda branca, o rosado e o interior, mais fundo. */}
      <circle cx={88} cy={36} r={25} fill={COAT.light} />
      <circle cx={89} cy={37} r={18} fill={COAT.pink} />
      <path
        d="M80,46 C76,36 82,26 92,26 C100,26 105,33 104,41 C98,34 88,36 80,46 Z"
        fill={COAT.pinkDeep}
      />
      {/* O focinho e o bigode. */}
      <circle cx={9} cy={96} r={5.5} fill={COAT.pink} />
      <g
        fill="none"
        stroke={COAT.shade}
        strokeWidth={stroke}
        strokeLinecap="round"
      >
        <path d="M22,98 Q4,86 -16,86" />
        <path d="M22,102 Q2,102 -18,104" />
        <path d="M24,106 Q8,114 -10,120" />
      </g>
      {/* O olho, com o brilho; a pálpebra de quem está com sono; o risco de quem cochila. */}
      {state === "asleep" ? (
        <path
          d={`M${EYE.x - 9},${EYE.y - 1} q9,9 18,0`}
          fill="none"
          stroke={rat.eye}
          strokeWidth={Math.max(3.4, stroke)}
          strokeLinecap="round"
        />
      ) : (
        <>
          <circle cx={EYE.x} cy={EYE.y} r={EYE.radius + 1.5} fill={rat.eye} />
          <circle cx={EYE.x - 2.4} cy={EYE.y - 2.6} r={2.4} fill={COAT.light} />
          {state === "sleepy" ? (
            <path
              d={`M${EYE.x - EYE.radius - 4},${EYE.y + 1} A${EYE.radius + 4},${EYE.radius + 4} 0 0 1 ${EYE.x + EYE.radius + 4},${EYE.y + 1} Z`}
              fill={COAT.base}
            />
          ) : null}
        </>
      )}
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
}) => {
  const gone = state === "gone";
  if (close && !gone) {
    return <CloseRat width={width} state={state} />;
  }
  return (
    <div style={{ position: "relative", opacity: gone ? 0.6 : 1 }}>
      <Silhouette
        kind="mouse"
        width={width}
        color={gone ? rat.gone : rat.body}
        shade={gone ? undefined : rat.ear}
        eye={state === "awake" || state === "sleepy" ? rat.eye : undefined}
      />
      <svg
        width={width}
        height={(width * VIEW.height) / VIEW.width}
        viewBox={`0 0 ${VIEW.width} ${VIEW.height}`}
        overflow="visible"
        style={{ position: "absolute", left: 0, top: 0 }}
      >
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
            strokeWidth={Math.max(3.4, (MIN_STROKE * VIEW.width) / width)}
            strokeLinecap="round"
          />
        ) : null}
      </svg>
    </div>
  );
};

type BenchProps = {
  /** O tampo é o chão da sala: sem a frente escura da bancada. */
  readonly floor?: boolean;
};

/** A bancada do laboratório sem o tanque: o tampo e a frente. Como chão, só o tampo. */
export const RatBench: React.FC<BenchProps> = ({ floor = false }) => (
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
  /** O que está sobre a bancada, em pixels do cenário. */
  readonly children?: React.ReactNode;
};

/**
 * O molde dos planos de laboratório dos ratos: a parede da água-viva, a
 * bancada sem tanque e a câmera. O que fica por cima do quadro (etiqueta,
 * onomatopeia) é a cena quem põe, depois dele.
 */
export const RatLab: React.FC<RatLabProps> = ({
  camera,
  floor,
  wall,
  children,
}) => (
  <AbsoluteFill>
    <Camera {...camera}>
      <Layer depth={1}>
        <LabWall />
        {wall}
        <RatBench floor={floor} />
        {children}
      </Layer>
    </Camera>
    <Grain />
  </AbsoluteFill>
);

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
export const DISC_TOP = DISC.tray.depth + DISC.tray.ry + DISC.lift;
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
};

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
        {/* De perto, cada rato pousa no tampo com a sombra dele. */}
        {close
          ? rats.map((state, index) =>
              state === "gone" ? null : (
                <ellipse
                  key={index}
                  cx={x + (index === 0 ? -1 : 1) * DISC.apart + carried + 6}
                  cy={top + 12}
                  rx={DISC.rat * 0.44}
                  ry={11}
                  fill={researcher.handShade}
                  opacity={0.7}
                />
              ),
            )
          : null}
      </SvgLayer>
      {rats.map((state, index) => {
        const side = index === 0 ? -1 : 1;
        // Cada um dá o passo no seu tempo: os dois nunca sobem juntos.
        const lift =
          state === "gone"
            ? 0
            : step * 8 * Math.abs(Math.sin(seconds * 9 + index * 1.4));
        return (
          <Place
            key={index}
            x={x + side * DISC.apart + carried}
            y={top + 14 - lift}
            anchor="bottom"
            style={{
              scale: `1 ${state === "gone" ? 1 : breath(seconds, `disc-rat-${index}`, { amplitude: 0.03, period: 2.4 })}`,
            }}
          >
            <Rat width={DISC.rat} state={state} close={close} />
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
};

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
            rx={width * 0.46}
            ry={width * 0.07}
            fill={lab.contact}
            opacity={0.22}
          />
        ))}
      </SvgLayer>
      {spots.map((spot, index) => {
        const mood = state(index);
        return (
          <Place
            key={index}
            x={spot.x}
            y={spot.y}
            anchor="bottom"
            style={{
              // O rato se ergue em volta das patas de trás.
              transformOrigin: "72% 100%",
              rotate: `${mood === "gone" ? 0 : lookUp}deg`,
              scale: `1 ${mood === "gone" ? 1 : breath(seconds, `row-rat-${index}`, { amplitude: 0.03, period: 2.4 })}`,
            }}
          >
            <Rat width={width} state={mood} close={close} />
          </Place>
        );
      })}
    </>
  );
};
