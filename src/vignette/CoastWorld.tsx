import { AbsoluteFill } from "remotion";
import { Frigatebird } from "../art/Frigatebird";
import { Place } from "../components/Place";
import { SvgLayer } from "../components/SvgLayer";
import { bird, coast } from "./palette";
import { blob, pick, type WorldProps } from "./shapes";

/** A lagoa de onde a câmera veio: a mancha mais clara, no meio do quadro. */
export const LAGOON_SPOT = { x: 980, y: 560 };
// Cada ilha: o centro, os raios e quantas copas de árvore tem.
const ISLANDS = [
  { x: 430, y: 300, rx: 330, ry: 230, trees: 70 },
  { x: 1520, y: 760, rx: 360, ry: 250, trees: 80 },
  { x: 380, y: 900, rx: 190, ry: 130, trees: 26 },
  { x: 1590, y: 190, rx: 150, ry: 100, trees: 16 },
] as const;
// Cada nuvem: onde fica e o tamanho.
const CLOUDS = [
  [250, 620, 1.1],
  [1150, 180, 1.3],
  [1780, 470, 0.9],
  [820, 960, 1],
] as const;
// A sombra de tudo que voa cai para baixo e para a direita.
const SHADOW = [46, 62] as const;
const BIRDS = [
  [700, 470, 150, -18],
  [820, 380, 110, -24],
  [600, 610, 95, -12],
] as const;

type IslandProps = (typeof ISLANDS)[number] & { readonly seed: string };

/** Uma ilha vista de cima: a espuma, a praia, o capim e as copas das árvores. */
const Island: React.FC<IslandProps> = ({ x, y, rx, ry, trees, seed }) => (
  <g>
    <path
      d={blob(x, y, rx * 1.2, ry * 1.2, seed, 12)}
      fill={coast.shallow[1]}
    />
    <path
      d={blob(x, y, rx * 1.08, ry * 1.08, seed, 12)}
      fill="none"
      stroke={coast.foam}
      strokeWidth={10}
      strokeDasharray="60 34"
      strokeLinecap="round"
      opacity={0.85}
    />
    <path d={blob(x, y, rx, ry, seed, 12)} fill={coast.sand} />
    <path
      d={blob(x + 8, y + 10, rx * 0.86, ry * 0.86, seed, 12)}
      fill={coast.sandShade}
    />
    <path d={blob(x, y, rx * 0.82, ry * 0.82, seed, 12)} fill={coast.grass} />
    {/* As copas: a sombra de cada uma primeiro, e ela por cima. */}
    {Array.from({ length: trees }, (_, tree) => {
      const angle = pick(`${seed}-angle`, tree) * Math.PI * 2;
      const reach = Math.sqrt(pick(`${seed}-reach`, tree)) * 0.66;
      const tx = x + rx * reach * Math.cos(angle);
      const ty = y + ry * reach * Math.sin(angle);
      const size = 22 + pick(`${seed}-size`, tree) * 26;
      return (
        <g key={tree}>
          <circle cx={tx + 9} cy={ty + 12} r={size} fill={coast.canopyShade} />
          <circle cx={tx} cy={ty} r={size} fill={coast.canopy[tree % 3]} />
        </g>
      );
    })}
  </g>
);

type CloudProps = {
  readonly x: number;
  readonly y: number;
  readonly size: number;
  readonly fill: string;
  readonly opacity?: number;
};

/** Uma nuvem vista de cima: bojos sobrepostos. */
const Cloud: React.FC<CloudProps> = ({ x, y, size, fill, opacity = 1 }) => (
  <g
    transform={`translate(${x} ${y}) scale(${size})`}
    fill={fill}
    opacity={opacity}
  >
    <circle cx={-90} cy={10} r={60} />
    <circle cx={-20} cy={-26} r={84} />
    <circle cx={70} cy={0} r={70} />
    <circle cx={10} cy={30} r={66} />
    <circle cx={140} cy={24} r={44} />
  </g>
);

/**
 * O terceiro mundo da vinheta: a costa vista do alto. O mar escurece para as
 * bordas; no meio, a lagoa rasa e clara de onde a câmera veio, cercada de
 * recife; em volta, ilhas de mangue com praia, um barco, nuvens com a sombra
 * no mar e aves cruzando o quadro.
 */
// As nuvens derivam devagar; as aves voam para onde o bico aponta.
const CLOUD_DRIFT = 30;
const FLIGHT = [150, 48] as const;

