#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🚀 Generating Test Summary Report...\n');

try {
  // Check if test results exist
  const resultsPath = path.join(process.cwd(), 'test-results', 'results.json');
  
  if (!fs.existsSync(resultsPath)) {
    console.log('⚠️ No test results found. Running tests first...');
    
    // Run a quick smoke test
    execSync('npx playwright test --project=b2c-desktop-chrome B2C/tests/smoke/homepage-comprehensive-everest.spec.ts', {
      stdio: 'inherit',
      cwd: process.cwd()
    });
  }

  // Generate the test summary
  console.log('\n📊 Generating ISTQB Test Summary Report...');
  
  const { generateTestSummaryAfterRun } = require('../utils/reporting/playwright-hook.ts');
  
  generateTestSummaryAfterRun().then(() => {
    console.log('\n✅ Test Summary Report Generation Complete!');
    console.log('📄 Check the reports/ directory for generated files');
    
    // List generated files
    const reportsDir = path.join(process.cwd(), 'reports');
    if (fs.existsSync(reportsDir)) {
      const files = fs.readdirSync(reportsDir);
      console.log('\n📁 Generated Files:');
      files.forEach(file => {
        console.log(`   - ${file}`);
      });
    }
  }).catch(error => {
    console.error('❌ Failed to generate test summary:', error);
    process.exit(1);
  });

} catch (error) {
  console.error('💥 Error:', error.message);
  process.exit(1);
}