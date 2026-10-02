import { Glow } from "../components/Glow";
import { palette } from "../design/tokens";

type LightPulseProps = {
  readonly radius: number;
};

/** Um ponto de luz viajando: núcleo claro envolto por um halo. */
export const LightPulse: React.FC<LightPulseProps> = ({ radius }) => (
  <div style={{ display: "grid", placeItems: "center" }}>
    <div style={{ gridArea: "1 / 1" }}>
      <Glow radius={radius * 5} color={palette.sun.light} opacity={0.7} />
    </div>
    <div
      style={{
        gridArea: "1 / 1",
        width: radius * 2,
        height: radius * 2,
        borderRadius: "50%",
        background: palette.paper,
      }}
    />
  </div>
);
