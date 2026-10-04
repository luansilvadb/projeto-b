import { useId } from "react";
import { interpolateColors } from "remotion";
import {
  Storefront,
  type StorefrontColors,
  type StorefrontSign,
} from "../../../art/Storefront";
import { Layer } from "../../../components/Camera";
import { Place } from "../../../components/Place";
import { SvgLayer } from "../../../components/SvgLayer";
import { coin, shop } from "../palette";
import { ShopStreet, StreetShadow } from "./ShopStreet";

/**
 * A rua inteira de noite: uma loja por bicho, no mesmo molde, e no fim da rua
 * a única que fica acesa. A câmera recua e desliza por ela sem redesenhar nada.
 */
export const SHOP_ROW: readonly { x: number; sign: StorefrontSign }[] = [
  { x: 200, sign: "trunk" },
  { x: 580, sign: "fin" },
  { x: 960, sign: "moon" },
  { x: 1340, sign: "mouse" },
  { x: 1720, sign: "bell" },
  { x: 2100, sign: "wing" },
];
/** A loja de quem assiste, e a que fica acesa, pela posição na fila. */
export const YOUR_SHOP = 2;
export const LIT_SHOP = 5;
export const ROW_GROUND = 900;
export const ROW_WIDTH = 350;
// As moedas que bateram na porta continuam na calçada da sua loja: x, y e raio, em relação à loja.
const COINS = [
  [-155, 47, 13],
  [-104, 22, 14],
  [-40, 42, 15],
  [30, 24, 13],
  [91, 44, 15],
  [-68, 51, 15],
] as const;

export type ShopState = {
  /** Quanto a porta de enrolar desceu, de 0 a 1. */
  readonly shutter: number;
  /** Quanto a lâmpada está acesa, de 0 a 1. */
  readonly lamp: number;
  /** A vitrine acesa, com as cores de dia por dentro. */
  readonly lit?: boolean;
};

type ShopRowProps = {
  readonly shops: readonly ShopState[];
  readonly orb?: readonly [number, number];
  /** Entre o dia (1) e a noite (0); sem valor, é noite. */
  readonly daylight?: number;
};

/** As cores de uma loja a meio caminho entre o dia e a noite. */
const shopAt = (daylight: number, lit: boolean): StorefrontColors => {
  const night = lit ? shop.lit : shop.night;
  const day = shop.day;
  const mixed = (a: string, b: string) =>
    interpolateColors(daylight, [0, 1], [a, b]);
  return {
    wall: mixed(night.wall, day.wall),
    wallShade: mixed(night.wallShade, day.wallShade),
    base: mixed(night.base, day.base),
    sign: mixed(night.sign, day.sign),
    signIcon: mixed(night.signIcon, day.signIcon),
    awning: [
      mixed(night.awning[0], day.awning[0]),
      mixed(night.awning[1], day.awning[1]),
    ],
    awningRail: mixed(night.awningRail, day.awningRail),
    glass: mixed(night.glass, day.glass),
    glassShine: mixed(night.glassShine, day.glassShine),
    frame: mixed(night.frame, day.frame),
    goods: [
      mixed(night.goods[0], day.goods[0]),
      mixed(night.goods[1], day.goods[1]),
    ],
    door: mixed(night.door, day.door),
    doorShade: mixed(night.doorShade, day.doorShade),
    knob: mixed(night.knob, day.knob),
    shutter: mixed(night.shutter, day.shutter),
    shutterLine: mixed(night.shutterLine, day.shutterLine),
    lamp: mixed(night.lamp, day.lamp),
    lampGlow: daylight < 0.5 ? night.lampGlow : null,
  };
};

/** A fila de lojas na rua, no plano do assunto. Vai dentro de uma Camera. */
export const ShopRow: React.FC<ShopRowProps> = ({
  shops,
  orb = [1500, 170],
  daylight = 0,
}) => {
  const id = useId();

  return (
    <>
      <ShopStreet
        time="night"
        ground={ROW_GROUND}
        orb={orb}
        daylight={daylight}
      />
      <Layer depth={1}>
        <SvgLayer>
          <defs>
            <linearGradient id={id} x1={0} y1={0} x2={0} y2={1}>
              <stop offset={0} stopColor={shop.lit.glass} stopOpacity={0.5} />
              <stop offset={1} stopColor={shop.lit.glass} stopOpacity={0} />
            </linearGradient>
          </defs>
          {SHOP_ROW.map(({ x }, index) => (
            <g key={x}>
              <StreetShadow
                time="night"
                x={x}
                y={ROW_GROUND + 6}
                width={ROW_WIDTH}
              />
              {/* A luz da vitrine acesa se derrama na calçada, só de noite. */}
              {shops[index]?.lit && daylight < 0.5 ? (
                <path
                  d={`M${x - 135},${ROW_GROUND} L${x + 135},${ROW_GROUND} L${x + 290},1080 L${x - 290},1080 Z`}
                  fill={`url(#${id})`}
                  opacity={(1 - daylight * 2) * (shops[index]?.lamp ?? 1)}
                />
              ) : null}
            </g>
          ))}
        </SvgLayer>
        {SHOP_ROW.map(({ x, sign }, index) => {
          const state = shops[index] ?? { shutter: 1, lamp: 1 };
          return (
            <Place key={x} x={x} y={ROW_GROUND} anchor="bottom">
              <Storefront
                width={ROW_WIDTH}
                colors={
                  daylight > 0
                    ? shopAt(daylight, state.lit ?? false)
                    : state.lit
                      ? shop.lit
                      : shop.night
                }
                shutter={state.shutter}
                lamp={state.lamp}
                sign={sign}
              />
            </Place>
          );
        })}
        <SvgLayer>
          {COINS.map(([dx, dy, r]) => (
            <g
              key={dx}
              transform={`translate(${SHOP_ROW[YOUR_SHOP].x + dx} ${ROW_GROUND + dy})`}
            >
              <ellipse cy={r * 0.16} rx={r} ry={r * 0.5} fill={coin.edge} />
              <ellipse rx={r} ry={r * 0.5} fill={coin.face} />
            </g>
          ))}
        </SvgLayer>
      </Layer>
    </>
  );
};
