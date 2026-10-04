import { random } from "remotion";
import { SvgLayer } from "../../../components/SvgLayer";
import { brainHalves, ink } from "../palette";

type StreamProps = {
  /** O canto de cima à esquerda da corrente, a largura e a altura do canal, em pixels do quadro. */
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  /** Quanto os grãos já andaram: 1 é a largura inteira do canal. Quem anda mais depressa limpa mais. */
  readonly flow: number;
  readonly seed: string;
  /** As células de olhos fechados: a corrente de quem dorme. */
  readonly asleep?: boolean;
};

const GRAINS = 9;
// A altura de cada fileira de células.
const CELL = 120;

/**
 * Uma corrente de fluido entre duas fileiras de células, levando grãos de
 * resíduo da esquerda para a direita: a velocidade dos grãos é a da limpeza.
 */
export const Stream: React.FC<StreamProps> = ({
  x,
  y,
  width,
  height,
  flow,
  seed,
  asleep = false,
}) => (
  <SvgLayer>
    {/* As células de cima e de baixo, e o fluido entre elas. */}
    {[y - CELL - 12, y + height + 12].map((cellY) =>
      [0, 1, 2, 3].map((cell) => (
        <rect
          key={`${cellY}-${cell}`}
          x={x + (cell * width) / 4 + 8}
          y={cellY}
          width={width / 4 - 16}
          height={CELL}
          rx={30}
          fill={brainHalves.asleep}
        />
      )),
    )}
    {/* Os olhos de cada célula, voltados para o canal. */}
    {[y - CELL - 12, y + height + 12].map((cellY) =>
      [0, 1, 2, 3].map((cell) =>
        [-1, 1].map((side) => {
          const cx = x + ((cell + 0.5) * width) / 4 + side * 26;
          const cy = cellY + CELL / 2;
          return asleep ? (
            <path
              key={`${cellY}-${cell}-${side}`}
              d={`M${cx - 13},${cy} Q${cx},${cy + 12} ${cx + 13},${cy}`}
              fill="none"
              stroke={brainHalves.lid}
              strokeWidth={6}
              strokeLinecap="round"
            />
          ) : (
            <g key={`${cellY}-${cell}-${side}`}>
              <circle cx={cx} cy={cy} r={16} fill={brainHalves.eye} />
              <circle
                cx={cx}
                cy={cy + (cellY < y ? 5 : -5)}
                r={8}
                fill={brainHalves.pupil}
              />
            </g>
          );
        }),
      ),
    )}
    <rect
      x={x}
      y={y}
      width={width}
      height={height}
      rx={height / 2}
      fill={brainHalves.awake}
      opacity={0.35}
    />
    {Array.from({ length: GRAINS }, (_, grain) => {
      const start = random(`${seed}-grain-${grain}`);
      const along = (start + flow) % 1;
      return (
        <circle
          key={grain}
          cx={x + 20 + along * (width - 40)}
          cy={
            y + height / 2 + height * 0.22 * Math.sin(along * 12 + grain * 1.7)
          }
          r={14}
          fill={ink.tag}
        />
      );
    })}
  </SvgLayer>
);
