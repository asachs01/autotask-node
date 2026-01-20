"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TicketSources = exports.ContractTypes = exports.PriorityLevels = void 0;
exports.IsAutotaskId = IsAutotaskId;
exports.IsEntityReference = IsEntityReference;
exports.IsPhoneNumber = IsPhoneNumber;
exports.IsPostalCode = IsPostalCode;
exports.IsCurrency = IsCurrency;
exports.IsPercentage = IsPercentage;
exports.IsBusinessHours = IsBusinessHours;
exports.IsUDF = IsUDF;
exports.IsBillingCode = IsBillingCode;
exports.IsTaxRegion = IsTaxRegion;
exports.IsPriority = IsPriority;
exports.IsStatus = IsStatus;
exports.IsDateRange = IsDateRange;
exports.IsPicklistValue = IsPicklistValue;
exports.IsContractType = IsContractType;
exports.IsTicketSource = IsTicketSource;
exports.IsSLA = IsSLA;
exports.IsWithinRateLimit = IsWithinRateLimit;
const ValidationDecorators_1 = require("../core/ValidationDecorators");
/**
 * Common Autotask entity validation decorators
 */
/**
 * Autotask ID validator (must be positive integer)
 */
function IsAutotaskId(options) {
    return (0, ValidationDecorators_1.IsNumber)({
        min: 1,
        integer: true,
        message: options?.message || 'Must be a valid Autotask ID (positive integer)'
    });
}
/**
 * Autotask entity reference validator
 */
function IsEntityReference(entityType, options) {
    return (0, ValidationDecorators_1.Validate)(async (value) => {
        if (!options?.required && (value === null || value === undefined)) {
            return true;
        }
        if (typeof value !== 'number' || value < 1 || !Number.isInteger(value)) {
            return false;
        }
        // In production, validate that the referenced entity exists
        // This would require API lookup or cache check
        return true;
    }, {
        message: `Must be a valid ${entityType} reference`,
        code: `invalid_${entityType.toLowerCase()}_reference`
    });
}
/**
 * Phone number validator for Autotask
 */
function IsPhoneNumber(options) {
    const patterns = {
        US: /^(\+1)?[-.\s]?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}$/,
        International: /^(\+\d{1,3})?[-.\s]?\(?\d{1,4}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,9}$/
    };
    const pattern = patterns[options?.format || 'International'];
    return (0, ValidationDecorators_1.Pattern)(pattern, {
        message: options?.message || `Invalid phone number format`
    });
}
/**
 * Postal/ZIP code validator
 */
function IsPostalCode(options) {
    const patterns = {
        US: /^\d{5}(-\d{4})?$/,
        CA: /^[A-Za-z]\d[A-Za-z][ ]?\d[A-Za-z]\d$/,
        UK: /^[A-Z]{1,2}\d{1,2}[A-Z]?\s?\d[A-Z]{2}$/i
    };
    const pattern = patterns[options?.country || 'US'];
    return (0, ValidationDecorators_1.Pattern)(pattern, {
        message: options?.message || `Invalid postal code format`
    });
}
/**
 * Currency amount validator
 */
function IsCurrency(options) {
    return (0, ValidationDecorators_1.Validate)((value) => {
        if (typeof value !== 'number') {
            return false;
        }
        if (options?.min !== undefined && value < options.min) {
            return false;
        }
        if (options?.max !== undefined && value > options.max) {
            return false;
        }
        if (options?.precision !== undefined) {
            const decimalPlaces = (value.toString().split('.')[1] || '').length;
            if (decimalPlaces > options.precision) {
                return false;
            }
        }
        return true;
    }, {
        message: options?.message || 'Invalid currency amount',
        code: 'invalid_currency'
    });
}
/**
 * Percentage validator (0-100)
 */
function IsPercentage(options) {
    return (0, ValidationDecorators_1.Validate)((value) => {
        if (typeof value !== 'number') {
            return false;
        }
        const min = options?.min ?? 0;
        const max = options?.max ?? 100;
        if (value < min || value > max) {
            return false;
        }
        if (!options?.allowDecimals && !Number.isInteger(value)) {
            return false;
        }
        return true;
    }, {
        message: options?.message || `Must be a percentage between ${options?.min ?? 0} and ${options?.max ?? 100}`,
        code: 'invalid_percentage'
    });
}
/**
 * Business hours validator
 */
function IsBusinessHours(options) {
    return (0, ValidationDecorators_1.Pattern)(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
        message: options?.message || 'Invalid time format (HH:MM)'
    });
}
/**
 * Autotask UDF (User Defined Field) validator
 */
function IsUDF(options) {
    return (0, ValidationDecorators_1.Validate)((value) => {
        if (!options?.required && (value === null || value === undefined)) {
            return true;
        }
        switch (options?.type) {
            case 'Text':
                return typeof value === 'string' &&
                    (!options.maxLength || value.length <= options.maxLength);
            case 'Number':
                return typeof value === 'number';
            case 'Date':
                return value instanceof Date || !isNaN(Date.parse(value));
            case 'List':
                return typeof value === 'string'; // List values are typically strings
            default:
                return value !== undefined;
        }
    }, {
        message: options?.message || 'Invalid UDF value',
        code: 'invalid_udf'
    });
}
/**
 * Billing code validator
 */
