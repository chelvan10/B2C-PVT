import { test } from '@playwright/test';

export class TestReporter {
  static logValidation(category: string, description: string, result: 'PASS' | 'FAIL', details?: string) {
    const emoji = result === 'PASS' ? '✅' : '❌';
    const message = `${emoji} [${category}] ${description}`;
    
    if (details) {
      console.log(`${message}\n   📋 Details: ${details}`);
    } else {
      console.log(message);
    }
  }

  static logTestSummary(testName: string, validations: number, category: string) {
    console.log(`\n🎯 TEST SUMMARY: ${testName}`);
    console.log(`📊 Category: ${category}`);
    console.log(`🔍 Total Validations Performed: ${validations}`);
    console.log(`⏱️ Completed at: ${new Date().toLocaleString()}`);
    console.log('─'.repeat(60));
  }

  static async attachTestEvidence(page: any, stepName: string) {
    await test.step(`📸 Capturing evidence for: ${stepName}`, async () => {
      await page.screenshot({ 
        path: `test-results/evidence-${stepName.replace(/[^a-zA-Z0-9]/g, '-')}.png`,
        fullPage: true 
      });
    });
  }
}