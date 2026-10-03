import {
  AbsoluteFill,
  random,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Person, type Expression } from "../../../art/Person";
import { Storefront } from "../../../art/Storefront";
import {
  Camera,
  Layer,
  cameraBetween,
  framing,
} from "../../../components/Camera";
import { Grain } from "../../../components/Grain";
import { blink, breath, wave } from "../../../components/Idle";
import { Place } from "../../../components/Place";
import { SvgLayer } from "../../../components/SvgLayer";
import type { SceneProps } from "../../../video/NarratedVideo";
import { Shot, type Wipe } from "../../../video/Shot";
import { apron, coin, person, personInPajamas, shop } from "../palette";
import { HUGGING, Pillow } from "../parts/Belongings";
import {
  LIT_SHOP,
  ROW_GROUND,
  ROW_WIDTH,
  SHOP_ROW,
  ShopRow,
  YOUR_SHOP,
  type ShopState,
} from "../parts/ShopRow";
import { ShopStreet, StreetShadow } from "../parts/ShopStreet";
import { cue, drop, linear, mix, ramp } from "../parts/timing";

// A loja de quem assiste, no plano médio: o meio da calçada e a largura do toldo.
const SHOP = { x: 900, ground: 880, width: 760 };
// Quem dormia está onde o plano anterior a deixou; a lojista fica na frente da porta.
const SLEEPER = { x: 1400, y: 930, height: 600 };
const KEEPER = { x: 1110, y: 906, height: 500 };
// A abertura da loja, nas unidades do desenho dela.
const OPENING = { top: -306, height: 270 };
const SHUTTER_SECONDS = 1.3;
const WAKE_SECONDS = 0.3;
const WALK_SECONDS = 0.8;
const WINDUP_SECONDS = 0.3;
// A troca de roupa acontece no meio de uma piscada.
const CHANGE_BLINK_FRAMES = 6;
// A câmera começa um pouco à direita, com quem dorme, e desliza com ela até a porta.
const FOLLOW = {
  from: framing([1040, 560], 1.04, [960, 560]),
  to: framing([960, 540], 1),
};

type ClosingShotProps = {
  /** Quadro do plano em que ela abre os olhos. */
  readonly wakeAt: number;
  /** Quadro do plano em que ela vira lojista e anda até a porta. */
  readonly walkAt: number;
  /** Quadro do plano em que ela boceja diante da loja. */
  readonly yawnAt: number;
  /** Quadro do plano em que a porta começa a descer. */
  readonly closesAt: number;
};

