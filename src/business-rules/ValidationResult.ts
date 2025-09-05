/**
 * Validation Result for Business Rules
 * 
 * Provides detailed information about validation outcomes,
 * including errors, warnings, and affected fields.
 */

/**
 * Severity levels for validation issues
 */
export enum ValidationSeverity {
  ERROR = 'error',
  WARNING = 'warning',
  INFO = 'info'
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
export class ValidationResult {
  private issues: ValidationIssue[] = [];
  private metadata: Record<string, any> = {};
  
  constructor(issues?: ValidationIssue[]) {
    if (issues) {
      this.issues = [...issues];
    }
  }
  
  /**
   * Check if validation passed (no errors)
   */
  get isValid(): boolean {
    return !this.hasErrors();
  }
  
  /**
   * Check if there are any errors
   */
  hasErrors(): boolean {
    return this.issues.some(issue => issue.severity === ValidationSeverity.ERROR);
  }
  
  /**
   * Check if there are any warnings
   */
  hasWarnings(): boolean {
    return this.issues.some(issue => issue.severity === ValidationSeverity.WARNING);
  }
  
  /**
   * Check if there are any info messages
   */
  hasInfo(): boolean {
    return this.issues.some(issue => issue.severity === ValidationSeverity.INFO);
  }
  
  /**
   * Add an error issue
   */
  addError(
    code: string,
    message: string,
    fields?: string[],
    context?: Record<string, any>
  ): void {
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
  addWarning(
    code: string,
    message: string,
    fields?: string[],
    context?: Record<string, any>
  ): void {
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
  addInfo(
    code: string,
    message: string,
    fields?: string[],
    context?: Record<string, any>
  ): void {
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
  addIssue(issue: ValidationIssue): void {
    this.issues.push(issue);
  }
  
  /**
   * Get all issues
   */
  getIssues(): ValidationIssue[] {
    return [...this.issues];
  }
  
  /**
   * Get issues by severity
   */
  getIssuesBySeverity(severity: ValidationSeverity): ValidationIssue[] {
    return this.issues.filter(issue => issue.severity === severity);
  }
  
  /**
   * Get issues for specific field(s)
   */
  getIssuesForField(field: string): ValidationIssue[] {
    return this.issues.filter(issue => 
      issue.fields && issue.fields.includes(field)
    );
  }
  
  /**
   * Get errors only
   */
  getErrors(): ValidationIssue[] {
    return this.getIssuesBySeverity(ValidationSeverity.ERROR);
  }
  
  /**
   * Get warnings only
   */
  getWarnings(): ValidationIssue[] {
    return this.getIssuesBySeverity(ValidationSeverity.WARNING);
  }
  
  /**
   * Merge another validation result into this one
   */
  merge(other: ValidationResult): void {
    this.issues.push(...other.getIssues());
    Object.assign(this.metadata, other.getMetadata());
  }
  
  /**
   * Set metadata for the validation result
   */
  setMetadata(key: string, value: any): void {
    this.metadata[key] = value;
  }
  
  /**
   * Get metadata
   */
  getMetadata(): Record<string, any> {
    return { ...this.metadata };
  }
  
  /**
   * Get a specific metadata value
   */
  getMetadataValue(key: string): any {
    return this.metadata[key];
  }
  
  /**
   * Clear all issues
   */
  clear(): void {
    this.issues = [];
    this.metadata = {};
  }
  
  /**
   * Create a summary of the validation result
   */
  getSummary(): {
    isValid: boolean;
    errorCount: number;
    warningCount: number;
    infoCount: number;
    affectedFields: string[];
  } {
    const affectedFields = new Set<string>();
    
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
  toString(): string {
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
  toJSON(): any {
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
  static success(): ValidationResult {
    return new ValidationResult();
  }
  
  /**
   * Create a failed validation result with an error
   */
  static error(code: string, message: string, fields?: string[]): ValidationResult {
    const result = new ValidationResult();
    result.addError(code, message, fields);
    return result;
  }
  
  /**
   * Create a validation result from multiple results
   */
  static merge(...results: ValidationResult[]): ValidationResult {
    const merged = new ValidationResult();
    results.forEach(result => merged.merge(result));
    return merged;
  }
}