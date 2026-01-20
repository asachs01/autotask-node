"use strict";
/**
 * Referential Integrity Module
 *
 * Exports all referential integrity components for ensuring
 * data consistency across related entities.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.RelationshipGraph = exports.ReferentialAction = exports.RelationshipType = exports.defaultIntegrityManager = exports.ReferentialIntegrityManager = void 0;
var ReferentialIntegrityManager_1 = require("./ReferentialIntegrityManager");
// Core manager
Object.defineProperty(exports, "ReferentialIntegrityManager", { enumerable: true, get: function () { return ReferentialIntegrityManager_1.ReferentialIntegrityManager; } });
Object.defineProperty(exports, "defaultIntegrityManager", { enumerable: true, get: function () { return ReferentialIntegrityManager_1.defaultIntegrityManager; } });
// Types and interfaces
Object.defineProperty(exports, "RelationshipType", { enumerable: true, get: function () { return ReferentialIntegrityManager_1.RelationshipType; } });
Object.defineProperty(exports, "ReferentialAction", { enumerable: true, get: function () { return ReferentialIntegrityManager_1.ReferentialAction; } });
var RelationshipGraph_1 = require("./RelationshipGraph");
// Graph management
Object.defineProperty(exports, "RelationshipGraph", { enumerable: true, get: function () { return RelationshipGraph_1.RelationshipGraph; } });
//# sourceMappingURL=index.js.map