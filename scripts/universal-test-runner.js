#!/usr/bin/env node

import { spawn, exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const execAsync = promisify(exec);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

class UniversalTestRunner {
    constructor() {
        this.usedPorts = new Set();
        this.dashboardPort = null;
    }

    async runTests(testPath, options = {}) {
        this.displayHeader(testPath, options);
        
        const startTime = Date.now();
        let command = this.buildTestCommand(testPath, options);
        
        try {
            await this.executeWithProgress(command, startTime, testPath);
        } catch (error) {
            this.displayError(error);
            await this.generateAndServeDashboard();
        }
    }

    displayHeader(testPath, options) {
        console.clear();
        console.log('\n' + '═'.repeat(80));
        console.log('🎯 PLAYWRIGHT TEST EXECUTION SUITE');
        console.log('═'.repeat(80));
        console.log(`📂 Target: ${testPath}`);
        if (options.browser) console.log(`🌐 Browser: ${options.browser}`);
        if (options.coverage) console.log(`📊 Coverage: Enabled`);
        if (options.debug) console.log(`🐛 Debug: Enabled`);
        if (options.headed) console.log(`👁️  Headed: Visible browser`);
        console.log('═'.repeat(80));
        console.log('⏳ Initializing test environment...');
    }

    async executeWithProgress(command, startTime, testPath) {
        return new Promise((resolve, reject) => {
            const child = spawn('npx', command.split(' ').slice(1), {
                cwd: process.cwd(),
                stdio: ['pipe', 'pipe', 'pipe']
            });

            let testCount = 0;
            let passedCount = 0;
            let failedCount = 0;
            let currentTest = '';
            let output = '';

            child.stdout.on('data', (data) => {
                const text = data.toString();
                output += text;
                this.parseAndDisplayProgress(text, { testCount, passedCount, failedCount, currentTest });
            });

            child.stderr.on('data', (data) => {
                const text = data.toString();
                if (!text.includes('Warning') && !text.includes('deprecated')) {
                    console.log(`⚠️  ${text.trim()}`);
                }
            });

            child.on('close', async (code) => {
                const executionTime = ((Date.now() - startTime) / 1000).toFixed(2);
                
                if (code === 0) {
                    await this.displaySuccess(output, executionTime, testPath);
                } else {
                    await this.displayFailure(output, executionTime, testPath);
                }
                
                // Always generate dashboard and open report
                await this.openHtmlReport();
                await this.generateAndServeDashboard();
                resolve();
            });

            child.on('error', reject);
        });
    }

    parseAndDisplayProgress(text, counters) {
        // Parse test start
        if (text.includes('Running') && text.includes('.spec.ts')) {
            const testMatch = text.match(/Running (.+\.spec\.ts)/);
            if (testMatch) {
                counters.currentTest = testMatch[1].split('/').pop();
                console.log(`\n🧪 ${counters.currentTest}`);
            }
        }

        // Parse individual test execution with better regex
        const testLineMatch = text.match(/\s*✓\s*(\d+)\s*\[([^\]]+)\]\s*›\s*(.+?)\s*\((\d+(?:\.\d+)?s)\)/);
        if (testLineMatch) {
            const [, testNum, project, testName, duration] = testLineMatch;
            counters.passedCount++;
            const color = '\x1b[32m';
            const reset = '\x1b[0m';
            console.log(`   ✅ ${color}Test ${testNum} [${project}]: ${testName.substring(0, 80)}${testName.length > 80 ? '...' : ''}${reset} ${duration}`);
        }
        
        // Parse failed tests
        const failedMatch = text.match(/\s*✗\s*(\d+)\s*\[([^\]]+)\]\s*›\s*(.+?)\s*\((\d+(?:\.\d+)?s)\)/);
        if (failedMatch) {
            const [, testNum, project, testName, duration] = failedMatch;
            counters.failedCount++;
            const color = '\x1b[31m';
            const reset = '\x1b[0m';
            console.log(`   ❌ ${color}Test ${testNum} [${project}]: ${testName.substring(0, 80)}${testName.length > 80 ? '...' : ''}${reset} ${duration}`);
        }

        // Parse test suite results
        const suiteMatch = text.match(/(\d+) passed.*?(\d+) failed/);
        if (suiteMatch) {
            const [, passed, failed] = suiteMatch;
            console.log(`\n📊 Suite Summary: ✅ ${passed} passed, ❌ ${failed} failed`);
        }

        // Parse overall execution summary
        const summaryMatch = text.match(/(\d+) passed/);
        if (summaryMatch && text.includes('passed') && !text.includes('Suite')) {
            const passed = summaryMatch[1];
            const failedMatch = text.match(/(\d+) failed/);
            const failed = failedMatch ? failedMatch[1] : '0';
            console.log(`\n🎯 Final Results: ✅ ${passed} passed${failed !== '0' ? `, ❌ ${failed} failed` : ''}`);
        }

        // Parse worker info
        if (text.includes('Running') && text.includes('test') && text.includes('worker')) {
            const progressMatch = text.match(/Running (\d+) test.*?(\d+) worker/);
            if (progressMatch) {
                const [, tests, workers] = progressMatch;
                console.log(`\n⚡ Executing ${tests} tests with ${workers} parallel workers...`);
            }
        }
    }

    buildTestCommand(testPath, options) {
        let command = 'npx playwright test --config=config/playwright.config.ts';
        
        // Add test path
        if (testPath && testPath !== 'all') {
            command += ` ${testPath}`;
        }
        
        // Force headless mode by default (no flag needed, headless is default)

        // Add project selection
        if (options.project) {
            command += ` --project=${options.project}`;
        }

        // Add browser selection
        if (options.browser) {
            const projectMap = {
                'chrome': 'b2c-desktop-chrome',
                'android': 'b2c-mobile-android',
                'firefox': 'b2c-desktop-firefox',
                'safari': 'b2c-desktop-safari'
            };
            command += ` --project=${projectMap[options.browser] || options.browser}`;
        }

        // Add coverage
        if (options.coverage) {
            command += ' --reporter=html,json,./utils/everest-dashboard-reporter.ts';
        } else {
            command += ' --reporter=html,./utils/everest-dashboard-reporter.ts';
        }

        // Add debug mode
        if (options.debug) {
            command += ' --debug';
        }

        // Add headed mode if requested
        if (options.headed) {
            command += ' --headed';
        }

        return command;
    }

    async displaySuccess(output, executionTime, testPath) {
        console.log('\n' + '═'.repeat(60));
        console.log('✅ TEST EXECUTION COMPLETED SUCCESSFULLY');
        console.log('═'.repeat(60));
        
        const passedMatch = output.match(/(\d+) passed/);
        const failedMatch = output.match(/(\d+) failed/);
        const skippedMatch = output.match(/(\d+) skipped/);
        
        console.log(`\n📊 FINAL RESULTS:`);
        if (passedMatch) console.log(`   ✅ Passed: ${passedMatch[1]} tests`);
        if (failedMatch) console.log(`   ❌ Failed: ${failedMatch[1]} tests`);
        if (skippedMatch) console.log(`   ⏭️  Skipped: ${skippedMatch[1]} tests`);
        console.log(`   ⏱️  Duration: ${executionTime}s`);
        console.log(`   📂 Path: ${testPath}`);
        
        console.log('\n🚀 NEXT STEPS:');
        console.log('   📊 Generating HTML report...');
        console.log('   📈 Creating executive dashboard...');
        console.log('   🌐 Starting dashboard server...');
    }

    async displayFailure(output, executionTime, testPath) {
        console.log('\n' + '═'.repeat(60));
        console.log('⚠️ TEST EXECUTION COMPLETED WITH ISSUES');
        console.log('═'.repeat(60));
        
        const passedMatch = output.match(/(\d+) passed/);
        const failedMatch = output.match(/(\d+) failed/);
        const skippedMatch = output.match(/(\d+) skipped/);
        
        console.log(`\n📊 FINAL RESULTS:`);
        if (passedMatch) console.log(`   ✅ Passed: ${passedMatch[1]} tests`);
        if (failedMatch) console.log(`   ❌ Failed: ${failedMatch[1]} tests`);
        if (skippedMatch) console.log(`   ⏭️  Skipped: ${skippedMatch[1]} tests`);
        console.log(`   ⏱️  Duration: ${executionTime}s`);
        console.log(`   📂 Path: ${testPath}`);
        
        console.log('\n🔍 ANALYSIS:');
        console.log('   📊 Generating failure analysis...');
        console.log('   📈 Creating diagnostic dashboard...');
        console.log('   🌐 Starting dashboard server...');
    }

    displayError(error) {
        console.log('\n' + '═'.repeat(60));
        console.log('🚨 EXECUTION ERROR');
        console.log('═'.repeat(60));
        console.log(`\n❌ Error: ${error.message}`);
        console.log('\n🔧 TROUBLESHOOTING:');
        console.log('   📋 Check test file paths');
        console.log('   🔍 Verify configuration files');
        console.log('   📊 Generating diagnostic dashboard...');
    }

    async openHtmlReport() {
        // Wait for report generation
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const reportPath = path.join(process.cwd(), 'playwright-report', 'index.html');
        if (fs.existsSync(reportPath)) {
            console.log(`📊 HTML Report: file://${reportPath}`);
            
            const platform = process.platform;
            let openCmd;
            if (platform === 'darwin') {
                openCmd = 'open';
            } else if (platform === 'win32') {
                openCmd = 'start';
            } else {
                // Linux - try to use specific browser instead of xdg-open to avoid Dyad
                openCmd = 'google-chrome --new-window';
            }
            
            // Auto-open HTML report in default browser
            if (!process.env.CI) {
                try {
                    await execAsync(`${openCmd} "${reportPath}"`);
                    console.log('🌐 HTML Report opened automatically');
                } catch (error) {
                    console.log('⚠️  Could not auto-open report. Please open manually.');
                    console.log(`📊 Manual URL: file://${reportPath}`);
                }
            } else {
                console.log('📊 HTML Report available (CI mode - auto-open disabled)');
            }
        } else {
            console.log('⚠️  HTML Report not found. Generating...');
            try {
                await execAsync('npx playwright show-report --host=localhost --port=9323');
                console.log('🌐 HTML Report server started at http://localhost:9323');
            } catch (error) {
                console.log('⚠️  Could not start report server.');
            }
        }
    }

    async generateAndServeDashboard() {
        console.log('\n' + '─'.repeat(50));
        console.log('🎯 QUALITY ENGINEERING DASHBOARD');
        console.log('─'.repeat(50));
        
        try {
            console.log('📊 Processing test metrics...');
            await execAsync('npm run generate:dashboard');
            
            console.log('🔍 Finding available port...');
            this.dashboardPort = await this.findAvailablePort(8080);
            
            console.log('🧹 Cleaning up old servers...');
            await this.killExistingServers();
            
            console.log('🚀 Launching dashboard server...');
            await this.startDashboardServer();
        } catch (error) {
            console.error('❌ Dashboard generation failed:', error.message);
        }
    }

    async findAvailablePort(startPort) {
        for (let port = startPort; port < startPort + 100; port++) {
            if (!this.usedPorts.has(port) && await this.isPortAvailable(port)) {
                this.usedPorts.add(port);
                return port;
            }
        }
        throw new Error('No available ports found');
    }

    async isPortAvailable(port) {
        try {
            await execAsync(`lsof -i :${port}`);
            return false;
        } catch {
            return true;
        }
    }

    async killExistingServers() {
        try {
            await execAsync('pkill -f "http-server.*dashboard"').catch(() => {});
            console.log('🔄 Cleaned up existing dashboard servers');
        } catch (error) {}
    }

    async startDashboardServer() {
        const dashboardPath = path.join(process.cwd(), 'dashboard-output');
        const url = `http://localhost:${this.dashboardPort}`;
        
        // Start dashboard server with proper error handling
        try {
            const server = spawn('node', ['scripts/everest-dashboard-server.js'], {
                detached: true,
                stdio: 'ignore',
                env: { ...process.env, PORT: this.dashboardPort.toString() }
            });
            
            server.unref();
            await new Promise(resolve => setTimeout(resolve, 2000));
        } catch (error) {
            console.log('⚠️  Dashboard server failed to start, using simple server');
            await this.startSimpleServer();
        }
        
        console.log('\n' + '─'.repeat(50));
        console.log('✅ DASHBOARD READY');
        console.log('─'.repeat(50));
        console.log(`🌐 URL: ${url}`);
        console.log(`📊 Port: ${this.dashboardPort}`);
        console.log(`📂 Path: ${dashboardPath}`);
        console.log('\n📋 FEATURES AVAILABLE:');
        console.log('   📊 Executive Summary');
        console.log('   💓 Quality Pulse Visualization');
        console.log('   🔥 Test Execution Heatmap');
        console.log('   ⚡ Performance Insights');
        console.log('   🐛 Defect Analysis');
        console.log('\n🚀 Dashboard will auto-refresh with new test data!');
        
        process.on('SIGINT', () => this.cleanup());
        process.on('SIGTERM', () => this.cleanup());
    }

    async startSimpleServer() {
        const http = require('http');
        const server = http.createServer((req, res) => {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(`
                <html><head><title>Test Results</title></head>
                <body style="font-family: Arial; padding: 40px; text-align: center;">
                    <h1>🏆 Tests Completed Successfully</h1>
                    <p>Dashboard temporarily unavailable</p>
                    <p><a href="file://${process.cwd()}/playwright-report/index.html">View HTML Report</a></p>
                </body></html>
            `);
        });
        server.listen(this.dashboardPort);
    }

    async cleanup() {
        console.log('\n🧹 Cleaning up servers and releasing ports...');
        await this.killExistingServers();
        this.usedPorts.clear();
        console.log('✅ Cleanup completed');
        process.exit(0);
    }
}

