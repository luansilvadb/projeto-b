import { describe, expect, it } from "vitest";
import { parseScript } from "./script";

const validShot = {
  staging: "O Sol grande à esquerda, com o brilho pulsando.",
  scale: "wide",
  palette: "espaço",
  entry: "cut",
};

const validScene = {
  id: "sun",
  narration: "A luz saiu do Sol há mais de oito minutos.",
  shots: [validShot],
};

describe("parseScript", () => {
  it("aceita um roteiro completo", () => {
    const script = parseScript({
      title: "Luz do Sol",
      scenes: [
        {
          ...validScene,
          shots: [
            validShot,
            { ...validShot, cue: "oito", scale: "close", entry: "camera" },
          ],
          sources: [1],
        },
      ],
      music: { caption: "calm ambient", bpm: 90, keyScale: "D minor" },
    });
    expect(script.scenes[0].id).toBe("sun");
    expect(script.scenes[0].shots).toHaveLength(2);
  });

  it("reporta todos os problemas de uma vez", () => {
    const parse = () =>
      parseScript({
        scenes: [
          { ...validScene, id: "Sol Nasce" },
          { id: "sun", narration: "São 8 minutos.", shots: [] },
          validScene,
        ],
        music: { bpm: -1 },
      });
    expect(parse).toThrowError(/falta "title"/);
    expect(parse).toThrowError(
      /cena 1 \(Sol Nasce\): "id" precisa ser minúsculo/,
    );
    expect(parse).toThrowError(
      /cena 2 \(sun\): "shots" precisa ter ao menos um plano/,
    );
    expect(parse).toThrowError(/cena 2 \(sun\): dígitos \("8"\)/);
    expect(parse).toThrowError(/cena 3 \(sun\): "id" repetido/);
    expect(parse).toThrowError(/"music" precisa de um "caption"/);
  });

  it("aceita um silêncio depois da fala e recusa o que não é um tempo válido", () => {
    const withHold = (holdMs: unknown) => () =>
      parseScript({ title: "x", scenes: [{ ...validScene, holdMs }] });

    expect(withHold(4000)).not.toThrow();
    expect(withHold(0)).toThrowError(/"holdMs" precisa ser um inteiro/);
    expect(withHold(60000)).toThrowError(/"holdMs" precisa ser um inteiro/);
    expect(withHold("4s")).toThrowError(/"holdMs" precisa ser um inteiro/);
  });

  it("recusa roteiro sem cenas ou que não é objeto", () => {
    expect(() => parseScript({ title: "x", scenes: [] })).toThrowError(
      /ao menos uma cena/,
    );
    expect(() => parseScript([])).toThrowError(/precisa conter um objeto/);
  });
});

describe("parseScript, planos", () => {
  const parseShots = (shots: unknown, extra: object = {}) =>
    parseScript({
      title: "Luz do Sol",
      scenes: [{ ...validScene, ...extra, shots }],
    });

  it("exige encenação, escala, paleta e entrada em cada plano", () => {
    const parse = () =>
      parseShots([{ staging: " ", scale: "perto", entry: "fade" }]);
    expect(parse).toThrowError(/cena 1 \(sun\), plano 1: falta "staging"/);
    expect(parse).toThrowError(
      /plano 1: "scale" precisa ser "wide", "medium", "close", "detail"/,
    );
    expect(parse).toThrowError(/plano 1: falta "palette"/);
    expect(parse).toThrowError(
      /plano 1: "entry" precisa ser "cut", "camera", "transform", "wipe"/,
    );
  });

  it("só o primeiro plano dispensa a deixa", () => {
    expect(() => parseShots([{ ...validShot, cue: "luz" }])).toThrowError(
      /plano 1: o primeiro plano começa com a cena/,
    );
    expect(() => parseShots([validShot, validShot])).toThrowError(
      /plano 2: falta "cue"/,
    );
  });

  it("recusa deixa que não está na narração da cena", () => {
    expect(() =>
      parseShots([validShot, { ...validShot, cue: "Terra" }]),
    ).toThrowError(/plano 2: a deixa "Terra" não está na narração da cena/);
    expect(() =>
      parseShots([validShot, { ...validShot, cue: "Sol", occurrence: 2 }]),
    ).toThrowError(/plano 2: a deixa "Sol" não está na narração/);
    expect(() =>
      parseShots([validShot, { ...validShot, cue: "Sol", occurrence: 0 }]),
    ).toThrowError(/plano 2: "occurrence" precisa ser um inteiro positivo/);
  });

  it("recusa planos fora da ordem da narração", () => {
    expect(() =>
      parseShots([
        validShot,
        { ...validShot, cue: "oito" },
        { ...validShot, cue: "Sol" },
      ]),
    ).toThrowError(
      /plano 3: a deixa "Sol" precisa vir depois da deixa do plano anterior/,
    );
    expect(() =>
      parseShots([validShot, { ...validShot, cue: "A" }]),
    ).toThrowError(/plano 2: a deixa "A" precisa vir depois/);
  });

  it("avisa que o campo antigo deu lugar aos planos", () => {
    expect(() =>
      parseShots(undefined, { visual: "Sol grande à esquerda." }),
    ).toThrowError(/cena 1 \(sun\): "visual" deu lugar a "shots"/);
  });
});
