import { useId } from "react";
import { palette } from "../design/tokens";

type SunProps = {
  readonly radius: number;
};

export const Sun: React.FC<SunProps> = ({ radius }) => {
  const gradientId = useId();
  return (
    <svg width={radius * 2} height={radius * 2} viewBox="-100 -100 200 200">
      <defs>
        <radialGradient
          id={gradientId}
          cx="-25"
          cy="-25"
          r="130"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor={palette.sun.light} />
          <stop offset="0.55" stopColor={palette.sun.base} />
          <stop offset="1" stopColor={palette.sun.dark} />
        </radialGradient>
      </defs>
      <circle r="100" fill={`url(#${gradientId})`} />
      <g fill={palette.sun.dark} opacity="0.35">
        <circle cx="34" cy="-22" r="9" />
        <circle cx="-40" cy="36" r="6" />
        <circle cx="46" cy="42" r="4" />
      </g>
    </svg>
  );
};
