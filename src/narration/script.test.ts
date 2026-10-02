import { describe, expect, it } from "vitest";
import { parseScript } from "./script";

const validScene = {
  id: "sun",
  narration: "A luz saiu do Sol há mais de oito minutos.",
  visual: "Sol grande à esquerda.",
};

describe("parseScript", () => {
  it("aceita um roteiro completo", () => {
    const script = parseScript({
      title: "Luz do Sol",
      scenes: [{ ...validScene, sources: [1] }],
      music: { caption: "calm ambient", bpm: 90, keyScale: "D minor" },
    });
    expect(script.scenes[0].id).toBe("sun");
  });

  it("reporta todos os problemas de uma vez", () => {
    const parse = () =>
      parseScript({
        scenes: [
          { ...validScene, id: "Sol Nasce" },
          { id: "sun", narration: "São 8 minutos.", visual: "" },
          validScene,
        ],
        music: { bpm: -1 },
      });
    expect(parse).toThrowError(/falta "title"/);
    expect(parse).toThrowError(
      /cena 1 \(Sol Nasce\): "id" precisa ser minúsculo/,
    );
    expect(parse).toThrowError(/cena 2 \(sun\): falta "visual"/);
    expect(parse).toThrowError(/cena 2 \(sun\): dígitos \("8"\)/);
    expect(parse).toThrowError(/cena 3 \(sun\): "id" repetido/);
    expect(parse).toThrowError(/"music" precisa de um "caption"/);
  });

  it("recusa roteiro sem cenas ou que não é objeto", () => {
    expect(() => parseScript({ title: "x", scenes: [] })).toThrowError(
      /ao menos uma cena/,
    );
    expect(() => parseScript([])).toThrowError(/precisa conter um objeto/);
  });
});
