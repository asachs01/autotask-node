/**
 * Common Autotask entity validation decorators
 */
/**
 * Autotask ID validator (must be positive integer)
 */
export declare function IsAutotaskId(options?: {
    message?: string;
}): (target: any, propertyKey: string) => void;
/**
 * Autotask entity reference validator
 */
export declare function IsEntityReference(entityType: string, options?: {
    required?: boolean;
}): (target: any, propertyKey: string) => void;
/**
 * Phone number validator for Autotask
 */
export declare function IsPhoneNumber(options?: {
    format?: 'US' | 'International';
    message?: string;
}): (target: any, propertyKey: string) => void;
/**
 * Postal/ZIP code validator
 */
export declare function IsPostalCode(options?: {
    country?: 'US' | 'CA' | 'UK';
    message?: string;
}): (target: any, propertyKey: string) => void;
/**
 * Currency amount validator
 */
export declare function IsCurrency(options?: {
    min?: number;
    max?: number;
    precision?: number;
    message?: string;
}): (target: any, propertyKey: string) => void;
/**
 * Percentage validator (0-100)
 */
export declare function IsPercentage(options?: {
    min?: number;
    max?: number;
    allowDecimals?: boolean;
    message?: string;
}): (target: any, propertyKey: string) => void;
/**
 * Business hours validator
 */
export declare function IsBusinessHours(options?: {
    message?: string;
}): (target: any, propertyKey: string) => void;
/**
 * Autotask UDF (User Defined Field) validator
 */
export declare function IsUDF(options?: {
    type?: 'Text' | 'Number' | 'Date' | 'List';
    maxLength?: number;
    required?: boolean;
    message?: string;
}): (target: any, propertyKey: string) => void;
/**
 * Billing code validator
 */
export declare function IsBillingCode(options?: {
    message?: string;
}): (target: any, propertyKey: string) => void;
/**
 * Tax region validator
 */
export declare function IsTaxRegion(options?: {
    regions?: string[];
    message?: string;
}): (target: any, propertyKey: string) => void;
/**
 * Priority level validator
 */
export declare const PriorityLevels: {
    readonly Critical: 1;
    readonly High: 2;
    readonly Medium: 3;
    readonly Low: 4;
};
export declare function IsPriority(options?: {
    message?: string;
}): (target: any, propertyKey: string) => void;
/**
 * Status validator with custom allowed values
 */
export declare function IsStatus(allowedStatuses: string[], options?: {
    message?: string;
}): (target: any, propertyKey: string) => void;
/**
 * Date range validator
 */
export declare function IsDateRange(options?: {
    minDate?: Date;
    maxDate?: Date;
    allowFuture?: boolean;
    allowPast?: boolean;
    message?: string;
}): (target: any, propertyKey: string) => void;
/**
 * Autotask picklist validator
 */
export declare function IsPicklistValue(picklistName: string, options?: {
    allowMultiple?: boolean;
    required?: boolean;
    message?: string;
}): (target: any, propertyKey: string) => void;
/**
 * Contract type validator
 */
export declare const ContractTypes: {
    readonly TimeAndMaterials: 1;
    readonly FixedPrice: 2;
    readonly BlockHours: 3;
    readonly RetainerContract: 4;
    readonly IncidentContract: 5;
    readonly RecurringService: 6;
};
export declare function IsContractType(options?: {
    message?: string;
}): (target: any, propertyKey: string) => void;
/**
 * Ticket source validator
 */
export declare const TicketSources: {
    readonly Phone: 1;
    readonly Email: 2;
    readonly Web: 3;
    readonly Portal: 4;
    readonly API: 5;
    readonly Chat: 6;
    readonly Alert: 7;
    readonly Other: 99;
};
export declare function IsTicketSource(options?: {
    message?: string;
}): (target: any, propertyKey: string) => void;
/**
 * SLA validator
 */
export declare function IsSLA(options?: {
    responseTimeHours?: number;
    resolutionTimeHours?: number;
    message?: string;
}): (target: any, propertyKey: string) => void;
/**
 * API rate limit validator
 */
export declare function IsWithinRateLimit(options?: {
    maxRequests?: number;
    windowMs?: number;
    message?: string;
}): (target: any, propertyKey: string) => void;
//# sourceMappingURL=EntityValidators.d.ts.map