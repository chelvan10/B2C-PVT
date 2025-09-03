const { test } = require('@playwright/test');
const { runPostTestWorkflow } = require('./post-test-teardown.js');

// Global hook that runs after all tests in a worker complete
test.afterAll(async () => {
  // Only run if this is the last worker finishing
  if (process.env.PLAYWRIGHT_WORKER_INDEX === '0' || !process.env.PLAYWRIGHT_WORKER_INDEX) {
    console.log('🎯 Running post-test workflow...');
    await runPostTestWorkflow();
  }
});