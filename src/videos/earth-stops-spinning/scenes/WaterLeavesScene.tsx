import { useCurrentFrame, useVideoConfig } from "remotion";
import { wave } from "../../../components/Idle";
import { Place } from "../../../components/Place";
import { Pop, popOpacity, popScale } from "../../../components/Pop";
import { cue, linear, ramp, shake } from "../../../components/timing";
import { FPS } from "../../../format";
import type { SceneProps } from "../../../video/NarratedVideo";
import { Shot, useShotLength } from "../../../video/Shot";
import { ink } from "../palette";
import {
  Caveat,
  CUT_BULGE,
  CutEarth,
  CutRays,
  EscapeArrows,
  mixSea,
  SEA,
  SeaFlow,
} from "../parts/CutEarth";
import { Arrow, Frame, Push, SpaceBackdrop, Svg, SvgText, Tag } from "../parts/kit";

const EARTH = { cx: 960, cy: 540, r: 280 } as const;
// No segundo plano a Terra fica inteira (os dois polos precisam aparecer), maior e a oeste: as palavras ocupam o leste.
const WHOLE = { cx: 790, cy: 540, r: 300 } as const;
const TURN_SECONDS = 14;
// Quanto da água já foi para os polos quando o primeiro plano acaba; o segundo continua dali.
const HALFWAY = 0.3;
// De onde a câmera do segundo plano parte: o enquadramento do primeiro, com a Terra no centro.
const WIDE = EARTH.r / WHOLE.r;
const ARRIVAL = [
  (EARTH.cx - WIDE * WHOLE.cx) / (1 - WIDE),
  (EARTH.cy - WIDE * WHOLE.cy) / (1 - WIDE),
] as const;

// A Terra leva este tempo para parar, a partir da palavra: o bastante para a freada se ver.
const STOP_SECONDS = 1.2;
// A seta do giro, em volta do eixo, acima do polo: a de `water-piled`, que aqui se recolhe quando o giro acaba.
const RING = { y: EARTH.cy - EARTH.r * (1 + SEA.even.pole) - 60, rx: 120, ry: 34 } as const;
// As setas da gravidade, as de `water-piled`: de quanto acima da superfície do mar saem, e até onde chegam.
// Uma em cada polo, uma em cada ponta do equador e as do meio, todas do mesmo tamanho: ela puxa por igual.
const GRAVITY = { count: 8, from: 150, to: 50 } as const;
// Quanto a água do equador sobe e desce quando nada mais a mantém lá, em fração do raio do polo.
const WOBBLE = 0.06;

/** As voltas de uma Terra que gira até `from` segundos e daí freia até parar, em `STOP_SECONDS`. */
const brakingTurns = (seconds: number, from: number) => {
  const t = Math.min(Math.max(seconds - from, 0), STOP_SECONDS);
  return (Math.min(seconds, from) + t - (t * t) / (2 * STOP_SECONDS)) / TURN_SECONDS;
};

type StopCues = {
  /** Os quadros em que a Terra começa a frear, as setas de escapar acabam, a gravidade aparece, a água fica solta, a rocha é apontada e a água começa a sair. */
  readonly brake: number;
  readonly over: number;
  readonly gravity: number;
  readonly loose: number;
  readonly solid: number;
  readonly flow: number;
};

/**
 * A Terra em corte para de girar à vista: a seta do giro se recolhe e a tentativa de escapar some.
 * A gravidade aparece em toda a volta, igual; a água do equador, solta, balança; a rocha fica como
 * estava, e a água começa a deixar a cintura.
 */
