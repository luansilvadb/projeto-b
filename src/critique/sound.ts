/**
 * O que `tools/sound/measure.py` devolve sobre o som de um vídeo já separado
 * em voz, música e efeitos. As chaves são as do JSON dele.
 */
export type SoundMeasures = {
  readonly musica_sob_a_fala_db: number;
  readonly musica_sob_a_fala_p10_db: number;
  readonly musica_sob_a_fala_p90_db: number;
  readonly musica_ausente_pct: number;
  readonly viradas_de_dinamica_por_minuto: number;
  readonly variacao_de_timbre_oitavas: number;
  readonly efeitos_por_minuto: number;
  readonly efeito_mediano_db: number;
};

/**
 * A medida de nível exagera a distância da música à voz, e exagera mais
 * quanto mais baixa a música está. Mixagens com a distância conhecida (12,
 * 16, 20 e 24 dB) saíram medidas como 14,2, 18,7, 23,6 e 29,1: esta é a reta
 * que desfaz o erro, e devolve o valor na unidade de `MUSIC_MIX`.
 */
export const calibratedDb = (measured: number): number =>
  (measured + 0.9) / 1.24;

type Criterion = {
  readonly label: string;
  readonly value: (measures: SoundMeasures) => number;
  /** Menor e maior valor da medida entre os vídeos de referência. */
  readonly band: readonly [number, number];
  /** De que lado da faixa o vídeo reprova. */
  readonly fails: "below" | "above" | "outside";
  readonly format: (value: number) => string;
};

const db = (value: number) => `${value.toFixed(1)} dB`;
const perMinute = (value: number) => value.toFixed(1);

/**
 * Faixas medidas com `tools/sound/measure.py` nos mesmos 12 vídeos do
 * Kurzgesagt de `reference.ts`, sem os trechos de patrocínio (estudo de som de
 * 2026-10-05, em out/referencias/kurzgesagt/som/ESTUDO.md). Cada faixa vai do
 * menor ao maior valor entre os 12, arredondada para fora.
 *
 * Medianas dos 12: música 13,3 dB abaixo da voz; 7,0 dB entre o trecho mais
 * presente e o mais recuado; 0,5% do tempo sem música; 0,6 virada de volume
 * por minuto; 0,23 oitava de variação de timbre; 8,4 efeitos por minuto, com
 * o pico a 13,4 dB da voz.
 */
const CRITERIA: readonly Criterion[] = [
  {
    label: "Música abaixo da voz, sob a fala",
    value: (m) => calibratedDb(m.musica_sob_a_fala_db),
    band: [9, 15],
    fails: "outside",
    format: db,
  },
  {
    label: "Do trecho mais presente ao mais recuado",
    value: (m) =>
      calibratedDb(m.musica_sob_a_fala_p90_db) -
      calibratedDb(m.musica_sob_a_fala_p10_db),
    band: [4.5, 9.6],
    fails: "above",
    format: db,
  },
  {
    label: "Tempo sem música",
    value: (m) => m.musica_ausente_pct,
    band: [0, 2.4],
    fails: "above",
    format: (value) => `${value.toFixed(1)}%`,
  },
  {
    label: "Viradas de volume por minuto",
    value: (m) => m.viradas_de_dinamica_por_minuto,
    band: [0.3, 1.1],
    fails: "above",
    format: perMinute,
  },
  {
    label: "Variação de timbre ao longo do vídeo",
    value: (m) => m.variacao_de_timbre_oitavas,
    band: [0.15, 0.32],
    fails: "above",
    format: (value) => `${value.toFixed(2)} oit`,
  },
  {
    // A separação deixa vazar música e voz: um vídeo sem efeito nenhum mede
    // perto de 2 por minuto. A faixa começa bem acima desse piso.
    label: "Efeitos que se ouvem, por minuto",
    value: (m) => m.efeitos_por_minuto,
    band: [4.4, 12.3],
    fails: "below",
    format: perMinute,
  },
  {
    label: "Pico do efeito abaixo da voz",
    value: (m) => m.efeito_mediano_db,
    band: [11.5, 14.7],
    fails: "outside",
    format: db,
  },
];

type Verdict = {
  readonly label: string;
  readonly value: string;
  readonly band: string;
  readonly status: "ok" | "out";
};

/** Compara cada medida do som com a faixa dos vídeos de referência. */
export const judgeSound = (measures: SoundMeasures): Verdict[] =>
  CRITERIA.map(({ label, value, band, fails, format }) => {
    const measured = value(measures);
    const [low, high] = band;
    const out =
      (fails !== "above" && measured < low) ||
      (fails !== "below" && measured > high);
    return {
      label,
      value: format(measured),
      band: `${format(low)} a ${format(high)}`,
      status: out ? "out" : "ok",
    };
  });
