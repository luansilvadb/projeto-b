import { Mouse } from "../../../art/Animals";
import { Appear } from "../../../components/Appear";
import { Place } from "../../../components/Place";
import { ALREADY_SHOWN } from "../../../components/timing";
import { palette } from "../../../design/tokens";

type MouseStampProps = {
  /** Quadro da cena em que o selo entra; sem ele, já está na tela. */
  readonly at?: number;
};

const RADIUS = 72;

/** Selo no canto da tela: o que está sendo mostrado foi medido em camundongos. */
export const MouseStamp: React.FC<MouseStampProps> = ({
  at = ALREADY_SHOWN,
}) => (
  <Place x={1700} y={184}>
    <Appear at={at}>
      <div
        style={{
          width: RADIUS * 2,
          height: RADIUS * 2,
          borderRadius: "50%",
          background: palette.accent.base,
          display: "grid",
          placeItems: "center",
        }}
      >
        <Mouse width={104} color={palette.ink} />
      </div>
    </Appear>
  </Place>
);
