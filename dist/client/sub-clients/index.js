"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportsClient = exports.InventoryClient = exports.KnowledgeClient = exports.TimeTrackingClient = exports.ConfigurationClient = exports.FinancialClient = exports.ContractClient = exports.CoreClient = exports.BaseSubClient = void 0;
// Base sub-client exports
var BaseSubClient_1 = require("../base/BaseSubClient");
Object.defineProperty(exports, "BaseSubClient", { enumerable: true, get: function () { return BaseSubClient_1.BaseSubClient; } });
// Sub-client exports
var CoreClient_1 = require("./CoreClient");
Object.defineProperty(exports, "CoreClient", { enumerable: true, get: function () { return CoreClient_1.CoreClient; } });
var ContractClient_1 = require("./ContractClient");
Object.defineProperty(exports, "ContractClient", { enumerable: true, get: function () { return ContractClient_1.ContractClient; } });
var FinancialClient_1 = require("./FinancialClient");
Object.defineProperty(exports, "FinancialClient", { enumerable: true, get: function () { return FinancialClient_1.FinancialClient; } });
var ConfigurationClient_1 = require("./ConfigurationClient");
Object.defineProperty(exports, "ConfigurationClient", { enumerable: true, get: function () { return ConfigurationClient_1.ConfigurationClient; } });
var TimeTrackingClient_1 = require("./TimeTrackingClient");
Object.defineProperty(exports, "TimeTrackingClient", { enumerable: true, get: function () { return TimeTrackingClient_1.TimeTrackingClient; } });
var KnowledgeClient_1 = require("./KnowledgeClient");
Object.defineProperty(exports, "KnowledgeClient", { enumerable: true, get: function () { return KnowledgeClient_1.KnowledgeClient; } });
var InventoryClient_1 = require("./InventoryClient");
Object.defineProperty(exports, "InventoryClient", { enumerable: true, get: function () { return InventoryClient_1.InventoryClient; } });
var ReportsClient_1 = require("./ReportsClient");
Object.defineProperty(exports, "ReportsClient", { enumerable: true, get: function () { return ReportsClient_1.ReportsClient; } });
//# sourceMappingURL=index.js.map