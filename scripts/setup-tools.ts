// Instala as ferramentas de IA locais (voz e trilha): pnpm setup:tools
//
// Pode ser repetido à vontade: cada passo confere se já foi feito. Precisa de
// git, uv e de uma GPU NVIDIA. Baixa cerca de 20 GB na primeira vez; os modelos
// de voz e de transcrição (mais uns 5 GB) descem no primeiro `pnpm narrate`.

import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { run } from "./lib/tools";
import { exitWithError } from "./lib/videos";

// Código de terceiros fica fora do repositório, preso a um commit exato, para
// uma atualização deles nunca mudar a voz ou a trilha sem ninguém decidir.
const VENDORS = [
  {
    folder: "vendor/ace-step",
    repository: "https://github.com/ace-step/ACE-Step-1.5.git",
    commit: "ca1e85fe9430179831e6bc6be790c332190a3866",
  },
] as const;

const PYTHON_PROJECTS = ["tools/narration", "vendor/ace-step"];

const ACE_STEP = "vendor/ace-step";
// O modelo de linguagem que cabe em 8 GB de VRAM não vem no pacote principal.
const ACE_STEP_EXTRA_MODEL = "acestep-5Hz-lm-0.6B";

// Voz de teste, do demo do Chatterbox em pt-BR. Serve para verificar o pipeline, não para publicar.
const PLACEHOLDER_VOICE = {
  file: "voice/placeholder.wav",
  url: "https://storage.googleapis.com/chatterbox-demo-samples/mtl-v3-single-language-prompts/pt-br/pt_br_f2.wav",
};

const step = (title: string) => console.log(`\n== ${title}`);

const checkout = async ({
  folder,
  repository,
  commit,
}: (typeof VENDORS)[number]) => {
  const git = (...args: string[]) =>
    run("git", ["-C", folder, ...args], { GIT_LFS_SKIP_SMUDGE: "1" });

  if (!existsSync(folder)) {
    mkdirSync(folder, { recursive: true });
    await git("init", "-q");
    await git("remote", "add", "origin", repository);
  }
  const head = await git("rev-parse", "--verify", "-q", "HEAD").catch(() => "");
  if (head.trim() === commit) {
    console.log(`${folder} já está em ${commit.slice(0, 7)}.`);
    return;
  }
  await git("fetch", "-q", "--depth", "1", "origin", commit);
  await git("checkout", "-q", "FETCH_HEAD");
  console.log(`${folder} em ${commit.slice(0, 7)}.`);
};

const downloadPlaceholderVoice = async () => {
  if (existsSync(PLACEHOLDER_VOICE.file)) {
    console.log(`${PLACEHOLDER_VOICE.file} já existe.`);
    return;
  }
  const response = await fetch(PLACEHOLDER_VOICE.url);
  if (!response.ok) {
    throw new Error(
      `Não foi possível baixar a voz provisória (HTTP ${response.status}).`,
    );
  }
  mkdirSync(path.dirname(PLACEHOLDER_VOICE.file), { recursive: true });
  writeFileSync(
    PLACEHOLDER_VOICE.file,
    Buffer.from(await response.arrayBuffer()),
  );
  console.log(`${PLACEHOLDER_VOICE.file} baixada.`);
};

const main = async () => {
  step("Código das ferramentas");
  for (const vendor of VENDORS) {
    await checkout(vendor);
  }

  step("Ambientes Python");
  for (const project of PYTHON_PROJECTS) {
    await run("uv", ["sync", "--project", project]);
  }

  step("Modelos do ACE-Step");
  const aceStepEnv = {
    ACESTEP_PROJECT_ROOT: path.resolve(ACE_STEP),
    PYTHONUTF8: "1",
  };
  const download = (...args: string[]) =>
    run(
      "uv",
      ["run", "--project", ACE_STEP, "acestep-download", ...args],
      aceStepEnv,
    );
  console.log((await download()).trim());
  console.log((await download("--model", ACE_STEP_EXTRA_MODEL)).trim());

  step("Voz provisória");
  await downloadPlaceholderVoice();

  console.log("\nFerramentas prontas.");
};

main().catch(exitWithError);
