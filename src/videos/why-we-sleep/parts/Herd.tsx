import { useId } from "react";
import { interpolateColors } from "remotion";
import {
  Elephant,
  STRIDE_LENGTH,
  type ElephantColors,
} from "../../../art/Elephant";
import { blink, breath, phaseOf, wave } from "../../../components/Idle";
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

// O ritmo do passo de uma elefanta, no passo antigo (`walking`).
const STEP_SECONDS = 1.3;
// A largura do desenho da elefanta, nas unidades dele: é o que converte a passada em pixels do quadro.
const ELEPHANT_UNITS = 520;
// As patas no desenho (o x de cada uma, parada) e a fase em que cada uma pisa: a poeira nasce sob elas.
const FEET = [
  [150, 0],
  [-50, 0.25],
  [130, 0.5],
  [-70, 0.75],
] as const;
// A poeira de cada pisada: por quanto do ciclo ela dura, e o tamanho e a subida dela, nas unidades do desenho.
const DUST = { lasts: 0.3, radius: 26, rise: 30 };

/** A passada de uma elefanta desta largura: quantos pixels do quadro ela avança por volta do ciclo de passos. */
const strideOf = (width: number): number =>
  (STRIDE_LENGTH * width) / ELEPHANT_UNITS;

const ELEPHANT_KEYS = Object.keys(elephant) as (keyof ElephantColors)[];

/** A pintura da elefanta entre a noite e o dia: as cores passam de uma à outra com a luz, em vez de trocar num quadro. */
const elephantAt = (daylight: number): ElephantColors =>
  daylight <= 0
    ? elephantNight
    : daylight >= 1
      ? elephant
      : (Object.fromEntries(
          ELEPHANT_KEYS.map((key) => [
            key,
            interpolateColors(
              daylight,
              [0, 1],
              [elephantNight[key], elephant[key]],
            ),
          ]),
        ) as ElephantColors);

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

/** Um valor para a manada inteira, ou um por elefanta, na ordem de `members`; sem valor, a pausa viva dela. */
type Each = number | readonly (number | undefined)[];

const eachOf = (value: Each | undefined, index: number): number | undefined =>
  typeof value === "number" || value === undefined ? value : value[index];

/** A caminhada da manada: quanto ela já andou e com que passada. */
export type HerdStride = {
  /**
   * A distância que a manada teria andado a passo inteiro, em pixels do
   * quadro: é o que faz as patas de cada uma avançarem no ciclo, as das
   * menores mais depressa. Cresce junto com o deslocamento que a cena dá a
   * elas; na freada continua crescendo no mesmo ritmo, e é `pace` que encurta
   * a passada junto com a velocidade.
   */
  readonly along: number;
  /** O tamanho da passada, de 0 (paradas) a 1. */
  readonly pace: number;
};

