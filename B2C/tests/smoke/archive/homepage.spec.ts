import { test, expect } from '@playwright/test';
import { BrowserUtils } from '../../utils/browser-utils.js';

test.describe('🏠 Mitre 10 Homepage - Core Functionality Validation', () => {
  test('✨ Homepage loads successfully with all essential elements', async ({ page }) => {
    await test.step('🌐 Navigate to Mitre 10 homepage', async () => {
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await BrowserUtils.waitForStableLoad(page, 8000);
    });
    
    await test.step('🚫 Handle any location/cookie popups gracefully', async () => {
      await BrowserUtils.handlePopups(page);
    });
    
    await test.step('📄 Verify page title contains Mitre 10 branding', async () => {
      await expect(page).toHaveTitle(/Mitre 10/, { timeout: 5000 });
    });
    
    await test.step('🎨 Verify main Mitre 10 logo is prominently displayed', async () => {
      const logo = page.getByRole('link', { name: 'Mitre 10' }).first();
      await expect(logo).toBeVisible({ timeout: 5000 });
    });
    
    await test.step('🔍 Verify search functionality is accessible', async () => {
      const searchBox = page.getByRole('textbox', { name: /search for products/i });
      await expect(searchBox).toBeVisible({ timeout: 5000 });
    });
    
    await test.step('🧭 Verify navigation menu is present', async () => {
      const isMobile = await BrowserUtils.isMobile(page);
      if (isMobile) {
        // Mobile: Check for hamburger menu or mobile navigation
        const mobileNav = page.locator('button[aria-label*="menu"], .hamburger, .nav-toggle, [class*="mobile-menu"]').first();
        await expect(mobileNav).toBeVisible({ timeout: 5000 });
      } else {
        // Desktop: Check for departments menu
        const departments = page.getByText('Departments').first();
        await expect(departments).toBeVisible({ timeout: 5000 });
      }
    });
  });

  test('🔎 Search functionality operates correctly', async ({ page }) => {
    await test.step('🌐 Navigate to Mitre 10 homepage', async () => {
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await BrowserUtils.waitForStableLoad(page, 6000);
    });
    
    await test.step('🚫 Handle any location/cookie popups gracefully', async () => {
      await BrowserUtils.handlePopups(page);
    });
    
    await test.step('🔨 Enter test search term "hammer"', async () => {
      const searchBox = page.getByRole('textbox', { name: /search for products/i });
      await searchBox.fill('hammer');
      await page.waitForTimeout(200); // Brief pause for input processing
    });
    
    await test.step('🚀 Execute search and verify navigation', async () => {
      const searchButton = page.getByRole('button', { name: 'search' });
      await Promise.all([
        page.waitForURL(/.*search.*hammer.*/, { timeout: 8000 }),
        searchButton.click()
      ]);
      console.log('✅ Search functionality working perfectly!');
    });
  });
});