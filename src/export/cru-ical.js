import fs from "fs";

// Convertit "2025-03-10T09:00:00" en "20250310T090000"
function formatDateTimeForICal(date) {
  const pad = n => String(n).padStart(2, "0");

  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hour = pad(date.getHours());
  const min = pad(date.getMinutes());
  const sec = pad(date.getSeconds());

  return `${year}${month}${day}T${hour}${min}${sec}`;
}

function dayCodeToWeekdayIndex(dayCode) {
  // retourne un index JS (0=dimanche, 1=lundi, ..., 6=samedi)
  const d = dayCode.toUpperCase();
  switch (d) {
    case "L":
    case "LU":
      return 1;
    case "MA":
      return 2;
    case "ME":
      return 3;
    case "J":
      return 4;
    case "V":
      return 5;
    case "S":
    case "SA":
      return 6;
    case "D":
      return 0;
    default:
      return null;
  }
}

// startDateStr / endDateStr sous forme "2025-03-01"
function generateEventsFromCruSlots(courseCode, slots, startDateStr, endDateStr) {
  const events = [];

  const startDate = new Date(startDateStr + "T00:00:00");
  const endDate = new Date(endDateStr + "T23:59:59");

  for (const slot of slots) {
    const weekdayIndex = dayCodeToWeekdayIndex(slot.day);
    if (weekdayIndex === null) continue;

    // trouver le premier jour dans [startDate, endDate] qui a ce weekday
    let current = new Date(startDate.getTime());
    while (current.getDay() !== weekdayIndex) {
      current.setDate(current.getDate() + 1);
      if (current > endDate) break;
    }
    if (current > endDate) continue;

    // parse heure "HH:MM"
    const parseTime = (baseDate, timeStr) => {
      const [h, m] = timeStr.split(":").map(Number);
      const d = new Date(baseDate.getTime());
      d.setHours(h, m, 0, 0);
      return d;
    };

    // boucle hebdomadaire
    while (current <= endDate) {
      const dtStart = parseTime(current, slot.startTime);
      const dtEnd = parseTime(current, slot.endTime);

      const uid = `CRU-${courseCode}-${slot.lineNo}-${dtStart.getTime()}@sru`;

      events.push({
        dtStart,
        dtEnd,
        summary: `Cours ${courseCode} (${slot.typeCode})`,
        location: slot.room,
        uid
      });

      // semaine suivante
      current = new Date(current.getTime());
      current.setDate(current.getDate() + 7);
    }
  }

  return events;
}

export function writeCruICalForCourse(courseCode, slots, startDateStr, endDateStr, filename) {
  const events = generateEventsFromCruSlots(courseCode, slots, startDateStr, endDateStr);

  const lines = [];
  lines.push("BEGIN:VCALENDAR");
  lines.push("VERSION:2.0");
  lines.push("PRODID:-//SRU//CRU-Planning//FR");

  for (const ev of events) {
    lines.push("BEGIN:VEVENT");
    lines.push(`UID:${ev.uid}`);
    lines.push(`DTSTART:${formatDateTimeForICal(ev.dtStart)}`);
    lines.push(`DTEND:${formatDateTimeForICal(ev.dtEnd)}`);
    lines.push(`SUMMARY:${ev.summary}`);
    lines.push(`LOCATION:${ev.location}`);
    lines.push("END:VEVENT");
  }

  lines.push("END:VCALENDAR");
  lines.push("");

  fs.writeFileSync(filename, lines.join("\r\n"), "utf-8");
  return events.length;
}
