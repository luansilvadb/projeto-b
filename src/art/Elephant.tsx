import { useId } from "react";
import { random } from "remotion";
import { normalOnCurve, pointOnCurve, taperPath, type Point } from "./shapes";
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
 * O acabamento (unidade `forma` da direção de arte): a elefanta desenhada de
 * novo, com cor cheia, luz e sombra chapadas que seguem o corpo, pernas em
 * tubo e pregas de couro. Fica fora de `ElephantColors` porque a manada
 * interpola aquelas cores, uma a uma, entre o dia e a noite.
 */
export type ElephantFinish = {
  readonly body: string;
  /** O lado da luz: a faixa do dorso, a testa. */
  readonly light: string;
  /** A sombra, num matiz vizinho ao do corpo, e não o corpo escurecido. */
  readonly shadow: string;
  /** A sombra funda: as pernas de trás, o vão sob a barriga. */
  readonly deep: string;
  /** A borda de luz: a cor de quem ilumina (o sol, a lua). */
  readonly rim: string;
  readonly ear: string;
  /** O aro em volta do rosado da orelha, e as dobras dela. */
  readonly earRing: string;
  /** A presa e as unhas, e o lado de sombra delas. */
  readonly tusk: string;
  readonly tuskShade: string;
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

// O acabamento. A luz vem da frente e de cima: a elefanta olha para ela.
// As pregas da garupa: crescentes de sombra, e não traços, para o tom mais escuro ficar com o rosto.
const FOLDS = [
  "M200,-306 C170,-264 168,-212 194,-168 C182,-212 184,-262 200,-306 Z",
  "M226,-270 C206,-244 204,-214 220,-188 C212,-214 213,-244 226,-270 Z",
] as const;
// A pele: onde o espalhamento se concentra (o centro e o alcance de cada zona)
// e quantas manchas de cada tamanho. Densa no dorso, na garupa e atrás da
// orelha; a barriga e o peito descansam.
const SKIN = {
  zones: [
    [70, -330, 150, 40],
    [190, -230, 60, 90],
    [110, -250, 50, 70],
    [-110, -160, 40, 50],
    [40, -150, 110, 40],
  ],
  sizes: [
    [9, 16, 24],
    [22, 8, 12],
    [44, 3, 6],
  ],
} as const;
// As rugas da tromba: onde ficam ao longo dela, a espessura e o comprimento. Juntas na base, em passo desigual.
const WRINKLES = [
  [0.08, 10, 0.8],
  [0.15, 8, 0.55],
  [0.27, 8, 0.75],
  [0.47, 6, 0.5],
] as const;
// Quanto a silhueta da cor do luar sobra para o lado da luz, atrás de cada parte: a borda de luz.
const RIM = "translate(-7 -8)";
// No corpo ela gira em torno da garupa: grossa do lado da luz, some antes de chegar lá atrás.
const BODY_RIM = "rotate(-1.7 250 -330) translate(-4 0)";

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
    const trunkFrom: Point = [-166, -244];
    /** A perna em tubo: larga na coxa, curva no joelho, com o pé e as unhas. */
    const tube = (x: number, shift: number, lift: number, bow: number) =>
      taperPath(
        [x, -176],
        [x + shift * 0.4 - lift * 0.7 + bow, -96 - lift * 0.4],
        [x + shift, -24 - lift],
        104,
        58,
      );
    const limb = (
      x: number,
      shift: number,
      lift: number,
      bow: number,
      far: boolean,
    ) => {
      const foot: Point = [x + shift, -lift];
      const knee: Point = [x + shift * 0.7 + bow * 0.6, -84 - lift * 0.7];
      return (
        <g key={`${x}-${far}`}>
          <path
            d={tube(x, shift, lift, bow)}
            fill={far ? finish.deep : finish.body}
          />
          <path
            d={`M${foot[0] - 31},${foot[1] - 30} C${foot[0] - 40},${foot[1] - 8} ${foot[0] - 36},${foot[1]} ${foot[0] - 22},${foot[1]} L${foot[0] + 24},${foot[1]} C${foot[0] + 38},${foot[1]} ${foot[0] + 40},${foot[1] - 10} ${foot[0] + 30},${foot[1] - 30} Z`}
            fill={far ? finish.deep : finish.body}
          />
          {far ? null : (
            <>
              {/* O lado de trás da perna na sombra: nasce em ponta na coxa e engrossa até o tornozelo, dentro do tubo. */}
              <path
                clipPath={`url(#${id}-leg-${x})`}
                d={taperPath(
                  [x + 52, -150],
                  [x + shift * 0.4 - lift * 0.7 + bow + 32, -92 - lift * 0.4],
                  [x + shift + 24, -lift],
                  2,
                  34,
                )}
                fill={finish.shadow}
              />
              {(
                [
                  [0, 8, 20],
                  [14, 6, 13],
                ] as const
              ).map(([down, width, half]) => (
                <path
                  key={down}
                  d={`M${knee[0] - half - 6},${knee[1] + down} Q${knee[0] - 6},${knee[1] + down + half * 0.5} ${knee[0] + half - 6},${knee[1] + down}`}
                  fill="none"
                  stroke={finish.shadow}
                  strokeWidth={width}
                  strokeLinecap="round"
                />
              ))}
            </>
          )}
          {[-17, 0, 17].map((toe) => (
            <g key={toe}>
              <ellipse
                cx={foot[0] + toe - 3}
                cy={foot[1] - 8}
                rx={10}
                ry={8}
                fill={far ? finish.shadow : finish.tuskShade}
              />
              <ellipse
                cx={foot[0] + toe - 3}
                cy={foot[1] - 8}
                rx={7}
                ry={5}
                fill={far ? finish.tuskShade : finish.tusk}
              />
            </g>
          ))}
        </g>
      );
    };
    const farLegs = walking
      ? [
          limb(130, farHind.shift, farHind.lift, 8, true),
          limb(-70, farFore.shift, farFore.lift, -4, true),
        ]
      : [limb(130, -step, 0, 8, true), limb(-70, step, 0, -4, true)];
    const near = walking
      ? ([
          [150, nearHind.shift, nearHind.lift, 10],
          [-50, nearFore.shift, nearFore.lift, -6],
        ] as const)
      : ([
          [150, step, 0, 10],
          [-50, -step, 0, -6],
        ] as const);

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
          {/* O corpo com as pernas da frente: a sombra e as pregas correm por cima das duas coisas, sem emenda. */}
          <clipPath id={`${id}-bulk`}>
            <path d={FINISHED_BODY} />
            {near.map(([x, shift, lift, bow]) => (
              <path key={x} d={tube(x, shift, lift, bow)} />
            ))}
          </clipPath>
          <clipPath id={`${id}-head`}>
            <path d={HEAD} />
          </clipPath>
          {near.map(([x, shift, lift, bow]) => (
            <clipPath key={x} id={`${id}-leg-${x}`}>
              <path d={tube(x, shift, lift, bow)} />
            </clipPath>
          ))}
          <clipPath id={`${id}-back`}>
            <rect x={-300} y={-500} width={700} height={290} />
          </clipPath>
          <clipPath id={`${id}-trunk`}>
            <path d={taperPath(trunkFrom, trunkControl, trunkTip, 66, 28)} />
          </clipPath>
        </defs>

        {farLegs}
        <path
          d={taperPath([222, -262], [262, -206], [264, -122], 24, 12)}
          fill={finish.deep}
        />
        <path
          d="M264,-134 C282,-120 280,-92 266,-84 C250,-92 248,-120 264,-134 Z"
          fill={finish.deep}
        />

        {/* Só do dorso para cima: girada, a cópia também sobraria por baixo da barriga. */}
        <g clipPath={`url(#${id}-back)`}>
          <path d={FINISHED_BODY} fill={finish.rim} transform={BODY_RIM} />
        </g>
        <path d={FINISHED_BODY} fill={finish.body} />
        {/* A sombra da barriga, em dois degraus de borda ondulada: as pernas da frente passam por cima dela. */}
        <g clipPath={`url(#${id}-body)`}>
          <path
            d="M-176,-136 C-130,-100 -100,-112 -60,-92 C-10,-66 40,-98 90,-86 C140,-74 196,-116 250,-150 L260,-20 L-180,-20 Z"
            fill={finish.shadow}
          />
          <path
            d="M-170,-98 C-90,-60 -20,-70 40,-62 C110,-52 186,-82 246,-112 L250,-20 L-180,-20 Z"
            fill={finish.deep}
          />
        </g>
        {near.map(([x, shift, lift, bow]) => limb(x, shift, lift, bow, false))}

        <g clipPath={`url(#${id}-bulk)`}>
          {/* A luz no dorso: uma faixa chapada que segue a corcova e afina na garupa. */}
          <path
            d="M-150,-250 C-130,-340 -40,-384 60,-366 C110,-358 150,-362 190,-340 C150,-346 112,-336 60,-338 C-30,-348 -96,-304 -122,-232 Z"
            fill={finish.light}
          />
          {/* A garupa na sombra, de cima até o tornozelo de trás. */}
          <path
            d="M266,-316 C214,-250 202,-150 222,-20 L290,-20 L290,-316 Z"
            fill={finish.shadow}
          />
          {/*
            A pele: manchas em três tamanhos e dois tons, por cima da luz e
            da sombra, que continuam à vista por baixo. Translúcidas na cor
            do próprio desenho, para cada zona tingir a sua.
          */}
          {SKIN.sizes.flatMap(([count, least, most], size) =>
            Array.from({ length: count }, (_, index) => {
              const pick = (trait: string) =>
                random(`elephant-skin-${size}-${trait}-${index}`);
              const [x, y, reachX, reachY] =
                SKIN.zones[Math.floor(pick("zone") * SKIN.zones.length)];
              const radius = least + (most - least) * pick("size");
              const cx = x + (pick("x") * 2 - 1) * reachX;
              const cy = y + (pick("y") * 2 - 1) * reachY;
              const dark = pick("tone") < 0.6;
              return (
                <g
                  key={`${size}-${index}`}
                  fill={dark ? finish.deep : finish.light}
                  opacity={dark ? 0.2 : 0.4}
                  transform={`rotate(${pick("turn") * 180} ${cx} ${cy})`}
                >
                  {/* Duas elipses que se fundem: a borda da mancha não é a de um compasso. */}
                  <ellipse cx={cx} cy={cy} rx={radius} ry={radius * 0.68} />
                  <ellipse
                    cx={cx + radius * 0.6}
                    cy={cy + radius * 0.3}
                    rx={radius * 0.6}
                    ry={radius * 0.5}
                  />
                </g>
              );
            }),
          )}
          {FOLDS.map((fold) => (
            <path key={fold} d={fold} fill={finish.shadow} />
          ))}
        </g>

        <g transform={`rotate(${headTilt} -60 -300)`}>
          <path
            d={taperPath(trunkFrom, trunkControl, trunkTip, 66, 28)}
            fill={finish.rim}
            transform="translate(-4 -2)"
          />
          <path
            d={taperPath(trunkFrom, trunkControl, trunkTip, 66, 28)}
            fill={finish.body}
          />
          <path
            d={taperPath(
              [-166, -234],
              [trunkControl[0] + 14, trunkControl[1] + 20],
              [trunkTip[0] + 8, trunkTip[1] + 8],
              30,
              14,
            )}
            fill={finish.shadow}
          />
          {WRINKLES.map(([t, width, reach]) => {
            const [x, y] = pointOnCurve(trunkFrom, trunkControl, trunkTip, t);
            // A normal aponta para o lado da luz; a ruga vai dele até pouco depois do meio.
            const [nx, ny] = normalOnCurve(
              trunkFrom,
              trunkControl,
              trunkTip,
              t,
            );
            const half = (66 + (28 - 66) * t) / 2;
            return (
              <path
                key={t}
                d={`M${x + nx * half * 0.8},${y + ny * half * 0.8} Q${x + ny * 9},${y - nx * 9} ${x + nx * half * (0.8 - reach * 1.3)},${y + ny * half * (0.8 - reach * 1.3)}`}
                fill="none"
                stroke={finish.shadow}
                strokeWidth={width}
                strokeLinecap="round"
              />
            );
          })}
          <circle
            clipPath={`url(#${id}-trunk)`}
            cx={trunkTip[0]}
            cy={trunkTip[1] + 6}
            r={24}
            fill={finish.ear}
          />
          <path
            d={taperPath([-164, -214], [-200, -198], [-230, -186], 20, 8)}
            fill={finish.tusk}
          />
          <circle cx={-230} cy={-186} r={4} fill={finish.tusk} />
          <path
            d={taperPath([-164, -207], [-198, -192], [-226, -183], 8, 3)}
            fill={finish.tuskShade}
          />

          <path d={HEAD} fill={finish.rim} transform={RIM} />
          <path d={HEAD} fill={finish.body} />
          <g clipPath={`url(#${id}-head)`}>
            {/* A testa na luz e o queixo na sombra. */}
            <path
              d="M-40,-350 C-90,-386 -182,-374 -198,-290 C-202,-262 -194,-238 -182,-222 C-186,-250 -180,-282 -168,-302 C-148,-346 -92,-360 -40,-350 Z"
              fill={finish.light}
            />
            <path
              d="M-200,-258 C-186,-220 -150,-204 -112,-206 C-80,-208 -52,-222 -30,-250 L-10,-180 L-200,-180 Z"
              fill={finish.shadow}
            />
          </g>

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
                r={EYE.radius + 6}
                fill={finish.shadow}
              />
              <circle cx={EYE.x} cy={EYE.y} r={EYE.radius} fill={finish.eye} />
              <circle
                cx={EYE.x + look[0] * 4}
                cy={EYE.y + look[1] * 4}
                r={7}
                fill={finish.pupil}
              />
              <circle
                cx={EYE.x + look[0] * 4 - 2.5}
                cy={EYE.y + look[1] * 4 - 2.5}
                r={2.5}
                fill={finish.eye}
              />
              {lid > 0 ? (
                <path
                  d={`M${EYE.x - 20},${EYE.y - 20} L${EYE.x + 20},${EYE.y - 20} L${EYE.x + 20},${EYE.y - 19 + 38 * lid} Q${EYE.x},${EYE.y - 14 + 38 * lid} ${EYE.x - 20},${EYE.y - 19 + 38 * lid} Z`}
                  fill={finish.body}
                />
              ) : null}
            </>
          )}

          <g transform={`rotate(${-6 - 20 * ear} -50 -320)`}>
            <path
              d={EAR}
              fill={finish.rim}
              stroke={finish.rim}
              strokeWidth={12}
              strokeLinejoin="round"
              transform={RIM}
            />
            <path
              d={EAR}
              fill={finish.shadow}
              stroke={finish.shadow}
              strokeWidth={12}
              strokeLinejoin="round"
            />
            <path
              d="M-36,-316 C-4,-342 58,-330 68,-284 C74,-246 50,-212 18,-214 C-10,-216 -36,-246 -36,-316 Z"
              fill={finish.ear}
              stroke={finish.earRing}
              strokeWidth={14}
              strokeLinejoin="round"
              paintOrder="stroke"
            />
            <path
              d="M-8,-300 C12,-272 12,-246 0,-226"
              fill="none"
              stroke={finish.earRing}
              strokeWidth={9}
              strokeLinecap="round"
            />
            <path
              d="M32,-304 C46,-284 46,-262 38,-246"
              fill="none"
              stroke={finish.earRing}
              strokeWidth={6}
              strokeLinecap="round"
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
  "M-20,-330 C-60,-380 -180,-380 -196,-290 C-204,-240 -170,-196 -116,-192 C-70,-190 -30,-216 -22,-262 Z";
const EAR =
  "M-50,-330 C-10,-364 70,-350 84,-290 C94,-240 60,-196 14,-198 C-24,-200 -54,-240 -50,-330 Z";
// O corpo do acabamento: a corcova no ombro, a garupa que cai e a barriga pendendo no meio.
const FINISHED_BODY =
  "M-150,-250 C-130,-340 -40,-384 60,-366 C110,-358 150,-362 190,-340 C240,-312 258,-250 252,-190 C248,-140 228,-104 182,-88 C100,-58 -40,-52 -130,-90 C-176,-112 -172,-190 -150,-250 Z";
// Corpo em curva única: corcova do dorso, barriga baixa.
const BODY =
  "M-150,-240 C-120,-330 -20,-372 100,-360 C190,-352 236,-300 240,-220 C244,-150 220,-100 170,-80 C80,-50 -60,-50 -140,-90 C-180,-110 -176,-180 -150,-240 Z";