export const CoastWorld: React.FC<WorldProps> = ({ seconds }) => (
  <AbsoluteFill
    style={{
      background: `radial-gradient(ellipse 75% 75% at 50% 50%, ${coast.sea[0]}, ${coast.sea[1]} 60%, ${coast.sea[2]})`,
    }}
  >
    <SvgLayer>
      {/* Os baixios: cada mancha mais clara é água mais rasa. */}
      <path
        d={blob(LAGOON_SPOT.x, LAGOON_SPOT.y, 620, 400, "shelf", 14)}
        fill={coast.shallow[0]}
        opacity={0.55}
      />
      <path
        d={blob(LAGOON_SPOT.x, LAGOON_SPOT.y, 430, 280, "shallow", 12)}
        fill={coast.shallow[0]}
      />
      {/* O recife em volta da lagoa: um anel partido, rosado. */}
      <path
        d={blob(LAGOON_SPOT.x, LAGOON_SPOT.y, 350, 228, "reef", 12)}
        fill="none"
        stroke={coast.reef}
        strokeWidth={22}
        strokeDasharray="120 46 60 40"
        strokeLinecap="round"
      />
      <path
        d={blob(LAGOON_SPOT.x, LAGOON_SPOT.y, 270, 170, "lagoon", 12)}
        fill={coast.shallow[1]}
      />
      <path
        d={blob(LAGOON_SPOT.x + 10, LAGOON_SPOT.y, 150, 96, "lagoon-core", 10)}
        fill={coast.shallow[2]}
      />
      {/* Bancos de areia soltos, entre as ilhas. */}
      {[
        [760, 250, 110, 26, 20],
        [1250, 420, 90, 22, -30],
        [1160, 900, 130, 28, 12],
      ].map(([x, y, rx, ry, tilt]) => (
        <ellipse
          key={x}
          cx={x}
          cy={y}
          rx={rx}
          ry={ry}
          transform={`rotate(${tilt} ${x} ${y})`}
          fill={coast.sand}
        />
      ))}

      {ISLANDS.map((island, index) => (
        <Island key={island.x} {...island} seed={`island-${index}`} />
      ))}

      {/* As linhas de espuma das ondas, ao largo. */}
      <g
        fill="none"
        stroke={coast.foam}
        strokeWidth={7}
        strokeLinecap="round"
        opacity={0.55}
      >
        {Array.from({ length: 18 }, (_, index) => {
          const x = 60 + pick("wave-x", index) * 1800;
          const y = 40 + pick("wave-y", index) * 1000;
          return <path key={index} d={`M${x},${y} q34,-16 68,0 t68,0`} />;
        })}
      </g>

      {/* O barco, com a esteira dele. */}
      <g transform="translate(1180 660) rotate(-28)">
        <path
          d="M-70,0 L-260,-40 M-70,0 L-260,40"
          stroke={coast.foam}
          strokeWidth={8}
          strokeLinecap="round"
          opacity={0.7}
        />
        <path d="M-60,-22 L40,-22 L80,0 L40,22 L-60,22 Z" fill={coast.boat} />
        <rect
          x={-36}
          y={-12}
          width={50}
          height={24}
          rx={6}
          fill={coast.boatDeck}
        />
      </g>

      {/* As sombras das nuvens no mar, e as nuvens. */}
      {CLOUDS.map(([x, y, size]) => (
        <Cloud
          key={`shadow-${x}`}
          x={x + CLOUD_DRIFT * seconds + SHADOW[0] * 2}
          y={y + SHADOW[1] * 2}
          size={size}
          fill={coast.shadow}
          opacity={0.22}
        />
      ))}
      {CLOUDS.map(([x, y, size]) => (
        <g key={x}>
          <Cloud
            x={x + CLOUD_DRIFT * seconds + 10}
            y={y + 16}
            size={size}
            fill={coast.cloudShade}
          />
          <Cloud
            x={x + CLOUD_DRIFT * seconds}
            y={y}
            size={size}
            fill={coast.cloud}
          />
        </g>
      ))}
    </SvgLayer>

    {/* As aves, vistas de cima, com a sombra no mar. */}
    {BIRDS.map(([x, y, span, tilt]) => (
      <div key={x}>
        <Place
          x={x - FLIGHT[0] * seconds + SHADOW[0]}
          y={y - FLIGHT[1] * seconds + SHADOW[1]}
          style={{
            rotate: `${tilt}deg`,
            opacity: 0.22,
            filter: "brightness(0)",
          }}
        >
          <Frigatebird width={span} colors={bird} />
        </Place>
        <Place
          x={x - FLIGHT[0] * seconds}
          y={y - FLIGHT[1] * seconds}
          style={{ rotate: `${tilt}deg` }}
        >
          <Frigatebird width={span} colors={bird} />
        </Place>
      </div>
    ))}
  </AbsoluteFill>
);
