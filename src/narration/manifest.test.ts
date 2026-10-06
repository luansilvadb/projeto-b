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
  file: `videos/exemplo/narration/${text}.wav`,
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

  it("soma ao fim da cena o silêncio que o roteiro pede", () => {
    const plain = assembleScene("sun", [take("Um.", 1000)]);
    const held = assembleScene("sun", [take("Um.", 1000)], 4000);

    expect(held.durationMs).toBe(plain.durationMs + 4000);
    expect(held.holdMs).toBe(4000);
    expect(plain.holdMs).toBeUndefined();
  });
});

describe("frases coladas", () => {
  it("encurta a pausa depois de uma frase colada na seguinte", () => {
    const scene = assembleScene("sun", [
      { ...take("Um,", 1000), tight: true },
      take("dois.", 2000),
    ]);

    expect(scene.sentences[1].startMs).toBe(
      PACING.leadMs + 1000 + PACING.tightGapMs,
    );
  });

  it("cola o fim de uma cena no começo da seguinte", () => {
    const first = assembleScene("sun", [{ ...take("Um.", 1000), tight: true }]);
    const second = assembleScene("moon", [take("Dois.", 2000)], 0, true);

    expect(first.durationMs).toBe(PACING.leadMs + 1000 + PACING.tightGapMs);
    expect(second.sentences[0].startMs).toBe(0);
    expect(second.durationMs).toBe(2000 + PACING.tailMs);
  });
});

describe("assertManifestMatchesScript", () => {
  const script: Script = {
    title: "Exemplo",
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
      assertManifestMatchesScript(script, manifestFor("Um.", "Dois."), "exemplo"),
    ).not.toThrow();
  });

  it("recusa manifesto de um roteiro que mudou", () => {
    expect(() =>
      assertManifestMatchesScript(script, manifestFor("Um.", "Três."), "exemplo"),
    ).toThrowError(/pnpm narrate exemplo/);
  });
});
