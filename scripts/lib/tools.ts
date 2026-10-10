import { spawn } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

/** O ambiente em que toda ferramenta Python do projeto roda. */
export const PYTHON_ENV = {
  PYTHONUTF8: "1",
  // As bibliotecas dos modelos enchem o terminal de barras de progresso e avisos de depreciação.
  TQDM_DISABLE: "1",
  PYTHONWARNINGS: "ignore",
  HF_HUB_DISABLE_SYMLINKS_WARNING: "1",
};

/** Roda um comando com o progresso dele visível e devolve o que ele escreveu no stdout. */
export const run = (
  command: string,
  args: readonly string[],
  env: NodeJS.ProcessEnv = {},
): Promise<string> =>
  new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      env: { ...process.env, ...env },
      stdio: ["ignore", "pipe", "inherit"],
    });
    let stdout = "";
    child.stdout.setEncoding("utf8").on("data", (chunk: string) => {
      stdout += chunk;
    });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) {
        resolve(stdout);
      } else {
        reject(
          new Error(
            `"${command} ${args.join(" ")}" terminou com código ${code}.`,
          ),
        );
      }
    });
  });

/**
 * Renderiza quadros avulsos de uma composição como PNG numa pasta, que é
 * esvaziada antes.
 */
export const renderFrames = async (
  composition: string,
  frames: readonly number[],
  output: string,
): Promise<void> => {
  rmSync(output, { recursive: true, force: true });
  await run(
    process.execPath,
    [
      "node_modules/@remotion/cli/remotion-cli.js",
      "render",
      composition,
      output,
      `--frames=${frames.join(",")}`,
      "--image-format=png",
      // Sem áudio na composição: é ele que quebra o render de quadros avulsos.
      `--props=${JSON.stringify({ silent: true })}`,
    ],
  );
};

/**
 * Roda uma ferramenta Python num ambiente do uv. A ferramenta recebe um
 * arquivo JSON com o trabalho e responde com linhas JSON no stdout.
 */
export const runPythonTool = async <Result>(
  project: string,
  script: string,
  job: unknown,
  env: NodeJS.ProcessEnv = {},
): Promise<Result[]> => {
  const folder = mkdtempSync(path.join(tmpdir(), "projeto-b-"));
  try {
    const jobFile = path.join(folder, "job.json");
    writeFileSync(jobFile, JSON.stringify(job));
    const stdout = await run(
      "uv",
      ["run", "--project", project, "python", script, jobFile],
      {
        ...PYTHON_ENV,
        ...env,
      },
    );
    return stdout
      .split(/\r?\n/)
      .filter((line) => line.startsWith("{"))
      .map((line) => JSON.parse(line) as Result);
  } finally {
    rmSync(folder, { recursive: true, force: true });
  }
};
