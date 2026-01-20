"use strict";
/**
 * Comprehensive validation system for Autotask entities
 *
 * Includes field-level, entity-level, and cross-entity validators
 * that enforce business rules and data integrity
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
exports.ServiceCallResourceValidator = exports.ConfigurationItemCompanyValidator = exports.BillingCodeContractValidator = exports.ProjectCompanyResourceValidator = exports.ContractCompanyServiceValidator = exports.TimeEntryProjectTicketValidator = exports.TicketCompanyContactValidator = exports.BaseCrossEntityValidator = exports.ProjectResourceValidator = exports.ContractServiceValidator = exports.TimeEntryBillingValidator = exports.ContactMultiCompanyValidator = exports.CompanyHierarchyValidator = exports.TicketSLAValidator = exports.TicketStatusWorkflowValidator = exports.BaseEntityValidator = exports.DependsOnValidator = exports.RegexValidator = exports.LengthValidator = exports.NumericRangeValidator = exports.DateRangeValidator = exports.PhoneValidator = exports.EmailValidator = exports.RequiredValidator = void 0;
__exportStar(require("./FieldValidators"), exports);
__exportStar(require("./EntityValidators"), exports);
__exportStar(require("./CrossEntityValidators"), exports);
// Re-export common validators for convenience
var FieldValidators_1 = require("./FieldValidators");
Object.defineProperty(exports, "RequiredValidator", { enumerable: true, get: function () { return FieldValidators_1.RequiredValidator; } });
Object.defineProperty(exports, "EmailValidator", { enumerable: true, get: function () { return FieldValidators_1.EmailValidator; } });
Object.defineProperty(exports, "PhoneValidator", { enumerable: true, get: function () { return FieldValidators_1.PhoneValidator; } });
Object.defineProperty(exports, "DateRangeValidator", { enumerable: true, get: function () { return FieldValidators_1.DateRangeValidator; } });
Object.defineProperty(exports, "NumericRangeValidator", { enumerable: true, get: function () { return FieldValidators_1.NumericRangeValidator; } });
Object.defineProperty(exports, "LengthValidator", { enumerable: true, get: function () { return FieldValidators_1.LengthValidator; } });
Object.defineProperty(exports, "RegexValidator", { enumerable: true, get: function () { return FieldValidators_1.RegexValidator; } });
Object.defineProperty(exports, "DependsOnValidator", { enumerable: true, get: function () { return FieldValidators_1.DependsOnValidator; } });
var EntityValidators_1 = require("./EntityValidators");
Object.defineProperty(exports, "BaseEntityValidator", { enumerable: true, get: function () { return EntityValidators_1.BaseEntityValidator; } });
Object.defineProperty(exports, "TicketStatusWorkflowValidator", { enumerable: true, get: function () { return EntityValidators_1.TicketStatusWorkflowValidator; } });
Object.defineProperty(exports, "TicketSLAValidator", { enumerable: true, get: function () { return EntityValidators_1.TicketSLAValidator; } });
Object.defineProperty(exports, "CompanyHierarchyValidator", { enumerable: true, get: function () { return EntityValidators_1.CompanyHierarchyValidator; } });
Object.defineProperty(exports, "ContactMultiCompanyValidator", { enumerable: true, get: function () { return EntityValidators_1.ContactMultiCompanyValidator; } });
Object.defineProperty(exports, "TimeEntryBillingValidator", { enumerable: true, get: function () { return EntityValidators_1.TimeEntryBillingValidator; } });
Object.defineProperty(exports, "ContractServiceValidator", { enumerable: true, get: function () { return EntityValidators_1.ContractServiceValidator; } });
Object.defineProperty(exports, "ProjectResourceValidator", { enumerable: true, get: function () { return EntityValidators_1.ProjectResourceValidator; } });
var CrossEntityValidators_1 = require("./CrossEntityValidators");
Object.defineProperty(exports, "BaseCrossEntityValidator", { enumerable: true, get: function () { return CrossEntityValidators_1.BaseCrossEntityValidator; } });
Object.defineProperty(exports, "TicketCompanyContactValidator", { enumerable: true, get: function () { return CrossEntityValidators_1.TicketCompanyContactValidator; } });
Object.defineProperty(exports, "TimeEntryProjectTicketValidator", { enumerable: true, get: function () { return CrossEntityValidators_1.TimeEntryProjectTicketValidator; } });
Object.defineProperty(exports, "ContractCompanyServiceValidator", { enumerable: true, get: function () { return CrossEntityValidators_1.ContractCompanyServiceValidator; } });
Object.defineProperty(exports, "ProjectCompanyResourceValidator", { enumerable: true, get: function () { return CrossEntityValidators_1.ProjectCompanyResourceValidator; } });
Object.defineProperty(exports, "BillingCodeContractValidator", { enumerable: true, get: function () { return CrossEntityValidators_1.BillingCodeContractValidator; } });
Object.defineProperty(exports, "ConfigurationItemCompanyValidator", { enumerable: true, get: function () { return CrossEntityValidators_1.ConfigurationItemCompanyValidator; } });
Object.defineProperty(exports, "ServiceCallResourceValidator", { enumerable: true, get: function () { return CrossEntityValidators_1.ServiceCallResourceValidator; } });
//# sourceMappingURL=index.js.map