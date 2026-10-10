import { useId } from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { blink } from "../../../components/Idle";
import { Place } from "../../../components/Place";
import { Pop } from "../../../components/Pop";
import { cue, mix, ramp, settle, shake } from "../../../components/timing";
import type { SceneProps } from "../../../video/NarratedVideo";
import { Shot } from "../../../video/Shot";
import { earth, ink } from "../palette";
import { Globe, House } from "../parts/Globe";
import { Frame, Push, SpaceBackdrop, Svg, Tag } from "../parts/kit";
import { LeverStation } from "../parts/Lever";
import { Arrive } from "../parts/SpeedKit";
import { STAGE } from "./SwitchOffScene";

const TURN_SECONDS = 14;
// Quanto do curso da alavanca ela vence antes de desistir: uns 14 graus da haste.
const TUG = 0.4;
// A câmera do plano da hesitação: parte de onde `switch-off` deixou a alavanca e fecha mais nela.
const NEAR = { focus: [1200, 640], from: 1.08, to: 1.16 } as const;

type HesitateProps = {
  /** O quadro em que ela puxa, o em que desiste do puxão, o em que olha a Terra e o em que volta à alavanca. */
  readonly tugAt: number;
  readonly letGoAt: number;
  readonly lookAt: number;
  readonly backAt: number;
};

