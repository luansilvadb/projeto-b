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
  // Peixe pequeno: o mesmo perfil da testemunha da lagoa.
  fish: {
    view: [220, 130],
    body: [
      "M8,66 C8,30 50,10 96,10 C120,10 142,18 158,32 L212,6 Q196,62 212,122 L158,98 C142,112 120,122 96,122 C50,122 8,102 8,66 Z",
      "M62,18 Q96,-20 136,24 Z",
    ],
    eye: [48, 56, 9],
  },
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
  // Golfinho: bico, testa redonda, nadadeira curva e cauda em meia-lua.
  dolphin: {
    view: [300, 150],
    body: [
      "M4,86 L40,78 C48,54 84,36 128,34 C140,14 162,4 182,4 C174,18 174,30 184,40 C214,48 238,62 258,78 C272,74 286,62 296,48 C294,70 292,84 296,104 C282,98 268,92 256,92 C222,112 170,120 124,114 C122,128 110,140 94,142 C100,130 100,120 96,110 C70,104 50,96 40,92 Z",
    ],
    eye: [66, 76, 6],
  },
  // Fragata planando: asas longas e dobradas, cauda em forquilha, bico para a esquerda.
  frigatebird: {
    view: [340, 150],
    body: [
      "M2,62 C44,34 92,22 128,28 C142,30 152,40 158,52 L124,62 L160,66 C166,62 176,60 184,62 C196,40 216,26 240,24 C276,22 310,36 338,62 C300,52 264,52 234,60 C214,66 200,78 194,92 L214,146 L176,112 L150,146 L160,94 C150,76 134,64 112,58 C82,52 44,54 2,62 Z",
    ],
    eye: [158, 58, 4],
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
  // Predador: um peixe grande e comprido, de nadadeira alta e cauda em foice.
  predator: {
    view: [600, 220],
    body: [
      "M20,110 C60,70 120,60 180,62 L215,20 L250,60 C330,58 420,70 500,96 C530,84 560,60 590,40 C582,80 578,100 580,118 C584,140 590,170 596,196 C560,172 532,150 500,138 C440,160 360,170 300,166 L270,204 L250,164 C170,160 80,150 20,110 Z",
    ],
    eye: [86, 98, 8],
  },
} satisfies Record<string, Shape>;

export type SilhouetteKind = keyof typeof SHAPES;

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
