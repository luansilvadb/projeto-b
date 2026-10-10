// A folha de modelo da Vigília, com as oito poses do número: três quadros.
//
//   0  pintadas, grandes;
//   1  as mesmas numa cor só: o teste da silhueta;
//   2  no tamanho do plano, cada uma numa janela de 1:1 sobre o estudo no instante dela.
//
// As poses são lidas na ordem da leitura: a fila de cima é a da janela acesa
// (1 a 4), a de baixo, a do salão depois da onda (5 a 8). Cada folha usa uma
// escala só: as poses sentadas saem menores que as de pé, como no plano. As
// poses moram em `poses.ts`, e o desenho, em `src/art/Vigilia.tsx`.

import { AbsoluteFill, useCurrentFrame } from "remotion";
import { taperPath } from "../../art/shapes";
import { bones, Vigilia } from "../../art/Vigilia";
import { Camera, Layer } from "../../components/Camera";
import { Grain } from "../../components/Grain";
import { SvgLayer } from "../../components/SvgLayer";
import { HEIGHT, WIDTH } from "../../format";
import { liftOf } from "./acting";
import { C, DEPTH, floorAt, LEVER as PLACE, project } from "./base";
import { Contador } from "./cast";
import { LEVER, onLever, POSES, settle, SLOPE, type Pose } from "./poses";
import {
  AbyssMist,
  Beam,
  Cable,
  Conduit,
  Deep,
  EyeWindow,
  FarGrove,
  FloorShadows,
  Foreground,
  Groves,
  Halo,
  Lever,
  Motes,
  NowProvider,
  RingFront,
  Vault,
  Vessel,
  Walkway,
  Warmth,
  WaveFront,
  type Now,
} from "./scenery";
import { ACT, dozeAt, KICK, levelAt, lidAt, nightAt, pressureAt, shotAt, shutOf, span, throbAt } from "./timing";

// ---- A grade: quatro colunas, duas filas ----

const CELL = { w: WIDTH / 4, h: HEIGHT / 2, floor: 468, gap: 8 };
const cellAt = (index: number) => ({ x: (index % 4) * CELL.w, y: Math.floor(index / 4) * CELL.h });
/** A escala das folhas grandes: de pé, ela fica com uns 380 px. */
const BIG = 2.5;

/** A pose como foi desenhada: com a alavanca no ângulo dela, as mãos presas já estão no lugar. */
const drawn = (pose: Pose) => settle(pose, pose.lever);

/** O x que vai para o meio da célula: o meio do que ela ocupa, um pouco para o lado da alavanca, que fica à direita. */
const middleOf = (pose: Pose) => {
  const b = bones(drawn(pose));
  const parts: readonly (readonly [number, number])[] = [
    [b.center[0], b.radius],
    [b.nearArm.end[0], 10],
    [b.farArm.end[0], 10],
    [b.nearLeg.end[0], 16],
    [b.farLeg.end[0], 16],
  ];
  return (Math.min(...parts.map(([x, r]) => x - r)) + Math.max(...parts.map(([x, r]) => x + r))) / 2 + 14;
};

/** A sombra de contato das folhas sem cenário: embaixo do ovo e dos cascos; menor e mais fraca quando ela está no ar. */
const shadowOf = (pose: Pose) => {
  const b = bones(drawn(pose));
  const xs = [b.center[0], b.nearLeg.end[0], b.farLeg.end[0]];
  const lift = Math.min(-pose.hip[1], -b.nearLeg.end[1], -b.farLeg.end[1]);
  const air = lift > 16;
  return {
    cx: (Math.min(...xs) + Math.max(...xs)) / 2,
    rx: (Math.max(...xs) - Math.min(...xs)) / 2 + (air ? 22 : 36),
    opacity: air ? 0.25 : 0.5,
  };
};

type LeverProps = {
  readonly angle: number;
  readonly rod: string;
  readonly base: string;
  readonly knob: string;
};

/**
 * A alavanca das folhas sem cenário: haste, cubo e manopla, nas medidas da do
 * estudo, só para a pose ter onde se apoiar.
 */
const SimpleLever: React.FC<LeverProps> = ({ angle, rod, base, knob }) => {
  const [hx, hy] = LEVER.hub;
  const from = onLever(angle, 0.74);
  const to = onLever(angle, 1);
  return (
    <g>
      <rect x={hx - 60} y={hy - 2} width={120} height={40} rx={14} fill={base} />
      <circle cx={hx} cy={hy} r={42} fill={rod} />
      <path d={taperPath(LEVER.hub, onLever(angle, 0.5), to, 30, 22)} fill={rod} />
      <circle cx={hx} cy={hy} r={13} fill={base} />
      <path d={`M${from[0]},${from[1]}L${to[0]},${to[1]}`} stroke={knob} strokeWidth={36} strokeLinecap="round" />
    </g>
  );
};

