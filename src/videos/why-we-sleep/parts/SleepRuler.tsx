import type { TagTone } from "../palette";
import { Tag } from "./Tag";
import { Person } from "../../../art/Person";
import { Silhouette } from "../../../art/Silhouettes";
import { Label } from "../../../components/Label";
import { Place } from "../../../components/Place";
import { Pop } from "../../../components/Pop";
import { SvgLayer } from "../../../components/SvgLayer";
import { ink, personInPajamas } from "../palette";
import { ALREADY_SHOWN } from "../../../components/timing";

/** A régua de 24 horas contra a qual o sono de cada um é medido. */
export const RULER = { x: 330, width: 1290, hours: 24 };
/** As oito horas que nós dormimos por noite: a medida de comparação do capítulo. */
export const OUR_HOURS = 8;
export const ELEPHANT_HOURS = 2;
export const FRIGATEBIRD_HOURS = 40 / 60;
const BAR_HEIGHT = 54;
/** Distância entre uma barra e a seguinte, quando empilhadas. */
export const BAR_STEP = 100;

/** Onde uma hora cai na régua, em pixels do quadro. */
export const rulerX = (hours: number) =>
  RULER.x + (RULER.width * hours) / RULER.hours;

type SleepRulerProps = {
  readonly y: number;
  readonly color: string;
  /** Quanto da régua já se desenhou, de 0 a 1. */
  readonly drawn?: number;
};

/** A régua: um traço com uma marca por hora, do zero às 24 horas. */
export const SleepRuler: React.FC<SleepRulerProps> = ({
  y,
  color,
  drawn = 1,
}) => (
  <>
    <SvgLayer>
      <g stroke={color} strokeWidth={6} strokeLinecap="round">
        <line x1={RULER.x} y1={y} x2={RULER.x + RULER.width * drawn} y2={y} />
        {Array.from({ length: RULER.hours + 1 }, (_, hour) =>
          hour <= RULER.hours * drawn ? (
            <line
              key={hour}
              x1={rulerX(hour)}
              y1={y}
              x2={rulerX(hour)}
              y2={y + (hour % 6 === 0 ? 30 : 16)}
              opacity={hour % 6 === 0 ? 1 : 0.6}
            />
          ) : null,
        )}
      </g>
    </SvgLayer>
    <Place x={rulerX(0)} y={y + 70}>
      <Label size="note" color={color}>
        0
      </Label>
    </Place>
    {drawn >= 1 ? (
      <Place x={rulerX(RULER.hours)} y={y + 70}>
        <Label size="note" color={color}>
          24 h
        </Label>
      </Place>
    ) : null}
  </>
);

type SleepBarProps = {
  readonly y: number;
  /** Horas dormidas por dia, e quanto da barra já encheu, de 0 a 1. */
  readonly hours: number;
  readonly filled?: number;
  /** De quem é a barra: um desenho pequeno, à esquerda do zero. */
  readonly who?: React.ReactNode;
  /** O número na ponta da barra, e o quadro em que entra. */
  readonly label?: string;
  readonly labelAt?: number;
  /** O fundo sobre o qual a etiqueta fica. */
  readonly on?: TagTone;
};

/** A barra do sono de um bicho, do zero da régua até as horas que ele dorme. */
export const SleepBar: React.FC<SleepBarProps> = ({
  y,
  hours,
  filled = 1,
  who,
  label,
  labelAt = ALREADY_SHOWN,
  on = "mint",
}) => {
  const width = (rulerX(hours) - rulerX(0)) * filled;
  return (
    <>
      <SvgLayer>
        <rect
          x={rulerX(0)}
          y={y - BAR_HEIGHT / 2}
          width={width}
          height={BAR_HEIGHT}
          rx={Math.min(BAR_HEIGHT, width) / 2}
          fill={ink.tag}
        />
      </SvgLayer>
      {who ? (
        <Place x={rulerX(0) - 100} y={y}>
          {who}
        </Place>
      ) : null}
      {label ? (
        // A etiqueta fica presa à ponta da barra, alinhada pela esquerda.
        <Place
          x={rulerX(hours) + 24}
          y={y}
          style={{ translate: "0 -50%", transformOrigin: "0 50%" }}
        >
          <Pop at={labelAt}>
            <Tag size="note" on={on}>
              {label}
            </Tag>
          </Pop>
        </Place>
      ) : null}
    </>
  );
};

type BarState = {
  /** Quanto da barra já encheu, de 0 a 1, e o quadro em que o número entra. */
  readonly filled?: number;
  readonly labelAt?: number;
};

type SleptBarsProps = {
  /** Altura da primeira barra no quadro; as outras se empilham debaixo dela, e a régua fecha a pilha. */
  readonly top: number;
  /** Cor da régua e das silhuetas: escura sobre fundo claro, clara sobre a noite. */
  readonly tone: string;
  /** O fundo do plano, para a cor das etiquetas das barras. */
  readonly on?: TagTone;
  /** As barras presentes no plano, na ordem do capítulo: nós, a elefanta, a fragata. */
  readonly ours?: BarState;
  readonly elephant?: BarState;
  readonly frigatebird?: BarState;
  /** Quanto da régua já se desenhou, de 0 a 1. */
  readonly ruler?: number;
  /**
   * Quanto a pilha já abriu, de 0 a 1: em 0 as barras de baixo estão
   * recolhidas sobre a primeira, e a régua fica logo abaixo dela. É como uma
   * barra nova abre lugar na pilha sem a régua saltar.
   */
  readonly spread?: number;
};

const WHO_SIZE = 100;

/** A comparação do capítulo: o sono de cada um, em barras empilhadas sobre a mesma régua de 24 horas. */
export const SleptBars: React.FC<SleptBarsProps> = ({
  top,
  tone,
  on = "mint",
  ours,
  elephant,
  frigatebird,
  ruler = 1,
  spread = 1,
}) => {
  const rows = [
    ours && {
      ...ours,
      hours: OUR_HOURS,
      label: "8 h",
      who: (
        <Person
          height={WHO_SIZE}
          colors={personInPajamas}
          expression="asleep"
        />
      ),
    },
    elephant && {
      ...elephant,
      hours: ELEPHANT_HOURS,
      label: "2 h",
      who: <Silhouette kind="elephant" width={WHO_SIZE} color={tone} />,
    },
    frigatebird && {
      ...frigatebird,
      hours: FRIGATEBIRD_HOURS,
      label: "40 min",
      who: <Silhouette kind="frigatebird" width={WHO_SIZE} color={tone} />,
    },
  ].filter((row) => row !== undefined);

  return (
    <>
      {rows.map((row, index) => (
        <SleepBar
          key={row.label}
          y={top + index * BAR_STEP * spread}
          {...row}
          on={on}
          who={
            index === 0 ? (
              row.who
            ) : (
              <div style={{ scale: `${spread}` }}>{row.who}</div>
            )
          }
        />
      ))}
      <SleepRuler
        y={top + (rows.length - 1) * BAR_STEP * spread + 70}
        color={tone}
        drawn={ruler}
      />
    </>
  );
};
