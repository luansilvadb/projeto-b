type PlaceProps = {
  readonly x: number;
  readonly y: number;
  readonly style?: React.CSSProperties;
  readonly children: React.ReactNode;
};

/** Centraliza o conteúdo num ponto do quadro, em pixels. */
export const Place: React.FC<PlaceProps> = ({ x, y, style, children }) => (
  <div style={{ position: "absolute", left: x, top: y }}>
    <div style={{ translate: "-50% -50%", ...style }}>{children}</div>
  </div>
);
