import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: '.',
  testMatch: [
    'layers/**/server/**/__tests__/**/*.spec.ts',
    'tests/e2e/**/*.spec.ts',
  ],
  fullyParallel: false, // auth tests share DB state — keep sequential
  workers: 1, // single worker prevents server startup race condition across spec files
  retries: process.env.CI ? 2 : 0,
  timeout: 60000, // e2e tests: login flow includes SSE/WS connection setup (~15s)
  reporter: [['html', { outputFolder: 'tests/report' }], ['list']],

  use: {
    baseURL: process.env.TEST_BASE_URL || 'http://localhost:3000',
    extraHTTPHeaders: {
      Accept: 'application/json',
    },
    trace: 'on-first-retry',
    // Visual regression snapshots stored under tests/snapshots/
    snapshotDir: 'tests/snapshots',
  },

  // Allow `npx playwright test --update-snapshots` to regenerate baselines
  updateSnapshots: 'missing',

  projects: [
    {
      name: 'api',
      testMatch: 'layers/**/server/**/__tests__/**/*.spec.ts',
      // API tests use request fixture only — no browser needed
    },
    {
      name: 'e2e',
      testMatch: 'tests/e2e/**/*.spec.ts',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'e2e-mobile',
      testMatch: 'tests/e2e/**/*.spec.ts',
      use: { ...devices['iPhone 14'] },
    },
    {
      // Lighthouse audits require Chrome with remote debugging enabled.
      // Run separately: npx playwright test --project=audits
      name: 'audits',
      testMatch: 'tests/e2e/audits/**/*.spec.ts',
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: {
          args: ['--remote-debugging-port=9222'],
        },
      },
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: true,
    timeout: 120000,
  },
})
