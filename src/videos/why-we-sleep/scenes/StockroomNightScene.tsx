import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { Storefront } from "../../../art/Storefront";
import {
  Camera,
  Layer,
  cameraBetween,
  framing,
} from "../../../components/Camera";
import { Grain } from "../../../components/Grain";
import { Place } from "../../../components/Place";
import { Pop } from "../../../components/Pop";
import { SlowPush } from "../../../components/SlowPush";
import { SvgLayer } from "../../../components/SvgLayer";
import { cue, mix, ramp } from "../../../components/timing";
import type { SceneProps } from "../../../video/NarratedVideo";
import { Shot } from "../../../video/Shot";
import { goods, ink, personInPajamas, shop, street } from "../palette";
import { Bed, bedHead } from "../parts/Bed";
import { IdeaBackdrop } from "../parts/IdeaBackdrop";
import {
  CRATE,
  Crate,
  FLOOR_Y,
  Keeper,
  STOCKROOM,
  STOCK_SHELVES,
  ShelfGoods,
  ShopInside,
} from "../parts/ShopInside";
import { Tag } from "../parts/Tag";
import { MEMORIES, PILE, PILE_SPOT, Pile } from "./StockroomScene";

// Onde cada caixa guardada pousa no depósito: duas por tábua, de cima para baixo.
const STORED = STOCK_SHELVES.flatMap((y) =>
  [-80, 80].map((dx) => [STOCKROOM.x + STOCKROOM.width / 2 + dx, y] as const),
);
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
      <Crate key={slot} x={x} y={y} scale={0.9} memory={storedMemory(slot)} />
    ))}
  </SvgLayer>
);

const SHUTTER_SECONDS = 0.7;
const TRIP_SECONDS = 1.5;
// De onde ela pega a caixa, ao lado da pilha, e onde a deixa, na boca do depósito.
const PATH = { from: PILE_SPOT.x + 260, to: STOCKROOM.x - 70 };

