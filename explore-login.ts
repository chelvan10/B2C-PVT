import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    console.log('🔍 Navigating to Mitre 10...');
    await page.goto('https://www.mitre10.co.nz/');
    await page.waitForLoadState('domcontentloaded');
    
    console.log('🔍 Looking for login/account triggers...');
    
    // Look for account/login triggers
    const accountTriggers = [
      'text=Login',
      'text=Sign in', 
      'text=Account',
      'text=My Account',
      '[aria-label*="account" i]',
      '[aria-label*="login" i]',
      '.account',
      '.login',
      'a[href*="login"]',
      'a[href*="account"]'
    ];
    
    for (const selector of accountTriggers) {
      try {
        const element = page.locator(selector);
        const count = await element.count();
        if (count > 0) {
          const text = await element.first().textContent();
          const href = await element.first().getAttribute('href');
          console.log(`✅ Found: ${selector} - Text: "${text}" - Href: "${href}"`);
        }
      } catch (error) {
        // Continue
      }
    }
    
    // Try to click on account area
    console.log('🔍 Attempting to access account area...');
    
    const possibleTriggers = [
      page.locator('text=Account').first(),
      page.locator('text=Login').first(),
      page.locator('text=Sign in').first(),
      page.locator('[aria-label*="account" i]').first(),
      page.locator('a[href*="login"]').first(),
      page.locator('a[href*="account"]').first()
    ];
    
    for (const trigger of possibleTriggers) {
      try {
        if (await trigger.isVisible({ timeout: 2000 })) {
          console.log(`🎯 Clicking on trigger...`);
          await trigger.click();
          await page.waitForTimeout(3000);
          
          console.log(`📍 Current URL: ${page.url()}`);
          
          // Look for login form elements
          console.log('🔍 Looking for login form elements...');
          
          const loginElements = [
            'input[type="email"]',
            'input[type="text"][name*="email"]',
            'input[placeholder*="email" i]',
            'input[type="password"]',
            'button[type="submit"]',
            'input[type="submit"]',
            'button:has-text("Login")',
            'button:has-text("Sign in")'
          ];
          
          for (const selector of loginElements) {
            try {
              const element = page.locator(selector);
              const count = await element.count();
              if (count > 0) {
                const placeholder = await element.first().getAttribute('placeholder');
                const name = await element.first().getAttribute('name');
                const type = await element.first().getAttribute('type');
                console.log(`✅ Login element: ${selector} - Type: ${type} - Name: ${name} - Placeholder: ${placeholder}`);
              }
            } catch (error) {
              // Continue
            }
          }
          
          break;
        }
      } catch (error) {
        continue;
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await browser.close();
  }
})();