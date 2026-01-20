"use strict";
/**
 * Queue System - Main Export
 *
 * Enterprise-grade offline queue system with comprehensive fault tolerance
 * and error recovery capabilities for the Autotask SDK.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnhancedAutotaskClient = exports.validateQueueConfiguration = exports.createDefaultConfiguration = exports.createQueueManager = exports.QueueMonitor = exports.BatchManager = exports.CircuitBreakerManager = exports.PriorityScheduler = exports.RedisBackend = exports.SQLiteBackend = exports.MemoryBackend = exports.QueueManager = void 0;
// Core components
var QueueManager_1 = require("./core/QueueManager");
Object.defineProperty(exports, "QueueManager", { enumerable: true, get: function () { return QueueManager_1.QueueManager; } });
// Storage backends
var MemoryBackend_1 = require("./backends/MemoryBackend");
Object.defineProperty(exports, "MemoryBackend", { enumerable: true, get: function () { return MemoryBackend_1.MemoryBackend; } });
var SQLiteBackend_1 = require("./backends/SQLiteBackend");
Object.defineProperty(exports, "SQLiteBackend", { enumerable: true, get: function () { return SQLiteBackend_1.SQLiteBackend; } });
var RedisBackend_1 = require("./backends/RedisBackend");
Object.defineProperty(exports, "RedisBackend", { enumerable: true, get: function () { return RedisBackend_1.RedisBackend; } });
// Strategy components
var PriorityScheduler_1 = require("./strategies/PriorityScheduler");
Object.defineProperty(exports, "PriorityScheduler", { enumerable: true, get: function () { return PriorityScheduler_1.PriorityScheduler; } });
var CircuitBreakerManager_1 = require("./strategies/CircuitBreakerManager");
Object.defineProperty(exports, "CircuitBreakerManager", { enumerable: true, get: function () { return CircuitBreakerManager_1.CircuitBreakerManager; } });
var BatchManager_1 = require("./strategies/BatchManager");
Object.defineProperty(exports, "BatchManager", { enumerable: true, get: function () { return BatchManager_1.BatchManager; } });
// Monitoring
var QueueMonitor_1 = require("./monitoring/QueueMonitor");
Object.defineProperty(exports, "QueueMonitor", { enumerable: true, get: function () { return QueueMonitor_1.QueueMonitor; } });
// Types
__exportStar(require("./types/QueueTypes"), exports);
// Utility functions
var QueueFactory_1 = require("./utils/QueueFactory");
Object.defineProperty(exports, "createQueueManager", { enumerable: true, get: function () { return QueueFactory_1.createQueueManager; } });
Object.defineProperty(exports, "createDefaultConfiguration", { enumerable: true, get: function () { return QueueFactory_1.createDefaultConfiguration; } });
Object.defineProperty(exports, "validateQueueConfiguration", { enumerable: true, get: function () { return QueueFactory_1.validateQueueConfiguration; } });
/**
 * Re-export enhanced client with queue integration
 */
var EnhancedAutotaskClient_1 = require("../client/EnhancedAutotaskClient");
Object.defineProperty(exports, "EnhancedAutotaskClient", { enumerable: true, get: function () { return EnhancedAutotaskClient_1.EnhancedAutotaskClient; } });
//# sourceMappingURL=index.js.map