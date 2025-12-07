# 📘 README — SRU Planning

---

## 📑 Sommaire
- Présentation
- Fonctionnalités principales
- Installation
- Jeux de données
- Système d'utilisateurs
- Commandes disponibles
- Tests rapides
- Écarts au cahier des charges

---

# 🏛️ Présentation

SRU Planning est un outil en ligne de commande permettant :
- d’importer des données CRU,
- consulter les UV, salles et créneaux,
- rechercher des salles disponibles,
- créer des réservations internes,
- exporter des fichiers iCalendar,
- analyser l’occupation des salles.

---

# 🚀 Fonctionnalités principales
- Import CRU officiel
- Lecture des UV, salles, créneaux
- Réservations internes sans chevauchement
- Export iCalendar
- Statistiques d’occupation
- Vérification de conflits CRU

---

# 🛠️ Installation

## Prérequis
- Node.js ≥ 20

## Installation locale
cd sru-planning
npm install

## Installation globale
npm link

Utilisation : sru <commande>

---

# 📂 Jeux de données
Dossier src/data/ : salles.json, cours.json, reservations.json, users.json,
cru-cours.json et cru-slots.json générés par :
sru login admin
sru import cru edt.cru

---

# 👥 Système d’utilisateurs
Définis dans src/data/users.json.
Ajouter un utilisateur = ajouter une ligne JSON.

---

# 💻 Commandes disponibles

## Authentification
sru login <id>
sru whoami

## Consultation interne
sru list salles
sru list reservations
sru salle-info <salle> <start> <end>
sru cours-info <idCours>

## Réservations
sru reserve <salle> <start> <end> --prof X --groupe Y --cours Z
sru delete reservation <id> (admin)

## Recherche
sru find-salle <capacité> <start> <end>

## Statistiques
sru stats-occupation <start> <end> (admin)

## Commandes CRU
sru import cru <file> (admin)
sru cru-cours-info <UV>
sru cru-salle-info <salle>
sru cru-export-ical <UV> <d1> <d2> [ics]
sru cru-check-conflicts (admin)

---

# 🧪 Tests rapides
sru login admin
sru import cru edt.cru
sru cru-cours-info AP03
sru cru-salle-info B103
sru cru-check-conflicts

sru login dupont
sru reserve A101 2025-03-20T09:00 2025-03-20T11:00 --prof dupont --groupe L2INFO --cours 1

sru cru-export-ical AP03 2025-03-01 2025-03-31 ap03.ics

sru login admin
sru stats-occupation 2025-03-01T00:00 2025-03-31T23:59

---

# ✅ Tests unitaires automatisés

Le projet intègre également des **tests unitaires automatisés** à l’aide du **test runner natif de Node.js** (`node --test`).  
Aucune bibliothèque externe (Jest, Mocha, etc.) n’est utilisée.

---

## 📁 Emplacement des tests

Les tests sont situés dans le dossier : /tests


Fichiers présents :

- `datetime.test.js` → tests des fonctions de gestion des dates (`parseDateTime`, `overlaps`)
- `user.test.js` → tests du système d’utilisateurs (login, utilisateur courant)
- `cru-quality.test.js` → tests du contrôle de qualité des données CRU


---

# ⚠️ Écarts au cahier des charges
- Utilisateurs statiques car non demandé
- Pas de séances multi-salles (non spécifié)
- Conflits CRU limités aux salles
- Pas de tests automatisés, tests manuels fournis

---

