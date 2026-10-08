import { useId } from "react";
import { taperPath, type Point } from "./shapes";
import { mix } from "../components/timing";

/**
 * As cores da elefanta (unidade `forma` da direção de arte, registro de
 * personagem): cor cheia, com um matiz por parte e uma sombra por parte, e
 * mais nada.
 */
export type ElephantColors = {
  readonly body: string;
  /** A sombra, num matiz vizinho ao do corpo: a barriga, o queixo, o lado de baixo da tromba, a orelha por fora. */
  readonly shadow: string;
  /** As pernas de trás, o rabo, a pálpebra fechada. */
  readonly deep: string;
  /** O interior da orelha e a ponta da tromba. */
  readonly earInside: string;
  readonly tusk: string;
  /** As unhas: o acento, num matiz oposto ao do corpo. */
  readonly nail: string;
  readonly eye: string;
  readonly pupil: string;
};

type ElephantProps = {
  /** Comprimento do bicho, da ponta da tromba ao rabo, em pixels do quadro. */
  readonly width: number;
  readonly colors: ElephantColors;
  /** Quanto a pálpebra cobre o olho, de 0 (acordada) a 1 (dormindo). */
  readonly lid?: number;
  /** Para onde olha a pupila, de -1 a 1 em cada eixo. */
  readonly look?: Point;
  /** A tromba: 0 cai solta, 1 ergue e enrola para a frente. */
  readonly trunk?: number;
  /** A orelha: 0 encostada, 1 aberta para fora. */
  readonly ear?: number;
  /** O passo: de -1 a 1, as pernas de um lado vão à frente e as do outro atrás. */
  readonly stride?: number;
  /** Quanto a cabeça pende: 0 erguida, 1 caída de sono. */
  readonly droop?: number;
  /**
   * O andar: a fase do ciclo de passos, em voltas (uma volta são as quatro
   * patas). Com ele, cada pata sai do chão ao ir para a frente e as quatro
   * pisam uma depois da outra, a de trás e a da frente do mesmo lado em
   * seguida, como anda um elefante; sem valor, as pernas seguem `stride`.
   * Quem anda faz a fase crescer com a distância: `STRIDE_LENGTH` por volta.
   */
  readonly gait?: number;
  /** O tamanho da passada de `gait`, de 0 (parada) a 1: é por ele que ela freia sem as patas saltarem. */
  readonly pace?: number;
  /** A tromba estendida para a frente, de 0 a 1: o cumprimento de quem encosta a tromba na de outra. */
  readonly reach?: number;
};

// A figura cabe nesta caixa, de perfil, olhando para a esquerda; a origem é o chão sob a barriga.
const VIEW = { width: 520, height: 400 };
const EYE = { x: -126, y: -268, radius: 13 };
// O andar: quanto cada pata vai à frente e atrás do lugar de repouso, quanto
// sobe ao avançar, e a fase de cada uma. O elefante anda em sequência lateral:
// a de trás de um lado, a da frente do mesmo lado, e depois as do outro.
const GAIT = {
  reach: 46,
  lift: 24,
  phase: { nearHind: 0, nearFore: 0.25, farHind: 0.5, farFore: 0.75 },
} as const;
/**
 * Quanto o corpo avança em uma volta de `gait` com `pace` 1, nas unidades do
 * desenho (a largura inteira são 520): a pata de apoio recua no chão de uma
 * ponta à outra do alcance em meia volta.
 */
export const STRIDE_LENGTH = 4 * GAIT.reach;
// A tromba estendida para a frente: onde ficam a ponta e o meio da curva.
const REACHING = { tip: [-316, -196], control: [-262, -268] } as const;

/**
 * Onde está a ponta da tromba, nas unidades do desenho (a origem é o chão sob
 * a barriga, e ela olha para a esquerda), sem contar a cabeça que pende. A
 * cena que prende algo à ponta pergunta aqui, em vez de repetir os números.
 */
export const trunkTipAt = (trunk: number, reach: number): Point => [
  mix(mix(-214, -202, trunk), REACHING.tip[0], reach),
  mix(-34 - 156 * trunk, REACHING.tip[1], reach),
];

/**
 * A elefanta, de perfil: dorso em corcova, testa alta, orelha grande, tromba
 * em tubo que afina. Os três traços que a identificam de longe são a orelha,
 * a tromba e as pernas em coluna. A base do desenho é o chão sob ela.
 */
