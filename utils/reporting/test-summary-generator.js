const fs = require('fs');
const path = require('path');

class TestSummaryGenerator {
  constructor(config) {
    this.config = config;
    this.startTime = new Date();
    this.endTime = new Date();
  }

  async generateSummary(results) {
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
    fs.writeFileSync(latestPath, report);
    
    // Generate JSON version for dashboard integration with current timestamp
    const jsonReport = {
      timestamp: new Date().toISOString(),
      config: this.config,
      metrics,
      defects,
      summary: this.generateExecutiveSummary(metrics, defects)
    };
    
    // Write to multiple locations for dashboard pickup
    const jsonPaths = [
      path.join(this.config.outputDir, 'test-summary.json'),
      path.join(process.cwd(), 'test-results', 'latest-results.json')
    ];
    
    jsonPaths.forEach(jsonPath => {
      const dir = path.dirname(jsonPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(jsonPath, JSON.stringify(jsonReport, null, 2));
    });
    
    return outputPath;
  }

  buildTestMetrics(results) {
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

  extractTestData(results) {
    if (!results || !results.suites) return [];
    
    return results.suites.flatMap(suite => 
      suite.specs?.flatMap(spec => 
        spec.tests?.map(test => {
          // Enhanced feature and condition extraction
          const featureMatch = spec.title.match(/\[FEATURE:([^\]]+)\]/);
          const conditionMatch = spec.title.match(/\[CONDITION:([^\]]+)\]/);
          
          return {
            title: spec.title,
            status: test.results?.[0]?.status || 'unknown',
            duration: test.results?.[0]?.duration || 0,
            file: spec.file,
            retry: test.results?.[0]?.retry || 0,
            error: test.results?.[0]?.error,
            annotations: test.annotations || [],
            tags: this.extractTags(spec.title, spec.file),
            feature: featureMatch ? featureMatch[1] : this.extractFeatureFromTitle(spec.title),
            condition: conditionMatch ? conditionMatch[1] : 'Standard',
            testId: spec.title.match(/TC-\d+/)?.[0] || 'Unknown',
            businessCritical: this.isBusinessCritical(spec.title),
            performanceTest: spec.title.includes('@performance'),
            mobileTest: spec.title.includes('@mobile')
          };
        })
      ) || []
    ) || [];
  }
  
  extractFeatureFromTitle(title) {
    if (title.includes('@search')) return 'Search & Discovery';
    if (title.includes('@plp')) return 'Product Listing';
    if (title.includes('@pdp')) return 'Product Details';
    if (title.includes('@cart')) return 'Shopping Cart';
    if (title.includes('@responsive')) return 'Responsive Design';
    if (title.includes('@performance')) return 'Performance';
    if (title.includes('@mobile')) return 'Mobile Experience';
    if (title.includes('@login')) return 'Authentication';
    return 'General Functionality';
  }
  
  isBusinessCritical(title) {
    return title.includes('business-impact') || 
           title.includes('@cart') || 
           title.includes('@pdp') || 
           title.includes('revenue');
  }

  extractTags(title, file) {
    const tags = [];
    if (file.includes('smoke')) tags.push('smoke');
    if (file.includes('regression')) tags.push('regression');
    if (file.includes('integration')) tags.push('integration');
    if (title.toLowerCase().includes('critical')) tags.push('critical');
    if (title.toLowerCase().includes('high')) tags.push('high-risk');
    return tags;
  }

  calculateCoverage(tests) {
    const total = tests.length;
    if (total === 0) return { 
      functional: 0, regression: 0, smoke: 0, integration: 0,
      mobile: 0, performance: 0, businessCritical: 0
    };
    
    return {
      functional: Math.round((tests.filter(t => t.tags.includes('functional')).length / total) * 100),
      regression: Math.round((tests.filter(t => t.tags.includes('regression')).length / total) * 100),
      smoke: Math.round((tests.filter(t => t.tags.includes('smoke')).length / total) * 100),
      integration: Math.round((tests.filter(t => t.tags.includes('integration')).length / total) * 100),
      mobile: Math.round((tests.filter(t => t.mobileTest).length / total) * 100),
      performance: Math.round((tests.filter(t => t.performanceTest).length / total) * 100),
      businessCritical: Math.round((tests.filter(t => t.businessCritical).length / total) * 100)
    };
  }

