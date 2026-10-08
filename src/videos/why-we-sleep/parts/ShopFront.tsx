import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { Storefront, type StorefrontColors } from "../../../art/Storefront";
import {
  Build,
  Camera,
  Layer,
  Wall,
  framing,
  useBuild,
  type CameraState,
} from "../../../components/Camera";
import { Grain } from "../../../components/Grain";
import { wave } from "../../../components/Idle";
import { Place } from "../../../components/Place";
import { SvgLayer } from "../../../components/SvgLayer";
import { shop, street } from "../palette";
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
  /** O quadro do vídeo em que o plano começa: o relógio da luz e das estrelas, que não salta na troca de plano. */
  readonly clock?: number;
  /** Quanto da rua já se montou em volta da loja, de 0 a 1 (ver `ShopStreet`). Por padrão, pronta. */
  readonly built?: number;
  /**
   * Quanto a luz por baixo da porta oscila, a partir de 0 (acesa e parada): o
   * clarão na calçada vai de um lado para o outro e tremula. Por padrão, 1.
   */
  readonly flicker?: number;
  /**
   * Alguém passa lá dentro: de 0 a 1, a travessia de uma sombra por trás da
   * fresta, da esquerda para a direita. Sem valor, ninguém passa.
   */
  readonly passing?: number;
  /** Quanto a lâmpada da fachada está acesa, de 0 a 1. Por padrão, 1. */
  readonly lamp?: number;
  /** O toldo balança: o tempo, em ciclos, da onda que corre pela barra dele. Sem valor, parado. */
  readonly awning?: number;
  /** A porta aberta, com o balcão do caixa ao fundo. */
  readonly doorOpen?: boolean;
  /** As cores da loja, quando não são as do dia nem as da noite: a silhueta clara de uma transformação. */
  readonly colors?: StorefrontColors;
  /** Quanto o halo do sol ou da lua respira, a partir de 0 (ver `ShopStreet`). */
  readonly halo?: number;
  /**
   * A loja não sobe nem desce com a rua: fica onde a câmera a põe, e a calçada
   * chega por baixo dela. Serve à troca em que a loja é a ponte (o ícone que
   * vira a porta, o cérebro que vira a fachada).
   */
  readonly standing?: boolean;
  /** O tamanho da loja em volta do meio dela, de 0 a 1: ela cresce no ponto, como elenco. Por padrão, 1. */
  readonly grown?: number;
};

// O meio da fachada, em volta do qual ela cresce.
const FRONT_MIDDLE = [FRONT.x, FRONT.ground - 0.4 * FRONT.width] as const;

/** O que está aqui não desce com a camada em que está: o cenário chega em volta. */
const Upright: React.FC<{ on: boolean; children: React.ReactNode }> = ({
  on,
  children,
}) => {
  const built = useBuild();
  return on ? (
    <Build {...built} lit={1}>
      <Wall>{children}</Wall>
    </Build>
  ) : (
    children
  );
};

// A sombra de quem passa lá dentro: dois pés, que alternam, e a mancha deles no clarão da calçada.
const PASSER = { foot: 46, gap: 34, steps: 5 };

/** A fachada da loja na rua, de dia ou de noite: o molde de todo plano em que ela é vista de fora. */
export const ShopFront: React.FC<ShopFrontProps> = ({
  time,
  daylight,
  camera = FRONT_WIDE,
  shutter,
  busy = false,
  children,
  clock = 0,
  built,
  flicker = 1,
  passing,
  lamp,
  awning,
  doorOpen,
  colors,
  halo,
  standing = false,
  grown = 1,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const seconds = (clock + frame) / fps;
  const night = daylight === undefined ? time === "night" : daylight < 0.5;
  const gapY = FRONT_OPENING.y + FRONT_OPENING.height - 14;
  // Quem passa entra por uma ponta da fresta e sai pela outra, a velocidade constante.
  const passerX =
    passing === undefined
      ? 0
      : FRONT_OPENING.x -
        PASSER.foot * 2 +
        (FRONT_OPENING.width + PASSER.foot * 4) * passing;

  return (
    <AbsoluteFill>
      <Camera {...camera}>
        <ShopStreet
          time={time}
          daylight={daylight}
          ground={FRONT.ground}
          orb={[1640, 170]}
          clock={clock}
          built={built}
          halo={halo}
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
          <Upright on={standing}>
            <AbsoluteFill
              style={{
                transformOrigin: `${FRONT_MIDDLE[0]}px ${FRONT_MIDDLE[1]}px`,
                scale: `${grown}`,
              }}
            >
              <Place x={FRONT.x} y={FRONT.ground} anchor="bottom">
                <Storefront
                  width={FRONT.width}
                  colors={colors ?? (night ? shop.night : shop.day)}
                  shutter={shutter}
                  lamp={lamp}
                  awning={awning}
                  doorOpen={doorOpen}
                />
              </Place>
              {busy ? (
                // A fresta de luz por baixo da porta e o clarão dela na calçada, que oscila: há movimento lá dentro.
                <SvgLayer>
                  <rect
                    x={FRONT_OPENING.x}
                    y={gapY}
                    width={FRONT_OPENING.width}
                    height={14}
                    fill={shop.night.lamp}
                  />
                  <ellipse
                    cx={
                      FRONT.x +
                      FRONT_OPENING.width * 0.25 * flicker * wave(seconds, 2.3)
                    }
                    cy={FRONT.ground + 30}
                    rx={FRONT_OPENING.width * 0.42}
                    ry={34}
                    fill={shop.night.lamp}
                    opacity={0.3 + 0.12 * flicker * wave(seconds, 0.7)}
                  />
                  {passing === undefined ? null : (
                    <g>
                      {/* Os dois pés de quem anda lá dentro cortam a fresta, um depois do outro. */}
                      {[0, 1].map((foot) => {
                        const lifted = Math.max(
                          0,
                          Math.sin(
                            (passing * PASSER.steps + foot * 0.5) * Math.PI * 2,
                          ),
                        );
                        const x = passerX + (foot - 0.5) * PASSER.gap * 2;
                        const from = Math.max(
                          FRONT_OPENING.x,
                          x - PASSER.foot / 2,
                        );
                        const to = Math.min(
                          FRONT_OPENING.x + FRONT_OPENING.width,
                          x + PASSER.foot / 2,
                        );
                        return to > from ? (
                          <rect
                            key={foot}
                            x={from}
                            y={gapY + 8 * lifted}
                            width={to - from}
                            height={14 - 8 * lifted}
                            fill={street.night.contact}
                          />
                        ) : null;
                      })}
                      <ellipse
                        cx={passerX}
                        cy={FRONT.ground + 30}
                        rx={PASSER.foot * 2.2}
                        ry={30}
                        fill={street.night.sidewalk}
                        opacity={
                          0.75 * Math.min(1, passing * 8, (1 - passing) * 8)
                        }
                      />
                    </g>
                  )}
                </SvgLayer>
              ) : null}
            </AbsoluteFill>
          </Upright>
          {children}
        </Layer>
      </Camera>
      <Grain />
    </AbsoluteFill>
  );
};
