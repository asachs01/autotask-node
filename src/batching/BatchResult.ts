/**
 * Batch Result Implementation
 * 
 * Handles batch processing results with:
 * - Individual request result tracking
 * - Success/failure analysis
 * - Performance metrics collection
 * - Result aggregation and reporting
 */

import winston from 'winston';
import { BatchResult, BatchRequestResult } from './types';
import { QueueBatch, QueueRequest } from '../queue/types/QueueTypes';

/**
 * Result builder for constructing batch results
 */
export class BatchResultBuilder {
  private batchId: string;
  private startTime: Date;
  private strategy: string;
  private results: BatchRequestResult[] = [];
  private optimizations: string[] = [];
  
  constructor(batchId: string, strategy: string = 'unknown') {
    this.batchId = batchId;
    this.strategy = strategy;
    this.startTime = new Date();
  }
  
  /**
   * Add a successful request result
   */
  addSuccess(
    requestId: string,
    data: any,
    statusCode: number = 200,
    processingTime: number = 0,
    responseSize?: number
  ): BatchResultBuilder {
    this.results.push({
      requestId,
      success: true,
      data,
      statusCode,
      processingTime,
      responseSize
    });
    
    return this;
  }
  
  /**
   * Add a failed request result
   */
  addFailure(
    requestId: string,
    error: Error,
    statusCode?: number,
    processingTime: number = 0,
    responseSize?: number
  ): BatchResultBuilder {
    this.results.push({
      requestId,
      success: false,
      error,
      statusCode,
      processingTime,
      responseSize
    });
    
    return this;
  }
  
  /**
   * Add a request result (success or failure based on data/error)
   */
  addResult(
    requestId: string,
    data?: any,
    error?: Error,
    statusCode?: number,
    processingTime: number = 0,
    responseSize?: number
  ): BatchResultBuilder {
    if (error) {
      return this.addFailure(requestId, error, statusCode, processingTime, responseSize);
    } else {
      return this.addSuccess(requestId, data, statusCode || 200, processingTime, responseSize);
    }
  }
  
  /**
   * Add multiple results from an array
   */
  addResults(results: Partial<BatchRequestResult>[]): BatchResultBuilder {
    for (const result of results) {
      if (!result.requestId) {
        continue;
      }
      
      this.results.push({
        requestId: result.requestId,
        success: result.success ?? (result.error ? false : true),
        data: result.data,
        error: result.error,
        statusCode: result.statusCode,
        processingTime: result.processingTime ?? 0,
        responseSize: result.responseSize
      });
    }
    
    return this;
  }
  
  /**
   * Set optimizations applied to the batch
   */
  setOptimizations(optimizations: string[]): BatchResultBuilder {
    this.optimizations = [...optimizations];
    return this;
  }
  
  /**
   * Build the final batch result
   */
  build(): BatchResult {
    const endTime = new Date();
    const processingTime = endTime.getTime() - this.startTime.getTime();
    
    const successfulResults = this.results.filter(r => r.success);
    const successRate = this.results.length > 0 ? successfulResults.length / this.results.length : 0;
    
    return {
      batchId: this.batchId,
      success: successRate > 0.5, // Consider batch successful if >50% requests succeed
      results: [...this.results],
      metadata: {
        startTime: this.startTime,
        endTime,
        processingTime,
        size: this.results.length,
        successRate,
        strategy: this.strategy,
        optimizations: this.optimizations.length > 0 ? this.optimizations : undefined
      }
    };
  }
}

/**
 * Result analyzer for batch result analysis and reporting
 */
export class BatchResultAnalyzer {
  private readonly logger: winston.Logger;
  
  constructor(logger: winston.Logger) {
    this.logger = logger;
  }
  
  /**
   * Analyze batch result and provide insights
   */
  analyzeBatchResult(result: BatchResult): BatchAnalysis {
    const analysis: BatchAnalysis = {
      batchId: result.batchId,
      summary: this.generateSummary(result),
      performance: this.analyzePerformance(result),
      errors: this.analyzeErrors(result),
      recommendations: this.generateRecommendations(result),
      quality: this.assessQuality(result)
    };
    
    this.logger.debug('Batch result analyzed', {
      batchId: result.batchId,
      successRate: result.metadata.successRate,
      processingTime: result.metadata.processingTime,
      recommendations: analysis.recommendations.length
    });
    
    return analysis;
  }
  
