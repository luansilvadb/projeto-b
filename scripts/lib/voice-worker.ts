// O processo Python que mantém o modelo de voz e o Whisper carregados
// (tools/narration/voice_worker.py). A narração e o estúdio de voz pedem
// tomadas a ele, uma frase por vez.

import { spawn } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { createInterface } from "node:readline";
import type { TimedWord } from "../../src/narration/alignment";
import { PYTHON_ENV } from "./tools";
import { NARRATION_TOOLS } from "./voice";

/** Uma tomada como o processo a devolve: gerada, medida e transcrita. */
export type GeneratedTake = {
  readonly seed: number;
  readonly durationMs: number;
  readonly cutOff: boolean;
  readonly pitchOffset: number | null;
  readonly ending: number | null;
  readonly words: readonly TimedWord[];
};

type WorkerLine =
  | { readonly ready: true }
  | ({ readonly id: number } & GeneratedTake)
  | { readonly id: number; readonly done: true; readonly error?: string };

export type VoiceWorker = {
  /** Resolve quando os modelos terminam de carregar. */
  readonly ready: Promise<void>;
  /** Gera a frase uma vez por semente, gravando cada tomada no arquivo pedido. */
  readonly generate: (
    text: string,
    takes: readonly { readonly seed: number; readonly output: string }[],
  ) => Promise<GeneratedTake[]>;
  readonly stop: () => void;
};

/** Liga o processo com os modelos. `job` leva o modelo e a amostra de voz. */
export const startVoiceWorker = (job: unknown): VoiceWorker => {
  const folder = mkdtempSync(path.join(tmpdir(), "projeto-b-voice-"));
  const jobFile = path.join(folder, "job.json");
  writeFileSync(jobFile, JSON.stringify(job));
  const child = spawn(
    "uv",
    [
      "run",
      "--project",
      NARRATION_TOOLS,
      "python",
      `${NARRATION_TOOLS}/voice_worker.py`,
      jobFile,
    ],
    {
      env: { ...process.env, ...PYTHON_ENV },
      stdio: ["pipe", "pipe", "inherit"],
    },
  );

  let nextId = 1;
  let stopped = false;
  let markReady: () => void = () => undefined;
  let failStart: (error: Error) => void = () => undefined;
  const ready = new Promise<void>((resolve, reject) => {
    markReady = resolve;
    failStart = reject;
  });
  const waiting = new Map<
    number,
    {
      readonly takes: GeneratedTake[];
      readonly resolve: (takes: GeneratedTake[]) => void;
      readonly reject: (error: Error) => void;
    }
  >();

  createInterface({ input: child.stdout }).on("line", (line) => {
    if (!line.startsWith("{")) {
      return;
    }
    const message = JSON.parse(line) as WorkerLine;
    if ("ready" in message) {
      markReady();
      return;
    }
    const request = waiting.get(message.id);
    if (!request) {
      return;
    }
    if ("done" in message) {
      waiting.delete(message.id);
      if (message.error) {
        request.reject(new Error(message.error));
      } else {
        request.resolve(request.takes);
      }
      return;
    }
    request.takes.push({
      seed: message.seed,
      durationMs: message.durationMs,
      cutOff: message.cutOff,
      pitchOffset: message.pitchOffset,
      ending: message.ending,
      words: message.words,
    });
  });
  child.on("close", (code) => {
    rmSync(folder, { recursive: true, force: true });
    if (stopped) {
      return;
    }
    const error = new Error(`O processo de voz terminou com código ${code}.`);
    failStart(error);
    for (const request of waiting.values()) {
      request.reject(error);
    }
    waiting.clear();
  });

  // Um pedido só começa quando o anterior termina: a placa de vídeo é uma.
  let queue: Promise<unknown> = ready;
  const generate: VoiceWorker["generate"] = (text, takes) => {
    const run = queue.then(
      () =>
        new Promise<GeneratedTake[]>((resolve, reject) => {
          const id = nextId++;
          waiting.set(id, { takes: [], resolve, reject });
          child.stdin.write(`${JSON.stringify({ id, text, takes })}\n`);
        }),
    );
    queue = run.catch(() => undefined);
    return run;
  };

  return {
    ready,
    generate,
    stop: () => {
      stopped = true;
      child.kill();
    },
  };
};
