// Shared Common Locators - Consolidated from duplicate patterns
// Created: 2025-01-28
// Purpose: Eliminate duplicate locator definitions across test files

import { type Page, type Locator } from '@playwright/test';

export class CommonLocators {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  // Search Elements (consolidated from 9+ duplicate instances)
  get searchBox(): Locator {
    return this.page.getByRole('textbox', { name: /search for products/i });
  }

  get searchButton(): Locator {
    return this.page.getByRole('button', { name: 'search' });
  }

  // Navigation Elements (consolidated from multiple files)
  getNavigationLink(name: string): Locator {
    return this.page.getByRole('link', { name: new RegExp(name, 'i') });
  }

  // Common Content Elements
  get images(): Locator {
    return this.page.locator('img');
  }

  get storeInfo(): Locator {
    return this.page.locator('[class*="store"], [class*="location"]').first();
  }

  // Results and Products
  get resultsHeading(): Locator {
    return this.page.locator('h1').filter({ hasText: /showing.*results/i });
  }

  get productsTab(): Locator {
    return this.page.getByRole('link', { name: /products \(\d+\)/i });
  }

  // Popup Handling
  async handlePopups(): Promise<void> {
    const popupSelectors = [
      '[class*="popup"]', '[class*="modal"]', '[class*="dialog"]',
      '[data-testid*="popup"]', '[role="dialog"]'
    ];
    
    for (const selector of popupSelectors) {
      const popup = this.page.locator(selector).first();
      if (await popup.isVisible({ timeout: 1000 }).catch(() => false)) {
        const closeBtn = popup.locator('button:has-text("Close"), button:has-text("×"), [aria-label="Close"]').first();
        if (await closeBtn.isVisible({ timeout: 500 }).catch(() => false)) {
          await closeBtn.click();
          await this.page.waitForTimeout(300);
          break;
        }
      }
    }
  }
}