/**
 * Checkpoint manager for migration recovery
 */
import { MigrationCheckpoint } from '../types/MigrationTypes';
export declare class CheckpointManager {
    saveCheckpoint(checkpoint: MigrationCheckpoint): Promise<void>;
    loadCheckpoint(checkpointId: string): Promise<MigrationCheckpoint>;
}
//# sourceMappingURL=CheckpointManager.d.ts.map