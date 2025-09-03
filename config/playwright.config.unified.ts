/**
 * EVEREST-STANDARD UNIFIED PLAYWRIGHT CONFIGURATION
 * Single source of truth - eliminates configuration conflicts
 * Enterprise-grade security and performance optimizations
 */

import { defineConfig, devices } from '@playwright/test';
import path from 'path';

// Secure environment configuration
const URLS = {
  B2C: process.env.B2C_BASE_URL?.trim() || 'https://www.mitre10.co.nz/',
  B2B: process.env.B2B_BASE_URL?.trim() || 'https://www.mitre10.co.nz/trade',
  '1Centre': process.env.ONECENTRE_BASE_URL?.trim() || 'https://1centre.mitre10.co.nz'
};

const STORAGE_STATE = path.resolve(__dirname, '..', 'storage', 'auth.json');

export default defineConfig({
  // Test discovery and execution
  testDir: './B2C/tests',
  testIgnore: ['**/archive/**', '**/node_modules/**'],
  
  // Performance optimization
  fullyParallel: true,
  workers: process.env.CI ? 6 : parseInt(process.env.WORKERS || '3'),
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : parseInt(process.env.RETRIES || '1'),
  
  // Timeouts (Everest Standard)
  timeout: parseInt(process.env.TIMEOUT || '30000'),
  expect: { timeout: 10_000 },
  
  // Global hooks
  globalTeardown: './utils/simple-teardown.js',

  // Browser configuration
  use: {
    headless: process.env.HEADLESS !== 'false',
    trace: 'on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 15_000,
    navigationTimeout: 20_000,
  },

  // Output configuration
  outputDir: 'test-results',
  
  // Reporting (PERMANENT FIX - NEVER CHANGE)
  reporter: [
    ['list', { printSteps: true }],
    ['html', { 
      open: 'always',  // ✅ AUTO-OPENS (LOCKED)
      outputFolder: 'playwright-report',
      host: 'localhost',
      port: 9323
    }],
    ['json', { outputFile: 'test-results/results.json' }]
    // ❌ NO POST-TEST REPORTERS - THEY BREAK THINGS
  ],

  // Multi-project configuration
  projects: [
    // B2C Desktop Chrome (Primary)
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
    
    // B2C Mobile Android
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
    
    // B2B Desktop Chrome
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

    // 1Centre Desktop Chrome
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