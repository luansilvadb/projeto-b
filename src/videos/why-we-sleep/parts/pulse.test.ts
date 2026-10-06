import { describe, expect, it } from "vitest";
import {
  pulseCycles,
  pulseFrame,
  pulseRate,
  pulseShape,
  settledPhase,
  steady,
} from "./pulse";

const FPS = 30;

describe("pulseRate", () => {
  const rhythm = [
    { from: 0, perMinute: 58 },
    { from: 45, perMinute: 39 },
  ];

  it("dá o ritmo do trecho em que o quadro cai", () => {
    expect(pulseRate(0, rhythm)).toBe(58);
    expect(pulseRate(44, rhythm)).toBe(58);
    expect(pulseRate(45, rhythm)).toBe(39);
    expect(pulseRate(500, rhythm)).toBe(39);
  });

  it("um ritmo constante vale o plano inteiro", () => {
    expect(pulseRate(999, steady(58))).toBe(58);
  });
});

describe("pulseCycles", () => {
  it("conta os pulsos de um ritmo constante", () => {
    expect(pulseCycles(60 * FPS, FPS, [{ from: 0, perMinute: 58 }])).toBe(58);
  });

  it("soma cada trecho no seu próprio ritmo", () => {
    const rhythm = [
      { from: 0, perMinute: 60 },
      { from: 2 * FPS, perMinute: 30 },
    ];
    // Dois segundos a um pulso por segundo, depois dois a meio pulso por segundo.
    expect(pulseCycles(4 * FPS, FPS, rhythm)).toBeCloseTo(3);
  });

  it("não dá salto no quadro em que o ritmo muda", () => {
    const change = 45;
    const rhythm = [
      { from: 0, perMinute: 58 },
      { from: change, perMinute: 39 },
    ];
    const step =
      pulseCycles(change + 1, FPS, rhythm) - pulseCycles(change, FPS, rhythm);
    expect(step).toBeCloseTo(39 / 60 / FPS);
  });

  it("fica em zero antes do começo da cena", () => {
    expect(pulseCycles(-10, FPS, [{ from: 0, perMinute: 58 }])).toBe(0);
  });
});

describe("pulseFrame", () => {
  const rhythm = [
    { from: 0, perMinute: 60 },
    { from: 2 * FPS, perMinute: 30 },
  ];

  it("é o inverso de pulseCycles, em qualquer trecho", () => {
    for (const frame of [0, 17, 60, 61, 143]) {
      expect(pulseFrame(pulseCycles(frame, FPS, rhythm), FPS, rhythm)).toBeCloseTo(frame);
    }
  });

  it("pula o trecho em que ela não pulsa", () => {
    const paused = [
      { from: 0, perMinute: 60 },
      { from: FPS, perMinute: 0 },
      { from: 3 * FPS, perMinute: 60 },
    ];
    // Um pulso no primeiro segundo, nenhum nos dois seguintes: o segundo pulso fecha no quarto segundo.
    expect(pulseCycles(3 * FPS, FPS, paused)).toBeCloseTo(1);
    expect(pulseFrame(2, FPS, paused)).toBeCloseTo(4 * FPS);
  });

  it("não chega nunca se o ritmo parou antes", () => {
    const stopped = [
      { from: 0, perMinute: 60 },
      { from: FPS, perMinute: 0 },
    ];
    expect(pulseFrame(5, FPS, stopped)).toBe(Infinity);
  });
});

describe("settledPhase", () => {
  it("põe o último trecho na contagem de quem pulsa nele desde o quadro 0", () => {
    const rhythm = [
      { from: 0, perMinute: 58 },
      { from: 6300, perMinute: 39 },
    ];
    const frame = 6500;
    expect(
      settledPhase(FPS, rhythm) + pulseCycles(frame, FPS, rhythm),
    ).toBeCloseTo(pulseCycles(frame, FPS, steady(39)));
  });

  it("é zero num ritmo só", () => {
    expect(settledPhase(FPS, steady(58))).toBeCloseTo(0);
  });
});

describe("pulseShape", () => {
  it("começa e termina o ciclo com o sino relaxado", () => {
    expect(pulseShape(0)).toBeCloseTo(0);
    expect(pulseShape(0.9999)).toBeCloseTo(0, 2);
  });

  it("chega à contração máxima no fim da fase rápida", () => {
    expect(pulseShape(0.3)).toBeCloseTo(1);
  });

  it("vale também para a contagem negativa, antes de uma âncora", () => {
    expect(pulseShape(-0.58)).toBeCloseTo(pulseShape(0.42));
  });

  it("repete a mesma forma a cada ciclo", () => {
    expect(pulseShape(3.42)).toBeCloseTo(pulseShape(0.42));
  });
});
