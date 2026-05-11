import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: '.',
  testMatch: [
    'layers/**/server/**/__tests__/**/*.spec.ts',
    'tests/e2e/**/*.spec.ts',
  ],
  fullyParallel: false, // auth tests share DB state — keep sequential
  retries: process.env.CI ? 2 : 0,
  timeout: 30000,
  reporter: [['html', { outputFolder: 'tests/report' }], ['list']],

  use: {
    baseURL: process.env.TEST_BASE_URL || 'http://localhost:3000',
    extraHTTPHeaders: {
      Accept: 'application/json',
    },
    trace: 'on-first-retry',
  },

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
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: true,
    timeout: 120000,
  },
})
