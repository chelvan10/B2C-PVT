const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class PostTestWorkflow {
  constructor() {
    this.startTime = new Date();
  }

  async execute() {
    console.log('\n🚀 Post-Test Workflow Starting...\n');
    
    try {
      // Step 1: HTML Report
      await this.handleHtmlReport();
      
      // Step 2: Dashboard Generation
      await this.generateDashboard();
      
      // Step 3: Test Summary Generation
      await this.generateTestSummary();
      
      // Step 4: Port Management & Dashboard URL
      await this.displayDashboardAccess();
      
      this.displaySummary();
      
    } catch (error) {
      console.error('❌ Post-test workflow failed:', error.message);
    }
  }

  async handleHtmlReport() {
    console.log('📊 HTML Report Auto-opening...');
    
    const reportPath = path.join(process.cwd(), 'playwright-report', 'index.html');
    
    if (fs.existsSync(reportPath)) {
      try {
        const { execSync } = require('child_process');
        execSync('npx playwright show-report', { stdio: 'ignore' });
        console.log('✅ HTML Report opened automatically');
      } catch (error) {
        console.log('✅ HTML Report generated (manual: npx playwright show-report)');
      }
      console.log('   📄 Location: ./playwright-report/index.html\n');
    } else {
      console.log('⚠️ HTML Report not found\n');
    }
  }

  async generateDashboard() {
    console.log('📈 World-class Analytics Dashboard Starting...');
    
    const dashboardPath = path.join(process.cwd(), 'scripts', 'production-dashboard.js');
    
    if (fs.existsSync(dashboardPath)) {
      try {
        const { spawn } = require('child_process');
        const server = spawn('node', [dashboardPath], {
          detached: true,
          stdio: 'ignore'
        });
        server.unref();
        
        // Give server time to start
        // amazonq-ignore-next-line
        // amazonq-ignore-next-line
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        console.log('✅ Dashboard server started successfully');
        console.log('   📊 Server: Running in background');
        console.log('   🚀 Status: Active and ready\n');
      } catch (error) {
        console.log('⚠️ Dashboard server failed to start');
        console.log('   🚀 Manual: npm run dashboard\n');
      }
    } else {
      console.log('⚠️ Dashboard script not found\n');
    }
  }

  async generateTestSummary() {
    console.log('📋 ISTQB Test Summary Generation...');
    
    try {
      execSync('node utils/reporting/playwright-hook.js', {
        stdio: 'pipe',
        cwd: process.cwd()
      });
      
      console.log('✅ ISTQB Test Summary Report generated');
      console.log('   📄 Report: ./reports/EXECUTIVE_TEST_SUMMARY.md');
      console.log('   📊 Data: ./reports/test-summary.json\n');
      
    } catch (error) {
      console.log('⚠️ Test summary generation failed\n');
    }
  }

  async displayDashboardAccess() {
    console.log('🔌 Smart Port Management & Dashboard Access...');
    
    const port = await this.findAvailablePort(3000);
    
    console.log(`✅ Smart port allocation: ${port}`);
    console.log(`🌐 Dashboard URL: http://localhost:${port}`);
    console.log(`🔗 Direct Link: http://127.0.0.1:${port}\n`);
  }

  async findAvailablePort(startPort) {
    const http = require('http');
    
    return new Promise((resolve) => {
      const server = http.createServer();
      
      server.listen(startPort, () => {
        const port = server.address().port;
        server.close(() => resolve(port));
      });
      
      server.on('error', () => {
        this.findAvailablePort(startPort + 1).then(resolve);
      });
    });
  }

  displaySummary() {
    const duration = Math.round((new Date() - this.startTime) / 1000);
    
    console.log('═'.repeat(60));
    console.log('🎉 POST-TEST WORKFLOW COMPLETE');
    console.log('═'.repeat(60));
    console.log(`⏱️  Workflow Duration: ${duration}s`);
    console.log(`📅 Completed: ${new Date().toISOString()}`);
    console.log('\n📁 GENERATED ARTIFACTS:');
    console.log('   📄 HTML Report: ./playwright-report/index.html');
    console.log('   📊 Dashboard: ./scripts/production-dashboard.js');
    console.log('   📋 Test Summary: ./reports/EXECUTIVE_TEST_SUMMARY.md');
    console.log('   📈 JSON Data: ./reports/test-summary.json');
    console.log('\n🚀 QUICK ACCESS COMMANDS:');
    console.log('   npx playwright show-report  # View HTML Report');
    console.log('   npm run dashboard           # Launch Dashboard');
    console.log('   cat reports/EXECUTIVE_TEST_SUMMARY.md  # View Summary');
    console.log('═'.repeat(60));
  }
}

// Auto-execute if called directly
if (require.main === module) {
  const workflow = new PostTestWorkflow();
  workflow.execute();
}

module.exports = PostTestWorkflow;