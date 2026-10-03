import { wave } from "../../../components/Idle";
import { idea, ink } from "../palette";

/**
 * O que a pessoa segura, nas unidades do desenho dela: vão em `held` da Person.
 * Os três objetos da cena do terço da vida; o travesseiro volta na rua da loja.
 */

type MugProps = {
  /** Tempo em segundos, para o vapor subir. */
  readonly seconds: number;
};

/** Uma caneca na mão, com o vapor subindo. */
export const Mug: React.FC<MugProps> = ({ seconds }) => (
  <g transform="translate(-168 -352)">
    <rect x={-34} y={-30} width={68} height={74} rx={14} fill={ink.tag} />
    <path
      d="M-34,-6 C-66,-6 -66,30 -34,30"
      fill="none"
      stroke={ink.tag}
      strokeWidth={12}
    />
    <path
      d="M-12,-46 C-22,-62 2,-70 -8,-90 M14,-46 C4,-62 28,-70 18,-90"
      fill="none"
      stroke={idea.peach.spot}
      strokeWidth={7}
      strokeLinecap="round"
      transform={`translate(${4 * wave(seconds, 1.3)} ${-8 * ((seconds * 0.6) % 1)})`}
      opacity={0.9 - 0.5 * ((seconds * 0.6) % 1)}
    />
  </g>
);

/** Um livro aberto, seguro com as duas mãos. */
export const Book: React.FC = () => (
  <g transform="translate(0 -300)">
    <path
      d="M-96,-52 L0,-34 L96,-52 L96,34 L0,52 L-96,34 Z"
      fill={ink.tagEdge}
    />
    <path d="M-86,-48 L0,-32 L0,44 L-86,28 Z" fill={idea.peach.spot} />
    <path d="M86,-48 L0,-32 L0,44 L86,28 Z" fill={idea.peach.top} />
  </g>
);

/** O travesseiro, abraçado. */
export const Pillow: React.FC = () => (
  <g transform="rotate(-12 0 -270)">
    <rect x={-92} y={-340} width={184} height={150} rx={46} fill={ink.ring} />
    <path
      d="M-92,-240 Q0,-214 92,-240 L92,-236 Q92,-190 46,-190 L-46,-190 Q-92,-190 -92,-236 Z"
      fill={idea.peach.top}
    />
  </g>
);

/** Como a pessoa segura o travesseiro: as duas mãos em volta dele. */
export const HUGGING = {
  frontArm: { hand: [40, -250] as [number, number], bend: 50 },
  backArm: { hand: [-30, -230] as [number, number], bend: 40 },
} as const;
