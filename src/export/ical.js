import fs from "fs";

export function reservationToICal(resa) {
  // On convertit "2025-03-10T09:00" en "20250310T090000"
  const dtStart = resa.start.replace(/[-:]/g, "").replace("T", "T") + "00";
  const dtEnd = resa.end.replace(/[-:]/g, "").replace("T", "T") + "00";

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//SRU//Planning//FR",
    "BEGIN:VEVENT",
    `UID:RESA-${resa.id}@sru`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:Cours ${resa.coursId}`,
    `LOCATION:${resa.salle}`,
    "END:VEVENT",
    "END:VCALENDAR",
    ""
  ].join("\r\n");
}

export function writeICalFile(resa, filename) {
  const ical = reservationToICal(resa);
  fs.writeFileSync(filename, ical, "utf-8");
}
