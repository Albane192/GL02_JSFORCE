import { readJson } from "../utils/storage.js";

// Charge les données issues de l'import CRU officiel
function getCruSlots() {
  return readJson("cru-slots.json");
}

function getCruCourses() {
  return readJson("cru-cours.json");
}

// Infos pour un cours CRU donné (code comme "ME02", "MC01", etc.)
export function cruGetCourseInfo(courseCode) {
  const courses = getCruCourses();
  const slots = getCruSlots();

  const course = courses.find(c => c.code === courseCode) || null;
  const courseSlots = slots.filter(s => s.courseCode === courseCode);

  return { course, slots: courseSlots };
}

// Infos pour une salle donnée (ex: "B101")
export function cruGetSalleInfo(idSalle) {
  const slots = getCruSlots();

  const salleSlots = slots.filter(s => s.room === idSalle);

  let maxCapacity = 0;
  for (const s of salleSlots) {
    if (typeof s.capacity === "number" && s.capacity > maxCapacity) {
      maxCapacity = s.capacity;
    }
  }

  return {
    salle: idSalle,
    slots: salleSlots,
    maxCapacity
  };
}
