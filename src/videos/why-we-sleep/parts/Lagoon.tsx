import { useId } from "react";
import {
  AbsoluteFill,
  random,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { taperPath } from "../../../art/shapes";
import { Layer } from "../../../components/Camera";
import { Drifters } from "../../../components/Drifters";
import { wave } from "../../../components/Idle";
import { SvgLayer } from "../../../components/SvgLayer";
import type { LagoonColors } from "../palette";

/** Onde a água-viva pousa no plano aberto: o centro da borda do sino e a largura dele. */
export const JELLYFISH_SPOT = { x: 860, y: 716, width: 330 };

export type ContactShadow = {
  readonly x: number;
  readonly y: number;
  readonly width: number;
};

type LagoonProps = {
  readonly colors: LagoonColors;
  /** De noite a luz é a da lua: mais fraca e com menos feixes. */
  readonly night?: boolean;
  /** Sombra de quem está pousado na areia ou nada perto dela. */
  readonly shadows?: readonly ContactShadow[];
  /** O assunto, no plano da areia. */
  readonly children: React.ReactNode;
};

// Raízes de mangue: x de onde descem, quanto se inclinam e a largura no alto.
const ROOTS_FAR = [
  [70, 90, 34],
  [190, -40, 26],
  [300, 120, 30],
  [1640, -110, 30],
  [1750, 50, 26],
  [1860, -80, 36],
] as const;
const ROOTS_NEAR = [
  [-10, 150, 54],
  [1930, -160, 58],
] as const;
// Feixes de luz: x no alto, largura e força.
const SHAFTS = [
  [260, 150, 0.55],
  [560, 90, 0.4],
  [760, 230, 0.7],
  [1130, 120, 0.45],
  [1420, 180, 0.35],
] as const;
// A luz que atravessa a superfície tremula devagar, cada feixe no seu tempo; o capim balança na corrente.
const SHIMMER_SECONDS = 3.6;
const SWAY_SECONDS = 4.2;
// Manchas de luz que a superfície projeta na areia: x, y, largura e altura.
const CAUSTICS = [
  [300, 840, 260, 34],
  [620, 900, 180, 26],
  [900, 860, 300, 40],
  [1180, 940, 220, 30],
  [1460, 880, 280, 36],
  [1720, 960, 200, 28],
  [460, 1010, 240, 32],
  [1050, 1030, 260, 34],
  [1600, 1040, 220, 30],
] as const;
const SAND =
  "M-200,772 L0,772 C280,738 600,762 900,748 C1280,732 1600,768 1920,740 L2120,740";

const root = (x: number, lean: number, width: number) =>
  taperPath(
    [x, -30],
    [x + lean * 0.2, 380],
    [x + lean, 790],
    width,
    width * 0.45,
  );

/** Uma moita de capim-marinho: folhas que afinam, cada uma num tom e com a sua inclinação. */
const grass = (
  seed: string,
  x: number,
  baseY: number,
  count: number,
  height: number,
  tones: readonly string[],
  spread: number,
) =>
  Array.from({ length: count }, (_, index) => {
    const pick = (trait: string) => random(`${seed}-${trait}-${index}`);
    const bladeX = x + (pick("x") - 0.5) * spread;
    const lean = (pick("lean") - 0.5) * 150;
    const bladeHeight = height * (0.55 + pick("height") * 0.5);
    return (
      <path
        key={`${seed}-${index}`}
        d={taperPath(
          [bladeX, baseY + 12],
          [bladeX + lean * 0.15, baseY - bladeHeight * 0.6],
          [bladeX + lean, baseY - bladeHeight],
          15 + pick("width") * 10,
          2,
        )}
        fill={tones[Math.floor(pick("tone") * tones.length)]}
      />
    );
  });

const blurred = (pixels: number, opacity = 1): React.CSSProperties => ({
  filter: `blur(${pixels}px)`,
  opacity,
});

/**
 * A lagoa rasa onde a água-viva vive, em camadas: água, recife distante,
 * raízes de mangue, feixes de luz, areia, capim e uma moldura desfocada em
 * primeiro plano. Cada camada responde à câmera conforme a distância.
 */
export const Lagoon: React.FC<LagoonProps> = ({
  colors,
  night = false,
  shadows = [],
  children,
}) => {
  const id = useId();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const seconds = frame / fps;
  const [top, upper, lower, bottom] = colors.water;

  return (
    <>
      <Layer depth={0}>
        <AbsoluteFill
          style={{
            background: `linear-gradient(${top}, ${upper} 32%, ${lower} 70%, ${bottom})`,
          }}
        />
        <AbsoluteFill
          style={{
            background: `radial-gradient(ellipse 80% 80% at 42% -8%, ${colors.light}${night ? "66" : "BF"}, ${colors.light}${night ? "1F" : "38"} 45%, transparent)`,
          }}
        />
      </Layer>

      <Layer depth={0.25}>
        <AbsoluteFill style={blurred(6, 0.55)}>
          <SvgLayer>
            <path
              d="M-40,760 C120,640 260,690 420,720 C520,660 640,700 700,760 Z"
              fill={colors.reef}
            />
            <path
              d="M1180,770 C1320,650 1500,640 1640,700 C1760,650 1900,690 1980,760 Z"
              fill={colors.reef}
            />
          </SvgLayer>
        </AbsoluteFill>
      </Layer>

      <Layer depth={0.45}>
        <AbsoluteFill style={blurred(6, 0.6)}>
          <SvgLayer>
            {ROOTS_FAR.map(([x, lean, width]) => (
              <path key={x} d={root(x, lean, width)} fill={colors.rootsFar} />
            ))}
          </SvgLayer>
        </AbsoluteFill>
      </Layer>

      <Layer depth={0.6} light>
        <AbsoluteFill style={blurred(3)}>
          <SvgLayer>
            <defs>
              <linearGradient id={id} x1={0} y1={0} x2={0} y2={1}>
                <stop offset={0} stopColor={colors.light} stopOpacity={0.38} />
                <stop offset={1} stopColor={colors.light} stopOpacity={0} />
              </linearGradient>
            </defs>
            {SHAFTS.filter((_, index) => !night || index % 2 === 0).map(
              ([x, width, strength], index) => (
                <path
                  key={x}
                  d={`M${x},-10 L${x + width},-10 L${x + width - 330},900 L${x - 400},900 Z`}
                  fill={`url(#${id})`}
                  opacity={
                    strength *
                    (night ? 0.6 : 1) *
                    (0.75 + 0.25 * wave(seconds, SHIMMER_SECONDS, index / 5))
                  }
                  transform={`translate(${14 * wave(seconds, SHIMMER_SECONDS * 1.7, index / 3)} 0)`}
                />
              ),
            )}
          </SvgLayer>
        </AbsoluteFill>
      </Layer>

      <Layer depth={0.7}>
        <AbsoluteFill style={blurred(3, 0.8)}>
          <SvgLayer>
            {ROOTS_NEAR.map(([x, lean, width]) => (
              <path key={x} d={root(x, lean, width)} fill={colors.rootsNear} />
            ))}
          </SvgLayer>
        </AbsoluteFill>
      </Layer>

      <Layer depth={0.85}>
        <AbsoluteFill style={blurred(3, 0.75)}>
          <SvgLayer>
            {grass("far-left", 330, 765, 9, 230, colors.grassFar, 90)}
            {grass("far-right", 1560, 760, 10, 250, colors.grassFar, 90)}
          </SvgLayer>
        </AbsoluteFill>
      </Layer>

      <Layer depth={1}>
        <SvgLayer>
          <defs>
            <linearGradient id={`${id}-sand`} x1={0} y1={0} x2={0} y2={1}>
              <stop offset={0} stopColor={colors.sand[0]} />
              <stop offset={0.45} stopColor={colors.sand[1]} />
              <stop offset={1} stopColor={colors.sand[2]} />
            </linearGradient>
          </defs>
          <path
            d={`${SAND} L2120,1300 L-200,1300 Z`}
            fill={`url(#${id}-sand)`}
          />
          <path
            d={`${SAND} L2120,752 L1920,752 C1600,780 1280,744 900,760 C600,774 280,750 0,784 L-200,784 Z`}
            fill={colors.sandEdge}
            opacity={0.8}
          />
          {Array.from({ length: 16 }, (_, index) => {
            const pick = (trait: string) => random(`ripple-${trait}-${index}`);
            return (
              <ellipse
                key={index}
                cx={pick("x") * 1920}
                cy={800 + pick("y") * 250}
                rx={70 + pick("width") * 190}
                ry={5 + pick("height") * 6}
                fill={colors.ripple}
                opacity={0.35 + pick("light") * 0.3}
              />
            );
          })}
          {Array.from({ length: 9 }, (_, index) => {
            const pick = (trait: string) => random(`pebble-${trait}-${index}`);
            const x = 120 + pick("x") * 1680;
            const y = 815 + pick("y") * 220;
            const size = 9 + pick("size") * 14;
            return (
              <g key={index}>
                <ellipse
                  cx={x}
                  cy={y}
                  rx={size * 1.5}
                  ry={size}
                  fill={colors.pebble[0]}
                />
                <ellipse
                  cx={x - size * 0.2}
                  cy={y - size * 0.3}
                  rx={size * 0.9}
                  ry={size * 0.45}
                  fill={colors.pebble[1]}
                />
              </g>
            );
          })}
          {/* A luz da superfície dança na areia. */}
          {CAUSTICS.map(([x, y, width, height], index) => (
            <ellipse
              key={index}
              cx={x + 26 * wave(seconds, 3.8, index / 7)}
              cy={y + 5 * wave(seconds, 2.9, index / 4)}
              rx={width / 2}
              ry={height / 2}
              fill={colors.light}
              opacity={
                (night ? 0.06 : 0.16) *
                (0.7 + 0.3 * wave(seconds, 2.3, index / 5))
              }
              style={{ filter: "blur(5px)" }}
            />
          ))}
          {grass("left", 230, 800, 8, 190, colors.grass, 110)}
          {grass("right", 1700, 792, 8, 200, colors.grass, 120)}
          {/* Mais perto dela: entram pelas bordas nos planos médios. */}
          {grass("near-left", 470, 800, 6, 120, colors.grass, 80)}
          {grass("near-right", 1380, 794, 6, 160, colors.grass, 90)}
          {shadows.map((shadow, index) => (
            <ellipse
              key={index}
              cx={shadow.x}
              cy={shadow.y}
              rx={shadow.width / 2}
              ry={shadow.width * 0.046}
              fill={colors.contact}
              opacity={0.3}
            />
          ))}
        </SvgLayer>
        {children}
      </Layer>

      <Layer depth={0.9}>
        <Drifters
          seed="plankton"
          count={80}
          color={colors.particle}
          opacity={night ? 0.6 : 0.5}
          size={[2, 7]}
          speed={1.8}
        />
      </Layer>

      <Layer depth={1.5}>
        {/* A moldura desfocada balança na corrente, como o capim do fundo, só que mais perto. */}
        <AbsoluteFill
          style={{
            ...blurred(14),
            transformOrigin: "50% 100%",
            rotate: `${2 * wave(seconds, SWAY_SECONDS)}deg`,
          }}
        >
          <SvgLayer>
            {grass("front-left", 40, 1110, 7, 520, colors.foreground, 260)}
            {grass("front-right", 1890, 1110, 7, 470, colors.foreground, 240)}
          </SvgLayer>
        </AbsoluteFill>
      </Layer>

      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 75% 75% at 50% 50%, transparent 55%, ${colors.vignette}8C)`,
        }}
      />
    </>
  );
};
