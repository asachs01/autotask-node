import * as fs from 'fs';
import * as path from 'path';
import { TestEnvironment } from '../framework/TestEnvironment';
import { PerformanceMetrics } from '../framework/PerformanceTester';

/**
 * Test result summary
 */
export interface TestResultSummary {
  testSuite: string;
  environment: string;
  timestamp: string;
  duration: number;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  skippedTests: number;
  successRate: number;
  errors: TestError[];
  warnings: string[];
  performanceMetrics?: PerformanceMetrics[];
  coverageReport?: EntityCoverageReport;
}

/**
 * Test error details
 */
export interface TestError {
  testName: string;
  error: string;
  stack?: string;
  timestamp: string;
}

/**
 * Entity coverage report
 */
export interface EntityCoverageReport {
  totalEntities: number;
  testedEntities: number;
  coveragePercentage: number;
  entityDetails: EntityTestDetails[];
}

/**
 * Entity test details
 */
export interface EntityTestDetails {
  entityName: string;
  operations: {
    list: boolean;
    get: boolean;
    create: boolean;
    update: boolean;
    delete: boolean;
  };
  businessLogicTested: boolean;
  performanceTested: boolean;
}

/**
 * Test reporter for integration tests
 */
export class TestReporter {
  private testEnvironment: TestEnvironment;
  private reportDir: string;
  private results: TestResultSummary[] = [];

  constructor(testEnvironment: TestEnvironment, reportDir: string = './test/integration/reports') {
    this.testEnvironment = testEnvironment;
    this.reportDir = reportDir;
    this.ensureReportDirectory();
  }

  /**
   * Ensure report directory exists
   */
  private ensureReportDirectory(): void {
    if (!fs.existsSync(this.reportDir)) {
      fs.mkdirSync(this.reportDir, { recursive: true });
    }
  }

  /**
   * Record test result
   */
  recordTestResult(result: TestResultSummary): void {
    this.results.push(result);
  }

  /**
   * Generate comprehensive test report
   */
  async generateReport(): Promise<string> {
    const reportData = {
      generatedAt: new Date().toISOString(),
      environment: {
        type: this.testEnvironment.getConfig().type,
        testSession: this.testEnvironment.getTestSession(),
      },
      summary: this.generateSummary(),
      detailedResults: this.results,
      performanceAnalysis: this.analyzePerformance(),
      entityCoverage: this.generateEntityCoverage(),
      createdEntities: this.getCreatedEntitiesSummary(),
      recommendations: this.generateRecommendations(),
    };

    // Generate different report formats
    await this.saveJsonReport(reportData);
    await this.saveHtmlReport(reportData);
    const markdownReport = await this.generateMarkdownReport(reportData);
    await this.saveMarkdownReport(markdownReport);

    return markdownReport;
  }

  /**
   * Generate test summary
   */
  private generateSummary() {
    const totalTests = this.results.reduce((sum, result) => sum + result.totalTests, 0);
    const passedTests = this.results.reduce((sum, result) => sum + result.passedTests, 0);
    const failedTests = this.results.reduce((sum, result) => sum + result.failedTests, 0);
    const skippedTests = this.results.reduce((sum, result) => sum + result.skippedTests, 0);
    const totalDuration = this.results.reduce((sum, result) => sum + result.duration, 0);
    const allErrors = this.results.flatMap(result => result.errors);
    const allWarnings = this.results.flatMap(result => result.warnings);

    return {
      totalTests,
      passedTests,
      failedTests,
      skippedTests,
      successRate: totalTests > 0 ? (passedTests / totalTests) * 100 : 0,
      totalDuration,
      errorCount: allErrors.length,
      warningCount: allWarnings.length,
      testSuites: this.results.length,
    };
  }

  /**
   * Analyze performance metrics
   */
  private analyzePerformance() {
    const allMetrics = this.results
      .filter(result => result.performanceMetrics)
      .flatMap(result => result.performanceMetrics!);

    if (allMetrics.length === 0) {
      return { message: 'No performance metrics collected' };
    }

    const averageResponseTime = allMetrics.reduce((sum, metric) => sum + metric.averageResponseTime, 0) / allMetrics.length;
    const totalThroughput = allMetrics.reduce((sum, metric) => sum + metric.throughput, 0);
    const errorRate = allMetrics.reduce((sum, metric) => sum + metric.errorCount, 0) / 
                     allMetrics.reduce((sum, metric) => sum + metric.requestCount, 0);

    return {
      averageResponseTime: Math.round(averageResponseTime),
      totalThroughput: Math.round(totalThroughput * 100) / 100,
      errorRate: Math.round(errorRate * 10000) / 100, // Percentage
      totalRequests: allMetrics.reduce((sum, metric) => sum + metric.requestCount, 0),
      operationTypes: [...new Set(allMetrics.map(metric => metric.operationType))],
    };
  }

