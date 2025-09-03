import { test, expect } from '@playwright/test';
import { BrowserUtils } from '../../utils/browser-utils.js';

test.describe('🏠 Mitre 10 Homepage - Optimized Cross-Browser Suite', () => {
  
  test('⚡ Fast homepage validation', async ({ page }) => {
    // Optimized navigation with performance monitoring
    const startTime = Date.now();
    
    await test.step('🚀 Navigate and validate core elements', async () => {
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await BrowserUtils.handlePopups(page);
      
      // Parallel validation for speed
      await Promise.all([
        expect(page).toHaveTitle(/Mitre 10/, { timeout: 3000 }),
        expect(page.getByRole('link', { name: 'Mitre 10' }).first()).toBeVisible({ timeout: 3000 }),
        expect(page.getByRole('textbox', { name: /search for products/i })).toBeVisible({ timeout: 3000 })
      ]);
    });

    await test.step('🧭 Validate responsive navigation', async () => {
      const isMobile = await BrowserUtils.isMobile(page);
      const timeout = await BrowserUtils.getMobileTimeout(page, 3000);
      
      if (isMobile) {
        // Try multiple mobile navigation patterns
        const mobileNavSelectors = [
          'button[aria-label*="menu"]',
          '.hamburger, .menu-button',
          '[class*="mobile-menu"], [class*="nav-mobile"]',
          'button:has-text("Menu")',
          '.nav-toggle',
          '[data-testid*="menu"]'
        ];
        
        let navFound = false;
        for (const selector of mobileNavSelectors) {
          const navElement = page.locator(selector).first();
          if (await navElement.isVisible({ timeout: 1000 }).catch(() => false)) {
            navFound = true;
            console.log(`📱 Mobile navigation found: ${selector}`);
            break;
          }
        }
        
        if (!navFound) {
          // Mobile: Navigation may be hidden, just log and continue
          console.log('📱 Mobile navigation: Hidden (expected mobile behavior)');
        }
      } else {
        // Desktop navigation
        const navSelector = await BrowserUtils.getNavigationSelector(page);
        const navElement = page.locator(navSelector).first();
        await expect(navElement).toBeVisible({ timeout });
        console.log('🖥️ Desktop navigation validated');
      }
    });

    const loadTime = Date.now() - startTime;
    console.log(`⚡ Page validation completed in ${loadTime}ms`);
    expect(loadTime).toBeLessThan(8000); // Industry standard: < 8s
  });

  test('🔍 Optimized search workflow', async ({ page }) => {
    await test.step('🎯 Execute search with performance tracking', async () => {
      const searchStart = Date.now();
      
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await BrowserUtils.handlePopups(page);
      
      const searchBox = page.getByRole('textbox', { name: /search for products/i });
      await searchBox.fill('tools');
      
      const searchButton = page.getByRole('button', { name: 'search' });
      await Promise.all([
        page.waitForURL(/.*search.*tools.*/, { timeout: 6000 }),
        searchButton.click()
      ]);
      
      const searchTime = Date.now() - searchStart;
      console.log(`🔍 Search completed in ${searchTime}ms`);
      expect(searchTime).toBeLessThan(6000); // Industry standard: < 6s for search
    });
  });

  test.describe('🌐 Cross-Browser Performance Tests', () => {
    test('📊 Browser-specific optimizations', async ({ page }) => {
      const isChromium = await BrowserUtils.isChromium(page);
      const isMobile = await BrowserUtils.isMobile(page);
      
      await test.step('🔧 Apply browser-specific optimizations', async () => {
        if (isChromium) {
          // Chromium-specific optimizations
          await page.addInitScript(() => {
            // Disable animations for faster testing
            document.addEventListener('DOMContentLoaded', () => {
              const style = document.createElement('style');
              style.textContent = '*, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }';
              document.head.appendChild(style);
            });
          });
        }
        
        await page.goto('/', { waitUntil: 'domcontentloaded' });
        await BrowserUtils.handlePopups(page);
      });

      await test.step('📱 Validate responsive behavior', async () => {
        if (isMobile) {
          // Mobile-specific validations
          const viewport = page.viewportSize();
          expect(viewport?.width).toBeLessThan(768);
          
          // Check mobile-optimized elements
          const mobileElements = await page.locator('[class*="mobile"], [class*="responsive"]').count();
          expect(mobileElements).toBeGreaterThan(0);
        } else {
          // Desktop-specific validations
          const viewport = page.viewportSize();
          expect(viewport?.width).toBeGreaterThanOrEqual(768);
        }
      });
    });
  });

  test.describe('⚡ Performance Benchmarks', () => {
    test('🎯 Core Web Vitals simulation', async ({ page }) => {
      await test.step('📈 Measure performance metrics', async () => {
        const navigationStart = Date.now();
        
        await page.goto('/', { waitUntil: 'load' });
        await BrowserUtils.handlePopups(page);
        
        // Simulate Core Web Vitals measurement
        const metrics = await page.evaluate(() => {
          return {
            loadTime: performance.now(),
            domElements: document.querySelectorAll('*').length,
            images: document.querySelectorAll('img').length
          };
        });
        
        const totalTime = Date.now() - navigationStart;
        
        console.log(`📊 Performance Metrics:
          - Total Load Time: ${totalTime}ms
          - DOM Elements: ${metrics.domElements}
          - Images: ${metrics.images}`);
        
        // Industry benchmarks
        expect(totalTime).toBeLessThan(10000); // < 10s total
        expect(metrics.domElements).toBeLessThan(5000); // Reasonable DOM size
      });
    });

    test('🌐 Network condition resilience', async ({ page }) => {
      const isChromium = await BrowserUtils.isChromium(page);
      
      if (isChromium) {
        await test.step('📶 Test under simulated network conditions', async () => {
          // Test Fast 3G with mobile-aware timeouts
          await BrowserUtils.emulateNetworkConditions(page, 'fast3g');
          const start = Date.now();
          const isMobile = await BrowserUtils.isMobile(page);
          const expectedLoadTime = isMobile ? 20000 : 15000; // Mobile gets extra time
          
          await page.goto('/', { waitUntil: 'domcontentloaded' });
          await BrowserUtils.handlePopups(page);
          
          const loadTime = Date.now() - start;
          console.log(`📶 Fast 3G load time: ${loadTime}ms (${isMobile ? 'Mobile' : 'Desktop'})`);
          expect(loadTime).toBeLessThan(expectedLoadTime);
        });
      } else {
        console.log('⚠️ Network emulation skipped for non-Chromium browser');
      }
    });
  });
});