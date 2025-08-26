/**
 * Ticket dashboard specific types and interfaces
 */

export interface TicketSummary {
  id: number;
  ticketNumber: string;
  title: string;
  status: number;
  statusName: string;
  priority: number;
  priorityName: string;
  companyId: number;
  companyName: string;
  contactId?: number;
  contactName?: string;
  assignedResourceId?: number;
  assignedResourceName?: string;
  queueId: number;
  queueName: string;
  issueType: number;
  issueTypeName: string;
  createdDateTime: string;
  dueDateTime?: string;
  lastModifiedDateTime: string;
  estimatedHours?: number;
  hoursToBeScheduled?: number;
  description: string;
  resolution?: string;
}

export interface SLAInfo {
  ticketId: number;
  responseTargetHours: number;
  resolutionTargetHours: number;
  responseTimeRemaining?: number; // in minutes, negative if overdue
  resolutionTimeRemaining?: number; // in minutes, negative if overdue
  responseStatus: 'met' | 'at-risk' | 'breached';
  resolutionStatus: 'met' | 'at-risk' | 'breached';
  firstResponseDateTime?: string;
  lastResponseDateTime?: string;
  escalationLevel: number;
  autoEscalated: boolean;
}

export interface DashboardMetrics {
  overview: {
    totalTickets: number;
    openTickets: number;
    newTickets: number;
    inProgressTickets: number;
    waitingTickets: number;
    closedToday: number;
    averageResponseTime: number; // in hours
    averageResolutionTime: number; // in hours
    slaComplianceRate: number; // percentage
  };
  
  priority: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  
  queues: {
    queueId: number;
    queueName: string;
    ticketCount: number;
    averageAge: number; // in hours
    oldestTicketAge: number; // in hours
  }[];
  
  resources: {
    resourceId: number;
    resourceName: string;
    assignedTickets: number;
    completedToday: number;
    averageResolutionTime: number;
    slaComplianceRate: number;
  }[];
  
  slaBreaches: {
    responseBreaches: number;
    resolutionBreaches: number;
    atRiskTickets: number;
  };
  
  trends: {
    ticketsCreatedTrend: { date: string; count: number }[];
    ticketsClosedTrend: { date: string; count: number }[];
    responseTimeTrend: { date: string; avgHours: number }[];
    resolutionTimeTrend: { date: string; avgHours: number }[];
  };
}

export interface EscalationRule {
  id: string;
  name: string;
  description: string;
  priority?: number[];
  queues?: number[];
  issueTypes?: number[];
  conditions: EscalationCondition[];
  actions: EscalationAction[];
  isActive: boolean;
  lastTriggered?: Date;
  triggerCount: number;
}

export interface EscalationCondition {
  type: 'response_overdue' | 'resolution_overdue' | 'no_activity' | 'custom';
  operator: 'gt' | 'gte' | 'lt' | 'lte' | 'eq';
  value: number; // in minutes for time-based conditions
  field?: string; // for custom conditions
}

export interface EscalationAction {
  type: 'reassign' | 'notify' | 'priority_change' | 'status_change' | 'add_note' | 'webhook';
  parameters: {
    resourceId?: number;
    emailAddress?: string;
    webhookUrl?: string;
    newPriority?: number;
    newStatus?: number;
    noteText?: string;
    [key: string]: any;
  };
}

export interface Alert {
  id: string;
  type: 'sla_breach' | 'escalation' | 'system' | 'performance';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  ticketId?: number;
  queueId?: number;
  resourceId?: number;
  createdAt: Date;
  acknowledgedAt?: Date;
  acknowledgedBy?: string;
  resolvedAt?: Date;
  resolvedBy?: string;
  metadata?: { [key: string]: any };
}

export interface PerformanceMetrics {
  timestamp: Date;
  metrics: {
    activeConnections: number;
    memoryUsage: number;
    cpuUsage: number;
    apiResponseTime: number;
    databaseResponseTime: number;
    ticketProcessingRate: number; // tickets per minute
    alertGenerationRate: number; // alerts per minute
    websocketConnections: number;
  };
}

export interface DashboardFilter {
  queues?: number[];
  resources?: number[];
  companies?: number[];
  priorities?: number[];
  statuses?: number[];
  issueTypes?: number[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  searchText?: string;
  slaStatus?: ('met' | 'at-risk' | 'breached')[];
  showClosed?: boolean;
}

export interface TicketEvent {
  type: 'created' | 'updated' | 'closed' | 'assigned' | 'escalated' | 'sla_breach';
  ticketId: number;
  timestamp: Date;
  changes?: {
    field: string;
    oldValue: any;
    newValue: any;
  }[];
  triggeredBy?: string;
  metadata?: { [key: string]: any };
}

export interface DashboardConfig {
  refreshInterval: number; // in seconds
  autoRefresh: boolean;
  alertSound: boolean;
  theme: 'light' | 'dark';
  defaultFilters: DashboardFilter;
  columnVisibility: { [columnName: string]: boolean };
  escalationRules: string[]; // escalation rule IDs to monitor
  kpiTargets: {
    responseTime: number; // in hours
    resolutionTime: number; // in hours
    slaCompliance: number; // percentage
    customerSatisfaction: number; // rating out of 5
  };
}

export interface QueueMetrics {
  queueId: number;
  queueName: string;
  totalTickets: number;
  newTickets: number;
  inProgressTickets: number;
  waitingTickets: number;
  averageAge: number; // in hours
  oldestTicket: {
    ticketId: number;
    age: number; // in hours
    title: string;
  };
  slaCompliance: number; // percentage
  throughput: number; // tickets resolved per day
  backlog: number; // tickets older than 1 week
}

export interface ResourceMetrics {
  resourceId: number;
  resourceName: string;
  email?: string;
  activeTickets: number;
  completedToday: number;
  completedThisWeek: number;
  averageResolutionTime: number; // in hours
  slaComplianceRate: number; // percentage
  utilizationRate: number; // percentage of work hours
  customerSatisfactionScore?: number;
  escalationsReceived: number;
  workload: 'light' | 'normal' | 'heavy' | 'overloaded';
}

export interface CompanyTicketSummary {
  companyId: number;
  companyName: string;
  totalTickets: number;
  openTickets: number;
  averageResolutionTime: number;
  slaComplianceRate: number;
  customerSatisfactionScore?: number;
  contractType?: string;
  accountManager?: string;
  lastTicketDate: Date;
}

export interface TicketTrend {
  period: string; // '2023-12-01' for daily, '2023-W48' for weekly, '2023-12' for monthly
  created: number;
  resolved: number;
  pending: number;
  avgResponseTime: number;
  avgResolutionTime: number;
  slaBreaches: number;
}

export interface WebSocketMessage {
  type: 'ticket_update' | 'metrics_update' | 'alert' | 'escalation' | 'system_status';
  data: any;
  timestamp: Date;
  id: string;
}

export interface DashboardUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'technician' | 'viewer';
  preferences: DashboardConfig;
  lastActive: Date;
  connectedSince: Date;
}

export interface SystemHealth {
  status: 'healthy' | 'warning' | 'critical';
  uptime: number; // in seconds
  services: {
    autotask: { status: 'up' | 'down' | 'degraded'; responseTime: number };
    database: { status: 'up' | 'down' | 'degraded'; connectionCount: number };
    redis: { status: 'up' | 'down' | 'degraded'; memoryUsage: number };
    websocket: { status: 'up' | 'down' | 'degraded'; connections: number };
  };
  performance: PerformanceMetrics;
  lastCheck: Date;
}