import { AxiosInstance } from 'axios';
import winston from 'winston';
import { BaseSubClient } from '../base/BaseSubClient';
import {
  // Configuration items
  ConfigurationItems,
  ConfigurationItemAttachments,
  ConfigurationItemBillingProductAssociations,
  ConfigurationItemCategories,
  ConfigurationItemCategoryUdfAssociations,
  ConfigurationItemDnsRecords,
  ConfigurationItemNotes,
  ConfigurationItemNoteAttachments,
  ConfigurationItemRelatedItems,
  ConfigurationItemSslSubjectAlternativeName,
  ConfigurationItemTypes,
  // Organizational structure
  Departments,
  OrganizationalLevel1,
  OrganizationalLevel2,
  OrganizationalLevelAssociations,
  OrganizatonalResources,
  // Locations
  InternalLocations,
  InternalLocationWithBusinessHours,
  // Reference entities
  Countries,
  Roles,
  Skills,
  ResourceSkills,
  ResourceRoles,
  ResourceRoleDepartments,
  ResourceRoleQueues,
  ResourceServiceDeskRoles,
  // System entities
  ActionTypes,
  ClassificationIcons,
  Modules,
  Version,
  ShippingTypes,
  DomainRegistrars,
  WorkTypeModifiers,
  Phases,
  // User-defined fields
  UserDefinedFieldDefinitions,
  UserDefinedFieldListItems,
  // Holidays and scheduling
  Holidays,
  HolidaySets,
} from '../../entities';

/**
 * ConfigurationClient handles all configuration and system setup entities:
 * - Configuration items and asset management
 * - Organizational structure and departments
 * - Locations and business hours
 * - System reference data and lookups
 * - User-defined fields and customizations
 */
export class ConfigurationClient extends BaseSubClient {
  // Configuration items
  public readonly configurationItems: ConfigurationItems;
  public readonly configurationItemAttachments: ConfigurationItemAttachments;
  public readonly configurationItemBillingProductAssociations: ConfigurationItemBillingProductAssociations;
  public readonly configurationItemCategories: ConfigurationItemCategories;
  public readonly configurationItemCategoryUdfAssociations: ConfigurationItemCategoryUdfAssociations;
  public readonly configurationItemDnsRecords: ConfigurationItemDnsRecords;
  public readonly configurationItemNotes: ConfigurationItemNotes;
  public readonly configurationItemNoteAttachments: ConfigurationItemNoteAttachments;
  public readonly configurationItemRelatedItems: ConfigurationItemRelatedItems;
  public readonly configurationItemSslSubjectAlternativeName: ConfigurationItemSslSubjectAlternativeName;
  public readonly configurationItemTypes: ConfigurationItemTypes;

  // Organizational structure
  public readonly departments: Departments;
  public readonly organizationalLevel1: OrganizationalLevel1;
  public readonly organizationalLevel2: OrganizationalLevel2;
  public readonly organizationalLevelAssociations: OrganizationalLevelAssociations;
  public readonly organizatonalResources: OrganizatonalResources;

  // Locations
  public readonly internalLocations: InternalLocations;
  public readonly internalLocationWithBusinessHours: InternalLocationWithBusinessHours;

  // Reference entities
  public readonly countries: Countries;
  public readonly roles: Roles;
  public readonly skills: Skills;
  public readonly resourceSkills: ResourceSkills;
  public readonly resourceRoles: ResourceRoles;
  public readonly resourceRoleDepartments: ResourceRoleDepartments;
  public readonly resourceRoleQueues: ResourceRoleQueues;
  public readonly resourceServiceDeskRoles: ResourceServiceDeskRoles;

  // System entities
  public readonly actionTypes: ActionTypes;
  public readonly classificationIcons: ClassificationIcons;
  public readonly modules: Modules;
  public readonly version: Version;
  public readonly shippingTypes: ShippingTypes;
  public readonly domainRegistrars: DomainRegistrars;
  public readonly workTypeModifiers: WorkTypeModifiers;
  public readonly phases: Phases;

  // User-defined fields
  public readonly userDefinedFieldDefinitions: UserDefinedFieldDefinitions;
  public readonly userDefinedFieldListItems: UserDefinedFieldListItems;

  // Holidays and scheduling
  public readonly holidays: Holidays;
  public readonly holidaySets: HolidaySets;

