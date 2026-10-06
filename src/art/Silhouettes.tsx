type SilhouetteProps = {
  /** Comprimento do bicho, em pixels do quadro. */
  readonly width: number;
  readonly color: string;
  /** Cor do olho. Sem ela, a silhueta fica cega: uma sombra. */
  readonly eye?: string;
  /** Tom um pouco mais escuro, para a orelha e outras partes que ficam por cima do corpo. */
  readonly shade?: string;
};

type Shape = {
  /** Caixa do desenho. O bicho está de perfil, olhando para a esquerda. */
  readonly view: readonly [number, number];
  /** As partes do contorno, todas na cor do corpo. */
  readonly body: readonly string[];
  /** Partes por cima do corpo, no tom mais escuro. */
  readonly detail?: readonly string[];
  /** Centro e raio do olho. */
  readonly eye: readonly [number, number, number];
};

const SHAPES = {
  // Elefanta: testa alta, orelha grande, tromba caída.
  elephant: {
    view: [300, 220],
    body: [
      "M36,208 C40,170 30,150 28,120 C24,84 40,44 80,34 C104,28 124,34 138,46 C170,28 232,30 262,66 C282,90 280,120 276,150 L282,208 L244,208 L240,164 C222,172 196,172 180,166 L176,208 L138,208 L136,150 C116,150 98,142 90,128 C80,140 74,160 72,178 C70,194 62,206 50,210 Z",
    ],
    detail: [
      "M100,56 C74,54 62,90 80,118 C98,130 122,114 122,88 C122,70 112,58 100,56 Z",
    ],
    eye: [58, 80, 7],
  },
  // Camundongo: corpo em gota, orelha redonda, cauda fina.
  mouse: {
    view: [260, 130],
    body: [
      "M6,92 C18,72 40,56 66,50 C104,38 204,56 214,96 C230,96 244,90 254,78 L258,84 C248,100 232,108 214,108 C208,118 196,124 180,124 L60,124 C36,124 16,112 6,92 Z",
      "M62,52 C60,30 80,16 98,22 C112,28 118,44 112,58 Z",
    ],
    detail: ["M74,46 C74,34 86,28 96,32 C104,36 106,46 102,54 Z"],
    eye: [44, 82, 6],
  },
} satisfies Record<string, Shape>;

type SilhouetteKind = keyof typeof SHAPES;

type Props = SilhouetteProps & { readonly kind: SilhouetteKind };

/**
 * Bicho em silhueta, de perfil, olhando para a esquerda: a forma de figurante,
 * numa cor só e com um olho. O centro do desenho é o centro da caixa.
 */
export const Silhouette: React.FC<Props> = ({
  kind,
  width,
  color,
  eye,
  shade,
}) => {
  const shape: Shape = SHAPES[kind];
  const [viewWidth, viewHeight] = shape.view;

  return (
    <svg
      width={width}
      height={(width * viewHeight) / viewWidth}
      viewBox={`0 0 ${viewWidth} ${viewHeight}`}
      overflow="visible"
    >
      {shape.body.map((path) => (
        <path key={path} d={path} fill={color} />
      ))}
      {shade
        ? shape.detail?.map((path) => <path key={path} d={path} fill={shade} />)
        : null}
      {eye ? (
        <circle
          cx={shape.eye[0]}
          cy={shape.eye[1]}
          r={shape.eye[2]}
          fill={eye}
        />
      ) : null}
    </svg>
  );
};
