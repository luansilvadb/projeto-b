import { Audio } from "@remotion/media";
import { createContext, useContext } from "react";
import { staticFile, useVideoConfig } from "remotion";

/**
 * Efeitos sonoros do canal, nomeados pelo uso. Os arquivos vêm do pacote
 * "Interface Sounds" da Kenney (CC0), em public/sfx/kenney-interface/.
 */
const SFX = {
  /** Um elemento surge na tela. */
  appear: "sfx/kenney-interface/drop_002.ogg",
} as const;

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
