import { loadFont } from "@remotion/fonts";
import { AbsoluteFill, staticFile } from "remotion";
import { StarField } from "../components/StarField";
import { SvgLayer } from "../components/SvgLayer";
import { space } from "./palette";
import { blob, pick, type WorldProps } from "./shapes";
import { mix } from "../components/timing";

loadFont({
  family: "Lilita One",
  url: staticFile("fonts/lilitaone-latin-normal.ttf"),
  weight: "400",
});

// O globo é desenhado com raio 300 e posto no tamanho pedido.
const GLOBE = 300;
// A costa de onde a câmera veio, em unidades do globo.
const MARK = [-40, -20] as const;
// Cada continente: o centro e os raios, em unidades do globo.
const LANDS = [
  [-120, -110, 150, 110],
  [-180, 70, 90, 130],
  [60, 120, 130, 80],
  [150, -60, 110, 90],
  [10, -220, 100, 50],
  [240, 130, 70, 90],
] as const;
// Cada nuvem: o centro e o tamanho.
const CLOUDS = [
  [-170, -30, 1],
  [40, -150, 0.8],
  [120, 30, 1.2],
  [-60, 180, 0.9],
  [210, -160, 0.6],
] as const;

type GlobeProps = {
  /** O centro do planeta no quadro e o raio dele. */
  readonly x: number;
  readonly y: number;
  readonly radius: number;
  readonly seconds: number;
};

/**
 * O planeta: oceano, continentes, calotas, nuvens, o lado da noite com as
 * luzes das cidades e os anéis da atmosfera. O ponto turquesa é a costa de
 * onde a câmera veio. Vai dentro de um SvgLayer.
 */
export const Globe: React.FC<GlobeProps> = ({ x, y, radius, seconds }) => (
  <g transform={`translate(${x} ${y}) scale(${radius / GLOBE})`}>
    <defs>
      <clipPath id="vignette-globe">
        <circle r={GLOBE} />
      </clipPath>
    </defs>
    {[150, 90, 40].map((halo, index) => (
      <circle
        key={halo}
        r={GLOBE + halo}
        fill={space.atmosphere}
        opacity={0.08 + index * 0.07}
      />
    ))}
    <circle r={GLOBE} fill={space.ocean} />
    <g clipPath="url(#vignette-globe)">
      <path
        d={blob(-90, -80, 300, 260, "sea-light")}
        fill={space.oceanLight}
        opacity={0.35}
      />
      {LANDS.map(([cx, cy, rx, ry], index) => (
        <g key={index}>
          <path
            d={blob(cx, cy, rx, ry, `land-${index}`, 9, 0.5)}
            fill={space.land}
          />
          <path
            d={blob(
              cx - rx * 0.2,
              cy - ry * 0.2,
              rx * 0.5,
              ry * 0.45,
              `hill-${index}`,
              7,
              0.5,
            )}
            fill={space.landLight}
          />
        </g>
      ))}
      <ellipse cy={-GLOBE + 6} rx={150} ry={46} fill={space.ice} />
      <ellipse cy={GLOBE - 4} rx={170} ry={50} fill={space.ice} />
      {/* A costa da vinheta, marcada na beira de um continente. */}
      <circle
        cx={MARK[0]}
        cy={MARK[1]}
        r={20}
        fill="none"
        stroke={space.mark}
        strokeWidth={6}
      />
      <circle cx={MARK[0]} cy={MARK[1]} r={8} fill={space.mark} />
      {CLOUDS.map(([cx, cy, size]) => (
        <g
          key={cx}
          // As nuvens andam devagar sobre o planeta.
          transform={`translate(${cx + 14 * seconds} ${cy}) scale(${size})`}
          fill={space.cloud}
          opacity={0.92}
        >
          <circle cx={-44} cy={6} r={30} />
          <circle cx={0} cy={-10} r={42} />
          <circle cx={48} cy={4} r={32} />
          <circle cx={90} cy={12} r={20} />
        </g>
      ))}
      {/* O lado da noite, com as luzes das cidades. */}
      <path
        d={`M90,${-GLOBE - 10} Q-60,0 90,${GLOBE + 10} L${GLOBE + 10},${GLOBE + 10} L${GLOBE + 10},${-GLOBE - 10} Z`}
        fill={space.shade}
        opacity={0.62}
      />
      {Array.from({ length: 26 }, (_, index) => (
        <circle
          key={index}
          cx={110 + pick("city-x", index) * 170}
          cy={-200 + pick("city-y", index) * 400}
          r={3 + pick("city-r", index) * 3}
          fill={space.city}
        />
      ))}
    </g>
  </g>
);

// Onde o planeta está enquanto é um mundo, e onde assenta atrás do nome do canal.
const AS_WORLD = { x: 1020, y: 560, radius: 310 };
/** O planeta permanece grande quando o letreiro atravessa a frente dele. */
const symbolAt = (channel?: string) =>
  channel ? { x: 960, y: 540, radius: 360 } : { x: 960, y: 540, radius: 230 };
/** Onde a costa marcada no planeta cai no quadro, enquanto ele é um mundo. */
export const COAST_MARK = [
  AS_WORLD.x + (MARK[0] * AS_WORLD.radius) / GLOBE,
  AS_WORLD.y + (MARK[1] * AS_WORLD.radius) / GLOBE,
] as const;

type PlanetWorldProps = WorldProps & {
  /** Quanto o planeta já virou o símbolo do canal, de 0 a 1: o resto do espaço se afasta e o nome entra. */
  readonly settled?: number;
  /** O nome do canal, que assina a vinheta sobre o planeta. */
  readonly channel?: string;
};


