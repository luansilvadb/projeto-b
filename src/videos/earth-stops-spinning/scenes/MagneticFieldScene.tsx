import { useId } from "react";
import { random, useCurrentFrame, useVideoConfig } from "remotion";
import { wave } from "../../../components/Idle";
import { popOpacity, popScale } from "../../../components/Pop";
import { cue, mix, ramp } from "../../../components/timing";
import type { SceneProps } from "../../../video/NarratedVideo";
import { Shot } from "../../../video/Shot";
import { earth, ink, inside } from "../palette";
import { NightSide } from "../parts/ClimateGlobes";
import { Globe } from "../parts/Globe";
import { Frame, InsideBackdrop, Push, Question, SpaceBackdrop, Svg } from "../parts/kit";

// As linhas do campo, de dentro para fora: a largura e a altura de cada laço,
// em múltiplos de `unit`.
const LOOPS = [
  [1.5, 0.9],
  [2.3, 1.3],
  [3.2, 1.7],
] as const;

type FieldProps = {
  readonly cx: number;
  readonly cy: number;
  /** O tamanho dos laços: o raio do que os gera. */
  readonly unit: number;
  /** A que distância do centro, no eixo, as linhas saem e voltam. */
  readonly pole: number;
  /** Quanto de cada linha já nasceu, de 0 a 1, a partir do polo sul. */
  readonly drawn?: number;
  /** O vão do tracejado, em pixels: 0 é a linha cheia. */
  readonly gap?: number;
  /** O tempo das contas que correm pela linha, em segundos; sem valor, nada corre. */
  readonly flow?: number;
  /** A opacidade de cada linha, pela posição dela. */
  readonly opacity?: (line: number) => number;
};

/**
 * As linhas do campo magnético: laços que saem perto de um polo, abrem para os
 * lados e voltam pelo outro. Fora da Terra, o campo corre do sul para o norte
 * geográfico, e é nesse sentido que as contas andam.
 */
const FieldLines: React.FC<FieldProps> = ({
  cx,
  cy,
  unit,
  pole,
  drawn = 1,
  gap = 0,
  flow,
  opacity = () => 1,
}) => (
  <g fill="none" stroke={inside.field} strokeWidth={9} strokeLinecap="round" opacity={drawn > 0 ? 1 : 0}>
    {([-1, 1] as const).flatMap((side) =>
      LOOPS.map(([wide, tall], index) => {
        const line = index * 2 + (side + 1) / 2;
        const x0 = cx + side * unit * 0.07 * (index + 1);
        const x1 = cx + side * unit * wide;
        const y1 = unit * tall;
        const along = flow === undefined ? 0 : (flow / (3 + index) + random(`field-${line}`)) % 1;
        const rest = 1 - along;
        return (
          <g key={line} opacity={opacity(line)}>
            <path
              d={`M${x0},${cy + pole} C${x1},${cy + y1} ${x1},${cy - y1} ${x0},${cy - pole}`}
              {...(drawn < 1
                ? { pathLength: 1, strokeDasharray: `${drawn} 1` }
                : { strokeDasharray: gap > 0 ? `30 ${gap}` : undefined })}
            />
            {flow === undefined || drawn < 1 ? null : (
              // O ponto da curva de Bézier em `along`, de baixo para cima.
              <circle
                cx={x0 * (rest ** 3 + along ** 3) + x1 * 3 * rest * along}
                cy={cy + pole * (rest ** 3 - along ** 3) + y1 * 3 * rest * along * (rest - along)}
                r={11}
                fill={ink.paper}
                stroke="none"
                opacity={Math.sin(Math.PI * along)}
              />
            )}
          </g>
        );
      }),
    )}
  </g>
);

const OUTSIDE = { cx: 960, cy: 550, r: 180 } as const;

type FlickerProps = {
  /** Os quadros em que as linhas começam a falhar e em que a interrogação entra. */
  readonly at: readonly [number, number];
};

