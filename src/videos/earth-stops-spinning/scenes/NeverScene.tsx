import { useId } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { Place } from "../../../components/Place";
import { Pop, popOpacity } from "../../../components/Pop";
import { ALREADY_SHOWN, cue, mix, ramp, settle } from "../../../components/timing";
import type { SceneProps } from "../../../video/NarratedVideo";
import { Shot } from "../../../video/Shot";
import { blockBrake, ink } from "../palette";
import { BrakeMoon } from "../parts/BrakeMoon";
import { Globe } from "../parts/Globe";
import { Frame, IdeaBackdrop, Push, SourceSeal, SpaceBackdrop, Svg, SvgText, Tag } from "../parts/kit";
import { Moon, SunDisc } from "../parts/Sky";

const TURN_SECONDS = 14;
// O plano do freio: a Terra grande, cortada pela borda, e a Lua empurrando a sapata.
const STAGE = { earth: { cx: 620, cy: 580, r: 390 }, moon: { cx: 1640, cy: 580, r: 124 } } as const;

/**
 * A régua de tempo dos dois últimos planos: da borda esquerda à direita são
 * 100 bilhões de anos, com um risco a cada 10. A barra do freio fica em cima
 * dela, e a do Sol, embaixo; as duas partem do mesmo zero.
 */
const RULER = { x0: 144, x1: 1740, y: 540, brakeY: 440, sunY: 635, height: 70 } as const;
// A barra do Sol: 8% da do freio.
const SUN_SHARE = 0.08;
// O que acontece no fim da barra do Sol, desenhado embaixo dela e fora da régua, para o
// tamanho do Sol não ser lido como tempo: a altura da cena, o raio do Sol de hoje e o
// do inchado, e o raio da Terra.
const ENDING = { y: 864, r: 40, swollen: 104, earth: 40 } as const;
// No plano da barra do freio a régua fica mais embaixo, no meio do quadro; no seguinte ela sobe e abre lugar para a barra do Sol.
const LOWERED = 150;

/** A Lua com a sapata de freio encostada na Terra, que continua girando. */
const StillTurning: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const seconds = frame / fps;
  return (
    <Frame backdrop={<SpaceBackdrop light={[0.05, 0.1]} />}>
      <Push focus={[1100, 580]} to={1.06}>
        <Svg>
          <BrakeMoon {...STAGE} seconds={seconds} />
          <Globe {...STAGE.earth} spin={seconds / TURN_SECONDS} />
        </Svg>
        {/* A sapata é a comparação da cena anterior: a etiqueta volta com ela. */}
        <Place x={1310} y={450}>
          <Tag on="dark" size="seal">
            comparação
          </Tag>
        </Place>
      </Push>
    </Frame>
  );
};

type RulerProps = {
  /** Quanto a barra do freio já cresceu, de 0 a 1. */
  readonly brake: number;
  /** Os quadros em que entram as duas linhas da etiqueta dela. */
  readonly noteAt: readonly [number, number];
  readonly children?: React.ReactNode;
};

/** A régua com a barra do freio; o que o plano põe embaixo dela vem em `children`, e fica por baixo da régua. */
const Ruler: React.FC<RulerProps> = ({ brake, noteAt, children }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const tip = mix(RULER.x0, RULER.x1, brake);
  return (
    <Svg>
      {children}
      <line
        x1={RULER.x0}
        y1={RULER.y}
        x2={RULER.x1}
        y2={RULER.y}
        stroke={ink.dark}
        strokeWidth={8}
        strokeLinecap="round"
      />
      {Array.from({ length: 11 }, (_, index) => {
        const x = mix(RULER.x0, RULER.x1, index / 10);
        return (
          <line
            key={index}
            x1={x}
            y1={RULER.y - 22}
            x2={x}
            y2={RULER.y + 22}
            stroke={ink.dark}
            strokeWidth={8}
            strokeLinecap="round"
          />
        );
      })}
      <rect
        x={RULER.x0}
        y={RULER.brakeY - RULER.height / 2}
        width={tip - RULER.x0}
        height={RULER.height}
        rx={14}
        fill={blockBrake.bar}
      />
      {/* A Lua na ponta diz de quem é a barra. */}
      <Moon cx={tip} cy={RULER.brakeY} r={50} night={-0.35} />
      {(["dia de um mês e meio:", "pelo menos 50 bilhões de anos (extrapolação)"] as const).map((line, index) => (
        <SvgText
          key={line}
          x={RULER.x0}
          y={250 + index * 72}
          anchor="start"
          fill={ink.dark}
          opacity={popOpacity(frame, noteAt[index], 0.4 * fps)}
        >
          {line}
        </SvgText>
      ))}
    </Svg>
  );
};

