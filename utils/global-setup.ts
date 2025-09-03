import { chromium, FullConfig } from '@playwright/test';
import fs from 'fs';
import path from 'path';

async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting global setup...');
  
  // Create storage directory
  const storageDir = path.join(process.cwd(), 'storage');
  if (!fs.existsSync(storageDir)) {
    fs.mkdirSync(storageDir, { recursive: true });
  }

  // Create artifacts directory
  const artifactsDir = path.join(process.cwd(), 'artifacts', 'coverage');
  if (!fs.existsSync(artifactsDir)) {
    fs.mkdirSync(artifactsDir, { recursive: true });
  }

  console.log('🔐 Setting up authentication...');
  
  // Basic auth setup - can be extended for actual login flows
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Navigate to base URL to establish session
  await page.goto(process.env.B2C_BASE_URL || 'https://www.mitre10.co.nz/');
  
  // Save storage state
  await context.storageState({ path: path.join(storageDir, 'auth.json') });
  
  await browser.close();
  
  console.log('✅ Authentication setup complete');
  console.log('✅ Global setup complete');
}

export default globalSetup;