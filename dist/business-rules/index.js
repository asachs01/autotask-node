"use strict";
/**
 * Business Rules Module
 *
 * Comprehensive business rule enforcement system for the Autotask SDK.
 * Provides validation, cross-field rules, entity-specific rules, and
 * seamless integration with the AutotaskClient.
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
exports.ValidateEntity = exports.ValidationError = exports.BusinessRuleEnhancedClient = exports.BusinessRuleMiddleware = exports.DefaultRuleConfiguration = exports.RuleConfigurationManager = exports.BusinessRuleEngine = exports.RulePriority = exports.ValidationSeverity = void 0;
// Core components
__exportStar(require("./BusinessRule"), exports);
__exportStar(require("./ValidationResult"), exports);
__exportStar(require("./BusinessRuleEngine"), exports);
// Rule types
__exportStar(require("./CrossFieldRules"), exports);
__exportStar(require("./EntityRules"), exports);
// Configuration
__exportStar(require("./RuleConfiguration"), exports);
// Client integration
__exportStar(require("./ClientIntegration"), exports);
// Re-export commonly used types and classes for convenience
var ValidationResult_1 = require("./ValidationResult");
Object.defineProperty(exports, "ValidationSeverity", { enumerable: true, get: function () { return ValidationResult_1.ValidationSeverity; } });
var BusinessRule_1 = require("./BusinessRule");
Object.defineProperty(exports, "RulePriority", { enumerable: true, get: function () { return BusinessRule_1.RulePriority; } });
var BusinessRuleEngine_1 = require("./BusinessRuleEngine");
Object.defineProperty(exports, "BusinessRuleEngine", { enumerable: true, get: function () { return BusinessRuleEngine_1.BusinessRuleEngine; } });
var RuleConfiguration_1 = require("./RuleConfiguration");
Object.defineProperty(exports, "RuleConfigurationManager", { enumerable: true, get: function () { return RuleConfiguration_1.RuleConfigurationManager; } });
Object.defineProperty(exports, "DefaultRuleConfiguration", { enumerable: true, get: function () { return RuleConfiguration_1.DefaultRuleConfiguration; } });
var ClientIntegration_1 = require("./ClientIntegration");
Object.defineProperty(exports, "BusinessRuleMiddleware", { enumerable: true, get: function () { return ClientIntegration_1.BusinessRuleMiddleware; } });
Object.defineProperty(exports, "BusinessRuleEnhancedClient", { enumerable: true, get: function () { return ClientIntegration_1.BusinessRuleEnhancedClient; } });
Object.defineProperty(exports, "ValidationError", { enumerable: true, get: function () { return ClientIntegration_1.ValidationError; } });
Object.defineProperty(exports, "ValidateEntity", { enumerable: true, get: function () { return ClientIntegration_1.ValidateEntity; } });
//# sourceMappingURL=index.js.map