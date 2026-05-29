---
title: "Ma Ville Agenda — PRD MVP"
status: final
created: 2026-05-29
updated: 2026-05-29
language: fr
---

# PRD : Ma Ville Agenda — MVP

## Vision

**Ma Ville Agenda** est une application mobile (iOS et Android) qui agrège et présente l'agenda complet de la commune de Léognan : culture, sport, animation, commerce, vie associative. Elle offre aux habitants un point d'entrée unique pour découvrir ce qui se passe dans leur commune, sans effort.

Le MVP démontre le concept avec des données de démonstration. L'objectif : valider l'intérêt, prendre date avant la mairie, et établir la preuve qu'une initiative citoyenne peut devancer l'institution.

---

## Utilisateurs cibles (MVP)

**L'habitant curieux** — abonné à quelques pages Facebook mais las de chercher. Il veut savoir ce qui se passe ce week-end sans effort. Il consomme l'agenda de manière ponctuelle, recherche par catégorie ou date, clique sur un événement pour voir les détails (horaire, lieu, description, lien éventuel).

[HYPOTHÈSE] : utilisateur sur smartphone, consultation mobile-first. Pas de création de compte, pas de notification, accès en lecture seule.

---

## User Journeys

### UJ1 — Consultation d'un événement (habitant)

> Léa habite à Léognan. Dimanche soir, elle se demande : "y a-t-il quelque chose à faire le week-end prochain ?" Elle ouvre Ma Ville Agenda, voit la liste des événements filtrés par catégorie (elle clique sur "Culture"). Elle voit un ciné ce samedi. Elle clique sur l'événement, lit la description et l'horaire, et note le lien pour acheter des places.

### UJ2 — Validation et publication d'un événement (super-admin)

> Camil reçoit une notification (ou consulte régulièrement) que l'association sportive a soumis un événement : "Tournoi de foot samedi 30 mai". Il se connecte au backoffice, voit la soumission en attente, lit tous les détails (title, image, dates, description, lieu, lien). Il vérifie que c'est correct, clique "Valider", et l'événement apparaît dans l'app mobile quelques secondes plus tard. Plus tard, une autre soumission arrive d'un commerçant ; Camil la refuse (formulaire incomplet) et laisse un commentaire.

---

## Glossaire

| Terme | Définition |
|---|---|
| **Événement** | Entrée calendaire avec titre, description, image, dates/heures, catégorie, lien optionnel. |
| **Catégorie** | Culture, Sport, Animation, Commerce, Autre. Filtre disponible sur l'écran principal. |
| **Données de démo** | Ensemble d'événements seedés manuellement pour illustrer le concept. Reflète l'agenda réel de Léognan (mai 2026). |
| **MVP** | Produit minimal fonctionnel : liste + détail, filtrage par catégorie, navigation par date. Pas de backoffice, pas d'authentification, pas de notifications. |

---

## Features

### F1. Liste des événements
- Affichage de tous les événements à venir, ordonnés par date de début
- Chaque entrée montre : titre, catégorie (icône + couleur), date/heure, lieu [HYPOTHÈSE]
- Actualisation manuelle ou à ouverture de l'app [HYPOTHÈSE]
- Données de démo : 7 événements réels de Léognan (mai 2026)

**JTBD** : je veux voir rapidement ce qui se passe cette semaine

### F2. Filtrage par catégorie
- Onglets ou boutons de filtrage : Culture, Sport, Animation, Commerce, Autre
- Un seul filtre actif à la fois [HYPOTHÈSE]
- Affichage du nombre d'événements par catégorie [HYPOTHÈSE]

**JTBD** : je m'intéresse aux événements culturels, pas aux autres

### F3. Fiche détail d'un événement
- Au clic sur un événement (depuis la liste), affichage d'une vue détail avec :
  - Titre
  - Image (si disponible)
  - Description complète
  - Date et heure de début
  - Date et heure de fin (ou "journée entière")
  - Lieu [HYPOTHÈSE]
  - Catégorie
  - Lien optionnel (clic ouvre navigateur)
- Bouton retour pour revenir à la liste

**JTBD** : je veux tous les détails sur cet événement avant de décider si j'y vais

### F4. Navigation par date
[HYPOTHÈSE] : navigation par semaine ou par jour. MVP inclut au minimum la possibilité de consulter les événements du jour/semaine en cours, et de naviguer vers les semaines suivantes.

