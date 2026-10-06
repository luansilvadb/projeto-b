import type { NarrationManifest } from "./manifest";
import type { ShotCue } from "./shots";
import { normalizeWord } from "./text";

export type FrameRange = {
  readonly from: number;
  readonly to: number;
};

type SentenceTimeline = {
  readonly file: string;
  /** Quadro, relativo à cena, em que o áudio da frase começa. */
  readonly from: number;
};

type WordCue = {
  readonly text: string;
  /** Quadro, relativo à cena, em que a palavra começa a ser falada. */
  readonly frame: number;
};

export type SceneTimeline = {
  readonly id: string;
  /** Quadro do vídeo em que a cena começa. */
  readonly from: number;
  readonly durationInFrames: number;
  /** Quadros de silêncio no fim da cena que o roteiro pediu: o tempo de uma vinheta. */
  readonly holdFrames: number;
  readonly sentences: readonly SentenceTimeline[];
  readonly words: readonly WordCue[];
};

export type VideoTimeline = {
  readonly durationInFrames: number;
  readonly scenes: readonly SceneTimeline[];
  /** Trechos do vídeo em que há fala, para baixar a trilha. */
  readonly speech: readonly FrameRange[];
};

export const buildTimeline = (
  manifest: NarrationManifest,
  fps: number,
): VideoTimeline => {
  // Converter sempre a partir do tempo absoluto evita acumular erro de arredondamento.
  const toFrame = (ms: number) => Math.round((ms * fps) / 1000);

  let sceneStartMs = 0;
  const speech: FrameRange[] = [];
  const scenes = manifest.scenes.map((scene) => {
    const from = toFrame(sceneStartMs);
    const absoluteFrame = (ms: number) => toFrame(sceneStartMs + ms);

    for (const sentence of scene.sentences) {
      speech.push({
        from: absoluteFrame(sentence.startMs),
        to: absoluteFrame(sentence.startMs + sentence.durationMs),
      });
    }

    const timeline: SceneTimeline = {
      id: scene.id,
      from,
      durationInFrames: absoluteFrame(scene.durationMs) - from,
      holdFrames: toFrame(scene.holdMs ?? 0),
      sentences: scene.sentences.map((sentence) => ({
        file: sentence.file,
        from: absoluteFrame(sentence.startMs) - from,
      })),
      words: scene.sentences.flatMap((sentence) =>
        sentence.words.map((word) => ({
          text: word.text,
          frame: absoluteFrame(word.startMs) - from,
        })),
      ),
    };
    sceneStartMs += scene.durationMs;
    return timeline;
  });

  return { durationInFrames: toFrame(sceneStartMs), scenes, speech };
};

/**
 * Quadro da cena em que uma palavra da narração é falada, para sincronizar
 * um elemento visual com ela. Falha se a palavra não está na cena: isso
 * significa que o roteiro mudou e a animação ficou para trás.
 */
export const cueFrame = (
  scene: SceneTimeline,
  word: string,
  occurrence = 1,
): number => {
  const key = normalizeWord(word);
  const matches = scene.words.filter((cue) => normalizeWord(cue.text) === key);
  const match = matches[occurrence - 1];
  if (!match) {
    throw new Error(
      `A cena "${scene.id}" não tem a ${occurrence}ª ocorrência de "${word}" na narração.`,
    );
  }
  return match.frame;
};

/** O que entra em cima da palavra parece atrasado: a imagem antecipa a fala por alguns quadros. */
export const CUE_LEAD_FRAMES = 4;

/**
 * Trecho da cena, em quadros, que cada plano do roteiro ocupa: do começo da
 * cena, ou de pouco antes da palavra de deixa, até a deixa do plano seguinte.
 */
export const shotRanges = (
  scene: SceneTimeline,
  shots: readonly ShotCue[],
): FrameRange[] => {
  const starts = shots.map((shot, index) =>
    index === 0
      ? 0
      : Math.max(
          0,
          cueFrame(scene, shot.cue ?? "", shot.occurrence) - CUE_LEAD_FRAMES,
        ),
  );
  return starts.map((from, index) => ({
    from,
    to: starts[index + 1] ?? scene.durationInFrames,
  }));
};
