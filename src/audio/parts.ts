import type { MusicPart, MusicTrack } from "../media";
import type { MusicSpec } from "../narration/script";
import {
  cueFrame,
  type FrameRange,
  type SceneTimeline,
} from "../narration/timeline";

/**
 * A trilha em partes. O ACE-Step gera uma faixa de até oito minutos numa GPU
 * de 8 GB, e uma trilha que acompanha o vídeo troca de música nas viradas
 * dele: o roteiro diz em que cena cada faixa entra, e uma cruza com a outra.
 */
export const MUSIC_PARTS = {
  /** O máximo que o ACE-Step gera por faixa numa GPU de 8 GB. */
  maxSeconds: 480,
  /** O mínimo que vale pedir: mais curta que isto, a faixa sai sem forma. */
  minSeconds: 15,
  /** Sobra depois da última fala, para o fade final não cortar a música no meio. */
  tailSeconds: 2,
  /** Quanto duas faixas tocam juntas quando a troca é por baixo da fala. */
  crossfadeSeconds: 3,
  /**
   * A troca num silêncio do roteiro, ou na volta de um trecho sem música: a
   * faixa nova entra de uma vez, porque ali ela é ouvida em primeiro plano.
   */
  entrySeconds: 0.5,
  /** Quanto a trilha leva para sumir num trecho sem música, e para voltar. */
  silenceRampSeconds: 0.5,
} as const;

/** Uma faixa a gerar: onde ela começa no vídeo, quanto dura e o que pedir ao modelo. */
export type PlannedPart = {
  readonly startMs: number;
  /** Quanto a faixa leva para entrar, enquanto a anterior sai. */
  readonly fadeMs: number;
  readonly durationSeconds: number;
  readonly caption: string;
  readonly bpm?: number;
  readonly keyScale?: string;
};

type TimedScene = {
  readonly id: string;
  readonly durationMs: number;
  readonly holdMs?: number;
};

/**
 * As faixas que a trilha de um vídeo pede, a partir da duração de cada cena
 * da narração. A primeira começa com o vídeo; cada item de `music.parts`
 * começa outra, na cena `from` (ou no silêncio do fim dela), com a descrição
 * dele ou a da trilha. Cada faixa dura até a seguinte acabar de entrar, e a
 * última, até o fim do vídeo mais a sobra.
 */
export const planMusicParts = (
  scenes: readonly TimedScene[],
  music: MusicSpec,
): PlannedPart[] => {
  const totalMs = scenes.reduce((total, scene) => total + scene.durationMs, 0);
  const startOf = (id: string, at?: "hold"): number => {
    const index = scenes.findIndex((scene) => scene.id === id);
    if (index < 0) {
      throw new Error(
        `A trilha troca na cena "${id}", que não está na narração.`,
      );
    }
    const sceneStart = scenes
      .slice(0, index)
      .reduce((total, scene) => total + scene.durationMs, 0);
    if (at !== "hold") {
      return sceneStart;
    }
    const { durationMs, holdMs } = scenes[index];
    if (!holdMs) {
      throw new Error(
        `A trilha troca no silêncio da cena "${id}", mas a narração dela não tem silêncio. Rode pnpm narrate.`,
      );
    }
    return sceneStart + durationMs - holdMs;
  };

  const base = {
    caption: music.caption,
    bpm: music.bpm,
    keyScale: music.keyScale,
  };
  const starts = [
    { startMs: 0, fadeMs: 0, ...base },
    ...(music.parts ?? []).map((part) => ({
      startMs: startOf(part.from, part.at),
      fadeMs:
        (part.at === "hold"
          ? MUSIC_PARTS.entrySeconds
          : MUSIC_PARTS.crossfadeSeconds) * 1000,
      caption: part.caption ?? base.caption,
      bpm: part.bpm ?? base.bpm,
      keyScale: part.keyScale ?? base.keyScale,
    })),
  ];

  const planned = starts.map((part, index): PlannedPart => {
    const next = starts[index + 1];
    const endMs = next
      ? next.startMs + next.fadeMs
      : totalMs + MUSIC_PARTS.tailSeconds * 1000;
    return {
      ...part,
      durationSeconds: Math.max(
        Math.ceil((endMs - part.startMs) / 1000),
        MUSIC_PARTS.minSeconds,
      ),
    };
  });

  const tooLong = planned.findIndex(
    (part) => part.durationSeconds > MUSIC_PARTS.maxSeconds,
  );
  if (tooLong >= 0) {
    throw new Error(
      `A parte ${tooLong + 1} da trilha precisa de ${planned[tooLong].durationSeconds} s, ` +
        `mas cada faixa é gerada numa peça só de até ${MUSIC_PARTS.maxSeconds} s. ` +
        'Divida a trilha no roteiro: em "music", acrescente "parts": [{ "from": "<id da cena em que a faixa troca>" }].',
    );
  }
  return planned;
};

