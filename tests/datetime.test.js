import test from "node:test";
import assert from "node:assert/strict";
import { parseDateTime, overlaps } from "../src/utils/datetime.js";

test("parseDateTime retourne un objet Date correct", () => {
  const d = parseDateTime("2025-03-10T10:00");
  assert.ok(d instanceof Date, "parseDateTime doit retourner un Date");
  assert.equal(d.getFullYear(), 2025);
  assert.equal(d.getMonth(), 2); // Mars = 2 (0 = janvier)
  assert.equal(d.getDate(), 10);
  assert.equal(d.getHours(), 10);
});

test("overlaps détecte les chevauchements", () => {
  const a1 = parseDateTime("2025-03-10T10:00");
  const a2 = parseDateTime("2025-03-10T12:00");
  const b1 = parseDateTime("2025-03-10T11:00");
  const b2 = parseDateTime("2025-03-10T13:00");

  assert.equal(
    overlaps(a1, a2, b1, b2),
    true,
    "Les créneaux doivent se chevaucher"
  );
});

test("overlaps détecte aussi l'absence de chevauchement", () => {
  const a1 = parseDateTime("2025-03-10T08:00");
  const a2 = parseDateTime("2025-03-10T09:00");
  const b1 = parseDateTime("2025-03-10T10:00");
  const b2 = parseDateTime("2025-03-10T11:00");

  assert.equal(
    overlaps(a1, a2, b1, b2),
    false,
    "Les créneaux ne doivent pas se chevaucher"
  );
});
