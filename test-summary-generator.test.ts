import { TestSummaryGenerator } from './utils/reporting/test-summary-generator';
import fs from 'fs';
import path from 'path';

// Test the generator with mock data
async function testGenerator() {
  console.log('🧪 Testing Test Summary Generator...\n');

  // Mock test results data
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
        },
        {
          title: 'Search functionality',
          file: 'tests/smoke/search.spec.ts',
          tests: [{
            results: [{
              status: 'failed',
              duration: 3200
            }]
          }]
        }
      ]
    }]
  };

  // Create test output directory
  const testOutputDir = path.join(process.cwd(), 'test-output');
  if (!fs.existsSync(testOutputDir)) {
    fs.mkdirSync(testOutputDir, { recursive: true });
  }

  // Initialize generator
  const generator = new TestSummaryGenerator({
    outputDir: testOutputDir,
    projectName: 'B2C PVT Demo Test',
    version: '1.0.0',
    environment: 'Test'
  });

  try {
    // Generate report
    const reportPath = await generator.generateSummary(mockResults);
    
    console.log('✅ Report generated successfully!');
    console.log('📄 Report location:', reportPath);
    
    // Read and display the report
    const reportContent = fs.readFileSync(reportPath, 'utf8');
    console.log('\n📋 Generated Report Content:');
    console.log('─'.repeat(50));
    console.log(reportContent);
    console.log('─'.repeat(50));
    
    return true;
  } catch (error) {
    console.error('❌ Test failed:', error);
    return false;
  }
}

// Run the test
testGenerator().then(success => {
  process.exit(success ? 0 : 1);
});