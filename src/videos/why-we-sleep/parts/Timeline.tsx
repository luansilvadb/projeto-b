import { useId } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { Antelope } from "../../../art/Antelope";
import { Brain } from "../../../art/Brain";
import { Cassiopea } from "../../../art/Cassiopea";
import { Elephant } from "../../../art/Elephant";
import { taperPath } from "../../../art/shapes";
import { Drifters } from "../../../components/Drifters";
import { breath, wave } from "../../../components/Idle";
import { Place } from "../../../components/Place";
import { Pop, popScale, POP_SECONDS } from "../../../components/Pop";
import { SvgLayer } from "../../../components/SvgLayer";
import { ALREADY_SHOWN, mix, ramp } from "../../../components/timing";
import { shape } from "../../../design/tokens";
import {
  antelope,
  brainHalves,
  elephant,
  ink,
  jellyfish,
  lagoon,
  personInPajamas,
} from "../palette";
import { Bed } from "./Bed";
import { PULSES_ASLEEP, pulseCycles, pulseShape, steady } from "./pulse";
import { Tag } from "./Tag";
import { VacantSign } from "./VacantSign";

/** A linha do tempo no quadro: a altura dela, de onde sai (o passado) e onde a seta termina (hoje). */
export const TIMELINE = { y: 700, from: 180, to: 1400 };
/** O chão de areia, onde pousa o que fica no fim da linha. */
export const TIMELINE_FLOOR = 950;
/**
 * O lugar no fim da linha, depois da seta: o centro dele. Cabe ali algo de
 * até uns 380 px de largura por 520 de altura (o pedestal, a conta de sono).
 */
export const TIMELINE_END = { x: 1640, y: 640 };

// A marca do sono fica no começo da linha, no mesmo lugar em todo plano: o sono é o que há de mais antigo nela.
const SLEEP_X = 240;
// A água-viva pousa na linha logo depois da marca do sono; num plano sem a marca, é ela que fica no começo.
// Sozinha, com os bichos na linha, ela é um pouco menor: os braços de quem dorme se abrem para os lados.
const JELLYFISH = { x: 625, width: 380, alone: { x: 315, width: 300 } };
// Do centro do desenho dela até onde o sino encosta, em fração da largura do sino.
const RESTING = 62 / 330;
// O primeiro cérebro vem depois do sono e da água-viva, que não tem cérebro.
const BRAIN_X = 1090;
const PIN = { icon: 130, tag: 250 };
// Os bichos dormindo ao longo da linha, do mais antigo ao mais recente: três, com folga entre eles.
// Eram quatro, com o peixe: ficavam apertados, e a água-viva já é o bicho do mar na linha.
// Entre um e outro fica um vazio: o antílope, deitado e pequeno, encostava no sino da água-viva e na tromba da
// elefanta, e os três viravam uma forma só. Para o vazio caber, os três são um pouco menores que a água-viva pede.
const SLEEPERS = [622, 906, 1212] as const;
const SLEEPER_WIDTH = { antelope: 196, elephant: 220 };
const SLEEPERS_WITHOUT_JELLYFISH = [420, 800, 1180] as const;
// A cama da pessoa, pequena, pousada na linha: cabe entre a elefanta e a ponta da seta.
const BED_SCALE = 0.25;

