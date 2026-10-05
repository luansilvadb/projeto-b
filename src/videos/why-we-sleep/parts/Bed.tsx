import { Person, type PersonColors } from "../../../art/Person";
import type { Point } from "../../../art/shapes";
import { Onomatopoeia } from "../../../components/Onomatopoeia";
import {
  chalkboard,
  idea,
  ink,
  personInPajamas,
  puzzle,
  signs,
  sound,
} from "../palette";

/**
 * Quem dorme, dorme assim: na cama, de lado, com a cabeça no travesseiro e o
 * corpo sob o cobertor. É o único jeito de dormir das pessoas do vídeo
 * (decisão do usuário depois da crítica de quadros): antes havia três, e a
 * figura em pé abraçada ao travesseiro lia como alguém acordado de olhos
 * fechados.
 */

type Hue = keyof typeof idea;

/** Dormindo; de pálpebra a meio, quando alguém a chama; ou bocejando, ao acordar. */
export type BedState = "asleep" | "sleepy" | "waking";

/**
 * O cobertor: coral para a pessoa "você", o acento dos planos dela; azul-lilás
 * para Gardner, para a cama dele não ser a dela; verde, o da blusa dele, para
 * o participante de 1924, que de azul era Gardner dormindo.
 */
export type Blanket = "coral" | "blue" | "green";

const BLANKETS: Record<
  Blanket,
  { readonly top: string; readonly edge: string; readonly fold: string }
> = {
  coral: { top: ink.tag, edge: ink.tagEdge, fold: idea.peach.spot },
  blue: {
    top: puzzle.pieces[1],
    edge: puzzle.pieceShade,
    fold: personInPajamas.topLight,
  },
  green: {
    top: signs.seal[1],
    edge: idea.mint.contact,
    fold: idea.mint.top,
  },
};

// A cama, nas medidas em que foi desenhada (as de `jellyfish-platform`): o chão sob o meio dela é a referência.
const BED = { left: 380, right: 1430, top: 742, floor: 930 };
const ORIGIN = { x: 905, y: 930 };
const SLEEPER = { x: 900, y: 640, height: 800 };
// O meio da cabeça no travesseiro e o ombro de cima, a partir do chão sob o meio da cama.
const HEAD: Point = [-196, -290];
const SHOULDER: Point = [-21, -390];
// O "ZZZ" sobe da cabeça, para o lado da cabeceira.
const SNORE: Point = [-265, -680];

/** De ponta a ponta, da cabeceira ao pé, e da ponta da cabeceira ao chão, com `scale` 1. */
export const BED_SIZE = { width: 1150, height: 440 };

type Spot = {
  readonly x: number;
  readonly y: number;
  readonly scale?: number;
  readonly headTo?: "left" | "right";
};

const spot = (offset: Point, { x, y, scale = 1, headTo = "left" }: Spot) => ({
  x: x + (headTo === "left" ? 1 : -1) * offset[0] * scale,
  y: y + offset[1] * scale,
});

/** Onde fica o meio da cabeça de quem dorme, no quadro: para ligar a ela uma lente ou uma etiqueta. */
export const bedHead = (bed: Spot) => spot(HEAD, bed);

/** Onde fica o ombro de cima, no quadro: é por ele que uma mão a sacode. */
export const bedShoulder = (bed: Spot) => spot(SHOULDER, bed);

type BedProps = {
  /** O chão sob o meio da cama, no quadro. */
  readonly x: number;
  readonly y: number;
  /** Tamanho: 1 dá uma cama de 1150 px de ponta a ponta. */
  readonly scale?: number;
  /** As cores de quem dorme. */
  readonly colors: PersonColors;
  /** O fundo liso do plano: dá a cor do estrado e da sombra no chão. */
  readonly hue: Hue;
  /** O lado da cabeceira. */
  readonly headTo?: "left" | "right";
  readonly state?: BedState;
  readonly blanket?: Blanket;
  /** Quadro em que o "ZZZ" sobe; sem valor, não há. */
  readonly snoreAt?: number;
  /** Altura da primeira letra do "ZZZ", em pixels do quadro: ele não encolhe com a cama. */
  readonly snoreSize?: number;
  /** O sacudir de quem a chama, de -1 a 1: só o corpo balança, a cama fica. */
  readonly nudge?: number;
  /** Sem a sombra no chão, quando o plano já desenha a dele. */
  readonly shadow?: boolean;
};

const EXPRESSION = {
  asleep: "asleep",
  sleepy: "sleepy",
  waking: "yawning",
} as const;

const LAYER = {
  width: 1,
  height: 1,
  viewBox: "0 0 1 1",
  overflow: "visible",
  style: { position: "absolute", left: 0, top: 0 },
} as const;
const TO_ORIGIN = `translate(${-ORIGIN.x} ${-ORIGIN.y})`;

/**
 * Alguém dormindo na cama, de lado: a cabeceira, o colchão, o travesseiro, a
 * figura deitada e, por cima, o cobertor do peito aos pés, que esconde as
 * pernas retas e os sapatos (a pessoa não tem pose deitada: é o desenho em pé,
 * girado, e é o cobertor que faz dele alguém deitado).
 */
