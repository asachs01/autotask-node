import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { AxiosInstance } from 'axios';
import winston from 'winston';
import { createMockAxios, createMockLogger, createTestRequestHandler } from './utils/testHelpers';

// Import all exports from the index file
import * as AutotaskEntities from '../src/entities/index';

// Import specific entities for detailed testing
import { 
  ActionTypes,
  AdditionalInvoiceFieldValues,
  Appointments,
  ArticleAttachments,
  ArticleConfigurationItemCategoryAssociations,
  ArticleNotes,
  ArticlePlainTextContent,
  ArticleTagAssociations,
  ArticleTicketAssociations,
  ArticleToArticleAssociations,
  ArticleToDocumentAssociations,
  AttachmentInfo,
  BillingCodes,
  BillingItemApprovalLevels,
  BillingItems,
  ChangeOrderCharges,
  ChangeRequestLinks,
  ChecklistLibraries,
  ChecklistLibraryChecklistItems,
  ClassificationIcons,
  ClientPortalUsers,
  ComanagedAssociations,
  Companies,
  CompanyAlerts,
  CompanyAttachments,
  CompanyCategories,
  CompanyLocations,
  CompanyNoteAttachments,
  CompanyNotes,
  CompanySiteConfigurations,
  CompanyTeams,
  CompanyToDos,
  ConfigurationItemAttachments,
  ConfigurationItemBillingProductAssociations,
  ConfigurationItemCategories,
  ConfigurationItemCategoryUdfAssociations,
  ConfigurationItemDnsRecords,
  ConfigurationItemNoteAttachments,
  ConfigurationItemNotes,
  ConfigurationItemRelatedItems,
  ConfigurationItems,
  ConfigurationItemSslSubjectAlternativeName,
  ConfigurationItemTypes,
  ContactBillingProductAssociations,
  ContactGroupContacts,
  ContactGroups,
  Contacts,
  ContractBillingRules,
  ContractBlockHourFactors,
  ContractBlocks,
  ContractCharges,
  ContractExclusionBillingCodes,
  ContractExclusionRoles,
  ContractExclusionSetExcludedRoles,
  ContractExclusionSetExcludedWorkTypes,
  ContractExclusionSets,
  ContractMilestones,
  ContractNoteAttachments,
  ContractNotes,
  ContractRates,
  ContractRetainers,
  ContractRoleCosts,
  Contracts,
  ContractServiceAdjustments,
  ContractServiceBundleAdjustments,
  ContractServiceBundles,
  ContractServiceBundleUnits,
  ContractServices,
  ContractServiceUnits,
  ContractTicketPurchases,
  Countries,
  Currencies,
  DeletedTaskActivityLogs,
  DeletedTicketActivityLogs,
  DeletedTicketLogs,
  Departments,
  DocumentAttachments,
  DocumentCategories,
  DocumentChecklistItems,
  DocumentChecklistLibraries,
  DocumentConfigurationItemAssociations,
  DocumentConfigurationItemCategoryAssociations,
  DocumentNotes,
  Documents,
  DocumentTagAssociations,
  DocumentTicketAssociations,
  DocumentToArticleAssociations,
  DomainRegistrars,
  ExpenseItemAttachments,
  ExpenseItems,
  ExpenseReportAttachments,
  ExpenseReports,
  Holidays,
  HolidaySets,
  InternalLocations,
  InternalLocationWithBusinessHours,
  InventoryItems,
  InventoryItemSerialNumbers,
  InventoryLocations,
  InventoryProducts,
  InventoryStockedItems,
  InventoryStockedItemsAdd,
  InventoryStockedItemsRemove,
  InventoryStockedItemsTransfer,
  InventoryTransfers,
  Invoices,
  InvoiceTemplates,
  KnowledgeBaseArticles,
  KnowledgeBaseCategories,
  Modules,
  NotificationHistory,
  Opportunities,
  OpportunityAttachments,
  OpportunityCategories,
  OrganizationalLevel1,
  OrganizationalLevel2,
  OrganizationalLevelAssociations,
  OrganizatonalResources,
  PaymentTerms,
  Phases,
  PriceListMaterialCodes,
  PriceListProducts,
  PriceListProductTiers,
  PriceListRoles,
  PriceListServiceBundles,
  PriceListServices,
  PriceListWorkTypeModifiers,
  ProductNotes,
  Products,
  ProductTiers,
  ProductVendors,
  ProjectAttachments,
  ProjectCharges,
  ProjectNoteAttachments,
  ProjectNotes,
  Projects,
  PurchaseApprovals,
  PurchaseOrderItemReceiving,
  PurchaseOrderItems,
  PurchaseOrders,
  QuoteItems,
  QuoteLocations,
  Quotes,
  QuoteTemplates,
  ResourceAttachments,
  ResourceDailyAvailabilities,
  ResourceRoleDepartments,
  ResourceRoleQueues,
  ResourceRoles,
  Resources,
  ResourceServiceDeskRoles,
  ResourceSkills,
  ResourceTimeOffAdditional,
  ResourceTimeOffApprovers,
  ResourceTimeOffBalances,
  Roles,
  SalesOrderAttachments,
  SalesOrders,
  ServiceBundles,
  ServiceBundleServices,
  ServiceCalls,
  ServiceCallTaskResources,
  ServiceCallTasks,
  ServiceCallTicketResources,
  ServiceCallTickets,
  ServiceLevelAgreementResults,
  Services,
  ShippingTypes,
  Skills,
  SubscriptionPeriods,
  Subscriptions,
  SurveyResults,
  Surveys,
  TagAliases,
  TagGroups,
  Tags,
  TaskAttachments,
  TaskNoteAttachments,
  TaskNotes,
  TaskPredecessors,
  Tasks,
  TaskSecondaryResources,
  TaxCategories,
  Taxes,
  TaxRegions,
  TicketAdditionalConfigurationItems,
  TicketAdditionalContacts,
  TicketAttachments,
  TicketCategories,
  TicketCategoryFieldDefaults,
  TicketPriorities,
  TicketPriority,
  TicketSources,
  TicketSource,
  TicketStatuses,
  TicketStatus,
  TicketChangeRequestApprovals,
  TicketCharges,
  TicketChecklistItems,
  TicketChecklistLibraries,
  TicketHistory,
  TicketNoteAttachments,
  TicketNotes,
  TicketRmaCredits,
  Tickets,
  TicketSecondaryResources,
  TicketTagAssociations,
  TimeEntries,
  TimeEntryAttachments,
  TimeOffRequests,
  TimeOffRequestsApprove,
  TimeOffRequestsReject,
  UserDefinedFieldDefinitions,
  UserDefinedFieldListItems,
  Version,
  WorkTypeModifiers
} from '../src/entities/index';

