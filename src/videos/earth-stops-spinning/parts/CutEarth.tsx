import "../../../design/fonts";
import { useId } from "react";
import { typography } from "../../../design/tokens";
import { blockSea, earth, ink, tags, type TagTone } from "../palette";
import { Globe } from "./Globe";
import { Arrow } from "./kit";

/**
 * A Terra em corte, de lado: a metade de lá (a oeste) é o planeta visto de
 * fora, girando; a de cá mostra a rocha por dentro. A camada de mar, quando
 * existe, veste as duas metades. Os dois raios (`CutRays`), a tentativa de
 * escapar (`EscapeArrows`) e a água que escorre (`SeaFlow`) vão por cima, no
 * mesmo SVG, com as mesmas medidas.
 *
 * A cintura alargada é exagero de desenho: a diferença real é de 21 km em
 * 6.378. Todo plano que usa este desenho leva a etiqueta "exagerado".
 */

/**
 * A etiqueta de honestidade ("exagerado", "comparação", "simulação"): uma
 * pílula encostada no que ela qualifica, posicionada com `Place`. A letra fica
 * entre o selo (32) e a nota (56): a 32 ela não se lia no tamanho final, e a
 * 56 disputaria com o número do plano. Mora aqui porque nasceu com o
 * "exagerado" deste desenho; o lugar dela é o `kit.tsx`.
 */
export const Caveat: React.FC<{ readonly on: TagTone; readonly children: string }> = ({
  on,
  children,
}) => (
  <div
    style={{
      fontFamily: typography.family,
      fontWeight: typography.weight,
      fontSize: 40,
      lineHeight: 1.1,
      whiteSpace: "nowrap",
      color: tags[on].text,
      background: tags[on].fill,
      borderRadius: 999,
      padding: "0.22em 0.6em",
    }}
  >
    {children}
  </div>
);

/** Quanto a cintura alarga no desenho, em fração do raio do polo. */
export const CUT_BULGE = 0.22;

/**
 * Até onde a superfície do mar passa da rocha, em fração do raio do polo: no
 * equador e nos polos. Negativo no equador, a água não chega lá: a rocha fica
 * de fora, seca.
 */
export type SeaLayer = { readonly equator: number; readonly pole: number };

/**
 * Com a Terra girando, a superfície do mar acompanha o formato da rocha, por
 * igual: o mar não é mais espesso no equador, é o planeta inteiro que é mais
 * largo ali. Parada, a superfície vira um círculo em volta do centro (a mesma
 * altura em toda parte): cobre os polos, que ficam mais perto do centro, e não
 * alcança a cintura.
 */
export const SEA = {
  even: { equator: 0.08, pole: 0.08 },
  polar: { equator: -0.08, pole: 0.14 },
} as const satisfies Record<string, SeaLayer>;

/** A camada a caminho de `from` para `to`, com `t` de 0 a 1. */
export const mixSea = (from: SeaLayer, to: SeaLayer, t: number): SeaLayer => ({
  equator: from.equator + (to.equator - from.equator) * t,
  pole: from.pole + (to.pole - from.pole) * t,
});

type CutProps = {
  readonly cx: number;
  readonly cy: number;
  /** O raio do centro ao polo, em pixels. */
  readonly r: number;
  readonly bulge?: number;
};

type CutEarthProps = CutProps & {
  /** Voltas já dadas pela metade vista de fora. */
  readonly spin?: number;
  readonly sea?: SeaLayer;
  /** O que é pintado na rocha (rachaduras), recortado por ela, em unidades de raio 100. */
  readonly children?: React.ReactNode;
};

