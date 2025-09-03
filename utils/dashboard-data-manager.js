/**
 * DASHBOARD DATA MANAGER - FIXES AGGREGATION ISSUES
 * Ensures correct data display for single and multiple test executions
 */

const fs = require('fs').promises;
const path = require('path');

class DashboardDataManager {
  constructor() {
    this.dataDir = path.join(process.cwd(), 'reports');
    this.resultsFile = path.join(process.cwd(), 'test-results', 'results.json');
    this.aggregatedFile = path.join(this.dataDir, 'aggregated-data.json');
  }

  async processLatestResults() {
    try {
      await fs.mkdir(this.dataDir, { recursive: true });
      
      const results = await this.loadTestResults();
      const processedData = this.processResults(results);
      
      await this.saveAggregatedData(processedData);
      
      console.log('✅ Dashboard data processed successfully');
      return processedData;
    } catch (error) {
      console.error('❌ Dashboard data processing failed:', error.message);
      return this.getEmptyData();
    }
  }

  async loadTestResults() {
    try {
      const data = await fs.readFile(this.resultsFile, 'utf8');
      return JSON.parse(data);
    } catch {
      return { suites: [], stats: { total: 0, passed: 0, failed: 0, skipped: 0 } };
    }
  }

  processResults(results) {
    const processed = {
      timestamp: new Date().toISOString(),
      summary: {
        total: 0,
        passed: 0,
        failed: 0,
        skipped: 0,
        duration: 0
      },
      coverageMatrix: {},
      testDetails: [],
      features: new Set(),
      conditions: new Set()
    };

    if (results.suites) {
      results.suites.forEach(suite => {
        if (suite.specs) {
          suite.specs.forEach(spec => {
            if (spec.tests) {
              spec.tests.forEach(test => {
                const testResult = test.results?.[0];
                if (testResult) {
                  processed.summary.total++;
                  processed.summary.duration += testResult.duration || 0;
                  
                  switch (testResult.status) {
                    case 'passed': processed.summary.passed++; break;
                    case 'failed': processed.summary.failed++; break;
                    case 'skipped': processed.summary.skipped++; break;
                  }

                  const feature = this.extractFeature(test.title);
                  const condition = this.extractCondition(test.title);
                  
                  processed.features.add(feature);
                  processed.conditions.add(condition);

                  if (!processed.coverageMatrix[feature]) {
                    processed.coverageMatrix[feature] = {};
                  }
                  if (!processed.coverageMatrix[feature][condition]) {
                    processed.coverageMatrix[feature][condition] = [];
                  }

                  const testDetail = {
                    testId: test.testId || `${suite.title}-${spec.title}-${test.title}`,
                    title: test.title,
                    file: spec.file,
                    status: testResult.status,
                    duration: testResult.duration || 0,
                    feature,
                    condition,
                    timestamp: new Date().toISOString()
                  };

                  processed.coverageMatrix[feature][condition].push(testDetail);
                  processed.testDetails.push(testDetail);
                }
              });
            }
          });
        }
      });
    }

    // Convert Sets to Arrays for JSON serialization
    processed.features = Array.from(processed.features);
    processed.conditions = Array.from(processed.conditions);

    return processed;
  }

  extractFeature(title) {
    const match = title.match(/\[FEATURE:([^\]]+)\]/);
    return match ? match[1] : 'Unknown';
  }

  extractCondition(title) {
    const match = title.match(/\[CONDITION:([^\]]+)\]/);
    return match ? match[1] : 'Unknown';
  }

  async saveAggregatedData(data) {
    await fs.writeFile(this.aggregatedFile, JSON.stringify(data, null, 2));
  }

  async getAggregatedData() {
    try {
      const data = await fs.readFile(this.aggregatedFile, 'utf8');
      return JSON.parse(data);
    } catch {
      return this.getEmptyData();
    }
  }

  getEmptyData() {
    return {
      timestamp: new Date().toISOString(),
      summary: { total: 0, passed: 0, failed: 0, skipped: 0, duration: 0 },
      coverageMatrix: {},
      testDetails: [],
      features: [],
      conditions: []
    };
  }
}

module.exports = DashboardDataManager;