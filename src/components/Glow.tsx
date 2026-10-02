type GlowProps = {
  readonly radius: number;
  readonly color: string;
  readonly opacity?: number;
};

/**
 * Halo de luz em volta de um ponto. É um gradiente radial, não um desfoque,
 * porque desfoques grandes pesam muito no render. Para a luz somar ao fundo
 * em vez de cobri-lo, coloque o halo numa <Layer light>.
 */
export const Glow: React.FC<GlowProps> = ({ radius, color, opacity = 1 }) => (
  <div
    style={{
      width: radius * 2,
      height: radius * 2,
      borderRadius: "50%",
      background: `radial-gradient(closest-side, ${color}, transparent)`,
      opacity,
    }}
  />
);
