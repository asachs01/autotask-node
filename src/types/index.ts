export interface AutotaskAuth {
  username: string;
  integrationCode: string;
  secret: string;
  apiUrl?: string; // Optional override
}

export interface MethodMetadata {
  operation: string;
  requiredParams: string[];
  optionalParams: string[];
  returnType: string;
  endpoint: string;
}

export interface ApiResponse<T> {
  data: T;
  meta?: any;
}

// Enhanced error handling exports
export {
  AutotaskError,
  AuthError,
  ValidationError,
  RateLimitError,
  NotFoundError,
  ServerError,
  NetworkError,
  ConfigurationError,
  createAutotaskError,
  isRetryableError,
  getRetryDelay,
} from '../utils/errors';

// Request handling exports
export {
  RequestHandler,
  RequestOptions,
  RequestContext,
} from '../utils/requestHandler';

// Query builder exports
export * from './queryBuilder';
export { QueryBuilder } from '../utils/queryBuilder';
export { QueryableEntity } from '../utils/queryableEntity';

// Export utility types
export * from '../utils/errors';
export * from '../utils/requestHandler';
export * from '../utils/memoryOptimization';
export * from '../utils/performanceMonitor';
