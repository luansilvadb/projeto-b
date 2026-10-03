type PlaceProps = {
  readonly x: number;
  readonly y: number;
  /**
   * Que ponto do conteúdo vai para (x, y): o centro, ou o meio da base, para
   * o que fica em pé no chão.
   */
  readonly anchor?: "center" | "bottom";
  readonly style?: React.CSSProperties;
  readonly children: React.ReactNode;
};

/** Põe o conteúdo num ponto do quadro, em pixels, pelo centro ou pela base. */
export const Place: React.FC<PlaceProps> = ({
  x,
  y,
  anchor = "center",
  style,
  children,
}) => (
  <div style={{ position: "absolute", left: x, top: y }}>
    <div
      style={{
        translate: anchor === "bottom" ? "-50% -100%" : "-50% -50%",
        // Quem está em pé gira e cresce a partir dos pés.
        transformOrigin: anchor === "bottom" ? "50% 100%" : undefined,
        ...style,
      }}
    >
      {children}
    </div>
  </div>
);