export const CutEarth: React.FC<CutEarthProps> = ({
  cx,
  cy,
  r,
  bulge = CUT_BULGE,
  spin = 0,
  sea,
  children,
}) => {
  const id = useId();
  const rx = r * (1 + bulge);
  // Até que altura a cintura fica fora da água, quando a superfície do mar não a alcança: é onde as duas elipses se cruzam.
  const reach = sea ? ((1 + bulge) / (1 + bulge + sea.equator)) ** 2 : 1;
  const dry =
    sea && sea.equator < 0 ? r * Math.sqrt((1 - reach) / (1 / (1 + sea.pole) ** 2 - reach)) : 0;
  const layer = (scale: number, fill: string) => (
    <ellipse cx={cx} cy={cy} rx={rx * scale} ry={r * scale} fill={fill} />
  );
  return (
    <g>
      <defs>
        <clipPath id={`${id}-out`}>
          <rect x={cx - rx * 2} y={cy - r * 2} width={rx * 2} height={r * 4} />
        </clipPath>
        <clipPath id={`${id}-cut`}>
          <rect x={cx} y={cy - r * 2} width={rx * 2} height={r * 4} />
        </clipPath>
        <clipPath id={`${id}-rock`}>
          <ellipse cx={cx} cy={cy} rx={rx} ry={r} />
        </clipPath>
      </defs>
      {sea ? (
        <ellipse
          cx={cx}
          cy={cy}
          rx={rx + sea.equator * r}
          ry={r + sea.pole * r}
          fill={earth.water}
        />
      ) : null}
      <g clipPath={`url(#${id}-out)`}>
        <Globe cx={cx} cy={cy} r={r} spin={spin} bulge={bulge} shade={0.2} />
        {/* Na metade vista de fora, a faixa do equador que secou: o fundo do mar, na cor da rocha. */}
        {dry > 0 ? (
          <rect
            x={cx - rx}
            y={cy - dry}
            width={rx}
            height={dry * 2}
            fill={earth.rock}
            opacity={0.88}
            clipPath={`url(#${id}-rock)`}
          />
        ) : null}
      </g>
      <g clipPath={`url(#${id}-cut)`}>
        {layer(1, earth.rockShade)}
        {layer(0.93, earth.rock)}
        {layer(0.58, earth.mantle)}
        {layer(0.24, blockSea.core)}
        {/* A sombra da metade de fora sobre a face cortada: é o que dá o degrau do corte. */}
        <rect
          x={cx}
          y={cy - r}
          width={r * 0.04}
          height={r * 2}
          fill={earth.rockShade}
          opacity={0.5}
          clipPath={`url(#${id}-rock)`}
        />
      </g>
      {children ? (
        <g clipPath={`url(#${id}-rock)`}>
          <g transform={`translate(${cx} ${cy}) scale(${rx / 100} ${r / 100})`}>{children}</g>
        </g>
      ) : null}
    </g>
  );
};

type CutRaysProps = CutProps & {
  /** Quanto dos dois raios já saiu do centro, de 0 a 1. */
  readonly drawn: number;
  /** Quanto a cópia do raio do polo já deitou sobre o do equador, de 0 a 1: é a mesma régua. */
  readonly swung: number;
  /** Quanto do pedaço a mais já acendeu, de 0 a 1. */
  readonly lit: number;
};

/**
 * Os dois raios que saem do centro: o do polo, para cima, e o do equador,
 * para leste. O do polo deita sobre o do equador e não chega à ponta: o
 * pedaço que sobra acende.
 */
export const CutRays: React.FC<CutRaysProps> = ({
  cx,
  cy,
  r,
  bulge = CUT_BULGE,
  drawn,
  swung,
  lit,
}) => {
  if (drawn <= 0) {
    return null;
  }
  const rx = r * (1 + bulge);
  const angle = (-Math.PI / 2) * (1 - swung);
  const tip = [cx + r * Math.cos(angle), cy + r * Math.sin(angle)] as const;
  const stroke = { stroke: ink.paper, strokeWidth: 12, strokeLinecap: "round" } as const;
  return (
    <g>
      <line x1={cx} y1={cy} x2={cx + rx * drawn} y2={cy} {...stroke} />
      <line x1={cx} y1={cy} x2={cx} y2={cy - r * drawn} {...stroke} />
      {swung > 0 ? (
        <>
          <path
            d={`M${cx},${cy - r} A${r},${r} 0 0 1 ${tip[0]},${tip[1]}`}
            fill="none"
            stroke={ink.paper}
            strokeWidth={6}
            strokeDasharray="6 16"
            strokeLinecap="round"
            opacity={0.7}
          />
          <line x1={cx} y1={cy} x2={tip[0]} y2={tip[1]} {...stroke} />
          <circle cx={tip[0]} cy={tip[1]} r={13} fill={ink.paper} />
        </>
      ) : null}
      {lit > 0 ? (
        <line
          x1={cx + r}
          y1={cy}
          x2={cx + r + (rx - r) * lit}
          y2={cy}
          stroke={ink.accent}
          strokeWidth={22}
          strokeLinecap="round"
        />
      ) : null}
      <circle cx={cx} cy={cy} r={16} fill={ink.paper} />
    </g>
  );
};

