import { describe, expect, it } from "vitest";
import { directionBlocks, directionProblems } from "./direction";

const record = (rows: readonly string[]) =>
  [
    "# Título",
    "",
    "- Tese: uma frase",
    "",
    "## Estrutura",
    "",
    "| Bloco | Capítulo | Função | Nota visual | Cenas |",
    "|---|---|---|---|---|",
    ...rows,
    "",
    "## Fio",
    "",
    "| Outra | Tabela |",
    "|---|---|",
    "| que não conta | `intruso` |",
  ].join("\n");

const COVERED = record([
  "| 1 | (gancho) | gancho | Uma `lupa` procura. | `hook`, `promise` |",
  "| 2 | O custo | fundamento | A loja fecha. | `cost` |",
]);

describe("directionBlocks", () => {
  it("lê as cenas de cada bloco na última coluna, e só na tabela de estrutura", () => {
    expect(directionBlocks(COVERED)).toEqual([["hook", "promise"], ["cost"]]);
  });

  it("devolve undefined quando o registro não tem a tabela", () => {
    expect(directionBlocks("# Título\n\n- Tese: uma frase")).toBeUndefined();
    expect(directionBlocks("## Estrutura\n\nainda por fazer")).toBeUndefined();
  });

  it("aceita bloco sem cena, como o que ainda não foi escrito", () => {
    expect(
      directionBlocks(record(["| 1 | (gancho) | gancho | — | |"])),
    ).toEqual([[]]);
  });
});

describe("directionProblems", () => {
  it("passa quando cada cena do roteiro está em um bloco, na ordem", () => {
    expect(directionProblems(COVERED, ["hook", "promise", "cost"])).toEqual([]);
  });

  it("acusa a falta da tabela", () => {
    expect(directionProblems("# Título", ["hook"])).toHaveLength(1);
  });

  it("acusa a cena do roteiro que ficou sem bloco", () => {
    expect(
      directionProblems(COVERED, ["hook", "promise", "cost", "closing"]),
    ).toEqual(['a cena "closing" não está em nenhum bloco']);
  });

  it("acusa a cena repetida em dois blocos", () => {
    const repeated = record([
      "| 1 | (gancho) | gancho | — | `hook`, `cost` |",
      "| 2 | O custo | fundamento | — | `cost` |",
    ]);
    expect(directionProblems(repeated, ["hook", "cost"])).toEqual([
      'a cena "cost" está em 2 blocos',
    ]);
  });

  it("acusa a cena que saiu do roteiro e ficou na estrutura", () => {
    expect(directionProblems(COVERED, ["hook", "promise"])).toEqual([
      'a cena "cost" está na estrutura e não está no roteiro',
    ]);
  });

  it("acusa a estrutura fora da ordem do roteiro", () => {
    expect(directionProblems(COVERED, ["hook", "cost", "promise"])).toEqual([
      'as cenas da estrutura estão fora da ordem do roteiro a partir de "promise"',
    ]);
  });
});
