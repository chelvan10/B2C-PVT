#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

class DashboardGenerator {
    constructor(options = {}) {
        this.projectRoot = options.projectRoot || process.cwd();
        this.dashboardDataDir = options.dataDir || path.join(this.projectRoot, 'dashboard-data');
        this.dashboardDir = options.outputDir || path.join(this.projectRoot, 'dashboard-output');
    }

    async generate() {
        console.log('🚀 Generating Quality Engineering Dashboard...');
        
        try {
            this.ensureDirectories();
            const metrics = this.loadLatestMetrics();
            
            if (!metrics) {
                console.log('⚠️  No test metrics found. Run tests first with: npx playwright test');
                return;
            }
            
            this.generateDashboardData(metrics);
            this.ensureDashboardFiles();
            
            console.log('✅ Dashboard generated successfully!');
            console.log(`📊 Open: ${path.join(this.dashboardDir, 'index.html')}`);
            console.log('🌐 Or serve with: npx http-server dashboard -p 8080');
            
        } catch (error) {
            console.error('❌ Failed to generate dashboard:', error.message);
            process.exit(1);
        }
    }

    ensureDirectories() {
        if (!fs.existsSync(this.dashboardDataDir)) {
            fs.mkdirSync(this.dashboardDataDir, { recursive: true });
        }
        if (!fs.existsSync(this.dashboardDir)) {
            fs.mkdirSync(this.dashboardDir, { recursive: true });
        }
    }

    loadLatestMetrics() {
        if (!fs.existsSync(this.dashboardDataDir)) {
            return null;
        }

        const files = fs.readdirSync(this.dashboardDataDir)
            .filter(file => file.startsWith('metrics-') && file.endsWith('.json'));

        if (files.length === 0) {
            return null;
        }

        // Parse all files and extract metadata for intelligent selection
        const metricsFiles = files.map(file => {
            const filePath = path.join(this.dashboardDataDir, file);
            try {
                const metrics = JSON.parse(fs.readFileSync(filePath, 'utf8'));
                const timestamp = new Date(metrics.timestamp).getTime();
                
                return {
                    filename: file,
                    path: filePath,
                    metrics,
                    timestamp,
                    totalTests: metrics.totalTests || 0,
                    executionTime: metrics.executionTime || 0,
                    hasRealData: (metrics.totalTests > 0 && metrics.executionTime > 1),
                    score: this.calculateFileScore(metrics)
                };
            } catch (error) {
                console.warn(`⚠️  Skipping corrupted file: ${file}`);
                return null;
            }
        }).filter(Boolean);

        if (metricsFiles.length === 0) {
            return null;
        }

        // Sort by score (highest first), then by timestamp (latest first)
        metricsFiles.sort((a, b) => {
            if (a.score !== b.score) return b.score - a.score;
            return b.timestamp - a.timestamp;
        });

        const selectedFile = metricsFiles[0];
        
        console.log(`📊 Selected metrics file: ${selectedFile.filename}`);
        console.log(`   • Tests: ${selectedFile.totalTests}`);
        console.log(`   • Execution Time: ${selectedFile.executionTime}s`);
        console.log(`   • Timestamp: ${new Date(selectedFile.timestamp).toLocaleString()}`);
        console.log(`   • Quality Score: ${selectedFile.score}/100`);
        
        return selectedFile.metrics;
    }

    calculateFileScore(metrics) {
        let score = 0;
        
        // Base score for having tests
        if (metrics.totalTests > 0) score += 40;
        
        // Score for execution time (indicates real test run)
        if (metrics.executionTime > 1) score += 30;
        
        // Score for having test details
        if (metrics.testDetails && metrics.testDetails.length > 0) score += 15;
        
        // Score for having defect analysis
        if (metrics.defectAnalysis && metrics.defectAnalysis.length > 0) score += 10;
        
        // Bonus for comprehensive test runs
        if (metrics.totalTests >= 10) score += 5;
        
        return Math.min(score, 100);
    }

    generateDashboardData(metrics) {
        const dashboardData = {
            ...metrics,
            generatedAt: new Date().toISOString(),
            executiveSummary: this.generateExecutiveSummary(metrics)
        };

        const outputFile = path.join(this.dashboardDir, 'data.json');
        fs.writeFileSync(outputFile, JSON.stringify(dashboardData, null, 2));
        console.log(`📄 Dashboard data saved to: ${outputFile}`);
    }

    generateExecutiveSummary(metrics) {
        // Safe calculations with fallbacks
        const totalTests = metrics.totalTests || 0;
        const passed = metrics.passed || 0;
        const flaky = metrics.flaky || 0;
        const executionTime = metrics.executionTime || 0;
        const parallelWorkers = metrics.parallelWorkers || 1;
        const frameworkErrors = metrics.stability?.frameworkErrors || 0;
        const features = metrics.coverage?.features || 0;
        const criticalPaths = metrics.coverage?.criticalPaths || 0;
        const browsers = metrics.browsers?.length || 1;
        
        const passRate = totalTests > 0 ? Math.round((passed / totalTests) * 100) : 0;
        const flakyRate = totalTests > 0 ? Math.round((flaky / totalTests) * 100) : 0;
        
        // Determine status based on comprehensive metrics
        let status = 'excellent';
        let statusReason = 'All metrics within acceptable ranges';
        
        if (totalTests === 0) {
            status = 'no data';
            statusReason = 'No test execution data available';
        } else if (passRate < 80 || flakyRate > 10 || frameworkErrors > 0) {
            status = 'critical';
            statusReason = 'Multiple quality issues detected';
        } else if (passRate < 90 || flakyRate > 5) {
            status = 'needs attention';
            statusReason = 'Some quality metrics below target';
        }

        return {
            status,
            statusReason,
            passRate,
            flakyRate,
            summary: totalTests > 0 ? [
                `Test suite executed ${totalTests} tests with ${passRate}% pass rate, indicating ${status} quality levels.`,
                `Completed in ${executionTime}s using ${parallelWorkers} parallel workers with ${frameworkErrors} framework errors detected.`,
                `Coverage includes ${features} features with ${criticalPaths}% critical path validation and ${flakyRate}% flaky test rate.`,
                `Cross-platform testing validated across ${browsers} browser${browsers !== 1 ? 's' : ''} ensuring comprehensive compatibility.`
            ] : [
                'No test execution data available in the current metrics.',
                'Run test suite to generate comprehensive quality analytics.',
                'Dashboard will populate with real-time metrics upon test completion.',
                'Use "npx playwright test" to execute tests and generate data.'
            ]
        };
    }

    ensureDashboardFiles() {
        const indexPath = path.join(this.dashboardDir, 'index.html');
        const jsPath = path.join(this.dashboardDir, 'dashboard.js');
        
        if (!fs.existsSync(indexPath) || !fs.existsSync(jsPath)) {
            console.log('⚠️  Dashboard files missing. Please ensure index.html and dashboard.js exist in the dashboard directory.');
        }
    }
}

if (require.main === module) {
    const generator = new DashboardGenerator();
    generator.generate();
}

module.exports = DashboardGenerator;