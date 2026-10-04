import { Tag } from "../parts/Tag";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { cameraBetween } from "../../../components/Camera";
import { Place } from "../../../components/Place";
import { Pop } from "../../../components/Pop";
import { SvgLayer } from "../../../components/SvgLayer";
import type { SceneProps } from "../../../video/NarratedVideo";
import { Shot } from "../../../video/Shot";
import { ink } from "../palette";
import { cue, linear, mix, ramp, settle } from "../../../components/timing";
import { BIRD, GlidingBird, SKY_CAMERA, SkyShot } from "./FrigatebirdScene";

/** Fração do dia que a fragata dorme em voo: 0,69 hora. */
export const FRIGATEBIRD_FLIGHT_SLEEP = 0.69 / 24;
// Cada cochilo dura uns onze segundos; aqui cada um fecha o olho por meio segundo.
const NAP_SECONDS = 0.5;
const NAP_GAP_SECONDS = 0.9;
/** O arco do dia, o caminho do sol, no céu do plano médio. */
const DAY_ARC = { x: 960, y: 820, radius: 560 };
// As contas dos cochilos, espalhadas pelo arco, e para onde se juntam.
const NAPS = [0.08, 0.17, 0.25, 0.36, 0.44, 0.52, 0.61, 0.7, 0.79, 0.88];
const GATHER = 0.5;

/** Ponto do arco na fração pedida. */
const along = (fraction: number, radius = DAY_ARC.radius) => {
  const angle = Math.PI * (1 - fraction);
  return [
    DAY_ARC.x + radius * Math.cos(angle),
    DAY_ARC.y - radius * Math.sin(angle),
  ] as const;
};

type NapShotProps = {
  /** Quadro do plano em que o primeiro cochilo começa, e em que a etiqueta entra. */
  readonly napsAt: number;
  readonly labelAt: number;
};

/** De perto, de noite: o olho fecha, fica fechado um instante e abre; de novo. */
const NapShot: React.FC<NapShotProps> = ({ napsAt, labelAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const seconds = frame / fps;
  const arrive = ramp(frame, 0, 0.6 * fps);
  // Cochilos em série: fecha, segura, abre.
  const cycle = (NAP_SECONDS + NAP_GAP_SECONDS) * fps;
  const sinceNap = frame - napsAt;
  const inNap = sinceNap >= 0 ? sinceNap % cycle : -1;
  const lid =
    inNap < 0
      ? 0
      : inNap < NAP_SECONDS * fps
        ? Math.min(1, inNap / 4, (NAP_SECONDS * fps - inNap) / 4)
        : 0;

  return (
    <>
      <SkyShot
        camera={cameraBetween(SKY_CAMERA.medium, SKY_CAMERA.head, arrive)}
        daylight={0}
        orb={0.22}
      >
        <GlidingBird
          x={BIRD.x}
          y={BIRD.y}
          daylight={0}
          lid={lid}
          seconds={seconds}
        />
      </SkyShot>
      <SvgLayer>
        {/* A linha que prende a etiqueta ao olho fechado. */}
        {frame >= labelAt ? (
          <path
            d="M1320,376 L1276,486"
            fill="none"
            stroke={ink.paper}
            strokeWidth={5}
            strokeLinecap="round"
            pathLength={1}
            strokeDasharray={`${ramp(frame, labelAt, 0.3 * fps)} 1`}
          />
        ) : null}
      </SvgLayer>
      <Place x={1320} y={320}>
        <Pop at={labelAt}>
          <Tag size="label" on="night">
            11 s
          </Tag>
        </Pop>
      </Place>
    </>
  );
};

type SumShotProps = {
  /** Quadro do plano em que as contas se juntam. */
  readonly gatherAt: number;
};

/** O dia como o arco do sol; os cochilos são contas que se juntam numa só: quarenta minutos. */
const SumShot: React.FC<SumShotProps> = ({ gatherAt }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const seconds = frame / fps;
  const open = ramp(frame, 0, 0.8 * fps);
  const gather = settle(frame, gatherAt, 0.6 * fps);
  const daylight = open;
  // Juntas, as contas formam um trecho só, do tamanho do sono de um dia.
  const merged = FRIGATEBIRD_FLIGHT_SLEEP;
  // O sol anda pelo arco durante o plano inteiro.
  const sun = along(mix(0.1, 0.9, linear(frame, 0, durationInFrames)));

  return (
    <>
      <SkyShot
        camera={cameraBetween(SKY_CAMERA.head, SKY_CAMERA.wide, open)}
        daylight={daylight}
        extras={
          <SvgLayer>
            <path
              d={`M${along(0)[0]},${along(0)[1]} A${DAY_ARC.radius},${DAY_ARC.radius} 0 0 1 ${along(1)[0]},${along(1)[1]}`}
              fill="none"
              stroke={ink.dark}
              strokeWidth={5}
              strokeDasharray="2 16"
              strokeLinecap="round"
              opacity={0.7 * open}
            />
            {NAPS.map((nap, index) => {
              const at = along(
                mix(
                  nap,
                  GATHER + (index - 4.5) * (merged / NAPS.length),
                  gather,
                ),
              );
              return (
                <circle
                  key={nap}
                  cx={at[0]}
                  cy={at[1]}
                  r={mix(14, 11, gather)}
                  fill={ink.dark}
                  opacity={open}
                />
              );
            })}
            <circle
              cx={sun[0]}
              cy={sun[1]}
              r={40}
              fill={ink.moon}
              opacity={open}
            />
          </SvgLayer>
        }
      >
        <GlidingBird
          x={BIRD.x}
          y={BIRD.y + 160}
          daylight={daylight}
          seconds={seconds}
          span={BIRD.span * 0.8}
        />
      </SkyShot>
      <Place
        x={along(GATHER, DAY_ARC.radius + 110)[0]}
        y={along(GATHER, DAY_ARC.radius + 110)[1]}
      >
        <Pop at={gatherAt + 0.5 * fps}>
          <Tag size="label" on="night">
            40 min
          </Tag>
        </Pop>
      </Place>
    </>
  );
};

export const FlyingNapsScene: React.FC<SceneProps> = ({ scene, shots }) => (
  <>
    <Shot range={shots[0]} name="cochilos de onze segundos">
      <NapShot napsAt={cue(scene, "dorme")} labelAt={cue(scene, "onze")} />
    </Shot>
    <Shot range={shots[1]} name="quarenta minutos por dia">
      <SumShot gatherAt={cue(scene, "quarenta") - shots[1].from} />
    </Shot>
  </>
);
