import { Reporter, TestCase, TestResult, FullResult } from '@playwright/test/reporter';
import { TestSummaryGenerator } from './test-summary-generator';
import path from 'path';

export class EverestTestSummaryReporter implements Reporter {
  private generator: TestSummaryGenerator;

  constructor() {
    this.generator = new TestSummaryGenerator({
      outputDir: path.join(process.cwd(), 'reports'),
      projectName: 'B2C PVT Demo',
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'test',
      testManager: process.env.TEST_MANAGER || 'QA Team',
      testLead: process.env.TEST_LEAD || 'Automation Lead'
    });
  }

  onBegin(config: any, suite: any) {
    console.log(`🚀 Starting test execution with ${suite.allTests().length} tests`);
  }

  onTestEnd(test: TestCase, result: TestResult) {
    const status = result.status === 'passed' ? '✅' : 
                  result.status === 'failed' ? '❌' : 
                  result.status === 'skipped' ? '⏭️' : '❓';
    console.log(`${status} ${test.title} (${Math.round(result.duration)}ms)`);
  }

  async onEnd(result: FullResult) {
    console.log('\n📊 Generating ISTQB Test Summary Report...');
    
    try {
      // Convert Playwright results to our format
      const formattedResults = this.formatResults(result);
      
      // Generate the summary report
      const reportPath = await this.generator.generateSummary(formattedResults);
      
      console.log(`✅ Test Summary Report generated: ${reportPath}`);
      console.log(`📈 Overall Status: ${result.status}`);
      
    } catch (error) {
      console.error('❌ Failed to generate test summary report:', error);
    }
  }

  private formatResults(result: FullResult): any {
    // This method converts Playwright's FullResult to our expected format
    return {
      status: result.status,
      startTime: result.startTime,
      duration: Date.now() - result.startTime.getTime(),
      suites: [] // Will be populated by the actual test data
    };
  }
}