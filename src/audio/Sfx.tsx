import { Audio } from "@remotion/media";
import { createContext, useContext } from "react";
import { staticFile, useVideoConfig } from "remotion";

/**
 * Efeitos sonoros do canal, nomeados pelo uso. Os arquivos vêm do Freesound
 * (CC0), baixados com `pnpm sfx` para public/sfx/freesound/; o número no nome
 * é o id do som em freesound.org/s/<id>/.
 *
 * Entrada de texto não leva efeito: o som é reservado para o que acontece na
 * imagem. O catálogo cresce a cada uso novo.
 */
const SFX = {
  coinDrop: "sfx/freesound/510731.ogg",
  shutterDown: "sfx/freesound/325585.ogg",
  whoosh: "sfx/freesound/60011.ogg",
  splash: "sfx/freesound/398032.ogg",
} as const satisfies Record<string, string>;

const SFX_VOLUME = 0.5;

/** Falso quando o vídeo é montado sem áudio; ver "silent" em NarratedVideo. */
export const SoundContext = createContext(true);

type SfxProps = {
  readonly name: keyof typeof SFX;
  /** Quadro, no tempo da cena, em que o efeito toca. */
  readonly from: number;
};

export const Sfx: React.FC<SfxProps> = ({ name, from }) => {
  const { fps } = useVideoConfig();
  const soundOn = useContext(SoundContext);
  if (!soundOn) {
    return null;
  }

  return (
    <Audio
      name={`Efeito: ${name}`}
      src={staticFile(SFX[name])}
      from={from}
      volume={SFX_VOLUME}
      premountFor={fps}
    />
  );
};
