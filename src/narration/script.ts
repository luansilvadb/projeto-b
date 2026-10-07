import { SFX, SFX_LEVELS, type SfxLevel, type SfxName } from "../audio/sfx";
import { shotStartWords, type ShotCue } from "./shots";
import { findNarrationProblems } from "./text";

const SHOT_SCALES = ["wide", "medium", "close", "detail"] as const;

/** Um plano: uma composição que fica na tela enquanto um trecho da narração toca. */
type ScriptShot = ShotCue & {
  /** O que se encena: quem faz o quê, e onde. */
  readonly staging: string;
  /** Quão de perto o assunto é visto. */
  readonly scale: (typeof SHOT_SCALES)[number];
  /** Paleta do plano, entre as da ficha visual do vídeo. */
  readonly palette: string;
  /**
   * Como a imagem anterior vira esta. Texto livre: nada no render lê o campo,
   * e uma lista fechada recusava a passagem que ninguém tinha previsto. O
   * costume é "cut", "camera", "transform" ou "wipe".
   */
  readonly entry: string;
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
  /**
   * Os momentos em que a música muda de caráter sem trocar de faixa: o trecho
   * é refeito dentro da mesma peça (o "repaint" do ACE-Step), com a descrição
   * dele, e o resto da faixa fica como estava.
   */
  readonly moments?: readonly MusicMomentSpec[];
  /** Onde o nível da trilha sob a fala muda. Sem isto, o vídeo inteiro fica em "leito". */
  readonly levels?: readonly MusicLevelSpec[];
};

/**
 * Os níveis da trilha sob a fala, do mais presente ao mais recuado. São
 * poucos e próximos de propósito: a distância de cada um à voz está em
 * `MUSIC_MIX` (src/audio/ducking.ts).
 */
export const MUSIC_LEVELS = ["presente", "leito", "recuo"] as const;
export type MusicLevel = (typeof MUSIC_LEVELS)[number];

/** Um momento da trilha: do começo da cena `from` ao fim da cena `to` (ou da própria `from`). */
type MusicMomentSpec = {
  readonly from: string;
  readonly to?: string;
  /** O que a música faz no trecho, com os mesmos timbres da faixa. */
  readonly caption: string;
};

