import {
  AbsoluteFill,
  interpolateColors,
  random,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Layer } from "../../../components/Camera";
import { wave } from "../../../components/Idle";
import { SvgLayer } from "../../../components/SvgLayer";
import { street } from "../palette";

type ShopStreetProps = {
  readonly time: keyof typeof street;
  /** Altura da calçada, onde as lojas pousam, em pixels do quadro. */
  readonly ground: number;
  /** Onde fica o sol ou a lua. */
  readonly orb?: readonly [number, number];
  /** Entre o dia (1) e a noite (0), quando a rua passa de um ao outro; sem valor, vale `time`. */
  readonly daylight?: number;
};

type StreetColors = {
  readonly sky: readonly [string, string];
  readonly far: string;
  readonly farWindow: string;
  readonly sidewalk: string;
  readonly curb: string;
  readonly road: string;
  readonly orb: string;
  readonly star: string;
  readonly contact: string;
};

/** As cores da rua a meio caminho entre o dia e a noite. */
const streetAt = (daylight: number): StreetColors => {
  const { day, night } = street;
  const mixed = (a: string, b: string) =>
    interpolateColors(daylight, [0, 1], [a, b]);
  return {
    sky: [mixed(night.sky[0], day.sky[0]), mixed(night.sky[1], day.sky[1])],
    far: mixed(night.far, day.far),
    farWindow: mixed(night.farWindow, day.farWindow),
    sidewalk: mixed(night.sidewalk, day.sidewalk),
    curb: mixed(night.curb, day.curb),
    road: mixed(night.road, day.road),
    orb: mixed(night.orb, day.orb),
    star: night.star,
    contact: mixed(night.contact, day.contact),
  };
};

// Prédios ao fundo: x, largura e altura acima da calçada. Vão além do quadro para a câmera poder deslizar.
const FAR_BUILDINGS = [
  [-1100, 230, 410],
  [-840, 260, 520],
  [-560, 190, 360],
  [-330, 250, 480],
  [-40, 250, 470],
  [240, 200, 330],
  [470, 270, 560],
  [780, 190, 380],
  [1010, 260, 500],
  [1300, 210, 340],
  [1540, 250, 600],
  [1810, 180, 420],
  [2040, 240, 380],
  [2320, 210, 520],
] as const;
// Quanto o cenário se estende para cada lado, para o deslize da câmera.
const REACH = 1400;
const TWINKLE_SECONDS = 2.2;

/**
 * A rua da loja: céu em degradê, o sol ou a lua, prédios ao fundo, calçada e
 * asfalto. De noite o céu ganha estrelas e a lua é uma crescente. Vai dentro de
 * uma Camera: o céu fica parado, os prédios andam menos que a calçada.
 */
export const ShopStreet: React.FC<ShopStreetProps> = ({
  time,
  ground,
  orb = [1560, 190],
  daylight,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const seconds = frame / fps;
  const colors = daylight === undefined ? street[time] : streetAt(daylight);
  const night = daylight === undefined ? time === "night" : daylight < 0.5;

  return (
    <>
      <Layer depth={0}>
        <AbsoluteFill
          style={{
            background: `linear-gradient(${colors.sky[0]}, ${colors.sky[1]} ${(ground / 1080) * 100}%)`,
          }}
        />
      </Layer>
      <Layer depth={0.15}>
        <SvgLayer>
          {night
            ? Array.from({ length: 90 }, (_, index) => {
                const pick = (trait: string) =>
                  random(`star-${trait}-${index}`);
                return (
                  <circle
                    key={index}
                    cx={-REACH + pick("x") * (1920 + 2 * REACH)}
                    cy={pick("y") * ground * 0.7}
                    r={1.5 + pick("size") * 2.5}
                    fill={colors.star}
                    opacity={
                      0.3 +
                      pick("light") * 0.6 +
                      0.12 * wave(seconds, TWINKLE_SECONDS, pick("phase"))
                    }
                  />
                );
              })
            : null}
          <circle
            cx={orb[0]}
            cy={orb[1]}
            r={150}
            fill={colors.orb}
            opacity={0.12 + 0.02 * wave(seconds, 3)}
          />
          <circle
            cx={orb[0]}
            cy={orb[1]}
            r={64}
            fill={colors.orb}
            opacity={night ? 1 : 0.8}
          />
          {night ? (
            // A sombra que faz da lua uma crescente tem a cor do céu naquela altura.
            <circle
              cx={orb[0] + 26}
              cy={orb[1] - 18}
              r={56}
              fill={colors.sky[0]}
            />
          ) : null}
        </SvgLayer>
      </Layer>

      <Layer depth={0.5}>
        <SvgLayer>
          {FAR_BUILDINGS.map(([x, width, height]) => (
            <g key={x}>
              <rect
                x={x}
                y={ground - height}
                width={width}
                height={height}
                rx={14}
                fill={colors.far}
              />
              {Array.from({ length: Math.floor(height / 110) }, (_, row) =>
                [0.28, 0.68].map((column) => (
                  <rect
                    key={`${row}-${column}`}
                    x={x + width * column - 22}
                    y={ground - height + 44 + row * 110}
                    width={44}
                    height={58}
                    rx={8}
                    fill={colors.farWindow}
                  />
                )),
              )}
            </g>
          ))}
        </SvgLayer>
      </Layer>

      <Layer depth={1}>
        <SvgLayer>
          <rect
            x={-REACH}
            y={ground}
            width={1920 + 2 * REACH}
            height={1080 - ground}
            fill={colors.sidewalk}
          />
          <rect
            x={-REACH}
            y={ground}
            width={1920 + 2 * REACH}
            height={16}
            fill={colors.curb}
          />
          <rect
            x={-REACH}
            y={ground + (1080 - ground) * 0.62}
            width={1920 + 2 * REACH}
            height={(1080 - ground) * 0.38}
            fill={colors.road}
          />
        </SvgLayer>
      </Layer>
    </>
  );
};

type StreetShadowProps = {
  readonly time: keyof typeof street;
  readonly x: number;
  readonly y: number;
  readonly width: number;
};

/** Sombra de contato de uma loja ou de alguém na calçada. Vai dentro de um SvgLayer. */
export const StreetShadow: React.FC<StreetShadowProps> = ({
  time,
  x,
  y,
  width,
}) => (
  <ellipse
    cx={x}
    cy={y}
    rx={width / 2}
    ry={width * 0.04}
    fill={street[time].contact}
    opacity={0.3}
  />
);
