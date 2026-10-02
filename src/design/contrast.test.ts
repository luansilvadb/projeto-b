import { describe, expect, it } from "vitest";
import { contrastRatio } from "./contrast";
import { directions } from "./directions";

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

describe.each(Object.entries(directions))("direção %s", (_name, direction) => {
  const { palette } = direction;

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
