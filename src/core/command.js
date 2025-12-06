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

import { importOfficialCruFile } from "../import/cru-official.js";
import { cruGetCourseInfo, cruGetSalleInfo } from "./cru-queries.js";


//  INFOS SALLE / COURS
// ————————————————————————————————————————————————

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


//  IMPORT CRU OFFICIEL → JSON internes
// ————————————————————————————————————————————————

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


