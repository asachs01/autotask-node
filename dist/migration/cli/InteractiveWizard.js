"use strict";
/**
 * Interactive CLI wizard for migration setup
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.InteractiveWizard = void 0;
const MigrationTypes_1 = require("../types/MigrationTypes");
class InteractiveWizard {
    async run() {
        // Placeholder implementation
        return {
            source: {
                system: MigrationTypes_1.PSASystem.CSV_IMPORT,
                connectionConfig: { baseUrl: '', credentials: {} },
                entities: ['companies']
            },
            target: {
                autotaskConfig: {
                    baseUrl: '',
                    username: '',
                    secret: '',
                    integrationCode: ''
                },
                zoneId: 'zone1'
            },
            mapping: {
                rules: []
            },
            validation: {
                preValidation: true,
                postValidation: true,
                qualityChecks: true,
                duplicateDetection: true
            },
            options: {
                dryRun: false,
                skipErrors: false,
                maxRetries: 3
            }
        };
    }
}
exports.InteractiveWizard = InteractiveWizard;
//# sourceMappingURL=InteractiveWizard.js.map