/** A Terra com as linhas do campo em volta: elas piscam, como quem vai sumir, e fica a pergunta. */
const FieldFlickers: React.FC<FlickerProps> = ({ at }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const failing = ramp(frame, at[0], 0.5 * fps);
  return (
    <Frame backdrop={<SpaceBackdrop light={[0, 0.3]} />}>
      <Push focus={[OUTSIDE.cx, OUTSIDE.cy]} to={1.05}>
        <Svg>
          <FieldLines
            {...OUTSIDE}
            unit={OUTSIDE.r * 1.25}
            pole={OUTSIDE.r * 0.9}
            flow={frame / fps}
            // Cada linha falha por conta própria, em trancos de três quadros: nunca some de vez.
            opacity={(line) =>
              mix(1, random(`flicker-${line}-${Math.floor(frame / 3)}`) > 0.5 ? 0.95 : 0.3, failing)
            }
          />
          {/* A Terra está parada: é o mundo do experimento. */}
          <Globe {...OUTSIDE} spin={0.06} shade={0} />
          <NightSide {...OUTSIDE} />
          <g
            opacity={popOpacity(frame, at[1], 0.3 * fps)}
            transform={`translate(1500 250) scale(${popScale(frame, at[1], 0.3 * fps)})`}
          >
            <Question x={0} y={0} size={170} />
          </g>
        </Svg>
      </Push>
    </Frame>
  );
};

const CUT = { cx: 960, cy: 556, r: 330 } as const;
const IRON = { outer: CUT.r * 0.54, inner: CUT.r * 0.2 } as const;
const BUBBLES = 34;

/** O ferro líquido do núcleo de fora, borbulhando: as bolhas sobem do núcleo de dentro e estouram na borda. */
const LiquidIron: React.FC<{
  /** Quanto o calor agita, de 0 (um borbulhar baixo) a 1. */
  readonly heat: number;
}> = ({ heat }) => {
  const id = useId();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const seconds = frame / fps;
  return (
    <g>
      <defs>
        {/* O que emite luz tem o centro mais claro que a borda. */}
        <radialGradient id={id}>
          <stop offset="0.3" stopColor={inside.ironLight} />
          <stop offset="1" stopColor={inside.iron} />
        </radialGradient>
      </defs>
      <circle cx={CUT.cx} cy={CUT.cy} r={IRON.outer + 22} fill={inside.iron} opacity={0.28 + 0.1 * wave(seconds, 2.4)} />
      <circle cx={CUT.cx} cy={CUT.cy} r={IRON.outer} fill={`url(#${id})`} />
      {Array.from({ length: BUBBLES }, (_, index) => {
        const pick = (trait: string) => random(`iron-${trait}-${index}`);
        const rise = (seconds / (1.4 + 1.8 * pick("period")) + pick("phase")) % 1;
        const angle = pick("angle") * Math.PI * 2 + 0.5 * rise;
        const radius = mix(IRON.inner + 8, IRON.outer - 10, rise);
        return (
          <circle
            key={index}
            cx={CUT.cx + radius * Math.cos(angle)}
            cy={CUT.cy + radius * Math.sin(angle)}
            r={(5 + 12 * pick("size")) * Math.sin(Math.PI * rise) * (0.55 + 0.45 * heat)}
            fill={pick("tone") > 0.4 ? inside.core : inside.iron}
            opacity={0.9}
          />
        );
      })}
      <circle cx={CUT.cx} cy={CUT.cy} r={IRON.inner + 12} fill={inside.core} opacity={0.4} />
      <circle cx={CUT.cx} cy={CUT.cy} r={IRON.inner} fill={inside.core} />
    </g>
  );
};

type CutProps = {
  /** Quanto o calor agita o ferro, de 0 a 1. */
  readonly heat: number;
  /** Quanto das linhas já nasceu do núcleo. */
  readonly born: number;
  /** A Terra gira (1) ou está parada (0): a seta do giro, em volta do eixo. */
  readonly spinning: number;
  /** O vão do tracejado das linhas: 0 é a linha cheia. */
  readonly gap?: number;
  readonly children?: React.ReactNode;
};

