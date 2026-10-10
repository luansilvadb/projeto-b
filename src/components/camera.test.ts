import { describe, expect, it } from "vitest";
import { HEIGHT, WIDTH } from "../format";
import { cameraBetween, framing, seenAt } from "./Camera";

const center = [WIDTH / 2, HEIGHT / 2] as const;

describe("framing", () => {
  it("não desloca a câmera para aproximar o centro do quadro", () => {
    expect(framing(center, 2)).toEqual({ x: 0, y: 0, zoom: 2 });
  });

  it("leva o assunto ao centro do quadro", () => {
    const subject = [700, 800] as const;
    expect(seenAt(framing(subject, 2), subject)).toEqual([...center]);
  });

  it("leva o assunto ao ponto pedido do quadro", () => {
    const subject = [860, 716] as const;
    expect(seenAt(framing(subject, 3.2, [640, 700]), subject)).toEqual([
      640, 700,
    ]);
  });

  it("sem aproximação, só desloca", () => {
    expect(framing([1000, 500], 1, [960, 540])).toEqual({
      x: 40,
      y: -40,
      zoom: 1,
    });
  });
});

describe("cameraBetween", () => {
  const from = { x: 0, y: 0, zoom: 1 };
  const to = { x: 100, y: -50, zoom: 4 };

  it("começa num enquadramento e termina no outro", () => {
    expect(cameraBetween(from, to, 0)).toEqual(from);
    expect(cameraBetween(from, to, 1)).toEqual(to);
  });

  it("aproxima em escala geométrica: no meio do caminho de 1 a 4 está em 2", () => {
    expect(cameraBetween(from, to, 0.5)).toEqual({ x: 50, y: -25, zoom: 2 });
  });
});
