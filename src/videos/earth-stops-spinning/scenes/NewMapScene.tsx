import { AbsoluteFill, random, useCurrentFrame, useVideoConfig } from "remotion";
import { wave } from "../../../components/Idle";
import { Place } from "../../../components/Place";
import { Pop } from "../../../components/Pop";
import { cue, mix, ramp, settle } from "../../../components/timing";
import type { SceneProps } from "../../../video/NarratedVideo";
import { Shot, useShotLength } from "../../../video/Shot";
import { HEIGHT, WIDTH } from "../../../format";
import { blockSea, sea } from "../palette";
import { Caveat } from "../parts/CutEarth";
import { MAP_SPOTS, MapWorld, PLAINS_DRY } from "../parts/MapWorld";
import { Frame, Push, SeaBackdrop, SourceSeal, Svg, Tag } from "../parts/kit";

/**
 * Os dois planos mostram o resultado da simulação de Fraczek, e não um fato
 * medido: os dois levam a etiqueta no mesmo canto (o de baixo, à esquerda, porque
 * o de cima é das planícies do norte) e o selo da fonte.
 */
const Simulated: React.FC = () => (
  <>
    <Place x={310} y={930}>
      <Caveat on="light">simulação</Caveat>
    </Place>
    {/* O selo vem aceso do plano anterior, que já o mostrava. */}
    <SourceSeal steady>Fraczek, Esri</SourceSeal>
  </>
);

type NorthProps = {
  /** Os quadros em que cada planície é nomeada e em que a fala as põe debaixo da água. */
  readonly canadaAt: number;
  readonly siberiaAt: number;
  readonly sinkAt: number;
};

