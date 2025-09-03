// 1Centre Internal System Smoke Test
import { test, expect } from '@playwright/test';
import { BrowserUtils } from '../../../utils/browser-utils';

test.describe('🏢 1Centre Internal System - Smoke Tests', () => {
  test('@smoke @1centre TC-1C-001: 1Centre system accessibility', async ({ page }) => {
    await test.step('🌐 Navigate to 1Centre', async () => {
      await page.goto('/');
      await BrowserUtils.waitForStableLoad(page, 5000);
    });

    await test.step('✅ Verify system accessibility', async () => {
      // Basic connectivity test
      await expect(page.locator('body')).toBeVisible();
      console.log('✅ 1Centre system accessible');
    });
  });
});