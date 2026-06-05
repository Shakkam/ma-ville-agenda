import { defineConfig, devices } from '@playwright/test';

// E2E smoke tests run against the deployed apps (read-only flows only — no data
// is created/modified, so production stays untouched). Override targets with
// APP_URL / BACKOFFICE_URL env vars to point at a local stack.
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  reporter: process.env.CI ? 'list' : [['list'], ['html', { open: 'never' }]],
  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
});
