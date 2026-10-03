import { useId } from "react";
import { palette, shape } from "../../../design/tokens";

type DayBarProps = {
  readonly width: number;
  /** Fração das 24 horas passada dormindo, de 0 a 1. */
  readonly asleep: number;
  /** Divide o sono em muitas fatias finas espalhadas pelo dia. */
  readonly scattered?: boolean;
};

const HEIGHT = 70;
const SCATTERED_SLICES = 24;

/** Um dia de 24 horas em barra: claro acordado, escuro dormindo. */
export const DayBar: React.FC<DayBarProps> = ({
  width,
  asleep,
  scattered = false,
}) => {
  const clipId = useId();
  const slices = scattered
    ? Array.from({ length: SCATTERED_SLICES }, (_, index) => ({
        x: ((index + 0.5) / SCATTERED_SLICES) * width,
        width: (asleep * width) / SCATTERED_SLICES,
      }))
    : [{ x: width * (1 - asleep), width: width * asleep }];

  return (
    <svg width={width} height={HEIGHT} overflow="visible">
      <clipPath id={clipId}>
        <rect width={width} height={HEIGHT} rx={HEIGHT / 2} />
      </clipPath>
      <g clipPath={`url(#${clipId})`}>
        <rect width={width} height={HEIGHT} fill={palette.sun.light} />
        {slices.map((slice) => (
          <rect
            key={slice.x}
            x={slice.x}
            width={slice.width}
            height={HEIGHT}
            fill={palette.ink}
          />
        ))}
      </g>
      <rect
        width={width}
        height={HEIGHT}
        rx={HEIGHT / 2}
        fill="none"
        stroke={palette.paper}
        strokeWidth={shape.stroke.thin}
      />
    </svg>
  );
};
