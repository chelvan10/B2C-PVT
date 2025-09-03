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
  testDetails?: any[];
  defectAnalysis?: any[];
}

class DashboardReporter implements Reporter {
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

    // Enhanced metrics with test details and defect analysis
    this.metrics.testDetails = this.generateTestDetails();
    this.metrics.defectAnalysis = this.generateDefectAnalysis();

    const filename = `metrics-${new Date().toISOString().split('T')[0]}-${Date.now()}.json`;
    const filepath = join(dashboardDir, filename);
    
    writeFileSync(filepath, JSON.stringify(this.metrics, null, 2));
    console.log(`📊 Dashboard metrics saved to: ${filepath}`);
  }

  private generateTestDetails() {
    return this.testResults.map(test => ({
      name: test.name,
      status: test.status,
      duration: test.duration,
      feature: this.extractFeature(test.name),
      criticality: this.assessCriticality(test.name),
      platform: this.extractPlatform(test.name)
    }));
  }

  private generateDefectAnalysis() {
    const failedTests = this.testResults.filter(test => test.status === 'failed');
    return failedTests.map(test => ({
      testName: test.name,
      issueType: this.categorizeIssue(test.name),
      riskLevel: this.assessRisk(test.name),
      description: this.generateIssueDescription(test.name),
      recommendation: this.generateRecommendation(test.name),
      isRealIssue: this.isRealApplicationIssue(test.name)
    }));
  }

  private extractFeature(testName: string): string {
    if (testName.includes('navigation')) return 'Navigation';
    if (testName.includes('search')) return 'Search';
    if (testName.includes('account')) return 'Account';
    if (testName.includes('homepage')) return 'Homepage';
    if (testName.includes('performance')) return 'Performance';
    if (testName.includes('accessibility')) return 'Accessibility';
    return 'General';
  }

  private assessCriticality(testName: string): string {
    if (testName.includes('critical') || testName.includes('smoke')) return 'Critical';
    if (testName.includes('regression')) return 'High';
    if (testName.includes('edge') || testName.includes('boundary')) return 'Medium';
    return 'Low';
  }

  private extractPlatform(testName: string): string {
    if (testName.includes('mobile')) return 'Mobile';
    if (testName.includes('desktop')) return 'Desktop';
    return 'Cross-Platform';
  }

  private categorizeIssue(testName: string): string {
    if (testName.includes('timeout') || testName.includes('connection')) return 'Performance/Network';
    if (testName.includes('visual') || testName.includes('screenshot')) return 'Visual/UI';
    if (testName.includes('accessibility')) return 'Accessibility';
    if (testName.includes('security')) return 'Security';
    return 'Functional';
  }

  private assessRisk(testName: string): string {
    if (testName.includes('critical') || testName.includes('security')) return 'High';
    if (testName.includes('performance') || testName.includes('accessibility')) return 'Medium';
    if (testName.includes('visual') || testName.includes('edge')) return 'Low';
    return 'Medium';
  }

  private generateIssueDescription(testName: string): string {
    if (testName.includes('timeout')) return 'Test timed out - likely network/performance issue';
    if (testName.includes('visual')) return 'Visual regression detected - UI changes or screenshot baseline needs update';
    if (testName.includes('accessibility')) return 'Accessibility compliance issue detected';
    if (testName.includes('performance')) return 'Performance metrics below expected thresholds';
    return 'Functional test failure - requires investigation';
  }

  private generateRecommendation(testName: string): string {
    if (testName.includes('timeout')) return 'Increase timeout or investigate network performance';
    if (testName.includes('visual')) return 'Review UI changes and update baseline if intentional';
    if (testName.includes('accessibility')) return 'Fix accessibility issues or update test expectations';
    if (testName.includes('performance')) return 'Optimize page performance or adjust performance budgets';
    return 'Debug test failure and fix underlying issue';
  }

  private isRealApplicationIssue(testName: string): boolean {
    if (testName.includes('visual') && testName.includes('baseline')) return false;
    if (testName.includes('timeout') && testName.includes('3G')) return false;
    return true;
  }
}

export default DashboardReporter;