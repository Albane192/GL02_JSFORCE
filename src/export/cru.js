import fs from "fs";

export function reservationsToCRU(resas) {
  const lines = [];

  for (const r of resas) {
    lines.push(
      `RESERVATION;ID=${r.id};SALLE=${r.salle};PROF=${r.enseignant};GROUPE=${r.groupe};COURS=${r.coursId};START=${r.start};END=${r.end}`
    );
  }

  return lines.join("\n") + "\n";
}

export function writeCRUFile(resas, filename) {
  const cru = reservationsToCRU(resas);
  fs.writeFileSync(filename, cru, "utf-8");
}
