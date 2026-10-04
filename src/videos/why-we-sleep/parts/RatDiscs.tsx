import { Silhouette } from "../../../art/Silhouettes";
import { breath } from "../../../components/Idle";
import { Place } from "../../../components/Place";
import { SvgLayer } from "../../../components/SvgLayer";
import { lab, rat } from "../palette";

/** Acordado sobre o disco, cochilando entre um giro e outro, ou já fora do experimento: só a silhueta. */
export type RatState = "awake" | "asleep" | "gone";

type RatDiscsProps = {
  /** Altura do tampo dos discos no quadro. */
  readonly y: number;
  readonly state: (index: number) => RatState;
  readonly seconds: number;
  /** Os discos giram: é o que impede o rato de dormir. */
  readonly spinning?: boolean;
};

export const RATS = 10;
const FIRST_X = 240;
const SPACING = 160;
const DISC = { rx: 66, ry: 15 };
const RAT_WIDTH = 132;
// Do tampo do disco até a linha d'água, e a profundidade da calha.
const WATER = { drop: 70, depth: 70 };
const TURN_SECONDS = 2.4;
// O olho fechado de quem cochila, a partir do centro do desenho do rato.
const CLOSED_EYE = [-42, 8] as const;

/** Onde cada rato fica na fileira. */
export const ratX = (index: number) => FIRST_X + SPACING * index;

/**
 * Os dez ratos do experimento, cada um sobre um disco acima da água: quando o
 * disco gira, o rato precisa andar para não cair, e por isso não dorme.
 */
export const RatDiscs: React.FC<RatDiscsProps> = ({
  y,
  state,
  seconds,
  spinning = true,
}) => (
  <>
    <SvgLayer>
      <rect
        x={FIRST_X - 130}
        y={y + WATER.drop}
        width={SPACING * (RATS - 1) + 260}
        height={WATER.depth}
        rx={20}
        fill={lab.waterDeep}
      />
      <rect
        x={FIRST_X - 130}
        y={y + WATER.drop}
        width={SPACING * (RATS - 1) + 260}
        height={16}
        rx={8}
        fill={lab.water}
      />
      {Array.from({ length: RATS }, (_, index) => {
        const x = ratX(index);
        const angle =
          ((spinning ? seconds / TURN_SECONDS : 0) + index * 0.13) *
          Math.PI *
          2;
        return (
          <g key={index}>
            <rect
              x={x - 9}
              y={y}
              width={18}
              height={WATER.drop + 10}
              fill={lab.platformShade}
            />
            <ellipse
              cx={x}
              cy={y + 8}
              rx={DISC.rx}
              ry={DISC.ry}
              fill={lab.platformShade}
            />
            <ellipse
              cx={x}
              cy={y}
              rx={DISC.rx}
              ry={DISC.ry}
              fill={lab.platform}
            />
            {/* A marca no tampo, que dá a volta: é ela que mostra o giro. */}
            <ellipse
              cx={x + DISC.rx * 0.7 * Math.cos(angle)}
              cy={y + DISC.ry * 0.7 * Math.sin(angle)}
              rx={11}
              ry={4}
              fill={lab.clip}
            />
          </g>
        );
      })}
    </SvgLayer>
    {Array.from({ length: RATS }, (_, index) => {
      const mood = state(index);
      return (
        <Place
          key={index}
          x={ratX(index)}
          y={y - 2}
          anchor="bottom"
          style={{
            scale: `1 ${mood === "gone" ? 1 : breath(seconds, `rat-${index}`, { amplitude: 0.03, period: 2.4 })}`,
            opacity: mood === "gone" ? 0.45 : 1,
          }}
        >
          <Silhouette
            kind="mouse"
            width={RAT_WIDTH}
            color={mood === "gone" ? rat.gone : rat.body}
            shade={mood === "gone" ? undefined : rat.ear}
            eye={mood === "awake" ? rat.eye : undefined}
          />
        </Place>
      );
    })}
    <SvgLayer>
      {Array.from({ length: RATS }, (_, index) =>
        state(index) === "asleep" ? (
          <path
            key={index}
            d={`M${ratX(index) + CLOSED_EYE[0] - 7},${y - 33 + CLOSED_EYE[1]} q7,7 14,0`}
            fill="none"
            stroke={rat.eye}
            strokeWidth={4}
            strokeLinecap="round"
          />
        ) : null,
      )}
    </SvgLayer>
  </>
);