  /**
   * Generate summary statistics for multiple batch results
   */
  generateAggregateAnalysis(results: BatchResult[]): AggregateAnalysis {
    if (results.length === 0) {
      return {
        totalBatches: 0,
        totalRequests: 0,
        overallSuccessRate: 0,
        averageProcessingTime: 0,
        throughput: 0,
        errorPatterns: [],
        performanceTrends: [],
        recommendations: []
      };
    }
    
    const totalBatches = results.length;
    const totalRequests = results.reduce((sum, r) => sum + r.results.length, 0);
    const totalSuccessfulRequests = results.reduce((sum, r) => 
      sum + r.results.filter(req => req.success).length, 0
    );
    
    const overallSuccessRate = totalRequests > 0 ? totalSuccessfulRequests / totalRequests : 0;
    const averageProcessingTime = results.reduce((sum, r) => sum + r.metadata.processingTime, 0) / totalBatches;
    
    // Calculate throughput (requests per second)
    const totalTime = results.reduce((sum, r) => sum + r.metadata.processingTime, 0) / 1000; // Convert to seconds
    const throughput = totalTime > 0 ? totalRequests / totalTime : 0;
    
    const errorPatterns = this.identifyErrorPatterns(results);
    const performanceTrends = this.analyzePerformanceTrends(results);
    const recommendations = this.generateAggregateRecommendations(results);
    
    return {
      totalBatches,
      totalRequests,
      overallSuccessRate,
      averageProcessingTime,
      throughput,
      errorPatterns,
      performanceTrends,
      recommendations
    };
  }
  
  /**
   * Extract failed requests for retry analysis
   */
  extractFailedRequests(result: BatchResult): FailedRequestInfo[] {
    return result.results
      .filter(r => !r.success)
      .map(r => ({
        requestId: r.requestId,
        error: r.error!,
        statusCode: r.statusCode,
        processingTime: r.processingTime,
        retryable: this.isRetryableError(r.error!),
        retryDelay: this.calculateRetryDelay(r.error!, r.statusCode)
      }));
  }
  
  /**
   * Generate success/failure report
   */
  generateReport(result: BatchResult): BatchReport {
    const successfulRequests = result.results.filter(r => r.success);
    const failedRequests = result.results.filter(r => !r.success);
    
    const report: BatchReport = {
      batchId: result.batchId,
      timestamp: result.metadata.endTime,
      summary: {
        total: result.results.length,
        successful: successfulRequests.length,
        failed: failedRequests.length,
        successRate: result.metadata.successRate,
        processingTime: result.metadata.processingTime
      },
      performance: {
        averageRequestTime: this.calculateAverageRequestTime(result.results),
        slowestRequest: this.findSlowestRequest(result.results),
        fastestRequest: this.findFastestRequest(result.results),
        throughput: result.results.length / (result.metadata.processingTime / 1000)
      },
      errors: failedRequests.length > 0 ? {
        totalErrors: failedRequests.length,
        errorBreakdown: this.categorizeErrors(failedRequests),
        retryableErrors: failedRequests.filter(r => this.isRetryableError(r.error!)).length
      } : undefined,
      optimization: result.metadata.optimizations ? {
        applied: result.metadata.optimizations,
        effectiveness: this.assessOptimizationEffectiveness(result)
      } : undefined
    };
    
    return report;
  }
  
  // Private helper methods
  
  private generateSummary(result: BatchResult): string {
    const { successRate, size, processingTime } = result.metadata;
    const successCount = result.results.filter(r => r.success).length;
    const failureCount = size - successCount;
    
    return `Processed ${size} requests in ${processingTime}ms with ${(successRate * 100).toFixed(1)}% success rate (${successCount} successful, ${failureCount} failed)`;
  }
  
  private analyzePerformance(result: BatchResult): PerformanceAnalysis {
    const requestTimes = result.results.map(r => r.processingTime);
    const avgRequestTime = requestTimes.reduce((sum, time) => sum + time, 0) / requestTimes.length;
    const maxRequestTime = Math.max(...requestTimes);
    const minRequestTime = Math.min(...requestTimes);
    
    return {
      averageRequestTime: avgRequestTime,
      maxRequestTime,
      minRequestTime,
      totalProcessingTime: result.metadata.processingTime,
      throughput: result.results.length / (result.metadata.processingTime / 1000),
      efficiency: this.calculateEfficiency(result)
    };
  }
  
