import { useId } from "react";
import { earth, home } from "../palette";

/**
 * A Terra do vídeo, vista de lado, sem rosto: um disco com os continentes
 * deslizando para leste (a direita do quadro) conforme ela gira. Vai dentro de
 * um SVG. O polo norte fica em cima; o equador é a linha do meio.
 *
 * As contas de latitude daqui servem aos círculos, às setas e aos marcadores
 * que as cenas põem sobre ela: tudo o que fica "na Terra" usa `surfacePoint`.
 */

// Largura, em unidades do disco (raio 100), da faixa de continentes que se repete.
const STRIP = 400;

const Continents: React.FC = () => (
  <>
    <g fill={earth.land}>
      <path d="M -60 -50 C -40 -70 -10 -60 -5 -35 C 0 -15 -25 -5 -20 15 C -15 35 0 50 -10 70 C -20 80 -35 60 -40 40 C -45 20 -60 10 -65 -10 C -70 -30 -70 -40 -60 -50 Z" />
      <path d="M 40 -60 C 70 -75 110 -65 120 -40 C 128 -20 105 -10 95 5 C 88 20 95 45 80 55 C 65 62 55 40 50 20 C 46 0 25 -5 25 -25 C 25 -45 30 -55 40 -60 Z" />
      <path d="M 150 20 C 165 12 185 18 188 32 C 190 45 172 52 158 48 C 146 44 142 28 150 20 Z" />
      <path d="M 230 -40 C 250 -55 280 -45 285 -25 C 288 -8 268 0 252 -4 C 236 -8 222 -25 230 -40 Z" />
      <path d="M 300 10 C 320 0 345 12 342 34 C 340 52 318 60 304 48 C 292 38 290 18 300 10 Z" />
    </g>
    <g fill={earth.landShade} opacity={0.55}>
      <path d="M -40 40 C -30 50 -12 52 -10 70 C -20 80 -35 60 -40 40 Z" />
      <path d="M 60 30 C 72 36 90 40 80 55 C 65 62 58 44 60 30 Z" />
    </g>
  </>
);

/**
 * Onde um ponto da superfície aparece, com o disco de raio `r` centrado na
 * origem: `lat` em graus (norte positivo) e `lon` em voltas (0 é o meio do
 * disco, de frente; 0,25 é a borda leste). `front` diz se está do lado visível.
 */
export const surfacePoint = (
  r: number,
  lat: number,
  lon: number,
  bulge = 0,
): { readonly x: number; readonly y: number; readonly front: boolean } => {
  const phi = (lat * Math.PI) / 180;
  const theta = lon * Math.PI * 2;
  return {
    x: r * (1 + bulge) * Math.cos(phi) * Math.sin(theta),
    y: -r * Math.sin(phi),
    front: Math.cos(theta) >= 0,
  };
};

type GlobeProps = {
  readonly cx: number;
  readonly cy: number;
  readonly r: number;
  /** Voltas já dadas: os continentes deslizam para leste conforme cresce. */
  readonly spin?: number;
  /** Quanto a cintura alarga, em fração do raio: 0 é a esfera. O exagero é de quem chama, e leva etiqueta. */
  readonly bulge?: number;
  /** A sombra do lado oposto à luz, de 0 a 1. */
  readonly shade?: number;
  /** De que lado vem a luz: -1 é da esquerda (o padrão), 1 é da direita. Sempre um pouco de cima. */
  readonly lightFrom?: -1 | 1;
  /** As calotas de gelo dos polos. */
  readonly caps?: boolean;
  /** Sem continentes: só o mar (para o que as cenas pintam por cima). */
  readonly bare?: boolean;
  /** O que é pintado na superfície, recortado pelo disco, em unidades de raio 100. */
  readonly children?: React.ReactNode;
};

export const Globe: React.FC<GlobeProps> = ({
  cx,
  cy,
  r,
  spin = 0,
  bulge = 0,
  shade = 0.32,
  lightFrom = -1,
  caps = true,
  bare = false,
  children,
}) => {
  const id = useId();
  const drift = (((spin % 1) + 1) % 1) * STRIP;
  const k = r / 100;
  return (
    <g transform={`translate(${cx} ${cy}) scale(${k * (1 + bulge)} ${k})`}>
      <defs>
        <radialGradient id={`${id}-ocean`} cx={30 * lightFrom} cy="-30" r="140" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={earth.ocean[0]} />
          <stop offset="0.5" stopColor={earth.ocean[1]} />
          <stop offset="1" stopColor={earth.ocean[2]} />
        </radialGradient>
        <clipPath id={`${id}-disc`}>
          <circle r="100" />
        </clipPath>
        {/* Sobra só a meia-lua oposta à luz, que vira a sombra do planeta. */}
        <mask id={`${id}-shade`}>
          <circle r="100" fill="white" />
          <circle cx={26 * lightFrom} cy="-26" r="100" fill="black" />
        </mask>
      </defs>
      <circle r="100" fill={`url(#${id}-ocean)`} />
      <g clipPath={`url(#${id}-disc)`}>
        {bare ? null : (
          <g transform={`translate(${drift - STRIP} 0)`}>
            <Continents />
            <g transform={`translate(${STRIP} 0)`}>
              <Continents />
            </g>
          </g>
        )}
        {caps ? (
          <>
            <ellipse cy="-98" rx="44" ry="13" fill={earth.ice} />
            <ellipse cy="98" rx="52" ry="14" fill={earth.ice} />
          </>
        ) : null}
        {children}
      </g>
      <circle r="100" fill={earth.shade} opacity={shade} mask={`url(#${id}-shade)`} />
    </g>
  );
};

