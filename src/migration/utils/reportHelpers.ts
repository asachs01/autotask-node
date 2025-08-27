/**
 * Report generation helpers
 */

import { MigrationReport, MigrationState } from '../types/MigrationTypes';

export function generateMigrationReport(state: MigrationState): MigrationReport {
  const duration = state.endTime 
    ? state.endTime.getTime() - state.startTime.getTime()
    : Date.now() - state.startTime.getTime();

  return {
    migrationId: state.id,
    summary: {
      totalEntities: state.progress.totalEntities,
      successfulEntities: state.progress.successfulEntities,
      failedEntities: state.progress.failedEntities,
      skippedEntities: state.progress.skippedEntities,
      duration,
      dataTransferred: state.metrics.dataTransferred,
      errorRate: state.metrics.recordsFailed / state.metrics.recordsProcessed * 100,
      successRate: state.metrics.recordsMigrated / state.metrics.recordsProcessed * 100
    },
    entityReports: [],
    validationReport: {},
    performanceReport: {
      duration,
      throughput: state.metrics.recordsProcessed / (duration / 1000),
      memoryUsage: {
        peak: state.metrics.peakMemoryUsage,
        average: 0,
        gcEvents: 0,
        memoryLeaks: false
      },
      networkMetrics: {
        totalRequests: state.metrics.networkRequests,
        averageResponseTime: 0,
        errorRate: 0,
        retryCount: 0,
        dataTransferred: state.metrics.dataTransferred
      },
      bottlenecks: []
    },
    recommendations: [],
    generatedAt: new Date()
  };
}