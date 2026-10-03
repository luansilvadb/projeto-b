import { random } from "remotion";
import { Label } from "../../../components/Label";
import { Place } from "../../../components/Place";
import { SvgLayer } from "../../../components/SvgLayer";
import { palette, shape } from "../../../design/tokens";

export const COUNTER = { x: 200, y: 720, width: 440, height: 180 };
export const STOCKROOM = { x: 1450, y: 460, width: 280, height: 440 };
const WALL = { x: 120, y: 300, width: 1680, height: 600 };
const SHELVES = { x: 740, width: 600, ys: [480, 640, 800] };
const ITEMS_PER_SHELF = 5;

export type ShelfItem = {
  readonly x: number;
  /** Altura da prateleira em que o item se apoia. */
  readonly shelfY: number;
  readonly radius: number;
  /** As conexões maiores e mais firmes, que o sono poupa. */
  readonly large: boolean;
};

const LARGE_RADIUS = 46;

/** Itens das prateleiras: cada um é uma conexão entre dois neurônios. */
export const SHELF_ITEMS: readonly ShelfItem[] = SHELVES.ys.flatMap(
  (shelfY, shelf) =>
    Array.from({ length: ITEMS_PER_SHELF }, (_, index) => {
      const radius = 24 + random(`shelf-item-${shelf}-${index}`) * 34;
      return {
        x: SHELVES.x + ((index + 0.5) / ITEMS_PER_SHELF) * SHELVES.width,
        shelfY,
        radius,
        large: radius >= LARGE_RADIUS,
      };
    }),
);

type ShelfStockProps = {
  /** Tamanho de cada item em relação ao original. */
  readonly scale: (item: ShelfItem) => number;
  /** Opacidade do contorno de destaque de cada item. */
  readonly highlight?: (item: ShelfItem) => number;
  /** Mostra, tracejado, o tamanho que o item tinha antes de encolher. */
  readonly ghost?: boolean;
  readonly opacity?: number;
};

const STUB = 26;

/** Os itens nas prateleiras, cada um entre os dois neurônios que ele liga. */
export const ShelfStock: React.FC<ShelfStockProps> = ({
  scale,
  highlight = () => 0,
  ghost = false,
  opacity = 1,
}) => (
  <SvgLayer>
    <g opacity={opacity}>
      {SHELF_ITEMS.map((item) => {
        const radius = item.radius * scale(item);
        const cy = item.shelfY - shape.stroke.regular / 2 - item.radius;
        return (
          <g key={`${item.x}-${item.shelfY}`}>
            <line
              x1={item.x - item.radius - STUB}
              x2={item.x + item.radius + STUB}
              y1={cy}
              y2={cy}
              stroke={palette.mist}
              strokeWidth={shape.stroke.thin}
              strokeLinecap="round"
            />
            {ghost ? (
              <circle
                cx={item.x}
                cy={cy}
                r={item.radius}
                fill={palette.dusk}
                stroke={palette.mist}
                strokeWidth={3}
                strokeDasharray="8 8"
              />
            ) : null}
            <circle cx={item.x} cy={cy} r={radius} fill={palette.ocean.light} />
            <circle
              cx={item.x}
              cy={cy}
              r={radius + 8}
              fill="none"
              stroke={palette.paper}
              strokeWidth={shape.stroke.thin}
              opacity={highlight(item)}
            />
          </g>
        );
      })}
    </g>
  </SvgLayer>
);

/** Interior da loja de porta fechada: balcão, prateleiras e o depósito dos fundos. */
export const ShopInterior: React.FC = () => (
  <>
    <SvgLayer>
      <rect {...WALL} rx={12} fill={palette.dusk} />
      <rect
        {...WALL}
        rx={12}
        fill="none"
        stroke={palette.mist}
        strokeWidth={shape.stroke.thin}
        opacity={0.5}
      />
      <rect {...COUNTER} rx={8} fill={palette.ocean.dark} />
      <rect {...STOCKROOM} rx={8} fill={palette.ink} />
      {SHELVES.ys.map((y) => (
        <line
          key={y}
          x1={SHELVES.x}
          x2={SHELVES.x + SHELVES.width}
          y1={y}
          y2={y}
          stroke={palette.mist}
          strokeWidth={shape.stroke.regular}
          strokeLinecap="round"
        />
      ))}
    </SvgLayer>
    <Place x={STOCKROOM.x + STOCKROOM.width / 2} y={STOCKROOM.y - 60}>
      <Label size="note" color={palette.mist}>
        depósito
      </Label>
    </Place>
  </>
);
