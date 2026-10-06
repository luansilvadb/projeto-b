import { shotStartWords, type ShotCue } from "./shots";
import { findNarrationProblems } from "./text";

const SHOT_SCALES = ["wide", "medium", "close", "detail"] as const;
const SHOT_ENTRIES = ["cut", "camera", "transform", "wipe"] as const;

/** Um plano: uma composição que fica na tela enquanto um trecho da narração toca. */
type ScriptShot = ShotCue & {
  /** O que se encena: quem faz o quê, e onde. */
  readonly staging: string;
  /** Quão de perto o assunto é visto. */
  readonly scale: (typeof SHOT_SCALES)[number];
  /** Paleta do plano, entre as da ficha visual do vídeo. */
  readonly palette: string;
  /** Como a imagem anterior vira esta. */
  readonly entry: (typeof SHOT_ENTRIES)[number];
};

type ScriptScene = {
  /** Liga a cena do roteiro ao componente que a desenha. */
  readonly id: string;
  /** Exatamente o que é falado, já por extenso. */
  readonly narration: string;
  /** Os planos da cena, na ordem em que aparecem enquanto a narração toca. */
  readonly shots: readonly ScriptShot[];
  /** Números das fontes em research.md que sustentam a cena. */
  readonly sources?: readonly number[];
  /**
   * Silêncio a mais depois da última frase, em milissegundos: a imagem segue
   * sem fala, só com a trilha. É o tempo de uma vinheta ou de um respiro.
   */
  readonly holdMs?: number;
};

/** Mais que isto sem fala deixa de ser respiro e vira buraco na narração. */
const MAX_HOLD_MS = 8000;

export type MusicSpec = {
  /** Descrição de estilo, clima e instrumentos, em inglês. */
  readonly caption: string;
  readonly bpm?: number;
  readonly keyScale?: string;
  /**
   * As trocas de faixa, na ordem do vídeo. Um vídeo mais longo que uma faixa
   * (oito minutos) pede ao menos uma; a faixa nova entra enquanto a anterior
   * sai, por baixo da fala. Uma trilha que acompanha o vídeo troca de faixa
   * nas viradas dele, cada uma com a descrição do trecho.
   */
  readonly parts?: readonly MusicPartSpec[];
  /** Os trechos sem música, para o silêncio pesar. */
  readonly silences?: readonly MusicSilenceSpec[];
};

type MusicPartSpec = {
  /** O "id" da cena em que a faixa nova começa a entrar. */
  readonly from: string;
  /**
   * "hold": a faixa entra no silêncio do fim da cena ("holdMs"), e não na
   * primeira palavra dela. Ali ela é ouvida em primeiro plano.
   */
  readonly at?: "hold";
  /** Outro clima para este trecho; sem eles, vale a descrição da trilha. */
  readonly caption?: string;
  readonly bpm?: number;
  readonly keyScale?: string;
};

/** Um trecho sem música: da palavra de deixa (ou do começo da cena) ao fim da cena. */
type MusicSilenceSpec = {
  readonly from: string;
  readonly cue?: string;
  readonly occurrence?: number;
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
  if (
    scene.holdMs !== undefined &&
    !(
      Number.isInteger(scene.holdMs) &&
      Number(scene.holdMs) > 0 &&
      Number(scene.holdMs) <= MAX_HOLD_MS
    )
  ) {
    problems.push(
      `${label}: "holdMs" precisa ser um inteiro de 1 a ${MAX_HOLD_MS}`,
    );
  }
  return problems;
};

const findMusicStyleProblems = (
  music: Record<string, unknown>,
  label: string,
): string[] => {
  const problems: string[] = [];
  if (
    music.bpm !== undefined &&
    !(typeof music.bpm === "number" && music.bpm > 0)
  ) {
    problems.push(`"${label}.bpm" precisa ser um número positivo`);
  }
  if (music.keyScale !== undefined && !isFilledString(music.keyScale)) {
    problems.push(`"${label}.keyScale" precisa ser um texto, como "D minor"`);
  }
  return problems;
};

const findMusicProblems = (
  music: unknown,
  scenes: readonly unknown[],
): string[] => {
  if (music === undefined) {
    return [];
  }
  if (!isRecord(music) || !isFilledString(music.caption)) {
    return ['"music" precisa de um "caption"'];
  }

  const sceneIds = scenes.map((scene) =>
    isRecord(scene) ? scene.id : undefined,
  );
  const problems = findMusicStyleProblems(music, "music");

  if (music.parts !== undefined) {
    if (!Array.isArray(music.parts) || music.parts.length === 0) {
      problems.push('"music.parts" precisa ter ao menos uma troca de faixa');
    } else {
      // Cada troca vem depois da anterior, e nenhuma no começo da primeira
      // cena: ali a trilha já começa, e não há faixa anterior de onde trocar.
      // O silêncio de uma cena vem depois do começo dela.
      let last = 0;
      music.parts.forEach((part: unknown, index) => {
        const label = `music.parts[${index}]`;
        if (!isRecord(part) || !isFilledString(part.from)) {
          problems.push(
            `"${label}" precisa de um "from" com o "id" de uma cena`,
          );
          return;
        }
        if (part.at !== undefined && part.at !== "hold") {
          problems.push(`"${label}.at" só pode ser "hold"`);
        }
        const scene = sceneIds.indexOf(part.from);
        const hold = part.at === "hold";
        const position = scene * 2 + (hold ? 1 : 0);
        if (scene < 0) {
          problems.push(`"${label}.from": não há cena "${part.from}"`);
        } else if (position <= last) {
          problems.push(
            `"${label}.from": a cena "${part.from}" precisa vir depois ${index === 0 ? "da primeira cena" : "da troca anterior"}`,
          );
        } else {
          last = position;
          const inScript = scenes[scene];
          if (hold && !(isRecord(inScript) && inScript.holdMs)) {
            problems.push(
              `"${label}": a cena "${part.from}" não tem "holdMs", o silêncio em que a faixa entraria`,
            );
          }
        }
        if (part.caption !== undefined && !isFilledString(part.caption)) {
          problems.push(`"${label}.caption" precisa ser um texto`);
        }
        problems.push(...findMusicStyleProblems(part, label));
      });
    }
  }

  if (music.silences !== undefined) {
    if (!Array.isArray(music.silences)) {
      problems.push('"music.silences" precisa ser uma lista');
    } else {
      music.silences.forEach((silence: unknown, index) => {
        const label = `music.silences[${index}]`;
        if (!isRecord(silence) || !isFilledString(silence.from)) {
          problems.push(
            `"${label}" precisa de um "from" com o "id" de uma cena`,
          );
          return;
        }
        if (!sceneIds.includes(silence.from)) {
          problems.push(`"${label}.from": não há cena "${silence.from}"`);
        }
        if (silence.cue !== undefined && !isFilledString(silence.cue)) {
          problems.push(`"${label}.cue" precisa ser uma palavra da narração`);
        }
        if (
          silence.occurrence !== undefined &&
          !(
            Number.isInteger(silence.occurrence) &&
            Number(silence.occurrence) > 0
          )
        ) {
          problems.push(
            `"${label}.occurrence" precisa ser um inteiro positivo`,
          );
        }
      });
    }
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

  problems.push(
    ...findMusicProblems(
      data.music,
      Array.isArray(data.scenes) ? data.scenes : [],
    ),
  );

  if (problems.length > 0) {
    throw new Error(`Roteiro inválido:\n- ${problems.join("\n- ")}`);
  }
  return data as Script;
};