  /**
   * Generate entity coverage report
   */
  private generateEntityCoverage(): EntityCoverageReport {
    const coreEntities = [
      'tickets', 'accounts', 'contacts', 'projects', 'tasks', 'timeentries',
      'resources', 'roles', 'companies', 'opportunities', 'quotes', 'contracts'
    ];

    const testedEntities = new Set<string>();
    const entityDetails: EntityTestDetails[] = [];

    // Analyze which entities were tested based on test results
    for (const result of this.results) {
      if (result.testSuite.toLowerCase().includes('core entities')) {
        testedEntities.add('tickets');
        testedEntities.add('accounts');
        testedEntities.add('contacts');
        testedEntities.add('projects');
      }
      if (result.testSuite.toLowerCase().includes('performance')) {
        testedEntities.add('tickets');
      }
    }

    // Generate entity details
    for (const entity of coreEntities) {
      const isTested = testedEntities.has(entity);
      entityDetails.push({
        entityName: entity,
        operations: {
          list: isTested,
          get: isTested,
          create: isTested && this.testEnvironment.isOperationAllowed('create'),
          update: isTested && this.testEnvironment.isOperationAllowed('update'),
          delete: isTested && this.testEnvironment.isOperationAllowed('delete'),
        },
        businessLogicTested: isTested && this.results.some(r => r.testSuite.includes('Business Logic')),
        performanceTested: isTested && this.results.some(r => r.testSuite.includes('Performance')),
      });
    }

    return {
      totalEntities: coreEntities.length,
      testedEntities: testedEntities.size,
      coveragePercentage: (testedEntities.size / coreEntities.length) * 100,
      entityDetails,
    };
  }

  /**
   * Get created entities summary
   */
  private getCreatedEntitiesSummary() {
    const createdEntities = this.testEnvironment.getCreatedEntities();
    const summary: Record<string, number> = {};
    
    for (const [entityType, ids] of createdEntities) {
      summary[entityType] = ids.size;
    }

    return {
      summary,
      totalCreated: Object.values(summary).reduce((sum, count) => sum + count, 0),
      cleanupRequired: this.testEnvironment.getConfig().allowDelete,
    };
  }

  /**
   * Generate recommendations based on test results
   */
  private generateRecommendations(): string[] {
    const recommendations: string[] = [];
    const summary = this.generateSummary();
    const performance = this.analyzePerformance();

    // Performance recommendations
    if (typeof performance === 'object' && 'averageResponseTime' in performance) {
      if (performance.averageResponseTime > 5000) {
        recommendations.push('Consider optimizing API response times (currently > 5 seconds)');
      }
      if (performance.errorRate > 5) {
        recommendations.push('High error rate detected, review error handling and API stability');
      }
    }

    // Coverage recommendations
    const coverage = this.generateEntityCoverage();
    if (coverage.coveragePercentage < 50) {
      recommendations.push('Consider expanding test coverage to more entity types');
    }

    // Environment recommendations
    const config = this.testEnvironment.getConfig();
    if (!config.allowCreate && !config.allowUpdate && !config.allowDelete) {
      recommendations.push('Consider running tests in a sandbox environment for full CRUD testing');
    }

    // Error pattern recommendations
    const allErrors = this.results.flatMap(result => result.errors);
    const errorPatterns = new Map<string, number>();
    
    for (const error of allErrors) {
      const pattern = this.categorizeError(error.error);
      errorPatterns.set(pattern, (errorPatterns.get(pattern) || 0) + 1);
    }

    for (const [pattern, count] of errorPatterns) {
      if (count > 1) {
        recommendations.push(`Recurring ${pattern} errors detected (${count} occurrences) - investigate root cause`);
      }
    }

    return recommendations;
  }

