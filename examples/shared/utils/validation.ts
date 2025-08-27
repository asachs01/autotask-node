/**
 * Validation utilities for example applications
 */

import Joi from 'joi';
import { ValidationResult, ValidationError } from '../types/common';

/**
 * Common validation schemas
 */
export const CommonSchemas = {
  id: Joi.number().integer().positive(),
  email: Joi.string().email(),
  phone: Joi.string().pattern(/^[+]?[1-9][\d\s\-()]+$/),
  url: Joi.string().uri(),
  date: Joi.date(),
  nonEmptyString: Joi.string().min(1).trim(),
  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    pageSize: Joi.number().integer().min(1).max(100).default(20),
    sortBy: Joi.string().optional(),
    sortDirection: Joi.string().valid('asc', 'desc').default('asc'),
  }),
};

/**
 * Autotask-specific validation schemas
 */
export const AutotaskSchemas = {
  company: Joi.object({
    CompanyName: Joi.string().required().max(100),
    CompanyType: Joi.number().integer().required(),
    Phone: Joi.string().max(25).optional(),
    Fax: Joi.string().max(25).optional(),
    WebAddress: Joi.string().uri().optional(),
    OwnerResourceID: Joi.number().integer().positive().optional(),
    BillToLocationID: Joi.number().integer().positive().optional(),
    TaxRegionID: Joi.number().integer().positive().optional(),
    MarketSegmentID: Joi.number().integer().positive().optional(),
    CompetitorID: Joi.number().integer().positive().optional(),
    TerritoryID: Joi.number().integer().positive().optional(),
  }),

  contact: Joi.object({
    CompanyID: Joi.number().integer().positive().required(),
    FirstName: Joi.string().required().max(50),
    LastName: Joi.string().required().max(50),
    Title: Joi.string().max(100).optional(),
    EmailAddress: Joi.string().email().max(254).optional(),
    Phone: Joi.string().max(25).optional(),
    MobilePhone: Joi.string().max(25).optional(),
    Fax: Joi.string().max(25).optional(),
  }),

  ticket: Joi.object({
    CompanyID: Joi.number().integer().positive().required(),
    Title: Joi.string().required().max(255),
    Description: Joi.string().required(),
    QueueID: Joi.number().integer().positive().required(),
    Status: Joi.number().integer().required(),
    Priority: Joi.number().integer().required(),
    IssueType: Joi.number().integer().required(),
    SubIssueType: Joi.number().integer().positive().optional(),
    TicketType: Joi.number().integer().required(),
    Source: Joi.number().integer().required(),
    AssignedResourceID: Joi.number().integer().positive().optional(),
    ContactID: Joi.number().integer().positive().optional(),
    AccountID: Joi.number().integer().positive().optional(),
    DueDateTime: Joi.date().optional(),
    EstimatedHours: Joi.number().min(0).optional(),
  }),

  timeEntry: Joi.object({
    TicketID: Joi.number().integer().positive().required(),
    ResourceID: Joi.number().integer().positive().required(),
    DateWorked: Joi.date().required(),
    StartDateTime: Joi.date().required(),
    EndDateTime: Joi.date().required(),
    HoursWorked: Joi.number().min(0).max(24).required(),
    HoursToBill: Joi.number().min(0).max(24).optional(),
    SummaryNotes: Joi.string().required().max(8000),
    InternalNotes: Joi.string().max(8000).optional(),
    TaskID: Joi.number().integer().positive().optional(),
    RoleID: Joi.number().integer().positive().optional(),
    ContractID: Joi.number().integer().positive().optional(),
  }),

  project: Joi.object({
    ProjectName: Joi.string().required().max(100),
    AccountID: Joi.number().integer().positive().required(),
    Type: Joi.number().integer().required(),
    Status: Joi.number().integer().required(),
    ProjectLeadResourceID: Joi.number().integer().positive().optional(),
    CompanyOwnerResourceID: Joi.number().integer().positive().optional(),
    StartDateTime: Joi.date().optional(),
    EndDateTime: Joi.date().optional(),
    EstimatedSalesCost: Joi.number().min(0).optional(),
    EstimatedTime: Joi.number().min(0).optional(),
    Description: Joi.string().max(8000).optional(),
  }),
};

/**
 * Validate data against a Joi schema
 */
export function validate<T>(data: T, schema: Joi.Schema): ValidationResult {
  const { error, value, warning } = schema.validate(data, {
    abortEarly: false,
    stripUnknown: true,
    convert: true,
  });

  const result: ValidationResult = {
    valid: !error,
    errors: [],
    warnings: [],
  };

  if (error) {
    result.errors = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message,
      value: detail.context?.value,
      rule: detail.type,
    }));
  }

  if (warning) {
    result.warnings = warning.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message,
      value: detail.context?.value,
      rule: detail.type,
    }));
  }

  return result;
}