type TimelineProps = {
  /** Quanto da linha já se desenhou, do passado para hoje, de 0 a 1. */
  readonly drawn?: number;
  /** Quanto a linha já subiu do fundo do mar até o lugar dela, de 0 a 1. */
  readonly risen?: number;
  /** Quadro em que entra a etiqueta "mais de 500 milhões de anos", presa por um colchete que vai da marca do sono ao fim da linha; sem valor, não há etiqueta. */
  readonly yearsAt?: number;
  /** A água-viva grande, dormindo, pousada na linha: logo depois da marca do sono, ou no começo, se não houver marca. */
  readonly jellyfish?: boolean;
  /** Quadro em que entra a marca do sono (a lua e "sono"), sempre no começo da linha; sem valor, não há marca. */
  readonly sleepAt?: number;
  /** Quadro em que entra a marca do primeiro cérebro, depois da do sono e da água-viva; sem valor, não há marca. */
  readonly brainAt?: number;
  /**
   * Os bichos dormindo ao longo da linha (antílope, elefanta, pessoa): o
   * quadro em que cada um entra. Sem valor, não há bichos. Eles ocupam o
   * mesmo espaço das marcas: use uns ou outras.
   */
  readonly sleepersAt?: readonly [number, number, number];
  /** O pedestal vazio "acordado 24 h" no fim da linha. */
  readonly pedestal?: boolean;
  /** O que fica no fim da linha no lugar do pedestal, centrado em `TIMELINE_END`: a conta de sono, por exemplo. */
  readonly children?: React.ReactNode;
  /**
   * Se a linha desenha o fundo do mar por baixo dela. Sem ele, quem a usa põe
   * o `SeaFloor` como fundo do plano, e a linha fica solta por cima, como
   * elenco do palco.
   */
  readonly floor?: boolean;
  /**
   * A linha em movimento, e não posta: os marcos surgem aos poucos quando a
   * linha passa por eles, a haste e o ponto de cada marca crescem com ela, e
   * o colchete dos anos se abre da marca do sono até hoje antes de a etiqueta
   * estourar. Sem isto, cada um aparece pronto no quadro dele.
   */
  readonly eased?: boolean;
  /** O tamanho da ponta da seta, de 0 a 1: em 0 a linha ainda não começou e nada dela aparece. Por padrão, inteira. */
  readonly arrow?: number;
  /**
   * A pausa viva da linha, para o plano em que ela é o assunto e nada mais
   * acontece: o ícone de cada marca flutua, um brilho corre pela linha da
   * marca do sono até hoje, a ponta da seta pulsa e a etiqueta dos anos
   * balança de leve. Sem isto, a linha fica parada depois de desenhada.
   */
  readonly alive?: boolean;
};

type SeaFloorProps = {
  /** A luz que entra pela água tremula: cada feixe clareia e escurece no próprio tempo. Por padrão, parada. */
  readonly shimmer?: boolean;
};

// Quanto dura o colchete dos anos se abrindo, e quanto a etiqueta espera por ele, em segundos.
const BRACKET_SECONDS = 0.4;
const TAG_AFTER_BRACKET_SECONDS = 0.4;
// Em quantos pixels de linha um marco de cem milhões de anos termina de surgir.
const MARK_FADE = 60;
// O brilho que corre pela linha viva: quantos segundos leva da marca do sono até hoje, e o raio dele.
const GLINT = { seconds: 2.2, radius: 13 };

