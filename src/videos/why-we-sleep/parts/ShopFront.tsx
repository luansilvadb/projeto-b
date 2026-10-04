import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { Storefront } from "../../../art/Storefront";
import {
  Camera,
  Layer,
  framing,
  type CameraState,
} from "../../../components/Camera";
import { Grain } from "../../../components/Grain";
import { wave } from "../../../components/Idle";
import { Place } from "../../../components/Place";
import { SvgLayer } from "../../../components/SvgLayer";
import { shop } from "../palette";
import { ShopStreet, StreetShadow } from "./ShopStreet";

/** A loja da analogia, de frente, no meio do quadro: o meio da calçada e a largura do toldo. */
export const FRONT = { x: 960, ground: 900, width: 820 };
const SCALE = FRONT.width / 520;
/** A abertura da loja no quadro: onde a porta de enrolar desce. */
export const FRONT_OPENING = {
  x: FRONT.x - 206 * SCALE,
  y: FRONT.ground - 306 * SCALE,
  width: 412 * SCALE,
  height: 270 * SCALE,
};
export const FRONT_WIDE = framing([960, 540], 1);
/** A porta de enrolar de perto. */
export const FRONT_CLOSE = framing(
  [FRONT.x, FRONT_OPENING.y + FRONT_OPENING.height / 2],
  1.7,
);

type ShopFrontProps = {
  readonly time: "day" | "night";
  /** Entre o dia (1) e a noite (0), quando a rua passa de um ao outro. */
  readonly daylight?: number;
  readonly camera?: CameraState;
  /** Quanto a porta de enrolar desceu, de 0 a 1. */
  readonly shutter: number;
  /** Luz acesa lá dentro: escapa por baixo da porta baixada. */
  readonly busy?: boolean;
  /** O que mais houver na calçada, na frente da loja. */
  readonly children?: React.ReactNode;
};

/** A fachada da loja na rua, de dia ou de noite: o molde de todo plano em que ela é vista de fora. */
export const ShopFront: React.FC<ShopFrontProps> = ({
  time,
  daylight,
  camera = FRONT_WIDE,
  shutter,
  busy = false,
  children,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const seconds = frame / fps;
  const night = daylight === undefined ? time === "night" : daylight < 0.5;

  return (
    <AbsoluteFill>
      <Camera {...camera}>
        <ShopStreet
          time={time}
          daylight={daylight}
          ground={FRONT.ground}
          orb={[1640, 170]}
        />
        <Layer depth={1}>
          <SvgLayer>
            <StreetShadow
              time={night ? "night" : "day"}
              x={FRONT.x}
              y={FRONT.ground + 8}
              width={FRONT.width}
            />
          </SvgLayer>
          <Place x={FRONT.x} y={FRONT.ground} anchor="bottom">
            <Storefront
              width={FRONT.width}
              colors={night ? shop.night : shop.day}
              shutter={shutter}
            />
          </Place>
          {busy ? (
            // A fresta de luz por baixo da porta e o clarão dela na calçada, que oscila: há movimento lá dentro.
            <SvgLayer>
              <rect
                x={FRONT_OPENING.x}
                y={FRONT_OPENING.y + FRONT_OPENING.height - 14}
                width={FRONT_OPENING.width}
                height={14}
                fill={shop.night.lamp}
              />
              <ellipse
                cx={FRONT.x + FRONT_OPENING.width * 0.25 * wave(seconds, 2.3)}
                cy={FRONT.ground + 30}
                rx={FRONT_OPENING.width * 0.42}
                ry={34}
                fill={shop.night.lamp}
                opacity={0.3 + 0.12 * wave(seconds, 0.7)}
              />
            </SvgLayer>
          ) : null}
          {children}
        </Layer>
      </Camera>
      <Grain />
    </AbsoluteFill>
  );
};