/** A pessoa que dormia acorda numa rua, vira a lojista, boceja e puxa a porta de enrolar. */
const ClosingShot: React.FC<ClosingShotProps> = ({
  wakeAt,
  walkAt,
  yawnAt,
  closesAt,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const seconds = frame / fps;
  const changeAt = walkAt - CHANGE_BLINK_FRAMES / 2;
  const changed = frame >= walkAt;
  const walk = ramp(frame, walkAt, WALK_SECONDS * fps);
  const walking = walk > 0 && walk < 1;
  const windup = ramp(
    frame,
    closesAt - WINDUP_SECONDS * fps,
    WINDUP_SECONDS * fps,
  );
  const shutter = 0.06 + 0.94 * ramp(frame, closesAt, SHUTTER_SECONDS * fps);
  const shopScale = SHOP.width / 520;
  const height = mix(SLEEPER.height, KEEPER.height, walk);
  const personScale = height / 650;
  const x = mix(SLEEPER.x, KEEPER.x, walk);
  const y =
    mix(SLEEPER.y, KEEPER.y, walk) -
    (walking ? 10 : 0) * Math.abs(wave(seconds, 0.3));
  // A mão acompanha a borda da porta até a altura do quadril; dali a porta desce sozinha.
  const edgeY =
    SHOP.ground + (OPENING.top + OPENING.height * shutter) * shopScale;
  const handY = Math.min((edgeY - KEEPER.y) / personScale, -230);
  const pulling = frame >= closesAt - WINDUP_SECONDS * fps;
  const closed = shutter >= 1;

  const expression = (): Expression => {
    if (frame < wakeAt) {
      return "asleep";
    }
    if (frame < wakeAt + WAKE_SECONDS * fps) {
      return "surprised";
    }
    if (frame >= yawnAt && !closed) {
      return "yawning";
    }
    return "neutral";
  };
  // Piscada da troca de roupa: fecha e abre em volta de `walkAt`.
  const changeBlink =
    frame >= changeAt && frame < changeAt + CHANGE_BLINK_FRAMES
      ? 1 - Math.abs((frame - changeAt) / (CHANGE_BLINK_FRAMES / 2) - 1)
      : 0;

  return (
    <AbsoluteFill>
      {/* A câmera acompanha a caminhada até a porta, de leve. */}
      <Camera {...cameraBetween(FOLLOW.from, FOLLOW.to, walk)}>
        <ShopStreet time="day" ground={SHOP.ground} orb={[1620, 180]} />
        <Layer depth={1}>
          <SvgLayer>
            <StreetShadow
              time="day"
              x={SHOP.x}
              y={SHOP.ground + 8}
              width={SHOP.width}
            />
            <StreetShadow time="day" x={x} y={y + 6} width={230} />
          </SvgLayer>
          <Place x={SHOP.x} y={SHOP.ground} anchor="bottom">
            <Storefront
              width={SHOP.width}
              colors={shop.day}
              shutter={shutter}
            />
          </Place>
          <Place
            x={x}
            y={y}
            anchor="bottom"
            style={{
              rotate: `${walking ? 3 * wave(seconds, 0.6) : 0}deg`,
              scale: `1 ${breath(seconds, "keeper", frame < wakeAt ? { amplitude: 0.02, period: 5 } : {})}`,
            }}
          >
            <Person
              height={height}
              colors={changed ? person : personInPajamas}
              expression={expression()}
              apron={changed ? apron : undefined}
              blink={Math.max(
                changeBlink,
                frame >= wakeAt ? blink(seconds, "keeper") : 0,
              )}
              frontArm={
                pulling
                  ? { hand: [-118, mix(-214, handY, windup)], bend: 40 }
                  : changed
                    ? undefined
                    : HUGGING.frontArm
              }
              backArm={changed ? undefined : HUGGING.backArm}
              held={changed ? undefined : <Pillow />}
            />
          </Place>
        </Layer>
      </Camera>
      <Grain />
    </AbsoluteFill>
  );
};

// De perto, de noite: a porta fechada e as moedas que batem nela.
const CLOSE = { x: 760, ground: 820, width: 1040 };
// Moedas caídas na calçada: x, y e raio.
const FALLEN = [
  [300, 960, 38],
  [450, 884, 42],
  [850, 892, 40],
  [1030, 950, 44],
] as const;
// Cada moeda que chega: de onde sai, onde bate na porta, onde quica e onde cai.
const THROWN = [
  { from: [40, 780], hit: [700, 500], bounce: [590, 660], lands: [640, 946] },
  { from: [-40, 820], hit: [820, 560], bounce: [720, 700], lands: [760, 970] },
] as const;
const FLIGHT_SECONDS = 0.4;
const BOUNCE_SECONDS = 0.3;
const FALL_SECONDS = 0.35;
const COIN_GAP_SECONDS = 0.4;
const LAMP_SECONDS = 0.3;
const NIGHT_WIPE: Wipe = { frames: 9, from: "left" };

const Coin: React.FC<{ x: number; y: number; r: number; tilt?: number }> = ({
  x,
  y,
  r,
  tilt = 0,
}) => (
  <g transform={`translate(${x} ${y}) rotate(${tilt})`}>
    {/* A moeda caída é vista de lado: uma elipse com a borda aparecendo embaixo. */}
    <ellipse cy={r * 0.16} rx={r} ry={r * 0.5} fill={coin.edge} />
    <ellipse rx={r} ry={r * 0.5} fill={coin.face} />
    <ellipse
      cx={-r * 0.3}
      cy={-r * 0.14}
      rx={r * 0.34}
      ry={r * 0.12}
      fill={coin.shine}
    />
  </g>
);

/** Um ponto numa parábola de `from` a `to`, com `t` de 0 a 1 e a altura do arco. */
const arc = (
  from: readonly [number, number],
  to: readonly [number, number],
  t: number,
  rise: number,
): [number, number] => [
  mix(from[0], to[0], t),
  mix(from[1], to[1], t) - rise * Math.sin(t * Math.PI),
];

type FlyingCoinProps = {
  readonly throwIndex: number;
  /** Quadro do plano em que a moeda sai do chão. */
  readonly at: number;
};

/** Uma moeda que voa até a porta, bate, quica e cai na calçada. */
const FlyingCoin: React.FC<FlyingCoinProps> = ({ throwIndex, at }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const path = THROWN[throwIndex];
  const hitAt = at + FLIGHT_SECONDS * fps;
  const landAt = hitAt + BOUNCE_SECONDS * fps;
  const restAt = landAt + FALL_SECONDS * fps;
  if (frame < at) {
    return null;
  }
  if (frame >= restAt) {
    return <Coin x={path.lands[0]} y={path.lands[1]} r={44} tilt={-6} />;
  }
  const flight = linear(frame, at, FLIGHT_SECONDS * fps);
  const bounce = linear(frame, hitAt, BOUNCE_SECONDS * fps);
  const fall = drop(frame, landAt, FALL_SECONDS * fps);
  const [x, y] =
    frame < hitAt
      ? arc(path.from, path.hit, flight, 220)
      : frame < landAt
        ? arc(path.hit, path.bounce, bounce, 60)
        : arc(path.bounce, path.lands, fall, 0);
  const spin = frame * 24;
  // A batida: riscos curtos em volta do ponto em que a moeda acertou a porta.
  const impact =
    frame >= hitAt && frame < hitAt + 8 ? 1 - (frame - hitAt) / 8 : 0;

  return (
    <g>
      {frame < hitAt ? (
        <path
          d={`M${path.from[0]},${path.from[1]} Q${(path.from[0] + path.hit[0]) / 2},${path.from[1] - 440} ${x},${y}`}
          fill="none"
          stroke={coin.shine}
          strokeWidth={6}
          strokeLinecap="round"
          strokeDasharray="4 22"
          opacity={0.8}
        />
      ) : null}
      <g transform={`translate(${x} ${y}) rotate(${spin})`}>
        <circle r={40} fill={coin.edge} />
        <circle r={32} fill={coin.face} />
        <path
          d="M-16,-12 A22,22 0 0 1 8,-22"
          fill="none"
          stroke={coin.shine}
          strokeWidth={7}
          strokeLinecap="round"
        />
      </g>
      {impact > 0
        ? [0, 60, 120, 180, 240, 300].map((angle) => (
            <line
              key={angle}
              x1={
                path.hit[0] +
                (26 + 20 * (1 - impact)) * Math.cos((angle * Math.PI) / 180)
              }
              y1={
                path.hit[1] +
                (26 + 20 * (1 - impact)) * Math.sin((angle * Math.PI) / 180)
              }
              x2={
                path.hit[0] +
                (58 + 30 * (1 - impact)) * Math.cos((angle * Math.PI) / 180)
              }
              y2={
                path.hit[1] +
                (58 + 30 * (1 - impact)) * Math.sin((angle * Math.PI) / 180)
              }
              stroke={coin.shine}
              strokeWidth={6}
              strokeLinecap="round"
              opacity={impact}
            />
          ))
        : null}
    </g>
  );
};

type CoinsShotProps = {
  /** Quadro do plano em que a lâmpada acende. */
  readonly lampAt: number;
  /** Quadro do plano em que a primeira moeda sai do chão. */
  readonly coinsAt: number;
};

/** Porta fechada é venda perdida: as moedas chegam, batem na porta e caem. */
const CoinsShot: React.FC<CoinsShotProps> = ({ lampAt, coinsAt }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  return (
    <AbsoluteFill>
      <Camera
        {...cameraBetween(
          framing([CLOSE.x, 600], 1, [CLOSE.x, 600]),
          framing([CLOSE.x, 600], 1.03, [CLOSE.x, 600]),
          frame / durationInFrames,
        )}
      >
        <ShopStreet time="night" ground={CLOSE.ground} orb={[1720, 150]} />
        <Layer depth={1}>
          <SvgLayer>
            <StreetShadow
              time="night"
              x={CLOSE.x}
              y={CLOSE.ground + 10}
              width={CLOSE.width}
            />
          </SvgLayer>
          <Place x={CLOSE.x} y={CLOSE.ground} anchor="bottom">
            <Storefront
              width={CLOSE.width}
              colors={shop.night}
              shutter={1}
              lamp={ramp(frame, lampAt, LAMP_SECONDS * fps)}
            />
          </Place>
          <SvgLayer>
            {FALLEN.map(([x, y, r], index) => (
              <Coin
                key={x}
                x={x}
                y={y}
                r={r}
                tilt={(random(`coin-${index}`) - 0.5) * 16}
              />
            ))}
            {THROWN.map((_, index) => (
              <FlyingCoin
                key={index}
                throwIndex={index}
                at={coinsAt + index * COIN_GAP_SECONDS * fps}
              />
            ))}
          </SvgLayer>
        </Layer>
      </Camera>
      <Grain />
    </AbsoluteFill>
  );
};

// A câmera começa na loja de quem assiste, do tamanho em que o close a deixou, e recua até a rua.
const YOUR_SHOP_CLOSE = framing(
  [SHOP_ROW[YOUR_SHOP].x, ROW_GROUND],
  CLOSE.width / ROW_WIDTH,
  [CLOSE.x, CLOSE.ground],
);
const STREET_WIDE = framing([960, 540], 1);
const RECEDE_SECONDS = 0.8;
const CLOSE_SECONDS = 0.5;
const CLOSE_STAGGER_SECONDS = 0.2;

type StreetShotProps = {
  /** Quadro do plano em que as outras lojas começam a fechar, uma a uma. */
  readonly closeAt: number;
};

/** A câmera recua: a rua inteira de noite, e toda loja baixa a porta. */
const StreetShot: React.FC<StreetShotProps> = ({ closeAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const others = SHOP_ROW.map((_, index) => index).filter(
    (index) => index !== YOUR_SHOP && index !== LIT_SHOP,
  );
  const shops: ShopState[] = SHOP_ROW.map((_, index) => {
    if (index === YOUR_SHOP) {
      return { shutter: 1, lamp: 1 };
    }
    if (index === LIT_SHOP) {
      return { shutter: 0, lamp: 1, lit: true };
    }
    const order = others.indexOf(index);
    return {
      shutter: ramp(
        frame,
        closeAt + order * CLOSE_STAGGER_SECONDS * fps,
        CLOSE_SECONDS * fps,
      ),
      lamp: 1,
    };
  });

  return (
    <AbsoluteFill>
      <Camera
        {...cameraBetween(
          YOUR_SHOP_CLOSE,
          STREET_WIDE,
          ramp(frame, 0, RECEDE_SECONDS * fps),
        )}
      >
        <ShopRow shops={shops} />
      </Camera>
      <Grain />
    </AbsoluteFill>
  );
};

export const ShopClosesScene: React.FC<SceneProps> = ({ scene, shots }) => (
  <>
    <Shot
      range={shots[0]}
      name="a lojista baixa a porta"
      hold={NIGHT_WIPE.frames}
    >
      <ClosingShot
        wakeAt={cue(scene, "Dá")}
        walkAt={cue(scene, "imaginar")}
        yawnAt={cue(scene, "loja")}
        closesAt={cue(scene, "baixa")}
      />
    </Shot>
    <Shot range={shots[1]} name="venda perdida" wipe={NIGHT_WIPE}>
      <CoinsShot
        lampAt={NIGHT_WIPE.frames + 2}
        coinsAt={cue(scene, "fechada") - shots[1].from}
      />
    </Shot>
    <Shot range={shots[2]} name="toda loja fecha">
      <StreetShot closeAt={cue(scene, "toda", 2) - shots[2].from} />
    </Shot>
  </>
);
