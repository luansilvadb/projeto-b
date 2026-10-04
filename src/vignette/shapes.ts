import { random } from "remotion";

/** O que todo mundo da vinheta recebe: o tempo, em segundos, para o que nele se mexe sozinho. */
export type WorldProps = {
  readonly seconds: number;
};

/** Um número sorteado e fixo para cada semente e índice: o mesmo desenho em todo quadro. */
export const pick = (seed: string, index: number): number =>
  random(`vignette-${seed}-${index}`);

/**
 * Uma forma orgânica fechada em volta de um centro: o raio varia de ponto a
 * ponto e as pontas são arredondadas. Serve para ilhas, continentes, rochas e
 * manchas.
 */
export const blob = (
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  seed: string,
  points = 10,
  noise = 0.28,
): string => {
  const corners = Array.from({ length: points }, (_, index) => {
    const angle = (index / points) * Math.PI * 2;
    const radius = 1 - noise / 2 + noise * pick(seed, index);
    return [
      cx + rx * radius * Math.cos(angle),
      cy + ry * radius * Math.sin(angle),
    ] as const;
  });
  // Cada canto vira o ponto de controle de uma curva entre os meios dos lados vizinhos.
  const middle = (index: number) => {
    const a = corners[index % points];
    const b = corners[(index + 1) % points];
    return [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2] as const;
  };
  const start = middle(points - 1);
  const curves = corners.map((corner, index) => {
    const to = middle(index);
    return `Q${corner[0].toFixed(1)},${corner[1].toFixed(1)} ${to[0].toFixed(1)},${to[1].toFixed(1)}`;
  });
  return `M${start[0].toFixed(1)},${start[1].toFixed(1)} ${curves.join(" ")} Z`;
};

/**
 * Uma linha de morros de ponta a ponta do quadro, fechada por baixo: a soma de
 * duas ondas, para o perfil não se repetir.
 */
export const ridge = (
  top: number,
  height: number,
  period: number,
  phase: number,
): string => {
  const points = [];
  for (let x = -100; x <= 2020; x += 40) {
    const y =
      top -
      height * Math.sin((x / period) * Math.PI * 2 + phase) -
      height * 0.45 * Math.sin((x / period) * Math.PI * 5.1 + phase * 2);
    points.push(`${x},${y.toFixed(1)}`);
  }
  return `M-100,1200 L${points.join(" L")} L2020,1200 Z`;
};
