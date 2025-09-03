import 'dotenv/config';
import { defineConfig, devices } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const BASE_URL = process.env.MITRE10_BASE_URL?.trim() || 'https://www.mitre10.co.nz/';
const STORAGE_STATE = path.resolve(__dirname, 'storage', 'auth.json');

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  workers: process.env.CI ? 4 : 2,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  timeout: 30_000,
  expect: { timeout: 10_000 },

  use: {
    baseURL: BASE_URL,
    trace: 'on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 15_000,
    navigationTimeout: 20_000,
    storageState: undefined,
  },

  globalSetup: './tests/utils/global-setup.ts',
  globalTeardown: './tests/utils/global-teardown.ts',

  outputDir: 'test-results',
  reporter: [
    ['./tests/utils/dashboard-reporter.ts'],
    ['list', { printSteps: true }],
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'test-results/results.json' }]
  ],

  projects: [
    {
      name: 'desktop-chrome-auth',
      testMatch: ['**/smoke/**/*.spec.ts', '**/e2e/**/*.spec.ts'],
      use: {
        ...devices['Desktop Chrome'],
        channel: 'chrome',
        storageState: STORAGE_STATE,
      },
    },
    {
      name: 'mobile-android',
      testMatch: ['**/smoke/**/*.spec.ts', '**/e2e/**/*.spec.ts'],
      use: {
        ...devices['Pixel 5'],
        storageState: STORAGE_STATE,
      },
    },
  ],
});