// Browser utilities for test framework
export class BrowserUtils {
  static async handlePopups(page) {
    const popupSelectors = [
      '[class*="popup"]',
      '[class*="modal"]', 
      '[class*="dialog"]',
      '[class*="cookie"]',
      '[class*="consent"]'
    ];
    
    for (const selector of popupSelectors) {
      const popup = page.locator(selector).first();
      if (await popup.isVisible({ timeout: 2000 }).catch(() => false)) {
        const closeButtons = [
          page.locator('button:has-text("Close")'),
          page.locator('button:has-text("×")'),
          page.locator('[aria-label="Close"]'),
          page.locator('button:has-text("Accept")'),
          page.locator('button:has-text("OK")')
        ];
        
        for (const closeBtn of closeButtons) {
          if (await closeBtn.first().isVisible({ timeout: 1000 }).catch(() => false)) {
            await closeBtn.first().click();
            break;
          }
        }
      }
    }
  }

  static async waitForStableLoad(page, timeout = 3000) {
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(Math.min(timeout, 3000));
  }

  static async isMobile(page) {
    const viewport = page.viewportSize();
    return viewport && viewport.width < 768;
  }
}