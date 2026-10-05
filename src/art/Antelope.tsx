import { useId } from "react";
import { taperPath, type Point } from "./shapes";

export type AntelopeColors = {
  readonly body: string;
  readonly shade: string;
  /** A barriga, a garganta, o focinho e a mancha da anca. */
  readonly belly: string;
  /** A faixa escura do flanco, os chifres, o rabo e os cascos. */
  readonly band: string;
  readonly earInside: string;
  readonly eye: string;
  readonly pupil: string;
};

type AntelopeProps = {
  /** Comprimento do bicho, do focinho ao rabo, em pixels do quadro. */
  readonly width: number;
  readonly colors: AntelopeColors;
  /** Quanto a pálpebra cobre o olho, de 0 (acordado) a 1 (dormindo). */
  readonly lid?: number;
  /** Olheira de quem está devendo sono, de 0 a 1. */
  readonly tired?: number;
  /** Para onde olha a pupila, de -1 a 1 em cada eixo. */
  readonly look?: Point;
  /** Quanto a cabeça pende: 0 erguida, 1 caída de sono (em pé, pendurada; deitado, pousada no chão). */
  readonly droop?: number;
  /** A orelha: 0 caída, 1 em pé, atenta. */
  readonly ear?: number;
  /** Deitado: 0 em pé, 1 no chão. Na descida, os joelhos da frente dobram primeiro e a anca vem depois. */
  readonly rest?: number;
  /** O passo: de -1 a 1, as pernas de um lado vão à frente e as do outro atrás. */
  readonly stride?: number;
  /** A cabeça virada para olhar em volta, em graus: negativo ergue o focinho, positivo baixa. */
  readonly turn?: number;
  /**
   * O andar: a fase do ciclo de passos, em voltas (uma volta são duas
   * passadas). Com ele, cada casco sai do chão ao ir para a frente e as pernas
   * alternam em diagonal; sem valor, as pernas seguem `stride`.
   */
  readonly gait?: number;
  /** O tamanho da passada de `gait`, de 0 (parado) a 1: é por ele que o bicho freia sem as pernas saltarem. */
  readonly pace?: number;
  /**
   * A cabeça virada para trás, por cima do ombro, de 0 a 1. No meio do
   * caminho ela é vista de frente, estreita: é a virada, e não uma troca.
   */
  readonly lookBack?: number;
};

// A figura cabe nesta caixa, de perfil, olhando para a esquerda; a origem é o chão sob a barriga.
const VIEW = { width: 520, height: 470 };
// O tronco: peito fundo à frente, dorso reto, anca arredondada e barriga que sobe para trás.
const BODY =
  "M-132,-236 C-96,-262 30,-252 104,-258 C158,-262 194,-232 190,-190 C186,-158 156,-146 122,-148 C60,-136 -30,-126 -96,-138 C-148,-146 -164,-200 -132,-236 Z";
// De pé, a barriga fica a esta altura; deitado, o tronco desce isto.
const LYING_DROP = 112;
const SHOULDER: Point = [-112, -224];
const NECK: Point = [-54, -116];
const EYE = { x: -28, y: -8, radius: 11 };

type LegPose = {
  /** Onde a perna sai do tronco, a articulação do meio (joelho ou jarrete) e o casco. */
  readonly top: Point;
  readonly joint: Point;
  readonly hoof: Point;
};

type Leg = {
  readonly standing: LegPose;
  readonly folded: LegPose;
  /** A largura no alto, na articulação e no casco. */
  readonly widths: readonly [number, number, number];
};

const FRONT: Leg = {
  standing: { top: [-94, -164], joint: [-98, -82], hoof: [-94, -6] },
  // Dobrada, a perna da frente fica com o joelho apontando para a frente e o casco recolhido.
  folded: { top: [-94, -58], joint: [-158, -24], hoof: [-104, -12] },
  widths: [30, 15, 11],
};
const HIND: Leg = {
  standing: { top: [122, -178], joint: [152, -92], hoof: [136, -6] },
  // A de trás fica com o jarrete para trás, encostada na anca.
  folded: { top: [122, -72], joint: [186, -36], hoof: [118, -12] },
  widths: [56, 19, 12],
};
// As pernas do outro lado do corpo aparecem um pouco à frente das de cá.
const FAR_SIDE = -24;
// O andar: quanto o casco vai à frente e atrás, quanto sobe ao avançar, e a
// fase de cada perna. Andam em diagonal: a da frente de um lado com a de trás
// do outro, e as de trás um pouco atrasadas, para o passo não parecer máquina.
const GAIT = {
  reach: 56,
  lift: 26,
  phase: { nearFront: 0, farHind: 0.06, nearHind: 0.5, farFront: 0.56 },
} as const;
// A cabeça vista de frente, no meio da virada, tem esta fração da largura de perfil.
const HEAD_ON = 0.3;

