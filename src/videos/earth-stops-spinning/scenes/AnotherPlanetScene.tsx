import { useId } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { mixPose, type VigiliaPose } from "../../../art/Vigilia";
import { popOpacity } from "../../../components/Pop";
import { clamp01, cue, linear, mix, ramp, settle, shake } from "../../../components/timing";
import type { SceneProps } from "../../../video/NarratedVideo";
import { Shot, useShotLength } from "../../../video/Shot";
import { earth, home, ink, space } from "../palette";
import { Cup, LOOK_UP, STARTLED, Vig } from "../parts/Actor";
import { alive } from "../parts/EndAlive";
import { Globe } from "../parts/Globe";
import { Kitchen, KITCHEN } from "../parts/Kitchen";
import { Frame, Push, SpaceBackdrop, Svg } from "../parts/kit";

const TURN_SECONDS = 14;

/** O outro planeta: sem rosto, rosado, com manchas e a sombra do lado oposto à luz (a esquerda). */
const OtherPlanet: React.FC<{ readonly cx: number; readonly cy: number; readonly r: number }> = ({
  cx,
  cy,
  r,
}) => {
  const id = useId();
  return (
    <g transform={`translate(${cx} ${cy}) scale(${r / 100})`}>
      <defs>
        <clipPath id={id}>
          <circle r={100} />
        </clipPath>
        <mask id={`${id}-shade`}>
          <circle r={100} fill="white" />
          <circle cx={-24} cy={-20} r={100} fill="black" />
        </mask>
      </defs>
      <circle r={100} fill={space.otherPlanet} />
      <g clipPath={`url(#${id})`} fill={space.otherPlanetShade} opacity={0.5}>
        <ellipse cx={-52} cy={-34} rx={26} ry={19} />
        <ellipse cx={8} cy={30} rx={40} ry={18} />
        <ellipse cx={-70} cy={22} rx={13} ry={10} />
        <ellipse cx={22} cy={-62} rx={18} ry={12} />
        <ellipse cx={-36} cy={74} rx={22} ry={10} />
      </g>
      <circle r={100} fill={space.otherPlanetShade} opacity={0.75} mask={`url(#${id}-shade)`} />
    </g>
  );
};

const TARGET = { cx: 600, cy: 650, r: 220 } as const;
// De onde o outro planeta vem (só a borda no canto) e até onde chega no plano.
const INCOMING = {
  from: { cx: 2140, cy: -250, r: 420 },
  to: { cx: 1500, cy: 170, r: 560 },
} as const;

/** O outro planeta entra cortado pelo canto e cresce na direção da Terra. */
const Incoming: React.FC<{ readonly at: number }> = ({ at }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const length = useShotLength();
  // Já vem vindo devagar; na palavra que o nomeia, avança de vez.
  const near = 0.12 * linear(frame, 0, length) + 0.88 * ramp(frame, at, Math.max(fps, length - at));
  return (
    <Frame backdrop={<SpaceBackdrop light={[0.05, 0.1]} />}>
      <Push focus={[TARGET.cx, TARGET.cy]} to={1.06}>
        <Svg>
          <Globe {...TARGET} spin={frame / fps / TURN_SECONDS} />
        </Svg>
      </Push>
      <Svg>
        <OtherPlanet
          cx={mix(INCOMING.from.cx, INCOMING.to.cx, near)}
          cy={mix(INCOMING.from.cy, INCOMING.to.cy, near)}
          r={mix(INCOMING.from.r, INCOMING.to.r, near)}
        />
      </Svg>
    </Frame>
  );
};

const TILTED = { cx: 960, cy: 540, r: 280 } as const;
// A batida derruba o alto do eixo para longe de onde ela veio (a esquerda).
const NEW_TILT = -42;
const AXIS_REACH = 130;
// A volta em torno do eixo, vista de lado: só a metade de cá.
const RING = { rx: TILTED.r + 70, ry: 86 } as const;
// De onde o outro planeta vem: o mesmo canto do plano anterior, em cima, à direita.
const HIT_DEGREES = 40;
const HIT = [Math.cos((HIT_DEGREES * Math.PI) / 180), -Math.sin((HIT_DEGREES * Math.PI) / 180)] as const;
// Ele chega com duas Terras e meia de raio, a proporção em que o plano anterior
// o deixou, e a esta distância da Terra (de borda a borda) no corte.
const OTHER_R = 2.5 * TILTED.r;
const APPROACH = 300;

/** Um eixo que atravessa a Terra, de fora a fora: só as pontas aparecem. */
const Axis: React.FC<{ readonly color: string; readonly opacity?: number }> = ({ color, opacity = 1 }) => (
  <line
    x1={TILTED.cx}
    y1={TILTED.cy - TILTED.r - AXIS_REACH}
    x2={TILTED.cx}
    y2={TILTED.cy + TILTED.r + AXIS_REACH}
    stroke={color}
    strokeWidth={10}
    strokeLinecap="round"
    strokeDasharray="18 22"
    opacity={opacity}
  />
);

