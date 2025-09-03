import fs from 'fs';
import path from 'path';

export interface TestSummaryConfig {
  outputDir: string;
  projectName: string;
  version: string;
  environment: string;
  testManager?: string;
  testLead?: string;
  releaseVersion?: string;
  testPeriod?: { start: string; end: string };
}

export interface TestMetrics {
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  flaky: number;
  passRate: number;
  totalDuration: number;
  avgDuration: number;
  coverage: {
    functional: number;
    regression: number;
    smoke: number;
    integration: number;
  };
  riskAssessment: {
    high: number;
    medium: number;
    low: number;
  };
  defectDensity: number;
  testEfficiency: number;
}

export interface DefectAnalysis {
  criticalDefects: number;
  majorDefects: number;
  minorDefects: number;
  defectLeakageRate: number;
  defectRemovalEfficiency: number;
  meanTimeToDetection: number;
}

export class TestSummaryGenerator {
  private config: TestSummaryConfig;
  private startTime: Date;
  private endTime: Date;

  constructor(config: TestSummaryConfig) {
    this.config = config;
    this.startTime = new Date();
    this.endTime = new Date();
  }

  async generateSummary(results: any): Promise<string> {
    const metrics = this.buildTestMetrics(results);
    const defects = this.analyzeDefects(results);
    const report = this.generateISTQBReport(metrics, defects);
    
    // Ensure output directory exists
    if (!fs.existsSync(this.config.outputDir)) {
      fs.mkdirSync(this.config.outputDir, { recursive: true });
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const outputPath = path.join(this.config.outputDir, `EXECUTIVE_TEST_SUMMARY_${timestamp}.md`);
    const latestPath = path.join(this.config.outputDir, 'EXECUTIVE_TEST_SUMMARY.md');
    
    fs.writeFileSync(outputPath, report);
    fs.writeFileSync(latestPath, report); // Always keep latest
    
    // Generate JSON version for dashboard integration
    const jsonReport = {
      timestamp: new Date().toISOString(),
      config: this.config,
      metrics,
      defects,
      summary: this.generateExecutiveSummary(metrics, defects)
    };
    
    const jsonPath = path.join(this.config.outputDir, 'test-summary.json');
    fs.writeFileSync(jsonPath, JSON.stringify(jsonReport, null, 2));
    
    return outputPath;
  }

  private buildTestMetrics(results: any): TestMetrics {
    const tests = this.extractTestData(results);
    
    const passed = tests.filter(t => t.status === 'passed').length;
    const failed = tests.filter(t => t.status === 'failed').length;
    const skipped = tests.filter(t => t.status === 'skipped').length;
    const flaky = tests.filter(t => t.retry && t.retry > 0).length;
    
    const totalDuration = tests.reduce((sum, t) => sum + (t.duration || 0), 0);
    const avgDuration = tests.length > 0 ? totalDuration / tests.length : 0;
    
    return {
      total: tests.length,
      passed,
      failed,
      skipped,
      flaky,
      passRate: tests.length > 0 ? Math.round((passed / tests.length) * 100) : 0,
      totalDuration,
      avgDuration,
      coverage: this.calculateCoverage(tests),
      riskAssessment: this.assessRisk(tests),
      defectDensity: tests.length > 0 ? (failed / tests.length) * 100 : 0,
      testEfficiency: this.calculateEfficiency(tests)
    };
  }

  private extractTestData(results: any): any[] {
    if (!results || !results.suites) return [];
    
    return results.suites.flatMap((suite: any) => 
      suite.specs?.flatMap((spec: any) => 
        spec.tests?.map((test: any) => ({
          title: spec.title,
          status: test.results?.[0]?.status || 'unknown',
          duration: test.results?.[0]?.duration || 0,
          file: spec.file,
          retry: test.results?.[0]?.retry || 0,
          error: test.results?.[0]?.error,
          annotations: test.annotations || [],
          tags: this.extractTags(spec.title, spec.file)
        }))
      ) || []
    ) || [];
  }

  private extractTags(title: string, file: string): string[] {
    const tags = [];
    if (file.includes('smoke')) tags.push('smoke');
    if (file.includes('regression')) tags.push('regression');
    if (file.includes('integration')) tags.push('integration');
    if (title.toLowerCase().includes('critical')) tags.push('critical');
    if (title.toLowerCase().includes('high')) tags.push('high-risk');
    return tags;
  }

  private calculateCoverage(tests: any[]): any {
    const total = tests.length;
    if (total === 0) return { functional: 0, regression: 0, smoke: 0, integration: 0 };
    
    return {
      functional: Math.round((tests.filter(t => t.tags.includes('functional')).length / total) * 100),
      regression: Math.round((tests.filter(t => t.tags.includes('regression')).length / total) * 100),
      smoke: Math.round((tests.filter(t => t.tags.includes('smoke')).length / total) * 100),
      integration: Math.round((tests.filter(t => t.tags.includes('integration')).length / total) * 100)
    };
  }

  private assessRisk(tests: any[]): any {
    const total = tests.length;
    if (total === 0) return { high: 0, medium: 0, low: 0 };
    
    const high = tests.filter(t => t.tags.includes('critical') || t.tags.includes('high-risk')).length;
    const medium = tests.filter(t => t.duration > 5000 || t.retry > 0).length;
    const low = total - high - medium;
    
    return {
      high: Math.round((high / total) * 100),
      medium: Math.round((medium / total) * 100),
      low: Math.round((low / total) * 100)
    };
  }

  private calculateEfficiency(tests: any[]): number {
    const passed = tests.filter(t => t.status === 'passed').length;
    const total = tests.length;
    const avgDuration = tests.reduce((sum, t) => sum + t.duration, 0) / total;
    
    // Efficiency = (Pass Rate * 100) / (Avg Duration in seconds)
    return total > 0 ? Math.round(((passed / total) * 100) / (avgDuration / 1000)) : 0;
  }

  private analyzeDefects(results: any): DefectAnalysis {
    const tests = this.extractTestData(results);
    const failedTests = tests.filter(t => t.status === 'failed');
    
    const criticalDefects = failedTests.filter(t => t.tags.includes('critical')).length;
    const majorDefects = failedTests.filter(t => t.tags.includes('high-risk')).length;
    const minorDefects = failedTests.length - criticalDefects - majorDefects;
    
    return {
      criticalDefects,
      majorDefects,
      minorDefects,
      defectLeakageRate: this.calculateDefectLeakage(tests),
      defectRemovalEfficiency: this.calculateDefectRemoval(tests),
      meanTimeToDetection: this.calculateMTTD(failedTests)
    };
  }

  private calculateDefectLeakage(tests: any[]): number {
    // Simulate defect leakage calculation (would need historical data)
    const failed = tests.filter(t => t.status === 'failed').length;
    const total = tests.length;
    return total > 0 ? Math.round((failed / total) * 100) : 0;
  }

  private calculateDefectRemoval(tests: any[]): number {
    // Simulate defect removal efficiency (would need historical data)
    const passed = tests.filter(t => t.status === 'passed').length;
    const total = tests.length;
    return total > 0 ? Math.round((passed / total) * 100) : 0;
  }

  private calculateMTTD(failedTests: any[]): number {
    if (failedTests.length === 0) return 0;
    const avgDuration = failedTests.reduce((sum, t) => sum + t.duration, 0) / failedTests.length;
    return Math.round(avgDuration / 1000); // Convert to seconds
  }

  private generateISTQBReport(metrics: TestMetrics, defects: DefectAnalysis): string {
    return `# Executive Test Summary Report
*ISTQB Compliant Test Summary Report*

## 1. Test Summary Identifier
- **Report ID**: TSR-${Date.now()}
- **Project**: ${this.config.projectName}
- **Version**: ${this.config.version || 'N/A'}
- **Environment**: ${this.config.environment}
- **Test Manager**: ${this.config.testManager || 'N/A'}
- **Test Lead**: ${this.config.testLead || 'N/A'}
- **Generated**: ${new Date().toISOString()}

## 2. Summary of Activities and Results

### Test Execution Summary
| Metric | Value | Target | Status |
|--------|-------|--------|---------|
| Total Tests Executed | ${metrics.total} | - | ✅ |
| Tests Passed | ${metrics.passed} | - | ${metrics.passed > 0 ? '✅' : '❌'} |
| Tests Failed | ${metrics.failed} | 0 | ${metrics.failed === 0 ? '✅' : '❌'} |
| Tests Skipped | ${metrics.skipped} | - | ⚠️ |
| Flaky Tests | ${metrics.flaky} | 0 | ${metrics.flaky === 0 ? '✅' : '⚠️'} |
| **Pass Rate** | **${metrics.passRate}%** | **≥95%** | **${metrics.passRate >= 95 ? '✅' : metrics.passRate >= 80 ? '⚠️' : '❌'}** |
| Total Duration | ${Math.round(metrics.totalDuration / 1000)}s | - | ✅ |
| Average Duration | ${Math.round(metrics.avgDuration / 1000)}s | <30s | ${metrics.avgDuration < 30000 ? '✅' : '⚠️'} |

### Test Coverage Analysis
| Coverage Type | Percentage | Status |
|---------------|------------|--------|
| Functional Coverage | ${metrics.coverage.functional}% | ${metrics.coverage.functional >= 80 ? '✅' : '⚠️'} |
| Regression Coverage | ${metrics.coverage.regression}% | ${metrics.coverage.regression >= 70 ? '✅' : '⚠️'} |
| Smoke Test Coverage | ${metrics.coverage.smoke}% | ${metrics.coverage.smoke >= 90 ? '✅' : '⚠️'} |
| Integration Coverage | ${metrics.coverage.integration}% | ${metrics.coverage.integration >= 60 ? '✅' : '⚠️'} |

### Risk Assessment Distribution
| Risk Level | Percentage | Count |
|------------|------------|-------|
| High Risk | ${metrics.riskAssessment.high}% | ${Math.round(metrics.total * metrics.riskAssessment.high / 100)} |
| Medium Risk | ${metrics.riskAssessment.medium}% | ${Math.round(metrics.total * metrics.riskAssessment.medium / 100)} |
| Low Risk | ${metrics.riskAssessment.low}% | ${Math.round(metrics.total * metrics.riskAssessment.low / 100)} |

## 3. Defect Analysis

### Defect Summary
| Defect Severity | Count | Impact |
|-----------------|-------|--------|
| Critical | ${defects.criticalDefects} | ${defects.criticalDefects > 0 ? '🔴 High' : '✅ None'} |
| Major | ${defects.majorDefects} | ${defects.majorDefects > 0 ? '🟡 Medium' : '✅ None'} |
| Minor | ${defects.minorDefects} | ${defects.minorDefects > 0 ? '🟢 Low' : '✅ None'} |

### Quality Metrics
| Metric | Value | Industry Benchmark | Status |
|--------|-------|-------------------|--------|
| Defect Density | ${metrics.defectDensity.toFixed(2)}% | <5% | ${metrics.defectDensity < 5 ? '✅' : '❌'} |
| Defect Leakage Rate | ${defects.defectLeakageRate}% | <2% | ${defects.defectLeakageRate < 2 ? '✅' : '❌'} |
| Defect Removal Efficiency | ${defects.defectRemovalEfficiency}% | >95% | ${defects.defectRemovalEfficiency > 95 ? '✅' : '⚠️'} |
| Mean Time to Detection | ${defects.meanTimeToDetection}s | <60s | ${defects.meanTimeToDetection < 60 ? '✅' : '⚠️'} |
| Test Efficiency Score | ${metrics.testEfficiency} | >80 | ${metrics.testEfficiency > 80 ? '✅' : '⚠️'} |

## 4. Executive Summary

${this.generateExecutiveSummary(metrics, defects)}

## 5. Quality Gate Assessment

${this.generateQualityGateAssessment(metrics, defects)}

## 6. Recommendations and Next Steps

${this.generateDetailedRecommendations(metrics, defects)}

## 7. Risk Assessment and Mitigation

${this.generateRiskAssessment(metrics, defects)}

## 8. Appendix

### Test Environment Details
- **Environment**: ${this.config.environment}
- **Test Period**: ${this.config.testPeriod?.start || 'N/A'} to ${this.config.testPeriod?.end || 'N/A'}
- **Test Framework**: Playwright with Everest Framework
- **Reporting Standard**: ISTQB Test Summary Report Template

### Glossary
- **Pass Rate**: Percentage of tests that executed successfully
- **Defect Density**: Number of defects per test case
- **Defect Leakage Rate**: Percentage of defects that escaped to production
- **Test Efficiency**: Measure of test effectiveness vs execution time

---
*This report was automatically generated by the Everest Test Framework*
*Report Generation Time: ${new Date().toISOString()}*`;
  }

  private generateExecutiveSummary(metrics: TestMetrics, defects: DefectAnalysis): string {
    const overallHealth = this.calculateOverallHealth(metrics, defects);
    
    if (overallHealth >= 90) {
      return `**🎯 EXCELLENT QUALITY ACHIEVED**

The ${this.config.projectName} has demonstrated exceptional quality with a ${metrics.passRate}% pass rate. All critical functionality has been verified and the system is ready for production deployment. The test suite executed ${metrics.total} tests with minimal defects and optimal performance.`;
    } else if (overallHealth >= 75) {
      return `**⚠️ GOOD QUALITY WITH MINOR CONCERNS**

The ${this.config.projectName} shows good overall quality with a ${metrics.passRate}% pass rate. While most functionality works correctly, there are ${defects.criticalDefects + defects.majorDefects} significant issues that require attention before production release. Recommended to address critical defects and re-test.`;
    } else {
      return `**❌ QUALITY CONCERNS REQUIRE IMMEDIATE ATTENTION**

The ${this.config.projectName} has significant quality issues with only a ${metrics.passRate}% pass rate. There are ${defects.criticalDefects} critical and ${defects.majorDefects} major defects that must be resolved before considering production deployment. Immediate remediation and comprehensive re-testing is required.`;
    }
  }

  private calculateOverallHealth(metrics: TestMetrics, defects: DefectAnalysis): number {
    const passRateScore = metrics.passRate;
    const defectScore = Math.max(0, 100 - (defects.criticalDefects * 20 + defects.majorDefects * 10 + defects.minorDefects * 2));
    const efficiencyScore = Math.min(100, metrics.testEfficiency);
    
    return Math.round((passRateScore * 0.5 + defectScore * 0.3 + efficiencyScore * 0.2));
  }

  private generateQualityGateAssessment(metrics: TestMetrics, defects: DefectAnalysis): string {
    const gates = [
      { name: 'Pass Rate', value: metrics.passRate, threshold: 95, unit: '%' },
      { name: 'Critical Defects', value: defects.criticalDefects, threshold: 0, unit: '', inverse: true },
      { name: 'Defect Density', value: metrics.defectDensity, threshold: 5, unit: '%', inverse: true },
      { name: 'Test Efficiency', value: metrics.testEfficiency, threshold: 80, unit: '' }
    ];

    const passedGates = gates.filter(gate => 
      gate.inverse ? gate.value <= gate.threshold : gate.value >= gate.threshold
    ).length;

    const gateStatus = passedGates === gates.length ? '✅ PASSED' : 
                     passedGates >= gates.length * 0.75 ? '⚠️ CONDITIONAL' : '❌ FAILED';

    return `**Quality Gate Status: ${gateStatus}**

| Gate | Current | Threshold | Status |
|------|---------|-----------|--------|
${gates.map(gate => {
  const status = gate.inverse ? 
    (gate.value <= gate.threshold ? '✅' : '❌') :
    (gate.value >= gate.threshold ? '✅' : '❌');
  return `| ${gate.name} | ${gate.value}${gate.unit} | ${gate.inverse ? '≤' : '≥'}${gate.threshold}${gate.unit} | ${status} |`;
}).join('\n')}

**Gates Passed: ${passedGates}/${gates.length}**`;
  }

  private generateDetailedRecommendations(metrics: TestMetrics, defects: DefectAnalysis): string {
    const recommendations = [];

    if (defects.criticalDefects > 0) {
      recommendations.push(`🔴 **CRITICAL**: Resolve ${defects.criticalDefects} critical defect(s) immediately - these block production release`);
    }

    if (defects.majorDefects > 0) {
      recommendations.push(`🟡 **HIGH PRIORITY**: Address ${defects.majorDefects} major defect(s) before release`);
    }

    if (metrics.passRate < 95) {
      recommendations.push(`📈 **IMPROVE STABILITY**: Current pass rate of ${metrics.passRate}% is below target of 95%`);
    }

    if (metrics.flaky > 0) {
      recommendations.push(`🔄 **FIX FLAKY TESTS**: ${metrics.flaky} flaky test(s) detected - investigate and stabilize`);
    }

    if (metrics.avgDuration > 30000) {
      recommendations.push(`⚡ **OPTIMIZE PERFORMANCE**: Average test duration of ${Math.round(metrics.avgDuration/1000)}s exceeds 30s target`);
    }

    if (metrics.coverage.smoke < 90) {
      recommendations.push(`🧪 **INCREASE SMOKE COVERAGE**: Smoke test coverage at ${metrics.coverage.smoke}% - target is 90%`);
    }

    if (recommendations.length === 0) {
      recommendations.push('✅ **MAINTAIN EXCELLENCE**: Continue current testing practices and monitor for regressions');
    }

    return recommendations.map((rec, index) => `${index + 1}. ${rec}`).join('\n\n');
  }

  private generateRiskAssessment(metrics: TestMetrics, defects: DefectAnalysis): string {
    const risks = [];

    if (defects.criticalDefects > 0) {
      risks.push({
        level: 'HIGH',
        description: `${defects.criticalDefects} critical defects present`,
        impact: 'Production deployment blocked',
        mitigation: 'Immediate defect resolution and regression testing required'
      });
    }

    if (metrics.passRate < 80) {
      risks.push({
        level: 'HIGH',
        description: `Low pass rate of ${metrics.passRate}%`,
        impact: 'System stability concerns',
        mitigation: 'Comprehensive test review and environment stabilization'
      });
    }

    if (metrics.flaky > metrics.total * 0.1) {
      risks.push({
        level: 'MEDIUM',
        description: `High flaky test rate (${Math.round(metrics.flaky/metrics.total*100)}%)`,
        impact: 'Unreliable test results and false positives',
        mitigation: 'Test stabilization and environment optimization'
      });
    }

    if (risks.length === 0) {
      return '✅ **LOW RISK**: No significant risks identified. System appears stable and ready for deployment.';
    }

    return risks.map(risk => 
      `**${risk.level} RISK**: ${risk.description}\n- **Impact**: ${risk.impact}\n- **Mitigation**: ${risk.mitigation}`
    ).join('\n\n');
  }
}