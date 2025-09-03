#!/usr/bin/env node

const { spawn } = require('child_process');
const { exec } = require('child_process');
const path = require('path');

class FastTestRunner {
  constructor() {
    this.testFiles = [
      'B2C/tests/smoke/homepage-comprehensive-everest.spec.ts',
      'B2C/tests/regression/mitre10-navigation-standard.spec.ts',
      'B2C/tests/regression/mitre10-production-suite.spec.ts',
      'B2C/tests/regression/mitre10-search-plp-standard.spec.ts',
      'B2C/tests/regression/mitre10-my-account-complete.spec.ts'
    ];
  }

  async run() {
    console.log('🚀 Fast Test Execution Starting...');
    
    const startTime = Date.now();
    
    try {
      // Run tests
      await this.executeTests();
      
      const duration = Date.now() - startTime;
      console.log(`✅ Tests completed in ${duration}ms`);
      
      // Auto-open HTML report and dashboard
      await this.openReports();
      
    } catch (error) {
      console.error('❌ Test execution failed:', error.message);
      process.exit(1);
    }
  }

  executeTests() {
    return new Promise((resolve, reject) => {
      const args = [
        'playwright', 'test',
        '--project=b2c-desktop-chrome',
        ...this.testFiles
      ];
      
      console.log('🧪 Executing tests...');
      
      const child = spawn('npx', args, {
        stdio: 'inherit',
        cwd: process.cwd()
      });

      child.on('close', (code) => {
        if (code === 0) {
          console.log('✅ All tests completed successfully');
          resolve();
        } else {
          console.log(`⚠️ Tests completed with exit code: ${code}`);
          resolve(); // Continue to show reports even if some tests failed
        }
      });

      child.on('error', reject);
    });
  }

  async openReports() {
    console.log('📊 Opening reports...');
    
    // HTML Report auto-opens (configured in playwright.config)
    console.log('✅ HTML Report will auto-open in browser');
    
    // Start dashboard
    setTimeout(() => {
      console.log('🚀 Starting dashboard...');
      
      const dashboard = spawn('node', ['scripts/production-dashboard.js'], {
        stdio: 'inherit',
        cwd: process.cwd(),
        detached: true
      });
      
      dashboard.unref();
      
      setTimeout(() => {
        console.log('📊 Dashboard available at: http://localhost:3001');
        console.log('🎯 HTML Report available at: http://localhost:9323');
      }, 2000);
      
    }, 1000);
  }
}

// Execute if called directly
if (require.main === module) {
  const runner = new FastTestRunner();
  runner.run().catch(error => {
    console.error('❌ Runner failed:', error.message);
    process.exit(1);
  });
}

module.exports = FastTestRunner;