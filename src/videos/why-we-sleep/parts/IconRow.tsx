import "../../../design/fonts";
import {
  Easing,
  interpolate,
  interpolateColors,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Brain } from "../../../art/Brain";
import { taperPath } from "../../../art/shapes";
import { wave } from "../../../components/Idle";
import { POP_SECONDS, popOpacity, popScale } from "../../../components/Pop";
import { typography } from "../../../design/tokens";
import {
  alarmClock,
  chalkboard,
  idea,
  ink,
  inside,
  lagoon,
  daylightTones,
  shop,
  signs,
  street,
} from "../palette";
import { Tag } from "./Tag";
import { clamp01, clamp } from "../../../components/timing";

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
const ICON_SIZE = 220;
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

/**
 * O movimento de dentro de um ícone. Sem valores, o ícone é o desenho parado
 * de sempre: é o que as cenas que não animam a fila recebem.
 */
export type IconMotion = {
  /** O capim dos olhos balança: o instante, em segundos, e quanto (0 parado, 1 o balanço inteiro). */
  readonly sway?: { readonly seconds: number; readonly amount: number };
  /** Quanto os olhos no capim estão fechados, de 0 a 1: a piscada. */
  readonly eyelid?: number;
  /** Quanto a barra da régua já encolheu, de 0 (inteira) a 1 (curta, como no desenho parado). */
  readonly bar?: number;
};

