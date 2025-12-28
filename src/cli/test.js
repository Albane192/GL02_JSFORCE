#!/usr/bin/env node

import {
  cmdListSalles,
  cmdListReservations,
  cmdReserve,
  cmdDeleteReservation,
  cmdSalleInfo,
  cmdCoursInfo,
  cmdFindSalle,
  cmdExportICal,
  cmdExportCRU,
  cmdStatsOccupation,
  cmdLogin,
  cmdWhoAmI,
  cmdImportCRU,
  cmdCruCoursInfo,
  cmdCruSalleInfo,
  cmdCruExportICal,
  cmdCruCheckConflicts,
} from "../core/commands.js";
async function main() {
  const args = process.argv.slice(2);
  const cmd = args[0];

  // ----------- LOGIN / WHOAMI -----------
  if (cmd === "login") {
    const userId = args[1];
    if (!userId) {
      console.log("Usage : sru login <idUtilisateur>");
      return;
    }
    cmdLogin(userId);
    return;
  }

  if (cmd === "whoami") {
    cmdWhoAmI();
    return;
  }

  // ----------- LIST -----------

  if (cmd === "list" && args[1] === "salles") {
    cmdListSalles();
    return;
  }

  if (cmd === "list" && args[1] === "reservations") {
    cmdListReservations();
    return;
  }

  // ----------- SALLE-INFO / COURS-INFO -----------

  if (cmd === "salle-info") {
    const idSalle = args[1];
    const start = args[2];
    const end = args[3];

    if (!idSalle || !start || !end) {
      console.log(
        "Usage : sru salle-info <idSalle> <dateDebutISO> <dateFinISO>"
      );
      return;
    }

    cmdSalleInfo(idSalle, start, end);
    return;
  }

  if (cmd === "cours-info") {
    const idCours = args[1];
    if (!idCours) {
      console.log("Usage : sru cours-info <idCours>");
      return;
    }
    cmdCoursInfo(idCours);
    return;
  }

  // ----------- FIND-SALLE -----------

  if (cmd === "find-salle") {
    const nbPers = args[1];
    const start = args[2];
    const end = args[3];

    if (!nbPers || !start || !end) {
      console.log("Usage : sru find-salle <nbPersonnes> <startISO> <endISO>");
      return;
    }

    cmdFindSalle(nbPers, start, end);
    return;
  }

  // ----------- STATS-OCCUPATION -----------

  if (cmd === "stats-occupation") {
    const start = args[1];
    const end = args[2];

    if (!start || !end) {
      console.log("Usage : sru stats-occupation <dateDebutISO> <dateFinISO>");
      return;
    }

    cmdStatsOccupation(start, end);
    return;
  }

  // ----------- RESERVE / DELETE -----------

  if (cmd === "reserve") {
    const [salle, start, end, ...opts] = args.slice(1);

    const data = { salle, start, end };

    for (let i = 0; i < opts.length; i += 2) {
      const key = opts[i];
      const value = opts[i + 1];

      if (key === "--prof") data.prof = value;
      if (key === "--groupe") data.groupe = value;
      if (key === "--cours") data.cours = Number(value);
    }

    cmdReserve(data);
    return;
  }

  if (cmd === "delete" && args[1] === "reservation") {
    const id = Number(args[2]);
    cmdDeleteReservation(id);
    return;
  }

  // ----------- EXPORT -----------

  if (cmd === "export" && args[1] === "ical") {
    const idResa = Number(args[2]);
    const filename = args[3] || `resa-${idResa}.ics`;

    if (isNaN(idResa)) {
      console.log("Usage : sru export ical <idReservation> [fichier]");
      return;
    }

    cmdExportICal(idResa, filename);
    return;
  }

  if (cmd === "export" && args[1] === "cru") {
    const filename = args[2] || "planning.cru";
    cmdExportCRU(filename);
    return;
  }

  // ----------- IMPORT CRU OFFICIEL -----------

  if (cmd === "import" && args[1] === "cru") {
    const filename = args[2];

    if (!filename) {
      console.log("Usage : sru import cru <cheminFichierCruOfficiel>");
      return;
    }

    cmdImportCRU(filename);
    return;
  }

  // ----------- CRU-COURS-INFO -----------
  if (cmd === "cru-cours-info") {
    const codeCours = args[1];
    if (!codeCours) {
      console.log("Usage : sru cru-cours-info <codeCoursCRU>");
      return;
    }
    cmdCruCoursInfo(codeCours);
    return;
  }

  // ----------- CRU-SALLE-INFO -----------
  if (cmd === "cru-salle-info") {
    const idSalle = args[1];
    if (!idSalle) {
      console.log("Usage : sru cru-salle-info <idSalle>");
      return;
    }
    cmdCruSalleInfo(idSalle);
    return;
  }

  // ----------- CRU-EXPORT-ICAL -----------
  if (cmd === "cru-export-ical") {
    const codeCours = args[1];
    const startDate = args[2];
    const endDate = args[3];
    const filename = args[4];

    if (!codeCours || !startDate || !endDate) {
      console.log(
        "Usage : sru cru-export-ical <codeCoursCRU> <dateDebut> <dateFin> [fichier]"
      );
      console.log(
        "Exemple : sru cru-export-ical AP03 2025-03-01 2025-03-31 ap03-mars.ics"
      );
      return;
    }

    cmdCruExportICal(codeCours, startDate, endDate, filename);
    return;
  }

  // ----------- CRU-CHECK-CONFLICTS -----------
  if (cmd === "cru-check-conflicts") {
    cmdCruCheckConflicts();
    return;
  }

  // ----------- HELP PAR DÉFAUT -----------

  console.log(`Commande inconnue.

Commandes disponibles :
  sru login <idUtilisateur>
  sru whoami
  sru list salles
  sru list reservations
  sru salle-info <idSalle> <dateDebutISO> <dateFinISO>
  sru cours-info <idCours>
  sru cru-cours-info <codeCoursCRU>
  sru cru-salle-info <idSalle>
  sru cru-export-ical <codeCoursCRU> <dateDebut> <dateFin> [fichier]
  sru cru-check-conflicts
  sru find-salle <nbPersonnes> <startISO> <endISO>
  sru stats-occupation <dateDebutISO> <dateFinISO>
  sru reserve <salle> <start> <end> --prof <idProf> --groupe <idGroupe> --cours <idCours>
  sru delete reservation <id>
  sru export ical <idReservation> [fichier]
  sru export cru [fichier]
  sru import cru <cheminFichierCruOfficiel>
`);
}

main();
