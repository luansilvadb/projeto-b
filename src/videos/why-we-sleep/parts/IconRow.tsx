import "../../../design/fonts";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { Brain } from "../../../art/Brain";
import { taperPath } from "../../../art/shapes";
import { POP_SECONDS, popOpacity, popScale } from "../../../components/Pop";
import { typography } from "../../../design/tokens";
import {
  alarmClock,
  chalkboard,
  idea,
  ink,
  inside,
  lagoon,
  savanna,
  shop,
  signs,
  street,
} from "../palette";
import { Tag } from "./Tag";

/**
 * A fila dos cinco ícones: o mapa do vídeo (art.md, oitava versão). Entra em
 * `five-parts` e volta em cada virada, com o ícone vencido marcado e o
 * seguinte aceso. Não é cartela: não leva título.
 */

/** Os cinco ícones, na ordem da fila. */
export type IconKey = "eyes" | "ruler" | "brain" | "alarm" | "shop";
export const ICONS: readonly IconKey[] = [
  "eyes",
  "ruler",
  "brain",
  "alarm",
  "shop",
];

/**
 * O estado de um ícone: apagado; aceso (a parte em curso); com visto (parte
 * vencida, continua colorido); com X (o jeito que falhou: apaga e é riscado).
 */
export type IconState = "off" | "on" | "check" | "cross";

/** O número que a fala dá aos três do meio: "o primeiro jeito", "o segundo", "o terceiro". */
const NUMBERS: Partial<Record<IconKey, string>> = {
  ruler: "1",
  brain: "2",
  alarm: "3",
};

/** Diâmetro de um ícone e distância entre os centros de dois vizinhos, com a fila em escala 1. */
export const ICON_SIZE = 220;
export const ICON_PITCH = 280;
// A pílula do número fica logo abaixo do ícone.
const PILL_DROP = ICON_SIZE / 2 + 54;

type Hue = keyof typeof idea;

type RowPlacement = {
  /** O centro da fila (o centro do ícone do meio), em pixels do quadro. Padrão: o centro do quadro. */
  readonly x?: number;
  readonly y?: number;
  /** Escala da fila inteira; 1 dá 1340 px de ponta a ponta. */
  readonly scale?: number;
};

/**
 * Onde um ícone fica no quadro, para a fila posta em (x, y) com a escala
 * dada: o centro e o diâmetro dele. É o que a virada usa para fazer o ícone
 * "crescer" e virar o primeiro plano da parte seguinte, partindo do lugar
 * exato em que ele estava na fila.
 */
export const iconSpot = (
  icon: IconKey,
  { x = 960, y = 540, scale = 1 }: RowPlacement = {},
): { readonly x: number; readonly y: number; readonly size: number } => ({
  x: x + (ICONS.indexOf(icon) - 2) * ICON_PITCH * scale,
  y,
  size: ICON_SIZE * scale,
});

type Paint = (lit: string, role?: "shape" | "detail") => string;

// O disco de cada ícone aceso: escuro para o que acontece de noite, claro para o que é medida.
const DISC: Record<IconKey, string> = {
  eyes: savanna.night.sky[0],
  ruler: ink.paper,
  brain: inside.background[0],
  alarm: idea.peach.spot,
  shop: street.night.sky[0],
};

// O capim do primeiro ícone: x da base, altura e inclinação de cada folha; as de trás e as da frente.
const BACK_BLADES = [
  [-92, 118, -16],
  [-64, 150, 6],
  [-34, 132, -8],
  [-2, 158, 10],
  [30, 136, -6],
  [60, 152, 12],
  [90, 120, -10],
] as const;
const FRONT_BLADES = [
  [-80, 78, -14],
  [-48, 96, 10],
  [-16, 70, -8],
  [16, 92, 8],
  [48, 74, -10],
  [80, 88, 14],
] as const;

/** Dois olhos no capim: os mesmos que acendem atrás do bicho em `last-to-know`. */
const eyesIcon = (paint: Paint) => (
  <>
    {BACK_BLADES.map(([x, height, lean]) => (
      <path
        key={x}
        d={taperPath(
          [x, 110],
          [x - lean / 2, 110 - height * 0.5],
          [x + lean, 110 - height],
          26,
          5,
        )}
        fill={paint(savanna.night.ground[0])}
      />
    ))}
    {[-30, 30].map((x) => (
      <ellipse
        key={x}
        cx={x}
        cy={-6}
        rx={19}
        ry={12}
        fill={paint(ink.moon, "detail")}
      />
    ))}
    {FRONT_BLADES.map(([x, height, lean]) => (
      <path
        key={x}
        d={taperPath(
          [x, 110],
          [x - lean / 2, 110 - height * 0.5],
          [x + lean, 110 - height],
          30,
          6,
        )}
        fill={paint(lagoon.night.sand[0], "detail")}
      />
    ))}
  </>
);

