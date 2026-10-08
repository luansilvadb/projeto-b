import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { Person } from "../../../art/Person";
import { Storefront } from "../../../art/Storefront";
import {
  Build,
  Camera,
  Layer,
  cameraBetween,
  framing,
  useBuild,
} from "../../../components/Camera";
import { Cast, Stay, Troupe } from "../../../components/Cast";
import { Grain } from "../../../components/Grain";
import { blink, breath, wave } from "../../../components/Idle";
import { Place } from "../../../components/Place";
import { Pop } from "../../../components/Pop";
import { SvgLayer } from "../../../components/SvgLayer";
import { cue, drop, linear, mix, ramp, shake } from "../../../components/timing";
import type { SceneProps } from "../../../video/NarratedVideo";
import { Shot, useShotLength } from "../../../video/Shot";
import {
  goods,
  idea,
  ink,
  personInPajamas,
  shop,
  shopInside,
  street,
} from "../palette";
import { Bed, bedHead } from "../parts/Bed";
import { IdeaBackdrop } from "../parts/IdeaBackdrop";
import {
  CRATE,
  Crate,
  FLOOR_Y,
  Keeper,
  MemoryTag,
  STOCKROOM,
  STOCK_SHELVES,
  ShelfGoods,
  ShopInside,
} from "../parts/ShopInside";
import { Tag } from "../parts/Tag";
import { lampAt } from "./ButWhatScene";
import { flash, Prelude, Sooner, Standing } from "./MaybeBrainScene";
import { STUDIED_LEAD, StockroomSolidOpening } from "./StockroomSolidScene";
import {
  COUNTER,
  INSIDE_MEDIUM,
  KEEPER_X,
  MEMORIES,
  PILE,
  PILE_SPOT,
  Pile,
  pileSpot,
  serving,
  ShelfVeil,
  SHOPPER_HEIGHT,
  SHOPPERS,
  stroll,
} from "./StockroomScene";

// Onde cada caixa guardada pousa no depósito: duas por tábua, de cima para baixo.
const STORED = STOCK_SHELVES.flatMap((y) =>
  [-80, 80].map((dx) => [STOCKROOM.x + STOCKROOM.width / 2 + dx, y] as const),
);
const STORED_SCALE = 0.9;
/** A caixa guardada em cada lugar do depósito: a pilha é desfeita de cima para baixo. */
const storedMemory = (slot: number) => MEMORIES[PILE.length - 1 - slot];

type StoredProps = {
  /** Quantas caixas já estão no depósito. */
  readonly count: number;
};

/** As caixas já guardadas nas tábuas do depósito, com a etiqueta à vista. */
const Stored: React.FC<StoredProps> = ({ count }) => (
  <SvgLayer>
    {STORED.slice(0, count).map(([x, y], slot) => (
      <Crate
        key={slot}
        x={x}
        y={y}
        scale={STORED_SCALE}
        memory={storedMemory(slot)}
      />
    ))}
  </SvgLayer>
);

// A lojista tem 520 de altura: o desenho dela, de 650, vai a 0,8.
const KEEPER_SCALE = 520 / 650;
// Os braços dela: soltos, e segurando uma caixa diante do corpo.
const ARMS = {
  loose: { front: [-136, -214, 26], back: [100, -214, 73] },
  holding: { front: [-30, -236, 30], back: [150, -236, 30] },
} as const;
// A caixa nas mãos dela, nas unidades do desenho da pessoa.
const IN_HANDS = { x: 60, y: -180, scale: 1.2 };

type Spot = readonly [x: number, y: number, scale: number];

/** A caixa a caminho de um lugar para outro, num arco: de `from` a `to`, com `t` de 0 a 1. */
const between = (from: Spot, to: Spot, t: number, arc: number): Spot => [
  mix(from[0], to[0], t),
  mix(from[1], to[1], t) - arc * Math.sin(Math.PI * t),
  mix(from[2], to[2], t),
];

/** Onde a caixa que ela segura fica no chão da loja, com ela em `x`, virada para `facing`. */
const inHands = (x: number, facing: number, lift = 0): Spot => [
  x + facing * IN_HANDS.x * KEEPER_SCALE,
  FLOOR_Y + 10 + (IN_HANDS.y - lift) * KEEPER_SCALE,
  IN_HANDS.scale * KEEPER_SCALE,
];

/** Os dois braços entre soltos (0) e segurando a caixa (1), com as mãos erguidas `lift` unidades. */
const arms = (holding: number, lift = 0) => {
  const arm = (side: "front" | "back") => ({
    hand: [
      mix(ARMS.loose[side][0], ARMS.holding[side][0], holding),
      mix(ARMS.loose[side][1], ARMS.holding[side][1], holding) - lift,
    ] as [number, number],
    bend: mix(ARMS.loose[side][2], ARMS.holding[side][2], holding),
  });
  return { frontArm: arm("front"), backArm: arm("back") };
};

