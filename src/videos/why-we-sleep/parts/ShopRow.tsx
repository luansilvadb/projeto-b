import { useId } from "react";
import { Storefront, type StorefrontSign } from "../../../art/Storefront";
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
};

/** A fila de lojas na rua de noite, no plano do assunto. Vai dentro de uma Camera. */
export const ShopRow: React.FC<ShopRowProps> = ({
  shops,
  orb = [1500, 170],
}) => {
  const id = useId();

  return (
    <>
      <ShopStreet time="night" ground={ROW_GROUND} orb={orb} />
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
              {/* A luz da vitrine acesa se derrama na calçada. */}
              {shops[index]?.lit ? (
                <path
                  d={`M${x - 135},${ROW_GROUND} L${x + 135},${ROW_GROUND} L${x + 290},1080 L${x - 290},1080 Z`}
                  fill={`url(#${id})`}
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
                colors={state.lit ? shop.lit : shop.night}
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
