/**
 * REST API controller for customer onboarding operations
 */

import { Request, Response } from 'express';
import { OnboardingService } from '../services/OnboardingService';
import { getAutotaskClient } from '../../shared/auth/autotask-auth';
import { 
  sendSuccess, 
  sendError, 
  sendCreated, 
  sendNotFound,
  asyncHandler 
} from '../../shared/utils/response';
import { validate, AutotaskSchemas } from '../../shared/utils/validation';
import { createLogger } from '../../shared/utils/logger';
import { CustomerData } from '../types/onboarding';

const logger = createLogger('onboarding-controller');

export class OnboardingController {
  private onboardingService: OnboardingService;

  constructor() {
    const autotaskClient = getAutotaskClient();
    this.onboardingService = new OnboardingService(autotaskClient);
  }

  /**
   * Start a new customer onboarding workflow
   * POST /api/onboarding/start
   */
  startOnboarding = asyncHandler(async (req: Request, res: Response) => {
    const customerData: CustomerData = req.body;

    try {
      // Validate customer data
      const validation = this.validateCustomerData(customerData);
      if (!validation.valid) {
        return sendError(res, 'Validation failed', 400, validation.errors);
      }

      // Start the onboarding workflow
      const workflow = await this.onboardingService.startOnboarding(customerData);

      return sendCreated(res, {
        workflowId: workflow.id,
        status: workflow.status,
        customerName: customerData.companyName,
        steps: workflow.steps.map(step => ({
          id: step.id,
          name: step.name,
          status: step.status,
          order: step.order,
        })),
        startedAt: workflow.startedAt,
        estimatedCompletion: this.calculateEstimatedCompletion(workflow.steps),
      }, 'Onboarding workflow started successfully');

    } catch (error) {
      logger.error('Failed to start onboarding:', error);
      return sendError(res, 'Failed to start onboarding workflow');
    }
  });

  /**
   * Get workflow status
   * GET /api/onboarding/workflow/:id
   */
  getWorkflowStatus = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
      const workflow = this.onboardingService.getWorkflow(id);
      
      if (!workflow) {
        return sendNotFound(res, 'Workflow');
      }

      const completedSteps = workflow.steps.filter(s => s.status === 'completed').length;
      const totalSteps = workflow.steps.length;
      const progress = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;

