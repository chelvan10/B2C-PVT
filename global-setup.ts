import { chromium, FullConfig } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function globalSetup(config: FullConfig) {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // Navigate to Mitre 10 and set up any required state
  await page.goto(process.env.MITRE10_BASE_URL || 'https://www.mitre10.co.nz/');
  
  // Save storage state for authenticated tests
  await page.context().storageState({ 
    path: path.resolve(__dirname, 'storage', 'auth.json') 
  });
  
  await browser.close();
}

export default globalSetup;