/** A batida e o depois dela: o outro planeta encosta, e a Terra passa a girar torta, em outro eixo, em tracejado. */
const Knocked: React.FC<{ readonly hitAt: number }> = ({ hitAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const length = useShotLength();
  const tipped = settle(frame, hitAt, 0.7 * fps);
  const tilt = NEW_TILT * tipped + shake(frame, hitAt, 0.9 * fps, 9, 3);
  // O tranco: a Terra é empurrada para longe de onde a batida veio, e volta.
  const jolt = 46 * (1 - tipped) * linear(frame, hitAt, 3);
  const flash = popOpacity(frame, hitAt, 4) * (1 - ramp(frame, hitAt + 3, 0.4 * fps));
  // Em outro eixo, e em outro ritmo: o giro muda, não some.
  const spin = frame / fps / TURN_SECONDS + (1.6 * Math.max(0, frame - hitAt)) / fps / TURN_SECONDS;
  const marked = popOpacity(frame, hitAt + 0.2 * fps, 0.3 * fps);
  // O outro planeta continua vindo, no mesmo passo, e encosta na palavra da fala.
  // Depois recua um pouco, perde a velocidade e segue se afastando devagar.
  const away = clamp01((frame - hitAt) / (0.6 * fps));
  const gap =
    frame < hitAt
      ? APPROACH * (1 - linear(frame, 0, Math.max(1, hitAt)))
      : 120 * (1 - (1 - away) ** 2) + 70 * linear(frame, hitAt, Math.max(1, length - hitAt));
  const reach = TILTED.r + OTHER_R + gap;
  const other = { cx: TILTED.cx + HIT[0] * reach, cy: TILTED.cy + HIT[1] * reach, r: OTHER_R };
  // Batido, ele vira o que já passou: só o contorno, em tracejado, como o eixo de antes.
  const ghost = ramp(frame, hitAt + 4, 0.5 * fps);
  return (
    <Frame backdrop={<SpaceBackdrop light={[0.05, 0.1]} />}>
      <Push focus={[TILTED.cx, TILTED.cy]} from={1.28} to={1} progress={settle(frame, 0, 0.6 * fps)}>
        <Push focus={[TILTED.cx, TILTED.cy]} to={1.05}>
          <Svg>
            <g opacity={mix(1, 0.14, ghost)}>
              <OtherPlanet {...other} />
            </g>
            <circle
              {...other}
              fill="none"
              stroke={space.otherPlanet}
              strokeWidth={10}
              strokeLinecap="round"
              strokeDasharray="18 22"
              opacity={ghost}
            />
            {/* O eixo de antes fica onde estava, apagado. */}
            <Axis color={earth.ghost} opacity={mix(0.9, 0.4, tipped)} />
            <g
              transform={`translate(${-jolt * HIT[0]} ${-jolt * HIT[1]}) rotate(${tilt} ${TILTED.cx} ${TILTED.cy})`}
            >
              <g opacity={marked}>
                <Axis color={ink.accent} />
              </g>
              <Globe {...TILTED} spin={spin} />
              {/* A volta nova, em tracejado: a cintura inclinada com o eixo, e a ponta para leste. */}
              <g fill="none" stroke={ink.accent} strokeWidth={10} strokeLinecap="round" opacity={marked}>
                <path
                  d={`M${TILTED.cx - RING.rx},${TILTED.cy} A${RING.rx},${RING.ry} 0 0 0 ${TILTED.cx + RING.rx},${TILTED.cy}`}
                  strokeDasharray="18 22"
                />
                <path
                  d="M-26,-26 L8,0 L-26,26"
                  strokeLinejoin="round"
                  transform={`translate(${TILTED.cx + RING.rx} ${TILTED.cy - 14}) rotate(-78)`}
                />
              </g>
            </g>
            {/* A batida, no ponto em que os dois se encostam. */}
            <g
              transform={`translate(${TILTED.cx + TILTED.r * HIT[0]} ${TILTED.cy + TILTED.r * HIT[1]}) rotate(${-HIT_DEGREES})`}
              stroke={ink.paper}
              strokeWidth={14}
              strokeLinecap="round"
              opacity={flash}
            >
              {[-60, 60].map((angle) => (
                <line key={angle} x1={30} y1={0} x2={150} y2={0} transform={`rotate(${angle})`} />
              ))}
              {[-90, 90].map((angle) => (
                <line key={angle} x1={70} y1={0} x2={170} y2={0} transform={`rotate(${angle})`} />
              ))}
            </g>
          </Svg>
        </Push>
      </Push>
    </Frame>
  );
};

// O susto na janela: a xícara parada no ar, o rosto para o céu.
const AGHAST: VigiliaPose = { ...STARTLED, nod: -0.6, gaze: [0.6, -0.6] };

/** A Vigília na janela da cozinha, com a xícara parada no ar e o planeta enchendo o céu. */
const AtTheWindow: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const length = useShotLength();
  const w = KITCHEN.window;
  const grown = ramp(frame, 0, length);
  // A sombra do planeta toma a cozinha.
  const dimmed = ramp(frame, 0, 0.8 * fps);
  return (
    <Frame
      backdrop={
        <Kitchen
          outside={
            <OtherPlanet
              cx={w.x + w.width * mix(0.72, 0.6, grown)}
              cy={w.y + w.height * mix(0.3, 0.42, grown)}
              r={mix(330, 420, grown)}
            />
          }
        >
          <Vig
            x={KITCHEN.stand[0]}
            y={KITCHEN.stand[1]}
            scale={3.4}
            pose={alive(mixPose(LOOK_UP, AGHAST, settle(frame, 3, 0.3 * fps)), frame / fps, "another-planet")}
            shadow={home.contact}
            held={<Cup />}
          />
        </Kitchen>
      }
    >
      <AbsoluteFill style={{ backgroundColor: space.otherPlanetShade, opacity: 0.2 * dimmed }} />
    </Frame>
  );
};

export const AnotherPlanetScene: React.FC<SceneProps> = ({ scene, shots }) => (
  <>
    <Shot range={shots[0]} name="outro planeta vem vindo">
      <Incoming at={cue(scene, "outro")} />
    </Shot>
    <Shot range={shots[1]} name="a Terra em outro eixo">
      <Knocked hitAt={cue(scene, "batida") - shots[1].from} />
    </Shot>
    <Shot range={shots[2]} name="o planeta na janela">
      <AtTheWindow />
    </Shot>
  </>
);
