import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { expect, it } from "vitest";
import { measurePeakLoudness } from "./loudness";

it("mede um efeito menor que a janela momentânea de 400 ms", async () => {
  const folder = mkdtempSync(path.join(tmpdir(), "sfx-loudness-"));
  try {
    const file = path.join(folder, "short.wav");
    execFileSync("ffmpeg", [
      "-v",
      "error",
      "-f",
      "lavfi",
      "-i",
      "sine=frequency=1000:duration=0.2",
      file,
    ]);
    // O tom tem áudio a −21 dBFS; a leitura inicial de −120,7 LUFS
    // deixaria a mixagem passar o efeito sem a redução correta.
    expect(await measurePeakLoudness(file)).toBeCloseTo(-24.1, 0);
  } finally {
    rmSync(folder, { recursive: true, force: true });
  }
});
