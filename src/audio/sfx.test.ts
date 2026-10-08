import { describe, expect, it } from "vitest";
import type { Script, SfxSpec } from "../narration/script";
import type { SceneTimeline } from "../narration/timeline";
import { SFX, SFX_LEVELS, sfxEvents } from "./sfx";

const FPS = 30;
// A segunda cena começa no quadro 300; "porta" soa 60 quadros depois.
const timeline = [
  { id: "a", from: 0, durationInFrames: 300, words: [] },
  {
    id: "b",
    from: 300,
    durationInFrames: 300,
    words: [
      { text: "A", frame: 0 },
      { text: "porta", frame: 60 },
      { text: "desce", frame: 90 },
    ],
  },
] as unknown as SceneTimeline[];
const scenes = [
  { id: "a", shots: [{}] },
  { id: "b", shots: [{}, { cue: "desce" }] },
] as unknown as Script["scenes"];

const events = (effects: SfxSpec[], voiceLufs = -20) =>
  sfxEvents(effects, timeline, scenes, voiceLufs, FPS);

describe("sfxEvents", () => {
  it("toca na palavra de deixa, em quadros do vídeo", () => {
    const [event] = events([{ scene: "b", cue: "porta", name: "shutterDown" }]);
    expect(event.frame).toBe(360);
    expect(event.file).toBe(SFX.shutterDown.file);
  });

  it("desloca o som pelo offsetMs, para antes ou para depois", () => {
    const [before, after] = events([
      { scene: "b", cue: "porta", offsetMs: -500, name: "whoosh" },
      { scene: "b", cue: "porta", offsetMs: 1000, name: "whoosh" },
    ]);
    expect(before.frame).toBe(345);
    expect(after.frame).toBe(390);
  });

  it("sem palavra, toca no começo do plano ou da cena", () => {
    const [shot, scene] = events([
      { scene: "b", shot: 2, name: "whoosh" },
      { scene: "b", name: "whoosh" },
    ]);
    // O plano 2 antecipa a deixa dele em alguns quadros.
    expect(shot.frame).toBeGreaterThan(380);
    expect(shot.frame).toBeLessThanOrEqual(390);
    expect(scene.frame).toBe(300);
  });

  it("põe o pico do efeito à distância do nível, abaixo da voz", () => {
    const [normal, soft] = events([
      { scene: "a", name: "splash" },
      { scene: "a", name: "splash", level: "leve" },
    ]);
    const db = (volume: number) => 20 * Math.log10(volume);
    expect(db(normal.volume)).toBeCloseTo(
      -20 - SFX_LEVELS.normal - SFX.splash.peakLufs,
    );
    expect(db(normal.volume) - db(soft.volume)).toBeCloseTo(
      SFX_LEVELS.leve - SFX_LEVELS.normal,
    );
  });

  it("acompanha o fim do plano e da cena quando a narração muda de duração", () => {
    const effects: SfxSpec[] = [
      { scene: "b", shot: 1, at: "end", offsetMs: -100, name: "paperFold" },
      { scene: "b", at: "end", offsetMs: -100, name: "paperFold" },
    ];
    expect(events(effects).map(({ frame }) => frame)).toEqual([383, 597]);
    const longer = timeline.map((scene) =>
      scene.id === "b"
        ? {
            ...scene,
            durationInFrames: 360,
            words: scene.words.map((word) => ({
              ...word,
              frame: word.frame * 2,
            })),
          }
        : scene,
    );
    expect(
      sfxEvents(effects, longer, scenes, -20, FPS).map(({ frame }) => frame),
    ).toEqual([473, 657]);
  });

  it("nunca amplifica um som gravado baixo", () => {
    const [event] = events([{ scene: "a", name: "coinDrop" }], -5);
    expect(event.volume).toBe(1);
  });

  it("acusa a palavra que a cena não tem", () => {
    expect(() =>
      events([{ scene: "b", cue: "janela", name: "whoosh" }]),
    ).toThrow(/não tem a 1ª ocorrência de "janela"/);
  });
});
