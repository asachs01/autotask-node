"use strict";
/**
 * Entity-specific business logic classes
 *
 * Each class provides specialized business logic, validation,
 * and workflow management for specific Autotask entities
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectBusinessLogic = exports.ContractBusinessLogic = exports.ContactBusinessLogic = exports.CompanyBusinessLogic = exports.TimeEntryBusinessLogic = exports.TicketBusinessLogic = void 0;
var TicketBusinessLogic_1 = require("./TicketBusinessLogic");
Object.defineProperty(exports, "TicketBusinessLogic", { enumerable: true, get: function () { return TicketBusinessLogic_1.TicketBusinessLogic; } });
var TimeEntryBusinessLogic_1 = require("./TimeEntryBusinessLogic");
Object.defineProperty(exports, "TimeEntryBusinessLogic", { enumerable: true, get: function () { return TimeEntryBusinessLogic_1.TimeEntryBusinessLogic; } });
// Additional entity business logic classes
var CompanyBusinessLogic_1 = require("./CompanyBusinessLogic");
Object.defineProperty(exports, "CompanyBusinessLogic", { enumerable: true, get: function () { return CompanyBusinessLogic_1.CompanyBusinessLogic; } });
var ContactBusinessLogic_1 = require("./ContactBusinessLogic");
Object.defineProperty(exports, "ContactBusinessLogic", { enumerable: true, get: function () { return ContactBusinessLogic_1.ContactBusinessLogic; } });
var ContractBusinessLogic_1 = require("./ContractBusinessLogic");
Object.defineProperty(exports, "ContractBusinessLogic", { enumerable: true, get: function () { return ContractBusinessLogic_1.ContractBusinessLogic; } });
var ProjectBusinessLogic_1 = require("./ProjectBusinessLogic");
Object.defineProperty(exports, "ProjectBusinessLogic", { enumerable: true, get: function () { return ProjectBusinessLogic_1.ProjectBusinessLogic; } });
//# sourceMappingURL=index.js.map