// De onde ela pega a caixa, ao lado da pilha, e onde a guarda, na boca do depósito.
const PATH = { pile: PILE_SPOT.x + 240, depot: STOCKROOM.x - 70 };
// A porta de enrolar desce com peso: em quantos segundos.
const SHUTTER_SECONDS = 1;
// A viagem com a caixa: os tempos, em quadros, a partir do instante em que ela a pega.
const TRIP = {
  toPile: 46,
  bend: 8,
  lift: 9,
  turn: 6,
  toDepot: 50,
  shelve: 10,
  back: 54,
};
// Os fregueses que ficaram do plano anterior saem encolhendo, cada um no seu ponto, como todo elenco que não continua.
const SHRINK = { frames: 10, gap: 3 };
// A câmera acompanha a lojista: primeiro até a pilha, depois, recuando, até o depósito.
const BY_PILE = framing([770, 610], 1.15);
const CARRY_WIDE = framing([960, 600], 1.04, [960, 600]);

type CarryViewProps = {
  /** O quadro do plano que se desenha: o plano seguinte o continua, dentro da lente. */
  readonly at: number;
  /** Quadros do plano em que a porta começa a descer e em que ela pega a primeira caixa. */
  readonly shutAt: number;
  readonly grabAt: number;
  readonly seconds: number;
  readonly fps: number;
  /** Só a loja de porta baixada: dentro da lente, a porta já desceu. */
  readonly nightOnly?: boolean;
};

/** A câmera do plano, quadro a quadro: acompanha a lojista, e treme quando a porta bate no chão. */
const carryCamera = ({ at, shutAt, grabAt, fps }: CarryViewProps) => {
  const followed = cameraBetween(
    cameraBetween(
      INSIDE_MEDIUM,
      BY_PILE,
      ramp(at, grabAt - TRIP.toPile - 8, TRIP.toPile),
    ),
    CARRY_WIDE,
    ramp(at, grabAt + TRIP.lift + 4, TRIP.toDepot + 6),
  );
  return {
    ...followed,
    y: followed.y + shake(at, shutAt + SHUTTER_SECONDS * fps, 9, 7, 1.5),
  };
};

