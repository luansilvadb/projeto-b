import { AbsoluteFill } from "remotion";
import { palette } from "../design/tokens";

type BackdropProps = {
  readonly top?: string;
  readonly bottom?: string;
};

/** Fundo de cena: um gradiente vertical que dá profundidade sem disputar atenção. */
export const Backdrop: React.FC<BackdropProps> = ({
  top = palette.ink,
  bottom = palette.dusk,
}) => (
  <AbsoluteFill style={{ background: `linear-gradient(${top}, ${bottom})` }} />
);
