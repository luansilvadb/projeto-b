import { describe, expect, it } from "vitest";
import { duckedVolume, gainBelowVoice } from "./ducking";

describe("gainBelowVoice", () => {
  it("atenua a trilha até ficar a distância pedida abaixo da voz", () => {
    // Trilha a -15 LUFS precisa cair 28 dB para ficar 18 dB abaixo de uma voz a -25 LUFS.
    expect(gainBelowVoice(-25, -15, 18)).toBeCloseTo(10 ** (-28 / 20));
    expect(gainBelowVoice(-20, -20, 6)).toBeCloseTo(0.501, 3);
  });

  it("não amplifica uma trilha que já está mais baixa que o alvo", () => {
    expect(gainBelowVoice(-16, -40, 18)).toBe(1);
  });
});

const levels = { full: 0.5, ducked: 0.1, rampFrames: 10 };
const speech = [
  { from: 30, to: 60 },
  { from: 66, to: 90 },
];

describe("duckedVolume", () => {
  it("fica baixo durante a fala e cheio longe dela", () => {
    expect(duckedVolume(45, speech, levels)).toBeCloseTo(0.1);
    expect(duckedVolume(0, speech, levels)).toBeCloseTo(0.5);
    expect(duckedVolume(200, speech, levels)).toBeCloseTo(0.5);
  });

  it("desce antes da fala e sobe depois dela em rampa", () => {
    expect(duckedVolume(25, speech, levels)).toBeCloseTo(0.3);
    expect(duckedVolume(95, speech, levels)).toBeCloseTo(0.3);
  });

  it("não chega a subir na pausa curta entre duas frases", () => {
    expect(duckedVolume(63, speech, levels)).toBeCloseTo(0.22);
  });

  it("fica cheio quando o vídeo não tem fala", () => {
    expect(duckedVolume(10, [], levels)).toBeCloseTo(0.5);
  });
});
