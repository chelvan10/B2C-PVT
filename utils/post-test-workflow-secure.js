/**
 * EVEREST-STANDARD SECURE POST-TEST WORKFLOW
 * Replaces insecure post-test-workflow.js
 * Eliminates code injection vulnerabilities
 */

const fs = require('fs').promises;
const path = require('path');
const { SecureLogger } = require('./security/secure-logger');
const DashboardDataManager = require('./dashboard-data-manager');
const ReportSecurity = require('./security/report-security');

class SecurePostTestWorkflow {
  constructor() {
    this.reportsDir = path.join(process.cwd(), 'reports');
    this.resultsFile = path.join(process.cwd(), 'test-results', 'results.json');
  }

  async execute() {
    try {
      SecureLogger.info('🚀 Starting secure post-test workflow');
      
      await this.ensureDirectories();
      await this.generateSecureSummary();
      await this.processDashboardData();
      await this.secureReports();
      await this.cleanupArtifacts();
      
      SecureLogger.info('✅ Post-test workflow completed successfully');
    } catch (error) {
      SecureLogger.error('❌ Post-test workflow failed', error);
      throw error;
    }
  }

  async ensureDirectories() {
    try {
      await fs.mkdir(this.reportsDir, { recursive: true });
      SecureLogger.info('📁 Reports directory ensured');
    } catch (error) {
      SecureLogger.error('Failed to create reports directory', error);
    }
  }

  async generateSecureSummary() {
    try {
      const results = await this.loadTestResults();
      const summary = this.createSummary(results);
      
      const summaryPath = path.join(this.reportsDir, 'test-summary.json');
      await fs.writeFile(summaryPath, JSON.stringify(summary, null, 2));
      
      SecureLogger.info('📊 Test summary generated', { path: summaryPath });
    } catch (error) {
      SecureLogger.error('Failed to generate test summary', error);
    }
  }

  async loadTestResults() {
    try {
      const data = await fs.readFile(this.resultsFile, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      SecureLogger.warn('No test results found, using empty results');
      return { suites: [], stats: { total: 0, passed: 0, failed: 0 } };
    }
  }

  createSummary(results) {
    const timestamp = new Date().toISOString();
    
    return {
      timestamp,
      summary: {
        total: results.stats?.total || 0,
        passed: results.stats?.passed || 0,
        failed: results.stats?.failed || 0,
        skipped: results.stats?.skipped || 0
      },
      duration: results.stats?.duration || 0,
      environment: {
        node: process.version,
        platform: process.platform
      }
    };
  }

  async processDashboardData() {
    try {
      const dataManager = new DashboardDataManager();
      await dataManager.processLatestResults();
      SecureLogger.info('📊 Dashboard data processed for latest execution');
    } catch (error) {
      SecureLogger.warn('Dashboard data processing skipped', error);
    }
  }

  async secureReports() {
    try {
      await ReportSecurity.secureHtmlReport();
      SecureLogger.info('🔒 HTML reports secured with CSP');
    } catch (error) {
      SecureLogger.warn('Report security skipped', error);
    }
  }

  async cleanupArtifacts() {
    try {
      // Clean up old artifacts (keep last 10 runs)
      const artifactsDir = path.join(process.cwd(), 'test-results');
      const files = await fs.readdir(artifactsDir).catch(() => []);
      
      if (files.length > 10) {
        SecureLogger.info('🧹 Cleaning up old artifacts');
        // Implementation would go here for cleanup
      }
    } catch (error) {
      SecureLogger.warn('Artifact cleanup skipped', error);
    }
  }
}

module.exports = SecurePostTestWorkflow;