/** As faixas de uma trilha gerada, na ordem em que tocam. A trilha de uma faixa só é a própria. */
export const musicParts = (track: MusicTrack): MusicPart[] => [
  { file: track.file, loudnessLufs: track.loudnessLufs, startMs: 0 },
  ...(track.parts ?? []),
];

/** Quando uma faixa entra e sai, em quadros do vídeo. */
export type PartEnvelope = {
  readonly from: number;
  readonly fadeIn: number;
  /** O quadro em que a faixa seguinte começa; a última não tem. */
  readonly out?: number;
  readonly fadeOut: number;
};

/**
 * O envelope de cada faixa. Uma faixa sai enquanto a seguinte entra, no
 * tempo que a seguinte pede. A faixa que entra na volta de um trecho sem
 * música não cruza com nada: a anterior já sumiu e fica cortada ali, e a
 * nova entra de uma vez.
 */
export const partEnvelopes = (
  parts: readonly MusicPart[],
  silences: readonly FrameRange[],
  fps: number,
): PartEnvelope[] => {
  const toFrames = (ms: number) => Math.round((ms / 1000) * fps);
  const afterSilence = (frame: number) =>
    silences.some((range) => frame > range.from && frame <= range.to);
  const entries = parts.map((part, index) => {
    const from = toFrames(part.startMs);
    const cut = afterSilence(from);
    const fadeIn =
      index === 0
        ? 0
        : cut
          ? toFrames(MUSIC_PARTS.entrySeconds * 1000)
          : toFrames(part.fadeMs ?? MUSIC_PARTS.crossfadeSeconds * 1000);
    return { from, fadeIn, cut };
  });
  return entries.map(({ from, fadeIn }, index) => {
    const next = entries[index + 1];
    return {
      from,
      fadeIn,
      out: next?.from,
      fadeOut: next ? (next.cut ? 0 : next.fadeIn) : 0,
    };
  });
};

/**
 * Quanto de uma faixa se ouve num quadro, de 0 a 1. O cruzamento é de
 * potência constante (seno e cosseno): duas músicas diferentes somadas em
 * linha reta afundam no meio do caminho.
 */
export const partGain = (frame: number, envelope: PartEnvelope): number => {
  const progress = (from: number, frames: number) =>
    frames <= 0
      ? frame >= from
        ? 1
        : 0
      : Math.min(Math.max((frame - from) / frames, 0), 1);
  const fadeIn = Math.sin(
    (progress(envelope.from, envelope.fadeIn) * Math.PI) / 2,
  );
  const fadeOut =
    envelope.out === undefined
      ? 1
      : Math.cos((progress(envelope.out, envelope.fadeOut) * Math.PI) / 2);
  return fadeIn * fadeOut;
};

/**
 * Os trechos sem música do roteiro, em quadros do vídeo: cada um vai da
 * palavra de deixa, ou do começo da cena, até o fim da cena.
 */
export const silenceRanges = (
  scenes: readonly SceneTimeline[],
  music: MusicSpec | undefined,
): FrameRange[] =>
  (music?.silences ?? []).map((silence) => {
    const scene = scenes.find(({ id }) => id === silence.from);
    if (!scene) {
      throw new Error(
        `A trilha some na cena "${silence.from}", que não está na narração.`,
      );
    }
    const start = silence.cue
      ? cueFrame(scene, silence.cue, silence.occurrence)
      : 0;
    return {
      from: scene.from + start,
      to: scene.from + scene.durationInFrames,
    };
  });

/** Os silêncios que o roteiro pediu no fim das cenas ("holdMs"), em quadros do vídeo. */
export const holdRanges = (scenes: readonly SceneTimeline[]): FrameRange[] =>
  scenes
    .filter((scene) => scene.holdFrames > 0)
    .map((scene) => ({
      from: scene.from + scene.durationInFrames - scene.holdFrames,
      to: scene.from + scene.durationInFrames,
    }));

/**
 * Quanto da trilha passa num quadro, de 0 a 1, com os trechos sem música:
 * ela some logo depois do começo do trecho e volta logo depois do fim dele.
 */
export const silenceGain = (
  frame: number,
  silences: readonly FrameRange[],
  rampFrames: number,
): number =>
  silences.reduce((gain, range) => {
    const closing = 1 - (frame - range.from) / rampFrames;
    const opening = (frame - range.to) / rampFrames;
    const through = Math.min(Math.max(Math.max(closing, opening), 0), 1);
    return Math.min(gain, through);
  }, 1);

/**
 * Quanto um quadro está dentro de um silêncio do roteiro, de 0 a 1: ali a
 * música é o assunto e sobe ao primeiro plano. Sobe em rampa a partir do
 * começo do silêncio e desce em rampa até o fim dele, onde a fala volta.
 */
export const featureAmount = (
  frame: number,
  holds: readonly FrameRange[],
  rampFrames: number,
): number =>
  holds.reduce(
    (amount, range) =>
      frame < range.from || frame > range.to
        ? amount
        : Math.max(
            amount,
            Math.min(
              (frame - range.from) / rampFrames,
              (range.to - frame) / rampFrames,
              1,
            ),
          ),
    0,
  );
