"use strict";
/**
 * Mapping helper utilities
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMappingRules = createMappingRules;
const MigrationTypes_1 = require("../types/MigrationTypes");
function createMappingRules(sourceSystem, entityMappings) {
    const rules = [];
    for (const [sourceEntity, fieldMappings] of Object.entries(entityMappings)) {
        const fieldMappingArray = Object.entries(fieldMappings).map(([sourceField, targetField]) => ({
            sourceField,
            targetField,
            required: false,
            dataType: MigrationTypes_1.DataType.STRING
        }));
        rules.push({
            sourceEntity,
            targetEntity: sourceEntity,
            fieldMappings: fieldMappingArray,
            conditions: [],
            transformations: []
        });
    }
    return rules;
}
//# sourceMappingURL=mappingHelpers.js.map