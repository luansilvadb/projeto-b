import { useId } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { Person, type Expression } from "../../../art/Person";
import { Camera, framing } from "../../../components/Camera";
import { Grain } from "../../../components/Grain";
import { blink, breath, wave } from "../../../components/Idle";
import { Place } from "../../../components/Place";
import { Pop } from "../../../components/Pop";
import { SvgLayer } from "../../../components/SvgLayer";
import { cue, linear, mix } from "../../../components/timing";
import type { SceneProps } from "../../../video/NarratedVideo";
import { Shot } from "../../../video/Shot";
import { ink, person, personInPajamas, savanna } from "../palette";
import { Bed } from "../parts/Bed";
import {
  DAY_STRIP,
  DayStrip,
  daylightAt,
  Herd,
  orbAt,
  stripX,
  type HerdMember,
} from "../parts/Herd";
import { IdeaBackdrop } from "../parts/IdeaBackdrop";
import { Savanna } from "../parts/Savanna";
import { Tag } from "../parts/Tag";

const WIDE = framing([960, 540], 1);
// Ela anda para a esquerda, sozinha no plano aberto.
const WALKER: HerdMember = {
  x: 1080,
  y: 20,
  width: 380,
  seed: "awake",
};
const WALK_SPEED = 40;
// Começa ao nascer do sol e termina duas horas antes de a segunda noite acabar: as 46 horas, de 48.
const SPAN = { from: 0, cycles: (2 * 46) / 48 };
// O rastro do sol e da lua: dois dias e duas noites numa faixa, que se enche conforme eles passam.
const TRAIL = { x: 560, y: 300, width: 800, height: 88 };
const HOURS_TAG = { x: 960, y: TRAIL.y + TRAIL.height + 76 };

type PassedDaysProps = {
  /** Quanto das duas voltas já passou, de 0 a 1. */
  readonly passed: number;
};

/**
 * O que o sol e a lua deixam para trás: uma faixa de dois dias, na mesma
 * pintura da faixa de três dias do plano seguinte (o dia claro, com o sol; a
 * noite escura, com a lua). Cada astro que passa no céu enche o trecho dele,
 * e é a faixa que diz "quase dois dias" no quadro parado.
 */
const PassedDays: React.FC<PassedDaysProps> = ({ passed }) => {
  const id = useId();
  const { x, y, width, height } = TRAIL;
  const part = width / 4;
  const middle = y + height / 2;
  const reached = x + width * passed;

  return (
    <SvgLayer>
      <defs>
        <clipPath id={`${id}-strip`}>
          <rect x={x} y={y} width={width} height={height} rx={height / 2} />
        </clipPath>
        <clipPath id={`${id}-passed`}>
          <rect x={x} y={y} width={width * passed} height={height} />
        </clipPath>
      </defs>
      {/* O que falta passar: a faixa reservada, só a sombra dela. */}
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={height / 2}
        fill={savanna.night.contact}
        opacity={0.3}
      />
      <g clipPath={`url(#${id}-strip)`}>
        <g clipPath={`url(#${id}-passed)`}>
          <rect
            x={x}
            y={y}
            width={width}
            height={height}
            fill={savanna.night.sky[0]}
          />
          {[0, 2].map((day) => (
            <g key={day}>
              <rect
                x={x + day * part}
                y={y}
                width={part}
                height={height}
                fill={ink.paper}
              />
              <circle
                cx={x + (day + 0.5) * part}
                cy={middle}
                r={26}
                fill={savanna.dusk.sun}
              />
            </g>
          ))}
          {[1, 3].map((night) => (
            <g key={night}>
              <circle
                cx={x + (night + 0.5) * part}
                cy={middle}
                r={24}
                fill={ink.moon}
              />
              <circle
                cx={x + (night + 0.5) * part + 11}
                cy={middle - 7}
                r={20}
                fill={savanna.night.sky[0]}
              />
            </g>
          ))}
        </g>
      </g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={height / 2}
        fill="none"
        stroke={ink.paper}
        strokeWidth={8}
      />
      {/* A divisa entre a primeira volta e a segunda. */}
      <rect
        x={x + width / 2 - 4}
        y={y - 18}
        width={8}
        height={height + 36}
        rx={4}
        fill={ink.paper}
      />
      {/* Onde o tempo está agora. */}
      <rect
        x={reached - 8}
        y={y - 14}
        width={16}
        height={height + 28}
        rx={8}
        fill={ink.tag}
      />
    </SvgLayer>
  );
};

type AwakeShotProps = {
  /** Quadro do plano em que o tempo acordada ganha número. */
  readonly hoursAt: number;
};

