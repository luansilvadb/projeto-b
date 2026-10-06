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
import { mix } from "../../../components/timing";

/**
 * Quem dorme, dorme assim: na cama, de lado, com a cabeça no travesseiro e o
 * corpo sob o cobertor. É o único jeito de dormir das pessoas do vídeo
 * (decisão do usuário depois da crítica de quadros): antes havia três, e a
 * figura em pé abraçada ao travesseiro lia como alguém acordado de olhos
 * fechados.
 */

type Hue = keyof typeof idea;

/** Dormindo; de pálpebra a meio, quando alguém a chama; ou bocejando, ao acordar. */
type BedState = "asleep" | "sleepy" | "waking";

/**
 * O cobertor: coral para a pessoa "você", o acento dos planos dela; azul-lilás
 * para Gardner, para a cama dele não ser a dela; verde, o da blusa dele, para
 * o participante de 1924, que de azul era Gardner dormindo.
 */
type Blanket = "coral" | "blue" | "green";

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
// Os braços de quem está deitada: ao longo do corpo. A mão na cintura, deitada, vira uma alça sobre o
// cobertor, e o braço de cima fica mais para dentro, ou a mão dele aparece como um caroço na borda.
const LYING_ARMS = {
  front: { hand: [-112, -200], bend: 6 },
  back: { hand: [78, -170], bend: 2 },
} as const;
// Os de quem está em pé: os do desenho parado da pessoa.
const STANDING_ARMS = {
  front: { hand: [-136, -214], bend: 26 },
  back: { hand: [100, -214], bend: 73 },
} as const;
// O cobertor dobrado no pé da cama: a fração do comprimento e da altura que sobra dele.
const FOLDED = { length: 0.2, height: 0.5 };

const armBetween = (
  lying: (typeof LYING_ARMS)["front" | "back"],
  up: (typeof STANDING_ARMS)["front" | "back"],
  t: number,
) => ({
  hand: [
    mix(lying.hand[0], up.hand[0], t),
    mix(lying.hand[1], up.hand[1], t),
  ] as const,
  bend: mix(lying.bend, up.bend, t),
});

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
  /**
   * A respiração de quem dorme: a altura do corpo e do cobertor, em fração,
   * em volta de 1. O colchão e a cama ficam. Sem valor, parada.
   */
  readonly breath?: number;
  /** Quanto o cobertor já a cobre: 0 é dobrado no pé da cama, 1 é do peito aos pés, como sempre. */
  readonly cover?: number;
  /**
   * Quem ainda não se deitou: 1 é em pé na frente da cama, com os pés no chão
   * dela e o corpo no meio; 0 é deitada, como sempre. No caminho ela tomba de
   * costas para o travesseiro.
   */
  readonly standing?: number;
  /** Em pé, quanto o corpo pende para a frente, em graus. */
  readonly lean?: number;
  /** A pálpebra além da expressão, de 0 a 1: esconde a troca de rosto. */
  readonly blink?: number;
  /** A cama vazia, à espera de quem vai se deitar: sem ninguém nela. Por padrão, ocupada. */
  readonly occupied?: boolean;
  /** Quanto o "ZZZ" se desloca do lugar dele, em pixels do quadro: é por onde ele flutua. Por padrão, parado. */
  readonly snoreDrift?: readonly [number, number];
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
  breath = 1,
  cover: covered = 1,
  standing = 0,
  lean = 0,
  blink = 0,
  occupied = true,
  snoreDrift = [0, 0],
}) => {
  const mattress = BED.right - BED.left;
  const cover = BLANKETS[blanket];
  const side = headTo === "left" ? 1 : -1;
  const sleeper = !occupied ? null : (
    <div
      style={{
        position: "absolute",
        left: SLEEPER.x - ORIGIN.x + 5 * nudge,
        // Em pé, o meio do corpo fica a meia altura acima do chão.
        top: mix(SLEEPER.y - ORIGIN.y, -SLEEPER.height / 2, standing),
        translate: "-50% -50%",
        rotate: `${mix(-90, lean, standing) + 0.8 * nudge}deg`,
        scale: standing > 0 ? undefined : `${breath} 1`,
      }}
    >
      <Person
        height={SLEEPER.height}
        colors={colors}
        expression={EXPRESSION[state]}
        blink={blink}
        frontArm={armBetween(LYING_ARMS.front, STANDING_ARMS.front, standing)}
        backArm={armBetween(LYING_ARMS.back, STANDING_ARMS.back, standing)}
      />
    </div>
  );

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
        {/* Deitada, ela fica entre o colchão e o cobertor; ainda de pé, na frente da cama inteira. */}
        {standing > 0.5 ? null : sleeper}
        <svg {...LAYER}>
          <g transform={TO_ORIGIN}>
            {/* O cobertor sobe e desce com a respiração, a partir da beira do colchão; dobrado, recolhe-se para o pé da cama e baixa. */}
            <g
              style={{
                transformOrigin: `${BED.right}px ${BED.top + 96}px`,
                scale: `${mix(FOLDED.length, 1, covered)} ${mix(FOLDED.height, 1, covered) * breath}`,
              }}
            >
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
          </g>
        </svg>
        {standing > 0.5 ? sleeper : null}
      </div>
      {snoreAt === undefined ? null : (
        <div
          style={{
            position: "absolute",
            left: side * SNORE[0] * scale,
            top: SNORE[1] * scale,
            translate: `calc(-50% + ${snoreDrift[0]}px) calc(-50% + ${snoreDrift[1]}px)`,
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