/** A porta de enrolar baixa, e a lojista carrega as caixas da entrada para o depósito dos fundos. */
const CarryView: React.FC<CarryViewProps> = (props) => {
  const { at, shutAt, grabAt, seconds, fps, nightOnly = false } = props;
  const lowered = ramp(at, shutAt, SHUTTER_SECONDS * fps);
  // Ela baixa o braço do balcão, anda até a pilha, pega a caixa de cima, vira-se, leva ao depósito, guarda e volta.
  const liftAt = grabAt;
  const turnAt = liftAt + TRIP.lift;
  const departAt = turnAt + 4;
  const shelveAt = departAt + TRIP.toDepot + 2;
  const returnAt = shelveAt + TRIP.shelve + 7;
  const toPile = stroll({
    from: KEEPER_X,
    to: PATH.pile,
    at: grabAt - TRIP.toPile - 8,
    frames: TRIP.toPile,
    now: at,
    height: 520,
  });
  const toDepot = stroll({
    from: PATH.pile,
    to: PATH.depot,
    at: departAt,
    frames: TRIP.toDepot,
    now: at,
    height: 520,
  });
  const back = stroll({
    from: PATH.depot,
    to: PATH.pile,
    at: returnAt,
    frames: TRIP.back,
    now: at,
    height: 520,
  });
  const leg = at < departAt ? toPile : at < returnAt ? toDepot : back;
  // Para que lado ela está virada: gira ao pegar a caixa e gira de novo ao guardá-la.
  const facing =
    -1 +
    2 * ramp(at, turnAt, TRIP.turn) -
    2 * ramp(at, returnAt - 6, TRIP.turn);
  const bent = ramp(at, liftAt - TRIP.bend, TRIP.bend) - ramp(at, turnAt, 6);
  const holding =
    ramp(at, liftAt - 4, 8) - ramp(at, shelveAt + TRIP.shelve - 2, 6);
  const raised =
    ramp(at, shelveAt - 4, 8) - ramp(at, shelveAt + TRIP.shelve, 6);
  const carried = at >= turnAt && at < shelveAt;
  const lifted = ramp(at, liftAt, TRIP.lift);
  const shelved = ramp(at, shelveAt, TRIP.shelve);
  const top = PILE.length - 1;
  // A caixa no ar: da pilha para as mãos dela, e das mãos para a tábua do depósito.
  const flying =
    at >= liftAt && at < turnAt
      ? between(
          [...pileSpot(top), PILE_SPOT.scale],
          inHands(leg.x, -1),
          lifted,
          30,
        )
      : at >= shelveAt && at < shelveAt + TRIP.shelve
        ? between(
            inHands(leg.x, 1, 60 * raised),
            [STORED[0][0], STORED[0][1], STORED_SCALE],
            shelved,
            50,
          )
        : null;
  const stored = at >= shelveAt + TRIP.shelve ? 1 : 0;
  // Os fregueses do plano anterior: o da vez, com a mercadoria na mão, e o que esperava.
  const guests = [
    { x: COUNTER.wait, shopper: 1, held: false },
    { x: COUNTER.x, shopper: 0, held: true },
  ] as const;
  // O braço do balcão baixa, e a mercadoria que ela oferecia some na mão dela.
  const offer = 1 - ramp(at, 2, 8);
  /** O que está na loja; de dia, com o véu das prateleiras do plano anterior, que sai com os fregueses. */
  const inside = (day: boolean) => (
    <>
      <ShelfGoods />
      {day ? <ShelfVeil amount={1 - ramp(at, 0, 14)} /> : null}
      <Pile count={at >= liftAt ? PILE.length - 1 : PILE.length} />
      <Stored count={stored} />
      {guests.map(({ x, shopper, held }, index) => {
        const gone = drop(at, index * SHRINK.gap, SHRINK.frames);
        return gone < 1 ? (
          <Place
            key={x}
            x={x}
            y={FLOOR_Y + 10}
            anchor="bottom"
            style={{
              scale: `${1 - gone} ${(1 - gone) * breath(seconds, `queue-${shopper}`)}`,
            }}
          >
            <Person
              height={SHOPPER_HEIGHT[shopper]}
              colors={SHOPPERS[shopper]}
              plainFace
              backArm={held ? { hand: [124, -330], bend: 20 } : undefined}
              held={
                held ? (
                  <circle cx={130} cy={-370} r={30} fill={goods.items[2]} />
                ) : undefined
              }
            />
          </Place>
        ) : null;
      })}
      <SvgLayer>
        <ellipse
          cx={leg.x}
          cy={FLOOR_Y + 12}
          rx={130}
          ry={16}
          fill={idea.lilac.contact}
          opacity={0.3}
        />
      </SvgLayer>
      <Keeper
        x={leg.x}
        seconds={seconds}
        facing={facing}
        stride={leg.stride}
        // Ela se curva sobre a pilha para pegar a caixa de cima.
        lean={9 * bent}
        blink={blink(seconds, "keeper")}
        {...(offer > 0
          ? serving(offer, offer, goods.items[0])
          : arms(holding, 110 * raised - 26 * bent))}
        held={
          offer > 0 ? (
            serving(offer, offer, goods.items[0]).held
          ) : carried ? (
            <Crate
              x={IN_HANDS.x}
              y={IN_HANDS.y}
              scale={IN_HANDS.scale}
              memory={storedMemory(0)}
            />
          ) : undefined
        }
      />
      {flying ? (
        <SvgLayer>
          <Crate
            x={flying[0]}
            y={flying[1]}
            scale={flying[2]}
            memory={storedMemory(0)}
          />
        </SvgLayer>
      ) : null}
    </>
  );

  return (
    <Camera {...carryCamera(props)}>
      <Layer depth={1}>
        {/* A loja de dia fica por baixo; a de porta baixada desce por cima dela, e a borda que desce é a própria porta de enrolar. */}
        {nightOnly ? null : <ShopInside time="day">{inside(true)}</ShopInside>}
        <AbsoluteFill
          style={{
            clipPath: nightOnly
              ? undefined
              : `inset(-100% -100% ${(1 - lowered) * 100}% -100%)`,
          }}
        >
          <ShopInside time="night" lamp={lampAt(seconds)}>
            {inside(false)}
          </ShopInside>
        </AbsoluteFill>
      </Layer>
    </Camera>
  );
};

type CarryShotProps = Pick<CarryViewProps, "shutAt" | "grabAt"> & {
  readonly clock: number;
};

const CarryShot: React.FC<CarryShotProps> = ({ clock, ...cues }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill>
      {/* O plano continua o anterior e entrega a loja à lente do seguinte: ela não sobe nem desce com o palco. */}
      <Standing>
        <CarryView
          at={frame}
          seconds={(clock + frame) / fps}
          fps={fps}
          {...cues}
        />
      </Standing>
      <Grain />
    </AbsoluteFill>
  );
};