/** O sol e a lua passam duas vezes sobre ela, que segue andando de olhos abertos. */
const AwakeShot: React.FC<AwakeShotProps> = ({ hoursAt }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const seconds = frame / fps;
  const passing = linear(frame, 0, durationInFrames);
  const cycles = SPAN.from + SPAN.cycles * passing;
  const daylight = daylightAt(cycles);

  return (
    <AbsoluteFill>
      <Camera {...WIDE}>
        <Savanna daylight={daylight} orb={orbAt(cycles)}>
          <AbsoluteFill
            style={{ translate: `${100 - WALK_SPEED * seconds}px 0` }}
          >
            <Herd
              members={[WALKER]}
              daylight={daylight}
              walking={1}
              seconds={seconds}
            />
          </AbsoluteFill>
        </Savanna>
      </Camera>
      <PassedDays passed={(SPAN.cycles / 2) * passing} />
      <Place x={HOURS_TAG.x} y={HOURS_TAG.y}>
        <Pop at={hoursAt}>
          <Tag size="note" on={daylight < 0.5 ? "night" : "peach"}>
            46 h acordada
          </Tag>
        </Pop>
      </Place>
      <Grain />
    </AbsoluteFill>
  );
};

// Acorda na segunda de manhã (hora 6 da faixa) e só para na madrugada de quarta: 46 horas depois.
const WOKE = 6;
const AWAKE_HOURS = 46;
const BEDTIME = WOKE + AWAKE_HOURS;
const WALKING = { height: 440 };
// A cama em que ela se deita: quem dorme nela fica do tamanho de quem andava (a peça desenha a figura com 800 px).
const BED_SCALE = WALKING.height / 800;
const STRIP_TOP = DAY_STRIP.y - 9;

/** O rosto de quem está acordado há tantas horas: os olhos caem a cada dia. */
const faceAfter = (hours: number): Expression =>
  hours < 16 ? "neutral" : hours < 34 ? "sleepy" : "yawning";

type ThreeDaysShotProps = {
  /** Quadros do plano em que ela sai andando, em que chega à madrugada de quarta e em que se deita. */
  readonly wakeAt: number;
  readonly arriveAt: number;
  readonly lieAt: number;
  /** Quadro em que a primeira etiqueta, "segunda", entra; as outras entram quando ela chega ao dia. */
  readonly mondayAt: number;
};

/** A pessoa atravessa segunda, terça e quarta sem dormir, e só se deita no começo da quarta. */
const ThreeDaysShot: React.FC<ThreeDaysShotProps> = ({
  wakeAt,
  arriveAt,
  lieAt,
  mondayAt,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const seconds = frame / fps;
  const lying = frame >= lieAt;
  const awake = (AWAKE_HOURS - 1) * linear(frame, wakeAt, arriveAt - wakeAt);
  const hour = lying ? BEDTIME : WOKE + awake;
  // O quadro em que ela cruza a meia-noite de cada dia.
  const reaches = (at: number) =>
    wakeAt + ((at - WOKE) / (AWAKE_HOURS - 1)) * (arriveAt - wakeAt);
  const walking = frame > wakeAt && frame < arriveAt ? 1 : 0;

  return (
    <AbsoluteFill>
      <IdeaBackdrop hue="peach" spot={[0.5, 0.45]} />
      <DayStrip
        names={["segunda", "terça", "quarta"]}
        namedAt={[mondayAt, reaches(24), reaches(48)]}
        awake={[WOKE, hour]}
        on="peach"
      />
      {lying ? (
        // Ela enfim se deita, sobre a madrugada de quarta: na cama, como em todo plano em que dorme.
        <Bed
          x={stripX(BEDTIME)}
          y={STRIP_TOP}
          scale={BED_SCALE}
          // De pijama, como em todo plano de cama: a roupa de dia, ciano, fazia dela outra pessoa.
          colors={personInPajamas}
          hue="peach"
          shadow={false}
        />
      ) : (
        <Place
          x={stripX(hour)}
          y={STRIP_TOP - walking * 8 * Math.abs(wave(seconds, 0.5))}
          anchor="bottom"
          style={{
            // Quanto mais horas acordada, mais o corpo pende para a frente.
            rotate: `${mix(0, 7, awake / AWAKE_HOURS)}deg`,
            scale: `1 ${breath(seconds, "you")}`,
          }}
        >
          <Person
            height={WALKING.height}
            colors={person}
            expression={faceAfter(awake)}
            blink={blink(seconds, "you")}
          />
        </Place>
      )}
      <Grain />
    </AbsoluteFill>
  );
};

export const ElephantAwakeScene: React.FC<SceneProps> = ({ scene, shots }) => {
  const { fps } = useVideoConfig();
  const from = shots[1].from;

  return (
    <>
      <Shot range={shots[0]} name="46 horas acordada: dois dias e duas noites">
        <AwakeShot hoursAt={cue(scene, "quarenta")} />
      </Shot>
      <Shot range={shots[1]} name="de segunda de manhã à madrugada de quarta">
        <ThreeDaysShot
          wakeAt={cue(scene, "acordar") - from}
          arriveAt={cue(scene, "madrugada") - from + 0.3 * fps}
          lieAt={cue(scene, "quarta") - from}
          mondayAt={cue(scene, "segunda") - from}
        />
      </Shot>
    </>
  );
};
