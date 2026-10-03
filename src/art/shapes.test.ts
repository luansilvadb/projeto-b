import { describe, expect, it } from "vitest";
import { normalOnCurve, pointOnCurve, taperPath } from "./shapes";

describe("pointOnCurve", () => {
  it("começa e termina nas pontas e passa perto do controle no meio", () => {
    expect(pointOnCurve([0, 0], [10, 20], [20, 0], 0)).toEqual([0, 0]);
    expect(pointOnCurve([0, 0], [10, 20], [20, 0], 1)).toEqual([20, 0]);
    expect(pointOnCurve([0, 0], [10, 20], [20, 0], 0.5)).toEqual([10, 10]);
  });
});

describe("normalOnCurve", () => {
  it("é perpendicular à direção da curva e tem comprimento 1", () => {
    const [x, y] = normalOnCurve([0, 0], [0, -50], [0, -100], 0.5);
    expect(x).toBeCloseTo(1);
    expect(y).toBeCloseTo(0);
  });
});

describe("taperPath", () => {
  const points = (path: string) =>
    path
      .slice(1, -1)
      .split("L")
      .map((pair) => pair.split(",").map(Number));

  it("fecha um contorno com a largura pedida em cada ponta", () => {
    const path = taperPath([0, 0], [0, -50], [0, -100], 40, 10);
    const outline = points(path);

    expect(path.startsWith("M")).toBe(true);
    expect(path.endsWith("Z")).toBe(true);
    // Um lado sobe, o outro desce: o primeiro e o último ponto ficam na base.
    expect(outline[0]).toEqual([20, 0]);
    expect(outline.at(-1)).toEqual([-20, 0]);
    expect(outline[14]).toEqual([5, -100]);
    expect(outline[15]).toEqual([-5, -100]);
  });

  it("afina de forma contínua da base à ponta", () => {
    const outline = points(taperPath([0, 0], [0, -50], [0, -100], 40, 10));
    const widths = outline.slice(0, 15).map(([x]) => x * 2);

    expect(widths).toEqual([...widths].sort((a, b) => b - a));
  });
});
