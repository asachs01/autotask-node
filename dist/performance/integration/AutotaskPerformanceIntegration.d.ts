import { AxiosInstance } from 'axios';
import winston from 'winston';
import { PerformanceConfig } from '../types/PerformanceTypes';
import { CacheConfig } from '../types/CacheTypes';
import { OptimizationConfig } from '../types/OptimizationTypes';
import { BenchmarkConfig } from '../types/BenchmarkTypes';
/**
 * Performance integration layer for AutotaskClient
 *
 * Integrates performance monitoring, caching, optimization, and benchmarking
 * directly into the AutotaskClient workflow for comprehensive performance management.
 */
export declare class AutotaskPerformanceIntegration {
    private axios;
    private logger;
    private config;
    private readonly performanceMonitor;
    private readonly cache;
    private readonly requestOptimizer;
    private readonly benchmarkSuite;
    private isEnabled;
    private requestIdCounter;
    constructor(axios: AxiosInstance, logger: winston.Logger, config?: {
        performance?: PerformanceConfig;
        cache?: CacheConfig;
        optimization?: OptimizationConfig;
    });
    /**
     * Enable performance integration
     */
    enable(): void;
    /**
     * Disable performance integration
     */
    disable(): void;
    /**
     * Get comprehensive performance dashboard data
     */
    getDashboard(): {
        performance: any;
        cache: any;
        optimization: any;
        recommendations: string[];
    };
    /**
     * Run performance benchmark for specific entities
     */
    benchmarkEntities(entityTypes: string[], config?: Partial<BenchmarkConfig>): Promise<any>;
    /**
     * Optimize cache for specific usage patterns
     */
    optimizeCache(usagePatterns: {
        entityType: string;
        operations: string[];
        frequency: number;
    }[]): Promise<void>;
    /**
     * Get performance insights and recommendations
     */
    getPerformanceInsights(): {
        bottlenecks: Array<{
            component: string;
            issue: string;
            impact: string;
            recommendation: string;
        }>;
        opportunities: Array<{
            area: string;
            potential: string;
            implementation: string;
        }>;
        trends: {
            performance: 'improving' | 'degrading' | 'stable';
            cache: 'improving' | 'degrading' | 'stable';
            optimization: 'improving' | 'degrading' | 'stable';
        };
    };
    private setupRequestInterceptor;
    private setupResponseInterceptor;
    private setupCacheWarmingStrategies;
    private setupOptimizationRules;
    private setupCacheInvalidation;
    private generateCacheKey;
    private extractEndpoint;
    private estimateRequestSize;
    private estimateResponseSize;
    private calculateResponseTTL;
    private convertToBatchRequest;
    private convertToAxiosResponse;
    private recordCacheHit;
    private createEntityBenchmarkScenarios;
    private getOptimalQueryParams;
    private calculateOptimalTTL;
    private generateComprehensiveRecommendations;
}
//# sourceMappingURL=AutotaskPerformanceIntegration.d.ts.map