/** A régua de horas, com a barra do sono encolhida sobre a sombra da barra inteira. */
const rulerIcon = (paint: Paint) => (
  <>
    <rect
      x={-66}
      y={-34}
      width={132}
      height={34}
      rx={17}
      fill={paint(ink.tag)}
      opacity={0.3}
    />
    <rect
      x={-66}
      y={-34}
      width={54}
      height={34}
      rx={17}
      fill={paint(ink.tag)}
    />
    <g stroke={paint(ink.dark)} strokeWidth={7} strokeLinecap="round">
      <line x1={-66} y1={22} x2={66} y2={22} />
      {[0, 1, 2, 3, 4, 5, 6].map((tick) => (
        <line
          key={tick}
          x1={-66 + tick * 22}
          y1={22}
          x2={-66 + tick * 22}
          y2={tick % 3 === 0 ? 50 : 38}
        />
      ))}
    </g>
  </>
);

/** O contorno tracejado de um cérebro: o lugar do cérebro que não está lá. */
const brainIcon = (paint: Paint) => (
  <g transform="translate(-74 -62)">
    <Brain width={148} color={paint(ink.glow, "detail")} dashed folds />
  </g>
);

/** O despertador; aceso, toca: os riscos saem das campainhas. */
const alarmIcon = (paint: Paint, lit: boolean) => (
  // Encolhido para os riscos do toque caberem dentro do disco.
  <g transform="scale(0.82)">
    {[-1, 1].map((side) => (
      <g key={side}>
        <rect
          x={side * 34 - 7}
          y={36}
          width={14}
          height={30}
          rx={7}
          fill={paint(alarmClock.bell)}
          transform={`rotate(${-side * 24} ${side * 34} 40)`}
        />
        <circle cx={side * 40} cy={-46} r={22} fill={paint(alarmClock.bell)} />
        {lit ? (
          <path
            d={`M${side * 74},-70 L${side * 88},-80 M${side * 80},-48 L${side * 96},-50`}
            stroke={alarmClock.bell}
            strokeWidth={7}
            strokeLinecap="round"
          />
        ) : null}
      </g>
    ))}
    <circle cy={4} r={56} fill={paint(alarmClock.body)} />
    <circle cy={4} r={42} fill={paint(alarmClock.face, "detail")} />
    <path
      d="M0,4 L0,-22 M0,4 L18,14"
      fill="none"
      stroke={paint(alarmClock.hand)}
      strokeWidth={8}
      strokeLinecap="round"
    />
  </g>
);

/** A porta de enrolar de uma loja, baixada, com o toldo por cima e a luz saindo por baixo. */
const shopIcon = (paint: Paint) => (
  <>
    <rect
      x={-70}
      y={-50}
      width={140}
      height={122}
      rx={8}
      fill={paint(shop.night.wall)}
    />
    <rect
      x={-54}
      y={-34}
      width={108}
      height={98}
      rx={6}
      fill={paint(shop.night.shutter, "detail")}
    />
    {[0, 1, 2, 3, 4].map((line) => (
      <rect
        key={line}
        x={-54}
        y={-20 + line * 18}
        width={108}
        height={6}
        fill={paint(shop.night.shutterLine)}
      />
    ))}
    <rect x={-54} y={64} width={108} height={8} fill={paint(shop.night.lamp)} />
    {[0, 1, 2, 3, 4].map((stripe) => (
      <rect
        key={stripe}
        x={-80 + stripe * 32}
        y={-72}
        width={32}
        height={30}
        fill={paint(
          shop.night.awning[stripe % 2],
          stripe % 2 === 0 ? "shape" : "detail",
        )}
      />
    ))}
  </>
);

type MapIconProps = {
  readonly icon: IconKey;
  readonly state?: IconState;
  /** Diâmetro do ícone, em pixels do quadro. */
  readonly size: number;
  /** O matiz do fundo liso em que o ícone está: dá a cor do ícone apagado. */
  readonly hue: Hue;
  /** Quanto da marca (visto, X, interrogação) já entrou, de 0 a 1. */
  readonly mark?: number;
  /** A interrogação sobre a porta da loja: o que o sono faz ainda é pergunta. */
  readonly question?: boolean;
};

/**
 * Um ícone do mapa, sozinho: é o mesmo desenho da fila, para a cena da virada
 * poder fazê-lo crescer a partir de `iconSpot`.
 */