type BrakeBarProps = {
  /** O quadro em que a barra chega ao fim da régua. */
  readonly doneAt: number;
  readonly noteAt: readonly [number, number];
};

/** A barra do freio atravessa o quadro. */
const BrakeBar: React.FC<BrakeBarProps> = ({ doneAt, noteAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <Frame backdrop={<IdeaBackdrop hue="mint" />}>
      {/* A aproximação lenta termina no tamanho em que o plano seguinte começa. */}
      <Push from={0.97} to={1}>
        <AbsoluteFill style={{ translate: `0 ${LOWERED}px` }}>
          <Ruler brake={ramp(frame, 0.2 * fps, Math.max(doneAt - 0.2 * fps, fps))} noteAt={noteAt} />
        </AbsoluteFill>
      </Push>
    </Frame>
  );
};

type SunBarProps = {
  /** O Sol incha; a etiqueta da barra dele entra. */
  readonly at: readonly [number, number];
};

/** Na mesma régua, a barra do Sol, curta e limpa; embaixo do fim dela, o Sol incha, vermelho, e alcança a Terra. */
const SunBar: React.FC<SunBarProps> = ({ at }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const end = mix(RULER.x0, RULER.x1, SUN_SHARE);
  const tip = mix(RULER.x0, end, ramp(frame, 0, 0.6 * fps));
  const swollen = ramp(frame, at[0], 1.1 * fps);
  // O Sol incha para a frente, com a beira de trás parada, até ficar centrado sob o fim da barra
  // e cobrir metade da Terra, que espera adiante.
  const earth = { cx: end + ENDING.swollen, cy: ENDING.y, r: ENDING.earth };
  const id = useId();
  const sun = mix(ENDING.r, ENDING.swollen, swollen);
  const sunX = end - ENDING.swollen + sun;
  return (
    <Frame backdrop={<IdeaBackdrop hue="mint" />}>
      {/* A câmera chega: parte de onde a do plano anterior parou e desce, abrindo o lugar da barra do Sol. */}
      <AbsoluteFill style={{ translate: `0 ${LOWERED * (1 - settle(frame, 0, 0.7 * fps))}px` }}>
        <Ruler brake={1} noteAt={[ALREADY_SHOWN, ALREADY_SHOWN]}>
          <Globe {...earth} spin={frame / fps / TURN_SECONDS} caps={false} />
          {/* Sem o halo, que suja o fundo verde. */}
          <defs>
            <clipPath id={`${id}-sun`}>
              <circle cx={sunX} cy={ENDING.y} r={sun} />
            </clipPath>
          </defs>
          <g clipPath={`url(#${id}-sun)`}>
            <SunDisc cx={sunX} cy={ENDING.y} r={sun} red={swollen} />
          </g>
          {/* O fio que prende a cena ao fim da barra: é ali que o Sol incha. */}
          <line
            x1={end}
            y1={RULER.sunY + RULER.height / 2 + 14}
            x2={end}
            y2={ENDING.y - ENDING.swollen - 14}
            stroke={ink.dark}
            strokeWidth={6}
            strokeLinecap="round"
            opacity={swollen}
          />
          <rect
            x={RULER.x0}
            y={RULER.sunY - RULER.height / 2}
            width={tip - RULER.x0}
            height={RULER.height}
            rx={Math.min(14, (tip - RULER.x0) / 2)}
            fill={blockBrake.sunBar}
          />
        </Ruler>
        <Place x={end + 40} y={RULER.sunY} style={{ translate: "0 -50%" }}>
          <Pop at={at[1]}>
            <Tag on="light">menos de 8 bilhões</Tag>
          </Pop>
        </Place>
      </AbsoluteFill>
      <SourceSeal>Schröder e Smith, 2008</SourceSeal>
    </Frame>
  );
};

export const NeverScene: React.FC<SceneProps> = ({ scene, shots }) => (
  <>
    <Shot range={shots[0]} name="o freio encostado">
      <StillTurning />
    </Shot>
    <Shot range={shots[1]} name="a barra do freio">
      <BrakeBar
        doneAt={cue(scene, "bilhões") - shots[1].from}
        noteAt={[cue(scene, "durar") - shots[1].from, cue(scene, "cinquenta") - shots[1].from]}
      />
    </Shot>
    <Shot range={shots[2]} name="a barra do Sol">
      <SunBar at={[cue(scene, "incha") - shots[2].from, cue(scene, "menos", 2) - shots[2].from]} />
    </Shot>
  </>
);
