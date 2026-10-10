import { AbsoluteFill, useCurrentFrame } from "remotion";
import type { VigiliaPose } from "../../art/Vigilia";
import { earth, home, ice, ink } from "./palette";
import {
  BRACED,
  CUP,
  Cup,
  Explorer,
  FLUNG,
  LOOK_DOWN,
  LOOK_UP,
  Mug,
  ONE_EYE,
  PEEK,
  STAND,
  STARTLED,
  STUMBLE,
  Vig,
} from "./parts/Actor";
import { Gauge } from "./parts/Gauge";
import { Globe, House, LatitudeRing, surfacePoint } from "./parts/Globe";
import { Kitchen, KITCHEN } from "./parts/Kitchen";
import { Frame, IceBackdrop, IdeaBackdrop, SpaceBackdrop, Svg, SvgText } from "./parts/kit";
import { LeverStation } from "./parts/Lever";

// A folha de conferência do vídeo, três quadros:
//   0  os dois atores em todas as poses, pintados;
//   1  a Vigília na cozinha, no tamanho do plano;
//   2  a Terra, a alavanca "giro" e o velocímetro no espaço.

const VIG: readonly (readonly [string, VigiliaPose])[] = [
  ["de pé", STAND],
  ["xícara", CUP],
  ["olha o Sol", LOOK_UP],
  ["olha o café", LOOK_DOWN],
  ["susto", STARTLED],
  ["arremessada", FLUNG],
  ["espia", PEEK],
];
const EXPLORER: readonly (readonly [string, VigiliaPose])[] = [
  ["de pé", CUP],
  ["espera o pior", BRACED],
  ["tropeço", STUMBLE],
  ["um olho", ONE_EYE],
  ["olha longe", LOOK_UP],
];

const Poses: React.FC = () => (
  <Frame backdrop={<IdeaBackdrop hue="lilac" />}>
    <Svg>
      {VIG.map(([name, pose], index) => (
        <g key={name}>
          <Vig x={190 + index * 258} y={470} pose={pose} scale={2.2} shadow={ink.dark} held={<Cup />} />
          <SvgText x={190 + index * 258} y={520} size={34} fill={ink.dark}>
            {name}
          </SvgText>
        </g>
      ))}
      {EXPLORER.map(([name, pose], index) => (
        <g key={name}>
          <Explorer x={260 + index * 350} y={960} pose={pose} scale={2.2} shadow={ink.dark} held={<Mug />} />
          <SvgText x={260 + index * 350} y={1010} size={34} fill={ink.dark}>
            {name}
          </SvgText>
        </g>
      ))}
    </Svg>
  </Frame>
);

const AtHome: React.FC = () => (
  <Frame
    backdrop={
      <Kitchen sun={0.55} sunAt={0.7}>
        <Vig x={KITCHEN.stand[0]} y={KITCHEN.stand[1]} pose={LOOK_UP} scale={3.4} shadow={home.contact} held={<Cup steam={1} />} />
      </Kitchen>
    }
  >
    {null}
  </Frame>
);

const InSpace: React.FC = () => {
  const here = surfacePoint(300, -23.5, 0.06);
  return (
    <Frame backdrop={<SpaceBackdrop light={[0.1, 0.1]} />}>
      <Svg>
        <Globe cx={760} cy={540} r={300} spin={0.1} />
        <LatitudeRing cx={760} cy={540} r={300} lat={0} color={ink.accent} runner={0.08} />
        <LatitudeRing cx={760} cy={540} r={300} lat={-23.5} color={earth.waterLight} runner={0.08} />
        <House x={760 + here.x} y={540 + here.y} size={44} />
        <LeverStation x={1420} y={900} on={1} hands={1} shadow={ink.dark} />
        <Gauge x={1560} y={300} value={0.8} label="1.670 km/h" />
      </Svg>
    </Frame>
  );
};

const AtPole: React.FC = () => (
  <Frame backdrop={<IceBackdrop />}>
    <Svg>
      <Explorer x={900} y={860} pose={CUP} scale={3.2} shadow={ice.shadow} held={<Mug />} />
    </Svg>
  </Frame>
);

export const CastSheet: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      {[<Poses key={0} />, <AtHome key={1} />, <InSpace key={2} />, <AtPole key={3} />][frame] ?? null}
    </AbsoluteFill>
  );
};
