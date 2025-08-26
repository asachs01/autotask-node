import { AxiosInstance } from 'axios';
import winston from 'winston';
import { BaseSubClient } from '../base/BaseSubClient';
import {
  // Core contract entities
  Contracts,
  ContractNotes,
  ContractNoteAttachments,
  // Contract billing and rules
  ContractBillingRules,
  ContractBlocks,
  ContractBlockHourFactors,
  ContractCharges,
  ContractRates,
  ContractRetainers,
  ContractRoleCosts,
  ContractMilestones,
  // Contract exclusions
  ContractExclusionBillingCodes,
  ContractExclusionRoles,
  ContractExclusionSets,
  ContractExclusionSetExcludedRoles,
  ContractExclusionSetExcludedWorkTypes,
  // Contract services
  ContractServices,
  ContractServiceAdjustments,
  ContractServiceBundles,
  ContractServiceBundleAdjustments,
  ContractServiceBundleUnits,
  ContractServiceUnits,
  ContractTicketPurchases,
  // Service entities
  Services,
  ServiceBundles,
  ServiceBundleServices,
  ServiceCalls,
  ServiceCallTasks,
  ServiceCallTaskResources,
  ServiceCallTickets,
  ServiceCallTicketResources,
  ServiceLevelAgreementResults,
} from '../../entities';

/**
 * ContractClient handles all contract-related entities:
 * - Contracts and contract management
 * - Contract billing rules and rates
 * - Contract services and service bundles
 * - Contract exclusions and adjustments
 * - Service calls and service level agreements
 */
export class ContractClient extends BaseSubClient {
  // Core contract entities
  public readonly contracts: Contracts;
  public readonly contractNotes: ContractNotes;
  public readonly contractNoteAttachments: ContractNoteAttachments;

  // Contract billing and rules
  public readonly contractBillingRules: ContractBillingRules;
  public readonly contractBlocks: ContractBlocks;
  public readonly contractBlockHourFactors: ContractBlockHourFactors;
  public readonly contractCharges: ContractCharges;
  public readonly contractRates: ContractRates;
  public readonly contractRetainers: ContractRetainers;
  public readonly contractRoleCosts: ContractRoleCosts;
  public readonly contractMilestones: ContractMilestones;

  // Contract exclusions
  public readonly contractExclusionBillingCodes: ContractExclusionBillingCodes;
  public readonly contractExclusionRoles: ContractExclusionRoles;
  public readonly contractExclusionSets: ContractExclusionSets;
  public readonly contractExclusionSetExcludedRoles: ContractExclusionSetExcludedRoles;
  public readonly contractExclusionSetExcludedWorkTypes: ContractExclusionSetExcludedWorkTypes;

  // Contract services
  public readonly contractServices: ContractServices;
  public readonly contractServiceAdjustments: ContractServiceAdjustments;
  public readonly contractServiceBundles: ContractServiceBundles;
  public readonly contractServiceBundleAdjustments: ContractServiceBundleAdjustments;
  public readonly contractServiceBundleUnits: ContractServiceBundleUnits;
  public readonly contractServiceUnits: ContractServiceUnits;
  public readonly contractTicketPurchases: ContractTicketPurchases;

  // Service entities
  public readonly services: Services;
  public readonly serviceBundles: ServiceBundles;
  public readonly serviceBundleServices: ServiceBundleServices;

  // Service calls
  public readonly serviceCalls: ServiceCalls;
  public readonly serviceCallTasks: ServiceCallTasks;
  public readonly serviceCallTaskResources: ServiceCallTaskResources;
  public readonly serviceCallTickets: ServiceCallTickets;
  public readonly serviceCallTicketResources: ServiceCallTicketResources;
  public readonly serviceLevelAgreementResults: ServiceLevelAgreementResults;

