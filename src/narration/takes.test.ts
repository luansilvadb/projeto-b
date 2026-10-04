import { describe, expect, it } from "vitest";
import {
  bestTake,
  takePenalty,
  wantedEnding,
  type MeasuredTake,
} from "./takes";

const take = (seed: number, changes: Partial<MeasuredTake>): MeasuredTake => ({
  text: "Um dois três.",
  file: `takes/${seed}.wav`,
  durationMs: 1000,
  words: [],
  errors: 0,
  heard: "Um dois três.",
  cutOff: false,
  seed,
  pitchOffset: 0,
  ending: -3,
  ...changes,
});

describe("wantedEnding", () => {
  it("pede que a afirmação feche", () => {
    expect(wantedEnding("Ninguém conseguiu parar.", false)).toBe("fall");
  });

  it("pede suspensão para a frase colada na seguinte e para as reticências", () => {
    expect(wantedEnding("Ninguém conseguiu parar.", true)).toBe("sustain");
    expect(wantedEnding("E ela faz…", false)).toBe("sustain");
    expect(wantedEnding("Ele resumiu assim:", false)).toBe("sustain");
  });

  it("não exige curva da pergunta", () => {
    expect(wantedEnding("Mas o quê?", false)).toBe("any");
  });
});

describe("takePenalty", () => {
  it("não cobra da afirmação que cai o bastante", () => {
    expect(takePenalty(take(1, { ending: -4 }), "fall")).toBe(0);
  });

  it("cobra da afirmação que termina em suspenso, e da suspensa que cai", () => {
    expect(takePenalty(take(1, { ending: 0 }), "fall")).toBe(4);
    expect(takePenalty(take(1, { ending: -4 }), "sustain")).toBe(6);
  });

  it("soma a distância da altura à da amostra", () => {
    expect(takePenalty(take(1, { pitchOffset: -1.5 }), "fall")).toBe(0.75);
  });
});

describe("bestTake", () => {
  it("fica com a curva certa mesmo com a altura um pouco mais longe", () => {
    const holds = take(1, { ending: 1, pitchOffset: 0 });
    const falls = take(2, { ending: -3, pitchOffset: 1 });
    expect(bestTake([holds, falls], "fall")?.seed).toBe(2);
    expect(bestTake([holds, falls], "sustain")?.seed).toBe(1);
  });

  it("deixa a curva decidir quando a altura puxa para o outro lado", () => {
    // O caso real que mudou os pesos: a tomada em suspenso estava mais longe da amostra.
    const falls = take(1, { ending: -1.9, pitchOffset: 0.3 });
    const holds = take(2, { ending: 6.2, pitchOffset: -1.4 });
    expect(bestTake([falls, holds], "sustain")?.seed).toBe(2);
  });

  it("prefere a tomada sem defeito a qualquer curva", () => {
    const wrongWord = take(1, { ending: -3, errors: 1 });
    const cut = take(2, { ending: -3, cutOff: true });
    const clean = take(3, { ending: 2, pitchOffset: 3 });
    expect(bestTake([wrongWord, cut, clean], "fall")?.seed).toBe(3);
  });

  it("deixa de fora as que o usuário rejeitou", () => {
    const takes = [take(1, {}), take(2, { pitchOffset: 2 })];
    expect(bestTake(takes, "fall", [1])?.seed).toBe(2);
    expect(bestTake(takes, "fall", [1, 2])).toBeUndefined();
  });
});
