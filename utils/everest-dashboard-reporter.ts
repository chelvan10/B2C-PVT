import { FullConfig, FullResult, Reporter, Suite, TestCase, TestResult } from '@playwright/test/reporter';
import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'fs';
import { join } from 'path';

interface EverestMetrics {
  timestamp: string;
  execution: {
    totalTests: number;
    passed: number;
    failed: number;
    skipped: number;
    flaky: number;
    executionTime: number;
    parallelWorkers: number;
  };
  coverage: {
    epics: string[];
    features: string[];
    testTypes: string[];
    riskLevels: string[];
    deviceClasses: string[];
    networkProfiles: string[];
    requirements: string[];
  };
  performance: {
    avgTestDuration: number;
    slowestTest: { name: string; duration: number };
    fastestTest: { name: string; duration: number };
    networkPerformance: Record<string, number>;
    devicePerformance: Record<string, number>;
  };
  quality: {
    passRateByFeature: Record<string, number>;
    passRateByRisk: Record<string, number>;
    passRateByDevice: Record<string, number>;
    criticalFailures: number;
    performanceIssues: number;
    accessibilityIssues: number;
  };
  allure: {
    epicsCount: number;
    featuresCount: number;
    storiesCount: number;
    requirementsCount: number;
  };
  testDetails: any[];
  defectAnalysis: any[];
}

class EverestDashboardReporter implements Reporter {
  private startTime: number = 0;
  private metrics: EverestMetrics;
  private testResults: any[] = [];

  constructor() {
    this.metrics = {
      timestamp: new Date().toISOString(),
      execution: {
        totalTests: 0,
        passed: 0,
        failed: 0,
        skipped: 0,
        flaky: 0,
        executionTime: 0,
        parallelWorkers: 0
      },
      coverage: {
        epics: [],
        features: [],
        testTypes: [],
        riskLevels: [],
        deviceClasses: [],
        networkProfiles: [],
        requirements: []
      },
      performance: {
        avgTestDuration: 0,
        slowestTest: { name: '', duration: 0 },
        fastestTest: { name: '', duration: Infinity },
        networkPerformance: {},
        devicePerformance: {}
      },
      quality: {
        passRateByFeature: {},
        passRateByRisk: {},
        passRateByDevice: {},
        criticalFailures: 0,
        performanceIssues: 0,
        accessibilityIssues: 0
      },
      allure: {
        epicsCount: 0,
        featuresCount: 0,
        storiesCount: 0,
        requirementsCount: 0
      },
      testDetails: [],
      defectAnalysis: []
    };
  }

  onBegin(config: FullConfig, suite: Suite) {
    this.startTime = Date.now();
    this.metrics.execution.parallelWorkers = config.workers;
  }

