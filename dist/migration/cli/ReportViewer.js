"use strict";
/**
 * Report viewer for CLI
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportViewer = void 0;
class ReportViewer {
    displaySummary(report) {
        console.log('Migration Summary:', report.summary);
    }
    displayAsTable(report) {
        console.table(report.summary);
    }
}
exports.ReportViewer = ReportViewer;
//# sourceMappingURL=ReportViewer.js.map