// A pessoa dormindo na cama, embaixo e à esquerda; a lente com o que acontece dentro da cabeça, no alto, à direita.
const SLEEPER = { x: 620, y: 1000, scale: 0.8 };
// A lente sai da testa dela, que fica para o lado da cabeceira.
const HEAD_SPOT = {
  x: bedHead(SLEEPER).x - 60 * SLEEPER.scale,
  y: bedHead(SLEEPER).y,
  radius: 40,
};
const LENS = { x: 1390, y: 420, radius: 310 };
const INNER_SHOP = { width: 430, ground: 500 };
// A loja de dentro, vista pela lente: o ponto do quadro que vai para o meio dela, e a escala.
const LENS_FOCUS = [960, 600] as const;
const LENS_SCALE = 0.42;
// O raio com que a lente cobre o quadro inteiro, a partir do ponto de foco.
const FULL_RADIUS = 1150;

// A barra de baixo da porta de enrolar, dentro da lente: a altura dela, em pixels da lente no lugar.
const SHUTTER_BAR = 18;

/** Quanto a lente sobe e desce, em pixels, quando está no lugar. */
const lensFloat = (seconds: number): number => 7 * wave(seconds, 3.8, 0.2);

type LensProps = {
  /** De 0 (a loja de dentro no quadro inteiro) a 1 (a lente, no lugar dela). */
  readonly closed: number;
  /**
   * Quanto a porta de enrolar já desceu diante da loja de dentro, de 0 a 1: acima da barra dela está a
   * fachada de porta baixada, e abaixo, a loja de dentro.
   */
  readonly front: number;
  /** O pulso da lente, de 0 a 1. */
  readonly pulse?: number;
  readonly seconds: number;
  /** A loja de dentro, no quadro inteiro. */
  readonly children?: React.ReactNode;
};

/**
 * A lente com o que acontece dentro da cabeça de quem dorme. É a ponte dos
 * dois lados do plano do sono: a loja de dentro encolhe até caber nela e a
 * fachada de porta baixada desce por cima, como a porta; na volta, a fachada
 * sobe e a lente abre até a loja tomar o quadro.
 */
const Lens: React.FC<LensProps> = ({
  closed,
  front,
  pulse = 0,
  seconds,
  children,
}) => {
  const radius =
    FULL_RADIUS * (LENS.radius / FULL_RADIUS) ** closed * (1 + 0.05 * pulse);
  const x = mix(LENS_FOCUS[0], LENS.x, closed);
  // No lugar, a lente flutua devagar: é um pensamento, não um objeto.
  const y = mix(LENS_FOCUS[1], LENS.y, closed) + lensFloat(seconds) * closed;
  const fit = radius / LENS.radius;
  // A porta de enrolar da loja pequena: a mesma abertura do desenho da loja (412 de 520 de largura).
  const door = (INNER_SHOP.width * 412) / 520;

  return (
    <div
      style={{
        position: "absolute",
        left: x - radius,
        top: y - radius,
        width: radius * 2,
        height: radius * 2,
        borderRadius: "50%",
        overflow: "hidden",
        background: shopInside.night.wall[1],
      }}
    >
      {front < 1 ? (
        <div
          style={{
            position: "absolute",
            left: radius - LENS_FOCUS[0],
            top: radius - LENS_FOCUS[1],
            width: 1920,
            height: 1080,
            transformOrigin: `${LENS_FOCUS[0]}px ${LENS_FOCUS[1]}px`,
            scale: `${LENS_SCALE ** closed}`,
          }}
        >
          {children}
        </div>
      ) : null}
      {front > 0 ? (
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: LENS.radius * 2,
            height: LENS.radius * 2,
            transformOrigin: "0 0",
            scale: `${fit}`,
            clipPath: `inset(0 0 ${(1 - front) * 100}% 0)`,
            background: `linear-gradient(${street.night.sky[0]}, ${street.night.sky[1]})`,
          }}
        >
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: INNER_SHOP.ground,
              bottom: 0,
              background: street.night.sidewalk,
            }}
          />
          <div
            style={{
              position: "absolute",
              left: LENS.radius,
              top: INNER_SHOP.ground,
              translate: "-50% -100%",
            }}
          >
            <Storefront
              width={INNER_SHOP.width}
              colors={shop.night}
              shutter={1}
              lamp={lampAt(seconds)}
            />
          </div>
          {/* A fresta de luz por baixo da porta: lá dentro, alguém trabalha, e a luz oscila. */}
          <div
            style={{
              position: "absolute",
              left: LENS.radius - door / 2,
              top: INNER_SHOP.ground - (INNER_SHOP.width * 48) / 520,
              width: door,
              height: 12,
              background: shop.night.lamp,
            }}
          />
          <div
            style={{
              position: "absolute",
              left: LENS.radius - door * (0.42 - 0.2 * wave(seconds, 2.3)),
              top: INNER_SHOP.ground + 4,
              width: door * 0.84,
              height: 40,
              borderRadius: "50%",
              background: shop.night.lamp,
              opacity: 0.3 + 0.14 * wave(seconds, 0.7),
            }}
          />
        </div>
      ) : null}
      {/* A barra da porta de enrolar, na borda entre a fachada e a loja de dentro: quem desce e sobe é a porta. */}
      {front > 0 && front < 1 ? (
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: front * radius * 2 - SHUTTER_BAR * fit,
            height: SHUTTER_BAR * fit,
            background: shop.night.shutterLine,
            borderBottom: `${4 * fit}px solid ${shop.night.lamp}`,
            boxSizing: "border-box",
          }}
        />
      ) : null}
      {/* O aro da lente: nasce com ela, e some quando ela toma o quadro. */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          boxSizing: "border-box",
          border: `${16 * closed + 8 * pulse}px solid ${ink.paper}`,
        }}
      />
    </div>
  );
};