describe('Entity Index Exports', () => {
  let mockAxios: jest.Mocked<AxiosInstance>;
  let mockLogger: jest.Mocked<winston.Logger>;

  beforeEach(() => {
    mockAxios = createMockAxios() as any;
    mockLogger = createMockLogger() as any;
  });

  describe('Export Completeness', () => {
    it('should export all expected entity classes', () => {
      // Test that all major entities are exported
      const expectedExports = [
        'ActionTypes', 'AdditionalInvoiceFieldValues', 'Appointments', 'ArticleAttachments',
        'ArticleConfigurationItemCategoryAssociations', 'ArticleNotes', 'ArticlePlainTextContent',
        'ArticleTagAssociations', 'ArticleTicketAssociations', 'ArticleToArticleAssociations',
        'ArticleToDocumentAssociations', 'AttachmentInfo', 'BillingCodes', 'BillingItemApprovalLevels',
        'BillingItems', 'ChangeOrderCharges', 'ChangeRequestLinks', 'ChecklistLibraries',
        'ChecklistLibraryChecklistItems', 'ClassificationIcons', 'ClientPortalUsers',
        'ComanagedAssociations', 'Companies', 'CompanyAlerts', 'CompanyAttachments',
        'CompanyCategories', 'CompanyLocations', 'CompanyNoteAttachments', 'CompanyNotes',
        'CompanySiteConfigurations', 'CompanyTeams', 'CompanyToDos', 'ConfigurationItemAttachments',
        'ConfigurationItemBillingProductAssociations', 'ConfigurationItemCategories',
        'ConfigurationItemCategoryUdfAssociations', 'ConfigurationItemDnsRecords',
        'ConfigurationItemNoteAttachments', 'ConfigurationItemNotes', 'ConfigurationItemRelatedItems',
        'ConfigurationItems', 'ConfigurationItemSslSubjectAlternativeName', 'ConfigurationItemTypes',
        'ContactBillingProductAssociations', 'ContactGroupContacts', 'ContactGroups', 'Contacts',
        'ContractBillingRules', 'ContractBlockHourFactors', 'ContractBlocks', 'ContractCharges',
        'ContractExclusionBillingCodes', 'ContractExclusionRoles', 'ContractExclusionSetExcludedRoles',
        'ContractExclusionSetExcludedWorkTypes', 'ContractExclusionSets', 'ContractMilestones',
        'ContractNoteAttachments', 'ContractNotes', 'ContractRates', 'ContractRetainers',
        'ContractRoleCosts', 'Contracts', 'ContractServiceAdjustments', 'ContractServiceBundleAdjustments',
        'ContractServiceBundles', 'ContractServiceBundleUnits', 'ContractServices',
        'ContractServiceUnits', 'ContractTicketPurchases', 'Countries', 'Currencies',
        'DeletedTaskActivityLogs', 'DeletedTicketActivityLogs', 'DeletedTicketLogs', 'Departments',
        'DocumentAttachments', 'DocumentCategories', 'DocumentChecklistItems', 'DocumentChecklistLibraries',
        'DocumentConfigurationItemAssociations', 'DocumentConfigurationItemCategoryAssociations',
        'DocumentNotes', 'Documents', 'DocumentTagAssociations', 'DocumentTicketAssociations',
        'DocumentToArticleAssociations', 'DomainRegistrars', 'ExpenseItemAttachments', 'ExpenseItems',
        'ExpenseReportAttachments', 'ExpenseReports', 'Holidays', 'HolidaySets', 'InternalLocations',
        'InternalLocationWithBusinessHours', 'InventoryItems', 'InventoryItemSerialNumbers',
        'InventoryLocations', 'InventoryProducts', 'InventoryStockedItems', 'InventoryStockedItemsAdd',
        'InventoryStockedItemsRemove', 'InventoryStockedItemsTransfer', 'InventoryTransfers',
        'Invoices', 'InvoiceTemplates', 'KnowledgeBaseArticles', 'KnowledgeBaseCategories',
        'Modules', 'NotificationHistory', 'Opportunities', 'OpportunityAttachments',
        'OpportunityCategories', 'OrganizationalLevel1', 'OrganizationalLevel2',
        'OrganizationalLevelAssociations', 'OrganizatonalResources', 'PaymentTerms', 'Phases',
        'PriceListMaterialCodes', 'PriceListProducts', 'PriceListProductTiers', 'PriceListRoles',
        'PriceListServiceBundles', 'PriceListServices', 'PriceListWorkTypeModifiers', 'ProductNotes',
        'Products', 'ProductTiers', 'ProductVendors', 'ProjectAttachments', 'ProjectCharges',
        'ProjectNoteAttachments', 'ProjectNotes', 'Projects', 'PurchaseApprovals',
        'PurchaseOrderItemReceiving', 'PurchaseOrderItems', 'PurchaseOrders', 'QuoteItems',
        'QuoteLocations', 'Quotes', 'QuoteTemplates', 'ResourceAttachments', 'ResourceDailyAvailabilities',
        'ResourceRoleDepartments', 'ResourceRoleQueues', 'ResourceRoles', 'Resources',
        'ResourceServiceDeskRoles', 'ResourceSkills', 'ResourceTimeOffAdditional',
        'ResourceTimeOffApprovers', 'ResourceTimeOffBalances', 'Roles', 'SalesOrderAttachments',
        'SalesOrders', 'ServiceBundles', 'ServiceBundleServices', 'ServiceCalls',
        'ServiceCallTaskResources', 'ServiceCallTasks', 'ServiceCallTicketResources',
        'ServiceCallTickets', 'ServiceLevelAgreementResults', 'Services', 'ShippingTypes',
        'Skills', 'SubscriptionPeriods', 'Subscriptions', 'SurveyResults', 'Surveys',
        'TagAliases', 'TagGroups', 'Tags', 'TaskAttachments', 'TaskNoteAttachments', 'TaskNotes',
        'TaskPredecessors', 'Tasks', 'TaskSecondaryResources', 'TaxCategories', 'Taxes',
        'TaxRegions', 'TicketAdditionalConfigurationItems', 'TicketAdditionalContacts',
        'TicketAttachments', 'TicketCategories', 'TicketCategoryFieldDefaults', 'TicketPriorities',
        'TicketSources', 'TicketStatuses',
        'TicketChangeRequestApprovals', 'TicketCharges', 'TicketChecklistItems',
        'TicketChecklistLibraries', 'TicketHistory', 'TicketNoteAttachments', 'TicketNotes',
        'TicketRmaCredits', 'Tickets', 'TicketSecondaryResources', 'TicketTagAssociations',
        'TimeEntries', 'TimeEntryAttachments', 'TimeOffRequests', 'TimeOffRequestsApprove',
        'TimeOffRequestsReject', 'UserDefinedFieldDefinitions', 'UserDefinedFieldListItems',
        'Version', 'WorkTypeModifiers'
      ];

      expectedExports.forEach(exportName => {
        expect(AutotaskEntities).toHaveProperty(exportName);
        expect(AutotaskEntities[exportName as keyof typeof AutotaskEntities]).toBeDefined();
      });

      // Check total number of exports
      const actualExports = Object.keys(AutotaskEntities);
      expect(actualExports.length).toBeGreaterThanOrEqual(expectedExports.length);
    });

    it('should export all entities as constructible classes', () => {
      const testRequestHandler = createTestRequestHandler(mockAxios, mockLogger);

      // Test core entities that should be constructible
      const coreEntities = [
        { name: 'ActionTypes', constructor: ActionTypes },
        { name: 'Companies', constructor: Companies },
        { name: 'Contacts', constructor: Contacts },
        { name: 'Tickets', constructor: Tickets },
        { name: 'Tasks', constructor: Tasks },
        { name: 'Projects', constructor: Projects },
        { name: 'Resources', constructor: Resources },
        { name: 'ConfigurationItems', constructor: ConfigurationItems },
        { name: 'Contracts', constructor: Contracts },
        { name: 'TimeEntries', constructor: TimeEntries }
      ];

      coreEntities.forEach(({ name, constructor }) => {
        expect(() => {
          const instance = new constructor(mockAxios, mockLogger, testRequestHandler);
          expect(instance).toBeDefined();
          expect(instance.constructor.name).toBe(name);
        }).not.toThrow();
      });
    });

    it('should export deprecated compatibility shims', () => {
      // Test compatibility exports (classes)
      expect(TicketPriorities).toBeDefined();
      expect(TicketSources).toBeDefined();
      expect(TicketStatuses).toBeDefined();

      // Note: TicketPriority, TicketSource, TicketStatus are TypeScript interfaces, not runtime values
      // They exist for type checking but not as runtime objects
    });
  });

  describe('Entity Categories', () => {
    it('should include contract-related entities', () => {
      const contractEntities = [
        'Contracts', 'ContractBillingRules', 'ContractBlocks', 'ContractCharges',
        'ContractMilestones', 'ContractNotes', 'ContractRates', 'ContractServices'
      ];

      contractEntities.forEach(entityName => {
        expect(AutotaskEntities).toHaveProperty(entityName);
      });
    });

    it('should include billing & finance entities', () => {
      const billingEntities = [
        'BillingCodes', 'BillingItems', 'Invoices', 'ExpenseItems', 'ExpenseReports',
        'PurchaseOrders', 'Quotes', 'PaymentTerms', 'TaxCategories'
      ];

      billingEntities.forEach(entityName => {
        expect(AutotaskEntities).toHaveProperty(entityName);
      });
    });

    it('should include service desk entities', () => {
      const serviceDeskEntities = [
        'Tickets', 'TicketNotes', 'TicketAttachments', 'TicketCategories',
        'Tasks', 'TaskNotes', 'ServiceCalls', 'KnowledgeBaseArticles'
      ];

      serviceDeskEntities.forEach(entityName => {
        expect(AutotaskEntities).toHaveProperty(entityName);
      });
    });

    it('should include CRM entities', () => {
      const crmEntities = [
        'Companies', 'Contacts', 'Opportunities', 'Projects', 'CompanyNotes',
        'CompanyAttachments', 'ContactGroups'
      ];

      crmEntities.forEach(entityName => {
        expect(AutotaskEntities).toHaveProperty(entityName);
      });
    });

    it('should include asset management entities', () => {
      const assetEntities = [
        'ConfigurationItems', 'ConfigurationItemCategories', 'ConfigurationItemTypes',
        'InventoryItems', 'InventoryLocations', 'Products', 'ProductVendors'
      ];

      assetEntities.forEach(entityName => {
        expect(AutotaskEntities).toHaveProperty(entityName);
      });
    });

    it('should include resource management entities', () => {
      const resourceEntities = [
        'Resources', 'ResourceRoles', 'Roles', 'Departments', 'Skills',
        'TimeOffRequests', 'ResourceDailyAvailabilities'
      ];

      resourceEntities.forEach(entityName => {
        expect(AutotaskEntities).toHaveProperty(entityName);
      });
    });
  });

  describe('Entity Instantiation', () => {
    it('should instantiate BaseEntity-derived entities successfully', () => {
      const testRequestHandler = createTestRequestHandler(mockAxios, mockLogger);
      
      // Test entities that extend BaseEntity
      const baseEntityClasses = [
        ActionTypes, Companies, Contacts, Tickets, Tasks, Projects, 
        Resources, ConfigurationItems, Contracts, TimeEntries
      ];

      baseEntityClasses.forEach(EntityClass => {
        expect(() => {
          const instance = new EntityClass(mockAxios, mockLogger, testRequestHandler);
          expect(instance).toBeDefined();
          // BaseEntity provides executeRequest and executeQueryRequest methods
          expect(typeof (instance as any).executeRequest).toBe('function');
          expect(typeof (instance as any).executeQueryRequest).toBe('function');
        }).not.toThrow();
      });
    });

    it('should handle special entity classes correctly', () => {
      const testRequestHandler = createTestRequestHandler(mockAxios, mockLogger);

      // Test Version entity (may have different interface)
      expect(() => {
        const version = new Version(mockAxios, mockLogger, testRequestHandler);
        expect(version).toBeDefined();
      }).not.toThrow();

      // Test attachment-related entities
      expect(() => {
        const attachmentInfo = new AttachmentInfo(mockAxios, mockLogger, testRequestHandler);
        expect(attachmentInfo).toBeDefined();
      }).not.toThrow();
    });
  });

  describe('Import Path Validation', () => {
    it('should allow imports using wildcard syntax', () => {
      // This test verifies that wildcard imports work
      expect(typeof AutotaskEntities).toBe('object');
      expect(Object.keys(AutotaskEntities).length).toBeGreaterThan(200);
    });

    it('should allow selective imports', () => {
      // This test verifies that selective imports work (already tested by successful imports above)
      expect(Companies).toBeDefined();
      expect(Tickets).toBeDefined();
      expect(Contacts).toBeDefined();
      expect(Tasks).toBeDefined();
    });

    it('should provide consistent class names', () => {
      const testRequestHandler = createTestRequestHandler(mockAxios, mockLogger);

      // Test that class names match expected values
      const classTests = [
        { Constructor: Companies, expectedName: 'Companies' },
        { Constructor: Tickets, expectedName: 'Tickets' },
        { Constructor: Contacts, expectedName: 'Contacts' },
        { Constructor: Tasks, expectedName: 'Tasks' },
        { Constructor: Projects, expectedName: 'Projects' },
        { Constructor: Resources, expectedName: 'Resources' }
      ];

      classTests.forEach(({ Constructor, expectedName }) => {
        const instance = new Constructor(mockAxios, mockLogger, testRequestHandler);
        expect(instance.constructor.name).toBe(expectedName);
      });
    });
  });

  describe('Export Integrity', () => {
    it('should not have undefined or null exports', () => {
      Object.entries(AutotaskEntities).forEach(([exportName, exportValue]) => {
        expect(exportValue).toBeDefined();
        expect(exportValue).not.toBeNull();
        expect(typeof exportValue).toBe('function'); // All exports should be constructor functions
      });
    });

    it('should have consistent naming conventions', () => {
      const exportNames = Object.keys(AutotaskEntities);
      
      // All exports should be PascalCase
      exportNames.forEach(name => {
        expect(name).toMatch(/^[A-Z][a-zA-Z0-9]*$/);
      });

      // No duplicates should exist
      const uniqueNames = new Set(exportNames);
      expect(uniqueNames.size).toBe(exportNames.length);
    });

    it('should maintain backward compatibility', () => {
      // Test deprecated entity classes are still exported
      const deprecatedEntityClasses = [
        'TicketPriorities', 'TicketSources', 'TicketStatuses'
      ];

      deprecatedEntityClasses.forEach(entityName => {
        expect(AutotaskEntities).toHaveProperty(entityName);
        expect(AutotaskEntities[entityName as keyof typeof AutotaskEntities]).toBeDefined();
      });
    });
  });

  describe('Entity Hierarchy Validation', () => {
    it('should group related entities logically', () => {
      const entityGroups = {
        ticket: ['Tickets', 'TicketNotes', 'TicketAttachments', 'TicketCategories'],
        company: ['Companies', 'CompanyNotes', 'CompanyAttachments', 'CompanyLocations'],
        contract: ['Contracts', 'ContractNotes', 'ContractCharges', 'ContractServices'],
        project: ['Projects', 'ProjectNotes', 'ProjectAttachments', 'ProjectCharges'],
        task: ['Tasks', 'TaskNotes', 'TaskAttachments', 'TaskPredecessors'],
        configuration: ['ConfigurationItems', 'ConfigurationItemNotes', 'ConfigurationItemAttachments']
      };

      Object.entries(entityGroups).forEach(([groupName, entities]) => {
        entities.forEach(entityName => {
          expect(AutotaskEntities).toHaveProperty(entityName);
        });
      });
    });

    it('should include all necessary supporting entities', () => {
      const supportingEntities = [
        'Countries', 'Currencies', 'Departments', 'Holidays', 'Modules',
        'PaymentTerms', 'ShippingTypes', 'Skills', 'TaxCategories', 'Version'
      ];

      supportingEntities.forEach(entityName => {
        expect(AutotaskEntities).toHaveProperty(entityName);
      });
    });
  });

  describe('API Surface Validation', () => {
    it('should expose expected methods for entity classes', () => {
      const testRequestHandler = createTestRequestHandler(mockAxios, mockLogger);
      const companies = new Companies(mockAxios, mockLogger, testRequestHandler);

      // Test BaseEntity methods exist
      expect(typeof (companies as any).executeRequest).toBe('function');
      expect(typeof (companies as any).executeQueryRequest).toBe('function');
      expect(typeof (companies as any).requestWithRetry).toBe('function');
      
      // Test static method exists
      expect(typeof Companies.getMetadata).toBe('function');
    });

    it('should maintain consistent constructor signatures', () => {
      const testRequestHandler = createTestRequestHandler(mockAxios, mockLogger);

      // Test that all entities can be constructed with standard parameters
      const testEntities = [Companies, Tickets, Contacts, Tasks, Projects];

      testEntities.forEach(EntityClass => {
        expect(() => {
          new EntityClass(mockAxios, mockLogger, testRequestHandler);
        }).not.toThrow();
      });
    });
  });
});