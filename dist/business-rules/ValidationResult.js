"use strict";
/**
 * Validation Result for Business Rules
 *
 * Provides detailed information about validation outcomes,
 * including errors, warnings, and affected fields.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationResult = exports.ValidationSeverity = void 0;
/**
 * Severity levels for validation issues
 */
var ValidationSeverity;
(function (ValidationSeverity) {
    ValidationSeverity["ERROR"] = "error";
    ValidationSeverity["WARNING"] = "warning";
    ValidationSeverity["INFO"] = "info";
})(ValidationSeverity || (exports.ValidationSeverity = ValidationSeverity = {}));
/**
 * Result of validation operations
 */
class ValidationResult {
    constructor(issues) {
        this.issues = [];
        this.metadata = {};
        if (issues) {
            this.issues = [...issues];
        }
    }
    /**
     * Check if validation passed (no errors)
     */
    get isValid() {
        return !this.hasErrors();
    }
    /**
     * Check if there are any errors
     */
    hasErrors() {
        return this.issues.some(issue => issue.severity === ValidationSeverity.ERROR);
    }
    /**
     * Check if there are any warnings
     */
    hasWarnings() {
        return this.issues.some(issue => issue.severity === ValidationSeverity.WARNING);
    }
    /**
     * Check if there are any info messages
     */
    hasInfo() {
        return this.issues.some(issue => issue.severity === ValidationSeverity.INFO);
    }
    /**
     * Add an error issue
     */
    addError(code, message, fields, context) {
        this.issues.push({
            severity: ValidationSeverity.ERROR,
            code,
            message,
            fields,
            context
        });
    }
    /**
     * Add a warning issue
     */
    addWarning(code, message, fields, context) {
        this.issues.push({
            severity: ValidationSeverity.WARNING,
            code,
            message,
            fields,
            context
        });
    }
    /**
     * Add an info issue
     */
    addInfo(code, message, fields, context) {
        this.issues.push({
            severity: ValidationSeverity.INFO,
            code,
            message,
            fields,
            context
        });
    }
    /**
     * Add a validation issue
     */
    addIssue(issue) {
        this.issues.push(issue);
    }
    /**
     * Get all issues
     */
    getIssues() {
        return [...this.issues];
    }
    /**
     * Get issues by severity
     */
    getIssuesBySeverity(severity) {
        return this.issues.filter(issue => issue.severity === severity);
    }
    /**
     * Get issues for specific field(s)
     */
    getIssuesForField(field) {
        return this.issues.filter(issue => issue.fields && issue.fields.includes(field));
    }
    /**
     * Get errors only
     */
    getErrors() {
        return this.getIssuesBySeverity(ValidationSeverity.ERROR);
    }
    /**
     * Get warnings only
     */
    getWarnings() {
        return this.getIssuesBySeverity(ValidationSeverity.WARNING);
    }
    /**
     * Merge another validation result into this one
     */
    merge(other) {
        this.issues.push(...other.getIssues());
        Object.assign(this.metadata, other.getMetadata());
    }
    /**
     * Set metadata for the validation result
     */
    setMetadata(key, value) {
        this.metadata[key] = value;
    }
    /**
     * Get metadata
     */
    getMetadata() {
        return { ...this.metadata };
    }
    /**
     * Get a specific metadata value
     */
    getMetadataValue(key) {
        return this.metadata[key];
    }
    /**
     * Clear all issues
     */
    clear() {
        this.issues = [];
        this.metadata = {};
    }
    /**
     * Create a summary of the validation result
     */
    getSummary() {
        const affectedFields = new Set();
        this.issues.forEach(issue => {
            if (issue.fields) {
                issue.fields.forEach(field => affectedFields.add(field));
            }
        });
        return {
            isValid: this.isValid,
            errorCount: this.getErrors().length,
            warningCount: this.getWarnings().length,
            infoCount: this.getIssuesBySeverity(ValidationSeverity.INFO).length,
            affectedFields: Array.from(affectedFields)
        };
    }
    /**
     * Convert to a formatted string for logging
     */
    toString() {
        if (this.isValid && this.issues.length === 0) {
            return 'Validation passed';
        }
        const summary = this.getSummary();
        const lines = [`Validation ${summary.isValid ? 'passed with issues' : 'failed'}:`];
        if (summary.errorCount > 0) {
            lines.push(`  Errors: ${summary.errorCount}`);
        }
        if (summary.warningCount > 0) {
            lines.push(`  Warnings: ${summary.warningCount}`);
        }
        if (summary.infoCount > 0) {
            lines.push(`  Info: ${summary.infoCount}`);
        }
        this.issues.forEach(issue => {
            const fields = issue.fields ? ` [${issue.fields.join(', ')}]` : '';
            lines.push(`  ${issue.severity.toUpperCase()}: ${issue.message}${fields}`);
        });
        return lines.join('\n');
    }
    /**
     * Convert to JSON
     */
    toJSON() {
        return {
            isValid: this.isValid,
            issues: this.issues,
            metadata: this.metadata,
            summary: this.getSummary()
        };
    }
    /**
     * Create a successful validation result
     */
    static success() {
        return new ValidationResult();
    }
    /**
     * Create a failed validation result with an error
     */
    static error(code, message, fields) {
        const result = new ValidationResult();
        result.addError(code, message, fields);
        return result;
    }
    /**
     * Create a validation result from multiple results
     */
    static merge(...results) {
        const merged = new ValidationResult();
        results.forEach(result => merged.merge(result));
        return merged;
    }
}
exports.ValidationResult = ValidationResult;
//# sourceMappingURL=ValidationResult.js.map