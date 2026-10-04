import type { TagTone } from "../palette";
import { Tag } from "./Tag";
import { Place } from "../../../components/Place";
import { Pop } from "../../../components/Pop";
import { ink } from "../palette";
import { ALREADY_SHOWN } from "../../../components/timing";

type CalendarProps = {
  /** Centro do calendário no quadro. */
  readonly x: number;
  readonly y: number;
  readonly days: number;
  /** Quantos dias já se preencheram, de 0 a `days`. */
  readonly filled: number;
  /** Texto que fecha a contagem, e o quadro em que entra. */
  readonly label?: string;
  readonly labelAt?: number;
  /** O fundo sobre o qual a etiqueta fica. */
  readonly on?: TagTone;
  readonly enter?: number;
};

const COLUMNS = 7;
const CELL = 30;
const GAP = 8;

/** Um calendário pequeno que se preenche dia a dia: a quantidade de tempo que se conta. */
export const Calendar: React.FC<CalendarProps> = ({
  x,
  y,
  days,
  filled,
  label,
  labelAt = ALREADY_SHOWN,
  on = "mint",
  enter = ALREADY_SHOWN,
}) => {
  const rows = Math.ceil(days / COLUMNS);
  const width = COLUMNS * CELL + (COLUMNS - 1) * GAP;
  const height = rows * CELL + (rows - 1) * GAP;

  return (
    <Place x={x} y={y}>
      <Pop at={enter}>
        <div style={{ display: "grid", justifyItems: "center", gap: 14 }}>
          <div
            style={{
              padding: 18,
              borderRadius: 18,
              background: ink.paper,
            }}
          >
            <svg
              width={width}
              height={height}
              viewBox={`0 0 ${width} ${height}`}
            >
              {Array.from({ length: days }, (_, day) => (
                <rect
                  key={day}
                  x={(day % COLUMNS) * (CELL + GAP)}
                  y={Math.floor(day / COLUMNS) * (CELL + GAP)}
                  width={CELL}
                  height={CELL}
                  rx={7}
                  fill={day < filled ? ink.tag : ink.tagEdge}
                  opacity={day < filled ? 1 : 0.2}
                />
              ))}
            </svg>
          </div>
          {label ? (
            <Pop at={labelAt}>
              <Tag size="note" on={on}>
                {label}
              </Tag>
            </Pop>
          ) : null}
        </div>
      </Pop>
    </Place>
  );
};
