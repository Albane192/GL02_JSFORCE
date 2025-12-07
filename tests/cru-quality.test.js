import test from "node:test";
import assert from "node:assert/strict";
import { detectCruConflicts } from "../src/core/cru-quality.js";

test("detectCruConflicts retourne un tableau (même vide)", () => {
  const conflicts = detectCruConflicts();
  assert.ok(Array.isArray(conflicts), "detectCruConflicts doit retourner un tableau");

  // On ne teste pas forcément un nombre précis de conflits,
  // car cela dépend des données CRU importées.
});