/**
 * O quarto mundo da vinheta, e o fecho dela: o planeta no espaço, com o sol de
 * um lado, a lua do outro, nebulosas ao fundo e um satélite passando. No fim,
 * tudo em volta se afasta e o planeta assenta atrás do letreiro do canal.
 */
export const PlanetWorld: React.FC<PlanetWorldProps> = ({
  seconds,
  settled = 0,
  channel,
}) => (
  <AbsoluteFill
    style={{
      background: `linear-gradient(160deg, ${space.sky[0]}, ${space.sky[1]})`,
    }}
  >
    <SvgLayer>
      {/* As nebulosas: manchas largas, bem ao fundo. */}
      <g opacity={1 - 0.6 * settled}>
        <path
          d={blob(360, 820, 520, 300, "nebula-a", 12)}
          fill={space.nebula[0]}
          opacity={0.5}
        />
        <path
          d={blob(1560, 240, 460, 280, "nebula-b", 12)}
          fill={space.nebula[1]}
          opacity={0.35}
        />
        <path
          d={blob(1500, 900, 380, 220, "nebula-c", 12)}
          fill={space.nebula[2]}
          opacity={0.4}
        />
      </g>
    </SvgLayer>
    <StarField count={260} seed="vignette" />
    <SvgLayer>
      {/* O sol, entrando pelo canto; sai por onde entrou quando o planeta vira símbolo. */}
      <g transform={`translate(${-700 * settled} ${-500 * settled})`}>
        {[520, 400, 300].map((radius, index) => (
          <circle
            key={radius}
            cx={-60}
            cy={130}
            r={radius}
            fill={space.sun}
            opacity={0.1 + index * 0.1}
          />
        ))}
        <circle cx={-60} cy={130} r={220} fill={space.sun} />
        <circle cx={-80} cy={110} r={150} fill={space.sunLight} />
      </g>

      <Globe
        x={mix(AS_WORLD.x, symbolAt(channel).x, settled)}
        y={mix(AS_WORLD.y, symbolAt(channel).y, settled)}
        radius={mix(AS_WORLD.radius, symbolAt(channel).radius, settled)}
        seconds={seconds}
      />

      {/* A lua, com as crateras e o lado da sombra. */}
      <g
        transform={`translate(${1610 + 500 * settled} ${250 - 400 * settled})`}
      >
        <circle r={78} fill={space.moon} />
        <circle cx={-24} cy={-20} r={16} fill={space.moonShade} />
        <circle cx={14} cy={24} r={22} fill={space.moonShade} />
        <circle cx={30} cy={-34} r={10} fill={space.moonShade} />
        <path
          d="M30,-74 Q-10,0 30,74 A78,78 0 0 0 30,-74 Z"
          fill={space.shade}
          opacity={0.4}
        />
      </g>
      {/* O satélite: o corpo, as duas placas e a antena. Segue a órbita dele e sai do quadro. */}
      <g
        transform={`translate(${470 + 60 * seconds - 1120 * settled} ${700 - 26 * seconds + 500 * settled}) rotate(-24)`}
      >
        <rect
          x={-120}
          y={-22}
          width={86}
          height={44}
          rx={6}
          fill={space.panel}
        />
        <rect x={34} y={-22} width={86} height={44} rx={6} fill={space.panel} />
        <rect
          x={-34}
          y={-30}
          width={68}
          height={60}
          rx={12}
          fill={space.hull}
        />
        <path d="M0,-30 L0,-64" stroke={space.hull} strokeWidth={6} />
        <circle cy={-70} r={10} fill={space.sun} />
      </g>
    </SvgLayer>
    {channel ? (
      <SvgLayer>
        <defs>
          <linearGradient id="vignette-logo-white" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={space.logo.white[0]} />
            <stop offset="42%" stopColor={space.logo.white[1]} />
            <stop offset="50%" stopColor={space.logo.white[2]} />
            <stop offset="56%" stopColor={space.logo.white[1]} />
            <stop offset="100%" stopColor={space.logo.white[0]} />
          </linearGradient>
          <linearGradient id="vignette-logo-gold" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={space.logo.gold[0]} />
            <stop offset="44%" stopColor={space.logo.gold[1]} />
            <stop offset="100%" stopColor={space.logo.gold[2]} />
          </linearGradient>
        </defs>
        <g
          opacity={Math.max(0, settled * 2 - 1)}
          transform="rotate(-2 960 540)"
          textAnchor="middle"
          fontFamily="Lilita One"
          fontWeight={400}
          strokeLinejoin="round"
          strokeLinecap="round"
          letterSpacing={-4}
        >
          {channel.split(/\s+/).map((word, index) => (
            <g key={`${word}-${index}`} fontSize={index === 0 ? 260 : 220}>
              <text
                x={960}
                y={535 + index * 190 + 24}
                fill={space.logo.outline}
                stroke={space.logo.outline}
                strokeWidth={20}
              >
                {word}
              </text>
              <text
                x={960}
                y={535 + index * 190 + 12}
                fill={space.logo.extrusion}
                stroke={space.logo.outline}
                strokeWidth={16}
              >
                {word}
              </text>
              <text
                x={960}
                y={535 + index * 190}
                fill={`url(#vignette-logo-${index === 0 ? "white" : "gold"})`}
                stroke={space.logo.outline}
                strokeWidth={14}
                paintOrder="stroke"
              >
                {word}
              </text>
            </g>
          ))}
        </g>
      </SvgLayer>
    ) : null}
  </AbsoluteFill>
);
