import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { Grain } from "../../../components/Grain";
import { SlowPush } from "../../../components/SlowPush";
import { SvgLayer } from "../../../components/SvgLayer";
import type { SceneProps } from "../../../video/NarratedVideo";
import { Shot } from "../../../video/Shot";
import {
  Crate,
  STOCKROOM,
  STOCK_SHELVES,
  ShelfGoods,
  ShopInside,
  Sweeper,
} from "../parts/ShopInside";
import { linear } from "../../../components/timing";

const SWEEPER_X = 420;

/** A loja de porta baixada, vista por dentro: o estoque guardado, as prateleiras aliviadas e o chão varrido, tudo ao mesmo tempo. */
export const AllAtOnceShot: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const seconds = frame / fps;

  return (
    <AbsoluteFill>
      <SlowPush focus={[960, 600]}>
        <ShopInside time="night">
          <ShelfGoods
            overflowing
            trimmed={linear(frame, 0, durationInFrames * 0.8)}
          />
          <SvgLayer>
            {STOCK_SHELVES.flatMap((y, shelf) =>
              [-80, 80].map((dx, index) => (
                <Crate
                  key={`${y}-${dx}`}
                  x={STOCKROOM.x + STOCKROOM.width / 2 + dx}
                  y={y}
                  scale={0.9}
                  memory={
                    (["face", "path", "star", "note"] as const)[
                      (shelf * 2 + index) % 4
                    ]
                  }
                />
              )),
            )}
          </SvgLayer>
          <Sweeper x={SWEEPER_X} seconds={seconds} flip />
        </ShopInside>
      </SlowPush>
      <Grain />
    </AbsoluteFill>
  );
};

export const ManyReasonsScene: React.FC<SceneProps> = ({ shots }) => (
  <Shot range={shots[0]} name="uma loja não fecha por um motivo só">
    <AllAtOnceShot />
  </Shot>
);
