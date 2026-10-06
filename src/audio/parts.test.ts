import { describe, expect, it } from "vitest";
import {
  MUSIC_PARTS,
  featureAmount,
  holdRanges,
  musicParts,
  partEnvelopes,
  partGain,
  planMusicParts,
  silenceGain,
  silenceRanges,
} from "./parts";

const music = { caption: "calm ambient", bpm: 72, keyScale: "A minor" };
// Três cenas: 100 s, 200 s (com 4 s de silêncio no fim) e 50 s.
const scenes = [
  { id: "hook", durationMs: 100_000 },
  { id: "body", durationMs: 200_000, holdMs: 4000 },
  { id: "end", durationMs: 50_000 },
];

describe("planMusicParts", () => {
  it("dá uma faixa só, do tamanho do vídeo mais a sobra, quando o roteiro não divide", () => {
    expect(planMusicParts(scenes, music)).toEqual([
      {
        startMs: 0,
        fadeMs: 0,
        durationSeconds: 350 + MUSIC_PARTS.tailSeconds,
        ...music,
      },
    ]);
  });

  it("começa outra faixa na cena pedida, e a anterior dura até o cruzamento acabar", () => {
    const parts = planMusicParts(scenes, {
      ...music,
      parts: [{ from: "end" }],
    });
    expect(parts).toHaveLength(2);
    expect(parts[0]).toMatchObject({
      startMs: 0,
      durationSeconds: 300 + MUSIC_PARTS.crossfadeSeconds,
    });
    expect(parts[1]).toMatchObject({
      startMs: 300_000,
      fadeMs: MUSIC_PARTS.crossfadeSeconds * 1000,
      durationSeconds: 50 + MUSIC_PARTS.tailSeconds,
      caption: "calm ambient",
      bpm: 72,
    });
  });

  it("começa a faixa no silêncio da cena quando o roteiro pede, com a entrada curta", () => {
    const [first, second] = planMusicParts(scenes, {
      ...music,
      parts: [{ from: "body", at: "hold" }],
    });
    // A cena "body" vai de 100 s a 300 s, e os 4 s finais são o silêncio.
    expect(second).toMatchObject({
      startMs: 296_000,
      fadeMs: MUSIC_PARTS.entrySeconds * 1000,
    });
    expect(first.durationSeconds).toBe(297);
  });

  it("recusa a faixa no silêncio de uma cena que a narração gravou sem silêncio", () => {
    expect(() =>
      planMusicParts(scenes, {
        ...music,
        parts: [{ from: "end", at: "hold" }],
      }),
    ).toThrowError(/pnpm narrate/);
  });

  it("usa a descrição da parte quando ela traz uma, e a da trilha no que faltar", () => {
    const [, second] = planMusicParts(scenes, {
      ...music,
      parts: [{ from: "body", caption: "warm ambient" }],
    });
    expect(second).toMatchObject({
      caption: "warm ambient",
      bpm: 72,
      keyScale: "A minor",
    });
  });

  it("nunca pede uma faixa mais curta que o mínimo", () => {
    const [first] = planMusicParts(
      [
        { id: "hook", durationMs: 5000 },
        { id: "end", durationMs: 60_000 },
      ],
      { ...music, parts: [{ from: "end" }] },
    );
    expect(first.durationSeconds).toBe(MUSIC_PARTS.minSeconds);
  });

  it("recusa a faixa que passa do que o modelo gera, e diz como dividir", () => {
    const long = [{ id: "only", durationMs: 600_000 }];
    expect(() => planMusicParts(long, music)).toThrowError(/"parts"/);
  });

  it("recusa a cena de troca que não está na narração", () => {
    expect(() =>
      planMusicParts(scenes, { ...music, parts: [{ from: "nowhere" }] }),
    ).toThrowError(/"nowhere"/);
  });
});

describe("musicParts", () => {
  it("trata a trilha de uma faixa só como uma parte que começa com o vídeo", () => {
    expect(musicParts({ file: "a.wav", loudnessLufs: -20 })).toEqual([
      { file: "a.wav", loudnessLufs: -20, startMs: 0 },
    ]);
  });

  it("põe as partes seguintes na ordem, depois da primeira", () => {
    const second = { file: "b.wav", loudnessLufs: -18, startMs: 300_000 };
    expect(
      musicParts({ file: "a.wav", loudnessLufs: -20, parts: [second] }),
    ).toEqual([{ file: "a.wav", loudnessLufs: -20, startMs: 0 }, second]);
  });
});

