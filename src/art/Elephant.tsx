import { useId } from "react";
import { taperPath, type Point } from "./shapes";
import { mix } from "../components/timing";

export type ElephantColors = {
  readonly body: string;
  readonly shade: string;
  /** A borda de luz no dorso. */
  readonly light: string;
  /** O interior da orelha e a ponta da tromba. */
  readonly earInside: string;
  readonly tusk: string;
  readonly nail: string;
  readonly eye: string;
  readonly pupil: string;
};

/**
 * O acabamento (unidade `forma` da direção de arte, registro de personagem):
 * a elefanta em cor cheia, com um matiz por parte, uma sombra por parte e
 * pernas em tubo, e mais nada. Fica fora de `ElephantColors` porque a manada
 * interpola aquelas cores, uma a uma, entre o dia e a noite.
 */
export type ElephantFinish = {
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
  /** O colar de sensor do estudo, com a luz nesta opacidade; sem o valor, não há colar. */
  readonly collar?: number;
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
  /** O acabamento; sem ele, a elefanta é a do animatic aprovado, em dois tons. */
  readonly finish?: ElephantFinish;
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
  collar,
  gait,
  pace = 1,
  reach = 0,
  finish,
}) => {
  const id = useId();
  const scale = width / VIEW.width;
  // A cabeça pende para a frente quando dorme; o pescoço é o giro.
  const headTilt = 12 * droop;
  const trunkTip: Point = [
    mix(-262 + 60 * trunk, REACHING.tip[0], reach),
    mix(-40 - 150 * trunk, REACHING.tip[1], reach),
  ];
  const trunkControl: Point = [
    mix(-246 - 20 * trunk, REACHING.control[0], reach),
    mix(-150 - 60 * trunk, REACHING.control[1], reach),
  ];
  const step = 24 * stride;
  const nearShade = { fill: colors.shade };

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

  const leg = (x: number, shift: number, back: boolean, lift = 0) => (
    <g key={`${x}-${back}`}>
      <path
        d={taperPath(
          [x, -150],
          // A pata que sai do chão dobra o joelho para a frente.
          [x + shift * 0.4 - lift * 0.7, -80 - lift * 0.4],
          [x + shift, -18 - lift],
          64,
          52,
        )}
        fill={back ? colors.shade : colors.body}
      />
      <rect
        x={x + shift - 30}
        y={-22 - lift}
        width={60}
        height={22}
        rx={11}
        fill={back ? colors.shade : colors.body}
      />
      {[-16, 0, 16].map((toe) => (
        <ellipse
          key={toe}
          cx={x + shift + toe}
          cy={-6 - lift}
          rx={7}
          ry={5}
          fill={colors.nail}
          opacity={back ? 0.6 : 1}
        />
      ))}
    </g>
  );
  const walking = gait !== undefined;
  const farHind = footfall(GAIT.phase.farHind);
  const farFore = footfall(GAIT.phase.farFore);
  const nearHind = footfall(GAIT.phase.nearHind);
  const nearFore = footfall(GAIT.phase.nearFore);

  if (finish) {
    // A tromba do acabamento cai quase a prumo, com a barriga da curva para a
    // frente, e nasce larga, tomando a metade de baixo da face: assim ela é a
    // continuação da testa, e não um tubo encostado numa bola.
    const tip: Point = [
      mix(mix(-214, -202, trunk), REACHING.tip[0], reach),
      mix(-34 - 156 * trunk, REACHING.tip[1], reach),
    ];
    const control: Point = [
      mix(mix(-270, -266, trunk), REACHING.control[0], reach),
      mix(-150 - 60 * trunk, REACHING.control[1], reach),
    ];
    const trunkPath = taperPath([-170, -262], control, tip, 104, 28);
    const trunkTip = tip;
    /**
     * A perna em tubo, que alarga até o pé: `thigh` é a largura no alto (a de
     * trás nasce de uma coxa, a da frente é mais reta) e `bow`, para onde o
     * joelho se curva. As do lado de lá não têm unhas.
     */
    const limb = (
      x: number,
      shift: number,
      lift: number,
      bow: number,
      thigh: number,
      far: boolean,
    ) => {
      const foot: Point = [x + shift, -lift];
      return (
        <g key={`${x}-${far}`} fill={far ? finish.deep : finish.body}>
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
                  fill={finish.nail}
                />
              ))}
        </g>
      );
    };

    return (
      <svg
        width={VIEW.width * scale}
        height={VIEW.height * scale}
        viewBox={`${-VIEW.width / 2} ${-VIEW.height} ${VIEW.width} ${VIEW.height}`}
        overflow="visible"
      >
        <defs>
          <clipPath id={`${id}-body`}>
            <path d={FINISHED_BODY} />
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
          : [
              limb(92, -step, 0, 18, 110, true),
              limb(-106, step, 0, 4, 90, true),
            ]}
        <path
          d={taperPath([226, -256], [266, -204], [264, -122], 24, 12)}
          fill={finish.deep}
        />
        <path
          d="M264,-134 C282,-120 280,-92 266,-84 C250,-92 248,-120 264,-134 Z"
          fill={finish.deep}
        />

        <path d={FINISHED_BODY} fill={finish.body} />
        {/* A sombra da barriga: gorda no meio, zerando nas pernas, que passam por cima dela. */}
        <path
          clipPath={`url(#${id}-body)`}
          d="M-116,-58 C-70,-96 -10,-104 50,-100 C100,-96 150,-104 196,-84 L196,-20 L-116,-20 Z"
          fill={finish.shadow}
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
          <path d={trunkPath} fill={finish.body} />
          <g clipPath={`url(#${id}-trunk)`}>
            {/* O lado de baixo da tromba: largo na raiz, sob o queixo, e zerando antes da ponta. */}
            <path
              d={taperPath(
                [-140, -236],
                [control[0] + 34, control[1] + 10],
                [
                  mix(control[0], tip[0], 0.7) + 12,
                  mix(control[1], tip[1], 0.7),
                ],
                46,
                2,
              )}
              fill={finish.shadow}
            />
            {/* A ponta rosada é uma mancha recortada no tubo; a tampa redonda, abaixo, tem a largura dele. */}
            <circle
              cx={trunkTip[0]}
              cy={trunkTip[1] + 6}
              r={24}
              fill={finish.earInside}
            />
          </g>
          <circle
            cx={trunkTip[0]}
            cy={trunkTip[1]}
            r={14}
            fill={finish.earInside}
          />
          <path
            d={taperPath([-164, -214], [-200, -198], [-230, -186], 20, 9)}
            fill={finish.tusk}
          />
          <circle cx={-230} cy={-186} r={4.5} fill={finish.tusk} />

          <path d={HEAD} fill={finish.body} />
          {/* O queixo na sombra. */}
          <path
            clipPath={`url(#${id}-head)`}
            d="M-212,-252 C-190,-216 -150,-198 -100,-202 C-60,-206 -30,-224 -6,-262 L0,-170 L-212,-170 Z"
            fill={finish.shadow}
          />

          {lid > 0.9 ? (
            <path
              d={`M${EYE.x - 13},${EYE.y + 1} Q${EYE.x},${EYE.y + 11} ${EYE.x + 13},${EYE.y + 1}`}
              fill="none"
              stroke={finish.deep}
              strokeWidth={9}
              strokeLinecap="round"
            />
          ) : (
            <>
              <circle
                cx={EYE.x}
                cy={EYE.y}
                r={EYE.radius + 5}
                fill={finish.eye}
              />
              <circle
                cx={EYE.x + look[0] * 4}
                cy={EYE.y + look[1] * 4}
                r={10}
                fill={finish.pupil}
              />
              <circle
                cx={EYE.x + look[0] * 4 - 3}
                cy={EYE.y + look[1] * 4 - 3}
                r={3.5}
                fill={finish.eye}
              />
              {lid > 0 ? (
                <path
                  d={`M${EYE.x - 20},${EYE.y - 20} L${EYE.x + 20},${EYE.y - 20} L${EYE.x + 20},${EYE.y - 19 + 40 * lid} Q${EYE.x},${EYE.y - 14 + 40 * lid} ${EYE.x - 20},${EYE.y - 19 + 40 * lid} Z`}
                  fill={finish.body}
                />
              ) : null}
            </>
          )}

          <g transform={`rotate(${-6 - 20 * ear} -50 -320)`}>
            {/* O traço da mesma cor arredonda o canto de cima da orelha. */}
            <path
              d={EAR}
              fill={finish.shadow}
              stroke={finish.shadow}
              strokeWidth={12}
              strokeLinejoin="round"
            />
            <path
              d="M-46,-312 C-20,-340 44,-332 66,-290 C82,-256 76,-206 46,-186 C14,-170 -18,-196 -32,-238 C-40,-264 -46,-290 -46,-312 Z"
              fill={finish.earInside}
            />
          </g>
        </g>
      </svg>
    );
  }

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
      </defs>

      {/* Pernas de trás, mais escuras, e o rabo. */}
      {walking
        ? leg(130, farHind.shift, true, farHind.lift)
        : leg(130, -step, true)}
      {walking
        ? leg(-70, farFore.shift, true, farFore.lift)
        : leg(-70, step, true)}
      <path
        d={taperPath([214, -250], [250, -200], [258, -120], 16, 6)}
        fill={colors.shade}
      />
      <ellipse cx={258} cy={-112} rx={10} ry={14} fill={colors.shade} />

      <path d={BODY} fill={colors.body} />
      <g clipPath={`url(#${id}-body)`}>
        {/* Sombra sob a barriga e borda de luz no dorso. */}
        <path
          d="M-170,-120 C-80,-70 120,-70 230,-130 L240,-20 L-180,-20 Z"
          {...nearShade}
        />
        <path
          d="M-120,-330 C-20,-372 120,-368 200,-320 C110,-342 -20,-346 -120,-316 Z"
          fill={colors.light}
        />
      </g>

      {/* Pernas da frente. */}
      {walking
        ? leg(150, nearHind.shift, false, nearHind.lift)
        : leg(150, step, false)}
      {walking
        ? leg(-50, nearFore.shift, false, nearFore.lift)
        : leg(-50, -step, false)}

      {collar === undefined ? null : (
        // O colar do estudo passa pelo pescoço, atrás da orelha, com a luz do sensor embaixo.
        <g>
          <path
            d="M-54,-350 C-10,-360 20,-330 16,-250 C12,-200 -10,-186 -40,-190"
            fill="none"
            stroke={colors.pupil}
            strokeWidth={14}
            strokeLinecap="round"
          />
          <circle cx={-32} cy={-186} r={13} fill={colors.pupil} />
          <circle
            cx={-32}
            cy={-186}
            r={7}
            fill={colors.earInside}
            opacity={0.3 + 0.7 * collar}
          />
        </g>
      )}

      <g transform={`rotate(${headTilt} -60 -300)`}>
        {/* Tromba: um tubo que afina, com a ponta um pouco mais clara. */}
        <path
          d={taperPath([-166, -244], trunkControl, trunkTip, 66, 28)}
          fill={colors.body}
        />
        <path
          d={taperPath(
            [-166, -234],
            [trunkControl[0] + 14, trunkControl[1] + 20],
            [trunkTip[0] + 8, trunkTip[1] + 8],
            30,
            14,
          )}
          fill={colors.shade}
          opacity={0.5}
        />
        <circle
          cx={trunkTip[0]}
          cy={trunkTip[1]}
          r={15}
          fill={colors.earInside}
        />
        {/* Presa pequena, de fêmea. */}
        <path
          d={taperPath([-164, -214], [-200, -198], [-228, -188], 18, 6)}
          fill={colors.tusk}
        />

        {/* Cabeça: testa alta e abaulada, bochecha redonda. */}
        <path
          d="M-20,-330 C-60,-380 -180,-380 -196,-290 C-204,-240 -170,-196 -116,-192 C-70,-190 -30,-216 -22,-262 Z"
          fill={colors.body}
        />
        <path
          d="M-190,-256 C-182,-214 -150,-194 -112,-196 C-80,-198 -56,-212 -40,-234 C-70,-214 -116,-206 -190,-256 Z"
          fill={colors.shade}
          opacity={0.45}
        />
        <path
          d="M-170,-340 C-130,-366 -70,-368 -36,-346 C-80,-356 -130,-354 -170,-340 Z"
          fill={colors.light}
        />

        {/* Olho pequeno, no lugar de verdade, com pálpebra. */}
        <circle cx={EYE.x} cy={EYE.y} r={EYE.radius} fill={colors.eye} />
        <circle
          cx={EYE.x + look[0] * 4}
          cy={EYE.y + look[1] * 4}
          r={7}
          fill={colors.pupil}
        />
        <circle
          cx={EYE.x + look[0] * 4 - 2.5}
          cy={EYE.y + look[1] * 4 - 2.5}
          r={2.5}
          fill={colors.eye}
        />
        {lid > 0 ? (
          <path
            d={`M${EYE.x - 15},${EYE.y - 15} L${EYE.x + 15},${EYE.y - 15} L${EYE.x + 15},${EYE.y - 15 + 30 * lid} Q${EYE.x},${EYE.y - 11 + 30 * lid} ${EYE.x - 15},${EYE.y - 15 + 30 * lid} Z`}
            fill={colors.body}
          />
        ) : null}
        {lid > 0.9 ? (
          <path
            d={`M${EYE.x - 12},${EYE.y + 2} Q${EYE.x},${EYE.y + 10} ${EYE.x + 12},${EYE.y + 2}`}
            fill="none"
            stroke={colors.shade}
            strokeWidth={4}
            strokeLinecap="round"
          />
        ) : null}

        {/* Orelha: a forma própria, um tom acima, presa atrás do olho e abrindo para fora. */}
        <g transform={`rotate(${-6 - 20 * ear} -50 -320)`}>
          <path
            d="M-50,-330 C-10,-364 70,-350 84,-290 C94,-240 60,-196 14,-198 C-24,-200 -54,-240 -50,-330 Z"
            fill={colors.shade}
          />
          <path
            d="M-36,-316 C-4,-342 58,-330 68,-284 C74,-246 50,-212 18,-214 C-10,-216 -36,-246 -36,-316 Z"
            fill={colors.earInside}
            opacity={0.5}
          />
        </g>
      </g>
    </svg>
  );
};