  assessRisk(tests) {
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

  calculateEfficiency(tests) {
    const passed = tests.filter(t => t.status === 'passed').length;
    const total = tests.length;
    const avgDuration = tests.reduce((sum, t) => sum + t.duration, 0) / total;
    
    return total > 0 ? Math.round(((passed / total) * 100) / (avgDuration / 1000)) : 0;
  }

  analyzeDefects(results) {
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

  calculateDefectLeakage(tests) {
    const failed = tests.filter(t => t.status === 'failed').length;
    const total = tests.length;
    return total > 0 ? Math.round((failed / total) * 100) : 0;
  }

  calculateDefectRemoval(tests) {
    const passed = tests.filter(t => t.status === 'passed').length;
    const total = tests.length;
    return total > 0 ? Math.round((passed / total) * 100) : 0;
  }

  calculateMTTD(failedTests) {
    if (failedTests.length === 0) return 0;
    const avgDuration = failedTests.reduce((sum, t) => sum + t.duration, 0) / failedTests.length;
    return Math.round(avgDuration / 1000);
  }

  generateISTQBReport(metrics, defects) {
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

## 3. Executive Summary

${this.generateExecutiveSummary(metrics, defects)}

## 4. Quality Gate Assessment

${this.generateQualityGateAssessment(metrics, defects)}

## 5. Recommendations

${this.generateDetailedRecommendations(metrics, defects)}

---
*This report was automatically generated by the Everest Test Framework*
*Report Generation Time: ${new Date().toISOString()}*`;
  }

  generateExecutiveSummary(metrics, defects) {
    const overallHealth = this.calculateOverallHealth(metrics, defects);
    
    if (overallHealth >= 90) {
      return `**🎯 EXCELLENT QUALITY ACHIEVED**

The ${this.config.projectName} has demonstrated exceptional quality with a ${metrics.passRate}% pass rate. All critical functionality has been verified and the system is ready for production deployment.`;
    } else if (overallHealth >= 75) {
      return `**⚠️ GOOD QUALITY WITH MINOR CONCERNS**

The ${this.config.projectName} shows good overall quality with a ${metrics.passRate}% pass rate. There are ${defects.criticalDefects + defects.majorDefects} issues that require attention before production release.`;
    } else {
      return `**❌ QUALITY CONCERNS REQUIRE IMMEDIATE ATTENTION**

The ${this.config.projectName} has significant quality issues with only a ${metrics.passRate}% pass rate. Immediate remediation and comprehensive re-testing is required.`;
    }
  }

  calculateOverallHealth(metrics, defects) {
    const passRateScore = metrics.passRate;
    const defectScore = Math.max(0, 100 - (defects.criticalDefects * 20 + defects.majorDefects * 10 + defects.minorDefects * 2));
    const efficiencyScore = Math.min(100, metrics.testEfficiency);
    
    return Math.round((passRateScore * 0.5 + defectScore * 0.3 + efficiencyScore * 0.2));
  }

  generateQualityGateAssessment(metrics, defects) {
    const gates = [
      { name: 'Pass Rate', value: metrics.passRate, threshold: 95, unit: '%' },
      { name: 'Critical Defects', value: defects.criticalDefects, threshold: 0, unit: '', inverse: true },
      { name: 'Defect Density', value: metrics.defectDensity, threshold: 5, unit: '%', inverse: true }
    ];

    const passedGates = gates.filter(gate => 
      gate.inverse ? gate.value <= gate.threshold : gate.value >= gate.threshold
    ).length;

    const gateStatus = passedGates === gates.length ? '✅ PASSED' : 
                     passedGates >= gates.length * 0.75 ? '⚠️ CONDITIONAL' : '❌ FAILED';

    return `**Quality Gate Status: ${gateStatus}**

**Gates Passed: ${passedGates}/${gates.length}**`;
  }

  generateDetailedRecommendations(metrics, defects) {
    const recommendations = [];

    if (defects.criticalDefects > 0) {
      recommendations.push(`🔴 **CRITICAL**: Resolve ${defects.criticalDefects} critical defect(s) immediately`);
    }

    if (metrics.passRate < 95) {
      recommendations.push(`📈 **IMPROVE STABILITY**: Current pass rate of ${metrics.passRate}% is below target of 95%`);
    }

    if (metrics.flaky > 0) {
      recommendations.push(`🔄 **FIX FLAKY TESTS**: ${metrics.flaky} flaky test(s) detected`);
    }

    if (recommendations.length === 0) {
      recommendations.push('✅ **MAINTAIN EXCELLENCE**: Continue current testing practices');
    }

    return recommendations.map((rec, index) => `${index + 1}. ${rec}`).join('\n\n');
  }
}

module.exports = TestSummaryGenerator;