// A loja encolhe até a lente, e a porta de enrolar desce dentro dela, a velocidade constante, como porta;
// o cone sai da cabeça. No fim do plano a porta sobe de novo (`liftLead` quadros antes da troca), e é
// a loja de dentro do plano seguinte que aparece: a lente só cresce com ela já à vista. Em quadros.
const DREAM = {
  shrink: 20,
  frontAt: 14,
  front: 14,
  liftLead: 20,
  lift: 14,
  coneAt: 12,
  cone: 12,
  ringAt: 9,
};
const BED_SOONER = 16;

type DreamShotProps = {
  /** Quadro do plano em que a lente pulsa. */
  readonly pulseAt: number;
  /** A duração do plano anterior e as deixas dele: a loja de dentro continua, dentro da lente. */
  readonly before: number;
  readonly cues: Pick<CarryViewProps, "shutAt" | "grabAt">;
  /** A loja de dentro do plano seguinte, como ele a abre: é ela que a porta descobre ao subir. */
  readonly next: React.ReactNode;
  readonly clock: number;
};

/** A loja encolhe até caber na lente que sai da cabeça de quem dorme: é lá dentro que ela fica. */
const DreamShot: React.FC<DreamShotProps> = ({
  pulseAt,
  before,
  cues,
  next,
  clock,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const length = useShotLength();
  const seconds = (clock + frame) / fps;
  const closed = ramp(frame, 0, DREAM.shrink);
  const liftAt = length - DREAM.liftLead;
  const front =
    linear(frame, DREAM.frontAt, DREAM.front) -
    linear(frame, liftAt, DREAM.lift);
  // O cone cresce da cabeça até a lente; a ponta de lá abre com ele.
  const reach = ramp(frame, DREAM.coneAt, DREAM.cone);
  const far = {
    x: mix(HEAD_SPOT.x, LENS.x - 60, reach),
    top: mix(
      HEAD_SPOT.y - HEAD_SPOT.radius,
      LENS.y - LENS.radius + 6 + lensFloat(seconds),
      reach,
    ),
    bottom: mix(
      HEAD_SPOT.y + HEAD_SPOT.radius,
      LENS.y + LENS.radius - 6 + lensFloat(seconds),
      reach,
    ),
  };
  // A lente pulsa duas vezes, como um coração.
  const pulse =
    flash(frame, pulseAt, 0.4 * fps) +
    0.6 * flash(frame, pulseAt + 0.45 * fps, 0.4 * fps);

  return (
    <AbsoluteFill>
      {/* O fundo já está inteiro por baixo da loja que encolhe: é ele que aparece em volta dela. */}
      <IdeaBackdrop hue="lilac" spot={[0.3, 0.5]} />
      <Troupe>
        {/* A cama e a lente continuam até a lente abrir no plano seguinte: entram, e não saem. */}
        <Stay only="leaving">
          <SvgLayer>
            {/* O cone que liga a cabeça à lente: o que se vê ali acontece lá dentro. */}
            {reach > 0 ? (
              <path
                d={`M${HEAD_SPOT.x},${HEAD_SPOT.y - HEAD_SPOT.radius} L${far.x},${far.top} L${far.x},${far.bottom} L${HEAD_SPOT.x},${HEAD_SPOT.y + HEAD_SPOT.radius} Z`}
                fill={ink.paper}
                // O cone respira com ela.
                opacity={0.45 + 0.06 * wave(seconds, 4.8)}
              />
            ) : null}
          </SvgLayer>
          <Sooner by={BED_SOONER}>
            <Cast origin={[SLEEPER.x, SLEEPER.y]}>
              <Bed
                {...SLEEPER}
                colors={personInPajamas}
                hue="lilac"
                snoreAt={DREAM.shrink - 4}
                snoreSize={130}
                breath={breath(seconds, "dreamer", {
                  amplitude: 0.035,
                  period: 4.8,
                })}
              />
            </Cast>
          </Sooner>
          <SvgLayer>
            <circle
              cx={HEAD_SPOT.x}
              cy={HEAD_SPOT.y}
              // O aro na testa estoura quando o cone parte, e respira com ela.
              r={
                HEAD_SPOT.radius *
                ramp(frame, DREAM.ringAt, 8) *
                (1 + 0.06 * wave(seconds, 2.4) + 0.2 * pulse)
              }
              fill="none"
              stroke={ink.paper}
              strokeWidth={10}
            />
          </SvgLayer>
        </Stay>
      </Troupe>
      <Lens closed={closed} front={front} pulse={pulse} seconds={seconds}>
        {/* A loja de dentro continua de onde o plano anterior a deixou: não sobe com o palco. Com a porta
            baixada, troca pela do plano seguinte. */}
        <Standing>
          {frame < liftAt ? (
            <CarryView
              at={before + frame}
              seconds={seconds}
              fps={fps}
              nightOnly
              {...cues}
            />
          ) : (
            next
          )}
        </Standing>
      </Lens>
      <Grain />
    </AbsoluteFill>
  );
};

// De perto, a lojista com a caixa aberta diante do depósito; depois a câmera recua até caberem a pilha da entrada e o depósito, com as duas etiquetas.
const SORT_CLOSE = framing([1400, 610], 1.6);
const SORT_BOTH = { center: [965, 610], zoom: 1.06 } as const;
const SORTING = framing(SORT_BOTH.center, SORT_BOTH.zoom);
/** Onde um ponto da loja cai no quadro, com a câmera recuada: as etiquetas ficam fora dela, no tamanho dos tokens. */
const onScreen = (x: number, y: number): { x: number; y: number } => ({
  x: 960 + (x - SORT_BOTH.center[0]) * SORT_BOTH.zoom,
  y: 540 + (y - SORT_BOTH.center[1]) * SORT_BOTH.zoom,
});
const SORTER_X = 1270;
// A tábua do depósito fica um passo adiante; a caixa seguinte espera no chão, ao lado dela.
const SHELF_STEP = 80;
const WAITING = { x: SORTER_X - 170, scale: 0.8 };
// Duas caixas já estão guardadas quando o plano começa, e duas ficam na pilha da entrada.
const SORTED = 2;
const LEFT_IN_PILE = 2;
// A caixa nas mãos dela, aberta, e a lembrança que sobe dela.
const OPEN_BOX = { x: 60, y: -170, rise: 104 };
// Os tempos da arrumação, em quadros: a primeira caixa, a partir do começo do plano; o resto, a partir de "leva".
const SORT = {
  openAt: 20,
  flaps: 8,
  riseAfter: 6,
  rise: 14,
  step: 8,
  shelveAfter: 17,
  shelve: 10,
  bendAfter: 37,
  bend: 8,
  liftAfter: 45,
  lift: 8,
  openAfter: 55,
  pullBack: 26,
};
// A lente abre até a loja tomar o quadro; a porta já subiu no fim do plano anterior. Em quadros.
const WAKE = { openAt: 1, open: 20 };

/** A loja da arrumação antes de o plano dela começar, como ele a abre: é o que a lente do sonho mostra quando a porta sobe. */
const SortOpening: React.FC<{ takeAt: number; seconds: number }> = ({
  takeAt,
  seconds,
}) => (
  <Camera {...SORT_CLOSE}>
    <Layer depth={1}>
      <SortView at={0} takeAt={takeAt} seconds={seconds} />
    </Layer>
  </Camera>
);

type SortViewProps = {
  readonly at: number;
  /** Quadro do plano em que ela leva a caixa para a tábua do fundo. */
  readonly takeAt: number;
  readonly seconds: number;
};

/** A lojista abre cada caixa, olha a lembrança e a encaixa nas tábuas do fundo. */
const SortView: React.FC<SortViewProps> = ({ at, takeAt, seconds }) => {
  // A primeira caixa: abre, a lembrança sobe e brilha; em "leva", desce, a caixa fecha e vai para a tábua.
  const shelveAt = takeAt + SORT.shelveAfter;
  const liftAt = takeAt + SORT.liftAfter;
  const openAgain = takeAt + SORT.openAfter;
  const second = at >= liftAt + SORT.lift;
  const flaps = second
    ? ramp(at, openAgain, SORT.flaps)
    : ramp(at, SORT.openAt, SORT.flaps) - ramp(at, takeAt + 4, 6);
  const risen = second
    ? ramp(at, openAgain + SORT.riseAfter, SORT.rise)
    : ramp(at, SORT.openAt + SORT.riseAfter, SORT.rise) - ramp(at, takeAt, 6);
  const stepped =
    ramp(at, takeAt + 9, SORT.step) -
    ramp(at, shelveAt + SORT.shelve + 2, SORT.step);
  const x = SORTER_X + SHELF_STEP * stepped;
  const raised =
    ramp(at, shelveAt - 5, 8) - ramp(at, shelveAt + SORT.shelve, 6);
  const bent =
    ramp(at, takeAt + SORT.bendAfter, SORT.bend) -
    ramp(at, liftAt + SORT.lift, SORT.bend);
  const holding =
    1 - ramp(at, shelveAt + SORT.shelve - 2, 6) + ramp(at, liftAt, 6);
  const inHand = at < shelveAt || second;
  const memory = second ? MEMORIES[LEFT_IN_PILE] : storedMemory(SORTED);
  // A caixa no ar: das mãos para a tábua, e do chão para as mãos.
  const hands: Spot = [
    x + OPEN_BOX.x * KEEPER_SCALE,
    FLOOR_Y + 10 + (OPEN_BOX.y - 100 * raised) * KEEPER_SCALE,
    KEEPER_SCALE,
  ];
  const flying =
    at >= shelveAt && at < shelveAt + SORT.shelve
      ? between(
          hands,
          [STORED[SORTED][0], STORED[SORTED][1], STORED_SCALE],
          ramp(at, shelveAt, SORT.shelve),
          44,
        )
      : at >= liftAt && !second
        ? between(
            [WAITING.x, FLOOR_Y, WAITING.scale],
            hands,
            ramp(at, liftAt, SORT.lift),
            20,
          )
        : null;
  // A lembrança brilha: o clarão atrás dela respira.
  const glow = risen * (0.75 + 0.25 * wave(seconds, 1.7));

  return (
    <ShopInside time="night" lamp={lampAt(seconds)}>
      <ShelfGoods />
      <Pile count={LEFT_IN_PILE} />
      <Stored count={at >= shelveAt + SORT.shelve ? SORTED + 1 : SORTED} />
      <SvgLayer>
        {at < liftAt ? (
          <Crate
            x={WAITING.x}
            y={FLOOR_Y}
            scale={WAITING.scale}
            memory={MEMORIES[LEFT_IN_PILE]}
          />
        ) : null}
        <ellipse
          cx={x}
          cy={FLOOR_Y + 12}
          rx={130}
          ry={16}
          fill={street.night.contact}
          opacity={0.4}
        />
      </SvgLayer>
      <Keeper
        x={x}
        seconds={seconds}
        // Olha para dentro da caixa; a lembrança sobe e ela a acompanha com o rosto.
        expression={risen > 0.5 ? "curious" : "reading"}
        blink={Math.max(
          blink(seconds, "keeper"),
          flash(at, SORT.openAt + SORT.riseAfter + 4, 6),
          flash(at, takeAt - 2, 6),
          flash(at, openAgain + SORT.riseAfter + 4, 6),
        )}
        lean={-8 * bent}
        // Um passo até a tábua, e um de volta.
        stride={{ step: stepped, gait: 4 * stepped * (1 - stepped) }}
        frontArm={{
          hand: [
            mix(-136, -6, holding) - 60 * bent,
            mix(-214, -196, holding) - 100 * raised + 60 * bent,
          ],
          bend: mix(26, 34, holding),
        }}
        backArm={{
          hand: [
            mix(100, 136, holding),
            mix(-214, -196, holding) - 100 * raised,
          ],
          bend: mix(73, 34, holding),
        }}
        held={
          inHand ? (
            <g>
              {/* O clarão e a lembrança saem de dentro da caixa, por trás da borda dela. */}
              <circle
                cx={OPEN_BOX.x}
                cy={OPEN_BOX.y - CRATE.height - 20 - OPEN_BOX.rise * risen}
                r={78 * glow}
                fill={ink.moon}
                opacity={0.4 * glow}
              />
              {risen > 0 ? (
                <MemoryTag
                  x={OPEN_BOX.x}
                  y={OPEN_BOX.y - CRATE.height / 2 - OPEN_BOX.rise * risen}
                  scale={1 + 0.3 * risen + 0.06 * risen * wave(seconds, 1.7)}
                  memory={memory}
                />
              ) : null}
              <Crate
                x={OPEN_BOX.x}
                y={OPEN_BOX.y}
                memory={memory}
                open={flaps}
              />
            </g>
          ) : undefined
        }
      />
      {flying ? (
        <SvgLayer>
          <Crate
            x={flying[0]}
            y={flying[1]}
            scale={flying[2]}
            memory={at < liftAt ? storedMemory(SORTED) : MEMORIES[LEFT_IN_PILE]}
          />
        </SvgLayer>
      ) : null}
    </ShopInside>
  );
};

/** O cenário já está de pé quando o plano chega (a passagem é a da lente), e sai com o palco, como todo cenário. */
const StandingIn: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const built = useBuild();
  return (
    <Build {...built} lit={1} risen={built.lit < 1 ? 1 : built.risen}>
      {children}
    </Build>
  );
};

