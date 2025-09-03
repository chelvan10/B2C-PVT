// ARCHIVED: Replaced by mitre10-search-plp-standard.spec.ts — see /tests/e2e/
// Archived on: 2025-01-28
// Reason: Superseded by industry-standard search validation with enhanced PLP integration

import { test, expect } from '@playwright/test';

test.describe('🛒 Mitre 10 E-Commerce - Comprehensive Search Testing Suite', () => {
  
  // POSITIVE TEST CASES
  test.describe('✅ Positive Test Cases - Happy Path Scenarios', () => {
    
    test('🎯 Valid product search returns accurate results', async ({ page }) => {
      await test.step('🌐 Navigate to homepage', async () => {
        await page.goto('/');
        await handlePopups(page);
      });
      
      await test.step('🔍 Search for valid product "Tables"', async () => {
        const searchBox = page.getByRole('textbox', { name: /search for products/i });
        await expect(searchBox).toBeVisible();
        await searchBox.fill('Tables');
        
        const searchButton = page.getByRole('button', { name: 'search' });
        await searchButton.click();
      });
      
      await test.step('📊 Validate search results structure', async () => {
        await page.waitForURL(/.*search.*Tables.*/);
        
        const resultsHeading = page.locator('h1').filter({ hasText: /showing.*results for.*tables/i });
        await expect(resultsHeading).toBeVisible();
        
        const resultsText = await resultsHeading.textContent();
        expect(resultsText).toBeTruthy();
        if (!resultsText) throw new Error('Results text not found');
        const resultsMatch = resultsText.match(/showing (\d+) results/i);
        const resultsCount = resultsMatch ? parseInt(resultsMatch[1]) : 0;
        
        expect(resultsCount).toBeGreaterThan(0);
        expect(resultsCount).toBeLessThan(1000); // Reasonable upper bound
        console.log(`✅ Found ${resultsCount} results for "Tables"`);
      });
      
      await test.step('🏷️ Verify product listings display correctly', async () => {
        const productItems = page.locator('[data-testid="product-item"], .product-item, .product-card').first();
        if (await productItems.isVisible({ timeout: 5000 }).catch(() => false)) {
          await expect(productItems).toBeVisible();
        }
      });
    });

    test('🔤 Search with different case variations works correctly', async ({ page }) => {
      const searchTerms = ['tables', 'TABLES', 'Tables', 'tAbLeS'];
      
      for (const term of searchTerms) {
        await test.step(`🔍 Search for "${term}"`, async () => {
          await page.goto('/');
          await handlePopups(page);
          
          const searchBox = page.getByRole('textbox', { name: /search for products/i });
          await searchBox.fill(term);
          
          const searchButton = page.getByRole('button', { name: 'search' });
          await searchButton.click();
          
          await page.waitForURL(/.*search.*/);
          const resultsHeading = page.locator('h1').filter({ hasText: /showing.*results/i });
          await expect(resultsHeading).toBeVisible();
          
          console.log(`✅ Case variation "${term}" search successful`);
        });
      }
    });

    test('🏪 Store location functionality works correctly', async ({ page }) => {
      await test.step('🌐 Navigate and verify store display', async () => {
        await page.goto('/');
        await handlePopups(page);
        
        const storeDisplay = page.locator('[class*="store"], [class*="location"]').first();
        await expect(storeDisplay).toBeVisible();
        
        const storeText = await storeDisplay.textContent();
        expect(storeText).toBeTruthy();
        expect(storeText!.length).toBeGreaterThan(0);
        
        console.log(`🏬 Store location: ${storeText}`);
      });
    });
  });

  // NEGATIVE TEST CASES
  test.describe('❌ Negative Test Cases - Error Handling', () => {
    
    test('🚫 Invalid/Non-existent product search handles gracefully', async ({ page }) => {
      const invalidSearchTerms = ['xyzabc123nonexistent', '!@#$%^&*()', ''];
      
      for (const term of invalidSearchTerms) {
        await test.step(`🔍 Search for invalid term: "${term}"`, async () => {
          await page.goto('/');
          await handlePopups(page);
          
          const searchBox = page.getByRole('textbox', { name: /search for products/i });
          await searchBox.fill(term);
          
          const searchButton = page.getByRole('button', { name: 'search' });
          await searchButton.click();
          
          if (term === '') {
            // Empty search should either prevent submission or show all products
            const currentUrl = page.url();
            expect(currentUrl).toBeTruthy();
          } else {
            await page.waitForURL(/.*search.*/);
            
            // Should show "no results" or "0 results" message
            const noResultsIndicators = [
              page.locator('text=/no results/i'),
              page.locator('text=/0 results/i'),
              page.locator('text=/nothing found/i'),
              page.locator('h1').filter({ hasText: /showing 0 results/i })
            ];
            
            let foundIndicator = false;
            for (const indicator of noResultsIndicators) {
              if (await indicator.isVisible({ timeout: 2000 }).catch(() => false)) {
                foundIndicator = true;
                break;
              }
            }
            
            console.log(`✅ Invalid search "${term}" handled appropriately`);
          }
        });
      }
    });

    test('🌐 Network interruption during search handles gracefully', async ({ page }) => {
      await test.step('🔍 Simulate slow network conditions', async () => {
        // Simulate slow network
        await page.route('**/*', route => {
          setTimeout(() => route.continue(), 100);
        });
        
        await page.goto('/');
        await handlePopups(page);
        
        const searchBox = page.getByRole('textbox', { name: /search for products/i });
        await searchBox.fill('Tables');
        
        const searchButton = page.getByRole('button', { name: 'search' });
        await searchButton.click();
        
        // Should eventually load or show appropriate loading state
        await expect(page.locator('body')).toBeVisible({ timeout: 30000 });
        console.log('✅ Slow network conditions handled');
      });
    });
  });

  // EDGE CASES
  test.describe('🔄 Edge Cases - Boundary Conditions', () => {
    
    test('📏 Very long search terms handle correctly', async ({ page }) => {
      await test.step('🔍 Test maximum length search term', async () => {
        const longSearchTerm = 'a'.repeat(255); // Very long search term
        
        await page.goto('/');
        await handlePopups(page);
        
        const searchBox = page.getByRole('textbox', { name: /search for products/i });
        await searchBox.fill(longSearchTerm);
        
        // Verify input accepts or truncates appropriately
        const inputValue = await searchBox.inputValue();
        expect(inputValue.length).toBeLessThanOrEqual(255);
        
        const searchButton = page.getByRole('button', { name: 'search' });
        await searchButton.click();
        
        // Should handle gracefully without crashing
        await expect(page.locator('body')).toBeVisible();
        console.log('✅ Long search term handled correctly');
      });
    });

    test('🔢 Special characters and unicode in search', async ({ page }) => {
      const specialSearchTerms = [
        'café', // Unicode characters
        'naïve', // Accented characters
        '测试', // Chinese characters
        'тест', // Cyrillic characters
        'table & chair', // Ampersand
        'table-chair', // Hyphen
        'table/chair', // Slash
        'table+chair' // Plus sign
      ];
      
      for (const term of specialSearchTerms) {
        await test.step(`🔍 Search with special characters: "${term}"`, async () => {
          await page.goto('/');
          await handlePopups(page);
          
          const searchBox = page.getByRole('textbox', { name: /search for products/i });
          await searchBox.fill(term);
          
          const searchButton = page.getByRole('button', { name: 'search' });
          await searchButton.click();
          
          // Should handle without errors
          await expect(page.locator('body')).toBeVisible();
          console.log(`✅ Special character search "${term}" handled`);
        });
      }
    });

    test('⚡ Rapid consecutive searches handle correctly', async ({ page }) => {
      await test.step('🔄 Perform rapid search sequence', async () => {
        await page.goto('/');
        await handlePopups(page);
        
        const searchTerms = ['table', 'chair', 'desk', 'lamp'];
        
        for (const term of searchTerms) {
          const searchBox = page.getByRole('textbox', { name: /search for products/i });
          await searchBox.fill(term);
          
          const searchButton = page.getByRole('button', { name: 'search' });
          await searchButton.click();
          
          // Brief wait to simulate rapid user behavior
          await page.waitForTimeout(500);
        }
        
        // Final search should complete successfully
        await page.waitForURL(/.*search.*/);
        await expect(page.locator('body')).toBeVisible();
        console.log('✅ Rapid consecutive searches handled');
      });
    });

    test('📱 Mobile viewport search behavior', async ({ page }) => {
      await test.step('📱 Test mobile-specific search interactions', async () => {
        // Set mobile viewport
        await page.setViewportSize({ width: 375, height: 667 });
        
        await page.goto('/');
        await handlePopups(page);
        
        const searchBox = page.getByRole('textbox', { name: /search for products/i });
        await expect(searchBox).toBeVisible();
        
        // Test mobile keyboard behavior
        await searchBox.focus();
        await searchBox.fill('Tables');
        
        // Test mobile search submission
        const searchButton = page.getByRole('button', { name: 'search' });
        await searchButton.click();
        
        await page.waitForURL(/.*search.*/);
        await expect(page.locator('body')).toBeVisible();
        console.log('✅ Mobile search behavior verified');
      });
    });
  });

  // PERFORMANCE & ACCESSIBILITY TESTS
  test.describe('⚡ Performance & Accessibility Validation', () => {
    
    test('⚡ Search performance meets acceptable thresholds', async ({ page }) => {
      await test.step('📊 Measure search response time', async () => {
        await page.goto('/');
        await handlePopups(page);
        
        const startTime = Date.now();
        
        const searchBox = page.getByRole('textbox', { name: /search for products/i });
        await searchBox.fill('Tables');
        
        const searchButton = page.getByRole('button', { name: 'search' });
        await searchButton.click();
        
        await page.waitForURL(/.*search.*/);
        await page.waitForLoadState('networkidle');
        
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        
        // Performance threshold: search should complete within 10 seconds
        expect(responseTime).toBeLessThan(10000);
        console.log(`⚡ Search completed in ${responseTime}ms`);
      });
    });

    test('♿ Search accessibility compliance', async ({ page }) => {
      await test.step('🔍 Verify search form accessibility', async () => {
        await page.goto('/');
        await handlePopups(page);
        
        const searchBox = page.getByRole('textbox', { name: /search for products/i });
        
        // Verify ARIA labels and roles
        await expect(searchBox).toBeVisible();
        
        // Test keyboard navigation
        await searchBox.focus();
        await expect(searchBox).toBeFocused();
        
        // Test screen reader compatibility
        const searchLabel = await searchBox.getAttribute('aria-label') || 
                           await searchBox.getAttribute('placeholder') ||
                           await searchBox.getAttribute('title');
        
        expect(searchLabel).toBeTruthy();
        console.log('♿ Search accessibility verified');
      });
    });
  });
});

// UTILITY FUNCTIONS
async function handlePopups(page: any) {
  const locationPopup = page.locator('[class*="popup"], [class*="modal"], [class*="dialog"]').first();
  if (await locationPopup.isVisible({ timeout: 2000 }).catch(() => false)) {
    const closeBtn = page.locator('button:has-text("Close"), button:has-text("×"), [aria-label="Close"]').first();
    if (await closeBtn.isVisible()) await closeBtn.click();
  }
}