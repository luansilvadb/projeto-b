import { describe, expect, it } from "vitest";
import { drop, linear, mix, ramp, settle } from "./timing";

describe("curvas de progresso", () => {
  const curves = { ramp, settle, linear, drop };

  it.each(Object.entries(curves))(
    "%s vai de 0 a 1 e fica presa fora do intervalo",
    (_name, curve) => {
      expect(curve(0, 10, 20)).toBe(0);
      expect(curve(10, 10, 20)).toBe(0);
      expect(curve(30, 10, 20)).toBeCloseTo(1);
      expect(curve(500, 10, 20)).toBeCloseTo(1);
    },
  );

  it("linear está na metade no meio do intervalo", () => {
    expect(linear(20, 10, 20)).toBeCloseTo(0.5);
  });

  it("ramp é simétrica: acelera e desacelera por igual", () => {
    expect(ramp(20, 10, 20)).toBeCloseTo(0.5);
    expect(ramp(15, 10, 20)).toBeCloseTo(1 - ramp(25, 10, 20));
  });

  it("drop começa devagar e settle chega depressa", () => {
    expect(drop(20, 10, 20)).toBeLessThan(0.5);
    expect(settle(20, 10, 20)).toBeGreaterThan(0.5);
  });
});

describe("mix", () => {
  it("vai de um valor ao outro conforme t", () => {
    expect(mix(100, 200, 0)).toBe(100);
    expect(mix(100, 200, 0.25)).toBe(125);
    expect(mix(100, 200, 1)).toBe(200);
  });
});
