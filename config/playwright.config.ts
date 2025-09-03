require('dotenv/config');
import { defineConfig, devices } from '@playwright/test';
import path from 'path';

// Multi-project URLs
const URLS = {
  B2C: process.env.B2C_BASE_URL?.trim() || 'https://www.mitre10.co.nz/',
  B2B: process.env.B2B_BASE_URL?.trim() || 'https://www.mitre10.co.nz/trade',
  '1Centre': process.env.ONECENTRE_BASE_URL?.trim() || 'https://1centre.mitre10.co.nz'
};

const STORAGE_STATE = path.resolve(__dirname, '..', 'storage', 'auth.json');

export default defineConfig({
  fullyParallel: true,
  workers: process.env.CI ? 6 : 3,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  timeout: 30_000,
  expect: { timeout: 10_000 },
  globalTeardown: './utils/simple-teardown.js',

  use: {
    headless: true,
    trace: 'on',
    screenshot: 'on',
    video: 'on',
    actionTimeout: 15_000,
    navigationTimeout: 20_000,
  },

  outputDir: 'test-results',
  
  reporter: [
    ['list', { printSteps: true }],
    ['html', { 
      open: 'always',
      outputFolder: 'playwright-report',
      host: 'localhost',
      port: 9323,
      attachmentsBaseURL: 'data/'
    }],
    ['json', { outputFile: 'test-results/results.json' }]
  ],

  projects: [
    // B2C Projects
    {
      name: 'b2c-desktop-chrome',
      testDir: './B2C/tests',
      testIgnore: '**/archive/**',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: URLS.B2C,
        channel: 'chrome',
        storageState: STORAGE_STATE,
      },
    },
    {
      name: 'b2c-mobile-android',
      testDir: './B2C/tests',
      testIgnore: '**/archive/**',
      use: {
        ...devices['Pixel 5'],
        baseURL: URLS.B2C,
        storageState: STORAGE_STATE,
      },
    },
    
    // B2B Projects
    {
      name: 'b2b-desktop-chrome',
      testDir: './B2B/tests',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: URLS.B2B,
        channel: 'chrome',
        storageState: STORAGE_STATE,
      },
    },
    {
      name: 'b2b-mobile-android',
      testDir: './B2B/tests',
      use: {
        ...devices['Pixel 5'],
        baseURL: URLS.B2B,
        storageState: STORAGE_STATE,
      },
    },

    // 1Centre Projects
    {
      name: '1centre-desktop-chrome',
      testDir: './1Centre/tests',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: URLS['1Centre'],
        channel: 'chrome',
        storageState: STORAGE_STATE,
      },
    },
  ],
});