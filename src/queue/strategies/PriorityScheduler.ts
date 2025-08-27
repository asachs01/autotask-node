/**
 * Priority Scheduler
 * 
 * Advanced request scheduling with multiple strategies:
 * - FIFO: First In, First Out
 * - LIFO: Last In, First Out  
 * - Priority: Highest priority first
 * - Weighted: Priority with fairness weighting
 * - Adaptive: Dynamic priority adjustment based on system load
 */

import {
  QueueRequest,
  QueueScheduler,
  QueueStrategyConfig
} from '../types/QueueTypes';

export class PriorityScheduler implements QueueScheduler {
  private config: QueueStrategyConfig;
  private adaptiveMetrics = new Map<number, { successRate: number; avgResponseTime: number; requestCount: number }>();
  private lastAdaptiveUpdate = Date.now();
  
  constructor(config: QueueStrategyConfig) {
    this.config = config;
  }
  
  selectNext(availableRequests: QueueRequest[]): QueueRequest | null {
    if (availableRequests.length === 0) {
      return null;
    }
    
    // Filter out scheduled requests not yet ready
    const readyRequests = availableRequests.filter(req => {
      return req.status === 'pending' && 
        (!req.scheduledAt || req.scheduledAt <= new Date());
    });
    
    if (readyRequests.length === 0) {
      return null;
    }
    
    switch (this.config.priorityStrategy) {
      case 'fifo':
        return this.selectFIFO(readyRequests);
      
      case 'lifo':
        return this.selectLIFO(readyRequests);
      
      case 'priority':
        return this.selectPriority(readyRequests);
      
      case 'weighted':
        return this.selectWeighted(readyRequests);
      
      case 'adaptive':
        return this.selectAdaptive(readyRequests);
      
      default:
        return this.selectPriority(readyRequests);
    }
  }
  
  schedule(request: QueueRequest, delay: number): void {
    request.scheduledAt = new Date(Date.now() + delay);
    request.status = 'retrying';
  }
  
  getReadyRequests(): QueueRequest[] {
    // This would typically interact with the storage backend
    // For now, return empty array as this is handled by the QueueManager
    return [];
  }
  
  updateStrategy(config: QueueStrategyConfig): void {
    this.config = config;
  }
  
  /**
   * Record execution metrics for adaptive scheduling
   */
  recordExecution(request: QueueRequest, success: boolean, responseTime: number): void {
    if (this.config.priorityStrategy !== 'adaptive') {
      return;
    }
    
    const priority = request.priority;
    const metrics = this.adaptiveMetrics.get(priority) || {
      successRate: 0,
      avgResponseTime: 0,
      requestCount: 0
    };
    
    // Update metrics with exponential moving average
    const alpha = 0.1; // Smoothing factor
    metrics.requestCount++;
    metrics.successRate = success ? 
      metrics.successRate + alpha * (1 - metrics.successRate) :
      metrics.successRate + alpha * (0 - metrics.successRate);
    
    metrics.avgResponseTime = metrics.avgResponseTime + alpha * (responseTime - metrics.avgResponseTime);
    
    this.adaptiveMetrics.set(priority, metrics);
    
    // Update adaptive priorities periodically
    const now = Date.now();
    if (now - this.lastAdaptiveUpdate > 60000) { // Update every minute
      this.updateAdaptivePriorities();
      this.lastAdaptiveUpdate = now;
    }
  }
  
  /**
   * FIFO scheduling - oldest requests first
   */
  private selectFIFO(requests: QueueRequest[]): QueueRequest {
    return requests.reduce((oldest, current) => 
      current.createdAt < oldest.createdAt ? current : oldest
    );
  }
  
  /**
   * LIFO scheduling - newest requests first
   */
  private selectLIFO(requests: QueueRequest[]): QueueRequest {
    return requests.reduce((newest, current) => 
      current.createdAt > newest.createdAt ? current : newest
    );
  }
  
  /**
   * Priority scheduling - highest priority first, then FIFO within priority
   */
  private selectPriority(requests: QueueRequest[]): QueueRequest {
    // Sort by priority (desc) then creation time (asc)
    return requests.sort((a, b) => {
      if (a.priority !== b.priority) {
        return b.priority - a.priority; // Higher priority first
      }
      return a.createdAt.getTime() - b.createdAt.getTime(); // Older first within priority
    })[0];
  }
  
