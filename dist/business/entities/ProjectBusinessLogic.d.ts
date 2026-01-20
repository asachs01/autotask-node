import { BusinessLogicEngine } from '../core/BusinessLogicEngine';
import { ValidationResult } from '../validation';
/**
 * Project-specific business logic for phase management, resource allocation, and budget tracking
 */
export declare class ProjectBusinessLogic {
    private businessEngine;
    constructor(businessEngine: BusinessLogicEngine);
    /**
     * Project statuses with workflow implications
     */
    private readonly PROJECT_STATUSES;
    /**
     * Project types with different management approaches
     */
    private readonly PROJECT_TYPES;
    /**
     * Validate and process project creation with comprehensive resource and budget validation
     */
    createProject(projectData: any, context?: {
        user?: any;
        company?: any;
        resources?: any[];
        phases?: any[];
        parentProject?: any;
    }): Promise<{
        isValid: boolean;
        validationResult: ValidationResult;
        processedProject: any;
        resourceAnalysis: {
            availableResources: any[];
            conflictingAssignments: any[];
            skillGaps: string[];
            recommendedTeam: any[];
        };
        budgetProjections: {
            estimatedCost: number;
            resourceCosts: any[];
            riskContingency: number;
            totalBudget: number;
        };
        suggestedActions: string[];
    }>;
    /**
     * Manage project phases with dependencies and milestone tracking
     */
    manageProjectPhases(projectId: number, phases: {
        name: string;
        description: string;
        startDate: string;
        endDate: string;
        dependencies: number[];
        resources: number[];
        budget: number;
        deliverables: string[];
    }[], context?: {
        currentPhases?: any[];
        resourceCalendar?: any[];
    }): Promise<{
        validPhases: any[];
        invalidPhases: any[];
        dependencyValidation: {
            circularDependencies: any[];
            missingDependencies: any[];
            criticalPath: any[];
        };
        resourceConflicts: any[];
        timelineAnalysis: {
            totalDuration: number;
            criticalMilestones: any[];
            bufferRecommendations: any[];
        };
    }>;
    /**
     * Track project progress and generate status reports
     */
    generateProjectStatus(project: any, phases: any[], tasks: any[], timeEntries: any[], expenses: any[]): {
        overallProgress: {
            percentComplete: number;
            status: string;
            health: 'green' | 'yellow' | 'red';
            lastUpdated: string;
        };
        budgetAnalysis: {
            budgetUtilization: number;
            costVariance: number;
            burnRate: number;
            projectedFinalCost: number;
            budgetStatus: 'under' | 'on_track' | 'over';
        };
        scheduleAnalysis: {
            scheduleVariance: number;
            criticalPathDelay: number;
            milestonesAtRisk: any[];
            estimatedCompletion: string;
        };
        resourceUtilization: {
            teamEfficiency: number;
            resourceBottlenecks: any[];
            skillUtilization: any[];
        };
        riskAssessment: {
            level: 'low' | 'medium' | 'high';
            factors: string[];
            mitigationActions: string[];
        };
    };
    /**
     * Optimize resource allocation across project phases
     */
    optimizeResourceAllocation(project: any, phases: any[], availableResources: any[], constraints: {
        maxHoursPerResource?: number;
        skillRequirements?: Record<string, string[]>;
        costLimits?: number;
        timeConstraints?: any[];
    }): {
        optimizedAllocation: any[];
        efficiency: number;
        costOptimization: number;
        skillCoverage: number;
        recommendations: {
            type: 'hire' | 'train' | 'contract' | 'reschedule';
            description: string;
            impact: string;
            priority: 'low' | 'medium' | 'high';
        }[];
    };
    /**
     * Apply business logic during project creation
     */
    private applyProjectCreationLogic;
    /**
     * Analyze project resource requirements
     */
    private analyzeProjectResources;
    /**
     * Calculate project budget projections
     */
    private calculateProjectBudget;
    /**
     * Validate individual phase
     */
    private validatePhase;
    /**
     * Validate phase dependencies
     */
    private validatePhaseDependencies;
    /**
     * Check for resource conflicts in a phase
     */
    private checkPhaseResourceConflicts;
    /**
     * Helper methods for project analysis
     */
    private generatePhaseId;
    private extractRequiredSkills;
    private checkResourceAvailability;
    private calculateSkillMatch;
    private suggestRole;
    private calculateResourceHours;
    private analyzeProjectTimeline;
    private calculateTotalDuration;
    private identifyCriticalMilestones;
    private generateBufferRecommendations;
    private calculateCriticalPath;
    private calculateProjectDays;
    private determineProjectStatus;
    private calculateProjectHealth;
    private determineBudgetStatus;
    private analyzeProjectSchedule;
    private analyzeResourceUtilization;
    private assessProjectRisks;
    private allocateResourcesForPhase;
}
//# sourceMappingURL=ProjectBusinessLogic.d.ts.map