import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Brain } from "../../../art/Brain";
import { Person, type PersonColors } from "../../../art/Person";
import {
  Build,
  Camera,
  Layer,
  cameraBetween,
  framing,
  useBuild,
  type CameraState,
} from "../../../components/Camera";
import { FlatStage, Stay, useStage } from "../../../components/Cast";
import { Grain } from "../../../components/Grain";
import { blink, breath, wave } from "../../../components/Idle";
import { Place } from "../../../components/Place";
import { popOpacity, popScale } from "../../../components/Pop";
import { SvgLayer } from "../../../components/SvgLayer";
import {
  clamp,
  clamp01,
  cue,
  drop,
  linear,
  mix,
  ramp,
  shake,
} from "../../../components/timing";
import type { SceneProps } from "../../../video/NarratedVideo";
import { Shot, useShotLength } from "../../../video/Shot";
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
import { FRONT, FRONT_WIDE, ShopFront } from "../parts/ShopFront";
import {
  CRATE,
  Crate,
  ENTRANCE,
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
import { seen } from "./ButWhatScene";
import { flash, NEVER, Preluded, Sooner } from "./MaybeBrainScene";
import { centeredAt } from "./MemoryTestScene";

/** O cérebro da comparação: cheio, na cor quente das etiquetas, com as dobras num tom abaixo. */
const SHOP_BRAIN = { fill: ink.tag, line: ink.tagEdge };

// A cabeça de quem dormiu, de perfil, à direita; a lista sobe à frente do rosto dela.
const HEAD = { x: 1150, y: 500, size: 560 };
const HEAD_BRAIN = profileBrain(HEAD.size);
const BRAIN_SPOT = { x: HEAD.x + HEAD_BRAIN.dx, y: HEAD.y + HEAD_BRAIN.dy };
const LIST = {
  from: { x: 470, y: 1000, width: 300 },
  to: { x: 520, y: 480, width: 330 },
  tilt: [-10, -5],
};
// A lista sobe até a cabeça: quando parte e em quantos quadros chega.
const RISE = { at: 2, frames: 21 };
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
// Cada tarja acesa da lista manda uma cópia para dentro do cérebro: o intervalo entre elas e a viagem, em quadros.
const FLIGHT = { after: 3, step: 2, frames: 9, arc: 46 };
const HEAD_SOONER = 14;

/** Onde fica, no quadro, a tarja `index` da lista já no alto: é de lá que a lembrança parte. */
const chipSpot = (index: number): readonly [number, number] => {
  const scale = LIST.to.width / 360;
  const dx = ((index % 2 === 0 ? 100 : 260) - 180) * scale;
  const dy = (147 + Math.floor(index / 2) * 86 - 280) * scale;
  const turn = (LIST.tilt[1] * Math.PI) / 180;
  return [
    LIST.to.x + dx * Math.cos(turn) - dy * Math.sin(turn),
    LIST.to.y + dx * Math.sin(turn) + dy * Math.cos(turn),
  ];
};
const KEPT_CHIPS = KEPT.flatMap((kept, index) => (kept ? [index] : []));

type HeadPictureProps = {
  /** O quadro do plano que se desenha: o plano seguinte o redesenha, parado no último. */
  readonly at: number;
  /** Quadro do plano em que o cérebro aparece dentro da cabeça. */
  readonly brainAt: number;
  readonly seconds: number;
  /**
   * O plano seguinte desfaz o quadro: quanto a lista e a cabeça já encolheram,
   * cada uma no próprio ponto, onde o cérebro está e de que tamanho (ele vai
   * até o lugar da loja e encolhe nela).
   */
  readonly undone?: {
    readonly list: number;
    readonly head: number;
    readonly brain: {
      readonly x: number;
      readonly y: number;
      readonly scale: number;
    };
  };
  /** Quantos quadros faltam para o plano começar, quando é a cena anterior quem o desenha, parado no primeiro quadro. */
  readonly until?: number;
};

/** Quantos quadros antes da cena a lista começa a subir de baixo do quadro, e a cabeça a crescer. */
export const HEAD_LEAD = 8;
// Quanto a lista está abaixo do lugar de partida antes de entrar: fora do quadro.
const LIST_BELOW = 420;

/** A lista acesa sobe até a cabeça de quem dormiu, e o cérebro acende dentro dela, com as lembranças da lista. */
const HeadPicture: React.FC<HeadPictureProps> = ({
  at,
  brainAt,
  seconds,
  undone,
  until = 0,
}) => {
  const { fps } = useVideoConfig();
  const brain = undone?.brain ?? { ...BRAIN_SPOT, scale: 1 };
  const risen = ramp(at, RISE.at, RISE.frames);
  // A lista entra por baixo do quadro antes de a cena chegar, freando: no primeiro quadro está no lugar de partida.
  const below =
    LIST_BELOW * (1 - linear(at - until, -HEAD_LEAD, HEAD_LEAD)) ** 3;
  const frames = 0.4 * fps;
  const lit = at >= brainAt;
  const open = lit ? popScale(at, brainAt, frames, 0, 1.06) : 0;
  // Aceso, o cérebro pulsa devagar.
  const pulse = 1 + 0.025 * wave(seconds, 1.9);

  return (
    <>
      <Sooner by={HEAD_SOONER}>
        <Place
          x={HEAD.x}
          y={HEAD.y}
          // Quem dorme respira devagar: a cabeça sobe e desce um pouco.
          style={{
            translate: `-50% calc(-50% + ${5 * wave(seconds, 4.8)}px)`,
          }}
        >
          <div style={{ scale: `${1 - (undone?.head ?? 0)}` }}>
            <ProfileHead
              size={HEAD.size}
              colors={SUBJECTS[0]}
              open={open}
              openColor={idea.peach.spot}
            />
          </div>
        </Place>
      </Sooner>
      {lit ? (
        <Stay>
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              translate: centeredAt(brain.x, brain.y + 5 * wave(seconds, 4.8)),
              scale: `${popScale(at, brainAt, frames) * pulse * brain.scale}`,
              opacity: popOpacity(at, brainAt, frames),
            }}
          >
            <Brain
              width={HEAD_BRAIN.width}
              color={SHOP_BRAIN.line}
              fill={SHOP_BRAIN.fill}
              folds
            />
          </div>
        </Stay>
      ) : null}
      {/* A lista não entra com o palco: sobe de baixo do quadro, e fica flutuando diante do rosto. */}
      <Stay>
        <Place
          x={0}
          y={0}
          style={{
            translate: centeredAt(
              mix(LIST.from.x, LIST.to.x, risen),
              mix(LIST.from.y, LIST.to.y, risen) +
                below +
                6 * risen * wave(seconds, 3.3, 0.2),
            ),
            rotate: `${mix(LIST.tilt[0], LIST.tilt[1], risen) + 0.9 * risen * wave(seconds, 4.1, 0.5)}deg`,
            scale: `${1 - (undone?.list ?? 0)}`,
          }}
        >
          <SyllableSheet
            width={mix(LIST.from.width, LIST.to.width, risen)}
            lit={KEPT}
          />
        </Place>
      </Stay>
      <SvgLayer>
        {/* As lembranças já pousadas vão com o cérebro. */}
        <g
          transform={`translate(${brain.x} ${brain.y}) scale(${brain.scale}) translate(${-BRAIN_SPOT.x} ${-BRAIN_SPOT.y})`}
        >
          {KEPT_CHIPS.map((chip, order) => {
            const start = brainAt + FLIGHT.after + order * FLIGHT.step;
            if (at < start) {
              return null;
            }
            // A lembrança sai da tarja dela, sobe num arco e pousa dentro do cérebro.
            const flown = ramp(at, start, FLIGHT.frames);
            const from = chipSpot(chip);
            const to = [
              BRAIN_SPOT.x + INSIDE[order][0] * HEAD_BRAIN.width,
              BRAIN_SPOT.y + INSIDE[order][1] * HEAD_BRAIN.width,
            ];
            const size = mix(1.5, 1, flown);
            return (
              <rect
                key={chip}
                x={mix(from[0], to[0], flown) - 26 * size}
                y={
                  mix(from[1], to[1], flown) -
                  13 * size -
                  FLIGHT.arc * Math.sin(Math.PI * flown) +
                  5 * wave(seconds, 4.8) * flown
                }
                width={52 * size}
                height={26 * size}
                rx={10 * size}
                fill={goods.crate}
              />
            );
          })}
        </g>
      </SvgLayer>
    </>
  );
};

