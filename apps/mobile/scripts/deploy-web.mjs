#!/usr/bin/env node
// One-command web deploy for the Expo app.
// Steps: expo export (web) -> patch index.html (module script) -> SPA vercel.json
//        -> link to the Vercel project -> deploy to production.
//
// Usage:  npm run deploy:web         (from apps/mobile)
// Override the API the build points at with DEPLOY_API_URL=... npm run deploy:web

import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MOBILE_ROOT = path.resolve(__dirname, '..');
const DIST_DIR = path.join(MOBILE_ROOT, 'dist');

const API_URL = process.env.DEPLOY_API_URL || 'https://ma-ville-agenda-api.vercel.app/api';
const PROJECT = process.env.DEPLOY_VERCEL_PROJECT || 'ma-ville-agenda-app';

const run = (cmd, cwd, extraEnv = {}) =>
  execSync(cmd, { cwd, stdio: 'inherit', env: { ...process.env, ...extraEnv } });

const step = (msg) => console.log(`\n>> ${msg}`);

try {
  step(`Export web build (API: ${API_URL})`);
  run('npx expo export --platform web', MOBILE_ROOT, { EXPO_PUBLIC_API_URL: API_URL });

  step('Patch index.html — entry script as ES module (fixes import.meta)');
  const indexPath = path.join(DIST_DIR, 'index.html');
  let html = readFileSync(indexPath, 'utf8');
  const before = html;
  html = html.replace(/(<script\s+src="[^"]+\.js")\s+defer><\/script>/, '$1 type="module"></script>');
  if (html === before) {
    console.warn('   WARNING: entry script tag not found / already patched — check index.html');
  }
  writeFileSync(indexPath, html);

  step('Write SPA rewrite (all routes -> index.html)');
  writeFileSync(
    path.join(DIST_DIR, 'vercel.json'),
    JSON.stringify({ rewrites: [{ source: '/(.*)', destination: '/index.html' }] }, null, 2) + '\n'
  );

  step(`Link to Vercel project "${PROJECT}"`);
  run(`npx vercel link --yes --project ${PROJECT}`, DIST_DIR);

  step('Deploy to production');
  run('npx vercel deploy --prod --yes', DIST_DIR);

  step('Done. -> https://ma-ville-agenda-app.vercel.app');
} catch (e) {
  console.error('\nDeploy failed:', e.message);
  process.exit(1);
}
