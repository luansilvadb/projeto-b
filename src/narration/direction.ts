/**
 * O registro da direção criativa (script.md) agrupa as cenas do roteiro em
 * blocos, na tabela da seção "Estrutura". É por essa tabela que a crítica do
 * texto sabe a que bloco cada cena pertence, então ela precisa cobrir o
 * roteiro inteiro: cada cena em um bloco, e em um só.
 */

const STRUCTURE_HEADING = /^##\s+Estrutura\s*$/;
const ANY_HEADING = /^#{1,6}\s/;
const SEPARATOR_ROW = /^\|[\s:|-]+\|$/;

/**
 * As cenas de cada bloco, na ordem da tabela de estrutura: os ids entre crases
 * da última coluna. `undefined` quando o registro não tem a tabela.
 */
export const directionBlocks = (
  markdown: string,
): readonly (readonly string[])[] | undefined => {
  const lines = markdown.split(/\r?\n/);
  const start = lines.findIndex((line) => STRUCTURE_HEADING.test(line));
  if (start === -1) {
    return undefined;
  }
  const section = lines.slice(start + 1);
  const end = section.findIndex((line) => ANY_HEADING.test(line));
  const rows = (end === -1 ? section : section.slice(0, end))
    .map((line) => line.trim())
    .filter((line) => line.startsWith("|") && !SEPARATOR_ROW.test(line));
  if (rows.length < 2) {
    return undefined;
  }
  // A primeira linha da tabela é o cabeçalho.
  return rows.slice(1).map((row) => {
    const cells = row.split("|").slice(1, -1);
    const last = cells[cells.length - 1] ?? "";
    return [...last.matchAll(/`([^`]+)`/g)].map((match) => match[1]);
  });
};

/** O que impede a tabela de estrutura de cobrir o roteiro; vazio quando ela cobre. */
export const directionProblems = (
  markdown: string,
  sceneIds: readonly string[],
): string[] => {
  const blocks = directionBlocks(markdown);
  if (blocks === undefined) {
    return [
      'falta a tabela da seção "## Estrutura", com as cenas de cada bloco na última coluna',
    ];
  }

  const problems: string[] = [];
  const listed = blocks.flat();
  const known = new Set(sceneIds);
  for (const id of new Set(listed)) {
    if (!known.has(id)) {
      problems.push(`a cena "${id}" está na estrutura e não está no roteiro`);
    }
  }
  for (const id of sceneIds) {
    const count = listed.filter((other) => other === id).length;
    if (count === 0) {
      problems.push(`a cena "${id}" não está em nenhum bloco`);
    } else if (count > 1) {
      problems.push(`a cena "${id}" está em ${count} blocos`);
    }
  }
  // Só faz sentido cobrar a ordem quando os dois lados têm as mesmas cenas.
  if (problems.length === 0) {
    const position = listed.findIndex((id, index) => id !== sceneIds[index]);
    if (position !== -1) {
      problems.push(
        `as cenas da estrutura estão fora da ordem do roteiro a partir de "${listed[position]}"`,
      );
    }
  }
  return problems;
};
