import { useCurrentFrame, useVideoConfig } from "remotion";
import { Person } from "../../../art/Person";
import { Stay, useStage } from "../../../components/Cast";
import { Grain } from "../../../components/Grain";
import { breath } from "../../../components/Idle";
import { Place } from "../../../components/Place";
import { SlowPush } from "../../../components/SlowPush";
import { SvgLayer } from "../../../components/SvgLayer";
import type { SceneProps } from "../../../video/NarratedVideo";
import { Shot } from "../../../video/Shot";
import { ink, personInPajamas } from "../palette";
import { HUGGING, Pillow } from "../parts/Belongings";
import { IdeaBackdrop, IdeaShadow } from "../parts/IdeaBackdrop";
import { OUR_HOURS, rulerX, SleptBars } from "../parts/SleepRuler";
import { cue, ramp } from "../../../components/timing";

// Quem dorme é o assunto: no centro, grande, com a barra presa a ela.
const SLEEPER = { x: 960, y: 1100, height: 700 };
/** A câmera do plano e onde ficam as barras: a cena seguinte recebe as barras neste lugar. */
export const MEASURE = { focus: [960, 420], push: 0.04, top: 230 } as const;

type MeasureShotProps = {
  /** Quadros do plano em que a nossa barra enche e em que ganha o número. */
  readonly fillAt: number;
  readonly hoursAt: number;
};

/** A régua de 24 horas e, nela, as oito horas que nós dormimos: a medida do capítulo. */
const MeasureShot: React.FC<MeasureShotProps> = ({ fillAt, hoursAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const seconds = frame / fps;
  // Depois que a cena seguinte chega, as barras são dela: continuam no mesmo lugar.
  const stage = useStage();
  const { handedOver } = stage;

  return (
    <>
      <SlowPush
        focus={[MEASURE.focus[0], MEASURE.focus[1]]}
        by={MEASURE.push}
        backdrop={<IdeaBackdrop hue="mint" spot={[0.5, 0.65]} />}
      >
        {handedOver ? null : (
          <Stay only="leaving">
            <SleptBars
              top={MEASURE.top}
              tone={ink.dark}
              ruler={ramp(frame, 0, 0.8 * fps)}
              ours={{
                filled: ramp(frame, fillAt, 0.7 * fps),
                labelAt: hoursAt,
              }}
            />
          </Stay>
        )}
        <SvgLayer>
          {/* A linha que prende a barra a quem dormiu aquelas horas. */}
          <line
            x1={rulerX(OUR_HOURS / 2)}
            y1={MEASURE.top + 70}
            x2={SLEEPER.x}
            y2={SLEEPER.y - SLEEPER.height + 60}
            stroke={ink.dark}
            strokeWidth={6}
            strokeLinecap="round"
            strokeDasharray="4 16"
            opacity={
              0.6 * ramp(frame, hoursAt, 0.3 * fps) * (1 - stage.leave())
            }
          />
          <g opacity={ramp(frame, 0, 0.3 * fps) * (1 - stage.leave())}>
            <IdeaShadow
              hue="mint"
              x={SLEEPER.x}
              y={SLEEPER.y + 6}
              width={260}
            />
          </g>
        </SvgLayer>
        <Place
          x={SLEEPER.x}
          y={SLEEPER.y}
          anchor="bottom"
          style={{
            scale: `1 ${breath(seconds, "sleeper", { amplitude: 0.02, period: 5 })}`,
          }}
        >
          <Person
            height={SLEEPER.height}
            colors={personInPajamas}
            expression="asleep"
            {...HUGGING}
            held={<Pillow />}
          />
        </Place>
        <Grain />
      </SlowPush>
    </>
  );
};

export const AlmostEscapedScene: React.FC<SceneProps> = ({ scene, shots }) => (
  <Shot range={shots[0]} name="as oito horas que nós dormimos">
    <MeasureShot fillAt={cue(scene, "medir")} hoursAt={cue(scene, "oito")} />
  </Shot>
);
