// Busca e baixa efeitos sonoros do Freesound:
//   pnpm sfx "<busca>"   lista os candidatos, com o link para ouvir cada um
//   pnpm sfx <id>        baixa o escolhido para public/sfx/freesound/<id>.ogg
//
// Só entram sons em domínio público (CC0), para o canal não dever crédito a
// ninguém. A chave vem de FREESOUND_API_KEY no .env; veja o .env.example.

import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { exitWithError, publicPath } from "./lib/videos";

const API = "https://freesound.org/apiv2";
const FOLDER = "sfx/freesound";
const CC0_FILTER = 'license:"Creative Commons 0"';
const CC0_URL = "creativecommons.org/publicdomain/zero";
// Efeito pontual é curto; acima disso a busca devolve ambiências e músicas.
const MAX_SECONDS = 10;
const RESULTS = 15;
const USAGE = 'Uso: pnpm sfx "<busca>" para listar, pnpm sfx <id> para baixar';

type Sound = {
  readonly id: number;
  readonly name: string;
  readonly duration: number;
  readonly username: string;
  readonly license: string;
  readonly avg_rating: number;
  readonly num_downloads: number;
  readonly url: string;
  readonly previews: { readonly "preview-hq-ogg": string };
};

const FIELDS =
  "id,name,duration,username,license,avg_rating,num_downloads,url,previews";

const apiKey = (): string => {
  if (existsSync(".env")) {
    process.loadEnvFile();
  }
  const key = process.env.FREESOUND_API_KEY;
  if (!key) {
    throw new Error(
      "Falta FREESOUND_API_KEY. Copie .env.example para .env e preencha a chave.",
    );
  }
  return key;
};

const request = async <Result>(
  resource: string,
  params: Record<string, string>,
): Promise<Result> => {
  const url = `${API}/${resource}/?${new URLSearchParams(params)}`;
  const response = await fetch(url, {
    headers: { Authorization: `Token ${apiKey()}` },
  });
  if (response.status === 401) {
    throw new Error("O Freesound recusou a chave em FREESOUND_API_KEY.");
  }
  if (response.status === 404) {
    throw new Error(`O Freesound não encontrou "${resource}".`);
  }
  if (response.status === 429) {
    throw new Error(
      "Limite do Freesound atingido (60 requisições por minuto, 2000 por dia).",
    );
  }
  if (!response.ok) {
    throw new Error(`O Freesound respondeu ${response.status} para ${url}.`);
  }
  return (await response.json()) as Result;
};

const search = async (query: string) => {
  const { count, results } = await request<{
    count: number;
    results: Sound[];
  }>("search", {
    query,
    filter: `${CC0_FILTER} duration:[0 TO ${MAX_SECONDS}]`,
    fields: FIELDS,
    page_size: String(RESULTS),
  });

  if (results.length === 0) {
    console.log(
      `Nenhum som CC0 de até ${MAX_SECONDS} s para "${query}". Tente termos em inglês.`,
    );
    return;
  }

  for (const sound of results) {
    console.log(
      `${sound.id}  ${sound.duration.toFixed(1)} s  nota ${sound.avg_rating.toFixed(1)}  ${sound.num_downloads} downloads  ${sound.name} (${sound.username})\n    ${sound.url}`,
    );
  }
  console.log(
    `\n${results.length} de ${count} sons. Ouça pelo link e baixe com: pnpm sfx <id>`,
  );
};

const download = async (id: string) => {
  const sound = await request<Sound>(`sounds/${id}`, { fields: FIELDS });
  if (!sound.license.includes(CC0_URL)) {
    throw new Error(
      `"${sound.name}" não é CC0 (${sound.license}) e exigiria crédito ao autor.`,
    );
  }

  const response = await fetch(sound.previews["preview-hq-ogg"]);
  if (!response.ok) {
    throw new Error(
      `O download de "${sound.name}" falhou com ${response.status}.`,
    );
  }

  const file = `${FOLDER}/${sound.id}.ogg`;
  const output = publicPath(file);
  mkdirSync(path.dirname(output), { recursive: true });
  writeFileSync(output, Buffer.from(await response.arrayBuffer()));

  console.log(
    `Baixado: public/${file}\n` +
      `"${sound.name}", de ${sound.username}, ${sound.duration.toFixed(1)} s, CC0. ${sound.url}\n` +
      `Para usar, acrescente ao catálogo em src/audio/Sfx.tsx: "${file}"`,
  );
};

const main = async () => {
  const argument = process.argv.slice(2).join(" ").trim();
  if (!argument || argument.startsWith("-")) {
    throw new Error(USAGE);
  }
  // Um número sozinho é o id de um som; qualquer outra coisa é uma busca.
  await (/^\d+$/.test(argument) ? download(argument) : search(argument));
};

main().catch(exitWithError);
