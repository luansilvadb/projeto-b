import { AbsoluteFill, random } from "remotion";
import { Person, type Expression } from "../../../art/Person";
import { breath, wave } from "../../../components/Idle";
import { Place } from "../../../components/Place";
import { Wall } from "../../../components/Camera";
import { SvgLayer } from "../../../components/SvgLayer";
import { apron, goods, person, shopInside } from "../palette";

/** O chão da loja, onde tudo pousa. */
export const FLOOR_Y = 900;
/** A entrada, à esquerda: a porta de enrolar vista por dentro. */
export const ENTRANCE = { x: 110, y: 300, width: 300, height: 600 };
/** As prateleiras, no meio: três tábuas. */
export const SHELVES = { x: 600, width: 640, ys: [470, 640, 810] };
/** O depósito dos fundos, à direita: um vão escuro com as tábuas dele. */
export const STOCKROOM = { x: 1420, y: 300, width: 380, height: 600 };
export const STOCK_SHELVES = [470, 640, 810] as const;
export const CRATE = { width: 120, height: 96 };
const SLAT = 30;
const BLEED = 800;

type Time = keyof typeof shopInside;

type ShopInsideProps = {
  readonly time: Time;
  /** O que há dentro da loja: caixas, mercadoria, a lojista. */
  readonly children?: React.ReactNode;
};

/**
 * A loja vista por dentro: a porta de enrolar à esquerda, as prateleiras no
 * meio e o depósito dos fundos à direita. De dia a porta está erguida e a
 * parede é clara; de porta baixada, só a lâmpada ilumina.
 */
export const ShopInside: React.FC<ShopInsideProps> = ({ time, children }) => {
  const colors = shopInside[time];
  const open = time === "day";

  return (
    <AbsoluteFill>
      <Wall>
        {/* A parede e o piso passam do quadro para os lados, para a câmera poder chegar perto das pontas da loja. */}
        <AbsoluteFill
          style={{
            left: -BLEED,
            width: 1920 + 2 * BLEED,
            background: `linear-gradient(${colors.wall[0]}, ${colors.wall[1]})`,
          }}
        />
        {colors.lamp ? (
          <AbsoluteFill
            style={{
              background: `radial-gradient(ellipse 60% 70% at 50% 0%, ${colors.lamp}66, transparent)`,
            }}
          />
        ) : null}
      </Wall>
      <SvgLayer>
        <rect
          x={-BLEED}
          y={FLOOR_Y}
          width={1920 + 2 * BLEED}
          height={1080 - FLOOR_Y + BLEED}
          fill={colors.floor}
        />
        {/* A entrada: aberta, mostra a rua clara; fechada, as lâminas da porta de enrolar. */}
        <rect {...ENTRANCE} rx={16} fill={colors.woodShade} />
        <rect
          x={ENTRANCE.x + 18}
          y={ENTRANCE.y + 18}
          width={ENTRANCE.width - 36}
          height={ENTRANCE.height - 18}
          fill={open ? colors.wall[0] : colors.shutter}
        />
        {open
          ? null
          : Array.from(
              { length: Math.floor((ENTRANCE.height - 18) / SLAT) },
              (_, slat) => (
                <rect
                  key={slat}
                  x={ENTRANCE.x + 18}
                  y={ENTRANCE.y + 18 + slat * SLAT + SLAT - 6}
                  width={ENTRANCE.width - 36}
                  height={6}
                  fill={colors.shutterLine}
                />
              ),
            )}
        {/* As prateleiras: dois montantes e três tábuas. */}
        {[SHELVES.x - 14, SHELVES.x + SHELVES.width - 14].map((x) => (
          <rect
            key={x}
            x={x}
            y={SHELVES.ys[0] - 150}
            width={28}
            height={FLOOR_Y - SHELVES.ys[0] + 150}
            rx={10}
            fill={colors.woodShade}
          />
        ))}
        {SHELVES.ys.map((y) => (
          <rect
            key={y}
            x={SHELVES.x - 30}
            y={y}
            width={SHELVES.width + 60}
            height={22}
            rx={11}
            fill={colors.wood}
          />
        ))}
        {/* O depósito dos fundos. */}
        <rect {...STOCKROOM} rx={16} fill={colors.woodShade} />
        <rect
          x={STOCKROOM.x + 18}
          y={STOCKROOM.y + 18}
          width={STOCKROOM.width - 36}
          height={STOCKROOM.height - 18}
          fill={colors.stockroom}
        />
        {STOCK_SHELVES.map((y) => (
          <rect
            key={y}
            x={STOCKROOM.x + 18}
            y={y}
            width={STOCKROOM.width - 36}
            height={16}
            fill={colors.woodShade}
          />
        ))}
      </SvgLayer>
      {children}
    </AbsoluteFill>
  );
};

/** O desenho de dentro da etiqueta de uma caixa: a lembrança que ela guarda. */
export type Memory = "face" | "path" | "star" | "note";