/** A porta de enrolar baixa, e a lojista carrega as caixas da entrada para o depósito dos fundos. */
const CarryShot: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const seconds = frame / fps;
  const lowered = ramp(frame, 0, SHUTTER_SECONDS * fps);
  // Cada viagem leva uma caixa: ela vai carregada e volta de mãos vazias.
  const trips = Math.min(
    PILE.length,
    Math.max(0, seconds - SHUTTER_SECONDS) / TRIP_SECONDS,
  );
  const stored = Math.floor(trips);
  const within = trips - stored;
  const carrying = within < 0.5 && stored < PILE.length;
  const x = carrying
    ? mix(PATH.from, PATH.to, within * 2)
    : mix(PATH.to, PATH.from, (within - 0.5) * 2);
  const inside = (
    <>
      <ShelfGoods />
      <Pile count={PILE.length - stored - (carrying ? 1 : 0)} />
      <Stored count={stored} />
      <Keeper
        x={x}
        seconds={seconds}
        flip={!carrying}
        frontArm={carrying ? { hand: [-30, -236], bend: 30 } : undefined}
        backArm={carrying ? { hand: [150, -236], bend: 30 } : undefined}
        held={
          carrying ? (
            <Crate x={60} y={-180} scale={1.2} memory={storedMemory(stored)} />
          ) : undefined
        }
      />
    </>
  );

  return (
    <AbsoluteFill>
      <SlowPush focus={[960, 600]}>
        {/* A loja de dia fica por baixo; a de porta baixada desce por cima dela, e a borda que desce é a própria porta de enrolar. */}
        <ShopInside time="day">{inside}</ShopInside>
        <AbsoluteFill
          style={{ clipPath: `inset(0 0 ${(1 - lowered) * 100}% 0)` }}
        >
          <ShopInside time="night">{inside}</ShopInside>
        </AbsoluteFill>
      </SlowPush>
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

/** A pessoa dormindo e, dentro da cabeça dela, a mesma loja de porta baixada. */
const DreamShot: React.FC = () => {
  const { fps } = useVideoConfig();
  const size = LENS.radius * 2;
  // A porta de enrolar da loja pequena: a mesma abertura do desenho da loja (412 de 520 de largura).
  const door = (INNER_SHOP.width * 412) / 520;

  return (
    <AbsoluteFill>
      <IdeaBackdrop hue="lilac" spot={[0.3, 0.5]} />
      <SvgLayer>
        {/* O cone que liga a cabeça à lente: o que se vê ali acontece lá dentro. */}
        <path
          d={`M${HEAD_SPOT.x},${HEAD_SPOT.y - HEAD_SPOT.radius} L${LENS.x - 60},${LENS.y - LENS.radius + 6} L${LENS.x - 60},${LENS.y + LENS.radius - 6} L${HEAD_SPOT.x},${HEAD_SPOT.y + HEAD_SPOT.radius} Z`}
          fill={ink.paper}
          opacity={0.45}
        />
      </SvgLayer>
      <Bed
        {...SLEEPER}
        colors={personInPajamas}
        hue="lilac"
        snoreAt={0.3 * fps}
        snoreSize={130}
      />
      <SvgLayer>
        <circle
          cx={HEAD_SPOT.x}
          cy={HEAD_SPOT.y}
          r={HEAD_SPOT.radius}
          fill="none"
          stroke={ink.paper}
          strokeWidth={10}
        />
      </SvgLayer>
      <Place x={LENS.x} y={LENS.y}>
        <Pop at={4}>
          <div
            style={{
              position: "relative",
              width: size,
              height: size,
              borderRadius: "50%",
              overflow: "hidden",
              boxSizing: "border-box",
              border: `16px solid ${ink.paper}`,
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
                left: LENS.radius - 16,
                top: INNER_SHOP.ground,
                translate: "-50% -100%",
              }}
            >
              <Storefront
                width={INNER_SHOP.width}
                colors={shop.night}
                shutter={1}
              />
            </div>
            {/* A fresta de luz por baixo da porta: lá dentro, alguém trabalha. */}
            <div
              style={{
                position: "absolute",
                left: LENS.radius - 16 - door / 2,
                top: INNER_SHOP.ground - (INNER_SHOP.width * 48) / 520,
                width: door,
                height: 12,
                background: shop.night.lamp,
              }}
            />
          </div>
        </Pop>
      </Place>
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
const SORT_SECONDS = 2;
const KEEPER_X = 1270;

type SortShotProps = {
  /** Quadros do plano em que cada etiqueta entra. */
  readonly provisionalAt: number;
  readonly longTermAt: number;
};

/** A lojista abre cada caixa, olha a lembrança e a encaixa nas tábuas do fundo. */
const SortShot: React.FC<SortShotProps> = ({ provisionalAt, longTermAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const seconds = frame / fps;
  // Uma caixa já está guardada quando o plano começa; as outras vão uma a uma, e duas ficam na pilha.
  const stored = Math.min(
    PILE.length - 3,
    1 + Math.floor(seconds / SORT_SECONDS),
  );
  // A câmera recua um pouco antes da primeira etiqueta.
  const back = ramp(frame, provisionalAt - 0.9 * fps, 0.7 * fps);
  const pileTop = onScreen(
    PILE_SPOT.x,
    FLOOR_Y - CRATE.height * PILE_SPOT.scale,
  );
  const depot = onScreen(STOCKROOM.x + STOCKROOM.width / 2, STOCKROOM.y);

  return (
    <AbsoluteFill>
      <Camera {...cameraBetween(SORT_CLOSE, SORTING, back)}>
        <Layer depth={1}>
          <ShopInside time="night">
            <ShelfGoods />
            <Pile count={PILE.length - stored - 1} />
            <Stored count={stored} />
            <Keeper
              x={KEEPER_X}
              seconds={seconds}
              expression="reading"
              frontArm={{ hand: [-6, -196], bend: 34 }}
              backArm={{ hand: [136, -196], bend: 34 }}
              held={
                // A caixa aberta nas mãos dela: as abas para os lados e a etiqueta da lembrança à vista.
                <g>
                  <path
                    d="M4,-262 L-34,-296 L-20,-304 L18,-270 Z"
                    fill={goods.crateShade}
                  />
                  <path
                    d="M116,-262 L154,-296 L140,-304 L102,-270 Z"
                    fill={goods.crateShade}
                  />
                  <Crate x={60} y={-170} memory={storedMemory(stored)} />
                </g>
              }
            />
          </ShopInside>
        </Layer>
      </Camera>
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

export const StockroomNightScene: React.FC<SceneProps> = ({ scene, shots }) => (
  <>
    <Shot range={shots[0]} name="a porta baixa; as caixas vão para o depósito">
      <CarryShot />
    </Shot>
    <Shot range={shots[1]} name="dentro da cabeça de quem dorme, a loja">
      <DreamShot />
    </Shot>
    <Shot range={shots[2]} name="cada lembrança, do provisório ao longo prazo">
      <SortShot
        provisionalAt={cue(scene, "provisório") - shots[2].from}
        longTermAt={cue(scene, "longo") - shots[2].from}
      />
    </Shot>
  </>
);
