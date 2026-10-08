import { Person, Shoe, type PersonColors } from "../../../art/Person";
import { taperPath, type Point } from "../../../art/shapes";
import { wave } from "../../../components/Idle";
import { idea, ink, lab } from "../palette";

/**
 * A mesa do café, com alguém sentado depois de uma noite em claro. Volta em
 * mais de um bloco: quem está sentado e quão caído está são parâmetros.
 */

// A figura da pessoa cabe numa caixa de 400 × 650, com o chão entre os pés na origem.
const UNIT = 650;
// O tampo da mesa, a altura do quadril de quem está sentado e o ponto em que o tronco dobra.
const TABLE = { x: -60, half: 400, top: -246, thick: 34 };
const HIP: Point = [0, -180];
// Quanto o corpo tomba para o lado quando a cabeça chega à mesa, em graus.
const FALL = 58;
// Onde as mãos pousam no tampo, em unidades da figura em pé.
const HANDS = { front: [-176, -268], back: [64, -268] } as const;
const MUG = { x: 236, y: TABLE.top };

type CoffeeTableProps = {
  /** Quem está sentado: as cores da pessoa (a pessoa "você", Gardner, um freguês). */
  readonly colors: PersonColors;
  /** Quão caído está: 0, sentado e sonolento; 1, a cabeça pousada na mesa, ao lado da xícara, dormindo. */
  readonly slump?: number;
  /** Altura que a pessoa teria em pé, em pixels do quadro: dá o tamanho de tudo. */
  readonly height?: number;
  /** O matiz do fundo liso: dá a cor da cadeira e da sombra de contato. */
  readonly hue: keyof typeof idea;
  /** Tempo em segundos, para o vapor da xícara subir. */
  readonly seconds?: number;
  /** A piscada de quem ainda está acordado, de 0 a 1. */
  readonly blink?: number;
  /** A respiração: a altura do tronco num instante, em volta de 1. Sem valor, ele não respira. */
  readonly breath?: number;
  /** Quanto a xícara treme, em graus: a batida da cabeça no tampo. */
  readonly mugShake?: number;
  /** O vapor nasce e some aos poucos em cada ciclo, em vez de recomeçar de uma vez. */
  readonly softSteam?: boolean;
  /**
   * Se o rosto já é o de quem dorme. Sem valor, ele troca sozinho quando a
   * cabeça passa de meio caminho; com valor, é a cena quem escolhe o quadro da
   * troca, para escondê-la (a pálpebra já fechada por `blink`, a cabeça
   * batendo no tampo).
   */
  readonly asleep?: boolean;
};

/** Um ponto do quadro (mesa) visto pelo corpo tombado: onde a mão precisa estar, no desenho da pessoa, para pousar ali. */
const seenByBody = (point: Point, degrees: number): Point => {
  const angle = (degrees * Math.PI) / 180;
  const dx = point[0] - HIP[0];
  const dy = point[1] - HIP[1];
  return [
    HIP[0] + dx * Math.cos(angle) - dy * Math.sin(angle),
    HIP[1] + dx * Math.sin(angle) + dy * Math.cos(angle),
  ];
};

/**
 * A pessoa sentada à mesa do café. O ponto de referência é o chão
 * sob a cadeira: ponha com `<Place x y>` (a peça não tem tamanho próprio).
 * A mesa cobre o corpo da cintura para baixo; as canelas e os sapatos
 * aparecem por baixo do tampo.
 */
