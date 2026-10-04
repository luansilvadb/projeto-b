import { AbsoluteFill } from "remotion";
import { Cassiopea } from "../art/Cassiopea";
import { Place } from "../components/Place";
import { SvgLayer } from "../components/SvgLayer";
import { jellyfish, lagoon } from "./palette";
import { blob, pick, ridge, type WorldProps } from "./shapes";

const FLOOR = 850;
/** Onde a água-viva pousa: é dela a célula do mundo anterior. */
export const JELLYFISH = { x: 960, y: 800, width: 380 };
const BLADES = 46;
const SCHOOL = 16;

type CoralProps = {
  readonly x: number;
  readonly y: number;
  readonly size: number;
  readonly color: string;
};

/** Coral em galhos: um tronco que se abre em ramos de ponta redonda. */
const BranchCoral: React.FC<CoralProps> = ({ x, y, size, color }) => (
  <g
    transform={`translate(${x} ${y}) scale(${size})`}
    fill="none"
    stroke={color}
    strokeWidth={22}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M0,0 L0,-90 M0,-50 L-50,-120 L-56,-170 M-50,-120 L-90,-140 M0,-90 L40,-150 L36,-210 M40,-150 L84,-176 M0,-90 L-10,-190" />
  </g>
);

/** Coral-cérebro: uma cúpula com os sulcos. */
const BrainCoral: React.FC<CoralProps> = ({ x, y, size, color }) => (
  <g transform={`translate(${x} ${y}) scale(${size})`}>
    <path d="M-110,0 A110,96 0 0 1 110,0 Z" fill={color} />
    <g
      fill="none"
      stroke={lagoon.coralShade}
      strokeWidth={9}
      strokeLinecap="round"
      opacity={0.6}
    >
      <path d="M-70,-20 q20,-30 40,0 t40,0 t40,-4" />
      <path d="M-50,-56 q16,-20 34,-2 t36,2" />
      <path d="M-20,-80 q14,-10 30,2" />
    </g>
  </g>
);

/** Esponjas em tubo: três canos de alturas diferentes, com a boca escura. */
const TubeSponge: React.FC<CoralProps> = ({ x, y, size, color }) => (
  <g transform={`translate(${x} ${y}) scale(${size})`}>
    {[
      [-50, 130],
      [0, 190],
      [52, 100],
    ].map(([dx, height]) => (
      <g key={dx}>
        <rect
          x={dx - 26}
          y={-height}
          width={52}
          height={height}
          rx={22}
          fill={color}
        />
        <ellipse
          cx={dx}
          cy={-height + 12}
          rx={18}
          ry={9}
          fill={lagoon.coralShade}
        />
      </g>
    ))}
  </g>
);

/** Coral em leque: um meio disco com as nervuras. */
const FanCoral: React.FC<CoralProps> = ({ x, y, size, color }) => (
  <g transform={`translate(${x} ${y}) scale(${size})`}>
    <path d="M-120,-40 A130,150 0 0 1 120,-40 L10,0 L-10,0 Z" fill={color} />
    <g stroke={lagoon.coralShade} strokeWidth={6} opacity={0.5}>
      {[-70, -35, 0, 35, 70].map((dx) => (
        <line key={dx} x1={0} y1={0} x2={dx * 1.5} y2={-150 + Math.abs(dx)} />
      ))}
    </g>
    <rect x={-10} y={-6} width={20} height={36} rx={8} fill={color} />
  </g>
);

/** Um peixinho do cardume: o corpo e a cauda. */
const SmallFish: React.FC<{ x: number; y: number; size: number }> = ({
  x,
  y,
  size,
}) => (
  <g transform={`translate(${x} ${y}) scale(${size})`} fill={lagoon.school}>
    <ellipse rx={26} ry={12} />
    <path d="M20,0 L46,-14 L46,14 Z" />
  </g>
);

/**
 * O segundo mundo da vinheta: o fundo de uma lagoa rasa. Feixes de luz descem
 * da superfície; ao fundo, recifes em silhueta; no chão de areia, corais,
 * esponjas, capim-marinho e a água-viva pousada; um cardume cruza o alto.
 */