/** O fundo do mar em índigo: a água, a luz que entra, a areia violeta e o capim nos cantos. */
export const SeaFloor: React.FC<SeaFloorProps> = ({ shimmer = false }) => {
  const id = useId();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const seconds = frame / fps;
  const {
    water,
    sand,
    sandEdge,
    ripple,
    pebble,
    grass,
    light,
    reef,
    rootsFar,
  } = lagoon.night;

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(${water[0]}, ${water[1]} 45%, ${water[2]} 80%)`,
      }}
    >
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 900px 620px at 22% 0%, ${light}40, transparent)`,
        }}
      />
      <SvgLayer>
        {/* A distância: os feixes de luz, o recife em silhueta e um cardume, perto da cor da água. */}
        {[
          [120, 300, 520],
          [520, 190, 1000],
          [900, 150, 1420],
        ].map(([top, width, bottom]) => {
          // Com a luz tremulando, cada feixe também varre o fundo devagar, no próprio tempo.
          const sweep = shimmer ? 90 * wave(seconds, 4.3, top / 500) : 0;
          return (
            <path
              key={top}
              d={`M${top},-20 L${top + width},-20 L${bottom + width * 1.7 + sweep},${TIMELINE_FLOOR} L${bottom + sweep},${TIMELINE_FLOOR} Z`}
              fill={light}
              opacity={
                shimmer
                  ? 0.065 * (1 + 0.6 * wave(seconds, 2.7, top / 700))
                  : 0.05
              }
            />
          );
        })}
        <g fill={reef}>
          <path
            d={`M-40,${TIMELINE_FLOOR} C20,520 190,430 300,560 C360,470 520,500 560,700 C640,640 760,720 800,${TIMELINE_FLOOR} Z`}
          />
          <path
            d={`M1020,${TIMELINE_FLOOR} C1080,640 1220,560 1330,640 C1400,420 1620,360 1720,520 C1800,470 1940,560 1960,${TIMELINE_FLOOR} Z`}
          />
        </g>
        <g fill={rootsFar}>
          <path
            d={`M380,${TIMELINE_FLOOR} C460,760 620,740 700,820 C760,780 880,800 960,${TIMELINE_FLOOR} Z`}
          />
          <path
            d={`M1380,${TIMELINE_FLOOR} C1460,700 1620,640 1740,760 C1800,720 1900,760 1960,${TIMELINE_FLOOR} Z`}
          />
        </g>
        {[
          [1180, 230, 1],
          [1290, 180, 0.8],
          [1330, 270, 0.7],
          [1450, 215, 0.9],
          [760, 330, 0.7],
        ].map(([x, y, size]) => (
          <path
            key={x}
            // Com a luz tremulando o cardume também nada: avança devagar e ondula, cada peixe na sua fase.
            transform={`translate(${x + 8 * wave(seconds, 6, x / 300) + (shimmer ? 30 * seconds : 0)} ${y + (shimmer ? 7 * wave(seconds, 1.9, x / 170) : 0)}) scale(${size})`}
            d="M-46,0 C-26,-24 14,-24 34,-4 L58,-22 L52,0 L58,22 L34,4 C14,24 -26,24 -46,0 Z"
            fill={reef}
          />
        ))}
      </SvgLayer>
      <Drifters
        seed="plankton"
        count={70}
        color={ink.glow}
        opacity={0.4}
        speed={shimmer ? 4 : 1}
      />
      <SvgLayer>
        <defs>
          <linearGradient id={id} x1={0} y1={0} x2={0} y2={1}>
            <stop offset={0} stopColor={sand[0]} />
            <stop offset={0.5} stopColor={sand[1]} />
            <stop offset={1} stopColor={sand[2]} />
          </linearGradient>
        </defs>
        <path
          d={`M-20,${TIMELINE_FLOOR - 4} C400,${TIMELINE_FLOOR - 40} 900,${TIMELINE_FLOOR + 26} 1300,${TIMELINE_FLOOR - 6} C1600,${TIMELINE_FLOOR - 30} 1800,${TIMELINE_FLOOR - 10} 1940,${TIMELINE_FLOOR - 20} L1940,1100 L-20,1100 Z`}
          fill={sandEdge}
        />
        <path
          d={`M-20,${TIMELINE_FLOOR + 8} C400,${TIMELINE_FLOOR - 28} 900,${TIMELINE_FLOOR + 38} 1300,${TIMELINE_FLOOR + 6} C1600,${TIMELINE_FLOOR - 18} 1800,${TIMELINE_FLOOR + 2} 1940,${TIMELINE_FLOOR - 8} L1940,1100 L-20,1100 Z`}
          fill={`url(#${id})`}
        />
        {[
          [260, 1030, 150],
          [820, 1050, 210],
          [1420, 1020, 170],
        ].map(([x, y, length]) => (
          <rect
            key={x}
            x={x}
            y={y}
            width={length}
            height={10}
            rx={5}
            fill={ripple}
          />
        ))}
        {[
          [560, 1010, 26],
          [610, 1024, 14],
          [1180, 1040, 22],
        ].map(([x, y, r]) => (
          <ellipse
            key={x}
            cx={x}
            cy={y}
            rx={r}
            ry={r * 0.6}
            fill={pebble[(x / 10) % 2 < 1 ? 0 : 1]}
          />
        ))}
        {/* O capim-marinho dos cantos: a moldura do fundo do mar. */}
        {[40, 1930].map((x, corner) => (
          <g key={x}>
            {[-70, -30, 10, 50, 90].map((offset, blade) => (
              <path
                key={offset}
                d={taperPath(
                  [x + offset, 1100],
                  [
                    x +
                      offset * 1.2 +
                      10 * wave(seconds, 4, blade / 5 + corner / 2),
                    960 - (blade % 2) * 40,
                  ],
                  [
                    x +
                      offset * 1.7 +
                      26 * wave(seconds, 4, blade / 5 + corner / 2),
                    800 - (blade % 3) * 70,
                  ],
                  34,
                  5,
                )}
                fill={grass[blade % grass.length]}
              />
            ))}
          </g>
        ))}
      </SvgLayer>
    </AbsoluteFill>
  );
};

type PinProps = {
  readonly x: number;
  readonly at: number;
  readonly label: string;
  /** Quanto o ícone flutua, em pixels e em graus: a pausa viva da marca. Por padrão, parado. */
  readonly float?: readonly [number, number];
  readonly children: React.ReactNode;
};

/** Uma marca na linha: o ponto, a haste, o ícone e a etiqueta em cima. */
const Pin: React.FC<PinProps> = ({
  x,
  at,
  label,
  float = [0, 0],
  children,
}) => (
  <>
    <Place
      x={x}
      y={TIMELINE.y - PIN.icon}
      style={
        float[0] === 0 && float[1] === 0
          ? undefined
          : {
              translate: `-50% calc(-50% + ${float[0]}px)`,
              rotate: `${float[1]}deg`,
            }
      }
    >
      <Pop at={at}>{children}</Pop>
    </Place>
    <Place x={x} y={TIMELINE.y - PIN.tag}>
      <Pop at={at}>
        <Tag size="note" on="night">
          {label}
        </Tag>
      </Pop>
    </Place>
  </>
);