const StopsSpinning: React.FC<{ readonly at: StopCues }> = ({ at }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const length = useShotLength();
  const seconds = frame / fps;
  // Sai devagar e sem parar: o segundo plano continua a descida de onde esta ficou.
  const still = mixSea(SEA.even, SEA.polar, HALFWAY * linear(frame, at.flow, length - at.flow));
  // Sem nada que a mantenha lá, a água da cintura balança antes de ceder: o que sai do equador vai para os polos.
  const wobble = shake(frame, at.loose, 1.4 * fps, WOBBLE, 3);
  const sea = { equator: still.equator - wobble, pole: still.pole + wobble / 2 };
  // As setas encolhem com o giro e acabam na palavra.
  const strength = 1 - ramp(frame, at.over - 0.9 * fps, 1.2 * fps);
  // A seta do giro se recolhe enquanto a Terra freia: a ponta volta pelo arco até o começo dele.
  const spun = 1 - ramp(frame, at.brake, STOP_SECONDS * fps);
  const turn = Math.PI * spun;
  // A gravidade entra inteira, de uma vez, em toda a volta; cede a vez ao contorno da rocha e sai quando a água começa a descer.
  const pulled = ramp(frame, at.gravity, 0.4 * fps);
  const pulling = (1 - 0.6 * ramp(frame, at.solid, 0.4 * fps)) * (1 - ramp(frame, at.flow - 0.5 * fps, 0.4 * fps));
  const pull = 8 * wave(seconds, 1.1);
  // A rocha, apontada enquanto a fala diz que ela continua larga: o contorno dela acende e apaga.
  const rock = ramp(frame, at.solid, 0.4 * fps) * (1 - ramp(frame, at.flow - 0.4 * fps, 0.4 * fps));
  return (
    <Frame backdrop={<SpaceBackdrop light={[0.08, 0.1]} />}>
      <Push focus={[EARTH.cx, EARTH.cy]} from={1.22} to={1} progress={ramp(frame, 0, 0.7 * fps)}>
        <Push focus={[EARTH.cx, EARTH.cy]} to={1.04}>
          <Svg>
            <CutEarth {...EARTH} spin={brakingTurns(seconds, at.brake / fps)} sea={sea} />
            <EscapeArrows
              {...EARTH}
              sea={sea}
              strength={strength}
              beat={10 * strength * wave(seconds, 1.1)}
            />
            {spun > 0.02 ? (
              <g>
                <path
                  d={`M${EARTH.cx - RING.rx},${RING.y} A${RING.rx},${RING.ry} 0 0 0 ${EARTH.cx + RING.rx},${RING.y}`}
                  fill="none"
                  stroke={ink.accent}
                  strokeWidth={14}
                  strokeLinecap="round"
                  pathLength={1}
                  strokeDasharray="1 1"
                  strokeDashoffset={1 - spun}
                />
                <path
                  d="M0,-34 L-26,12 L26,12 Z"
                  fill={ink.accent}
                  transform={`translate(${EARTH.cx - RING.rx * Math.cos(turn)} ${RING.y + RING.ry * Math.sin(turn) - 6 * spun}) rotate(${(Math.atan2(RING.ry * Math.cos(turn), RING.rx * Math.sin(turn)) * 180) / Math.PI + 90}) scale(${Math.min(1, spun * 4)})`}
                />
              </g>
            ) : null}
            {Array.from({ length: GRAVITY.count }, (_, index) => {
              const angle = (index / GRAVITY.count) * Math.PI * 2;
              const surface = [
                EARTH.r * (1 + CUT_BULGE + SEA.even.equator) * Math.cos(angle),
                EARTH.r * (1 + SEA.even.pole) * Math.sin(angle),
              ] as const;
              const far = Math.hypot(...surface);
              const point = (out: number) =>
                [
                  EARTH.cx + (surface[0] * (far + out)) / far,
                  EARTH.cy + (surface[1] * (far + out)) / far,
                ] as const;
              return (
                <Arrow
                  key={index}
                  from={point(GRAVITY.from - pull)}
                  to={point(GRAVITY.to - pull)}
                  width={14}
                  drawn={pulled}
                  opacity={pulling}
                />
              );
            })}
            <ellipse
              cx={EARTH.cx}
              cy={EARTH.cy}
              rx={EARTH.r * (1 + CUT_BULGE)}
              ry={EARTH.r}
              fill="none"
              stroke={ink.accent}
              strokeWidth={10}
              opacity={rock}
            />
            <SeaFlow
              {...EARTH}
              sea={sea}
              seconds={seconds}
              opacity={ramp(frame, at.flow, 0.4 * fps)}
            />
          </Svg>
          {/* Acima da cintura, do lado de fora, onde nem as setas de escapar nem as da gravidade passam. */}
          <Place x={EARTH.cx - 490} y={EARTH.cy - 365}>
            <Pop at={8}>
              <Caveat on="dark">exagerado</Caveat>
            </Pop>
          </Place>
        </Push>
      </Push>
    </Frame>
  );
};

type LevelCues = {
  /** Os quadros em que o equador é marcado como alto, a etiqueta do polo entra, os polos são marcados como baixo e a fala diz que a água desce. */
  readonly high: number;
  readonly near: number;
  readonly low: number;
  readonly down: number;
};

/** Uma palavra da régua de altura, que entra com sobra dentro do SVG. */
const Level: React.FC<{
  readonly at: number;
  readonly x: number;
  readonly y: number;
  readonly fill: string;
  readonly anchor?: "start" | "middle";
  readonly children: string;
}> = ({ at, x, y, fill, anchor = "middle", children }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <g
      transform={`translate(${x} ${y}) scale(${popScale(frame, at, 0.3 * fps)})`}
      opacity={popOpacity(frame, at, 0.3 * fps)}
    >
      <SvgText x={0} y={0} size="note" fill={fill} anchor={anchor}>
        {children}
      </SvgText>
    </g>
  );
};

/**
 * Os dois raios voltam, e o do polo vira a régua de altura: o círculo em
 * tracejado é a mesma distância do centro em toda parte. A cintura passa dele
 * (alto) e os polos ficam nele (baixo). A água desce da cintura e termina num
 * círculo igual, mais para fora: cobre os dois polos e deixa a cintura seca.
 */
