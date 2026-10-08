import { describe, expect, it } from "vitest";
import { palette } from "./tokens";

/** Luminância relativa de uma cor "#RRGGBB", pela definição da WCAG 2. */
const luminance = (hex: string): number => {
  if (!/^#[0-9a-f]{6}$/i.test(hex)) {
    throw new Error(`Cor fora do formato #RRGGBB: "${hex}".`);
  }
  const [red, green, blue] = [1, 3, 5].map((start) => {
    const channel = parseInt(hex.slice(start, start + 2), 16) / 255;
    return channel <= 0.04045
      ? channel / 12.92
      : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
};

/** Razão de contraste da WCAG entre duas cores: de 1 (iguais) a 21 (preto e branco). */
const contrastRatio = (first: string, second: string): number => {
  const [darker, lighter] = [luminance(first), luminance(second)].sort(
    (a, b) => a - b,
  );
  return (lighter + 0.05) / (darker + 0.05);
};

describe("contrastRatio", () => {
  it("vai de 1, entre cores iguais, a 21, entre preto e branco", () => {
    expect(contrastRatio("#3D8FE0", "#3D8FE0")).toBeCloseTo(1);
    expect(contrastRatio("#000000", "#FFFFFF")).toBeCloseTo(21);
  });

  it("não depende da ordem das cores", () => {
    expect(contrastRatio("#0B1020", "#F3F5FA")).toBeCloseTo(
      contrastRatio("#F3F5FA", "#0B1020"),
    );
  });

  it("recusa cor fora do formato #RRGGBB", () => {
    expect(() => contrastRatio("#FFF", "#000000")).toThrow("#RRGGBB");
  });
});

// Níveis AAA e AA da WCAG para texto.
const LOOSE_TEXT_MINIMUM = 7;
const TAG_TEXT_MINIMUM = 4.5;

describe("direção abissal", () => {
  it("dá leitura ao texto solto nas duas pontas do fundo", () => {
    for (const background of [palette.ink, palette.dusk]) {
      expect(
        contrastRatio(palette.paper, background),
        `paper sobre ${background}`,
      ).toBeGreaterThanOrEqual(LOOSE_TEXT_MINIMUM);
    }
  });

  it("dá leitura ao texto em toda cor de etiqueta", () => {
    const ramps = [palette.sun, palette.ocean, palette.leaf, palette.accent];
    for (const tag of ramps.flatMap((ramp) => [ramp.light, ramp.base])) {
      expect(
        contrastRatio(palette.ink, tag),
        `ink sobre ${tag}`,
      ).toBeGreaterThanOrEqual(TAG_TEXT_MINIMUM);
    }
  });
});
