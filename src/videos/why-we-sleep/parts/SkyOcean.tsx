import { Leftovers } from "../../../components/Actors";
import { useId } from "react";
import {
  AbsoluteFill,
  interpolateColors,
  random,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { taperPath } from "../../../art/shapes";
import { Layer, useBuild, useCarriedNumber } from "../../../components/Camera";
import { Drifters } from "../../../components/Drifters";
import { wave } from "../../../components/Idle";
import { SvgLayer } from "../../../components/SvgLayer";
import { sky } from "../palette";

/** Onde o mar começa, no plano do assunto: o céu ocupa quase tudo. */
export const HORIZON_Y = 840;

type SkyOceanProps = {
  /** 1 é pleno dia, 0 é noite fechada; no meio, o entardecer. */
  readonly daylight: number;
  /** Posição do sol ou da lua ao longo do arco, de 0 (nasce) a 1 (se põe); sem valor, não há astro. */
  readonly orb?: number;
  /** Uma ilha entra no quadro, de 0 (fora) a 1 (no lugar). */
  readonly island?: number;
  /** O que mais houver no céu, atrás das nuvens: o arco do dia, por exemplo. */
  readonly extras?: React.ReactNode;
  /** O assunto, no plano do céu. */
  readonly children: React.ReactNode;
};

// Nuvens: x, y, largura, profundidade.
const CLOUDS = [
  [200, 260, 300, 0.35],
  [700, 160, 220, 0.25],
  [1250, 320, 360, 0.45],
  [1750, 200, 240, 0.3],
  [-100, 520, 280, 0.6],
  [1500, 560, 320, 0.65],
] as const;
const ARC = { x: 960, y: HORIZON_Y + 100, rx: 1300, ry: 760 };
/** Onde a ilha pousa quando está no lugar, e o galho em que a fragata pousa. */
export const ISLAND = {
  x: 1380,
  y: HORIZON_Y + 10,
  branch: [1340, 640] as const,
};

const blend = (day: string, dusk: string, night: string, daylight: number) =>
  interpolateColors(daylight, [0, 0.5, 1], [night, dusk, day]);

/**
 * O céu da fragata, sobre o oceano: imenso, com nuvens em camadas que andam
 * devagar, o sol ou a lua no arco, e uma faixa de mar lá embaixo. O dia e a
 * noite são a mesma pintura em dois jogos de cor; o entardecer fica no meio.
 */
export const SkyOcean: React.FC<SkyOceanProps> = ({
  daylight: ownDaylight,
  orb: ownOrb,
  island = 0,
  extras,
  children,
}) => {
  const id = useId();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const seconds = frame / fps;
  // As nuvens, além de subir com as camadas, chegam pelos lados.
  const build = useBuild().risen;
  // No mesmo céu do plano anterior, a luz e o astro continuam de onde estavam.
  const daylight = useCarriedNumber("sky-daylight", ownDaylight);
  const carriedOrb = useCarriedNumber("sky-orb", ownOrb ?? 0);
  const orb = ownOrb === undefined ? undefined : carriedOrb;
  const { day, dusk, night } = sky;
  const color = (key: "top" | "bottom" | "cloud" | "cloudShade" | "sun") =>
    blend(day[key], dusk[key], night[key], daylight);
  const sea = [0, 1].map((index) =>
    blend(day.sea[index], dusk.sea[index], night.sea[index], daylight),
  );
  const angle = Math.PI * (1 - (orb ?? 0));
  const orbAt = [
    ARC.x + ARC.rx * Math.cos(angle),
    // Com o cenário fora do palco, o astro está abaixo do horizonte: ele nasce junto.
    ARC.y - ARC.ry * Math.sin(angle) + (1 - build) * ARC.ry,
  ];
  const isNight = daylight < 0.5;
  const islandX = ISLAND.x + 900 * (1 - island);

  return (
    <>
      <Layer depth={0}>
        <AbsoluteFill
          style={{
            background: `linear-gradient(${color("top")}, ${color("bottom")} ${(HORIZON_Y / 1080) * 100}%)`,
          }}
        />
        <SvgLayer>
          {isNight
            ? Array.from({ length: 70 }, (_, index) => {
                const pick = (trait: string) =>
                  random(`sky-star-${trait}-${index}`);
                return (
                  <circle
                    key={index}
                    cx={pick("x") * 1920}
                    cy={pick("y") * 700}
                    r={1.5 + pick("size") * 2.5}
                    fill={night.sun}
                    opacity={
                      (1 - daylight * 2) *
                      (0.4 +
                        0.5 * pick("light") +
                        0.1 * wave(seconds, 2.4, pick("phase")))
                    }
                  />
                );
              })
            : null}
          {orb === undefined ? null : (
            <>
              <circle
                cx={orbAt[0]}
                cy={orbAt[1]}
                r={160}
                fill={color("sun")}
                opacity={0.14}
              />
              <circle cx={orbAt[0]} cy={orbAt[1]} r={76} fill={color("sun")} />
              {isNight ? (
                <circle
                  cx={orbAt[0] + 30}
                  cy={orbAt[1] - 22}
                  r={66}
                  fill={color("top")}
                />
              ) : null}
            </>
          )}
        </SvgLayer>
        {extras}
      </Layer>

      {CLOUDS.map(([x, y, width, depth], index) => (
        <Layer key={index} depth={depth}>
          <SvgLayer>
            <g
              transform={`translate(${30 * wave(seconds, 9, index / 6) + (x < 960 ? -1 : 1) * (1 - build) * (900 + 600 * depth)} 0)`}
            >
              <ellipse
                cx={x}
                cy={y}
                rx={width / 2}
                ry={width * 0.16}
                fill={color("cloud")}
              />
              <ellipse
                cx={x - width * 0.2}
                cy={y - width * 0.1}
                rx={width * 0.26}
                ry={width * 0.16}
                fill={color("cloud")}
              />
              <ellipse
                cx={x + width * 0.15}
                cy={y - width * 0.14}
                rx={width * 0.3}
                ry={width * 0.2}
                fill={color("cloud")}
              />
              <ellipse
                cx={x + width * 0.1}
                cy={y + width * 0.08}
                rx={width * 0.42}
                ry={width * 0.1}
                fill={color("cloudShade")}
              />
            </g>
          </SvgLayer>
        </Layer>
      ))}

      <Layer depth={0.5}>
        <SvgLayer>
          <defs>
            <linearGradient id={id} x1={0} y1={0} x2={0} y2={1}>
              <stop offset={0} stopColor={sea[0]} />
              <stop offset={1} stopColor={sea[1]} />
            </linearGradient>
          </defs>

          <rect
            x={-600}
            y={HORIZON_Y}
            width={3200}
            height={600}
            fill={`url(#${id})`}
          />
          {[0, 1, 2].map((row) => (
            <path
              key={row}
              d={`M-600,${HORIZON_Y + 40 + row * 60} ${Array.from({ length: 16 }, (_, i) => `q100,-${8 + 4 * wave(seconds, 3, i / 5 + row / 3)} 200,0`).join(" ")}`}
              fill="none"
              stroke={color("cloud")}
              strokeWidth={4}
              strokeLinecap="round"
              opacity={0.25 - row * 0.06}
            />
          ))}
        </SvgLayer>
      </Layer>

      {island > 0 ? (
        <Layer depth={1}>
          <SvgLayer>
            <g transform={`translate(${islandX - ISLAND.x} 0)`}>
              {/* A ilha: um morro baixo, uma árvore com o galho em que ela pousa. */}
              <path
                d={`M${ISLAND.x - 420},${ISLAND.y + 40} C${ISLAND.x - 300},${ISLAND.y - 80} ${ISLAND.x - 80},${ISLAND.y - 110} ${ISLAND.x + 120},${ISLAND.y - 60} C${ISLAND.x + 280},${ISLAND.y - 20} ${ISLAND.x + 380},${ISLAND.y + 20} ${ISLAND.x + 440},${ISLAND.y + 60} L${ISLAND.x + 440},${ISLAND.y + 300} L${ISLAND.x - 420},${ISLAND.y + 300} Z`}
                fill={blend(day.sea[1], dusk.sea[1], night.sea[1], daylight)}
              />
              <path
                d={taperPath(
                  [ISLAND.x + 60, ISLAND.y - 50],
                  [ISLAND.x + 90, ISLAND.y - 180],
                  [ISLAND.x + 60, ISLAND.y - 290],
                  40,
                  16,
                )}
                fill={blend(day.sea[1], dusk.sea[1], night.sea[1], daylight)}
              />
              <path
                d={taperPath(
                  [ISLAND.x + 70, ISLAND.y - 150],
                  [ISLAND.x + 10, ISLAND.y - 190],
                  [ISLAND.branch[0] - 100, ISLAND.branch[1] + 10],
                  22,
                  10,
                )}
                fill={blend(day.sea[1], dusk.sea[1], night.sea[1], daylight)}
              />
              <ellipse
                cx={ISLAND.x + 60}
                cy={ISLAND.y - 300}
                rx={150}
                ry={70}
                fill={blend(day.sea[0], dusk.sea[0], night.sea[0], daylight)}
              />
            </g>
          </SvgLayer>
        </Layer>
      ) : null}

      <Layer depth={1}>
        {children}
        <Leftovers />
      </Layer>

      <Layer depth={0.9}>
        <Drifters
          seed="sky-motes"
          count={24}
          color={color("cloud")}
          opacity={0.25}
          size={[2, 5]}
        />
      </Layer>
    </>
  );
};
