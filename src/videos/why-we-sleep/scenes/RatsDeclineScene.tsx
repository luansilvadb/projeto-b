import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Label } from "../../../components/Label";
import { Place } from "../../../components/Place";
import { SvgLayer } from "../../../components/SvgLayer";
import { palette, shape } from "../../../design/tokens";
import type { SceneProps } from "../../../video/NarratedVideo";
import { RATS, RatRow } from "../parts/RatRow";
import { Stage } from "../parts/Stage";
import { cue, ramp } from "../../../components/timing";

// Dias em que o primeiro e o último rato chegaram ao fim, segundo o estudo.
const FIRST_DAY = 11;
const LAST_DAY = 32;
const DAYS = { y: 780, x: 330, perDay: 36, total: 35 };
export const FADED_RAT = 0.15;

const dayX = (day: number) => DAYS.x + day * DAYS.perDay;

export const RatsDeclineScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const day = interpolate(
    frame,
    [cue(scene, "onze"), scene.durationInFrames - 0.4 * fps],
    [FIRST_DAY, LAST_DAY],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const gone = ((day - FIRST_DAY) / (LAST_DAY - FIRST_DAY)) * RATS;
  const timelineShown = frame >= cue(scene, "Todos");

  return (
    <Stage scene={scene} grave>
      <RatRow
        y={300}
        color={palette.sun.light}
        radius={44 - 12 * ramp(frame, cue(scene, "emagreciam"), 1.5 * fps)}
        // Cada círculo se apaga aos poucos quando chega a vez dele.
        opacity={(index) =>
          timelineShown
            ? interpolate(gone - index, [0, 1], [1, FADED_RAT], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              })
            : 1
        }
      />
      <RatRow y={500} color={palette.ocean.light} />
      {timelineShown ? (
        <>
          <SvgLayer>
            <line
              x1={dayX(0)}
              x2={dayX(DAYS.total)}
              y1={DAYS.y}
              y2={DAYS.y}
              stroke={palette.mist}
              strokeWidth={shape.stroke.thin}
              strokeLinecap="round"
            />
            {[FIRST_DAY, LAST_DAY].map((mark) => (
              <line
                key={mark}
                x1={dayX(mark)}
                x2={dayX(mark)}
                y1={DAYS.y - 26}
                y2={DAYS.y + 26}
                stroke={palette.paper}
                strokeWidth={shape.stroke.regular}
                strokeLinecap="round"
              />
            ))}
            <circle
              cx={dayX(day)}
              cy={DAYS.y}
              r={18}
              fill={palette.accent.base}
            />
          </SvgLayer>
          {[FIRST_DAY, LAST_DAY].map((mark) => (
            <Place key={mark} x={dayX(mark)} y={DAYS.y + 90}>
              <Label size="note">dia {mark}</Label>
            </Place>
          ))}
        </>
      ) : null}
    </Stage>
  );
};