/**
 * Validate and throw on error
 */
export function validateAndThrow<T>(data: T, schema: Joi.Schema): T {
  const result = validate(data, schema);
  
  if (!result.valid) {
    const errorMessage = result.errors
      .map(error => `${error.field}: ${error.message}`)
      .join('; ');
    throw new Error(`Validation failed: ${errorMessage}`);
  }

  return data;
}

/**
 * Sanitize string input
 */
export function sanitizeString(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    // eslint-disable-next-line no-control-regex
    .replace(/[\x00-\x1F\x7F]/g, ''); // Remove control characters
}

/**
 * Sanitize email input
 */
export function sanitizeEmail(email: string): string {
  const sanitized = sanitizeString(email).toLowerCase();
  
  // Basic email format validation
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sanitized)) {
    throw new Error('Invalid email format');
  }

  return sanitized;
}

/**
 * Sanitize phone number
 */
export function sanitizePhone(phone: string): string {
  if (!phone) return '';
  
  // Remove all non-digit characters except + at the beginning
  return phone.replace(/[^\d+]/g, '').replace(/(?!^)\+/g, '');
}

/**
 * Validate date range
 */
export function validateDateRange(startDate: Date, endDate: Date): ValidationResult {
  const errors: ValidationError[] = [];

  if (startDate >= endDate) {
    errors.push({
      field: 'dateRange',
      message: 'Start date must be before end date',
    });
  }

  const now = new Date();
  if (startDate > now) {
    errors.push({
      field: 'startDate',
      message: 'Start date cannot be in the future',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate time entry data
 */
export function validateTimeEntry(timeEntry: any): ValidationResult {
  const schema = AutotaskSchemas.timeEntry.keys({
    // Add custom validation for time consistency
    EndDateTime: Joi.date().min(Joi.ref('StartDateTime')).required(),
    HoursWorked: Joi.number().custom((value, helpers) => {
      const { StartDateTime, EndDateTime } = helpers.state.ancestors[0];
      if (StartDateTime && EndDateTime) {
        const diff = new Date(EndDateTime).getTime() - new Date(StartDateTime).getTime();
        const hours = diff / (1000 * 60 * 60);
        if (Math.abs(hours - value) > 0.1) { // Allow 6-minute tolerance
          return helpers.error('custom.timeInconsistent');
        }
      }
      return value;
    }).messages({
      'custom.timeInconsistent': 'Hours worked does not match the time difference between start and end times',
    }),
  });

  return validate(timeEntry, schema);
}

/**
 * Validate business hours
 */
export function isWithinBusinessHours(date: Date, businessHours?: { start: number; end: number }): boolean {
  const hours = businessHours || { start: 8, end: 17 }; // Default 8 AM - 5 PM
  const hour = date.getHours();
  const day = date.getDay(); // 0 = Sunday, 6 = Saturday

  // Check if it's a weekday
  if (day === 0 || day === 6) {
    return false;
  }

  // Check if within business hours
  return hour >= hours.start && hour < hours.end;
}

/**
 * Validate SLA compliance
 */
export function validateSLA(
  createdDate: Date,
  responseDate: Date | null,
  resolutionDate: Date | null,
  slaHours: { response: number; resolution: number }
): { responseCompliant: boolean; resolutionCompliant: boolean } {
  const now = new Date();
  
  const responseCompliant = responseDate
    ? (responseDate.getTime() - createdDate.getTime()) <= (slaHours.response * 60 * 60 * 1000)
    : (now.getTime() - createdDate.getTime()) <= (slaHours.response * 60 * 60 * 1000);

  const resolutionCompliant = resolutionDate
    ? (resolutionDate.getTime() - createdDate.getTime()) <= (slaHours.resolution * 60 * 60 * 1000)
    : (now.getTime() - createdDate.getTime()) <= (slaHours.resolution * 60 * 60 * 1000);

  return { responseCompliant, resolutionCompliant };
}

/**
 * Create validation middleware for Express
 */
export function validationMiddleware(schema: Joi.Schema, property: 'body' | 'query' | 'params' = 'body') {
  return (req: any, res: any, next: any) => {
    const result = validate(req[property], schema);
    
    if (!result.valid) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: result.errors,
      });
    }

    // Replace the request property with the validated (and potentially converted) data
    req[property] = result;
    next();
  };
}