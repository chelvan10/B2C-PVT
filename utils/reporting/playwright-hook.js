const TestSummaryGenerator = require('./test-summary-generator.js');
const fs = require('fs');
const path = require('path');

async function generateTestSummaryAfterRun() {
  const resultsPath = path.join(process.cwd(), 'test-results', 'results.json');
  
  if (!fs.existsSync(resultsPath)) {
    console.log('No test results found at:', resultsPath);
    return;
  }

  const results = JSON.parse(fs.readFileSync(resultsPath, 'utf8'));
  
  const generator = new TestSummaryGenerator({
    outputDir: path.join(process.cwd(), 'reports'),
    projectName: 'B2C PVT Demo',
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'Production',
    testManager: process.env.TEST_MANAGER || 'QA Manager',
    testLead: process.env.TEST_LEAD || 'Test Lead'
  });

  try {
    const reportPath = await generator.generateSummary(results);
    console.log('✅ Test summary report generated:', reportPath);
    
    // Also generate dashboard integration data
    await generateDashboardData(results);
    
  } catch (error) {
    console.error('❌ Failed to generate test summary:', error);
  }
}

async function generateDashboardData(results) {
  try {
    const dashboardData = {
      lastUpdated: new Date().toISOString(),
      testExecution: {
        total: results.stats?.total || 0,
        passed: results.stats?.passed || 0,
        failed: results.stats?.failed || 0,
        skipped: results.stats?.skipped || 0
      },
      performance: {
        duration: results.stats?.duration || 0,
        avgDuration: results.stats?.duration / (results.stats?.total || 1)
      }
    };
    
    const dashboardPath = path.join(process.cwd(), 'reports', 'dashboard-data.json');
    fs.writeFileSync(dashboardPath, JSON.stringify(dashboardData, null, 2));
    
    console.log('📊 Dashboard data updated:', dashboardPath);
  } catch (error) {
    console.error('⚠️ Failed to generate dashboard data:', error);
  }
}

// CLI execution
if (require.main === module) {
  generateTestSummaryAfterRun().then(() => {
    console.log('🎉 Test summary generation completed');
    process.exit(0);
  }).catch(error => {
    console.error('💥 Test summary generation failed:', error);
    process.exit(1);
  });
}

module.exports = { generateTestSummaryAfterRun };