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
export const contrastRatio = (first: string, second: string): number => {
  const [darker, lighter] = [luminance(first), luminance(second)].sort(
    (a, b) => a - b,
  );
  return (lighter + 0.05) / (darker + 0.05);
};