  constructor(axios: AxiosInstance, logger: winston.Logger) {
    super(axios, logger, 'ContractClient');

    // Core contract entities
    this.contracts = new Contracts(this.axios, this.logger);
    this.contractNotes = new ContractNotes(this.axios, this.logger);
    this.contractNoteAttachments = new ContractNoteAttachments(this.axios, this.logger);

    // Contract billing and rules
    this.contractBillingRules = new ContractBillingRules(this.axios, this.logger);
    this.contractBlocks = new ContractBlocks(this.axios, this.logger);
    this.contractBlockHourFactors = new ContractBlockHourFactors(this.axios, this.logger);
    this.contractCharges = new ContractCharges(this.axios, this.logger);
    this.contractRates = new ContractRates(this.axios, this.logger);
    this.contractRetainers = new ContractRetainers(this.axios, this.logger);
    this.contractRoleCosts = new ContractRoleCosts(this.axios, this.logger);
    this.contractMilestones = new ContractMilestones(this.axios, this.logger);

    // Contract exclusions
    this.contractExclusionBillingCodes = new ContractExclusionBillingCodes(this.axios, this.logger);
    this.contractExclusionRoles = new ContractExclusionRoles(this.axios, this.logger);
    this.contractExclusionSets = new ContractExclusionSets(this.axios, this.logger);
    this.contractExclusionSetExcludedRoles = new ContractExclusionSetExcludedRoles(this.axios, this.logger);
    this.contractExclusionSetExcludedWorkTypes = new ContractExclusionSetExcludedWorkTypes(this.axios, this.logger);

    // Contract services
    this.contractServices = new ContractServices(this.axios, this.logger);
    this.contractServiceAdjustments = new ContractServiceAdjustments(this.axios, this.logger);
    this.contractServiceBundles = new ContractServiceBundles(this.axios, this.logger);
    this.contractServiceBundleAdjustments = new ContractServiceBundleAdjustments(this.axios, this.logger);
    this.contractServiceBundleUnits = new ContractServiceBundleUnits(this.axios, this.logger);
    this.contractServiceUnits = new ContractServiceUnits(this.axios, this.logger);
    this.contractTicketPurchases = new ContractTicketPurchases(this.axios, this.logger);

    // Service entities
    this.services = new Services(this.axios, this.logger);
    this.serviceBundles = new ServiceBundles(this.axios, this.logger);
    this.serviceBundleServices = new ServiceBundleServices(this.axios, this.logger);

    // Service calls
    this.serviceCalls = new ServiceCalls(this.axios, this.logger);
    this.serviceCallTasks = new ServiceCallTasks(this.axios, this.logger);
    this.serviceCallTaskResources = new ServiceCallTaskResources(this.axios, this.logger);
    this.serviceCallTickets = new ServiceCallTickets(this.axios, this.logger);
    this.serviceCallTicketResources = new ServiceCallTicketResources(this.axios, this.logger);
    this.serviceLevelAgreementResults = new ServiceLevelAgreementResults(this.axios, this.logger);
  }

  getName(): string {
    return 'ContractClient';
  }

  protected async doConnectionTest(): Promise<void> {
    // Test connection with a simple contracts query
    await this.axios.get('/Contracts?$select=id&$top=1');
  }

  // Convenience methods for common contract operations

  /**
   * Get active contracts
   * @param pageSize - Number of records to return (default: 500)
   * @returns Promise with active contracts
   */
  async getActiveContracts(pageSize: number = 500) {
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
  async getActiveServices(pageSize: number = 500) {
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
  async getContractsByCompany(companyId: number, pageSize: number = 500) {
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
  async getRecentContracts(days: number = 30, pageSize: number = 500) {
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
  async getExpiringContracts(days: number = 90, pageSize: number = 500) {
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
  async searchContracts(
    query: string,
    searchFields: string[] = ['contractName', 'contractNumber'],
    pageSize: number = 100
  ) {
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
  async searchServices(
    query: string,
    searchFields: string[] = ['name', 'description'],
    pageSize: number = 100
  ) {
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
  async getContractServicesByContract(contractId: number, pageSize: number = 500) {
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
  async getServiceCallsByCompany(companyId: number, pageSize: number = 500) {
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
  async getRecentServiceCalls(days: number = 7, pageSize: number = 500) {
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