/** A Vigília com as duas mãos na alavanca: começa a puxar, para, olha a Terra. */
const Hesitate: React.FC<HesitateProps> = ({ tugAt, letGoAt, lookAt, backAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // Ela puxa de verdade: a haste cede, fica presa no esforço, e em "Só" ela afrouxa e a haste volta com sobra.
  const tug = ramp(frame, tugAt, 0.3 * fps) - settle(frame, letGoAt, 0.25 * fps);
  const spring = shake(frame, letGoAt, 0.5 * fps, 0.12, 2);
  const look = ramp(frame, lookAt, 0.4 * fps) - ramp(frame, backAt, 0.5 * fps);
  const worry = ramp(frame, letGoAt, 0.4 * fps);
  const closed = Math.max(0.12, blink(frame / fps, "vigilia"));
  return (
    <Frame backdrop={<SpaceBackdrop light={[0.05, 0.1]} />}>
      <Push {...NEAR}>
        <Svg>
          <Globe {...STAGE.earth} spin={frame / fps / TURN_SECONDS} />
          <LeverStation
            {...STAGE.lever}
            on={1 - TUG * tug + spring}
            hands={1}
            grip={{
              lean: mix(10, 2, tug),
              grit: tug,
              squint: 0.6 * tug,
              turn: mix(0.9, 0.25, look),
              nod: mix(-0.3, -0.4, look),
              gaze: [mix(0.6, -0.8, look), mix(-0.4, -0.5, look)],
              nearBrow: [-0.5 * worry, 5 * worry],
              farBrow: [-0.5 * worry, 6 * worry],
              mouth: [mix(11, 9, worry), 0.15 * worry, mix(0.1, -0.5, worry)],
              nearLid: closed,
              farLid: closed,
            }}
            shadow={ink.dark}
          />
        </Svg>
      </Push>
    </Frame>
  );
};

// A faixa de manchas da rocha que se repete, em unidades do disco (raio 100): a mesma conta do `Globe`.
const STRIP = 400;
const BLOTCHES: readonly (readonly [number, number, number, number])[] = [
  [-60, -40, 34, 22],
  [10, 30, 46, 26],
  [70, -55, 26, 16],
  [130, 10, 38, 30],
  [200, -30, 30, 18],
  [250, 50, 42, 20],
  [310, -10, 28, 24],
];
// Os veios claros e as fendas: riscos que cruzam o disco, para o giro (e a falta dele) se ver de longe.
const VEINS: readonly (readonly [number, number, number])[] = [
  [-20, -70, 60],
  [50, 62, 80],
  [110, -22, 50],
  [170, 74, 44],
  [230, -72, 70],
  [290, 26, 56],
  [350, -44, 40],
];
const CRACKS = [0, 96, 184, 262, 340] as const;

/** A rocha sem as camadas de cima: um disco de pedra, com manchas, veios e fendas que deslizam para leste enquanto ela gira. */
const Rock: React.FC<{ readonly spin: number; readonly jolt: number }> = ({ spin, jolt }) => {
  const id = useId();
  const { cx, cy, r } = STAGE.earth;
  const drift = (((spin % 1) + 1) % 1) * STRIP;
  return (
    <g transform={`translate(${cx + jolt} ${cy}) scale(${r / 100})`}>
      <defs>
        <clipPath id={`${id}-disc`}>
          <circle r="100" />
        </clipPath>
        <mask id={`${id}-shade`}>
          <circle r="100" fill="white" />
          <circle cx="-26" cy="-26" r="100" fill="black" />
        </mask>
      </defs>
      <circle r="100" fill={earth.rock} />
      <g clipPath={`url(#${id}-disc)`}>
        {[0, STRIP].map((offset) => (
          <g key={offset} transform={`translate(${drift - offset} 0)`}>
            <g fill={earth.rockShade}>
              {BLOTCHES.map(([x, y, rx, ry], index) => (
                <ellipse key={index} cx={x} cy={y} rx={rx} ry={ry} />
              ))}
            </g>
            <g stroke={earth.mantle} strokeWidth={7} strokeLinecap="round" opacity={0.75}>
              {VEINS.map(([x, y, length], index) => (
                <line key={index} x1={x} y1={y} x2={x + length} y2={y + (index % 2 === 0 ? 8 : -8)} />
              ))}
            </g>
            <g fill="none" stroke={earth.rockShade} strokeWidth={5} strokeLinejoin="round">
              {CRACKS.map((x, index) => (
                <path key={x} d={`M${x},-100 l${index % 2 === 0 ? 14 : -12},46 l-16,38 l20,44 l-10,72`} />
              ))}
            </g>
          </g>
        ))}
      </g>
      <circle r="100" fill={earth.shade} opacity={0.4} mask={`url(#${id}-shade)`} />
    </g>
  );
};

// O achatamento com que um círculo de latitude é visto de lado: o de `LatitudeRing`.
const RING_TILT = 0.16;
// Quanto as camadas ficam afastadas da rocha, em raios: destacadas, sobram dos dois lados do disco.
const LIFT = 1.17;
// A volta das camadas (e da rocha, até travar), em segundos: depressa o bastante para se ver quem parou e quem não.
const LAYER_TURN_SECONDS = 5;
// A casca azul sai da rocha neste tempo, depois de um instante com a Terra do plano anterior.
const PEEL = { at: 0.15, seconds: 0.5 } as const;
// O solavanco da rocha quando trava, quadro a quadro: passa do ponto para leste e volta.
const ROCK_JOLT = [16, -10, 4] as const;

type BeltProps = {
  readonly lat: number;
  readonly spin: number;
  readonly color: string;
  readonly width: number;
  readonly opacity?: number;
  /** Quanto a camada já se afastou da rocha, de 0 (colada) a 1. */
  readonly lifted?: number;
  /** Quantas coisas a faixa leva, e o desenho de uma delas, com a base na origem. */
  readonly count: number;
  readonly item: React.ReactNode;
  /** A metade de lá vai antes da rocha; a de cá, depois. */
  readonly half: "back" | "front";
};

/** Uma camada destacada da Terra: uma faixa em volta da rocha, que leva o que é dela para leste. */
const Belt: React.FC<BeltProps> = ({ lat, spin, color, width, opacity = 1, lifted = 1, count, item, half }) => {
  const { cx, cy, r } = STAGE.earth;
  const phi = (lat * Math.PI) / 180;
  const lift = mix(1, LIFT, lifted);
  const rx = r * lift * Math.cos(phi);
  const ry = rx * RING_TILT;
  const y = cy - r * lift * Math.sin(phi);
  if (half === "back") {
    return (
      <path
        d={`M${cx - rx},${y} A${rx},${ry} 0 0 1 ${cx + rx},${y}`}
        fill="none"
        stroke={color}
        strokeWidth={width * 0.6}
        opacity={0.3 * opacity}
      />
    );
  }
  return (
    <g>
      <path
        d={`M${cx - rx},${y} A${rx},${ry} 0 0 0 ${cx + rx},${y}`}
        fill="none"
        stroke={color}
        strokeWidth={width}
        opacity={opacity}
      />
      {Array.from({ length: count }, (_, index) => {
        const theta = (spin + index / count) * Math.PI * 2;
        const depth = Math.cos(theta);
        if (depth <= 0.08) {
          return null;
        }
        return (
          <g
            key={index}
            transform={`translate(${cx + rx * Math.sin(theta)} ${y + ry * depth}) scale(${(0.3 + 0.7 * depth).toFixed(3)} 1)`}
            opacity={Math.min(1, depth * 4)}
          >
            {item}
          </g>
        );
      })}
    </g>
  );
};

// As três camadas soltas, de cima para baixo no quadro: o ar, o mar e a fileira de casinhas.
const LAYERS = [
  {
    lat: 31,
    color: earth.air,
    width: 56,
    opacity: 0.6,
    count: 7,
    item: <rect x={-42} y={-13} width={84} height={26} rx={13} fill={ink.paper} />,
  },
  {
    lat: 0,
    color: earth.water,
    width: 50,
    opacity: 1,
    count: 9,
    item: (
      <path
        d="M-30,2 q15,-14 30,0 q15,14 30,0"
        fill="none"
        stroke={earth.waterLight}
        strokeWidth={8}
        strokeLinecap="round"
      />
    ),
  },
  {
    lat: -31,
    color: earth.land,
    width: 16,
    opacity: 1,
    count: 8,
    item: <House x={0} y={-4} size={58} />,
  },
] as const;

type StopProps = {
  /** O quadro em que a rocha trava: a alavanca chega ao fim do curso nele. */
  readonly stopAt: number;
  /** Quantos quadros a cena já tinha quando o plano começou: a Terra azul entra no giro em que estava. */
  readonly before: number;
};

const PULL_SECONDS = 0.35;

/** A casca azul sai e deixa a rocha à vista; ela puxa a alavanca, a rocha trava de uma vez, e o ar, o mar e as casinhas continuam para leste. */
const OnlyTheRock: React.FC<StopProps> = ({ stopAt, before }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const turns = (at: number) => at / fps / LAYER_TURN_SECONDS;
  const pulled = settle(frame, stopAt - PULL_SECONDS * fps, PULL_SECONDS * fps);
  // Depois do tranco, ela olha o que fez.
  const after = ramp(frame, stopAt + 0.2 * fps, 0.4 * fps);
  const effort = pulled * (1 - after);
  const spin = turns(frame);
  // A mesma Terra do plano anterior, no mesmo giro: a casca cresce, some, e vira as três camadas.
  const peeled = ramp(frame, PEEL.at * fps, PEEL.seconds * fps);
  const { cx, cy, r } = STAGE.earth;
  return (
    <Frame backdrop={<SpaceBackdrop light={[0.05, 0.1]} />}>
      <Push focus={[STAGE.earth.cx, STAGE.earth.cy]} to={1.03}>
        <Arrive from={NEAR.to} focus={NEAR.focus}>
          <Svg>
            <g opacity={peeled}>
              {LAYERS.map((layer) => (
                <Belt key={layer.lat} {...layer} spin={spin} lifted={peeled} half="back" />
              ))}
            </g>
            <Rock spin={turns(Math.min(frame, stopAt))} jolt={ROCK_JOLT[frame - stopAt] ?? 0} />
            {peeled < 1 ? (
              <g opacity={1 - peeled}>
                <Globe cx={cx} cy={cy} r={r * mix(1, LIFT, peeled)} spin={(before + frame) / fps / TURN_SECONDS} />
              </g>
            ) : null}
            <g opacity={peeled}>
              {LAYERS.map((layer) => (
                <Belt key={layer.lat} {...layer} spin={spin} lifted={peeled} half="front" />
              ))}
            </g>
            <LeverStation
              {...STAGE.lever}
              on={1 - pulled}
              hands={1}
              grip={{
                turn: mix(0.9, 0.3, after),
                gaze: [mix(0.6, -0.8, after), -0.4],
                grit: effort,
                squint: 0.6 * effort,
                pupil: mix(1, 0.75, after),
                nearLid: 0.12 * (1 - after),
                farLid: 0.12 * (1 - after),
                nearBrow: [-0.5 * after, 6 * after],
                farBrow: [-0.5 * after, 7 * after],
                mouth: [11, 0.5 * after, 0.1 * (1 - after)],
              }}
              shadow={ink.dark}
            />
          </Svg>
        </Arrive>
      </Push>
      <Place x={STAGE.earth.cx} y={928}>
        <Pop at={stopAt + 0.15 * fps}>
          <Tag on="dark">só a rocha para</Tag>
        </Pop>
      </Place>
    </Frame>
  );
};

export const TheRuleScene: React.FC<SceneProps> = ({ scene, shots }) => (
  <>
    <Shot range={shots[0]} name="ela hesita">
      <Hesitate
        tugAt={cue(scene, "parada")}
        letGoAt={cue(scene, "Só")}
        lookAt={cue(scene, "planeta")}
        backAt={cue(scene, "adiante")}
      />
    </Shot>
    <Shot range={shots[1]} name="só a rocha para">
      <OnlyTheRock stopAt={cue(scene, "para", 2) - shots[1].from} before={shots[1].from} />
    </Shot>
  </>
);