/** A lua crescente: a marca do sono. */
const Moon: React.FC = () => (
  <svg width={120} height={120} viewBox="0 0 100 100">
    <path
      d="M 62 10 A 42 42 0 1 0 90 62 A 34 34 0 1 1 62 10 Z"
      fill={ink.moon}
    />
  </svg>
);

/**
 * A linha do tempo de mais de 500 milhões de anos, no fundo do mar, em índigo.
 * Ocupa o quadro inteiro, com o fundo dela. Conforme o que se pede, leva a
 * etiqueta dos anos, a água-viva no começo, as marcas do sono e do primeiro
 * cérebro, os bichos dormindo ao longo dela e, no fim, o pedestal vazio ou o
 * que vier em `children`.
 */
export const Timeline: React.FC<TimelineProps> = ({
  drawn = 1,
  risen = 1,
  yearsAt,
  jellyfish: withJellyfish = false,
  sleepAt,
  brainAt,
  sleepersAt,
  pedestal = false,
  children,
  floor = true,
  eased = false,
  arrow: ownArrow = 1,
  alive = false,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const seconds = frame / fps;
  const { y, from, to } = TIMELINE;
  const head = from + (to - from) * drawn;
  // Viva, a ponta da seta pulsa depois de chegar a hoje.
  const arrow =
    alive && drawn >= 1 ? ownArrow * (1 + 0.1 * wave(seconds, 1.7)) : ownArrow;
  // O brilho sai da marca do sono, corre até a ponta e recomeça; nasce e some nas pontas do caminho.
  const glint = (seconds / GLINT.seconds) % 1;
  const jelly = sleepAt === undefined ? JELLYFISH.alone : JELLYFISH;
  const spots = withJellyfish ? SLEEPERS : SLEEPERS_WITHOUT_JELLYFISH;
  const enter = (index: number) => sleepersAt?.[index] ?? ALREADY_SHOWN;
  const sleepers = sleepersAt ? (
    <>
      {/* O antílope leva a pintura de dia, como a elefanta: a da noite, lilás, sumia no índigo do fundo. */}
      <Place x={spots[0]} y={y - 4} anchor="bottom">
        <Pop at={enter(0)} origin="bottom">
          <Antelope
            width={SLEEPER_WIDTH.antelope}
            colors={antelope}
            rest={1}
            droop={1}
            lid={1}
            ear={0.1}
          />
        </Pop>
      </Place>
      <Place
        x={spots[1]}
        y={y - 4}
        anchor="bottom"
        style={{
          scale: `1 ${breath(seconds, "line-elephant", { amplitude: 0.012, period: 4.5 })}`,
        }}
      >
        <Pop at={enter(1)} origin="bottom">
          <Elephant
            width={SLEEPER_WIDTH.elephant}
            colors={elephant}
            lid={1}
            droop={1}
            ear={0.1}
          />
        </Pop>
      </Place>
      {/* A pessoa dorme na cama, como em todo plano em que dorme. */}
      <Pop at={enter(2)}>
        <Bed
          x={spots[2]}
          y={y - 4}
          scale={BED_SCALE}
          colors={personInPajamas}
          hue="lilac"
          shadow={false}
        />
      </Pop>
    </>
  ) : null;

  return (
    <AbsoluteFill>
      {floor ? <SeaFloor /> : null}
      {pedestal ? (
        <VacantSign
          x={TIMELINE_END.x}
          y={TIMELINE_FLOOR - 24}
          scale={0.68}
          light={drawn}
        />
      ) : null}
      {/* A linha sobe do fundo do mar: tudo o que está preso a ela sobe junto. */}
      <AbsoluteFill
        style={{
          translate: `0 ${(1 - risen) * (TIMELINE_FLOOR - y)}px`,
          opacity: Math.min(1, risen * 3),
        }}
      >
        <SvgLayer>
          {/* Os marcos de cem em cem milhões de anos, e a linha por cima. */}
          {[0, 1, 2, 3, 4, 5].map((mark) => {
            const x = from + ((to - from - 40) * mark) / 5;
            return (
              <rect
                key={mark}
                x={x - 5}
                y={y - 22}
                width={10}
                height={44}
                rx={5}
                fill={ink.glow}
                opacity={
                  eased
                    ? 0.55 * Math.min(1, Math.max(0, (head - x) / MARK_FADE))
                    : x <= head
                      ? 0.55
                      : 0
                }
              />
            );
          })}
          <line
            x1={from}
            x2={head}
            y1={y}
            y2={y}
            stroke={ink.glow}
            strokeWidth={14}
            strokeLinecap="round"
            opacity={arrow > 0 ? 1 : 0}
          />
          <path
            d={`M${head - 34 * arrow},${y - 30 * arrow} L${head + 8},${y} L${head - 34 * arrow},${y + 30 * arrow}`}
            fill="none"
            stroke={ink.glow}
            strokeWidth={14}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={arrow > 0 ? 1 : 0}
          />
          {alive && sleepAt !== undefined && head > SLEEP_X + 40 ? (
            <circle
              cx={mix(SLEEP_X, head, glint)}
              cy={y}
              r={GLINT.radius * (0.6 + 0.4 * Math.sin(Math.PI * glint))}
              fill={ink.moon}
              opacity={Math.sin(Math.PI * glint)}
            />
          ) : null}
          {/* O colchete que prende a etiqueta dos anos à linha: da marca do sono até hoje. */}
          {yearsAt === undefined ? null : (
            <path
              d={`M${SLEEP_X},${y + 40} L${SLEEP_X},${y + 70} L${to},${y + 70} L${to},${y + 40}`}
              fill="none"
              stroke={ink.moon}
              strokeWidth={shape.stroke.regular}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={frame >= yearsAt ? 1 : 0}
              // Em movimento, o traço corre da marca do sono até hoje.
              pathLength={eased ? 1 : undefined}
              strokeDasharray={eased ? 1 : undefined}
              strokeDashoffset={
                eased
                  ? 1 - ramp(frame, yearsAt, BRACKET_SECONDS * fps)
                  : undefined
              }
            />
          )}
          {[
            sleepAt === undefined ? null : SLEEP_X,
            brainAt === undefined ? null : BRAIN_X,
          ].map((x, index) =>
            x === null ? null : (
              <g
                key={index}
                opacity={
                  frame >= (index === 0 ? (sleepAt ?? 0) : (brainAt ?? 0))
                    ? 1
                    : 0
                }
                // Em movimento, a marca cresce do ponto dela na linha, com a sobra do ícone.
                transform={
                  eased
                    ? `translate(${x} ${y}) scale(${popScale(frame, index === 0 ? (sleepAt ?? 0) : (brainAt ?? 0), POP_SECONDS * fps, 0.2)}) translate(${-x} ${-y})`
                    : undefined
                }
              >
                <rect
                  x={x - 4}
                  y={y - 62}
                  width={8}
                  height={62}
                  fill={ink.moon}
                />
                <circle cx={x} cy={y} r={18} fill={ink.moon} />
              </g>
            ),
          )}
        </SvgLayer>
        {withJellyfish ? (
          <Place x={jelly.x} y={y - jelly.width * RESTING - 6}>
            <Cassiopea
              width={jelly.width}
              colors={jellyfish.night}
              droop={0.8}
              pulse={pulseShape(pulseCycles(frame, fps, steady(PULSES_ASLEEP)))}
              sway={0.4 * wave(seconds, 5)}
            />
          </Place>
        ) : null}
        {sleepers}
        {sleepAt === undefined ? null : (
          <Pin
            x={SLEEP_X}
            at={sleepAt}
            label="sono"
            float={
              alive
                ? [10 * wave(seconds, 2.6), 7 * wave(seconds, 3.4, 0.2)]
                : undefined
            }
          >
            <Moon />
          </Pin>
        )}
        {brainAt === undefined ? null : (
          <Pin x={BRAIN_X} at={brainAt} label="cérebro">
            <Brain
              width={170}
              color={brainHalves.asleepShade}
              fill={brainHalves.awake}
              folds
            />
          </Pin>
        )}
        {yearsAt === undefined ? null : (
          <Place
            x={(SLEEP_X + to) / 2}
            y={y + 150}
            style={
              alive
                ? {
                    translate: `-50% calc(-50% + ${4 * wave(seconds, 3.7, 0.6)}px)`,
                  }
                : undefined
            }
          >
            <Pop at={yearsAt + (eased ? TAG_AFTER_BRACKET_SECONDS * fps : 0)}>
              <Tag size="label" on="night">
                mais de 500 milhões de anos
              </Tag>
            </Pop>
          </Place>
        )}
      </AbsoluteFill>
      {children ? (
        <Place x={TIMELINE_END.x} y={TIMELINE_END.y}>
          {children}
        </Place>
      ) : null}
    </AbsoluteFill>
  );
};
