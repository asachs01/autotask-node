"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectBusinessLogic = void 0;
/**
 * Project-specific business logic for phase management, resource allocation, and budget tracking
 */
class ProjectBusinessLogic {
    constructor(businessEngine) {
        this.businessEngine = businessEngine;
        /**
         * Project statuses with workflow implications
         */
        this.PROJECT_STATUSES = {
            PLANNING: 1,
            IN_PROGRESS: 2,
            ON_HOLD: 3,
            COMPLETED: 4,
            CANCELLED: 5
        };
        /**
         * Project types with different management approaches
         */
        this.PROJECT_TYPES = {
            INTERNAL: 1,
            CLIENT_PROJECT: 2,
            MAINTENANCE: 3,
            IMPLEMENTATION: 4,
            CONSULTING: 5
        };
    }
    /**
     * Validate and process project creation with comprehensive resource and budget validation
     */
    async createProject(projectData, context) {
        // Validate the project data
        const result = await this.businessEngine.processBusinessRules('create', 'Projects', projectData, {
            ...context,
            relatedEntities: {
                Companies: context?.company
            }
        });
        // Analyze resource requirements and availability
        const resourceAnalysis = await this.analyzeProjectResources(projectData, context);
        // Calculate budget projections
        const budgetProjections = this.calculateProjectBudget(projectData, context);
        // Apply project-specific business logic
        const processedProject = this.applyProjectCreationLogic(projectData, context);
        return {
            isValid: result.isAllowed && resourceAnalysis.skillGaps.length === 0,
            validationResult: result.validationResult,
            processedProject: result.transformedEntity || processedProject,
            resourceAnalysis,
            budgetProjections,
            suggestedActions: result.suggestedActions || []
        };
    }
    /**
     * Manage project phases with dependencies and milestone tracking
     */
    async manageProjectPhases(projectId, phases, context) {
        const validPhases = [];
        const invalidPhases = [];
        const resourceConflicts = [];
        // Validate individual phases
        for (const phase of phases) {
            const phaseValidation = this.validatePhase(phase);
            if (phaseValidation.isValid) {
                validPhases.push({
                    ...phase,
                    id: this.generatePhaseId(),
                    status: 'planned'
                });
            }
            else {
                invalidPhases.push({
                    phase,
                    errors: phaseValidation.errors
                });
            }
        }
        // Validate phase dependencies
        const dependencyValidation = this.validatePhaseDependencies(validPhases);
        // Check for resource conflicts
        validPhases.forEach(phase => {
            const conflicts = this.checkPhaseResourceConflicts(phase, context?.resourceCalendar);
            if (conflicts.length > 0) {
                resourceConflicts.push({
                    phaseId: phase.id,
                    phaseName: phase.name,
                    conflicts
                });
            }
        });
        // Analyze timeline
        const timelineAnalysis = this.analyzeProjectTimeline(validPhases);
        return {
            validPhases,
            invalidPhases,
            dependencyValidation,
            resourceConflicts,
            timelineAnalysis
        };
    }
    /**
     * Track project progress and generate status reports
     */
    generateProjectStatus(project, phases, tasks, timeEntries, expenses) {
        // Calculate overall progress
        const completedTasks = tasks.filter(t => t.status === 'completed').length;
        const percentComplete = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0;
        const overallProgress = {
            percentComplete: Math.round(percentComplete),
            status: this.determineProjectStatus(percentComplete, project.status),
            health: this.calculateProjectHealth(project, phases, tasks),
            lastUpdated: new Date().toISOString()
        };
        // Budget analysis
        const totalSpent = timeEntries.reduce((sum, entry) => sum + (entry.billingAmount || 0), 0) +
            expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);
        const budgetUtilization = project.budget > 0 ? (totalSpent / project.budget) * 100 : 0;
        const costVariance = totalSpent - project.budget;
        // Calculate burn rate (spending per day)
        const projectDays = this.calculateProjectDays(project.startDateTime, new Date().toISOString());
        const burnRate = projectDays > 0 ? totalSpent / projectDays : 0;
        // Project final cost based on current burn rate
        const totalProjectDays = this.calculateProjectDays(project.startDateTime, project.endDateTime);
        const projectedFinalCost = burnRate * totalProjectDays;
        const budgetAnalysis = {
            budgetUtilization: Math.round(budgetUtilization),
            costVariance: Math.round(costVariance),
            burnRate: Math.round(burnRate),
            projectedFinalCost: Math.round(projectedFinalCost),
            budgetStatus: this.determineBudgetStatus(budgetUtilization, costVariance)
        };
        // Schedule analysis
        const scheduleAnalysis = this.analyzeProjectSchedule(project, phases, tasks);
        // Resource utilization
        const resourceUtilization = this.analyzeResourceUtilization(timeEntries, project);
        // Risk assessment
        const riskAssessment = this.assessProjectRisks(overallProgress, budgetAnalysis, scheduleAnalysis, resourceUtilization);
        return {
            overallProgress,
            budgetAnalysis,
            scheduleAnalysis,
            resourceUtilization,
            riskAssessment
        };
    }
    /**
     * Optimize resource allocation across project phases
     */
    optimizeResourceAllocation(project, phases, availableResources, constraints) {
        const optimizedAllocation = [];
        const recommendations = [];
        let totalEfficiency = 0;
        let totalCost = 0;
        let skillsCovered = 0;
        let totalSkillsRequired = 0;
        // Process each phase
        phases.forEach(phase => {
            const phaseAllocation = this.allocateResourcesForPhase(phase, availableResources, constraints);
            optimizedAllocation.push({
                phaseId: phase.id,
                phaseName: phase.name,
                resources: phaseAllocation.resources,
                efficiency: phaseAllocation.efficiency,
                cost: phaseAllocation.cost
            });
            totalEfficiency += phaseAllocation.efficiency;
            totalCost += phaseAllocation.cost;
            skillsCovered += phaseAllocation.skillsCovered;
            totalSkillsRequired += phaseAllocation.totalSkillsRequired;
            // Add phase-specific recommendations
            recommendations.push(...phaseAllocation.recommendations);
        });
        const averageEfficiency = phases.length > 0 ? totalEfficiency / phases.length : 0;
        const budgetOptimization = constraints.costLimits
            ? Math.max(0, ((constraints.costLimits - totalCost) / constraints.costLimits) * 100)
            : 0;
        const skillCoverage = totalSkillsRequired > 0 ? (skillsCovered / totalSkillsRequired) * 100 : 100;
        // Generate overall recommendations
        if (skillCoverage < 80) {
            recommendations.push({
                type: 'hire',
                description: 'Consider hiring or contracting resources to fill skill gaps',
                impact: `Improve skill coverage from ${Math.round(skillCoverage)}% to 100%`,
                priority: 'high'
            });
        }
        if (averageEfficiency < 70) {
            recommendations.push({
                type: 'train',
                description: 'Consider training existing resources to improve efficiency',
                impact: 'Increase resource utilization and project delivery speed',
                priority: 'medium'
            });
        }
        return {
            optimizedAllocation,
            efficiency: Math.round(averageEfficiency),
            costOptimization: Math.round(budgetOptimization),
            skillCoverage: Math.round(skillCoverage),
            recommendations
        };
    }
    /**
     * Apply business logic during project creation
     */
    applyProjectCreationLogic(projectData, context) {
        const processed = { ...projectData };
        // Set default status
        if (!processed.status) {
            processed.status = this.PROJECT_STATUSES.PLANNING;
        }
        // Set default project type
        if (!processed.projectType) {
            processed.projectType = context?.company ?
                this.PROJECT_TYPES.CLIENT_PROJECT :
                this.PROJECT_TYPES.INTERNAL;
        }
        // Calculate default end date if duration is provided
        if (processed.startDateTime && processed.durationDays && !processed.endDateTime) {
            const startDate = new Date(processed.startDateTime);
            const endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + processed.durationDays);
            processed.endDateTime = endDate.toISOString();
        }
        // Set default budget if not provided but can be calculated
        if (!processed.budget && processed.estimatedHours && context?.averageHourlyRate) {
            processed.budget = processed.estimatedHours * context.averageHourlyRate;
        }
        return processed;
    }
    /**
     * Analyze project resource requirements
     */
    async analyzeProjectResources(projectData, context) {
        const availableResources = [];
        const conflictingAssignments = [];
        const skillGaps = [];
        const recommendedTeam = [];
        const requiredSkills = this.extractRequiredSkills(projectData);
        const resources = context?.resources || [];
        // Check resource availability and skills
        resources.forEach((resource) => {
            const availability = this.checkResourceAvailability(resource, projectData.startDateTime, projectData.endDateTime);
            if (availability.isAvailable) {
                availableResources.push(resource);
                // Check skill match
                const skillMatch = this.calculateSkillMatch(resource.skills || [], requiredSkills);
                if (skillMatch > 0.7) {
                    recommendedTeam.push({
                        resource,
                        skillMatch,
                        role: this.suggestRole(resource.skills, requiredSkills)
                    });
                }
            }
            else {
                conflictingAssignments.push({
                    resource,
                    conflicts: availability.conflicts
                });
            }
        });
        // Identify skill gaps
        requiredSkills.forEach(skill => {
            const hasSkill = availableResources.some(resource => resource.skills && resource.skills.includes(skill));
            if (!hasSkill) {
                skillGaps.push(skill);
            }
        });
        return {
            availableResources,
            conflictingAssignments,
            skillGaps,
            recommendedTeam
        };
    }
    /**
     * Calculate project budget projections
     */
    calculateProjectBudget(projectData, context) {
        let estimatedCost = 0;
        const resourceCosts = [];
        // Calculate resource costs
        if (context?.resources) {
            context.resources.forEach((resource) => {
                const allocatedHours = this.calculateResourceHours(resource, projectData);
                const cost = allocatedHours * (resource.hourlyRate || 0);
                resourceCosts.push({
                    resourceName: resource.name,
                    hours: allocatedHours,
                    rate: resource.hourlyRate || 0,
                    cost
                });
                estimatedCost += cost;
            });
        }
        // Add risk contingency (typically 10-20% of estimated cost)
        const riskContingency = estimatedCost * 0.15;
        const totalBudget = estimatedCost + riskContingency;
        return {
            estimatedCost,
            resourceCosts,
            riskContingency,
            totalBudget
        };
    }
    /**
     * Validate individual phase
     */
    validatePhase(phase) {
        const errors = [];
        if (!phase.name)
            errors.push('Phase name is required');
        if (!phase.startDate)
            errors.push('Start date is required');
        if (!phase.endDate)
            errors.push('End date is required');
        if (phase.startDate && phase.endDate && new Date(phase.startDate) >= new Date(phase.endDate)) {
            errors.push('End date must be after start date');
        }
        if (phase.budget < 0)
            errors.push('Budget cannot be negative');
        return {
            isValid: errors.length === 0,
            errors
        };
    }
    /**
     * Validate phase dependencies
     */
    validatePhaseDependencies(phases) {
        const circularDependencies = [];
        const missingDependencies = [];
        const criticalPath = [];
        // Build dependency graph
        const dependencyGraph = new Map();
        phases.forEach(phase => {
            dependencyGraph.set(phase.id, phase.dependencies || []);
        });
        // Check for circular dependencies using DFS
        const visited = new Set();
        const recursionStack = new Set();
        const hasCycle = (nodeId) => {
            visited.add(nodeId);
            recursionStack.add(nodeId);
            const dependencies = dependencyGraph.get(nodeId) || [];
            for (const depId of dependencies) {
                if (!visited.has(depId)) {
                    if (hasCycle(depId)) {
                        return true;
                    }
                }
                else if (recursionStack.has(depId)) {
                    circularDependencies.push({ from: nodeId, to: depId });
                    return true;
                }
            }
            recursionStack.delete(nodeId);
            return false;
        };
        phases.forEach(phase => {
            if (!visited.has(phase.id)) {
                hasCycle(phase.id);
            }
        });
        // Check for missing dependencies
        phases.forEach(phase => {
            phase.dependencies?.forEach((depId) => {
                const dependentPhase = phases.find(p => p.id === depId);
                if (!dependentPhase) {
                    missingDependencies.push({
                        phaseId: phase.id,
                        missingDependencyId: depId
                    });
                }
            });
        });
        // Calculate critical path (simplified)
        const criticalPathPhases = this.calculateCriticalPath(phases);
        criticalPath.push(...criticalPathPhases);
        return {
            circularDependencies,
            missingDependencies,
            criticalPath
        };
    }
    /**
     * Check for resource conflicts in a phase
     */
    checkPhaseResourceConflicts(phase, resourceCalendar) {
        const conflicts = [];
        if (!resourceCalendar)
            return conflicts;
        phase.resources?.forEach((resourceId) => {
            const resourceSchedule = resourceCalendar.find(r => r.resourceId === resourceId);
            if (resourceSchedule) {
                const phaseStart = new Date(phase.startDate);
                const phaseEnd = new Date(phase.endDate);
                const conflictingBookings = resourceSchedule.bookings?.filter((booking) => {
                    const bookingStart = new Date(booking.startDate);
                    const bookingEnd = new Date(booking.endDate);
                    return (phaseStart < bookingEnd && phaseEnd > bookingStart);
                });
                if (conflictingBookings && conflictingBookings.length > 0) {
                    conflicts.push({
                        resourceId,
                        conflictingBookings
                    });
                }
            }
        });
        return conflicts;
    }
    /**
     * Helper methods for project analysis
     */
    generatePhaseId() {
        return Math.floor(Math.random() * 1000000);
    }
    extractRequiredSkills(projectData) {
        // This would typically analyze project description, type, and requirements
        // For now, return a simplified set based on project type
        const skillMap = {
            [this.PROJECT_TYPES.IMPLEMENTATION]: ['technical_writing', 'system_integration', 'project_management'],
            [this.PROJECT_TYPES.CONSULTING]: ['analysis', 'documentation', 'client_communication'],
            [this.PROJECT_TYPES.MAINTENANCE]: ['technical_support', 'troubleshooting', 'monitoring']
        };
        return skillMap[projectData.projectType] || ['general'];
    }
    checkResourceAvailability(resource, startDate, endDate) {
        // Simplified availability check
        return {
            isAvailable: resource.isActive,
            conflicts: []
        };
    }
    calculateSkillMatch(resourceSkills, requiredSkills) {
        if (requiredSkills.length === 0)
            return 1;
        const matchingSkills = resourceSkills.filter(skill => requiredSkills.includes(skill));
        return matchingSkills.length / requiredSkills.length;
    }
    suggestRole(resourceSkills, requiredSkills) {
        // Simplified role suggestion based on skill overlap
        if (resourceSkills.includes('project_management'))
            return 'Project Manager';
        if (resourceSkills.includes('technical_writing'))
            return 'Technical Lead';
        return 'Team Member';
    }
    calculateResourceHours(resource, projectData) {
        // Simplified calculation - would be more sophisticated in practice
        return projectData.estimatedHours ? projectData.estimatedHours / 4 : 40;
    }
    analyzeProjectTimeline(phases) {
        const totalDuration = this.calculateTotalDuration(phases);
        const criticalMilestones = this.identifyCriticalMilestones(phases);
        const bufferRecommendations = this.generateBufferRecommendations(phases);
        return {
            totalDuration,
            criticalMilestones,
            bufferRecommendations
        };
    }
    calculateTotalDuration(phases) {
        if (phases.length === 0)
            return 0;
        const startDates = phases.map(p => new Date(p.startDate));
        const endDates = phases.map(p => new Date(p.endDate));
        const earliestStart = new Date(Math.min(...startDates.map(d => d.getTime())));
        const latestEnd = new Date(Math.max(...endDates.map(d => d.getTime())));
        return Math.ceil((latestEnd.getTime() - earliestStart.getTime()) / (1000 * 60 * 60 * 24));
    }
    identifyCriticalMilestones(phases) {
        return phases
            .filter(phase => phase.deliverables && phase.deliverables.length > 0)
            .map(phase => ({
            phaseId: phase.id,
            phaseName: phase.name,
            deliverables: phase.deliverables,
            dueDate: phase.endDate
        }));
    }
    generateBufferRecommendations(phases) {
        const recommendations = [];
        phases.forEach(phase => {
            const duration = this.calculateProjectDays(phase.startDate, phase.endDate);
            if (duration > 30) {
                recommendations.push({
                    phaseId: phase.id,
                    recommendation: 'Consider adding 10-15% buffer time for phases longer than 30 days',
                    suggestedBuffer: Math.ceil(duration * 0.1)
                });
            }
        });
        return recommendations;
    }
    calculateCriticalPath(phases) {
        // Simplified critical path calculation
        return phases.filter(phase => !phase.dependencies || phase.dependencies.length === 0);
    }
    calculateProjectDays(startDate, endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    }
    determineProjectStatus(percentComplete, currentStatus) {
        const statusMap = {
            [this.PROJECT_STATUSES.PLANNING]: 'Planning',
            [this.PROJECT_STATUSES.IN_PROGRESS]: 'In Progress',
            [this.PROJECT_STATUSES.ON_HOLD]: 'On Hold',
            [this.PROJECT_STATUSES.COMPLETED]: 'Completed',
            [this.PROJECT_STATUSES.CANCELLED]: 'Cancelled'
        };
        return statusMap[currentStatus] || 'Unknown';
    }
    calculateProjectHealth(project, phases, tasks) {
        let healthScore = 0;
        // Budget health
        if (project.budget && project.actualCost) {
            const budgetVariance = (project.actualCost - project.budget) / project.budget;
            if (budgetVariance <= 0.1)
                healthScore += 25;
            else if (budgetVariance <= 0.2)
                healthScore += 15;
            else
                healthScore += 5;
        }
        else {
            healthScore += 20; // Neutral if no data
        }
        // Schedule health
        const overdueTasks = tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'completed').length;
        const totalTasks = tasks.length;
        if (totalTasks === 0 || overdueTasks / totalTasks <= 0.1)
            healthScore += 25;
        else if (overdueTasks / totalTasks <= 0.2)
            healthScore += 15;
        else
            healthScore += 5;
        // Resource health (simplified)
        healthScore += 25; // Assume healthy if no specific data
        // Overall progress health
        const completedTasks = tasks.filter(t => t.status === 'completed').length;
        const progressRate = totalTasks > 0 ? completedTasks / totalTasks : 0;
        if (progressRate >= 0.8)
            healthScore += 25;
        else if (progressRate >= 0.6)
            healthScore += 15;
        else
            healthScore += 10;
        if (healthScore >= 80)
            return 'green';
        if (healthScore >= 60)
            return 'yellow';
        return 'red';
    }
    determineBudgetStatus(budgetUtilization, costVariance) {
        if (budgetUtilization <= 90)
            return 'under';
        if (budgetUtilization <= 110)
            return 'on_track';
        return 'over';
    }
    analyzeProjectSchedule(project, phases, tasks) {
        // Simplified schedule analysis
        return {
            scheduleVariance: 0,
            criticalPathDelay: 0,
            milestonesAtRisk: [],
            estimatedCompletion: project.endDateTime
        };
    }
    analyzeResourceUtilization(timeEntries, project) {
        const totalHours = timeEntries.reduce((sum, entry) => sum + (entry.hoursWorked || 0), 0);
        const expectedHours = project.estimatedHours || 0;
        return {
            teamEfficiency: expectedHours > 0 ? (totalHours / expectedHours) * 100 : 0,
            resourceBottlenecks: [],
            skillUtilization: []
        };
    }
    assessProjectRisks(overallProgress, budgetAnalysis, scheduleAnalysis, resourceUtilization) {
        const factors = [];
        const mitigationActions = [];
        if (budgetAnalysis.budgetStatus === 'over') {
            factors.push('Budget overrun');
            mitigationActions.push('Review budget allocation and seek approval for additional funding');
        }
        if (overallProgress.health === 'red') {
            factors.push('Poor project health indicators');
            mitigationActions.push('Conduct project health review and implement corrective actions');
        }
        const level = factors.length === 0 ? 'low' : factors.length <= 2 ? 'medium' : 'high';
        return {
            level,
            factors,
            mitigationActions
        };
    }
    allocateResourcesForPhase(phase, availableResources, constraints) {
        // Simplified resource allocation for phase
        return {
            resources: [],
            efficiency: 75,
            cost: phase.budget || 0,
            skillsCovered: 0,
            totalSkillsRequired: 0,
            recommendations: []
        };
    }
}
exports.ProjectBusinessLogic = ProjectBusinessLogic;
//# sourceMappingURL=ProjectBusinessLogic.js.map