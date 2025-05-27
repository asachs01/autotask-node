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