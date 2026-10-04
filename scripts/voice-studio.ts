// Estúdio de voz: pnpm voice <vídeo>
//
// Abre uma página local para conferir a narração de ouvido. O fluxo normal é
// ouvir o vídeo inteiro uma vez, marcar as frases que soaram erradas e mandar
// regerar as marcadas: a escolha automática fica com outra tomada, deixando de
// fora as rejeitadas. Para o caso difícil, a página também deixa editar o
// texto, gerar e escolher tomadas à mão e colar uma frase na seguinte. O
// modelo de voz e o Whisper ficam carregados enquanto a página está aberta.
//
// O texto editado vai para script.json; as escolhas (tomada escolhida à mão,
// tomadas rejeitadas, frases coladas) vão para voice.json, na pasta do vídeo,
// que o `pnpm narrate` respeita.

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { createServer, type ServerResponse } from "node:http";
import path from "node:path";
import { mediaFolder } from "../src/media";
import {
  REWRITE_AFTER_REJECTIONS,
  chooseTake,
  rejectTake,
  replaceSentence,
  setTight,
} from "../src/narration/choices";
import { PACING } from "../src/narration/manifest";
import { parseScript } from "../src/narration/script";
import { MAX_SENTENCE_CHARS } from "../src/narration/text";
import {
  bestStoredTake,
  currentTake,
  generateTakes,
  missingSentences,
  planNarration,
  readChoices,
  rejectedSeeds,
  seedOf,
  settleSentence,
  storedTakes,
  putInUse,
  voiceJob,
  writeChoices,
  writeManifest,
  type NarrationPlan,
  type PlannedSentence,
} from "./lib/narration";
import { exitWithError, publicPath, slugFromArgs } from "./lib/videos";
import { VOICE_MODEL } from "./lib/voice";
import { startVoiceWorker } from "./lib/voice-worker";

const PORT = 4747;
const PAGE = path.resolve("scripts/voice-studio.html");

