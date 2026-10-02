import { staticFile, type CalculateMetadataFunction } from "remotion";
import { FPS } from "../format";
import {
  musicTrackFile,
  narrationManifestFile,
  type MusicTrack,
} from "../media";
import {
  assertManifestMatchesScript,
  type NarrationManifest,
} from "../narration/manifest";
import type { Script } from "../narration/script";
import { buildTimeline } from "../narration/timeline";
import type { NarratedVideoProps } from "./NarratedVideo";

/**
 * Lê a narração e a trilha geradas para o vídeo e dá à composição a duração
 * que o áudio pede. O "slug" é o nome da pasta do vídeo e o id da composição.
 */
export const narratedVideoMetadata =
  (
    slug: string,
    script: Script,
  ): CalculateMetadataFunction<NarratedVideoProps> =>
  async ({ props, abortSignal }) => {
    const manifest = await fetch(staticFile(narrationManifestFile(slug)), {
      signal: abortSignal,
    });
    if (!manifest.ok) {
      throw new Error(
        `"${slug}" ainda não tem narração. Rode: pnpm narrate ${slug}`,
      );
    }
    const narration = (await manifest.json()) as NarrationManifest;
    assertManifestMatchesScript(script, narration, slug);

    // A trilha é opcional: o vídeo pode ser montado e revisado antes de ela existir.
    const track = await fetch(staticFile(musicTrackFile(slug)), {
      signal: abortSignal,
    });
    const music = track.ok ? ((await track.json()) as MusicTrack) : null;

    return {
      durationInFrames: buildTimeline(narration, FPS).durationInFrames,
      props: { ...props, narration, music },
    };
  };
