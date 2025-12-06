import { readJson, writeJson } from "../utils/storage.js";
import { parseDateTime, overlaps } from "../utils/datetime.js";

// --- LISTES DE BASE ---

export function listSalles() {
  return readJson("salles.json");
}

export function listReservations() {
  return readJson("reservations.json");
}

export function listCours() {
  return readJson("cours.json");
}

export function listEnseignants() {
  return readJson("enseignants.json");
}

export function listGroupes() {
  return readJson("groupes.json");
}

// --- ID AUTO-INCRÉMENTÉ ---

function nextReservationId(reservations) {
  const ids = reservations.map(r => r.id || 0);
  const max = ids.length ? Math.max(...ids) : 0;
  return max + 1;
}

// --- VÉRIFICATION DES CONFLITS ---

function checkConflicts(newResa, existing) {
  const startNew = parseDateTime(newResa.start);
  const endNew = parseDateTime(newResa.end);

  for (const r of existing) {
    const startR = parseDateTime(r.start);
    const endR = parseDateTime(r.end);

    if (overlaps(startNew, endNew, startR, endR)) {

      if (r.salle === newResa.salle) {
        return "Conflit : salle déjà réservée.";
      }

      if (r.enseignant === newResa.enseignant) {
        return "Conflit : enseignant déjà occupé.";
      }

      if (r.groupe === newResa.groupe) {
        return "Conflit : groupe déjà en cours.";
      }
    }
  }

  return null; // pas de conflit
}

// --- CRÉATION D'UNE RÉSERVATION ---

export function createReservation({ salle, enseignant, groupe, coursId, startStr, endStr }) {
  const reservations = listReservations();

  const newResa = {
    id: nextReservationId(reservations),
    salle,
    enseignant,
    groupe,
    coursId,
    start: startStr,
    end: endStr
  };

  const error = checkConflicts(newResa, reservations);
  if (error) {
    throw new Error(error);
  }

  reservations.push(newResa);
  writeJson("reservations.json", reservations);

  return newResa;
}

// --- SUPPRESSION ---

export function deleteReservation(id) {
  const reservations = listReservations();
  const index = reservations.findIndex(r => r.id === id);

  if (index === -1) {
    throw new Error("Réservation introuvable.");
  }

  const removed = reservations.splice(index, 1)[0];
  writeJson("reservations.json", reservations);

  return removed;
}
// --- INFOS SUR UNE SALLE ---

export function getSalleById(idSalle) {
  const salles = listSalles();
  return salles.find(s => s.id === idSalle) || null;
}

export function getReservationsForSalle(idSalle, startStr, endStr) {
  const all = listReservations();
  const start = parseDateTime(startStr);
  const end = parseDateTime(endStr);

  return all.filter(r => {
    if (r.salle !== idSalle) return false;
    const rs = parseDateTime(r.start);
    const re = parseDateTime(r.end);
    return overlaps(start, end, rs, re);
  }).sort((a, b) => a.start.localeCompare(b.start));
}

// --- INFOS SUR UN COURS ---

export function getCoursById(idCours) {
  const cours = listCours();
  return cours.find(c => String(c.id) === String(idCours)) || null;
}

export function getReservationsForCours(idCours) {
  const all = listReservations();
  return all
    .filter(r => String(r.coursId) === String(idCours))
    .sort((a, b) => a.start.localeCompare(b.start));
}

// --- DISPONIBILITÉ DES SALLES ---

export function isSalleLibre(idSalle, startStr, endStr) {
  const resas = listReservations();
  const startNew = parseDateTime(startStr);
  const endNew = parseDateTime(endStr);

  for (const r of resas) {
    if (r.salle !== idSalle) continue;

    const startR = parseDateTime(r.start);
    const endR = parseDateTime(r.end);

    if (overlaps(startNew, endNew, startR, endR)) {
      return false; // salle occupée
    }
  }
  return true; // aucun chevauchement
}

export function findBestSalle(nbPersonnes, startStr, endStr) {
  const salles = listSalles();

  // 1. Filtrer les salles libres sur le créneau
  const libres = salles.filter(s => isSalleLibre(s.id, startStr, endStr));

  // 2. Filtrer celles dont la capacité suffit
  const assezGrandes = libres.filter(s => s.capacite >= nbPersonnes);

  if (assezGrandes.length === 0) {
    return null; // aucune salle adaptée
  }

  // 3. Choisir celle avec la capacité la plus proche au-dessus du besoin
  assezGrandes.sort((a, b) => (a.capacite - nbPersonnes) - (b.capacite - nbPersonnes));

  return assezGrandes[0];
}

// --- STATS D'OCCUPATION DES SALLES ---

function intersectionMinutes(startA, endA, startB, endB) {
  const start = startA > startB ? startA : startB;
  const end = endA < endB ? endA : endB;
  if (end <= start) return 0;
  return (end - start) / 60000; // minutes
}

export function getSalleOccupationStats(startStr, endStr) {
  const salles = listSalles();
  const resas = listReservations();

  const periodStart = parseDateTime(startStr);
  const periodEnd = parseDateTime(endStr);
  const totalMinutes = (periodEnd - periodStart) / 60000;

  if (totalMinutes <= 0) {
    throw new Error("Période invalide.");
  }

  return salles.map(salle => {
    let occupiedMinutes = 0;

    for (const r of resas) {
      if (r.salle !== salle.id) continue;

      const rs = parseDateTime(r.start);
      const re = parseDateTime(r.end);

      const minutes = intersectionMinutes(periodStart, periodEnd, rs, re);
      occupiedMinutes += minutes;
    }

    const rate = (occupiedMinutes / totalMinutes) * 100;

    return {
      id: salle.id,
      capacite: salle.capacite,
      occupiedMinutes,
      totalMinutes,
      taux: rate
    };
  });
}