const HighAndLow: React.FC<{ readonly at: LevelCues; readonly spin: number }> = ({ at, spin }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // A descida é um processo, e ocupa o plano inteiro. Até "alto" a água do equador afina até acabar:
  // a rocha aponta ali na palavra. Daí a faixa seca alarga no mesmo passo até um nada depois de "desce"
  // (com a fala real, sobra 1,2 s de oceanos nos polos e equador seco, parados, antes do corte).
  const done = at.down + 0.4 * fps;
  // A faixa seca cresce com a raiz do quanto o mar baixou (é o cruzamento de duas elipses): o quadrado
  // desfaz isso, para ela não abrir quase inteira nos primeiros quadros.
  const flow =
    HALFWAY +
    (0.5 - HALFWAY) * linear(frame, 0, at.high) +
    0.5 * linear(frame, at.high, done - at.high) ** 2;
  const sea = mixSea(SEA.even, SEA.polar, flow);
  const pole = WHOLE.r * (1 + SEA.polar.pole) + 50;
  return (
    <Frame backdrop={<SpaceBackdrop light={[0.08, 0.1]} />}>
      {/* A câmera chega de onde o plano anterior deixou a Terra. */}
      <Push focus={ARRIVAL} from={WIDE} to={1} progress={ramp(frame, 0, 0.8 * fps)}>
        <Svg>
          <CutEarth {...WHOLE} sea={sea} spin={spin} />
          <SeaFlow
            {...WHOLE}
            sea={sea}
            seconds={frame / fps}
            opacity={0.9 * (1 - ramp(frame, done - 0.2 * fps, 0.5 * fps))}
          />
          {/* O resto do círculo que o raio do polo traça em `CutRays`: a régua dá a volta inteira e passa pelo outro polo. */}
          <path
            d={`M${WHOLE.cx + WHOLE.r},${WHOLE.cy} A${WHOLE.r},${WHOLE.r} 0 1 1 ${WHOLE.cx},${WHOLE.cy - WHOLE.r}`}
            fill="none"
            stroke={ink.paper}
            strokeWidth={6}
            strokeDasharray="6 16"
            strokeLinecap="round"
            opacity={0.7 * ramp(frame, 1.4 * fps, 0.5 * fps)}
          />
          <CutRays
            {...WHOLE}
            drawn={ramp(frame, 0.5 * fps, 0.4 * fps)}
            swung={ramp(frame, 0.9 * fps, 0.5 * fps)}
            lit={ramp(frame, at.high, 0.3 * fps)}
          />
          {/* Na ponta do pedaço a mais, que é o que está alto. */}
          <Level
            at={at.high}
            x={WHOLE.cx + WHOLE.r * (1 + CUT_BULGE) + 60}
            y={WHOLE.cy}
            fill={ink.accent}
            anchor="start"
          >
            alto
          </Level>
          <Level at={at.low} x={WHOLE.cx} y={WHOLE.cy - pole} fill={ink.paper}>
            baixo
          </Level>
          <Level at={at.low + 0.2 * fps} x={WHOLE.cx} y={WHOLE.cy + pole} fill={ink.paper}>
            baixo
          </Level>
        </Svg>
        {/* Ao lado do polo de cima, que é de quem ela fala. */}
        <Place x={1390} y={240}>
          <Pop at={at.near}>
            <Tag on="dark" size="note">
              21 km mais perto do centro
            </Tag>
          </Pop>
        </Place>
        {/* Encostada na cintura, do lado de fora. */}
        <Place x={WHOLE.cx - 440} y={WHOLE.cy + 250}>
          <Pop at={0.9 * fps}>
            <Caveat on="dark">exagerado</Caveat>
          </Pop>
        </Place>
      </Push>
    </Frame>
  );
};

export const WaterLeavesScene: React.FC<SceneProps> = ({ scene, shots }) => {
  // A Terra chega girando, como a cena anterior a deixou, e freia quando a fala diz que não há mais rotação.
  const brake = cue(scene, "rotação");
  const level = (word: string, occurrence = 1) => cue(scene, word, occurrence) - shots[1].from;
  return (
    <>
      <Shot range={shots[0]} name="a Terra para, a tentativa some">
        <StopsSpinning
          at={{
            brake,
            over: cue(scene, "curva"),
            gravity: cue(scene, "gravidade"),
            loose: cue(scene, "mantém"),
            solid: cue(scene, "sólida"),
            flow: cue(scene, "água", 2),
          }}
        />
      </Shot>
      <Shot range={shots[1]} name="o alto e o baixo">
        <HighAndLow
          spin={brakingTurns(Infinity, brake / FPS)}
          at={{
            high: level("alto"),
            near: level("vinte"),
            low: level("baixo"),
            down: level("desce"),
          }}
        />
      </Shot>
    </>
  );
};