  /**
   * Categorize error for pattern analysis
   */
  private categorizeError(errorMessage: string): string {
    if (errorMessage.includes('404')) return 'NOT_FOUND';
    if (errorMessage.includes('401')) return 'AUTHENTICATION';
    if (errorMessage.includes('403')) return 'AUTHORIZATION';
    if (errorMessage.includes('429')) return 'RATE_LIMIT';
    if (errorMessage.includes('500')) return 'SERVER_ERROR';
    if (errorMessage.includes('timeout')) return 'TIMEOUT';
    if (errorMessage.includes('network')) return 'NETWORK';
    return 'OTHER';
  }

  /**
   * Generate markdown report
   */
  private async generateMarkdownReport(reportData: any): Promise<string> {
    const { summary, environment, performanceAnalysis, entityCoverage, recommendations } = reportData;
    
    let markdown = `# Autotask API Integration Test Report\n\n`;
    
    // Executive Summary
    markdown += `## Executive Summary\n\n`;
    markdown += `- **Test Environment**: ${environment.type}\n`;
    markdown += `- **Generated**: ${reportData.generatedAt}\n`;
    markdown += `- **Total Tests**: ${summary.totalTests}\n`;
    markdown += `- **Success Rate**: ${summary.successRate.toFixed(1)}%\n`;
    markdown += `- **Duration**: ${(summary.totalDuration / 1000).toFixed(1)} seconds\n\n`;
    
    // Test Results Summary
    markdown += `## Test Results Summary\n\n`;
    markdown += `| Metric | Count | Percentage |\n`;
    markdown += `|--------|-------|------------|\n`;
    markdown += `| Passed | ${summary.passedTests} | ${((summary.passedTests / summary.totalTests) * 100).toFixed(1)}% |\n`;
    markdown += `| Failed | ${summary.failedTests} | ${((summary.failedTests / summary.totalTests) * 100).toFixed(1)}% |\n`;
    markdown += `| Skipped | ${summary.skippedTests} | ${((summary.skippedTests / summary.totalTests) * 100).toFixed(1)}% |\n\n`;
    
    // Performance Analysis
    if (performanceAnalysis && typeof performanceAnalysis === 'object' && 'averageResponseTime' in performanceAnalysis) {
      markdown += `## Performance Analysis\n\n`;
      markdown += `- **Average Response Time**: ${performanceAnalysis.averageResponseTime}ms\n`;
      markdown += `- **Total Throughput**: ${performanceAnalysis.totalThroughput} req/sec\n`;
      markdown += `- **Error Rate**: ${performanceAnalysis.errorRate}%\n`;
      markdown += `- **Total Requests**: ${performanceAnalysis.totalRequests}\n\n`;
    }
    
    // Entity Coverage
    markdown += `## Entity Coverage\n\n`;
    markdown += `- **Coverage**: ${entityCoverage.testedEntities}/${entityCoverage.totalEntities} entities (${entityCoverage.coveragePercentage.toFixed(1)}%)\n\n`;
    
    markdown += `### Entity Details\n\n`;
    markdown += `| Entity | List | Get | Create | Update | Delete | Business Logic | Performance |\n`;
    markdown += `|--------|------|-----|--------|--------|--------|----------------|-------------|\n`;
    
    for (const entity of entityCoverage.entityDetails) {
      const ops = entity.operations;
      markdown += `| ${entity.entityName} | ${ops.list ? '✅' : '❌'} | ${ops.get ? '✅' : '❌'} | ${ops.create ? '✅' : '❌'} | ${ops.update ? '✅' : '❌'} | ${ops.delete ? '✅' : '❌'} | ${entity.businessLogicTested ? '✅' : '❌'} | ${entity.performanceTested ? '✅' : '❌'} |\n`;
    }
    markdown += `\n`;
    
    // Recommendations
    if (recommendations.length > 0) {
      markdown += `## Recommendations\n\n`;
      for (const rec of recommendations) {
        markdown += `- ${rec}\n`;
      }
      markdown += `\n`;
    }
    
    // Error Summary
    if (summary.errorCount > 0) {
      markdown += `## Error Summary\n\n`;
      markdown += `Total errors encountered: ${summary.errorCount}\n\n`;
      
      const allErrors = reportData.detailedResults.flatMap((result: any) => result.errors);
      const errorCounts = new Map<string, number>();
      
      for (const error of allErrors) {
        const category = this.categorizeError(error.error);
        errorCounts.set(category, (errorCounts.get(category) || 0) + 1);
      }
      
      for (const [category, count] of errorCounts) {
        markdown += `- **${category}**: ${count} occurrences\n`;
      }
      markdown += `\n`;
    }
    
    // Environment Information
    markdown += `## Environment Information\n\n`;
    markdown += `- **Environment Type**: ${environment.type}\n`;
    markdown += `- **Test Session ID**: ${environment.testSession}\n`;
    markdown += `- **Data Operations**: ${this.testEnvironment.isOperationAllowed('create') ? 'CREATE' : 'READ-ONLY'}\n\n`;
    
    markdown += `---\n\n`;
    markdown += `*Report generated by Autotask Node SDK Integration Test Suite*\n`;
    
    return markdown;
  }