  private analyzeErrors(result: BatchResult): ErrorAnalysis {
    const failedResults = result.results.filter(r => !r.success);
    
    if (failedResults.length === 0) {
      return {
        totalErrors: 0,
        errorTypes: new Map(),
        retryableErrors: 0,
        criticalErrors: 0
      };
    }
    
    const errorTypes = new Map<string, number>();
    let retryableErrors = 0;
    let criticalErrors = 0;
    
    for (const failed of failedResults) {
      if (!failed.error) continue;
      
      const errorType = failed.error.name || 'UnknownError';
      errorTypes.set(errorType, (errorTypes.get(errorType) || 0) + 1);
      
      if (this.isRetryableError(failed.error)) {
        retryableErrors++;
      }
      
      if (this.isCriticalError(failed.error)) {
        criticalErrors++;
      }
    }
    
    return {
      totalErrors: failedResults.length,
      errorTypes,
      retryableErrors,
      criticalErrors
    };
  }
  
  private generateRecommendations(result: BatchResult): string[] {
    const recommendations: string[] = [];
    const { successRate, processingTime, size } = result.metadata;
    
    // Success rate recommendations
    if (successRate < 0.8) {
      recommendations.push('Consider reducing batch size due to low success rate');
    }
    
    if (successRate < 0.5) {
      recommendations.push('Review batch optimization strategies - high failure rate detected');
    }
    
    // Performance recommendations
    const avgRequestTime = result.results.reduce((sum, r) => sum + r.processingTime, 0) / result.results.length;
    if (avgRequestTime > 2000) {
      recommendations.push('Consider optimizing individual request processing - high latency detected');
    }
    
    if (processingTime / size > 100) {
      recommendations.push('Batch processing overhead is high - consider different batching strategy');
    }
    
    // Size recommendations
    if (size > 200 && successRate < 0.9) {
      recommendations.push('Large batch with low success rate - consider smaller batches');
    }
    
    if (size < 10 && processingTime > 1000) {
      recommendations.push('Small batch with high overhead - consider larger batches');
    }
    
    // Error-based recommendations
    const errorAnalysis = this.analyzeErrors(result);
    if (errorAnalysis.retryableErrors > errorAnalysis.totalErrors * 0.5) {
      recommendations.push('Many retryable errors detected - implement retry logic');
    }
    
    return recommendations;
  }
  
  private assessQuality(result: BatchResult): QualityAssessment {
    const { successRate, processingTime, size } = result.metadata;
    
    let score = 0;
    const factors: string[] = [];
    
    // Success rate contribution (40% of score)
    const successContribution = successRate * 0.4 * 100;
    score += successContribution;
    factors.push(`Success rate: ${(successRate * 100).toFixed(1)}% (${successContribution.toFixed(1)} points)`);
    
    // Performance contribution (30% of score)
    const avgRequestTime = result.results.reduce((sum, r) => sum + r.processingTime, 0) / result.results.length;
    const performanceScore = Math.max(0, (2000 - avgRequestTime) / 2000) * 0.3 * 100;
    score += performanceScore;
    factors.push(`Performance: ${avgRequestTime.toFixed(0)}ms avg (${performanceScore.toFixed(1)} points)`);
    
    // Efficiency contribution (20% of score)
    const efficiency = this.calculateEfficiency(result);
    const efficiencyScore = efficiency * 0.2 * 100;
    score += efficiencyScore;
    factors.push(`Efficiency: ${(efficiency * 100).toFixed(1)}% (${efficiencyScore.toFixed(1)} points)`);
    
    // Size optimization contribution (10% of score)
    const sizeScore = Math.min(size / 50, 1) * 0.1 * 100; // Optimal around 50 requests
    score += sizeScore;
    factors.push(`Size optimization: ${size} requests (${sizeScore.toFixed(1)} points)`);
    
    let grade: 'A' | 'B' | 'C' | 'D' | 'F';
    if (score >= 90) grade = 'A';
    else if (score >= 80) grade = 'B';
    else if (score >= 70) grade = 'C';
    else if (score >= 60) grade = 'D';
    else grade = 'F';
    
    return {
      score: Math.round(score),
      grade,
      factors
    };
  }
  
  private calculateEfficiency(result: BatchResult): number {
    // Efficiency = (successful requests * average success time) / total processing time
    const successfulResults = result.results.filter(r => r.success);
    if (successfulResults.length === 0) return 0;
    
    const avgSuccessTime = successfulResults.reduce((sum, r) => sum + r.processingTime, 0) / successfulResults.length;
    const idealTime = avgSuccessTime * result.results.length;
    
    return Math.min(1, idealTime / result.metadata.processingTime);
  }
  
