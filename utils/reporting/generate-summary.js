#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const TestSummaryGenerator = require('./test-summary-generator.js');

async function main() {
  try {
    console.log('📊 Generating test summary...');
    
    // Read latest test results
    const resultsPath = path.join(process.cwd(), 'test-results', 'results.json');
    
    if (!fs.existsSync(resultsPath)) {
      console.log('⚠️ No test results found at:', resultsPath);
      return;
    }
    
    const results = JSON.parse(fs.readFileSync(resultsPath, 'utf8'));
    
    const config = {
      projectName: 'B2C PVT Demo',
      version: '1.0.0',
      environment: 'Production',
      testManager: 'QA Team',
      testLead: 'Automation Lead',
      outputDir: path.join(process.cwd(), 'reports')
    };
    
    const generator = new TestSummaryGenerator(config);
    const outputPath = await generator.generateSummary(results);
    
    console.log('✅ Test summary generated:', outputPath);
    
    // Update results.json timestamp to current time
    const updatedResults = {
      ...results,
      timestamp: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    };
    
    fs.writeFileSync(resultsPath, JSON.stringify(updatedResults, null, 2));
    console.log('✅ Results timestamp updated');
    
  } catch (error) {
    console.error('❌ Error generating summary:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = main;