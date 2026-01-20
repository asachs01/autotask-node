"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContractBusinessLogic = void 0;
/**
 * Contract-specific business logic for service validation, billing rules, and renewal tracking
 */
class ContractBusinessLogic {
    constructor(businessEngine) {
        this.businessEngine = businessEngine;
        /**
         * Contract statuses with business implications
         */
        this.CONTRACT_STATUSES = {
            DRAFT: 1,
            ACTIVE: 2,
            INACTIVE: 3,
            EXPIRED: 4,
            CANCELLED: 5,
            PENDING_RENEWAL: 6
        };
        /**
         * Contract types with different billing models
         */
        this.CONTRACT_TYPES = {
            TIME_AND_MATERIALS: 1,
            FIXED_PRICE: 2,
            RETAINER: 3,
            BLOCK_HOURS: 4,
            RECURRING_SERVICE: 5
        };
    }
    /**
     * Validate and process contract creation with comprehensive service validation
     */
    async createContract(contractData, context) {
        // Validate the contract data
        const result = await this.businessEngine.processBusinessRules('create', 'Contracts', contractData, {
            ...context,
            relatedEntities: {
                Companies: context?.company
            }
        });
        // Validate services and configurations
        const serviceValidation = await this.validateContractServices(contractData, context);
        // Calculate billing projections
        const billingProjections = this.calculateBillingProjections(contractData, context);
        // Apply contract-specific business logic
        const processedContract = this.applyContractCreationLogic(contractData, context);
        return {
            isValid: result.isAllowed && serviceValidation.invalidServices.length === 0,
            validationResult: result.validationResult,
            processedContract: result.transformedEntity || processedContract,
            serviceValidation,
            billingProjections,
            suggestedActions: result.suggestedActions || []
        };
    }
    /**
     * Process contract renewal with intelligent recommendations
     */
    async processContractRenewal(contractId, currentContract, renewalOptions, context) {
        const renewalData = {
            ...currentContract,
            ...renewalOptions,
            status: this.CONTRACT_STATUSES.PENDING_RENEWAL,
            parentContractId: contractId
        };
        const result = await this.businessEngine.processBusinessRules('create', 'Contracts', renewalData, {
            previousEntity: currentContract,
            user: context?.user
        });
        // Analyze renewal opportunity
        const renewalAnalysis = this.analyzeRenewalOpportunity(currentContract, renewalOptions, context);
        // Determine if approval is required
        const approvalRequired = this.requiresRenewalApproval(currentContract, renewalOptions, context);
        return {
            isValid: result.isAllowed,
            validationResult: result.validationResult,
            renewalAnalysis,
            processedRenewal: result.transformedEntity || renewalData,
            approvalRequired
        };
    }
    /**
     * Validate contract billing rules and rates
     */
    async validateBillingConfiguration(contractData, billingRules, context) {
        const validRules = [];
        const invalidRules = [];
        const recommendations = [];
        const warnings = [];
        // Validate hourly rates
        if (billingRules.hourlyRates) {
            Object.entries(billingRules.hourlyRates).forEach(([role, rate]) => {
                if (rate <= 0) {
                    invalidRules.push({
                        type: 'hourly_rate',
                        role,
                        error: 'Rate must be positive',
                        value: rate
                    });
                }
                else {
                    validRules.push({
                        type: 'hourly_rate',
                        role,
                        rate
                    });
                    // Compare with market rates
                    if (context?.marketRates?.[role]) {
                        const marketRate = context.marketRates[role];
                        const difference = ((rate - marketRate) / marketRate) * 100;
                        if (Math.abs(difference) > 20) {
                            warnings.push(`${role} rate is ${Math.abs(difference).toFixed(1)}% ${difference > 0 ? 'above' : 'below'} market rate`);
                        }
                    }
                }
            });
        }
        // Validate service bundles
        if (billingRules.serviceBundles) {
            billingRules.serviceBundles.forEach(bundle => {
                const bundleValidation = this.validateServiceBundle(bundle);
                if (bundleValidation.isValid) {
                    validRules.push({
                        type: 'service_bundle',
                        ...bundle
                    });
                }
                else {
                    invalidRules.push({
                        type: 'service_bundle',
                        bundle,
                        errors: bundleValidation.errors
                    });
                }
            });
        }
        // Analyze rate positioning
        const rateAnalysis = this.analyzeRateCompetitiveness(billingRules.hourlyRates || {}, context?.marketRates || {}, context?.previousRates || {});
        // Generate recommendations
        if (rateAnalysis.competitivePosition === 'below') {
            recommendations.push('Consider rate increases to improve margins');
        }
        else if (rateAnalysis.competitivePosition === 'above') {
            recommendations.push('Monitor client satisfaction due to premium pricing');
        }
        return {
            validRules,
            invalidRules,
            rateAnalysis,
            recommendations,
            warnings
        };
    }
    /**
     * Calculate contract utilization and performance metrics
     */
    calculateContractMetrics(contract, usage) {
        // Calculate utilization
        const hoursUsed = usage.timeEntries?.reduce((sum, entry) => sum + (entry.hoursWorked || 0), 0) || 0;
        const totalHours = contract.totalHours || contract.estimatedHours || 0;
        const utilizationRate = totalHours > 0 ? (hoursUsed / totalHours) * 100 : 0;
        // Calculate budget consumption
        const percentageUsed = utilizationRate;
        const projectedOverrun = Math.max(0, hoursUsed - totalHours);
        // Financial metrics
        const totalBilled = usage.billingData?.reduce((sum, bill) => sum + (bill.amount || 0), 0) || 0;
        const totalCost = usage.timeEntries?.reduce((sum, entry) => {
            return sum + (entry.hoursWorked * (entry.costRate || 0));
        }, 0) || 0;
        const grossMargin = totalBilled - totalCost;
        const profitability = totalBilled > 0 ? (grossMargin / totalBilled) * 100 : 0;
        // Service metrics
        const tickets = usage.supportTickets || [];
        const completedTickets = tickets.filter(t => t.status === 'completed');
        const averageResponseTime = completedTickets.length > 0
            ? completedTickets.reduce((sum, t) => sum + (t.responseTime || 0), 0) / completedTickets.length
            : 0;
        const customerSatisfaction = completedTickets.length > 0
            ? completedTickets.reduce((sum, t) => sum + (t.satisfactionRating || 3), 0) / completedTickets.length
            : 3;
        const slaViolations = tickets.filter(t => t.slaViolation).length;
        const slaCompliance = tickets.length > 0 ? ((tickets.length - slaViolations) / tickets.length) * 100 : 100;
        // Calculate overall health score
        const healthScore = this.calculateContractHealthScore({
            utilizationRate,
            profitability,
            customerSatisfaction,
            slaCompliance
        });
        return {
            utilizationRate: Math.round(utilizationRate * 100) / 100,
            budgetConsumption: {
                hoursUsed,
                totalHours,
                percentageUsed: Math.round(percentageUsed * 100) / 100,
                projectedOverrun
            },
            financialMetrics: {
                totalBilled: Math.round(totalBilled * 100) / 100,
                totalCost: Math.round(totalCost * 100) / 100,
                grossMargin: Math.round(grossMargin * 100) / 100,
                profitability: Math.round(profitability * 100) / 100
            },
            serviceMetrics: {
                averageResponseTime: Math.round(averageResponseTime * 100) / 100,
                customerSatisfaction: Math.round(customerSatisfaction * 100) / 100,
                slaCompliance: Math.round(slaCompliance * 100) / 100
            },
            healthScore
        };
    }
    /**
     * Apply business logic during contract creation
     */
    applyContractCreationLogic(contractData, context) {
        const processed = { ...contractData };
        // Set default status
        if (!processed.status) {
            processed.status = this.CONTRACT_STATUSES.DRAFT;
        }
        // Auto-calculate end date if contract period is provided
        if (processed.startDate && processed.contractPeriodMonths && !processed.endDate) {
            const startDate = new Date(processed.startDate);
            const endDate = new Date(startDate);
            endDate.setMonth(endDate.getMonth() + processed.contractPeriodMonths);
            processed.endDate = endDate.toISOString();
        }
        // Set billing frequency default
        if (!processed.billingFrequency) {
            processed.billingFrequency = 'monthly';
        }
        // Calculate initial renewal date (typically 90 days before expiry)
        if (processed.endDate) {
            const endDate = new Date(processed.endDate);
            const renewalDate = new Date(endDate);
            renewalDate.setDate(renewalDate.getDate() - 90);
            processed.renewalNotificationDate = renewalDate.toISOString();
        }
        return processed;
    }
    /**
     * Validate contract services and configurations
     */
    async validateContractServices(contractData, context) {
        const validServices = [];
        const invalidServices = [];
        const missingServices = [];
        const conflicts = [];
        const services = context?.services || [];
        // Validate each service
        services.forEach((service) => {
            const serviceValidation = this.validateIndividualService(service, contractData);
            if (serviceValidation.isValid) {
                validServices.push(service);
            }
            else {
                invalidServices.push({
                    service,
                    errors: serviceValidation.errors
                });
            }
        });
        // Check for required services based on contract type
        const requiredServices = this.getRequiredServices(contractData.contractType);
        requiredServices.forEach(requiredService => {
            const hasService = validServices.some(s => s.type === requiredService);
            if (!hasService) {
                missingServices.push(requiredService);
            }
        });
        return {
            validServices,
            invalidServices,
            missingServices,
            conflicts
        };
    }
    /**
     * Calculate billing projections
     */
    calculateBillingProjections(contractData, context) {
        let monthlyRecurring = 0;
        const variableComponents = [];
        // Calculate recurring components
        if (contractData.recurringAmount) {
            monthlyRecurring = contractData.recurringAmount;
        }
        // Add service-based recurring amounts
        const services = context?.services || [];
        services.forEach((service) => {
            if (service.recurringAmount) {
                monthlyRecurring += service.recurringAmount;
            }
            if (service.variableRating) {
                variableComponents.push({
                    service: service.name,
                    type: 'usage_based',
                    estimatedMonthly: service.estimatedUsage * service.rate
                });
            }
        });
        const annualValue = monthlyRecurring * 12 +
            variableComponents.reduce((sum, comp) => sum + comp.estimatedMonthly * 12, 0);
        return {
            monthlyRecurring,
            annualValue,
            variableComponents
        };
    }
    /**
     * Analyze renewal opportunity
     */
    analyzeRenewalOpportunity(currentContract, renewalOptions, context) {
        const recommendedChanges = [];
        const pricingRecommendations = [];
        const serviceOptimizations = [];
        const riskFactors = [];
        // Analyze usage patterns
        if (context?.usageAnalytics) {
            const analytics = context.usageAnalytics;
            if (analytics.utilizationRate < 50) {
                serviceOptimizations.push({
                    type: 'reduce_capacity',
                    description: 'Consider reducing contracted hours due to low utilization',
                    impact: 'cost_savings'
                });
            }
            else if (analytics.utilizationRate > 90) {
                serviceOptimizations.push({
                    type: 'increase_capacity',
                    description: 'Consider increasing contracted hours due to high utilization',
                    impact: 'service_improvement'
                });
            }
        }
        // Price escalation recommendations
        const yearsActive = currentContract.startDate
            ? Math.floor((new Date().getTime() - new Date(currentContract.startDate).getTime()) / (1000 * 60 * 60 * 24 * 365))
            : 0;
        if (yearsActive >= 2) {
            pricingRecommendations.push({
                type: 'inflation_adjustment',
                description: 'Apply inflation adjustment for multi-year contract',
                suggestedIncrease: '3-5%'
            });
        }
        // Risk factor analysis
        if (context?.performanceMetrics?.customerSatisfaction < 3) {
            riskFactors.push('Low customer satisfaction may affect renewal');
        }
        if (context?.performanceMetrics?.slaViolations > 5) {
            riskFactors.push('Multiple SLA violations may impact renewal terms');
        }
        return {
            recommendedChanges,
            pricingRecommendations,
            serviceOptimizations,
            riskFactors
        };
    }
    /**
     * Check if renewal requires approval
     */
    requiresRenewalApproval(currentContract, renewalOptions, context) {
        // Require approval for price increases over 10%
        if (renewalOptions.priceAdjustment && Math.abs(renewalOptions.priceAdjustment) > 0.1) {
            return true;
        }
        // Require approval for contract value changes over $10,000
        const currentValue = currentContract.totalValue || 0;
        const valueChange = Math.abs(currentValue * (renewalOptions.priceAdjustment || 0));
        if (valueChange > 10000) {
            return true;
        }
        // Require approval for significant service changes
        if (renewalOptions.serviceChanges && renewalOptions.serviceChanges.length > 0) {
            return true;
        }
        return false;
    }
    /**
     * Validate individual service
     */
    validateIndividualService(service, contractData) {
        const errors = [];
        if (!service.name)
            errors.push('Service name is required');
        if (!service.type)
            errors.push('Service type is required');
        if (service.rate !== undefined && service.rate < 0)
            errors.push('Service rate cannot be negative');
        return {
            isValid: errors.length === 0,
            errors
        };
    }
    /**
     * Get required services for contract type
     */
    getRequiredServices(contractType) {
        switch (contractType) {
            case this.CONTRACT_TYPES.RECURRING_SERVICE:
                return ['monitoring', 'maintenance'];
            case this.CONTRACT_TYPES.RETAINER:
                return ['support'];
            default:
                return [];
        }
    }
    /**
     * Validate service bundle
     */
    validateServiceBundle(bundle) {
        const errors = [];
        if (!bundle.name)
            errors.push('Bundle name is required');
        if (!bundle.services || bundle.services.length === 0)
            errors.push('Bundle must include services');
        if (bundle.price < 0)
            errors.push('Bundle price cannot be negative');
        return {
            isValid: errors.length === 0,
            errors
        };
    }
    /**
     * Analyze rate competitiveness
     */
    analyzeRateCompetitiveness(currentRates, marketRates, previousRates) {
        const marginAnalysis = [];
        const rateIncreases = [];
        let positionScore = 0;
        let rateCount = 0;
        Object.entries(currentRates).forEach(([role, rate]) => {
            const marketRate = marketRates[role];
            const previousRate = previousRates[role];
            if (marketRate) {
                const marketComparison = (rate - marketRate) / marketRate;
                positionScore += marketComparison;
                rateCount++;
                marginAnalysis.push({
                    role,
                    currentRate: rate,
                    marketRate,
                    variance: marketComparison * 100
                });
            }
            if (previousRate && previousRate !== rate) {
                const increase = (rate - previousRate) / previousRate;
                rateIncreases.push({
                    role,
                    previousRate,
                    currentRate: rate,
                    increase: increase * 100
                });
            }
        });
        const averagePosition = rateCount > 0 ? positionScore / rateCount : 0;
        let competitivePosition;
        if (averagePosition < -0.05) {
            competitivePosition = 'below';
        }
        else if (averagePosition > 0.05) {
            competitivePosition = 'above';
        }
        else {
            competitivePosition = 'at';
        }
        return {
            competitivePosition,
            marginAnalysis,
            rateIncreases
        };
    }
    /**
     * Calculate contract health score
     */
    calculateContractHealthScore(metrics) {
        let score = 0;
        // Utilization score (0-25 points)
        if (metrics.utilizationRate >= 70 && metrics.utilizationRate <= 90) {
            score += 25; // Optimal range
        }
        else if (metrics.utilizationRate >= 50 || metrics.utilizationRate <= 100) {
            score += 20; // Acceptable range
        }
        else {
            score += 10; // Suboptimal
        }
        // Profitability score (0-25 points)
        if (metrics.profitability >= 20) {
            score += 25;
        }
        else if (metrics.profitability >= 10) {
            score += 20;
        }
        else if (metrics.profitability >= 0) {
            score += 10;
        }
        else {
            score += 0; // Loss
        }
        // Customer satisfaction score (0-25 points)
        score += Math.min(25, (metrics.customerSatisfaction / 5) * 25);
        // SLA compliance score (0-25 points)
        score += (metrics.slaCompliance / 100) * 25;
        return Math.round(score);
    }
}
exports.ContractBusinessLogic = ContractBusinessLogic;
//# sourceMappingURL=ContractBusinessLogic.js.map