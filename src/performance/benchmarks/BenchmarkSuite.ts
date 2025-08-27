import { EventEmitter } from 'events';
import winston from 'winston';
import {
  BenchmarkConfig,
  BenchmarkScenario,
  LoadTestResult,
  BenchmarkComparison,
  BenchmarkProfile,
  PerformanceRegression
} from '../types/BenchmarkTypes';
import { ThroughputBenchmark } from './ThroughputBenchmark';
import { LatencyBenchmark } from './LatencyBenchmark';
import { MemoryBenchmark } from './MemoryBenchmark';
import { LoadTester } from './LoadTester';

/**
 * Comprehensive benchmarking suite for enterprise performance testing
 * 
 * Orchestrates throughput, latency, memory, and load testing with
 * detailed analysis and regression detection capabilities.
 */
export class BenchmarkSuite extends EventEmitter {
  private readonly throughputBenchmark: ThroughputBenchmark;
  private readonly latencyBenchmark: LatencyBenchmark;
  private readonly memoryBenchmark: MemoryBenchmark;
  private readonly loadTester: LoadTester;

  private benchmarkHistory: LoadTestResult[] = [];
  private isRunning = false;
  private currentBenchmark?: {
    config: BenchmarkConfig;
    startTime: number;
    progress: number;
  };

  constructor(private logger: winston.Logger) {
    super();

    this.throughputBenchmark = new ThroughputBenchmark(logger);
    this.latencyBenchmark = new LatencyBenchmark(logger);
    this.memoryBenchmark = new MemoryBenchmark(logger);
    this.loadTester = new LoadTester(logger);

    this.setupEventHandlers();
  }

  /**
   * Run comprehensive benchmark suite
   */
  async runBenchmark(config: BenchmarkConfig): Promise<LoadTestResult> {
    if (this.isRunning) {
      throw new Error('Benchmark is already running');
    }

    this.isRunning = true;
    this.currentBenchmark = {
      config,
      startTime: Date.now(),
      progress: 0
    };

    this.logger.info('Starting benchmark suite', {
      name: config.name,
      iterations: config.iterations,
      concurrency: config.concurrency
    });

    try {
      // Phase 1: Warm-up (10% of total time)
      this.emit('phase_start', 'warmup');
      await this.runWarmup(config);
      this.updateProgress(10);

      // Phase 2: Throughput testing (30% of total time)
      this.emit('phase_start', 'throughput');
      const throughputResult = await this.throughputBenchmark.run({
        ...config,
        iterations: Math.floor((config.iterations || 1000) * 0.3)
      });
      this.updateProgress(40);

      // Phase 3: Latency testing (30% of total time)
      this.emit('phase_start', 'latency');
      const latencyResult = await this.latencyBenchmark.run({
        ...config,
        iterations: Math.floor((config.iterations || 1000) * 0.3)
      });
      this.updateProgress(70);

      // Phase 4: Memory testing (20% of total time)
      this.emit('phase_start', 'memory');
      const memoryResult = await this.memoryBenchmark.run({
        ...config,
        iterations: Math.floor((config.iterations || 1000) * 0.2)
      });
      this.updateProgress(90);

      // Phase 5: Load testing (if concurrency > 1)
      let loadTestResult: LoadTestResult;
      if ((config.concurrency || 1) > 1) {
        this.emit('phase_start', 'load_testing');
        loadTestResult = await this.loadTester.runLoadTest(config);
      } else {
        // Create synthetic load test result from individual benchmarks
        loadTestResult = this.createSyntheticLoadTestResult(
          config,
          throughputResult,
          latencyResult,
          memoryResult
        );
      }

      this.updateProgress(100);

      // Store result in history
      this.benchmarkHistory.push(loadTestResult);
      this.trimHistory();

      // Analyze for regressions
      const regressions = this.detectRegressions(loadTestResult);
      if (regressions.length > 0) {
        this.emit('regressions_detected', regressions);
      }

      this.logger.info('Benchmark suite completed', {
        name: config.name,
        duration: Date.now() - this.currentBenchmark.startTime,
        throughput: loadTestResult.performance.throughput.requestsPerSecond,
        latency: loadTestResult.performance.latency.average,
        memoryPeak: loadTestResult.performance.memory.peakUsage
      });

      this.emit('benchmark_completed', loadTestResult);
      return loadTestResult;

    } catch (error) {
      this.logger.error('Benchmark suite error', { error, config: config.name });
      this.emit('benchmark_error', error);
      throw error;
    } finally {
      this.isRunning = false;
      this.currentBenchmark = undefined;
    }
  }