  onTestEnd(test: TestCase, result: TestResult) {
    this.metrics.execution.totalTests++;
    const duration = result.duration;
    
    // Extract Allure metadata from test annotations
    const annotations = test.annotations || [];
    const epic = this.extractAnnotation(annotations, 'epic') || 'Unknown Epic';
    const feature = this.extractAnnotation(annotations, 'feature') || 'Unknown Feature';
    const testType = this.extractAnnotation(annotations, 'story') || 'unknown';
    const risk = this.extractAnnotation(annotations, 'severity') || 'normal';
    const deviceClass = this.extractAnnotation(annotations, 'deviceClass');
    const networkProfile = this.extractAnnotation(annotations, 'network');
    const requirement = this.extractAnnotation(annotations, 'requirement');

    const testInfo = {
      name: test.title,
      duration,
      status: result.status,
      epic,
      feature,
      testType,
      risk,
      deviceClass,
      networkProfile,
      requirement,
      file: test.location?.file || '',
      line: test.location?.line || 0
    };

    this.testResults.push(testInfo);

    // Update coverage tracking
    if (epic && !this.metrics.coverage.epics.includes(epic)) {
      this.metrics.coverage.epics.push(epic);
    }
    if (feature && !this.metrics.coverage.features.includes(feature)) {
      this.metrics.coverage.features.push(feature);
    }
    if (testType && !this.metrics.coverage.testTypes.includes(testType)) {
      this.metrics.coverage.testTypes.push(testType);
    }
    if (risk && !this.metrics.coverage.riskLevels.includes(risk)) {
      this.metrics.coverage.riskLevels.push(risk);
    }
    if (deviceClass && !this.metrics.coverage.deviceClasses.includes(deviceClass)) {
      this.metrics.coverage.deviceClasses.push(deviceClass);
    }
    if (networkProfile && !this.metrics.coverage.networkProfiles.includes(networkProfile)) {
      this.metrics.coverage.networkProfiles.push(networkProfile);
    }
    if (requirement && !this.metrics.coverage.requirements.includes(requirement)) {
      this.metrics.coverage.requirements.push(requirement);
    }

    // Update performance metrics
    if (duration > this.metrics.performance.slowestTest.duration) {
      this.metrics.performance.slowestTest = { name: test.title, duration };
    }
    if (duration < this.metrics.performance.fastestTest.duration) {
      this.metrics.performance.fastestTest = { name: test.title, duration };
    }

    // Track network and device performance
    if (networkProfile) {
      if (!this.metrics.performance.networkPerformance[networkProfile]) {
        this.metrics.performance.networkPerformance[networkProfile] = 0;
      }
      this.metrics.performance.networkPerformance[networkProfile] += duration;
    }

    if (deviceClass) {
      if (!this.metrics.performance.devicePerformance[deviceClass]) {
        this.metrics.performance.devicePerformance[deviceClass] = 0;
      }
      this.metrics.performance.devicePerformance[deviceClass] += duration;
    }

    // Count results
    switch (result.status) {
      case 'passed':
        this.metrics.execution.passed++;
        break;
      case 'failed':
        this.metrics.execution.failed++;
        if (risk === 'critical') this.metrics.quality.criticalFailures++;
        if (testType === 'perf') this.metrics.quality.performanceIssues++;
        if (testType === 'a11y') this.metrics.quality.accessibilityIssues++;
        break;
      case 'skipped':
        this.metrics.execution.skipped++;
        break;
      case 'flaky':
        this.metrics.execution.flaky++;
        break;
    }
  }

  onEnd(result: FullResult) {
    this.metrics.execution.executionTime = (Date.now() - this.startTime) / 1000;
    
    // Calculate averages
    const totalDuration = this.testResults.reduce((sum, test) => sum + test.duration, 0);
    this.metrics.performance.avgTestDuration = totalDuration / this.testResults.length || 0;

    // Calculate quality metrics
    this.calculateQualityMetrics();
    
    // Set Allure counts
    this.metrics.allure = {
      epicsCount: this.metrics.coverage.epics.length,
      featuresCount: this.metrics.coverage.features.length,
      storiesCount: this.metrics.coverage.testTypes.length,
      requirementsCount: this.metrics.coverage.requirements.length
    };

    // Generate test details and defect analysis
    this.metrics.testDetails = this.generateTestDetails();
    this.metrics.defectAnalysis = this.generateDefectAnalysis();

    this.saveMetrics();
  }

  private extractAnnotation(annotations: any[], type: string): string | undefined {
    const annotation = annotations.find(a => a.type === type);
    return annotation?.description;
  }

