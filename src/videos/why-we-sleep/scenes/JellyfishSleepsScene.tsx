import { useId } from "react";
import {
  AbsoluteFill,
  random,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Cassiopea } from "../../../art/Cassiopea";
import { taperPath, type Point } from "../../../art/shapes";
import { cameraBetween } from "../../../components/Camera";
import { wave } from "../../../components/Idle";
import { Onomatopoeia } from "../../../components/Onomatopoeia";
import { Place } from "../../../components/Place";
import { SvgLayer } from "../../../components/SvgLayer";
import type { SceneProps } from "../../../video/NarratedVideo";
import { Shot } from "../../../video/Shot";
import { ink, jellyfish, lagoon, sound } from "../palette";
import { LAB, LabBench, LabWall, TANK_CENTER, Tank } from "../parts/Laboratory";
import { JELLYFISH_SPOT } from "../parts/Lagoon";
import { LAGOON } from "../parts/lagoonCameras";
import { LagoonShot } from "../parts/LagoonShot";
import { cue, mix, ramp, settle } from "../../../components/timing";
import {
  PULSES_ASLEEP,
  PULSES_AWAKE,
  pulseShape,
  steady,
} from "../parts/pulse";
import { JELLYFISH_WIDTH, Lab, RESTING_Y } from "./FloorTestScene";

// Altura de cada jato de água que a sacode, no plano do assunto.
const JETS = [596, 634, 672];
const JET = { from: 400, to: 706, dash: 36, gap: 26, speed: 16 };
const JET_SECONDS = 0.3;
// Quanto a água a sacode, e quanto ela leva para erguer os braços.
const SHAKE = 1.6;
const SHAKE_SECONDS = 0.18;
const ROUSE_SECONDS = 0.5;
// Quanto a luz apagada do laboratório escurece o quadro.
const LIGHTS_OFF = 0.85;
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

// No tanque, os jatos vêm da parede de vidro: o mesmo desenho da lagoa, deslocado até onde ela pousa.
const TANK_OFFSET = [
  TANK_CENTER - JELLYFISH_SPOT.x,
  RESTING_Y - JELLYFISH_SPOT.y,
];
// O peixe chega perto e a cutuca com o focinho.
const FISH_POKING = { x: 1150, y: 640, reach: 22 };
const POKE_SECONDS = 0.9;

type JetsShotProps = {
  /** Quadro do plano em que os jatos entram. */
  readonly jetsAt: number;
};

/** No tanque, de noite, os jatos de água a cutucam sem parar: ela não consegue descansar. */
const JetsShot: React.FC<JetsShotProps> = ({ jetsAt }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const seconds = frame / fps;
  const reach = settle(frame, jetsAt, JET_SECONDS * fps);
  const roused = ramp(frame, jetsAt + JET_SECONDS * fps, ROUSE_SECONDS * fps);

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
        <LabBench />
        <Tank platform={TANK_CENTER}>
          <Place
            x={TANK_CENTER}
            y={RESTING_Y}
            style={{
              rotate: `${reach >= 1 ? SHAKE * wave(seconds, SHAKE_SECONDS) : 0}deg`,
            }}
          >
            <Cassiopea
              width={JELLYFISH_WIDTH}
              colors={jellyfish.day}
              droop={mix(0.7, 0.15, roused)}
              pulse={pulseShape((seconds * PULSES_AWAKE) / 60)}
            />
          </Place>
          <AbsoluteFill
            style={{ translate: `${TANK_OFFSET[0]}px ${TANK_OFFSET[1]}px` }}
          >
            <Jets reach={reach} />
          </AbsoluteFill>
        </Tank>
      </Lab>
      {/* A noite no laboratório: a luz apagada escurece tudo, menos o que se entende do tanque. */}
      <AbsoluteFill
        style={{
          // O tanque fica aceso no meio; em volta, o laboratório mergulha no índigo da noite.
          background: `radial-gradient(ellipse 36% 46% at 50% 52%, #FFFFFF 50%, ${lagoon.night.water[1]})`,
          opacity: LIGHTS_OFF,
          mixBlendMode: "multiply",
        }}
      />
      <Place x={520} y={330}>
        <Onomatopoeia
          at={jetsAt}
          size={110}
          color={sound.cool}
          edge={sound.edge}
        >
          PSSST
        </Onomatopoeia>
      </Place>
    </AbsoluteFill>
  );
};

/** De dia, com sol na lagoa, ela para de pulsar e cochila; o peixe a cutuca e ela não reage. */
const AsleepShot: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const poke = Math.max(0, wave(frame / fps, POKE_SECONDS));

  return (
    <LagoonShot
      time="day"
      camera={cameraBetween(
        LAGOON.medium,
        LAGOON.asleep,
        0.3 * (frame / durationInFrames),
      )}
      rhythm={steady(PULSES_ASLEEP)}
      droop={1}
      fish={{
        x: FISH_POKING.x - FISH_POKING.reach * poke,
        y: FISH_POKING.y,
        width: 110,
        look: [-1, 0.1],
        swimming: poke > 0,
      }}
    />
  );
};

export const JellyfishSleepsScene: React.FC<SceneProps> = ({
  scene,
  shots,
}) => (
  <>
    <Shot range={shots[0]} name="os jatos a noite inteira">
      <JetsShot jetsAt={cue(scene, "mantida")} />
    </Shot>
    <Shot range={shots[1]} name="de dia, ela cochila">
      <AsleepShot />
    </Shot>
  </>
);