export const MapIcon: React.FC<MapIconProps> = ({
  icon,
  state = "off",
  size,
  hue,
  mark = 1,
  question = false,
}) => {
  const lit = state === "on" || state === "check";
  const dim = idea[hue];
  // Apagado, o ícone é a própria silhueta em dois tons do fundo.
  const paint: Paint = (color, role = "shape") =>
    lit ? color : role === "shape" ? dim.contact : dim.spot;
  const clip = `map-icon-${icon}-${hue}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="-110 -110 220 220"
      overflow="visible"
    >
      <clipPath id={clip}>
        <circle r={100} />
      </clipPath>
      {/* O anel claro é o que diz "aceso" antes de qualquer cor. */}
      {state === "on" ? <circle r={110} fill={ink.ring} /> : null}
      <circle
        r={100}
        fill={lit ? DISC[icon] : dim.contact}
        opacity={lit ? 1 : 0.24}
      />
      <g clipPath={`url(#${clip})`} opacity={lit ? 1 : 0.5}>
        {icon === "eyes" ? eyesIcon(paint) : null}
        {icon === "ruler" ? rulerIcon(paint) : null}
        {icon === "brain" ? brainIcon(paint) : null}
        {icon === "alarm" ? alarmIcon(paint, lit) : null}
        {icon === "shop" ? shopIcon(paint) : null}
      </g>
      {question && icon === "shop" ? (
        <text
          y={52}
          textAnchor="middle"
          fontFamily={typography.family}
          fontWeight={typography.weight}
          fontSize={typography.size.display * 0.9}
          fill={ink.moon}
          stroke={street.night.sky[1]}
          strokeWidth={10}
          paintOrder="stroke fill"
          opacity={mark}
        >
          ?
        </text>
      ) : null}
      {state === "check" ? (
        <g transform={`translate(70 70) scale(${mark})`}>
          <circle r={44} fill={ink.ring} />
          <circle r={36} fill={signs.seal[1]} />
          <path
            d="M-17,1 L-5,14 L18,-13"
            fill="none"
            stroke={ink.ring}
            strokeWidth={10}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      ) : null}
      {state === "cross" ? (
        <g
          transform={`scale(${mark})`}
          fill="none"
          strokeLinecap="round"
          opacity={mark > 0 ? 1 : 0}
        >
          <path
            d="M-62,-62 L62,62 M62,-62 L-62,62"
            stroke={ink.ring}
            strokeWidth={34}
          />
          <path
            d="M-62,-62 L62,62 M62,-62 L-62,62"
            stroke={chalkboard.stamp}
            strokeWidth={20}
          />
        </g>
      ) : null}
    </svg>
  );
};

type IconRowProps = RowPlacement & {
  /** O matiz do fundo liso do plano. */
  readonly hue: Hue;
  /** O estado de cada ícone; quem não aparece aqui fica apagado. */
  readonly states?: Partial<Record<IconKey, IconState>>;
  /**
   * O quadro do plano em que o ícone passou ao estado atual: ele dá um pulo
   * pequeno e a marca dele (visto, X) entra com sobra. Sem valor, o estado já
   * estava assim quando o plano começou.
   */
  readonly since?: Partial<Record<IconKey, number>>;
  /** Quanto cada ícone cresce em relação aos vizinhos; 1 é o tamanho da fila. */
  readonly grow?: Partial<Record<IconKey, number>>;
  /** A interrogação sobre a porta da loja, e o quadro do plano em que ela entra. */
  readonly question?: boolean;
  readonly questionAt?: number;
  /** Ícones que a fila não desenha: a cena os desenha por conta própria, com `MapIcon`, para fazê-los crescer. */
  readonly omit?: readonly IconKey[];
};

/**
 * A fila inteira, posta num ponto do quadro e numa escala: grande no centro,
 * ou pequena no alto. As pílulas "1", "2" e "3" ficam sob os três do meio e
 * acompanham o estado do ícone.
 */
export const IconRow: React.FC<IconRowProps> = ({
  x = 960,
  y = 540,
  scale = 1,
  hue,
  states = {},
  since = {},
  grow = {},
  question = false,
  questionAt,
  omit = [],
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const frames = POP_SECONDS * fps;

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        scale: `${scale}`,
        transformOrigin: "0 0",
      }}
    >
      {ICONS.filter((icon) => !omit.includes(icon)).map((icon) => {
        const state = states[icon] ?? "off";
        const at = since[icon];
        const changed = at !== undefined && frame >= at;
        // A marca entra no quadro da mudança; antes dele, o ícone ainda está no estado anterior, que é a cena quem passa.
        const mark =
          at === undefined
            ? 1
            : popOpacity(frame, at, frames) *
              popScale(frame, at, frames, 0.4, 1.2);
        const asked =
          questionAt === undefined
            ? 1
            : popOpacity(frame, questionAt, frames) *
              popScale(frame, questionAt, frames, 0.4, 1.2);
        const number = NUMBERS[icon];
        const offset = (ICONS.indexOf(icon) - 2) * ICON_PITCH;
        const size = grow[icon] ?? 1;
        return (
          <div key={icon}>
            <div
              style={{
                position: "absolute",
                left: offset,
                top: 0,
                translate: "-50% -50%",
                scale: `${size * (changed ? popScale(frame, at, frames, 0.9, 1.08) : 1)}`,
              }}
            >
              <MapIcon
                icon={icon}
                state={state}
                size={ICON_SIZE}
                hue={hue}
                mark={icon === "shop" && question ? asked : mark}
                question={question}
              />
            </div>
            {number ? (
              <div
                style={{
                  position: "absolute",
                  left: offset,
                  top: PILL_DROP + (ICON_SIZE * (size - 1)) / 2,
                  translate: "-50% -50%",
                  opacity: state === "off" || state === "cross" ? 0.5 : 1,
                }}
              >
                <Tag on={hue} size="note">
                  {number}
                </Tag>
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
};
