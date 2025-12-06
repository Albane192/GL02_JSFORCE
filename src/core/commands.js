import {
  listSalles,
  listReservations,
  createReservation,
  deleteReservation as coreDeleteReservation,
  getSalleById,
  getReservationsForSalle,
  getCoursById,
  getReservationsForCours,
  findBestSalle,
  getSalleOccupationStats
} from "./scheduler.js";

import { writeICalFile } from "../export/ical.js";
import { writeCRUFile } from "../export/cru.js";
import { getCurrentUser, setCurrentUser, findUserById } from "../utils/user.js";
import { importOfficialCruFile } from "../import/cru-official.js";
import { cruGetCourseInfo, cruGetSalleInfo } from "./cru-queries.js";
import { writeCruICalForCourse } from "../export/cru-ical.js";
import { detectCruConflicts } from "./cru-quality.js";



// ===================================================================
//  UTILITAIRE DE PERMISSIONS
// ===================================================================

function requireUser(roles = null) {
  const user = getCurrentUser();
  if (!user) {
    console.error("Erreur : aucun utilisateur connecté. Utilise 'sru login <idUtilisateur>'.");
    return null;
  }

  if (roles && !roles.includes(user.role)) {
    console.error(
      `Erreur : permission refusée. Rôle actuel = ${user.role}, rôles autorisés = ${roles.join(", ")}`
    );
    return null;
  }

  return user;
}

// ===================================================================
//  COMMANDES DE LISTE
// ===================================================================

export function cmdListSalles() {
  const salles = listSalles();
  salles.forEach(s => {
    console.log(`${s.id} (capacité ${s.capacite}) [${(s.equipements || []).join(", ")}]`);
  });
}

export function cmdListReservations() {
  const resas = listReservations();
  if (resas.length === 0) {
    console.log("Aucune réservation.");
    return;
  }

  resas.forEach(r => {
    console.log(
      `#${r.id} salle=${r.salle} prof=${r.enseignant} ` +
      `groupe=${r.groupe} ${r.start} -> ${r.end}`
    );
  });
}

// ===================================================================
//  RESERVATION / SUPPRESSION
// ===================================================================

export function cmdReserve(args) {
  const user = requireUser(["enseignant", "admin", "etudiant"]);
  if (!user) return;

  const { salle, start, end, prof, groupe, cours } = args;

  try {
    const resa = createReservation({
      salle,
      enseignant: prof,
      groupe,
      coursId: cours,
      startStr: start,
      endStr: end
    });

    console.log("Réservation créée :", resa);
  } catch (e) {
    console.error("Erreur :", e.message);
  }
}

export function cmdDeleteReservation(id) {
  const user = requireUser(["admin"]);
  if (!user) return;

  try {
    const removed = coreDeleteReservation(id);
    console.log("Réservation supprimée :", removed);
  } catch (e) {
    console.error("Erreur :", e.message);
  }
}

// ===================================================================
//  INFOS SALLE / COURS
// ===================================================================

export function cmdSalleInfo(idSalle, startStr, endStr) {
  const salle = getSalleById(idSalle);
  if (!salle) {
    console.error("Salle inconnue :", idSalle);
    return;
  }

  console.log(`Salle ${salle.id}`);
  console.log(`  Capacité : ${salle.capacite}`);
  console.log(`  Équipements : ${(salle.equipements || []).join(", ")}`);
  console.log("");

  console.log(`Occupation entre ${startStr} et ${endStr} :`);
  const resas = getReservationsForSalle(idSalle, startStr, endStr);

  if (resas.length === 0) {
    console.log("  Aucune réservation.");
    return;
  }

  for (const r of resas) {
    console.log(
      `  #${r.id} cours=${r.coursId} prof=${r.enseignant} ` +
      `groupe=${r.groupe} ${r.start} -> ${r.end}`
    );
  }
}

