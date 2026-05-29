---
title: "Ma Ville Agenda — Product Brief"
status: final
created: 2026-05-23
updated: 2026-05-23
---

# Product Brief : Ma Ville Agenda

## Résumé exécutif

Léognan est une commune active, mais ses habitants ne savent pas ce qui s'y passe. La communication municipale est défaillante : événements culturels, sportifs, commerciaux et associatifs sont éparpillés, peu visibles, et souvent ignorés faute d'un point de centralisation. **Ma Ville Agenda** comble ce vide — une application mobile (iOS et Android) qui agrège et présente l'agenda complet de la commune, consultable en quelques secondes par n'importe quel habitant.

Portée par une équipe citoyenne issue de l'opposition municipale de Léognan, l'application est pensée comme un service public que la mairie n'a pas encore fourni. Elle n'est pas un outil politique : c'est un service d'utilité publique locale, ouvert à toutes les associations, commerçants et organisateurs qui veulent donner de la visibilité à leurs événements.

Le timing est favorable : la mairie envisage un appel d'offres pour une app officielle, mais le projet est sans calendrier. Ma Ville Agenda peut s'imposer comme la référence locale avant que l'institution ne se mette en mouvement.

## Le problème

Les habitants de Léognan n'ont pas de point d'entrée unique pour savoir ce qui se passe dans leur commune. Les événements sont annoncés en ordre dispersé — Facebook, affiches, bouche-à-oreille — sans agrégation, sans recherche, sans notification. Le résultat : des salles vides à côté d'habitants qui ignoraient que l'événement existait. Les organisateurs eux-mêmes souffrent de ce manque de visibilité.

La mairie a les moyens de régler ce problème mais n'en fait pas une priorité. L'absence d'outil numérique centralisé est un signal de décrochage entre l'institution et la vie associative et commerciale de la commune.

## La solution

Une application mobile iOS et Android qui présente, de manière claire et filtrable, tous les événements à venir à Léognan : culture, sport, animation, commerces, vie associative.

**MVP :** Une app fonctionnelle illustrant le parcours utilisateur complet — liste filtrée par catégorie, fiche détail, navigation par date. Les données sont seedées manuellement pour la démonstration. Objectif : démontrer le concept, valider l'intérêt, et prendre date avant la mairie.

**V2 :** Un backoffice permettant aux associations, commerçants, offices de tourisme et organisateurs privés de soumettre leurs propres événements. Chaque soumission passe par un flux de modération avant publication. Ajout des notifications push et publication automatique sur Facebook et Instagram.

**V3+ :** Ouverture de la plateforme en marque blanche — logos, couleurs et charte graphique paramétrables par commune. Léognan devient le déploiement de référence.

## Structure d'un événement

| Champ | Détail |
|---|---|
| Titre | Texte court |
| Description | Texte libre |
| Image | Illustration de l'événement |
| Début | Date + heure, ou journée entière |
| Fin | Date + heure, ou journée entière |
| Catégorie | Culture / Sport / Animation / Commerce / Autre |
| Lien | Optionnel — billetterie, site, page Facebook… |

## Ce qui nous différencie

- **Premiers sur Léognan.** Aucun équivalent n'existe. La mairie a un projet en cours mais sans calendrier. Le premier outil qui s'impose devient la référence.
- **Service citoyen, pas outil institutionnel.** L'app n'appartient pas à la mairie : elle appartient aux habitants et aux acteurs locaux. C'est sa force et sa légitimité.
- **Ouvert aux acteurs locaux dès la V2.** Associations et commerçants contribuent directement — ce que la mairie ne pourra pas offrir facilement sans arbitrages politiques internes.
- **Avantage de vitesse.** Être en ligne avant que la mairie ne publie son appel d'offres est l'atout décisif.

## Pour qui

**L'habitant de Léognan** — curieux de la vie locale, abonné à quelques pages Facebook mais las de chercher. Il veut savoir ce qui se passe ce week-end sans effort.

**L'organisateur local (V2)** — président d'association sportive, commerçant, organisateur privé. Il veut de la visibilité sans friction administrative.

**L'équipe de modération** — cinq membres de l'équipe citoyenne, chargés de valider les soumissions et garantir la qualité éditoriale.

## Critères de succès

- Nombre de téléchargements — cible : 500 dans les 3 premiers mois
- Taux de lecture des notifications push (V2)
- Nombre de comptes backoffice actifs et réguliers (V2)
- Score d'utilisation composite : fréquence de retour, sessions, durée

## Périmètre

### MVP — inclus
- Liste d'événements filtrables par catégorie (Culture, Sport, Animation, Commerce)
- Fiche détail : titre, description, image, dates et heures, lien optionnel
- Données de démonstration
- iOS + Android

### MVP — hors périmètre
- Backoffice de saisie utilisateur
- Flux de modération
- Notifications push
- Publication réseaux sociaux
- Authentification utilisateur

### V2
- Backoffice avec comptes organisateurs
- Flux de modération (soumission → validation → publication)
- Notifications push
- Publication automatique Facebook / Instagram

### V3+ — Marque blanche
- Architecture multi-tenant : identité visuelle paramétrable par commune
- Déploiement dans d'autres communes sans refonte technique
- Léognan comme déploiement de référence

## Vision

Dans deux à trois ans, Ma Ville Agenda tourne sur plusieurs communes de la métropole bordelaise. Chaque déploiement est une instance indépendante, brandée aux couleurs de la commune, alimentée par ses acteurs locaux. L'équipe de Léognan a construit la référence : la preuve qu'une initiative citoyenne peut devancer l'institution — et l'essaimer.
