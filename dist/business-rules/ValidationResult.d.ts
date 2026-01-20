/**
 * Validation Result for Business Rules
 *
 * Provides detailed information about validation outcomes,
 * including errors, warnings, and affected fields.
 */
/**
 * Severity levels for validation issues
 */
export declare enum ValidationSeverity {
    ERROR = "error",
    WARNING = "warning",
    INFO = "info"
}
/**
 * Individual validation issue
 */
export interface ValidationIssue {
    /** Severity of the issue */
    severity: ValidationSeverity;
    /** Error code for programmatic handling */
    code: string;
    /** Human-readable message */
    message: string;
    /** Field(s) affected by this issue */
    fields?: string[];
    /** Additional context information */
    context?: Record<string, any>;
    /** Rule that generated this issue */
    ruleName?: string;
    /** Suggested fix or action */
    suggestion?: string;
}
/**
 * Result of validation operations
 */
export declare class ValidationResult {
    private issues;
    private metadata;
    constructor(issues?: ValidationIssue[]);
    /**
     * Check if validation passed (no errors)
     */
    get isValid(): boolean;
    /**
     * Check if there are any errors
     */
    hasErrors(): boolean;
    /**
     * Check if there are any warnings
     */
    hasWarnings(): boolean;
    /**
     * Check if there are any info messages
     */
    hasInfo(): boolean;
    /**
     * Add an error issue
     */
    addError(code: string, message: string, fields?: string[], context?: Record<string, any>): void;
    /**
     * Add a warning issue
     */
    addWarning(code: string, message: string, fields?: string[], context?: Record<string, any>): void;
    /**
     * Add an info issue
     */
    addInfo(code: string, message: string, fields?: string[], context?: Record<string, any>): void;
    /**
     * Add a validation issue
     */
    addIssue(issue: ValidationIssue): void;
    /**
     * Get all issues
     */
    getIssues(): ValidationIssue[];
    /**
     * Get issues by severity
     */
    getIssuesBySeverity(severity: ValidationSeverity): ValidationIssue[];
    /**
     * Get issues for specific field(s)
     */
    getIssuesForField(field: string): ValidationIssue[];
    /**
     * Get errors only
     */
    getErrors(): ValidationIssue[];
    /**
     * Get warnings only
     */
    getWarnings(): ValidationIssue[];
    /**
     * Merge another validation result into this one
     */
    merge(other: ValidationResult): void;
    /**
     * Set metadata for the validation result
     */
    setMetadata(key: string, value: any): void;
    /**
     * Get metadata
     */
    getMetadata(): Record<string, any>;
    /**
     * Get a specific metadata value
     */
    getMetadataValue(key: string): any;
    /**
     * Clear all issues
     */
    clear(): void;
    /**
     * Create a summary of the validation result
     */
    getSummary(): {
        isValid: boolean;
        errorCount: number;
        warningCount: number;
        infoCount: number;
        affectedFields: string[];
    };
    /**
     * Convert to a formatted string for logging
     */
    toString(): string;
    /**
     * Convert to JSON
     */
    toJSON(): any;
    /**
     * Create a successful validation result
     */
    static success(): ValidationResult;
    /**
     * Create a failed validation result with an error
     */
    static error(code: string, message: string, fields?: string[]): ValidationResult;
    /**
     * Create a validation result from multiple results
     */
    static merge(...results: ValidationResult[]): ValidationResult;
}
//# sourceMappingURL=ValidationResult.d.ts.map