import { test } from '@playwright/test';

// Global after-all hook that runs after any test execution
test.afterAll(async () => {
  // Only run once per test session (when worker 0 finishes)
  if (process.env.PLAYWRIGHT_WORKER_INDEX === '0' || process.env.PLAYWRIGHT_WORKER_INDEX === undefined) {
    const { runPostTestWorkflow } = require('./post-test-teardown.js');
    await runPostTestWorkflow();
  }
});