  constructor(axios: AxiosInstance, logger: winston.Logger) {
    super(axios, logger, 'ConfigurationClient');

    // Configuration items
    this.configurationItems = new ConfigurationItems(this.axios, this.logger);
    this.configurationItemAttachments = new ConfigurationItemAttachments(this.axios, this.logger);
    this.configurationItemBillingProductAssociations = new ConfigurationItemBillingProductAssociations(this.axios, this.logger);
    this.configurationItemCategories = new ConfigurationItemCategories(this.axios, this.logger);
    this.configurationItemCategoryUdfAssociations = new ConfigurationItemCategoryUdfAssociations(this.axios, this.logger);
    this.configurationItemDnsRecords = new ConfigurationItemDnsRecords(this.axios, this.logger);
    this.configurationItemNotes = new ConfigurationItemNotes(this.axios, this.logger);
    this.configurationItemNoteAttachments = new ConfigurationItemNoteAttachments(this.axios, this.logger);
    this.configurationItemRelatedItems = new ConfigurationItemRelatedItems(this.axios, this.logger);
    this.configurationItemSslSubjectAlternativeName = new ConfigurationItemSslSubjectAlternativeName(this.axios, this.logger);
    this.configurationItemTypes = new ConfigurationItemTypes(this.axios, this.logger);

    // Organizational structure
    this.departments = new Departments(this.axios, this.logger);
    this.organizationalLevel1 = new OrganizationalLevel1(this.axios, this.logger);
    this.organizationalLevel2 = new OrganizationalLevel2(this.axios, this.logger);
    this.organizationalLevelAssociations = new OrganizationalLevelAssociations(this.axios, this.logger);
    this.organizatonalResources = new OrganizatonalResources(this.axios, this.logger);

    // Locations
    this.internalLocations = new InternalLocations(this.axios, this.logger);
    this.internalLocationWithBusinessHours = new InternalLocationWithBusinessHours(this.axios, this.logger);

    // Reference entities
    this.countries = new Countries(this.axios, this.logger);
    this.roles = new Roles(this.axios, this.logger);
    this.skills = new Skills(this.axios, this.logger);
    this.resourceSkills = new ResourceSkills(this.axios, this.logger);
    this.resourceRoles = new ResourceRoles(this.axios, this.logger);
    this.resourceRoleDepartments = new ResourceRoleDepartments(this.axios, this.logger);
    this.resourceRoleQueues = new ResourceRoleQueues(this.axios, this.logger);
    this.resourceServiceDeskRoles = new ResourceServiceDeskRoles(this.axios, this.logger);

    // System entities
    this.actionTypes = new ActionTypes(this.axios, this.logger);
    this.classificationIcons = new ClassificationIcons(this.axios, this.logger);
    this.modules = new Modules(this.axios, this.logger);
    this.version = new Version(this.axios, this.logger);
    this.shippingTypes = new ShippingTypes(this.axios, this.logger);
    this.domainRegistrars = new DomainRegistrars(this.axios, this.logger);
    this.workTypeModifiers = new WorkTypeModifiers(this.axios, this.logger);
    this.phases = new Phases(this.axios, this.logger);

    // User-defined fields
    this.userDefinedFieldDefinitions = new UserDefinedFieldDefinitions(this.axios, this.logger);
    this.userDefinedFieldListItems = new UserDefinedFieldListItems(this.axios, this.logger);

    // Holidays and scheduling
    this.holidays = new Holidays(this.axios, this.logger);
    this.holidaySets = new HolidaySets(this.axios, this.logger);
  }

  getName(): string {
    return 'ConfigurationClient';
  }

  protected async doConnectionTest(): Promise<void> {
    // Test connection with a simple configuration item categories query
    await this.axios.get('/ConfigurationItemCategories?$select=id&$top=1');
  }


  // Convenience methods for common operations

