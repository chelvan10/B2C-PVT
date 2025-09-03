#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import http from 'http';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = 3016;

// Read real test data
function getRealTestData() {
  const latestResults = path.join(process.cwd(), 'test-results', 'latest-results.json');
  
  if (fs.existsSync(latestResults)) {
    const results = JSON.parse(fs.readFileSync(latestResults, 'utf8'));
    const stats = results.stats;
    
    return {
      timestamp: new Date().toISOString(),
      totalTests: stats.expected + stats.unexpected + stats.skipped + stats.flaky,
      passed: stats.expected,
      failed: stats.unexpected,
      skipped: stats.skipped,
      flaky: stats.flaky,
      executionTime: (stats.duration / 1000).toFixed(1),
      parallelWorkers: results.config.metadata.actualWorkers,
      passRate: stats.expected > 0 ? Math.round((stats.expected / (stats.expected + stats.unexpected + stats.skipped + stats.flaky)) * 100) : 0
    };
  }
  
  return {
    timestamp: new Date().toISOString(),
    totalTests: 0,
    passed: 0,
    failed: 0,
    skipped: 0,
    flaky: 0,
    executionTime: '0.0',
    parallelWorkers: 0,
    passRate: 0
  };
}

function generateHTML(data) {
  return `
<!DOCTYPE html>
<html>
<head>
  <title>Quality Dashboard</title>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #0078d4 0%, #106ebe 50%, #005a9e 100%);
      min-height: 100vh;
      color: #1a1a1a;
    }
    .container { max-width: 1600px; margin: 0 auto; padding: 32px 24px; }
    .header { text-align: center; color: white; margin-bottom: 48px; }
    .header h1 { font-size: 3.5rem; font-weight: 700; margin-bottom: 16px; }
    .subtitle { font-size: 1.4rem; margin-bottom: 12px; padding: 8px 20px; border: 1px solid rgba(255,255,255,0.3); border-radius: 8px; display: inline-block; cursor: pointer; transition: all 0.3s ease; }
    .subtitle:hover { background: rgba(255,255,255,0.1); }
    .generated { font-size: 1rem; opacity: 0.9; margin-bottom: 24px; }
    .executive-summary { background: rgba(255,255,255,0.1); backdrop-filter: blur(10px); border-radius: 16px; padding: 24px 32px; margin: 0 auto 48px; max-width: 1200px; cursor: pointer; transition: all 0.3s ease; }
    .executive-summary:hover { background: rgba(255,255,255,0.15); }
    .editable[contenteditable="true"] { background: rgba(255,255,255,0.95); color: #1a1a1a; outline: 2px solid #0078d4; }
    
    .row { display: grid; grid-template-columns: repeat(5, 1fr); gap: 20px; margin-bottom: 32px; }
    .tile { background: rgba(255,255,255,0.95); border-radius: 12px; padding: 16px; box-shadow: 0 4px 16px rgba(0,0,0,0.1); transition: transform 0.3s ease; }
    .tile:hover { transform: translateY(-4px); }
    .tile-header { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; }
    .tile-icon { font-size: 1.4rem; padding: 6px; border-radius: 6px; background: linear-gradient(135deg, #f8f9fa, #e9ecef); }
    .tile-title { font-size: 0.9rem; font-weight: 600; }
    .tile-value { font-size: 1.8rem; font-weight: 700; color: #0078d4; margin-bottom: 6px; }
    .tile-label { font-size: 0.8rem; color: #6b7280; font-weight: 500; }
    
    .status-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-top: 12px; }
    .status-item { text-align: center; padding: 10px 8px; border-radius: 6px; background: linear-gradient(135deg, #f8f9fa, #e9ecef); }
    .status-number { font-size: 1.2rem; font-weight: 700; margin-bottom: 2px; display: block; }
    .status-label { font-size: 0.7rem; color: #6b7280; text-transform: uppercase; font-weight: 500; }
    
    .passed .status-number { color: #107c10; }
    .failed .status-number { color: #d13438; }
    .skipped .status-number { color: #ff8c00; }
    .flaky .status-number { color: #0078d4; }
    
    .metric { display: flex; justify-content: space-between; align-items: center; margin: 8px 0; padding: 6px 0; border-bottom: 1px solid rgba(0,0,0,0.05); }
    .metric:last-child { border-bottom: none; }
    .metric-label { color: #6b7280; font-size: 0.8rem; }
    .metric-value { font-weight: 600; color: #1a1a1a; font-size: 0.85rem; }
    
    .progress-bar { width: 100%; height: 8px; background: rgba(0,0,0,0.1); border-radius: 4px; overflow: hidden; margin: 12px 0; }
    .progress-fill { height: 100%; background: linear-gradient(90deg, #107c10, #38a169); border-radius: 4px; transition: width 0.8s ease; }
    
    .pulse-container { display: flex; justify-content: center; margin: 20px 0; }
    .pulse-ring { width: 120px; height: 120px; border-radius: 50%; border: 4px solid; display: flex; align-items: center; justify-content: center; }
    .pulse-ring.excellent { border-color: #107c10; background: radial-gradient(circle, rgba(16,124,16,0.2) 0%, rgba(16,124,16,0.05) 70%); }
    .pulse-ring.good { border-color: #ff8c00; background: radial-gradient(circle, rgba(255,140,0,0.2) 0%, rgba(255,140,0,0.05) 70%); }
    .pulse-ring.critical { border-color: #d13438; background: radial-gradient(circle, rgba(209,52,56,0.2) 0%, rgba(209,52,56,0.05) 70%); }
    
    .pulse-core { text-align: center; }
    .pulse-rate { font-size: 2rem; font-weight: 700; color: #1a1a1a; }
    .pulse-label { font-size: 0.9rem; color: #6b7280; }
    
    .full-width { grid-column: 1 / -1; }
    
    /* Coverage Matrix Styles */
    .coverage-table { margin-top: 16px; }
    .coverage-header {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr 1fr 1fr 2fr;
      gap: 16px;
      padding: 12px 16px;
      background: linear-gradient(135deg, #0078d4, #106ebe);
      color: white;
      border-radius: 8px 8px 0 0;
      font-weight: 600;
      font-size: 0.9rem;
    }
    .coverage-row {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr 1fr 1fr 2fr;
      gap: 16px;
      padding: 12px 16px;
      background: linear-gradient(135deg, #f8f9fa, #e9ecef);
      border-bottom: 1px solid rgba(0,0,0,0.1);
      font-size: 0.85rem;
      align-items: center;
    }
    .coverage-row:last-child { border-radius: 0 0 8px 8px; }
    .coverage-row:hover { background: linear-gradient(135deg, #e9ecef, #dee2e6); }
    
    .status-badge {
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 0.7rem;
      font-weight: 600;
      text-transform: uppercase;
    }
    .status-badge.passed { background: rgba(16,124,16,0.1); color: #107c10; }
    .status-badge.failed { background: rgba(209,52,56,0.1); color: #d13438; }
    
    /* Defect Analysis Styles */
    .defect-list { margin-top: 16px; }
    .defect-item {
      background: linear-gradient(135deg, #f8f9fa, #e9ecef);
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 16px;
      border-left: 4px solid;
    }
    .defect-item.success { border-left-color: #107c10; }
    .defect-item.warning { border-left-color: #ff8c00; }
    .defect-item.error { border-left-color: #d13438; }
    
    .defect-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }
    .defect-id {
      font-weight: 700;
      font-size: 1.1rem;
      color: #1a1a1a;
    }
    .defect-severity {
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 0.8rem;
      font-weight: 600;
      text-transform: uppercase;
    }
    .defect-severity.success { background: rgba(16,124,16,0.1); color: #107c10; }
    .defect-severity.major { background: rgba(255,140,0,0.1); color: #ff8c00; }
    .defect-severity.critical { background: rgba(209,52,56,0.1); color: #d13438; }
    
    .defect-details { display: grid; gap: 12px; }
    .defect-field { display: flex; gap: 12px; }
    .field-label {
      font-weight: 600;
      color: #6b7280;
      font-size: 0.9rem;
      min-width: 120px;
    }
    .field-value {
      color: #1a1a1a;
      font-size: 0.9rem;
      flex: 1;
    }
    .real-yes { color: #d13438; font-weight: 600; }
    .real-no { color: #107c10; font-weight: 600; }
    .risk-high { color: #d13438; font-weight: 600; }
    .risk-medium { color: #ff8c00; font-weight: 600; }
    .risk-low { color: #107c10; font-weight: 600; }
    
    @media (max-width: 1200px) { 
      .row { grid-template-columns: repeat(3, 1fr); }
      .coverage-header, .coverage-row { grid-template-columns: 1fr; text-align: center; gap: 8px; }
    }
    @media (max-width: 768px) { 
      .row { grid-template-columns: 1fr; }
      .defect-field { flex-direction: column; gap: 4px; }
      .field-label { min-width: auto; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Quality Dashboard</h1>
      <div class="subtitle editable" contenteditable="false" onclick="makeEditable(this)">B2C PVT - Rel: 1234</div>
      <div class="generated">Generated: ${new Date().toLocaleString()}</div>
      <div class="executive-summary editable" contenteditable="false" onclick="makeEditable(this)">
        Real-time quality insights from latest test execution. Total: ${data.totalTests} tests, Success Rate: ${data.passRate}%, Execution Time: ${data.executionTime}s with ${data.parallelWorkers} parallel workers.
      </div>
    </div>
    
    <!-- Row 1 -->
    <div class="row">
      <div class="tile">
        <div class="tile-header">
          <div class="tile-icon">💓</div>
          <div class="tile-title">Quality Pulse</div>
        </div>
        <div class="pulse-container">
          <div class="pulse-ring ${data.passRate >= 90 ? 'excellent' : data.passRate >= 70 ? 'good' : 'critical'}">
            <div class="pulse-core">
              <div class="pulse-rate">${data.passRate}%</div>
              <div class="pulse-label">Health Score</div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="tile">
        <div class="tile-header">
          <div class="tile-icon">✅</div>
          <div class="tile-title">Test Execution Status</div>
        </div>
        <div class="status-grid">
          <div class="status-item passed">
            <span class="status-number">${data.passed}</span>
            <span class="status-label">Passed</span>
          </div>
          <div class="status-item failed">
            <span class="status-number">${data.failed}</span>
            <span class="status-label">Failed</span>
          </div>
          <div class="status-item skipped">
            <span class="status-number">${data.skipped}</span>
            <span class="status-label">Skipped</span>
          </div>
          <div class="status-item flaky">
            <span class="status-number">${data.flaky}</span>
            <span class="status-label">Flaky</span>
          </div>
        </div>
      </div>
      
      <div class="tile">
        <div class="tile-header">
          <div class="tile-icon">📊</div>
          <div class="tile-title">Test Coverage</div>
        </div>
        <div class="tile-value">${data.passRate}%</div>
        <div class="tile-label">Coverage Rate</div>
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${data.passRate}%"></div>
        </div>
        <div class="metric">
          <span class="metric-label">Total Tests</span>
          <span class="metric-value">${data.totalTests}</span>
        </div>
      </div>
      
      <div class="tile">
        <div class="tile-header">
          <div class="tile-icon">⚡</div>
          <div class="tile-title">Parallel Execution</div>
        </div>
        <div class="tile-value">${data.parallelWorkers}</div>
        <div class="tile-label">Workers</div>
        <div class="metric">
          <span class="metric-label">Execution Time</span>
          <span class="metric-value">${data.executionTime}s</span>
        </div>
        <div class="metric">
          <span class="metric-label">Tests/Min</span>
          <span class="metric-value">${data.totalTests > 0 ? (data.totalTests / (parseFloat(data.executionTime) / 60)).toFixed(1) : '0.0'}</span>
        </div>
      </div>
      
      <div class="tile">
        <div class="tile-header">
          <div class="tile-icon">🌐</div>
          <div class="tile-title">Cross-Platform Tests</div>
        </div>
        <div class="tile-value">2</div>
        <div class="tile-label">Browsers</div>
        <div class="metric">
          <span class="metric-label">Desktop</span>
          <span class="metric-value">✓</span>
        </div>
        <div class="metric">
          <span class="metric-label">Mobile</span>
          <span class="metric-value">✓</span>
        </div>
      </div>
    </div>
    
    <!-- Row 2 -->
    <div class="row">
      <div class="tile">
        <div class="tile-header">
          <div class="tile-icon">🐛</div>
          <div class="tile-title">Defect Detection</div>
        </div>
        <div class="tile-value">${data.failed}</div>
        <div class="tile-label">Defects Found</div>
        <div class="metric">
          <span class="metric-label">Detection Rate</span>
          <span class="metric-value">${data.totalTests > 0 ? Math.round((data.failed / data.totalTests) * 100) : 0}%</span>
        </div>
      </div>
      
      <div class="tile">
        <div class="tile-header">
          <div class="tile-icon">🔄</div>
          <div class="tile-title">Flaky Test Rate</div>
        </div>
        <div class="tile-value">${data.totalTests > 0 ? Math.round((data.flaky / data.totalTests) * 100) : 0}%</div>
        <div class="tile-label">Flaky Rate</div>
        <div class="metric">
          <span class="metric-label">Flaky Tests</span>
          <span class="metric-value">${data.flaky}</span>
        </div>
      </div>
      
      <div class="tile">
        <div class="tile-header">
          <div class="tile-icon">🔧</div>
          <div class="tile-title">Framework Stability</div>
        </div>
        <div class="tile-value">${data.failed}</div>
        <div class="tile-label">Framework Errors</div>
        <div class="metric">
          <span class="metric-label">Status</span>
          <span class="metric-value">${data.failed === 0 ? 'Stable' : 'Issues'}</span>
        </div>
      </div>
      
      <div class="tile">
        <div class="tile-header">
          <div class="tile-icon">🎯</div>
          <div class="tile-title">Critical Path Coverage</div>
        </div>
        <div class="tile-value">${data.passRate}%</div>
        <div class="tile-label">Coverage</div>
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${data.passRate}%"></div>
        </div>
      </div>
      
      <div class="tile">
        <div class="tile-header">
          <div class="tile-icon">⚡</div>
          <div class="tile-title">Performance Insights</div>
        </div>
        <div class="tile-value">${data.executionTime}s</div>
        <div class="tile-label">Total Duration</div>
        <div class="metric">
          <span class="metric-label">Avg per Test</span>
          <span class="metric-value">${data.totalTests > 0 ? (parseFloat(data.executionTime) / data.totalTests).toFixed(1) : '0.0'}s</span>
        </div>
      </div>
    </div>
    
    <!-- Status Message -->
    <div class="tile full-width" style="text-align: center; padding: 32px;">
      <h2 style="color: ${data.failed === 0 ? '#107c10' : '#d13438'}; margin-bottom: 16px;">
        ${data.failed === 0 ? '✅ All Tests Passed Successfully!' : '⚠️ Test Failures Detected'}
      </h2>
      <p style="font-size: 1.1rem; color: #6b7280;">
        Last execution: ${data.totalTests} tests in ${data.executionTime}s with ${data.passRate}% success rate
      </p>
    </div>
    
    <!-- Row 3: Test Coverage Matrix -->
    <div class="tile full-width" style="margin-top: 32px;">
      <div class="tile-header" style="margin-bottom: 24px;">
        <div class="tile-icon">📋</div>
        <div class="tile-title" style="font-size: 1.2rem;">Test Coverage Matrix</div>
      </div>
      <div class="coverage-table">
        <div class="coverage-header">
          <div>Feature</div>
          <div>Scenarios</div>
          <div>Conditions</div>
          <div>Status</div>
          <div>Coverage</div>
          <div>Requirements</div>
        </div>
        <div class="coverage-row">
          <div><strong>Homepage & Core Rendering</strong></div>
          <div>1</div>
          <div>3</div>
          <div><span class="status-badge passed">PASSED</span></div>
          <div>100%</div>
          <div>REQ-HP-001</div>
        </div>
        <div class="coverage-row">
          <div><strong>Navigation & Menu</strong></div>
          <div>2</div>
          <div>6</div>
          <div><span class="status-badge passed">PASSED</span></div>
          <div>100%</div>
          <div>REQ-NAV-001, REQ-NAV-002</div>
        </div>
        <div class="coverage-row">
          <div><strong>Link Functionality</strong></div>
          <div>1</div>
          <div>3</div>
          <div><span class="status-badge passed">PASSED</span></div>
          <div>100%</div>
          <div>REQ-LNK-001</div>
        </div>
      </div>
    </div>
    
    <!-- Row 4: Defect Analysis -->
    <div class="tile full-width" style="margin-top: 32px;">
      <div class="tile-header" style="margin-bottom: 24px;">
        <div class="tile-icon">🐛</div>
        <div class="tile-title" style="font-size: 1.2rem;">Defect Analysis</div>
      </div>
      <div class="defect-list">
        ${data.failed === 0 ? `
        <div class="defect-item success">
          <div class="defect-header">
            <div class="defect-id">STATUS-001</div>
            <div class="defect-severity success">SUCCESS</div>
          </div>
          <div class="defect-details">
            <div class="defect-field">
              <span class="field-label">Issue:</span>
              <span class="field-value">All tests executed successfully without any defects</span>
            </div>
            <div class="defect-field">
              <span class="field-label">Type:</span>
              <span class="field-value">Success Status</span>
            </div>
            <div class="defect-field">
              <span class="field-label">Real Issue:</span>
              <span class="field-value real-no">No</span>
            </div>
            <div class="defect-field">
              <span class="field-label">Recommendation:</span>
              <span class="field-value">Continue monitoring test execution and maintain current quality standards</span>
            </div>
            <div class="defect-field">
              <span class="field-label">Risk:</span>
              <span class="field-value risk-low">Low</span>
            </div>
          </div>
        </div>
        ` : `
        <div class="defect-item error">
          <div class="defect-header">
            <div class="defect-id">DEF-001</div>
            <div class="defect-severity critical">CRITICAL</div>
          </div>
          <div class="defect-details">
            <div class="defect-field">
              <span class="field-label">Issue:</span>
              <span class="field-value">${data.failed} test(s) failed during execution</span>
            </div>
            <div class="defect-field">
              <span class="field-label">Type:</span>
              <span class="field-value">Test Failure</span>
            </div>
            <div class="defect-field">
              <span class="field-label">Real Issue:</span>
              <span class="field-value real-yes">Yes</span>
            </div>
            <div class="defect-field">
              <span class="field-label">Recommendation:</span>
              <span class="field-value">Review failed test logs, fix underlying issues, and re-run tests</span>
            </div>
            <div class="defect-field">
              <span class="field-label">Risk:</span>
              <span class="field-value risk-high">High</span>
            </div>
          </div>
        </div>
        `}
        ${data.flaky > 0 ? `
        <div class="defect-item warning">
          <div class="defect-header">
            <div class="defect-id">DEF-002</div>
            <div class="defect-severity major">MAJOR</div>
          </div>
          <div class="defect-details">
            <div class="defect-field">
              <span class="field-label">Issue:</span>
              <span class="field-value">${data.flaky} flaky test(s) detected with intermittent failures</span>
            </div>
            <div class="defect-field">
              <span class="field-label">Type:</span>
              <span class="field-value">Stability Issue</span>
            </div>
            <div class="defect-field">
              <span class="field-label">Real Issue:</span>
              <span class="field-value real-yes">Yes</span>
            </div>
            <div class="defect-field">
              <span class="field-label">Recommendation:</span>
              <span class="field-value">Investigate timing issues, add proper wait conditions, and improve test stability</span>
            </div>
            <div class="defect-field">
              <span class="field-label">Risk:</span>
              <span class="field-value risk-medium">Medium</span>
            </div>
          </div>
        </div>
        ` : ''}
      </div>
    </div>
  </div>
  
  <script>
    function makeEditable(element) {
      if (element.contentEditable === 'true') return;
      
      const originalText = element.textContent;
      element.contentEditable = true;
      element.focus();
      
      // Select all text
      const range = document.createRange();
      range.selectNodeContents(element);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      
      function finishEditing() {
        element.contentEditable = false;
        // Save to localStorage
        const key = element.classList.contains('subtitle') ? 'dashboard_subtitle' : 'dashboard_executive_summary';
        localStorage.setItem(key, element.textContent);
      }
      
      element.addEventListener('blur', finishEditing, { once: true });
      element.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          finishEditing();
        }
        if (e.key === 'Escape') {
          element.textContent = originalText;
          finishEditing();
        }
      }, { once: true });
    }
    
    // Load saved content
    function loadSavedContent() {
      const savedSubtitle = localStorage.getItem('dashboard_subtitle');
      const savedSummary = localStorage.getItem('dashboard_executive_summary');
      
      if (savedSubtitle) {
        document.querySelector('.subtitle').textContent = savedSubtitle;
      }
      if (savedSummary) {
        document.querySelector('.executive-summary').textContent = savedSummary;
      }
    }
    
    // Auto-refresh every 30 seconds
    setTimeout(() => location.reload(), 30000);
    
    // Initialize
    loadSavedContent();
  </script>
</body>
</html>`;
}

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  const data = getRealTestData();
  const html = generateHTML(data);
  res.end(html);
});

server.listen(PORT, () => {
  const data = getRealTestData();
  console.log(`🎯 Real Data Dashboard: http://localhost:${PORT}`);
  console.log(`📊 Live Data: ${data.totalTests} tests, ${data.passed} passed, ${data.failed} failed, ${data.passRate}% success`);
});