/**
 * Post-migration validator
 */
import { ValidationResult, MigrationState } from '../types/MigrationTypes';
import { AutotaskClient } from '../../client/AutotaskClient';
export declare class PostMigrationValidator {
    private targetClient;
    private logger;
    constructor(targetClient: AutotaskClient);
    validate(entities: string[], migrationState: MigrationState): Promise<ValidationResult>;
}
//# sourceMappingURL=PostMigrationValidator.d.ts.map