**JTBD** : je veux voir ce qui se passe semaine prochaine

### F5. Backoffice super-admin : création et validation d'événements

Interface web (not mobile) réservée au super-admin du tenant (Camil en MVP).

#### F5a. Authentification super-admin
- Login/password ou magiclink [HYPOTHÈSE]
- Accès sécurisé au backoffice

**JTBD** : je veux accéder à l'admin sans risquer que n'importe qui y accède

#### F5b. Création manuelle d'événement (super-admin)
- Formulaire web avec tous les 7 champs : titre, description, image (upload), dates/heures (ou all-day), catégorie, lieu, lien optionnel
- Brouillon auto-sauvegardé [HYPOTHÈSE]
- Bouton "Soumettre pour validation" → passe le statut à "En attente"

**JTBD** : je veux créer rapidement un événement que je connais

#### F5c. Liste de validation
- Liste des événements "En attente" (soumission utilisateur + créations super-admin en attente)
- Affiche : titre, date, catégorie, statut, date de soumission
- Tri par date de soumission [HYPOTHÈSE]

**JTBD** : je veux voir tout ce qui attend ma validation

#### F5d. Fiche de validation
- Vue détail d'un événement en attente
- Tous les 7 champs visibles + image preview
- Bouton "Valider" → statut → "Publié" → visible app mobile immédiatement
- Bouton "Refuser" → optionnel commentaire (internal notes) → statut → "Rejeté"
- Historique des actions (validé par qui, quand, raison du refus) [HYPOTHÈSE]

**JTBD** : je veux vérifier les détails d'une soumission avant de la publier

#### F5e. Historique des événements publiés
- Liste de tous les événements "Publiés" avec meta (créateur, date de création, date de publication, dernière édition)
- Optionnel : édition d'un événement publié (dépublier, modifier, archiver) [HYPOTHÈSE : dépublier/archiver oui, modifier en MVP ou V2 ?]

**JTBD** : je veux voir ce que j'ai déjà publié et quand

---

## Non-goals (MVP)

- **Backoffice pour non-super-admin en MVP** — RBAC avancé (commerçants, associations, modos) → V2 [backoffice super-admin IN MVP]
- **Soumissions utilisateur (mobile)** — utilisateurs mobiles ne peuvent pas soumettre en MVP ; c'est réservé au backoffice admin [soumissions par backoffice IN MVP]
- Notifications push
- Publication automatique sur Facebook/Instagram
- Recherche par mot-clé [HYPOTHÈSE : filtre catégorie suffit en MVP]
- Ajout d'événements aux favoris / calendrier personnel
- Intégration avec calendriers tiers (Google Calendar, etc.)
- Dark mode
- Modification d'événements publiés en MVP [archivage/dépublication oui, édition potentiellement V2]
- Bulk import d'événements (CSV, iCal, etc.) [HYPOTHÈSE : import manuel par super-admin en MVP]

---

## Critères de succès

| Métrique | Cible | Note |
|---|---|---|
| Téléchargements (3 mois) | 500 | Preuve de concept auprès d'habitants Léognan |
| Sessions actives | À mesurer | Fréquence de consultation |
| Taux de rétention (7j) | À mesurer | Usage régulier vs. unique |

[HYPOTHÈSE] : la métrique de succès principal est le nombre de téléchargements en 3 mois. Usage régulier et rétention (7j, 30j) seront mesurés mais ne sont pas des blockers pour le MVP.

---

## Architecture et plateforme

### App mobile
**Plateforme** : iOS + Android via framework cross-platform

[HYPOTHÈSE] : React Native ou Flutter. Stack TBD en phase architecture.

**Distribution** : App Stores iOS et Google Play

### Backend & API
**API backend** : REST ou GraphQL [TBD architecture] qui expose :
- GET /events (list, filter by category)
- GET /events/:id (detail)
- POST /events (super-admin création)
- PUT /events/:id (super-admin édition/validation)
- DELETE /events/:id (super-admin archivage/dépublication)
- POST /auth/login (super-admin login)

[HYPOTHÈSE] : serverless (AWS Lambda, Google Cloud Functions, etc.) ou Vercel Functions pour hébergement gratuit.

**Base de données** : managée (Firebase Firestore, Supabase PostgreSQL, etc.)