/** A Terra em corte até o núcleo: a casca, o manto, o ferro líquido e as linhas do campo, que nascem dele. */
const EarthCut: React.FC<CutProps> = ({ heat, born, spinning, gap = 0, children }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const seconds = frame / fps;
  const { cx, cy, r } = CUT;
  const axis = cy - r - 58;
  return (
    <Svg>
      {/* A casca: o mar e a terra por fora, para se ver que é a Terra. */}
      <circle cx={cx} cy={cy} r={r} fill={earth.ocean[1]} />
      <circle
        cx={cx}
        cy={cy}
        r={r - 9}
        fill="none"
        stroke={earth.land}
        strokeWidth={18}
        strokeDasharray="210 130 90 260 320 180 140 230"
      />
      <circle cx={cx} cy={cy} r={r - 18} fill={inside.crust} />
      <circle cx={cx} cy={cy} r={r * 0.84} fill={inside.mantle} />
      <LiquidIron heat={heat} />
      <FieldLines
        cx={cx}
        cy={cy}
        unit={r * 0.8}
        pole={IRON.outer * 0.7}
        drawn={born}
        gap={gap}
        flow={gap > 0 ? undefined : seconds}
      />
      {/* A seta do giro em volta do eixo: correndo, ou parada e apagada. */}
      <g
        fill="none"
        stroke={ink.accent}
        strokeWidth={10}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={mix(0.3, 1, spinning)}
      >
        {/* A metade de cá da volta: o chão passa da esquerda para a direita, para leste. */}
        <path d={`M${cx - 120},${axis} A120,30 0 0 0 ${cx + 120},${axis}`} strokeDasharray="34 22" strokeDashoffset={-seconds * 90 * spinning} />
        <path d={`M${cx + 98},${axis + 12} L${cx + 122},${axis - 14} L${cx + 146},${axis + 12}`} />
      </g>
      {children}
    </Svg>
  );
};

type SourceProps = {
  /** Os quadros da fala: o calor agita o ferro, e as linhas nascem dele. */
  readonly at: readonly [number, number];
};

/** De onde o campo vem: o calor agita o ferro líquido, e as linhas nascem dali. */
const WhereItComesFrom: React.FC<SourceProps> = ({ at }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <Frame backdrop={<InsideBackdrop />}>
      <Push focus={[CUT.cx, CUT.cy]} to={1.05}>
        <EarthCut heat={ramp(frame, at[0], 0.8 * fps)} born={ramp(frame, at[1], 1.4 * fps)} spinning={1} />
      </Push>
    </Frame>
  );
};

type StoppedProps = {
  /** O quadro em que a interrogação entra. */
  readonly askAt: number;
};

/** A versão parada, no mesmo corte: o ferro ainda borbulha; as linhas ficam em tracejado, com a pergunta. */
const WithoutSpin: React.FC<StoppedProps> = ({ askAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const stopped = ramp(frame, 0.2 * fps, 0.8 * fps);
  return (
    <Frame backdrop={<InsideBackdrop />}>
      <Push focus={[CUT.cx, CUT.cy]} from={1.05} to={0.97} progress={ramp(frame, 0, 0.6 * fps)}>
        <Push focus={[CUT.cx, CUT.cy]} to={1.04}>
          <EarthCut heat={1} born={1} spinning={1 - stopped} gap={28 * stopped}>
            <g
              opacity={popOpacity(frame, askAt, 0.3 * fps)}
              transform={`translate(1540 250) scale(${popScale(frame, askAt, 0.3 * fps)})`}
            >
              <Question x={0} y={0} size={170} />
            </g>
          </EarthCut>
        </Push>
      </Push>
    </Frame>
  );
};

export const MagneticFieldScene: React.FC<SceneProps> = ({ scene, shots }) => (
  <>
    <Shot range={shots[0]} name="as linhas do campo piscam">
      <FieldFlickers at={[cue(scene, "costuma"), cue(scene, "história")]} />
    </Shot>
    <Shot range={shots[1]} name="o ferro líquido e o campo">
      <WhereItComesFrom at={[cue(scene, "calor") - shots[1].from, cue(scene, "ferro") - shots[1].from]} />
    </Shot>
    <Shot range={shots[2]} name="sem giro: linhas em tracejado">
      <WithoutSpin askAt={cue(scene, "nenhum") - shots[2].from} />
    </Shot>
  </>
);
