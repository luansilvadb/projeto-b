import type { Critique } from "./measures";

/**
 * Em que ponto da produção o vídeo é medido. No animatic as cenas ainda não
 * foram animadas, e as medidas de movimento não reprovam.
 */
export type Stage = "animatic" | "final";

type Criterion = {
  readonly measure: keyof Critique;
  readonly label: string;
  /** Menor e maior valor da medida entre os vídeos de referência. */
  readonly band: readonly [number, number];
  /** De que lado da faixa o vídeo reprova; passar do outro lado não é defeito conhecido. */
  readonly fails: "below" | "above";
  /** Medida de movimento: só vale depois de animar. */
  readonly motion: boolean;
  readonly format: (value: number) => string;
};

const percent = (value: number) => `${Math.round(value * 100)}%`;
const seconds = (value: number) => `${value.toFixed(1)} s`;
const decimal = (value: number) => value.toFixed(1);

/**
 * Faixas medidas com `measure` em 12 vídeos do Kurzgesagt publicados entre
 * março de 2025 e setembro de 2026, sem os trechos de patrocínio (estudo de
 * 2026-10-02). Cada faixa vai do menor ao maior valor entre os 12, arredondada
 * para fora. Ao trocar os vídeos de referência ou o cálculo de uma medida,
 * meça todos de novo com `pnpm critique <arquivo>` e atualize as faixas.
 */
export const CRITERIA: readonly Criterion[] = [
  {
    measure: "drawnShare",
    label: "Área do quadro com desenho",
    band: [0.4, 0.68],
    fails: "below",
    motion: false,
    format: percent,
  },
  {
    measure: "colorsPerFrame",
    label: "Cores por quadro",
    band: [2.6, 5.7],
    fails: "below",
    motion: false,
    format: decimal,
  },
  {
    measure: "dominantChangesPerMinute",
    label: "Trocas da cor dominante por minuto",
    band: [6.8, 18.9],
    fails: "below",
    motion: false,
    format: decimal,
  },
  {
    measure: "topHueShare",
    label: "Peso da família de cor mais comum",
    band: [0.15, 0.47],
    fails: "above",
    motion: false,
    format: percent,
  },
  {
    measure: "stillShare",
    label: "Tempo com a tela quase parada",
    band: [0.03, 0.29],
    fails: "above",
    motion: true,
    format: percent,
  },
  {
    measure: "movingShare",
    label: "Tempo com mais de 10% do quadro em movimento",
    band: [0.29, 0.51],
    fails: "below",
    motion: true,
    format: percent,
  },
  {
    measure: "renewalSeconds",
    label: "Tempo até 40% do quadro ser outro",
    band: [1.5, 4],
    fails: "above",
    motion: true,
    format: seconds,
  },
];

export type Verdict = {
  readonly label: string;
  readonly value: string;
  readonly band: string;
  /** "pending": a medida está fora da faixa, mas ainda não vale nesta etapa. */
  readonly status: "ok" | "out" | "pending";
};

/** Compara cada medida do vídeo com a faixa dos vídeos de referência. */
export const judge = (critique: Critique, stage: Stage): Verdict[] =>
  CRITERIA.map(({ measure, label, band, fails, motion, format }) => {
    const value = critique[measure];
    const [low, high] = band;
    const out = fails === "below" ? value < low : value > high;
    return {
      label,
      value: format(value),
      band: `${format(low)} a ${format(high)}`,
      status: !out ? "ok" : motion && stage === "animatic" ? "pending" : "out",
    };
  });
