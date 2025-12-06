import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { writeJson } from "../utils/storage.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function resolveInputPath(filename) {
  if (path.isAbsolute(filename)) return filename;
  return path.join(process.cwd(), filename);
}

// Parse une ligne de créneau CRU officiel, par ex. :
// 1, C1, P=24, H=J 10:00-12:00, F1, S=P202//
function parseSlotLine(line, currentCourseCode) {
  const cleaned = line.replace(/\/\/\s*$/, "");
  const parts = cleaned.split(",").map(p => p.trim()).filter(p => p.length > 0);

  if (parts.length < 2) return null;

  const lineNo = parts[0];     // "1"
  const typeCode = parts[1];   // "C1", "D1", "T1"...

  let capacity = null;
  let day = null;
  let startTime = null;
  let endTime = null;
  let subgroup = null;
  let room = null;

  for (const part of parts.slice(2)) {
    if (part.startsWith("P=")) {
      capacity = Number(part.slice(2));
    } else if (part.startsWith("H=")) {
      // H=J 10:00-12:00 ou H=MA 8:00-12:00
      const h = part.slice(2).trim();
      const [d, times] = h.split(/\s+/, 2);
      day = d; // J, MA, ME, V...
      if (times) {
        const [start, end] = times.split("-");
        startTime = start;
        endTime = end;
      }
    } else if (part.startsWith("S=")) {
      room = part.slice(2).trim();
    } else if (/^F\d+$/i.test(part)) {
      subgroup = part; // F1, F2...
    }
  }

  return {
    courseCode: currentCourseCode,
    lineNo,
    typeCode,
    capacity,
    day,
    startTime,
    endTime,
    subgroup,
    room
  };
}

export function importOfficialCruFile(inputFilename) {
  const fullPath = resolveInputPath(inputFilename);

  if (!fs.existsSync(fullPath)) {
    throw new Error("Fichier CRU officiel introuvable : " + fullPath);
  }

  const raw = fs.readFileSync(fullPath, "utf-8");
  const lines = raw.split(/\r?\n/);

  const slots = [];
  const courseMap = {}; // code -> { code, slotsCount, maxCapacity }

  let currentCourseCode = null;

  for (let rawLine of lines) {
    const line = rawLine.trim();
    if (line.length === 0) continue;

    // Début de cours : ligne "+MC01"
    if (line.startsWith("+")) {
      currentCourseCode = line.slice(1).trim(); // "+MC01" -> "MC01"
      if (!courseMap[currentCourseCode]) {
        courseMap[currentCourseCode] = {
          code: currentCourseCode,
          slotsCount: 0,
          maxCapacity: 0
        };
      }
      continue;
    }

    // Créneau : "1,C1,P=24,H=J 10:00-12:00,F1,S=P202//"
    if (/^\d+,/.test(line) && currentCourseCode) {
      const slot = parseSlotLine(line, currentCourseCode);
      if (!slot) continue;

      slots.push(slot);

      const c = courseMap[currentCourseCode];
      c.slotsCount += 1;
      if (typeof slot.capacity === "number" && slot.capacity > c.maxCapacity) {
        c.maxCapacity = slot.capacity;
      }
    }
  }

  const courses = Object.values(courseMap);

  // On stocke les résultats dans src/data/
  writeJson("cru-slots.json", slots);
  writeJson("cru-cours.json", courses);

  return {
    file: fullPath,
    slotsCount: slots.length,
    coursesCount: courses.length
  };
}
