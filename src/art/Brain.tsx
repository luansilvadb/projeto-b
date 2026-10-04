import { palette, shape } from "../design/tokens";

type BrainProps = {
  readonly width: number;
  readonly color?: string;
  /** Contorno tracejado: o cérebro que não está lá. */
  readonly dashed?: boolean;
  /**
   * Desenha as dobras, o cerebelo e o tronco. Sem eles o contorno pequeno lê
   * como nuvem; com eles, não sobra espaço para pôr nada dentro do contorno.
   */
  readonly folds?: boolean;
  /** Preenche o cérebro: é o corpo de um personagem, e não só um contorno. */
  readonly fill?: string;
  /** Os olhos do cérebro personificado: a cor do olho e a da pupila. */
  readonly eyes?: readonly [string, string];
};

const VIEW_WIDTH = 200;
// Sulcos do córtex, as estrias do cerebelo e o tronco, que desce por baixo.
const FOLDS =
  "M 62 36 C 80 48 70 66 90 76 M 112 28 C 102 46 122 58 114 78 M 36 86 C 58 76 84 96 112 96 M 146 42 C 156 56 146 70 160 84 M 128 118 C 140 112 156 112 166 116";
const STEM = "M 108 122 C 106 136 110 148 116 158";

/** Contorno de um cérebro visto de lado. */
export const Brain: React.FC<BrainProps> = ({
  width,
  color = palette.paper,
  dashed = false,
  folds = false,
  fill,
  eyes,
}) => {
  // Traço e tracejado em pixels do quadro, qualquer que seja o tamanho do desenho.
  const toView = VIEW_WIDTH / width;

  return (
    <svg
      width={width}
      height={width * 0.8}
      viewBox="0 0 200 160"
      overflow="visible"
    >
      {fill ? (
        <path
          d="M 40 120 C 10 115 5 75 30 55 C 30 25 70 10 95 20 C 120 5 165 15 175 45 C 198 60 195 100 170 112 C 160 135 120 135 110 120 C 90 135 55 135 40 120 Z"
          fill={fill}
        />
      ) : null}
      {folds ? (
        <g
          fill="none"
          stroke={color}
          strokeLinecap="round"
          strokeDasharray={dashed ? `${14 * toView} ${12 * toView}` : undefined}
        >
          <path d={FOLDS} strokeWidth={shape.stroke.regular * toView * 0.6} />
          <path d={STEM} strokeWidth={shape.stroke.regular * toView} />
        </g>
      ) : null}
      <path
        d="M 40 120 C 10 115 5 75 30 55 C 30 25 70 10 95 20 C 120 5 165 15 175 45 C 198 60 195 100 170 112 C 160 135 120 135 110 120 C 90 135 55 135 40 120 Z"
        fill="none"
        stroke={color}
        strokeWidth={shape.stroke.regular * toView}
        strokeDasharray={dashed ? `${28 * toView} ${22 * toView}` : undefined}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* De olhos arregalados: a pupila pequena no meio do olho grande. */}
      {eyes
        ? [72, 128].map((x) => (
            <g key={x}>
              <circle cx={x} cy={78} r={17} fill={eyes[0]} />
              <circle cx={x} cy={80} r={7} fill={eyes[1]} />
            </g>
          ))
        : null}
    </svg>
  );
};

type BrainTopProps = {
  readonly width: number;
  /** Atividade de cada hemisfério, de 0 (dormindo) a 1 (acordado). */
  readonly left: number;
  readonly right: number;
};

const HEMISPHERE =
  "M -8 -110 C -78 -110 -92 -40 -92 5 C -92 70 -62 110 -8 110 Z";
const TOP_FOLDS =
  "M -30 -70 Q -60 -40 -34 -12 M -62 10 Q -30 30 -56 62 M -24 40 Q -40 70 -22 88";

/** Cérebro visto de cima, com os dois hemisférios separados. */
export const BrainTop: React.FC<BrainTopProps> = ({ width, left, right }) => (
  <svg width={width} height={width * 1.2} viewBox="-100 -120 200 240">
    {[left, right].map((activity, side) => (
      <g key={side} transform={side === 0 ? undefined : "scale(-1 1)"}>
        <path
          d={HEMISPHERE}
          fill={palette.ocean.base}
          fillOpacity={0.2 + 0.8 * activity}
          stroke={palette.ocean.light}
          strokeWidth={3}
        />
        <path
          d={TOP_FOLDS}
          fill="none"
          stroke={palette.ocean.dark}
          strokeWidth={5}
          strokeLinecap="round"
          opacity={0.3 + 0.7 * activity}
        />
      </g>
    ))}
  </svg>
);
