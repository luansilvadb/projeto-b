/**
 * Medidas de um vídeo renderizado: quanto ele se mexe, quanto do quadro tem
 * desenho e como usa a cor. Não medem qualidade; acusam o vídeo parado, vazio
 * ou de uma cor só, que é o que a leitura de quadros avulsos deixa passar.
 */

/** Formato em que os quadros são medidos. As faixas de referência valem só para ele. */
export const SAMPLE = { width: 320, height: 180, fps: 10 } as const;

export type Critique = {
  /** Fração do tempo em que menos de 1% do quadro muda de um quadro para o outro. */
  readonly stillShare: number;
  /** Fração do tempo em que mais de 10% do quadro muda de um quadro para o outro. */
  readonly movingShare: number;
  /** Mediana, em segundos, do tempo até 40% do quadro ser diferente. */
  readonly renewalSeconds: number;
  /** Fração média do quadro que tem desenho. */
  readonly drawnShare: number;
  /** Média de cores distintas num quadro. */
  readonly colorsPerFrame: number;
  /** Quantas vezes por minuto a cor dominante do quadro troca. */
  readonly dominantChangesPerMinute: number;
  /** Quanto das cores vivas do vídeo inteiro cabe à família de cor mais comum. */
  readonly topHueShare: number;
};

// Diferença de luminância, de 0 a 255, que conta como mudança entre quadros vizinhos.
const MOVED = 6;
const STILL_BELOW = 0.01;
const MOVING_ABOVE = 0.1;

// Lado, em pixels, dos blocos em que se procura desenho, e o desvio de luminância
// a partir do qual um bloco não é mais fundo liso ou degradê suave.
const BLOCK = 20;
const DRAWN_DEVIATION = 6;

// Cor, desenho e renovação são medidos em parte dos quadros: mudam devagar.
const STATIC_EVERY = SAMPLE.fps / 2;
const RENEWAL_EVERY = SAMPLE.fps / 2;
const RENEWAL_DIFFERENT = 10;
const RENEWED_ABOVE = 0.4;
/** Teto da renovação: uma imagem que não muda em 40 s conta como 40 s. */
export const RENEWAL_CAP_SECONDS = 40;

const HUES = 12;
const VALUE_BANDS = 3;
// Uma cor entra na conta do quadro quando ocupa mais que isto dele.
const COLOR_AREA = 0.04;

/** Luminância, de 0 a 255, de um quadro RGB. */
export const luminance = (rgb: Uint8Array): Float32Array => {
  const gray = new Float32Array(rgb.length / 3);
  for (let pixel = 0, byte = 0; pixel < gray.length; pixel++, byte += 3) {
    gray[pixel] =
      0.299 * rgb[byte] + 0.587 * rgb[byte + 1] + 0.114 * rgb[byte + 2];
  }
  return gray;
};

/** Fração dos pixels cuja luminância difere em mais que `threshold` entre dois quadros. */
export const changedShare = (
  before: ArrayLike<number>,
  after: ArrayLike<number>,
  threshold: number,
): number => {
  let changed = 0;
  for (let pixel = 0; pixel < before.length; pixel++) {
    if (Math.abs(before[pixel] - after[pixel]) > threshold) {
      changed++;
    }
  }
  return changed / before.length;
};

/** Desvio padrão da luminância de um bloco do quadro. */
const blockDeviation = (
  gray: Float32Array,
  width: number,
  row: number,
  column: number,
): number => {
  let sum = 0;
  let squares = 0;
  for (let y = row * BLOCK; y < (row + 1) * BLOCK; y++) {
    for (let x = column * BLOCK; x < (column + 1) * BLOCK; x++) {
      const value = gray[y * width + x];
      sum += value;
      squares += value * value;
    }
  }
  const count = BLOCK * BLOCK;
  const variance = squares / count - (sum / count) ** 2;
  return Math.sqrt(Math.max(variance, 0));
};

/**
 * Fração do quadro com desenho: blocos em que a luminância varia. Fundo de
 * uma cor só ou em degradê suave não conta.
 */
export const drawnShare = (
  gray: Float32Array,
  width: number,
  height: number,
): number => {
  const columns = Math.floor(width / BLOCK);
  const rows = Math.floor(height / BLOCK);
  let drawn = 0;
  for (let row = 0; row < rows; row++) {
    for (let column = 0; column < columns; column++) {
      if (blockDeviation(gray, width, row, column) > DRAWN_DEVIATION) {
        drawn++;
      }
    }
  }
  return drawn / (columns * rows);
};

export type ColorProfile = {
  /** Quantas cores distintas ocupam uma parte visível do quadro. */
  readonly colors: number;
  /** Família de cor (0 a 11, a partir do vermelho) que domina o quadro; -1 se ele é quase todo neutro. */
  readonly dominantHue: number;
  /** Pixels de cor viva em cada família de cor. */
  readonly vividHues: readonly number[];
};

/** Matiz, de 0 a 1 a partir do vermelho, de uma cor cujo maior canal é `value` e que tem `delta` entre o maior e o menor. */
const hueOf = (
  red: number,
  green: number,
  blue: number,
  value: number,
  delta: number,
): number => {
  // Canais iguais não têm matiz: fica o do vermelho, e a saturação nula tira o pixel da conta das cores.
  if (delta <= 1e-6) {
    return 0;
  }
  if (value === red) {
    const hue = (((green - blue) / delta) % 6) / 6;
    return hue < 0 ? hue + 1 : hue;
  }
  if (value === green) {
    return ((blue - red) / delta + 2) / 6;
  }
  return ((red - green) / delta + 4) / 6;
};

