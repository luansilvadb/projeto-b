import { describe, expect, it } from "vitest";
import { calibratedDb, judgeSound, type SoundMeasures } from "./sound";

// As medianas dos 12 vídeos de referência, como o measure.py as devolve.
const inBand: SoundMeasures = {
  musica_sob_a_fala_db: 15.6,
  musica_sob_a_fala_p10_db: 12.3,
  musica_sob_a_fala_p90_db: 20.5,
  musica_ausente_pct: 0.5,
  viradas_de_dinamica_por_minuto: 0.6,
  variacao_de_timbre_oitavas: 0.23,
  efeitos_por_minuto: 8.4,
  efeito_mediano_db: 13.4,
};

const statusOf = (measures: SoundMeasures) =>
  Object.fromEntries(
    judgeSound(measures).map((verdict) => [verdict.label, verdict.status]),
  );

describe("calibratedDb", () => {
  it("desfaz o exagero da medida nas mixagens de distância conhecida", () => {
    expect(calibratedDb(14.2)).toBeCloseTo(12, 0);
    expect(calibratedDb(18.7)).toBeCloseTo(16, 0);
    expect(calibratedDb(29.1)).toBeCloseTo(24, 0);
  });
});

describe("judgeSound", () => {
  it("aprova o som que está na mediana da referência", () => {
    expect(judgeSound(inBand).every(({ status }) => status === "ok")).toBe(
      true,
    );
  });

  it("reprova o som do why-we-sleep de 2026-10-05: baixo, oscilante, com buracos, de várias músicas e sem efeitos", () => {
    const status = statusOf({
      musica_sob_a_fala_db: 21.6,
      musica_sob_a_fala_p10_db: 18.0,
      musica_sob_a_fala_p90_db: 34.4,
      musica_ausente_pct: 5.1,
      viradas_de_dinamica_por_minuto: 2.2,
      variacao_de_timbre_oitavas: 0.43,
      efeitos_por_minuto: 1.9,
      efeito_mediano_db: 14.1,
    });
    expect(status).toEqual({
      "Música abaixo da voz, sob a fala": "out",
      "Do trecho mais presente ao mais recuado": "out",
      "Tempo sem música": "out",
      "Viradas de volume por minuto": "out",
      "Variação de timbre ao longo do vídeo": "out",
      "Efeitos que se ouvem, por minuto": "out",
      "Pico do efeito abaixo da voz": "ok",
    });
  });

  it("reprova a música alta demais, e não só a baixa", () => {
    expect(
      statusOf({ ...inBand, musica_sob_a_fala_db: 8 })[
        "Música abaixo da voz, sob a fala"
      ],
    ).toBe("out");
  });

  it("não reprova o vídeo mais firme ou com mais efeitos que a referência", () => {
    const status = statusOf({
      ...inBand,
      viradas_de_dinamica_por_minuto: 0,
      variacao_de_timbre_oitavas: 0.05,
      efeitos_por_minuto: 20,
    });
    expect(Object.values(status).every((value) => value === "ok")).toBe(true);
  });
});
