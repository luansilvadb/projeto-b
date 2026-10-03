import { describe, expect, it } from "vitest";
import type { NarrationManifest } from "./manifest";
import { buildTimeline, cueFrame, shotRanges } from "./timeline";

const manifest: NarrationManifest = {
  voice: "placeholder",
  loudnessLufs: -25,
  scenes: [
    {
      id: "sun",
      durationMs: 3350,
      sentences: [
        {
          text: "A luz saiu.",
          file: "videos/demo/narration/a.wav",
          startMs: 400,
          durationMs: 2000,
          words: [
            { text: "A", startMs: 500, endMs: 600 },
            { text: "luz", startMs: 600, endMs: 1200 },
            { text: "saiu.", startMs: 1200, endMs: 2300 },
          ],
          errors: 0,
          heard: "A luz saiu.",
          cutOff: false,
        },
      ],
    },
    {
      id: "earth",
      durationMs: 2050,
      sentences: [
        {
          text: "Luz, luz!",
          file: "videos/demo/narration/b.wav",
          startMs: 400,
          durationMs: 1000,
          words: [
            { text: "Luz,", startMs: 450, endMs: 800 },
            { text: "luz!", startMs: 900, endMs: 1300 },
          ],
          errors: 0,
          heard: "Luz, luz!",
          cutOff: false,
        },
      ],
    },
  ],
};

describe("buildTimeline", () => {
  const timeline = buildTimeline(manifest, 30);

  it("posiciona as cenas em sequência sem acumular erro de arredondamento", () => {
    expect(timeline.scenes.map((scene) => scene.from)).toEqual([0, 101]);
    expect(timeline.scenes.map((scene) => scene.durationInFrames)).toEqual([
      101, 61,
    ]);
    expect(timeline.durationInFrames).toBe(162);
  });

  it("dá às frases e palavras quadros relativos à própria cena", () => {
    expect(timeline.scenes[1].sentences[0].from).toBe(12);
    expect(timeline.scenes[1].words).toEqual([
      { text: "Luz,", frame: 13 },
      { text: "luz!", frame: 27 },
    ]);
  });

  it("lista os trechos de fala em quadros do vídeo", () => {
    expect(timeline.speech).toEqual([
      { from: 12, to: 72 },
      { from: 113, to: 143 },
    ]);
  });
});

describe("cueFrame", () => {
  const [sun, earth] = buildTimeline(manifest, 30).scenes;

  it("encontra a palavra ignorando acento, caixa e pontuação", () => {
    expect(cueFrame(sun, "SAIU")).toBe(36);
    expect(cueFrame(earth, "luz", 2)).toBe(27);
  });

  it("falha quando a palavra não está na narração da cena", () => {
    expect(() => cueFrame(sun, "terra")).toThrowError(/cena "sun"/);
    expect(() => cueFrame(earth, "luz", 3)).toThrowError(/3ª ocorrência/);
  });
});

describe("shotRanges", () => {
  const [sun, earth] = buildTimeline(manifest, 30).scenes;

  it("dá a cena inteira a um plano único", () => {
    expect(shotRanges(sun, [{}])).toEqual([{ from: 0, to: 101 }]);
  });

  it("corta os planos pouco antes da deixa de cada um", () => {
    expect(shotRanges(sun, [{}, { cue: "saiu" }])).toEqual([
      { from: 0, to: 32 },
      { from: 32, to: 101 },
    ]);
    expect(shotRanges(earth, [{}, { cue: "luz", occurrence: 2 }])).toEqual([
      { from: 0, to: 23 },
      { from: 23, to: 61 },
    ]);
  });

  it("falha quando a deixa de um plano não está na narração", () => {
    expect(() => shotRanges(sun, [{}, { cue: "terra" }])).toThrowError(
      /cena "sun"/,
    );
  });
});
