import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { Brain } from "../../../art/Brain";
import { Person, type PersonColors } from "../../../art/Person";
import { Camera, Layer, framing } from "../../../components/Camera";
import { Grain } from "../../../components/Grain";
import { breath, wave } from "../../../components/Idle";
import { Place } from "../../../components/Place";
import { POP_SECONDS, Pop, popScale } from "../../../components/Pop";
import { SvgLayer } from "../../../components/SvgLayer";
import { cue, mix, ramp } from "../../../components/timing";
import type { SceneProps } from "../../../video/NarratedVideo";
import { Shot } from "../../../video/Shot";
import {
  coin,
  customer,
  goods,
  idea,
  ink,
  pedestal,
  person,
  researcher,
  shopInside,
  sleepResearcher,
} from "../palette";
import { IdeaBackdrop } from "../parts/IdeaBackdrop";
import { FRONT, ShopFront } from "../parts/ShopFront";
import {
  CRATE,
  Crate,
  FLOOR_Y,
  Keeper,
  SHELVES,
  ShelfGoods,
  ShopInside,
  type Memory,
} from "../parts/ShopInside";
import {
  ProfileHead,
  profileBrain,
  SUBJECTS,
  SyllableSheet,
} from "../parts/SyllableList";

/** O cérebro da comparação: cheio, na cor quente das etiquetas, com as dobras num tom abaixo. */
export const SHOP_BRAIN = { fill: ink.tag, line: ink.tagEdge };

// A cabeça de quem dormiu, de perfil, à direita; a lista sobe à frente do rosto dela.
const HEAD = { x: 1150, y: 500, size: 560 };
const HEAD_BRAIN = profileBrain(HEAD.size);
const LIST = {
  from: { x: 470, y: 1000, width: 300 },
  to: { x: 520, y: 480, width: 330 },
};
// As sílabas que a lista de quem dormiu ainda guarda, como no plano do teste.
const KEPT = [1, 1, 0, 1, 1, 0, 1, 0, 1, 0];
// As lembranças já dentro do cérebro: tarjas acesas, como as da lista.
const INSIDE = [
  [-0.2, -0.14],
  [0.08, -0.2],
  [0.24, 0.02],
  [-0.06, 0.06],
  [-0.26, 0.12],
  [0.12, 0.2],
] as const;

type HeadShotProps = {
  /** Quadro do plano em que o cérebro aparece dentro da cabeça. */
  readonly brainAt: number;
};

