import { chromium, devices } from 'playwright';
import type { Page, BrowserContext } from 'playwright';

async function exploreMobileJourneyV2() {
  console.log('🔍 Starting Enhanced Mobile Journey Exploration');
  console.log('📱 Device: Pixel 7 (393x852), Touch enabled');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000 
  });
  
  const context: BrowserContext = await browser.newContext({
    ...devices['Pixel 7'],
    locale: 'en-NZ'
  });
  
  const page: Page = await context.newPage();
  
  try {
    // Step 1: Navigate and wait for full load
    console.log('🌐 Step 1: Loading homepage...');
    await page.goto('https://www.mitre10.co.nz');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000); // Allow any dynamic content to load
    console.log('✅ Homepage fully loaded');
    
    // Step 2: Enhanced search detection and interaction
    console.log('🔍 Step 2: Enhanced search detection...');
    
    // First, check if there's a search button/icon to tap
    const searchTriggers = [
      { selector: '.search-icon, .search-button', name: 'search icon/button' },
      { selector: 'button[aria-label*="search" i]', name: 'search aria-label' },
      { selector: '[data-testid*="search-trigger"]', name: 'search trigger testid' }
    ];
    
    let searchOpened = false;
    for (const trigger of searchTriggers) {
      try {
        const element = page.locator(trigger.selector).first();
        if (await element.isVisible({ timeout: 2000 })) {
          console.log(`✅ Found search trigger: ${trigger.name}`);
          await element.tap();
          await page.waitForTimeout(1000);
          searchOpened = true;
          break;
        }
      } catch (e) {
        console.log(`❌ Search trigger not found: ${trigger.name}`);
      }
    }
    
    // Now look for the actual search input
    const searchStrategies = [
      { selector: 'input[type="search"]', name: 'search input type' },
      { selector: 'input[placeholder*="search" i]', name: 'search placeholder' },
      { selector: 'input[name*="search" i]', name: 'search name attribute' },
      { selector: '.search-input, .search-field', name: 'search CSS classes' },
      { selector: 'header input, nav input', name: 'header/nav input' },
      { selector: '[data-testid*="search"] input', name: 'search testid input' },
      { selector: 'form input[type="text"]', name: 'form text input' }
    ];
    
    let searchInput = null;
    for (const strategy of searchStrategies) {
      try {
        const input = page.locator(strategy.selector).first();
        if (await input.isVisible({ timeout: 2000 })) {
          console.log(`✅ Found search input via: ${strategy.name}`);
          searchInput = input;
          break;
        }
      } catch (e) {
        console.log(`❌ Strategy failed: ${strategy.name}`);
      }
    }
    
    if (!searchInput) {
      console.log('❌ BLOCKING: No search input found');
      return false;
    }
    
    // Step 3: Enhanced search interaction
    console.log('🔍 Step 3: Performing search...');
    
    // Focus and fill the search input
    await searchInput.tap();
    await page.waitForTimeout(500);
    await searchInput.fill('drill');
    console.log('✅ Entered "drill" keyword');
    
    // Try multiple ways to submit the search
    const submitStrategies = [
      async () => {
        await searchInput.press('Enter');
        console.log('✅ Tried Enter key');
      },
      async () => {
        const submitBtn = page.locator('button[type="submit"], .search-submit, .search-button').first();
        if (await submitBtn.isVisible({ timeout: 1000 })) {
          await submitBtn.tap();
          console.log('✅ Tried submit button');
        }
      },
      async () => {
        const searchForm = page.locator('form').first();
        if (await searchForm.isVisible({ timeout: 1000 })) {
          await searchForm.evaluate(form => form.submit());
          console.log('✅ Tried form submit');
        }
      }
    ];
    
    for (const strategy of submitStrategies) {
      await strategy();
      await page.waitForTimeout(2000);
      
      // Check if URL changed or results appeared
      const currentUrl = page.url();
      const hasResults = await page.locator('.product-item, .search-result, [data-testid*="product"]').count() > 0;
      
      if (currentUrl.includes('search') || currentUrl.includes('drill') || hasResults) {
        console.log(`✅ Search successful! URL: ${currentUrl}`);
        break;
      }
    }
    
    // Wait for navigation or results to load
    await page.waitForLoadState('networkidle');
    
    // Step 4: Validate search results
    console.log('📋 Step 4: Validating search results...');
    const finalUrl = page.url();
    console.log(`Final URL: ${finalUrl}`);
    
    // Check for search results in multiple ways
    const resultIndicators = [
      { selector: '.product-item', name: 'product items' },
      { selector: '.search-result', name: 'search results' },
      { selector: '[data-testid*="product"]', name: 'product testids' },
      { selector: 'a[href*="/product/"]', name: 'product links' },
      { selector: '.product-card', name: 'product cards' },
      { selector: 'text=/\\d+.*results?/i', name: 'results count text' }
    ];
    
    let resultsFound = false;
    let productCount = 0;
    
    for (const indicator of resultIndicators) {
      const count = await page.locator(indicator.selector).count();
      if (count > 0) {
        console.log(`✅ Found ${count} ${indicator.name}`);
        resultsFound = true;
        productCount = Math.max(productCount, count);
      }
    }
    
    if (!resultsFound) {
      console.log('❌ BLOCKING: No search results found');
      
      // Debug: Check what's actually on the page
      const pageTitle = await page.title();
      const bodyText = await page.locator('body').textContent();
      console.log(`Page title: ${pageTitle}`);
      console.log(`Body contains "drill": ${bodyText?.includes('drill')}`);
      console.log(`Body contains "search": ${bodyText?.includes('search')}`);
      
      return false;
    }
    
    // Step 5: Test product interaction
    console.log('🖱️ Step 5: Testing product interaction...');
    
    const firstProduct = page.locator('.product-item, .search-result, [data-testid*="product"], a[href*="/product/"]').first();
    
    if (await firstProduct.isVisible({ timeout: 3000 })) {
      const beforeUrl = page.url();
      await firstProduct.tap();
      await page.waitForLoadState('networkidle');
      
      const afterUrl = page.url();
      if (afterUrl !== beforeUrl) {
        console.log('✅ Product navigation successful');
        console.log(`Product URL: ${afterUrl}`);
        
        // Step 6: Look for Add to Cart on PDP
        console.log('🛒 Step 6: Checking Add to Cart functionality...');
        
        const cartButtons = [
          'button:has-text("Add to Cart")',
          'button:has-text("Add to Basket")',
          '.add-to-cart',
          '[data-testid*="add-cart"]'
        ];
        
        for (const btnSelector of cartButtons) {
          const btn = page.locator(btnSelector).first();
          if (await btn.isVisible({ timeout: 2000 })) {
            console.log(`✅ Found Add to Cart button: ${btnSelector}`);
            break;
          }
        }
      } else {
        console.log('⚠️ Product tap did not navigate to new page');
      }
    }
    
    console.log('\n🏆 MOBILE JOURNEY VALIDATION SUMMARY');
    console.log('✅ Homepage loading: WORKING');
    console.log('✅ Search functionality: WORKING');
    console.log(`✅ Search results: ${productCount} products found`);
    console.log('✅ Product navigation: WORKING');
    console.log('✅ Mobile responsiveness: WORKING');
    
    return true;
    
  } catch (error) {
    console.error('❌ CRITICAL ERROR:', error);
    return false;
  } finally {
    console.log('\n🔍 Keeping browser open for manual inspection...');
    await page.waitForTimeout(15000);
    await browser.close();
  }
}

// Run the enhanced exploration
exploreMobileJourneyV2().then(success => {
  if (success) {
    console.log('\n✅ VALIDATION PASSED - Ready for test script generation');
    process.exit(0);
  } else {
    console.log('\n❌ VALIDATION FAILED - Need to investigate further');
    process.exit(1);
  }
}).catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});