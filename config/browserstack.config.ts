import { defineConfig, devices } from '@playwright/test';
import 'dotenv/config';

export default defineConfig({
  testDir: '../B2C/tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : 1,
  reporter: 'html',
  
  use: {
    baseURL: process.env.B2C_BASE_URL || 'https://www.mitre10.co.nz',
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'browserstack-chrome-windows',
      use: {
        ...devices['Desktop Chrome'],
        // BrowserStack specific configuration
        connectOptions: {
          wsEndpoint: `wss://cdp.browserstack.com/playwright?caps=${encodeURIComponent(JSON.stringify({
            'browser': 'chrome',
            'browser_version': 'latest',
            'os': 'Windows',
            'os_version': '10',
            'name': 'Mitre10 B2C Tests',
            'build': 'Playwright BrowserStack Build'
          }))}`
        }
      },
    },
    {
      name: 'browserstack-safari-macos',
      use: {
        ...devices['Desktop Safari'],
        connectOptions: {
          wsEndpoint: `wss://cdp.browserstack.com/playwright?caps=${encodeURIComponent(JSON.stringify({
            'browser': 'safari',
            'browser_version': 'latest',
            'os': 'OS X',
            'os_version': 'Big Sur',
            'name': 'Mitre10 B2C Tests',
            'build': 'Playwright BrowserStack Build'
          }))}`
        }
      },
    },
    {
      name: 'browserstack-android',
      use: {
        ...devices['Pixel 5'],
        connectOptions: {
          wsEndpoint: `wss://cdp.browserstack.com/playwright?caps=${encodeURIComponent(JSON.stringify({
            'browser': 'chrome',
            'os': 'android',
            'os_version': '11.0',
            'device': 'Samsung Galaxy S21',
            'name': 'Mitre10 B2C Mobile Tests',
            'build': 'Playwright BrowserStack Build'
          }))}`
        }
      },
    },
    {
      name: 'browserstack-iphone',
      use: {
        ...devices['iPhone 13'],
        connectOptions: {
          wsEndpoint: `wss://cdp.browserstack.com/playwright?caps=${encodeURIComponent(JSON.stringify({
            'browser': 'safari',
            'os': 'ios',
            'os_version': '15',
            'device': 'iPhone 13',
            'name': 'Mitre10 B2C iOS Tests',
            'build': 'Playwright BrowserStack Build'
          }))}`
        }
      },
    },
  ],
});