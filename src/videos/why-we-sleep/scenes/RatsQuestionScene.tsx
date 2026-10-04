import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { Silhouette } from "../../../art/Silhouettes";
import { cameraBetween } from "../../../components/Camera";
import { breath, wave } from "../../../components/Idle";
import { Onomatopoeia } from "../../../components/Onomatopoeia";
import { Place } from "../../../components/Place";
import { SvgLayer } from "../../../components/SvgLayer";
import type { SceneProps } from "../../../video/NarratedVideo";
import { Shot } from "../../../video/Shot";
import { alarmClock, lab, rat, sound } from "../palette";
import { BENCH_Y, Glove, LAB, LabWall } from "../parts/Laboratory";
import { cue } from "../../../components/timing";
import { Lab } from "./FloorTestScene";

// O rato sonolento é o assunto: no centro, grande, com o despertador sobre ele.
const RAT = { x: 900, width: 640 };
const CLOCK = { x: 1400, y: 380, radius: 120 };
// O olho do rato, a partir do centro do desenho dele, na largura acima.
const EYE = [RAT.x - RAT.width * 0.33, BENCH_Y - RAT.width * 0.18] as const;

/** A bancada do laboratório sem o tanque: só o tampo e a frente. */
export const Bench: React.FC = () => (
  <SvgLayer>
    <rect
      x={0}
      y={BENCH_Y}
      width={1920}
      height={1080 - BENCH_Y}
      fill={lab.bench}
    />
    <rect x={0} y={BENCH_Y} width={1920} height={26} fill={lab.benchTop} />
    <rect
      x={0}
      y={BENCH_Y + 150}
      width={1920}
      height={130}
      fill={lab.benchShade}
    />
  </SvgLayer>
);

type AlarmClockProps = {
  /** Quanto ele chacoalha, em graus: tocando. */
  readonly shake: number;
};

/** O despertador: duas campainhas, o mostrador e os ponteiros. */
const AlarmClock: React.FC<AlarmClockProps> = ({ shake }) => (
  <g transform={`translate(${CLOCK.x} ${CLOCK.y}) rotate(${shake})`}>
    {[-1, 1].map((side) => (
      <circle
        key={side}
        cx={side * CLOCK.radius * 0.72}
        cy={-CLOCK.radius * 0.86}
        r={CLOCK.radius * 0.36}
        fill={alarmClock.bell}
      />
    ))}
    <circle r={CLOCK.radius} fill={alarmClock.body} />
    <circle r={CLOCK.radius * 0.76} fill={alarmClock.face} />
    <path
      d={`M0,0 L0,${-CLOCK.radius * 0.5} M0,0 L${CLOCK.radius * 0.34},${CLOCK.radius * 0.18}`}
      fill="none"
      stroke={alarmClock.hand}
      strokeWidth={14}
      strokeLinecap="round"
    />
  </g>
);

type AlarmShotProps = {
  /** Quadro do plano em que o despertador toca. */
  readonly ringAt: number;
};

/** Uma mão segura um despertador sobre um rato que só quer dormir. */
const AlarmShot: React.FC<AlarmShotProps> = ({ ringAt }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const seconds = frame / fps;
  const ringing = frame >= ringAt;

  return (
    <AbsoluteFill>
      <Lab
        camera={cameraBetween(
          LAB.medium,
          LAB.mediumEnd,
          frame / durationInFrames,
        )}
      >
        <LabWall />
        <Bench />
        <Place
          x={RAT.x}
          y={BENCH_Y + 6}
          anchor="bottom"
          style={{
            scale: `1 ${breath(seconds, "rat", { amplitude: 0.03, period: ringing ? 1.2 : 4 })}`,
          }}
        >
          <Silhouette
            kind="mouse"
            width={RAT.width}
            color={rat.body}
            shade={rat.ear}
            eye={ringing ? rat.eye : undefined}
          />
        </Place>
        <SvgLayer>
          {ringing ? null : (
            <path
              d={`M${EYE[0] - 22},${EYE[1]} q22,20 44,0`}
              fill="none"
              stroke={rat.eye}
              strokeWidth={9}
              strokeLinecap="round"
            />
          )}
          <Glove
            from={[2000, 160]}
            to={[CLOCK.x + CLOCK.radius + 30, CLOCK.y]}
            size={110}
          />
          <AlarmClock shake={ringing ? 7 * wave(seconds, 0.12) : 0} />
        </SvgLayer>
        <Place x={CLOCK.x - 420} y={CLOCK.y - 150}>
          <Onomatopoeia
            at={ringAt}
            size={120}
            color={sound.hot}
            edge={sound.edge}
          >
            TRIIIM
          </Onomatopoeia>
        </Place>
      </Lab>
    </AbsoluteFill>
  );
};

export const RatsQuestionScene: React.FC<SceneProps> = ({ scene, shots }) => (
  <Shot range={shots[0]} name="e se não deixarem dormir?">
    <AlarmShot ringAt={cue(scene, "deixar")} />
  </Shot>
);