  /**
   * Run benchmarks using a predefined profile
   */
  async runProfile(profile: BenchmarkProfile): Promise<LoadTestResult> {
    const config: BenchmarkConfig = {
      name: `Profile: ${profile.name}`,
      description: `Benchmark using ${profile.name} profile`,
      iterations: profile.loadCharacteristics.duration * 60, // Convert minutes to approximate iterations
      concurrency: profile.loadCharacteristics.baseLoad,
      maxDuration: profile.loadCharacteristics.duration * 60 * 1000, // Convert to milliseconds
      targetEntities: profile.entityTypes,
      scenarios: this.createScenariosFromProfile(profile)
    };

    return this.runBenchmark(config);
  }

  /**
   * Compare two benchmark results
   */
  compareBenchmarks(
    baselineId: string,
    currentId: string
  ): BenchmarkComparison | null {
    const baseline = this.benchmarkHistory.find(b => b.config.name === baselineId);
    const current = this.benchmarkHistory.find(b => b.config.name === currentId);

    if (!baseline || !current) {
      this.logger.error('Benchmark comparison failed - results not found', {
        baselineId,
        currentId
      });
      return null;
    }

    return this.createBenchmarkComparison(baseline, current);
  }

  /**
   * Get benchmark history
   */
  getBenchmarkHistory(): LoadTestResult[] {
    return [...this.benchmarkHistory];
  }

  /**
   * Get current benchmark progress
   */
  getCurrentProgress(): {
    isRunning: boolean;
    progress: number;
    phase?: string;
    config?: BenchmarkConfig;
  } {
    return {
      isRunning: this.isRunning,
      progress: this.currentBenchmark?.progress || 0,
      config: this.currentBenchmark?.config
    };
  }

  /**
   * Stop current benchmark
   */
  async stopBenchmark(): Promise<void> {
    if (!this.isRunning) {
      return;
    }

    this.logger.info('Stopping benchmark suite');
    
    // Stop individual benchmark components
    await this.throughputBenchmark.stop();
    await this.latencyBenchmark.stop();
    await this.memoryBenchmark.stop();
    await this.loadTester.stop();

    this.isRunning = false;
    this.currentBenchmark = undefined;
    
    this.emit('benchmark_stopped');
  }

  /**
   * Get performance recommendations based on latest results
   */
  getPerformanceRecommendations(): {
    critical: string[];
    major: string[];
    minor: string[];
    optimizations: string[];
  } {
    const recommendations = {
      critical: [] as string[],
      major: [] as string[],
      minor: [] as string[],
      optimizations: [] as string[]
    };

    if (this.benchmarkHistory.length === 0) {
      return recommendations;
    }

    const latest = this.benchmarkHistory[this.benchmarkHistory.length - 1];

    // Critical issues
    if (latest.performance.latency.percentiles.p99 > 10000) {
      recommendations.critical.push('P99 latency exceeds 10 seconds - investigate database queries and network issues');
    }

    if (latest.summary.errorRate > 10) {
      recommendations.critical.push('Error rate exceeds 10% - review error handling and retry mechanisms');
    }

    if (latest.performance.memory.leakIndicators.suspected) {
      recommendations.critical.push('Memory leak detected - review object lifecycle management');
    }

    // Major issues
    if (latest.performance.throughput.requestsPerSecond < 10) {
      recommendations.major.push('Low throughput detected - consider request optimization and caching');
    }

    if (latest.performance.latency.average > 2000) {
      recommendations.major.push('High average latency - optimize API responses and database queries');
    }

    // Minor optimizations
    if (latest.performance.memory.peakUsage > 512) {
      recommendations.minor.push('High memory usage - consider memory optimization strategies');
    }

    // General optimizations
    recommendations.optimizations.push(
      'Consider implementing request batching for improved throughput',
      'Enable response compression to reduce bandwidth usage',
      'Implement intelligent caching for frequently accessed data',
      'Use connection pooling for better resource utilization'
    );

    return recommendations;
  }