// As formas que o acabamento desenha duas vezes, uma na cor do luar e outra por cima.
const HEAD =
  "M-8,-316 C-26,-392 -150,-412 -198,-332 C-216,-298 -208,-256 -190,-230 C-170,-200 -130,-184 -92,-190 C-50,-196 -14,-226 -6,-270 Z";
const EAR =
  "M-56,-336 C-20,-378 72,-368 98,-300 C114,-254 96,-194 50,-174 C10,-158 -30,-188 -44,-236 C-52,-268 -58,-300 -56,-336 Z";
// O corpo do acabamento: a corcova no ombro, a sela do dorso, a garupa que cai e a barriga pendendo no meio.
const FINISHED_BODY =
  "M-150,-262 C-142,-326 -100,-386 -40,-386 C10,-386 40,-352 90,-346 C140,-340 186,-340 216,-312 C250,-280 262,-226 254,-176 C248,-138 228,-112 196,-100 C140,-82 110,-92 60,-74 C10,-56 -60,-56 -110,-84 C-158,-110 -176,-156 -170,-204 C-168,-226 -158,-246 -150,-262 Z";
// Corpo em curva única: corcova do dorso, barriga baixa.
const BODY =
  "M-150,-240 C-120,-330 -20,-372 100,-360 C190,-352 236,-300 240,-220 C244,-150 220,-100 170,-80 C80,-50 -60,-50 -140,-90 C-180,-110 -176,-180 -150,-240 Z";
