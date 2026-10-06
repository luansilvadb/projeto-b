import { expect, test } from "vitest";
import { trunkTipAt } from "./Elephant";

// A cena `elephants` prendia a linha do registro a estes números, escritos nela: o desenho precisa continuar a dá-los.
test("a ponta da tromba do animatic fica onde as cenas a esperam", () => {
  expect(trunkTipAt(0, 0, false)).toEqual([-262, -40]);
  expect(trunkTipAt(1, 0, false)).toEqual([-202, -190]);
});

test("a tromba do acabamento cai mais a prumo, e a ponta fica mais perto do corpo", () => {
  expect(trunkTipAt(0, 0, true)[0]).toBeGreaterThan(trunkTipAt(0, 0, false)[0]);
});
