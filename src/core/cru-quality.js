import { readJson } from "../utils/storage.js";

function parseTimeToMinutes(timeStr) {
  // "9:00" -> 540, "13:30" -> 810
  const [h, m] = timeStr.split(":").map(Number);
  return h * 60 + (m || 0);
}

// Retourne une liste de conflits
// Chaque conflit : { room, day, slots: [slot1, slot2] }
export function detectCruConflicts() {
  const slots = readJson("cru-slots.json");

  const byRoomDay = new Map(); // key "room|day" -> array of slots

  for (const s of slots) {
    if (!s.room || !s.day || !s.startTime || !s.endTime) continue;
    const key = `${s.room}|${s.day}`;
    if (!byRoomDay.has(key)) byRoomDay.set(key, []);
    byRoomDay.get(key).push(s);
  }

  const conflicts = [];

  for (const [key, group] of byRoomDay.entries()) {
    // on enrichit avec les temps en minutes
    const enriched = group.map(s => ({
      ...s,
      _startMin: parseTimeToMinutes(s.startTime),
      _endMin: parseTimeToMinutes(s.endTime)
    }));

    // tri par heure de début
    enriched.sort((a, b) => a._startMin - b._startMin);

    // détection de chevauchements
    for (let i = 0; i < enriched.length; i++) {
      for (let j = i + 1; j < enriched.length; j++) {
        const A = enriched[i];
        const B = enriched[j];

        // si B commence après ou exactement à la fin de A, pas de conflit pour A avec les suivants triés
        if (B._startMin >= A._endMin) break;

        // chevauchement : [startA, endA] avec [startB, endB]
        if (B._startMin < A._endMin) {
          const [room, day] = key.split("|");
          conflicts.push({
            room,
            day,
            slots: [A, B]
          });
        }
      }
    }
  }

  return conflicts;
}
