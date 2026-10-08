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
import { daylightTones, savannaFinish } from "../palette";

import { SAVANNA_GROUND_Y } from "./savanna/RichTheme";

type SavannaProps = {
  /** 1 é pleno dia, 0 é noite fechada; no meio, o entardecer. */
  readonly daylight: number;
  /** Posição do sol (de dia) ou da lua (de noite) ao longo do arco: 0 nasce à esquerda, 1 se põe à direita; sem valor, o céu fica sem astro. */
  readonly orb?: number;
  /** O que mais houver no céu, atrás das colinas: o arco da noite, por exemplo. */
  readonly sky?: React.ReactNode;
  /**
   * O acabamento do cenário (unidades `cenario` e `forma`): as copas num tom que se distingue do céu, o capim de
   * traço gordo e a poeira atrás do assunto. Desligado, a savana é a do
   * animatic aprovado.
   */
  readonly finish?: boolean;
  /** O assunto, no plano do chão. */
  readonly children: React.ReactNode;
};

// Acácias ao fundo: x, largura da copa e altura, no plano do assunto.
const TREES = [
  [-200, 300, 260],
  [330, 240, 220],
  [1500, 320, 280],
  [2050, 260, 230],
] as const;
// Capim: moitas no chão, x e altura.
const TUFTS = [120, 480, 760, 1100, 1420, 1760, 2000] as const;
const ARC = { x: 960, y: 1000, rx: 1400, ry: 820 };

/** Da noite ao dia passando pelo entardecer, para o meio do caminho não ficar barrento. */
const blend = (day: string, dusk: string, night: string, daylight: number) =>
  interpolateColors(daylight, [0, 0.5, 1], [night, dusk, day]);

/**
 * A savana das elefantas, em camadas: céu com o sol ou a lua, colinas ao
 * longe, acácias, chão ocre com capim e uma moita desfocada em primeiro
 * plano. O dia e a noite são a mesma pintura em dois jogos de cor, e a luz
 * passa de um ao outro.
 */
