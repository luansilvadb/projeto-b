import { describe, expect, it } from "vitest";
import {
  RENEWAL_CAP_SECONDS,
  SAMPLE,
  changedShare,
  colorProfile,
  drawnShare,
  luminance,
  measure,
} from "./measures";

type Color = readonly [number, number, number];

const { width, height } = SAMPLE;
const BLACK: Color = [0, 0, 0];
const WHITE: Color = [255, 255, 255];
const RED: Color = [220, 30, 30];
const BLUE: Color = [30, 30, 220];

/** Quadro do tamanho medido, com a cor de cada pixel dada por uma função. */
const frame = (colorAt: (x: number, y: number) => Color): Uint8Array => {
  const rgb = new Uint8Array(width * height * 3);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      rgb.set(colorAt(x, y), (y * width + x) * 3);
    }
  }
  return rgb;
};

const flat = (color: Color) => frame(() => color);
const leftHalf = (left: Color, right: Color) =>
  frame((x) => (x < width / 2 ? left : right));
const checkered = (a: Color, b: Color) =>
  frame((x, y) => (((x >> 2) + (y >> 2)) % 2 === 0 ? a : b));

describe("luminance", () => {
  it("pesa as cores como o olho: o verde clareia mais que o azul", () => {
    const gray = luminance(
      Uint8Array.from([255, 255, 255, 0, 255, 0, 0, 0, 255]),
    );
    expect(gray[0]).toBeCloseTo(255);
    expect(gray[1]).toBeCloseTo(149.7, 1);
    expect(gray[2]).toBeCloseTo(29.1, 1);
  });
});

describe("changedShare", () => {
  it("mede a fração do quadro que mudou além do limiar", () => {
    const before = luminance(flat(BLACK));
    expect(changedShare(before, luminance(flat(BLACK)), 6)).toBe(0);
    expect(changedShare(before, luminance(leftHalf(WHITE, BLACK)), 6)).toBe(
      0.5,
    );
    expect(changedShare(before, luminance(flat([4, 4, 4])), 6)).toBe(0);
  });
});

describe("drawnShare", () => {
  it("não conta fundo de uma cor só como desenho", () => {
    expect(drawnShare(luminance(flat(BLUE)), width, height)).toBe(0);
  });

  it("conta os blocos em que a imagem varia", () => {
    const half = frame((x, y) =>
      x < width / 2 ? (((x >> 2) + (y >> 2)) % 2 === 0 ? WHITE : BLACK) : BLUE,
    );
    expect(drawnShare(luminance(checkered(WHITE, BLACK)), width, height)).toBe(
      1,
    );
    expect(drawnShare(luminance(half), width, height)).toBe(0.5);
  });
});

describe("colorProfile", () => {
  it("conta uma cor num quadro chapado e acha a família dela", () => {
    const profile = colorProfile(flat(RED));
    expect(profile.colors).toBe(1);
    expect(profile.dominantHue).toBe(0);
  });

  it("separa cores de famílias diferentes e de valores diferentes", () => {
    expect(colorProfile(leftHalf(RED, BLUE)).colors).toBe(2);
    expect(colorProfile(leftHalf(RED, [90, 12, 12])).colors).toBe(2);
    expect(colorProfile(leftHalf(BLUE, BLUE)).colors).toBe(1);
  });

  it("não dá cor dominante a um quadro neutro", () => {
    const profile = colorProfile(leftHalf(WHITE, BLACK));
    expect(profile.colors).toBe(2);
    expect(profile.dominantHue).toBe(-1);
  });
});

describe("measure", () => {
  const repeat = (image: Uint8Array, times: number) =>
    Array.from({ length: times }, () => image);

  it("reconhece um vídeo parado, vazio e de uma cor só", async () => {
    const critique = await measure(repeat(flat(BLUE), 3 * SAMPLE.fps));

    expect(critique.stillShare).toBe(1);
    expect(critique.movingShare).toBe(0);
    expect(critique.renewalSeconds).toBe(RENEWAL_CAP_SECONDS);
    expect(critique.drawnShare).toBe(0);
    expect(critique.colorsPerFrame).toBe(1);
    expect(critique.dominantChangesPerMinute).toBe(0);
    expect(critique.topHueShare).toBe(1);
  });

  it("mede o vídeo que troca de imagem a cada segundo", async () => {
    const second = (image: Uint8Array) => repeat(image, SAMPLE.fps);
    const critique = await measure([
      ...second(checkered(RED, WHITE)),
      ...second(checkered(BLUE, BLACK)),
      ...second(checkered(RED, WHITE)),
      ...second(checkered(BLUE, BLACK)),
    ]);

    // Três trocas em 39 passagens de um quadro para o outro.
    expect(critique.movingShare).toBeCloseTo(3 / 39);
    expect(critique.stillShare).toBeCloseTo(36 / 39);
    expect(critique.renewalSeconds).toBe(1);
    expect(critique.drawnShare).toBe(1);
    expect(critique.colorsPerFrame).toBe(2);
    expect(critique.dominantChangesPerMinute).toBeCloseTo(3 / (4 / 60));
    expect(critique.topHueShare).toBeCloseTo(0.5);
  });

  it("recusa um vídeo sem quadros suficientes", async () => {
    await expect(measure([flat(RED)])).rejects.toThrowError(/dois quadros/);
  });
});
