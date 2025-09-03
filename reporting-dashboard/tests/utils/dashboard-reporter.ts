import { FullConfig, FullResult, Reporter, Suite, TestCase, TestResult } from '@playwright/test/reporter';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

interface DashboardMetrics {
  timestamp: string;
  totalTests: number;
  passed: number;
  failed: number;
  skipped: number;
  flaky: number;
  executionTime: number;
  parallelWorkers: number;
  browsers: string[];
  projects: string[];
  performance: {
    avgTestDuration: number;
    slowestTest: { name: string; duration: number };
    fastestTest: { name: string; duration: number };
  };
  coverage: {
    features: number;
    criticalPaths: number;
    crossPlatform: number;
  };
  stability: {
    frameworkErrors: number;
    timeouts: number;
    retries: number;
  };
}

export class DashboardReporter implements Reporter {
  private startTime: number = 0;
  private metrics: DashboardMetrics;
  private testDurations: number[] = [];
  private testResults: { name: string; duration: number; status: string }[] = [];

  constructor() {
    this.metrics = {
      timestamp: new Date().toISOString(),
      totalTests: 0,
      passed: 0,
      failed: 0,
      skipped: 0,
      flaky: 0,
      executionTime: 0,
      parallelWorkers: 0,
      browsers: [],
      projects: [],
      performance: {
        avgTestDuration: 0,
        slowestTest: { name: '', duration: 0 },
        fastestTest: { name: '', duration: Infinity }
      },
      coverage: {
        features: 0,
        criticalPaths: 0,
        crossPlatform: 0
      },
      stability: {
        frameworkErrors: 0,
        timeouts: 0,
        retries: 0
      }
    };
  }

  onBegin(config: FullConfig, suite: Suite) {
    this.startTime = Date.now();
    this.metrics.parallelWorkers = config.workers;
    this.metrics.projects = config.projects.map(p => p.name);
    this.metrics.browsers = [...new Set(config.projects.map(p => p.use?.browserName || 'unknown'))];
  }

  onTestEnd(test: TestCase, result: TestResult) {
    this.metrics.totalTests++;
    const duration = result.duration;
    this.testDurations.push(duration);
    
    const testInfo = {
      name: test.title,
      duration,
      status: result.status
    };
    this.testResults.push(testInfo);

    // Update performance metrics
    if (duration > this.metrics.performance.slowestTest.duration) {
      this.metrics.performance.slowestTest = { name: test.title, duration };
    }
    if (duration < this.metrics.performance.fastestTest.duration) {
      this.metrics.performance.fastestTest = { name: test.title, duration };
    }

    // Count results
    switch (result.status) {
      case 'passed':
        this.metrics.passed++;
        break;
      case 'failed':
        this.metrics.failed++;
        if (result.error?.message?.includes('timeout')) {
          this.metrics.stability.timeouts++;
        }
        break;
      case 'skipped':
        this.metrics.skipped++;
        break;
      case 'flaky':
        this.metrics.flaky++;
        break;
    }

    // Count retries
    this.metrics.stability.retries += result.retry;
  }

  onEnd(result: FullResult) {
    this.metrics.executionTime = (Date.now() - this.startTime) / 1000;
    this.metrics.performance.avgTestDuration = this.testDurations.length > 0 
      ? this.testDurations.reduce((a, b) => a + b, 0) / this.testDurations.length 
      : 0;

    // Calculate coverage metrics (simplified)
    this.metrics.coverage.features = this.calculateFeatureCoverage();
    this.metrics.coverage.criticalPaths = this.calculateCriticalPathCoverage();
    this.metrics.coverage.crossPlatform = this.metrics.browsers.length;

    this.saveMetrics();
  }

  private calculateFeatureCoverage(): number {
    const features = new Set();
    this.testResults.forEach(test => {
      if (test.name.includes('navigation')) features.add('navigation');
      if (test.name.includes('search')) features.add('search');
      if (test.name.includes('account')) features.add('account');
      if (test.name.includes('mobile')) features.add('mobile');
    });
    return features.size;
  }

  private calculateCriticalPathCoverage(): number {
    const criticalTests = this.testResults.filter(test => 
      test.name.includes('critical') || 
      test.name.includes('smoke') ||
      test.name.includes('login') ||
      test.name.includes('checkout')
    );
    return Math.round((criticalTests.length / this.metrics.totalTests) * 100);
  }

  private saveMetrics() {
    const dashboardDir = join(process.cwd(), 'dashboard-data');
    if (!existsSync(dashboardDir)) {
      mkdirSync(dashboardDir, { recursive: true });
    }

    const filename = `metrics-${new Date().toISOString().split('T')[0]}-${Date.now()}.json`;
    const filepath = join(dashboardDir, filename);
    
    writeFileSync(filepath, JSON.stringify(this.metrics, null, 2));
    console.log(`📊 Dashboard metrics saved to: ${filepath}`);
  }
}