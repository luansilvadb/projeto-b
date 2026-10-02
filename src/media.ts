// Onde fica a mídia gerada de cada vídeo, em caminhos relativos a public/.
// As composições e os scripts de geração leem daqui para nunca divergirem.

export const mediaFolder = (slug: string) => `videos/${slug}`;

export const narrationManifestFile = (slug: string) =>
  `${mediaFolder(slug)}/narration.json`;

export const musicFile = (slug: string) => `${mediaFolder(slug)}/music.wav`;

export const musicTrackFile = (slug: string) =>
  `${mediaFolder(slug)}/music.json`;

/** A trilha gerada de um vídeo, como descrita em music.json. */
export type MusicTrack = {
  /** Caminho do áudio dentro de public/. */
  readonly file: string;
  /** Volume percebido da trilha, em LUFS, para mixá-la em relação à voz. */
  readonly loudnessLufs: number;
};
