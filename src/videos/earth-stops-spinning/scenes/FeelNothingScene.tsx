import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { mixPose, type VigiliaPose } from "../../../art/Vigilia";
import { Place } from "../../../components/Place";
import { Pop, popScale } from "../../../components/Pop";
import { cue, ramp } from "../../../components/timing";
import { WIDTH } from "../../../format";
import type { SceneProps } from "../../../video/NarratedVideo";
import { Shot } from "../../../video/Shot";
import { home } from "../palette";
import { CUP, Cup, LOOK_DOWN, Vig } from "../parts/Actor";
import {
  Bus,
  BUS_CAVEAT,
  BUS_GAUGE,
  BUS_SPEED,
  busPoint,
  busView,
  Flow,
  FLOW_LENGTH,
  roofMid,
} from "../parts/Bus";
import { Caveat } from "../parts/CutEarth";
import { Gauge } from "../parts/Gauge";
import { KITCHEN } from "../parts/Kitchen";
import { Frame, Push } from "../parts/kit";
import { alive } from "../parts/SpeedKit";

// Em "freia" ela ergue os olhos do café e olha para a frente: o indício da freada, que é da cena seguinte.
const LOOK_AHEAD: VigiliaPose = { ...CUP, turn: 0.9, gaze: [0.9, -0.1], nearLid: 0.05, farLid: 0.05, mouth: [10, 0.2, 0.3] };

type Props = {
  /** O quadro em que cada coisa ganha a seta: o chão, o ar, o mar, a casa. */
  readonly at: readonly [number, number, number, number];
  /** Quando a fala chega em "mesma velocidade" e em "sem acelerar". */
  readonly sameAt: number;
  readonly smoothAt: number;
  /** Quando a cozinha ganha rodas, quando ela confere o café de novo e quando olha para a frente. */
  readonly busAt: number;
  readonly cupAt: number;
  readonly aheadAt: number;
};

/**
 * A cozinha em corte: chão, ar, mar e casa levam a mesma seta, e o café não faz uma onda.
 * Em "ônibus" a casa sobe sobre rodas e a estrada passa por baixo; lá dentro, nada muda.
 */
const Together: React.FC<Props> = ({ at, sameAt, smoothAt, busAt, cupAt, aheadAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // Em "sem acelerar nem frear" ela olha o café: liso. Ergue os olhos quando a casa sobe nas rodas,
  // confere o café de novo em "café" (nem balança) e, em "freia", olha para a frente.
  const watching =
    ramp(frame, smoothAt, 0.5 * fps) - ramp(frame, busAt, 0.4 * fps) + ramp(frame, cupAt, 0.4 * fps);
  const ahead = ramp(frame, aheadAt, 0.3 * fps);
  // As rodas nascem com sobra, e o quadro abre para caber a estrada.
  const wheels = popScale(frame, busAt, 0.45 * fps, 0, 1.1);
  const view = busView(ramp(frame, busAt, 0.6 * fps));
  const w = KITCHEN.window;
  return (
    <Frame
      backdrop={<AbsoluteFill style={{ background: `linear-gradient(${home.sky[0]}, ${home.sky[1]})` }} />}
    >
      <Push>
        <Bus
          view={view}
          wheels={wheels}
          travelled={BUS_SPEED * Math.max(0, frame - busAt)}
          over={
            // A casa inteira.
            <Flow x={WIDTH / 2 - FLOW_LENGTH / 2} y={roofMid(wheels)} at={at[3]} />
          }
        >
          <g
            transform={`translate(${BUS_GAUGE.x} ${BUS_GAUGE.y}) scale(${popScale(frame, sameAt, 0.3 * fps, 1, 1.1)})`}
          >
            <Gauge x={0} y={0} r={BUS_GAUGE.r} value={BUS_GAUGE.value} lit />
          </g>
          <Vig
            x={KITCHEN.stand[0]}
            y={KITCHEN.stand[1]}
            scale={3.4}
            pose={alive(mixPose(mixPose(CUP, LOOK_DOWN, watching), LOOK_AHEAD, ahead), frame / fps, "vigilia")}
            shadow={home.contact}
            held={<Cup steam={frame / 9} />}
          />
          {/* O ar: entre ela e a cortina, que não se mexe. */}
          <Flow x={470} y={290} at={at[1]} />
          {/* O mar, no vidro. */}
          <Flow x={w.x + 120} y={w.y + w.height * 0.84} at={at[2]} />
          {/* O chão. */}
          <Flow x={1060} y={KITCHEN.floor + 96} at={at[0]} />
        </Bus>
        {/* Presa à parede do ônibus: é ele que é a comparação. */}
        <Place x={busPoint(view, ...BUS_CAVEAT)[0]} y={busPoint(view, ...BUS_CAVEAT)[1]}>
          <Pop at={busAt + 0.4 * fps}>
            <Caveat on="light">comparação</Caveat>
          </Pop>
        </Place>
      </Push>
    </Frame>
  );
};

export const FeelNothingScene: React.FC<SceneProps> = ({ scene, shots }) => (
  <Shot range={shots[0]} name="tudo vai junto">
    <Together
      at={[cue(scene, "solo"), cue(scene, "ar"), cue(scene, "mar"), cue(scene, "casa")]}
      sameAt={cue(scene, "mesma")}
      smoothAt={cue(scene, "sem")}
      busAt={cue(scene, "ônibus")}
      cupAt={cue(scene, "café")}
      aheadAt={cue(scene, "freia")}
    />
  </Shot>
);