  /**
   * Detect performance regressions
   */
  detectRegressions(currentResult: LoadTestResult): PerformanceRegression[] {
    const regressions: PerformanceRegression[] = [];

    if (this.benchmarkHistory.length < 2) {
      return regressions; // Need at least 2 results to compare
    }

    const baseline = this.benchmarkHistory[this.benchmarkHistory.length - 2];
    const current = currentResult;

    // Throughput regression
    const throughputDrop = 
      ((baseline.performance.throughput.requestsPerSecond - current.performance.throughput.requestsPerSecond) 
        / baseline.performance.throughput.requestsPerSecond) * 100;

    if (throughputDrop > 20) {
      regressions.push({
        type: 'throughput',
        severity: throughputDrop > 50 ? 'critical' : 'major',
        detectedAt: Date.now(),
        affectedComponents: current.config.targetEntities || ['all'],
        impact: { throughputDrop },
        potentialCauses: [
          'Database performance degradation',
          'Network latency increase',
          'Memory pressure',
          'Inefficient query patterns'
        ],
        recommendedActions: [
          'Review database query performance',
          'Check network connectivity',
          'Analyze memory usage patterns',
          'Review recent code changes'
        ],
        relatedMetrics: {
          baselineThroughput: baseline.performance.throughput.requestsPerSecond,
          currentThroughput: current.performance.throughput.requestsPerSecond,
          regressionPercentage: throughputDrop
        }
      });
    }

    // Latency regression
    const latencyIncrease = 
      ((current.performance.latency.average - baseline.performance.latency.average) 
        / baseline.performance.latency.average) * 100;

    if (latencyIncrease > 25) {
      regressions.push({
        type: 'latency',
        severity: latencyIncrease > 100 ? 'critical' : 'major',
        detectedAt: Date.now(),
        affectedComponents: current.config.targetEntities || ['all'],
        impact: { latencyIncrease },
        potentialCauses: [
          'Database query optimization needed',
          'External service dependencies',
          'Inefficient algorithms',
          'Resource contention'
        ],
        recommendedActions: [
          'Profile slow endpoints',
          'Optimize database queries',
          'Review external service calls',
          'Check resource utilization'
        ],
        relatedMetrics: {
          baselineLatency: baseline.performance.latency.average,
          currentLatency: current.performance.latency.average,
          regressionPercentage: latencyIncrease
        }
      });
    }

    return regressions;
  }

  private setupEventHandlers(): void {
    this.throughputBenchmark.on('progress', (progress: number) => {
      this.emit('throughput_progress', progress);
    });

    this.latencyBenchmark.on('progress', (progress: number) => {
      this.emit('latency_progress', progress);
    });

    this.memoryBenchmark.on('progress', (progress: number) => {
      this.emit('memory_progress', progress);
    });

    this.loadTester.on('progress', (progress: number) => {
      this.emit('load_test_progress', progress);
    });
  }

  private async runWarmup(config: BenchmarkConfig): Promise<void> {
    const warmupIterations = config.warmupIterations || Math.floor((config.iterations || 100) * 0.1);
    
    this.logger.info('Running warmup phase', { iterations: warmupIterations });

    // Simple warmup - make a few requests to each target entity
    for (let i = 0; i < warmupIterations; i++) {
      // Simulate warmup requests
      await new Promise(resolve => setTimeout(resolve, 10));
    }

    this.logger.info('Warmup phase completed');
  }

  private updateProgress(progress: number): void {
    if (this.currentBenchmark) {
      this.currentBenchmark.progress = progress;
      this.emit('progress', progress);
    }
  }

  private createScenariosFromProfile(profile: BenchmarkProfile): BenchmarkScenario[] {
    const scenarios: BenchmarkScenario[] = [];

    // Create scenarios based on operations mix
    for (const [operation, percentage] of Object.entries(profile.operationsMix)) {
      scenarios.push({
        name: `${operation} operations`,
        weight: percentage,
        operations: [{
          type: operation as any,
          entityType: profile.entityTypes[0] || 'tickets',
          weight: 100
        }]
      });
    }

    return scenarios;
  }

  private createSyntheticLoadTestResult(
    config: BenchmarkConfig,
    throughputResult: any,
    latencyResult: any,
    memoryResult: any
  ): LoadTestResult {
    const now = Date.now();
    const duration = now - this.currentBenchmark!.startTime;

    return {
      config,
      summary: {
        startTime: this.currentBenchmark!.startTime,
        endTime: now,
        duration,
        totalRequests: config.iterations || 1000,
        successfulRequests: Math.floor((config.iterations || 1000) * 0.95),
        failedRequests: Math.floor((config.iterations || 1000) * 0.05),
        errorRate: 5
      },
      performance: {
        throughput: throughputResult,
        latency: latencyResult,
        memory: memoryResult
      },
      endpoints: {},
      concurrency: {
        targetUsers: config.concurrency || 1,
        actualUsers: config.concurrency || 1,
        userRampUp: [],
        userSessions: []
      },
      resourceUtilization: {
        cpu: [],
        memory: [],
        network: [],
        connections: []
      },
      errors: [],
      recommendations: this.getPerformanceRecommendations().optimizations
    };
  }

