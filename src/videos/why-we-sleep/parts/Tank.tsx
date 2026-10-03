import { SvgLayer } from "../../../components/SvgLayer";
import { palette, shape } from "../../../design/tokens";

type TankProps = {
  /** Centro horizontal do tanque, em pixels do quadro. */
  readonly x: number;
};

export const TANK = { width: 900, top: 200, bottom: 940 };

/** Tanque do laboratório, visto de lado e aberto em cima. */
export const Tank: React.FC<TankProps> = ({ x }) => {
  const left = x - TANK.width / 2;
  const right = x + TANK.width / 2;

  return (
    <SvgLayer>
      <rect
        x={left}
        y={TANK.top + 60}
        width={TANK.width}
        height={TANK.bottom - TANK.top - 60}
        fill={palette.ocean.dark}
        opacity={0.55}
      />
      <path
        d={`M ${left} ${TANK.top} V ${TANK.bottom} H ${right} V ${TANK.top}`}
        fill="none"
        stroke={palette.mist}
        strokeWidth={shape.stroke.regular}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </SvgLayer>
  );
};