export function cmdCoursInfo(idCours) {
  const cours = getCoursById(idCours);
  if (!cours) {
    console.error("Cours inconnu :", idCours);
    return;
  }

  console.log(`Cours ${cours.id} — ${cours.intitule}`);
  console.log(`  Enseignant : ${cours.enseignant}`);
  console.log(`  Groupe : ${cours.groupe}`);
  if (cours.type) console.log(`  Type : ${cours.type}`);
  console.log("");

  const resas = getReservationsForCours(idCours);

  console.log("Créneaux réservés :");
  if (resas.length === 0) {
    console.log("  Aucun créneau réservé.");
    return;
  }

  for (const r of resas) {
    console.log(
      `  #${r.id} salle=${r.salle} ${r.start} -> ${r.end}`
    );
  }
}

// ===================================================================
//  RECHERCHE DE LA MEILLEURE SALLE
// ===================================================================

export function cmdFindSalle(nbPersonnes, startStr, endStr) {
  const n = Number(nbPersonnes);
  if (isNaN(n) || n <= 0) {
    console.error("Nombre de personnes invalide :", nbPersonnes);
    return;
  }

  const salle = findBestSalle(n, startStr, endStr);

  if (!salle) {
    console.log("Aucune salle disponible avec une capacité suffisante pour ce créneau.");
    return;
  }

  console.log(`Meilleure salle disponible : ${salle.id}`);
  console.log(`  Capacité : ${salle.capacite}`);
  console.log(`  Équipements : ${(salle.equipements || []).join(", ")}`);
}

// ===================================================================
//  EXPORTS ICAL / CRU
// ===================================================================

export function cmdExportICal(idResa, filename) {
  const user = requireUser();
  if (!user) return;

  const resas = listReservations();
  const resa = resas.find(r => r.id === idResa);

  if (!resa) {
    console.error("Réservation introuvable :", idResa);
    return;
  }

  writeICalFile(resa, filename);
  console.log("Fichier iCalendar généré :", filename);
}

export function cmdExportCRU(filename) {
  const user = requireUser(["admin"]);
  if (!user) return;

  const resas = listReservations();
  writeCRUFile(resas, filename);
  console.log("Fichier CRU généré :", filename);
}

// ===================================================================
//  STATS D'OCCUPATION
// ===================================================================

export function cmdStatsOccupation(startStr, endStr) {
  const user = requireUser(["admin"]);
  if (!user) return;

  try {
    const stats = getSalleOccupationStats(startStr, endStr);

    console.log(`Taux d'occupation des salles entre ${startStr} et ${endStr} :`);
    console.log("");

    stats.forEach(s => {
      const taux = s.taux.toFixed(1);
      const barLength = Math.round(s.taux / 5);
      const bar = "#".repeat(barLength);

      console.log(`${s.id} : ${taux}%`);
      if (barLength > 0) {
        console.log(`  ${bar}`);
      }
      console.log("");
    });
  } catch (e) {
    console.error("Erreur :", e.message);
  }
}

// ===================================================================
//  IMPORT CRU OFFICIEL → JSON internes
// ===================================================================

export function cmdImportCRU(inputFilename) {
  const user = requireUser(["admin"]);
  if (!user) return;

  try {
    const result = importOfficialCruFile(inputFilename);
    console.log(
      `Import CRU officiel terminé depuis ${result.file} : ` +
      `${result.coursesCount} cours, ${result.slotsCount} créneau(x).`
    );
    console.log("Fichiers générés : src/data/cru-slots.json et src/data/cru-cours.json");
  } catch (e) {
    console.error("Erreur lors de l'import CRU officiel :", e.message);
  }
}

// ===================================================================
//  LOGIN / WHOAMI
// ===================================================================

export function cmdLogin(userId) {
  const user = findUserById(userId);
  if (!user) {
    console.error("Utilisateur inconnu :", userId);
    return;
  }
  setCurrentUser(userId);
  console.log(`Connecté en tant que ${user.nom} (${user.role})`);
}

export function cmdWhoAmI() {
  const user = getCurrentUser();
  if (!user) {
    console.log("Aucun utilisateur connecté.");
    return;
  }
  console.log(`Utilisateur courant : ${user.nom} (${user.role}) [id=${user.id}]`);
}

