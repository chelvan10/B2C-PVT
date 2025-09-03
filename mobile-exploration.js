import { chromium, devices } from 'playwright';

(async () => {
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000 
  });
  
  const context = await browser.newContext({
    ...devices['Pixel 7'],
    locale: 'en-NZ'
  });
  
  // Simulate Slow 3G
  await context.route('**/*', async route => {
    await new Promise(resolve => setTimeout(resolve, 100));
    route.continue();
  });
  
  const page = await context.newPage();
  
  console.log('🔍 Starting Mobile Journey Exploration on Pixel 7');
  console.log('📱 Viewport: 393x852, Touch enabled, Slow 3G simulation');
  
  // Step 1: Navigate to homepage
  await page.goto('https://www.mitre10.co.nz');
  await page.waitForLoadState('domcontentloaded');
  
  console.log('✅ Homepage loaded');
  
  // Step 2: Locate search input
  console.log('🔍 Locating search input...');
  
  const searchSelectors = [
    'input[type="search"]',
    'input[placeholder*="search" i]',
    '.search-input',
    'header input',
    '[data-testid*="search"]'
  ];
  
  let searchInput = null;
  for (const selector of searchSelectors) {
    try {
      searchInput = await page.locator(selector).first();
      if (await searchInput.isVisible({ timeout: 2000 })) {
        console.log(`✅ Found search input: ${selector}`);
        break;
      }
    } catch (e) {
      console.log(`❌ Selector failed: ${selector}`);
    }
  }
  
  if (searchInput) {
    // Step 3: Tap search and enter keyword
    await searchInput.tap();
    console.log('✅ Search input tapped');
    
    await searchInput.fill('drill');
    console.log('✅ Entered "drill" keyword');
    
    await searchInput.press('Enter');
    console.log('✅ Search submitted');
    
    await page.waitForLoadState('domcontentloaded');
    
    // Step 4: Validate PLP
    const currentUrl = page.url();
    console.log(`✅ Current URL: ${currentUrl}`);
    
    if (currentUrl.includes('search') || currentUrl.includes('drill')) {
      console.log('✅ Successfully navigated to search results');
      
      // Check for product tiles
      const productSelectors = [
        '.product-item',
        '.product-card',
        '[data-testid*="product"]',
        '.search-result'
      ];
      
      for (const selector of productSelectors) {
        const products = await page.locator(selector).count();
        if (products > 0) {
          console.log(`✅ Found ${products} products with selector: ${selector}`);
          
          // Step 5: Tap first product
          const firstProduct = page.locator(selector).first();
          await firstProduct.tap();
          console.log('✅ Tapped first product');
          
          await page.waitForLoadState('domcontentloaded');
          
          // Step 6: Validate PDP
          const pdpUrl = page.url();
          console.log(`✅ Product page URL: ${pdpUrl}`);
          
          // Look for Add to Cart button
          const cartSelectors = [
            'button:has-text("Add to Cart")',
            'button:has-text("Add to Basket")',
            '[data-testid*="add-cart"]',
            '.add-to-cart'
          ];
          
          for (const cartSelector of cartSelectors) {
            try {
              const addToCartBtn = page.locator(cartSelector).first();
              if (await addToCartBtn.isVisible({ timeout: 3000 })) {
                console.log(`✅ Found Add to Cart button: ${cartSelector}`);
                await addToCartBtn.tap();
                console.log('✅ Add to Cart tapped');
                break;
              }
            } catch (e) {
              console.log(`❌ Cart button not found: ${cartSelector}`);
            }
          }
          
          break;
        }
      }
    }
  } else {
    console.log('❌ Search input not found - need to investigate mobile layout');
  }
  
  console.log('🏁 Mobile exploration complete - keeping browser open for manual inspection');
  console.log('Press Ctrl+C to close when done exploring');
  
  // Keep browser open for manual exploration
  await new Promise(() => {});
  
})();