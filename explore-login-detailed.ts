import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    console.log('🔍 Navigating to login page directly...');
    await page.goto('https://www.mitre10.co.nz/login');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);
    
    console.log('🔍 Looking for all input elements...');
    
    const inputs = await page.locator('input').all();
    console.log(`Found ${inputs.length} input elements:`);
    
    for (let i = 0; i < inputs.length; i++) {
      const input = inputs[i];
      const type = await input.getAttribute('type');
      const name = await input.getAttribute('name');
      const id = await input.getAttribute('id');
      const placeholder = await input.getAttribute('placeholder');
      const className = await input.getAttribute('class');
      const visible = await input.isVisible();
      
      console.log(`Input ${i + 1}: type="${type}" name="${name}" id="${id}" placeholder="${placeholder}" class="${className}" visible=${visible}`);
    }
    
    console.log('🔍 Looking for all button elements...');
    
    const buttons = await page.locator('button').all();
    console.log(`Found ${buttons.length} button elements:`);
    
    for (let i = 0; i < buttons.length; i++) {
      const button = buttons[i];
      const type = await button.getAttribute('type');
      const text = await button.textContent();
      const className = await button.getAttribute('class');
      const visible = await button.isVisible();
      
      console.log(`Button ${i + 1}: type="${type}" text="${text?.trim()}" class="${className}" visible=${visible}`);
    }
    
    console.log('🔍 Looking for form elements...');
    
    const forms = await page.locator('form').all();
    console.log(`Found ${forms.length} form elements`);
    
    for (let i = 0; i < forms.length; i++) {
      const form = forms[i];
      const action = await form.getAttribute('action');
      const method = await form.getAttribute('method');
      const className = await form.getAttribute('class');
      
      console.log(`Form ${i + 1}: action="${action}" method="${method}" class="${className}"`);
    }
    
    // Try to interact with the first email input
    console.log('🔍 Attempting to interact with email input...');
    
    const emailInput = page.locator('input[type="email"]').first();
    if (await emailInput.isVisible()) {
      await emailInput.fill('test@example.com');
      console.log('✅ Successfully filled email input');
    } else {
      console.log('❌ Email input not visible');
    }
    
    await page.waitForTimeout(5000);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await browser.close();
  }
})();