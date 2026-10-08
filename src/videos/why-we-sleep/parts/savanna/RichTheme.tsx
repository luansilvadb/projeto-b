import { createContext, useContext } from "react";
import { savanna, type SavannaColors } from "../../palette";

// Os dois horários compartilham a geometria. A paleta muda por contexto,
// sem um filtro global que também tingiria o antílope e a luz da lua.
export const RichTheme = createContext<{
  readonly palette: SavannaColors;
  readonly night: boolean;
  readonly cameraDriven?: boolean;
  readonly orb?: number;
}>({ palette: savanna.dusk, night: false });
export const useRichPalette = () => useContext(RichTheme).palette;
export const useNight = () => useContext(RichTheme).night;
export const useRichTheme = () => useContext(RichTheme);