const main = async () => {
  const slug = slugFromArgs("pnpm voice <vídeo>");
  const scriptFile = path.resolve("src/videos", slug, "script.json");
  const readRawScript = () =>
    JSON.parse(readFileSync(scriptFile, "utf8")) as {
      scenes: { id: string; narration: string }[];
    };
  const plan = (): Promise<NarrationPlan> =>
    planNarration(slug, parseScript(readRawScript()));

  const worker = startVoiceWorker(voiceJob((await plan()).sample));
  let modelReady = false;
  worker.ready.then(
    () => {
      modelReady = true;
      console.log("Modelos carregados.");
    },
    (error: unknown) => exitWithError(error),
  );

  const find = (current: NarrationPlan, text: string): PlannedSentence => {
    const sentence = current.scenes
      .flatMap((scene) => scene.sentences)
      .find((candidate) => candidate.text === text);
    if (!sentence) {
      throw new Error("A frase não está mais no roteiro: recarregue a página.");
    }
    return sentence;
  };

  /** Remonta o manifesto quando todas as frases têm áudio em uso. */
  const refreshManifest = async (): Promise<void> => {
    const current = await plan();
    if (missingSentences(current).length === 0) {
      await writeManifest(current);
    }
  };

  const state = async () => {
    const current = await plan();
    const tight = new Set(current.choices.tight);
    return {
      slug,
      modelReady,
      pacing: PACING,
      maxSentenceChars: MAX_SENTENCE_CHARS,
      takesPerRound: VOICE_MODEL.takesPerAttempt,
      missing: missingSentences(current).length,
      scenes: current.scenes.map((scene) => ({
        id: scene.id,
        sentences: scene.sentences.map((sentence) => {
          const rejected = rejectedSeeds(current, sentence);
          return {
            ...sentence,
            tight: tight.has(sentence.text),
            chosen: current.choices.takes[sentence.text] ?? null,
            current: currentTake(current, sentence) ?? null,
            rejected,
            needsRewrite: rejected.length >= REWRITE_AFTER_REJECTIONS,
            takes: storedTakes(current, sentence),
          };
        }),
      })),
    };
  };

  const actions: Record<string, (body: never) => Promise<unknown>> = {
    /** Troca o texto de uma frase no roteiro. Roteiro inválido não é gravado. */
    text: async (body: { scene: string; index: number; text: string }) => {
      const raw = readRawScript();
      const scene = raw.scenes.find(({ id }) => id === body.scene);
      if (!scene) {
        throw new Error(`O roteiro não tem a cena "${body.scene}".`);
      }
      const before = (await plan()).scenes.find(({ id }) => id === body.scene)
        ?.sentences[body.index]?.text;
      scene.narration = replaceSentence(scene.narration, body.index, body.text);
      parseScript(raw);
      writeFileSync(scriptFile, `${JSON.stringify(raw, null, 2)}\n`);

      // A frase que estava colada continua colada depois de reescrita.
      const choices = readChoices(slug);
      const after = body.text.trim();
      if (before && after !== "" && choices.tight.includes(before)) {
        writeChoices(
          slug,
          setTight(setTight(choices, before, false), after, true),
        );
      }
    },

    /** Marca a tomada em uso como errada: ela sai da escolha automática. */
    reject: async (body: { text: string }) => {
      const current = await plan();
      const take = currentTake(current, find(current, body.text));
      if (take) {
        writeChoices(
          slug,
          rejectTake(current.choices, body.text, seedOf(take)),
        );
      }
    },

    /** Decide de novo, pela escolha automática, toda frase sem áudio em uso. */
    redo: async () => {
      const current = await plan();
      for (const sentence of missingSentences(current)) {
        await settleSentence(current, worker, sentence);
      }
      await refreshManifest();
    },

    /** Gera mais uma rodada de tomadas da frase, para escolher à mão. */
    generate: async (body: { text: string }) => {
      const current = await plan();
      await generateTakes(current, worker, find(current, body.text));
    },

    /** Fica com uma tomada escolhida à mão. */
    choose: async (body: { text: string; seed: number }) => {
      const current = await plan();
      const sentence = find(current, body.text);
      const take = storedTakes(current, sentence).find(
        ({ seed }) => seed === body.seed,
      );
      if (!take) {
        throw new Error("A tomada não existe mais: recarregue a página.");
      }
      putInUse(current, sentence, take);
      writeChoices(slug, chooseTake(current.choices, body.text, body.seed));
      await refreshManifest();
    },

    /** Cola a frase na seguinte, ou descola. */
    tight: async (body: { text: string; tight: boolean }) => {
      writeChoices(slug, setTight(readChoices(slug), body.text, body.tight));
      // Colada, a frase pede outro fim: entre as tomadas já geradas, a melhor pode ser outra.
      const current = await plan();
      const sentence = find(current, body.text);
      const best = bestStoredTake(current, sentence);
      if (best && current.choices.takes[body.text] === undefined) {
        putInUse(current, sentence, best);
      }
      await refreshManifest();
    },
  };

  const send = (
    response: ServerResponse,
    status: number,
    type: string,
    body: string | Buffer,
  ) => {
    response.writeHead(status, {
      "Content-Type": type,
      "Cache-Control": "no-store",
    });
    response.end(body);
  };
  const sendJson = (response: ServerResponse, status: number, body: unknown) =>
    send(response, status, "application/json", JSON.stringify(body));

  createServer((request, response) => {
    const url = new URL(request.url ?? "/", `http://localhost:${PORT}`);
    const handle = async () => {
      if (request.method === "GET" && url.pathname === "/") {
        send(response, 200, "text/html; charset=utf-8", readFileSync(PAGE));
        return;
      }
      if (request.method === "GET" && url.pathname === "/api/state") {
        sendJson(response, 200, await state());
        return;
      }
      if (request.method === "GET" && url.pathname.startsWith("/media/")) {
        const file = decodeURIComponent(url.pathname.slice("/media/".length));
        // Só o áudio deste vídeo sai por aqui.
        if (
          !file.startsWith(`${mediaFolder(slug)}/`) ||
          file.includes("..") ||
          !existsSync(publicPath(file))
        ) {
          send(response, 404, "text/plain", "não encontrado");
          return;
        }
        send(response, 200, "audio/wav", readFileSync(publicPath(file)));
        return;
      }
      const action = actions[url.pathname.replace("/api/", "")];
      if (request.method === "POST" && action) {
        const chunks: Buffer[] = [];
        for await (const chunk of request) {
          chunks.push(chunk as Buffer);
        }
        await action(JSON.parse(Buffer.concat(chunks).toString()) as never);
        sendJson(response, 200, await state());
        return;
      }
      send(response, 404, "text/plain", "não encontrado");
    };
    handle().catch((error: unknown) =>
      sendJson(response, 400, {
        error: error instanceof Error ? error.message : String(error),
      }),
    );
  }).listen(PORT, () => {
    console.log(`Estúdio de voz de "${slug}": http://localhost:${PORT}`);
    console.log("Carregando os modelos; a página já pode ser aberta.");
  });

  process.on("SIGINT", () => {
    worker.stop();
    process.exit(0);
  });
};

main().catch(exitWithError);