/**
 * As duas luzes do estudo, sem o cenário: a da janela acesa, em índigo, com a
 * borda fria nas costas dela; e a do salão depois da onda, em roxo, sem a luz
 * da janela. A parede é clara o bastante para a perna escura se ler.
 */
const MOOD = [
  { id: "indigo", wall: ["#3a2cab", "#6a61d9"], floor: "#a5a1f2", rod: C.wall[4], cold: 1 },
  { id: "roxo", wall: ["#4c248a", "#8643b2"], floor: "#bf8adb", rod: "#3b1b70", cold: 0 },
] as const;

type PanelProps = {
  readonly index: number;
  readonly pose: Pose;
  readonly fill: string;
  readonly children: React.ReactNode;
};

/** Uma célula das folhas sem cenário: o painel, e a pose dentro dele, com a origem no chão embaixo do cubo da alavanca. */
const Panel: React.FC<PanelProps> = ({ index, pose, fill, children }) => {
  const { x, y } = cellAt(index);
  const frame = { x: x + CELL.gap, y: y + CELL.gap, width: CELL.w - 2 * CELL.gap, height: CELL.h - 2 * CELL.gap, rx: 26 };
  return (
    <g>
      <clipPath id={`panel-${index}`}>
        <rect {...frame} />
      </clipPath>
      <rect {...frame} fill={fill} />
      <g clipPath={`url(#panel-${index})`}>
        <g transform={`translate(${x + CELL.w / 2 - middleOf(pose) * BIG} ${y + CELL.floor}) scale(${BIG})`}>{children}</g>
      </g>
    </g>
  );
};

// ---- 0: pintadas ----

const Painted: React.FC = () => (
  <AbsoluteFill style={{ background: `linear-gradient(100deg, ${C.wall[1]} 0%, ${C.wall[3]} 55%, #3a1a7a 100%)` }}>
    <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} width={WIDTH} height={HEIGHT}>
      <defs>
        {MOOD.map((mood) => (
          <linearGradient key={mood.id} id={mood.id} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={mood.wall[0]} />
            <stop offset="1" stopColor={mood.wall[1]} />
          </linearGradient>
        ))}
      </defs>
      {POSES.map((pose, index) => {
        const shadow = shadowOf(pose);
        const mood = MOOD[Math.floor(index / 4)];
        return (
          <Panel key={index} index={index} pose={pose} fill={`url(#${mood.id})`}>
            <rect x={-400} y={-4} width={800} height={80} fill={mood.floor} />
            <ellipse cx={shadow.cx} cy={4} rx={shadow.rx} ry={7} fill={C.shadow} opacity={shadow.opacity} />
            <SimpleLever angle={pose.lever} rod={mood.rod} base={C.iron} knob={C.vigilia.limb} />
            <Vigilia pose={drawn(pose)} cold={mood.cold} colors={C.vigilia} />
          </Panel>
        );
      })}
    </svg>
  </AbsoluteFill>
);

// ---- 1: silhuetas ----

const Silhouettes: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: C.wall[0] }}>
    <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} width={WIDTH} height={HEIGHT}>
      <defs>
        {/* Tudo o que o desenho pinta vira uma cor só: a silhueta é a do desenho pintado, e não outra. */}
        <filter id="flat" x="-20%" y="-20%" width="140%" height="140%" colorInterpolationFilters="sRGB">
          <feColorMatrix type="matrix" values="0 0 0 0 0.96  0 0 0 0 0.93  0 0 0 0 1  0 0 0 1 0" />
        </filter>
      </defs>
      {POSES.map((pose, index) => (
        <Panel key={index} index={index} pose={pose} fill={C.wall[2]}>
          <rect x={-400} y={0} width={800} height={3} fill={C.wall[6]} />
          <SimpleLever angle={pose.lever} rod={C.wall[6]} base={C.wall[6]} knob={C.wall[6]} />
          <g filter="url(#flat)">
            <Vigilia pose={drawn(pose)} colors={C.vigilia} />
          </g>
        </Panel>
      ))}
    </svg>
  </AbsoluteFill>
);

// ---- 2: no tamanho do plano ----

/**
 * O instante do estudo em que cada pose é o extremo da atuação (`ACT`, em
 * `timing.ts`): é dele que saem a câmera e a luz da janela. Firme, antes da
 * primeira gota; no alto do salto do primeiro tranco; no meio do empurrão; num
 * arranco do corpo inteiro; levada pela haste; achatada no chão; lá em cima,
 * tremendo; e assentada na haste.
 */
const MOMENT = [
  KICK[0] - 0.1,
  ACT.hop.top,
  (ACT.push[0] + ACT.push[1]) / 2,
  ACT.surge[1],
  ACT.taken[1],
  ACT.flat[0],
  ACT.rise[4],
  ACT.rest[2],
];

