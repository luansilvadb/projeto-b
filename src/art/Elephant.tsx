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

// Corpo em curva única: corcova do dorso, barriga baixa.
const BODY =
  "M-150,-240 C-120,-330 -20,-372 100,-360 C190,-352 236,-300 240,-220 C244,-150 220,-100 170,-80 C80,-50 -60,-50 -140,-90 C-180,-110 -176,-180 -150,-240 Z";
