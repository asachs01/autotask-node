/**
 * Mapping helper utilities
 */

import { MappingRule, PSASystem, DataType } from '../types/MigrationTypes';

export function createMappingRules(
  sourceSystem: PSASystem,
  entityMappings: Record<string, Record<string, string>>
): MappingRule[] {
  const rules: MappingRule[] = [];

  for (const [sourceEntity, fieldMappings] of Object.entries(entityMappings)) {
    const fieldMappingArray = Object.entries(fieldMappings).map(([sourceField, targetField]) => ({
      sourceField,
      targetField,
      required: false,
      dataType: DataType.STRING
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