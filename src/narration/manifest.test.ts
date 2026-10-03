import { describe, expect, it } from "vitest";
import {
  PACING,
  assembleScene,
  assertManifestMatchesScript,
  type NarrationManifest,
  type SentenceTake,
} from "./manifest";
import type { Script } from "./script";

const take = (text: string, durationMs: number): SentenceTake => ({
  text,
  file: `videos/demo/narration/${text}.wav`,
  durationMs,
  words: [{ text, startMs: 100, endMs: durationMs - 100 }],
  errors: 0,
  heard: text,
  cutOff: false,
});

describe("assembleScene", () => {
  it("encadeia as frases com os respiros e desloca as palavras para o tempo da cena", () => {
    const scene = assembleScene("sun", [
      take("Um.", 1000),
      take("Dois.", 2000),
    ]);

    expect(scene.sentences[0].startMs).toBe(PACING.leadMs);
    expect(scene.sentences[1].startMs).toBe(
      PACING.leadMs + 1000 + PACING.sentenceGapMs,
    );
    expect(scene.sentences[1].words[0].startMs).toBe(
      scene.sentences[1].startMs + 100,
    );
    expect(scene.durationMs).toBe(
      PACING.leadMs + 1000 + PACING.sentenceGapMs + 2000 + PACING.tailMs,
    );
  });
});

describe("assertManifestMatchesScript", () => {
  const script: Script = {
    title: "Demo",
    scenes: [
      {
        id: "sun",
        narration: "Um. Dois.",
        shots: [
          {
            staging: "Sol.",
            scale: "wide",
            palette: "espaço",
            entry: "cut",
          },
        ],
      },
    ],
  };
  const manifestFor = (...texts: string[]): NarrationManifest => ({
    voice: "placeholder",
    loudnessLufs: -25,
    scenes: [
      assembleScene(
        "sun",
        texts.map((text) => take(text, 1000)),
      ),
    ],
  });

  it("aceita manifesto gerado a partir do roteiro atual", () => {
    expect(() =>
      assertManifestMatchesScript(script, manifestFor("Um.", "Dois."), "demo"),
    ).not.toThrow();
  });

  it("recusa manifesto de um roteiro que mudou", () => {
    expect(() =>
      assertManifestMatchesScript(script, manifestFor("Um.", "Três."), "demo"),
    ).toThrowError(/pnpm narrate demo/);
  });
});