export const Savanna: React.FC<SavannaProps> = ({
  daylight: ownDaylight,
  orb: ownOrb,
  sky: skyExtras,
  finish = false,
  children,
}) => {
  const id = useId();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const seconds = frame / fps;
  const build = useBuild().risen;
  // Na mesma savana do plano anterior, a luz e o astro continuam de onde estavam.
  const daylight = useCarriedNumber("savanna-daylight", ownDaylight);
  const carriedOrb = useCarriedNumber("savanna-orb", ownOrb ?? 0);
  const orb = ownOrb === undefined ? undefined : carriedOrb;
  const { day, dusk, night } = daylightTones;
  const color = (key: "sun" | "far" | "trees" | "grass") =>
    blend(day[key], dusk[key], night[key], daylight);
  const sky = [0, 1].map((index) =>
    blend(day.sky[index], dusk.sky[index], night.sky[index], daylight),
  );
  const ground = [0, 1].map((index) =>
    blend(day.ground[index], dusk.ground[index], night.ground[index], daylight),
  );
  // O astro percorre um arco de leste a oeste.
  const angle = Math.PI * (1 - (orb ?? 0));
  const orbAt = [
    ARC.x + ARC.rx * Math.cos(angle),
    // Com o cenário fora do palco, o astro está abaixo do horizonte: ele nasce e se põe junto.
    ARC.y - ARC.ry * Math.sin(angle) + (1 - build) * ARC.ry,
  ];
  const isNight = daylight < 0.5;
  // O acabamento vale de dia e de noite, e as cores dele passam de um jogo ao
  // outro com a luz: decidido pela hora, o desenho trocava num quadro quando o sol se punha.
  const lit = finish;
  const tint = (pick: (set: { readonly tree: string }) => string) =>
    blend(
      pick(savannaFinish.day),
      pick(savannaFinish.dusk),
      pick(savannaFinish.night),
      daylight,
    );
  const glow = {
    tree: tint((set) => set.tree),
  };
  const dust = (
    <Layer depth={0.8}>
      {/* Poeira e sementes no ar: o que impede o quadro de congelar. */}
      <Drifters
        seed="savanna-dust"
        count={40}
        color={color("sun")}
        opacity={isNight ? 0.35 : 0.3}
        size={[2, 5]}
      />
    </Layer>
  );

  return (
    <>
      <Layer depth={0}>
        <AbsoluteFill
          style={{
            background: `linear-gradient(${sky[0]}, ${sky[1]} 75%)`,
          }}
        />
        <SvgLayer>
          {isNight
            ? Array.from({ length: lit ? 16 : 50 }, (_, index) => {
                const pick = (trait: string) =>
                  random(`savanna-star-${trait}-${index}`);
                if (
                  lit &&
                  Math.hypot(
                    pick("x") * 1920 - orbAt[0],
                    pick("y") * 620 - orbAt[1],
                  ) < 340
                ) {
                  return null;
                }
                return (
                  <circle
                    key={index}
                    cx={pick("x") * 1920}
                    cy={pick("y") * 620}
                    r={(lit ? 4 : 1.5) + pick("size") * (lit ? 3 : 2.5)}
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
                r={150}
                fill={color("sun")}
                opacity={0.14}
              />
              <circle cx={orbAt[0]} cy={orbAt[1]} r={72} fill={color("sun")} />
              {isNight ? (
                // A sombra que faz da lua uma crescente tem a cor do céu.
                <circle
                  cx={orbAt[0] + 28}
                  cy={orbAt[1] - 20}
                  r={62}
                  fill={sky[0]}
                />
              ) : null}
            </>
          )}
        </SvgLayer>
        {skyExtras}
      </Layer>

      <Layer depth={0.3}>
        <SvgLayer>
          <path
            d={
              lit
                ? "M-400,770 C-100,650 250,650 520,720 C760,780 1000,640 1320,650 C1620,660 1820,760 2300,680 L2300,900 L-400,900 Z"
                : "M-400,760 C0,680 500,720 900,700 C1300,680 1700,720 2300,690 L2300,900 L-400,900 Z"
            }
            fill={color("far")}
          />
        </SvgLayer>
      </Layer>

      <Layer depth={0.6}>
        <SvgLayer>
          {TREES.map(([x, width, height]) => (
            <g
              key={x}
              fill={lit ? glow.tree : color("trees")}
              stroke={lit ? glow.tree : undefined}
              strokeWidth={18}
              strokeLinejoin="round"
            >
              <path
                d={taperPath(
                  [x, SAVANNA_GROUND_Y - 30],
                  [x + 10, SAVANNA_GROUND_Y - height * 0.6],
                  [x + 24, SAVANNA_GROUND_Y - height + 30],
                  26,
                  12,
                )}
              />
              <path
                d={`M${x - width / 2},${SAVANNA_GROUND_Y - height + 50} C${x - width * 0.3},${SAVANNA_GROUND_Y - height - 30} ${x + width * 0.35},${SAVANNA_GROUND_Y - height - 40} ${x + width / 2 + 20},${SAVANNA_GROUND_Y - height + 40} C${x + width * 0.2},${SAVANNA_GROUND_Y - height + 70} ${x - width * 0.2},${SAVANNA_GROUND_Y - height + 70} ${x - width / 2},${SAVANNA_GROUND_Y - height + 50} Z`}
              />
            </g>
          ))}
        </SvgLayer>
      </Layer>

      <Layer depth={1}>
        <SvgLayer>
          <defs>
            <linearGradient id={id} x1={0} y1={0} x2={0} y2={1}>
              <stop offset={0} stopColor={ground[0]} />
              <stop offset={1} stopColor={ground[1]} />
            </linearGradient>
          </defs>
          <path
            d={`M-400,${SAVANNA_GROUND_Y - 40} C200,${SAVANNA_GROUND_Y - 70} 900,${SAVANNA_GROUND_Y - 20} 1500,${SAVANNA_GROUND_Y - 50} C1900,${SAVANNA_GROUND_Y - 70} 2200,${SAVANNA_GROUND_Y - 30} 2300,${SAVANNA_GROUND_Y - 40} L2300,1400 L-400,1400 Z`}
            fill={`url(#${id})`}
          />
          {TUFTS.map((x, index) => (
            <g key={x} fill={color("grass")}>
              {[-26, -8, 10, 28].map((offset, blade) => (
                <path
                  key={blade}
                  stroke={lit ? color("grass") : undefined}
                  strokeWidth={8}
                  strokeLinejoin="round"
                  d={taperPath(
                    [x + offset, SAVANNA_GROUND_Y + 30 + (index % 3) * 40],
                    [
                      x +
                        offset +
                        8 * wave(seconds, 3.2, index / 4 + blade / 7),
                      SAVANNA_GROUND_Y - 10 + (index % 3) * 40,
                    ],
                    [
                      x +
                        offset * 1.6 +
                        14 * wave(seconds, 3.2, index / 4 + blade / 7),
                      SAVANNA_GROUND_Y -
                        50 -
                        (blade % 2) * 20 +
                        (index % 3) * 40,
                    ],
                    lit ? 18 : 12,
                    lit ? 2 : 3,
                  )}
                />
              ))}
            </g>
          ))}
        </SvgLayer>
        {children}
        <Leftovers />
      </Layer>

      {/* No acabamento não há poeira: cinza translúcido no ar lê como sujeira, e o capim já mexe o quadro. */}
      {finish ? null : dust}

      <Layer depth={1.4}>
        <AbsoluteFill
          style={{
            filter: "blur(10px)",
            transformOrigin: "50% 100%",
            rotate: `${1.5 * wave(seconds, 3.8)}deg`,
          }}
        >
          <SvgLayer>
            {[-60, 1980].map((x) => (
              <g key={x} fill={color("trees")} opacity={lit ? 1 : 0.7}>
                {[-60, -20, 20, 60].map((offset) => (
                  <path
                    key={offset}
                    d={taperPath(
                      [x + offset, 1150],
                      [x + offset * 1.5, 900],
                      [x + offset * 2.6, 680],
                      30,
                      4,
                    )}
                  />
                ))}
              </g>
            ))}
          </SvgLayer>
        </AbsoluteFill>
      </Layer>
    </>
  );
};
