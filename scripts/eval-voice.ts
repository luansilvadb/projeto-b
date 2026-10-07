// Compara configurações do modelo de voz nas mesmas frases: pnpm eval:voice [configuração...]
//
// A primeira configuração é a da narração (VOICE_MODEL); cada uma das outras
// muda um parâmetro dela. Toda frase é gerada com as mesmas sementes em todas
// as configurações, e cada geração recebe a nota de naturalidade do UTMOS, as
// medidas de altura e de entonação e a conferência do Whisper.
//
// O resultado de cada configuração fica em out/ferramentas/eval-voice/ e é reaproveitado
// enquanto a configuração, a amostra e as frases não mudarem.

import {
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import { alignWords } from "../src/narration/alignment";
import {
  PITCH_TOLERANCE_SEMITONES,
  chooseTakes,
  closestToReference,
  mostNatural,
  summarize,
  type EvaluatedTake,
  type EvaluationSummary,
} from "../src/narration/evaluation";
import { runPythonTool } from "./lib/tools";
import { exitWithError } from "./lib/videos";
import {
  NARRATION_TOOLS,
  VOICE_MODEL,
  hash,
  resolveVoice,
  transcribe,
  voiceTranscript,
  type VoiceModel,
} from "./lib/voice";

const FOLDER = "out/ferramentas/eval-voice";

// A revisão fixa impede que a régua mude entre uma avaliação e outra.
const UTMOS = {
  repository: "k2-fsa/TTS_eval_models",
  revision: "e876de7154845cd668b599bd4866f1d354c723df",
  file: "mos/utmos22_strong_step7459_v1.pt",
};

const VARIANTS: Readonly<Record<string, Partial<VoiceModel>>> = {
  atual: {},
  "intonation 1.0": { intonation: 1 },
  "intonation 1.15": { intonation: 1.15 },
  "intonation 1.45": { intonation: 1.45 },
  // Tudo o que deixa a fala mais viva, junto: para julgar a energia de ouvido.
  energia: { intonation: 1.45, classTemperature: 0.5, speed: 0.95 },
  "speed 1.0": { speed: 1 },
  "speed 0.95": { speed: 0.95 },
  "classTemperature 0.5": { classTemperature: 0.5 },
  "classTemperature 1.0": { classTemperature: 1 },
  "numStep 64": { numStep: 64 },
  float32: { precision: "float32" },
};

// Frases de "why-we-sleep", copiadas para cá: a linha de base não pode mudar
// quando um roteiro muda. As primeiras são o gancho e o começo do capítulo 1,
// em ordem, para a comparação ser ouvida como um trecho do vídeo; depois vêm
// perguntas, números por extenso e frases longas, que é onde a voz falha.
const SENTENCES = [
  "Neste exato momento, no fundo de uma lagoa, uma água-viva está de cabeça para baixo, pulsando cinquenta e oito vezes por minuto.",
  "Só que quando escurece acontece uma coisa esquisita: o ritmo cai para trinta e nove, e ela demora bem mais a reagir quando alguém encosta nela.",
  "E se alguém passar a noite impedindo essa água-viva de descansar, ela cobra o atraso no dia seguinte.",
  "Ou seja, ela dorme.",
  "O que é bem estranho, porque esse bicho não tem cérebro, e quase tudo o que a gente sabe sobre o sono fala de cérebros.",
  "Então para que ele serve, afinal?",
  "Vamos ser honestos logo de cara: ninguém tem a resposta completa, e a gente também não.",
  "Mas existem pistas muito boas, e a primeira delas é a própria água-viva.",
  "Para começar, como é que alguém descobre que uma água-viva está dormindo, e não só parada?",
  "Pesquisadores resolveram isso do jeito mais simples possível: tiraram o apoio de baixo dela.",
  "Uma água-viva dormindo fica boiando por até cinco segundos, sem fazer nada, antes de perceber que o chão sumiu.",
  "Ficar quieta à noite, demorar a reagir e cobrar depois o sono atrasado: esses três sinais servem para reconhecer o sono em qualquer animal.",
  "Inclusive em você.",
  "Depois eles trocam.",
  "É como fechar metade da loja e deixar no caixa um funcionário de muito mau humor.",
  "Em mil novecentos e oitenta e nove, um grupo de pesquisadores fez exatamente essa pergunta a dez ratos, usando um aparelho que não os deixava dormir.",
];

type Voice = {
  readonly file: string;
  readonly hash: string;
  readonly text: string;
};

type Evaluation = {
  readonly key: string;
  /** Tempo de geração de todas as frases, com a carga do modelo. */
  readonly seconds: number;
  readonly takes: readonly EvaluatedTake[];
};

type GeneratedTake = Omit<EvaluatedTake, "errors"> & {
  readonly output: string;
  readonly durationMs: number;
};

const evaluate = async (
  name: string,
  model: VoiceModel,
  voice: Voice,
): Promise<Evaluation> => {
  const folder = path.resolve(FOLDER, name.replace(/\s+/g, "-"));
  const file = path.join(folder, "takes.json");
  const key = hash(
    JSON.stringify([model, voice.hash, voice.text, UTMOS, SENTENCES]),
  );
  if (existsSync(file)) {
    const saved = JSON.parse(readFileSync(file, "utf8")) as Evaluation;
    if (saved.key === key) {
      return saved;
    }
  }

  console.log(`\nConfiguração "${name}"`);
  rmSync(folder, { recursive: true, force: true });
  mkdirSync(folder, { recursive: true });

  const start = Date.now();
  const generated = await runPythonTool<GeneratedTake>(
    NARRATION_TOOLS,
    `${NARRATION_TOOLS}/evaluate.py`,
    {
      ...model,
      voice: path.resolve(voice.file),
      voiceText: voice.text,
      utmos: UTMOS,
      sentences: SENTENCES,
      folder,
    },
  );
  const seconds = Math.round((Date.now() - start) / 1000);

  const transcribed = await transcribe(generated.map((take) => take.output));
  if (
    generated.length !== SENTENCES.length * model.takesPerAttempt ||
    transcribed.length !== generated.length
  ) {
    throw new Error(
      "As ferramentas de narração não responderam por todas as gerações.",
    );
  }

  const takes = generated.map((take, index) => ({
    sentence: take.sentence,
    seed: take.seed,
    complete: take.complete,
    naturalness: take.naturalness,
    pitchDistance: take.pitchDistance,
    intonation: take.intonation,
    errors: alignWords(
      SENTENCES[take.sentence],
      transcribed[index].words,
      take.durationMs,
    ).errors,
  }));
  const evaluation = { key, seconds, takes };
  writeFileSync(file, JSON.stringify(evaluation, null, 2));
  return evaluation;
};

const COLUMNS: readonly {
  readonly title: string;
  readonly format: (summary: EvaluationSummary) => string;
}[] = [
  { title: "naturalidade", format: (s) => s.naturalness.toFixed(2) },
  { title: "entonação (st)", format: (s) => s.intonation.toFixed(2) },
  { title: "altura (st)", format: (s) => s.pitchDistance.toFixed(2) },
  { title: "inteiras", format: (s) => `${Math.round(s.completeRate * 100)}%` },
  { title: "erros", format: (s) => s.errors.toFixed(2) },
];

const printTable = (
  title: string,
  rows: readonly (readonly [string, EvaluationSummary])[],
) => {
  const width = Math.max(...rows.map(([name]) => name.length));
  const cells = (values: readonly string[]) =>
    values
      .map((value, index) => value.padStart(COLUMNS[index].title.length))
      .join("  ");

  console.log(`\n${title}`);
  console.log(
    `${"".padEnd(width)}  ${cells(COLUMNS.map((column) => column.title))}`,
  );
  for (const [name, summary] of rows) {
    console.log(
      `${name.padEnd(width)}  ${cells(COLUMNS.map((column) => column.format(summary)))}`,
    );
  }
};

const main = async () => {
  const sample = resolveVoice();
  const voiceHash = hash(readFileSync(sample.file));
  const voice: Voice = {
    file: sample.file,
    hash: voiceHash,
    text: await voiceTranscript(sample.file, voiceHash),
  };

  const report = [];
  // `pnpm eval:voice atual "intonation 1.0"` avalia só as configurações pedidas.
  const wanted = process.argv.slice(2);
  const unknown = wanted.filter((name) => !(name in VARIANTS));
  if (unknown.length > 0) {
    throw new Error(
      `Configuração desconhecida: ${unknown.join(", ")}. Existem: ${Object.keys(VARIANTS).join(", ")}.`,
    );
  }
  const variants = Object.entries(VARIANTS).filter(
    ([name]) => wanted.length === 0 || wanted.includes(name),
  );
  for (const [name, changes] of variants) {
    const { seconds, takes } = await evaluate(
      name,
      { ...VOICE_MODEL, ...changes },
      voice,
    );
    report.push({
      name,
      seconds,
      allTakes: summarize(takes),
      chosenByPitch: summarize(chooseTakes(takes, closestToReference)),
      chosenByNaturalness: summarize(chooseTakes(takes, mostNatural)),
    });
  }
  writeFileSync(
    path.join(FOLDER, "report.json"),
    JSON.stringify(report, null, 2),
  );

  console.log(
    `\n${SENTENCES.length} frases, ${VOICE_MODEL.takesPerAttempt} gerações de cada. Naturalidade: nota do UTMOS, de 1 a 5.`,
  );
  console.log(
    "Entonação: desvio padrão da altura, em semitons. Altura: distância à da amostra, em semitons.",
  );
  printTable(
    "Todas as gerações",
    report.map((row) => [row.name, row.allTakes]),
  );
  printTable(
    "Uma geração por frase, a de altura mais próxima da amostra (a escolha da narração)",
    report.map((row) => [row.name, row.chosenByPitch]),
  );
  printTable(
    `Uma geração por frase, a mais natural a até ${PITCH_TOLERANCE_SEMITONES} semitom da amostra`,
    report.map((row) => [row.name, row.chosenByNaturalness]),
  );

  console.log("\nTempo de geração");
  for (const { name, seconds } of report) {
    console.log(`${name}: ${seconds} s`);
  }
  console.log(`\nÁudios e medidas de cada geração: ${FOLDER}/`);
};

main().catch(exitWithError);