export const Bed: React.FC<BedProps> = ({
  x,
  y,
  scale = 1,
  colors,
  hue,
  headTo = "left",
  state = "asleep",
  blanket = "coral",
  snoreAt,
  snoreSize = 150,
  nudge = 0,
  shadow = true,
}) => {
  const mattress = BED.right - BED.left;
  const cover = BLANKETS[blanket];
  const side = headTo === "left" ? 1 : -1;

  return (
    <div style={{ position: "absolute", left: x, top: y, width: 0, height: 0 }}>
      {/* A cama inteira é espelhada quando a cabeceira fica à direita; o "ZZZ", que é texto, fica de fora. */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: 0,
          height: 0,
          scale: `${side * scale} ${scale}`,
        }}
      >
        <svg {...LAYER}>
          <g transform={TO_ORIGIN}>
            {shadow ? (
              <ellipse
                cx={ORIGIN.x}
                cy={BED.floor + 4}
                rx={(mattress + 160) / 2}
                ry={38}
                fill={idea[hue].contact}
                opacity={0.24}
              />
            ) : null}
            {/* A cabeceira, o pé da cama e o estrado. */}
            <rect
              x={BED.left - 60}
              y={BED.top - 250}
              width={84}
              height={BED.floor - BED.top + 250}
              rx={30}
              fill={chalkboard.frame}
            />
            <rect
              x={BED.right - 20}
              y={BED.top + 20}
              width={60}
              height={BED.floor - BED.top - 20}
              rx={24}
              fill={chalkboard.frame}
            />
            <rect
              x={BED.left}
              y={BED.top + 96}
              width={mattress}
              height={50}
              rx={12}
              fill={idea[hue].contact}
            />
            {/* O colchão e o travesseiro. */}
            <rect
              x={BED.left}
              y={BED.top}
              width={mattress}
              height={112}
              rx={40}
              fill={ink.ring}
            />
            <rect
              x={BED.left}
              y={BED.top + 68}
              width={mattress}
              height={44}
              rx={22}
              fill={idea[hue].spot}
            />
            <rect
              x={BED.left + 40}
              y={BED.top - 92}
              width={360}
              height={130}
              rx={60}
              fill={idea.peach.spot}
            />
            <rect
              x={BED.left + 40}
              y={BED.top - 16}
              width={360}
              height={54}
              rx={27}
              fill={idea.peach.top}
            />
          </g>
        </svg>
        <div
          style={{
            position: "absolute",
            left: SLEEPER.x - ORIGIN.x + 5 * nudge,
            top: SLEEPER.y - ORIGIN.y,
            translate: "-50% -50%",
            rotate: `${-90 + 0.8 * nudge}deg`,
          }}
        >
          <Person
            height={SLEEPER.height}
            colors={colors}
            expression={EXPRESSION[state]}
            // Os braços ao longo do corpo: a mão na cintura, deitada, vira uma alça sobre o cobertor.
            // O de cima fica mais para dentro, ou a mão dele aparece como um caroço na borda do cobertor.
            frontArm={{ hand: [-112, -200], bend: 6 }}
            backArm={{ hand: [78, -170], bend: 2 }}
          />
        </div>
        <svg {...LAYER}>
          <g transform={TO_ORIGIN}>
            {/* O cobertor, do peito aos pés, com o volume dos pés no fim. */}
            <path
              d={`M944,${BED.top - 150} C962,${BED.top - 224} 1040,${BED.top - 240} 1120,${BED.top - 228} C1180,${BED.top - 220} 1228,${BED.top - 224} 1258,${BED.top - 252} C1288,${BED.top - 276} 1330,${BED.top - 264} 1346,${BED.top - 224} C1378,${BED.top - 140} 1428,${BED.top - 60} ${BED.right + 4},${BED.top + 16} L${BED.right + 4},${BED.top + 70} Q${BED.right + 4},${BED.top + 96} ${BED.right - 24},${BED.top + 96} L984,${BED.top + 96} Q944,${BED.top + 96} 944,${BED.top + 56} Z`}
              fill={cover.top}
            />
            <path
              d={`M944,${BED.top + 44} L${BED.right + 4},${BED.top + 44} L${BED.right + 4},${BED.top + 70} Q${BED.right + 4},${BED.top + 96} ${BED.right - 24},${BED.top + 96} L984,${BED.top + 96} Q944,${BED.top + 96} 944,${BED.top + 56} Z`}
              fill={cover.edge}
            />
            {/* A dobra do cobertor, no peito. */}
            <path
              d={`M944,${BED.top - 150} C962,${BED.top - 224} 1020,${BED.top - 238} 1060,${BED.top - 236} C1010,${BED.top - 200} 1000,${BED.top - 120} 1002,${BED.top + 44} L944,${BED.top + 44} Z`}
              fill={cover.fold}
            />
          </g>
        </svg>
      </div>
      {snoreAt === undefined ? null : (
        <div
          style={{
            position: "absolute",
            left: side * SNORE[0] * scale,
            top: SNORE[1] * scale,
            translate: "-50% -50%",
          }}
        >
          <Onomatopoeia
            at={snoreAt}
            size={snoreSize}
            color={sound.warm}
            edge={sound.edge}
            tilt={12}
            fade={0.22}
          >
            ZZZ
          </Onomatopoeia>
        </div>
      )}
    </div>
  );
};