type HeadShotProps = {
  readonly brainAt: number;
  readonly clock: number;
  /** Quantos quadros faltam para o plano começar, quando é a cena anterior quem o desenha. */
  readonly until?: number;
};

/** A lista acesa sobe até a cabeça de quem dormiu, e o cérebro aparece dentro dela. */
const HeadShot: React.FC<HeadShotProps> = ({ brainAt, clock, until }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill>
      <FlatStage backdrop={<IdeaBackdrop hue="peach" spot={[0.58, 0.45]} />}>
        <HeadPicture
          at={frame}
          brainAt={brainAt}
          seconds={(clock + frame) / fps}
          until={until}
        />
        <Grain />
      </FlatStage>
    </AbsoluteFill>
  );
};

/** Os fregueses: a construção da pessoa com rosto de dois pontos; o segundo, de cabelo grisalho e blusa amarela; o terceiro, de roxo. */
// O braço de trás recolhido, de quem está encostado em outra pessoa.
const TUCKED = { hand: [112, -226], bend: 22 } as const;

export const SHOPPERS: readonly PersonColors[] = [
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

/** O passo de quem anda, em fração da altura: a passada conta um passo a cada tanto de chão. */
const STEP = 0.27;

/** Quanto do caminho já foi andado, de 0 a 1, com `t` de 0 a 1: reta, e uma freada no fim que termina parada. */
const walked = (t: number, brake = 0.75): number => {
  const u = clamp01(t);
  const stop = 1 / (1 - brake ** 2);
  return u < brake ? 2 * stop * (1 - brake) * u : 1 - stop * (1 - u) ** 2;
};

type StrollProps = {
  /** De onde vem e onde para, o quadro em que parte e quantos leva. */
  readonly from: number;
  readonly to: number;
  readonly at: number;
  readonly frames: number;
  /** O quadro que se desenha. */
  readonly now: number;
  readonly height: number;
};

/** Onde está quem anda de `from` a `to`, e a passada dela: os passos contam com o chão andado. */
export const stroll = ({ from, to, at, frames, now, height }: StrollProps) => {
  const done = walked((now - at) / frames);
  const moving = now > at && now < at + frames;
  return {
    x: mix(from, to, done),
    // Virada para onde vai: o desenho anda para a direita, e é espelhado para andar para a esquerda.
    facing: to >= from ? 1 : -1,
    stride: {
      step: (Math.abs(to - from) * done) / (STEP * height),
      // A passada entra e sai aos poucos: ninguém parte nem para de uma vez.
      gait: moving ? Math.min(1, (now - at) / 4, (at + frames - now) / 5) : 0,
    },
  };
};

// A lojista atende virada para a esquerda: o braço de trás, que no desenho espelhado fica desse lado, estende a mercadoria.
const SERVING_HAND = { rest: [150, -250], out: [188, -330], far: [230, -338] };

/** O braço e a mercadoria da lojista: `reach` vai de 0 (braço baixo) a 1 (oferece) e a 2 (entrega, esticado). */
export const serving = (reach: number, item: number, color: string) => {
  const hand: [number, number] =
    reach <= 1
      ? [
          mix(SERVING_HAND.rest[0], SERVING_HAND.out[0], reach),
          mix(SERVING_HAND.rest[1], SERVING_HAND.out[1], reach),
        ]
      : [
          mix(SERVING_HAND.out[0], SERVING_HAND.far[0], reach - 1),
          mix(SERVING_HAND.out[1], SERVING_HAND.far[1], reach - 1),
        ];
  return {
    backArm: { hand, bend: 16 },
    held:
      item > 0 ? (
        <circle
          cx={hand[0] + 38}
          cy={hand[1] - 26}
          r={36 * item}
          fill={color}
        />
      ) : undefined,
  };
};

// Onde o cérebro vai parar para virar a loja: o meio da fachada, um pouco maior do que estava na cabeça.
const SHOP_SPOT = { x: FRONT.x, y: FRONT.ground - 330, scale: 1.2 };
// Quem passa na calçada: de onde vem, de fora do quadro, onde para, e a altura.
const WALKERS = [
  { from: -170, to: 480, shopper: 1, height: 400, frames: 54 },
  { from: 2090, to: 1560, shopper: 2, height: 420, frames: 44 },
] as const;
// As caixas que chegam, na calçada, à esquerda da porta: o meio da base de cada uma, a fileira e os quadros depois da deixa.
const DELIVERY = [
  [FRONT.x - 600, 0, 0],
  [FRONT.x - 730, 0, 8],
  [FRONT.x - 665, 1, 16],
] as const;
// Cada caixa cai de cima do quadro, acelera e achata ao bater.
const FALL = { height: 760, frames: 10, squash: 0.14 };
// O cérebro vira a loja, no palco comum. A lista e a cabeça encolhem, cada uma no seu ponto; o cérebro
// vai para o meio do quadro; o fundo passa ao céu do dia; a rua sobe em camadas; a fachada cresce no
// ponto em que o cérebro está, por trás dele, e ele encolhe dentro dela. Em quadros.
const TURN = {
  list: 8,
  headAt: 2,
  head: 9,
  carry: 12,
  skyAt: 2,
  sky: 12,
  streetAt: 3,
  street: 16,
  shopAt: 8,
  shop: 11,
  brainOutAt: 11,
  brainOut: 8,
  // Os dois da porta crescem quando a fachada assentou.
  buyerAt: 19,
  keeperAt: 21,
};
// O plano começa um pouco mais aberto e deriva até o quadro composto.
const OPEN_START = framing([960, 560], 0.95);
// Na troca para dentro da loja a rua desce com a fachada, a partir do corte: em quantos quadros.
const STREET_OUT = 8;
/** Em quantos quadros os três da porta vão da calçada ao lugar deles no balcão, e a loja de dentro sobe. */
const PASSAGE = 20;
// A parede de dentro só toma a cor com a rua já fora do quadro: por cima dela, a rua parecia apagar
// em vez de descer. Até lá a estante e o chão sobem opacos, sobre o céu da rua. Em quadros.
const WALL = { at: 7, frames: 10 };
// A freguesa de roxo se vira para o balcão logo que parte, em poucos quadros que não caem no meio da
// virada (de perfil ela não tem largura, e sumia por um quadro).
const TURN_AROUND = { at: 3, frames: 3 };

/** A câmera do plano da rua, quadro a quadro: no fim dele, e depois, é o quadro composto. */
const streetCamera = (frame: number, length: number): CameraState =>
  cameraBetween(OPEN_START, FRONT_WIDE, linear(frame, 0, length));

// Os três que os dois planos têm em comum, na calçada, quando o plano da rua termina: o pé de cada um e a altura.
const ON_STREET = {
  buyer: { x: FRONT.x - 110, y: FRONT.ground + 40, height: 400 },
  keeper: { x: FRONT.x + 190, y: FLOOR_Y + 10, height: 420 },
  walker: { x: WALKERS[1].to, y: FRONT.ground + 64, height: WALKERS[1].height },
} as const;

type GrownProps = {
  /** O ponto do chão de onde ele cresce, e o quadro em que entra. */
  readonly origin: readonly [number, number];
  readonly at: number;
  readonly children: React.ReactNode;
};

/** Quem já está na cena quando ela aparece: cresce dos pés, com sobra, sem opacidade. */
const Grown: React.FC<GrownProps> = ({ origin, at, children }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{
        transformOrigin: `${origin[0]}px ${origin[1]}px`,
        scale: `${popScale(frame, at, 10, 0, 1.06)}`,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

type OpenShopShotProps = {
  /** Quadros do plano em que os fregueses entram andando e em que as caixas começam a descer. */
  readonly walkAt: number;
  readonly crateAt: number;
  /** A duração do plano anterior e o quadro dele em que o cérebro acendeu: ele é redesenhado como ficou. */
  readonly before: number;
  readonly brainAt: number;
  readonly clock: number;
};

/** O cérebro vira a fachada da loja, movimentada de dia: fregueses chegam, caixas descem, a lojista atende. */
const OpenShopShot: React.FC<OpenShopShotProps> = ({
  walkAt,
  crateAt,
  before,
  brainAt,
  clock,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const length = useShotLength();
  const stage = useStage();
  const built = useBuild();
  const seconds = (clock + frame) / fps;
  const turning = frame < TURN.brainOutAt + TURN.brainOut;
  const carried = ramp(frame, 0, TURN.carry);
  const sky = linear(frame, TURN.skyAt, TURN.sky);
  const risen = interpolate(
    frame,
    [TURN.streetAt, TURN.streetAt + TURN.street],
    [0, 1],
    { ...clamp, easing: Easing.out(Easing.cubic) },
  );
  // Na troca seguinte a rua desce, com a fachada e com quem não continua: acelera, sem frear.
  const sunk = interpolate(frame, [length, length + STREET_OUT], [0, 1], {
    ...clamp,
    easing: Easing.in(Easing.quad),
  });
  // A lojista oferece a mercadoria ao freguês da porta: o braço sobe e desce um pouco.
  const offer = serving(1 + 0.12 * wave(seconds, 2.3), 1, goods.items[1]);

  return (
    <AbsoluteFill>
      {sky < 1 ? <IdeaBackdrop hue="peach" spot={[0.58, 0.45]} /> : null}
      {/* A passagem é contada daqui, e não do palco: o céu toma a cor, a rua sobe, e na saída desce a partir do corte. */}
      <Build {...built} lit={sky} risen={Math.min(risen, 1 - sunk)}>
        <ShopFront
          halo={1}
          time="day"
          shutter={0}
          clock={clock}
          camera={streetCamera(frame, length)}
          // A fachada cresce no ponto do cérebro, sem esperar a calçada; depois é da rua, e desce com ela.
          standing={frame < TURN.streetAt + TURN.street}
          grown={
            frame < TURN.shopAt
              ? 0
              : popScale(frame, TURN.shopAt, TURN.shop, 0, 1.05)
          }
          // O toldo balança no vento.
          awning={seconds / 2.6}
        >
          <SvgLayer>
            {DELIVERY.map(([x, row, after]) => {
              const at = crateAt + after;
              const fallen = drop(frame, at, FALL.frames);
              return frame >= at ? (
                <Crate
                  key={x}
                  x={x}
                  y={
                    FRONT.ground +
                    44 -
                    row * CRATE.height -
                    FALL.height * (1 - fallen)
                  }
                  // Bate, achata e volta.
                  squash={
                    1 - FALL.squash * flash(frame, at + FALL.frames - 1, 7)
                  }
                />
              ) : null;
            })}
          </SvgLayer>
          {WALKERS.map(({ shopper, height, ...path }, index) => {
            // A freguesa de roxo continua no plano seguinte, que a desenha a partir do corte.
            if (index === 1 && stage.handedOver) {
              return null;
            }
            const walk = stroll({
              ...path,
              at: walkAt + index * 6,
              now: frame,
              height,
            });
            return (
              <Place
                key={shopper}
                x={0}
                y={0}
                anchor="bottom"
                style={{
                  translate: `calc(-50% + ${walk.x}px) calc(-100% + ${FRONT.ground + 64}px)`,
                  scale: `${walk.facing} ${breath(seconds, `walker-${index}`)}`,
                }}
              >
                <Person
                  height={height}
                  colors={SHOPPERS[shopper]}
                  plainFace
                  stride={walk.stride}
                />
              </Place>
            );
          })}
          {/* Na porta, a lojista entrega a mercadoria a um freguês. Os dois continuam no plano seguinte, que os desenha a partir do corte. */}
          {stage.handedOver ? null : (
            <>
              <Grown
                origin={[ON_STREET.buyer.x, ON_STREET.buyer.y]}
                at={TURN.buyerAt}
              >
                <Place
                  x={ON_STREET.buyer.x}
                  y={ON_STREET.buyer.y}
                  anchor="bottom"
                  style={{ scale: `1 ${breath(seconds, "buyer")}` }}
                >
                  <Person
                    height={ON_STREET.buyer.height}
                    colors={SHOPPERS[0]}
                    plainFace
                    backArm={{
                      hand: [150, -310 - 8 * wave(seconds, 2.3, 0.15)],
                      bend: 20,
                    }}
                  />
                </Place>
              </Grown>
              <Grown
                origin={[ON_STREET.keeper.x, ON_STREET.keeper.y]}
                at={TURN.keeperAt}
              >
                <Keeper
                  x={ON_STREET.keeper.x}
                  height={ON_STREET.keeper.height}
                  seconds={seconds}
                  flip
                  blink={blink(seconds, "keeper")}
                  {...offer}
                />
              </Grown>
            </>
          )}
        </ShopFront>
      </Build>
      {turning ? (
        // O plano anterior, como ficou: a lista e a cabeça encolhem, e o cérebro vai até o lugar da loja e encolhe nela.
        <HeadPicture
          at={before + frame}
          brainAt={brainAt}
          seconds={seconds}
          undone={{
            list: drop(frame, 0, TURN.list),
            head: drop(frame, TURN.headAt, TURN.head),
            brain: {
              x: mix(BRAIN_SPOT.x, SHOP_SPOT.x, carried),
              y: mix(BRAIN_SPOT.y, SHOP_SPOT.y, carried),
              scale:
                mix(1, SHOP_SPOT.scale, carried) *
                (1 - drop(frame, TURN.brainOutAt, TURN.brainOut)),
            },
          }}
        />
      ) : null}
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

/** Onde fica, no chão da loja, a base da caixa `index` da pilha. */
export const pileSpot = (index: number): readonly [number, number] => [
  PILE_SPOT.x + PILE[index][0] * CRATE.width * PILE_SPOT.scale,
  FLOOR_Y - PILE[index][1] * CRATE.height * PILE_SPOT.scale,
];

type PileProps = {
  /** Quantas caixas a pilha tem. */
  readonly count: number;
  /** A última caixa ainda cai: a que altura está, em pixels acima do lugar dela, e quanto achatou ao bater. */
  readonly falling?: { readonly height: number; readonly squash: number };
  /** Quanto a pilha balança, em graus: as fileiras de cima, mais. */
  readonly wobble?: number;
};

/** A pilha das caixas do dia na entrada da loja, cada uma com a etiqueta de uma lembrança. */
export const Pile: React.FC<PileProps> = ({ count, falling, wobble = 0 }) => (
  <SvgLayer>
    {PILE.slice(0, count).map(([, row], index) => {
      const [x, y] = pileSpot(index);
      const last = index === count - 1 && falling !== undefined;
      return (
        // A pilha balança em volta do pé dela, e cada fileira um pouco mais que a de baixo.
        <g
          key={index}
          transform={`rotate(${wobble * row} ${PILE_SPOT.x} ${FLOOR_Y})`}
        >
          <Crate
            x={x}
            y={y - (last ? falling.height : 0)}
            scale={PILE_SPOT.scale}
            squash={last ? falling.squash : 1}
            memory={MEMORIES[index]}
          />
        </g>
      );
    })}
  </SvgLayer>
);

/** A loja por dentro, em plano médio: da entrada, à esquerda, até quase o depósito. */
export const INSIDE_MEDIUM = framing([830, 610], 1.15);
// A câmera começa mais aberta, assenta e deriva até o plano médio: em quantos quadros assenta.
const ENTER_FRAMES = 24;
const INSIDE_FAR = framing([830, 610], 0.82);
const INSIDE_NEAR = framing([830, 610], 1.11);
/** O balcão: onde a lojista atende, onde o freguês da vez fica e onde o seguinte espera. */
export const KEEPER_X = 1250;
export const COUNTER = { x: 960, wait: 730 };
/** A altura de cada freguês, na ordem de `SHOPPERS`. */
export const SHOPPER_HEIGHT = [440, 420, 430] as const;
// Quem entra e quem sai passa pela entrada, à esquerda: some atrás do batente dela.
const DOOR_JAMB = ENTRANCE.x + 18;
const OUTSIDE = DOOR_JAMB - 130;
// A área das prateleiras, com folga: o que o véu de parede cobre.
const SHELF_VEIL = {
  left: SHELVES.x - 60,
  right: SHELVES.x + SHELVES.width + 60,
  top: 180,
};

/**
 * A prateleira recua: por cima dela vai a própria parede, no mesmo degradê,
 * quase opaca. Fora da prateleira o véu não se vê; sobre ela, as bolas perdem
 * cor e contraste, e a lojista e os fregueses, que ficam na frente, deixam de
 * se misturar com elas. `amount` vai de 0 (sem véu) a 1.
 */
export const ShelfVeil: React.FC<{ amount?: number }> = ({ amount = 1 }) => (
  <AbsoluteFill
    style={{
      background: `linear-gradient(${shopInside.day.wall[0]}, ${shopInside.day.wall[1]})`,
      clipPath: `inset(${SHELF_VEIL.top}px ${1920 - SHELF_VEIL.right}px ${1080 - FLOOR_Y}px ${SHELF_VEIL.left}px)`,
      opacity: 0.64 * amount,
    }}
  />
);
// O braço de quem recebe: pousado, erguido para a mercadoria, e de volta com ela na mão.
const TAKE = {
  rest: [150, -310],
  up: [160, -412],
  kept: [124, -330],
} as const;
// Os tempos do balcão, em quadros: o braço dela se estica, a mercadoria troca de mão, ele recolhe o braço.
const HAND_OVER = { reach: 6, lower: 8 };
// A primeira freguesa sai: vira-se e anda até a porta.
const LEAVE = { turn: 6, frames: 62 };
// O segundo avança até o balcão, e o terceiro entra pela porta.
const ADVANCE = { after: 20, frames: 22 };
const ARRIVE = { before: 35, frames: 48 };
// Ela olha para as caixas: quanto o corpo pende, quanto ela avança, e por quantos quadros, até ser chamada.
const GLANCE = { lean: 6, step: 12, frames: 10, hold: 8, back: 10 };
// A caixa que chega cai sobre a pilha, que balança: graus, quadros e idas e voltas.
const WOBBLE = { degrees: 3.2, frames: 22, turns: 2 };

type BusyViewProps = {
  /** O quadro do plano que se desenha. */
  readonly at: number;
  /** Quadros do plano em que ela atende a primeira freguesa, em que olha para as caixas e em que a caixa cai. */
  readonly serveAt: number;
  readonly glanceAt: number;
  readonly crateAt: number;
  readonly seconds: number;
  /** Os três que vêm da calçada ainda estão a caminho: quem os desenha é a passagem, por cima da loja. */
  readonly arriving?: boolean;
  /** Quanto do véu das prateleiras já entrou, de 0 a 1: ele chega com a parede, de que é feito. Por padrão, inteiro. */
  readonly veil?: number;
};

/** Dentro da loja, de dia: a lojista atende um freguês atrás do outro, e as caixas se empilham na entrada. */
const BusyView: React.FC<BusyViewProps> = ({
  at,
  serveAt,
  glanceAt,
  crateAt,
  seconds,
  arriving: onTheWay = false,
  veil = 1,
}) => {
  // A primeira freguesa (de roxo) recebe a mercadoria, vira-se e sai pela porta.
  const firstGot = serveAt + HAND_OVER.reach;
  const firstLeaves = firstGot + HAND_OVER.lower + 2;
  const leaving = stroll({
    from: COUNTER.x,
    to: OUTSIDE,
    at: firstLeaves + 2,
    frames: LEAVE.frames,
    now: at,
    height: SHOPPER_HEIGHT[2],
  });
  const turned = ramp(at, firstLeaves, LEAVE.turn);
  // O segundo (de laranja) avança da espera até o balcão.
  const advancing = stroll({
    from: COUNTER.wait,
    to: COUNTER.x,
    at: firstLeaves + ADVANCE.after,
    frames: ADVANCE.frames,
    now: at,
    height: SHOPPER_HEIGHT[0],
  });
  const secondAt = firstLeaves + ADVANCE.after + ADVANCE.frames + 6;
  const secondGot = secondAt + HAND_OVER.reach;
  // Ela olha para a pilha, e ele a chama de volta: acena, e ela volta ao balcão.
  const glance =
    ramp(at, glanceAt, GLANCE.frames) -
    ramp(at, glanceAt + GLANCE.frames + GLANCE.hold, GLANCE.back) +
    shake(at, glanceAt + GLANCE.frames + GLANCE.hold + GLANCE.back, 8, 0.12, 1);
  const callAt = glanceAt + GLANCE.frames;
  const calling = flash(at, callAt, 20) ** 0.6;
  const backAt = glanceAt + GLANCE.frames + GLANCE.hold + GLANCE.back;
  // O terceiro (de amarelo) entra pela porta e para na espera.
  const arriving = stroll({
    from: OUTSIDE,
    to: COUNTER.wait,
    at: crateAt - ARRIVE.before,
    frames: ARRIVE.frames,
    now: at,
    height: SHOPPER_HEIGHT[1],
  });
  // O braço dela: oferece, estica para entregar, recolhe; baixa quando olha as caixas; e oferece de novo.
  const give = (start: number) =>
    ramp(at, start, HAND_OVER.reach) - ramp(at, start + HAND_OVER.reach, 6);
  const reach =
    1 +
    give(serveAt) +
    give(secondAt) -
    clamp01(glance) +
    // Oferecendo, a mão dela sobe e desce um pouco.
    0.08 * wave(seconds, 2.3);
  // A mercadoria na mão dela: some quando troca de mão, e outra aparece antes do freguês seguinte.
  const item =
    at < firstGot
      ? 1
      : at < secondGot
        ? popScale(at, secondAt - 14, 9, 0, 1.06) *
          (at >= secondAt - 14 ? 1 : 0)
        : popScale(at, backAt, 9, 0, 1.06) * (at >= backAt ? 1 : 0);
  const itemColor =
    at < firstGot
      ? goods.items[1]
      : at < secondGot
        ? goods.items[2]
        : goods.items[0];
  /** O braço de um freguês que recebe a mercadoria em `got`, e a mercadoria na mão dele depois. */
  const taking = (got: number, color: string) => {
    const up = ramp(at, got - HAND_OVER.reach - 2, HAND_OVER.reach);
    const down = ramp(at, got, HAND_OVER.lower);
    const hand: [number, number] = [
      mix(mix(TAKE.rest[0], TAKE.up[0], up), TAKE.kept[0], down),
      mix(mix(TAKE.rest[1], TAKE.up[1], up), TAKE.kept[1], down),
    ];
    return {
      backArm: { hand, bend: 20 },
      held:
        at >= got ? (
          <circle cx={hand[0] + 6} cy={hand[1] - 40} r={30} fill={color} />
        ) : undefined,
    };
  };
  // A caixa que chega: cai, bate e a pilha balança.
  const fallen = drop(at, crateAt, FALL.frames);
  const landed = crateAt + FALL.frames;

  return (
    <ShopInside time="day">
      <ShelfGoods />
      {veil > 0 ? <ShelfVeil amount={veil} /> : null}
      <Pile
        count={at >= crateAt ? PILE.length : PILE.length - 1}
        falling={
          at >= crateAt
            ? {
                height: FALL.height * (1 - fallen),
                squash: 1 - FALL.squash * flash(at, landed - 1, 7),
              }
            : undefined
        }
        wobble={shake(at, landed, WOBBLE.frames, WOBBLE.degrees, WOBBLE.turns)}
      />
      {/* Quem entra e quem sai some atrás do batente da entrada. */}
      <AbsoluteFill style={{ clipPath: `inset(0 0 0 ${DOOR_JAMB}px)` }}>
        <SvgLayer>
          {[
            leaving.x,
            advancing.x,
            arriving.x,
            KEEPER_X - GLANCE.step * glance,
          ].map((x, index) => (
            <ellipse
              key={index}
              cx={x}
              cy={FLOOR_Y + 12}
              rx={130}
              ry={16}
              fill={idea.lilac.contact}
              opacity={0.3}
            />
          ))}
        </SvgLayer>
        {onTheWay ? null : (
          <>
            <Place
              x={0}
              y={0}
              anchor="bottom"
              style={{
                translate: `calc(-50% + ${leaving.x}px) calc(-100% + ${FLOOR_Y + 10}px)`,
                // Ela se vira para a porta: o corpo passa de frente para o balcão a de frente para a saída.
                scale: `${mix(1, -1, turned)} ${breath(seconds, "queue-first")}`,
              }}
            >
              <Person
                height={SHOPPER_HEIGHT[2]}
                colors={SHOPPERS[2]}
                plainFace
                stride={leaving.stride}
                {...taking(firstGot, goods.items[1])}
              />
            </Place>
            <Place
              x={0}
              y={0}
              anchor="bottom"
              style={{
                translate: `calc(-50% + ${advancing.x}px) calc(-100% + ${FLOOR_Y + 10}px)`,
                scale: `1 ${breath(seconds, "queue-0")}`,
                // Parado no balcão, o peso troca de pé.
                rotate: `${0.9 * wave(seconds, 3.7, 0.3)}deg`,
              }}
            >
              <Person
                height={SHOPPER_HEIGHT[0]}
                colors={SHOPPERS[0]}
                plainFace
                stride={advancing.stride}
                // Com ela de olho nas caixas, ele ergue o outro braço e acena.
                frontArm={{
                  hand: [
                    mix(-136, -168, calling) +
                      16 * calling * wave(seconds, 0.36),
                    mix(-214, -470, calling),
                  ],
                  bend: mix(26, -20, calling),
                }}
                {...taking(secondGot, goods.items[2])}
              />
            </Place>
          </>
        )}
        <Place
          x={0}
          y={0}
          anchor="bottom"
          style={{
            translate: `calc(-50% + ${arriving.x}px) calc(-100% + ${FLOOR_Y + 10}px)`,
            scale: `1 ${breath(seconds, "queue-1")}`,
            rotate: `${0.9 * wave(seconds, 4.3, 0.7)}deg`,
          }}
        >
          <Person
            height={SHOPPER_HEIGHT[1]}
            colors={SHOPPERS[1]}
            plainFace
            stride={arriving.stride}
            // Na fila, o braço de trás fica junto do corpo: solto, a mão encostava na do freguês da frente.
            backArm={TUCKED}
          />
        </Place>
      </AbsoluteFill>
      {onTheWay ? null : (
        <Keeper
          x={KEEPER_X - GLANCE.step * glance}
          seconds={seconds}
          flip
          lean={GLANCE.lean * glance}
          // De olho nas caixas, o rosto é o de quem repara; a troca acontece com a pálpebra fechada.
          expression={
            at >= glanceAt + 3 && at < backAt - GLANCE.back + 4
              ? "curious"
              : "neutral"
          }
          blink={Math.max(
            blink(seconds, "keeper"),
            flash(at, glanceAt, 6),
            flash(at, backAt - GLANCE.back + 1, 6),
          )}
          {...serving(reach, item, itemColor)}
        />
      )}
    </ShopInside>
  );
};

type PassingProps = {
  /** Quanto do caminho já foi feito, de 0 (na calçada) a 1 (no lugar, dentro da loja). */
  readonly moved: number;
  /** A câmera da loja de dentro neste quadro: diz onde o lugar de cada um cai na tela. */
  readonly camera: CameraState;
  /** Para que lado a freguesa de roxo está virada, de -1 (como andava na calçada) a 1 (para o balcão). */
  readonly facing: number;
  readonly seconds: number;
};

/**
 * Os três que a rua e a loja têm em comum (o freguês de laranja, a freguesa de
 * roxo e a lojista) na troca: não saem nem entram. Vão de onde estavam na
 * calçada até o lugar deles no balcão, mudando de tamanho no caminho, por cima
 * da rua que desce e da loja que sobe. Chegam na pose em que `BusyView` os recebe.
 */
const Passing: React.FC<PassingProps> = ({
  moved,
  camera,
  facing,
  seconds,
}) => {
  /** O pé e a altura de quem vai de um lugar da calçada a um lugar do chão da loja. */
  const path = (
    from: { readonly x: number; readonly y: number; readonly height: number },
    x: number,
    height: number,
  ) => {
    const to = seen(camera, [x, FLOOR_Y + 10]);
    return {
      x: mix(from.x, to[0], moved),
      y: mix(from.y, to[1], moved),
      height: mix(from.height, height * camera.zoom, moved),
    };
  };
  const buyer = path(ON_STREET.buyer, COUNTER.wait, SHOPPER_HEIGHT[0]);
  const walker = path(ON_STREET.walker, COUNTER.x, SHOPPER_HEIGHT[2]);
  const keeper = path(ON_STREET.keeper, KEEPER_X, 520);
  const at = (x: number, y: number) =>
    `calc(-50% + ${x}px) calc(-100% + ${y}px)`;

  return (
    // São os mesmos do plano anterior: o palco não os põe nem os tira.
    <Stay>
      <Place
        x={0}
        y={0}
        anchor="bottom"
        style={{
          translate: at(buyer.x, buyer.y),
          scale: `1 ${mix(breath(seconds, "buyer"), breath(seconds, "queue-0"), moved)}`,
          rotate: `${0.9 * moved * wave(seconds, 3.7, 0.3)}deg`,
        }}
      >
        <Person
          height={buyer.height}
          colors={SHOPPERS[0]}
          plainFace
          backArm={{
            hand: [150, -310 - 8 * (1 - moved) * wave(seconds, 2.3, 0.15)],
            bend: 20,
          }}
        />
      </Place>
      {/* A freguesa de roxo se vira para o balcão e passa por trás da lojista, até o outro lado dela. */}
      <Place
        x={0}
        y={0}
        anchor="bottom"
        style={{
          translate: at(walker.x, walker.y),
          scale: `${facing} ${mix(breath(seconds, "walker-1"), breath(seconds, "queue-first"), moved)}`,
        }}
      >
        <Person
          height={walker.height}
          colors={SHOPPERS[2]}
          plainFace
          backArm={{
            hand: [mix(134, 150, moved), mix(-252, -310, moved)],
            bend: mix(28, 20, moved),
          }}
        />
      </Place>
      <AbsoluteFill
        style={{ translate: `${keeper.x}px ${keeper.y - FLOOR_Y - 10}px` }}
      >
        <Keeper
          x={0}
          height={keeper.height}
          seconds={seconds}
          flip
          blink={blink(seconds, "keeper")}
          {...serving(
            1 + mix(0.12, 0.08, moved) * wave(seconds, 2.3),
            1,
            goods.items[1],
          )}
        />
      </AbsoluteFill>
    </Stay>
  );
};

type BusyShotProps = Omit<BusyViewProps, "at" | "seconds" | "arriving"> & {
  readonly clock: number;
};

/**
 * A loja por dentro toma o lugar da rua: a parede toma a cor, a loja sobe com
 * o chão dela, e os três da porta vão para o balcão sem sair da tela. O plano
 * fica com a lojista e os fregueses.
 */
const BusyShot: React.FC<BusyShotProps> = ({ clock, ...cues }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const length = useShotLength();
  const seconds = (clock + frame) / fps;
  const camera = cameraBetween(
    cameraBetween(INSIDE_FAR, INSIDE_NEAR, ramp(frame, 0, ENTER_FRAMES)),
    INSIDE_MEDIUM,
    linear(frame, ENTER_FRAMES, length - ENTER_FRAMES),
  );
  const passing = frame < PASSAGE;
  const built = useBuild();
  const stage = useStage();
  const wall = linear(frame, WALL.at, WALL.frames);

  return (
    <AbsoluteFill>
      {/* A passagem é contada daqui: a loja sobe no tempo dela (quando os três chegam, o chão deles está
          no lugar) e a parede espera a rua sair. Depois vale o palco, que tira a loja de cena. */}
      <Build
        {...built}
        lit={wall}
        risen={built.lit < 1 ? stage.enter(0, PASSAGE - 2) : built.risen}
      >
        <Camera {...camera}>
          <Layer depth={1}>
            <BusyView
              at={frame}
              seconds={seconds}
              arriving={passing}
              veil={wall}
              {...cues}
            />
          </Layer>
        </Camera>
      </Build>
      {passing ? (
        <Passing
          moved={ramp(frame, 0, PASSAGE)}
          camera={camera}
          facing={mix(-1, 1, linear(frame, TURN_AROUND.at, TURN_AROUND.frames))}
          seconds={seconds}
        />
      ) : null}
      <Grain />
    </AbsoluteFill>
  );
};

/**
 * O plano que abre a cena, antes de qualquer deixa: o último plano de
 * `memory-result` o desenha com `Prelude`, e a lista já sobe e a cabeça já cresce enquanto a estante
 * encolhe. `clock` é o quadro do vídeo em que a cena começa, e `until`, quantos quadros faltam para ela.
 */
export const StockroomOpening: React.FC<{ clock: number; until: number }> = ({
  clock,
  until,
}) => <HeadShot brainAt={NEVER} clock={clock} until={until} />;

export const StockroomScene: React.FC<SceneProps> = ({ scene, shots }) => {
  const brainAt = cue(scene, "cérebro");
  return (
    <>
      <Shot
        range={shots[0]}
        name="a lista sobe até a cabeça; o cérebro aparece"
      >
        <Preluded lead={HEAD_LEAD}>
          <HeadShot brainAt={brainAt} clock={scene.from} />
        </Preluded>
      </Shot>
      <Shot range={shots[1]} name="o cérebro vira a loja aberta">
        <OpenShopShot
          // Os fregueses só entram com a rua já montada.
          walkAt={Math.max(
            cue(scene, "passa") - shots[1].from,
            TURN.keeperAt - 2,
          )}
          crateAt={cue(scene, "recebendo") - shots[1].from}
          before={shots[0].to - shots[0].from}
          brainAt={brainAt}
          clock={scene.from + shots[1].from}
        />
      </Shot>
      <Shot range={shots[2]} name="fregueses no balcão, caixas na entrada">
        <BusyShot
          // Ela só atende com os três já no lugar.
          serveAt={Math.max(
            cue(scene, "aberta", 2) - shots[2].from,
            PASSAGE + 8,
          )}
          glanceAt={cue(scene, "guardar") - shots[2].from}
          crateAt={cue(scene, "chega") - shots[2].from}
          clock={scene.from + shots[2].from}
        />
      </Shot>
    </>
  );
};
