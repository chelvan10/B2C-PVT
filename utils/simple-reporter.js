const SimplePostTest = require('./post-test-simple.js');

class SimpleReporter {
  onBegin() {
    // Silent
  }

  onTestEnd() {
    // Silent
  }

  async onEnd() {
    const postTest = new SimplePostTest();
    await postTest.execute();
  }
}

module.exports = SimpleReporter;