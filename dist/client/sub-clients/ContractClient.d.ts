import { AxiosInstance } from 'axios';
import winston from 'winston';
import { BaseSubClient } from '../base/BaseSubClient';
import { Contracts, ContractNotes, ContractNoteAttachments, ContractBillingRules, ContractBlocks, ContractBlockHourFactors, ContractCharges, ContractRates, ContractRetainers, ContractRoleCosts, ContractMilestones, ContractExclusionBillingCodes, ContractExclusionRoles, ContractExclusionSets, ContractExclusionSetExcludedRoles, ContractExclusionSetExcludedWorkTypes, ContractServices, ContractServiceAdjustments, ContractServiceBundles, ContractServiceBundleAdjustments, ContractServiceBundleUnits, ContractServiceUnits, ContractTicketPurchases, Services, ServiceBundles, ServiceBundleServices, ServiceCalls, ServiceCallTasks, ServiceCallTaskResources, ServiceCallTickets, ServiceCallTicketResources, ServiceLevelAgreementResults } from '../../entities';
/**
 * ContractClient handles all contract-related entities:
 * - Contracts and contract management
 * - Contract billing rules and rates
 * - Contract services and service bundles
 * - Contract exclusions and adjustments
 * - Service calls and service level agreements
 */
export declare class ContractClient extends BaseSubClient {
    readonly contracts: Contracts;
    readonly contractNotes: ContractNotes;
    readonly contractNoteAttachments: ContractNoteAttachments;
    readonly contractBillingRules: ContractBillingRules;
    readonly contractBlocks: ContractBlocks;
    readonly contractBlockHourFactors: ContractBlockHourFactors;
    readonly contractCharges: ContractCharges;
    readonly contractRates: ContractRates;
    readonly contractRetainers: ContractRetainers;
    readonly contractRoleCosts: ContractRoleCosts;
    readonly contractMilestones: ContractMilestones;
    readonly contractExclusionBillingCodes: ContractExclusionBillingCodes;
    readonly contractExclusionRoles: ContractExclusionRoles;
    readonly contractExclusionSets: ContractExclusionSets;
    readonly contractExclusionSetExcludedRoles: ContractExclusionSetExcludedRoles;
    readonly contractExclusionSetExcludedWorkTypes: ContractExclusionSetExcludedWorkTypes;
    readonly contractServices: ContractServices;
    readonly contractServiceAdjustments: ContractServiceAdjustments;
    readonly contractServiceBundles: ContractServiceBundles;
    readonly contractServiceBundleAdjustments: ContractServiceBundleAdjustments;
    readonly contractServiceBundleUnits: ContractServiceBundleUnits;
    readonly contractServiceUnits: ContractServiceUnits;
    readonly contractTicketPurchases: ContractTicketPurchases;
    readonly services: Services;
    readonly serviceBundles: ServiceBundles;
    readonly serviceBundleServices: ServiceBundleServices;
    readonly serviceCalls: ServiceCalls;
    readonly serviceCallTasks: ServiceCallTasks;
    readonly serviceCallTaskResources: ServiceCallTaskResources;
    readonly serviceCallTickets: ServiceCallTickets;
    readonly serviceCallTicketResources: ServiceCallTicketResources;
    readonly serviceLevelAgreementResults: ServiceLevelAgreementResults;
    constructor(axios: AxiosInstance, logger: winston.Logger);
    getName(): string;
    protected doConnectionTest(): Promise<void>;
    /**
     * Get active contracts
     * @param pageSize - Number of records to return (default: 500)
     * @returns Promise with active contracts
     */
    getActiveContracts(pageSize?: number): Promise<import("../../types").ApiResponse<import("../../entities/contracts").IContracts[]>>;
    /**
     * Get active services
     * @param pageSize - Number of records to return (default: 500)
     * @returns Promise with active services
     */
    getActiveServices(pageSize?: number): Promise<import("../../types").ApiResponse<import("../../entities/services").IServices[]>>;
    /**
     * Get contracts by company
     * @param companyId - Company ID
     * @param pageSize - Number of records to return (default: 500)
     * @returns Promise with company contracts
     */
    getContractsByCompany(companyId: number, pageSize?: number): Promise<import("../../types").ApiResponse<import("../../entities/contracts").IContracts[]>>;
    /**
     * Get recent contracts created within specified days
     * @param days - Number of days to look back (default: 30)
     * @param pageSize - Number of records to return (default: 500)
     * @returns Promise with recent contracts
     */
    getRecentContracts(days?: number, pageSize?: number): Promise<import("../../types").ApiResponse<import("../../entities/contracts").IContracts[]>>;
    /**
     * Get expiring contracts within specified days
     * @param days - Number of days to look ahead (default: 90)
     * @param pageSize - Number of records to return (default: 500)
     * @returns Promise with expiring contracts
     */
    getExpiringContracts(days?: number, pageSize?: number): Promise<import("../../types").ApiResponse<import("../../entities/contracts").IContracts[]>>;
    /**
     * Search contracts by name or other criteria
     * @param query - Search query string
     * @param searchFields - Fields to search in (default: ['contractName', 'contractNumber'])
     * @param pageSize - Number of records to return (default: 100)
     * @returns Promise with matching contracts
     */
    searchContracts(query: string, searchFields?: string[], pageSize?: number): Promise<import("../../types").ApiResponse<import("../../entities/contracts").IContracts[]>>;
    /**
     * Search services by name or description
     * @param query - Search query string
     * @param searchFields - Fields to search in (default: ['name', 'description'])
     * @param pageSize - Number of records to return (default: 100)
     * @returns Promise with matching services
     */
    searchServices(query: string, searchFields?: string[], pageSize?: number): Promise<import("../../types").ApiResponse<import("../../entities/services").IServices[]>>;
    /**
     * Get contract services by contract
     * @param contractId - Contract ID
     * @param pageSize - Number of records to return (default: 500)
     * @returns Promise with contract services
     */
    getContractServicesByContract(contractId: number, pageSize?: number): Promise<import("../../types").ApiResponse<import("../../entities/contractservices").IContractServices[]>>;
    /**
     * Get service calls by company
     * @param companyId - Company ID
     * @param pageSize - Number of records to return (default: 500)
     * @returns Promise with company service calls
     */
    getServiceCallsByCompany(companyId: number, pageSize?: number): Promise<import("../../types").ApiResponse<import("../../entities/servicecalls").IServiceCalls[]>>;
    /**
     * Get recent service calls created within specified days
     * @param days - Number of days to look back (default: 7)
     * @param pageSize - Number of records to return (default: 500)
     * @returns Promise with recent service calls
     */
    getRecentServiceCalls(days?: number, pageSize?: number): Promise<import("../../types").ApiResponse<import("../../entities/servicecalls").IServiceCalls[]>>;
}
//# sourceMappingURL=ContractClient.d.ts.map