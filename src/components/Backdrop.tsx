import { AbsoluteFill } from "remotion";
import { palette } from "../design/tokens";

/** Fundo de cena: um gradiente vertical que dá profundidade sem disputar atenção. */
export const Backdrop: React.FC = () => (
  <AbsoluteFill
    style={{ background: `linear-gradient(${palette.ink}, ${palette.dusk})` }}
  />
);
