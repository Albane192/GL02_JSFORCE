import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { readJson } from "./storage.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function statePath(filename) {
  return path.join(__dirname, "..", filename);
}

function currentUserFile() {
  return statePath("current-user.txt");
}

export function listUsers() {
  return readJson("users.json");
}

export function findUserById(id) {
  const users = listUsers();
  return users.find(u => u.id === id) || null;
}

export function setCurrentUser(id) {
  fs.writeFileSync(currentUserFile(), id, "utf-8");
}

export function getCurrentUser() {
  const file = currentUserFile();
  if (!fs.existsSync(file)) return null;

  const id = fs.readFileSync(file, "utf-8").trim();
  if (!id) return null;

  return findUserById(id);
}