  /**
   * Save JSON report
   */
  private async saveJsonReport(reportData: any): Promise<void> {
    const filename = `integration-test-report-${Date.now()}.json`;
    const filepath = path.join(this.reportDir, filename);
    fs.writeFileSync(filepath, JSON.stringify(reportData, null, 2));
  }

  /**
   * Save HTML report
   */
  private async saveHtmlReport(reportData: any): Promise<void> {
    const filename = `integration-test-report-${Date.now()}.html`;
    const filepath = path.join(this.reportDir, filename);
    
    const html = this.generateHtmlReport(reportData);
    fs.writeFileSync(filepath, html);
  }

  /**
   * Save markdown report
   */
  private async saveMarkdownReport(markdown: string): Promise<void> {
    const filename = `integration-test-report-${Date.now()}.md`;
    const filepath = path.join(this.reportDir, filename);
    fs.writeFileSync(filepath, markdown);
  }

  /**
   * Generate HTML report
   */
  private generateHtmlReport(reportData: any): string {
    const { summary, environment, performanceAnalysis } = reportData;
    
    return `
<!DOCTYPE html>
<html>
<head>
    <title>Autotask API Integration Test Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .header { background: #f5f5f5; padding: 20px; border-radius: 5px; }
        .summary { display: flex; gap: 20px; margin: 20px 0; }
        .card { background: white; border: 1px solid #ddd; padding: 15px; border-radius: 5px; flex: 1; }
        .success { background: #d4edda; border-color: #c3e6cb; }
        .warning { background: #fff3cd; border-color: #ffeaa7; }
        .error { background: #f8d7da; border-color: #f5c6cb; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background: #f2f2f2; }
        .progress { width: 100%; height: 20px; background: #f0f0f0; border-radius: 10px; }
        .progress-bar { height: 100%; background: #28a745; border-radius: 10px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Autotask API Integration Test Report</h1>
        <p><strong>Environment:</strong> ${environment.type}</p>
        <p><strong>Generated:</strong> ${reportData.generatedAt}</p>
    </div>
    
    <div class="summary">
        <div class="card success">
            <h3>Passed Tests</h3>
            <h2>${summary.passedTests}</h2>
            <p>${((summary.passedTests / summary.totalTests) * 100).toFixed(1)}%</p>
        </div>
        <div class="card ${summary.failedTests > 0 ? 'error' : 'success'}">
            <h3>Failed Tests</h3>
            <h2>${summary.failedTests}</h2>
            <p>${((summary.failedTests / summary.totalTests) * 100).toFixed(1)}%</p>
        </div>
        <div class="card">
            <h3>Total Duration</h3>
            <h2>${(summary.totalDuration / 1000).toFixed(1)}s</h2>
        </div>
    </div>
    
    <h2>Success Rate</h2>
    <div class="progress">
        <div class="progress-bar" style="width: ${summary.successRate}%"></div>
    </div>
    <p>${summary.successRate.toFixed(1)}% of tests passed</p>
    
    ${performanceAnalysis && typeof performanceAnalysis === 'object' && 'averageResponseTime' in performanceAnalysis ? `
    <h2>Performance Summary</h2>
    <table>
        <tr><th>Metric</th><th>Value</th></tr>
        <tr><td>Average Response Time</td><td>${performanceAnalysis.averageResponseTime}ms</td></tr>
        <tr><td>Throughput</td><td>${performanceAnalysis.totalThroughput} req/sec</td></tr>
        <tr><td>Error Rate</td><td>${performanceAnalysis.errorRate}%</td></tr>
        <tr><td>Total Requests</td><td>${performanceAnalysis.totalRequests}</td></tr>
    </table>
    ` : ''}
    
</body>
</html>
    `.trim();
  }
}
