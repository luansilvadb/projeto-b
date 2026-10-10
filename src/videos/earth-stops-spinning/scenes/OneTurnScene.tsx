import { useCurrentFrame, useVideoConfig } from "remotion";
import { mixPose } from "../../../art/Vigilia";
import { cue, ramp } from "../../../components/timing";
import type { SceneProps } from "../../../video/NarratedVideo";
import { Shot, useShotLength } from "../../../video/Shot";
import { home } from "../palette";
import { CUP, Cup, LOOK_UP, Vig } from "../parts/Actor";
import { Globe, House, landPoint, spinFor } from "../parts/Globe";
import { Kitchen, KITCHEN } from "../parts/Kitchen";
import { Frame, Push, SpaceBackdrop, Svg } from "../parts/kit";

const EARTH = { cx: 960, cy: 560, r: 380 } as const;
// A casinha fica presa ao chão dela (`HOME_LAND`), e o globo gira o bastante
// para ela entrar pela borda escura, a oeste, e chegar à luz. Em unidades de raio 100.
const HOME_X = { from: -86, to: 10 } as const;

/** A Terra de fora, girando devagar; a casinha passa do lado escuro para o claro. */
const FromOutside: React.FC = () => {
  const frame = useCurrentFrame();
  const length = useShotLength();
  const spin = spinFor(HOME_X.from + (HOME_X.to - HOME_X.from) * (frame / length));
  const spot = landPoint(EARTH.r, spin);
  return (
    <Frame backdrop={<SpaceBackdrop light={[0.95, 0.15]} />}>
      <Push focus={[EARTH.cx, EARTH.cy]} to={1.05}>
        <Svg>
          <Globe {...EARTH} spin={spin} shade={0.62} lightFrom={1} />
          <House
            x={EARTH.cx + spot.x}
            y={EARTH.cy + spot.y}
            size={54}
            rotate={(spot.x / EARTH.r) * 70}
          />
        </Svg>
      </Push>
    </Frame>
  );
};

/** A cozinha, de manhã: a Vigília na janela, de xícara na mão, vê o Sol subir. */
const AtTheWindow: React.FC<{ readonly sunAt: number }> = ({ sunAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const length = useShotLength();
  // Ela nota o Sol quando a fala chega nele.
  const noticed = ramp(frame, sunAt - 6, 0.5 * fps);
  return (
    <Frame
      backdrop={
        <Kitchen sun={0.18 + 0.42 * ramp(frame, 0, length)} sunAt={0.7}>
          <Vig
            x={KITCHEN.stand[0]}
            y={KITCHEN.stand[1]}
            scale={3.4}
            pose={mixPose(CUP, LOOK_UP, noticed)}
            shadow={home.contact}
            held={<Cup steam={frame / 9} />}
          />
        </Kitchen>
      }
    >
      {null}
    </Frame>
  );
};

export const OneTurnScene: React.FC<SceneProps> = ({ scene, shots }) => (
  <>
    <Shot range={shots[0]} name="a Terra dá uma volta">
      <FromOutside />
    </Shot>
    <Shot range={shots[1]} name="o Sol na janela">
      <AtTheWindow sunAt={cue(scene, "Sol") - shots[1].from} />
    </Shot>
  </>
);
