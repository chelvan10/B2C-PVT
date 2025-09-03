import { test, expect } from '@playwright/test';
import { BrowserUtils } from '../../utils/browser-utils.js';

test.describe('🛒 Mitre 10 E-Commerce Platform - Optimized Search Journey', () => {
  test('🔍 Search for "Tables" and validate comprehensive results display', async ({ page }) => {
    const searchStart = Date.now();
    
    await test.step('🌐 Navigate to Mitre 10 homepage', async () => {
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await BrowserUtils.waitForStableLoad(page, 6000);
    });
    
    await test.step('🚫 Handle any location/cookie popups', async () => {
      await BrowserUtils.handlePopups(page);
    });
    
    await test.step('✅ Verify homepage loaded successfully', async () => {
      await expect(page).toHaveTitle(/Mitre 10/, { timeout: 3000 });
    });
    
    await test.step('🔎 Enter search term "Tables" in search box', async () => {
      const searchBox = page.getByRole('textbox', { name: /search for products/i });
      await searchBox.fill('Tables');
      await page.waitForTimeout(100);
    });
    
    await test.step('🚀 Execute search and wait for results', async () => {
      const searchButton = page.getByRole('button', { name: 'search' });
      await Promise.all([
        page.waitForURL(/.*search.*Tables.*/, { timeout: 8000 }),
        searchButton.click()
      ]);
    });
    
    await test.step('📊 Validate search results with performance tracking', async () => {
      const isMobile = await BrowserUtils.isMobile(page);
      const timeout = await BrowserUtils.getMobileTimeout(page, 5000);
      const productsSelector = await BrowserUtils.getProductsTabSelector(page);
      
      const resultsHeading = page.locator('h1').filter({ hasText: /showing.*results for.*tables/i }).first();
      
      await expect(resultsHeading).toBeVisible({ timeout });
      
      // Mobile-adaptive products validation
      if (isMobile) {
        // On mobile, check for any products indicator
        const productsIndicator = page.locator(productsSelector).first();
        const hasProducts = await productsIndicator.isVisible({ timeout: 2000 }).catch(() => false);
        if (!hasProducts) {
          console.log('📱 Mobile: Products tab not visible, checking results count instead');
        }
      } else {
        // Desktop: expect products tab
        const productsTab = page.getByRole('link', { name: /products \(\d+\)/i }).first();
        await expect(productsTab).toBeVisible({ timeout });
      }
      
      const resultsText = await resultsHeading.textContent();
      if (!resultsText) throw new Error('Results text not found');
      const resultsMatch = resultsText.match(/showing (\d+) results/i);
      const resultsCount = resultsMatch ? parseInt(resultsMatch[1], 10) : 0;
      
      expect(resultsCount).toBeGreaterThan(0);
      
      const searchTime = Date.now() - searchStart;
      console.log(`🎯 SUCCESS: Found ${resultsCount} results for "Tables" in ${searchTime}ms`);
      expect(searchTime).toBeLessThan(12000);
    });
    
    await test.step('🏪 Verify store location information is visible', async () => {
      const storeInfo = page.locator('[class*="store"], [class*="location"]').first();
      await expect(storeInfo).toBeVisible({ timeout: 3000 });
    });
  });

  test('🏬 Verify store location management system', async ({ page }) => {
    await test.step('🌐 Navigate to Mitre 10 homepage', async () => {
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await BrowserUtils.waitForStableLoad(page, 6000);
    });
    
    await test.step('🚫 Handle any location/cookie popups', async () => {
      await BrowserUtils.handlePopups(page);
    });
    
    await test.step('🏪 Check and validate store location display', async () => {
      const storeDisplay = page.locator('[class*="store"], [class*="location"]').first();
      await expect(storeDisplay).toBeVisible({ timeout: 5000 });
      
      const storeText = await storeDisplay.textContent();
      console.log(`🏬 Current store: ${storeText}`);
      
      if (!storeText?.includes('Glenfield')) {
        const changeStoreBtn = page.getByRole('button', { name: /change store|choose store/i });
        if (await changeStoreBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
          await changeStoreBtn.click();
          await page.waitForTimeout(500);
        }
      }
    });
  });
});