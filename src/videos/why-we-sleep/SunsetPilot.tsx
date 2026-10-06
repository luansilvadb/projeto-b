import { useId } from "react";
import { AbsoluteFill, random } from "remotion";
import { Antelope } from "../../art/Antelope";
import { taperPath } from "../../art/shapes";
import { Place } from "../../components/Place";
import { SvgLayer } from "../../components/SvgLayer";
import { antelope, sunset } from "./palette";

const HORIZON = 640;
const SUN = { x: 150, y: 330, radius: 78 };

type CloudProps = {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly body: string;
  readonly rim: string;
  readonly seed: string;
};

/** Uma nuvem de base reta e topo em gomos; por trás, a mesma forma mais alta, na cor da borda acesa. */
const Cloud: React.FC<CloudProps> = ({ x, y, width, body, rim, seed }) => {
  const id = useId();
  const puffs = Array.from({ length: 5 }, (_, index) => {
    const t = index / 4;
    // Os gomos do meio são os mais altos.
    const radius =
      width *
      (0.1 + 0.11 * Math.sin(t * Math.PI)) *
      (0.8 + 0.4 * random(`${seed}-${index}`));
    return { cx: x + (t - 0.5) * width * 0.7, radius };
  });
  const shape = (lift: number) => (
    <>
      {puffs.map(({ cx, radius }, index) => (
        <ellipse
          key={index}
          cx={cx}
          cy={y - radius * 0.3 - lift}
          rx={radius * 1.25}
          ry={radius * 0.62}
        />
      ))}
      <rect
        x={x - width / 2}
        y={y - 12 - lift}
        width={width}
        height={24}
        rx={12}
      />
    </>
  );
  return (
    <g clipPath={`url(#${id})`}>
      <clipPath id={id}>
        <rect x={x - width} y={y - width} width={width * 2} height={width} />
      </clipPath>
      <g fill={rim}>{shape(6)}</g>
      <g fill={body}>{shape(0)}</g>
    </g>
  );
};

type AcaciaProps = {
  readonly x: number;
  readonly y: number;
  readonly height: number;
  readonly fill: string;
  readonly rim?: string;
};

// Os gomos da copa: onde ficam, em frações da largura e da altura, e o tamanho de cada um.
const LOBES = [
  [-0.34, 0.12, 0.2],
  [-0.08, 0.02, 0.26],
  [0.24, 0.05, 0.24],
  [0.4, 0.14, 0.16],
  [-0.2, 0.17, 0.2],
  [0.1, 0.17, 0.22],
] as const;

/** Uma acácia: tronco que se abre em galhos e a copa chata, em gomos, com a borda de cima acesa. */
const Acacia: React.FC<AcaciaProps> = ({ x, y, height, fill, rim }) => {
  const width = height * 1.5;
  const top = y - height;
  const canopy = (lift: number) =>
    LOBES.map(([dx, dy, size], index) => (
      <ellipse
        key={index}
        cx={x + dx * width}
        cy={top + dy * height + height * 0.16 - lift}
        rx={size * width}
        ry={height * 0.075}
      />
    ));
  return (
    <g fill={fill}>
      <path
        d={taperPath(
          [x, y],
          [x - height * 0.03, y - height * 0.4],
          [x + height * 0.04, top + height * 0.3],
          height * 0.11,
          height * 0.06,
        )}
      />
      {[-1, 1].map((side) => (
        <path
          key={side}
          d={taperPath(
            [x + height * 0.03, top + height * 0.42],
            [x + side * width * 0.12, top + height * 0.32],
            [x + side * width * 0.3, top + height * 0.2],
            height * 0.055,
            height * 0.025,
          )}
        />
      ))}
      {rim ? <g fill={rim}>{canopy(height * 0.025)}</g> : null}
      {canopy(0)}
    </g>
  );
};

type TuftProps = {
  readonly x: number;
  readonly y: number;
  readonly size: number;
  readonly fill: string;
  readonly seed: string;
};

/** Uma moita de capim: lâminas em leque, a do meio mais alta. */
const Tuft: React.FC<TuftProps> = ({ x, y, size, fill, seed }) => (
  <g fill={fill}>
    {[-2, -1, 0, 1, 2].map((blade) => {
      const height =
        size *
        (1 - 0.16 * Math.abs(blade)) *
        (0.8 + 0.4 * random(`${seed}-${blade}`));
      return (
        <path
          key={blade}
          d={taperPath(
            [x + blade * size * 0.1, y],
            [x + blade * size * 0.16, y - height * 0.6],
            [x + blade * size * 0.34, y - height],
            size * 0.13,
            1,
          )}
        />
      );
    })}
  </g>
);

