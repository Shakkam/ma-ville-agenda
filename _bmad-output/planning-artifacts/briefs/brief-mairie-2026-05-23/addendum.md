---
title: "Ma Ville Agenda — Addendum"
status: final
created: 2026-05-23
updated: 2026-05-23
---

# Addendum : Ma Ville Agenda

## Contexte de développement

- **Développement :** projet solo (Camil), assisté par Claude Code
- **Budget initial :** nul — stack choisie pour la gratuité et la maintenabilité solo
- **Hébergement MVP :** hébergement personnel ou Vercel (tier gratuit) ; scalabilité reportée à la V2/V3

Ces contraintes doivent guider les choix de stack lors de la phase d'architecture : frameworks cross-platform éprouvés, backend serverless ou léger, base de données managée sans coût initial.

## Contexte politique

Le projet est porté par l'opposition municipale de Léognan. La mairie envisage son propre appel d'offres pour une app officielle, sans calendrier défini. L'avantage concurrentiel de Ma Ville Agenda repose sur la vitesse d'exécution — être en production avant que la mairie ne se positionne.

Le projet ne se positionne pas comme un outil d'opposition : il se positionne comme un service citoyen. La neutralité éditoriale de la modération est un enjeu de crédibilité à long terme.

## Vision marque blanche — éléments techniques

Pour la V3+, les éléments paramétrables par commune incluent a minima :
- Logo et nom de l'instance
- Palette de couleurs principale
- Catégories d'événements (extensibles)

Le modèle de déploiement (instances séparées vs. multi-tenant partagé) est à arbitrer en architecture.
