import { describe, expect, it } from "vitest";
import {
  MAX_SENTENCE_CHARS,
  findNarrationProblems,
  normalizeWord,
  splitSentences,
  tokenize,
} from "./text";

describe("normalizeWord", () => {
  it("ignora acentos, caixa e pontuação", () => {
    expect(normalizeWord("Quilômetros,")).toBe("quilometros");
    expect(normalizeWord("“É”")).toBe("e");
  });
});

describe("tokenize", () => {
  it("separa por espaços e hífens e descarta pontuação solta", () => {
    expect(tokenize("O guarda-chuva — novo — abriu.")).toEqual([
      "O",
      "guarda",
      "chuva",
      "novo",
      "abriu.",
    ]);
  });
});

describe("splitSentences", () => {
  it("divide em cada pontuação final", () => {
    expect(
      splitSentences("A luz saiu do Sol. Sabe por quê? Porque sim!"),
    ).toEqual(["A luz saiu do Sol.", "Sabe por quê?", "Porque sim!"]);
  });

  it("mantém um resto sem pontuação como última frase", () => {
    expect(splitSentences("Primeira. segunda sem ponto")).toEqual([
      "Primeira.",
      "segunda sem ponto",
    ]);
  });
});

describe("findNarrationProblems", () => {
  it("aceita narração escrita por extenso", () => {
    expect(
      findNarrationProblems(
        "A luz atravessou cento e cinquenta milhões de quilômetros.",
      ),
    ).toEqual([]);
  });

  it("aponta dígitos, símbolos, siglas e unidades abreviadas", () => {
    const problems = findNarrationProblems("O DNA tem 2 nm, ou 100% do total.");
    expect(problems).toHaveLength(4);
    expect(problems[0]).toContain('"2"');
    expect(problems[1]).toContain('"%"');
    expect(problems[2]).toContain('"DNA"');
    expect(problems[3]).toContain('"nm"');
  });

  it("não confunde palavra iniciada por maiúscula com sigla", () => {
    expect(findNarrationProblems("O Sol e a Terra. É assim.")).toEqual([]);
  });

  it("exige pontuação final e limita o tamanho da frase", () => {
    expect(findNarrationProblems("sem ponto final")).toEqual([
      "a narração precisa terminar com ponto, exclamação ou interrogação",
    ]);
    const long = `${"palavra ".repeat(MAX_SENTENCE_CHARS / 8 + 1).trim()}.`;
    expect(findNarrationProblems(long)[0]).toContain("divida");
  });

  it("recusa narração vazia", () => {
    expect(findNarrationProblems("  ")).toEqual(["narração vazia"]);
  });
});
