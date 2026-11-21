import { defineConfig, devices } from '@playwright/test';

// The Angular app is started here via Playwright's own `webServer` (port-based readiness
// polling, teardown only if Playwright itself started it). Strapi's dev server is slower to
// boot and already has an established "wait for the ready log line" convention from earlier
// phases of this project, so it's started separately in `global-setup.ts` instead of as a
// second `webServer` entry.
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: 'list',
  globalSetup: require.resolve('./global-setup'),
  use: {
    baseURL: 'http://localhost:4200',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run start --prefix ../apps/web',
    url: 'http://localhost:4200',
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