/** A lista acesa sobe até a cabeça de quem dormiu, e o cérebro aparece dentro dela. */
const HeadShot: React.FC<HeadShotProps> = ({ brainAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const risen = ramp(frame, 0, Math.max(1, brainAt - 4));
  const frames = POP_SECONDS * fps;
  const open = popScale(frame, brainAt, frames, 0, 1.06);
  const brain = { x: HEAD.x + HEAD_BRAIN.dx, y: HEAD.y + HEAD_BRAIN.dy };

  return (
    <AbsoluteFill>
      <IdeaBackdrop hue="peach" spot={[0.58, 0.45]} />
      <Place x={HEAD.x} y={HEAD.y}>
        <ProfileHead
          size={HEAD.size}
          colors={SUBJECTS[0]}
          open={frame >= brainAt ? open : 0}
          openColor={idea.peach.spot}
        />
      </Place>
      <Place x={brain.x} y={brain.y}>
        <Pop at={brainAt}>
          <Brain
            width={HEAD_BRAIN.width}
            color={SHOP_BRAIN.line}
            fill={SHOP_BRAIN.fill}
            folds
          />
        </Pop>
      </Place>
      <SvgLayer>
        {INSIDE.map(([dx, dy], index) => {
          const at = brainAt + 3 + index * 2;
          return frame >= at ? (
            <rect
              key={index}
              x={brain.x + dx * HEAD_BRAIN.width - 26}
              y={brain.y + dy * HEAD_BRAIN.width - 13}
              width={52}
              height={26}
              rx={10}
              fill={goods.crate}
              opacity={popScale(frame, at, frames, 0, 1)}
            />
          ) : null;
        })}
      </SvgLayer>
      <Place
        x={mix(LIST.from.x, LIST.to.x, risen)}
        y={mix(LIST.from.y, LIST.to.y, risen)}
        style={{ rotate: `${mix(-10, -5, risen)}deg` }}
      >
        <SyllableSheet
          width={mix(LIST.from.width, LIST.to.width, risen)}
          lit={KEPT}
        />
      </Place>
      <Grain />
    </AbsoluteFill>
  );
};

/** Os fregueses: a construção da pessoa com rosto de dois pontos; o segundo, de cabelo grisalho e blusa amarela; o terceiro, de roxo. */
const SHOPPERS: readonly PersonColors[] = [
  customer,
  {
    ...person,
    hair: sleepResearcher.hair,
    hairLight: sleepResearcher.hairLight,
    top: goods.crate,
    topShade: goods.crateShade,
    topLight: coin.shine,
    pants: customer.pants,
    pantsShade: customer.pantsShade,
    shoe: customer.shoe,
    shoeShade: customer.shoeShade,
  },
  {
    ...customer,
    hair: researcher.hair,
    hairLight: researcher.hairLight,
    top: pedestal.body,
    topShade: pedestal.shade,
    topLight: pedestal.top,
    pants: sleepResearcher.pants,
    pantsShade: sleepResearcher.pantsShade,
    shoe: customer.shoe,
    shoeShade: customer.shoeShade,
  },
];

// A lojista atende virada para a esquerda: o braço de trás, que no desenho espelhado fica desse lado, estende a mercadoria.
const SERVING = {
  backArm: { hand: [188, -330] as [number, number], bend: 16 },
  held: <circle cx={226} cy={-356} r={36} fill={goods.items[1]} />,
};

const STREET_BRAIN = { x: FRONT.x, y: 470, width: 760 };
// Quem passa na calçada: de onde vem, onde para, e a altura.
const WALKERS = [
  { from: 80, to: 480, shopper: 1, height: 400 },
  { from: 1900, to: 1560, shopper: 2, height: 420 },
] as const;
// As caixas que chegam, na calçada, à esquerda da porta: o meio da base de cada uma e o quadro em que entra.
const DELIVERY = [
  [FRONT.x - 600, 0, 0],
  [FRONT.x - 730, 0, 14],
  [FRONT.x - 665, 1, 30],
] as const;

/** O cérebro vira a fachada da loja, movimentada de dia: fregueses entram, caixas chegam, a lojista atende. */
const OpenShopShot: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const seconds = frame / fps;
  const became = ramp(frame, 0, 0.6 * fps);
  const frames = POP_SECONDS * fps;
  const from = {
    x: HEAD.x + HEAD_BRAIN.dx,
    y: HEAD.y + HEAD_BRAIN.dy,
    width: HEAD_BRAIN.width,
  };

  return (
    <AbsoluteFill>
      <ShopFront time="day" shutter={0}>
        <SvgLayer>
          {DELIVERY.map(([x, row, at]) =>
            frame >= at ? (
              <Crate
                key={x}
                x={x}
                y={FRONT.ground + 44 - row * CRATE.height}
                scale={popScale(frame, at, frames)}
              />
            ) : null,
          )}
        </SvgLayer>
        {WALKERS.map(({ from: start, to, shopper, height }, index) => {
          const walk = ramp(frame, 0, durationInFrames * 0.7);
          return (
            <Place
              key={start}
              x={mix(start, to, walk)}
              y={
                FRONT.ground +
                64 -
                (walk < 1 ? 8 * Math.abs(wave(seconds, 0.3, index * 0.4)) : 0)
              }
              anchor="bottom"
              style={{ scale: `1 ${breath(seconds, `walker-${index}`)}` }}
            >
              <Person height={height} colors={SHOPPERS[shopper]} plainFace />
            </Place>
          );
        })}
        {/* Na porta, a lojista entrega a mercadoria a um freguês. */}
        <Place
          x={FRONT.x - 110}
          y={FRONT.ground + 40}
          anchor="bottom"
          style={{ scale: `1 ${breath(seconds, "buyer")}` }}
        >
          <Person
            height={400}
            colors={SHOPPERS[0]}
            plainFace
            backArm={{ hand: [150, -310], bend: 20 }}
          />
        </Place>
        <Keeper
          x={FRONT.x + 190}
          height={420}
          seconds={seconds}
          flip
          {...SERVING}
        />
      </ShopFront>
      {/* O fundo e o cérebro do plano anterior: ele cresce sobre a loja e some quando a troca está feita. */}
      <AbsoluteFill style={{ opacity: 1 - ramp(frame, 0.1 * fps, 0.4 * fps) }}>
        <IdeaBackdrop hue="peach" spot={[0.58, 0.45]} />
      </AbsoluteFill>
      <Place
        x={mix(from.x, STREET_BRAIN.x, became)}
        y={mix(from.y, STREET_BRAIN.y, became)}
        style={{ opacity: 1 - ramp(frame, 0.35 * fps, 0.4 * fps) }}
      >
        <Brain
          width={mix(from.width, STREET_BRAIN.width, became)}
          color={SHOP_BRAIN.line}
          fill={SHOP_BRAIN.fill}
          folds
        />
      </Place>
    </AbsoluteFill>
  );
};

/** A pilha do dia, na entrada: onde cada caixa fica, a partir do meio da pilha e do chão, na ordem em que chega. */
export const PILE = [
  [-1, 0],
  [0, 0],
  [1, 0],
  [-0.5, 1],
  [0.5, 1],
  [0, 2],
] as const;
/** A lembrança na etiqueta de cada caixa: um rosto, um caminho, e as outras. */
export const MEMORIES: readonly Memory[] = [
  "face",
  "path",
  "star",
  "note",
  "face",
  "path",
];
export const PILE_SPOT = { x: 350, scale: 1.1 };

