import { useId } from "react";
import { random, useCurrentFrame, useVideoConfig } from "remotion";
import { taperPath, type Point } from "../../../art/shapes";
import { cameraBetween } from "../../../components/Camera";
import { wave } from "../../../components/Idle";
import { SvgLayer } from "../../../components/SvgLayer";
import type { SceneProps } from "../../../video/NarratedVideo";
import { Shot, type Wipe } from "../../../video/Shot";
import { ink } from "../palette";
import { LAGOON } from "../parts/lagoonCameras";
import { LagoonShot } from "../parts/LagoonShot";
import {
  PULSES_ASLEEP,
  PULSES_AWAKE,
  cue,
  mix,
  ramp,
  settle,
  steady,
} from "../parts/timing";

// Altura de cada jato de água que a sacode, no plano do assunto.
const JETS = [596, 634, 672];
const JET = { from: 400, to: 706, dash: 36, gap: 26, speed: 16 };
const JET_SECONDS = 0.3;
// Quanto a água a sacode, e quanto ela leva para erguer os braços.
const SHAKE = 1.6;
const SHAKE_SECONDS = 0.18;
const ROUSE_SECONDS = 0.5;
// O peixe dorme perto dela e pula quando a água chega.
const FISH_ASLEEP = { x: 1250, y: 700 };
const FISH_AWAKE = { x: 1230, y: 600 };
const JUMP_SECONDS = 0.3;
const DAY_WIPE: Wipe = { frames: 9, from: "left" };
// De dia, o peixe se afasta devagar, sem fazer onda.
const FISH_LEAVING = { from: 1150, to: 1320, y: 560 };

type JetsProps = {
  /** Quanto as correntes já avançaram, de 0 (fora do quadro) a 1 (nela). */
  readonly reach: number;
};

/** Jatos de água vindos de fora do quadro, com bolhas, que a impedem de descansar. */
const Jets: React.FC<JetsProps> = ({ reach }) => {
  const frame = useCurrentFrame();
  const id = useId();
  if (reach <= 0) {
    return null;
  }
  return (
    <SvgLayer>
      <defs>
        <linearGradient id={id} x1={0} y1={0} x2={1} y2={0}>
          <stop offset={0} stopColor={ink.ring} stopOpacity={0} />
          <stop offset={1} stopColor={ink.ring} stopOpacity={0.35} />
        </linearGradient>
      </defs>
      {JETS.map((y, index) => {
        const tipX = mix(JET.from, JET.to - index * 14, reach);
        const to: Point = [tipX, y - 6 + index * 6];
        // A corrente ondula um pouco, como água e não como um cano.
        const bend = y - 8 + 6 * Math.sin(frame / 3 + index);
        return (
          <g key={y}>
            {/* A corrente alarga e clareia ao chegar nela. */}
            <path
              d={taperPath(
                [JET.from - 60, y],
                [(JET.from + to[0]) / 2, bend],
                to,
                6,
                26,
              )}
              fill={`url(#${id})`}
            />
            {/* A ponta da corrente é redonda, não um corte reto. */}
            <ellipse
              cx={to[0]}
              cy={to[1]}
              rx={9}
              ry={14}
              fill={ink.ring}
              opacity={0.45}
            />
            <line
              x1={JET.from + 30}
              x2={to[0] - 20}
              y1={y - 2}
              y2={to[1]}
              stroke={ink.ring}
              strokeWidth={4}
              strokeLinecap="round"
              strokeDasharray={`${JET.dash} ${JET.gap}`}
              strokeDashoffset={-frame * JET.speed}
              opacity={0.8}
            />
            {reach >= 1
              ? Array.from({ length: 5 }, (_, bubble) => {
                  const pick = (trait: string) =>
                    random(`jet-${index}-${trait}-${bubble}`);
                  return (
                    <circle
                      key={bubble}
                      cx={to[0] - 50 + pick("x") * 110}
                      cy={
                        to[1] -
                        30 +
                        pick("y") * 60 -
                        ((frame * (0.6 + pick("rise"))) % 40)
                      }
                      r={3 + pick("size") * 6}
                      fill="none"
                      stroke={ink.ring}
                      strokeWidth={2.5}
                      opacity={0.7}
                    />
                  );
                })
              : null}
          </g>
        );
      })}
    </SvgLayer>
  );
};

type JetsShotProps = {
  /** Quadro do plano em que os jatos entram. */
  readonly jetsAt: number;
};

/** De noite, a água a sacode: os braços se agitam e o peixe acorda assustado. */
const JetsShot: React.FC<JetsShotProps> = ({ jetsAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const seconds = frame / fps;
  const reach = settle(frame, jetsAt, JET_SECONDS * fps);
  const hit = jetsAt + JET_SECONDS * fps;
  const roused = ramp(frame, hit, ROUSE_SECONDS * fps);
  // O peixe reage alguns quadros depois da água chegar.
  const jump = settle(frame, hit + 4, JUMP_SECONDS * fps);

  return (
    <LagoonShot
      time="night"
      camera={LAGOON.medium}
      rhythm={[
        { from: 0, perMinute: PULSES_ASLEEP },
        { from: hit, perMinute: PULSES_AWAKE },
      ]}
      droop={mix(0.7, 0.15, roused)}
      sway={reach >= 1 ? SHAKE * wave(seconds, SHAKE_SECONDS) : 0}
      fish={{
        x: mix(FISH_ASLEEP.x, FISH_AWAKE.x, jump),
        y:
          mix(FISH_ASLEEP.y, FISH_AWAKE.y, jump) -
          40 * Math.sin(jump * Math.PI),
        width: 110,
        mood: jump > 0 ? "scared" : "asleep",
        look: [-0.8, 0.3],
        tilt: mix(8, 0, jump),
        swimming: jump > 0 && jump < 1,
      }}
    >
      <Jets reach={reach} />
    </LagoonShot>
  );
};

/** De dia, com a lagoa clara, ela está como de noite; a câmera chega perto e o peixe se afasta. */
const AsleepShot: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const progress = frame / durationInFrames;

  return (
    <LagoonShot
      time="day"
      camera={cameraBetween(LAGOON.asleep, LAGOON.asleepEnd, progress)}
      rhythm={steady(PULSES_ASLEEP)}
      droop={1}
      rings
      fish={{
        x: mix(FISH_LEAVING.from, FISH_LEAVING.to, progress),
        y: FISH_LEAVING.y,
        width: 110,
        flip: true,
        tilt: -6,
        look: [0.4, 0.2],
      }}
    />
  );
};

export const JellyfishSleepsScene: React.FC<SceneProps> = ({
  scene,
  shots,
}) => (
  <>
    <Shot range={shots[0]} name="os jatos a sacodem" hold={DAY_WIPE.frames}>
      <JetsShot jetsAt={cue(scene, "alguém")} />
    </Shot>
    <Shot range={shots[1]} name="de dia, dormindo" wipe={DAY_WIPE}>
      <AsleepShot />
    </Shot>
  </>
);
