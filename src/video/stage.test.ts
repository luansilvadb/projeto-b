import { describe, expect, it } from "vitest";
import {
  CASCADE_STEP,
  JOIN_FRAMES,
  SCENERY_EXIT_FRAMES,
  enterProgress,
  leaveProgress,
  leaveStart,
  markFor,
} from "./stage";

describe("enterProgress", () => {
  it("vai de 0 a 1 enquanto as duas cenas dividem o palco", () => {
    expect(enterProgress(0)).toBe(0);
    expect(enterProgress(JOIN_FRAMES)).toBe(1);
    expect(enterProgress(JOIN_FRAMES * 4)).toBe(1);
  });

  it("chega rápido e freia: na metade do tempo já passou da metade", () => {
    expect(enterProgress(JOIN_FRAMES / 2)).toBeGreaterThan(0.5);
  });
});

describe("markFor", () => {
  it("põe os objetos de cena antes do elenco na entrada, e depois dele na saída", () => {
    expect(markFor("prop").enterAt).toBeLessThan(markFor("actor", 0).enterAt);
    expect(markFor("prop").leaveAt).toBeGreaterThan(
      markFor("actor", 1920).leaveAt,
    );
  });

  it("faz o elenco entrar e sair da esquerda para a direita, nunca junto", () => {
    const [left, middle, right] = [200, 960, 1700].map((x) =>
      markFor("actor", x),
    );
    expect(left.enterAt).toBeLessThan(middle.enterAt);
    expect(middle.enterAt).toBeLessThan(right.enterAt);
    expect(left.leaveAt).toBeLessThan(right.leaveAt);
  });

  it("atrasa a marcação em passos da cascata", () => {
    expect(markFor("prop", 0, 2).enterAt - markFor("prop").enterAt).toBe(
      2 * CASCADE_STEP,
    );
  });
});

describe("leaveProgress", () => {
  const LEAVE_AT = 100;

  it("começa a sair antes de a cena seguinte chegar", () => {
    expect(leaveStart(LEAVE_AT)).toBeLessThan(LEAVE_AT);
    expect(leaveProgress(leaveStart(LEAVE_AT), LEAVE_AT)).toBe(0);
    expect(leaveProgress(LEAVE_AT, LEAVE_AT)).toBeGreaterThan(0);
  });

  it("todo mundo termina de sair logo depois de a cena seguinte chegar", () => {
    for (const mark of [markFor("actor", 1920), markFor("prop")]) {
      expect(leaveProgress(LEAVE_AT + 3, LEAVE_AT, mark.leaveAt)).toBe(1);
    }
  });

  it("um cenário inteiro sai mais devagar, no mesmo prazo", () => {
    expect(
      leaveProgress(LEAVE_AT - 12, LEAVE_AT, 0, SCENERY_EXIT_FRAMES),
    ).toBeLessThan(leaveProgress(LEAVE_AT - 12, LEAVE_AT));
    expect(leaveProgress(LEAVE_AT + 3, LEAVE_AT, 0, SCENERY_EXIT_FRAMES)).toBe(
      1,
    );
  });
});