// As nuvens: x, y da base, largura e a distância (0 é a mais longe e mais clara).
const CLOUDS = [
  [620, 232, 300, 0],
  [860, 272, 110, 0],
  [1740, 214, 420, 1],
  [1380, 372, 560, 1],
  [1690, 392, 340, 2],
  [1060, 352, 200, 0],
  [520, 470, 520, 1],
  [70, 478, 260, 2],
  [1010, 486, 260, 0],
  [1290, 500, 200, 0],
  [760, 560, 360, 0],
] as const;
// A moldura de primeiro plano: x, y da base, tamanho, inclinação e o tom de cada tufo de folhas.
const FRAME = [
  [-40, 1120, 420, -30, 0],
  [120, 1140, 360, 14, 1],
  [300, 1130, 260, -8, 0],
  [520, 1120, 200, 20, 1],
  [760, 1110, 150, -16, 2],
  [980, 1110, 120, 12, 1],
  [1440, 1120, 200, -20, 0],
  [1640, 1130, 320, 10, 1],
  [1820, 1130, 400, -12, 0],
  [1960, 1120, 360, 24, 1],
] as const;

/**
 * O piloto do cenário rico: a savana no pôr do sol, com o antílope de traço
 * gordo. Céu em degradê, sol com anéis de luz, nuvens de borda acesa, quatro
 * planos de colinas, acácias em três distâncias, capim por todo o chão e uma
 * moldura escura em primeiro plano. O personagem é o mesmo das cenas.
 */
