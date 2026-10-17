import { readdir, readFile, mkdir, writeFile, unlink } from "node:fs/promises";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

type Agent = {
  fileName: string;
  source: string;
  name: string;
  description: string;
  instructions: string;
};

type Output = { directory: string; fileName: string; content: string };

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const sourceDirectory = join(root, ".agents", "agents");
const claudeDirectory = join(root, ".claude", "agents");
const codexDirectory = join(root, ".codex", "agents");

function fail(message: string): never {
  throw new Error(message);
}

function yamlString(value: string, fileName: string, field: string): string {
  const scalar = value.trim();
  if (!scalar) return fail(fileName + ": metadado " + field + " vazio");

  if (scalar.startsWith('"')) {
    try {
      const parsed: unknown = JSON.parse(scalar);
      if (typeof parsed === "string") return parsed;
    } catch {
      // Report the same clear metadata error for invalid YAML/JSON quoting.
    }
    return fail(fileName + ": metadado " + field + " tem aspas duplas malformadas");
  }

  if (scalar.startsWith("'")) {
    if (!scalar.endsWith("'")) return fail(fileName + ": metadado " + field + " tem aspas simples malformadas");
    const inner = scalar.slice(1, -1);
    if (inner.replace(/''/g, "").includes("'")) {
      return fail(fileName + ": metadado " + field + " tem aspas simples malformadas");
    }
    return inner.replace(/''/g, "'");
  }

  return scalar.replace(/[ \t]+#.*$/, "").trim();
}

function parseAgent(source: string, fileName: string): Agent {
  const frontmatter = /^---[ \t]*\r?\n([\s\S]*?)^---[ \t]*(?:\r?\n|$)/m.exec(source);
  if (!frontmatter || frontmatter.index !== 0) {
    return fail(fileName + ": frontmatter ausente ou sem delimitador de fechamento");
  }

  const fields = new Map<string, string>();
  for (const line of frontmatter[1].split(/\r?\n/)) {
    const match = /^([A-Za-z][A-Za-z0-9_-]*):(?:[ \t]*(.*))?$/.exec(line);
    if (!match) {
      if (/^\s*(?:name|description)\b/.test(line)) {
        return fail(fileName + ": linha de metadado malformada: " + line);
      }
      continue;
    }
    if (match[1] !== "name" && match[1] !== "description") continue;
    if (fields.has(match[1])) return fail(fileName + ": metadado " + match[1] + " repetido");
    fields.set(match[1], yamlString(match[2] ?? "", fileName, match[1]));
  }

  const name = fields.get("name");
  const description = fields.get("description");
  if (!name) return fail(fileName + ": metadado name ausente ou vazio");
  if (!description?.trim()) return fail(fileName + ": metadado description ausente ou vazio");
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(name)) {
    return fail(fileName + ": name inválido; use letras minúsculas, números e hífens");
  }
  if (name !== basename(fileName, ".md")) {
    return fail(fileName + ": name precisa corresponder ao nome do arquivo " + basename(fileName, ".md"));
  }
  if (/[\r\n]/.test(description)) return fail(fileName + ": description deve ser uma única linha");

  const instructions = source.slice(frontmatter[0].length);
  if (!instructions.trim()) return fail(fileName + ": corpo Markdown vazio após o frontmatter");
  return { fileName, source, name, description, instructions };
}

function tomlString(value: string, multiline = false): string {
  const text = multiline ? value.replace(/\r\n?/g, "\n") : value;
  if (!multiline && /[\r\n]/.test(text)) return fail("string TOML de metadados não pode conter quebras de linha");
  if (/[\u0000-\u0007\u000B\u000E-\u001F\u007F-\u009F]/u.test(text)) {
    return fail("string TOML contém caractere de controle não permitido");
  }
  const escaped = text
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/\t/g, "\\t")
    .replace(/\u0008/g, "\\b")
    .replace(/\f/g, "\\f");
  return multiline ? '"""\n' + escaped + '"""' : '"' + escaped + '"';
}

function codexToml(agent: Agent): string {
  return [
    "name = " + tomlString(agent.name),
    "description = " + tomlString(agent.description),
    "",
    "developer_instructions = " + tomlString(agent.instructions, true),
    "",
  ].join("\n");
}

async function directoryEntries(directory: string) {
  try {
    return await readdir(directory, { withFileTypes: true });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }
}

async function check(outputs: Output[]): Promise<void> {
  const problems: string[] = [];
  for (const directory of [claudeDirectory, codexDirectory]) {
    const expected = new Map(outputs.filter((item) => item.directory === directory).map((item) => [item.fileName, item.content]));
    const actual = await directoryEntries(directory);
    for (const [fileName, content] of expected) {
      const entry = actual.find((item) => item.name === fileName);
      if (!entry) problems.push(join(directory, fileName) + ": ausente");
      else if (!entry.isFile()) problems.push(join(directory, fileName) + ": não é arquivo");
      else if ((await readFile(join(directory, fileName), "utf8")) !== content) {
        problems.push(join(directory, fileName) + ": desatualizado");
      }
    }
    for (const entry of actual) {
      if (!expected.has(entry.name)) problems.push(join(directory, entry.name) + ": saída inesperada");
    }
  }

  if (problems.length) {
    return fail("Saídas de agentes fora de sincronia:\n- " + problems.join("\n- ") + "\nExecute pnpm agents:sync.");
  }
}

async function sync(outputs: Output[]): Promise<void> {
  for (const directory of [claudeDirectory, codexDirectory]) {
    await mkdir(directory, { recursive: true });
    const expected = new Set(outputs.filter((item) => item.directory === directory).map((item) => item.fileName));
    for (const entry of await directoryEntries(directory)) {
      if (expected.has(entry.name)) continue;
      if (!entry.isFile()) return fail(directory + ": saída inesperada que não é arquivo: " + entry.name);
      await unlink(join(directory, entry.name));
    }
  }
  for (const output of outputs) {
    await writeFile(join(output.directory, output.fileName), output.content, "utf8");
  }
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  if (args.length > 1 || (args.length === 1 && args[0] !== "--check")) {
    return fail("Uso: tsx scripts/sync-agents.ts [--check]");
  }

  const sourceFiles = (await readdir(sourceDirectory, { withFileTypes: true }))
    .filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
    .map((entry) => entry.name)
    .sort();
  if (!sourceFiles.length) return fail(sourceDirectory + ": nenhum Markdown canônico encontrado");

  const agents: Agent[] = [];
  const names = new Set<string>();
  for (const fileName of sourceFiles) {
    const agent = parseAgent(await readFile(join(sourceDirectory, fileName), "utf8"), fileName);
    if (names.has(agent.name)) return fail(fileName + ": name duplicado: " + agent.name);
    names.add(agent.name);
    agents.push(agent);
  }

  const outputs = agents.flatMap((agent) => [
    { directory: claudeDirectory, fileName: agent.fileName, content: agent.source },
    { directory: codexDirectory, fileName: agent.name + ".toml", content: codexToml(agent) },
  ]);

  if (args[0] === "--check") {
    await check(outputs);
    process.stdout.write("Agentes sincronizados: " + agents.length + " Claude Markdown, " + agents.length + " Codex TOML.\n");
  } else {
    await sync(outputs);
    process.stdout.write("Sincronizados " + agents.length + " agentes para Claude e Codex.\n");
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
