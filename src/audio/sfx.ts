import type { Script, SfxSpec } from "../narration/script";
import {
  cueFrame,
  shotRanges,
  type SceneTimeline,
} from "../narration/timeline";

/**
 * Efeitos sonoros do canal, nomeados pelo uso, para a mesma porta soar igual
 * em todo vídeo. Os arquivos vêm do Freesound (CC0), baixados com `pnpm sfx`
 * para public/sfx/freesound/; o número no nome é o id do som em
 * freesound.org/s/<id>/.
 *
 * `peakLufs` é o pico do volume momentâneo do arquivo (o maior valor M do
 * ebur128 do ffmpeg, que o `pnpm sfx <id>` imprime ao baixar): é contra ele
 * que o efeito é posto à distância certa da voz, porque cada som do
 * Freesound chega com um volume.
 */
export const SFX = {
  waterJet: { file: "sfx/freesound/411810.ogg", peakLufs: -22.3 },
  stamp: { file: "sfx/freesound/362624.ogg", peakLufs: -20.7 },
  paperFold: { file: "sfx/freesound/68222.ogg", peakLufs: -38.8 },
  alarmClock: { file: "sfx/freesound/180737.ogg", peakLufs: -32.9 },
  scissors: { file: "sfx/freesound/352504.ogg", peakLufs: -25.9 },
  bodyFall: { file: "sfx/freesound/346692.ogg", peakLufs: -20.5 },
  bedFall: { file: "sfx/freesound/138274.ogg", peakLufs: -31.7 },
  softLanding: { file: "sfx/freesound/653910.ogg", peakLufs: -16.4 },
  boxDrop: { file: "sfx/freesound/346169.ogg", peakLufs: -17.5 },
  headTap: { file: "sfx/freesound/434146.ogg", peakLufs: -15.5 },
  coinDrop: { file: "sfx/freesound/510731.ogg", peakLufs: -28.5 },
  shutterDown: { file: "sfx/freesound/325585.ogg", peakLufs: -24.2 },
  whoosh: { file: "sfx/freesound/60011.ogg", peakLufs: -19.2 },
  splash: { file: "sfx/freesound/398032.ogg", peakLufs: -17.1 },
} as const satisfies Record<string, { file: string; peakLufs: number }>;

export type SfxName = keyof typeof SFX;

/**
 * Quantos dB abaixo da voz fica o pico de um efeito. Nos 12 vídeos de
 * referência (estudo de som de 2026-10-05), o efeito que se ouve tem o pico
 * de 11,5 a 14,7 dB abaixo da voz, com mediana de 13,4.
 */
export const SFX_LEVELS = { forte: 9, normal: 13, leve: 17 } as const;

export type SfxLevel = keyof typeof SFX_LEVELS;

/** Um efeito pronto para tocar: o arquivo, o quadro do vídeo e o volume. */
type SfxEvent = {
  readonly name: SfxName;
  readonly file: string;
  readonly frame: number;
  readonly volume: number;
};

/**
 * Os efeitos do roteiro, em quadros do vídeo. Falha se a palavra de deixa não
 * está na cena: o roteiro mudou e o efeito ficou para trás.
 */
export const sfxEvents = (
  effects: readonly SfxSpec[],
  timeline: readonly SceneTimeline[],
  scenes: Script["scenes"],
  voiceLufs: number,
  fps: number,
): SfxEvent[] =>
  effects.map((effect) => {
    const scene = timeline.find(({ id }) => id === effect.scene);
    const inScript = scenes.find(({ id }) => id === effect.scene);
    if (!scene || !inScript) {
      throw new Error(
        `O efeito "${effect.name}" toca na cena "${effect.scene}", que não está na narração.`,
      );
    }
    const anchor = effect.cue
      ? cueFrame(scene, effect.cue, effect.occurrence)
      : effect.shot
        ? shotRanges(scene, inScript.shots)[effect.shot - 1][
            effect.at === "end" ? "to" : "from"
          ]
        : effect.at === "end"
          ? scene.durationInFrames
          : 0;
    const offset = Math.round(((effect.offsetMs ?? 0) / 1000) * fps);
    const { file, peakLufs } = SFX[effect.name];
    const below = SFX_LEVELS[effect.level ?? "normal"];
    return {
      name: effect.name,
      file,
      frame: Math.max(0, scene.from + anchor + offset),
      // Nunca amplifica: um som gravado baixo demais fica como está.
      volume: Math.min(1, 10 ** ((voiceLufs - below - peakLufs) / 20)),
    };
  });