const MEMORIES: Record<Memory, React.ReactNode> = {
  face: (
    <>
      <circle r={20} fill="none" strokeWidth={6} />
      <circle cx={-7} cy={-4} r={3} />
      <circle cx={7} cy={-4} r={3} />
      <path d="M-8,7 q8,7 16,0" fill="none" strokeWidth={5} />
    </>
  ),
  path: <path d="M-22,16 q10,-34 22,-14 t22,-18" fill="none" strokeWidth={7} />,
  star: (
    <path d="M0,-22 L6,-7 L22,-7 L9,3 L14,19 L0,10 L-14,19 L-9,3 L-22,-7 L-6,-7 Z" />
  ),
  note: (
    <>
      <ellipse cx={-8} cy={14} rx={9} ry={7} />
      <path d="M0,14 L0,-20 L16,-14" fill="none" strokeWidth={6} />
    </>
  ),
};

type CrateProps = {
  /** O meio da base da caixa, em pixels do quadro. */
  readonly x: number;
  readonly y: number;
  readonly scale?: number;
  /** A etiqueta da caixa mostra a lembrança que ela guarda. */
  readonly memory?: Memory;
};

/** Uma caixa de mercadoria: o que chegou durante o dia. Vai dentro de um SvgLayer. */
export const Crate: React.FC<CrateProps> = ({ x, y, scale = 1, memory }) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`}>
    <rect
      x={-CRATE.width / 2}
      y={-CRATE.height}
      width={CRATE.width}
      height={CRATE.height}
      rx={10}
      fill={goods.crate}
    />
    <rect
      x={-CRATE.width / 2}
      y={-CRATE.height}
      width={CRATE.width}
      height={24}
      rx={10}
      fill={goods.crateShade}
    />
    {memory ? (
      <g
        transform={`translate(0 ${-CRATE.height / 2 + 10})`}
        fill={goods.crateShade}
        stroke={goods.crateShade}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={0}
      >
        <rect x={-34} y={-30} width={68} height={60} rx={8} fill={goods.tape} />
        <g transform="scale(0.95)">{MEMORIES[memory]}</g>
      </g>
    ) : (
      <rect
        x={-10}
        y={-CRATE.height}
        width={20}
        height={CRATE.height}
        fill={goods.tape}
        opacity={0.8}
      />
    )}
  </g>
);

type BroomProps = {
  /** A ponta de cima do cabo e a inclinação, em graus. */
  readonly x: number;
  readonly y: number;
  readonly tilt?: number;
  readonly length?: number;
};

/** A vassoura da faxina: o cabo e a piaçava. Vai dentro de um SvgLayer. */
export const Broom: React.FC<BroomProps> = ({
  x,
  y,
  tilt = 0,
  length = 420,
}) => (
  <g transform={`translate(${x} ${y}) rotate(${tilt})`}>
    <rect
      x={-9}
      y={0}
      width={18}
      height={length}
      rx={9}
      fill={goods.broomStick}
    />
    <path
      d={`M-26,${length - 10} L26,${length - 10} L62,${length + 110} L-62,${length + 110} Z`}
      fill={goods.broom}
    />
    <rect
      x={-30}
      y={length - 24}
      width={60}
      height={28}
      rx={8}
      fill={goods.broomStick}
    />
  </g>
);

type KeeperProps = {
  readonly x: number;
  readonly height?: number;
  readonly seconds: number;
  readonly expression?: Expression;
  /** Virada para a esquerda. */
  readonly flip?: boolean;
  readonly frontArm?: React.ComponentProps<typeof Person>["frontArm"];
  readonly backArm?: React.ComponentProps<typeof Person>["backArm"];
  /** O que ela carrega, nas unidades do desenho da pessoa. */
  readonly held?: React.ReactNode;
  /** Inclinação do corpo, em graus, a partir dos pés. */
  readonly lean?: number;
};

/** A lojista: a pessoa de avental coral, em pé no chão da loja. */
export const Keeper: React.FC<KeeperProps> = ({
  x,
  height = 520,
  seconds,
  expression = "neutral",
  flip = false,
  frontArm,
  backArm,
  held,
  lean = 0,
}) => (
  <Place
    x={x}
    y={FLOOR_Y + 10}
    anchor="bottom"
    style={{
      scale: `${flip ? -1 : 1} ${breath(seconds, "keeper")}`,
      rotate: `${flip ? -lean : lean}deg`,
    }}
  >
    <Person
      height={height}
      colors={person}
      apron={apron}
      expression={expression}
      frontArm={frontArm}
      backArm={backArm}
      held={held}
      heldInFront
    />
  </Place>
);

const SWEEP_SECONDS = 1.2;
// Do alto do cabo até onde a mão o segura, e a altura da piaçava, nas unidades do desenho da pessoa.
const GRIP = 110;
const BRISTLES = 110;
const DUST = [0, 0.33, 0.66] as const;

type SweeperProps = {
  readonly x: number;
  readonly height?: number;
  readonly seconds: number;
  /** Virada para a esquerda. */
  readonly flip?: boolean;
};

/**
 * A lojista varrendo. A vassoura é desenhada a partir da mão: o cabo passa por
 * ela e a piaçava encosta no chão, de modo que a mão nunca solta o cabo, por
 * mais que a varrida mude de lugar ou de tamanho.
 */
export const Sweeper: React.FC<SweeperProps> = ({
  x,
  height,
  seconds,
  flip,
}) => {
  const sweep = wave(seconds, SWEEP_SECONDS);
  // A mão vai e vem, e o cabo inclina junto: a piaçava anda mais que a mão.
  const hand: [number, number] = [-150 - 36 * sweep, -285];
  const tilt = 18 + 14 * sweep;
  const radians = (tilt * Math.PI) / 180;
  const reach = -hand[1] / Math.cos(radians);
  const headX = hand[0] - reach * Math.sin(radians);
  // A poeira sobe quando a vassoura anda, e assenta quando ela para.
  const speed = Math.abs(Math.cos((seconds / SWEEP_SECONDS) * Math.PI * 2));

  return (
    <Keeper
      x={x}
      height={height}
      seconds={seconds}
      flip={flip}
      lean={-2 - 3 * sweep}
      frontArm={{ hand, bend: 24 }}
      held={
        <>
          <Broom
            x={hand[0] + GRIP * Math.sin(radians)}
            y={hand[1] - GRIP * Math.cos(radians)}
            tilt={tilt}
            length={reach + GRIP - BRISTLES}
          />
          {DUST.map((phase) => {
            const rise = (seconds / SWEEP_SECONDS + phase) % 1;
            return (
              <circle
                key={phase}
                cx={headX - 50 - 70 * rise}
                cy={-16 - 50 * rise}
                r={8 + 10 * rise}
                fill={goods.tape}
                opacity={0.5 * speed * (1 - rise)}
              />
            );
          })}
        </>
      }
    />
  );
};

const PER_SHELF = 7;
const BIG_FROM = 44;

type ShelfItem = {
  readonly x: number;
  /** A tábua em que o item pousa; os que transbordam ficam no chão. */
  readonly y: number;
  readonly radius: number;
  /** Os maiores e mais firmes: os que ficam. */
  readonly big: boolean;
  readonly color: string;
};

const shelfItem = (shelf: number, index: number, y: number): ShelfItem => {
  const radius = 24 + random(`shelf-${shelf}-${index}`) * 30;
  return {
    x: SHELVES.x + ((index + 0.5) / PER_SHELF) * SHELVES.width,
    y,
    radius,
    big: radius >= BIG_FROM,
    color: goods.items[(shelf * 3 + index) % goods.items.length],
  };
};

/** A mercadoria das prateleiras: cada item é uma conexão entre neurônios. */
const SHELF_ITEMS: readonly ShelfItem[] = SHELVES.ys.flatMap((y, shelf) =>
  Array.from({ length: PER_SHELF }, (_, index) => shelfItem(shelf, index, y)),
);
/** O que não coube: empilhado por cima e caído no chão, em volta das prateleiras. */
const OVERFLOW: readonly ShelfItem[] = [
  ...Array.from({ length: PER_SHELF - 1 }, (_, index) => ({
    ...shelfItem(3, index, SHELVES.ys[0] - 74),
    x: SHELVES.x + ((index + 1) / PER_SHELF) * SHELVES.width,
    big: false,
  })),
  ...[-70, 40, SHELVES.width + 20, SHELVES.width + 110].map((dx, index) => ({
    ...shelfItem(4, index, FLOOR_Y),
    x: SHELVES.x + dx,
    big: false,
  })),
];

type ShelfGoodsProps = {
  /** As prateleiras transbordam: há itens por cima e no chão. */
  readonly overflowing?: boolean;
  /** Quanto do excesso já foi tirado, de 0 a 1: os pequenos somem, os grandes ficam. */
  readonly trimmed?: number;
};

/** O que está nas prateleiras. A lojista tira o excesso; os itens grandes ficam onde estão. */
export const ShelfGoods: React.FC<ShelfGoodsProps> = ({
  overflowing = false,
  trimmed = 0,
}) => (
  <SvgLayer>
    {[...SHELF_ITEMS, ...(overflowing ? OVERFLOW : [])].map((item, index) => {
      // Cada item pequeno sai na sua vez, ao longo da arrumação.
      const order = random(`trim-${index}`);
      const gone = item.big
        ? 0
        : Math.max(0, Math.min(1, (trimmed - order * 0.7) / 0.3));
      return gone >= 1 ? null : (
        <circle
          key={index}
          cx={item.x}
          cy={item.y - item.radius}
          r={item.radius * (1 - gone)}
          fill={item.color}
        />
      );
    })}
  </SvgLayer>
);
