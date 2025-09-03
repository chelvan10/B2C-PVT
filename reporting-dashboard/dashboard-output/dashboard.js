class QualityDashboard {
    constructor() {
        this.charts = {};
        this.loadDashboard();
    }

    async loadDashboard() {
        try {
            const metrics = await this.loadLatestMetrics();
            this.updateExecutiveSummary(metrics);
            this.updateMetrics(metrics);
            this.createCharts(metrics);
        } catch (error) {
            console.error('Failed to load dashboard:', error);
            document.getElementById('executiveSummary').innerHTML = 
                '<div style="color: #d13438;">⚠️ Failed to load test metrics. Please ensure tests have been run.</div>';
        }
    }

    async loadLatestMetrics() {
        // In a real implementation, this would fetch from your metrics API
        // For demo purposes, we'll use sample data
        return {
            timestamp: new Date().toISOString(),
            totalTests: 45,
            passed: 42,
            failed: 3,
            skipped: 0,
            flaky: 1,
            executionTime: 127.5,
            parallelWorkers: 4,
            browsers: ['chromium', 'firefox', 'webkit'],
            projects: ['desktop', 'mobile'],
            performance: {
                avgTestDuration: 2834,
                slowestTest: { name: 'Mobile Shopping Journey', duration: 8500 },
                fastestTest: { name: 'Navigation Test', duration: 1200 }
            },
            coverage: {
                features: 8,
                criticalPaths: 85,
                crossPlatform: 3
            },
            stability: {
                frameworkErrors: 0,
                timeouts: 1,
                retries: 2
            }
        };
    }

    updateExecutiveSummary(metrics) {
        const passRate = Math.round((metrics.passed / metrics.totalTests) * 100);
        const flakyRate = Math.round((metrics.flaky / metrics.totalTests) * 100);
        
        let status = 'excellent';
        let statusColor = '#107c10';
        
        if (passRate < 90 || flakyRate > 5) {
            status = 'needs attention';
            statusColor = '#ff8c00';
        }
        if (passRate < 80 || flakyRate > 10) {
            status = 'critical';
            statusColor = '#d13438';
        }

        const summary = `
            <h3 style="color: ${statusColor}; margin-bottom: 15px;">Executive Test Summary</h3>
            <p><strong>Overall Status:</strong> Test suite is performing at <span style="color: ${statusColor};">${status}</span> levels with a ${passRate}% pass rate across ${metrics.totalTests} tests.</p>
            <p><strong>Framework Health:</strong> Execution completed in ${metrics.executionTime}s using ${metrics.parallelWorkers} parallel workers with ${metrics.stability.frameworkErrors} framework errors.</p>
            <p><strong>Quality Metrics:</strong> Coverage spans ${metrics.coverage.features} features with ${metrics.coverage.criticalPaths}% critical path coverage and ${flakyRate}% flaky test rate.</p>
            <p><strong>Cross-Platform:</strong> Tests validated across ${metrics.browsers.length} browsers ensuring comprehensive compatibility coverage.</p>
        `;
        
        document.getElementById('executiveSummary').innerHTML = summary;
    }

    updateMetrics(metrics) {
        const passRate = Math.round((metrics.passed / metrics.totalTests) * 100);
        const flakyRate = Math.round((metrics.flaky / metrics.totalTests) * 100);
        const stabilityScore = Math.max(0, 100 - (metrics.stability.frameworkErrors * 10) - (metrics.stability.timeouts * 5));

        // Execution & Coverage
        document.getElementById('executionTime').textContent = metrics.executionTime.toFixed(1);
        document.getElementById('passRate').textContent = `${passRate}%`;
        document.getElementById('coverage').textContent = metrics.coverage.features;
        document.getElementById('parallelWorkers').textContent = metrics.parallelWorkers;
        document.getElementById('parallelEfficiency').textContent = `${Math.round(metrics.totalTests / metrics.parallelWorkers)} tests/worker`;

        // Quality & Stability
        document.getElementById('defectsFound').textContent = metrics.failed;
        document.getElementById('flakyRate').textContent = `${flakyRate}%`;
        document.getElementById('stabilityScore').textContent = `${stabilityScore}%`;
        document.getElementById('stabilityDetails').textContent = `${metrics.stability.timeouts} timeouts, ${metrics.stability.retries} retries`;
        document.getElementById('criticalCoverage').textContent = `${metrics.coverage.criticalPaths}%`;

        // Performance
        document.getElementById('avgDuration').textContent = Math.round(metrics.performance.avgTestDuration);

        // Progress bars
        document.getElementById('coverageProgress').style.width = `${(metrics.coverage.features / 10) * 100}%`;
        document.getElementById('flakyProgress').style.width = `${flakyRate}%`;
        document.getElementById('criticalProgress').style.width = `${metrics.coverage.criticalPaths}%`;

        // Platform badges
        this.updatePlatformBadges(metrics);

        // Update status colors
        this.updateStatusColors(passRate, flakyRate, stabilityScore);
    }

    updatePlatformBadges(metrics) {
        const platformGrid = document.getElementById('platformGrid');
        platformGrid.innerHTML = '';
        
        metrics.browsers.forEach(browser => {
            const badge = document.createElement('div');
            badge.className = `platform-badge platform-success`;
            badge.textContent = browser.charAt(0).toUpperCase() + browser.slice(1);
            platformGrid.appendChild(badge);
        });

        metrics.projects.forEach(project => {
            const badge = document.createElement('div');
            badge.className = `platform-badge platform-success`;
            badge.textContent = project.charAt(0).toUpperCase() + project.slice(1);
            platformGrid.appendChild(badge);
        });
    }

    updateStatusColors(passRate, flakyRate, stabilityScore) {
        const passRateEl = document.getElementById('passRate');
        const flakyRateEl = document.getElementById('flakyRate');
        const stabilityEl = document.getElementById('stabilityScore');

        // Pass rate colors
        passRateEl.className = passRate >= 95 ? 'metric-value status-good' : 
                              passRate >= 85 ? 'metric-value status-warning' : 
                              'metric-value status-error';

        // Flaky rate colors (inverted logic)
        flakyRateEl.className = flakyRate <= 2 ? 'metric-value status-good' : 
                               flakyRate <= 5 ? 'metric-value status-warning' : 
                               'metric-value status-error';

        // Stability colors
        stabilityEl.className = stabilityScore >= 90 ? 'metric-value status-good' : 
                               stabilityScore >= 70 ? 'metric-value status-warning' : 
                               'metric-value status-error';
    }

    createCharts(metrics) {
        this.createVelocityChart(metrics);
        this.createPassRateChart(metrics);
        this.createDefectChart(metrics);
        this.createPerformanceChart(metrics);
    }

    createVelocityChart(metrics) {
        const ctx = document.getElementById('velocityChart').getContext('2d');
        this.charts.velocity = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['5 runs ago', '4 runs ago', '3 runs ago', '2 runs ago', 'Last run', 'Current'],
                datasets: [{
                    label: 'Execution Time (s)',
                    data: [145, 132, 128, 135, 130, metrics.executionTime],
                    borderColor: '#0078d4',
                    backgroundColor: 'rgba(0, 120, 212, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: { beginAtZero: true, grid: { display: false } },
                    x: { grid: { display: false } }
                }
            }
        });
    }

    createPassRateChart(metrics) {
        const ctx = document.getElementById('passRateChart').getContext('2d');
        const passRate = Math.round((metrics.passed / metrics.totalTests) * 100);
        
        this.charts.passRate = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Passed', 'Failed', 'Skipped'],
                datasets: [{
                    data: [metrics.passed, metrics.failed, metrics.skipped],
                    backgroundColor: ['#107c10', '#d13438', '#605e5c'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'bottom', labels: { usePointStyle: true } }
                }
            }
        });
    }

    createDefectChart(metrics) {
        const ctx = document.getElementById('defectChart').getContext('2d');
        this.charts.defect = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Critical', 'High', 'Medium', 'Low'],
                datasets: [{
                    label: 'Defects',
                    data: [1, 2, 0, 0],
                    backgroundColor: ['#d13438', '#ff8c00', '#ffaa44', '#107c10']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: { beginAtZero: true, grid: { display: false } },
                    x: { grid: { display: false } }
                }
            }
        });
    }

    createPerformanceChart(metrics) {
        const ctx = document.getElementById('performanceChart').getContext('2d');
        this.charts.performance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Fastest', 'Average', 'Slowest'],
                datasets: [{
                    label: 'Duration (ms)',
                    data: [
                        metrics.performance.fastestTest.duration,
                        metrics.performance.avgTestDuration,
                        metrics.performance.slowestTest.duration
                    ],
                    backgroundColor: ['#107c10', '#0078d4', '#ff8c00']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: { beginAtZero: true, grid: { display: false } },
                    x: { grid: { display: false } }
                }
            }
        });
    }
}

// Initialize dashboard when page loads
document.addEventListener('DOMContentLoaded', () => {
    new QualityDashboard();
});