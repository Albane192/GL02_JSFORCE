import test from "node:test";
import assert from "node:assert/strict";
import { findUserById, setCurrentUser, getCurrentUser } from "../src/utils/user.js";

test("findUserById retrouve un utilisateur existant", () => {
  const admin = findUserById("admin");
  assert.ok(admin, "L'utilisateur admin doit exister dans users.json");
  assert.equal(admin.id, "admin");
  assert.ok(admin.nom, "L'utilisateur doit avoir un nom");
  assert.ok(admin.role, "L'utilisateur doit avoir un rôle");
});

test("setCurrentUser et getCurrentUser fonctionnent ensemble", () => {
  setCurrentUser("admin");
  const current = getCurrentUser();

  assert.ok(current, "Il devrait y avoir un utilisateur courant après login");
  assert.equal(current.id, "admin");
});