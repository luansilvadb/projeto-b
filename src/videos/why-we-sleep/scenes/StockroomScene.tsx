import {
  AbsoluteFill,
  interpolateColors,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Brain } from "../../../art/Brain";
import { Person, type PersonColors } from "../../../art/Person";
import type { StorefrontColors } from "../../../art/Storefront";
import {
  Camera,
  Layer,
  cameraBetween,
  framing,
  type CameraState,
} from "../../../components/Camera";
import { FlatStage, Stay } from "../../../components/Cast";
import { Grain } from "../../../components/Grain";
import { blink, breath, wave } from "../../../components/Idle";
import { Place } from "../../../components/Place";
import { popOpacity, popScale } from "../../../components/Pop";
import { SvgLayer } from "../../../components/SvgLayer";
import { cue, drop, linear, mix, ramp, clamp01 } from "../../../components/timing";
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
  shop,
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
import {
  flash,
  NEVER,
  Preluded,
  shake,
  Sooner,
  Standing,
} from "./MaybeBrainScene";
import { centeredAt } from "./MemoryTestScene";

/** O cérebro da comparação: cheio, na cor quente das etiquetas, com as dobras num tom abaixo. */
export const SHOP_BRAIN = { fill: ink.tag, line: ink.tagEdge };
// A cor do brilho: a silhueta clara por que o cérebro passa para virar a loja.
const BRIGHT = ink.ring;

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
  /** Quanto o cérebro já virou a silhueta clara, de 0 a 1. */
  readonly bright?: number;
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
  bright = 0,
  until = 0,
}) => {
  const { fps } = useVideoConfig();
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
          <ProfileHead
            size={HEAD.size}
            colors={SUBJECTS[0]}
            open={open}
            openColor={idea.peach.spot}
          />
        </Place>
      </Sooner>
      {lit ? (
        <Stay>
          <div
            style={{
              position: "absolute",
              left: BRAIN_SPOT.x,
              top: BRAIN_SPOT.y,
              translate: `-50% calc(-50% + ${5 * wave(seconds, 4.8)}px)`,
              scale: `${popScale(at, brainAt, frames) * pulse}`,
              opacity: popOpacity(at, brainAt, frames),
            }}
          >
            <Brain
              width={HEAD_BRAIN.width}
              color={interpolateColors(
                bright,
                [0, 1],
                [SHOP_BRAIN.line, BRIGHT],
              )}
              fill={interpolateColors(
                bright,
                [0, 1],
                [SHOP_BRAIN.fill, BRIGHT],
              )}
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
          }}
        >
          <SyllableSheet
            width={mix(LIST.from.width, LIST.to.width, risen)}
            lit={KEPT}
          />
        </Place>
      </Stay>
      <SvgLayer>
        {KEPT_CHIPS.map((chip, order) => {
          const start = brainAt + FLIGHT.after + order * FLIGHT.step;
          if (at < start || bright >= 1) {
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
              opacity={1 - bright}
            />
          );
        })}
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
export const STEP = 0.27;

/** Quanto do caminho já foi andado, de 0 a 1, com `t` de 0 a 1: reta, e uma freada no fim que termina parada. */
export const walked = (t: number, brake = 0.75): number => {
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

const STREET_BRAIN = { x: FRONT.x, y: 470, width: 760 };
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
// A porta da loja, por onde a câmera entra no fim do plano.
const DOORWAY = [
  FRONT.x + (140 * FRONT.width) / 520,
  FRONT.ground - (170 * FRONT.width) / 520,
] as const;
// O cérebro vira a loja: a câmera entra nele, ele clareia, a silhueta clara da fachada toma o
// lugar dele, a rua abre em volta numa janela redonda e as cores chegam. Em quadros.
const TURN = {
  push: 12,
  brightAt: 7,
  bright: 4,
  windowAt: 11,
  window: 14,
  brainOutAt: 13,
  brainOut: 3,
  colorAt: 15,
  color: 7,
  streetAt: 13,
  street: 16,
};
// O plano começa um pouco mais aberto e deriva até o quadro composto; no fim, a câmera entra pela porta.
const OPEN_START = framing([960, 560], 0.95);
const TURNING = framing([960, 520], 1.12);
const DOOR_IN = framing(DOORWAY, 3.1);
/** Em quantos quadros a câmera entra na loja, a partir do fim do plano da rua. */
const ENTER_FRAMES = 24;

/** A câmera do plano da rua, quadro a quadro: além do fim dele, é a entrada pela porta. */
const streetCamera = (frame: number, length: number): CameraState =>
  frame <= length
    ? cameraBetween(
        TURNING,
        cameraBetween(OPEN_START, FRONT_WIDE, linear(frame, 0, length)),
        ramp(frame, TURN.windowAt, TURN.window),
      )
    : cameraBetween(FRONT_WIDE, DOOR_IN, ramp(frame, length, ENTER_FRAMES));

/** As cores da loja a caminho da silhueta clara (0) para as do dia (1). */
const fromSilhouette = (t: number): StorefrontColors => {
  const toward = (color: string) =>
    interpolateColors(t, [0, 1], [BRIGHT, color]);
  const day = shop.day;
  return {
    ...day,
    wall: toward(day.wall),
    wallShade: toward(day.wallShade),
    base: toward(day.base),
    sign: toward(day.sign),
    signIcon: toward(day.signIcon),
    awning: [toward(day.awning[0]), toward(day.awning[1])],
    awningRail: toward(day.awningRail),
    glass: toward(day.glass),
    glassShine: toward(day.glassShine),
    frame: toward(day.frame),
    goods: [toward(day.goods[0]), toward(day.goods[1])],
    door: toward(day.door),
    doorShade: toward(day.doorShade),
    knob: toward(day.knob),
    shutter: toward(day.shutter),
    shutterLine: toward(day.shutterLine),
    lamp: toward(day.lamp),
  };
};

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

/** A câmera entra no cérebro, que vira a fachada da loja, movimentada de dia: fregueses chegam, caixas descem, a lojista atende. */
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
  const seconds = (clock + frame) / fps;
  const pushed = ramp(frame, 0, TURN.push);
  const bright = linear(frame, TURN.brightAt, TURN.bright);
  const turning = frame < TURN.windowAt + TURN.window;
  // A janela redonda por onde a rua aparece nasce escondida atrás do cérebro claro e abre até o quadro.
  const window = mix(200, 1300, ramp(frame, TURN.windowAt, TURN.window));
  const brainOut = linear(frame, TURN.brainOutAt, TURN.brainOut);
  // A lojista oferece a mercadoria ao freguês da porta: o braço sobe e desce um pouco.
  const offer = serving(1 + 0.12 * wave(seconds, 2.3), 1, goods.items[1]);

  return (
    <AbsoluteFill>
      {turning ? (
        <>
          <IdeaBackdrop hue="peach" spot={[0.58, 0.45]} />
          {/* O plano anterior, parado onde ficou: a câmera entra no cérebro, que vai para o meio do quadro e clareia. */}
          <AbsoluteFill
            style={{
              transformOrigin: `${BRAIN_SPOT.x}px ${BRAIN_SPOT.y}px`,
              translate: `${(STREET_BRAIN.x - BRAIN_SPOT.x) * pushed}px ${(STREET_BRAIN.y - BRAIN_SPOT.y) * pushed}px`,
              scale: `${(STREET_BRAIN.width / HEAD_BRAIN.width) ** pushed}`,
            }}
          >
            <HeadPicture
              at={before + frame}
              brainAt={brainAt}
              seconds={seconds}
              bright={bright}
            />
          </AbsoluteFill>
        </>
      ) : null}
      {frame >= TURN.windowAt ? (
        <AbsoluteFill
          style={{
            clipPath: turning
              ? `circle(${window}px at ${STREET_BRAIN.x}px ${STREET_BRAIN.y}px)`
              : undefined,
          }}
        >
          {/* Este plano faz a própria passagem: a rua não sobe nem desce com o palco. */}
          <Standing>
            <ShopFront
              halo={1}
              time="day"
              shutter={0}
              clock={clock}
              camera={streetCamera(frame, length)}
              built={ramp(frame, TURN.streetAt, TURN.street)}
              colors={
                frame < TURN.colorAt + TURN.color
                  ? fromSilhouette(ramp(frame, TURN.colorAt, TURN.color))
                  : undefined
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
              {/* Na porta, a lojista entrega a mercadoria a um freguês: os dois já estão lá quando a loja aparece. */}
              <Grown origin={[FRONT.x - 110, FRONT.ground + 40]} at={17}>
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
                    backArm={{
                      hand: [150, -310 - 8 * wave(seconds, 2.3, 0.15)],
                      bend: 20,
                    }}
                  />
                </Place>
              </Grown>
              <Grown origin={[FRONT.x + 190, FLOOR_Y + 10]} at={19}>
                <Keeper
                  x={FRONT.x + 190}
                  height={420}
                  seconds={seconds}
                  flip
                  blink={blink(seconds, "keeper")}
                  {...offer}
                />
              </Grown>
            </ShopFront>
          </Standing>
        </AbsoluteFill>
      ) : null}
      {/* A silhueta clara do cérebro some sobre a da fachada, que é da mesma cor: uma forma vira a outra. */}
      {frame >= TURN.windowAt && brainOut < 1 ? (
        <div
          style={{
            position: "absolute",
            left: STREET_BRAIN.x,
            top: STREET_BRAIN.y,
            translate: "-50% -50%",
            opacity: 1 - brainOut,
            scale: `${1 + 0.12 * brainOut}`,
          }}
        >
          <Brain width={STREET_BRAIN.width} color={BRIGHT} fill={BRIGHT} />
        </div>
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
// A câmera entra pela porta mais aberta, assenta e deriva até o plano médio.
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
};

/** Dentro da loja, de dia: a lojista atende um freguês atrás do outro, e as caixas se empilham na entrada. */
const BusyView: React.FC<BusyViewProps> = ({
  at,
  serveAt,
  glanceAt,
  crateAt,
  seconds,
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
      <ShelfVeil />
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
                mix(-136, -168, calling) + 16 * calling * wave(seconds, 0.36),
                mix(-214, -470, calling),
              ],
              bend: mix(26, -20, calling),
            }}
            {...taking(secondGot, goods.items[2])}
          />
        </Place>
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
          />
        </Place>
      </AbsoluteFill>
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
    </ShopInside>
  );
};

type BusyShotProps = Omit<BusyViewProps, "at" | "seconds"> & {
  /** A duração do plano da rua: a câmera dele, que entra pela porta, diz onde a loja de dentro aparece. */
  readonly before: number;
  readonly clock: number;
};

/** A câmera entra pela porta: a loja de dentro abre a partir dela, e o plano fica com a lojista e os fregueses. */
const BusyShot: React.FC<BusyShotProps> = ({ before, clock, ...cues }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const length = useShotLength();
  const entered = ramp(frame, 0, ENTER_FRAMES);
  // A porta da fachada, onde o plano da rua a põe na tela enquanto a câmera dele entra por ela.
  const door = seen(streetCamera(before + frame, before), DOORWAY);
  const half = [mix(0, 1300, entered), mix(0, 800, entered)];
  const camera = cameraBetween(
    cameraBetween(INSIDE_FAR, INSIDE_NEAR, entered),
    INSIDE_MEDIUM,
    linear(frame, ENTER_FRAMES, length - ENTER_FRAMES),
  );

  return (
    <AbsoluteFill
      style={{
        clipPath:
          entered < 1
            ? `inset(${Math.max(0, door[1] - half[1])}px ${Math.max(0, 1920 - door[0] - half[0])}px ${Math.max(0, 1080 - door[1] - half[1])}px ${Math.max(0, door[0] - half[0])}px round ${60 * (1 - entered)}px)`
            : undefined,
      }}
    >
      {/* A passagem é a da câmera: a loja não sobe nem desce com o palco. */}
      <Standing>
        <Camera {...camera}>
          <Layer depth={1}>
            <BusyView at={frame} seconds={(clock + frame) / fps} {...cues} />
          </Layer>
        </Camera>
      </Standing>
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
            TURN.windowAt + 8,
          )}
          crateAt={cue(scene, "recebendo") - shots[1].from}
          before={shots[0].to - shots[0].from}
          brainAt={brainAt}
          clock={scene.from + shots[1].from}
        />
      </Shot>
      <Shot range={shots[2]} name="fregueses no balcão, caixas na entrada">
        <BusyShot
          serveAt={cue(scene, "aberta", 2) - shots[2].from}
          glanceAt={cue(scene, "guardar") - shots[2].from}
          crateAt={cue(scene, "chega") - shots[2].from}
          before={shots[1].to - shots[1].from}
          clock={scene.from + shots[2].from}
        />
      </Shot>
    </>
  );
};
