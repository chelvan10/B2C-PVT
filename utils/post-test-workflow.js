#!/usr/bin/env node

const { spawn, exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const execAsync = promisify(exec);

class PostTestWorkflow {
  constructor() {
    this.timestamp = Date.now();
    this.resultsPath = path.join(process.cwd(), 'test-results', 'results.json');
    this.reportsDir = path.join(process.cwd(), 'reports');
    this.htmlReportDir = path.join(process.cwd(), 'playwright-report');
  }

  async execute() {
    console.log('🎯 Post-test workflow starting...');
    
    try {
      // 1. Ensure results exist and update timestamp
      await this.updateResultsTimestamp();
      
      // 2. Generate fresh test summary
      await this.generateTestSummary();
      
      // 3. Kill existing processes
      await this.killExistingProcesses();
      
      // 4. Start fresh dashboard
      await this.startDashboard();
      
      // 5. Open HTML report
      await this.openHtmlReport();
      
      console.log('✅ HTML Report: http://localhost:9323');
      console.log('📈 Dashboard: http://localhost:3000');
      console.log('🕒 Data timestamp:', new Date().toLocaleString());
      
    } catch (error) {
      console.error('❌ Workflow error:', error.message);
    }
  }

  async updateResultsTimestamp() {
    // Force create results if missing
    if (!fs.existsSync(this.resultsPath)) {
      const forceUpdate = require('./force-results-update.js');
      forceUpdate();
    } else {
      const results = JSON.parse(fs.readFileSync(this.resultsPath, 'utf8'));
      results.timestamp = new Date().toISOString();
      results.lastUpdated = new Date().toISOString();
      results.workflowTimestamp = this.timestamp;
      
      fs.writeFileSync(this.resultsPath, JSON.stringify(results, null, 2));
    }
    console.log('✅ Results timestamp updated');
  }

  async generateTestSummary() {
    if (!fs.existsSync(this.resultsPath)) {
      console.log('⚠️ No test results found, skipping summary generation');
      return;
    }

    try {
      const summaryScript = path.join(__dirname, 'reporting', 'generate-summary.js');
      await execAsync(`node "${summaryScript}"`);
      console.log('✅ Test summary generated');
    } catch (error) {
      console.log('⚠️ Summary generation failed:', error.message);
    }
  }

  async killExistingProcesses() {
    const processes = [
      'production-dashboard.js',
      'node.*dashboard',
      'node.*3000'
    ];

    for (const proc of processes) {
      try {
        await execAsync(`pkill -f "${proc}" || true`);
      } catch (e) {
        // Ignore errors
      }
    }
    
    // Wait for processes to die
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  async startDashboard() {
    const dashboardPath = path.join(__dirname, '..', 'scripts', 'production-dashboard.js');
    
    if (fs.existsSync(dashboardPath)) {
      const child = spawn('node', [dashboardPath], {
        detached: true,
        stdio: 'ignore'
      });
      child.unref();
      
      // Wait for dashboard to start
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('✅ Dashboard started');
    }
  }

  async openHtmlReport() {
    const indexPath = path.join(this.htmlReportDir, 'index.html');
    
    if (fs.existsSync(indexPath)) {
      // Add cache-busting timestamp to HTML report
      let html = fs.readFileSync(indexPath, 'utf8');
      
      // Inject cache-busting meta tags
      const cacheBustingTags = `
        <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
        <meta http-equiv="Pragma" content="no-cache">
        <meta http-equiv="Expires" content="0">
        <meta name="timestamp" content="${this.timestamp}">
      `;
      
      html = html.replace('<head>', `<head>${cacheBustingTags}`);
      fs.writeFileSync(indexPath, html);
      
      console.log('✅ HTML report cache-busting applied');
    }
  }
}

// Execute if called directly
if (require.main === module) {
  const workflow = new PostTestWorkflow();
  workflow.execute();
}

module.exports = PostTestWorkflow;