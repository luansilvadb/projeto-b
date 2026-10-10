import "../../../design/fonts";
import { useId } from "react";
import { typography } from "../../../design/tokens";
import { blockSea, earth, ink, tags, type TagTone } from "../palette";
import { Globe } from "./Globe";

/**
 * A Terra em corte, de lado: a metade de lá (a oeste) é o planeta visto de
 * fora, girando; a de cá mostra a rocha por dentro. A camada de mar, quando
 * existe, veste as duas metades. Os dois raios (`CutRays`) e a água que
 * escorre (`SeaFlow`) vão por cima, no mesmo SVG, com as mesmas medidas.
 *
 * A cintura alargada e o calombo são exagero de desenho: a diferença real é
 * de 21 km em 6.378. Todo plano que usa este desenho leva a etiqueta "exagerado".
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

/** A espessura da camada de mar, em fração do raio: no equador e nos polos. */
export type SeaLayer = { readonly equator: number; readonly pole: number };

/** O mar que só veste a Terra, o calombo do giro e a água já nos polos. */
export const SEA = {
  even: { equator: 0.09, pole: 0.07 },
  piled: { equator: 0.2, pole: 0.05 },
  polar: { equator: 0.03, pole: 0.24 },
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

type SeaFlowProps = CutProps & {
  readonly sea: SeaLayer;
  /** O tempo do plano, em segundos: as marcas correm com ele. */
  readonly seconds: number;
  readonly opacity: number;
};

/** A água escorrendo da cintura para os polos: marcas que sobem e descem pela camada de mar, dos dois lados. */
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
  // O meio da camada, por onde as marcas correm.
  const a = r * (1 + bulge) + (sea.equator * r) / 2 + 6;
  const b = r + (sea.pole * r) / 2 + 6;
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
                d="M-9,-13 L9,0 L-9,13"
                fill="none"
                stroke={ink.paper}
                strokeWidth={9}
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
