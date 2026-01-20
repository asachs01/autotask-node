"use strict";
/**
 * Enhanced error handling system for Autotask business logic
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
exports.ErrorAggregator = exports.ErrorFactory = exports.ConfigurationError = exports.DataIntegrityError = exports.BusinessRuleViolationError = exports.PermissionError = exports.WorkflowError = exports.ValidationError = exports.BusinessLogicError = void 0;
__exportStar(require("./BusinessLogicErrors"), exports);
var BusinessLogicErrors_1 = require("./BusinessLogicErrors");
Object.defineProperty(exports, "BusinessLogicError", { enumerable: true, get: function () { return BusinessLogicErrors_1.BusinessLogicError; } });
Object.defineProperty(exports, "ValidationError", { enumerable: true, get: function () { return BusinessLogicErrors_1.ValidationError; } });
Object.defineProperty(exports, "WorkflowError", { enumerable: true, get: function () { return BusinessLogicErrors_1.WorkflowError; } });
Object.defineProperty(exports, "PermissionError", { enumerable: true, get: function () { return BusinessLogicErrors_1.PermissionError; } });
Object.defineProperty(exports, "BusinessRuleViolationError", { enumerable: true, get: function () { return BusinessLogicErrors_1.BusinessRuleViolationError; } });
Object.defineProperty(exports, "DataIntegrityError", { enumerable: true, get: function () { return BusinessLogicErrors_1.DataIntegrityError; } });
Object.defineProperty(exports, "ConfigurationError", { enumerable: true, get: function () { return BusinessLogicErrors_1.ConfigurationError; } });
Object.defineProperty(exports, "ErrorFactory", { enumerable: true, get: function () { return BusinessLogicErrors_1.ErrorFactory; } });
Object.defineProperty(exports, "ErrorAggregator", { enumerable: true, get: function () { return BusinessLogicErrors_1.ErrorAggregator; } });
//# sourceMappingURL=index.js.map