const mix = (from: number, to: number, t: number) => from + (to - from) * t;
const between = (a: Point, b: Point, t: number): Point => [
  mix(a[0], b[0], t),
  mix(a[1], b[1], t),
];
const clamp01 = (value: number) => Math.max(0, Math.min(1, value));

/**
 * O antílope, de perfil: uma gazela de corpo cor de areia queimada, com a
 * faixa escura no flanco, a barriga e a anca brancas, pernas finas de jarrete
 * marcado, pescoço comprido e chifres em lira. É a presa do capítulo "o que o
 * sono custa". O que se lê de longe é a faixa do flanco e os chifres. A base
 * do desenho é o chão sob ele.
 */
export const Antelope: React.FC<AntelopeProps> = ({
  width,
  colors,
  lid = 0.15,
  tired = 0,
  look = [-0.3, 0.1],
  droop = 0,
  ear = 0.8,
  rest = 0,
  stride = 0,
  turn = 0,
  gait,
  pace = 1,
  lookBack = 0,
}) => {
  const id = useId();
  const scale = width / VIEW.width;
  // Ele se deita em dois tempos: primeiro dobra os joelhos da frente, depois baixa a anca.
  const front = clamp01(rest * 1.7);
  const hind = clamp01(rest * 1.7 - 0.7);
  const drop = LYING_DROP * (front + hind) * 0.5;
  // No meio do caminho o tronco fica inclinado para a frente.
  const tilt = -9 * (front - hind);
  const lying = rest * droop;
  // De pé, a cabeça pende; deitado, o pescoço se estende até ela pousar no chão.
  const neckTurn = -(28 * droop * (1 - rest) + 94 * lying);
  const headTurn = 16 * droop * (1 - rest) + 80 * lying + turn;
  const step = 28 * stride * (1 - rest);
  /** Onde o casco de uma perna está no ciclo do andar: para a frente ou para trás, e fora do chão quando avança. */
  const footfall = (phase: number): { swing: number; lift: number } => {
    if (gait === undefined) {
      return { swing: 0, lift: 0 };
    }
    const angle = (gait + phase) * Math.PI * 2;
    const size = pace * (1 - rest);
    return {
      swing: GAIT.reach * size * Math.cos(angle),
      lift: GAIT.lift * size * Math.max(0, Math.sin(angle)),
    };
  };
  // A cabeça gira em volta do pescoço: de perfil, de frente (estreita) e de perfil para o outro lado.
  const profile = Math.cos(Math.PI * clamp01(lookBack));
  const headWidth =
    Math.abs(profile) < HEAD_ON ? (profile < 0 ? -HEAD_ON : HEAD_ON) : profile;
  /** Um ponto do pescoço, medido a partir do ombro e girado em volta dele. */
  const fromShoulder = (point: Point, degrees: number): Point => {
    const angle = (degrees * Math.PI) / 180;
    return [
      SHOULDER[0] + point[0] * Math.cos(angle) - point[1] * Math.sin(angle),
      SHOULDER[1] + point[0] * Math.sin(angle) + point[1] * Math.cos(angle),
    ];
  };
  const neckEnd = fromShoulder(NECK, neckTurn);

  const leg = (
    { standing, folded, widths }: Leg,
    phase: number,
    swing: number,
    far: boolean,
    lift = 0,
  ) => {
    const offset = far ? FAR_SIDE : 0;
    const shift = (point: Point, by: number, up = 0): Point => [
      point[0] + offset + by,
      point[1] - up,
    ];
    const top = shift(between(standing.top, folded.top, phase), 0);
    // O casco que sai do chão leva a articulação junto, para a frente e para cima: a perna dobra.
    const joint = shift(
      between(standing.joint, folded.joint, phase),
      swing * 0.45 - lift * 0.5,
      lift * 0.45,
    );
    const hoof = shift(
      between(standing.hoof, folded.hoof, phase),
      swing,
      lift,
    );
    const fill = far ? colors.shade : colors.body;
    const upper: Point = [(top[0] + joint[0]) / 2, (top[1] + joint[1]) / 2];
    const lower: Point = [(joint[0] + hoof[0]) / 2, (joint[1] + hoof[1]) / 2];
    return (
      <g>
        <path
          d={taperPath(top, upper, joint, widths[0], widths[1])}
          fill={fill}
        />
        <path
          d={taperPath(joint, lower, hoof, widths[1], widths[2])}
          fill={fill}
        />
        <circle cx={joint[0]} cy={joint[1]} r={widths[1] / 2} fill={fill} />
        {/* O casco: uma cunha escura, virada para a frente. */}
        <path
          d={`M${hoof[0] - 9},${hoof[1] - 6} L${hoof[0] + 9},${hoof[1] - 6} L${hoof[0] + 8},${hoof[1] + 8} L${hoof[0] - 14},${hoof[1] + 8} Z`}
          fill={colors.band}
        />
      </g>
    );
  };

  const earTip: Point = [40 + 24 * (1 - ear), -64 + 50 * (1 - ear)];
  const horn = (offset: number) => (
    <g opacity={offset === 0 ? 1 : 0.7}>
      <path
        d={taperPath(
          [-2 + offset, -24],
          [18 + offset, -72],
          [6 + offset, -116],
          17,
          11,
        )}
        fill={colors.band}
      />
      <path
        d={taperPath(
          [6 + offset, -116],
          [-8 + offset, -156],
          [14 + offset, -196],
          11,
          3,
        )}
        fill={colors.band}
      />
    </g>
  );

  return (
    <svg
      width={VIEW.width * scale}
      height={VIEW.height * scale}
      viewBox={`${-VIEW.width / 2} ${-VIEW.height} ${VIEW.width} ${VIEW.height}`}
      overflow="visible"
    >
      <defs>
        <clipPath id={`${id}-body`}>
          <path d={BODY} />
        </clipPath>
        <clipPath id={`${id}-eye`}>
          <circle cx={EYE.x} cy={EYE.y} r={EYE.radius} />
        </clipPath>
      </defs>

      {leg(
        HIND,
        hind,
        -step + footfall(GAIT.phase.farHind).swing,
        true,
        footfall(GAIT.phase.farHind).lift,
      )}
      {leg(
        FRONT,
        front,
        step + footfall(GAIT.phase.farFront).swing,
        true,
        footfall(GAIT.phase.farFront).lift,
      )}

      <g transform={`translate(0 ${drop}) rotate(${tilt} 0 -190)`}>
        {/* O rabo: curto e escuro, pendurado na anca. */}
        <g transform={`translate(182 -214) rotate(-20)`}>
          <path
            d={taperPath([0, 0], [16, 22], [14, 58], 15, 6)}
            fill={colors.band}
          />
        </g>

        <path d={BODY} fill={colors.body} />
        <g clipPath={`url(#${id}-body)`}>
          {/* A barriga branca e, por cima dela, a faixa do flanco: o traço que se lê de longe. */}
          <path
            d="M-170,-176 C-70,-160 70,-164 200,-186 L200,-110 L-170,-110 Z"
            fill={colors.belly}
          />
          <path
            d="M-128,-196 C-50,-178 60,-180 150,-206 C74,-160 -52,-158 -128,-176 Z"
            fill={colors.band}
          />
          {/* A mancha branca da anca, com a borda escura. */}
          <path
            d="M136,-266 C176,-252 200,-226 196,-176 C176,-206 156,-232 128,-244 Z"
            fill={colors.band}
          />
          <path
            d="M150,-266 C184,-250 204,-226 200,-180 C184,-210 166,-234 142,-248 Z"
            fill={colors.belly}
          />
          {/* A luz no dorso. */}
          <path
            d="M-132,-252 C-50,-272 70,-270 150,-262 C70,-262 -50,-262 -132,-238 Z"
            fill={colors.shade}
            opacity={0.45}
          />
        </g>

        {/*
          O pescoço: a base fica presa dentro do ombro e só a ponta gira, com o
          meio acompanhando pela metade. Girar o pescoço inteiro como uma peça
          rígida deixava a base dele saindo do corpo quando a cabeça baixava.
        */}
        <path
          d={taperPath(
            fromShoulder([14, 10], 0),
            fromShoulder([-8, -52], neckTurn / 2),
            neckEnd,
            70,
            38,
          )}
          fill={colors.body}
        />
        {/* A garganta branca, na frente do pescoço. */}
        <path
          d={taperPath(
            fromShoulder([-12, 14], 0),
            fromShoulder([-30, -44], neckTurn / 2),
            fromShoulder([NECK[0] - 12, NECK[1] + 16], neckTurn),
            24,
            12,
          )}
          fill={colors.belly}
        />
        <g
          transform={`translate(${neckEnd[0]} ${neckEnd[1]}) rotate(${neckTurn + headTurn}) scale(${headWidth} 1)`}
        >
          {horn(16)}
          {horn(0)}
          {/* A orelha: uma folha comprida, rosada por dentro. */}
          <path
            d={taperPath([8, -18], [36, -30], earTip, 28, 6)}
            fill={colors.body}
          />
          <path
            d={taperPath([12, -22], [34, -32], earTip, 13, 2)}
            fill={colors.earInside}
          />

          {/* A cabeça: testa curta, cana do nariz comprida, focinho fino. */}
          <path
            d="M20,-22 C-4,-42 -44,-32 -62,-8 C-80,10 -100,24 -104,40 C-104,54 -86,56 -70,48 C-44,38 -14,32 12,18 C28,8 32,-8 20,-22 Z"
            fill={colors.body}
          />
          <path
            d="M-72,10 C-88,22 -102,32 -104,42 C-104,54 -86,56 -70,48 C-52,40 -30,34 -12,26 C-34,30 -58,26 -72,10 Z"
            fill={colors.belly}
          />
          <ellipse cx={-98} cy={40} rx={8} ry={7} fill={colors.band} />
          {/* A listra escura do olho ao focinho, e a clara por cima dela. */}
          <path
            d="M-34,6 C-52,14 -72,26 -84,38 C-70,20 -52,8 -32,0 Z"
            fill={colors.band}
          />
          <path
            d="M-40,-22 C-56,-14 -70,-2 -78,10 C-66,-8 -54,-18 -38,-26 Z"
            fill={colors.belly}
            opacity={0.8}
          />

          {tired > 0 ? (
            <path
              d={`M${EYE.x - EYE.radius * 1.2},${EYE.y + EYE.radius * 0.7} Q${EYE.x},${EYE.y + EYE.radius * 2.3} ${EYE.x + EYE.radius * 1.2},${EYE.y + EYE.radius * 0.7}`}
              fill={colors.band}
              opacity={0.55 * tired}
            />
          ) : null}
          <circle cx={EYE.x} cy={EYE.y} r={EYE.radius} fill={colors.eye} />
          <circle
            cx={EYE.x + look[0] * 4}
            cy={EYE.y + look[1] * 4}
            r={EYE.radius * 0.66}
            fill={colors.pupil}
          />
          <rect
            x={EYE.x - EYE.radius}
            y={EYE.y - EYE.radius}
            width={EYE.radius * 2}
            height={EYE.radius * 2 * lid}
            fill={colors.body}
            clipPath={`url(#${id}-eye)`}
          />
          {lid > 0.85 ? (
            <path
              d={`M${EYE.x - EYE.radius},${EYE.y + 2} Q${EYE.x},${EYE.y + 10} ${EYE.x + EYE.radius},${EYE.y + 2}`}
              fill="none"
              stroke={colors.band}
              strokeWidth={4}
              strokeLinecap="round"
            />
          ) : null}
        </g>
      </g>

      {leg(
        HIND,
        hind,
        step + footfall(GAIT.phase.nearHind).swing,
        false,
        footfall(GAIT.phase.nearHind).lift,
      )}
      {leg(
        FRONT,
        front,
        -step + footfall(GAIT.phase.nearFront).swing,
        false,
        footfall(GAIT.phase.nearFront).lift,
      )}
    </svg>
  );
};
