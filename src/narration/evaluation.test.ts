import { describe, expect, it } from "vitest";
import {
  chooseTakes,
  closestToReference,
  mostNatural,
  summarize,
  type EvaluatedTake,
} from "./evaluation";

const take = (overrides: Partial<EvaluatedTake>): EvaluatedTake => ({
  sentence: 0,
  seed: 1,
  complete: true,
  naturalness: 3,
  pitchDistance: 0.5,
  intonation: 4,
  errors: 0,
  ...overrides,
});

describe("closestToReference", () => {
  it("fica com a geração inteira de altura mais próxima da amostra", () => {
    const takes = [
      take({ seed: 1, pitchDistance: 0.1, complete: false }),
      take({ seed: 2, pitchDistance: 0.8 }),
      take({ seed: 3, pitchDistance: 0.4 }),
    ];
    expect(closestToReference(takes).seed).toBe(3);
  });

  it("aceita uma geração cortada quando todas saíram cortadas", () => {
    const takes = [
      take({ seed: 1, pitchDistance: 0.9, complete: false }),
      take({ seed: 2, pitchDistance: 0.2, complete: false }),
    ];
    expect(closestToReference(takes).seed).toBe(2);
  });

  it("trata a geração sem voz mensurável como a mais distante", () => {
    const takes = [
      take({ seed: 1, pitchDistance: null }),
      take({ seed: 2, pitchDistance: 3 }),
    ];
    expect(closestToReference(takes).seed).toBe(2);
  });
});

describe("mostNatural", () => {
  it("fica com a mais natural entre as de altura dentro da tolerância", () => {
    const takes = [
      take({ seed: 1, pitchDistance: 0.2, naturalness: 3.1 }),
      take({ seed: 2, pitchDistance: 0.9, naturalness: 3.8 }),
      take({ seed: 3, pitchDistance: 1.6, naturalness: 4.2 }),
      take({ seed: 4, pitchDistance: 0.1, naturalness: 4.5, complete: false }),
    ];
    expect(mostNatural(takes).seed).toBe(2);
  });

  it("volta à escolha por altura quando nenhuma está dentro da tolerância", () => {
    const takes = [
      take({ seed: 1, pitchDistance: 2.5, naturalness: 4 }),
      take({ seed: 2, pitchDistance: 1.4, naturalness: 3 }),
    ];
    expect(mostNatural(takes).seed).toBe(2);
  });
});

describe("chooseTakes", () => {
  it("escolhe uma geração por frase, na ordem das frases", () => {
    const takes = [
      take({ sentence: 1, seed: 1, pitchDistance: 0.3 }),
      take({ sentence: 0, seed: 1, pitchDistance: 0.7 }),
      take({ sentence: 0, seed: 2, pitchDistance: 0.2 }),
    ];
    const chosen = chooseTakes(takes, closestToReference);
    expect(chosen.map(({ sentence, seed }) => [sentence, seed])).toEqual([
      [0, 2],
      [1, 1],
    ]);
  });
});

describe("summarize", () => {
  it("tira a média das medidas, sem contar as que não puderam ser medidas", () => {
    const summary = summarize([
      take({ naturalness: 3, intonation: 4, pitchDistance: 1, errors: 0 }),
      take({
        naturalness: 4,
        intonation: null,
        pitchDistance: null,
        errors: 2,
      }),
      take({
        naturalness: 5,
        intonation: 2,
        pitchDistance: 0,
        complete: false,
      }),
      take({ naturalness: 4, intonation: 3, pitchDistance: 2, errors: 0 }),
    ]);
    expect(summary).toEqual({
      naturalness: 4,
      intonation: 3,
      pitchDistance: 1,
      completeRate: 0.75,
      errors: 0.5,
    });
  });
});
