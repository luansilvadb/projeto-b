import { findNarrationProblems } from "./text";

export type ScriptScene = {
  /** Liga a cena do roteiro ao componente que a desenha. */
  readonly id: string;
  /** Exatamente o que é falado, já por extenso. */
  readonly narration: string;
  /** O que aparece na tela enquanto a narração toca. */
  readonly visual: string;
  /** Números das fontes em research.md que sustentam a cena. */
  readonly sources?: readonly number[];
};

export type MusicSpec = {
  /** Descrição de estilo, clima e instrumentos, em inglês. */
  readonly caption: string;
  readonly bpm?: number;
  readonly keyScale?: string;
};

export type Script = {
  readonly title: string;
  readonly scenes: readonly ScriptScene[];
  readonly music?: MusicSpec;
};

const SCENE_ID = /^[a-z0-9]+(-[a-z0-9]+)*$/;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isFilledString = (value: unknown): value is string =>
  typeof value === "string" && value.trim() !== "";

const findSceneProblems = (scene: unknown, label: string): string[] => {
  if (!isRecord(scene)) {
    return [`${label}: precisa ser um objeto`];
  }

  const problems: string[] = [];
  if (!isFilledString(scene.id) || !SCENE_ID.test(scene.id)) {
    problems.push(
      `${label}: "id" precisa ser minúsculo com hífens, como "sol-nasce"`,
    );
  }
  if (!isFilledString(scene.visual)) {
    problems.push(`${label}: falta "visual"`);
  }
  if (typeof scene.narration !== "string") {
    problems.push(`${label}: falta "narration"`);
  } else {
    problems.push(
      ...findNarrationProblems(scene.narration).map(
        (problem) => `${label}: ${problem}`,
      ),
    );
  }
  if (
    scene.sources !== undefined &&
    !(Array.isArray(scene.sources) && scene.sources.every(Number.isInteger))
  ) {
    problems.push(`${label}: "sources" precisa ser uma lista de números`);
  }
  return problems;
};

const findMusicProblems = (music: unknown): string[] => {
  if (music === undefined) {
    return [];
  }
  if (!isRecord(music) || !isFilledString(music.caption)) {
    return ['"music" precisa de um "caption"'];
  }

  const problems: string[] = [];
  if (
    music.bpm !== undefined &&
    !(typeof music.bpm === "number" && music.bpm > 0)
  ) {
    problems.push('"music.bpm" precisa ser um número positivo');
  }
  if (music.keyScale !== undefined && !isFilledString(music.keyScale)) {
    problems.push('"music.keyScale" precisa ser um texto, como "D minor"');
  }
  return problems;
};

/** Valida o roteiro inteiro e reporta todos os problemas de uma vez. */
export const parseScript = (data: unknown): Script => {
  if (!isRecord(data)) {
    throw new Error("Roteiro inválido: o arquivo precisa conter um objeto.");
  }

  const problems: string[] = [];
  if (!isFilledString(data.title)) {
    problems.push('falta "title"');
  }

  if (!Array.isArray(data.scenes) || data.scenes.length === 0) {
    problems.push('"scenes" precisa ter ao menos uma cena');
  } else {
    const seen = new Set<unknown>();
    data.scenes.forEach((scene: unknown, index) => {
      const id = isRecord(scene) ? scene.id : undefined;
      const label = `cena ${index + 1}${isFilledString(id) ? ` (${id})` : ""}`;
      problems.push(...findSceneProblems(scene, label));
      if (seen.has(id)) {
        problems.push(`${label}: "id" repetido`);
      }
      seen.add(id);
    });
  }

  problems.push(...findMusicProblems(data.music));

  if (problems.length > 0) {
    throw new Error(`Roteiro inválido:\n- ${problems.join("\n- ")}`);
  }
  return data as Script;
};
