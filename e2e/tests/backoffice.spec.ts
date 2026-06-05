import { test, expect } from '@playwright/test';

const BACKOFFICE_URL = process.env.BACKOFFICE_URL || 'https://ma-ville-agenda-backoffice.vercel.app';
const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL || 'admin@ma-ville-agenda.local';
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD || 'admin123';

test.describe('Backoffice', () => {
  test('login page renders', async ({ page }) => {
    await page.goto(`${BACKOFFICE_URL}/login`);
    await expect(page.getByText("Espace d'administration")).toBeVisible();
    await expect(page.getByRole('button', { name: 'Se connecter' })).toBeVisible();
  });

  test('rejects wrong credentials', async ({ page }) => {
    await page.goto(`${BACKOFFICE_URL}/login`);
    await page.getByLabel('Email').fill(ADMIN_EMAIL);
    await page.getByLabel('Mot de passe').fill('definitely-wrong');
    await page.getByRole('button', { name: 'Se connecter' }).click();
    await expect(page.getByText(/401|incorrect|invalid/i)).toBeVisible({ timeout: 15000 });
  });

  test('super-admin logs in and reaches the dashboard', async ({ page }) => {
    await page.goto(`${BACKOFFICE_URL}/login`);
    await page.getByLabel('Email').fill(ADMIN_EMAIL);
    await page.getByLabel('Mot de passe').fill(ADMIN_PASSWORD);
    await page.getByRole('button', { name: 'Se connecter' }).click();

    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });
    await expect(page.getByText('Ma Ville Agenda - Admin')).toBeVisible();
    await expect(page.getByText(/Publiés/)).toBeVisible();
    // Super-admin sees the user management entry.
    await expect(page.getByText('Gérer les utilisateurs')).toBeVisible();
  });
});
