import "../design/fonts";
import { typography } from "../design/tokens";

export type StopwatchColors = {
  readonly body: string;
  readonly bodyShade: string;
  readonly rim: string;
  readonly button: string;
  /** O visor e o texto dele. */
  readonly display: string;
  readonly text: string;
  readonly shine: string;
};

type StopwatchProps = {
  /** Largura do corpo do cronômetro, em pixels do quadro. */
  readonly width: number;
  readonly colors: StopwatchColors;
  /** O que o visor mostra. */
  readonly reading: string;
};

const VIEW = { width: 300, height: 360 };

/** Cronômetro de mão, com botão em cima e visor de números. O centro do desenho é o centro do corpo. */
export const Stopwatch: React.FC<StopwatchProps> = ({
  width,
  colors,
  reading,
}) => {
  const scale = width / 260;

  return (
    <svg
      width={VIEW.width * scale}
      height={VIEW.height * scale}
      viewBox={`${-VIEW.width / 2} ${-VIEW.height / 2 - 20} ${VIEW.width} ${VIEW.height}`}
      overflow="visible"
    >
      {/* Botão de cima e o lateral, inclinado. */}
      <rect
        x={-22}
        y={-178}
        width={44}
        height={46}
        rx={10}
        fill={colors.button}
      />
      <rect x={-34} y={-190} width={68} height={22} rx={11} fill={colors.rim} />
      <rect
        x={74}
        y={-142}
        width={40}
        height={30}
        rx={9}
        fill={colors.button}
        transform="rotate(38 94 -127)"
      />

      <circle r={130} fill={colors.rim} />
      <circle r={114} fill={colors.body} />
      <path
        d="M-114,0 A114,114 0 0 0 114,0 A150,150 0 0 1 -114,0 Z"
        fill={colors.bodyShade}
      />

      <rect
        x={-92}
        y={-46}
        width={184}
        height={92}
        rx={22}
        fill={colors.display}
      />
      <text
        y={22}
        textAnchor="middle"
        fontFamily={typography.family}
        fontWeight={typography.weight}
        fontSize={62}
        fill={colors.text}
      >
        {reading}
      </text>
      <path
        d="M-84,-78 A112,112 0 0 1 -18,-108"
        fill="none"
        stroke={colors.shine}
        strokeWidth={12}
        strokeLinecap="round"
        opacity={0.7}
      />
    </svg>
  );
};