  /**
   * Get active configuration items
   * @param pageSize - Number of records to return (default: 500)
   * @returns Promise with active configuration items
   */
  async getActiveConfigurationItems(pageSize: number = 500) {
    return this.configurationItems.list({
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
   * Get configuration items by company
   * @param companyId - Company ID
   * @param pageSize - Number of records to return (default: 500)
   * @returns Promise with company configuration items
   */
  async getConfigurationItemsByCompany(companyId: number, pageSize: number = 500) {
    return this.configurationItems.list({
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
   * Get configuration items by type
   * @param typeId - Configuration item type ID
   * @param pageSize - Number of records to return (default: 500)
   * @returns Promise with configuration items of specified type
   */
  async getConfigurationItemsByType(typeId: number, pageSize: number = 500) {
    return this.configurationItems.list({
      filter: [
        {
          op: 'eq',
          field: 'configurationItemType',
          value: typeId,
        },
      ],
      pageSize,
    });
  }

  /**
   * Get configuration items by category
   * @param categoryId - Configuration item category ID
   * @param pageSize - Number of records to return (default: 500)
   * @returns Promise with configuration items in specified category
   */
  async getConfigurationItemsByCategory(categoryId: number, pageSize: number = 500) {
    return this.configurationItems.list({
      filter: [
        {
          op: 'eq',
          field: 'configurationItemCategoryID',
          value: categoryId,
        },
      ],
      pageSize,
    });
  }

  /**
   * Get active departments
   * @param pageSize - Number of records to return (default: 500)
   * @returns Promise with active departments
   */
  async getActiveDepartments(pageSize: number = 500) {
    return this.departments.list({
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
   * Get active roles
   * @param pageSize - Number of records to return (default: 500)
   * @returns Promise with active roles
   */
  async getActiveRoles(pageSize: number = 500) {
    return this.roles.list({
      filter: [
        {
          op: 'eq',
          field: 'active',
          value: true,
        },
      ],
      pageSize,
    });
  }

  /**
   * Get active skills
   * @param pageSize - Number of records to return (default: 500)
   * @returns Promise with active skills
   */
  async getActiveSkills(pageSize: number = 500) {
    return this.skills.list({
      filter: [
        {
          op: 'eq',
          field: 'active',
          value: true,
        },
      ],
      pageSize,
    });
  }

  /**
   * Get resource skills by resource
   * @param resourceId - Resource ID
   * @param pageSize - Number of records to return (default: 500)
   * @returns Promise with resource skills
   */
  async getResourceSkillsByResource(resourceId: number, pageSize: number = 500) {
    return this.resourceSkills.list({
      filter: [
        {
          op: 'eq',
          field: 'resourceID',
          value: resourceId,
        },
      ],
      pageSize,
    });
  }

  /**
   * Get resource roles by resource
   * @param resourceId - Resource ID
   * @param pageSize - Number of records to return (default: 500)
   * @returns Promise with resource roles
   */
  async getResourceRolesByResource(resourceId: number, pageSize: number = 500) {
    return this.resourceRoles.list({
      filter: [
        {
          op: 'eq',
          field: 'resourceID',
          value: resourceId,
        },
      ],
      pageSize,
    });
  }

  /**
   * Get recent configuration items created within specified days
   * @param days - Number of days to look back (default: 30)
   * @param pageSize - Number of records to return (default: 500)
   * @returns Promise with recent configuration items
   */
  async getRecentConfigurationItems(days: number = 30, pageSize: number = 500) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    return this.configurationItems.list({
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

  /**
   * Search configuration items by name or serial number
   * @param query - Search query string
   * @param searchFields - Fields to search in (default: ['referenceTitle', 'serialNumber'])
   * @param pageSize - Number of records to return (default: 100)
   * @returns Promise with matching configuration items
   */
  async searchConfigurationItems(
    query: string,
    searchFields: string[] = ['referenceTitle', 'serialNumber'],
    pageSize: number = 100
  ) {
    const filters = searchFields.map(field => ({
      op: 'contains',
      field,
      value: query,
    }));

    return this.configurationItems.list({
      filter: filters.length === 1 ? filters : [{ op: 'or', items: filters }],
      pageSize,
      sort: 'referenceTitle asc',
    });
  }

  /**
   * Get active configuration item types
   * @param pageSize - Number of records to return (default: 500)
   * @returns Promise with active configuration item types
   */
  async getActiveConfigurationItemTypes(pageSize: number = 500) {
    return this.configurationItemTypes.list({
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
   * Get active internal locations
   * @param pageSize - Number of records to return (default: 500)
   * @returns Promise with active internal locations
   */
  async getActiveInternalLocations(pageSize: number = 500) {
    return this.internalLocations.list({
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
   * Get user-defined field definitions by entity type
   * @param entityType - Entity type (e.g., 'Ticket', 'Company', 'Contact')
   * @param pageSize - Number of records to return (default: 500)
   * @returns Promise with UDF definitions for entity type
   */
  async getUserDefinedFieldDefinitionsByEntityType(entityType: string, pageSize: number = 500) {
    return this.userDefinedFieldDefinitions.list({
      filter: [
        {
          op: 'eq',
          field: 'udfEntityType',
          value: entityType,
        },
      ],
      pageSize,
    });
  }

  /**
   * Get active user-defined field definitions
   * @param pageSize - Number of records to return (default: 500)
   * @returns Promise with active UDF definitions
   */
  async getActiveUserDefinedFieldDefinitions(pageSize: number = 500) {
    return this.userDefinedFieldDefinitions.list({
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
   * Get UDF list items by field definition
   * @param udfId - UDF definition ID
   * @param pageSize - Number of records to return (default: 500)
   * @returns Promise with UDF list items
   */
  async getUserDefinedFieldListItemsByUdf(udfId: number, pageSize: number = 500) {
    return this.userDefinedFieldListItems.list({
      filter: [
        {
          op: 'eq',
          field: 'userDefinedFieldDefinitionID',
          value: udfId,
        },
      ],
      pageSize,
    });
  }

  /**
   * Get configuration item related items by parent
   * @param parentConfigItemId - Parent configuration item ID
   * @param pageSize - Number of records to return (default: 500)
   * @returns Promise with related configuration items
   */
  async getConfigurationItemRelatedItemsByParent(parentConfigItemId: number, pageSize: number = 500) {
    return this.configurationItemRelatedItems.list({
      filter: [
        {
          op: 'eq',
          field: 'parentConfigurationItemID',
          value: parentConfigItemId,
        },
      ],
      pageSize,
    });
  }
}
