import { goods, ink, shopInside } from "../palette";

/** As três respostas para o sono, na ordem do capítulo: o estoque, as prateleiras e a faxina. */
export type Answer = "stock" | "shelves" | "cleaning";
export const ANSWERS: readonly Answer[] = ["stock", "shelves", "cleaning"];

const ICONS: Record<Answer, React.ReactNode> = {
  // O estoque: uma caixa.
  stock: (
    <>
      <rect x={-40} y={-28} width={80} height={62} rx={8} fill={goods.crate} />
      <rect
        x={-40}
        y={-28}
        width={80}
        height={18}
        rx={8}
        fill={goods.crateShade}
      />
      <rect x={-8} y={-28} width={16} height={62} fill={goods.tape} />
    </>
  ),
  // As prateleiras: duas tábuas com mercadoria.
  shelves: (
    <>
      {[-4, 36].map((y, shelf) => (
        <g key={y}>
          <rect
            x={-46}
            y={y}
            width={92}
            height={10}
            rx={5}
            fill={shopInside.day.wood}
          />
          {[-28, 0, 28].map((x, item) => (
            <circle
              key={x}
              cx={x}
              cy={y - 13}
              r={9 + ((shelf + item) % 3) * 2}
              fill={goods.items[(shelf * 3 + item) % goods.items.length]}
            />
          ))}
        </g>
      ))}
    </>
  ),
  // A faxina: uma vassoura.
  cleaning: (
    <g transform="rotate(24)">
      <rect
        x={-5}
        y={-48}
        width={10}
        height={64}
        rx={5}
        fill={goods.broomStick}
      />
      <path d="M-14,12 L14,12 L30,46 L-30,46 Z" fill={goods.broom} />
      <rect
        x={-17}
        y={6}
        width={34}
        height={12}
        rx={5}
        fill={goods.broomStick}
      />
    </g>
  ),
};

type AnswerIconProps = {
  readonly answer: Answer;
  /** Diâmetro do medalhão, em pixels do quadro. */
  readonly size: number;
};

/** O medalhão de uma das três respostas: sempre o mesmo desenho, onde quer que ela volte. */
export const AnswerIcon: React.FC<AnswerIconProps> = ({ answer, size }) => (
  <svg width={size} height={size} viewBox="-70 -70 140 140">
    <circle r={70} fill={ink.ring} />
    {ICONS[answer]}
  </svg>
);
