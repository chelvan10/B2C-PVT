// ARCHIVED: Replaced by mitre10-search-plp-standard.spec.ts — see /tests/e2e/
// Archived on: 2025-01-28
// Reason: Superseded by enhanced search validation with PLP integration

import { test, expect } from '@playwright/test';
import { BrowserUtils } from '../../utils/browser-utils.js';

test.describe('🛒 Mitre 10 E-Commerce Platform - Product Search Journey', () => {
  test('🔍 Search for "Tables" and validate comprehensive results display', async ({ page }) => {
    await test.step('🌐 Navigate to Mitre 10 homepage', async () => {
      await page.goto('/');
    });
    
    await test.step('🚫 Handle any location/cookie popups', async () => {
      const locationPopup = page.locator('[class*="popup"], [class*="modal"], [class*="dialog"]').first();
      if (await locationPopup.isVisible({ timeout: 2000 }).catch(() => false)) {
        const closeBtn = page.locator('button:has-text("Close"), button:has-text("×"), [aria-label="Close"]').first();
        if (await closeBtn.isVisible()) await closeBtn.click();
      }
    });
    
    await test.step('✅ Verify homepage loaded successfully', async () => {
      await expect(page).toHaveTitle(/Mitre 10/);
    });
    
    await test.step('🔎 Enter search term "Tables" in search box', async () => {
      const searchBox = page.getByRole('textbox', { name: /search for products/i });
      await searchBox.fill('Tables');
    });
    
    await test.step('🚀 Execute search by clicking search button', async () => {
      const searchButton = page.getByRole('button', { name: 'search' });
      await searchButton.click();
    });
    
    await test.step('⏳ Wait for search results page to load', async () => {
      await page.waitForURL(/.*search.*Tables.*/);
    });
    
    await test.step('📊 Validate search results heading is displayed', async () => {
      const resultsHeading = page.locator('h1').filter({ hasText: /showing.*results for.*tables/i });
      await expect(resultsHeading).toBeVisible();
    });
    
    await test.step('🔢 Extract and verify results count is greater than zero', async () => {
      const resultsHeading = page.locator('h1').filter({ hasText: /showing.*results for.*tables/i });
      const resultsText = await resultsHeading.textContent();
      if (!resultsText) throw new Error('Results text not found');
      const resultsMatch = resultsText.match(/showing (\d+) results/i);
      const resultsCount = resultsMatch ? parseInt(resultsMatch[1], 10) : 0;
      
      expect(resultsCount).toBeGreaterThan(0);
      console.log(`🎯 SUCCESS: Found ${resultsCount} results for "Tables"`); 
    });
    
    await test.step('📋 Verify products tab displays available items', async () => {
      const productsTab = page.getByRole('link', { name: /products \(\d+\)/i });
      await expect(productsTab).toBeVisible();
    });
    
    await test.step('🏪 Verify store location information is visible', async () => {
      const storeInfo = page.locator('[class*="store"], [class*="location"]').first();
      await expect(storeInfo).toBeVisible();
    });
  });

  test('🏬 Verify store location management system', async ({ page }) => {
    await test.step('🌐 Navigate to Mitre 10 homepage', async () => {
      await page.goto('/');
    });
    
    await test.step('🚫 Handle any location/cookie popups', async () => {
      const locationPopup = page.locator('[class*="popup"], [class*="modal"], [class*="dialog"]').first();
      if (await locationPopup.isVisible({ timeout: 2000 }).catch(() => false)) {
        const closeBtn = page.locator('button:has-text("Close"), button:has-text("×"), [aria-label="Close"]').first();
        if (await closeBtn.isVisible()) await closeBtn.click();
      }
    });
    
    await test.step('🏪 Check and validate store location display', async () => {
      const storeDisplay = page.locator('[class*="store"], [class*="location"]').first();
      await expect(storeDisplay).toBeVisible();
      
      const storeText = await storeDisplay.textContent();
      console.log(`🏬 Current store: ${storeText}`);
      
      if (!storeText?.includes('Glenfield')) {
        const changeStoreBtn = page.getByRole('button', { name: /change store|choose store/i });
        if (await changeStoreBtn.isVisible()) {
          await changeStoreBtn.click();
          await page.waitForTimeout(1000);
        }
      }
    });
  });
});