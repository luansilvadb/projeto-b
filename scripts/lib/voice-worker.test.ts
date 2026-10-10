import { spawn } from "node:child_process";
import { EventEmitter } from "node:events";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { PassThrough } from "node:stream";
import { setImmediate } from "node:timers/promises";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { startVoiceWorker, type VoiceWorker } from "./voice-worker";

vi.mock("node:child_process", () => ({ spawn: vi.fn() }));

const simulateProcess = () => Object.assign(new EventEmitter(), {
  stdin: { write: vi.fn() },
  stdout: new PassThrough(),
  kill: vi.fn(),
});

let child: ReturnType<typeof simulateProcess>;
let worker: VoiceWorker;
let jobFile: string;

beforeEach(() => {
  child = simulateProcess();
  child.kill.mockImplementation(() => {
    child.stdout.end();
    child.emit("close", null);
  });
  vi.mocked(spawn).mockImplementation((_command, args) => {
    jobFile = (args as string[]).at(-1)!;
    return child as unknown as ReturnType<typeof spawn>;
  });
  worker = startVoiceWorker({ model: "simulado" });
});

afterEach(() => {
  worker.stop();
  child.stdout.destroy();
  vi.mocked(spawn).mockReset();
});

const reply = (message: unknown) => {
  child.stdout.write(`${JSON.stringify(message)}\n`);
};

const take = (seed: number) => ({
  seed,
  durationMs: 900,
  cutOff: false,
  pitchOffset: null,
  ending: -1.5,
  words: [{ text: "Olá", startMs: 0, endMs: 900 }],
});

it("espera ready e serializa pedidos concorrentes até done, preservando as tomadas", async () => {
  const firstTakes = [
    { seed: 8, output: "first-8.wav" },
    { seed: 3, output: "first-3.wav" },
  ];
  const secondTakes = [{ seed: 9, output: "second.wav" }];
  const first = worker.generate("Primeira frase.", firstTakes);
  const second = worker.generate("Segunda frase.", secondTakes);
  const finished = vi.fn();
  void first.then(finished);

  await setImmediate();
  expect(child.stdin.write).not.toHaveBeenCalled();
  expect(JSON.parse(readFileSync(jobFile, "utf8"))).toEqual({ model: "simulado" });

  reply({ ready: true });
  await worker.ready;
  expect(child.stdin.write.mock.calls).toEqual([
    [`${JSON.stringify({ text: "Primeira frase.", takes: firstTakes })}\n`],
  ]);

  child.stdout.write("Gerando tomadas…\n");
  reply(take(8));
  reply({ ...take(3), cutOff: true, pitchOffset: 0.5, ending: null });
  await setImmediate();
  expect(finished).not.toHaveBeenCalled();
  expect(child.stdin.write).toHaveBeenCalledTimes(1);

  reply({ done: true });
  await expect(first).resolves.toEqual([
    take(8),
    { ...take(3), cutOff: true, pitchOffset: 0.5, ending: null },
  ]);
  expect(child.stdin.write).toHaveBeenCalledTimes(2);
  expect(child.stdin.write).toHaveBeenLastCalledWith(
    `${JSON.stringify({ text: "Segunda frase.", takes: secondTakes })}\n`,
  );

  reply(take(9));
  reply({ done: true });
  await expect(second).resolves.toEqual([take(9)]);
});

it("rejeita só o pedido com erro e libera o seguinte sem misturar tomadas", async () => {
  reply({ ready: true });
  await worker.ready;
  const failed = worker.generate("Falha.", [{ seed: 1, output: "failed.wav" }]);
  const rejection = expect(failed).rejects.toThrow("Falha simulada");
  const next = worker.generate("Continua.", [{ seed: 2, output: "next.wav" }]);
  await setImmediate();
  expect(child.stdin.write).toHaveBeenCalledTimes(1);

  reply(take(1));
  reply({ done: true, error: "Falha simulada" });
  await rejection;
  expect(child.stdin.write).toHaveBeenCalledTimes(2);

  reply(take(2));
  reply({ done: true });
  await expect(next).resolves.toEqual([take(2)]);
});

it("rejeita o pedido ativo e remove o job se o processo encerrar inesperadamente", async () => {
  reply({ ready: true });
  await worker.ready;
  const pending = worker.generate("Interrompida.", [{ seed: 1, output: "lost.wav" }]);
  const rejection = expect(pending).rejects.toThrow("O processo de voz terminou com código 7.");
  await setImmediate();
  expect(child.stdin.write).toHaveBeenCalledTimes(1);
  reply(take(1));

  child.stdout.end();
  child.emit("close", 7);
  await rejection;
  expect(existsSync(path.dirname(jobFile))).toBe(false);
});

it("rejeita ready e o pedido aguardando inicialização se o processo encerrar", async () => {
  const startup = expect(worker.ready).rejects.toThrow("código 2");
  const pending = expect(worker.generate("Espera.", [])).rejects.toThrow("código 2");
  child.stdout.end();
  child.emit("close", 2);

  await Promise.all([startup, pending]);
  expect(child.stdin.write).not.toHaveBeenCalled();
  expect(existsSync(path.dirname(jobFile))).toBe(false);
});

it("stop encerra o processo e close remove a pasta temporária", async () => {
  reply({ ready: true });
  await worker.ready;
  expect(existsSync(jobFile)).toBe(true);

  worker.stop();
  expect(child.kill).toHaveBeenCalledTimes(1);
  expect(existsSync(path.dirname(jobFile))).toBe(false);
});