export const CoffeeTable: React.FC<CoffeeTableProps> = ({
  colors,
  slump = 0,
  height = 620,
  hue,
  seconds = 0,
  blink = 0,
  breath = 1,
  mugShake = 0,
  softSteam = false,
  asleep: dozing,
}) => {
  const u = height / UNIT;
  const fall = FALL * slump;
  const asleep = dozing ?? slump > 0.6;
  // Tudo o que é desenhado em SVG usa as unidades da figura, com a origem no chão.
  const box = { x: -620, y: -700, width: 1240, height: 760 };
  const svg = {
    width: box.width * u,
    height: box.height * u,
    viewBox: `${box.x} ${box.y} ${box.width} ${box.height}`,
    style: {
      position: "absolute",
      left: box.x * u,
      top: box.y * u,
      overflow: "visible",
    },
  } as const;
  const steam = (seconds * 0.6) % 1;

  return (
    <div style={{ position: "relative", width: 0, height: 0 }}>
      {/* A sombra de contato e o encosto da cadeira, atrás de tudo. */}
      <svg {...svg}>
        <ellipse
          cx={TABLE.x}
          cy={4}
          rx={TABLE.half * 0.9}
          ry={26}
          fill={idea[hue].contact}
          opacity={0.24}
        />
        <rect
          x={-104}
          y={-330}
          width={208}
          height={170}
          rx={30}
          fill={idea[hue].contact}
        />
        <rect
          x={78}
          y={-190}
          width={24}
          height={190}
          rx={12}
          fill={idea[hue].contact}
        />
      </svg>

      {/* O corpo, cortado na altura do tampo: sentado, o que fica abaixo da mesa é desenhado à parte. */}
      <div
        style={{
          position: "absolute",
          left: -700 * u,
          top: -800 * u,
          width: 1400 * u,
          height: (800 + TABLE.top + TABLE.thick / 2) * u,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 700 * u,
            top: 800 * u,
            // O tronco dobra no quadril e a cabeça cai para o lado da xícara.
            transformOrigin: `0px ${HIP[1] * u}px`,
            rotate: `${-fall}deg`,
            scale: `1 ${breath}`,
          }}
        >
          <div style={{ position: "absolute", translate: "-50% -100%" }}>
            <Person
              height={height}
              colors={colors}
              expression={asleep ? "asleep" : "sleepy"}
              blink={blink}
              frontArm={{ hand: seenByBody(HANDS.front, fall), bend: 30 }}
              backArm={{ hand: seenByBody(HANDS.back, fall), bend: 40 }}
            />
          </div>
        </div>
      </div>

      {/* Do tampo para baixo: as canelas e os sapatos de quem está sentado, entre os pés da mesa; em cima do tampo, a xícara. */}
      <svg {...svg}>
        <path
          d={taperPath([44, TABLE.top + 20], [52, -120], [56, -34], 58, 44)}
          fill={colors.pantsShade}
        />
        <Shoe at={[56, 0]} toe={1} long={56} fill={colors.shoeShade} />
        <path
          d={taperPath([-44, TABLE.top + 20], [-50, -120], [-52, -34], 58, 44)}
          fill={colors.pants}
        />
        <Shoe at={[-52, 0]} toe={-1} long={42} fill={colors.shoe} />
        {[-1, 1].map((side) => (
          <path
            key={side}
            d={taperPath(
              [TABLE.x + side * (TABLE.half - 70), TABLE.top + 10],
              [TABLE.x + side * (TABLE.half - 56), -120],
              [TABLE.x + side * (TABLE.half - 44), -4],
              34,
              22,
            )}
            fill={lab.platformShade}
          />
        ))}
        <rect
          x={TABLE.x - TABLE.half}
          y={TABLE.top}
          width={TABLE.half * 2}
          height={TABLE.thick}
          rx={TABLE.thick / 2}
          fill={ink.ring}
        />
        <rect
          x={TABLE.x - TABLE.half + 30}
          y={TABLE.top + TABLE.thick - 12}
          width={TABLE.half * 2 - 60}
          height={12}
          rx={6}
          fill={lab.platformShade}
        />
        <g transform={`translate(${MUG.x} ${MUG.y}) rotate(${mugShake})`}>
          <path
            d="M34,-58 C70,-58 70,-18 34,-18"
            fill="none"
            stroke={ink.tagEdge}
            strokeWidth={13}
          />
          <rect x={-40} y={-80} width={80} height={80} rx={16} fill={ink.tag} />
          <rect
            x={-40}
            y={-80}
            width={26}
            height={80}
            rx={13}
            fill={ink.tagEdge}
          />
          <path
            d="M-12,-98 C-24,-116 4,-126 -8,-148 M18,-98 C6,-116 34,-126 22,-148"
            fill="none"
            stroke={ink.ring}
            strokeWidth={8}
            strokeLinecap="round"
            transform={`translate(${4 * wave(seconds, 1.3)} ${-10 * steam})`}
            opacity={
              softSteam ? 0.9 * Math.sin(Math.PI * steam) : 0.9 - 0.5 * steam
            }
          />
        </g>
      </svg>
    </div>
  );
};
