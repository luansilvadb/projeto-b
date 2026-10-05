import { useId } from "react";
import { Elephant } from "../../../art/Elephant";
import { blink, breath, wave } from "../../../components/Idle";
import { Place } from "../../../components/Place";
import { Pop } from "../../../components/Pop";
import { SvgLayer } from "../../../components/SvgLayer";
import { ALREADY_SHOWN } from "../../../components/timing";
import {
  elephant,
  elephantNight,
  idea,
  ink,
  savanna,
  type TagTone,
} from "../palette";
import { SAVANNA_GROUND_Y, SavannaShadow } from "./Savanna";
import { Tag } from "./Tag";

/**
 * O que as cenas do bloco das elefantas dividem: a hora do dia quando o sol e
 * a lua passam, as elefantas postas no chão da savana, a elefanta sobre fundo
 * liso e a faixa de três dias das 46 horas.
 */

// Quão depressa a luz vira nas pontas do dia: acima de 1, o dia e a noite têm um patamar.
const TWILIGHT = 2.2;

const cycleOf = (cycles: number) => ((cycles % 1) + 1) % 1;

/**
 * A luz do dia, de 0 (noite) a 1 (dia), para um tempo contado em voltas: cada
 * volta inteira é um dia e uma noite, e a volta começa com o sol nascendo.
 */
export const daylightAt = (cycles: number): number =>
  Math.min(
    1,
    Math.max(0, 0.5 + TWILIGHT * Math.sin(cycleOf(cycles) * Math.PI * 2)),
  );

/** Onde o astro está no arco, de 0 a 1: o sol na primeira metade da volta, a lua na segunda. */
export const orbAt = (cycles: number): number => (cycleOf(cycles) % 0.5) * 2;

// O ritmo do passo de uma elefanta.
const STEP_SECONDS = 1.3;

export type HerdMember = {
  /** Onde ela pisa: x no quadro, e y a partir do chão da savana (negativo é mais longe). */
  readonly x: number;
  readonly y?: number;
  readonly width: number;
  /** A semente da pausa viva dela: cada uma pisca, respira e pisa no próprio tempo. */
  readonly seed: string;
  /** Virada para a direita. O desenho olha para a esquerda. */
  readonly flipped?: boolean;
};

type HerdProps = {
  readonly members: readonly HerdMember[];
  /** 1 é dia, 0 é noite: a cor da sombra de contato. */
  readonly daylight: number;
  /** Quanto andam, de 0 (paradas) a 1 (a passo). */
  readonly walking?: number;
  /** Quanto dormem, de 0 (acordadas) a 1 (olho fechado, tromba caída, cabeça pendida): uma medida só, ou uma por elefanta. */
  readonly asleep?: number | readonly number[];
  /** A tromba de cada uma, de 0 a 1, quando a cena a conduz; sem valor, balança sozinha. */
  readonly trunk?: number;
  readonly seconds: number;
};

/**
 * Elefantas no chão da savana, cada uma com a sua sombra: andam, param e
 * dormem em pé. Vai dentro da `Savanna`. As de trás vêm primeiro na lista.
 */
export const Herd: React.FC<HerdProps> = ({
  members,
  daylight,
  walking = 0,
  asleep = 0,
  trunk,
  seconds,
}) => (
  <>
    <SvgLayer>
      {members.map(({ x, y = 0, width, seed }) => (
        <SavannaShadow
          key={seed}
          x={x}
          y={SAVANNA_GROUND_Y + y + 6}
          width={width * 0.8}
          daylight={daylight}
        />
      ))}
    </SvgLayer>
    {members.map(({ x, y = 0, width, seed, flipped }, index) => {
      const sleeping = typeof asleep === "number" ? asleep : asleep[index];
      const awake = 1 - sleeping;
      const phase = index * 0.37;
      const bob =
        walking * 6 * Math.abs(wave(seconds, STEP_SECONDS / 2, phase));
      return (
        <Place
          key={seed}
          x={x}
          y={SAVANNA_GROUND_Y + y - bob}
          anchor="bottom"
          style={{
            scale: `${flipped ? -1 : 1} ${breath(seconds, seed, { amplitude: 0.012, period: 4.5 })}`,
          }}
        >
          <Elephant
            width={width}
            colors={daylight < 0.5 ? elephantNight : elephant}
            lid={Math.max(sleeping, blink(seconds, seed))}
            droop={sleeping}
            trunk={trunk ?? awake * (0.15 + 0.1 * wave(seconds, 3.1, phase))}
            ear={0.3 * awake + 0.2 * Math.abs(wave(seconds, 2.2, phase))}
            stride={walking * wave(seconds, STEP_SECONDS, phase)}
          />
        </Place>
      );
    })}
  </>
);

