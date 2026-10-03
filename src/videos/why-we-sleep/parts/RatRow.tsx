import { SvgLayer } from "../../../components/SvgLayer";

type RatRowProps = {
  readonly y: number;
  readonly color: string;
  /** Opacidade de cada círculo, pela posição na fileira. */
  readonly opacity?: (index: number) => number;
  readonly radius?: number;
};

export const RATS = 10;
const FIRST_X = 330;
const SPACING = 140;

/**
 * Os ratos do experimento de 1989, um círculo por animal: o roteiro pede que
 * nenhum rato seja desenhado.
 */
export const RatRow: React.FC<RatRowProps> = ({
  y,
  color,
  opacity = () => 1,
  radius = 44,
}) => (
  <SvgLayer>
    {Array.from({ length: RATS }, (_, index) => (
      <circle
        key={index}
        cx={FIRST_X + SPACING * index}
        cy={y}
        r={radius}
        fill={color}
        opacity={opacity(index)}
      />
    ))}
  </SvgLayer>
);
