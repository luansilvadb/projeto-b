import type { TagTone } from "../palette";
import { Tag } from "./Tag";
import { Place } from "../../../components/Place";
import { Pop } from "../../../components/Pop";
import { ink } from "../palette";
import { ALREADY_SHOWN, clamp01 } from "../../../components/timing";

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
  /**
   * Cada dia se preenche aos poucos: a célula em curso cresce do meio e toma
   * a cor, com uma sobra, em vez de trocar num quadro. Por padrão, troca.
   */
  readonly gradual?: boolean;
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
  gradual = false,
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
              overflow="visible"
            >
              {Array.from({ length: days }, (_, day) => {
                const x = (day % COLUMNS) * (CELL + GAP);
                const y = Math.floor(day / COLUMNS) * (CELL + GAP);
                if (!gradual) {
                  return (
                    <rect
                      key={day}
                      x={x}
                      y={y}
                      width={CELL}
                      height={CELL}
                      rx={7}
                      fill={day < filled ? ink.tag : ink.tagEdge}
                      opacity={day < filled ? 1 : 0.2}
                    />
                  );
                }
                // Quanto deste dia já se preencheu: a parte inteira de `filled` são os dias cheios.
                const done = clamp01(filled - day);
                // Cresce do meio, passa um pouco do tamanho e assenta.
                const size =
                  done < 0.7
                    ? 0.3 + (0.82 * done) / 0.7
                    : 1.12 - (0.12 * (done - 0.7)) / 0.3;
                return (
                  <g key={day}>
                    <rect
                      x={x}
                      y={y}
                      width={CELL}
                      height={CELL}
                      rx={7}
                      fill={ink.tagEdge}
                      opacity={0.2}
                    />
                    {done > 0 ? (
                      <rect
                        x={x + (CELL * (1 - size)) / 2}
                        y={y + (CELL * (1 - size)) / 2}
                        width={CELL * size}
                        height={CELL * size}
                        rx={7 * size}
                        fill={ink.tag}
                      />
                    ) : null}
                  </g>
                );
              })}
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
