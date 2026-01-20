"use strict";
/**
 * Progress reporter for CLI
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProgressReporter = void 0;
class ProgressReporter {
    start(state) {
        console.log('Migration started');
    }
    update(progress) {
        console.log(`Progress: ${progress.percentComplete.toFixed(1)}%`);
    }
    complete() {
        console.log('Migration completed');
    }
}
exports.ProgressReporter = ProgressReporter;
//# sourceMappingURL=ProgressReporter.js.map