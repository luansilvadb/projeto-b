import { describe, expect, it } from "vitest";
import {
  NO_CHOICES,
  chooseTake,
  parseChoices,
  rejectTake,
  replaceSentence,
  setTight,
} from "./choices";
import { splitUtterances } from "./text";

describe("parseChoices", () => {
  it("aceita um arquivo vazio e preenche o que falta", () => {
    expect(parseChoices({})).toEqual(NO_CHOICES);
  });

  it("lê as tomadas e as frases coladas", () => {
    const choices = {
      takes: { "Um.": 7 },
      tight: ["Um."],
      rejected: { "Um.": [1, 2] },
    };
    expect(parseChoices(choices)).toEqual(choices);
  });

  it("recusa semente que não é número inteiro", () => {
    expect(() => parseChoices({ takes: { "Um.": "sete" } })).toThrow(/takes/);
  });

  it("recusa uma lista de coladas que não é de textos", () => {
    expect(() => parseChoices({ tight: [1] })).toThrow(/tight/);
  });
});

describe("chooseTake e setTight", () => {
  it("guardam a escolha sem mexer nas outras", () => {
    const chosen = chooseTake(chooseTake(NO_CHOICES, "Um.", 3), "Dois.", 5);
    expect(chooseTake(chosen, "Um.", 8).takes).toEqual({
      "Um.": 8,
      "Dois.": 5,
    });
  });

  it("colam e descolam uma frase, sem repetir", () => {
    const glued = setTight(setTight(NO_CHOICES, "Um.", true), "Um.", true);
    expect(glued.tight).toEqual(["Um."]);
    expect(setTight(glued, "Um.", false).tight).toEqual([]);
  });
});

describe("rejectTake", () => {
  it("guarda a semente rejeitada, uma vez só", () => {
    const rejected = rejectTake(rejectTake(NO_CHOICES, "Um.", 2), "Um.", 2);
    expect(rejected.rejected).toEqual({ "Um.": [2] });
  });

  it("derruba a escolha à mão quando a rejeitada é ela", () => {
    const chosen = chooseTake(NO_CHOICES, "Um.", 2);
    expect(rejectTake(chosen, "Um.", 2).takes).toEqual({});
    expect(rejectTake(chosen, "Um.", 3).takes).toEqual({ "Um.": 2 });
  });

  it("é desfeita quando a mesma tomada é escolhida à mão depois", () => {
    const back = chooseTake(rejectTake(NO_CHOICES, "Um.", 2), "Um.", 2);
    expect(back.rejected["Um."]).toEqual([]);
  });
});

describe("replaceSentence", () => {
  const narration = "Um dois. Três quatro. Cinco.";

  it("troca só a frase pedida", () => {
    expect(replaceSentence(narration, 1, "Três, quatro!")).toBe(
      "Um dois. Três, quatro! Cinco.",
    );
  });

  it("junta duas frases quando a nova termina em vírgula", () => {
    const joined = replaceSentence(narration, 0, "Um dois,");
    expect(splitUtterances(joined)).toEqual(["Um dois, Três quatro.", "Cinco."]);
  });

  it("remove a frase quando o texto novo é vazio", () => {
    expect(replaceSentence(narration, 2, "  ")).toBe("Um dois. Três quatro.");
  });

  it("recusa uma frase que a cena não tem", () => {
    expect(() => replaceSentence(narration, 3, "Seis.")).toThrow(/frase 4/);
  });
});
