import { test, expect } from '@playwright/test';

const APP_URL = process.env.APP_URL || 'https://ma-ville-agenda-app.vercel.app';

test.describe('Citizen app', () => {
  test('loads with the hero and the Léognan events', async ({ page }) => {
    await page.goto(APP_URL);

    // Hero title
    await expect(page.getByText('Ma Ville Agenda').first()).toBeVisible();

    // Seed events are fetched from the API and rendered.
    await expect(page.getByText('Ciné Europe : Sorda')).toBeVisible({ timeout: 20000 });
    await expect(page.getByText('Espace Culturel Georges Brassens').first()).toBeVisible();
  });

  test('filtering by category narrows the list', async ({ page }) => {
    await page.goto(APP_URL);
    await expect(page.getByText('Ciné Europe : Sorda')).toBeVisible({ timeout: 20000 });

    // No Sport events seeded -> empty state.
    await page.getByText('Sport', { exact: true }).click();
    await expect(page.getByText('Aucun événement trouvé')).toBeVisible();

    // Back to all -> events return.
    await page.getByText('Tous', { exact: true }).click();
    await expect(page.getByText('Ciné Europe : Sorda')).toBeVisible();
  });

  test('Planning tab shows the calendar', async ({ page }) => {
    await page.goto(APP_URL);
    await page.getByText('Planning', { exact: true }).click();

    // Calendar opens on the month of the seed events (May 2026).
    await expect(page.getByText(/2026/).first()).toBeVisible({ timeout: 20000 });
    // A weekday header confirms the calendar grid rendered.
    await expect(page.getByText('Lun', { exact: true }).first()).toBeVisible();
  });
});
