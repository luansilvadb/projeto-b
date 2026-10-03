export type Point = readonly [number, number];

/** Ponto de uma curva quadrática, com `t` de 0 (começo) a 1 (fim). */
export const pointOnCurve = (
  from: Point,
  control: Point,
  to: Point,
  t: number,
): Point => {
  const u = 1 - t;
  return [
    u * u * from[0] + 2 * u * t * control[0] + t * t * to[0],
    u * u * from[1] + 2 * u * t * control[1] + t * t * to[1],
  ];
};

/** Direção perpendicular à curva em `t`, de comprimento 1. */
export const normalOnCurve = (
  from: Point,
  control: Point,
  to: Point,
  t: number,
): Point => {
  const dx =
    2 * (1 - t) * (control[0] - from[0]) + 2 * t * (to[0] - control[0]);
  const dy =
    2 * (1 - t) * (control[1] - from[1]) + 2 * t * (to[1] - control[1]);
  const length = Math.hypot(dx, dy) || 1;
  return [-dy / length, dx / length];
};

const STEPS = 14;

/**
 * Tubo que afina ao longo de uma curva: a forma de braço, caule, raiz e
 * tentáculo. Devolve o `d` de um caminho fechado, com `startWidth` de largura
 * no começo e `endWidth` no fim.
 */
export const taperPath = (
  from: Point,
  control: Point,
  to: Point,
  startWidth: number,
  endWidth: number,
): string => {
  const left: Point[] = [];
  const right: Point[] = [];
  for (let step = 0; step <= STEPS; step++) {
    const t = step / STEPS;
    const [x, y] = pointOnCurve(from, control, to, t);
    const [nx, ny] = normalOnCurve(from, control, to, t);
    const half = (startWidth + (endWidth - startWidth) * t) / 2;
    left.push([x + nx * half, y + ny * half]);
    right.push([x - nx * half, y - ny * half]);
  }
  const outline = [...left, ...right.reverse()];
  return `M${outline.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join("L")}Z`;
};
