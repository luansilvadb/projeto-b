import { interpolateColors } from "remotion";
import { Backdrop } from "../../../components/Backdrop";
import { SvgLayer } from "../../../components/SvgLayer";
import { palette } from "../../../design/tokens";

type SeaProps = {
  /** 0 é dia, 1 é noite. */
  readonly night: number;
};

/** Altura do fundo do mar, onde a água-viva pousa. */
export const SEA_FLOOR_Y = 930;

/** Altura do centro de uma água-viva de tamanho `size` pousada num chão em `floorY`. */
export const restingY = (size: number, floorY = SEA_FLOOR_Y) =>
  floorY - size * 0.39;

/** Fundo de mar raso com o chão de areia, do dia para a noite. */
export const Sea: React.FC<SeaProps> = ({ night }) => (
  <>
    <Backdrop
      top={interpolateColors(night, [0, 1], [palette.ocean.dark, palette.ink])}
      bottom={interpolateColors(
        night,
        [0, 1],
        [palette.ocean.base, palette.dusk],
      )}
    />
    <SvgLayer>
      <rect
        x={-200}
        y={SEA_FLOOR_Y}
        width={2320}
        height={400}
        fill={interpolateColors(
          night,
          [0, 1],
          [palette.mist, palette.ocean.dark],
        )}
      />
    </SvgLayer>
  </>
);