type PileProps = {
  /** Quantas caixas a pilha tem. */
  readonly count: number;
  /** Quadro em que a última caixa chegou: ela entra com sobra. Sem valor, já estava lá. */
  readonly lastAt?: number;
};

/** A pilha das caixas do dia na entrada da loja, cada uma com a etiqueta de uma lembrança. */
export const Pile: React.FC<PileProps> = ({ count, lastAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pitch = CRATE.width * PILE_SPOT.scale;
  const rise = CRATE.height * PILE_SPOT.scale;

  return (
    <SvgLayer>
      {PILE.slice(0, count).map(([column, row], index) => (
        <Crate
          key={index}
          x={PILE_SPOT.x + column * pitch}
          y={FLOOR_Y - row * rise}
          scale={
            PILE_SPOT.scale *
            (index === count - 1 && lastAt !== undefined
              ? popScale(frame, lastAt, POP_SECONDS * fps)
              : 1)
          }
          memory={MEMORIES[index]}
        />
      ))}
    </SvgLayer>
  );
};

/** A loja por dentro, em plano médio: da entrada, à esquerda, até quase o depósito. */
const INSIDE_MEDIUM = framing([830, 610], 1.15);
const QUEUE = [
  { x: 960, shopper: 0, height: 440 },
  { x: 730, shopper: 1, height: 420 },
] as const;
const ARRIVAL_SECONDS = 1.1;
const KEEPER_X = 1250;
// A área das prateleiras, com folga: o que o véu de parede cobre.
const SHELF_VEIL = {
  left: SHELVES.x - 60,
  right: SHELVES.x + SHELVES.width + 60,
  top: 180,
};

/** Dentro da loja, de dia: a lojista atende um freguês atrás do outro, e as caixas se empilham na entrada. */
const BusyShot: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const seconds = frame / fps;
  // Duas caixas já estão lá; as outras chegam uma a uma, enquanto ela atende.
  const arrived = Math.min(
    PILE.length - 2,
    Math.floor(frame / (ARRIVAL_SECONDS * fps)),
  );

  return (
    <AbsoluteFill>
      <Camera {...INSIDE_MEDIUM}>
        <Layer depth={1}>
          <ShopInside time="day">
            <ShelfGoods />
            {/*
              A prateleira recua: por cima dela vai a própria parede, no mesmo
              degradê, quase opaca. Fora da prateleira o véu não se vê; sobre
              ela, as bolas perdem cor e contraste, e a lojista e os fregueses,
              que ficam na frente, deixam de se misturar com elas.
            */}
            <AbsoluteFill
              style={{
                background: `linear-gradient(${shopInside.day.wall[0]}, ${shopInside.day.wall[1]})`,
                clipPath: `inset(${SHELF_VEIL.top}px ${1920 - SHELF_VEIL.right}px ${1080 - FLOOR_Y}px ${SHELF_VEIL.left}px)`,
                opacity: 0.64,
              }}
            />
            <SvgLayer>
              {[...QUEUE.map(({ x }) => x), KEEPER_X].map((x) => (
                <ellipse
                  key={x}
                  cx={x}
                  cy={FLOOR_Y + 12}
                  rx={130}
                  ry={16}
                  fill={idea.lilac.contact}
                  opacity={0.3}
                />
              ))}
            </SvgLayer>
            <Pile
              count={2 + arrived}
              lastAt={arrived > 0 ? arrived * ARRIVAL_SECONDS * fps : undefined}
            />
            {QUEUE.map(({ x, shopper, height }, index) => (
              <Place
                key={x}
                x={x}
                y={FLOOR_Y + 10}
                anchor="bottom"
                style={{ scale: `1 ${breath(seconds, `queue-${index}`)}` }}
              >
                <Person
                  height={height}
                  colors={SHOPPERS[shopper]}
                  plainFace
                  backArm={
                    index === 0 ? { hand: [150, -310], bend: 20 } : undefined
                  }
                />
              </Place>
            ))}
            <Keeper x={KEEPER_X} seconds={seconds} flip {...SERVING} />
          </ShopInside>
        </Layer>
      </Camera>
      <Grain />
    </AbsoluteFill>
  );
};

export const StockroomScene: React.FC<SceneProps> = ({ scene, shots }) => (
  <>
    <Shot range={shots[0]} name="a lista sobe até a cabeça; o cérebro aparece">
      <HeadShot brainAt={cue(scene, "cérebro")} />
    </Shot>
    <Shot range={shots[1]} name="o cérebro vira a loja aberta">
      <OpenShopShot />
    </Shot>
    <Shot range={shots[2]} name="fregueses no balcão, caixas na entrada">
      <BusyShot />
    </Shot>
  </>
);
