import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { Person } from "../../../art/Person";
import { Camera, Layer, framing } from "../../../components/Camera";
import { Grain } from "../../../components/Grain";
import { breath } from "../../../components/Idle";
import { Place } from "../../../components/Place";
import { SlowPush } from "../../../components/SlowPush";
import { SvgLayer } from "../../../components/SvgLayer";
import type { SceneProps } from "../../../video/NarratedVideo";
import { Shot } from "../../../video/Shot";
import { customer } from "../palette";
import { FRONT, ShopFront } from "../parts/ShopFront";
import {
  CRATE,
  Crate,
  ENTRANCE,
  FLOOR_Y,
  Keeper,
  STOCKROOM,
  STOCK_SHELVES,
  ShelfGoods,
  ShopInside,
  type Memory,
} from "../parts/ShopInside";
import { linear, mix } from "../../../components/timing";

// A pilha do dia, na porta: onde cada caixa fica, a partir do meio da pilha e do chão.
const PILE = [
  [-130, 0],
  [0, 0],
  [130, 0],
  [-65, 1],
  [65, 1],
  [0, 2],
] as const;
const PILE_X = {
  street: FRONT.x + 150,
  inside: ENTRANCE.x + ENTRANCE.width + 190,
};
// Onde cada caixa guardada pousa no depósito: duas por tábua.
const STORED = STOCK_SHELVES.flatMap((y) =>
  [-80, 80].map((dx) => [STOCKROOM.x + STOCKROOM.width / 2 + dx, y] as const),
);
const MEMORIES: readonly Memory[] = [
  "face",
  "path",
  "star",
  "note",
  "face",
  "path",
];
const TRIP_SECONDS = 1.1;

type PileProps = {
  readonly x: number;
  readonly ground: number;
  /** Quantas caixas ainda estão na pilha. */
  readonly left?: number;
};

/** A pilha de caixas do dia. */
const Pile: React.FC<PileProps> = ({ x, ground, left = PILE.length }) => (
  <SvgLayer>
    {PILE.slice(0, left).map(([dx, row]) => (
      <Crate key={`${dx}-${row}`} x={x + dx} y={ground - row * CRATE.height} />
    ))}
  </SvgLayer>
);

/** De dia, as caixas que chegam se empilham na entrada da loja e atrapalham a passagem. */
const PiledShot: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const seconds = frame / fps;

  return (
    <>
      <ShopFront time="day" shutter={0}>
        <Pile x={PILE_X.street} ground={FRONT.ground + 40} />
        <Place
          x={FRONT.x + 520}
          y={FRONT.ground + 60}
          anchor="bottom"
          style={{ scale: `1 ${breath(seconds, "customer")}` }}
        >
          <Person height={430} colors={customer} expression="puzzled" />
        </Place>
      </ShopFront>
    </>
  );
};

/** De porta baixada, a lojista carrega as caixas da entrada para o depósito dos fundos. */
const CarryingShot: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const seconds = frame / fps;
  // Cada viagem leva uma caixa: ela vai carregada e volta de mãos vazias.
  const trips = Math.min(PILE.length, frame / (TRIP_SECONDS * fps));
  const stored = Math.floor(trips);
  const within = trips - stored;
  const carrying = within < 0.5 && stored < PILE.length;
  const x = carrying
    ? mix(PILE_X.inside + 150, STOCKROOM.x - 60, within * 2)
    : mix(STOCKROOM.x - 60, PILE_X.inside + 150, (within - 0.5) * 2);

  return (
    <AbsoluteFill>
      <SlowPush focus={[960, 600]}>
        <ShopInside time="night">
          <ShelfGoods />
          <Pile
            x={PILE_X.inside}
            ground={FLOOR_Y}
            left={PILE.length - stored - (carrying ? 1 : 0)}
          />
          <SvgLayer>
            {STORED.slice(0, stored).map(([sx, sy]) => (
              <Crate key={`${sx}-${sy}`} x={sx} y={sy} scale={0.9} />
            ))}
          </SvgLayer>
          <Keeper
            x={x}
            seconds={seconds}
            flip={!carrying}
            frontArm={carrying ? { hand: [-40, -250], bend: 30 } : undefined}
            backArm={carrying ? { hand: [150, -250], bend: 30 } : undefined}
            held={
              carrying ? (
                <g transform="scale(1.25)">
                  <Crate x={44} y={-160} />
                </g>
              ) : undefined
            }
          />
        </ShopInside>
      </SlowPush>
      <Grain />
    </AbsoluteFill>
  );
};

const STOCK_CLOSE = framing(
  [STOCKROOM.x + STOCKROOM.width / 2, STOCKROOM.y + STOCKROOM.height / 2 + 30],
  1.7,
);
const SETTLE_STAGGER_SECONDS = 0.3;

/** De perto, o depósito: as caixas se encaixam nas tábuas, cada uma com a etiqueta de uma lembrança. */
const StoredShot: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill>
      <Camera {...STOCK_CLOSE}>
        <Layer depth={1}>
          <ShopInside time="night">
            <SvgLayer>
              {STORED.map(([sx, sy], index) => {
                const settled = linear(
                  frame,
                  index * SETTLE_STAGGER_SECONDS * fps,
                  0.25 * fps,
                );
                return settled > 0 ? (
                  <Crate
                    key={index}
                    x={mix(sx - 160, sx, settled)}
                    y={sy}
                    scale={0.9}
                    memory={MEMORIES[index]}
                  />
                ) : null;
              })}
            </SvgLayer>
          </ShopInside>
        </Layer>
      </Camera>
      <Grain />
    </AbsoluteFill>
  );
};

export const StockroomScene: React.FC<SceneProps> = ({ shots }) => (
  <>
    <Shot range={shots[0]} name="as caixas do dia na entrada">
      <PiledShot />
    </Shot>
    <Shot range={shots[1]} name="de porta baixada, a lojista guarda as caixas">
      <CarryingShot />
    </Shot>
    <Shot range={shots[2]} name="cada caixa, uma lembrança">
      <StoredShot />
    </Shot>
  </>
);
