import { AbsoluteFill, random } from "remotion";
import { Person, type Expression } from "../../../art/Person";
import { breath } from "../../../components/Idle";
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
  /** De porta baixada, quanto a lâmpada ilumina, em volta de 1: ela tremula. Por padrão, 1. */
  readonly lamp?: number;
};

/**
 * A loja vista por dentro: a porta de enrolar à esquerda, as prateleiras no
 * meio e o depósito dos fundos à direita. De dia a porta está erguida e a
 * parede é clara; de porta baixada, só a lâmpada ilumina.
 */
export const ShopInside: React.FC<ShopInsideProps> = ({
  time,
  children,
  lamp = 1,
}) => {
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
        {/* Abaixo do quadro, a parede continua na cor da base: quando o piso desce com o palco, não sobra um vão. */}
        <AbsoluteFill
          style={{
            left: -BLEED,
            width: 1920 + 2 * BLEED,
            // Uns pixels por cima do fim da parede, que é da mesma cor: sem emenda entre as duas.
            top: 1070,
            height: BLEED,
            background: colors.wall[1],
          }}
        />
        {colors.lamp ? (
          <AbsoluteFill
            style={{
              background: `radial-gradient(ellipse 60% 70% at 50% 0%, ${colors.lamp}66, transparent)`,
              opacity: lamp,
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

type MemoryTagProps = {
  /** O meio da etiqueta, nas unidades de quem a contém. */
  readonly x: number;
  readonly y: number;
  readonly scale?: number;
  readonly memory: Memory;
};

/** A lembrança fora da caixa: a etiqueta dela, solta. Vai dentro de um SVG. */
export const MemoryTag: React.FC<MemoryTagProps> = ({
  x,
  y,
  scale = 1,
  memory,
}) => (
  <g
    transform={`translate(${x} ${y}) scale(${scale})`}
    fill={goods.crateShade}
    stroke={goods.crateShade}
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth={0}
  >
    <rect x={-34} y={-30} width={68} height={60} rx={8} fill={goods.tape} />
    <g transform="scale(0.95)">{MEMORIES[memory]}</g>
  </g>
);

type CrateProps = {
  /** O meio da base da caixa, em pixels do quadro. */
  readonly x: number;
  readonly y: number;
  readonly scale?: number;
  /** A etiqueta da caixa mostra a lembrança que ela guarda. */
  readonly memory?: Memory;
  /** A altura da caixa, em fração, a partir da base: ela achata ao bater no chão. Por padrão, 1. */
  readonly squash?: number;
  /** A inclinação, em graus, em volta do meio da base: a caixa que balança. */
  readonly tilt?: number;
  /** Quanto as abas de cima estão abertas, de 0 a 1. Sem valor, a caixa está fechada. */
  readonly open?: number;
};

/** Uma caixa de mercadoria: o que chegou durante o dia. Vai dentro de um SvgLayer. */
export const Crate: React.FC<CrateProps> = ({
  x,
  y,
  scale = 1,
  memory,
  squash = 1,
  tilt = 0,
  open,
}) => (
  <g
    transform={`translate(${x} ${y}) rotate(${tilt}) scale(${scale} ${scale * squash})`}
  >
    {open === undefined || open <= 0 ? null : (
      // As duas abas giram para fora, cada uma presa na sua quina de cima.
      <>
        <path
          d="M0,-6 L-52,-6 L-52,6 L0,6 Z"
          fill={goods.crateShade}
          transform={`translate(${-CRATE.width / 2 + 4} ${-CRATE.height + 6}) rotate(${180 - 138 * open})`}
        />
        <path
          d="M0,-6 L52,-6 L52,6 L0,6 Z"
          fill={goods.crateShade}
          transform={`translate(${CRATE.width / 2 - 4} ${-CRATE.height + 6}) rotate(${-180 + 138 * open})`}
        />
      </>
    )}
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
  /** A piscada, de 0 a 1: esconde a troca de rosto. */
  readonly blink?: number;
  /** A passada de quem anda (ver `Person`). */
  readonly stride?: React.ComponentProps<typeof Person>["stride"];
  /**
   * Para que lado ela está virada, de -1 (esquerda) a 1 (direita), passando
   * por 0 quando se vira: vale no lugar de `flip`.
   */
  readonly facing?: number;
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
  blink,
  stride,
  facing = flip ? -1 : 1,
}) => (
  <Place
    x={x}
    y={FLOOR_Y + 10}
    anchor="bottom"
    style={{
      scale: `${facing} ${breath(seconds, "keeper")}`,
      rotate: `${facing < 0 ? -lean : lean}deg`,
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
      blink={blink}
      stride={stride}
    />
  </Place>
);

const PER_SHELF = 7;

type ShelfItem = {
  readonly x: number;
  /** A tábua em que o item pousa. */
  readonly y: number;
  readonly radius: number;
  readonly color: string;
};

const shelfItem = (shelf: number, index: number, y: number): ShelfItem => {
  const radius = 24 + random(`shelf-${shelf}-${index}`) * 30;
  return {
    x: SHELVES.x + ((index + 0.5) / PER_SHELF) * SHELVES.width,
    y,
    radius,
    color: goods.items[(shelf * 3 + index) % goods.items.length],
  };
};

/** A mercadoria das prateleiras: cada item é uma conexão entre neurônios. */
const SHELF_ITEMS: readonly ShelfItem[] = SHELVES.ys.flatMap((y, shelf) =>
  Array.from({ length: PER_SHELF }, (_, index) => shelfItem(shelf, index, y)),
);

/** A mercadoria nas três prateleiras, com tamanho e posição fixos. */
export const ShelfGoods: React.FC = () => (
  <SvgLayer>
    {SHELF_ITEMS.map((item, index) => (
      <circle
        key={index}
        cx={item.x}
        cy={item.y - item.radius}
        r={item.radius}
        fill={item.color}
      />
    ))}
  </SvgLayer>
);