  private isRetryableError(error: Error): boolean {
    const retryableErrors = [
      'TimeoutError',
      'NetworkError',
      'ConnectionError',
      'ServiceUnavailableError',
      'TooManyRequestsError'
    ];
    
    return retryableErrors.includes(error.name) || 
           error.message.includes('timeout') ||
           error.message.includes('network') ||
           error.message.includes('connection');
  }
  
  private isCriticalError(error: Error): boolean {
    const criticalErrors = [
      'AuthenticationError',
      'AuthorizationError',
      'ValidationError',
      'BadRequestError'
    ];
    
    return criticalErrors.includes(error.name);
  }
  
  private calculateRetryDelay(error: Error, statusCode?: number): number {
    // Calculate retry delay based on error type and status code
    if (statusCode === 429) return 60000; // 1 minute for rate limiting
    if (statusCode && statusCode >= 500) return 30000; // 30 seconds for server errors
    if (this.isRetryableError(error)) return 10000; // 10 seconds for general retryable errors
    
    return 0; // No retry for non-retryable errors
  }
  
  private calculateAverageRequestTime(results: BatchRequestResult[]): number {
    if (results.length === 0) return 0;
    return results.reduce((sum, r) => sum + r.processingTime, 0) / results.length;
  }
  
  private findSlowestRequest(results: BatchRequestResult[]): BatchRequestResult | undefined {
    return results.reduce((slowest, current) => 
      current.processingTime > slowest.processingTime ? current : slowest
    );
  }
  
  private findFastestRequest(results: BatchRequestResult[]): BatchRequestResult | undefined {
    return results.reduce((fastest, current) => 
      current.processingTime < fastest.processingTime ? current : fastest
    );
  }
  
  private categorizeErrors(failedResults: BatchRequestResult[]): Map<string, number> {
    const categories = new Map<string, number>();
    
    for (const failed of failedResults) {
      if (!failed.error) continue;
      
      const category = this.categorizeError(failed.error, failed.statusCode);
      categories.set(category, (categories.get(category) || 0) + 1);
    }
    
    return categories;
  }
  
  private categorizeError(error: Error, statusCode?: number): string {
    if (statusCode) {
      if (statusCode >= 400 && statusCode < 500) return 'Client Errors';
      if (statusCode >= 500) return 'Server Errors';
    }
    
    if (this.isRetryableError(error)) return 'Retryable Errors';
    if (this.isCriticalError(error)) return 'Critical Errors';
    
    return 'Other Errors';
  }
  
  private assessOptimizationEffectiveness(result: BatchResult): number {
    // Simple effectiveness metric based on success rate and processing time
    const { successRate, processingTime, size } = result.metadata;
    const timePerRequest = processingTime / size;
    
    // Effectiveness = (success rate * time efficiency)
    const timeEfficiency = Math.max(0, (1000 - timePerRequest) / 1000); // 1000ms as baseline
    return successRate * timeEfficiency;
  }
  
  private identifyErrorPatterns(results: BatchResult[]): ErrorPattern[] {
    // Analyze error patterns across multiple batch results
    const patterns: ErrorPattern[] = [];
    
    // Group errors by type and analyze frequency
    const errorFrequency = new Map<string, number>();
    let totalErrors = 0;
    
    for (const result of results) {
      for (const reqResult of result.results) {
        if (!reqResult.success && reqResult.error) {
          const errorType = reqResult.error.name || 'UnknownError';
          errorFrequency.set(errorType, (errorFrequency.get(errorType) || 0) + 1);
          totalErrors++;
        }
      }
    }
    
    // Identify significant patterns (>5% of total errors)
    for (const [errorType, count] of errorFrequency) {
      const percentage = count / totalErrors;
      if (percentage > 0.05) {
        patterns.push({
          type: errorType,
          frequency: count,
          percentage,
          impact: percentage > 0.2 ? 'high' : percentage > 0.1 ? 'medium' : 'low'
        });
      }
    }
    
    return patterns.sort((a, b) => b.frequency - a.frequency);
  }
  