/** A câmera sobe para o norte do mapa novo: as duas planícies somem debaixo da água. */
const NorthGoesUnder: React.FC<NorthProps> = ({ canadaAt, siberiaAt, sinkAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const length = useShotLength();
  // Parte do mapa inteiro, onde a cena anterior o deixou, e segue se aproximando devagar.
  const zoom = mix(1, 1.38, ramp(frame, 0, 0.9 * fps)) * mix(1, 1.04, frame / length);
  const box = { x: (-(zoom - 1) * WIDTH) / 2, y: 0, width: WIDTH * zoom, height: HEIGHT * zoom };
  const spot = (at: readonly [number, number]) => ({
    x: box.x + at[0] * box.width,
    // A etiqueta fica presa à borda de cima da planície, para não cobrir o que afunda.
    y: (at[1] - 0.052) * box.height,
  });
  return (
    <Frame backdrop={<SeaBackdrop />}>
      <Svg>
        {/*
          As planícies chegam secas, como a cena anterior as deixou; a água sobe sobre elas
          depois que a primeira é nomeada e acaba de cobri-las em "debaixo".
        */}
        <MapWorld
          {...box}
          moved={1}
          flood={mix(PLAINS_DRY, 1, ramp(frame, canadaAt + 0.2 * fps, Math.max(fps, sinkAt - canadaAt)))}
        />
      </Svg>
      <Place {...spot(MAP_SPOTS.canada)}>
        <Pop at={canadaAt}>
          <Tag on="light" size="note">
            norte do Canadá
          </Tag>
        </Pop>
      </Place>
      <Place {...spot(MAP_SPOTS.siberia)}>
        <Pop at={siberiaAt}>
          <Tag on="light" size="note">
            norte da Sibéria
          </Tag>
        </Pop>
      </Place>
      <Simulated />
    </Frame>
  );
};

const CRACK_ROWS = 7;

/** A lama rachada, em perspectiva: uma malha de pontos sorteados, mais aberta perto da câmera. */
const Cracks: React.FC<{ readonly horizon: number; readonly opacity: number }> = ({
  horizon,
  opacity,
}) => {
  const point = (row: number, column: number) => {
    const depth = (row / (CRACK_ROWS - 1)) ** 1.7;
    // Semente fixa: os quadros são renderizados em paralelo, e a malha não pode tremer.
    const jitter = (axis: string) => random(`crack-${axis}-${row}-${column}`) - 0.5;
    return {
      x: WIDTH / 2 + (column + 0.7 * jitter("x")) * mix(150, 520, depth),
      y: horizon + 26 + (depth + 0.07 * jitter("y")) * (HEIGHT - horizon + 80),
    };
  };
  return (
    <g fill="none" stroke={sea.crack} strokeLinecap="round" strokeLinejoin="round" opacity={opacity}>
      {Array.from({ length: CRACK_ROWS }, (_, row) => {
        const lines = Array.from({ length: 17 }, (__, index) => {
          const column = index - 8;
          const here = point(row, column);
          const east = point(row, column + 1);
          const near = point(Math.min(CRACK_ROWS - 1, row + 1), column);
          return `M${east.x.toFixed(0)},${east.y.toFixed(0)} L${here.x.toFixed(0)},${here.y.toFixed(0)} L${near.x.toFixed(0)},${near.y.toFixed(0)}`;
        });
        return (
          <path key={row} d={lines.join(" ")} strokeWidth={mix(5, 13, row / (CRACK_ROWS - 1))} />
        );
      })}
    </g>
  );
};

/** O navio, de lado: a quilha fica em (0, 0). */
const Ship: React.FC = () => (
  <>
    <path d="M-330,-140 L340,-140 Q310,-40 240,0 L-250,0 Q-310,-50 -330,-140 Z" fill={sea.ship} />
    <path d="M-300,-52 L296,-52 Q272,-16 240,0 L-250,0 Q-284,-22 -300,-52 Z" fill={sea.stamp} />
    <rect x={-250} y={-250} width={230} height={112} rx={12} fill={sea.paper} />
    {[-222, -150, -78].map((x) => (
      <rect key={x} x={x} y={-222} width={44} height={36} rx={8} fill={sea.deep} />
    ))}
    <rect x={-180} y={-350} width={78} height={102} fill={sea.stamp} />
    <rect x={-180} y={-350} width={78} height={30} fill={sea.ship} />
    <rect x={30} y={-206} width={96} height={66} fill={sea.reef} />
    <rect x={136} y={-206} width={96} height={66} fill={sea.coral} />
    <rect x={84} y={-272} width={96} height={66} fill={sea.land} />
  </>
);

/** A câmera desce até o equador: a água acaba de escoar, e o navio assenta, torto, na lama rachada. */
const DrySeabed: React.FC<{ readonly dryAt: number }> = ({ dryAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const seconds = frame / fps;
  // A câmera desce: o chão sobe no quadro.
  const horizon = mix(900, 560, ramp(frame, 0, 0.8 * fps));
  // A água termina de escoar quando a fala diz que o fundo virou chão.
  const draining = Math.max(0.6 * fps, dryAt - 0.2 * fps);
  const dried = ramp(frame, 0.5 * fps, draining);
  const aground = settle(frame, 0.5 * fps + 0.6 * draining, 0.8 * fps);
  // Boiando, ele balança; encalhado, deita de lado e para.
  const bob = (1 - aground) * wave(seconds, 2.2);
  return (
    <Frame
      backdrop={
        <AbsoluteFill
          style={{ background: `linear-gradient(${blockSea.sky[0]}, ${blockSea.sky[1]} 62%)` }}
        />
      }
    >
      <Push focus={[1000, 700]} to={1.05}>
        <Svg>
          <path
            d={`M0,${horizon} L0,${horizon - 40} L210,${horizon - 64} L470,${horizon - 60} L560,${horizon - 18} L1240,${horizon - 14} L1330,${horizon - 86} L1700,${horizon - 92} L1790,${horizon - 30} L1920,${horizon - 26} L1920,${horizon} Z`}
            fill={blockSea.far}
          />
          <rect x={0} y={horizon} width={WIDTH} height={HEIGHT} fill={sea.dry} />
          <rect x={0} y={horizon} width={WIDTH} height={46} fill={sea.landShade} opacity={0.55} />
          <Cracks horizon={horizon} opacity={dried} />
          {/* O resto de água, que escoa. */}
          <rect
            x={0}
            y={horizon}
            width={WIDTH}
            height={HEIGHT}
            fill={sea.water[1]}
            opacity={0.9 * (1 - dried)}
          />
          <ellipse
            cx={980}
            cy={horizon + 262}
            rx={380}
            ry={30}
            fill={sea.crack}
            opacity={0.45 * aground}
          />
          <g
            transform={`translate(980 ${horizon + 232 + 26 * aground + 8 * bob}) rotate(${-9 * aground + 2 * bob})`}
          >
            <Ship />
          </g>
        </Svg>
      </Push>
      <Simulated />
    </Frame>
  );
};

export const NewMapScene: React.FC<SceneProps> = ({ scene, shots }) => (
  <>
    <Shot range={shots[0]} name="o norte afunda">
      <NorthGoesUnder
        canadaAt={cue(scene, "Canadá")}
        siberiaAt={cue(scene, "Sibéria")}
        sinkAt={cue(scene, "debaixo")}
      />
    </Shot>
    <Shot range={shots[1]} name="o fundo do mar seco">
      <DrySeabed dryAt={cue(scene, "vira") - shots[1].from} />
    </Shot>
  </>
);
