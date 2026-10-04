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
import { OneStage } from "../components/Camera";
import type { MusicTrack } from "../media";
import type { NarrationManifest } from "../narration/manifest";
import type { Script } from "../narration/script";
import {
  buildTimeline,
  shotRanges,
  type FrameRange,
  type SceneTimeline,
} from "../narration/timeline";

import { ShotPlans } from "./Shot";
import { JOIN_FRAMES, planShots } from "./stage";

export type SceneProps = {
  /** Tempos da cena: duração e o quadro em que cada palavra é falada. */
  readonly scene: SceneTimeline;
  /** Trecho da cena, em quadros, que cada plano do roteiro ocupa. */
  readonly shots: readonly FrameRange[];
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
  /** O roteiro do vídeo: é dele que saem os planos de cada cena. */
  readonly script: Script;
  /** Componente de cada cena, pela mesma chave "id" usada no roteiro. */
  readonly scenes: Readonly<Record<string, React.FC<SceneProps>>>;
  /**
   * Os planos que dividem o palco com o anterior, em vez de entrar por corte:
   * por cena ("id" do roteiro), os números dos planos. O plano 0 divide o
   * palco com o último plano da cena anterior. Só vale para planos escritos
   * para isso: é o plano que tira os elementos dele e põe os novos.
   */
  readonly joined?: Readonly<Record<string, readonly number[]>>;
  /**
   * O cenário de cada plano, por cena: um nome qualquer, igual para os planos
   * que se passam no mesmo lugar. Dois planos seguidos com o mesmo cenário
   * dividem o palco sem desmontá-lo: ele fica, a câmera e a luz continuam de
   * onde estavam, e só troca o que está nele. Sem nome, o plano tem um fundo
   * liso, que nunca é "o mesmo cenário".
   */
  readonly sets?: Readonly<Record<string, readonly (string | null)[]>>;
};

/**
 * Monta um vídeo narrado: cada cena dura o que a narração dela dura, as frases
 * tocam em sequência e a trilha cede espaço à fala.
 */
export const NarratedVideo: React.FC<Props> = ({
  narration,
  music,
  silent = false,
  script,
  scenes,
  joined,
  sets,
}) => {
  const { fps } = useVideoConfig();
  const timeline = useMemo(
    () => (narration ? buildTimeline(narration, fps) : null),
    [narration, fps],
  );
  // Os trechos de cada plano, cena por cena, e quais deles dividem o palco com a cena vizinha.
  const staged = useMemo(() => {
    if (!timeline) {
      return null;
    }
    const ranges = timeline.scenes.map((scene) => {
      const inScript = script.scenes.find(({ id }) => id === scene.id);
      if (!inScript) {
        throw new Error(
          `A cena "${scene.id}" está na narração, mas não no roteiro.`,
        );
      }
      return shotRanges(scene, inScript.shots);
    });
    const plans = planShots(
      timeline.scenes.map(({ id }) => id),
      ranges,
      joined,
      sets,
    );
    return { plans, ranges };
  }, [timeline, script, joined, sets]);
  if (!narration || !timeline || !staged) {
    throw new Error(
      "O vídeo foi montado sem narração: falta o calculateMetadata na composição.",
    );
  }

  return (
    <SoundContext.Provider value={!silent}>
      <ShotPlans.Provider value={staged.plans}>
        <OneStage>
          <Series>
            {timeline.scenes.map((scene, index) => {
              const Scene = scenes[scene.id];
              if (!Scene) {
                throw new Error(
                  `A cena "${scene.id}" está no roteiro, mas não tem componente.`,
                );
              }
              const shots = staged.ranges[index];
              // Quando duas cenas dividem o palco, a anterior continua desenhada
              // por baixo da nova durante esses quadros: as duas se sobrepõem,
              // sem mudar o instante em que cada uma começa.
              const before = staged.plans.get(shots[0])?.joinsPrevious
                ? JOIN_FRAMES
                : 0;
              const after = staged.plans.get(shots[shots.length - 1])?.joinsNext
                ? JOIN_FRAMES
                : 0;
              return (
                <Series.Sequence
                  key={scene.id}
                  name={scene.id}
                  offset={index === 0 ? 0 : -before}
                  durationInFrames={scene.durationInFrames + after}
                  premountFor={fps}
                >
                  <Scene scene={scene} shots={shots} />
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
        </OneStage>
      </ShotPlans.Provider>
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
