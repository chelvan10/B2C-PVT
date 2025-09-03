#!/usr/bin/env node
// Multi-Project Scaffolding Script
import { mkdirSync, writeFileSync, existsSync } from 'fs';
import path from 'path';

const projectName = process.argv[2];

if (!projectName) {
  console.error('❌ Project name required: node create-project.js ProjectName');
  process.exit(1);
}

const projectDir = path.resolve(process.cwd(), projectName);

if (existsSync(projectDir)) {
  console.error(`❌ Project ${projectName} already exists`);
  process.exit(1);
}

try {
  // Create directory structure
  const dirs = [
    'tests/smoke',
    'tests/regression', 
    'tests/api',
    'fixtures',
    'data',
    'page-objects'
  ];

  dirs.forEach(dir => {
    mkdirSync(path.join(projectDir, dir), { recursive: true });
  });

  // Create initial smoke test
  const smokeTest = `// ${projectName} Smoke Test
import { test, expect } from '@playwright/test';
import { BrowserUtils } from '../../../utils/browser-utils.js';

test.describe('🧪 ${projectName} - Smoke Tests', () => {
  test('@smoke @${projectName.toLowerCase()} TC-${projectName.toUpperCase()}-001: Homepage loads successfully', async ({ page }) => {
    await test.step('🌐 Navigate to ${projectName} homepage', async () => {
      await page.goto('/');
      await BrowserUtils.waitForStableLoad(page, 5000);
    });

    await test.step('✅ Verify page loads', async () => {
      await expect(page.locator('body')).toBeVisible();
      console.log('✅ ${projectName} homepage accessible');
    });
  });
});`;

  writeFileSync(path.join(projectDir, 'tests/smoke/homepage.spec.ts'), smokeTest);

  console.log(`✅ Project ${projectName} created successfully`);
  console.log(`📁 Structure: ${projectName}/tests/{smoke,regression,api}`);
  console.log(`🚀 Next: Add project to config/playwright.config.ts`);

} catch (error) {
  console.error(`❌ Failed to create project: ${error.message}`);
  process.exit(1);
}