// ===================================================================
//  COMMANDES DE CONSULTATION DES DONNÉES CRU OFFICIELLES
// ===================================================================

export function cmdCruCoursInfo(codeCours) {
  const user = requireUser(); // n'importe quel utilisateur connecté
  if (!user) return;

  const { course, slots } = cruGetCourseInfo(codeCours);

  if (!course) {
    console.error("Cours CRU inconnu :", codeCours);
    return;
  }

  console.log(`Cours CRU ${course.code}`);
  console.log(`  Nombre de créneaux : ${course.slotsCount}`);
  console.log(`  Capacité max : ${course.maxCapacity}`);
  console.log("");
  console.log("Créneaux :");

  if (slots.length === 0) {
    console.log("  Aucun créneau trouvé.");
    return;
  }

  for (const s of slots) {
    console.log(
      `  ${s.day} ${s.startTime}-${s.endTime} ` +
      `Salle=${s.room} Type=${s.typeCode} Cap=${s.capacity} Sous-groupe=${s.subgroup || "-"}`
    );
  }
}

export function cmdCruSalleInfo(idSalle) {
  const user = requireUser(); // n'importe quel utilisateur connecté
  if (!user) return;

  const { salle, slots, maxCapacity } = cruGetSalleInfo(idSalle);

  console.log(`Salle CRU ${salle}`);
  console.log(`  Capacité max observée : ${maxCapacity || "inconnue"}`);
  console.log("");
  console.log("Créneaux :");

  if (slots.length === 0) {
    console.log("  Aucun créneau dans les données CRU.");
    return;
  }

  for (const s of slots) {
    console.log(
      `  Cours=${s.courseCode} ${s.day} ${s.startTime}-${s.endTime} ` +
      `Type=${s.typeCode} Cap=${s.capacity} Sous-groupe=${s.subgroup || "-"}`
    );
  }
}


// ===================================================================
//  EXPORT ICALENDAR À PARTIR DES CRÉNEAUX CRU
// ===================================================================

export function cmdCruExportICal(codeCours, startDateStr, endDateStr, filename) {
  const user = requireUser(); // n'importe quel utilisateur connecté
  if (!user) return;

  const { course, slots } = cruGetCourseInfo(codeCours);
  if (!course) {
    console.error("Cours CRU inconnu :", codeCours);
    return;
  }
  if (!slots || slots.length === 0) {
    console.error("Aucun créneau CRU pour ce cours :", codeCours);
    return;
  }

  const outFile = filename || `${codeCours}.ics`;

  try {
    const count = writeCruICalForCourse(codeCours, slots, startDateStr, endDateStr, outFile);
    console.log(
      `iCalendar généré pour le cours ${codeCours} entre ${startDateStr} et ${endDateStr} :`
    );
    console.log(`  Fichier : ${outFile}`);
    console.log(`  Nombre d'événements : ${count}`);
  } catch (e) {
    console.error("Erreur lors de la génération iCalendar CRU :", e.message);
  }
}

// ===================================================================
//  VERIFICATION QUALITE CRU : DETECTION DES CONFLITS
// ===================================================================

export function cmdCruCheckConflicts() {
  const user = requireUser(["admin"]);
  if (!user) return;

  const conflicts = detectCruConflicts();

  if (conflicts.length === 0) {
    console.log("Aucun conflit détecté dans les données CRU (par salle/jour/créneau).");
    return;
  }

  console.log(`Conflits détectés dans les données CRU : ${conflicts.length}`);
  console.log("");

  conflicts.forEach((c, index) => {
    console.log(
      `Conflit ${index + 1} — Salle ${c.room}, jour ${c.day}`
    );

    const [A, B] = c.slots;
    console.log(
      `  Slot 1 : cours=${A.courseCode} ${A.startTime}-${A.endTime} type=${A.typeCode} cap=${A.capacity}`
    );
    console.log(
      `  Slot 2 : cours=${B.courseCode} ${B.startTime}-${B.endTime} type=${B.typeCode} cap=${B.capacity}`
    );
    console.log("");
  });
}
