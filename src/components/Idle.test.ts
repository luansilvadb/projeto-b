import { describe, expect, it } from "vitest";
import { blink, breath, phaseOf, wave } from "./Idle";

describe("breath", () => {
  it("oscila em volta de 1 dentro da amplitude pedida", () => {
    const values = Array.from({ length: 120 }, (_, index) =>
      breath(index / 30, "pessoa", { amplitude: 0.02 }),
    );
    expect(Math.max(...values)).toBeLessThanOrEqual(1.02);
    expect(Math.min(...values)).toBeGreaterThanOrEqual(0.98);
    expect(Math.max(...values)).toBeGreaterThan(1.015);
  });

  it("vizinhos com sementes diferentes não respiram juntos", () => {
    expect(breath(0, "a")).not.toBeCloseTo(breath(0, "b"), 3);
  });
});

describe("wave", () => {
  it("completa um ciclo no período e desloca pela fase", () => {
    expect(wave(0, 4)).toBeCloseTo(0);
    expect(wave(1, 4)).toBeCloseTo(1);
    expect(wave(4, 4)).toBeCloseTo(0);
    expect(wave(0, 4, 0.25)).toBeCloseTo(1);
  });
});

describe("phaseOf", () => {
  it("dá fases diferentes a sementes diferentes, e sempre a mesma à mesma", () => {
    expect(phaseOf("peixe")).toBe(phaseOf("peixe"));
    expect(phaseOf("peixe")).not.toBe(phaseOf("alga"));
  });
});

describe("blink", () => {
  const samples = Array.from({ length: 600 }, (_, index) => index / 30);

  it("fica aberto quase sempre e fecha por inteiro de vez em quando", () => {
    const closures = samples.map((seconds) => blink(seconds, "pessoa"));
    const closed = closures.filter((value) => value > 0).length;

    expect(Math.max(...closures)).toBeCloseTo(1, 1);
    expect(closed / closures.length).toBeLessThan(0.1);
    expect(closed).toBeGreaterThan(0);
  });

  it("pisca a intervalos dentro da faixa pedida", () => {
    const starts = samples.filter(
      (seconds, index) =>
        index > 0 &&
        blink(seconds, "pessoa") > 0 &&
        blink(samples[index - 1], "pessoa") === 0,
    );
    const gaps = starts.slice(1).map((start, index) => start - starts[index]);

    expect(gaps.length).toBeGreaterThan(2);
    expect(Math.min(...gaps)).toBeGreaterThanOrEqual(2);
    expect(Math.max(...gaps)).toBeLessThanOrEqual(5.2);
  });

  it("fecha e abre de forma contínua", () => {
    const values = samples.map((seconds) => blink(seconds, "pessoa"));
    const jumps = values
      .slice(1)
      .map((value, index) => Math.abs(value - values[index]));
    expect(Math.max(...jumps)).toBeLessThan(0.6);
  });
});
