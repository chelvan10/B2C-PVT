// B2B Trade Homepage Smoke Test
import { test, expect } from '@playwright/test';
import { BrowserUtils } from '../../../utils/browser-utils';

test.describe('🏢 B2B Trade Homepage - Smoke Tests', () => {
  test('@smoke @b2b TC-B2B-001: Trade homepage loads successfully', async ({ page }) => {
    await test.step('🌐 Navigate to Trade homepage', async () => {
      await page.goto('/');
      await BrowserUtils.waitForStableLoad(page, 5000);
    });

    await test.step('✅ Verify Trade-specific elements', async () => {
      await expect(page).toHaveTitle(/Trade|Business/);
      
      // Trade registration CTA
      const tradeCTA = page.locator('text=/register|join|trade account/i').first();
      if (await tradeCTA.isVisible({ timeout: 3000 }).catch(() => false)) {
        console.log('✅ Trade registration CTA found');
      }
    });
  });
});