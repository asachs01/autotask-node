/**
 * Progress reporter for CLI
 */
import { MigrationState, MigrationProgress } from '../types/MigrationTypes';
export declare class ProgressReporter {
    start(state: MigrationState): void;
    update(progress: MigrationProgress): void;
    complete(): void;
}
//# sourceMappingURL=ProgressReporter.d.ts.map