type LatitudeRingProps = {
  readonly cx: number;
  readonly cy: number;
  readonly r: number;
  /** A latitude do círculo, em graus. */
  readonly lat: number;
  readonly bulge?: number;
  readonly color: string;
  readonly width?: number;
  /** Onde está a conta que corre pelo círculo, em voltas; sem valor, não há conta. */
  readonly runner?: number;
  readonly opacity?: number;
};

/**
 * Um círculo de latitude sobre a Terra de lado: a metade de cá, cheia; a de
 * lá, apagada. A conta que corre nele mostra a volta que aquele chão dá.
 */
export const LatitudeRing: React.FC<LatitudeRingProps> = ({
  cx,
  cy,
  r,
  lat,
  bulge = 0,
  color,
  width = 8,
  runner,
  opacity = 1,
}) => {
  const phi = (lat * Math.PI) / 180;
  const rx = r * (1 + bulge) * Math.cos(phi);
  const ry = rx * 0.16;
  const y = cy - r * Math.sin(phi);
  const dot = runner === undefined ? null : surfacePoint(r, lat, runner, bulge);
  // No polo o círculo é um ponto: com aro escuro, para não sumir na calota branca.
  if (Math.cos(phi) < 0.02) {
    return (
      <circle cx={cx} cy={y} r={width * 1.8} fill={color} stroke={earth.shade} strokeWidth={width * 0.7} opacity={opacity} />
    );
  }
  return (
    <g opacity={opacity}>
      <path
        d={`M${cx - rx},${y} A${rx},${ry} 0 0 1 ${cx + rx},${y}`}
        fill="none"
        stroke={color}
        strokeWidth={width * 0.6}
        opacity={0.3}
      />
      <path
        d={`M${cx - rx},${y} A${rx},${ry} 0 0 0 ${cx + rx},${y}`}
        fill="none"
        stroke={color}
        strokeWidth={width}
        strokeLinecap="round"
      />
      {dot ? (
        <circle
          cx={cx + dot.x}
          cy={y + (dot.front ? 1 : -1) * ry * Math.abs(Math.cos(runner! * Math.PI * 2))}
          r={width * 1.6}
          fill={color}
          opacity={dot.front ? 1 : 0.35}
        />
      ) : null}
    </g>
  );
};

/** A casinha de quem assiste: o marcador de São Paulo na Terra, e a casa vista de fora. A base fica em (x, y). */
export const House: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly size: number;
  readonly rotate?: number;
  readonly opacity?: number;
}> = ({ x, y, size, rotate = 0, opacity = 1 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rotate}) scale(${size / 100})`} opacity={opacity}>
    <rect x={-40} y={-56} width={80} height={56} fill={home.houseWall} />
    <path d="M-52,-54 L0,-100 L52,-54 Z" fill={home.roof} />
    <rect x={-12} y={-34} width={24} height={34} fill={home.curtainShade} />
    <rect x={16} y={-44} width={16} height={16} fill={home.sky[0]} />
  </g>
);

/**
 * O chão de São Paulo na faixa de continentes: um ponto de terra na latitude
 * −23,5°, na ponta sul do primeiro continente. É onde a casinha fica.
 */
export const HOME_LAND: readonly [number, number] = [-26, 100 * Math.sin((23.5 * Math.PI) / 180)];

/**
 * Onde um ponto fixo da faixa de continentes (`at`, em unidades de raio 100)
 * aparece com o disco de raio `r` centrado na origem, depois de `spin` voltas.
 * A faixa desliza reta, e não pela conta da esfera de `surfacePoint`: o que
 * precisa ficar preso a um continente (a casinha, uma ilha) usa esta conta, e
 * anda junto com a mancha. `front` diz se o ponto está dentro do disco.
 */
export const landPoint = (
  r: number,
  spin: number,
  at: readonly [number, number] = HOME_LAND,
): { readonly x: number; readonly y: number; readonly front: boolean } => {
  const slid = at[0] + (((spin % 1) + 1) % 1) * STRIP;
  // A faixa se repete: o ponto está na cópia mais perto do meio do disco.
  const x = ((((slid + STRIP / 2) % STRIP) + STRIP) % STRIP) - STRIP / 2;
  return { x: (x * r) / 100, y: (at[1] * r) / 100, front: Math.hypot(x, at[1]) <= 100 };
};

/** As voltas (`spin`) em que o ponto `at` da faixa fica a `x` unidades (raio 100) do meio do disco. */
export const spinFor = (x: number, at: readonly [number, number] = HOME_LAND): number =>
  (x - at[0]) / STRIP;
