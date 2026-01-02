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

## Installation des packages pour Vega-Lite :

npm install vega vega-lite canvas

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

sru login <id> <mdp>
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
sru stats-capacite

## Commandes CRU

sru import cru <file> (admin)
sru cru-cours-info <UV>
sru cru-salle-info <salle>
sru cru-export-ical <UV> <d1> <d2> [ics]
sru cru-check-conflicts (admin)

---

# 🧪 Tests rapides

sru login admin adminmdp
sru import cru edt.cru
sru cru-cours-info AP03
sru cru-salle-info B103
sru cru-check-conflicts

sru login dupont dupontmdp
sru reserve A101 2025-03-20T09:00 2025-03-20T11:00 --prof dupont --groupe L2INFO --cours 1

sru cru-export-ical AP03 2025-03-01 2025-03-31 ap03.ics

sru login admin adminmdp
sru stats-occupation 2025-03-01T00:00 2025-03-31T23:59
sru stats-capacite

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

## Evolution et maintenance

L'évolution et la maintenance de ce projet est effectuée par l'équipe ALDACO (Marco Orfao, Damaris Barbot et Albane Verschelde).
Une série de 4 scénarios détaillant 10 tests particuliers ont été effectués. Parmi ces 10 tests, 3 ont été un succès, 6 ont été partiellement réussis et 1 a été un échec.
Pour assurer l'évolution de l'application, des tickets ont été attribués à chacun des membres de l'équipe ALDACO.
Pour assurer la maintenance de l'application, un guide décrivant l'organisation du programme destiné aux développeurs permettra de maintenir le code à moyen terme. Ce guide est accompagné d'un guide de démarrage utilisateur contenant les principales fonctions du logiciel. Ces deux guides sont accessibles depuis le wiki du dépôt.
Historique de l'évolution :
V1.1 : Ajout Vega-Lite pour statistiques d'occupation (ticket 6)
V1.2 : Ajout d'un système d'authentification (ticket 1)
V1.3 : Réglages des horaires pour les réservations (ticket 4)
V1.4 : Réglage pour cru-salle-info qui faisait une répétition d'informations (ticket 3)
V1.5 : Réglage de l'exportation de calendriers (ticket 2)
V1.6 : Réservation d'une salle inconnue rendue impossible (ticket 7)
V1.7 : Création de la commande sru stats-capacite (ticket 8)
V1.8 : Réglage conflit de réservation (ticket 5)