export const LagoonWorld: React.FC<WorldProps> = ({ seconds }) => (
  <AbsoluteFill
    style={{
      background: `linear-gradient(${lagoon.water[0]}, ${lagoon.water[1]} 30%, ${lagoon.water[2]} 68%, ${lagoon.water[3]})`,
    }}
  >
    <SvgLayer>
      {/* Os feixes de luz e o rendilhado da superfície. */}
      {[180, 520, 880, 1260, 1620].map((x, index) => (
        <path
          key={x}
          d={`M${x},-20 L${x + 150},-20 L${x + 420 - index * 70},1100 L${x + 40 - index * 70},1100 Z`}
          fill={lagoon.ray}
          opacity={0.1 + 0.04 * (index % 2)}
        />
      ))}
      <path
        d="M-20,-20 H1940 V46 q-120,40 -240,0 t-240,0 t-240,0 t-240,0 t-240,0 t-240,0 t-240,0 t-260,0 Z"
        fill={lagoon.ray}
        opacity={0.35}
      />

      {/* O recife, em duas distâncias. */}
      <path d={ridge(640, 70, 760, 0.6)} fill={lagoon.far} />
      <path d={ridge(740, 56, 520, 2.1)} fill={lagoon.mid} />
      {/* Rochas grandes dos dois lados, com a face de cima mais clara. */}
      <path d={blob(250, 800, 300, 190, "rock-a")} fill={lagoon.rock} />
      <path d={blob(230, 740, 220, 90, "rock-a-top")} fill={lagoon.rockLight} />
      <path d={blob(1680, 790, 320, 210, "rock-b")} fill={lagoon.rock} />
      <path
        d={blob(1700, 720, 230, 96, "rock-b-top")}
        fill={lagoon.rockLight}
      />

      {/* Os corais das rochas. */}
      <FanCoral x={150} y={660} size={1} color={lagoon.coral[2]} />
      <BranchCoral x={330} y={690} size={1.1} color={lagoon.coral[0]} />
      <TubeSponge x={1560} y={650} size={1} color={lagoon.coral[1]} />
      <BranchCoral x={1760} y={660} size={0.95} color={lagoon.coral[3]} />
      <BrainCoral x={1650} y={700} size={0.8} color={lagoon.coral[4]} />

      {/* O chão de areia, com as ondulações. */}
      <path d={ridge(FLOOR, 22, 900, 1)} fill={lagoon.sand[0]} />
      <path d={ridge(FLOOR + 110, 16, 620, 3)} fill={lagoon.sand[1]} />
      <g
        fill="none"
        stroke={lagoon.sandShade}
        strokeWidth={7}
        strokeLinecap="round"
        opacity={0.6}
      >
        {Array.from({ length: 14 }, (_, index) => {
          const x = 80 + pick("ripple-x", index) * 1760;
          const y = FLOOR + 40 + pick("ripple-y", index) * 170;
          return <path key={index} d={`M${x},${y} q40,-14 80,0`} />;
        })}
      </g>

      {/* O capim-marinho, em touceiras de três verdes. */}
      {Array.from({ length: BLADES }, (_, index) => {
        const cluster = [120, 520, 700, 1230, 1420, 1820][index % 6];
        const x = cluster + (pick("blade-x", index) - 0.5) * 150;
        const height = 130 + pick("blade-h", index) * 230;
        const lean =
          (pick("blade-lean", index) - 0.5) * 120 +
          22 * Math.sin(seconds * 1.5 + index * 0.7);
        return (
          <path
            key={index}
            d={`M${x - 11},${FLOOR + 30} Q${x + lean * 0.3},${FLOOR - height * 0.6} ${x + lean},${FLOOR - height} Q${x + lean * 0.4 + 12},${FLOOR - height * 0.5} ${x + 11},${FLOOR + 30} Z`}
            fill={lagoon.grass[index % 3]}
          />
        );
      })}

      {/* O que está no chão: corais baixos, estrela, conchas e pedras. */}
      <BrainCoral x={600} y={890} size={1} color={lagoon.coral[3]} />
      <TubeSponge x={1330} y={880} size={0.85} color={lagoon.coral[2]} />
      <BranchCoral x={1180} y={900} size={0.7} color={lagoon.coral[1]} />
      <path
        d="M0,-44 L12,-14 L44,-12 L18,8 L28,40 L0,20 L-28,40 L-18,8 L-44,-12 L-12,-14 Z"
        transform="translate(780 980) rotate(14)"
        fill={lagoon.star}
        stroke={lagoon.star}
        strokeWidth={10}
        strokeLinejoin="round"
      />
      {[
        [420, 990],
        [1500, 1000],
        [1010, 1010],
      ].map(([x, y]) => (
        <g key={x}>
          <path
            d={`M${x - 30},${y} A30,26 0 0 1 ${x + 30},${y} Z`}
            fill={lagoon.shell}
          />
          <path
            d={`M${x - 16},${y} L${x - 8},${y - 20} M${x},${y} L${x},${y - 24} M${x + 16},${y} L${x + 8},${y - 20}`}
            stroke={lagoon.sandShade}
            strokeWidth={4}
          />
        </g>
      ))}

      {/* O cardume, lá em cima, e dois peixes maiores. */}
      {Array.from({ length: SCHOOL }, (_, index) => (
        <SmallFish
          key={index}
          x={
            260 + (index % 6) * 78 + pick("school-x", index) * 40 - 70 * seconds
          }
          y={210 + Math.floor(index / 6) * 56 + pick("school-y", index) * 30}
          size={0.8 + pick("school-size", index) * 0.5}
        />
      ))}
      {[
        [1380, 330, 1.5, lagoon.fish[0]],
        [1520, 430, 1.1, lagoon.fish[1]],
      ].map(([x, y, size, color]) => (
        <g
          key={x}
          transform={`translate(${x} ${y}) scale(${-Number(size)} ${size})`}
        >
          <ellipse rx={62} ry={34} fill={String(color)} />
          <path d="M50,0 L104,-36 L104,36 Z" fill={String(color)} />
          <rect x={-18} y={-34} width={14} height={68} fill={lagoon.fish[2]} />
          <rect x={14} y={-30} width={12} height={60} fill={lagoon.fish[2]} />
          <circle cx={-36} cy={-8} r={9} fill={lagoon.near} />
        </g>
      ))}

      {/* Bolhas subindo. */}
      {Array.from({ length: 16 }, (_, index) => (
        <circle
          key={index}
          cx={100 + pick("bubble-x", index) * 1720}
          cy={740 - ((pick("bubble-y", index) * 620 + seconds * 90) % 620)}
          r={6 + pick("bubble-r", index) * 14}
          fill="none"
          stroke={lagoon.bubble}
          strokeWidth={4}
          opacity={0.7}
        />
      ))}
    </SvgLayer>

    <Place x={JELLYFISH.x} y={JELLYFISH.y}>
      <Cassiopea
        width={JELLYFISH.width}
        colors={jellyfish}
        pulse={0.5 + 0.5 * Math.sin(seconds * 5)}
        sway={0.5 * Math.sin(seconds * 1.3)}
      />
    </Place>

    {/* Bem perto da câmera: algas em silhueta, emoldurando o quadro. */}
    <SvgLayer>
      {[
        [-40, 520, 60],
        [70, 380, -30],
        [160, 640, 40],
        [1760, 600, -50],
        [1860, 420, 30],
        [1950, 700, -20],
      ].map(([x, height, lean]) => (
        <path
          key={x}
          d={`M${x - 44},1100 Q${x + lean * 0.4},${1080 - height * 0.6} ${x + lean},${1080 - height} Q${x + lean * 0.5 + 40},${1080 - height * 0.5} ${x + 44},1100 Z`}
          fill={lagoon.near}
        />
      ))}
    </SvgLayer>
  </AbsoluteFill>
);
