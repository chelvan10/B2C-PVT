#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Read latest metrics
const dashboardDir = path.join(process.cwd(), 'dashboard-data');
const files = fs.readdirSync(dashboardDir).filter(f => f.startsWith('metrics-')).sort().reverse();
const latestFile = files[0];

if (!latestFile) {
  console.log('❌ No dashboard metrics found');
  process.exit(1);
}

const metrics = JSON.parse(fs.readFileSync(path.join(dashboardDir, latestFile), 'utf8'));

// Generate Dashboard Report
console.log('\n🎯 QUALITY ENGINEERING DASHBOARD');
console.log('═'.repeat(50));
console.log(`📅 Generated: ${new Date(metrics.timestamp).toLocaleString()}`);
console.log(`⏱️  Execution Time: ${metrics.executionTime}s`);
console.log(`👥 Workers: ${metrics.parallelWorkers}`);

console.log('\n📊 TEST EXECUTION SUMMARY');
console.log('─'.repeat(30));
console.log(`Total Tests: ${metrics.totalTests}`);
console.log(`✅ Passed: ${metrics.passed} (${metrics.totalTests ? Math.round((metrics.passed/metrics.totalTests)*100) : 0}%)`);
console.log(`❌ Failed: ${metrics.failed} (${metrics.totalTests ? Math.round((metrics.failed/metrics.totalTests)*100) : 0}%)`);
console.log(`⏭️  Skipped: ${metrics.skipped}`);
console.log(`🔄 Flaky: ${metrics.flaky}`);

console.log('\n🚀 PERFORMANCE METRICS');
console.log('─'.repeat(30));
console.log(`Avg Duration: ${Math.round(metrics.performance.avgTestDuration)}ms`);
if (metrics.performance.slowestTest.name) {
  console.log(`Slowest: ${metrics.performance.slowestTest.name} (${metrics.performance.slowestTest.duration}ms)`);
}
if (metrics.performance.fastestTest.name) {
  console.log(`Fastest: ${metrics.performance.fastestTest.name} (${metrics.performance.fastestTest.duration}ms)`);
}

console.log('\n🎯 PROJECT COVERAGE');
console.log('─'.repeat(30));
console.log(`Projects: ${metrics.projects.join(', ')}`);
console.log(`Browsers: ${metrics.browsers.join(', ')}`);
console.log(`Features Covered: ${metrics.coverage.features}`);
console.log(`Cross-Platform: ${metrics.coverage.crossPlatform} browser(s)`);

console.log('\n🔧 STABILITY METRICS');
console.log('─'.repeat(30));
console.log(`Framework Errors: ${metrics.stability.frameworkErrors}`);
console.log(`Timeouts: ${metrics.stability.timeouts}`);
console.log(`Retries: ${metrics.stability.retries}`);

if (metrics.defectAnalysis && metrics.defectAnalysis.length > 0) {
  console.log('\n🐛 DEFECT ANALYSIS');
  console.log('─'.repeat(30));
  metrics.defectAnalysis.forEach((defect, i) => {
    console.log(`${i+1}. ${defect.testName}`);
    console.log(`   Risk: ${defect.riskLevel} | Type: ${defect.issueType}`);
    console.log(`   Real Issue: ${defect.isRealIssue ? '⚠️  YES' : '✅ NO (Test/Environment)'}`);
  });
}

console.log('\n📈 RECOMMENDATIONS');
console.log('─'.repeat(30));
if (metrics.totalTests === 0) {
  console.log('🔍 No tests executed - verify test discovery and configuration');
  console.log('💡 Check testDir paths in playwright.config.ts');
  console.log('🔧 Ensure test files follow naming convention (*.spec.ts)');
} else if (metrics.failed > 0) {
  console.log('🔍 Investigate failed tests for root cause analysis');
  console.log('📊 Review performance metrics for optimization opportunities');
} else {
  console.log('✅ All tests passing - excellent stability!');
  console.log('📊 Consider expanding test coverage for new features');
}

console.log('\n═'.repeat(50));
console.log(`📄 Full report: ${path.join(dashboardDir, latestFile)}`);