/**
 * Cores de um quadro. Duas cores são distintas quando caem em famílias de
 * matiz diferentes (12, de 30 em 30 graus) ou em faixas de valor diferentes
 * (escuro, médio, claro); o que quase não tem saturação conta como neutro.
 */
export const colorProfile = (rgb: Uint8Array): ColorProfile => {
  const pixels = rgb.length / 3;
  const classes = new Array<number>(VALUE_BANDS * (HUES + 1)).fill(0);
  const tintedHues = new Array<number>(HUES).fill(0);
  const vividHues = new Array<number>(HUES).fill(0);
  let tinted = 0;

  for (let byte = 0; byte < rgb.length; byte += 3) {
    const red = rgb[byte] / 255;
    const green = rgb[byte + 1] / 255;
    const blue = rgb[byte + 2] / 255;
    const value = Math.max(red, green, blue);
    const delta = value - Math.min(red, green, blue);
    const saturation = value > 0 ? delta / value : 0;

    const hue = hueOf(red, green, blue, value, delta);
    const family = Math.min(Math.floor(hue * HUES), HUES - 1);
    const band = value < 0.35 ? 0 : value < 0.7 ? 1 : 2;

    classes[saturation > 0.2 ? VALUE_BANDS * (family + 1) + band : band]++;
    if (saturation > 0.15) {
      tintedHues[family]++;
      tinted++;
    }
    if (saturation > 0.35 && value > 0.3) {
      vividHues[family]++;
    }
  }

  return {
    colors: classes.filter((count) => count / pixels > COLOR_AREA).length,
    dominantHue:
      tinted > pixels * 0.2 ? tintedHues.indexOf(Math.max(...tintedHues)) : -1,
    vividHues,
  };
};

/** Reduz o quadro à metade em cada lado, pela média de cada 2×2 pixels. */
const halve = (
  gray: Float32Array,
  width: number,
  height: number,
): Uint8Array => {
  const half = new Uint8Array((width / 2) * (height / 2));
  for (let y = 0; y < height / 2; y++) {
    for (let x = 0; x < width / 2; x++) {
      const top = 2 * y * width + 2 * x;
      const bottom = top + width;
      half[y * (width / 2) + x] = Math.round(
        (gray[top] + gray[top + 1] + gray[bottom] + gray[bottom + 1]) / 4,
      );
    }
  }
  return half;
};

const median = (values: readonly number[]): number => {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 1
    ? sorted[middle]
    : (sorted[middle - 1] + sorted[middle]) / 2;
};

/**
 * A partir de cada segundo do vídeo, quanto tempo passa até a imagem ser
 * outra, isto é, até 40% do quadro ficar diferente. Devolve a mediana.
 */
const renewalSeconds = (frames: readonly Uint8Array[]): number => {
  const perSecond = SAMPLE.fps / RENEWAL_EVERY;
  const reach = RENEWAL_CAP_SECONDS * perSecond;
  const lives: number[] = [];
  for (let start = 0; start < frames.length; start += perSecond) {
    let life = RENEWAL_CAP_SECONDS;
    const last = Math.min(frames.length, start + reach);
    for (let later = start + 1; later < last; later++) {
      const changed = changedShare(
        frames[start],
        frames[later],
        RENEWAL_DIFFERENT,
      );
      if (changed > RENEWED_ABOVE) {
        life = (later - start) / perSecond;
        break;
      }
    }
    lives.push(life);
  }
  return median(lives);
};

/** Mede um vídeo a partir dos quadros RGB dele, no formato de `SAMPLE`. */
export const measure = async (
  frames: AsyncIterable<Uint8Array> | Iterable<Uint8Array>,
): Promise<Critique> => {
  const { width, height, fps } = SAMPLE;
  let count = 0;
  let previous: Float32Array | undefined;
  let transitions = 0;
  let still = 0;
  let moving = 0;
  let samples = 0;
  let drawn = 0;
  let colors = 0;
  let dominantChanges = 0;
  let dominant: number | undefined;
  const vivid = new Array<number>(HUES).fill(0);
  const renewal: Uint8Array[] = [];

  for await (const rgb of frames) {
    const gray = luminance(rgb);
    if (previous) {
      const changed = changedShare(previous, gray, MOVED);
      transitions++;
      if (changed < STILL_BELOW) {
        still++;
      }
      if (changed > MOVING_ABOVE) {
        moving++;
      }
    }
    previous = gray;

    if (count % STATIC_EVERY === 0) {
      const profile = colorProfile(rgb);
      samples++;
      drawn += drawnShare(gray, width, height);
      colors += profile.colors;
      profile.vividHues.forEach((pixels, family) => {
        vivid[family] += pixels;
      });
      if (dominant !== undefined && profile.dominantHue !== dominant) {
        dominantChanges++;
      }
      dominant = profile.dominantHue;
    }
    if (count % RENEWAL_EVERY === 0) {
      renewal.push(halve(gray, width, height));
    }
    count++;
  }

  if (count < 2) {
    throw new Error(
      "O vídeo precisa de ao menos dois quadros para ser medido.",
    );
  }

  const vividTotal = vivid.reduce((sum, pixels) => sum + pixels, 0);
  return {
    stillShare: still / transitions,
    movingShare: moving / transitions,
    renewalSeconds: renewalSeconds(renewal),
    drawnShare: drawn / samples,
    colorsPerFrame: colors / samples,
    dominantChangesPerMinute: dominantChanges / (count / fps / 60),
    topHueShare: vividTotal > 0 ? Math.max(...vivid) / vividTotal : 1,
  };
};
