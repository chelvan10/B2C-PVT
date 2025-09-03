const PostTestWorkflow = require('./post-test-workflow.js');

async function globalTeardown() {
  const workflow = new PostTestWorkflow();
  await workflow.execute();
}

module.exports = globalTeardown;