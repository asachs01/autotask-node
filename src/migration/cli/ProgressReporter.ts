/**
 * Progress reporter for CLI
 */

import { MigrationState, MigrationProgress } from '../types/MigrationTypes';

export class ProgressReporter {
  start(state: MigrationState): void {
    console.log('Migration started');
  }

  update(progress: MigrationProgress): void {
    console.log(`Progress: ${progress.percentComplete.toFixed(1)}%`);
  }

  complete(): void {
    console.log('Migration completed');
  }
}