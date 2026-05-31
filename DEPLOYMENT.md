# Déploiement — Ma Ville Agenda (100% Vercel)

Architecture cible (tier gratuit) :

| Composant | Hébergement |
|---|---|
| Base de données | **Vercel Postgres (Neon)** |
| API Express | **Vercel** (fonction serverless) |
| Images | **Vercel Blob** |
| Backoffice Next.js | **Vercel** |
| App mobile | Expo (build EAS, hors Vercel) — pointe sur l'URL de l'API déployée |

Le repo est un monorepo : on crée **2 projets Vercel** (un pour `apps/api`, un pour `apps/backoffice`), tous deux liés au même repo GitHub mais avec un **Root Directory** différent.

---

## 1. Base de données — Vercel Postgres

1. Vercel Dashboard → **Storage** → **Create Database** → **Postgres (Neon)**.
2. Une fois créée, onglet **.env.local** / **Quickstart** : copie les valeurs.
   - `DATABASE_URL` ← l'URL **poolée** (souvent `POSTGRES_PRISMA_URL`, contient `-pooler`).
   - `DIRECT_DATABASE_URL` ← l'URL **directe** (souvent `POSTGRES_URL_NON_POOLING`).
3. Colle-les dans `apps/api/.env` en local pour pouvoir migrer/seeder.

Puis, en local :

```bash
cd apps/api
npx prisma db push     # crée les tables dans Postgres
npm run db:seed        # insère l'admin + les 7 événements
```

## 2. Stockage images — Vercel Blob

1. Vercel Dashboard → **Storage** → **Create** → **Blob**.
2. Copie le `BLOB_READ_WRITE_TOKEN`.
3. À mettre dans les variables d'env du projet API (étape 3).

## 3. Projet Vercel — API

1. Vercel → **Add New… → Project** → importe le repo `ma-ville-agenda`.
2. **Root Directory** = `apps/api`.
3. **Environment Variables** :
   - `DATABASE_URL`, `DIRECT_DATABASE_URL` (depuis l'étape 1)
   - `JWT_SECRET` (une longue chaîne aléatoire), `JWT_EXPIRES_IN` = `7d`
   - `BLOB_READ_WRITE_TOKEN` (depuis l'étape 2)
   - `NODE_ENV` = `production`
   - `CORS_ORIGINS` = l'URL du backoffice (à compléter après l'étape 4, ex : `https://ma-ville-agenda-backoffice.vercel.app`)
4. Deploy. L'URL de l'API ressemblera à `https://ma-ville-agenda-api.vercel.app`.
   - Test : `https://…-api.vercel.app/health` doit renvoyer `{"status":"ok"}`.

## 4. Projet Vercel — Backoffice

1. Vercel → **Add New… → Project** → même repo.
2. **Root Directory** = `apps/backoffice`.
3. **Environment Variables** :
   - `NEXT_PUBLIC_API_URL` = `https://…-api.vercel.app/api` (URL de l'API + `/api`)
4. Deploy.
5. Reviens sur le projet **API** → ajoute l'URL du backoffice à `CORS_ORIGINS` → redeploy l'API.

## 5. App mobile

Dans `apps/mobile/.env` (ou la config EAS), pointe sur l'API déployée :

```
EXPO_PUBLIC_API_URL=https://…-api.vercel.app/api
```

Les images uploadées (Vercel Blob) ont des URLs publiques `https://…` qui s'afficheront alors correctement sur mobile.

---

## Notes

- Prisma génère son client au build via le script `postinstall` (`prisma generate`).
- Les colonnes catégorie/statut sont des `String` validés par Zod (pas des enums Postgres) pour limiter la complexité — on pourra migrer en enums plus tard.
- En local, `DATABASE_URL` et `DIRECT_DATABASE_URL` peuvent pointer sur la même URL directe Neon.
