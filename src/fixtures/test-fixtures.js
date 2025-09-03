const { test: baseTest, expect } = require('@playwright/test');

const test = baseTest.extend({
  accountPage: async ({ page }, use) => {
    const accountPage = {
      async navigateToLogin() { 
        await page.goto('/login'); 
      },
      async login(email, password) { 
        await page.fill('[name="email"]', email);
        await page.fill('[name="password"]', password);
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