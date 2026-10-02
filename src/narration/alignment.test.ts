import { describe, expect, it } from "vitest";
import { alignWords, type TimedWord } from "./alignment";

const heard = (...words: [string, number, number][]): TimedWord[] =>
  words.map(([text, startMs, endMs]) => ({ text, startMs, endMs }));

describe("alignWords", () => {
  it("dá a cada palavra do roteiro o tempo ouvido, ignorando acento e pontuação", () => {
    const alignment = alignWords(
      "A luz, é rápida.",
      heard(
        ["a", 0, 100],
        ["luz", 100, 400],
        ["e", 450, 500],
        ["rapida", 500, 900],
      ),
      1000,
    );
    expect(alignment.errors).toBe(0);
    expect(alignment.words).toEqual([
      { text: "A", startMs: 0, endMs: 100 },
      { text: "luz,", startMs: 100, endMs: 400 },
      { text: "é", startMs: 450, endMs: 500 },
      { text: "rápida.", startMs: 500, endMs: 900 },
    ]);
  });

  it("conta palavra trocada como um erro e mantém o tempo dela", () => {
    const alignment = alignWords(
      "oito minutos",
      heard(["oito", 0, 300], ["segundos", 300, 800]),
      800,
    );
    expect(alignment.errors).toBe(1);
    expect(alignment.words[1]).toEqual({
      text: "minutos",
      startMs: 300,
      endMs: 800,
    });
  });

  it("distribui palavras não ouvidas entre as vizinhas", () => {
    const alignment = alignWords(
      "um dois três quatro",
      heard(["um", 0, 100], ["quatro", 700, 900]),
      1000,
    );
    expect(alignment.errors).toBe(2);
    expect(alignment.words[1]).toEqual({
      text: "dois",
      startMs: 100,
      endMs: 400,
    });
    expect(alignment.words[2]).toEqual({
      text: "três",
      startMs: 400,
      endMs: 700,
    });
  });

  it("ignora palavras a mais na transcrição, contando cada uma como erro", () => {
    const alignment = alignWords(
      "luz rápida",
      heard(
        ["a", 0, 50],
        ["luz", 50, 300],
        ["muito", 300, 500],
        ["rapida", 500, 900],
      ),
      900,
    );
    expect(alignment.errors).toBe(2);
    expect(alignment.words.map((word) => word.startMs)).toEqual([50, 500]);
  });

  it("divide o tempo de uma palavra ouvida com hífen", () => {
    const alignment = alignWords(
      "guarda-chuva",
      heard(["guarda-chuva", 0, 1000]),
      1000,
    );
    expect(alignment.errors).toBe(0);
    expect(alignment.words).toEqual([
      { text: "guarda", startMs: 0, endMs: 545 },
      { text: "chuva", startMs: 545, endMs: 1000 },
    ]);
  });

  it("espalha o roteiro pela duração quando nada foi ouvido", () => {
    const alignment = alignWords("um dois", [], 1000);
    expect(alignment.errors).toBe(2);
    expect(alignment.words).toEqual([
      { text: "um", startMs: 0, endMs: 500 },
      { text: "dois", startMs: 500, endMs: 1000 },
    ]);
  });
});
