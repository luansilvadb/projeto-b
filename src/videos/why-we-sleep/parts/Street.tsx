import { Shop } from "../../../art/Shop";
import { Place } from "../../../components/Place";

type StreetProps = {
  /** Luz da loja aberta, a do meio da rua: 0 apagada, 1 acesa. */
  readonly openLit?: number;
};

const SHOPS = [240, 600, 960, 1320, 1680];
const OPEN_SHOP = 2;

/**
 * Uma rua de lojas iguais, todas fechadas menos a do meio. É a rua das cenas
 * que ainda não foram redesenhadas; as novas usam ShopStreet.
 */
export const Street: React.FC<StreetProps> = ({ openLit = 1 }) => (
  <>
    {SHOPS.map((x, index) => (
      <Place key={x} x={x} y={640}>
        <Shop
          width={300}
          shutter={index === OPEN_SHOP ? 0 : 1}
          lit={index === OPEN_SHOP ? openLit : 0}
        />
      </Place>
    ))}
  </>
);
