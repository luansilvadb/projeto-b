import { Audio } from "@remotion/media";
import { useMemo } from "react";
import {
  Sequence,
  Series,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { MUSIC_MIX, duckedVolume, gainBelowVoice } from "../audio/ducking";
import {
  MUSIC_PARTS,
  featureAmount,
  holdRanges,
  levelChanges,
  levelDb,
  musicParts,
  partEnvelopes,
  partGain,
  silenceGain,
  silenceRanges,
} from "../audio/parts";
import { sfxEvents } from "../audio/sfx";
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
import { clamp } from "../components/timing";

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
  /** Os silêncios do roteiro, em que a trilha sobe ao primeiro plano. */
  readonly holds: readonly FrameRange[];
  /** Os trechos em que o roteiro tira a trilha. */
  readonly silences: readonly FrameRange[];
  /** Onde o roteiro muda o nível da trilha sob a fala. */
  readonly levels: ReturnType<typeof levelChanges>;
};

const MusicBed: React.FC<MusicBedProps> = ({
  track,
  voiceLufs,
  speech,
  holds,
  silences,
  levels,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const parts = musicParts(track);
  const envelopes = partEnvelopes(parts, silences, fps);
  const rampFrames = MUSIC_MIX.rampSeconds * fps;
  const featured = featureAmount(frame, holds, rampFrames);
  const audible = silenceGain(
    frame,
    silences,
    MUSIC_PARTS.silenceRampSeconds * fps,
  );
  const fadeOut = interpolate(
    frame,
    [durationInFrames - MUSIC_MIX.fadeOutSeconds * fps, durationInFrames],
    [1, 0],
    clamp,
  );

  // Uma faixa por parte da trilha, cada uma no instante dela. O volume de cada
  // uma é medido contra a voz em separado: assim todas ficam à mesma distância
  // da fala e a troca de faixa não muda de volume.
  return parts.map((part, index) => {
    const below = (db: number) =>
      gainBelowVoice(voiceLufs, part.loudnessLufs, db);
    // O nível sob a fala é o do trecho no roteiro, e a trilha só vai ao
    // primeiro plano nos silêncios que o roteiro pediu: uma pausa entre duas
    // frases não a abre.
    const under = below(
      levelDb(frame, levels, MUSIC_MIX.levelRampSeconds * fps),
    );
    const ducked = duckedVolume(frame, speech, {
      full: under + (below(MUSIC_MIX.featuredDb) - under) * featured,
      ducked: under,
      rampFrames,
    });
    const envelope = envelopes[index];
    // A faixa só fica montada enquanto se ouve: até acabar de sair.
    const length =
      envelope.out === undefined
        ? durationInFrames - envelope.from
        : envelope.out + envelope.fadeOut - envelope.from;
    return (
      <Sequence
        key={part.file}
        name={parts.length > 1 ? `Trilha ${index + 1}` : "Trilha"}
        from={envelope.from}
        durationInFrames={Math.max(length, 1)}
        layout="none"
        hidden
      >
        <Audio
          src={staticFile(part.file)}
          volume={ducked * partGain(frame, envelope) * audible * fadeOut}
          premountFor={fps}
        />
      </Sequence>
    );
  });
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
  const effects = silent
    ? []
    : sfxEvents(
        script.sfx ?? [],
        timeline.scenes,
        script.scenes,
        narration.loudnessLufs,
        fps,
      );

  return (
    <>
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
          holds={holdRanges(timeline.scenes, MUSIC_MIX.featureMinSeconds * fps)}
          silences={silenceRanges(timeline.scenes, script.music)}
          levels={levelChanges(timeline.scenes, script.music)}
        />
      ) : null}
      {effects.map((effect, index) => (
        <Audio
          key={`${effect.name}-${index}`}
          name={`Efeito: ${effect.name}`}
          src={staticFile(effect.file)}
          from={effect.frame}
          volume={effect.volume}
          premountFor={fps}
        />
      ))}
    </>
  );
};
