"use strict";
/**
 * Configuration builder for migration setup
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigBuilder = void 0;
class ConfigBuilder {
    async createBasicConfig(system) {
        return {
            source: {
                system,
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
exports.ConfigBuilder = ConfigBuilder;
//# sourceMappingURL=ConfigBuilder.js.map