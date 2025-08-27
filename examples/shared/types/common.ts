/**
 * Common types and interfaces used across all example applications
 */

export interface AppConfig {
  environment: 'development' | 'staging' | 'production';
  port: number;
  autotask: {
    username: string;
    secret: string;
    integrationCode: string;
    baseURL?: string;
  };
  database?: {
    host: string;
    port: number;
    database: string;
    username: string;
    password: string;
  };
  redis?: {
    host: string;
    port: number;
    password?: string;
  };
  logging: {
    level: 'error' | 'warn' | 'info' | 'debug';
    file?: string;
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  meta?: {
    total?: number;
    page?: number;
    pageSize?: number;
    hasMore?: boolean;
  };
}

export interface PaginatedRequest {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  filters?: Record<string, any>;
}

export interface AutotaskEntity {
  id?: number;
  CreatedDateTime?: string;
  LastModifiedDateTime?: string;
}

export interface WorkflowStep {
  id: string;
  name: string;
  description: string;
  order: number;
  status: 'pending' | 'in-progress' | 'completed' | 'failed' | 'skipped';
  startedAt?: Date;
  completedAt?: Date;
  error?: string;
  metadata?: Record<string, any>;
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  steps: WorkflowStep[];
  startedAt?: Date;
  completedAt?: Date;
  createdBy: string;
  metadata?: Record<string, any>;
}

export interface DashboardMetric {
  id: string;
  name: string;
  value: number | string;
  previousValue?: number | string;
  change?: number;
  changeType?: 'increase' | 'decrease';
  format: 'number' | 'currency' | 'percentage' | 'duration';
  color?: string;
  target?: number;
  status?: 'good' | 'warning' | 'critical';
  lastUpdated: Date;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string;
    borderWidth?: number;
  }[];
}

export interface NotificationPreferences {
  email: boolean;
  sms: boolean;
  inApp: boolean;
  webhook?: string;
  schedule?: {
    immediate: boolean;
    daily: boolean;
    weekly: boolean;
    monthly: boolean;
  };
}

export interface Alert {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  source: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
  resolved: boolean;
  resolvedBy?: string;
  resolvedAt?: Date;
  metadata?: Record<string, any>;
}

export interface SystemHealth {
  status: 'healthy' | 'warning' | 'critical';
  services: {
    name: string;
    status: 'up' | 'down' | 'degraded';
    responseTime?: number;
    lastCheck: Date;
    error?: string;
  }[];
  metrics: {
    cpuUsage: number;
    memoryUsage: number;
    diskUsage: number;
    activeConnections: number;
  };
  uptime: number;
  version: string;
  environment: string;
}

export interface Integration {
  id: string;
  name: string;
  type: 'webhook' | 'polling' | 'realtime';
  status: 'active' | 'inactive' | 'error';
  lastSync?: Date;
  nextSync?: Date;
  errorCount: number;
  successCount: number;
  configuration: Record<string, any>;
  credentials?: Record<string, any>;
  metadata?: Record<string, any>;
}

export interface AuditLog {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  userId: string;
  userEmail: string;
  timestamp: Date;
  changes?: {
    field: string;
    oldValue: any;
    newValue: any;
  }[];
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

export interface BatchOperation<T = any> {
  id: string;
  type: 'create' | 'update' | 'delete';
  status: 'queued' | 'processing' | 'completed' | 'failed' | 'cancelled';
  totalItems: number;
  processedItems: number;
  successfulItems: number;
  failedItems: number;
  items: T[];
  errors: {
    itemIndex: number;
    error: string;
    details?: any;
  }[];
  startedAt?: Date;
  completedAt?: Date;
  estimatedCompletion?: Date;
  metadata?: Record<string, any>;
}

export interface ValidationError {
  field: string;
  message: string;
  value?: any;
  rule?: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings?: ValidationError[];
}

export interface CacheEntry<T = any> {
  key: string;
  value: T;
  expiresAt?: Date;
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface FileUpload {
  id: string;
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  path: string;
  url?: string;
  uploadedBy: string;
  uploadedAt: Date;
  metadata?: Record<string, any>;
}

export interface ExportJob {
  id: string;
  type: 'csv' | 'excel' | 'pdf' | 'json';
  status: 'queued' | 'processing' | 'completed' | 'failed';
  filename: string;
  downloadUrl?: string;
  totalRecords: number;
  processedRecords: number;
  filters?: Record<string, any>;
  createdBy: string;
  createdAt: Date;
  completedAt?: Date;
  expiresAt?: Date;
  error?: string;
}