/** O nível da trilha a partir do começo da cena `from`, até a mudança seguinte. */
type MusicLevelSpec = {
  readonly from: string;
  readonly level: MusicLevel;
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

/**
 * Um efeito sonoro do vídeo. Toca na palavra `cue` da cena (a `occurrence`
 * quando ela se repete), ou no começo do plano `shot` (contado a partir de
 * 1), ou no começo da cena; `offsetMs` desloca o som para antes ou depois.
 */
export type SfxSpec = {
  readonly scene: string;
  readonly cue?: string;
  readonly occurrence?: number;
  readonly shot?: number;
  readonly offsetMs?: number;
  /** Um uso do catálogo (src/audio/sfx.ts). */
  readonly name: SfxName;
  /** Sem isto, o nível normal de um efeito. */
  readonly level?: SfxLevel;
};

export type Script = {
  readonly title: string;
  readonly scenes: readonly ScriptScene[];
  readonly music?: MusicSpec;
  /** Os efeitos sonoros, na ordem do vídeo. */
  readonly sfx?: readonly SfxSpec[];
};

const SCENE_ID = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export const isRecord = (value: unknown): value is Record<string, unknown> =>
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
  if (!isFilledString(shot.entry)) {
    problems.push(`${label}: falta "entry", como a imagem anterior vira esta`);
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

  if (music.moments !== undefined) {
    if (!Array.isArray(music.moments)) {
      problems.push('"music.moments" precisa ser uma lista');
    } else {
      // Os momentos vêm na ordem do vídeo e não se sobrepõem: cada um refaz
      // um trecho da faixa, e dois sobre o mesmo trecho se desfariam.
      let last = -1;
      music.moments.forEach((moment: unknown, index) => {
        const label = `music.moments[${index}]`;
        if (!isRecord(moment) || !isFilledString(moment.from)) {
          problems.push(
            `"${label}" precisa de um "from" com o "id" de uma cena`,
          );
          return;
        }
        if (!isFilledString(moment.caption)) {
          problems.push(`"${label}" precisa de um "caption"`);
        }
        if (moment.to !== undefined && !isFilledString(moment.to)) {
          problems.push(`"${label}.to" precisa ser o "id" de uma cena`);
          return;
        }
        const start = sceneIds.indexOf(moment.from);
        const end = sceneIds.indexOf(moment.to ?? moment.from);
        if (start < 0 || end < 0) {
          problems.push(
            `"${label}": não há cena "${String(start < 0 ? moment.from : moment.to)}"`,
          );
        } else if (end < start) {
          problems.push(`"${label}.to" precisa vir depois de "from"`);
        } else if (start <= last) {
          problems.push(
            `"${label}.from": a cena "${moment.from}" precisa vir depois do momento anterior`,
          );
        } else {
          last = end;
        }
      });
    }
  }

  if (music.levels !== undefined) {
    if (!Array.isArray(music.levels)) {
      problems.push('"music.levels" precisa ser uma lista');
    } else {
      let last = -1;
      music.levels.forEach((change: unknown, index) => {
        const label = `music.levels[${index}]`;
        if (!isRecord(change) || !isFilledString(change.from)) {
          problems.push(
            `"${label}" precisa de um "from" com o "id" de uma cena`,
          );
          return;
        }
        if (!MUSIC_LEVELS.includes(change.level as MusicLevel)) {
          problems.push(
            `"${label}.level" precisa ser um de: ${MUSIC_LEVELS.join(", ")}`,
          );
        }
        const scene = sceneIds.indexOf(change.from);
        if (scene < 0) {
          problems.push(`"${label}.from": não há cena "${change.from}"`);
        } else if (scene <= last) {
          problems.push(
            `"${label}.from": a cena "${change.from}" precisa vir depois da mudança anterior`,
          );
        } else {
          last = scene;
        }
      });
    }
  }
  return problems;
};

const findSfxProblems = (
  sfx: unknown,
  scenes: readonly unknown[],
): string[] => {
  if (sfx === undefined) {
    return [];
  }
  if (!Array.isArray(sfx)) {
    return ['"sfx" precisa ser uma lista'];
  }
  const problems: string[] = [];
  sfx.forEach((effect: unknown, index) => {
    const label = `sfx[${index}]`;
    if (!isRecord(effect) || !isFilledString(effect.scene)) {
      problems.push(`"${label}" precisa de um "scene" com o "id" de uma cena`);
      return;
    }
    const scene = scenes.find(
      (candidate) => isRecord(candidate) && candidate.id === effect.scene,
    );
    if (!isRecord(scene)) {
      problems.push(`"${label}.scene": não há cena "${effect.scene}"`);
      return;
    }
    if (!(typeof effect.name === "string" && effect.name in SFX)) {
      problems.push(
        `"${label}.name" precisa ser um uso do catálogo: ${Object.keys(SFX).join(", ")}`,
      );
    }
    if (effect.level !== undefined && !(String(effect.level) in SFX_LEVELS)) {
      problems.push(
        `"${label}.level" precisa ser um de: ${Object.keys(SFX_LEVELS).join(", ")}`,
      );
    }
    if (effect.cue !== undefined && effect.shot !== undefined) {
      problems.push(`"${label}": use "cue" ou "shot", não os dois`);
    }
    if (effect.cue !== undefined && !isFilledString(effect.cue)) {
      problems.push(`"${label}.cue" precisa ser uma palavra da narração`);
    }
    if (
      effect.occurrence !== undefined &&
      !(Number.isInteger(effect.occurrence) && Number(effect.occurrence) > 0)
    ) {
      problems.push(`"${label}.occurrence" precisa ser um inteiro positivo`);
    }
    const shots = Array.isArray(scene.shots) ? scene.shots.length : 0;
    if (
      effect.shot !== undefined &&
      !(
        Number.isInteger(effect.shot) &&
        Number(effect.shot) >= 1 &&
        Number(effect.shot) <= shots
      )
    ) {
      problems.push(
        `"${label}.shot" precisa ser um plano da cena, de 1 a ${shots}`,
      );
    }
    if (effect.offsetMs !== undefined && !Number.isInteger(effect.offsetMs)) {
      problems.push(`"${label}.offsetMs" precisa ser um inteiro`);
    }
  });
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

  problems.push(
    ...findSfxProblems(data.sfx, Array.isArray(data.scenes) ? data.scenes : []),
  );

  if (problems.length > 0) {
    throw new Error(`Roteiro inválido:\n- ${problems.join("\n- ")}`);
  }
  return data as Script;
};
