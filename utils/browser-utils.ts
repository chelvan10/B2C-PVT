import { Page, BrowserContext } from '@playwright/test';

export class BrowserUtils {
  static async isMobile(page: Page): Promise<boolean> {
    const viewport = page.viewportSize();
    return viewport ? viewport.width < 768 : false;
  }

  static async isChromium(page: Page): Promise<boolean> {
    const browserName = page.context().browser()?.browserType().name();
    return browserName === 'chromium';
  }

  static async handlePopups(page: Page): Promise<void> {
    const popupSelectors = [
      '[class*="popup"]', '[class*="modal"]', '[class*="dialog"]',
      '[data-testid*="popup"]', '[role="dialog"]'
    ];
    
    for (const selector of popupSelectors) {
      const popup = page.locator(selector).first();
      if (await popup.isVisible({ timeout: 1000 }).catch(() => false)) {
        const closeBtn = popup.locator('button:has-text("Close"), button:has-text("×"), [aria-label="Close"]').first();
        if (await closeBtn.isVisible({ timeout: 500 }).catch(() => false)) {
          await closeBtn.click();
          await page.waitForTimeout(300);
          break;
        }
      }
    }
  }

  static async waitForStableLoad(page: Page, timeout = 10000): Promise<void> {
    const isMobileView = await this.isMobile(page);
    const adjustedTimeout = isMobileView ? timeout * 1.5 : timeout;
    
    try {
      await page.waitForLoadState('domcontentloaded', { timeout: adjustedTimeout / 2 });
      await page.waitForLoadState('networkidle', { timeout: adjustedTimeout / 2 });
    } catch {
      // Fallback to basic load state with mobile adjustment
      await page.waitForLoadState('load', { timeout: adjustedTimeout });
    }
  }

  static async getNavigationSelector(page: Page): Promise<string> {
    const isMobileView = await this.isMobile(page);
    return isMobileView 
      ? 'button[aria-label*="menu"], .hamburger, .nav-toggle, [class*="mobile-menu"], [class*="nav-mobile"], .menu-button, button:has-text("Menu")'
      : 'nav, [role="navigation"], .navigation, .nav-menu, .departments';
  }

  static async getProductsTabSelector(page: Page): Promise<string> {
    const isMobileView = await this.isMobile(page);
    return isMobileView 
      ? '[class*="products"], [data-testid*="products"], .product-count, .results-count, [class*="tab"]:has-text("Products")'
      : 'a[role="link"]:has-text("products"), [class*="products-tab"], .product-count';
  }

  static async getMobileTimeout(page: Page, baseTimeout: number = 5000): Promise<number> {
    const isMobileView = await this.isMobile(page);
    return isMobileView ? baseTimeout * 1.5 : baseTimeout; // 50% longer for mobile
  }

  static async emulateNetworkConditions(page: Page, preset: 'fast3g' | 'slow3g' | 'offline'): Promise<void> {
    if (!await this.isChromium(page)) return; // Skip for non-Chromium browsers

    const conditions = {
      fast3g: { downloadThroughput: 1.5 * 1024 * 1024 / 8, uploadThroughput: 750 * 1024 / 8, latency: 150 },
      slow3g: { downloadThroughput: 500 * 1024 / 8, uploadThroughput: 500 * 1024 / 8, latency: 400 },
      offline: { downloadThroughput: 0, uploadThroughput: 0, latency: 0 }
    };

    try {
      const client = await page.context().newCDPSession(page);
      await client.send('Network.emulateNetworkConditions', {
        offline: preset === 'offline',
        ...conditions[preset]
      });
    } catch {
      // Silently skip if CDP not available
    }
  }
}