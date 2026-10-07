import { createContext, useContext } from "react";
import { richPalette, type RichPalette } from "./richPalette";

// Os dois horários compartilham a geometria. A paleta muda por contexto,
// sem um filtro global que também tingiria o antílope e a luz da lua.
export const RichTheme = createContext<{
  readonly palette: RichPalette;
  readonly night: boolean;
  readonly cameraDriven?: boolean;
  readonly orb?: number;
}>({ palette: richPalette, night: false });
export const useRichPalette = () => useContext(RichTheme).palette;
export const useNight = () => useContext(RichTheme).night;
export const useRichTheme = () => useContext(RichTheme);