### Backoffice admin (web)
**Plateforme** : web responsive (desktop-first, pas mobile prioritaire en MVP)

[HYPOTHÈSE] : React, Next.js, ou Vue.js. Même framework que l'API pour maintenabilité solo.

**Authentification** : super-admin login (password ou magiclink)

**Hébergement** : Vercel ou serveur personnel

---

## Périmètre de données — MVP

| Champ | Type | Requis | Note |
|---|---|---|---|
| Titre | Texte | Oui | Ex. "Ciné Europe : Sorda" |
| Description | Texte libre | Oui | Détails, contexte, infos pratiques |
| Image | URL / asset | Non | Illustration de l'événement |
| Date de début | Date + heure | Oui | Ou "journée entière" |
| Date de fin | Date + heure | Oui | Ou "journée entière" |
| Catégorie | Enum | Oui | Culture, Sport, Animation, Commerce, Autre |
| Lieu | Texte | Oui [HYPOTHÈSE] | Nom du lieu ou adresse |
| Lien externe | URL | Non | Billetterie, site, page Facebook |

**Données initiales** : 7 événements seedés manuellement, tirés de l'agenda réel de Léognan (mai 2026).

---

## Design et ton

**Charte graphique** : Léognan officielle
- Couleur primaire : #2d93c4 (bleu)
- Typographies : Open Sans (corps), Roboto Condensed (titres)
- Ton : chaleureux, local, accessible

[HYPOTHÈSE] : interface claire et épurée, pas d'ornements inutiles. Priorité sur la lisibilité et la découverte rapide d'événements.

---

## Contraintes techniques et opérationnelles

- **Budget** : zéro
- **Développement** : Camil solo, assisté par Claude Code
- **Hébergement** : Vercel (tier gratuit) ou serveur personnel pour V1
- **Maintenabilité** : stack choisie pour être maintenable seul (no exotic dependencies, no monolithic backends)

[HYPOTHÈSE] : MVP vise le lancement en 4-6 semaines. Architecture doit supporter ajout du backoffice en V2 sans refonte majeure.

---

## Open Questions

1. **Mécanique de mise à jour des données** : comment les événements sont-ils ajoutés à la base de données en MVP ? Saisie manuelle du développeur ? Import CSV ? [Résolu en architecture]
2. **Géolocalisation** : inclure un filtre par lieu ou proximité en MVP ? [HYPOTHÈSE : non, hors périmètre MVP]
3. **Calendrier natif** : pouvoir ajouter un événement au calendrier du téléphone ? [HYPOTHÈSE : non, V2]

---

## Hypothèses clés

- Les habitants consulteront l'app principalement via smartphone (app mobile, pas de web pour users)
- Validation manuelle par super-admin est acceptable en MVP (scalera via comptes modos en V2)
- Les événements publiés sont visibles immédiatement dans l'app mobile (< 5 secondes) après validation
- 7 événements démo + possibilité d'en créer est suffisant pour démontrer le concept
- Le lieu est une donnée texte suffisante (pas de géolocalisation / maps en MVP)
- La catégorie peut être représentée par couleur + icône
- L'accès en lecture seule (pas d'authentification) est acceptable pour app mobile
- Brouillons auto-sauvegardés suffisent (pas de collaborative editing en MVP)
- Backoffice admin sur web (desktop/laptop), pas responsive mobile

---

## Timeline estimée

- **Architecture** (1-2 semaines) — framework cross-platform, API, base de données, backoffice tech stack
- **Design UX/UI** (1 semaine) — wireframes app mobile, mockups backoffice
- **Epics et stories** (1 semaine) — décomposition des features (app + backoffice)
- **Développement** (4-6 semaines) — implémentation MVP (app + backend + backoffice)
- **Tests et déploiement** (1-2 semaines) — beta équipe citoyenne, App Store/Play Store reviews, lancement public

**Total estimé** : 8-12 semaines de Camil solo + Claude Code

## Prochaines étapes

1. **Revue PRD** — validation scope, hypothèses, timeline
2. **Architecture** — choix du framework cross-platform, base de données, API, backoffice stack
3. **Design UX/UI** — wireframes et mockup haute-fidélité (app + backoffice)
4. **Epics et stories** — décomposition des features en tâches
5. **Développement** — implémentation du MVP
6. **Tests et déploiement** — beta auprès de l'équipe citoyenne, puis lancement public

