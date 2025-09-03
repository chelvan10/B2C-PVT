#!/usr/bin/env node

/**
 * FIXED DASHBOARD - CORRECT AGGREGATED DATA DISPLAY
 * Works for single and multiple test executions
 */

const http = require('http');
const fs = require('fs').promises;
const path = require('path');
const DashboardDataManager = require('../utils/dashboard-data-manager');

class FixedDashboard {
  constructor() {
    this.port = process.env.PORT || 3002;
    this.dataManager = new DashboardDataManager();
  }

  async start() {
    const server = http.createServer(async (req, res) => {
      try {
        if (req.url === '/') {
          await this.serveHTML(res);
        } else if (req.url === '/api/data') {
          await this.serveData(res);
        } else if (req.url === '/api/refresh') {
          await this.refreshData(res);
        } else {
          res.writeHead(404);
          res.end('Not Found');
        }
      } catch (error) {
        console.error('Server error:', error);
        res.writeHead(500);
        res.end('Internal Server Error');
      }
    });

    server.listen(this.port, () => {
      console.log(`✅ Fixed Dashboard running at: http://localhost:${this.port}`);
      console.log(`📊 API endpoint: http://localhost:${this.port}/api/data`);
    });
  }

  async serveHTML(res) {
    const html = `
<!DOCTYPE html>
<html>
<head>
    <title>B2C PVT Demo - Test Dashboard</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; }
        .header { background: #2c3e50; color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 20px; }
        .stat-card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .stat-value { font-size: 2em; font-weight: bold; color: #2c3e50; }
        .stat-label { color: #7f8c8d; margin-top: 5px; }
        .coverage-matrix { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); margin-bottom: 20px; }
        .matrix-table { width: 100%; border-collapse: collapse; }
        .matrix-table th, .matrix-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        .matrix-table th { background: #f8f9fa; }
        .status-passed { color: #27ae60; font-weight: bold; }
        .status-failed { color: #e74c3c; font-weight: bold; }
        .status-skipped { color: #f39c12; font-weight: bold; }
        .refresh-btn { background: #3498db; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; }
        .timestamp { color: #7f8c8d; font-size: 0.9em; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🏔️ B2C PVT Demo - Test Dashboard</h1>
            <p>Enterprise-grade test execution monitoring with Everest Standard compliance</p>
            <button class="refresh-btn" onclick="refreshData()">🔄 Refresh Data</button>
            <div class="timestamp" id="timestamp"></div>
        </div>

        <div class="stats" id="stats">
            <!-- Stats will be populated by JavaScript -->
        </div>

        <div class="coverage-matrix">
            <h2>📊 Test Coverage Matrix</h2>
            <div id="coverage-content">
                <!-- Coverage matrix will be populated by JavaScript -->
            </div>
        </div>
    </div>

    <script>
        async function loadData() {
            try {
                const response = await fetch('/api/data');
                const data = await response.json();
                
                updateStats(data.summary);
                updateCoverageMatrix(data.coverageMatrix);
                updateTimestamp(data.timestamp);
            } catch (error) {
                console.error('Failed to load data:', error);
                document.getElementById('stats').innerHTML = '<div class="stat-card">❌ Failed to load data</div>';
            }
        }

        function updateStats(summary) {
            const statsHtml = \`
                <div class="stat-card">
                    <div class="stat-value">\${summary.total}</div>
                    <div class="stat-label">Total Tests</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value status-passed">\${summary.passed}</div>
                    <div class="stat-label">Passed</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value status-failed">\${summary.failed}</div>
                    <div class="stat-label">Failed</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value status-skipped">\${summary.skipped}</div>
                    <div class="stat-label">Skipped</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">\${Math.round(summary.duration / 1000)}s</div>
                    <div class="stat-label">Duration</div>
                </div>
            \`;
            document.getElementById('stats').innerHTML = statsHtml;
        }

        function updateCoverageMatrix(matrix) {
            if (Object.keys(matrix).length === 0) {
                document.getElementById('coverage-content').innerHTML = '<p>No coverage data available</p>';
                return;
            }

            let tableHtml = '<table class="matrix-table"><thead><tr><th>Feature</th><th>Condition</th><th>Tests</th><th>Status</th></tr></thead><tbody>';
            
            for (const [feature, conditions] of Object.entries(matrix)) {
                for (const [condition, tests] of Object.entries(conditions)) {
                    const passedCount = tests.filter(t => t.status === 'passed').length;
                    const failedCount = tests.filter(t => t.status === 'failed').length;
                    const skippedCount = tests.filter(t => t.status === 'skipped').length;
                    
                    const statusClass = failedCount > 0 ? 'status-failed' : 
                                       passedCount > 0 ? 'status-passed' : 'status-skipped';
                    
                    tableHtml += \`
                        <tr>
                            <td>\${feature}</td>
                            <td>\${condition}</td>
                            <td>\${tests.length}</td>
                            <td class="\${statusClass}">
                                ✅ \${passedCount} ❌ \${failedCount} ⏭️ \${skippedCount}
                            </td>
                        </tr>
                    \`;
                }
            }
            
            tableHtml += '</tbody></table>';
            document.getElementById('coverage-content').innerHTML = tableHtml;
        }

        function updateTimestamp(timestamp) {
            const date = new Date(timestamp);
            document.getElementById('timestamp').textContent = \`Last updated: \${date.toLocaleString()}\`;
        }

        async function refreshData() {
            try {
                await fetch('/api/refresh', { method: 'POST' });
                await loadData();
            } catch (error) {
                console.error('Failed to refresh data:', error);
            }
        }

        // Load data on page load
        loadData();
        
        // Auto-refresh every 30 seconds
        setInterval(loadData, 30000);
    </script>
</body>
</html>`;

    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(html);
  }

  async serveData(res) {
    const data = await this.dataManager.getAggregatedData();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
  }

  async refreshData(res) {
    await this.dataManager.processLatestResults();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'refreshed' }));
  }
}

// Start dashboard if called directly
if (require.main === module) {
  const dashboard = new FixedDashboard();
  dashboard.start().catch(console.error);
}

module.exports = FixedDashboard;