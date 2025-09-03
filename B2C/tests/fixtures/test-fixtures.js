const { test: baseTest, expect } = require('@playwright/test');

const test = baseTest.extend({
  accountPage: async ({ page }, use) => {
    const accountPage = {
      async navigateToLogin() { 
        await page.goto('/login'); 
      },
      async login(email, password) { 
        const { SmartLocators } = require('../../../utils/smart-locators.js');
        const locators = new SmartLocators(page);
        
        const emailField = await locators.findElement({ type: 'email' });
        await emailField.fill(email);
        
        const passwordField = await locators.findElement({ 
          css: ['input[type="password"]', 'input[name="password"]']
        });
        await passwordField.fill(password);
        
        await page.click('[type="submit"]');
      },
      async isAuthenticated() { 
        return page.locator('[data-testid="user-menu"]').isVisible();
      }
    };
    await use(accountPage);
  }
});

module.exports = { test, expect };