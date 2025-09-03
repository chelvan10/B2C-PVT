#!/usr/bin/env node

const { spawn } = require('child_process');
const SecurePostTestWorkflow = require('../utils/post-test-workflow-secure.js');

class TestRunner {
  constructor() {
    this.args = process.argv.slice(2);
  }

  async run() {
    console.log('🚀 Starting test execution...');
    
    // Build Playwright command
    const playwrightArgs = ['playwright', 'test', ...this.args];
    
    return new Promise((resolve, reject) => {
      const child = spawn('npx', playwrightArgs, {
        stdio: 'inherit',
        cwd: process.cwd()
      });

      child.on('close', async (code) => {
        console.log(`\n📊 Test execution completed with code: ${code}`);
        
        // Always run post-test workflow regardless of test results
        try {
          const workflow = new SecurePostTestWorkflow();
          await workflow.execute();
          resolve(code);
        } catch (error) {
          console.error('❌ Post-test workflow failed:', error.message);
          resolve(code); // Still resolve with original test code
        }
      });

      child.on('error', (error) => {
        console.error('❌ Test execution failed:', error.message);
        reject(error);
      });
    });
  }
}

// Execute if called directly
if (require.main === module) {
  const runner = new TestRunner();
  runner.run().then(code => {
    process.exit(code);
  }).catch(error => {
    console.error('❌ Runner failed:', error.message);
    process.exit(1);
  });
}

module.exports = TestRunner;