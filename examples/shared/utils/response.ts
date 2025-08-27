/**
 * Standardized response utilities for example applications
 */

import { Response } from 'express';
import { ApiResponse } from '../types/common';

/**
 * Send a successful response
 */
export function sendSuccess<T>(
  res: Response,
  data?: T,
  message?: string,
  statusCode: number = 200,
  meta?: any
): void {
  const response: ApiResponse<T> = {
    success: true,
    data,
    message,
    meta,
  };

  res.status(statusCode).json(response);
}

/**
 * Send an error response
 */
export function sendError(
  res: Response,
  error: string,
  statusCode: number = 500,
  details?: any
): void {
  const response: ApiResponse = {
    success: false,
    error,
    ...(details && { details }),
  };

  res.status(statusCode).json(response);
}

/**
 * Send a validation error response
 */
export function sendValidationError(
  res: Response,
  errors: { field: string; message: string }[]
): void {
  sendError(res, 'Validation failed', 400, { validation: errors });
}

/**
 * Send a not found response
 */
export function sendNotFound(
  res: Response,
  resource: string = 'Resource'
): void {
  sendError(res, `${resource} not found`, 404);
}

/**
 * Send an unauthorized response
 */
export function sendUnauthorized(
  res: Response,
  message: string = 'Unauthorized'
): void {
  sendError(res, message, 401);
}

/**
 * Send a forbidden response
 */
export function sendForbidden(
  res: Response,
  message: string = 'Forbidden'
): void {
  sendError(res, message, 403);
}

/**
 * Send a paginated response
 */
export function sendPaginated<T>(
  res: Response,
  data: T[],
  page: number,
  pageSize: number,
  total: number,
  message?: string
): void {
  const totalPages = Math.ceil(total / pageSize);
  const hasMore = page < totalPages;

  sendSuccess(res, data, message, 200, {
    pagination: {
      page,
      pageSize,
      total,
      totalPages,
      hasMore,
    },
  });
}

/**
 * Send a created response
 */
export function sendCreated<T>(
  res: Response,
  data: T,
  message?: string
): void {
  sendSuccess(res, data, message || 'Created successfully', 201);
}

/**
 * Send a no content response
 */
export function sendNoContent(res: Response): void {
  res.status(204).send();
}

/**
 * Send a conflict response
 */
export function sendConflict(
  res: Response,
  message: string = 'Conflict'
): void {
  sendError(res, message, 409);
}

/**
 * Send a rate limit response
 */
export function sendRateLimit(
  res: Response,
  message: string = 'Rate limit exceeded'
): void {
  sendError(res, message, 429);
}

/**
 * Send a service unavailable response
 */
export function sendServiceUnavailable(
  res: Response,
  message: string = 'Service temporarily unavailable'
): void {
  sendError(res, message, 503);
}

/**
 * Handle async route errors
 */
export function asyncHandler(fn: (req: any, res: any, next: any) => Promise<any>) {
  return (req: any, res: any, next: any) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Create standardized error handler middleware
 */
export function errorHandler(logger?: any) {
  return (error: any, req: any, res: any, _next: any) => {
    if (logger) {
      logger.error('Unhandled error:', {
        error: error.message,
        stack: error.stack,
        url: req.url,
        method: req.method,
        body: req.body,
        query: req.query,
        params: req.params,
      });
    }

    // Handle specific error types
    if (error.name === 'ValidationError') {
      return sendValidationError(res, error.details || [{ field: 'unknown', message: error.message }]);
    }

    if (error.name === 'CastError') {
      return sendError(res, 'Invalid ID format', 400);
    }

    if (error.code === 11000) {
      return sendConflict(res, 'Duplicate entry');
    }

    // Handle Autotask API errors
    if (error.response && error.response.status) {
      const status = error.response.status;
      const message = error.response.data?.message || error.message;

      return sendError(res, `Autotask API error: ${message}`, status >= 500 ? 502 : status);
    }

    // Default server error
    sendError(res, 'Internal server error', 500);
  };
}

/**
 * Create a 404 handler for unmatched routes
 */
export function notFoundHandler() {
  return (req: any, res: any) => {
    sendNotFound(res, 'Endpoint');
  };
}

/**
 * Transform Autotask API response to standardized format
 */
export function transformAutotaskResponse<T>(
  autotaskResponse: any,
  transformer?: (item: any) => T
): { items: T[]; total: number } {
  if (!autotaskResponse || !autotaskResponse.items) {
    return { items: [], total: 0 };
  }

  const items = transformer
    ? autotaskResponse.items.map(transformer)
    : autotaskResponse.items;

  return {
    items,
    total: autotaskResponse.pageDetails?.count || items.length,
  };
}

/**
 * Create response with timing information
 */
export function sendWithTiming<T>(
  res: Response,
  data: T,
  startTime: number,
  message?: string,
  statusCode: number = 200
): void {
  const duration = Date.now() - startTime;
  
  sendSuccess(res, data, message, statusCode, {
    timing: {
      duration,
      timestamp: new Date().toISOString(),
    },
  });
}

/**
 * Health check response
 */
export function sendHealthCheck(
  res: Response,
  status: 'healthy' | 'warning' | 'critical',
  checks: { name: string; status: string; details?: any }[]
): void {
  const statusCode = status === 'healthy' ? 200 : status === 'warning' ? 200 : 503;
  
  sendSuccess(res, {
    status,
    timestamp: new Date().toISOString(),
    checks,
  }, undefined, statusCode);
}

/**
 * Metrics response
 */
export function sendMetrics(
  res: Response,
  metrics: { [key: string]: number | string }
): void {
  sendSuccess(res, {
    metrics,
    timestamp: new Date().toISOString(),
  });
}