// Parse une date ISO simple : "2025-03-15T09:00"
export function parseDateTime(str) {
  const d = new Date(str);
  if (isNaN(d.getTime())) {
    throw new Error("Date/heure invalide: " + str);
  }
  return d;
}

// Vérifie le chevauchement entre deux intervalles
export function overlaps(startA, endA, startB, endB) {
  return startA < endB && startB < endA;
}