export const SunsetPilot: React.FC = () => {
  const id = useId();
  const pick = (seed: string) => random(`sunset-${seed}`);
  return (
    <AbsoluteFill>
      <SvgLayer>
        <defs>
          <linearGradient id={`${id}-sky`} x1={0} y1={0} x2={0} y2={1}>
            {[0, 0.34, 0.64, 0.84, 1].map((offset, index) => (
              <stop
                key={offset}
                offset={offset}
                stopColor={sunset.sky[index]}
              />
            ))}
          </linearGradient>
          <radialGradient
            id={`${id}-haze`}
            gradientUnits="userSpaceOnUse"
            cx={620}
            cy={HORIZON}
            r={760}
          >
            <stop offset={0} stopColor={sunset.sky[4]} stopOpacity={0.95} />
            <stop offset={1} stopColor={sunset.sky[3]} stopOpacity={0} />
          </radialGradient>
          <linearGradient id={`${id}-ground`} x1={0} y1={0} x2={0} y2={1}>
            {[0, 0.4, 1].map((offset, index) => (
              <stop
                key={offset}
                offset={offset}
                stopColor={sunset.ground[index]}
              />
            ))}
          </linearGradient>
        </defs>
        <rect width={1920} height={HORIZON + 40} fill={`url(#${id}-sky)`} />
        <rect width={1920} height={HORIZON + 40} fill={`url(#${id}-haze)`} />

        {/* O sol: três anéis de luz, cada um mais apagado, e o disco. */}
        {[330, 250, 170].map((radius, ring) => (
          <circle
            key={radius}
            cx={SUN.x}
            cy={SUN.y}
            r={radius}
            fill={sunset.glow[ring]}
            opacity={0.3 + 0.2 * ring}
          />
        ))}
        <circle
          cx={SUN.x}
          cy={SUN.y}
          r={SUN.radius + 30}
          fill={sunset.sky[4]}
        />
        <circle cx={SUN.x} cy={SUN.y} r={SUN.radius} fill={sunset.sun} />

        {CLOUDS.map(([x, y, width, tone], index) => (
          <Cloud
            key={index}
            x={x}
            y={y}
            width={width}
            body={sunset.cloud[tone]}
            rim={sunset.cloudRim[tone === 0 ? 0 : 1]}
            seed={`cloud-${index}`}
          />
        ))}

        {/* As colinas: quatro planos, cada um mais escuro e mais nítido que o de trás. */}
        <path
          d={`M0,${HORIZON - 70} C260,${HORIZON - 150} 520,${HORIZON - 60} 760,${HORIZON - 30} C1100,${HORIZON - 120} 1500,${HORIZON - 130} 1920,${HORIZON - 60} L1920,${HORIZON + 60} L0,${HORIZON + 60} Z`}
          fill={sunset.hills[0]}
        />
        <path
          d={`M0,${HORIZON - 20} C300,${HORIZON - 80} 560,${HORIZON - 10} 840,${HORIZON + 10} C1080,${HORIZON - 100} 1420,${HORIZON - 110} 1920,${HORIZON - 30} L1920,${HORIZON + 80} L0,${HORIZON + 80} Z`}
          fill={sunset.hills[1]}
        />
        {(
          [
            [60, 90],
            [620, 76],
            [1120, 108],
            [1820, 84],
          ] as const
        ).map(([x, height]) => (
          <Acacia
            key={x}
            x={x}
            y={HORIZON + 26}
            height={height}
            fill={sunset.treeFar}
          />
        ))}
        <path
          d={`M0,${HORIZON + 30} C380,${HORIZON - 30} 760,${HORIZON + 40} 1040,${HORIZON + 44} C1340,${HORIZON - 20} 1640,${HORIZON - 10} 1920,${HORIZON + 30} L1920,${HORIZON + 120} L0,${HORIZON + 120} Z`}
          fill={sunset.hills[2]}
        />
        <Acacia x={1130} y={HORIZON + 80} height={120} fill={sunset.hills[3]} />
        <Acacia x={470} y={HORIZON + 86} height={70} fill={sunset.hills[3]} />

        {/* O chão: a luz rasante junto ao horizonte, e a frente na sombra. */}
        <path
          d={`M0,${HORIZON + 78} C500,${HORIZON + 50} 1300,${HORIZON + 96} 1920,${HORIZON + 66} L1920,1080 L0,1080 Z`}
          fill={`url(#${id}-ground)`}
        />
        {Array.from({ length: 9 }, (_, index) => (
          <ellipse
            key={index}
            cx={pick(`light-x-${index}`) * 1920}
            cy={HORIZON + 110 + pick(`light-y-${index}`) * 170}
            rx={160 + 260 * pick(`light-w-${index}`)}
            ry={9 + 8 * pick(`light-h-${index}`)}
            fill={sunset.groundLight}
            opacity={0.55}
          />
        ))}
        {Array.from({ length: 8 }, (_, index) => (
          <ellipse
            key={index}
            cx={pick(`shade-x-${index}`) * 1920}
            cy={HORIZON + 250 + pick(`shade-y-${index}`) * 190}
            rx={200 + 300 * pick(`shade-w-${index}`)}
            ry={14 + 10 * pick(`shade-h-${index}`)}
            fill={sunset.groundShade}
            opacity={0.35}
          />
        ))}

        {/* As duas acácias do plano médio, com a borda de cima acesa pelo sol. */}
        <Acacia
          x={300}
          y={HORIZON + 130}
          height={250}
          fill={sunset.tree}
          rim={sunset.treeRim}
        />
        <Acacia
          x={1570}
          y={HORIZON + 150}
          height={330}
          fill={sunset.tree}
          rim={sunset.treeRim}
        />

        {/* Pedras ao longe, e o capim, que cresce e escurece com a proximidade. */}
        {Array.from({ length: 6 }, (_, index) => {
          const depth = pick(`rock-y-${index}`);
          return (
            <ellipse
              key={index}
              cx={pick(`rock-x-${index}`) * 1920}
              cy={HORIZON + 120 + depth * 260}
              rx={16 + 26 * depth}
              ry={6 + 9 * depth}
              fill={sunset.rock}
            />
          );
        })}
        {Array.from({ length: 46 }, (_, index) => {
          const depth = pick(`tuft-y-${index}`) ** 1.3;
          const tone = Math.min(
            2,
            Math.floor(depth * 2.4 + pick(`tuft-c-${index}`) * 0.8),
          );
          return (
            <Tuft
              key={index}
              x={pick(`tuft-x-${index}`) * 1920}
              y={HORIZON + 110 + depth * 330}
              size={26 + 90 * depth}
              fill={sunset.grass[tone]}
              seed={`tuft-${index}`}
            />
          );
        })}

        {/* O capim alto atrás do antílope, e a sombra comprida dele, para longe do sol. */}
        {Array.from({ length: 16 }, (_, index) => (
          <Tuft
            key={index}
            x={1480 + index * 30}
            y={HORIZON + 250}
            size={150 + 110 * pick(`tall-${index}`)}
            fill={sunset.grass[index % 2 === 0 ? 2 : 1]}
            seed={`tall-${index}`}
          />
        ))}
        <path
          d={`M1270,${HORIZON + 226} L1560,${HORIZON + 250} L1560,${HORIZON + 264} L1270,${HORIZON + 238} Z`}
          fill={sunset.shadow}
          opacity={0.55}
        />
      </SvgLayer>

      <Place x={1330} y={HORIZON + 236} anchor="bottom">
        <Antelope width={240} colors={antelope} finish ear={1} lid={0} />
      </Place>

      <SvgLayer>
        {/* A moldura de primeiro plano: folhas escuras, cortadas pela borda, nos dois cantos. */}
        {FRAME.map(([x, y, size, lean, tone], index) => (
          <g
            key={index}
            transform={`rotate(${lean} ${x} ${y})`}
            fill={sunset.frame[tone]}
          >
            {[-1, 0, 1].map((leaf) => {
              const base = x + leaf * size * 0.3;
              const tip = x + leaf * size * 0.5;
              const top = y - size * (1 - 0.18 * Math.abs(leaf));
              return (
                <path
                  key={leaf}
                  d={`M${base},${y} C${base - size * 0.24},${y - size * 0.5} ${tip - size * 0.18},${y - size * 0.9} ${tip},${top} C${tip + size * 0.16},${y - size * 0.6} ${base + size * 0.2},${y - size * 0.3} ${base},${y} Z`}
                />
              );
            })}
          </g>
        ))}
      </SvgLayer>
    </AbsoluteFill>
  );
};
