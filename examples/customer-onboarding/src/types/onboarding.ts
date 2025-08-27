/**
 * Customer onboarding specific types and interfaces
 */

import { WorkflowStep, Workflow } from '../../shared/types/common';

export interface CustomerData {
  // Company Information
  companyName: string;
  companyType?: number;
  phone?: string;
  fax?: string;
  website?: string;
  taxId?: string;
  industry?: string;
  
  // Primary Contact Information
  primaryContact: {
    firstName: string;
    lastName: string;
    title?: string;
    email: string;
    phone?: string;
    mobile?: string;
  };

  // Additional Contacts
  additionalContacts?: ContactData[];

  // Location Information
  locations: LocationData[];

  // Service Requirements
  services: ServiceRequest[];

  // Contract Information
  contractType?: string;
  billingPreferences?: BillingPreferences;

  // Custom Fields
  customFields?: { [key: string]: any };
}

export interface ContactData {
  firstName: string;
  lastName: string;
  title?: string;
  email?: string;
  phone?: string;
  mobile?: string;
  role?: string; // Primary, Billing, Technical, etc.
  department?: string;
}

export interface LocationData {
  name: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone?: string;
  isPrimary?: boolean;
  isServiceLocation?: boolean;
}

export interface ServiceRequest {
  serviceType: string;
  description: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  estimatedUsers?: number;
  estimatedDevices?: number;
  startDate?: Date;
  notes?: string;
}

export interface BillingPreferences {
  billingCycle: 'Monthly' | 'Quarterly' | 'Annually';
  billingMethod: 'Email' | 'Mail' | 'Portal';
  paymentMethod: 'Credit Card' | 'ACH' | 'Check' | 'Wire';
  invoiceDelivery: 'Email' | 'Mail' | 'Portal';
  billingContact?: string; // Contact ID or email
}

export interface OnboardingWorkflow extends Workflow {
  customerData: CustomerData;
  createdEntities: {
    companyId?: number;
    contactIds?: number[];
    locationIds?: number[];
    contractIds?: number[];
    ticketIds?: number[];
  };
  notifications: OnboardingNotification[];
}

export interface OnboardingNotification {
  id: string;
  type: 'email' | 'sms' | 'webhook';
  recipient: string;
  subject: string;
  message: string;
  templateId?: string;
  status: 'pending' | 'sent' | 'failed';
  sentAt?: Date;
  error?: string;
}

export interface OnboardingTemplate {
  id: string;
  name: string;
  description: string;
  version: string;
  steps: WorkflowStepTemplate[];
  defaultServices: ServiceRequest[];
  customFields: TemplateField[];
  notifications: NotificationTemplate[];
  isActive: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkflowStepTemplate {
  id: string;
  name: string;
  description: string;
  order: number;
  type: 'create_company' | 'create_contacts' | 'create_locations' | 'create_contract' | 'create_tickets' | 'send_notifications' | 'custom';
  configuration: any;
  dependencies?: string[];
  isRequired: boolean;
  estimatedDuration?: number; // in minutes
}

export interface TemplateField {
  name: string;
  label: string;
  type: 'text' | 'number' | 'boolean' | 'date' | 'select' | 'multiselect';
  required: boolean;
  defaultValue?: any;
  options?: string[]; // for select/multiselect
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
}

export interface NotificationTemplate {
  id: string;
  name: string;
  type: 'email' | 'sms' | 'webhook';
  trigger: 'workflow_start' | 'workflow_complete' | 'step_complete' | 'step_fail' | 'custom';
  recipientType: 'customer' | 'internal' | 'custom';
  subject: string;
  template: string; // HTML template with placeholders
  isActive: boolean;
}

export interface OnboardingMetrics {
  totalOnboardings: number;
  completedOnboardings: number;
  failedOnboardings: number;
  averageCompletionTime: number; // in minutes
  stepSuccessRates: { [stepName: string]: number };
  commonFailurePoints: { step: string; count: number }[];
  customerSatisfactionScore?: number;
  timeToFirstValue: number; // time until first service delivery
}

export interface OnboardingReport {
  id: string;
  workflowId: string;
  customerName: string;
  status: string;
  startedAt: Date;
  completedAt?: Date;
  duration?: number; // in minutes
  stepsCompleted: number;
  totalSteps: number;
  createdEntities: {
    companies: number;
    contacts: number;
    locations: number;
    contracts: number;
    tickets: number;
  };
  errors: {
    step: string;
    error: string;
    timestamp: Date;
  }[];
  notifications: {
    sent: number;
    failed: number;
  };
}

export interface ValidationRule {
  field: string;
  type: 'required' | 'format' | 'custom';
  rule: string | RegExp | ((value: any) => boolean);
  message: string;
  severity: 'error' | 'warning';
}

export interface IntegrationConfig {
  crmSync?: {
    enabled: boolean;
    crmType: 'salesforce' | 'hubspot' | 'dynamics' | 'custom';
    endpoint?: string;
    credentials?: any;
    fieldMapping?: { [autotaskField: string]: string };
  };
  
  emailMarketing?: {
    enabled: boolean;
    provider: 'mailchimp' | 'constant_contact' | 'sendgrid' | 'custom';
    listId?: string;
    credentials?: any;
  };
  
  billing?: {
    enabled: boolean;
    provider: 'quickbooks' | 'xero' | 'stripe' | 'custom';
    credentials?: any;
  };
  
  monitoring?: {
    enabled: boolean;
    provider: 'datadog' | 'newrelic' | 'custom';
    credentials?: any;
  };
}

export interface OnboardingDashboardData {
  overview: {
    activeWorkflows: number;
    completedToday: number;
    averageCompletionTime: number;
    successRate: number;
  };
  
  recentWorkflows: OnboardingReport[];
  
  metrics: OnboardingMetrics;
  
  charts: {
    completionTrend: { date: string; completed: number; failed: number }[];
    stepPerformance: { step: string; avgDuration: number; successRate: number }[];
    serviceTypeDistribution: { service: string; count: number }[];
  };
  
  alerts: {
    id: string;
    type: 'warning' | 'error';
    message: string;
    workflowId?: string;
    timestamp: Date;
  }[];
}