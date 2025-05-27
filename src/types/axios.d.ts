import 'axios';

declare module 'axios' {
  export interface AxiosRequestConfig {
    metadata?: {
      requestId?: string;
      startTime?: number;
      duration?: number;
      success?: boolean;
    };
  }

  export interface AxiosResponse {
    metadata?: {
      requestId?: string;
      startTime?: number;
      duration?: number;
      success?: boolean;
    };
  }
} 