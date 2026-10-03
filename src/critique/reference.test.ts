import { describe, expect, it } from "vitest";
import type { Critique } from "./measures";
import { judge } from "./reference";

const inBand: Critique = {
  stillShare: 0.1,
  movingShare: 0.42,
  renewalSeconds: 2,
  drawnShare: 0.57,
  colorsPerFrame: 4.4,
  dominantChangesPerMinute: 11,
  topHueShare: 0.27,
};

const statusOf = (critique: Critique, stage: "animatic" | "final") =>
  Object.fromEntries(
    judge(critique, stage).map((verdict) => [verdict.label, verdict.status]),
  );

describe("judge", () => {
  it("aprova o vídeo que está dentro da faixa em todas as medidas", () => {
    expect(judge(inBand, "final").every(({ status }) => status === "ok")).toBe(
      true,
    );
  });

  it("reprova o vídeo vazio, de uma cor só e parado", () => {
    const status = statusOf(
      {
        stillShare: 0.6,
        movingShare: 0.03,
        renewalSeconds: 13.5,
        drawnShare: 0.29,
        colorsPerFrame: 1.9,
        dominantChangesPerMinute: 0,
        topHueShare: 0.89,
      },
      "final",
    );
    expect(Object.values(status).every((value) => value === "out")).toBe(true);
  });

  it("no animatic, não reprova o que depende de animar", () => {
    const status = statusOf(
      { ...inBand, stillShare: 0.6, movingShare: 0.03, drawnShare: 0.29 },
      "animatic",
    );
    expect(status["Tempo com a tela quase parada"]).toBe("pending");
    expect(status["Tempo com mais de 10% do quadro em movimento"]).toBe(
      "pending",
    );
    expect(status["Área do quadro com desenho"]).toBe("out");
  });

  it("só reprova de um lado da faixa", () => {
    const status = statusOf(
      { ...inBand, drawnShare: 0.9, stillShare: 0, colorsPerFrame: 7 },
      "final",
    );
    expect(Object.values(status).every((value) => value === "ok")).toBe(true);
  });

  it("mostra o valor e a faixa na unidade de cada medida", () => {
    const [drawn] = judge(inBand, "final");
    expect(drawn).toMatchObject({ value: "57%", band: "40% a 68%" });
  });
});
