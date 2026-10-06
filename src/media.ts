// Onde fica a mídia gerada de cada vídeo, em caminhos relativos a public/.
// As composições e os scripts de geração leem daqui para nunca divergirem.

export const mediaFolder = (slug: string) => `videos/${slug}`;

export const narrationManifestFile = (slug: string) =>
  `${mediaFolder(slug)}/narration.json`;

/**
 * O áudio de uma faixa da trilha. A primeira é music.wav, o nome que a trilha
 * de uma faixa só sempre teve; as seguintes são music-2.wav, music-3.wav.
 */
export const musicFile = (slug: string, part = 1) =>
  `${mediaFolder(slug)}/music${part > 1 ? `-${part}` : ""}.wav`;

export const musicTrackFile = (slug: string) =>
  `${mediaFolder(slug)}/music.json`;

/** Uma faixa da trilha que começa depois do começo do vídeo. */
export type MusicPart = {
  /** Caminho do áudio dentro de public/. */
  readonly file: string;
  /** Volume percebido da faixa, em LUFS, para mixá-la em relação à voz. */
  readonly loudnessLufs: number;
  /** O instante do vídeo em que a faixa começa a entrar. */
  readonly startMs: number;
  /** Quanto ela leva para entrar, enquanto a anterior sai. Sem isto, o cruzamento padrão. */
  readonly fadeMs?: number;
};

/** A trilha gerada de um vídeo, como descrita em music.json. */
export type MusicTrack = {
  /** Caminho do áudio dentro de public/. */
  readonly file: string;
  /** Volume percebido da trilha, em LUFS, para mixá-la em relação à voz. */
  readonly loudnessLufs: number;
  /**
   * As faixas seguintes, quando o vídeo é mais longo que uma faixa: cada uma
   * entra no instante dela enquanto a anterior sai.
   */
  readonly parts?: readonly MusicPart[];
};
