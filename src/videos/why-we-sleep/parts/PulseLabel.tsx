import { useCurrentFrame, useVideoConfig } from "remotion";
import { Label } from "../../../components/Label";
import { Place } from "../../../components/Place";
import { POP_SECONDS, Pop } from "../../../components/Pop";
import { SvgLayer } from "../../../components/SvgLayer";
import { ink } from "../palette";
import { ramp } from "./timing";

type FramePoint = readonly [number, number];

type PulseLabelProps = {
  readonly value: number;
  /** Centro do contador no quadro. */
  readonly at: FramePoint;
  /** Ponto do sino, no quadro, a que a linha prende o contador. */
  readonly target: FramePoint;
  /** Cor do número e da linha: escura quando o contador fica sobre a areia clara. */
  readonly tone?: "light" | "dark";
  /** Quadro do plano em que o número entra; a etiqueta e a linha vêm logo depois. */
  readonly enter: number;
};

// Do centro do contador até o meio da lateral da etiqueta.
const TAG = { halfWidth: 250, below: 88 };
// A etiqueta entra depois do número, e a linha se estica junto com ela.
const TAG_DELAY_SECONDS = 0.3;

/** O ritmo do pulso: número solto, etiqueta e a linha que os prende ao sino. */
export const PulseLabel: React.FC<PulseLabelProps> = ({
  value,
  at,
  target,
  tone = "light",
  enter,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const color = tone === "dark" ? ink.dark : ink.paper;
  // A linha sai do lado da etiqueta que dá para o sino.
  const side = target[0] < at[0] ? -1 : 1;
  const start: FramePoint = [at[0] + side * TAG.halfWidth, at[1] + TAG.below];
  const tagEnter = enter + TAG_DELAY_SECONDS * fps;
  const drawn = ramp(frame, tagEnter, POP_SECONDS * fps);

  return (
    <>
      <SvgLayer>
        <path
          d={`M${start[0]},${start[1]} Q${(start[0] + target[0]) / 2},${start[1]} ${target[0]},${target[1]}`}
          fill="none"
          stroke={color}
          strokeWidth={5}
          strokeLinecap="round"
          opacity={0.9}
          pathLength={1}
          strokeDasharray={`${drawn} 1`}
        />
        <circle
          cx={target[0]}
          cy={target[1]}
          r={10 * (drawn >= 1 ? 1 : 0)}
          fill={color}
        />
      </SvgLayer>
      <Place x={at[0]} y={at[1]}>
        <div style={{ display: "grid", justifyItems: "center", gap: 12 }}>
          <Pop at={enter}>
            <Label size="display" color={color}>
              {value}
            </Label>
          </Pop>
          <Pop at={tagEnter}>
            <Label size="note" color={ink.dark} tag={ink.tag}>
              pulsos por minuto
            </Label>
          </Pop>
        </div>
      </Place>
    </>
  );
};