  private calculateQualityMetrics() {
    // Pass rate by feature
    const featureStats: Record<string, { total: number; passed: number }> = {};
    this.testResults.forEach(test => {
      if (!featureStats[test.feature]) {
        featureStats[test.feature] = { total: 0, passed: 0 };
      }
      featureStats[test.feature].total++;
      if (test.status === 'passed') {
        featureStats[test.feature].passed++;
      }
    });

    Object.entries(featureStats).forEach(([feature, stats]) => {
      this.metrics.quality.passRateByFeature[feature] = Math.round((stats.passed / stats.total) * 100);
    });

    // Pass rate by risk
    const riskStats: Record<string, { total: number; passed: number }> = {};
    this.testResults.forEach(test => {
      if (!riskStats[test.risk]) {
        riskStats[test.risk] = { total: 0, passed: 0 };
      }
      riskStats[test.risk].total++;
      if (test.status === 'passed') {
        riskStats[test.risk].passed++;
      }
    });

    Object.entries(riskStats).forEach(([risk, stats]) => {
      this.metrics.quality.passRateByRisk[risk] = Math.round((stats.passed / stats.total) * 100);
    });

    // Pass rate by device
    const deviceStats: Record<string, { total: number; passed: number }> = {};
    this.testResults.forEach(test => {
      if (test.deviceClass) {
        if (!deviceStats[test.deviceClass]) {
          deviceStats[test.deviceClass] = { total: 0, passed: 0 };
        }
        deviceStats[test.deviceClass].total++;
        if (test.status === 'passed') {
          deviceStats[test.deviceClass].passed++;
        }
      }
    });

    Object.entries(deviceStats).forEach(([device, stats]) => {
      this.metrics.quality.passRateByDevice[device] = Math.round((stats.passed / stats.total) * 100);
    });
  }

  private generateTestDetails() {
    return this.testResults.map(test => ({
      name: test.name,
      status: test.status,
      duration: test.duration,
      epic: test.epic,
      feature: test.feature,
      type: test.testType,
      risk: test.risk,
      deviceClass: test.deviceClass || 'Unknown',
      networkProfile: test.networkProfile || 'Unknown',
      requirement: test.requirement || 'N/A',
      file: test.file,
      line: test.line
    }));
  }

  private generateDefectAnalysis() {
    const failedTests = this.testResults.filter(test => test.status === 'failed');
    return failedTests.map(test => ({
      testName: test.name,
      feature: test.feature,
      epic: test.epic,
      riskLevel: test.risk,
      testType: test.testType,
      deviceClass: test.deviceClass,
      networkProfile: test.networkProfile,
      duration: test.duration,
      issueCategory: this.categorizeIssue(test),
      recommendation: this.generateRecommendation(test),
      priority: this.calculatePriority(test),
      isEnvironmentalIssue: this.isEnvironmentalIssue(test)
    }));
  }

  private categorizeIssue(test: any): string {
    if (test.testType === 'perf') return 'Performance';
    if (test.testType === 'a11y') return 'Accessibility';
    if (test.testType === 'visual') return 'Visual Regression';
    if (test.testType === 'negative') return 'Error Handling';
    if (test.feature.includes('Navigation')) return 'Navigation';
    return 'Functional';
  }

  private generateRecommendation(test: any): string {
    if (test.testType === 'perf') return 'Optimize page performance or adjust thresholds';
    if (test.testType === 'a11y') return 'Fix accessibility compliance issues';
    if (test.testType === 'visual') return 'Review UI changes and update baselines';
    if (test.networkProfile === 'Slow3G') return 'Consider network-specific optimizations';
    return 'Investigate and fix functional issue';
  }

  private calculatePriority(test: any): string {
    if (test.risk === 'critical') return 'P1 - Critical';
    if (test.risk === 'normal' && test.testType === 'perf') return 'P2 - High';
    if (test.risk === 'normal') return 'P3 - Medium';
    return 'P4 - Low';
  }

  private isEnvironmentalIssue(test: any): boolean {
    return test.networkProfile === 'Slow3G' || test.testType === 'visual' || test.name.includes('timeout');
  }

  private saveMetrics() {
    const dashboardDir = join(process.cwd(), 'dashboard-data');
    if (!existsSync(dashboardDir)) {
      mkdirSync(dashboardDir, { recursive: true });
    }

    const filename = `everest-metrics-${new Date().toISOString().split('T')[0]}-${Date.now()}.json`;
    const filepath = join(dashboardDir, filename);
    
    writeFileSync(filepath, JSON.stringify(this.metrics, null, 2));
    console.log(`📊 Everest Dashboard metrics saved to: ${filepath}`);
  }
}

export default EverestDashboardReporter;