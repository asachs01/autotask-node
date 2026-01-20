"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LatencyBenchmark = void 0;
const events_1 = require("events");
/**
 * Latency benchmark implementation
 */
class LatencyBenchmark extends events_1.EventEmitter {
    constructor(logger) {
        super();
        this.logger = logger;
        this.isRunning = false;
    }
    async run(config) {
        this.isRunning = true;
        const iterations = config.iterations || 1000;
        const latencies = [];
        const timeline = [];
        try {
            for (let i = 0; i < iterations; i++) {
                const start = Date.now();
                // Simulate request latency
                await new Promise(resolve => setTimeout(resolve, Math.random() * 200 + 50));
                const latency = Date.now() - start;
                latencies.push(latency);
                if (i % 50 === 0) {
                    timeline.push({ timestamp: Date.now(), latency });
                    this.emit('progress', (i / iterations) * 100);
                }
            }
            latencies.sort((a, b) => a - b);
            const average = latencies.reduce((sum, l) => sum + l, 0) / latencies.length;
            const minimum = latencies[0];
            const maximum = latencies[latencies.length - 1];
            return {
                average,
                minimum,
                maximum,
                standardDeviation: this.calculateStandardDeviation(latencies, average),
                percentiles: {
                    p50: this.calculatePercentile(latencies, 50),
                    p75: this.calculatePercentile(latencies, 75),
                    p90: this.calculatePercentile(latencies, 90),
                    p95: this.calculatePercentile(latencies, 95),
                    p99: this.calculatePercentile(latencies, 99),
                    p99_9: this.calculatePercentile(latencies, 99.9)
                },
                distribution: this.calculateDistribution(latencies),
                timeline
            };
        }
        finally {
            this.isRunning = false;
        }
    }
    async stop() {
        this.isRunning = false;
    }
    calculatePercentile(sortedArray, percentile) {
        const index = Math.ceil((percentile / 100) * sortedArray.length) - 1;
        return sortedArray[Math.max(0, Math.min(index, sortedArray.length - 1))];
    }
    calculateStandardDeviation(values, mean) {
        const squaredDifferences = values.map(value => Math.pow(value - mean, 2));
        const avgSquaredDiff = squaredDifferences.reduce((sum, diff) => sum + diff, 0) / values.length;
        return Math.sqrt(avgSquaredDiff);
    }
    calculateDistribution(latencies) {
        const ranges = [
            { min: 0, max: 100, label: '0-100ms' },
            { min: 100, max: 200, label: '100-200ms' },
            { min: 200, max: 500, label: '200-500ms' },
            { min: 500, max: 1000, label: '500ms-1s' },
            { min: 1000, max: Infinity, label: '>1s' }
        ];
        const total = latencies.length;
        return ranges.map(range => {
            const count = latencies.filter(l => l >= range.min && l < range.max).length;
            return {
                range: range.label,
                count,
                percentage: (count / total) * 100
            };
        });
    }
}
exports.LatencyBenchmark = LatencyBenchmark;
//# sourceMappingURL=LatencyBenchmark.js.map