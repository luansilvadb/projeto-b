import type { FrameRange } from "../narration/timeline";

/**
 * Mixagem da trilha em relação à narração. Os níveis são distâncias em dB
 * abaixo da voz, e não volumes fixos, porque cada voz e cada trilha gerada
 * saem com um volume diferente.
 */
export const MUSIC_MIX = {
  /**
   * O nível da trilha no vídeo inteiro, com fala ou nas pausas entre as
   * frases. Ela não sobe a cada pausa: subir e descer o tempo todo soa como
   * um som que abre e abafa, e não como música baixa.
   */
  underSpeechDb: 18,
  /** Nos silêncios que o roteiro pediu ("holdMs"), a música é o assunto. */
  featuredDb: 3,
  rampSeconds: 0.6,
  fadeOutSeconds: 1.5,
} as const;

/** Ganho que deixa a trilha `belowVoiceDb` abaixo da voz, a partir do volume medido das duas. */
export const gainBelowVoice = (
  voiceLufs: number,
  musicLufs: number,
  belowVoiceDb: number,
): number =>
  // Nunca amplifica: uma trilha já baixa demais fica como está.
  Math.min(1, 10 ** ((voiceLufs - belowVoiceDb - musicLufs) / 20));

type DuckingLevels = {
  /** Volume da trilha quando ninguém fala. */
  readonly full: number;
  /** Volume da trilha sob a narração. */
  readonly ducked: number;
  /** Quadros que a trilha leva para descer antes da fala e subir depois dela. */
  readonly rampFrames: number;
};

/**
 * Volume da trilha num quadro: baixo durante a fala e nas pausas curtas entre
 * frases, cheio só quando o silêncio é longo o bastante para a rampa completar.
 */
export const duckedVolume = (
  frame: number,
  speech: readonly FrameRange[],
  { full, ducked, rampFrames }: DuckingLevels,
): number => {
  const framesToNearestSpeech = speech.reduce((nearest, range) => {
    const distance = Math.max(range.from - frame, frame - range.to, 0);
    return Math.min(nearest, distance);
  }, Infinity);

  const openness = Math.min(framesToNearestSpeech / rampFrames, 1);
  return ducked + (full - ducked) * openness;
};
