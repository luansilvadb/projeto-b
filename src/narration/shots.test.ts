import { describe, expect, it } from "vitest";
import { shotShares, shotStartWords } from "./shots";

const narration = "A água-viva pulsa. Quando a noite chega, ela pulsa menos.";

describe("shotStartWords", () => {
  it("põe o primeiro plano no começo e os outros na palavra da deixa", () => {
    expect(
      shotStartWords(narration, [{}, { cue: "Quando" }, { cue: "MENOS" }]),
    ).toEqual([0, 4, 10]);
  });

  it("conta as palavras como a narração conta: o hífen separa", () => {
    expect(shotStartWords(narration, [{}, { cue: "viva" }])).toEqual([0, 2]);
  });

  it("escolhe a ocorrência pedida de uma palavra repetida", () => {
    expect(
      shotStartWords(narration, [{}, { cue: "pulsa", occurrence: 2 }]),
    ).toEqual([0, 9]);
  });

  it("marca a deixa que não está na narração", () => {
    expect(
      shotStartWords(narration, [
        {},
        { cue: "dorme" },
        { cue: "pulsa", occurrence: 3 },
      ]),
    ).toEqual([0, undefined, undefined]);
  });
});

describe("shotShares", () => {
  it("divide a narração entre os planos na proporção do texto de cada um", () => {
    const shares = shotShares(narration, [{}, { cue: "Quando" }]);
    const split = narration.indexOf("Quando");

    expect(shares[0]).toBeCloseTo(split / narration.length);
    expect(shares[0] + shares[1]).toBeCloseTo(1);
  });

  it("dá a cena inteira a um plano único", () => {
    expect(shotShares(narration, [{}])).toEqual([1]);
  });

  it("falha quando uma deixa não está na narração", () => {
    expect(() => shotShares(narration, [{}, { cue: "dorme" }])).toThrowError(
      /plano 2/,
    );
  });
});