type SortShotProps = {
  /** Quadros do plano em que ela leva a caixa e em que cada etiqueta entra. */
  readonly takeAt: number;
  readonly provisionalAt: number;
  readonly longTermAt: number;
  readonly clock: number;
};

/** A lente abre e a câmera volta à loja, perto da lojista; depois recua até a pilha da entrada e o depósito, com as duas etiquetas. */
const SortShot: React.FC<SortShotProps> = ({
  takeAt,
  provisionalAt,
  longTermAt,
  clock,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const length = useShotLength();
  const seconds = (clock + frame) / fps;
  // A câmera recua quando ela leva a caixa, e depois deriva um pouco mais, até o fim.
  const back = ramp(frame, takeAt, SORT.pullBack);
  const camera = cameraBetween(
    cameraBetween(SORT_CLOSE, SORTING, back),
    framing(SORT_BOTH.center, SORT_BOTH.zoom * 0.985),
    linear(frame, takeAt + SORT.pullBack, length - takeAt - SORT.pullBack),
  );
  const pileTop = onScreen(
    PILE_SPOT.x,
    FLOOR_Y - CRATE.height * PILE_SPOT.scale,
  );
  const depot = onScreen(STOCKROOM.x + STOCKROOM.width / 2, STOCKROOM.y);
  const opening = frame < WAKE.openAt + WAKE.open;
  const view = (
    <StandingIn>
      <Camera {...camera}>
        <Layer depth={1}>
          <SortView at={frame} takeAt={takeAt} seconds={seconds} />
        </Layer>
      </Camera>
    </StandingIn>
  );

  return (
    <AbsoluteFill>
      {opening ? (
        // A lente do plano anterior, no mesmo lugar, já com a loja de dentro à vista: ela abre até a loja tomar o quadro.
        <Lens
          closed={1 - ramp(frame, WAKE.openAt, WAKE.open)}
          front={0}
          seconds={seconds}
        >
          {view}
        </Lens>
      ) : (
        view
      )}
      <Place x={pileTop.x + 30} y={pileTop.y - 70}>
        <Pop at={provisionalAt}>
          <Tag on="night" size="note">
            provisório
          </Tag>
        </Pop>
      </Place>
      <Place x={depot.x - 64} y={depot.y - 52}>
        <Pop at={longTermAt}>
          <Tag on="night" size="note">
            longo prazo
          </Tag>
        </Pop>
      </Place>
      <Grain />
    </AbsoluteFill>
  );
};

export const StockroomNightScene: React.FC<SceneProps> = ({ scene, shots }) => {
  const { fps } = useVideoConfig();
  const takeAt = cue(scene, "leva") - shots[2].from;
  const carry = {
    shutAt: cue(scene, "baixar"),
    // Ela chega à pilha e pega a caixa em "levar".
    grabAt: cue(scene, "levar"),
  };
  return (
    <>
      <Shot
        range={shots[0]}
        name="a porta baixa; as caixas vão para o depósito"
      >
        <CarryShot {...carry} clock={scene.from} />
      </Shot>
      <Shot range={shots[1]} name="dentro da cabeça de quem dorme, a loja">
        <DreamShot
          pulseAt={cue(scene, "cérebro") - shots[1].from}
          before={shots[0].to - shots[0].from}
          cues={carry}
          next={
            <SortOpening
              takeAt={takeAt}
              // O relógio da pausa viva é o do vídeo: a loja não salta quando o plano dela começa.
              seconds={(scene.from + shots[2].from) / fps}
            />
          }
          clock={scene.from + shots[1].from}
        />
      </Shot>
      <Shot
        range={shots[2]}
        name="cada lembrança, do provisório ao longo prazo"
      >
        <SortShot
          takeAt={takeAt}
          provisionalAt={cue(scene, "provisório") - shots[2].from}
          longTermAt={cue(scene, "longo") - shots[2].from}
          clock={scene.from + shots[2].from}
        />
        {/* A rua de `stockroom-solid` sobe aqui, por cima da loja que desce: a troca de cena não deixa a tela
            só com o céu. */}
        <Prelude lead={STUDIED_LEAD}>
          <StockroomSolidOpening clock={scene.from + shots[2].to} />
        </Prelude>
      </Shot>
      {/* A porta de enrolar desce: o som começa com ela. */}
    </>
  );
};