  /**
   * Weighted priority scheduling with fairness considerations
   */
  private selectWeighted(requests: QueueRequest[]): QueueRequest {
    // Group requests by priority
    const priorityGroups = new Map<number, QueueRequest[]>();
    
    for (const request of requests) {
      if (!priorityGroups.has(request.priority)) {
        priorityGroups.set(request.priority, []);
      }
      priorityGroups.get(request.priority)!.push(request);
    }
    
    // Calculate weighted selection considering fairness
    let totalWeight = 0;
    const weightedGroups: Array<{ priority: number; weight: number; requests: QueueRequest[] }> = [];
    
    for (const [priority, groupRequests] of priorityGroups) {
      // Apply fairness adjustment - reduce weight for priorities that have been selected recently
      let weight = Math.pow(priority, 2); // Quadratic weighting for priority
      
      // Reduce weight based on recent selections (simple implementation)
      const oldestInGroup = groupRequests.reduce((oldest, current) =>
        current.createdAt < oldest.createdAt ? current : oldest
      );
      
      const ageMs = Date.now() - oldestInGroup.createdAt.getTime();
      const ageFactor = Math.min(ageMs / 60000, 2); // Max 2x boost for age (up to 1 minute)
      
      weight *= (1 + ageFactor);
      totalWeight += weight;
      
      weightedGroups.push({ priority, weight, requests: groupRequests });
    }
    
    // Select priority group based on weights
    const random = Math.random() * totalWeight;
    let currentWeight = 0;
    
    for (const group of weightedGroups) {
      currentWeight += group.weight;
      if (random <= currentWeight) {
        // Select oldest request from this priority group
        return group.requests.reduce((oldest, current) =>
          current.createdAt < oldest.createdAt ? current : oldest
        );
      }
    }
    
    // Fallback to priority selection
    return this.selectPriority(requests);
  }
  
  /**
   * Adaptive scheduling based on historical performance
   */
  private selectAdaptive(requests: QueueRequest[]): QueueRequest {
    // Calculate dynamic priorities based on success rates and response times
    const scoredRequests = requests.map(request => {
      const metrics = this.adaptiveMetrics.get(request.priority);
      
      let score = request.priority; // Base priority
      
      if (metrics) {
        // Boost score for high success rate
        score *= (0.5 + metrics.successRate * 0.5);
        
        // Penalize for high response time (normalize to reasonable range)
        const responseTimePenalty = Math.min(metrics.avgResponseTime / 5000, 1); // Max penalty at 5s
        score *= (1 - responseTimePenalty * 0.3);
        
        // Boost newer priority levels that haven't been tried much
        if (metrics.requestCount < 10) {
          score *= 1.2; // 20% boost for exploration
        }
      } else {
        // Unknown priority level, give exploration boost
        score *= 1.5;
      }
      
      // Age boost - older requests get higher priority
      const ageMs = Date.now() - request.createdAt.getTime();
      const ageBoost = Math.min(ageMs / 300000, 1); // Max boost at 5 minutes
      score *= (1 + ageBoost * 0.5);
      
      // Retry penalty - requests that have been retried get slightly lower priority
      score *= Math.pow(0.9, request.retryCount);
      
      return { request, score };
    });
    
    // Sort by adaptive score
    scoredRequests.sort((a, b) => b.score - a.score);
    
    return scoredRequests[0].request;
  }
  
  /**
   * Update adaptive priorities based on collected metrics
   */
  private updateAdaptivePriorities(): void {
    // This could dynamically adjust priority mappings based on performance
    // For now, we just clean up old metrics
    
    const now = Date.now();
    for (const [priority, metrics] of this.adaptiveMetrics) {
      // Decay metrics over time to adapt to changing conditions
      if (metrics.requestCount > 0) {
        metrics.successRate *= 0.95; // Slight decay
        metrics.avgResponseTime *= 0.95;
        metrics.requestCount = Math.max(0, metrics.requestCount - 1);
      }
      
      // Remove unused priority levels
      if (metrics.requestCount === 0 && metrics.successRate < 0.1) {
        this.adaptiveMetrics.delete(priority);
      }
    }
  }
  
  /**
   * Get current scheduling statistics
   */
  getStatistics(): Record<string, any> {
    return {
      strategy: this.config.priorityStrategy,
      adaptiveMetrics: Object.fromEntries(this.adaptiveMetrics),
      lastUpdate: new Date(this.lastAdaptiveUpdate)
    };
  }
  
  /**
   * Reset adaptive metrics
   */
  resetAdaptiveMetrics(): void {
    this.adaptiveMetrics.clear();
    this.lastAdaptiveUpdate = Date.now();
  }
}