function IsBillingCode(options) {
    return (0, ValidationDecorators_1.Pattern)(/^[A-Z0-9_-]{2,50}$/i, {
        message: options?.message || 'Invalid billing code format'
    });
}
/**
 * Tax region validator
 */
function IsTaxRegion(options) {
    if (options?.regions) {
        return (0, ValidationDecorators_1.IsEnum)(options.regions, { message: options.message });
    }
    return (0, ValidationDecorators_1.IsString)({
        maxLength: 50,
        message: options?.message || 'Invalid tax region'
    });
}
/**
 * Priority level validator
 */
exports.PriorityLevels = {
    Critical: 1,
    High: 2,
    Medium: 3,
    Low: 4
};
function IsPriority(options) {
    return (0, ValidationDecorators_1.IsEnum)(exports.PriorityLevels, {
        message: options?.message || 'Invalid priority level'
    });
}
/**
 * Status validator with custom allowed values
 */
function IsStatus(allowedStatuses, options) {
    return (0, ValidationDecorators_1.IsEnum)(allowedStatuses, {
        message: options?.message || `Status must be one of: ${allowedStatuses.join(', ')}`
    });
}
/**
 * Date range validator
 */
function IsDateRange(options) {
    return (0, ValidationDecorators_1.Validate)((value) => {
        const date = value instanceof Date ? value : new Date(value);
        if (isNaN(date.getTime())) {
            return false;
        }
        const now = new Date();
        if (!options?.allowFuture && date > now) {
            return false;
        }
        if (!options?.allowPast && date < now) {
            return false;
        }
        if (options?.minDate && date < options.minDate) {
            return false;
        }
        if (options?.maxDate && date > options.maxDate) {
            return false;
        }
        return true;
    }, {
        message: options?.message || 'Date is outside allowed range',
        code: 'invalid_date_range'
    });
}
/**
 * Autotask picklist validator
 */
function IsPicklistValue(picklistName, options) {
    return (0, ValidationDecorators_1.Validate)(async (value) => {
        if (!options?.required && (value === null || value === undefined)) {
            return true;
        }
        if (options?.allowMultiple) {
            if (!Array.isArray(value)) {
                return false;
            }
            // In production, validate each value against the picklist
            return value.length > 0;
        }
        // In production, validate against actual picklist values from API
        return typeof value === 'number' && value > 0;
    }, {
        message: options?.message || `Invalid ${picklistName} picklist value`,
        code: `invalid_picklist_${picklistName.toLowerCase()}`
    });
}
/**
 * Contract type validator
 */
exports.ContractTypes = {
    TimeAndMaterials: 1,
    FixedPrice: 2,
    BlockHours: 3,
    RetainerContract: 4,
    IncidentContract: 5,
    RecurringService: 6
};
function IsContractType(options) {
    return (0, ValidationDecorators_1.IsEnum)(exports.ContractTypes, {
        message: options?.message || 'Invalid contract type'
    });
}
/**
 * Ticket source validator
 */
exports.TicketSources = {
    Phone: 1,
    Email: 2,
    Web: 3,
    Portal: 4,
    API: 5,
    Chat: 6,
    Alert: 7,
    Other: 99
};
function IsTicketSource(options) {
    return (0, ValidationDecorators_1.IsEnum)(exports.TicketSources, {
        message: options?.message || 'Invalid ticket source'
    });
}
/**
 * SLA validator
 */
function IsSLA(options) {
    return (0, ValidationDecorators_1.Validate)((value) => {
        if (typeof value !== 'object' || !value) {
            return false;
        }
        if (options?.responseTimeHours &&
            (!value.responseTime || value.responseTime > options.responseTimeHours)) {
            return false;
        }
        if (options?.resolutionTimeHours &&
            (!value.resolutionTime || value.resolutionTime > options.resolutionTimeHours)) {
            return false;
        }
        return true;
    }, {
        message: options?.message || 'Invalid SLA configuration',
        code: 'invalid_sla'
    });
}
/**
 * API rate limit validator
 */
function IsWithinRateLimit(options) {
    const requestCounts = new Map();
    return (0, ValidationDecorators_1.Validate)((value, entity) => {
        const key = entity?.apiKey || 'default';
        const now = Date.now();
        const window = options?.windowMs || 60000; // 1 minute default
        const maxRequests = options?.maxRequests || 100;
        let record = requestCounts.get(key);
        if (!record || now > record.resetTime) {
            record = { count: 1, resetTime: now + window };
            requestCounts.set(key, record);
            return true;
        }
        if (record.count >= maxRequests) {
            return false;
        }
        record.count++;
        return true;
    }, {
        message: options?.message || 'Rate limit exceeded',
        code: 'rate_limit_exceeded'
    });
}
//# sourceMappingURL=EntityValidators.js.map