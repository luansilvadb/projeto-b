import { wave } from "../../../components/Idle";
import { idea, ink } from "../palette";

/**
 * O que a pessoa segura, nas unidades do desenho dela: vão em `held` da Person.
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