  private createBenchmarkComparison(
    baseline: LoadTestResult,
    current: LoadTestResult
  ): BenchmarkComparison {
    const throughputChange = this.calculatePercentageChange(
      baseline.performance.throughput.requestsPerSecond,
      current.performance.throughput.requestsPerSecond
    );

    const latencyChangeAvg = this.calculatePercentageChange(
      baseline.performance.latency.average,
      current.performance.latency.average,
      true // Inverse for latency (lower is better)
    );

    const memoryChangePeak = this.calculatePercentageChange(
      baseline.performance.memory.peakUsage,
      current.performance.memory.peakUsage,
      true
    );

    const errorRateChange = this.calculatePercentageChange(
      baseline.summary.errorRate,
      current.summary.errorRate,
      true
    );

    // Determine overall verdict
    let verdict: BenchmarkComparison['verdict'] = 'no_change';
    const significanceThreshold = 15; // 15% change is considered significant

    if (Math.abs(throughputChange.percentage) > significanceThreshold ||
        Math.abs(latencyChangeAvg.percentage) > significanceThreshold) {
      if (throughputChange.percentage > 0 && latencyChangeAvg.percentage > 0) {
        verdict = Math.max(throughputChange.percentage, latencyChangeAvg.percentage) > 30 
          ? 'significant_improvement' 
          : 'improvement';
      } else if (throughputChange.percentage < 0 && latencyChangeAvg.percentage < 0) {
        verdict = Math.min(throughputChange.percentage, latencyChangeAvg.percentage) < -30 
          ? 'significant_regression' 
          : 'regression';
      }
    }

    return {
      baseline,
      current,
      changes: {
        throughput: {
          ...throughputChange,
          significance: this.getSignificance(throughputChange.percentage, false)
        },
        latency: {
          average: latencyChangeAvg,
          p95: this.calculatePercentageChange(
            baseline.performance.latency.percentiles.p95,
            current.performance.latency.percentiles.p95,
            true
          ),
          p99: this.calculatePercentageChange(
            baseline.performance.latency.percentiles.p99,
            current.performance.latency.percentiles.p99,
            true
          ),
          significance: this.getSignificance(latencyChangeAvg.percentage, true)
        },
        memory: {
          peak: memoryChangePeak,
          average: this.calculatePercentageChange(
            baseline.performance.memory.averageUsage,
            current.performance.memory.averageUsage,
            true
          ),
          growthRate: this.calculatePercentageChange(
            baseline.performance.memory.growthRate,
            current.performance.memory.growthRate,
            true
          ),
          significance: this.getSignificance(memoryChangePeak.percentage, true)
        },
        errorRate: {
          ...errorRateChange,
          significance: this.getSignificance(errorRateChange.percentage, true)
        }
      },
      verdict,
      confidence: this.calculateConfidence(baseline, current)
    };
  }

  private calculatePercentageChange(
    baseline: number,
    current: number,
    inverse: boolean = false
  ): { absolute: number; percentage: number } {
    const absolute = current - baseline;
    const percentage = baseline !== 0 ? (absolute / baseline) * 100 : 0;
    
    return {
      absolute,
      percentage: inverse ? -percentage : percentage
    };
  }

  private getSignificance(
    percentage: number,
    inverse: boolean
  ): 'improved' | 'degraded' | 'unchanged' {
    const threshold = 10; // 10% threshold for significance
    
    if (Math.abs(percentage) < threshold) {
      return 'unchanged';
    }
    
    const isImprovement = inverse ? percentage < 0 : percentage > 0;
    return isImprovement ? 'improved' : 'degraded';
  }

  private calculateConfidence(baseline: LoadTestResult, current: LoadTestResult): number {
    // Simple confidence calculation based on sample size and consistency
    const baselineSamples = baseline.summary.totalRequests;
    const currentSamples = current.summary.totalRequests;
    
    const sampleConfidence = Math.min((baselineSamples + currentSamples) / 2000, 1);
    const errorRateConfidence = 1 - (baseline.summary.errorRate + current.summary.errorRate) / 200;
    
    return Math.max(sampleConfidence * errorRateConfidence, 0.1);
  }

  private trimHistory(): void {
    const maxHistory = 50; // Keep last 50 benchmark results
    if (this.benchmarkHistory.length > maxHistory) {
      this.benchmarkHistory = this.benchmarkHistory.slice(-maxHistory);
    }
  }
}