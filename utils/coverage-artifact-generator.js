const fs = require('fs');
const path = require('path');

class CoverageArtifactGenerator {
  constructor() {
    this.outputDir = path.join(process.cwd(), 'reports', 'coverage');
    this.ensureOutputDir();
  }

  ensureOutputDir() {
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  async generateCoverageArtifacts(testResults) {
    const coverage = this.analyzeCoverage(testResults);
    
    // Generate multiple artifact formats
    await Promise.all([
      this.generateJSONArtifact(coverage),
      this.generateMarkdownArtifact(coverage),
      this.generateCSVArtifact(coverage),
      this.generateDashboardData(coverage)
    ]);

    return coverage;
  }

  analyzeCoverage(results) {
    const tests = this.extractTestData(results);
    
    const featureCoverage = this.analyzeFeatureCoverage(tests);
    const conditionCoverage = this.analyzeConditionCoverage(tests);
    const businessImpact = this.analyzeBusinessImpact(tests);
    const riskAssessment = this.analyzeRiskCoverage(tests);

    return {
      timestamp: new Date().toISOString(),
      summary: {
        totalTests: tests.length,
        totalFeatures: Object.keys(featureCoverage).length,
        totalConditions: Object.keys(conditionCoverage).length,
        overallCoverage: this.calculateOverallCoverage(tests)
      },
      featureCoverage,
      conditionCoverage,
      businessImpact,
      riskAssessment,
      detailedTests: tests
    };
  }

  extractTestData(results) {
    if (!results || !results.suites) return [];
    
    return results.suites.flatMap(suite => 
      suite.specs?.flatMap(spec => 
        spec.tests?.map(test => {
          const featureMatch = spec.title.match(/\[FEATURE:([^\]]+)\]/);
          const conditionMatch = spec.title.match(/\[CONDITION:([^\]]+)\]/);
          
          return {
            testId: spec.title.match(/TC-\d+/)?.[0] || 'Unknown',
            title: spec.title,
            feature: featureMatch ? featureMatch[1] : this.extractFeatureFromTitle(spec.title),
            condition: conditionMatch ? conditionMatch[1] : 'Standard',
            status: test.results?.[0]?.status || 'unknown',
            duration: test.results?.[0]?.duration || 0,
            file: spec.file,
            businessCritical: this.isBusinessCritical(spec.title),
            riskLevel: this.assessRiskLevel(spec.title),
            tags: this.extractTags(spec.title)
          };
        })
      ) || []
    ) || [];
  }

  extractFeatureFromTitle(title) {
    if (title.includes('@search')) return 'Search';
    if (title.includes('@plp')) return 'PLP';
    if (title.includes('@pdp')) return 'PDP';
    if (title.includes('@cart')) return 'Cart';
    if (title.includes('@responsive')) return 'Responsive';
    if (title.includes('@performance')) return 'Performance';
    if (title.includes('@mobile')) return 'Mobile';
    if (title.includes('@login')) return 'Authentication';
    return 'General';
  }

  isBusinessCritical(title) {
    return title.includes('business-impact') || 
           title.includes('@cart') || 
           title.includes('@pdp') || 
           title.includes('revenue');
  }

  assessRiskLevel(title) {
    if (title.includes('critical') || title.includes('@cart')) return 'High';
    if (title.includes('@performance') || title.includes('@mobile')) return 'Medium';
    return 'Low';
  }

  extractTags(title) {
    const tags = [];
    if (title.includes('@smoke')) tags.push('smoke');
    if (title.includes('@regression')) tags.push('regression');
    if (title.includes('@mobile')) tags.push('mobile');
    if (title.includes('@performance')) tags.push('performance');
    return tags;
  }

  analyzeFeatureCoverage(tests) {
    const features = {};
    
    tests.forEach(test => {
      if (!features[test.feature]) {
        features[test.feature] = {
          totalTests: 0,
          passedTests: 0,
          failedTests: 0,
          conditions: new Set(),
          businessCritical: false,
          riskLevels: new Set()
        };
      }
      
      features[test.feature].totalTests++;
      if (test.status === 'passed') features[test.feature].passedTests++;
      if (test.status === 'failed') features[test.feature].failedTests++;
      features[test.feature].conditions.add(test.condition);
      if (test.businessCritical) features[test.feature].businessCritical = true;
      features[test.feature].riskLevels.add(test.riskLevel);
    });

    // Convert Sets to Arrays for JSON serialization
    Object.keys(features).forEach(feature => {
      features[feature].conditions = Array.from(features[feature].conditions);
      features[feature].riskLevels = Array.from(features[feature].riskLevels);
      features[feature].coverage = Math.round((features[feature].passedTests / features[feature].totalTests) * 100);
    });

    return features;
  }

  analyzeConditionCoverage(tests) {
    const conditions = {};
    
    tests.forEach(test => {
      if (!conditions[test.condition]) {
        conditions[test.condition] = {
          totalTests: 0,
          passedTests: 0,
          features: new Set(),
          avgDuration: 0,
          totalDuration: 0
        };
      }
      
      conditions[test.condition].totalTests++;
      if (test.status === 'passed') conditions[test.condition].passedTests++;
      conditions[test.condition].features.add(test.feature);
      conditions[test.condition].totalDuration += test.duration;
    });

    Object.keys(conditions).forEach(condition => {
      conditions[condition].features = Array.from(conditions[condition].features);
      conditions[condition].avgDuration = Math.round(conditions[condition].totalDuration / conditions[condition].totalTests);
      conditions[condition].coverage = Math.round((conditions[condition].passedTests / conditions[condition].totalTests) * 100);
    });

    return conditions;
  }

  analyzeBusinessImpact(tests) {
    const businessCriticalTests = tests.filter(t => t.businessCritical);
    const totalBusinessTests = businessCriticalTests.length;
    const passedBusinessTests = businessCriticalTests.filter(t => t.status === 'passed').length;

    return {
      totalBusinessCriticalTests: totalBusinessTests,
      passedBusinessCriticalTests: passedBusinessTests,
      businessCriticalCoverage: totalBusinessTests > 0 ? Math.round((passedBusinessTests / totalBusinessTests) * 100) : 0,
      revenueRisk: totalBusinessTests > 0 ? (totalBusinessTests - passedBusinessTests) * 10 : 0 // Risk score
    };
  }

  analyzeRiskCoverage(tests) {
    const riskLevels = { High: 0, Medium: 0, Low: 0 };
    const riskCoverage = { High: 0, Medium: 0, Low: 0 };

    tests.forEach(test => {
      riskLevels[test.riskLevel]++;
      if (test.status === 'passed') {
        riskCoverage[test.riskLevel]++;
      }
    });

    return {
      distribution: riskLevels,
      coverage: {
        High: riskLevels.High > 0 ? Math.round((riskCoverage.High / riskLevels.High) * 100) : 0,
        Medium: riskLevels.Medium > 0 ? Math.round((riskCoverage.Medium / riskLevels.Medium) * 100) : 0,
        Low: riskLevels.Low > 0 ? Math.round((riskCoverage.Low / riskLevels.Low) * 100) : 0
      }
    };
  }

  calculateOverallCoverage(tests) {
    const passed = tests.filter(t => t.status === 'passed').length;
    return tests.length > 0 ? Math.round((passed / tests.length) * 100) : 0;
  }

  async generateJSONArtifact(coverage) {
    const filePath = path.join(this.outputDir, 'coverage-report.json');
    fs.writeFileSync(filePath, JSON.stringify(coverage, null, 2));
    return filePath;
  }

  async generateMarkdownArtifact(coverage) {
    const markdown = this.generateMarkdownReport(coverage);
    const filePath = path.join(this.outputDir, 'coverage-report.md');
    fs.writeFileSync(filePath, markdown);
    return filePath;
  }

  generateMarkdownReport(coverage) {
    return `# Test Coverage Report

Generated: ${coverage.timestamp}

## Summary
- **Total Tests**: ${coverage.summary.totalTests}
- **Total Features**: ${coverage.summary.totalFeatures}
- **Total Conditions**: ${coverage.summary.totalConditions}
- **Overall Coverage**: ${coverage.summary.overallCoverage}%

## Feature Coverage

| Feature | Tests | Passed | Failed | Coverage | Conditions | Business Critical |
|---------|-------|--------|--------|----------|------------|-------------------|
${Object.entries(coverage.featureCoverage).map(([feature, data]) => 
  `| ${feature} | ${data.totalTests} | ${data.passedTests} | ${data.failedTests} | ${data.coverage}% | ${data.conditions.join(', ')} | ${data.businessCritical ? '✅' : '❌'} |`
).join('\n')}

## Condition Coverage

| Condition | Tests | Coverage | Features | Avg Duration |
|-----------|-------|----------|----------|--------------|
${Object.entries(coverage.conditionCoverage).map(([condition, data]) => 
  `| ${condition} | ${data.totalTests} | ${data.coverage}% | ${data.features.join(', ')} | ${data.avgDuration}ms |`
).join('\n')}

## Business Impact Analysis

- **Business Critical Tests**: ${coverage.businessImpact.totalBusinessCriticalTests}
- **Business Critical Coverage**: ${coverage.businessImpact.businessCriticalCoverage}%
- **Revenue Risk Score**: ${coverage.businessImpact.revenueRisk}

## Risk Assessment

| Risk Level | Tests | Coverage |
|------------|-------|----------|
| High | ${coverage.riskAssessment.distribution.High} | ${coverage.riskAssessment.coverage.High}% |
| Medium | ${coverage.riskAssessment.distribution.Medium} | ${coverage.riskAssessment.coverage.Medium}% |
| Low | ${coverage.riskAssessment.distribution.Low} | ${coverage.riskAssessment.coverage.Low}% |
`;
  }

  async generateCSVArtifact(coverage) {
    const csvData = this.generateCSVData(coverage);
    const filePath = path.join(this.outputDir, 'coverage-report.csv');
    fs.writeFileSync(filePath, csvData);
    return filePath;
  }

  generateCSVData(coverage) {
    const headers = 'TestID,Feature,Condition,Status,Duration,BusinessCritical,RiskLevel,File\n';
    const rows = coverage.detailedTests.map(test => 
      `${test.testId},${test.feature},${test.condition},${test.status},${test.duration},${test.businessCritical},${test.riskLevel},"${test.file}"`
    ).join('\n');
    
    return headers + rows;
  }

  async generateDashboardData(coverage) {
    const dashboardData = {
      timestamp: coverage.timestamp,
      metrics: {
        totalTests: coverage.summary.totalTests,
        overallCoverage: coverage.summary.overallCoverage,
        featureCount: coverage.summary.totalFeatures,
        conditionCount: coverage.summary.totalConditions,
        businessCriticalCoverage: coverage.businessImpact.businessCriticalCoverage,
        highRiskCoverage: coverage.riskAssessment.coverage.High
      },
      features: coverage.featureCoverage,
      conditions: coverage.conditionCoverage
    };

    const filePath = path.join(this.outputDir, 'dashboard-data.json');
    fs.writeFileSync(filePath, JSON.stringify(dashboardData, null, 2));
    return filePath;
  }
}

module.exports = CoverageArtifactGenerator;