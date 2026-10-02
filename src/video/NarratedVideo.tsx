import { Audio } from "@remotion/media";
import { useMemo } from "react";
import {
  Series,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { MUSIC_MIX, duckedVolume, gainBelowVoice } from "../audio/ducking";
import { SoundContext } from "../audio/Sfx";
import type { MusicTrack } from "../media";
import type { NarrationManifest } from "../narration/manifest";
import {
  buildTimeline,
  type FrameRange,
  type SceneTimeline,
} from "../narration/timeline";

export type SceneProps = {
  /** Tempos da cena: duração e o quadro em que cada palavra é falada. */
  readonly scene: SceneTimeline;
};

export type NarratedVideoProps = {
  /** Preenchida por narratedVideoMetadata antes do render. */
  readonly narration: NarrationManifest | null;
  /** Preenchida por narratedVideoMetadata antes do render. */
  readonly music: MusicTrack | null;
  /**
   * Monta o vídeo sem nenhum áudio. Existe para o `pnpm stills`: o Remotion
   * 4.0.532 falha ao renderizar quadros avulsos de uma composição com áudio.
   */
  readonly silent?: boolean;
};

type MusicBedProps = {
  readonly track: MusicTrack;
  readonly voiceLufs: number;
  readonly speech: readonly FrameRange[];
};

const MusicBed: React.FC<MusicBedProps> = ({ track, voiceLufs, speech }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const ducked = duckedVolume(frame, speech, {
    full: gainBelowVoice(
      voiceLufs,
      track.loudnessLufs,
      MUSIC_MIX.betweenSpeechDb,
    ),
    ducked: gainBelowVoice(
      voiceLufs,
      track.loudnessLufs,
      MUSIC_MIX.underSpeechDb,
    ),
    rampFrames: MUSIC_MIX.rampSeconds * fps,
  });
  const fadeOut = interpolate(
    frame,
    [durationInFrames - MUSIC_MIX.fadeOutSeconds * fps, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  return (
    <Audio
      name="Trilha"
      src={staticFile(track.file)}
      volume={ducked * fadeOut}
      premountFor={fps}
    />
  );
};

type Props = NarratedVideoProps & {
  /** Componente de cada cena, pela mesma chave "id" usada no roteiro. */
  readonly scenes: Readonly<Record<string, React.FC<SceneProps>>>;
};

/**
 * Monta um vídeo narrado: cada cena dura o que a narração dela dura, as frases
 * tocam em sequência e a trilha cede espaço à fala.
 */
export const NarratedVideo: React.FC<Props> = ({
  narration,
  music,
  silent = false,
  scenes,
}) => {
  const { fps } = useVideoConfig();
  const timeline = useMemo(
    () => (narration ? buildTimeline(narration, fps) : null),
    [narration, fps],
  );
  if (!narration || !timeline) {
    throw new Error(
      "O vídeo foi montado sem narração: falta o calculateMetadata na composição.",
    );
  }

  return (
    <SoundContext.Provider value={!silent}>
      <Series>
        {timeline.scenes.map((scene) => {
          const Scene = scenes[scene.id];
          if (!Scene) {
            throw new Error(
              `A cena "${scene.id}" está no roteiro, mas não tem componente.`,
            );
          }
          return (
            <Series.Sequence
              key={scene.id}
              name={scene.id}
              durationInFrames={scene.durationInFrames}
              premountFor={fps}
            >
              <Scene scene={scene} />
              {silent
                ? null
                : scene.sentences.map((sentence) => (
                    <Audio
                      key={sentence.file}
                      name="Narração"
                      src={staticFile(sentence.file)}
                      from={sentence.from}
                      premountFor={fps}
                    />
                  ))}
            </Series.Sequence>
          );
        })}
      </Series>
      {music && !silent ? (
        <MusicBed
          track={music}
          voiceLufs={narration.loudnessLufs}
          speech={timeline.speech}
        />
      ) : null}
    </SoundContext.Provider>
  );
};