type SleepingElephantProps = {
  /** Onde ela pisa, em pixels do quadro. */
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly flipped?: boolean;
  readonly seconds: number;
};

/** A elefanta dormindo em pé, fora da savana: olho fechado, tromba caída, cabeça pendida. Sem sombra: quem a põe dá o chão. */
export const SleepingElephant: React.FC<SleepingElephantProps> = ({
  x,
  y,
  width,
  flipped = false,
  seconds,
}) => (
  <Place
    x={x}
    y={y}
    anchor="bottom"
    style={{
      scale: `${flipped ? -1 : 1} ${breath(seconds, "sleeping-elephant", { amplitude: 0.014, period: 4.5 })}`,
    }}
  >
    <Elephant
      width={width}
      colors={elephant}
      lid={1}
      droop={1}
      trunk={0}
      ear={0.1}
    />
  </Place>
);

/** A faixa de três dias: de meia-noite de segunda à meia-noite de quarta. */
export const DAY_STRIP = { x: 160, y: 660, width: 1600, height: 120 };
const STRIP_DAYS = 3;
const STRIP_HOURS = STRIP_DAYS * 24;
// O sol nasce às seis e se põe às dezoito.
const DAWN = 6;
const DUSK = 18;

/** Onde uma hora da faixa cai no quadro; a hora 0 é a meia-noite que abre a segunda. */
export const stripX = (hours: number) =>
  DAY_STRIP.x + (DAY_STRIP.width * hours) / STRIP_HOURS;

type DayStripProps = {
  /** O nome de cada dia e o quadro do plano em que a etiqueta dele entra. */
  readonly names: readonly [string, string, string];
  readonly namedAt?: readonly [number, number, number];
  /** O trecho acordado, em horas da faixa: uma linha grossa sobre a borda de cima, do começo ao fim. */
  readonly awake?: readonly [number, number];
  /** O fundo do plano, para a cor das etiquetas. */
  readonly on: TagTone;
};

/**
 * Três dias lado a lado numa faixa só: cada dia tem o meio claro, com o sol,
 * e as pontas escuras, com a lua na meia-noite que o separa do vizinho. A
 * etiqueta de cada dia fica debaixo dele.
 */
export const DayStrip: React.FC<DayStripProps> = ({
  names,
  namedAt = [ALREADY_SHOWN, ALREADY_SHOWN, ALREADY_SHOWN],
  awake,
  on,
}) => {
  const id = useId();
  const { x, y, width, height } = DAY_STRIP;
  const middle = y + height / 2;
  const days = Array.from({ length: STRIP_DAYS }, (_, day) => day);

  return (
    <>
      <SvgLayer>
        <defs>
          <clipPath id={id}>
            <rect x={x} y={y} width={width} height={height} rx={height / 2} />
          </clipPath>
        </defs>
        {/* A sombra da faixa, e a faixa: a noite por baixo e o dia de cada um por cima. */}
        <rect
          x={x}
          y={y + 14}
          width={width}
          height={height}
          rx={height / 2}
          fill={idea[on === "night" ? "lilac" : on].contact}
          opacity={0.3}
        />
        <g clipPath={`url(#${id})`}>
          <rect
            x={x}
            y={y}
            width={width}
            height={height}
            fill={savanna.night.sky[0]}
          />
          {days.map((day) => (
            <rect
              key={day}
              x={stripX(day * 24 + DAWN)}
              y={y}
              width={stripX(DUSK) - stripX(DAWN)}
              height={height}
              rx={height / 2}
              fill={ink.paper}
            />
          ))}
        </g>
        {days.map((day) => (
          <circle
            key={day}
            cx={stripX(day * 24 + 12)}
            cy={middle}
            r={30}
            fill={savanna.dusk.sun}
          />
        ))}
        {/* A lua de cada meia-noite entre dois dias: uma crescente, com a sombra na cor da noite. */}
        {[24, 48].map((midnight) => (
          <g key={midnight}>
            <circle cx={stripX(midnight)} cy={middle} r={26} fill={ink.moon} />
            <circle
              cx={stripX(midnight) + 12}
              cy={middle - 8}
              r={22}
              fill={savanna.night.sky[0]}
            />
          </g>
        ))}
        {awake ? (
          <rect
            x={stripX(awake[0]) - 9}
            y={y - 9}
            width={Math.max(0, stripX(awake[1]) - stripX(awake[0])) + 18}
            height={18}
            rx={9}
            fill={ink.tag}
          />
        ) : null}
      </SvgLayer>
      {days.map((day) => (
        <Place key={day} x={stripX(day * 24 + 12)} y={y + height + 66}>
          <Pop at={namedAt[day]}>
            <Tag size="note" on={on}>
              {names[day]}
            </Tag>
          </Pop>
        </Place>
      ))}
    </>
  );
};
