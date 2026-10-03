import { shotStartWords, type ShotCue } from "./shots";
import { findNarrationProblems } from "./text";

export const SHOT_SCALES = ["wide", "medium", "close", "detail"] as const;
export const SHOT_ENTRIES = ["cut", "camera", "transform", "wipe"] as const;

/** Um plano: uma composição que fica na tela enquanto um trecho da narração toca. */
export type ScriptShot = ShotCue & {
  /** O que se encena: quem faz o quê, e onde. */
  readonly staging: string;
  /** Quão de perto o assunto é visto. */
  readonly scale: (typeof SHOT_SCALES)[number];
  /** Paleta do plano, entre as da ficha visual do vídeo. */
  readonly palette: string;
  /** Como a imagem anterior vira esta. */
  readonly entry: (typeof SHOT_ENTRIES)[number];
};

export type ScriptScene = {
  /** Liga a cena do roteiro ao componente que a desenha. */
  readonly id: string;
  /** Exatamente o que é falado, já por extenso. */
  readonly narration: string;
  /** Os planos da cena, na ordem em que aparecem enquanto a narração toca. */
  readonly shots: readonly ScriptShot[];
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

const isOneOf = (options: readonly string[], value: unknown): boolean =>
  typeof value === "string" && options.includes(value);

const quoteOptions = (options: readonly string[]): string =>
  options.map((option) => `"${option}"`).join(", ");

const findShotProblems = (
  shot: unknown,
  index: number,
  label: string,
): string[] => {
  if (!isRecord(shot)) {
    return [`${label}: precisa ser um objeto`];
  }

  const problems: string[] = [];
  if (index === 0 && shot.cue !== undefined) {
    problems.push(
      `${label}: o primeiro plano começa com a cena e não leva "cue"`,
    );
  }
  if (index > 0 && !isFilledString(shot.cue)) {
    problems.push(
      `${label}: falta "cue", a palavra da narração em que o plano começa`,
    );
  }
  if (
    shot.occurrence !== undefined &&
    !(Number.isInteger(shot.occurrence) && Number(shot.occurrence) > 0)
  ) {
    problems.push(`${label}: "occurrence" precisa ser um inteiro positivo`);
  }
  if (!isFilledString(shot.staging)) {
    problems.push(`${label}: falta "staging", o que se encena`);
  }
  if (!isOneOf(SHOT_SCALES, shot.scale)) {
    problems.push(`${label}: "scale" precisa ser ${quoteOptions(SHOT_SCALES)}`);
  }
  if (!isFilledString(shot.palette)) {
    problems.push(`${label}: falta "palette", a paleta do plano`);
  }
  if (!isOneOf(SHOT_ENTRIES, shot.entry)) {
    problems.push(
      `${label}: "entry" precisa ser ${quoteOptions(SHOT_ENTRIES)}`,
    );
  }
  return problems;
};

/** Cada deixa precisa estar na narração da cena, e os planos seguem a ordem da fala. */
const findCueProblems = (
  narration: string,
  shots: readonly unknown[],
  label: string,
): string[] => {
  const cues = shots.map((shot): ShotCue => {
    if (!isRecord(shot)) {
      return {};
    }
    return {
      cue: isFilledString(shot.cue) ? shot.cue : undefined,
      occurrence:
        typeof shot.occurrence === "number" ? shot.occurrence : undefined,
    };
  });
  const starts = shotStartWords(narration, cues);

  const problems: string[] = [];
  let latest = 0;
  cues.forEach(({ cue }, index) => {
    if (index === 0 || cue === undefined) {
      return;
    }
    const start = starts[index];
    if (start === undefined) {
      problems.push(
        `${label}, plano ${index + 1}: a deixa "${cue}" não está na narração da cena`,
      );
    } else if (start <= latest) {
      problems.push(
        `${label}, plano ${index + 1}: a deixa "${cue}" precisa vir depois da deixa do plano anterior`,
      );
    } else {
      latest = start;
    }
  });
  return problems;
};

const findShotsProblems = (
  scene: Record<string, unknown>,
  label: string,
): string[] => {
  if (scene.visual !== undefined) {
    return [
      `${label}: "visual" deu lugar a "shots", a lista de planos da cena`,
    ];
  }
  if (!Array.isArray(scene.shots) || scene.shots.length === 0) {
    return [`${label}: "shots" precisa ter ao menos um plano`];
  }

  const shots: readonly unknown[] = scene.shots;
  return [
    ...shots.flatMap((shot, index) =>
      findShotProblems(shot, index, `${label}, plano ${index + 1}`),
    ),
    ...(typeof scene.narration === "string"
      ? findCueProblems(scene.narration, shots, label)
      : []),
  ];
};

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
  problems.push(...findShotsProblems(scene, label));
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
