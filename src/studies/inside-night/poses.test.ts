import { describe, expect, it } from "vitest";
import { bones, REACH, spin, type Vec } from "../../art/Vigilia";
import { POSES, settle } from "./poses";

const distance = (a: Vec, b: Vec) => Math.hypot(a[0] - b[0], a[1] - b[1]);

it.each([
  [0, [3, 4]],
  [90, [-4, 3]],
  [-90, [4, -3]],
  [180, [-3, -4]],
] as const)("spin gira %s graus no sentido do relógio na tela", (angle, expected) => {
  const [x, y] = spin([3, 4], angle);
  expect(x).toBeCloseTo(expected[0], 12);
  expect(y).toBeCloseTo(expected[1], 12);
});

describe("as oito poses da Vigília", () => {
  it("são oito, na ordem do número", () => {
    expect(POSES).toHaveLength(8);
  });

  // Os ossos não esticam: o alvo além do alcance deixa a mão ou o casco no ar, antes dele, e a
  // pose desenhada deixa de ser a pose pedida. Meio pixel de folga não se vê.
  it.each(POSES.map((pose, index) => [index + 1, pose] as const))(
    "na pose %i, as mãos e os cascos alcançam o alvo",
    (_, pose) => {
      const drawn = settle(pose, pose.lever);
      const b = bones(drawn);
      expect(distance(b.nearArm.root, drawn.nearHand)).toBeLessThanOrEqual(REACH.arm + 0.5);
      expect(distance(b.farArm.root, drawn.farHand)).toBeLessThanOrEqual(REACH.arm + 0.5);
      expect(distance(b.nearLeg.root, drawn.nearAnkle)).toBeLessThanOrEqual(REACH.leg + 0.5);
      expect(distance(b.farLeg.root, drawn.farAnkle)).toBeLessThanOrEqual(REACH.leg + 0.5);
    },
  );

  it("com a alavanca fora do ângulo da pose, a mão presa gira com a haste e a solta fica", () => {
    const [firm] = POSES;
    const moved = settle(firm, firm.lever - 8);
    // Na pose 1 a mão de lá está na haste, e a de cá, na cintura.
    expect(moved.farHand).not.toEqual(settle(firm, firm.lever).farHand);
    expect(moved.nearHand).toEqual(firm.nearHand);
  });
});