      return sendSuccess(res, {
        workflowId: workflow.id,
        customerName: workflow.customerData.companyName,
        status: workflow.status,
        progress: Math.round(progress),
        completedSteps,
        totalSteps,
        startedAt: workflow.startedAt,
        completedAt: workflow.completedAt,
        steps: workflow.steps.map(step => ({
          id: step.id,
          name: step.name,
          status: step.status,
          order: step.order,
          startedAt: step.startedAt,
          completedAt: step.completedAt,
          error: step.error,
        })),
        createdEntities: workflow.createdEntities,
        duration: this.calculateDuration(workflow),
      });

    } catch (error) {
      logger.error('Failed to get workflow status:', error);
      return sendError(res, 'Failed to get workflow status');
    }
  });

  /**
   * Get all workflows
   * GET /api/onboarding/workflows
   */
  getAllWorkflows = asyncHandler(async (req: Request, res: Response) => {
    try {
      const workflows = this.onboardingService.getAllWorkflows();
      
      const workflowSummaries = workflows.map(workflow => {
        const completedSteps = workflow.steps.filter(s => s.status === 'completed').length;
        const totalSteps = workflow.steps.length;
        const progress = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;

        return {
          workflowId: workflow.id,
          customerName: workflow.customerData.companyName,
          status: workflow.status,
          progress: Math.round(progress),
          completedSteps,
          totalSteps,
          startedAt: workflow.startedAt,
          completedAt: workflow.completedAt,
          duration: this.calculateDuration(workflow),
          createdEntities: {
            hasCompany: !!workflow.createdEntities.companyId,
            contactCount: workflow.createdEntities.contactIds?.length || 0,
            locationCount: workflow.createdEntities.locationIds?.length || 0,
            ticketCount: workflow.createdEntities.ticketIds?.length || 0,
          },
        };
      });

      return sendSuccess(res, {
        workflows: workflowSummaries,
        total: workflowSummaries.length,
        summary: {
          total: workflowSummaries.length,
          completed: workflowSummaries.filter(w => w.status === 'completed').length,
          running: workflowSummaries.filter(w => w.status === 'running').length,
          failed: workflowSummaries.filter(w => w.status === 'failed').length,
        },
      });

    } catch (error) {
      logger.error('Failed to get workflows:', error);
      return sendError(res, 'Failed to get workflows');
    }
  });

  /**
   * Get onboarding metrics
   * GET /api/onboarding/metrics
   */
  getMetrics = asyncHandler(async (req: Request, res: Response) => {
    try {
      const metrics = this.onboardingService.getMetrics();
      
      return sendSuccess(res, {
        overview: {
          totalOnboardings: metrics.totalOnboardings,
          completedOnboardings: metrics.completedOnboardings,
          failedOnboardings: metrics.failedOnboardings,
          successRate: metrics.totalOnboardings > 0 
            ? Math.round((metrics.completedOnboardings / metrics.totalOnboardings) * 100) 
            : 0,
        },
        performance: {
          averageCompletionTime: Math.round(metrics.averageCompletionTime),
          stepSuccessRates: metrics.stepSuccessRates,
          commonFailurePoints: metrics.commonFailurePoints.slice(0, 5), // Top 5
        },
        trends: {
          // In a real implementation, these would come from historical data
          completionTrend: this.generateMockTrendData(),
          volumeTrend: this.generateMockVolumeData(),
        },
      });

    } catch (error) {
      logger.error('Failed to get metrics:', error);
      return sendError(res, 'Failed to get metrics');
    }
  });

  /**
   * Validate customer data
   */
  private validateCustomerData(customerData: CustomerData): { valid: boolean; errors: any[] } {
    const errors: any[] = [];

    // Validate company name
    if (!customerData.companyName || customerData.companyName.trim().length === 0) {
      errors.push({ field: 'companyName', message: 'Company name is required' });
    }

    // Validate primary contact
    if (!customerData.primaryContact) {
      errors.push({ field: 'primaryContact', message: 'Primary contact is required' });
    } else {
      if (!customerData.primaryContact.firstName) {
        errors.push({ field: 'primaryContact.firstName', message: 'First name is required' });
      }
      if (!customerData.primaryContact.lastName) {
        errors.push({ field: 'primaryContact.lastName', message: 'Last name is required' });
      }
      if (!customerData.primaryContact.email) {
        errors.push({ field: 'primaryContact.email', message: 'Email is required' });
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerData.primaryContact.email)) {
        errors.push({ field: 'primaryContact.email', message: 'Invalid email format' });
      }
    }

    // Validate locations
    if (!customerData.locations || customerData.locations.length === 0) {
      errors.push({ field: 'locations', message: 'At least one location is required' });
    } else {
      customerData.locations.forEach((location, index) => {
        if (!location.name) {
          errors.push({ field: `locations[${index}].name`, message: 'Location name is required' });
        }
        if (!location.address1) {
          errors.push({ field: `locations[${index}].address1`, message: 'Address is required' });
        }
        if (!location.city) {
          errors.push({ field: `locations[${index}].city`, message: 'City is required' });
        }
        if (!location.state) {
          errors.push({ field: `locations[${index}].state`, message: 'State is required' });
        }
      });
    }

    // Validate services
    if (!customerData.services || customerData.services.length === 0) {
      errors.push({ field: 'services', message: 'At least one service request is required' });
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Calculate estimated completion time
   */
  private calculateEstimatedCompletion(steps: any[]): Date {
    const estimatedMinutes = steps.reduce((sum, step) => {
      // Default 5 minutes per step if not specified
      return sum + (step.estimatedDuration || 5);
    }, 0);

    const completion = new Date();
    completion.setMinutes(completion.getMinutes() + estimatedMinutes);
    return completion;
  }

  /**
   * Calculate workflow duration
   */
  private calculateDuration(workflow: any): number | null {
    if (!workflow.startedAt) return null;
    
    const endTime = workflow.completedAt || new Date();
    return Math.round((endTime.getTime() - workflow.startedAt.getTime()) / (1000 * 60)); // in minutes
  }

  /**
   * Generate mock trend data (replace with real data in production)
   */
  private generateMockTrendData(): { date: string; completed: number; failed: number }[] {
    const data = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      data.push({
        date: date.toISOString().split('T')[0],
        completed: Math.floor(Math.random() * 10) + 1,
        failed: Math.floor(Math.random() * 3),
      });
    }
    
    return data;
  }

  /**
   * Generate mock volume data
   */
  private generateMockVolumeData(): { date: string; volume: number }[] {
    const data = [];
    const today = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      data.push({
        date: date.toISOString().split('T')[0],
        volume: Math.floor(Math.random() * 15) + 1,
      });
    }
    
    return data;
  }
}