"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContractClient = void 0;
const BaseSubClient_1 = require("../base/BaseSubClient");
const entities_1 = require("../../entities");
/**
 * ContractClient handles all contract-related entities:
 * - Contracts and contract management
 * - Contract billing rules and rates
 * - Contract services and service bundles
 * - Contract exclusions and adjustments
 * - Service calls and service level agreements
 */
class ContractClient extends BaseSubClient_1.BaseSubClient {
    constructor(axios, logger) {
        super(axios, logger, 'ContractClient');
        // Core contract entities
        this.contracts = new entities_1.Contracts(this.axios, this.logger);
        this.contractNotes = new entities_1.ContractNotes(this.axios, this.logger);
        this.contractNoteAttachments = new entities_1.ContractNoteAttachments(this.axios, this.logger);
        // Contract billing and rules
        this.contractBillingRules = new entities_1.ContractBillingRules(this.axios, this.logger);
        this.contractBlocks = new entities_1.ContractBlocks(this.axios, this.logger);
        this.contractBlockHourFactors = new entities_1.ContractBlockHourFactors(this.axios, this.logger);
        this.contractCharges = new entities_1.ContractCharges(this.axios, this.logger);
        this.contractRates = new entities_1.ContractRates(this.axios, this.logger);
        this.contractRetainers = new entities_1.ContractRetainers(this.axios, this.logger);
        this.contractRoleCosts = new entities_1.ContractRoleCosts(this.axios, this.logger);
        this.contractMilestones = new entities_1.ContractMilestones(this.axios, this.logger);
        // Contract exclusions
        this.contractExclusionBillingCodes = new entities_1.ContractExclusionBillingCodes(this.axios, this.logger);
        this.contractExclusionRoles = new entities_1.ContractExclusionRoles(this.axios, this.logger);
        this.contractExclusionSets = new entities_1.ContractExclusionSets(this.axios, this.logger);
        this.contractExclusionSetExcludedRoles = new entities_1.ContractExclusionSetExcludedRoles(this.axios, this.logger);
        this.contractExclusionSetExcludedWorkTypes = new entities_1.ContractExclusionSetExcludedWorkTypes(this.axios, this.logger);
        // Contract services
        this.contractServices = new entities_1.ContractServices(this.axios, this.logger);
        this.contractServiceAdjustments = new entities_1.ContractServiceAdjustments(this.axios, this.logger);
        this.contractServiceBundles = new entities_1.ContractServiceBundles(this.axios, this.logger);
        this.contractServiceBundleAdjustments = new entities_1.ContractServiceBundleAdjustments(this.axios, this.logger);
        this.contractServiceBundleUnits = new entities_1.ContractServiceBundleUnits(this.axios, this.logger);
        this.contractServiceUnits = new entities_1.ContractServiceUnits(this.axios, this.logger);
        this.contractTicketPurchases = new entities_1.ContractTicketPurchases(this.axios, this.logger);
        // Service entities
        this.services = new entities_1.Services(this.axios, this.logger);
        this.serviceBundles = new entities_1.ServiceBundles(this.axios, this.logger);
        this.serviceBundleServices = new entities_1.ServiceBundleServices(this.axios, this.logger);
        // Service calls
        this.serviceCalls = new entities_1.ServiceCalls(this.axios, this.logger);
        this.serviceCallTasks = new entities_1.ServiceCallTasks(this.axios, this.logger);
        this.serviceCallTaskResources = new entities_1.ServiceCallTaskResources(this.axios, this.logger);
        this.serviceCallTickets = new entities_1.ServiceCallTickets(this.axios, this.logger);
        this.serviceCallTicketResources = new entities_1.ServiceCallTicketResources(this.axios, this.logger);
        this.serviceLevelAgreementResults = new entities_1.ServiceLevelAgreementResults(this.axios, this.logger);
    }
    getName() {
        return 'ContractClient';
    }
    async doConnectionTest() {
        // Test connection with a simple contracts query
        await this.axios.get('/Contracts?$select=id&$top=1');
    }
    // Convenience methods for common contract operations
    /**
     * Get active contracts
     * @param pageSize - Number of records to return (default: 500)
     * @returns Promise with active contracts
     */
    async getActiveContracts(pageSize = 500) {
        return this.contracts.list({
            filter: [
                {
                    op: 'eq',
                    field: 'status',
                    value: 1, // Active status
                },
            ],
            pageSize,
        });
    }
    /**
     * Get active services
     * @param pageSize - Number of records to return (default: 500)
     * @returns Promise with active services
     */
    async getActiveServices(pageSize = 500) {
        return this.services.list({
            filter: [
                {
                    op: 'eq',
                    field: 'isActive',
                    value: true,
                },
            ],
            pageSize,
        });
    }
    /**
     * Get contracts by company
     * @param companyId - Company ID
     * @param pageSize - Number of records to return (default: 500)
     * @returns Promise with company contracts
     */
    async getContractsByCompany(companyId, pageSize = 500) {
        return this.contracts.list({
            filter: [
                {
                    op: 'eq',
                    field: 'companyID',
                    value: companyId,
                },
            ],
            pageSize,
        });
    }
    /**
     * Get recent contracts created within specified days
     * @param days - Number of days to look back (default: 30)
     * @param pageSize - Number of records to return (default: 500)
     * @returns Promise with recent contracts
     */
    async getRecentContracts(days = 30, pageSize = 500) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        return this.contracts.list({
            filter: [
                {
                    op: 'gte',
                    field: 'startDate',
                    value: cutoffDate.toISOString(),
                },
            ],
            pageSize,
            sort: 'startDate desc',
        });
    }
    /**
     * Get expiring contracts within specified days
     * @param days - Number of days to look ahead (default: 90)
     * @param pageSize - Number of records to return (default: 500)
     * @returns Promise with expiring contracts
     */
    async getExpiringContracts(days = 90, pageSize = 500) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() + days);
        return this.contracts.list({
            filter: [
                {
                    op: 'lte',
                    field: 'endDate',
                    value: cutoffDate.toISOString(),
                },
                {
                    op: 'eq',
                    field: 'status',
                    value: 1, // Active status
                },
            ],
            pageSize,
            sort: 'endDate asc',
        });
    }
    /**
     * Search contracts by name or other criteria
     * @param query - Search query string
     * @param searchFields - Fields to search in (default: ['contractName', 'contractNumber'])
     * @param pageSize - Number of records to return (default: 100)
     * @returns Promise with matching contracts
     */
    async searchContracts(query, searchFields = ['contractName', 'contractNumber'], pageSize = 100) {
        const filters = searchFields.map(field => ({
            op: 'contains',
            field,
            value: query,
        }));
        return this.contracts.list({
            filter: filters.length === 1 ? filters : [{ op: 'or', items: filters }],
            pageSize,
            sort: 'contractName asc',
        });
    }
    /**
     * Search services by name or description
     * @param query - Search query string
     * @param searchFields - Fields to search in (default: ['name', 'description'])
     * @param pageSize - Number of records to return (default: 100)
     * @returns Promise with matching services
     */
    async searchServices(query, searchFields = ['name', 'description'], pageSize = 100) {
        const filters = searchFields.map(field => ({
            op: 'contains',
            field,
            value: query,
        }));
        return this.services.list({
            filter: filters.length === 1 ? filters : [{ op: 'or', items: filters }],
            pageSize,
            sort: 'name asc',
        });
    }
    /**
     * Get contract services by contract
     * @param contractId - Contract ID
     * @param pageSize - Number of records to return (default: 500)
     * @returns Promise with contract services
     */
    async getContractServicesByContract(contractId, pageSize = 500) {
        return this.contractServices.list({
            filter: [
                {
                    op: 'eq',
                    field: 'contractID',
                    value: contractId,
                },
            ],
            pageSize,
        });
    }
    /**
     * Get service calls by company
     * @param companyId - Company ID
     * @param pageSize - Number of records to return (default: 500)
     * @returns Promise with company service calls
     */
    async getServiceCallsByCompany(companyId, pageSize = 500) {
        return this.serviceCalls.list({
            filter: [
                {
                    op: 'eq',
                    field: 'accountID',
                    value: companyId,
                },
            ],
            pageSize,
        });
    }
    /**
     * Get recent service calls created within specified days
     * @param days - Number of days to look back (default: 7)
     * @param pageSize - Number of records to return (default: 500)
     * @returns Promise with recent service calls
     */
    async getRecentServiceCalls(days = 7, pageSize = 500) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        return this.serviceCalls.list({
            filter: [
                {
                    op: 'gte',
                    field: 'createDate',
                    value: cutoffDate.toISOString(),
                },
            ],
            pageSize,
            sort: 'createDate desc',
        });
    }
}
exports.ContractClient = ContractClient;
//# sourceMappingURL=ContractClient.js.map