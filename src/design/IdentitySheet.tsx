import { AbsoluteFill, useVideoConfig } from "remotion";
import { Earth } from "../art/Earth";
import { Sun } from "../art/Sun";
import { Backdrop } from "../components/Backdrop";
import { Grain } from "../components/Grain";
import { Label } from "../components/Label";
import { SvgLayer } from "../components/SvgLayer";
import type { Ramp } from "./directions";
import { palette, shape } from "./tokens";

const SWATCH = 88;
// Distância entre a margem segura desenhada e o conteúdo da folha.
const INSET = 40;

const Swatches: React.FC<{
  readonly colors: readonly string[];
  readonly outlined?: boolean;
}> = ({ colors, outlined = false }) => (
  <div
    style={{
      display: "flex",
      borderRadius: shape.tagRadius,
      overflow: "hidden",
      // O contorno separa do fundo as cores que são o próprio fundo.
      outline: outlined
        ? `${shape.stroke.thin}px solid ${palette.mist}`
        : undefined,
    }}
  >
    {colors.map((color) => (
      <div
        key={color}
        style={{ width: SWATCH, height: SWATCH, background: color }}
      />
    ))}
  </div>
);

const rampColors = (ramp: Ramp) => [ramp.light, ramp.base, ramp.dark];

/**
 * Folha da direção de arte ativa num quadro só: paleta, escala de texto,
 * etiquetas, traços, desenhos e a margem segura. É a referência visual de
 * quem compõe cenas.
 */
export const IdentitySheet: React.FC = () => {
  const { width, height } = useVideoConfig();
  const { x, y } = shape.safeArea;

  return (
    <AbsoluteFill>
      <Backdrop />
      <SvgLayer>
        <rect
          x={x}
          y={y}
          width={width - 2 * x}
          height={height - 2 * y}
          fill="none"
          stroke={palette.mist}
          strokeWidth={shape.stroke.thin}
          strokeDasharray="2 20"
          strokeLinecap="round"
          opacity={0.6}
        />
      </SvgLayer>
      <AbsoluteFill
        style={{
          padding: `${y + INSET}px ${x + INSET}px`,
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <Swatches
            outlined
            colors={[palette.ink, palette.dusk, palette.mist, palette.paper]}
          />
          <Swatches colors={rampColors(palette.accent)} />
          <Swatches colors={rampColors(palette.sun)} />
          <Swatches colors={rampColors(palette.ocean)} />
          <Swatches colors={rampColors(palette.leaf)} />
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <Label size="display">8 min 19 s</Label>
            <Label size="headline">300.000 km/s</Label>
            <Label size="label">150 milhões de km</Label>
            <Label size="note">7,5 voltas por segundo</Label>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              gap: 28,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 40 }}>
              <Sun radius={90} />
              <Earth radius={90} />
            </div>
            <Label size="note" tag={palette.accent.base}>
              Órbita
            </Label>
            <Label size="note" tag={palette.sun.base}>
              Fusão
            </Label>
            <Label size="note" tag={palette.ocean.base}>
              Atmosfera
            </Label>
            <Label size="note" tag={palette.leaf.light}>
              Fotossíntese
            </Label>
          </div>
        </div>
      </AbsoluteFill>
      <Grain />
    </AbsoluteFill>
  );
};