type EscapeArrowsProps = CutProps & {
  /** A superfície de onde as setas saem: a do mar, quando há. */
  readonly sea?: SeaLayer;
  /** Quanto da tentativa de escapar ainda existe, de 0 (a Terra parada) a 1. */
  readonly strength: number;
  /** Quanto as setas se afastam da superfície, em pixels: é o que as faz pulsar. */
  readonly beat?: number;
};

// As latitudes que levam seta. Nos polos não há nenhuma: ali a tentativa é nula.
const ESCAPE_LATITUDES = [0, 38, -38, 64, -64] as const;

/**
 * A tentativa de escapar para fora, no corte de lado: setas em tracejado (o
 * mesmo tracejado da reta que a roupa tentava seguir) que apontam para longe
 * do eixo, e não do centro. O tamanho acompanha a volta que cada latitude dá:
 * a maior no equador, nenhuma nos polos.
 */
export const EscapeArrows: React.FC<EscapeArrowsProps> = ({
  cx,
  cy,
  r,
  bulge = CUT_BULGE,
  sea = { equator: 0, pole: 0 },
  strength,
  beat = 0,
}) => {
  const a = r * (1 + bulge + sea.equator);
  const b = r * (1 + sea.pole);
  return (
    <g>
      {([-1, 1] as const).flatMap((side) =>
        ESCAPE_LATITUDES.map((lat) => {
          const phi = (lat * Math.PI) / 180;
          const from = cx + side * (a * Math.cos(phi) + 40 + beat);
          const y = cy - b * Math.sin(phi);
          const length = r * 0.8 * Math.cos(phi) * strength;
          // Seta curta demais é só a ponta: some antes disso.
          return length < 40 ? null : (
            <Arrow
              key={`${side}${lat}`}
              from={[from, y]}
              to={[from + side * length, y]}
              color={ink.paper}
              width={12}
              dashed
            />
          );
        }),
      )}
    </g>
  );
};

type SeaFlowProps = CutProps & {
  readonly sea: SeaLayer;
  /** O tempo do plano, em segundos: as marcas correm com ele. */
  readonly seconds: number;
  readonly opacity: number;
};

/** A água descendo da cintura para os polos: marcas que correm rente à superfície, dos dois lados, nos dois sentidos. */
export const SeaFlow: React.FC<SeaFlowProps> = ({
  cx,
  cy,
  r,
  bulge = CUT_BULGE,
  sea,
  seconds,
  opacity,
}) => {
  if (opacity <= 0) {
    return null;
  }
  // Por fora da superfície, do mar ou da rocha que ficou seca: sobre o índigo, as marcas se leem sempre.
  const a = r * (1 + bulge + Math.max(0, sea.equator)) + 26;
  const b = r * (1 + sea.pole) + 26;
  return (
    <g>
      {([-1, 1] as const).flatMap((sx) =>
        ([-1, 1] as const).flatMap((sy) =>
          [0, 1, 2].map((k) => {
            const t = (((seconds * 0.45 + k / 3) % 1) + 1) % 1;
            const at = ((10 + 68 * t) * Math.PI) / 180;
            const x = cx + sx * a * Math.cos(at);
            const y = cy - sy * b * Math.sin(at);
            const heading =
              (Math.atan2(-sy * b * Math.cos(at), -sx * a * Math.sin(at)) * 180) / Math.PI;
            return (
              <path
                key={`${sx}${sy}${k}`}
                d="M-12,-18 L12,0 L-12,18"
                fill="none"
                stroke={earth.waterLight}
                strokeWidth={11}
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity={opacity * Math.sin(Math.PI * t)}
                transform={`translate(${x} ${y}) rotate(${heading})`}
              />
            );
          }),
        ),
      )}
    </g>
  );
};