  private analyzePerformanceTrends(results: BatchResult[]): PerformanceTrend[] {
    if (results.length < 3) return [];
    
    const trends: PerformanceTrend[] = [];
    
    // Sort results by timestamp
    const sortedResults = results.sort((a, b) => 
      a.metadata.startTime.getTime() - b.metadata.startTime.getTime()
    );
    
    // Analyze success rate trend
    const successRates = sortedResults.map(r => r.metadata.successRate);
    const successTrend = this.calculateTrend(successRates);
    if (Math.abs(successTrend) > 0.05) {
      trends.push({
        metric: 'success_rate',
        direction: successTrend > 0 ? 'improving' : 'declining',
        magnitude: Math.abs(successTrend),
        description: `Success rate is ${successTrend > 0 ? 'improving' : 'declining'} by ${(successTrend * 100).toFixed(1)}% per batch`
      });
    }
    
    // Analyze processing time trend
    const processingTimes = sortedResults.map(r => r.metadata.processingTime);
    const timeTrend = this.calculateTrend(processingTimes);
    if (Math.abs(timeTrend) > 100) {
      trends.push({
        metric: 'processing_time',
        direction: timeTrend > 0 ? 'degrading' : 'improving',
        magnitude: Math.abs(timeTrend),
        description: `Processing time is ${timeTrend > 0 ? 'increasing' : 'decreasing'} by ${timeTrend.toFixed(0)}ms per batch`
      });
    }
    
    return trends;
  }
  
  private calculateTrend(values: number[]): number {
    if (values.length < 2) return 0;
    
    // Simple linear trend calculation
    const n = values.length;
    const xSum = (n * (n - 1)) / 2; // Sum of indices 0, 1, 2, ...
    const ySum = values.reduce((sum, val) => sum + val, 0);
    const xySum = values.reduce((sum, val, idx) => sum + val * idx, 0);
    const xSquaredSum = values.reduce((sum, _, idx) => sum + idx * idx, 0);
    
    const slope = (n * xySum - xSum * ySum) / (n * xSquaredSum - xSum * xSum);
    return slope;
  }
  
  private generateAggregateRecommendations(results: BatchResult[]): string[] {
    const recommendations: string[] = [];
    
    // Analyze overall patterns
    const avgSuccessRate = results.reduce((sum, r) => sum + r.metadata.successRate, 0) / results.length;
    const avgProcessingTime = results.reduce((sum, r) => sum + r.metadata.processingTime, 0) / results.length;
    
    if (avgSuccessRate < 0.8) {
      recommendations.push('Overall batch success rate is low - consider reviewing batch strategies');
    }
    
    if (avgProcessingTime > 5000) {
      recommendations.push('Average batch processing time is high - consider optimization');
    }
    
    // Check for declining trends
    const trends = this.analyzePerformanceTrends(results);
    const decliningTrends = trends.filter(t => t.direction === 'declining' || t.direction === 'degrading');
    
    if (decliningTrends.length > 0) {
      recommendations.push('Performance trends are declining - investigate system health');
    }
    
    return recommendations;
  }
}

// Type definitions for analysis results

export interface BatchAnalysis {
  batchId: string;
  summary: string;
  performance: PerformanceAnalysis;
  errors: ErrorAnalysis;
  recommendations: string[];
  quality: QualityAssessment;
}

export interface PerformanceAnalysis {
  averageRequestTime: number;
  maxRequestTime: number;
  minRequestTime: number;
  totalProcessingTime: number;
  throughput: number;
  efficiency: number;
}

export interface ErrorAnalysis {
  totalErrors: number;
  errorTypes: Map<string, number>;
  retryableErrors: number;
  criticalErrors: number;
}

export interface QualityAssessment {
  score: number; // 0-100
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  factors: string[];
}

export interface AggregateAnalysis {
  totalBatches: number;
  totalRequests: number;
  overallSuccessRate: number;
  averageProcessingTime: number;
  throughput: number;
  errorPatterns: ErrorPattern[];
  performanceTrends: PerformanceTrend[];
  recommendations: string[];
}

export interface ErrorPattern {
  type: string;
  frequency: number;
  percentage: number;
  impact: 'low' | 'medium' | 'high';
}

export interface PerformanceTrend {
  metric: string;
  direction: 'improving' | 'declining' | 'degrading';
  magnitude: number;
  description: string;
}

export interface FailedRequestInfo {
  requestId: string;
  error: Error;
  statusCode?: number;
  processingTime: number;
  retryable: boolean;
  retryDelay: number;
}

export interface BatchReport {
  batchId: string;
  timestamp: Date;
  summary: {
    total: number;
    successful: number;
    failed: number;
    successRate: number;
    processingTime: number;
  };
  performance: {
    averageRequestTime: number;
    slowestRequest?: BatchRequestResult;
    fastestRequest?: BatchRequestResult;
    throughput: number;
  };
  errors?: {
    totalErrors: number;
    errorBreakdown: Map<string, number>;
    retryableErrors: number;
  };
  optimization?: {
    applied: string[];
    effectiveness: number;
  };
}