type HerdProps = {
  readonly members: readonly HerdMember[];
  /** 1 é dia, 0 é noite: a pintura delas e a cor da sombra de contato. */
  readonly daylight: number;
  /** Quanto andam, de 0 (paradas) a 1 (a passo): o passo antigo, sem tirar as patas do chão. */
  readonly walking?: number;
  /**
   * A caminhada de verdade: cada pata sai do chão na sua vez, o corpo sobe e
   * desce a cada pisada e a poeira nasce sob os pés. Vale acima de `walking`.
   */
  readonly stride?: HerdStride;
  /** Quanto dormem, de 0 (acordadas) a 1 (olho fechado, tromba caída, cabeça pendida): uma medida só, ou uma por elefanta. */
  readonly asleep?: number | readonly number[];
  /** A tromba, de 0 a 1, quando a cena a conduz; sem valor, balança sozinha. */
  readonly trunk?: Each;
  /** A tromba estendida para a frente, de 0 a 1: o cumprimento. */
  readonly reach?: Each;
  /** Quanto a pálpebra desce além da piscada e do sono, de 0 a 1. */
  readonly lid?: Each;
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
  stride,
  asleep = 0,
  trunk,
  reach,
  lid,
  seconds,
}) => {
  const colors = elephantAt(daylight);
  /** A fase do ciclo de passos de uma elefanta: cada uma começa num ponto, para não marcharem juntas. */
  const gaitOf = (width: number, seed: string) =>
    stride === undefined
      ? 0
      : stride.along / strideOf(width) + phaseOf(`gait-${seed}`);

  return (
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
        const gait = gaitOf(width, seed);
        const pace = stride?.pace ?? 0;
        // O corpo sobe a cada pata que passa pelo apoio: quatro vezes por volta, e pouco, que ela é pesada.
        const bob = stride
          ? pace * width * 0.012 * (0.5 - 0.5 * Math.cos(gait * Math.PI * 8))
          : walking * 6 * Math.abs(wave(seconds, STEP_SECONDS / 2, phase));
        // A cabeça acompanha o passo, baixando um pouco a cada par de pisadas.
        const nod = stride ? 0.07 * pace * Math.sin(gait * Math.PI * 4) : 0;
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
              colors={colors}
              lid={Math.max(
                sleeping,
                eachOf(lid, index) ?? 0,
                // Quem dorme não pisca.
                awake * blink(seconds, seed),
              )}
              droop={Math.max(0, sleeping + nod)}
              trunk={
                eachOf(trunk, index) ??
                awake * (0.15 + 0.1 * wave(seconds, 3.1, phase)) +
                  // Dormindo, a tromba pende e ainda oscila um nada, como um pêndulo.
                  sleeping * 0.03 * (1 + wave(seconds, 4.7, phase))
              }
              reach={eachOf(reach, index) ?? 0}
              ear={0.3 * awake + 0.2 * Math.abs(wave(seconds, 2.2, phase))}
              stride={stride ? 0 : walking * wave(seconds, STEP_SECONDS, phase)}
              gait={stride ? gait : undefined}
              pace={pace}
            />
          </Place>
        );
      })}
      {stride && stride.pace > 0 ? (
        <SvgLayer>
          {members.flatMap(({ x, y = 0, width, seed, flipped }) => {
            const scale = width / ELEPHANT_UNITS;
            const side = flipped ? -1 : 1;
            const gait = gaitOf(width, seed);
            return FEET.map(([foot, phase]) => {
              // A pata pisa na metade da volta dela; a poeira nasce ali e fica para trás, no chão.
              const since = (((gait + phase - 0.5) % 1) + 1) % 1;
              if (since > DUST.lasts) {
                return null;
              }
              const t = since / DUST.lasts;
              const behind = STRIDE_LENGTH * stride.pace * since;
              return (
                <circle
                  key={`${seed}-${foot}`}
                  cx={x + side * (foot - STRIDE_LENGTH / 4 + behind) * scale}
                  cy={SAVANNA_GROUND_Y + y - (4 + DUST.rise * t) * scale}
                  r={DUST.radius * scale * (0.35 + 0.65 * t)}
                  fill={interpolateColors(
                    daylight,
                    [0, 1],
                    [savanna.night.far, savanna.day.sun],
                  )}
                  opacity={0.5 * stride.pace * (1 - t)}
                />
              );
            });
          })}
        </SvgLayer>
      ) : null}
    </>
  );
};

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

/**
 * A freada de uma manada que andou `walkedFor` quadros no plano anterior: a
 * velocidade cai em linha reta até zero. O que faltava andar quando aquele
 * plano acabou (no mínimo `least`) é percorrido aqui. Devolve quantos quadros
 * a freada dura e quanto ainda falta andar no quadro `frame`.
 */
export const braked = (
  walk: { readonly from: number; readonly speed: number; readonly least: number },
  walkedFor: number,
  frame: number,
): { brake: number; left: number } => {
  const rest = Math.max(walk.least, walk.from - walk.speed * walkedFor);
  const brake = (2 * rest) / walk.speed;
  const braking = Math.min(frame, brake);
  return {
    brake,
    left: rest - walk.speed * (braking - (braking * braking) / (2 * brake)),
  };
};

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
