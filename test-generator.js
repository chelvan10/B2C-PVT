const TestSummaryGenerator = require('./utils/reporting/test-summary-generator.js');
const path = require('path');

console.log('🧪 Testing Test Summary Generator...');

const generator = new TestSummaryGenerator({
  outputDir: path.join(process.cwd(), 'reports'),
  projectName: 'B2C PVT Demo Test',
  version: '1.0.0',
  environment: 'Test'
});

const mockResults = {
  suites: [{
    specs: [
      {
        title: 'Homepage loads correctly',
        file: 'tests/smoke/homepage.spec.ts',
        tests: [{
          results: [{
            status: 'passed',
            duration: 2500
          }]
        }]
      },
      {
        title: 'Navigation works',
        file: 'tests/smoke/navigation.spec.ts',
        tests: [{
          results: [{
            status: 'passed',
            duration: 1800
          }]
        }]
      }
    ]
  }]
};

generator.generateSummary(mockResults).then(reportPath => {
  console.log('✅ Test completed successfully!');
  console.log('📄 Report generated at:', reportPath);
  console.log('🎉 Test Summary Generator is working correctly!');
}).catch(error => {
  console.error('❌ Test failed:', error);
});