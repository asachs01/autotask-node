"use strict";
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
exports.QueryableEntity = exports.QueryBuilder = exports.RequestHandler = exports.getRetryDelay = exports.isRetryableError = exports.createAutotaskError = exports.ConfigurationError = exports.NetworkError = exports.ServerError = exports.NotFoundError = exports.RateLimitError = exports.ValidationError = exports.AuthError = exports.AutotaskError = void 0;
// Enhanced error handling exports
var errors_1 = require("../utils/errors");
Object.defineProperty(exports, "AutotaskError", { enumerable: true, get: function () { return errors_1.AutotaskError; } });
Object.defineProperty(exports, "AuthError", { enumerable: true, get: function () { return errors_1.AuthError; } });
Object.defineProperty(exports, "ValidationError", { enumerable: true, get: function () { return errors_1.ValidationError; } });
Object.defineProperty(exports, "RateLimitError", { enumerable: true, get: function () { return errors_1.RateLimitError; } });
Object.defineProperty(exports, "NotFoundError", { enumerable: true, get: function () { return errors_1.NotFoundError; } });
Object.defineProperty(exports, "ServerError", { enumerable: true, get: function () { return errors_1.ServerError; } });
Object.defineProperty(exports, "NetworkError", { enumerable: true, get: function () { return errors_1.NetworkError; } });
Object.defineProperty(exports, "ConfigurationError", { enumerable: true, get: function () { return errors_1.ConfigurationError; } });
Object.defineProperty(exports, "createAutotaskError", { enumerable: true, get: function () { return errors_1.createAutotaskError; } });
Object.defineProperty(exports, "isRetryableError", { enumerable: true, get: function () { return errors_1.isRetryableError; } });
Object.defineProperty(exports, "getRetryDelay", { enumerable: true, get: function () { return errors_1.getRetryDelay; } });
// Request handling exports
var requestHandler_1 = require("../utils/requestHandler");
Object.defineProperty(exports, "RequestHandler", { enumerable: true, get: function () { return requestHandler_1.RequestHandler; } });
// Query builder exports
__exportStar(require("./queryBuilder"), exports);
var queryBuilder_1 = require("../utils/queryBuilder");
Object.defineProperty(exports, "QueryBuilder", { enumerable: true, get: function () { return queryBuilder_1.QueryBuilder; } });
var queryableEntity_1 = require("../utils/queryableEntity");
Object.defineProperty(exports, "QueryableEntity", { enumerable: true, get: function () { return queryableEntity_1.QueryableEntity; } });
// Export utility types
__exportStar(require("../utils/errors"), exports);
__exportStar(require("../utils/requestHandler"), exports);
__exportStar(require("../utils/memoryOptimization"), exports);
__exportStar(require("../utils/performanceMonitor"), exports);
//# sourceMappingURL=index.js.map