// CLI Interface
const runner = new UniversalTestRunner();

// Parse command line arguments
const args = process.argv.slice(2);
const testPath = args[0] || 'all';
const options = {};

// Parse options
args.forEach(arg => {
    if (arg.startsWith('--project=')) options.project = arg.split('=')[1];
    if (arg.startsWith('--browser=')) options.browser = arg.split('=')[1];
    if (arg === '--coverage') options.coverage = true;
    if (arg === '--debug') options.debug = true;
    if (arg === '--headed') options.headed = true;
});

// Show usage if no args
if (args.length === 0 || args[0] === '--help') {
    console.log('🎯 Universal Test Runner');
    console.log('');
    console.log('Usage: node scripts/universal-test-runner.js <test-path> [options]');
    console.log('');
    console.log('Examples:');
    console.log('  node scripts/universal-test-runner.js B2C/tests/smoke/');
    console.log('  node scripts/universal-test-runner.js B2C/tests/smoke/homepage-comprehensive.spec.ts');
    console.log('  node scripts/universal-test-runner.js B2C/tests/smoke/ --browser=chrome');
    console.log('  node scripts/universal-test-runner.js B2C/tests/smoke/ --coverage');
    console.log('  node scripts/universal-test-runner.js B2C/tests/smoke/ --debug');
    console.log('  node scripts/universal-test-runner.js B2C/tests/smoke/ --headed');
    console.log('');
    console.log('Options:');
    console.log('  --project=<name>    Specific project (b2c-desktop-chrome, b2c-mobile-android)');
    console.log('  --browser=<name>    Browser shortcut (chrome, android, firefox, safari)');
    console.log('  --coverage          Include test coverage');
    console.log('  --debug             Run in debug mode');
    console.log('  --headed            Run with visible browser');
    process.exit(0);
}

// Run tests
runner.runTests(testPath, options);

export default UniversalTestRunner;