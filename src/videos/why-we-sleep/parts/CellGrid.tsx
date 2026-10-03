import { random } from "remotion";
import { palette } from "../../../design/tokens";

type CellGridProps = {
  readonly width: number;
  /** Largura do espaço entre as células, em unidades do desenho. */
  readonly gap: number;
  /** Quanto os resíduos já andaram: 1 é a largura inteira do tecido. */
  readonly flow: number;
  /** Faz os resíduos reentrarem pelo outro lado, para um fluxo contínuo. */
  readonly loop?: boolean;
};

const VIEW = { width: 1200, height: 600 };
const COLUMNS = 5;
const ROWS = 3;
const PARTICLES = 16;

// Espaço entre as células acordado e dormindo: a fonte mede 60% a mais no sono.
export const GAP_AWAKE = 20;
export const GAP_ASLEEP = GAP_AWAKE * 1.6;

/** Tecido do cérebro visto de cima: células, o espaço entre elas e os resíduos que saem por ele. */
export const CellGrid: React.FC<CellGridProps> = ({
  width,
  gap,
  flow,
  loop = false,
}) => {
  const cellWidth = (VIEW.width - gap * (COLUMNS - 1)) / COLUMNS;
  const cellHeight = (VIEW.height - gap * (ROWS - 1)) / ROWS;

  return (
    <svg
      width={width}
      height={(width * VIEW.height) / VIEW.width}
      viewBox={`0 0 ${VIEW.width} ${VIEW.height}`}
    >
      <rect {...VIEW} rx={16} fill={palette.ocean.light} opacity={0.5} />
      {Array.from({ length: PARTICLES }, (_, index) => {
        const corridor = index % (ROWS - 1);
        const travelled =
          random(`residue-${index}`) * VIEW.width + flow * VIEW.width;
        return (
          <circle
            key={index}
            cx={loop ? travelled % VIEW.width : travelled}
            // Cada resíduo oscila dentro do corredor enquanto é levado.
            cy={
              (corridor + 1) * cellHeight +
              (corridor + 0.5) * gap +
              gap *
                0.2 *
                Math.sin(travelled / 40 + random(`wobble-${index}`) * 6)
            }
            r={8}
            fill={palette.accent.base}
          />
        );
      })}
      {Array.from({ length: COLUMNS * ROWS }, (_, index) => (
        <rect
          key={index}
          x={(index % COLUMNS) * (cellWidth + gap)}
          y={Math.floor(index / COLUMNS) * (cellHeight + gap)}
          width={cellWidth}
          height={cellHeight}
          rx={16}
          fill={palette.ocean.dark}
        />
      ))}
    </svg>
  );
};
