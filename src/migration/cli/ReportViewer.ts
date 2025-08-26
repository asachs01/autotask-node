/**
 * Report viewer for CLI
 */

import { MigrationReport } from '../types/MigrationTypes';

export class ReportViewer {
  displaySummary(report: MigrationReport): void {
    console.log('Migration Summary:', report.summary);
  }

  displayAsTable(report: MigrationReport): void {
    console.table(report.summary);
  }
}