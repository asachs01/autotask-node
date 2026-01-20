import winston from 'winston';
import { RequestHandler } from '../utils/requestHandler';
import { AutotaskAuth, PerformanceConfig } from '../types';
import { ErrorLogger } from '../errors/ErrorLogger';
import { CoreClient, ContractClient, FinancialClient, ConfigurationClient, TimeTrackingClient, KnowledgeClient, InventoryClient, ReportsClient, ISubClient } from './sub-clients';
/**
 * AutotaskClient - Production-ready client for the Autotask REST API
 *
 * This refactored client provides clean separation of concerns through category-based
 * sub-clients, each handling related business functionality:
 *
 * @example
 * ```typescript
 * const client = await AutotaskClient.create({
 *   username: 'your_username',
 *   integrationCode: 'your_integration_code',
 *   secret: 'your_secret'
 * });
 *
 * // Access organized sub-clients
 * const tickets = await client.core.tickets.list({ filter: 'status eq Open' });
 * const contracts = await client.contractsClient.contracts.list();
 * const invoices = await client.financial.invoices.list();
 *
 * // Still supports direct access for backward compatibility
 * const directTickets = await client.tickets.list();
 * ```
 */
export declare class AutotaskClient {
    private config;
    private axios;
    private requestHandler;
    private rateLimiter;
    private performanceConfig;
    private logger;
    private errorLogger;
    private subClients;
    private isFullyInitialized;
    /** Core business entities: Companies, Contacts, Tickets, Projects, Tasks, Opportunities, Resources */
    readonly core: CoreClient;
    /** Contract management: Contracts, Services, Billing Rules, Service Calls */
    readonly contractsClient: ContractClient;
    /** Financial operations: Invoices, Quotes, Purchase Orders, Billing, Expenses */
    readonly financial: FinancialClient;
    /** System configuration: Assets, Locations, Departments, Reference Data */
    readonly configuration: ConfigurationClient;
    /** Time tracking: Time Entries, Schedules, Availability, Time Off */
    readonly timeTracking: TimeTrackingClient;
    /** Knowledge management: Articles, Documents, Checklists, Tags */
    readonly knowledge: KnowledgeClient;
    /** Inventory management: Products, Stock, Transfers, Subscriptions */
    readonly inventory: InventoryClient;
    /** Reporting and analytics: Audit Logs, Surveys, Portal Users, Change Tracking */
    readonly reports: ReportsClient;
    private _directEntityCache;
    private constructor();
    /**
     * Setup rate limiting interceptor to prevent overwhelming the API
     */
    private setupRateLimitingInterceptor;
    /**
     * Creates a new AutotaskClient instance with organized sub-client architecture.
     *
     * This factory method handles:
     * - Automatic zone detection via Autotask API
     * - Environment variable loading from .env files
     * - Performance optimization configuration
     * - Rate limiting and connection pooling setup
     * - Lazy initialization of sub-clients for optimal startup time
     *
     * @param config - Authentication configuration. If not provided, will use environment variables
     * @param performanceConfig - Optional performance and optimization settings
     * @returns Promise<AutotaskClient> - Fully configured client instance
     *
     * @example
     * ```typescript
     * // Using explicit configuration
     * const client = await AutotaskClient.create({
     *   username: 'your_username',
     *   integrationCode: 'your_integration_code',
     *   secret: 'your_secret',
     *   apiUrl: 'https://webservices12.autotask.net/ATServicesRest/v1.0/' // optional
     * });
     *
     * // Using environment variables
     * const client = await AutotaskClient.create();
     *
     * // With performance configuration
     * const client = await AutotaskClient.create(config, {
     *   timeout: 60000,
     *   maxConcurrentRequests: 20,
     *   requestsPerSecond: 10
     * });
     * ```
     */
    static create(config?: AutotaskAuth, performanceConfig?: PerformanceConfig, errorLogger?: ErrorLogger): Promise<AutotaskClient>;
    /**
     * Initialize all sub-clients (lazy loading)
     */
    initializeAllSubClients(): Promise<void>;
    /**
     * Test the API connection
     * @returns Promise<boolean> - true if connection is successful
     */
    testConnection(): Promise<boolean>;
    /**
     * Test connectivity for all sub-clients
     */
    testAllSubClientConnections(): Promise<Record<string, boolean>>;
    /**
     * Get current configuration
     */
    getConfig(): Readonly<AutotaskAuth>;
    /**
     * Get performance metrics and configuration
     */
    getPerformanceConfig(): Readonly<Required<PerformanceConfig>>;
    /**
     * Get the request handler instance
     * @returns RequestHandler - The internal request handler
     */
    getRequestHandler(): RequestHandler;
    /**
     * Get performance metrics
     * @returns Performance metrics object with detailed statistics
     */
    getPerformanceMetrics(): {
        rateLimiter: {
            requestsPerSecond: number;
        };
        connectionPooling: {
            enabled: boolean;
            maxConcurrentRequests: number;
        };
        timeouts: {
            requestTimeout: number;
            keepAliveTimeout: number;
        };
        limits: {
            maxContentLength: number;
            maxBodyLength: number;
        };
        subClients: {
            initialized: number;
            total: number;
            status: Record<string, boolean>;
        };
    };
    /**
     * Update rate limit at runtime
     * @param requestsPerSecond - New requests per second limit
     */
    updateRateLimit(requestsPerSecond: number): void;
    /**
     * Get the logger instance
     * @returns winston.Logger - The internal logger
     */
    getLogger(): winston.Logger;
    /**
     * Get the error logger instance
     * @returns ErrorLogger - The structured error logger
     */
    getErrorLogger(): ErrorLogger;
    /**
     * Get a specific sub-client by name
     */
    getSubClient(name: string): ISubClient | undefined;
    /**
     * Get all sub-client names and initialization status
     */
    getSubClientStatus(): Record<string, {
        initialized: boolean;
        name: string;
    }>;
    private getEntityFromSubClient;
    get companies(): any;
    get contacts(): any;
    get tickets(): any;
    get projects(): any;
    get tasks(): any;
    get opportunities(): any;
    get resources(): any;
    get companyAttachments(): any;
    get ticketAttachments(): any;
    get projectAttachments(): any;
    get taskAttachments(): any;
    get resourceAttachments(): any;
    get opportunityAttachments(): any;
    get documentAttachments(): any;
    get expenseItemAttachments(): any;
    get expenseReportAttachments(): any;
    get salesOrderAttachments(): any;
    get timeEntryAttachments(): any;
    get attachmentInfo(): any;
    get companyNotes(): any;
    get ticketNotes(): any;
    get projectNotes(): any;
    get taskNotes(): any;
    get contractNotes(): any;
    get documentNotes(): any;
    get productNotes(): any;
    get configurationItemNotes(): any;
    get articleNotes(): any;
    get companyNoteAttachments(): any;
    get ticketNoteAttachments(): any;
    get projectNoteAttachments(): any;
    get taskNoteAttachments(): any;
    get contractNoteAttachments(): any;
    get configurationItemNoteAttachments(): any;
    get contracts(): any;
    get contractBillingRules(): any;
    get contractBlocks(): any;
    get contractBlockHourFactors(): any;
    get contractCharges(): any;
    get contractExclusionBillingCodes(): any;
    get contractExclusionRoles(): any;
    get contractExclusionSets(): any;
    get contractExclusionSetExcludedRoles(): any;
    get contractExclusionSetExcludedWorkTypes(): any;
    get contractMilestones(): any;
    get contractRates(): any;
    get contractRetainers(): any;
    get contractRoleCosts(): any;
    get contractServices(): any;
    get contractServiceAdjustments(): any;
    get contractServiceBundles(): any;
    get contractServiceBundleAdjustments(): any;
    get contractServiceBundleUnits(): any;
    get contractServiceUnits(): any;
    get contractTicketPurchases(): any;
    get services(): any;
    get serviceBundles(): any;
    get serviceBundleServices(): any;
    get serviceCalls(): any;
    get serviceCallTasks(): any;
    get serviceCallTaskResources(): any;
    get serviceCallTickets(): any;
    get serviceCallTicketResources(): any;
    get serviceLevelAgreementResults(): any;
    get configurationItems(): any;
    get configurationItemAttachments(): any;
    get configurationItemBillingProductAssociations(): any;
    get configurationItemCategories(): any;
    get configurationItemCategoryUdfAssociations(): any;
    get configurationItemDnsRecords(): any;
    get configurationItemRelatedItems(): any;
    get configurationItemSslSubjectAlternativeName(): any;
    get configurationItemTypes(): any;
    get billingCodes(): any;
    get billingItems(): any;
    get billingItemApprovalLevels(): any;
    get invoices(): any;
    get invoiceTemplates(): any;
    get quotes(): any;
    get quoteItems(): any;
    get quoteLocations(): any;
    get quoteTemplates(): any;
    get purchaseOrders(): any;
    get purchaseOrderItems(): any;
    get purchaseOrderItemReceiving(): any;
    get purchaseApprovals(): any;
    get changeOrderCharges(): any;
    get taxes(): any;
    get taxCategories(): any;
    get taxRegions(): any;
    get currencies(): any;
    get paymentTerms(): any;
    get salesOrders(): any;
    get expenseItems(): any;
    get expenseReports(): any;
    get additionalInvoiceFieldValues(): any;
    get priceListMaterialCodes(): any;
    get priceListProducts(): any;
    get priceListProductTiers(): any;
    get priceListRoles(): any;
    get priceListServices(): any;
    get priceListServiceBundles(): any;
    get priceListWorkTypeModifiers(): any;
    get inventoryItems(): any;
    get inventoryItemSerialNumbers(): any;
    get inventoryLocations(): any;
    get inventoryProducts(): any;
    get inventoryStockedItems(): any;
    get inventoryStockedItemsAdd(): any;
    get inventoryStockedItemsRemove(): any;
    get inventoryStockedItemsTransfer(): any;
    get inventoryTransfers(): any;
    get products(): any;
    get productTiers(): any;
    get productVendors(): any;
    get subscriptionPeriods(): any;
    get subscriptions(): any;
    get timeEntries(): any;
    get appointments(): any;
    get holidays(): any;
    get holidaySets(): any;
    get resourceDailyAvailabilities(): any;
    get resourceTimeOffAdditional(): any;
    get resourceTimeOffApprovers(): any;
    get resourceTimeOffBalances(): any;
    get timeOffRequests(): any;
    get timeOffRequestsApprove(): any;
    get timeOffRequestsReject(): any;
    get knowledgeBaseArticles(): any;
    get knowledgeBaseCategories(): any;
    get documents(): any;
    get documentCategories(): any;
    get documentChecklistItems(): any;
    get documentChecklistLibraries(): any;
    get documentConfigurationItemAssociations(): any;
    get documentConfigurationItemCategoryAssociations(): any;
    get documentTagAssociations(): any;
    get documentTicketAssociations(): any;
    get documentToArticleAssociations(): any;
    get articleAttachments(): any;
    get articleConfigurationItemCategoryAssociations(): any;
    get articlePlainTextContent(): any;
    get articleTagAssociations(): any;
    get articleTicketAssociations(): any;
    get articleToArticleAssociations(): any;
    get articleToDocumentAssociations(): any;
    get checklistLibraries(): any;
    get checklistLibraryChecklistItems(): any;
    get tags(): any;
    get tagGroups(): any;
    get tagAliases(): any;
    get departments(): any;
    get organizationalLevel1(): any;
    get organizationalLevel2(): any;
    get organizationalLevelAssociations(): any;
    get organizatonalResources(): any;
    get internalLocations(): any;
    get internalLocationWithBusinessHours(): any;
    get countries(): any;
    get roles(): any;
    get skills(): any;
    get resourceSkills(): any;
    get resourceRoles(): any;
    get resourceRoleDepartments(): any;
    get resourceRoleQueues(): any;
    get resourceServiceDeskRoles(): any;
    get actionTypes(): any;
    get classificationIcons(): any;
    get shippingTypes(): any;
    get modules(): any;
    get domainRegistrars(): any;
    get workTypeModifiers(): any;
    get phases(): any;
    get version(): any;
    get userDefinedFieldDefinitions(): any;
    get userDefinedFieldListItems(): any;
    get companyAlerts(): any;
    get companyCategories(): any;
    get companyLocations(): any;
    get companySiteConfigurations(): any;
    get companyTeams(): any;
    get companyToDos(): any;
    get contactBillingProductAssociations(): any;
    get contactGroups(): any;
    get contactGroupContacts(): any;
    get ticketCategories(): any;
    get ticketCategoryFieldDefaults(): any;
    get ticketAdditionalConfigurationItems(): any;
    get ticketAdditionalContacts(): any;
    get ticketChangeRequestApprovals(): any;
    get ticketCharges(): any;
    get ticketChecklistItems(): any;
    get ticketChecklistLibraries(): any;
    get ticketHistory(): any;
    get ticketRmaCredits(): any;
    get ticketSecondaryResources(): any;
    get ticketTagAssociations(): any;
    get taskPredecessors(): any;
    get taskSecondaryResources(): any;
    get projectCharges(): any;
    get deletedTaskActivityLogs(): any;
    get deletedTicketActivityLogs(): any;
    get deletedTicketLogs(): any;
    get notificationHistory(): any;
    get surveys(): any;
    get surveyResults(): any;
    get clientPortalUsers(): any;
    get changeRequestLinks(): any;
    get comanagedAssociations(): any;
    /** @deprecated Use companies instead */
    get accounts(): any;
    /** @deprecated Use ticketNotes, companyNotes, etc. instead */
    get notes(): any;
    /** @deprecated Use ticketAttachments, companyAttachments, etc. instead */
    get attachments(): any;
    /** @deprecated Use contractServiceAdjustments instead */
    get contractAdjustments(): any;
    /** @deprecated Use contractExclusionSets instead */
    get contractExclusions(): any;
    /** @deprecated Use expenseItems instead */
    get expenses(): any;
    /** @deprecated Not directly available - use specific status lookup entities */
    get ticketStatuses(): any;
    /** @deprecated Not directly available - use specific priority lookup entities */
    get ticketPriorities(): any;
    /** @deprecated Not directly available - use specific source lookup entities */
    get ticketSources(): any;
    /**
     * Generic entity creation method for migration purposes
     * Routes to appropriate sub-client based on entity type
     */
    createEntity(entityType: string, data: any): Promise<any>;
}
//# sourceMappingURL=AutotaskClient.d.ts.map