// O disco de cada ícone aceso: escuro para o que acontece de noite, claro para o que é medida.
const DISC: Record<IconKey, string> = {
  eyes: daylightTones.night.sky[0],
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
const eyesIcon = (paint: Paint, { sway, eyelid = 0 }: IconMotion) => {
  // Cada folha tem a própria fase; as da frente balançam um pouco mais que as de trás.
  const bend = (index: number, reach: number) =>
    sway ? reach * sway.amount * wave(sway.seconds, 3.2, index / 5) : 0;
  return (
    <>
      {BACK_BLADES.map(([x, height, lean], index) => (
        <path
          key={x}
          d={taperPath(
            [x, 110],
            [x - lean / 2, 110 - height * 0.5],
            [x + lean + bend(index, 7), 110 - height],
            26,
            5,
          )}
          fill={paint(daylightTones.night.ground[0])}
        />
      ))}
      {[-30, 30].map((x) => (
        <ellipse
          key={x}
          cx={x}
          cy={-6}
          rx={19}
          ry={12 * (1 - 0.9 * eyelid)}
          fill={paint(ink.moon, "detail")}
        />
      ))}
      {FRONT_BLADES.map(([x, height, lean], index) => (
        <path
          key={x}
          d={taperPath(
            [x, 110],
            [x - lean / 2, 110 - height * 0.5],
            [x + lean + bend(index + 2, 10), 110 - height],
            30,
            6,
          )}
          fill={paint(lagoon.night.sand[0], "detail")}
        />
      ))}
    </>
  );
};

/** A régua de horas, com a barra do sono encolhida sobre a sombra da barra inteira. */
const rulerIcon = (paint: Paint, { bar = 1 }: IconMotion) => (
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
      width={132 - 78 * bar}
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
  /** O movimento de dentro do ícone; sem valor, o desenho parado. */
  readonly motion?: IconMotion;
  /**
   * O fundo liso está a caminho de outro matiz: o de que ele vem e quanto do
   * atual já tomou o lugar, de 0 a 1. O ícone apagado é feito da cor do fundo,
   * e passa de uma à outra junto com ele. Sem valor, a cor é a de `hue`.
   */
  readonly tint?: HueTint;
  /**
   * A interrogação estourando: a escala e a opacidade dela. Sem valor, ela
   * está no tamanho final, com a opacidade de `mark`.
   */
  readonly asked?: { readonly scale: number; readonly opacity: number };
};

/** O matiz de que o fundo vem, e quanto do matiz atual já tomou o lugar. */
type HueTint = { readonly from: Hue; readonly progress: number };

// A interrogação estoura de 0,7 a 1,08 e assenta, em volta do meio dela.
const QUESTION = { from: 0.7, overshoot: 1.08, y: 22 };

/**
 * A entrada da interrogação num instante: cresce, passa do tamanho e assenta.
 * A curva desacelera sem chegar de uma vez, para o crescimento ser visto; a
 * opacidade só acompanha os primeiros quadros.
 */
export const questionPop = (frame: number, at: number, frames: number) => ({
  scale: interpolate(
    frame,
    [at, at + frames * 0.65, at + frames],
    [QUESTION.from, QUESTION.overshoot, 1],
    {
      ...clamp,
      easing: Easing.out(Easing.quad),
    },
  ),
  opacity: popOpacity(frame, at, frames),
});

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
  motion = {},
  tint,
  asked,
}) => {
  const lit = state === "on" || state === "check";
  const dim =
    tint && tint.progress < 1
      ? {
          contact: interpolateColors(
            tint.progress,
            [0, 1],
            [idea[tint.from].contact, idea[hue].contact],
          ),
          spot: interpolateColors(
            tint.progress,
            [0, 1],
            [idea[tint.from].spot, idea[hue].spot],
          ),
        }
      : idea[hue];
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
        {icon === "eyes" ? eyesIcon(paint, motion) : null}
        {icon === "ruler" ? rulerIcon(paint, motion) : null}
        {icon === "brain" ? brainIcon(paint) : null}
        {icon === "alarm" ? alarmIcon(paint, lit) : null}
        {icon === "shop" ? shopIcon(paint) : null}
      </g>
      {question && icon === "shop" ? (
        <text
          y={52}
          transform={`translate(0 ${QUESTION.y}) scale(${asked?.scale ?? 1}) translate(0 ${-QUESTION.y})`}
          textAnchor="middle"
          fontFamily={typography.family}
          fontWeight={typography.weight}
          fontSize={typography.size.display * 0.9}
          fill={ink.moon}
          stroke={street.night.sky[1]}
          strokeWidth={10}
          paintOrder="stroke fill"
          opacity={asked?.opacity ?? mark}
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
  /**
   * Quanto de cada ícone está na fila, de 0 (ainda não entrou, ou já saiu) a
   * 1: a escala dele e da pílula dele, em volta do próprio ponto. É por aqui
   * que a fila entra em cascata e sai encolhendo. Sem valor, o ícone está lá.
   */
  readonly present?: Partial<Record<IconKey, number>>;
  /**
   * O ícone a meio caminho entre dois estados: o estado de que ele vem e
   * quanto do estado atual já tomou o lugar, de 0 a 1. A cor passa de um ao
   * outro em vez de trocar num quadro só. Sem valor, o estado é o atual.
   */
  readonly turning?: Partial<
    Record<IconKey, { readonly from: IconState; readonly progress: number }>
  >;
  /** A inclinação de cada ícone, em graus: o contorno que treme, o despertador que chacoalha. */
  readonly tilt?: Partial<Record<IconKey, number>>;
  /** O movimento de dentro de cada ícone. */
  readonly motion?: Partial<Record<IconKey, IconMotion>>;
  /**
   * Quanto cada ícone sobe (negativo) ou desce, em pixels da fila: a flutuação
   * de quem está parado. A pílula do número vai junto. Sem valor, fica no lugar.
   */
  readonly lift?: Partial<Record<IconKey, number>>;
  /** O fundo a caminho de outro matiz: os ícones apagados e as pílulas mudam de cor junto com ele. */
  readonly tint?: HueTint;
};

// A pílula do número é mais apagada sob o ícone apagado ou riscado.
const pillOpacity = (state: IconState) =>
  state === "off" || state === "cross" ? 0.5 : 1;

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
  present = {},
  turning = {},
  tilt = {},
  motion = {},
  lift = {},
  tint,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const frames = POP_SECONDS * fps;

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        // A fila deriva devagar com a câmera do plano. Posta por `left` e `top`, ela
        // caía em pixel inteiro e andava em degraus de 1 px; pela transformação, não.
        translate: `${x}px ${y}px`,
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
            ? undefined
            : questionPop(frame, questionAt, frames);
        const turningHue = tint !== undefined && tint.progress < 1;
        const number = NUMBERS[icon];
        const offset = (ICONS.indexOf(icon) - 2) * ICON_PITCH;
        const size = grow[icon] ?? 1;
        const here = present[icon] ?? 1;
        const raised = lift[icon] ?? 0;
        const turn = turning[icon];
        const arrived = turn ? clamp01(turn.progress) : 1;
        const drawn = (
          <MapIcon
            icon={icon}
            state={state}
            size={ICON_SIZE}
            hue={hue}
            mark={mark}
            question={question}
            asked={asked}
            motion={motion[icon]}
            tint={tint}
          />
        );
        return (
          <div key={icon}>
            <div
              style={{
                position: "absolute",
                left: offset,
                top: 0,
                // A flutuação vai pela transformação, e não por `top`: a posição de
                // layout cai em pixel inteiro, e o ícone andava em degraus de 1 px.
                translate: `-50% calc(-50% + ${raised}px)`,
                scale: `${here * size * (changed ? popScale(frame, at, frames, 0.9, 1.08) : 1)}`,
                rotate: `${tilt[icon] ?? 0}deg`,
              }}
            >
              {turn && arrived < 1 ? (
                <>
                  {/* O estado de que ele vem fica por baixo e só some no fim: o ícone nunca fica vazado. */}
                  <div
                    style={{
                      position: "absolute",
                      left: 0,
                      top: 0,
                      opacity: 1 - arrived ** 3,
                    }}
                  >
                    <MapIcon
                      icon={icon}
                      state={turn.from}
                      size={ICON_SIZE}
                      hue={hue}
                      tint={tint}
                      // A barra da régua só se mexe no estado novo: no antigo ela é a do desenho parado.
                      motion={{ ...motion[icon], bar: undefined }}
                    />
                  </div>
                  <div style={{ position: "relative", opacity: arrived }}>
                    {drawn}
                  </div>
                </>
              ) : (
                drawn
              )}
            </div>
            {number ? (
              <div
                style={{
                  position: "absolute",
                  left: offset,
                  top: 0,
                  translate: `-50% calc(-50% + ${raised + PILL_DROP + (ICON_SIZE * (size - 1)) / 2}px)`,
                  scale: `${here}`,
                  opacity: turn
                    ? pillOpacity(turn.from) +
                      (pillOpacity(state) - pillOpacity(turn.from)) * arrived
                    : pillOpacity(state),
                }}
              >
                {/* Com o fundo mudando de matiz, a pílula do matiz anterior fica por baixo até a nova cobri-la. */}
                {turningHue ? (
                  <div style={{ position: "absolute", left: 0, top: 0 }}>
                    <Tag on={tint.from} size="note">
                      {number}
                    </Tag>
                  </div>
                ) : null}
                <div
                  style={{
                    position: "relative",
                    opacity: turningHue ? tint.progress : 1,
                  }}
                >
                  <Tag on={hue} size="note">
                    {number}
                  </Tag>
                </div>
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
};
