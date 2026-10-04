// O OmniVoice passa a gerar em pedaços o que estima em mais de 30 s de fala;
// uma frase do roteiro tem de caber inteira numa geração, com folga.
export const MAX_SENTENCE_CHARS = 280;

/** Forma usada para comparar o roteiro com o que o Whisper ouviu. */
export const normalizeWord = (word: string): string =>
  word
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

/** Hífens separam palavras porque o Whisper ora os mantém, ora não. */
export const tokenize = (text: string): string[] =>
  text.split(/[\s\-–—]+/).filter((token) => normalizeWord(token) !== "");

export const splitSentences = (text: string): string[] =>
  (text.match(/[^.!?…]+[.!?…]+["”’]*|[^.!?…]+$/g) ?? [])
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence !== "");

/**
 * As unidades de fala da narração: cada uma é gerada sozinha pelo modelo de
 * voz e separada da seguinte por uma pausa. Além do fim de cada frase, o
 * dois-pontos também corta: quem fala para ali, com a voz em suspenso, antes
 * de dizer o que anunciou (uma citação, uma explicação, um item).
 */
export const splitUtterances = (text: string): string[] =>
  splitSentences(text).flatMap((sentence) => sentence.split(/(?<=:)\s+/));

const quoteAll = (matches: readonly string[]): string =>
  [...new Set(matches)].map((match) => `"${match}"`).join(", ");

/**
 * A narração é lida literalmente pelo modelo de voz, que erra dígitos,
 * símbolos e siglas. Quem escreve o roteiro decide a pronúncia por extenso.
 */
export const findNarrationProblems = (narration: string): string[] => {
  if (narration.trim() === "") {
    return ["narração vazia"];
  }

  const problems: string[] = [];
  const report = (pattern: RegExp, describe: (found: string) => string) => {
    const matches = narration.match(pattern);
    if (matches) {
      problems.push(describe(quoteAll(matches)));
    }
  };

  report(/\d+/g, (found) => `dígitos (${found}): escreva números por extenso`);
  report(
    /[%$€£&@#+=/\\*_^~<>|°ºª()[\]{}]/g,
    (found) => `símbolos (${found}): escreva como se fala`,
  );
  report(
    /(?<!\p{L})\p{Lu}{2,}(?!\p{L})/gu,
    (found) => `siglas (${found}): escreva como se pronuncia`,
  );
  report(
    /(?<!\p{L})(?:km|kg|cm|mm|ml|mg|nm|hz|kwh)(?!\p{L})/giu,
    (found) => `abreviações de unidade (${found}): escreva por extenso`,
  );

  // O limite é o da geração, que acontece por unidade de fala.
  const sentences = splitUtterances(narration);
  for (const sentence of sentences) {
    if (sentence.length > MAX_SENTENCE_CHARS) {
      problems.push(
        `frase com ${sentence.length} caracteres (máximo ${MAX_SENTENCE_CHARS}): divida "${sentence.slice(0, 40)}…"`,
      );
    }
  }
  if (!/[.!?…]["”’]*$/.test(narration.trim())) {
    problems.push(
      "a narração precisa terminar com ponto, exclamação ou interrogação",
    );
  }

  return problems;
};