describe("partEnvelopes e partGain", () => {
  const part = (startMs: number, fadeMs?: number) => ({
    file: `${startMs}.wav`,
    loudnessLufs: -16,
    startMs,
    fadeMs,
  });
  // A 30 quadros por segundo: a segunda faixa começa no quadro 900 e cruza em
  // 3 s (90 quadros); a terceira começa no 1800 e entra em 0,5 s (15 quadros).
  const parts = [part(0), part(30_000), part(60_000, 500)];

  it("faz cada faixa sair no tempo em que a seguinte entra", () => {
    expect(partEnvelopes(parts, [], 30)).toEqual([
      { from: 0, fadeIn: 0, out: 900, fadeOut: 90 },
      { from: 900, fadeIn: 90, out: 1800, fadeOut: 15 },
      { from: 1800, fadeIn: 15, out: undefined, fadeOut: 0 },
    ]);
  });

  it("toca a primeira inteira até a segunda começar, e a segunda inteira depois do cruzamento", () => {
    const [first, second] = partEnvelopes(parts, [], 30);
    expect(partGain(0, first)).toBe(1);
    expect(partGain(899, first)).toBe(1);
    expect(partGain(899, second)).toBe(0);
    expect(partGain(990, first)).toBeCloseTo(0);
    expect(partGain(990, second)).toBeCloseTo(1);
    expect(partGain(1500, second)).toBe(1);
  });

  it("mantém a potência constante no meio do cruzamento", () => {
    const [first, second] = partEnvelopes(parts, [], 30);
    const out = partGain(945, first);
    const into = partGain(945, second);
    expect(out).toBeCloseTo(Math.SQRT1_2);
    expect(out ** 2 + into ** 2).toBeCloseTo(1);
  });

  it("corta a faixa anterior, sem cruzar, quando a nova entra na volta de um trecho sem música", () => {
    // Sem música dos quadros 700 a 900: a segunda faixa entra na volta.
    const [first, second] = partEnvelopes(parts, [{ from: 700, to: 900 }], 30);
    expect(first).toMatchObject({ out: 900, fadeOut: 0 });
    expect(second).toMatchObject({ from: 900, fadeIn: 15 });
    expect(partGain(899, first)).toBe(1);
    expect(partGain(900, first)).toBeCloseTo(0);
    expect(partGain(915, second)).toBeCloseTo(1);
  });

  it("não mexe na trilha de uma faixa só", () => {
    const [only] = partEnvelopes([part(0)], [], 30);
    expect(partGain(0, only)).toBe(1);
    expect(partGain(123, only)).toBe(1);
  });
});

describe("silenceGain", () => {
  const silences = [{ from: 100, to: 200 }];

  it("deixa a trilha passar fora dos trechos sem música", () => {
    expect(silenceGain(50, silences, 10)).toBe(1);
    expect(silenceGain(100, silences, 10)).toBe(1);
    expect(silenceGain(300, silences, 10)).toBe(1);
    expect(silenceGain(50, [], 10)).toBe(1);
  });

  it("some em rampa no começo do trecho e volta em rampa depois do fim", () => {
    expect(silenceGain(105, silences, 10)).toBeCloseTo(0.5);
    expect(silenceGain(110, silences, 10)).toBe(0);
    expect(silenceGain(200, silences, 10)).toBe(0);
    expect(silenceGain(205, silences, 10)).toBeCloseTo(0.5);
    expect(silenceGain(210, silences, 10)).toBe(1);
  });
});

describe("featureAmount", () => {
  const holds = [{ from: 100, to: 160 }];

  it("vale zero fora dos silêncios do roteiro", () => {
    expect(featureAmount(99, holds, 20)).toBe(0);
    expect(featureAmount(161, holds, 20)).toBe(0);
  });

  it("sobe em rampa no começo do silêncio e desce em rampa até o fim", () => {
    expect(featureAmount(100, holds, 20)).toBe(0);
    expect(featureAmount(110, holds, 20)).toBeCloseTo(0.5);
    expect(featureAmount(130, holds, 20)).toBe(1);
    expect(featureAmount(150, holds, 20)).toBeCloseTo(0.5);
    expect(featureAmount(160, holds, 20)).toBe(0);
  });
});

describe("silenceRanges e holdRanges", () => {
  const scene = (id: string, from: number, holdFrames = 0) => ({
    id,
    from,
    durationInFrames: 300,
    holdFrames,
    sentences: [],
    words: [
      { text: "Os", frame: 10 },
      { text: "ratos", frame: 20 },
      { text: "morreram,", frame: 120 },
    ],
  });
  const timeline = [scene("hook", 0, 60), scene("rats", 300)];

  it("tira a música da cena inteira, ou da palavra de deixa até o fim dela", () => {
    expect(
      silenceRanges(timeline, {
        caption: "x",
        silences: [{ from: "hook" }, { from: "rats", cue: "morreram" }],
      }),
    ).toEqual([
      { from: 0, to: 300 },
      { from: 420, to: 600 },
    ]);
    expect(silenceRanges(timeline, undefined)).toEqual([]);
  });

  it("recusa o trecho sem música numa cena que a narração não tem", () => {
    expect(() =>
      silenceRanges(timeline, { caption: "x", silences: [{ from: "moon" }] }),
    ).toThrowError(/"moon"/);
  });

  it("acha o silêncio no fim de cada cena que o roteiro mandou esperar", () => {
    expect(holdRanges(timeline)).toEqual([{ from: 240, to: 300 }]);
  });
});
