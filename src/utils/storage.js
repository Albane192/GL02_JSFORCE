import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function dataPath(filename) {
  return path.join(__dirname, "..", "data", filename);
}

// Lecture JSON (retourne [] si fichier vide)
export function readJson(filename) {
  const full = dataPath(filename);
  if (!fs.existsSync(full)) return [];
  const raw = fs.readFileSync(full, "utf-8");
  return JSON.parse(raw || "[]");
}

// Écriture JSON
export function writeJson(filename, data) {
  const full = dataPath(filename);
  fs.writeFileSync(full, JSON.stringify(data, null, 2), "utf-8");
}