export const Elephant: React.FC<ElephantProps> = ({
  width,
  colors,
  lid = 0.15,
  look = [-0.3, 0.2],
  trunk = 0,
  ear = 0.3,
  stride = 0,
  droop = 0,
  gait,
  pace = 1,
  reach = 0,
}) => {
  const id = useId();
  const scale = width / VIEW.width;
  const step = 24 * stride;

  /**
   * Onde uma pata está no ciclo do andar. Na primeira metade da volta ela está
   * no ar, indo para a frente; na segunda, apoiada, recua a velocidade
   * constante: é o chão passando sob o corpo, e por isso ela não patina.
   */
  const footfall = (phase: number): { shift: number; lift: number } => {
    if (gait === undefined) {
      return { shift: 0, lift: 0 };
    }
    const turn = (((gait + phase) % 1) + 1) % 1;
    return turn < 0.5
      ? {
          shift: GAIT.reach * pace * Math.cos(turn * Math.PI * 2),
          lift: GAIT.lift * pace * Math.sin(turn * Math.PI * 2),
        }
      : { shift: GAIT.reach * pace * (4 * turn - 3), lift: 0 };
  };

  const walking = gait !== undefined;
  const farHind = footfall(GAIT.phase.farHind);
  const farFore = footfall(GAIT.phase.farFore);
  const nearHind = footfall(GAIT.phase.nearHind);
  const nearFore = footfall(GAIT.phase.nearFore);

  // A tromba cai quase a prumo, com a barriga da curva para a
  // frente, e nasce larga, tomando a metade de baixo da face: assim ela é a
  // continuação da testa, e não um tubo encostado numa bola.
  const tip = trunkTipAt(trunk, reach);
  const control: Point = [
    mix(mix(-270, -266, trunk), REACHING.control[0], reach),
    mix(-150 - 60 * trunk, REACHING.control[1], reach),
  ];
  const trunkPath = taperPath([-170, -262], control, tip, 104, 28);
  /**
   * A perna em tubo, que alarga até o pé: `thigh` é a largura no alto (a de
   * trás nasce de uma coxa, a da frente é mais reta) e `bow`, para onde o
   * joelho se curva. As do lado de lá não têm unhas.
   */
  const limb = (
    x: number,
    shift: number,
    raised: number,
    bow: number,
    thigh: number,
    far: boolean,
  ) => {
    // O elefante quase não tira a pata do chão: com a subida inteira, a pata
    // do lado de lá, à vista sob a barriga, parecia flutuar.
    const lift = raised * 0.3;
    const foot: Point = [x + shift, -lift];
    return (
      <g key={`${x}-${far}`} fill={far ? colors.deep : colors.body}>
        <path
          d={taperPath(
            [x, -190],
            [x + shift * 0.4 - lift * 0.7 + bow, -100 - lift * 0.4],
            [x + shift, -22 - lift],
            thigh,
            70,
          )}
        />
        <path
          d={`M${foot[0] - 35},${foot[1] - 26} C${foot[0] - 42},${foot[1] - 8} ${foot[0] - 38},${foot[1]} ${foot[0] - 24},${foot[1]} L${foot[0] + 26},${foot[1]} C${foot[0] + 40},${foot[1]} ${foot[0] + 42},${foot[1] - 8} ${foot[0] + 35},${foot[1] - 26} Z`}
        />
        {far
          ? null
          : [-18, 0, 18].map((toe) => (
              <ellipse
                key={toe}
                cx={foot[0] + toe - 3}
                cy={foot[1] - 8}
                rx={8}
                ry={6}
                fill={colors.nail}
              />
            ))}
      </g>
    );
  };

  // A pupila desce com a pálpebra: parada no meio do olho, a pálpebra pesada a
  // cobria e sobrava uma lasca branca, que lia como raiva e não como sono.
  const pupilY = Math.min(
    EYE.y + 8,
    Math.max(EYE.y + look[1] * 4, EYE.y - 15 + 40 * lid),
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
        <clipPath id={`${id}-head`}>
          <path d={HEAD} />
        </clipPath>
        <clipPath id={`${id}-trunk`}>
          <path d={trunkPath} />
        </clipPath>
      </defs>

      {/* As pernas do lado de lá aparecem de verdade: mais de meia perna para dentro, e em outro ângulo. */}
      {walking
        ? [
            limb(92, farHind.shift, farHind.lift, 18, 110, true),
            limb(-106, farFore.shift, farFore.lift, 4, 90, true),
          ]
        : [limb(92, -step, 0, 18, 110, true), limb(-106, step, 0, 4, 90, true)]}
      <path
        d={taperPath([226, -256], [266, -204], [264, -122], 24, 12)}
        fill={colors.deep}
      />
      <path
        d="M264,-134 C282,-120 280,-92 266,-84 C250,-92 248,-120 264,-134 Z"
        fill={colors.deep}
      />

      <path d={BODY} fill={colors.body} />
      {/* A sombra da barriga: gorda no meio, zerando nas pernas, que passam por cima dela. */}
      <path
        clipPath={`url(#${id}-body)`}
        d="M-116,-58 C-70,-96 -10,-104 50,-100 C100,-96 150,-104 196,-84 L196,-20 L-116,-20 Z"
        fill={colors.shadow}
      />
      {walking
        ? [
            limb(152, nearHind.shift, nearHind.lift, 16, 132, false),
            limb(-56, nearFore.shift, nearFore.lift, -4, 104, false),
          ]
        : [
            limb(152, step, 0, 16, 132, false),
            limb(-56, -step, 0, -4, 104, false),
          ]}

      <g transform={`rotate(${18 * droop} -60 -300)`}>
        <path d={trunkPath} fill={colors.body} />
        <g clipPath={`url(#${id}-trunk)`}>
          {/* O lado de baixo da tromba: largo na raiz, sob o queixo, e zerando antes da ponta. */}
          <path
            d={taperPath(
              [-140, -236],
              [control[0] + 34, control[1] + 10],
              [mix(control[0], tip[0], 0.7) + 12, mix(control[1], tip[1], 0.7)],
              46,
              2,
            )}
            fill={colors.shadow}
          />
        </g>
        {/*
          A ponta: arredondada, na cor do corpo, com a abertura rosada
          dentro, menor que o tubo. Neste vídeo o sono é medido pela tromba,
          e é a ponta que o olho segue; uma tampa rosa do tamanho do tubo
          lia como borracha de lápis.
        */}
        <circle cx={tip[0]} cy={tip[1]} r={14} fill={colors.body} />
        <ellipse
          cx={tip[0]}
          cy={tip[1] + 4}
          rx={8.5}
          ry={6}
          fill={colors.earInside}
        />
        <path
          d={taperPath([-164, -214], [-200, -198], [-230, -186], 20, 9)}
          fill={colors.tusk}
        />
        <circle cx={-230} cy={-186} r={4.5} fill={colors.tusk} />

        <path d={HEAD} fill={colors.body} />
        {/* O queixo na sombra. */}
        <path
          clipPath={`url(#${id}-head)`}
          d="M-212,-252 C-190,-216 -150,-198 -100,-202 C-60,-206 -30,-224 -6,-262 L0,-170 L-212,-170 Z"
          fill={colors.shadow}
        />

        {/* Passando de dois terços, a pálpebra deixava só uma lasca branca, sem pupila: o olho já se desenha fechado. */}
        {lid > 0.66 ? (
          <path
            d={`M${EYE.x - 13},${EYE.y + 1} Q${EYE.x},${EYE.y + 11} ${EYE.x + 13},${EYE.y + 1}`}
            fill="none"
            stroke={colors.deep}
            strokeWidth={9}
            strokeLinecap="round"
          />
        ) : (
          <>
            <circle
              cx={EYE.x}
              cy={EYE.y}
              r={EYE.radius + 5}
              fill={colors.eye}
            />
            <circle
              cx={EYE.x + look[0] * 4}
              cy={pupilY}
              r={10}
              fill={colors.pupil}
            />
            <circle
              cx={EYE.x + look[0] * 4 - 3}
              cy={pupilY - 3}
              r={3.5}
              fill={colors.eye}
            />
            {lid > 0 ? (
              <path
                d={`M${EYE.x - 20},${EYE.y - 20} L${EYE.x + 20},${EYE.y - 20} L${EYE.x + 20},${EYE.y - 19 + 40 * lid} Q${EYE.x},${EYE.y - 14 + 40 * lid} ${EYE.x - 20},${EYE.y - 19 + 40 * lid} Z`}
                fill={colors.body}
              />
            ) : null}
          </>
        )}

        <g transform={`rotate(${-6 - 20 * ear} -50 -320)`}>
          {/* O traço da mesma cor arredonda o canto de cima da orelha. */}
          <path
            d={EAR}
            fill={colors.shadow}
            stroke={colors.shadow}
            strokeWidth={12}
            strokeLinejoin="round"
          />
          <path
            d="M-46,-312 C-20,-340 44,-332 66,-290 C82,-256 76,-206 46,-186 C14,-170 -18,-196 -32,-238 C-40,-264 -46,-290 -46,-312 Z"
            fill={colors.earInside}
          />
        </g>
      </g>
    </svg>
  );
};

const HEAD =
  "M-8,-316 C-26,-392 -150,-412 -198,-332 C-216,-298 -208,-256 -190,-230 C-170,-200 -130,-184 -92,-190 C-50,-196 -14,-226 -6,-270 Z";
const EAR =
  "M-56,-336 C-20,-378 72,-368 98,-300 C114,-254 96,-194 50,-174 C10,-158 -30,-188 -44,-236 C-52,-268 -58,-300 -56,-336 Z";
// O corpo: a corcova no ombro, a sela do dorso, a garupa que cai e a barriga pendendo no meio.
const BODY =
  "M-150,-262 C-142,-326 -100,-386 -40,-386 C10,-386 40,-352 90,-346 C140,-340 186,-340 216,-312 C250,-280 262,-226 254,-176 C248,-138 228,-112 196,-100 C140,-82 110,-92 60,-74 C10,-56 -60,-56 -110,-84 C-158,-110 -176,-156 -170,-204 C-168,-226 -158,-246 -150,-262 Z";
