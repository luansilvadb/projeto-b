import { useCurrentFrame, useVideoConfig } from "remotion";
import { Place } from "../../../components/Place";
import { Pop } from "../../../components/Pop";
import { cue, mix, ramp, shake } from "../../../components/timing";
import type { SceneProps } from "../../../video/NarratedVideo";
import { Shot, useShotLength } from "../../../video/Shot";
import { ink } from "../palette";
import { Caveat, CUT_BULGE, CutEarth, CutRays, mixSea, SEA, SeaFlow } from "../parts/CutEarth";
import { Arrow, Frame, Push, SpaceBackdrop, Svg, Tag } from "../parts/kit";

const EARTH = { cx: 960, cy: 540, r: 300 } as const;
// O segundo plano chega perto do quarto de cima do corte: o polo, o equador e os dois raios.
const CLOSE = { cx: 600, cy: 810, r: 430 } as const;
const TURN_SECONDS = 14;
// Quanto da água já foi para os polos quando o primeiro plano acaba; o segundo continua dali.
const HALFWAY = 0.5;
// De onde a câmera do segundo plano parte: o enquadramento do primeiro, com a Terra inteira no centro.
const WIDE = EARTH.r / CLOSE.r;
const ARRIVAL = [
  (EARTH.cx - WIDE * CLOSE.cx) / (1 - WIDE),
  (EARTH.cy - WIDE * CLOSE.cy) / (1 - WIDE),
] as const;

/** As voltas de uma Terra que freia até parar em `stop` segundos. */
const brakingTurns = (seconds: number, stop: number) => {
  const t = Math.min(seconds, stop);
  return (t - (t * t) / (2 * stop)) / TURN_SECONDS;
};

/** A Terra em corte para de girar; o calombo perde o apoio e começa a escorrer para os polos. */
const LosesItsHold: React.FC<{ readonly looseAt: number; readonly flowAt: number }> = ({
  looseAt,
  flowAt,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const length = useShotLength();
  const flow = HALFWAY * ramp(frame, flowAt, length - flowAt);
  const still = mixSea(SEA.piled, SEA.polar, flow);
  // Sem apoio, o calombo balança antes de ceder.
  const wobble = shake(frame, looseAt, 0.9 * fps, 0.035, 3);
  const sea = { equator: still.equator + wobble, pole: still.pole - wobble / 2 };
  return (
    <Frame backdrop={<SpaceBackdrop light={[0.08, 0.1]} />}>
      <Push focus={[EARTH.cx, EARTH.cy]} from={1.22} to={1} progress={ramp(frame, 0, 0.7 * fps)}>
        <Push focus={[EARTH.cx, EARTH.cy]} to={1.04}>
          <Svg>
            <CutEarth {...EARTH} spin={brakingTurns(frame / fps, 1.4)} sea={sea} />
            <SeaFlow
              {...EARTH}
              sea={sea}
              seconds={frame / fps}
              opacity={ramp(frame, flowAt, 0.4 * fps)}
            />
          </Svg>
          {/* Ao lado do calombo, na cintura: as marcas da água correm acima e abaixo dali. */}
          <Place x={EARTH.cx - EARTH.r * (1 + CUT_BULGE + SEA.piled.equator) - 120} y={EARTH.cy}>
            <Pop at={8}>
              <Caveat on="dark">exagerado</Caveat>
            </Pop>
          </Place>
        </Push>
      </Push>
    </Frame>
  );
};

type CloserProps = {
  /** Os quadros em que a etiqueta do polo entra e em que as setas da gravidade aparecem. */
  readonly nearAt: number;
  readonly pullAt: number;
};

/** Os dois raios voltam: o polo fica mais perto do centro, puxa mais, e a água corre para lá. */
const PolesPullMore: React.FC<CloserProps> = ({ nearAt, pullAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const length = useShotLength();
  const sea = mixSea(SEA.piled, SEA.polar, mix(HALFWAY, 1, ramp(frame, 0, length)));
  const pull = ramp(frame, pullAt, 0.4 * fps);
  const top = CLOSE.cy - CLOSE.r * (1 + SEA.polar.pole);
  const east = CLOSE.cx + CLOSE.r * (1 + CUT_BULGE + SEA.polar.equator);
  return (
    <Frame backdrop={<SpaceBackdrop light={[0.08, 0.1]} />}>
      {/* A câmera chega do planeta inteiro, onde o plano anterior o deixou. */}
      <Push focus={ARRIVAL} from={WIDE} to={1} progress={ramp(frame, 0, 0.8 * fps)}>
        <Svg>
          <CutEarth {...CLOSE} sea={sea} spin={brakingTurns(10, 1.4)} />
          <SeaFlow {...CLOSE} sea={sea} seconds={frame / fps} opacity={0.9} />
          <CutRays
            {...CLOSE}
            drawn={ramp(frame, 0.5 * fps, 0.4 * fps)}
            swung={ramp(frame, 0.9 * fps, 0.5 * fps)}
            lit={ramp(frame, 1.4 * fps, 0.3 * fps)}
          />
          {/* A gravidade: grossa no polo, fina no equador. */}
          <Arrow
            from={[CLOSE.cx, top - 180]}
            to={[CLOSE.cx, top - 44]}
            color={ink.paper}
            width={34}
            drawn={pull}
          />
          <Arrow
            from={[east + 250, CLOSE.cy]}
            to={[east + 70, CLOSE.cy]}
            color={ink.paper}
            width={10}
            drawn={pull}
          />
        </Svg>
        <Place x={1130} y={215}>
          <Pop at={nearAt}>
            <Tag on="dark" size="note">
              21 km mais perto do centro
            </Tag>
          </Pop>
        </Place>
        {/* Junto à cintura, debaixo da seta fina. */}
        <Place x={east + 150} y={CLOSE.cy + 96}>
          <Pop at={0.9 * fps}>
            <Caveat on="dark">exagerado</Caveat>
          </Pop>
        </Place>
      </Push>
    </Frame>
  );
};

export const WaterLeavesScene: React.FC<SceneProps> = ({ scene, shots }) => (
  <>
    <Shot range={shots[0]} name="o calombo perde o apoio">
      <LosesItsHold looseAt={cue(scene, "nada")} flowAt={cue(scene, "escorre")} />
    </Shot>
    <Shot range={shots[1]} name="os polos puxam mais">
      <PolesPullMore
        nearAt={cue(scene, "perto") - shots[1].from}
        pullAt={cue(scene, "puxam") - shots[1].from}
      />
    </Shot>
  </>
);
