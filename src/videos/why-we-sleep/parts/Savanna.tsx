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
import { savanna, savannaFinish } from "../palette";

/** Onde as elefantas pisam no plano aberto. */
export const SAVANNA_GROUND_Y = 880;

type SavannaProps = {
  /** 1 é pleno dia, 0 é noite fechada; no meio, o entardecer. */
  readonly daylight: number;
  /** Posição do sol (de dia) ou da lua (de noite) ao longo do arco: 0 nasce à esquerda, 1 se põe à direita; sem valor, o céu fica sem astro. */
  readonly orb?: number;
  /** O que mais houver no céu, atrás das colinas: o arco da noite, por exemplo. */
  readonly sky?: React.ReactNode;
  /**
   * O acabamento do cenário (unidades `cenario` e `forma`): o luar com halo em
   * degraus e raios, nuvens que dão trama ao céu, borda de luz nas colinas e
   * nas copas, chão manchado e capim de traço gordo. Desligado, a savana é a
   * do animatic aprovado.
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
// O acabamento da noite: quantas nuvens, estrelas de quatro pontas, raios do luar e manchas do chão.
const FINISH = {
  clouds: 7,
  stars: 14,
  rings: 4,
  rays: 9,
  patches: 26,
} as const;

/** Estrela de quatro pontas, de lados côncavos, com `size` do centro à ponta. */
const sparkle = (x: number, y: number, size: number) =>
  `M${x},${y - size} Q${x},${y} ${x + size},${y} Q${x},${y} ${x},${y + size} Q${x},${y} ${x - size},${y} Q${x},${y} ${x},${y - size} Z`;

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
  const { day, dusk, night } = savanna;
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
  // ponytail: o acabamento só existe de noite, que é o plano do piloto; o dia entra quando ele for aprovado.
  const lit = finish && isNight;
  const nightness = Math.max(0, 1 - daylight * 2);
  const glow = savannaFinish.night;
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
          {lit ? (
            <g opacity={nightness}>
              {/*
                A trama do céu: nuvens em dois degraus, um tom acima do fundo,
                derivando devagar. Sem elas o céu é uma cor só.
              */}
              {Array.from({ length: FINISH.clouds }, (_, index) => {
                const pick = (trait: string) =>
                  random(`savanna-cloud-${trait}-${index}`);
                const width = 260 + 300 * pick("width");
                const x =
                  ((pick("x") * 2300 + seconds * (3 + 4 * pick("speed"))) %
                    2500) -
                  300;
                const y = 90 + 430 * pick("y");
                const puffs = Array.from({ length: 4 }, (__, puff) => ({
                  cx: x + (puff / 3 - 0.5) * width * 0.8,
                  cy: y + 22 * Math.sin(puff * 2.1 + index),
                  r: width * (0.2 + 0.08 * random(`puff-${index}-${puff}`)),
                }));
                return (
                  <g key={index}>
                    {[14, 0].map((aro, tone) =>
                      puffs.map(({ cx, cy, r }, puff) => (
                        <ellipse
                          key={`${tone}-${puff}`}
                          cx={cx}
                          cy={cy}
                          rx={r + aro}
                          ry={(r + aro) * 0.5}
                          fill={glow.clouds[tone]}
                        />
                      )),
                    )}
                  </g>
                );
              })}
              {Array.from({ length: FINISH.stars }, (_, index) => {
                const pick = (trait: string) =>
                  random(`savanna-sparkle-${trait}-${index}`);
                const x = pick("x") * 1920;
                const y = pick("y") * 600;
                // Perto da lua não há estrela: o halo a cortaria ao meio.
                if (Math.hypot(x - orbAt[0], y - orbAt[1]) < 300) {
                  return null;
                }
                // As primeiras são as grandes, com aro.
                const size =
                  (index < FINISH.rings ? 20 : 9) +
                  8 * pick("size") +
                  3 * wave(seconds, 2.6, pick("phase"));
                return (
                  <g key={index}>
                    {index < FINISH.rings ? (
                      <circle
                        cx={x}
                        cy={y}
                        r={size * 0.8}
                        fill="none"
                        stroke={glow.starRing}
                        strokeWidth={6}
                      />
                    ) : null}
                    <path d={sparkle(x, y, size)} fill={glow.star} />
                  </g>
                );
              })}
            </g>
          ) : null}
          {isNight
            ? Array.from({ length: 50 }, (_, index) => {
                const pick = (trait: string) =>
                  random(`savanna-star-${trait}-${index}`);
                return (
                  <circle
                    key={index}
                    cx={pick("x") * 1920}
                    cy={pick("y") * 620}
                    r={(lit ? 2.5 : 1.5) + pick("size") * 2.5}
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
          {orb === undefined ? null : lit ? (
            <g opacity={nightness}>
              <defs>
                <radialGradient
                  id={`${id}-rays`}
                  gradientUnits="userSpaceOnUse"
                  cx={orbAt[0]}
                  cy={orbAt[1]}
                  r={620}
                >
                  <stop offset={0.15} stopColor={glow.rays} stopOpacity={0.5} />
                  <stop offset={1} stopColor={glow.rays} stopOpacity={0} />
                </radialGradient>
              </defs>
              {/* Os raios do luar: cunhas largas que giram devagar, atrás do halo. */}
              <g
                transform={`rotate(${seconds * 1.5} ${orbAt[0]} ${orbAt[1]})`}
                fill={`url(#${id}-rays)`}
              >
                {Array.from({ length: FINISH.rays }, (_, index) => {
                  const angle = (index / FINISH.rays) * Math.PI * 2;
                  const half = 0.085 + 0.04 * (index % 2);
                  const at = (turn: number) =>
                    `${orbAt[0] + 640 * Math.cos(turn)},${orbAt[1] + 640 * Math.sin(turn)}`;
                  return (
                    <path
                      key={index}
                      d={`M${orbAt[0]},${orbAt[1]} L${at(angle - half)} L${at(angle + half)} Z`}
                    />
                  );
                })}
              </g>
              {/* O halo em degraus chapados, do céu até a lua: o brilho sem desfoque. */}
              {[205, 150, 108].map((radius, step) => (
                <circle
                  key={radius}
                  cx={orbAt[0]}
                  cy={orbAt[1]}
                  r={radius + 5 * wave(seconds, 4.2, step / 3)}
                  fill={glow.halo[step]}
                />
              ))}
              <circle cx={orbAt[0]} cy={orbAt[1]} r={72} fill={night.sun} />
              <circle
                cx={orbAt[0] - 26}
                cy={orbAt[1] + 18}
                r={30}
                fill={glow.moonCore}
              />
              {/* A sombra que faz da lua uma crescente tem a cor do degrau de dentro do halo. */}
              <circle
                cx={orbAt[0] + 28}
                cy={orbAt[1] - 20}
                r={62}
                fill={glow.halo[2]}
              />
            </g>
          ) : (
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
          {lit ? (
            // Uma serra mais longe, um tom mais perto do céu.
            <path
              d="M-400,700 C100,640 420,690 800,640 C1200,600 1600,670 2300,620 L2300,900 L-400,900 Z"
              fill={glow.farBack}
              opacity={nightness}
            />
          ) : null}
          <path
            d="M-400,760 C0,680 500,720 900,700 C1300,680 1700,720 2300,690 L2300,900 L-400,900 Z"
            fill={color("far")}
          />
          {lit ? (
            <path
              d="M-400,760 C0,680 500,720 900,700 C1300,680 1700,720 2300,690"
              fill="none"
              stroke={glow.rim}
              strokeWidth={8}
              opacity={nightness}
            />
          ) : null}
        </SvgLayer>
      </Layer>

      <Layer depth={0.6}>
        <SvgLayer>
          {TREES.map(([x, width, height]) => (
            <g key={x} fill={lit ? glow.tree : color("trees")}>
              {lit ? (
                // A borda de luz da copa: a mesma silhueta, na cor do luar, deslocada para o lado da lua.
                <path
                  transform={`translate(${orbAt[0] < x ? -7 : 7} -7)`}
                  fill={glow.rim}
                  opacity={nightness}
                  d={`M${x - width / 2},${SAVANNA_GROUND_Y - height + 50} C${x - width * 0.3},${SAVANNA_GROUND_Y - height - 30} ${x + width * 0.35},${SAVANNA_GROUND_Y - height - 40} ${x + width / 2 + 20},${SAVANNA_GROUND_Y - height + 40} C${x + width * 0.2},${SAVANNA_GROUND_Y - height + 70} ${x - width * 0.2},${SAVANNA_GROUND_Y - height + 70} ${x - width / 2},${SAVANNA_GROUND_Y - height + 50} Z`}
                />
              ) : null}
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

      {finish ? dust : null}

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
          {lit ? (
            <g opacity={nightness}>
              {/* O chão manchado em dois tons, o luar na crista dele e uma poça de luz sob a lua. */}
              <ellipse
                cx={orbAt[0]}
                cy={SAVANNA_GROUND_Y + 70}
                rx={300}
                ry={30}
                fill={glow.moonlight}
              />
              {Array.from({ length: FINISH.patches }, (_, index) => {
                const pick = (trait: string) =>
                  random(`savanna-patch-${trait}-${index}`);
                const rx = 60 + 150 * pick("size");
                return (
                  <ellipse
                    key={index}
                    cx={-200 + 2400 * pick("x")}
                    cy={SAVANNA_GROUND_Y + 40 + 230 * pick("y")}
                    rx={rx}
                    ry={rx * 0.13}
                    fill={glow.groundPatch[index % 2]}
                  />
                );
              })}
              <path
                d={`M-400,${SAVANNA_GROUND_Y - 40} C200,${SAVANNA_GROUND_Y - 70} 900,${SAVANNA_GROUND_Y - 20} 1500,${SAVANNA_GROUND_Y - 50} C1900,${SAVANNA_GROUND_Y - 70} 2200,${SAVANNA_GROUND_Y - 30} 2300,${SAVANNA_GROUND_Y - 40}`}
                fill="none"
                stroke={glow.groundRim}
                strokeWidth={8}
              />
            </g>
          ) : null}
          {TUFTS.map((x, index) => (
            <g key={x} fill={color("grass")}>
              {[-26, -8, 10, 28].map((offset, blade) => (
                <path
                  key={blade}
                  fill={lit && blade % 2 === 0 ? glow.grassLit : undefined}
                  stroke={
                    lit
                      ? blade % 2 === 0
                        ? glow.grassLit
                        : color("grass")
                      : undefined
                  }
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
                    lit ? 22 : 12,
                    lit ? 8 : 3,
                  )}
                />
              ))}
            </g>
          ))}
        </SvgLayer>
        {children}
        <Leftovers />
      </Layer>

      {/* No acabamento a poeira fica atrás do assunto: partícula por cima dele lê como sujeira. */}
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
              <g key={x} fill={color("trees")} opacity={0.7}>
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

type ContactProps = {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly daylight: number;
};

/** Sombra de contato no chão da savana. Vai dentro de um SvgLayer. */
export const SavannaShadow: React.FC<ContactProps> = ({
  x,
  y,
  width,
  daylight,
}) => (
  <ellipse
    cx={x}
    cy={y}
    rx={width / 2}
    ry={width * 0.05}
    fill={blend(
      savanna.day.contact,
      savanna.dusk.contact,
      savanna.night.contact,
      daylight,
    )}
    opacity={0.28}
  />
);
