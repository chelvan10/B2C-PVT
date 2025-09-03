/**
 * COVERAGE AGGREGATOR - FIXES TEST COVERAGE MATRIX FOR MULTIPLE TESTS
 * Ensures coverage data persists across multiple test executions
 */

const fs = require('fs').promises;
const path = require('path');

class CoverageAggregator {
  constructor() {
    this.coverageFile = path.join(process.cwd(), 'reports', 'coverage-data.json');
    this.coverageData = [];
  }

  async loadExistingCoverage() {
    try {
      const data = await fs.readFile(this.coverageFile, 'utf8');
      this.coverageData = JSON.parse(data);
    } catch {
      this.coverageData = [];
    }
  }

  async addCoverageData(newData) {
    await this.loadExistingCoverage();
    
    // Merge new data with existing, avoiding duplicates
    const existingIds = new Set(this.coverageData.map(item => item.testId));
    const uniqueNewData = newData.filter(item => !existingIds.has(item.testId));
    
    this.coverageData = [...this.coverageData, ...uniqueNewData];
    
    await this.saveCoverage();
  }

  async saveCoverage() {
    await fs.mkdir(path.dirname(this.coverageFile), { recursive: true });
    await fs.writeFile(this.coverageFile, JSON.stringify(this.coverageData, null, 2));
  }

  async getCoverageMatrix() {
    await this.loadExistingCoverage();
    
    const matrix = {};
    this.coverageData.forEach(test => {
      const feature = test.feature || 'Unknown';
      const condition = test.condition || 'Unknown';
      
      if (!matrix[feature]) matrix[feature] = {};
      if (!matrix[feature][condition]) matrix[feature][condition] = [];
      
      matrix[feature][condition].push({
        testId: test.testId,
        title: test.title,
        status: test.status,
        duration: test.duration,
        timestamp: test.timestamp
      });
    });
    
    return matrix;
  }
}

module.exports = CoverageAggregator;