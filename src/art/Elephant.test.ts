import { expect, test } from "vitest";
import { trunkTipAt } from "./Elephant";

// A cena `elephants` prende a linha do registro à ponta da tromba: o desenho precisa continuar a dá-la aqui.
test("a ponta da tromba fica onde as cenas a esperam", () => {
  expect(trunkTipAt(0, 0)).toEqual([-214, -34]);
  expect(trunkTipAt(1, 0)).toEqual([-202, -190]);
});