type SceneProps = { readonly t: number; readonly pose: Pose };

/** O estudo num instante, com ela parada na pose desenhada: as mesmas camadas de `InsideNight.tsx`. */
const Scene: React.FC<SceneProps> = ({ t, pose }) => {
  const { h, slack } = lidAt(t);
  const now: Now = {
    t,
    // A alavanca do cenário é a da pose, de volta ao chão inclinado dele.
    lever: pose.lever + SLOPE,
    lid: h,
    slack,
    cold: 1 - shutOf(h),
    level: levelAt(t),
    pressure: pressureAt(t),
    doze: dozeAt(t),
    calm: span(t, 9.4, 11.2),
    throb: throbAt(t),
    night: nightAt(t),
    // A sombra do cenário segue o meio do ovo e some quando ela sai do chão, como em `InsideNight.tsx`.
    vigiliaX: PLACE.hub[0] + bones(drawn(pose)).center[0],
    vigiliaLift: liftOf(pose),
  };
  const { camera, lens } = shotAt(t);
  return (
    <AbsoluteFill style={{ backgroundColor: C.wall[0] }}>
      <NowProvider value={now}>
        <AbsoluteFill style={{ scale: lens.scale, translate: `${lens.x}px ${lens.y}px` }}>
          <Camera {...camera}>
            <Layer depth={DEPTH.wall}>
              <SvgLayer>
                <Vault />
                <EyeWindow />
              </SvgLayer>
            </Layer>
            <Layer depth={DEPTH.far}>
              <SvgLayer>
                <FarGrove />
              </SvgLayer>
            </Layer>
            <Layer depth={DEPTH.subject}>
              <SvgLayer>
                <Halo />
              </SvgLayer>
            </Layer>
            <Layer depth={DEPTH.grove}>
              <SvgLayer>
                <Groves />
              </SvgLayer>
            </Layer>
            <Layer depth={0}>
              <SvgLayer>
                <Beam />
                <Cable />
              </SvgLayer>
            </Layer>
            <Layer depth={DEPTH.deep}>
              <SvgLayer>
                <Deep />
              </SvgLayer>
            </Layer>
            <Layer depth={DEPTH.subject}>
              <SvgLayer>
                <Walkway />
                <AbyssMist />
                <Vessel />
                <RingFront />
                <FloorShadows />
                <Conduit />
                <Lever />
                <g transform={`translate(${PLACE.hub[0]} ${floorAt(PLACE.hub[0])}) rotate(${SLOPE})`}>
                  <Vigilia pose={drawn(pose)} cold={now.cold} colors={C.vigilia} />
                </g>
                <Contador />
              </SvgLayer>
            </Layer>
            <Layer depth={DEPTH.motes}>
              <SvgLayer>
                <Motes />
              </SvgLayer>
            </Layer>
            <Layer depth={DEPTH.frame}>
              <SvgLayer>
                <Foreground />
              </SvgLayer>
            </Layer>
            <AbsoluteFill style={{ mixBlendMode: "soft-light" }}>
              <SvgLayer>
                <Warmth />
              </SvgLayer>
            </AbsoluteFill>
            <Layer depth={0} light>
              <SvgLayer>
                <WaveFront />
              </SvgLayer>
            </Layer>
          </Camera>
        </AbsoluteFill>
        <AbsoluteFill style={{ backgroundColor: C.hush, mixBlendMode: "multiply", opacity: 0.55 * now.calm }} />
      </NowProvider>
    </AbsoluteFill>
  );
};

/**
 * Cada célula é uma janela de 1:1 sobre o quadro do estudo naquele instante,
 * com ela no meio: o tamanho, o fundo e a luz são os do plano.
 */
const InShot: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: C.near }}>
    {POSES.map((pose, index) => {
      const t = MOMENT[index];
      const { x, y } = cellAt(index);
      const { camera } = shotAt(t);
      const [hx, hy] = project(camera, DEPTH.subject)([PLACE.hub[0], floorAt(PLACE.hub[0])]);
      return (
        <div
          key={index}
          style={{ position: "absolute", left: x + 3, top: y + 3, width: CELL.w - 6, height: CELL.h - 6, overflow: "hidden" }}
        >
          <div
            style={{
              position: "absolute",
              left: CELL.w / 2 - 3 - (hx + middleOf(pose) * camera.zoom),
              top: 400 - hy,
              width: WIDTH,
              height: HEIGHT,
            }}
          >
            <Scene t={t} pose={pose} />
          </div>
        </div>
      );
    })}
    <Grain />
  </AbsoluteFill>
);

export const VigiliaSheet: React.FC = () => {
  const frame = useCurrentFrame();
  return frame === 0 ? <Painted /> : frame === 1 ? <Silhouettes /> : <InShot />;
};
