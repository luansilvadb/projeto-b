import type { MusicLevel } from "../narration/script";
import type { FrameRange } from "../narration/timeline";

/**
 * Mixagem da trilha em relação à narração. Os níveis são distâncias em dB
 * abaixo da voz, e não volumes fixos, porque cada voz e cada trilha gerada
 * saem com um volume diferente.
 */
export const MUSIC_MIX = {
  /**
   * Os níveis da trilha sob a fala, que o roteiro escolhe por trecho
   * ("music.levels"); sem escolha, vale "leito". Vêm do estudo de som de
   * 2026-10-05: nos 12 vídeos de referência a música fica a 13 dB da voz
   * (de 9 a 15 entre os vídeos) e, dentro de um vídeo, passa 80% do tempo
   * numa faixa de 7 dB. Por isso os níveis são poucos e próximos. A trilha
   * não sobe a cada pausa da fala: subir e descer o tempo todo soa como um
   * som que abre e abafa, e não como música baixa.
   */
  levelsDb: { presente: 10, leito: 13, recuo: 17 } satisfies Record<
    MusicLevel,
    number
  >,
  /** A passagem de um nível a outro é lenta, para não se ouvir o botão de volume. */
  levelRampSeconds: 2,
  /** Nos silêncios que o roteiro pediu ("holdMs"), a música é o assunto. */
  featuredDb: 3,
  /**
   * Só o silêncio longo leva a música ao primeiro plano. Num respiro de 1 s
   * a rampa nem termina de subir, e o que se ouve é um soluço de volume: a
   * referência tem menos de uma virada de volume por minuto.
   */
  featureMinSeconds: 2,
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
