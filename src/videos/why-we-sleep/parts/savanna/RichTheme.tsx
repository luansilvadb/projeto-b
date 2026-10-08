import { createContext, useContext } from "react";
import { interpolateColors } from "remotion";
import { savanna, type SavannaColors } from "../../palette";

// Os horários compartilham a geometria. A paleta muda por contexto, sem um
// filtro global que também tingiria o elenco e a luz da lua.
export const RichTheme = createContext<{
  readonly palette: SavannaColors;
  /** Quanto é noite, de 0 (do entardecer ao dia) a 1: a opacidade da lua, das estrelas e da borda acesa das nuvens; o sol leva o resto. */
  readonly moonlight: number;
  readonly cameraDriven?: boolean;
  readonly orb?: number;
}>({ palette: savanna.dusk, moonlight: 0 });
export const useRichPalette = () => useContext(RichTheme).palette;
export const useRichTheme = () => useContext(RichTheme);

const SETS = [savanna.night, savanna.dusk, savanna.day] as const;

// Uma chave dos três jogos (cor, lista de cores ou grupo de cores) misturada na luz pedida.
const mixed = (values: readonly unknown[], daylight: number): unknown => {
  const [first] = values;
  if (typeof first === "string") {
    return interpolateColors(daylight, [0, 0.5, 1], values as string[]);
  }
  if (Array.isArray(first)) {
    return first.map((_, index) =>
      mixed(
        values.map((value) => (value as unknown[])[index]),
        daylight,
      ),
    );
  }
  return Object.fromEntries(
    Object.keys(first as object).map((key) => [
      key,
      mixed(
        values.map((value) => (value as Record<string, unknown>)[key]),
        daylight,
      ),
    ]),
  );
};

/**
 * As cores da savana numa luz de 0 (noite) a 1 (dia), passando pelo
 * entardecer em 0,5, para o meio do caminho não ficar barrento. Nos três
 * horários devolve o próprio jogo.
 */
export const savannaColorsAt = (daylight: number): SavannaColors => {
  const at = Math.min(1, Math.max(0, daylight));
  return at % 0.5 === 0 ? SETS[at * 2] : (mixed(SETS, at) as SavannaColors);
};

// O arco do sol e da lua, de leste a oeste, nas unidades do desenho (1672 × 940,5).
const ARC = { x: 836, y: 871, rx: 1219, ry: 714 };

/** Onde o astro está no céu: 0 nasce à esquerda, 1 se põe à direita. */
export const astroAt = (orb: number): readonly [number, number] => {
  const angle = Math.PI * (1 - orb);
  return [ARC.x + ARC.rx * Math.cos(angle), ARC.y - ARC.ry * Math.sin(angle)];
};

/** Onde o elenco pisa no plano aberto, em pixels do quadro. */
export const SAVANNA_GROUND_Y = 880;

/** Sombra de contato no chão da savana. Vai dentro de um SvgLayer. */
export const SavannaShadow: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly daylight: number;
}> = ({ x, y, width, daylight }) => (
  <ellipse
    cx={x}
    cy={y}
    rx={width / 2}
    ry={width * 0.05}
    fill={savannaColorsAt(daylight).contact}
    opacity={0.28}
  />
);
